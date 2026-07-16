# Artifact Generation System

This document outlines versioning and metadata configurations for agent outputs.

---

## 1. Supported Output Types

Agents write to the workspace folder:
* **`Source Code`**: `.ts`, `.tsx`, `.css`, `.json`.
* **`Documentation`**: `.md` (Markdown reports).
* **`Data Logs`**: `.json` data logs.

---

## 2. Version Control & Tracking

```typescript
export interface Artifact {
  id: string;
  path: string;
  version: number;
  authorAgentId: string;
  hash: string;
  lastModified: string;
}
```
All version transactions generate automatic entries to public logs.
