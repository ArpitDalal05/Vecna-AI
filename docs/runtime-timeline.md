# Runtime Timeline Specification

This document details the unified event logging timeline.

---

## 1. Event Log Fields

```typescript
interface EventLog {
  id: string;
  category: "SYSTEM" | "RUNTIME" | "AUTH" | "DECISION" | "MEMBER";
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  timestamp: string;
}
```

---

## 2. Searching and Paging

Timeline logs support filtering by `category`, `severity`, search parameters, and limit offsets to prevent viewport performance issues on massive timelines.
