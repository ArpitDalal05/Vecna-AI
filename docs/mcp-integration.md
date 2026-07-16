# Model Context Protocol (MCP) Integration

This document outlines client implementations for Model Context Protocol (MCP) servers.

---

## 1. Centralized MCP Manager

Agents execute external calls through a unified manager:
* **GitHub MCP**: Queries repository statuses, commits lists, and issues.
* **Supabase MCP**: Executes remote SQL migrations and queries table definitions.
* **Figma MCP**: Inspects UI design node states.
* **Notion MCP**: Synchronizes workspace markdown documents.

---

## 2. Configured Server Transport

```typescript
export interface IMCPTransport {
  sendRequest(method: string, params: any): Promise<any>;
  onNotification(method: string, callback: (payload: any) => void): void;
}
```
Transports are registered using standard JSON-RPC packets.
