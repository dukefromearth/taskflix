import path from 'node:path';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import fg from 'fast-glob';
import { generateDependencyGraph } from './deps.mjs';
import { generateTypeGraph } from './types.mjs';
import { generateCallGraph } from './callgraph.mjs';
import {
  ARCH_IGNORE_GLOBS,
  compareStrings,
  DEFAULT_ARCH_INPUT_GLOBS,
  DEFAULT_CALLGRAPH_ENTRY_GLOBS,
  toAbsolutePath
} from './shared.mjs';

const BM25 = {
  k1: 1.2,
  b: 0.75
};

const TOPIC_EXPANSIONS = {
  schedule: ['scheduled', 'scheduling', 'reschedule', 'due', 'defer', 'timeline', 'calendar', 'time', 'deadline']
};

const DYNAMIC_PATTERNS = [
  { id: 'dynamic-import', regex: /\bimport\s*\(/g, description: 'dynamic import' },
  { id: 'eval', regex: /\beval\s*\(/g, description: 'eval usage' },
  { id: 'new-function', regex: /\bnew\s+Function\s*\(/g, description: 'Function constructor usage' },
  { id: 'dynamic-property-access', regex: /process\.env\s*\[/g, description: 'dynamic process.env access' }
];

const round = (value) => Number(value.toFixed(6));

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const slugify = (value) => {
  const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'topic';
};

const normalizeTopic = (topicInput) => topicInput.trim().replace(/\s+/g, ' ');

const splitTopicTerms = (topicInput) =>
  normalizeTopic(topicInput)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 1);

const addWeightedTerm = (map, term, weight) => {
  const normalized = term.toLowerCase().trim();
  if (normalized.length <= 1) {
    return;
  }
  const previous = map.get(normalized) ?? 0;
  if (weight > previous) {
    map.set(normalized, weight);
  }
};

const toTopicSpec = (topicInput) => {
  const query = normalizeTopic(topicInput);
  const queryTerms = [...new Set(splitTopicTerms(query))].sort(compareStrings);
  const weightedTerms = new Map();

  for (const term of queryTerms) {
    addWeightedTerm(weightedTerms, term, 2.0);
    addWeightedTerm(weightedTerms, `${term}s`, 1.4);

    if (term.endsWith('e')) {
      addWeightedTerm(weightedTerms, `${term}d`, 1.3);
      addWeightedTerm(weightedTerms, `${term.slice(0, -1)}ing`, 1.3);
    } else {
      addWeightedTerm(weightedTerms, `${term}ed`, 1.3);
      addWeightedTerm(weightedTerms, `${term}ing`, 1.3);
    }

    for (const expansion of TOPIC_EXPANSIONS[term] ?? []) {
      addWeightedTerm(weightedTerms, expansion, 1.2);
    }
  }

  const terms = [...weightedTerms.keys()].sort(compareStrings);

  return {
    query,
    queryTerms,
    terms,
    termWeights: Object.fromEntries(terms.map((term) => [term, weightedTerms.get(term) ?? 1]))
  };
};

const tokenize = (content) => content.toLowerCase().match(/[a-z0-9_]+/g) ?? [];

const bm25Contribution = ({ tf, documentFrequency, documentLength, averageDocumentLength, documentCount, weight }) => {
  if (tf <= 0 || documentFrequency <= 0 || documentCount <= 0) {
    return 0;
  }

  const idf = Math.log(1 + (documentCount - documentFrequency + 0.5) / (documentFrequency + 0.5));
  const normalization = BM25.k1 * (1 - BM25.b + BM25.b * (documentLength / averageDocumentLength));
  const termScore = (tf * (BM25.k1 + 1)) / (tf + normalization);
  return weight * idf * termScore;
};

const writeJson = async (outputPath, value) => {
  await writeFile(outputPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const readTextFile = async (relativePath) => {
  const absolutePath = toAbsolutePath(relativePath);
  return readFile(absolutePath, 'utf8');
};

const escapeGlobLiteral = (relativePath) => relativePath.replace(/([*?{}()[\]!+@])/g, '\\$1');

const scanScope = async ({ topicSpec, verbose }) => {
  const files = await fg(DEFAULT_ARCH_INPUT_GLOBS, {
    onlyFiles: true,
    unique: true,
    dot: false,
    ignore: ARCH_IGNORE_GLOBS
  });

  const sortedFiles = files.sort(compareStrings);
  const trackedTerms = new Set(topicSpec.terms);
  const docFreq = new Map(topicSpec.terms.map((term) => [term, 0]));
  const docStats = [];
  let totalDocumentLength = 0;

  for (const file of sortedFiles) {
    const content = await readTextFile(file);
    const tokens = tokenize(content);
    totalDocumentLength += tokens.length;

    const termCounts = new Map();
    for (const token of tokens) {
      if (!trackedTerms.has(token)) {
        continue;
      }
      termCounts.set(token, (termCounts.get(token) ?? 0) + 1);
    }

    for (const term of termCounts.keys()) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }

    docStats.push({
      file,
      documentLength: tokens.length,
      termCounts
    });
  }

  const documentCount = sortedFiles.length;
  const averageDocumentLength = documentCount > 0 ? totalDocumentLength / documentCount : 1;
  const rankedMatches = [];

  for (const stat of docStats) {
    if (stat.termCounts.size === 0) {
      continue;
    }

    let bm25Score = 0;
    let hitCount = 0;
    const matchedTerms = [];

    for (const [term, count] of stat.termCounts.entries()) {
      const weight = topicSpec.termWeights[term] ?? 1;
      const documentFrequency = docFreq.get(term) ?? 0;
      const contribution = bm25Contribution({
        tf: count,
        documentFrequency,
        documentLength: Math.max(stat.documentLength, 1),
        averageDocumentLength: Math.max(averageDocumentLength, 1),
        documentCount,
        weight
      });

      bm25Score += contribution;
      hitCount += count;
      matchedTerms.push({
        term,
        count,
        weight,
        documentFrequency,
        contribution: round(contribution)
      });
    }

    matchedTerms.sort(
      (left, right) => right.contribution - left.contribution || right.count - left.count || compareStrings(left.term, right.term)
    );

    const roundedBm25Score = round(bm25Score);
    const compactMatch = {
      file: stat.file,
      bm25Score: roundedBm25Score,
      matchedTerms: matchedTerms.map((entry) => entry.term)
    };
    const verboseMatch = {
      file: stat.file,
      bm25Score: roundedBm25Score,
      hitCount,
      documentLength: stat.documentLength,
      matchedTerms
    };

    rankedMatches.push({
      sortBm25Score: roundedBm25Score,
      sortHitCount: hitCount,
      value: verbose ? verboseMatch : compactMatch
    });
  }

  rankedMatches.sort(
    (left, right) =>
      right.sortBm25Score - left.sortBm25Score ||
      right.sortHitCount - left.sortHitCount ||
      compareStrings(left.value.file, right.value.file)
  );
  const matches = rankedMatches.map((entry) => entry.value);

  const defaultEntrypoints = (
    await fg(DEFAULT_CALLGRAPH_ENTRY_GLOBS, {
      onlyFiles: true,
      unique: true,
      dot: false,
      ignore: ARCH_IGNORE_GLOBS
    })
  ).sort(compareStrings);

  const defaultEntrypointSet = new Set(defaultEntrypoints);

  const matchedEntrypoints = matches
    .map((entry) => entry.file)
    .filter((file) => defaultEntrypointSet.has(file) || (file.startsWith('app/api/') && file.endsWith('/route.ts')))
    .sort(compareStrings);

  const selectedEntrypoints = matchedEntrypoints.length > 0 ? matchedEntrypoints : defaultEntrypoints;

  return {
    topic: topicSpec.query,
    queryTerms: topicSpec.queryTerms,
    terms: topicSpec.terms,
    ranking: {
      algorithm: 'bm25',
      parameters: {
        ...BM25,
        documentCount,
        averageDocumentLength: round(averageDocumentLength)
      }
    },
    totalFilesScanned: sortedFiles.length,
    matchedFileCount: matches.length,
    matchedEntrypointCount: matchedEntrypoints.length,
    selectedEntrypoints,
    matches
  };
};

const collectContractSignals = async ({ scope, terms }) => {
  const contractFiles = new Set([
    ...scope.matches.map((entry) => entry.file),
    ...(
      await fg(['app/api/**/route.ts', 'src/api/**/*.ts', 'src/domain/**/*.ts', 'src/db/schema.ts'], {
        onlyFiles: true,
        unique: true,
        dot: false,
        ignore: ARCH_IGNORE_GLOBS
      })
    )
  ]);

  const httpHandlers = [];
  const schemaMentions = new Map();
  const dbMentions = [];
  const invariantMentions = [];

  for (const file of [...contractFiles].sort(compareStrings)) {
    const content = await readTextFile(file);
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const termMatch = terms.some((term) => new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i').test(line));

      if (/^\s*export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/.test(line)) {
        httpHandlers.push({ file, line: lineNumber, signature: line.trim() });
      }

      for (const schema of line.match(/\b[A-Za-z0-9_]*Schema\b/g) ?? []) {
        const current = schemaMentions.get(schema) ?? [];
        current.push({ file, line: lineNumber });
        schemaMentions.set(schema, current);
      }

      if (file === 'src/db/schema.ts' && termMatch) {
        dbMentions.push({ file, line: lineNumber, text: line.trim() });
      }

      if (termMatch && /\bthrow\s+new\b|\bassert\b|\binvariant\b/i.test(line)) {
        invariantMentions.push({ file, line: lineNumber, text: line.trim() });
      }
    });
  }

  return {
    httpHandlers: httpHandlers.sort((left, right) => compareStrings(`${left.file}:${left.line}`, `${right.file}:${right.line}`)),
    schemaMentions: [...schemaMentions.entries()]
      .map(([schema, locations]) => ({ schema, locations }))
      .sort((left, right) => compareStrings(left.schema, right.schema)),
    dbMentions,
    invariantMentions
  };
};

const collectDynamicFindings = async () => {
  const files = await fg(DEFAULT_ARCH_INPUT_GLOBS, {
    onlyFiles: true,
    unique: true,
    dot: false,
    ignore: ARCH_IGNORE_GLOBS
  });

  const findings = [];

  for (const file of files.sort(compareStrings)) {
    const content = await readTextFile(file);
    const lines = content.split('\n');

    for (const pattern of DYNAMIC_PATTERNS) {
      lines.forEach((line, index) => {
        if (!pattern.regex.test(line)) {
          return;
        }

        findings.push({
          file,
          line: index + 1,
          type: pattern.id,
          description: pattern.description,
          snippet: line.trim()
        });
      });

      pattern.regex.lastIndex = 0;
    }
  }

  return findings.sort((left, right) => compareStrings(`${left.file}:${left.line}:${left.type}`, `${right.file}:${right.line}:${right.type}`));
};

const buildConfidence = async ({ topicSpec, scope, contracts }) => {
  const dynamicFindings = await collectDynamicFindings();

  return {
    topic: topicSpec.query,
    queryTerms: topicSpec.queryTerms,
    provenSignals: [
      `${scope.matchedFileCount} topic-matched files`,
      `${scope.selectedEntrypoints.length} selected entrypoints`,
      `${contracts.httpHandlers.length} HTTP handlers`,
      `${contracts.schemaMentions.length} schema references`
    ],
    inferredSignals: ['Flow maps are static-analysis derived', 'Type and dependency maps include indirect edges beyond topic intent'],
    unknownDynamicSignals: [
      ...dynamicFindings.slice(0, 40).map((finding) => `${finding.file}:${finding.line} (${finding.type})`),
      'Runtime-only behavior is not proven by static analysis'
    ],
    dynamicFindings
  };
};

export const runDiscoverAll = async ({
  topic,
  outDir,
  configPath,
  projectPath,
  entries,
  maxEdges,
  maxDepth,
  verbose = false
}) => {
  const topicSpec = toTopicSpec(topic);
  const topicSlug = slugify(topicSpec.query);
  const outputRoot = toAbsolutePath(path.join(outDir, topicSlug));

  await rm(outputRoot, { recursive: true, force: true });

  const scopeDir = path.join(outputRoot, '1-scope');
  const flowsDir = path.join(outputRoot, '2-flows');
  const contractsDir = path.join(outputRoot, '3-contracts');
  const confidenceDir = path.join(outputRoot, '4-confidence');

  await Promise.all([
    mkdir(scopeDir, { recursive: true }),
    mkdir(flowsDir, { recursive: true }),
    mkdir(contractsDir, { recursive: true }),
    mkdir(confidenceDir, { recursive: true })
  ]);

  const scope = await scanScope({ topicSpec, verbose });
  await writeJson(path.join(scopeDir, 'scope.json'), scope);

  const selectedEntries = entries.length > 0 ? entries : scope.selectedEntrypoints.map(escapeGlobLiteral);

  const [depsGraph, typesGraph, callGraph] = await Promise.all([
    generateDependencyGraph({ configPath, projectPath, minify: false }),
    generateTypeGraph({ projectPath, minify: false }),
    generateCallGraph({
      projectPath,
      entries: selectedEntries,
      minify: false,
      maxEdges,
      maxDepth
    })
  ]);

  const flows = {
    topic: topicSpec.query,
    queryTerms: topicSpec.queryTerms,
    bounds: {
      maxDepth,
      maxEdges
    },
    entrypoints: scope.selectedEntrypoints,
    graphs: {
      deps: {
        format: 'mermaid',
        content: depsGraph
      },
      types: {
        format: 'mermaid',
        content: typesGraph
      },
      callgraph: {
        format: 'mermaid',
        content: callGraph
      }
    }
  };
  await writeJson(path.join(flowsDir, 'flows.json'), flows);

  const contracts = await collectContractSignals({ scope, terms: topicSpec.terms });
  await writeJson(path.join(contractsDir, 'contracts.json'), contracts);

  const confidence = await buildConfidence({ topicSpec, scope, contracts });
  await writeJson(path.join(confidenceDir, 'confidence.json'), confidence);

  const index = {
    topic: topicSpec.query,
    queryTerms: topicSpec.queryTerms,
    generatedAtIso: new Date().toISOString(),
    outputRoot,
    steps: {
      scope: '1-scope/scope.json',
      flows: '2-flows/flows.json',
      contracts: '3-contracts/contracts.json',
      confidence: '4-confidence/confidence.json'
    }
  };
  await writeJson(path.join(outputRoot, 'index.json'), index);

  return {
    outputRoot,
    scopeDir,
    flowsDir,
    contractsDir,
    confidenceDir
  };
};
