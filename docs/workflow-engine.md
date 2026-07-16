# Workflow Automation Engine

This document outlines automated task execution workflows.

---

## 1. Core Workflow Templates

1. **`Feature Build`**:
   - Spawns Product Manager agent to detail specs.
   - Architect creates typescript declarations.
   - Software Engineer implements components.
   - QA Agent runs unit test suite validation.
2. **`Security Audit`**:
   - Security Engineer audits codebase dependencies.
   - Flags vulnerable libraries.
   - Recommends patches.

---

## 2. Stateful Workflow Runner

```typescript
export interface IWorkflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  currentStepIndex: number;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
}
```
Workflows are executed sequentially, maintaining context blocks between steps.
