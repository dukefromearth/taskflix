---
title: Validate Required CLI Flag Values Explicitly
impact: HIGH
impactDescription: prevents flag swallowing and confusing ENOENT errors
tags: cli, validation, reliability
---

## Validate Required CLI Flag Values Explicitly

For flags that require values (`--config`, `--minify`), fail with explicit
messages when values are missing or malformed.

**Incorrect (accepts next flag as value):**

```js
if (arg === "--config") {
  configPath = argv[i + 1] ?? configPath
}
```

**Correct (strict value checks):**

```js
if (arg === "--config") {
  const rawValue = argv[i + 1]
  if (!rawValue || rawValue.startsWith("--")) {
    throw new Error("Missing value for --config. Expected a config path.")
  }
  configPath = rawValue
}
```

`GOTCHA: Without this check, '--config --deps' often fails as ENOENT on '--deps'.`

Reference: [Node CLI argument patterns](https://nodejs.org/api/process.html#processargv)
