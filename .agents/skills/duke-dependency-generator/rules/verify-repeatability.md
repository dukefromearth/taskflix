---
title: Prove Repeatability with Diff-Based Re-Runs
impact: MEDIUM
impactDescription: validates determinism claims with evidence
tags: verify, determinism, diffs
---

## Prove Repeatability with Diff-Based Re-Runs

Run each graph mode twice and diff outputs. Determinism should be tested, not
assumed.

**Incorrect (no repeatability check):**

```bash
npm run arch -- --types > /tmp/types.mmd
```

**Correct (paired run + diff):**

```bash
npm run arch -- --types > /tmp/types-run1.mmd
npm run arch -- --types > /tmp/types-run2.mmd
diff -u /tmp/types-run1.mmd /tmp/types-run2.mmd
```

Reference: [GNU diffutils](https://www.gnu.org/software/diffutils/manual/diffutils.html)
