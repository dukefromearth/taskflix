# Duke Dependency Generator

A structured repository for creating and maintaining architecture/dependency graph generation practices optimized for agents and LLMs.

## Structure

- `rules/` - Individual rule files (one per rule)
  - `_sections.md` - Section metadata (titles, impacts, descriptions)
  - `_template.md` - Template for creating new rules
  - `area-description.md` - Individual rule files
- `SKILL.md` - Runtime skill index for trigger/use
- `AGENTS.md` - Expanded starter reference document

## Getting Started

1. Install required toolchain (required first step):
   ```bash
   npm install --save-dev dependency-cruiser ts-morph fast-glob
   ```
2. Initialize dependency-cruiser in the target repo:
   ```bash
   npx depcruise --init oneshot
   ```
3. Add architecture command contract:
   ```bash
   npm run arch -- --help
   ```
4. Validate deterministic behavior:
   ```bash
   npm run arch -- --deps --minify false
   npm run arch -- --types
   npm run arch -- --callgraph
   ```

## Creating a New Rule

1. Copy `rules/_template.md` to `rules/area-description.md`
2. Choose the appropriate area prefix:
   - `bootstrap-` for bootstrap and toolchain
   - `scope-` for analysis scope/modeling
   - `deps-` for dependency graph generation
   - `types-` for type graph generation
   - `callgraph-` for callgraph generation
   - `cli-` for CLI contract and ergonomics
   - `verify-` for deterministic verification
   - `ops-` for documentation and operational hygiene
3. Fill in frontmatter and concrete examples
4. Include one practical failure mode and one robust fix

## Rule File Structure

Each rule file should follow this structure:

````markdown
---
title: Rule Title Here
impact: HIGH
impactDescription: Optional description
tags: tag1, tag2, tag3
---

## Rule Title Here

Brief explanation of the rule and why it matters.

**Incorrect (what fails):**

```bash
# bad command or bad code
```

**Correct (what works):**

```bash
# fixed command or fixed code
```

Reference: [Link](https://example.com)
````

## File Naming Convention

- Files starting with `_` are special (excluded from normal rule consumption)
- Rule files: `area-description.md` (e.g., `callgraph-entrypoint-selection.md`)
- Section is inferred from filename prefix
- Keep rule names action-oriented and unambiguous

## Impact Levels

- `CRITICAL` - Missing this often breaks setup or yields invalid graphs
- `HIGH` - Strongly affects correctness or usefulness of output
- `MEDIUM` - Improves reliability and maintainability
- `LOW` - Improves ergonomics and long-term operations
