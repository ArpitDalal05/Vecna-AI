# Vecna AI Hive Mind OS - Database Schema

This document outlines the Postgres database schema deployed on Supabase (`project_id: zibtlwmtwpnrxtzfkevm`). All tables are protected by Row Level Security (RLS) policies.

---

## Entity Relationship Table Mappings

### 1. `public.profiles`
Stores user profile information synced from Supabase Auth signup events.
* **Fields**:
  - `id` (uuid, primary key): References `auth.users.id` (cascade deletes).
  - `email` (text): Primary email string.
  - `full_name` (text): User's displays name.
  - `designation` (text): Core cognitive rank.
  - `role` (text): System-wide permissions classification role.
  - `node_id` (text): Random identifier.
  - `sync_rank` (text): User sync ranking.
  - `organization` (text): Associated organization descriptor.
  - `permissions` (text[]): Active security tokens.
  - `preferences` (jsonb): Client-side state options (theme, notification configs).
  - `created_at` (timestamptz): Creation timestamp.
  - `last_sign_in` (timestamptz): Timestamp of last authenticate.

### 2. `public.workspaces`
Groups processing grids and coordinates agent counts.
* **Fields**:
  - `id` (uuid, primary key): Defaults to `gen_random_uuid()`.
  - `name` (text): Name.
  - `slug` (text): Slug.
  - `description` (text): Description.
  - `agent_count` (integer): Swarm scale parameters.
  - `created_at` (timestamptz): Creation timestamp.

### 3. `public.runtime_metrics`
Realtime parameters representing CPU load, memory utilization, latency, and network speeds.
* **Fields**:
  - `id` (uuid, primary key)
  - `metric_id` (text): Code ID (e.g. `cpu_usage`). Unique.
  - `name` (text): Display label.
  - `value` (numeric): Metric coefficient.
  - `unit` (text): Units.
  - `updated_at` (timestamptz): Timestamp of last tick update.

### 4. `public.agents`
Tracks individual swarm agents running tasks inside clusters.
* **Fields**:
  - `id` (uuid, primary key)
  - `name` (text): Code name.
  - `designation` (text): Action class.
  - `status` (text): `ACTIVE`, `IDLE`, or `OFFLINE`.
  - `cpu_usage` (numeric)
  - `memory_usage` (numeric)
  - `reliability_rating` (numeric)
  - `cluster` (text): Swarm category (`RESEARCH`, `DATA`, `CREATIVE`, `STRATEGIC`, `SYSTEM`).
  - `last_heartbeat` (timestamptz)

### 5. `public.notifications`
Alert events shown in top bars and notifications dashboards.
* **Fields**:
  - `id` (uuid, primary key)
  - `title` (text)
  - `message` (text)
  - `type` (text): `ALERT`, `INFO`, `SUCCESS`, `WARNING`.
  - `is_read` (boolean)
  - `user_id` (uuid): References `public.profiles.id`.

### 6. `public.assignments`
Swarm tasks processing inside the runtime evolution dashboard.
* **Fields**:
  - `id` (uuid, primary key)
  - `agent_id` (text)
  - `task_title` (text)
  - `status` (text): `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`.
  - `priority` (text): `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
  - `progress` (numeric): Range 0-100.
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)

### 7. `public.decisions`
Proposed and debated consensus voting items.
* **Fields**:
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `status` (text): `PROPOSED`, `DEBATING`, `RESOLVED`.
  - `consensus_percentage` (numeric)
  - `yes_votes` (integer)
  - `no_votes` (integer)

### 8. `public.analytics`
Historical timeseries data points for metrics plotting.
* **Fields**:
  - `id` (uuid, primary key)
  - `timestamp` (timestamptz)
  - `cpu` (numeric)
  - `memory` (numeric)
  - `latency` (numeric)
  - `bandwidth` (numeric)

---

## Auth Sync Triggers

An automatic Postgres trigger (`public.handle_new_user()`) is installed on the `auth.users` insert event, ensuring any signed-up email profile is immediately populated into the profiles schema table with default OVERLORD permissions.
