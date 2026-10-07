/**
 * Vecna AI Hive Mind OS Domain Type Definitions
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  designation: string;
  role: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  intelligenceLevel: string;
  activeAgentsCount: number;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  fullName: string;
  designation: string;
  departmentId: string;
  status: "ACTIVE" | "IDLE" | "OFFLINE";
  reliabilityRating: number;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  agentId: string;
  taskTitle: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  progress: number;
  startedAt: string;
  completedAt?: string;
}

export interface Review {
  id: string;
  targetType: "CODE" | "DOCUMENT" | "DECISION" | "RUNTIME";
  targetId: string;
  reviewerId: string;
  status: "APPROVED" | "REJECTED" | "FLAGGED";
  comments: string;
  reviewedAt: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  status: "PROPOSED" | "DEBATING" | "RESOLVED" | "ARCHIVED";
  consensusPercentage: number;
  yesVotes: number;
  noVotes: number;
  createdAt: string;
}

export interface HiveEvent {
  id: string;
  type: "AUTH" | "RUNTIME" | "AGENT" | "DECISION" | "SYSTEM";
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "ALERT" | "INFO" | "SUCCESS" | "WARNING";
  isRead: boolean;
  timestamp: string;
}

export interface Conversation {
  id: string;
  agentIds: string[];
  messages: Array<{
    senderId: string;
    text: string;
    timestamp: string;
  }>;
  createdAt: string;
}

export interface AgentLog {
  id: string;
  agentId: string;
  module: string;
  action: string;
  status: "SUCCESS" | "WARNING" | "FAILURE";
  payload?: Record<string, any>;
  timestamp: string;
}

export interface Mission {
  id: string;
  title: string;
  goal: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  workspace: string;
  executionMode: "Autonomous" | "Approval Required";
  status: "CREATED" | "PLANNING" | "ASSIGNING" | "RUNNING" | "PAUSED" | "REVIEWING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  estimatedTasks: number;
  completedTasks: number;
  assignedAgents: string[];
  owner?: string;
  currentPhase?: "MISSION_CREATED" | "PLANNING" | "PLAN_READY" | "EXECUTING" | "VERIFYING" | "COMPLETED" | "EXECUTION_FAILED" | "BLOCKED" | "CANCELLED";
  currentTask?: string;
  executionProgress?: number;
  totalTasks?: number;
  failedTasks?: number;
  startedAt?: string;
  completedAt?: string;
  lastActivityAt?: string;
  executionError?: string;
  resultSummary?: string;
}

export interface MissionTask {
  id: string;
  missionId: string;
  agentId: string;
  taskTitle: string;
  description?: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "BLOCKED" | "PENDING_APPROVAL";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  progress: number;
  dependencies?: string[];
  estimatedDuration?: string;
  reasoning?: string;
  successCriteria?: string;
  targetArtifact?: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface ExecutionLogEntry {
  id: string;
  timestamp: string;
  missionId: string;
  taskId?: string;
  agent?: string;
  event: "MISSION_STARTED" | "PLAN_CREATED" | "TASK_STARTED" | "LLM_REQUEST" | "LLM_RESPONSE" | "FILE_CREATED" | "FILE_UPDATED" | "FILE_DELETED" | "COMMAND_STARTED" | "COMMAND_COMPLETED" | "COMMAND_FAILED" | "ARTIFACT_CREATED" | "VALIDATION_STARTED" | "VALIDATION_FAILED" | "VALIDATION_PASSED" | "MISSION_COMPLETED";
  metadata?: Record<string, any>;
}

export interface FileOperationAudit {
  id: string;
  missionId: string;
  taskId?: string;
  filePath: string;
  operation: "CREATE" | "READ" | "UPDATE" | "RENAME" | "DELETE";
  previousVersion?: string;
  newVersion?: string;
  timestamp: string;
  agent: string;
  result: "SUCCESS" | "FAILED" | "PENDING_APPROVAL";
}

export interface CommandExecutionAudit {
  id: string;
  missionId: string;
  taskId?: string;
  command: string;
  arguments: string[];
  workingDirectory: string;
  timeout: number;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  duration?: number;
  status: "RUNNING" | "COMPLETED" | "SUCCESS" | "FAILED" | "BLOCKED" | "PENDING_APPROVAL";
  timestamp: string;
}
