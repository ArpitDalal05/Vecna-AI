import { createClient } from "../../lib/supabase/client";
import { User, Assignment, Decision, HiveEvent, Employee, Department } from "../../types";
import { systemMetricsTable } from "../../mock/system";
import { assignmentsTable } from "../../mock/runtime";
import { employeesTable, departmentsTable, decisionsTable } from "../../mock/organization";

const supabase = createClient();

export const ApiClient = {
  auth: {
    async getUser(): Promise<User | null> {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return {
        id: user.id,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || "Hive Overlord",
        designation: user.user_metadata?.designation || "Administrator",
        role: user.user_metadata?.role || "ADMINISTRATOR",
        createdAt: user.created_at,
      };
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    async updateProfile(fullName: string, designation: string) {
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName, 
          designation: designation 
        }
      });
      if (error) throw error;
      return data;
    }
  },

  dashboard: {
    getMetrics() {
      const latency = systemMetricsTable.find(r => r.id === "latency")?.value || 24;
      const cpu = systemMetricsTable.find(r => r.id === "cpu_usage")?.value || 42;
      return {
        onlineAgentCount: 24875,
        latency,
        activeThreads: Math.floor(cpu * 1.4) + 40,
        assignments: assignmentsTable,
        decisions: decisionsTable,
        liveLogs: []
      };
    }
  },

  runtime: {
    getAssignments(): Assignment[] {
      return assignmentsTable;
    }
  },

  employees: {
    getEmployees(): Employee[] {
      return [
        { id: "E1", fullName: "Synapse-01", designation: "Knowledge Architect", departmentId: "D1", status: "ACTIVE", reliabilityRating: 98, createdAt: new Date().toISOString() },
        { id: "E2", fullName: "Mem-04", designation: "Episodic Logger", departmentId: "D2", status: "ACTIVE", reliabilityRating: 95, createdAt: new Date().toISOString() },
        { id: "E3", fullName: "Decide-02", designation: "Consensus Manager", departmentId: "D3", status: "IDLE", reliabilityRating: 99, createdAt: new Date().toISOString() },
        { id: "E4", fullName: "Graph-07", designation: "Security Auditor", departmentId: "D1", status: "ACTIVE", reliabilityRating: 97, createdAt: new Date().toISOString() }
      ];
    }
  },

  organization: {
    getDepartments(): Department[] {
      return [
        { id: "D1", name: "Cognition Core", description: "Core agent reasoning and thought pathways", createdAt: new Date().toISOString() },
        { id: "D2", name: "Distributed Memory", description: "Episodic, semantic, and vector database managers", createdAt: new Date().toISOString() },
        { id: "D3", name: "Hive Consensus", description: "Agent voting and debate protocol pipelines", createdAt: new Date().toISOString() }
      ];
    }
  },

  memory: {
    getKnowledgeBase() {
      return [
        { id: "K1", topic: "WebGL Shader Pipelines", category: "Shaders", difficulty: "High" },
        { id: "K2", topic: "Consensus Agreement Protocols", category: "Decisions", difficulty: "Medium" },
        { id: "K3", topic: "Episodic Vector Clustering", category: "Memory", difficulty: "Critical" }
      ];
    }
  },

  workflows: {
    getWorkflows() {
      return [
        { id: "W1", name: "Code Review debate", status: "ACTIVE" },
        { id: "W2", name: "WebGL shader compile pipeline", status: "COMPLETED" },
        { id: "W3", name: "Supabase auth sync session", status: "IDLE" }
      ];
    }
  },

  events: {
    getEvents(): HiveEvent[] {
      return [
        { id: "EV1", type: "RUNTIME", message: "WebGL custom shader sphere compilation OK", severity: "INFO", timestamp: new Date().toISOString() },
        { id: "EV2", type: "SYSTEM", message: "Global event bus listeners synchronized", severity: "INFO", timestamp: new Date().toISOString() },
        { id: "EV3", type: "AUTH", message: "User session authenticated on dashboard route guard", severity: "INFO", timestamp: new Date().toISOString() }
      ];
    }
  },

  decisions: {
    getProposedDecisions(): Decision[] {
      return decisionsTable;
    }
  }
};

export default ApiClient;
