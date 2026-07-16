# Vecna AI Hive Mind OS - API Contracts

This document outlines the API contracts and endpoints exposed by our unified database abstraction layers.

---

## 1. Authentication Services

### `getUser`
* **Purpose**: Retrieves the active authenticated user profile details from Supabase Auth and database tables.
* **Return Contract**:
```typescript
Promise<User | null>
```
* **Payload**:
```typescript
interface User {
  id: string;
  email: string;
  fullName: string;
  designation: string;
  role: string;
  createdAt: string;
}
```

### `updateProfile`
* **Purpose**: Updates user profiles metadata (e.g. name, designation).
* **Return Contract**:
```typescript
Promise<any>
```

---

## 2. Telemetry Services

### `getMetrics`
* **Purpose**: Queries current CPU, Memory, Latency, and Bandwidth metrics.
* **Return Contract**:
```typescript
Promise<SystemMetricRow[]>
```

### `getChartHistory`
* **Purpose**: Queries historical timeseries coordinates for graphing.
* **Return Contract**:
```typescript
Promise<ChartDataPoint[]>
```

---

## 3. Worker Node Services

### `getAgents`
* **Purpose**: Queries active computational agent slots and heartbeats.
* **Return Contract**:
```typescript
Promise<AgentRow[]>
```

### `getAssignments`
* **Purpose**: Queries running/completed background task evolutions.
* **Return Contract**:
```typescript
Promise<Assignment[]>
```
