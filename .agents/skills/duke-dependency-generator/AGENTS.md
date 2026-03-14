# Duke Dependency Generator

**Version 0.1.0**
Duke Engineering
March 2026

> Note:
> This guide is written primarily for agents and AI-assisted workflows. It
> prioritizes deterministic behavior, explicit contracts, and low-friction
> debugging over stylistic preferences.

---

## Abstract

A practical architecture-graph implementation framework for TypeScript repos,
built around dependency-cruiser, ts-morph, and fast-glob. The rules are
ordered by risk: bootstrap/setup correctness first, then scope and graph
fidelity, then CLI contract and deterministic verification, then operational
hygiene.

---

## Table of Contents

1. Bootstrap and Toolchain (CRITICAL)
   - 1.1 Install the Full Analysis Toolchain as Dev Dependencies
   - 1.2 Initialize Dependency-Cruiser Before Custom Wrappers
2. Scope and Project Model (CRITICAL)
   - 2.1 Use a Dedicated tsconfig.arch.json for Static Analysis
   - 2.2 Align roots, includeOnly, and exclude to Real Repo Topology
3. Dependency Graph Generation (HIGH)
   - 3.1 Merge with Generated Dependency-Cruiser Config
   - 3.2 Support Readable and Minified Mermaid Dependency Output
4. Type Graph Generation (HIGH)
   - 4.1 Default Type Graph to Exported Declarations with Hard Caps
   - 4.2 Make Type Graph IDs and Ordering Deterministic
5. Callgraph Generation (HIGH)
   - 5.1 Seed Callgraph from Real Ingress Entrypoints
   - 5.2 Enforce maxDepth and maxEdges in Callgraph Traversal
6. CLI Contract (HIGH)
   - 6.1 Validate Required CLI Flag Values Explicitly
   - 6.2 Emit Section Markers and a Clear --help Contract
7. Verification and Determinism (MEDIUM)
   - 7.1 Verify the Full Command Matrix, Not Just Default Mode
   - 7.2 Prove Repeatability with Diff-Based Re-Runs
8. Operational Hygiene (MEDIUM)
   - 8.1 Keep a Living GOTCHA List for Implementation Traps
   - 8.2 Keep README, CLI Help, and Config Paths in Sync

---

## 1. Bootstrap and Toolchain

### 1.1 Install the Full Analysis Toolchain as Dev Dependencies
Install `dependency-cruiser`, `ts-morph`, and `fast-glob` together to avoid
partial feature failures.

```bash
npm install --save-dev dependency-cruiser ts-morph fast-glob
```

### 1.2 Initialize Dependency-Cruiser Before Custom Wrappers
After install, run `npx depcruise --init oneshot` so repository-tuned baseline
config is present before wrapper scripts are added.

---

## 2. Scope and Project Model

### 2.1 Use a Dedicated tsconfig.arch.json for Static Analysis
Use dedicated analysis tsconfig to keep generated artifacts and test files out
of graph construction.

### 2.2 Align roots, includeOnly, and exclude to Real Repo Topology
Match `roots` + `includeOnly` to actual source areas (`src`, `app`, etc.) and
apply explicit excludes for build/test/generated output.

---

## 3. Dependency Graph Generation

### 3.1 Merge with Generated Dependency-Cruiser Config
When customizing Mermaid rendering, merge into `.dependency-cruiser` options;
do not replace baseline resolver behavior.

### 3.2 Support Readable and Minified Mermaid Dependency Output
Expose `--minify true|false` so debugging and compact reporting are both
supported.

---

## 4. Type Graph Generation

### 4.1 Default Type Graph to Exported Declarations with Hard Caps
Use exported-only types and enforce explicit node/edge limits to preserve
signal and runtime stability.

### 4.2 Make Type Graph IDs and Ordering Deterministic
Sort input collections and hash normalized identifiers for stable IDs and clean
diffs.

---

## 5. Callgraph Generation

### 5.1 Seed Callgraph from Real Ingress Entrypoints
Callgraph seeds should represent actual ingress: API routes, server bootstrap,
or CLI entry files.

### 5.2 Enforce maxDepth and maxEdges in Callgraph Traversal
Bound traversal depth and edges to avoid unbounded growth in large repos.

---

## 6. CLI Contract

### 6.1 Validate Required CLI Flag Values Explicitly
Fail fast for missing or malformed flag values (`--config`, `--minify`) to
avoid confusing downstream errors.

### 6.2 Emit Section Markers and a Clear --help Contract
Emit typed section markers (`%% graph:*`) and keep one authoritative usage
string in `--help`.

---

## 7. Verification and Determinism

### 7.1 Verify the Full Command Matrix, Not Just Default Mode
Test default, each single graph mode, and key flags. Mode-specific regressions
are common.

### 7.2 Prove Repeatability with Diff-Based Re-Runs
Run each mode twice and diff outputs to prove deterministic behavior.

---

## 8. Operational Hygiene

### 8.1 Keep a Living GOTCHA List for Implementation Traps
Document recurring edge cases (shell globbing, npm preamble output, entrypoint
explosion) as explicit GOTCHAs.

### 8.2 Keep README, CLI Help, and Config Paths in Sync
Treat stale doc paths as defects; update docs whenever file paths or CLI
contract changes.

---

## References

- dependency-cruiser: https://github.com/sverweij/dependency-cruiser
- ts-morph docs: https://ts-morph.com/
- fast-glob docs: https://github.com/mrmlnc/fast-glob
- TypeScript TSConfig reference: https://www.typescriptlang.org/tsconfig/
