---
title: Emit Section Markers and a Clear --help Contract
impact: HIGH
impactDescription: enables predictable downstream parsing and user guidance
tags: cli, ux, output-contract
---

## Emit Section Markers and a Clear --help Contract

Emit explicit section headers (for example `%% graph:deps`) and maintain a
single authoritative help string for options and usage.

**Incorrect (ambiguous mixed output):**

```text
flowchart LR
...
classDiagram
...
```

**Correct (typed sections):**

```text
%% graph:deps
flowchart LR
...
%% graph:types
classDiagram
...
%% graph:callgraph
flowchart LR
...
```

```text
Usage: npm run arch -- [--deps] [--types] [--callgraph] [--config <path>] [--minify <true|false>]
```

Reference: [Mermaid docs](https://mermaid.js.org/intro/)
