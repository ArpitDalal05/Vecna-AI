# Tool Registry Specification

Coordinates and indexes all active sandbox execution tools centrally.

## Registry Schema

```typescript
class ToolRegistry {
  private registry: Map<string, Tool> = new Map();
  register(name: string, tool: Tool): void;
  get(name: string): Tool | undefined;
  getAll(): Tool[];
}
```
