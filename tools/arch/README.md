# Architecture Discovery

Primary command:

```bash
npm run arch -- discover all <topic>
```

Example:

```bash
npm run arch -- discover all schedule
```

This runs a 4-step discovery pipeline and writes JSON-only output to:

- `tmp/arch/discover/<topic-slug>/index.json`
- `tmp/arch/discover/<topic-slug>/1-scope/scope.json`
- `tmp/arch/discover/<topic-slug>/2-flows/flows.json`
- `tmp/arch/discover/<topic-slug>/3-contracts/contracts.json`
- `tmp/arch/discover/<topic-slug>/4-confidence/confidence.json`

## What each step does

1. `1-scope/scope.json`
- expands topic terms
- scans repo files for topical matches
- selects callgraph entrypoints
- returns compact match rows by default (`file`, `bm25Score`, `matchedTerms`)

2. `2-flows/flows.json`
- includes dependency, type, and callgraph flow outputs
- includes traversal bounds and selected entrypoints

3. `3-contracts/contracts.json`
- topic-adjacent HTTP handlers, schema references, DB mentions, invariants

4. `4-confidence/confidence.json`
- `proven`, `inferred`, and `unknown-dynamic` signals

## Options

```bash
npm run arch -- discover all <topic> [options]
```

- `--out-dir <path>` output root (default: `tmp/arch/discover`)
- `--config <path>` depcruise config path (default: `.dependency-cruiser.cjs`)
- `--project <path>` TS project (default: `tsconfig.arch.json`)
- `--entry <path>` optional callgraph entrypoint(s), repeatable
- `--max-edges <n>` callgraph edge budget (default: `500`)
- `--max-depth <n>` callgraph traversal depth (default: `3`)
- `--verbose` include per-term BM25 diagnostics in `1-scope/scope.json`

## Notes

- Discovery output is JSON-only.
- Scope matches are compact by default; use `--verbose` for term-level counts/weights/contributions.
- This workflow is discovery-focused and does not claim behavioral safety by itself.
- `4-confidence` explicitly reports unknown dynamic areas to avoid false confidence.
