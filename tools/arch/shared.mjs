import path from 'node:path';

export const REPO_ROOT = process.cwd();

export const DEFAULT_ARCH_INPUT_GLOBS = ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', 'scripts/**/*.ts'];

export const DEFAULT_CALLGRAPH_ENTRY_GLOBS = [
  'src/index.ts',
  'app/api/**/route.ts',
  'scripts/bootstrap-db.ts',
  'scripts/migrate.ts',
  'scripts/reindex-fts.ts'
];

export const ARCH_IGNORE_GLOBS = [
  '**/*.d.ts',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/tmp/**',
  '**/coverage/**'
];

export const compareStrings = (left, right) => left.localeCompare(right, 'en-US');

export const toPosixPath = (value) => value.split(path.sep).join('/');

export const toAbsolutePath = (value) => path.resolve(REPO_ROOT, value);

export const toRepoRelativePath = (value) => toPosixPath(path.relative(REPO_ROOT, value));

export const uniqueSorted = (values) => [...new Set(values)].sort(compareStrings);

export const ensureTrailingNewline = (value) => (value.endsWith('\n') ? value : `${value}\n`);
