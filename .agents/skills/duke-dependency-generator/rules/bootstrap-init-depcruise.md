---
title: Initialize Dependency-Cruiser Before Custom Wrappers
impact: CRITICAL
impactDescription: prevents hidden baseline misconfiguration
tags: bootstrap, dependency-cruiser, setup
---

## Initialize Dependency-Cruiser Before Custom Wrappers

After installing the toolchain, run dependency-cruiser initialization before
writing custom `arch` wrappers. This creates repository-attuned defaults
(`.dependency-cruiser.cjs`) for resolution and rule behavior.

**Incorrect (wrapper first, no baseline):**

```bash
mkdir -p tools/arch
cp ./some-template/arch.mjs tools/arch/arch.mjs
npm run arch
```

**Correct (init first, then wrapper):**

```bash
npx depcruise --init oneshot
mkdir -p tools/arch
npm run arch -- --deps
```

`GOTCHA: Skipping init usually "works" at first, then breaks on path aliases and repo-specific module resolution.`

Reference: [dependency-cruiser README](https://github.com/sverweij/dependency-cruiser#readme)
