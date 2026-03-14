---
title: Make Type Graph IDs and Ordering Deterministic
impact: HIGH
impactDescription: enables reliable diffs and repeatable AI workflows
tags: types, determinism, hashing
---

## Make Type Graph IDs and Ordering Deterministic

Sort declarations and edges deterministically, and generate stable node IDs from
normalized identifiers (path + symbol/kind). Non-determinism breaks review
confidence.

**Incorrect (iteration-order IDs):**

```js
const id = `type_${Date.now()}_${Math.random()}`
```

**Correct (stable hash IDs + sorted traversal):**

```js
const id = hashId("type", `${relPath}:${kind}:${name}`)
const sorted = [...items].sort((a, b) => key(a).localeCompare(key(b)))
```

Reference: [ts-morph type APIs](https://ts-morph.com/details/types)
