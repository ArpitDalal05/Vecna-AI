# Tool Execution Framework

This document outlines security authorization and call logs for agent tools.

---

## 1. Security Authorization Model

```
[Agent Requests Tool Call]
           ↓
[Permission Policy Check]
      ┌────┴────┐
   Allowed   Denied (Return SecurityException)
      ▼
[Sandbox Execution]
           ↓
[Log Tool Transaction to public.agent_logs]
```

---

## 2. Supported Core Tools

1. **`File System`**: Reads, writes, and list files inside sandboxed project workspace.
2. **`Git & GitHub`**: Stage changes, create commits, check branches, push pull requests.
3. **`Http Client`**: Dispatches JSON requests to APIs.
4. **`Terminal shell`**: Runs compilation build verification.
