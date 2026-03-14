---
title: Keep a Living GOTCHA List for Implementation Traps
impact: MEDIUM
impactDescription: prevents recurring setup and debugging churn
tags: ops, gotchas, maintenance
---

## Keep a Living GOTCHA List for Implementation Traps

Capture weird but recurring issues directly in skill docs so agents and humans
stop rediscovering the same failures.

**Incorrect (tribal knowledge only):**

```text
No gotcha notes. Team learns by repeated breakage.
```

**Correct (explicit gotchas):**

```text
GOTCHA: zsh may not expand dotfile globs like .dependency-cruiser* by default.
GOTCHA: npm run output includes command preamble lines before Mermaid.
GOTCHA: broad app-router entrypoints can explode callgraph edge counts.
```

Reference: [zsh filename generation](https://zsh.sourceforge.io/Doc/Release/Expansion.html#Filename-Generation)
