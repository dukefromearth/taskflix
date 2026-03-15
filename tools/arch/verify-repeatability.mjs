#!/usr/bin/env node
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ARCH_SCRIPT = path.resolve('tools/arch/arch.mjs');
const MODES = [
  ['--deps'],
  ['--types'],
  ['--callgraph']
];

const runArch = (modeArgs) => {
  const result = spawnSync(process.execPath, [ARCH_SCRIPT, ...modeArgs, '--minify', 'false'], {
    encoding: 'utf8',
    cwd: process.cwd(),
    env: process.env
  });

  if (result.status !== 0) {
    throw new Error(`arch ${modeArgs.join(' ')} failed:\n${result.stderr || result.stdout}`.trim());
  }

  return result.stdout;
};

const firstDiffLine = (left, right) => {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  const maxLength = Math.max(leftLines.length, rightLines.length);

  for (let index = 0; index < maxLength; index += 1) {
    if ((leftLines[index] ?? '') !== (rightLines[index] ?? '')) {
      return index + 1;
    }
  }

  return -1;
};

for (const modeArgs of MODES) {
  const pass1 = runArch(modeArgs);
  const pass2 = runArch(modeArgs);

  if (pass1 !== pass2) {
    const line = firstDiffLine(pass1, pass2);
    throw new Error(`Repeatability check failed for ${modeArgs.join(' ')} at line ${line}.`);
  }

  process.stdout.write(`repeatable: ${modeArgs.join(' ')}\n`);
}
