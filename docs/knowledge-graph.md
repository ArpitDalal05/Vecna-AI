# Knowledge Graph Specification

This document details the relationship mapping schema connecting agents, decisions, and system events.

---

## 1. Entity Nodes and Arcs

The swarm operations graph represents relationships as nodes and directed edges:

```
[Agent] ──(owns)──→ [Assignment]
   │                      │
(member)               (triggers)
   ▼                      ▼
[Department] ───→ [Decision Proposals]
```

---

## 2. Graph Traversal API

We provide local query selectors (e.g. `getAgentWorkloadGraph(agentId)`) to resolve and traverse dependencies without adding visual components to the dashboard screens.
* **Nodes**: Organizations, Departments, Employees, Agents, Assignments, Decisions, Events, Documents.
* **Edges**: MEMBER_OF, ASSIGNED_TO, PRE_REQUISITE_OF, VOTED_ON, AUDITED_BY.
