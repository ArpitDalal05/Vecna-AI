# Vecna AI Hive Mind OS - Repository Systems

This document describes the repository design patterns and caching mechanisms.

---

## Architecture Diagram

```
[UI Components]
       ↓
 [useHiveState Hook]
       ↓
[HiveStateProvider Context]
       ↓
 [Repository Interfaces] (ISystemRepository, IAgentRepository, etc.)
       ↓
[Concrete Repository Class Instance]
  ├── (Check config.USE_MOCK_DATA)
  ├── True  → Fetch from src/mock/*.ts
  └── False → Fetch from public Supabase tables
```

---

## 1. Caching Layer (`CacheManager`)

To minimize remote Supabase database reads and mimic network speed optimizations, every concrete repository route calls `cacheManager.get(key)`.
* **Configurable TTL**: Defaults to 4 seconds.
* **Invalidations**: The background simulation engine tick invalidates affected cache keys on writes, ensuring real-time subscriptions fetch fresh values on next ticks.

---

## 2. Standard Response Wrapper

All repository functions return a Promise resolving to a standardized wrapper:
```typescript
export interface RepoResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}
```

---

## 3. Repositories List

1. **`SystemRepository`**: Connects system CPU/Memory loads.
2. **`AgentRepository`**: Connects swarm agent nodes and heartbeats.
3. **`RuntimeRepository`**: Connects worker assignment arrays.
4. **`NotificationRepository`**: Connects user notifications queues.
5. **`ProfileRepository`**: Connects metadata settings.
6. **`OrganizationRepository`**: Connects departments list.
7. **`AnalyticsRepository`**: Connects coordinate analytics timelines.
8. **`SettingsRepository`**: Connects workspace definitions.
