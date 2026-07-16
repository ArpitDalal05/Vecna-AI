# Memory System Architecture

This document describes the decoupled memory components of the Vecna AI autonomous operating system.

---

## 1. Memory Subsystems

```
┌────────────────────────────────────────────────────────┐
│                      SHARED MEMORY                     │
├───────────────┬────────────────────────┬───────────────┤
│ Episodic Logs │ Semantic Embeddings    │ Working Cache │
│ (Time-series) │ (Document Relations)   │ (Active Task) │
└───────────────┴────────────────────────┴───────────────┘
```

* **`Episodic Memory`**: Sequential timeseries recording every action, event, and state change in a chronological log feed. Connected directly to the **Runtime Timeline**.
* **`Semantic Memory`**: Knowledge-base fragments mapping concepts (WebGL, React hooks, Supabase Auth). Queried via keyword weights and similarity coordinates.
* **`Working Memory`**: Volatile context arrays representing the currently processing subtask details. Used by running agents to maintain state.
* **`Shared Organization Memory`**: Cumulative intelligence database accessible across all departments.

---

## 2. Memory API Contracts

```typescript
interface MemoryFragment {
  id: string;
  type: "EPISODIC" | "SEMANTIC" | "WORKING" | "SHARED";
  key: string;
  value: string;
  tags: string[];
  createdAt: string;
}
```
