import { eventBus } from "./eventBus";
import { logger } from "../logging/logger";
import { systemMetricsTable, updateSystemMetric } from "../../mock/system";
import { agentsTable, updateAgentMetrics } from "../../mock/agents";
import { assignmentsTable, insertAssignmentTable, updateAssignmentTable } from "../../mock/runtime";
import { decisionsTable, updateDecisionTable } from "../../mock/organization";
import { insertNotification } from "../../mock/notifications";
import { appendAnalyticsPoint } from "../../mock/analytics";
import { cacheManager } from "../cache/cacheManager";
import { FEATURE_FLAGS } from "../../config";
import { createClient } from "../../lib/supabase/client";

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

  private async tick() {
    try {
      // 1. Calculate next system metrics
      const currentCpu = systemMetricsTable.find(r => r.id === "cpu_usage")?.value || 45;
      const currentMemory = systemMetricsTable.find(r => r.id === "memory_usage")?.value || 85;
      const currentLatency = systemMetricsTable.find(r => r.id === "latency")?.value || 24;
      const currentBandwidth = systemMetricsTable.find(r => r.id === "bandwidth")?.value || 2.78;

      const cpuVal = Math.max(30, Math.min(95, currentCpu + (Math.random() * 8 - 4)));
      const memoryVal = Math.max(70, Math.min(98, currentMemory + (Math.random() * 2 - 1)));
      const latencyVal = Math.max(12, Math.min(95, currentLatency + (Math.random() * 6 - 3)));
      const bandwidthVal = Math.max(1.5, Math.min(4.5, currentBandwidth + (Math.random() * 0.4 - 0.2)));
      const healthVal = parseFloat((100 - (latencyVal / 12)).toFixed(1));

      // 2. Perform actions based on feature flag
      if (FEATURE_FLAGS.USE_MOCK_DATA) {
        // Update Local Mock database tables
        updateSystemMetric("cpu_usage", parseFloat(cpuVal.toFixed(1)));
        updateSystemMetric("memory_usage", parseFloat(memoryVal.toFixed(1)));
        updateSystemMetric("latency", Math.floor(latencyVal));
        updateSystemMetric("bandwidth", parseFloat(bandwidthVal.toFixed(2)));
        updateSystemMetric("health", healthVal);

        // Update assignments progress & state transitions
        assignmentsTable.forEach(task => {
          if (task.status === "RUNNING") {
            const nextProgress = Math.min(100, task.progress + Math.floor(Math.random() * 12) + 6);
            const status = nextProgress === 100 ? "COMPLETED" : "RUNNING";
            
            // Set associated agent state
            const targetAgent = agentsTable.find(a => a.id === task.agentId || a.name === task.agentId);
            if (targetAgent) {
              updateAgentMetrics(targetAgent.id, {
                status: status === "COMPLETED" ? "IDLE" : "ACTIVE",
                cpuUsage: status === "COMPLETED" ? 10 : Math.floor(cpuVal * 0.8)
              });
            }

            updateAssignmentTable(task.id, {
              progress: nextProgress,
              status,
              completedAt: status === "COMPLETED" ? new Date().toISOString() : undefined
            });

            // Trigger code review log when completed
            if (status === "COMPLETED") {
              const id = Math.random().toString(36).substring(2);
              insertNotification({
                id,
                title: "Code Review Completed",
                message: `Task "${task.taskTitle}" review completed. Code approved by reviewer agents.`,
                type: "SUCCESS",
                isRead: false,
                timestamp: new Date().toISOString()
              });
            }
          } else if (task.status === "PENDING" && Math.random() < 0.4) {
            updateAssignmentTable(task.id, { status: "RUNNING", progress: 10 });
            const targetAgent = agentsTable.find(a => a.id === task.agentId || a.name === task.agentId);
            if (targetAgent) {
              updateAgentMetrics(targetAgent.id, { status: "ACTIVE", cpuUsage: 45 });
            }
          }
        });

        // Recycle and introduce new active tasks
        const runningTasks = assignmentsTable.filter(t => t.status === "RUNNING");
        if (runningTasks.length < 3) {
          const nextId = "A" + (assignmentsTable.length + 1);
          const mockTitles = [
            "Audit repositories configurations",
            "Optimize memory caching pools",
            "Prune obsolete episodic vectors",
            "Consolidate consensus state parameters",
            "Sync auth redirection callbacks"
          ];
          const newTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
          const randomAgent = agentsTable[Math.floor(Math.random() * agentsTable.length)];

          insertAssignmentTable({
            id: nextId,
            agentId: randomAgent ? randomAgent.name : "Synapse-01",
            taskTitle: newTitle,
            status: "RUNNING",
            priority: Math.random() < 0.3 ? "CRITICAL" : "HIGH",
            progress: 10,
            startedAt: new Date().toISOString()
          });
        }

        // Simulate debate voting
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

            if (consensus > 92 && total > 580) {
              insertNotification({
                id: Math.random().toString(36).substring(2),
                title: "Consensus Resolved",
                message: `Decision "${dec.title}" passed with ${consensus}% consensus.`,
                type: "SUCCESS",
                isRead: false,
                timestamp: new Date().toISOString()
              });
            }
          }
        });

        // Append to local analytics
        appendAnalyticsPoint({
          timestamp: new Date().toISOString(),
          cpu: cpuVal,
          memory: memoryVal,
          latency: latencyVal,
          bandwidth: bandwidthVal
        });

      } else {
        // Real Supabase Mode - Write changes to Supabase tables!
        const supabase = createClient();

        const updates = [
          { metric_id: "cpu_usage", value: parseFloat(cpuVal.toFixed(1)) },
          { metric_id: "memory_usage", value: parseFloat(memoryVal.toFixed(1)) },
          { metric_id: "latency", value: Math.floor(latencyVal) },
          { metric_id: "bandwidth", value: parseFloat(bandwidthVal.toFixed(2)) },
          { metric_id: "health", value: healthVal }
        ];

        for (const item of updates) {
          await supabase.from("runtime_metrics").update({ value: item.value, updated_at: new Date().toISOString() }).eq("metric_id", item.metric_id);
        }

        // Fetch running assignments and increment progress
        const { data: assignments } = await supabase.from("assignments").select("*");
        if (assignments) {
          for (const task of assignments) {
            if (task.status === "RUNNING") {
              const nextProgress = Math.min(100, Number(task.progress) + Math.floor(Math.random() * 12) + 6);
              const status = nextProgress === 100 ? "COMPLETED" : "RUNNING";
              
              await supabase.from("assignments").update({
                progress: nextProgress,
                status,
                completed_at: status === "COMPLETED" ? new Date().toISOString() : null
              }).eq("id", task.id);

              if (status === "COMPLETED") {
                await supabase.from("notifications").insert({
                  title: "Code Review Completed",
                  message: `Task "${task.task_title}" review completed. Code approved by reviewer agents.`,
                  type: "SUCCESS",
                  is_read: false
                });
              }
            } else if (task.status === "PENDING" && Math.random() < 0.4) {
              await supabase.from("assignments").update({ status: "RUNNING", progress: 10 }).eq("id", task.id);
            }
          }
        }

        // Update proposed decisions voting in database
        const { data: decisions } = await supabase.from("decisions").select("*");
        if (decisions) {
          for (const dec of decisions) {
            if (dec.status === "DEBATING") {
              const addedYes = Math.floor(Math.random() * 8);
              const addedNo = Math.floor(Math.random() * 3);
              const total = Number(dec.yes_votes) + Number(dec.no_votes) + addedYes + addedNo;
              const consensus = total > 0 
                ? parseFloat(((Number(dec.yes_votes) + addedYes) / total * 100).toFixed(1)) 
                : Number(dec.consensus_percentage);

              const resolved = consensus > 92 && total > 580;

              await supabase.from("decisions").update({
                yes_votes: Number(dec.yes_votes) + addedYes,
                no_votes: Number(dec.no_votes) + addedNo,
                consensus_percentage: consensus,
                status: resolved ? "RESOLVED" : "DEBATING"
              }).eq("id", dec.id);

              if (resolved) {
                await supabase.from("notifications").insert({
                  title: "Consensus Resolved",
                  message: `Decision "${dec.title}" passed with ${consensus}% consensus.`,
                  type: "SUCCESS",
                  is_read: false
                });
              }
            }
          }
        }

        // Save to analytics log table
        await supabase.from("analytics").insert({
          timestamp: new Date().toISOString(),
          cpu: cpuVal,
          memory: memoryVal,
          latency: latencyVal,
          bandwidth: bandwidthVal
        });
      }

      // Flush local repository cache stores
      cacheManager.invalidate("system_metrics");
      cacheManager.invalidate("system_health");
      cacheManager.invalidate("runtime_assignments");
      cacheManager.invalidate("agents_list");
      cacheManager.invalidate("notifications_list");
      cacheManager.invalidate("org_decisions");
      cacheManager.invalidate("analytics_history");

      // Notify clients
      eventBus.emit("DATA_CHANGED");

    } catch (err) {
      console.error("Error in HiveSimulationEngine tick:", err);
    }
  }
}

export const hiveSimulation = new HiveSimulationEngine();
export default hiveSimulation;
