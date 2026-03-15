import { compareStrings, ensureTrailingNewline } from './shared.mjs';

const escapeLabel = (value) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\"/g, '\\\"')
    .replace(/\n/g, '<br/>');

const compactMermaid = (text) => {
  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''));

  const compacted = [];

  for (const line of lines) {
    if (line.trim().length === 0 && (compacted.length === 0 || compacted.at(-1).trim().length === 0)) {
      continue;
    }
    compacted.push(line);
  }

  return ensureTrailingNewline(compacted.join('\n').trimEnd());
};

export const normalizeMermaidText = (text, minify) => {
  if (!minify) {
    return ensureTrailingNewline(text.replace(/\r\n/g, '\n').trimEnd());
  }

  return compactMermaid(text);
};

export const renderMermaidGraph = ({
  title,
  direction = 'LR',
  nodes,
  edges,
  minify,
  comments = []
}) => {
  const sortedNodes = [...nodes].sort((left, right) => compareStrings(left.id, right.id));

  const nodeAliasById = new Map();
  for (const [index, node] of sortedNodes.entries()) {
    nodeAliasById.set(node.id, `n${index}`);
  }

  const sortedEdges = [...edges]
    .filter((edge) => nodeAliasById.has(edge.from) && nodeAliasById.has(edge.to))
    .sort((left, right) => {
      const leftKey = `${left.from}|${left.to}|${left.label ?? ''}`;
      const rightKey = `${right.from}|${right.to}|${right.label ?? ''}`;
      return compareStrings(leftKey, rightKey);
    });

  const lines = [`flowchart ${direction}`];

  if (title) {
    lines.push(`%% ${title}`);
  }

  for (const comment of comments) {
    lines.push(`%% ${comment}`);
  }

  if (!minify) {
    lines.push('');
  }

  for (const node of sortedNodes) {
    const alias = nodeAliasById.get(node.id);
    lines.push(`${alias}["${escapeLabel(node.label)}"]`);
  }

  if (!minify) {
    lines.push('');
  }

  for (const edge of sortedEdges) {
    const fromAlias = nodeAliasById.get(edge.from);
    const toAlias = nodeAliasById.get(edge.to);
    const hasLabel = typeof edge.label === 'string' && edge.label.trim().length > 0;

    if (hasLabel) {
      lines.push(`${fromAlias} -- "${escapeLabel(edge.label)}" --> ${toAlias}`);
      continue;
    }

    lines.push(`${fromAlias} --> ${toAlias}`);
  }

  return normalizeMermaidText(lines.join('\n'), minify);
};
