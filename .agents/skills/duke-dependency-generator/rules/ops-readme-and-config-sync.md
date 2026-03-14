---
title: Keep README, CLI Help, and Config Paths in Sync
impact: MEDIUM
impactDescription: avoids stale docs and onboarding friction
tags: ops, docs, drift
---

## Keep README, CLI Help, and Config Paths in Sync

Every path and command in docs must match current implementation. Stale docs
cause immediate trust collapse in automation workflows.

**Incorrect (stale file path):**

```md
- scripts/generate-arch.sh
```

**Correct (actual file path):**

```md
- tools/arch/arch.mjs
- tools/arch/generate.mjs
- tools/arch/arch.config.json
```

Reference: [Keep a Changelog principles](https://keepachangelog.com/en/1.1.0/)
