import { Project, Node, SyntaxKind } from 'ts-morph';
import { renderMermaidGraph } from './mermaid.mjs';
import { compareStrings, toAbsolutePath, toRepoRelativePath } from './shared.mjs';

const isTypeDeclarationNode = (node) =>
  Node.isClassDeclaration(node) ||
  Node.isInterfaceDeclaration(node) ||
  Node.isTypeAliasDeclaration(node) ||
  Node.isEnumDeclaration(node);

const declarationKey = (node) => `${node.getSourceFile().getFilePath()}::${node.getStart(false)}::${node.getKindName()}`;

const declarationName = (node) => node.getName?.() ?? `<anonymous@L${node.getStartLineNumber()}>`;

const declarationSortKey = (node) =>
  `${toRepoRelativePath(node.getSourceFile().getFilePath())}::${node.getKindName()}::${declarationName(node)}::${String(
    node.getStartLineNumber()
  ).padStart(6, '0')}`;

const declarationComparator = (left, right) => compareStrings(declarationSortKey(left), declarationSortKey(right));

const collectTypeDeclarations = (project) => {
  const declarations = [];

  for (const sourceFile of project.getSourceFiles()) {
    if (sourceFile.isDeclarationFile()) {
      continue;
    }

    declarations.push(...sourceFile.getClasses(), ...sourceFile.getInterfaces(), ...sourceFile.getTypeAliases(), ...sourceFile.getEnums());
  }

  return declarations.sort(declarationComparator);
};

const declarationNodeToGraphNode = (declaration) => {
  const kind = declaration.getKindName().replace('Declaration', '');
  const name = declarationName(declaration);
  const file = toRepoRelativePath(declaration.getSourceFile().getFilePath());
  const id = `${file}::${kind}::${name}`;
  return {
    id,
    label: `${name} (${kind})\n${file}`
  };
};

const sortedDeclarationsForSymbol = (symbol) =>
  (symbol?.getDeclarations?.() ?? []).slice().sort((left, right) => {
    const leftKey = `${left.getSourceFile().getFilePath()}::${left.getStart(false)}::${left.getKindName()}`;
    const rightKey = `${right.getSourceFile().getFilePath()}::${right.getStart(false)}::${right.getKindName()}`;
    return compareStrings(leftKey, rightKey);
  });

const resolveImportAliasSymbol = (declaration) => {
  if (Node.isImportSpecifier(declaration)) {
    return declaration.getNameNode().getSymbol()?.getAliasedSymbol();
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

const resolveSymbolToTypeNodeId = (symbol, declarationNodeIdByKey, seen = new Set()) => {
  if (!symbol) {
    return null;
  }

  const symbolKey = symbol.getFullyQualifiedName();
  if (seen.has(symbolKey)) {
    return null;
  }
  seen.add(symbolKey);

  const symbols = [symbol];
  const aliasedSymbol = symbol.getAliasedSymbol?.();
  if (aliasedSymbol && aliasedSymbol !== symbol) {
    symbols.push(aliasedSymbol);
  }

  for (const candidate of symbols) {
    const declarations = sortedDeclarationsForSymbol(candidate);

    for (const declaration of declarations) {
      if (isTypeDeclarationNode(declaration)) {
        const directNodeId = declarationNodeIdByKey.get(declarationKey(declaration));
        if (directNodeId) {
          return directNodeId;
        }
      }

      const aliasSymbol = resolveImportAliasSymbol(declaration);
      if (aliasSymbol) {
        const resolved = resolveSymbolToTypeNodeId(aliasSymbol, declarationNodeIdByKey, seen);
        if (resolved) {
          return resolved;
        }
      }
    }
  }

  return null;
};

const collectReferenceSymbols = (declaration) => {
  const symbols = [];

  for (const typeReference of declaration.getDescendantsOfKind(SyntaxKind.TypeReference)) {
    const symbol = typeReference.getTypeName().getSymbol() ?? typeReference.getType().getSymbol();
    if (symbol) {
      symbols.push(symbol);
    }
  }

  for (const expressionWithTypeArgument of declaration.getDescendantsOfKind(SyntaxKind.ExpressionWithTypeArguments)) {
    const symbol =
      expressionWithTypeArgument.getExpression().getSymbol() ?? expressionWithTypeArgument.getExpression().getType().getSymbol();
    if (symbol) {
      symbols.push(symbol);
    }
  }

  return symbols;
};

export const generateTypeGraph = async ({ projectPath, minify }) => {
  const project = new Project({
    tsConfigFilePath: toAbsolutePath(projectPath),
    skipAddingFilesFromTsConfig: false,
    skipFileDependencyResolution: false
  });

  const declarations = collectTypeDeclarations(project);

  if (declarations.length === 0) {
    return 'flowchart LR\n%% No type declarations found in analysis scope.\n';
  }

  const nodes = declarations.map(declarationNodeToGraphNode);

  const declarationNodeIdByKey = new Map();
  for (const [index, declaration] of declarations.entries()) {
    declarationNodeIdByKey.set(declarationKey(declaration), nodes[index].id);
  }

  const edgeSet = new Set();

  for (const declaration of declarations) {
    const fromNodeId = declarationNodeIdByKey.get(declarationKey(declaration));
    const referenceSymbols = collectReferenceSymbols(declaration);

    for (const symbol of referenceSymbols) {
      const toNodeId = resolveSymbolToTypeNodeId(symbol, declarationNodeIdByKey);
      if (!toNodeId || toNodeId === fromNodeId) {
        continue;
      }

      edgeSet.add(`${fromNodeId}=>${toNodeId}`);
    }
  }

  const edges = [...edgeSet]
    .sort(compareStrings)
    .map((entry) => {
      const [from, to] = entry.split('=>');
      return { from, to, label: 'uses' };
    });

  return renderMermaidGraph({
    title: 'Type Graph',
    direction: 'LR',
    nodes,
    edges,
    minify
  });
};
