---
title: Use a Dedicated tsconfig.arch.json for Static Analysis
impact: CRITICAL
impactDescription: prevents generated/build artifacts from polluting results
tags: scope, typescript, tsconfig
---

## Use a Dedicated tsconfig.arch.json for Static Analysis

Create a dedicated analysis tsconfig instead of reusing the app build tsconfig.
Keep analysis input explicit and stable.

**Incorrect (reuse broad app tsconfig):**

```json
{
  "project": "./tsconfig.json"
}
```

**Correct (dedicated arch tsconfig):**

```json
{
  "project": "./tsconfig.arch.json"
}
```

```json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts", "app/**/*.ts", "app/**/*.tsx"],
  "exclude": [".next", "dist", "test", "**/*.test.ts"]
}
```

Reference: [TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
