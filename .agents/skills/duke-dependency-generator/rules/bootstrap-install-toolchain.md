---
title: Install the Full Analysis Toolchain First
impact: CRITICAL
impactDescription: avoids runtime command failures and version drift
tags: bootstrap, dependencies, tooling
---

## Install the Full Analysis Toolchain First

Install and pin the graph stack in `devDependencies`: dependency graph engine,
AST/type engine, and globbing support.

This is the first required step in a fresh repository.

**Incorrect (partial install):**

```bash
npm install --save-dev dependency-cruiser
```

**Correct (complete install):**

```bash
npm install --save-dev dependency-cruiser ts-morph fast-glob
```

`GOTCHA: Running init or wrapper scripts before this step often leads to inconsistent local/remote tool versions.`

Reference: [fast-glob README](https://github.com/mrmlnc/fast-glob#readme)
