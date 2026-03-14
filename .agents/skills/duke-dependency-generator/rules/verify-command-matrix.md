---
title: Verify the Full Command Matrix, Not Just Default Mode
impact: MEDIUM
impactDescription: catches mode-specific regressions early
tags: verify, testing, cli
---

## Verify the Full Command Matrix, Not Just Default Mode

Validate each mode independently and default aggregation mode. Bugs often hide
in one branch (`--deps` only, `--types` only, etc.).

**Incorrect (single smoke test):**

```bash
npm run arch
```

**Correct (explicit matrix):**

```bash
npm run arch -- --help
npm run arch
npm run arch -- --deps --minify false
npm run arch -- --types
npm run arch -- --callgraph
```

Reference: [dependency-cruiser CLI examples](https://github.com/sverweij/dependency-cruiser#show-stuff-to-your-grandma)
