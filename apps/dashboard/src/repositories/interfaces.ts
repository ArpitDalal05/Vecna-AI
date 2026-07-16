import { SystemMetricRow } from "../mock/system";
import { AgentRow } from "../mock/agents";
import { ChartDataPoint } from "../mock/analytics";
import { NotificationRow } from "../mock/notifications";
import { ProfileRow } from "../mock/profile";
import { WorkspaceRow } from "../mock/workspace";
import { Assignment, Department, Employee, Decision } from "../types";

export interface RepoResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface ISystemRepository {
  getMetrics(): Promise<RepoResponse<SystemMetricRow[]>>;
  getHealth(): Promise<RepoResponse<number>>;
}

export interface IRuntimeRepository {
  getAssignments(): Promise<RepoResponse<Assignment[]>>;
}

export interface IAgentRepository {
  getAgents(): Promise<RepoResponse<AgentRow[]>>;
}

export interface INotificationRepository {
  getNotifications(): Promise<RepoResponse<NotificationRow[]>>;
  markAllRead(): Promise<{ error: Error | null }>;
  clear(): Promise<{ error: Error | null }>;
}

export interface IProfileRepository {
  getProfile(): Promise<RepoResponse<ProfileRow>>;
  updateProfile(updates: Partial<ProfileRow>): Promise<RepoResponse<ProfileRow>>;
}

export interface IOrganizationRepository {
  getDepartments(): Promise<RepoResponse<Department[]>>;
  getEmployees(): Promise<RepoResponse<Employee[]>>;
  getDecisions(): Promise<RepoResponse<Decision[]>>;
}

export interface IAnalyticsRepository {
  getChartHistory(): Promise<RepoResponse<ChartDataPoint[]>>;
}

export interface ISettingsRepository {
  getWorkspaces(): Promise<RepoResponse<WorkspaceRow[]>>;
  getActiveWorkspace(): Promise<RepoResponse<WorkspaceRow>>;
  setActiveWorkspace(id: string): Promise<{ error: Error | null }>;
}
