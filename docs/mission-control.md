# Mission Control Specification

This document details the command interface, validator, planner integration, and database operations for AI Missions in Vecna OS.

---

## 1. Mission Lifecycle State Machine

```
[Create Mission Form]
          ↓
[Validate Input & Create Mission]
          ↓
[Decompose Goal into Assignments DAG]
          ↓
[Push Tasks to Runtime Evolution Engine]
          ↓
[Observe Realtime Task Progress & Finish Alerts]
```

Missions transition through the following states:
* `CREATED`: Registered.
* `PLANNING`: Goals decomposing.
* `ASSIGNING`: Queue allocations.
* `RUNNING`: Progressing active tasks.
* `PAUSED`: Execution suspended.
* `REVIEWING`: Audit approvals verification.
* `COMPLETED` / `FAILED` / `CANCELLED`: Execution finalized.

---

## 2. Abstraction Compliance & Repositories

Like other data interfaces, `missionRepository` delegates to:
* **Mock mode**: `src/mock/missions.ts` in-memory table.
* **Supabase mode**: `public.missions` remote table, synchronized dynamically.
No UI component references client libraries directly.
