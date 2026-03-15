---
title: Align roots, includeOnly, and exclude to Real Repo Topology
impact: CRITICAL
impactDescription: prevents false negatives and false positives
tags: scope, filtering, dependency-cruiser
---

## Align roots, includeOnly, and exclude to Real Repo Topology

Set graph roots and include/exclude regexes to match actual source layout.
For mixed repos (e.g. `src` + `app`), single-root configs under-report
architecture.

**Incorrect (src-only on mixed app+src repo):**

```json
{
  "roots": ["src"],
  "includeOnly": "^src/"
}
```

**Correct (topology-aware scope):**

```json
{
  "roots": ["src", "app"],
  "includeOnly": "^(src|app)/",
  "exclude": [
    "(^|/)(dist|build|coverage|out|\\.next)(/|$)",
    "[.](spec|test)\\.[cm]?[jt]sx?$"
  ]
}
```

Reference: [dependency-cruiser options](https://raw.githubusercontent.com/sverweij/dependency-cruiser/main/doc/options-reference.md)
