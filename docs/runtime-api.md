# AI Swarm Runtime API Reference

This document describes the unified repository systems and active API methods.

---

## 1. Endpoints List

* `/api/agents`: Registry, capabilities, spawning, and termination.
* `/api/assignments`: Progress tracking, priority routing, and retry loops.
* `/api/reviews`: Multi-agent code review comments, approvals, and logs.
* `/api/decisions`: Proposals voting grids and consensus histories.
* `/api/notifications`: Read/unread indicators, types, and preferences.
* `/api/memory`: Episodic memory timelines and semantic base fragments.
* `/api/conversations`: Chat logs and threaded discussions.

---

## 2. Abstraction Compliance

Repositories (`systemRepository`, `agentRepository`, etc.) decouple all UI components from direct database clients:

```
[UI Dashboard Panels]
          ↓
  [useHiveState()]
          ↓
[Repository Interfaces] (Promise-based Async queries)
          ↓
[Supabase Client OR Local Mock Files]
```
No inline queries exist inside view models.
