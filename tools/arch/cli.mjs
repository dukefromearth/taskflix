const GRAPH_FLAG_SET = new Set([
  '--deps',
  '--types',
  '--callgraph',
  '--all',
  '--entry',
  '--config',
  '--project',
  '--output',
  '--out-dir',
  '--minify',
  '--max-edges',
  '--max-depth',
  '--help'
]);

const DISCOVER_FLAG_SET = new Set(['--out-dir', '--config', '--project', '--entry', '--max-edges', '--max-depth', '--verbose', '--help']);

const valueFor = (argv, index, flag, expected) => {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}. Expected ${expected}.`);
  }
  return value;
};

const parsePositiveInteger = (value, flag) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid value for ${flag}: '${value}'. Expected a positive integer.`);
  }
  return parsed;
};

const parseBoolean = (value, flag) => {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(`Invalid value for ${flag}: '${value}'. Expected 'true' or 'false'.`);
};

const printDiscoverHelp = () => {
  process.stdout.write(`Usage:\n  npm run arch -- discover all <topic...> [options]\n\nExamples:\n  npm run arch -- discover all schedule\n  npm run arch -- discover all schedule time\n  npm run arch -- discover all schedule time --max-depth 4 --max-edges 900\n  npm run arch -- discover all schedule time --verbose\n  npm run arch -- discover all schedule time --out-dir tmp/arch/discover\n\nOptions:\n  --out-dir <path> Discovery output root (default: tmp/arch/discover)\n  --config <path>  dependency-cruiser config path (default: .dependency-cruiser.cjs)\n  --project <path> TypeScript project file (default: tsconfig.arch.json)\n  --entry <path>   Optional callgraph entrypoint file/glob (repeatable)\n  --max-edges <n>  Callgraph edge budget (default: 500)\n  --max-depth <n>  Callgraph traversal depth (default: 3)\n  --verbose        Include per-term BM25 diagnostics in scope matches\n  --help           Show this help\n`);
};

const printGraphHelp = () => {
  process.stdout.write(`Usage:\n  npm run arch -- [--deps|--types|--callgraph|--all] [options]\n\nModes:\n  --deps           Generate a dependency graph (default when no mode is provided)\n  --types          Generate a type-reference graph\n  --callgraph      Generate a call graph seeded from ingress entrypoints\n  --all            Run all three graph modes\n\nOptions:\n  --entry <path>   Callgraph seed entrypoint file or glob (repeatable)\n  --config <path>  dependency-cruiser config path (default: .dependency-cruiser.cjs)\n  --project <path> TypeScript project file for analysis (default: tsconfig.arch.json)\n  --output <path>  Output file path for single-mode runs (or '-' for stdout)\n  --out-dir <path> Output directory for multi-mode runs (default: tmp/arch)\n  --minify <bool>  true/false output compaction (default: true)\n  --max-edges <n>  Callgraph edge budget (default: 500)\n  --max-depth <n>  Callgraph traversal depth from entrypoint seeds (default: 3)\n  --help           Show this help\n`);
};

export const printHelp = () => {
  process.stdout.write(`Architecture discovery shortcut:\n  npm run arch -- discover all <topic...> [options]\n\nRun detailed help:\n  npm run arch -- discover all --help\n\nAdvanced graph mode help:\n  npm run arch -- --help\n`);
};

const parseDiscoverCli = (argv) => {
  const subcommand = argv[1];
  if (subcommand !== 'all') {
    throw new Error(`Unknown discover mode '${subcommand ?? ''}'. Expected: discover all <topic...>.`);
  }

  const parsed = {
    command: 'discover-all',
    topic: null,
    entries: [],
    configPath: '.dependency-cruiser.cjs',
    projectPath: 'tsconfig.arch.json',
    outDir: 'tmp/arch/discover',
    maxEdges: 500,
    maxDepth: 3,
    verbose: false,
    help: false
  };

  let index = 2;
  const topicParts = [];
  while (argv[index] && !argv[index].startsWith('--')) {
    topicParts.push(argv[index]);
    index += 1;
  }
  if (topicParts.length > 0) {
    parsed.topic = topicParts.join(' ');
  }

  for (; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected positional argument '${arg}'. Expected flags only after topic.`);
    }

    if (!DISCOVER_FLAG_SET.has(arg)) {
      throw new Error(`Unknown discover flag '${arg}'. Run with 'discover all --help'.`);
    }

    if (arg === '--help') {
      parsed.help = true;
      continue;
    }

    if (arg === '--verbose') {
      parsed.verbose = true;
      continue;
    }

    if (arg === '--out-dir') {
      parsed.outDir = valueFor(argv, index, '--out-dir', 'a path');
      index += 1;
      continue;
    }

    if (arg === '--config') {
      parsed.configPath = valueFor(argv, index, '--config', 'a path');
      index += 1;
      continue;
    }

    if (arg === '--project') {
      parsed.projectPath = valueFor(argv, index, '--project', 'a path');
      index += 1;
      continue;
    }

    if (arg === '--entry') {
      const value = valueFor(argv, index, '--entry', 'a file path or glob');
      parsed.entries.push(value);
      index += 1;
      continue;
    }

    if (arg === '--max-edges') {
      const value = valueFor(argv, index, '--max-edges', 'a positive integer');
      parsed.maxEdges = parsePositiveInteger(value, '--max-edges');
      index += 1;
      continue;
    }

    if (arg === '--max-depth') {
      const value = valueFor(argv, index, '--max-depth', 'a positive integer');
      parsed.maxDepth = parsePositiveInteger(value, '--max-depth');
      index += 1;
      continue;
    }
  }

  if (parsed.help) {
    printDiscoverHelp();
    return parsed;
  }

  if (!parsed.topic || parsed.topic.trim().length === 0) {
    throw new Error('Missing topic. Usage: npm run arch -- discover all <topic...>');
  }

  return parsed;
};

const parseGraphCli = (argv) => {
  const parsed = {
    command: 'graph',
    modes: {
      deps: false,
      types: false,
      callgraph: false
    },
    entries: [],
    configPath: '.dependency-cruiser.cjs',
    projectPath: 'tsconfig.arch.json',
    outputPath: null,
    outDir: 'tmp/arch',
    minify: true,
    maxEdges: 500,
    maxDepth: 3,
    maxDepthExplicit: false,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected positional argument '${arg}'. Expected flags only.`);
    }

    if (!GRAPH_FLAG_SET.has(arg)) {
      throw new Error(`Unknown flag '${arg}'. Run with --help for usage.`);
    }

    if (arg === '--help') {
      parsed.help = true;
      continue;
    }

    if (arg === '--deps') {
      parsed.modes.deps = true;
      continue;
    }

    if (arg === '--types') {
      parsed.modes.types = true;
      continue;
    }

    if (arg === '--callgraph') {
      parsed.modes.callgraph = true;
      continue;
    }

    if (arg === '--all') {
      parsed.modes.deps = true;
      parsed.modes.types = true;
      parsed.modes.callgraph = true;
      continue;
    }

    if (arg === '--entry') {
      const value = valueFor(argv, index, '--entry', 'a file path or glob');
      parsed.entries.push(value);
      index += 1;
      continue;
    }

    if (arg === '--config') {
      parsed.configPath = valueFor(argv, index, '--config', 'a path');
      index += 1;
      continue;
    }

    if (arg === '--project') {
      parsed.projectPath = valueFor(argv, index, '--project', 'a path');
      index += 1;
      continue;
    }

    if (arg === '--output') {
      parsed.outputPath = valueFor(argv, index, '--output', 'a path');
      index += 1;
      continue;
    }

    if (arg === '--out-dir') {
      parsed.outDir = valueFor(argv, index, '--out-dir', 'a path');
      index += 1;
      continue;
    }

    if (arg === '--minify') {
      const value = valueFor(argv, index, '--minify', "'true' or 'false'");
      parsed.minify = parseBoolean(value, '--minify');
      index += 1;
      continue;
    }

    if (arg === '--max-edges') {
      const value = valueFor(argv, index, '--max-edges', 'a positive integer');
      parsed.maxEdges = parsePositiveInteger(value, '--max-edges');
      index += 1;
      continue;
    }

    if (arg === '--max-depth') {
      const value = valueFor(argv, index, '--max-depth', 'a positive integer');
      parsed.maxDepth = parsePositiveInteger(value, '--max-depth');
      parsed.maxDepthExplicit = true;
      index += 1;
      continue;
    }
  }

  if (!parsed.help && !parsed.modes.deps && !parsed.modes.types && !parsed.modes.callgraph) {
    parsed.modes.deps = true;
  }

  const modeCount = Number(parsed.modes.deps) + Number(parsed.modes.types) + Number(parsed.modes.callgraph);

  if (parsed.outputPath && modeCount > 1) {
    throw new Error('Cannot use --output with multiple modes. Use --out-dir instead.');
  }

  if (parsed.entries.length > 0 && !parsed.modes.callgraph) {
    throw new Error('The --entry flag requires --callgraph or --all.');
  }

  if (parsed.maxDepthExplicit && !parsed.modes.callgraph) {
    throw new Error('The --max-depth flag requires --callgraph or --all.');
  }

  delete parsed.maxDepthExplicit;

  if (parsed.help) {
    printGraphHelp();
  }

  return parsed;
};

export const parseCli = (argv) => {
  if (argv[0] === 'discover') {
    return parseDiscoverCli(argv);
  }

  return parseGraphCli(argv);
};
