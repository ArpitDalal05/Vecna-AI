# Review Engine Specification

This document details the multi-agent peer review workflow, approval states, and reviewer routing metrics.

---

## 1. Review Workflows

```
[Evolution Task Completed]
           ↓
[Spawn Review Item & Assign Reviewer Agents]
           ↓
[Verify Syntax, Lints, and Security Targets]
      ┌────┴────┐
      ▼         ▼
  Approved   Rejected / Request Changes
  (Consensus) (Returned to evolution queue)
```

---

## 2. Reviewer States

* **`PENDING`**: Awaiting inspection.
* **`UNDER_REVIEW`**: Active automated code audit.
* **`APPROVED`**: Ready for repository merge.
* **`CHANGES_REQUESTED`**: Returned to scheduler queue for retry execution.
* **`REJECTED`**: Terminated.
