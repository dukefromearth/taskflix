---
name: duke-dependency-generator
description: Dependency and architecture graph generation playbook for TypeScript repositories. Use when implementing or upgrading `npm run arch` style workflows with dependency-cruiser plus ts-morph call/type graphs. Triggers on creating a new dependency graph generator or editing one. It does not trigger on running generators. 
license: MIT
metadata:
  author: duke
  version: '0.1.0'
---

# Duke Dependency Generator

Principal-level implementation skill for adding reproducible architecture graph generation to any TypeScript repo. Contains 16 rules across 8 categories, prioritized by failure risk and long-term maintainability.

## First Step (Required)

Install the analysis toolchain before any initialization or wrapper scripting:

```bash
npm install --save-dev dependency-cruiser ts-morph fast-glob
```

## When to Apply

Reference these guidelines when:

- Adding `npm run arch` to a repo
- Standardizing architecture graph output across teams
- Building dependency/type/callgraph tooling for onboarding
- Debugging architecture drift or unexpected coupling
- Hardening CLI/static-analysis workflows for AI-agent usage

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Bootstrap and Toolchain | CRITICAL | `bootstrap-` |
| 2 | Scope and Project Model | CRITICAL | `scope-` |
| 3 | Dependency Graph Generation | HIGH | `deps-` |
| 4 | Type Graph Generation | HIGH | `types-` |
| 5 | Callgraph Generation | HIGH | `callgraph-` |
| 6 | CLI Contract | HIGH | `cli-` |
| 7 | Verification and Determinism | MEDIUM | `verify-` |
| 8 | Operational Hygiene | MEDIUM | `ops-` |

## Quick Reference

### 1. Bootstrap and Toolchain (CRITICAL)

- `bootstrap-install-toolchain` - Install exact analysis toolchain as dev dependencies
- `bootstrap-init-depcruise` - Initialize dependency-cruiser after install and before custom wrappers

### 2. Scope and Project Model (CRITICAL)

- `scope-tsconfig-arch` - Create dedicated `tsconfig.arch.json` for analysis
- `scope-roots-include-exclude` - Align roots, include-only, and exclude filters with repo topology

### 3. Dependency Graph Generation (HIGH)

- `deps-merge-base-config` - Layer graph options on generated `.dependency-cruiser` config, do not replace it
- `deps-readable-vs-minified` - Support readable and minified Mermaid node IDs intentionally

### 4. Type Graph Generation (HIGH)

- `types-exported-only-and-caps` - Default to exported declarations and hard graph caps
- `types-deterministic-ids-and-sort` - Use stable sorting and deterministic node IDs

### 5. Callgraph Generation (HIGH)

- `callgraph-entrypoint-selection` - Seed from real ingress/entrypoints, not arbitrary files
- `callgraph-depth-edge-limits` - Enforce max depth and edge limits to prevent graph blowups

### 6. CLI Contract (HIGH)

- `cli-validate-arguments` - Fail fast on missing/invalid flag values
- `cli-section-markers-and-help` - Emit section markers and clear `--help` usage

### 7. Verification and Determinism (MEDIUM)

- `verify-command-matrix` - Validate default + per-graph command matrix
- `verify-repeatability` - Diff repeated runs to prove deterministic output

### 8. Operational Hygiene (MEDIUM)

- `ops-document-gotchas` - Capture recurring implementation traps as GOTCHAs
- `ops-readme-and-config-sync` - Keep docs synchronized with current file paths and CLI behavior

## How to Use

Read individual rule files for detailed explanations and implementation examples:

```
rules/bootstrap-init-depcruise.md
rules/callgraph-entrypoint-selection.md
```

Each rule file contains:

- Brief explanation of why it matters
- Incorrect example with failure mode
- Correct example with implementation guidance
- References to primary docs/specs

## Full Compiled Document

For the complete starter guide with expanded rules: `AGENTS.md`
