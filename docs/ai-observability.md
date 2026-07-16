# AI Observability Specification

This document details metric counters and latencies logging inside the Swarm controller.

---

## 1. Tracked Metrics

We record telemetry metrics for active LLM transactions:
* **Token Consumption**: Input and Output tokens metrics.
* **Cost Accounting**: Accrued USD calculations.
* **Response Latency**: Seconds elapsed per generation.
* **Tool Call Rates**: Count of executions dispatched.

---

## 2. API Observability Schema

```typescript
export interface AIRequestLog {
  id: string;
  model: string;
  agentRole: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  durationMs: number;
  status: "SUCCESS" | "FAILURE";
}
```
Logs are saved to `public.agent_logs` and metrics read out on the dashboard.
