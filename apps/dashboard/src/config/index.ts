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
  USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false", // default to true (mock), set to false for Supabase!
  USE_REAL_AI: process.env.NEXT_PUBLIC_USE_REAL_AI === "true",
  ENABLE_STREAMING: process.env.NEXT_PUBLIC_ENABLE_STREAMING !== "false",
  ENABLE_AI_LOGGING: process.env.NEXT_PUBLIC_ENABLE_AI_LOGGING !== "false",
  ENABLE_PROVIDER_FALLBACK: process.env.NEXT_PUBLIC_ENABLE_PROVIDER_FALLBACK !== "false",
  ENABLE_TOOL_EXECUTION: true,
  ENABLE_TERMINAL: true,
  ENABLE_GIT: true,
  ENABLE_FILESYSTEM: true,
  ENABLE_HTTP: true,
  ENABLE_DATABASE: true,
  ENABLE_SEARCH: true,
  ENABLE_ARTIFACTS: true,
  ENABLE_AUDIT_LOGS: true,
  ENABLE_SANDBOX: true,
  AI_STREAMING_ENABLED: true,
  AI_AUTO_FALLBACK: true,
  AI_AUTO_ROTATE_KEYS: true,
  AI_MAX_RETRIES: 3,
  AI_MAX_CONCURRENT_REQUESTS: 3,
  AI_DAILY_TOKEN_LIMIT: 5000000,
  AI_MONTHLY_TOKEN_LIMIT: 100000000,
  AI_HEALTH_MONITOR_ENABLED: true,
  AI_CONTEXT_INJECTION_ENABLED: true,
} as const;

export const CONSTANTS = {
  HIVE_MIN_LATENCY: 12, // ms
  HIVE_MAX_LATENCY: 95, // ms
  SIMULATION_TICK_RATE: 2500, // ms between mock system loops
  MAX_NOTIFICATION_COUNT: 100,
  DEFAULT_INTELLIGENCE_LEVEL: "OMEGA 9.78",
} as const;
