# Architecture Generator

Architecture generation is driven by:

- `.dependency-cruiser.cjs` (generated via `npx depcruise --init oneshot`)
- `tools/arch/arch.config.json`
- `tools/arch/generate.mjs`
- `tools/arch/arch.mjs`

Run from repo root:

```bash
npx depcruise --init oneshot
npm run arch
```

`npm run arch` prints Mermaid output to stdout and writes no files.
  - run with `-- ` + `--deps`, `--types`, or `--callgraph` to select a single graph.
  - pass `--minify false` to make dependency graph node IDs readable.

Examples:

```bash
# default (minified dep graph IDs)
npm run arch

# readable dep graph IDs
npm run arch -- --deps --minify false
```
