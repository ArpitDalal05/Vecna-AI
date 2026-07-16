"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, Assignment, Decision, Notification } from "../types";
import { ApiClient } from "../services/api/apiClient";
import { eventBus } from "../services/runtime/eventBus";
import { hiveSimulation } from "../services/runtime/engines";

export interface HiveStateContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  activeWorkspace: string;
  setActiveWorkspace: (ws: string) => void;
  onlineAgentCount: number;
  latency: number;
  activeThreads: number;
  assignments: Assignment[];
  decisions: Decision[];
  liveLogs: string[];
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (title: string, message: string, type: Notification["type"]) => void;
  markNotificationsRead: () => void;
  clearNotifications: () => void;
  refreshUser: () => Promise<void>;
}

export const HiveStateContext = createContext<HiveStateContextType | undefined>(undefined);

export function HiveStateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState("VECNA_MAIN_GRID");
  const [loading, setLoading] = useState(true);

  // Simulation metrics state
  const [onlineAgentCount, setOnlineAgentCount] = useState(24875);
  const [latency, setLatency] = useState(24);
  const [activeThreads, setActiveThreads] = useState(142);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "N1", title: "Intrusion Shield Active", message: "Supabase authentication guard successfully mounted.", type: "SUCCESS", isRead: false, timestamp: new Date().toISOString() },
    { id: "N2", title: "GPU Engine Online", message: "WebGL custom shader particles core running at 60fps.", type: "INFO", isRead: false, timestamp: new Date().toISOString() }
  ]);
  const [unreadCount, setUnreadCount] = useState(2);

  const addNotification = (title: string, message: string, type: Notification["type"]) => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);

    const newNotif: Notification = {
      id,
      title,
      message,
      type,
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const refreshUser = async () => {
    try {
      const activeUser = await ApiClient.auth.getUser();
      setUser(activeUser);
    } catch (err) {
      console.error("Failed to synchronize user session:", err);
    }
  };

  // 1. Mount user checking and trigger the mock background engines
  useEffect(() => {
    const init = async () => {
      await refreshUser();
      setLoading(false);
      
      const metrics = hiveSimulation.getMetrics();
      setOnlineAgentCount(metrics.onlineAgentCount);
      setLatency(metrics.latency);
      setActiveThreads(metrics.activeThreads);
      setAssignments(metrics.assignments);
      setDecisions(metrics.decisions);
      setLiveLogs(metrics.liveLogs);
      
      hiveSimulation.start();
    };

    init();

    return () => {
      hiveSimulation.stop();
    };
  }, []);

  // 2. Setup eventBus listener to synchronize simulated metrics on tick beats
  useEffect(() => {
    const handleTick = (data: any) => {
      setOnlineAgentCount(data.onlineAgentCount);
      setLatency(data.latency);
      setActiveThreads(data.activeThreads);
      setAssignments(data.assignments);
      setDecisions(data.decisions);
      setLiveLogs(data.liveLogs);
      
      // Randomly trigger mock events to make the notifications count react
      if (Math.random() < 0.12) {
        addNotification(
          "Automated System Alert",
          "Consensus voting tick registered on proposed overrides.",
          "INFO"
        );
      }
    };

    const unsubscribe = eventBus.on("HIVE_TICK", handleTick);
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <HiveStateContext.Provider
      value={{
        user,
        setUser,
        activeWorkspace,
        setActiveWorkspace,
        onlineAgentCount,
        latency,
        activeThreads,
        assignments,
        decisions,
        liveLogs,
        notifications,
        unreadCount,
        loading,
        addNotification,
        markNotificationsRead,
        clearNotifications,
        refreshUser
      }}
    >
      {children}
    </HiveStateContext.Provider>
  );
}
export default HiveStateProvider;
