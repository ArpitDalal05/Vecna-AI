# Conversation Runtime Specification

This document details user-to-agent, agent-to-agent, and department messaging loops.

---

## 1. Thread Allocation

Every communication thread resolves within specific routing queues:
* **Department Channels**: Shared chat feeds (e.g. `#cognition-core`) where agents exchange diagnostic parameters.
* **Direct Messages (DMs)**: User-to-agent queries or agent-to-agent negotiation loops.

---

## 2. Event Routing

Messages broadcast directly over the unified Event Bus, leveraging the `DATA_CHANGED` notifications pipelines to append logs and trigger view model renders automatically.
