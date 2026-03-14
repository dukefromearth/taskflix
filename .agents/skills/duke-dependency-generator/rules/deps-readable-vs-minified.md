---
title: Support Readable and Minified Mermaid Dependency Output
impact: HIGH
impactDescription: balances human debugging and compact output
tags: deps, mermaid, output
---

## Support Readable and Minified Mermaid Dependency Output

Expose a `--minify <true|false>` switch for dependency graph output. Use
minified IDs by default for compact output, and readable IDs for debugging.

**Incorrect (single hardcoded mode):**

```js
const minify = true
```

**Correct (explicit CLI toggle):**

```bash
npm run arch -- --deps --minify false
npm run arch -- --deps --minify true
```

```js
if (arg === "--minify") depsMinify = parseBooleanArg("--minify", value)
```

Reference: [dependency-cruiser reporter options](https://github.com/sverweij/dependency-cruiser/blob/main/types/reporter-options.d.mts)
