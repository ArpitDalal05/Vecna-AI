"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User, Assignment, Decision, Notification } from "../types";
import { systemRepository } from "../repositories/systemRepository";
import { runtimeRepository } from "../repositories/runtimeRepository";
import { agentRepository } from "../repositories/agentRepository";
import { notificationRepository } from "../repositories/notificationRepository";
import { profileRepository } from "../repositories/profileRepository";
import { organizationRepository } from "../repositories/organizationRepository";
import { analyticsRepository } from "../repositories/analyticsRepository";
import { settingsRepository } from "../repositories/settingsRepository";
import { eventBus } from "../services/runtime/eventBus";
import { hiveSimulation } from "../services/runtime/engines";
import { SystemMetricRow } from "../mock/system";
import { AgentRow } from "../mock/agents";
import { NotificationRow } from "../mock/notifications";
import { ProfileRow } from "../mock/profile";
import { WorkspaceRow } from "../mock/workspace";
import { ChartDataPoint } from "../mock/analytics";

export interface HiveStateContextType {
  user: User | null;
  profile: ProfileRow | null;
  onlineAgentCount: number;
  latency: number;
  cpuUsage: number;
  memoryUsage: number;
  bandwidth: number;
  activeThreads: number;
  assignments: Assignment[];
  decisions: Decision[];
  liveLogs: string[];
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  activeWorkspace: WorkspaceRow | null;
  workspaces: WorkspaceRow[];
  analyticsHistory: ChartDataPoint[];
  agents: AgentRow[];
  updateProfile: (updates: Partial<ProfileRow>) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  changeWorkspace: (id: string) => Promise<void>;
  triggerSimulationTick: () => void;
}

export const HiveStateContext = createContext<HiveStateContextType | undefined>(undefined);

export function HiveStateProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Central State variables
  const [metrics, setMetrics] = useState<SystemMetricRow[]>([]);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceRow | null>(null);
  const [analyticsHistory, setAnalyticsHistory] = useState<ChartDataPoint[]>([]);

  // Telemetry live logs buffer
  const [liveLogs, setLiveLogs] = useState<string[]>([]);

  // Derive metrics
  const cpuUsage = metrics.find(m => m.id === "cpu_usage")?.value || 42.8;
  const memoryUsage = metrics.find(m => m.id === "memory_usage")?.value || 85.4;
  const latency = metrics.find(m => m.id === "latency")?.value || 24;
  const bandwidth = metrics.find(m => m.id === "bandwidth")?.value || 2.78;
  const onlineAgentCount = activeWorkspace?.agentCount || 24875;
  const activeThreads = Math.floor(cpuUsage * 1.4) + 40;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const user: User | null = profile ? {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    designation: profile.designation,
    role: profile.role,
    createdAt: profile.createdAt
  } : null;

  // Asynchronous repository load dispatcher
  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    setError(null);

    try {
      const [
        metricsRes,
        agentsRes,
        assignmentsRes,
        decisionsRes,
        notificationsRes,
        profileRes,
        workspacesRes,
        activeWorkspaceRes,
        analyticsHistoryRes
      ] = await Promise.all([
        systemRepository.getMetrics(),
        agentRepository.getAgents(),
        runtimeRepository.getAssignments(),
        organizationRepository.getDecisions(),
        notificationRepository.getNotifications(),
        profileRepository.getProfile(),
        settingsRepository.getWorkspaces(),
        settingsRepository.getActiveWorkspace(),
        analyticsRepository.getChartHistory()
      ]);

      // Handle repository error fallbacks gracefully
      if (metricsRes.data) setMetrics(metricsRes.data);
      if (agentsRes.data) setAgents(agentsRes.data);
      if (assignmentsRes.data) setAssignments(assignmentsRes.data);
      if (decisionsRes.data) setDecisions(decisionsRes.data);
      if (notificationsRes.data) setNotifications(notificationsRes.data);
      if (profileRes.data) setProfile(profileRes.data);
      if (workspacesRes.data) setWorkspaces(workspacesRes.data);
      if (activeWorkspaceRes.data) setActiveWorkspace(activeWorkspaceRes.data);
      if (analyticsHistoryRes.data) setAnalyticsHistory(analyticsHistoryRes.data);

      const err = metricsRes.error || agentsRes.error || assignmentsRes.error || decisionsRes.error;
      if (err) {
        console.warn("Recovered from repository failure with cached values:", err);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load database repositories.");
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, []);

  const updateProfile = async (updates: Partial<ProfileRow>) => {
    const res = await profileRepository.updateProfile(updates);
    if (res.data) {
      setProfile(res.data);
    }
  };

  const markNotificationsRead = async () => {
    await notificationRepository.markAllRead();
    const res = await notificationRepository.getNotifications();
    if (res.data) setNotifications(res.data);
  };

  const clearNotifications = async () => {
    await notificationRepository.clear();
    setNotifications([]);
  };

  const changeWorkspace = async (id: string) => {
    await settingsRepository.setActiveWorkspace(id);
    const activeRes = await settingsRepository.getActiveWorkspace();
    if (activeRes.data) {
      setActiveWorkspace(activeRes.data);
      // Trigger metric scaling for dynamic nodes display
      eventBus.emit("DATA_CHANGED");
    }
  };

  // Expose manual simulator tick hook for tests
  const triggerSimulationTick = () => {
    eventBus.emit("DATA_CHANGED");
  };

  // 1. Initial mount, start the simulation loop
  useEffect(() => {
    const init = async () => {
      // Setup initial live logs
      const timeStr = new Date().toLocaleTimeString();
      setLiveLogs([
        `[${timeStr}] VECNA_OS // KERNEL RUNNING`,
        `[${timeStr}] SECURE // SHELL MATRIX SYNCED`,
        `[${timeStr}] STORAGE // EPISODIC MEMORY ATTACHED`,
      ]);

      await loadData(true);
      hiveSimulation.start();
    };

    init();

    return () => {
      hiveSimulation.stop();
    };
  }, [loadData]);

  // 2. Subscribe to Event Bus to catch DATA_CHANGED updates without polling
  useEffect(() => {
    const handleDataChanged = () => {
      loadData(false);

      // Append live terminal logs on tick updates
      const mockLogStatements = [
        "SYNAPSE // Re-routing filaments to optimal nodes",
        "MEMORY // Flushing local index buffers to episodic vector storage",
        "COMPUTE // Recalculating particle positions inside WebGL buffer",
        "DECISION // Consensus update on node deployment overrides",
        "CORE // Heartbeat status ping: 98.7% health verified",
        "SECURITY // Authenticating session parameters on route guard"
      ];
      const logStatement = mockLogStatements[Math.floor(Math.random() * mockLogStatements.length)];
      const logEntry = `[${new Date().toLocaleTimeString()}] ${logStatement}`;

      setLiveLogs(prev => {
        const nextLogs = [...prev, logEntry];
        if (nextLogs.length > 50) nextLogs.shift();
        return nextLogs;
      });
    };

    const unsubscribe = eventBus.on("DATA_CHANGED", handleDataChanged);
    return () => {
      unsubscribe();
    };
  }, [loadData]);

  return (
    <HiveStateContext.Provider
      value={{
        user,
        profile,
        onlineAgentCount,
        latency,
        cpuUsage,
        memoryUsage,
        bandwidth,
        activeThreads,
        assignments,
        decisions,
        liveLogs,
        notifications: notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.isRead,
          timestamp: n.timestamp
        })),
        unreadCount,
        loading,
        error,
        activeWorkspace,
        workspaces,
        analyticsHistory,
        agents,
        updateProfile,
        markNotificationsRead,
        clearNotifications,
        changeWorkspace,
        triggerSimulationTick
      }}
    >
      {children}
    </HiveStateContext.Provider>
  );
}

export default HiveStateProvider;
