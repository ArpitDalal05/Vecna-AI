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
