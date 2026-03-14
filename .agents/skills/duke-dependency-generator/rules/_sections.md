# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. Bootstrap and Toolchain (bootstrap)

**Impact:** CRITICAL
**Description:** Establishes the required toolchain and initialization sequence.
Without this, later graph tooling is brittle or misleading.

## 2. Scope and Project Model (scope)

**Impact:** CRITICAL
**Description:** Defines which files and project model are analyzed. Incorrect
scope is the most common source of noisy or incomplete graphs.

## 3. Dependency Graph Generation (deps)

**Impact:** HIGH
**Description:** Rules for producing accurate dependency structure in Mermaid,
including compatibility with repository-level dependency-cruiser config.

## 4. Type Graph Generation (types)

**Impact:** HIGH
**Description:** Rules for extracting useful type relationships while preserving
signal over noise and deterministic output.

## 5. Callgraph Generation (callgraph)

**Impact:** HIGH
**Description:** Rules for entrypoint-driven static callgraph traversal and
controlled output growth.

## 6. CLI Contract (cli)

**Impact:** HIGH
**Description:** Defines predictable command behavior, clear failure modes, and
usable output contracts for humans and agents.

## 7. Verification and Determinism (verify)

**Impact:** MEDIUM
**Description:** Ensures output is reproducible and command behavior is validated
across graph modes.

## 8. Operational Hygiene (ops)

**Impact:** MEDIUM
**Description:** Keeps docs, gotchas, and implementation behavior aligned over
long-term maintenance.
