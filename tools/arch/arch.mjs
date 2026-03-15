#!/usr/bin/env node
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { parseCli, printHelp } from './cli.mjs';
import { generateDependencyGraph } from './deps.mjs';
import { generateTypeGraph } from './types.mjs';
import { generateCallGraph } from './callgraph.mjs';
import { runDiscoverAll } from './discover-all.mjs';
import { toAbsolutePath } from './shared.mjs';

const writeGraphToFile = async (outputPath, graphText) => {
  const absolute = toAbsolutePath(outputPath);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, graphText, 'utf8');
  return absolute;
};

const runGraphMode = async (cli) => {
  const outputs = new Map();

  if (cli.modes.deps) {
    outputs.set(
      'deps',
      await generateDependencyGraph({
        configPath: cli.configPath,
        projectPath: cli.projectPath,
        minify: cli.minify
      })
    );
  }

  if (cli.modes.types) {
    outputs.set(
      'types',
      await generateTypeGraph({
        projectPath: cli.projectPath,
        minify: cli.minify
      })
    );
  }

  if (cli.modes.callgraph) {
    outputs.set(
      'callgraph',
      await generateCallGraph({
        projectPath: cli.projectPath,
        entries: cli.entries,
        minify: cli.minify,
        maxEdges: cli.maxEdges,
        maxDepth: cli.maxDepth
      })
    );
  }

  if (outputs.size === 1) {
    const [[mode, graphText]] = outputs.entries();

    if (cli.outputPath && cli.outputPath !== '-') {
      const absolute = await writeGraphToFile(cli.outputPath, graphText);
      process.stderr.write(`Wrote ${mode} graph to ${absolute}\n`);
      return;
    }

    process.stdout.write(graphText);
    return;
  }

  await mkdir(toAbsolutePath(cli.outDir), { recursive: true });

  for (const [mode, graphText] of outputs.entries()) {
    const relativePath = path.join(cli.outDir, `${mode}.mmd`);
    const absolute = await writeGraphToFile(relativePath, graphText);
    process.stderr.write(`Wrote ${mode} graph to ${absolute}\n`);
  }
};

const run = async () => {
  const cli = parseCli(process.argv.slice(2));

  if (cli.help) {
    if (cli.command === 'discover-all' || cli.command === 'graph') {
      return;
    }
    printHelp();
    return;
  }

  if (cli.command === 'discover-all') {
    const result = await runDiscoverAll({
      topic: cli.topic,
      outDir: cli.outDir,
      configPath: cli.configPath,
      projectPath: cli.projectPath,
      entries: cli.entries,
      maxEdges: cli.maxEdges,
      maxDepth: cli.maxDepth,
      verbose: cli.verbose
    });

    process.stderr.write(`Discovery output written to ${result.outputRoot}\n`);
    return;
  }

  await runGraphMode(cli);
};

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`arch: ${message}\n`);
  process.exitCode = 1;
});
