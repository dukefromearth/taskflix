---
title: Seed Callgraph from Real Ingress Entrypoints
impact: HIGH
impactDescription: improves graph relevance and architecture signal
tags: callgraph, entrypoints, architecture
---

## Seed Callgraph from Real Ingress Entrypoints

Choose entrypoints that represent actual runtime ingress (HTTP routes, server
bootstrap, CLI entry file). Arbitrary seeds produce misleading graphs.

**Incorrect (non-ingress utility seeds):**

```json
{
  "entrypoints": ["src/utils/**/*.ts"]
}
```

**Correct (runtime ingress seeds):**

```json
{
  "entrypoints": [
    "src/index.ts",
    "app/api/**/*.ts"
  ]
}
```

Reference: [fast-glob patterns](https://github.com/mrmlnc/fast-glob#pattern-syntax)
