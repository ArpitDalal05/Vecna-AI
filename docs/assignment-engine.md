# Assignment Engine Specification

This document details the scheduling, dependency validation, and state machine transitions of the task execution engine.

---

## 1. Assignment Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending : Created
    Pending --> Running : Dependencies Satisfied
    Running --> Waiting : Suspended / Awaiting Review
    Waiting --> Running : Re-activated
    Running --> Blocked : Resource Overload / Dependency Blocked
    Blocked --> Running : Block Removed
    Running --> Completed : Success (Exit Code 0)
    Running --> Failed : Error (Exit Code > 0)
    Failed --> Pending : Retry Triggered (Max Retries = 3)
    Failed --> Cancelled : Terminated by Administrator
    Completed --> [*]
```

---

## 2. Priority and Deadlines

Assignments have four priority tiers:
1. **`CRITICAL`**: Bypasses the scheduler queue, allocated directly to free CPU slots.
2. **`HIGH`**: Prioritized queue allocation.
3. **`MEDIUM`**: Standard scheduling.
4. **`LOW`**: Idle queue background execution.

---

## 3. Dependency Graph Resolution

Before transitioning an assignment from `PENDING` to `RUNNING`, the **Background Scheduler** traverses the task dependency array:
* Cycle detection checks for circular reference exceptions (e.g. A depends on B, B depends on A).
* Ensures all listed prerequisite assignment IDs have status = `COMPLETED`.
