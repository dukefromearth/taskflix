---
title: Merge with Generated Dependency-Cruiser Config
impact: HIGH
impactDescription: preserves repository-specific resolver and rule behavior
tags: deps, dependency-cruiser, config
---

## Merge with Generated Dependency-Cruiser Config

When producing Mermaid output, layer reporter overrides on top of
`.dependency-cruiser.cjs` instead of replacing it. Replacing it discards repo
resolution defaults.

**Incorrect (replace all options):**

```js
module.exports = {
  options: {
    reporterOptions: { mermaid: { minify: true } }
  }
}
```

**Correct (merge base options):**

```js
const base = require("/repo/.dependency-cruiser.cjs")
module.exports = {
  ...base,
  options: {
    ...(base.options ?? {}),
    reporterOptions: {
      ...((base.options ?? {}).reporterOptions ?? {}),
      mermaid: {
        ...(((base.options ?? {}).reporterOptions ?? {}).mermaid ?? {}),
        minify: true,
      },
    },
  },
}
```

Reference: [dependency-cruiser CLI](https://raw.githubusercontent.com/sverweij/dependency-cruiser/main/doc/cli.md)
