import { createRequire } from 'node:module';
import { access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import fg from 'fast-glob';
import { cruise, format } from 'dependency-cruiser';
import {
  ARCH_IGNORE_GLOBS,
  compareStrings,
  DEFAULT_ARCH_INPUT_GLOBS,
  toAbsolutePath,
  uniqueSorted
} from './shared.mjs';
import { normalizeMermaidText } from './mermaid.mjs';

const require = createRequire(import.meta.url);

const mergeReporterOptions = (base = {}) => ({
  ...base,
  dot: {
    ...(base.dot ?? {}),
    collapsePattern: base.dot?.collapsePattern ?? 'node_modules/(?:@[^/]+/[^/]+|[^/]+)'
  },
  archi: {
    ...(base.archi ?? {}),
    collapsePattern:
      base.archi?.collapsePattern ??
      '^(?:packages|src|lib(s?)|app(s?)|bin|test(s?)|spec(s?))/[^/]+|node_modules/(?:@[^/]+/[^/]+|[^/]+)'
  }
});

const mergePathOption = (option, extraPaths) => {
  const existing = Array.isArray(option?.path) ? option.path : [];
  return {
    ...(option ?? {}),
    path: uniqueSorted([...existing, ...extraPaths])
  };
};

const loadDepCruiseConfig = async (configPath) => {
  const absolute = toAbsolutePath(configPath);

  try {
    await access(absolute, fsConstants.R_OK);
  } catch {
    throw new Error(`Dependency-cruiser config not found at '${configPath}'. Run: npx depcruise --init oneshot`);
  }

  const loaded = require(absolute);
  const config = loaded?.default ?? loaded;

  if (!config || typeof config !== 'object') {
    throw new Error(`Dependency-cruiser config '${configPath}' did not export a configuration object.`);
  }

  return config;
};

const collectInputFiles = async () => {
  const files = await fg(DEFAULT_ARCH_INPUT_GLOBS, {
    onlyFiles: true,
    unique: true,
    dot: false,
    ignore: ARCH_IGNORE_GLOBS
  });

  if (files.length === 0) {
    throw new Error('No TypeScript source files matched architecture input globs.');
  }

  return files.sort(compareStrings);
};

const mergeCruiseConfig = (baseConfig, projectPath) => ({
  ...baseConfig,
  options: {
    ...(baseConfig.options ?? {}),
    includeOnly: baseConfig.options?.includeOnly ?? '^(app|src|scripts)/',
    tsConfig: {
      ...(baseConfig.options?.tsConfig ?? {}),
      fileName: projectPath
    },
    doNotFollow: mergePathOption(baseConfig.options?.doNotFollow, ['node_modules', '^\\.next', '^dist', '^tmp']),
    reporterOptions: mergeReporterOptions(baseConfig.options?.reporterOptions)
  }
});

export const generateDependencyGraph = async ({ configPath, projectPath, minify }) => {
  const [baseConfig, inputFiles] = await Promise.all([loadDepCruiseConfig(configPath), collectInputFiles()]);

  const mergedConfig = mergeCruiseConfig(baseConfig, projectPath);

  const cruiseResult = await cruise(inputFiles, mergedConfig, { outputType: 'json' });

  const formattedResult = await format(cruiseResult.output, {
    outputType: 'mermaid',
    reporterOptions: mergedConfig.options?.reporterOptions
  });

  return normalizeMermaidText(formattedResult.output, minify);
};
