---
title: Default Type Graph to Exported Declarations with Hard Caps
impact: HIGH
impactDescription: prevents noisy and unbounded graphs
tags: types, ts-morph, graph-size
---

## Default Type Graph to Exported Declarations with Hard Caps

Limit type graph scope to exported declarations and enforce node/edge caps.
This keeps output actionable in larger repositories.

**Incorrect (unbounded graph):**

```json
{
  "typegraph": {
    "exportedOnly": false
  }
}
```

**Correct (bounded and stable):**

```json
{
  "typegraph": {
    "exportedOnly": true,
    "maxNodes": 300,
    "maxEdges": 1000
  }
}
```

Reference: [ts-morph setup](https://ts-morph.com/setup/)
