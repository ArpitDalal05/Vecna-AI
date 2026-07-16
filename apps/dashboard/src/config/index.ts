/**
 * Vecna AI Hive Mind OS Configuration Layer
 */

export const ENV = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zibtlwmtwpnrxtzfkevm.supabase.co",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  NODE_ENV: process.env.NODE_ENV || "development",
};

export const ROLES = {
  HIVE_OVERLORD: "HIVE_OVERLORD", // Read/Write All
  ADMINISTRATOR: "ADMINISTRATOR", // Read/Write System
  NODE_CONTROLLER: "NODE_CONTROLLER", // Read/Write Local
  SPECTATOR: "SPECTATOR", // Read Only
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const PERMISSIONS = {
  READ_METRICS: "metrics:read",
  WRITE_METRICS: "metrics:write",
  TRIGGER_DECISION: "decisions:trigger",
  UPDATE_EMPLOYEE: "employees:update",
  EXECUTE_AGENT: "agents:execute",
  AUDIT_LOGS: "logs:audit",
} as const;

export const FEATURE_FLAGS = {
  ENABLE_LIVE_TICKER: true,
  ENABLE_GPU_PARTICLES: true,
  ENABLE_DECISION_DEBATE: true,
  ENABLE_REALTIME_NOTIFICATIONS: true,
} as const;

export const CONSTANTS = {
  HIVE_MIN_LATENCY: 12, // ms
  HIVE_MAX_LATENCY: 95, // ms
  SIMULATION_TICK_RATE: 2500, // ms between mock system loops
  MAX_NOTIFICATION_COUNT: 100,
  DEFAULT_INTELLIGENCE_LEVEL: "OMEGA 9.78",
} as const;
