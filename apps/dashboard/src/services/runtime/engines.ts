import { eventBus } from "./eventBus";
import { logger } from "../logging/logger";
import { systemMetricsTable, updateSystemMetric } from "../../mock/system";
import { agentsTable, updateAgentMetrics } from "../../mock/agents";
import { assignmentsTable, insertAssignmentTable, updateAssignmentTable } from "../../mock/runtime";
import { decisionsTable, updateDecisionTable } from "../../mock/organization";
import { insertNotification } from "../../mock/notifications";
import { appendAnalyticsPoint } from "../../mock/analytics";
import { cacheManager } from "../cache/cacheManager";

class HiveSimulationEngine {
  private tickInterval: NodeJS.Timeout | null = null;

  start() {
    if (this.tickInterval) return;

    logger.info("RUNTIME", "INITIALIZE", "Hive Mind OS Simulation Engine online");
    
    // Run simulation loop tick every 3 seconds
    this.tickInterval = setInterval(() => {
      this.tick();
    }, 3000);
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
      logger.info("RUNTIME", "TERMINATE", "Hive Mind OS Simulation Engine offline");
    }
  }

  private tick() {
    try {
      // 1. Core metric fluctuations inside mock database
      const currentCpu = systemMetricsTable.find(r => r.id === "cpu_usage")?.value || 45;
      const currentMemory = systemMetricsTable.find(r => r.id === "memory_usage")?.value || 85;
      const currentLatency = systemMetricsTable.find(r => r.id === "latency")?.value || 24;
      const currentBandwidth = systemMetricsTable.find(r => r.id === "bandwidth")?.value || 2.78;

      const cpuVal = Math.max(30, Math.min(95, currentCpu + (Math.random() * 8 - 4)));
      const memoryVal = Math.max(70, Math.min(98, currentMemory + (Math.random() * 2 - 1)));
      const latencyVal = Math.max(12, Math.min(95, currentLatency + (Math.random() * 6 - 3)));
      const bandwidthVal = Math.max(1.5, Math.min(4.5, currentBandwidth + (Math.random() * 0.4 - 0.2)));
      
      updateSystemMetric("cpu_usage", parseFloat(cpuVal.toFixed(1)));
      updateSystemMetric("memory_usage", parseFloat(memoryVal.toFixed(1)));
      updateSystemMetric("latency", Math.floor(latencyVal));
      updateSystemMetric("bandwidth", parseFloat(bandwidthVal.toFixed(2)));
      updateSystemMetric("health", parseFloat((100 - (latencyVal / 12)).toFixed(1)));

      // 2. Process tasks and progress rates inside mock runtime
      assignmentsTable.forEach(task => {
        if (task.status === "RUNNING") {
          const nextProgress = Math.min(100, task.progress + Math.floor(Math.random() * 12) + 4);
          const status = nextProgress === 100 ? "COMPLETED" : "RUNNING";
          updateAssignmentTable(task.id, {
            progress: nextProgress,
            status,
            completedAt: status === "COMPLETED" ? new Date().toISOString() : undefined
          });
        } else if (task.status === "PENDING" && Math.random() < 0.35) {
          updateAssignmentTable(task.id, { status: "RUNNING", progress: 10 });
        }
      });

      // Recycle and introduce new active tasks
      const activeTasks = assignmentsTable.filter(t => t.status === "RUNNING");
      if (activeTasks.length < 3) {
        const nextId = "A" + (assignmentsTable.length + 1);
        const mockTitles = [
          "Consolidate vector memory shards",
          "Balancing WebGL custom shaders vertex arrays",
          "Re-indexing local SQLite context storage",
          "Evaluating consensus status of Proposed overrides",
          "Resolving authorization token callbacks from Supabase"
        ];
        const newTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
        
        insertAssignmentTable({
          id: nextId,
          agentId: `AGENT_NODE_${Math.floor(Math.random() * 5) + 1}`,
          taskTitle: newTitle,
          status: "RUNNING",
          priority: Math.random() < 0.3 ? "CRITICAL" : "HIGH",
          progress: 10,
          startedAt: new Date().toISOString()
        });
      }

      // 3. Update proposed decisions and simulate voting
      decisionsTable.forEach(dec => {
        if (dec.status === "DEBATING") {
          const addedYes = Math.floor(Math.random() * 8);
          const addedNo = Math.floor(Math.random() * 3);
          const total = dec.yesVotes + dec.noVotes + addedYes + addedNo;
          const consensus = total > 0 
            ? parseFloat(((dec.yesVotes + addedYes) / total * 100).toFixed(1)) 
            : dec.consensusPercentage;
          
          updateDecisionTable(dec.id, {
            yesVotes: dec.yesVotes + addedYes,
            noVotes: dec.noVotes + addedNo,
            consensusPercentage: consensus,
            status: consensus > 92 && total > 580 ? "RESOLVED" : "DEBATING"
          });
        }
      });

      // 4. Randomly trigger notifications and inject into database
      if (Math.random() < 0.15) {
        const id = Math.random().toString(36).substring(2);
        insertNotification({
          id,
          title: "System Telemetry Event",
          message: "Consensus voting thresholds calculated for memory reallocation.",
          type: "INFO",
          isRead: false,
          timestamp: new Date().toISOString()
        });
      }

      // 5. Update agent metrics dynamically (heartbeat pings)
      agentsTable.forEach(agent => {
        if (agent.status === "ACTIVE") {
          const driftCpu = Math.max(10, Math.min(99, agent.cpuUsage + Math.floor(Math.random() * 10 - 5)));
          updateAgentMetrics(agent.id, { cpuUsage: driftCpu });
        }
      });

      // 6. Push a new history point to analytics table
      appendAnalyticsPoint({
        timestamp: new Date().toISOString(),
        cpu: cpuVal,
        memory: memoryVal,
        latency: latencyVal,
        bandwidth: bandwidthVal
      });

      // 7. Invalidate cache tags so repositories bypass cached values
      cacheManager.invalidate("system_metrics");
      cacheManager.invalidate("system_health");
      cacheManager.invalidate("runtime_assignments");
      cacheManager.invalidate("agents_list");
      cacheManager.invalidate("notifications_list");
      cacheManager.invalidate("org_decisions");
      cacheManager.invalidate("analytics_history");

      // 8. Emit event via Event Bus to update subscribers
      eventBus.emit("DATA_CHANGED");

    } catch (err) {
      console.error("Error in HiveSimulationEngine tick:", err);
    }
  }
}

export const hiveSimulation = new HiveSimulationEngine();
export default hiveSimulation;
