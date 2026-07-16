# Autonomous Planning Engine

This document details goal decomposition, automatic task generation, and workflows.

---

## 1. Goal Decomposition Flowchart

```
           [High-Level Objective]
                     ↓
         [Planning Agent Analysis]
                     ↓
     [DAG Task Dependency Generation]
                     ↓
        [Agent Registry Allocation]
                     ↓
[Evolution Scheduler Queue Processing]
```

---

## 2. Re-planning on Execution Failure

On task failure (e.g. build failure):
1. Spawn a Code Reviewer agent to inspect terminal diagnostics logs.
2. Formulate a correction task item.
3. Inject the task at the head of the dependency queue, marking original nodes as blocked until the fix is executed.
