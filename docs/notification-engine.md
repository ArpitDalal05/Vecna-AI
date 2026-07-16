# Notification Engine Specification

This document outlines the rule-driven triggers and priorities governing alerts routing.

---

## 1. Rules Matrix

Notifications generate automatically based on the following system rules:

| Source Event | Rule criteria | Target Notification type |
| --- | --- | --- |
| `Assignment Completed` | Progress = 100% | `SUCCESS` |
| `Assignment Failed` | Error Code > 0 | `ALERT` |
| `Agent Offline` | Heartbeat tick missed | `WARNING` |
| `Consensus Reached` | Consensus > 92% | `SUCCESS` |

---

## 2. Priority and Read States

Every generated notification supports:
* **Priority Tiers**: `LOW`, `NORMAL`, `HIGH`, `CRITICAL`.
* **Read-state flags**: Handled via `markAllRead` and `clear` mutations.
