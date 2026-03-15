import fg from 'fast-glob';
import { Project, Node, SyntaxKind } from 'ts-morph';
import { renderMermaidGraph } from './mermaid.mjs';
import {
  ARCH_IGNORE_GLOBS,
  compareStrings,
  DEFAULT_CALLGRAPH_ENTRY_GLOBS,
  toAbsolutePath,
  toRepoRelativePath
} from './shared.mjs';

const HTTP_HANDLER_NAMES = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

const declarationKey = (node) => `${node.getSourceFile().getFilePath()}::${node.getStart(false)}::${node.getKindName()}`;

const isFunctionLikeNode = (node) =>
  Node.isFunctionDeclaration(node) ||
  Node.isMethodDeclaration(node) ||
  Node.isArrowFunction(node) ||
  Node.isFunctionExpression(node);

const firstFunctionLikeAncestor = (node) => node.getFirstAncestor((ancestor) => isFunctionLikeNode(ancestor));

const isTopLevelDeclaration = (node) => firstFunctionLikeAncestor(node) == null;

const resolveImportAliasSymbol = (declaration) => {
  // GOTCHA: ts-morph often resolves call symbols to import specifiers first;
  // follow aliases to land on executable declarations.
  if (Node.isImportSpecifier(declaration)) {
    return declaration.getNameNode().getSymbol()?.getAliasedSymbol() ?? null;
  }

  if (Node.isImportClause(declaration)) {
    return declaration.getDefaultImport()?.getSymbol()?.getAliasedSymbol() ?? null;
  }

  if (Node.isNamespaceImport(declaration)) {
    return declaration.getNameNode().getSymbol()?.getAliasedSymbol() ?? null;
  }

  if (Node.isImportEqualsDeclaration(declaration)) {
    return declaration.getNameNode().getSymbol()?.getAliasedSymbol() ?? null;
  }

  if (Node.isExportSpecifier(declaration)) {
    return declaration.getNameNode().getSymbol()?.getAliasedSymbol() ?? null;
  }

  return null;
};

const sortedDeclarationsForSymbol = (symbol) =>
  (symbol?.getDeclarations?.() ?? []).slice().sort((left, right) => {
    const leftKey = `${left.getSourceFile().getFilePath()}::${left.getStart(false)}::${left.getKindName()}`;
    const rightKey = `${right.getSourceFile().getFilePath()}::${right.getStart(false)}::${right.getKindName()}`;
    return compareStrings(leftKey, rightKey);
  });

const resolveSymbolToCallableId = (symbol, callableIdByDeclarationKey, seen = new Set()) => {
  if (!symbol) {
    return null;
  }

  const symbolKey = symbol.getFullyQualifiedName();
  if (seen.has(symbolKey)) {
    return null;
  }
  seen.add(symbolKey);

  const symbols = [symbol];
  const aliased = symbol.getAliasedSymbol?.();
  if (aliased && aliased !== symbol) {
    symbols.push(aliased);
  }

  for (const candidate of symbols) {
    const declarations = sortedDeclarationsForSymbol(candidate);

    for (const declaration of declarations) {
      const direct = callableIdByDeclarationKey.get(declarationKey(declaration));
      if (direct) {
        return direct;
      }

      const aliasSymbol = resolveImportAliasSymbol(declaration);
      if (aliasSymbol) {
        const resolved = resolveSymbolToCallableId(aliasSymbol, callableIdByDeclarationKey, seen);
        if (resolved) {
          return resolved;
        }
      }
    }
  }

  return null;
};

const resolveCallTargetId = (callExpression, callableIdByDeclarationKey) => {
  const expression = callExpression.getExpression();
  const symbols = [expression.getSymbol(), expression.getType().getSymbol()].filter(Boolean);

  for (const symbol of symbols) {
    const resolved = resolveSymbolToCallableId(symbol, callableIdByDeclarationKey);
    if (resolved) {
      return resolved;
    }
  }

  return null;
};

const callableFromFunction = (declaration) => {
  const file = toRepoRelativePath(declaration.getSourceFile().getFilePath());
  const name = declaration.getName() ?? `<anonymous@L${declaration.getStartLineNumber()}>`;
  const id = `${file}::${name}::L${declaration.getStartLineNumber()}`;
  return {
    id,
    shortName: name,
    label: `${name}\n${file}`,
    file,
    ownerNode: declaration,
    declarationNodes: [declaration],
    isExported: declaration.isExported(),
    isTopLevel: true
  };
};

const callableFromMethod = (declaration) => {
  const file = toRepoRelativePath(declaration.getSourceFile().getFilePath());
  const className = declaration.getFirstAncestorByKind(SyntaxKind.ClassDeclaration)?.getName() ?? '<anonymous-class>';
  const name = `${className}.${declaration.getName()}`;
  const id = `${file}::${name}::L${declaration.getStartLineNumber()}`;
  const classIsExported = declaration.getFirstAncestorByKind(SyntaxKind.ClassDeclaration)?.isExported() ?? false;
  return {
    id,
    shortName: declaration.getName(),
    label: `${name}\n${file}`,
    file,
    ownerNode: declaration,
    declarationNodes: [declaration],
    isExported: classIsExported,
    isTopLevel: false
  };
};

const callableFromVariable = (declaration) => {
  const initializer = declaration.getInitializer();
  if (!initializer || !(Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer))) {
    return null;
  }

  if (!isTopLevelDeclaration(declaration)) {
    return null;
  }

  const file = toRepoRelativePath(declaration.getSourceFile().getFilePath());
  const name = declaration.getName();
  const id = `${file}::${name}::L${declaration.getStartLineNumber()}`;
  const variableStatement = declaration.getVariableStatement();

  return {
    id,
    shortName: name,
    label: `${name}\n${file}`,
    file,
    ownerNode: initializer,
    declarationNodes: [declaration, initializer],
    isExported: variableStatement?.isExported() ?? false,
    isTopLevel: true
  };
};

const collectCallables = (project) => {
  const callables = [];

  for (const sourceFile of project.getSourceFiles()) {
    if (sourceFile.isDeclarationFile()) {
      continue;
    }

    for (const fn of sourceFile.getFunctions()) {
      callables.push(callableFromFunction(fn));
    }

    for (const cls of sourceFile.getClasses()) {
      for (const method of cls.getMethods()) {
        callables.push(callableFromMethod(method));
      }
    }

    for (const variable of sourceFile.getVariableDeclarations()) {
      const callable = callableFromVariable(variable);
      if (callable) {
        callables.push(callable);
      }
    }
  }

  return callables.sort((left, right) => compareStrings(left.id, right.id));
};

const indexCallables = (callables) => {
  const callableById = new Map();
  const callableIdByDeclarationKey = new Map();
  const callablesByFile = new Map();

  for (const callable of callables) {
    callableById.set(callable.id, callable);

    for (const node of callable.declarationNodes) {
      callableIdByDeclarationKey.set(declarationKey(node), callable.id);
    }

    const current = callablesByFile.get(callable.file) ?? [];
    current.push(callable);
    callablesByFile.set(callable.file, current);
  }

  for (const [file, fileCallables] of callablesByFile.entries()) {
    fileCallables.sort((left, right) => compareStrings(left.id, right.id));
    callablesByFile.set(file, fileCallables);
  }

  return { callableById, callableIdByDeclarationKey, callablesByFile };
};

const resolveEntrypoints = async (entryGlobs, fromCli) => {
  const patterns = entryGlobs.length > 0 ? entryGlobs : DEFAULT_CALLGRAPH_ENTRY_GLOBS;
  const allMatches = [];

  for (const pattern of patterns) {
    const matches = await fg(pattern, {
      onlyFiles: true,
      dot: false,
      unique: true,
      ignore: ARCH_IGNORE_GLOBS
    });

    if (matches.length === 0 && fromCli) {
      throw new Error(`Entrypoint pattern '${pattern}' matched no files.`);
    }

    allMatches.push(...matches);
  }

  const unique = [...new Set(allMatches)].sort(compareStrings);

  if (unique.length === 0) {
    throw new Error('No callgraph entrypoints found. Pass --entry with one or more ingress files.');
  }

  return unique;
};

const shouldSeedCallable = (callable) => callable.isExported || HTTP_HANDLER_NAMES.has(callable.shortName) || callable.isTopLevel;

const collectTopLevelTargets = (sourceFile, callableIdByDeclarationKey) => {
  const targetIds = new Set();

  for (const callExpression of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (firstFunctionLikeAncestor(callExpression)) {
      continue;
    }

    const targetId = resolveCallTargetId(callExpression, callableIdByDeclarationKey);
    if (targetId) {
      targetIds.add(targetId);
    }
  }

  return [...targetIds].sort(compareStrings);
};

const collectCallableTargets = (callable, callableIdByDeclarationKey) => {
  const targetIds = new Set();

  for (const callExpression of callable.ownerNode.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const owner = firstFunctionLikeAncestor(callExpression);
    if (owner !== callable.ownerNode) {
      continue;
    }

    const targetId = resolveCallTargetId(callExpression, callableIdByDeclarationKey);
    if (targetId) {
      targetIds.add(targetId);
    }
  }

  return [...targetIds].sort(compareStrings);
};

export const generateCallGraph = async ({ projectPath, entries, minify, maxEdges, maxDepth }) => {
  const project = new Project({
    tsConfigFilePath: toAbsolutePath(projectPath),
    skipAddingFilesFromTsConfig: false,
    skipFileDependencyResolution: false
  });

  const sourceFileByRepoPath = new Map();
  for (const sourceFile of project.getSourceFiles()) {
    sourceFileByRepoPath.set(toRepoRelativePath(sourceFile.getFilePath()), sourceFile);
  }

  const callables = collectCallables(project);
  const { callableById, callableIdByDeclarationKey, callablesByFile } = indexCallables(callables);

  const entryFiles = await resolveEntrypoints(entries, entries.length > 0);

  const graphNodes = [];
  const edgeSet = new Set();
  const usedNodeIds = new Set();
  const queue = [];
  const enqueuedDepthById = new Map();
  const processedDepthById = new Map();
  let truncated = false;

  for (const entryFile of entryFiles) {
    const entryId = `entry::${entryFile}`;
    graphNodes.push({
      id: entryId,
      label: `ENTRY\n${entryFile}`
    });
    usedNodeIds.add(entryId);

    const sourceFile = sourceFileByRepoPath.get(entryFile);
    if (!sourceFile) {
      continue;
    }

    const seedCallables = (callablesByFile.get(entryFile) ?? []).filter(shouldSeedCallable);

    for (const callable of seedCallables) {
      edgeSet.add(`${entryId}=>${callable.id}=>entry`);
      usedNodeIds.add(callable.id);
      const existingDepth = enqueuedDepthById.get(callable.id);
      if (existingDepth == null || existingDepth > 1) {
        queue.push({ callableId: callable.id, depth: 1 });
        enqueuedDepthById.set(callable.id, 1);
      }
    }

    for (const targetId of collectTopLevelTargets(sourceFile, callableIdByDeclarationKey)) {
      edgeSet.add(`${entryId}=>${targetId}=>boot`);
      usedNodeIds.add(targetId);
      const existingDepth = enqueuedDepthById.get(targetId);
      if (existingDepth == null || existingDepth > 1) {
        queue.push({ callableId: targetId, depth: 1 });
        enqueuedDepthById.set(targetId, 1);
      }
    }
  }

  while (queue.length > 0 && !truncated) {
    const current = queue.shift();
    const callable = callableById.get(current.callableId);

    if (!callable) {
      continue;
    }

    const processedDepth = processedDepthById.get(callable.id);
    if (processedDepth != null && processedDepth <= current.depth) {
      continue;
    }
    processedDepthById.set(callable.id, current.depth);

    if (current.depth >= maxDepth) {
      continue;
    }

    for (const targetId of collectCallableTargets(callable, callableIdByDeclarationKey)) {
      const edgeKey = `${callable.id}=>${targetId}=>calls`;
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
      }

      usedNodeIds.add(callable.id);
      usedNodeIds.add(targetId);

      const nextDepth = current.depth + 1;
      const enqueuedDepth = enqueuedDepthById.get(targetId);
      if (nextDepth <= maxDepth && (enqueuedDepth == null || enqueuedDepth > nextDepth)) {
        queue.push({ callableId: targetId, depth: nextDepth });
        enqueuedDepthById.set(targetId, nextDepth);
      }

      if (edgeSet.size >= maxEdges) {
        truncated = true;
        break;
      }
    }
  }

  for (const callable of callables) {
    if (usedNodeIds.has(callable.id)) {
      graphNodes.push({ id: callable.id, label: callable.label });
    }
  }

  const edges = [...edgeSet]
    .sort(compareStrings)
    .map((encoded) => {
      const [from, to, label] = encoded.split('=>');
      return { from, to, label };
    });

  const comments = [
    `Entrypoints: ${entryFiles.join(', ')}`,
    `Depth budget: ${maxDepth}`,
    truncated ? `Edge budget reached (${maxEdges}). Graph truncated.` : 'Edge budget not reached.'
  ];

  return renderMermaidGraph({
    title: 'Call Graph',
    direction: 'LR',
    nodes: graphNodes,
    edges,
    comments,
    minify
  });
};
