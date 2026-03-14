---
title: Enforce maxDepth and maxEdges in Callgraph Traversal
impact: HIGH
impactDescription: prevents runaway traversal in large repos
tags: callgraph, traversal, limits
---

## Enforce maxDepth and maxEdges in Callgraph Traversal

Always enforce traversal limits. Callgraph expansion is highly sensitive to
entrypoint breadth and dynamic call sites.

**Incorrect (unbounded traversal):**

```js
while (queue.length > 0) {
  // no depth guard
  // no edge cap
}
```

**Correct (bounded traversal):**

```json
{
  "callgraph": {
    "maxDepth": 6,
    "maxEdges": 500
  }
}
```

```js
if (current.depth > config.callgraph.maxDepth) continue
if (callgraphEdges.length >= config.callgraph.maxEdges) return false
```

Reference: [TypeChecker getResolvedSignature](https://ts-morph.com/navigation/type-checker)
