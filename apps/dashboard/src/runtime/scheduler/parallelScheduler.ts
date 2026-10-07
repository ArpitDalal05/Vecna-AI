import { MissionTask, AgentCapability } from "../../types";
import { taskDAG } from "./taskDAG";
import { teamRegistry } from "../../ai/agents/teamRegistry";
import { fileLocking } from "./fileLocking";
import { executionLog } from "../execution/executionLog";
import { eventBus } from "../../services/runtime/eventBus";
import { logger } from "../../services/logging/logger";

export const parallelScheduler = {
  maxParallelTasks: 4,

  async dispatchParallelBatch<T>(
    tasks: MissionTask[],
    missionId: string,
    executeTaskFn: (task: MissionTask, assignedAgentId: string) => Promise<T>
  ): Promise<Array<{ task: MissionTask; result?: T; error?: any }>> {
    const readyTasks = taskDAG.getReadyTasks(tasks);

    if (readyTasks.length === 0) {
      return [];
    }

    const batchToRun = readyTasks.slice(0, this.maxParallelTasks);

    logger.info("PARALLEL_SCHEDULER", "BATCH_DISPATCH", `Dispatching parallel execution batch of ${batchToRun.length} tasks for mission ${missionId}`);
    executionLog.record({
      missionId,
      agent: "PARALLEL_SCHEDULER",
      event: "PARALLEL_BATCH_STARTED",
      metadata: { count: batchToRun.length, taskTitles: batchToRun.map(t => t.taskTitle) }
    });

    const executionPromises = batchToRun.map(async (task) => {
      // Determine required capabilities based on task title/type
      const titleLower = task.taskTitle.toLowerCase();
      let reqCaps: AgentCapability[] = ["BACKEND"];
      if (titleLower.includes("frontend") || titleLower.includes("ui")) reqCaps = ["FRONTEND"];
      else if (titleLower.includes("database") || titleLower.includes("schema") || titleLower.includes("sql")) reqCaps = ["DATABASE"];
      else if (titleLower.includes("test")) reqCaps = ["TESTING"];
      else if (titleLower.includes("integration") || titleLower.includes("api")) reqCaps = ["INTEGRATION"];

      // Select best capability-matched agent
      const agent = teamRegistry.findBestAgentForCapabilities(reqCaps);
      task.assignedAgentId = agent.id;
      teamRegistry.setAgentStatus(agent.id, "BUSY", task.id);

      executionLog.record({
        missionId,
        taskId: task.id,
        agent: agent.id,
        event: "TASK_ASSIGNED",
        metadata: { role: agent.role, capabilities: agent.capabilities }
      });

      // File locking check if target artifact is specified
      const targetFile = task.targetArtifact || "";
      if (targetFile) {
        const acquired = fileLocking.acquireLock(targetFile, agent.id, task.id, missionId);
        if (!acquired) {
          logger.warn("PARALLEL_SCHEDULER", "LOCK_WAIT", `Task ${task.taskTitle} waiting for file lock on ${targetFile}`);
        }
      }

      task.status = "RUNNING";
      eventBus.emit("DATA_CHANGED");

      try {
        const result = await executeTaskFn(task, agent.id);
        task.status = "COMPLETED";
        teamRegistry.setAgentStatus(agent.id, "IDLE");

        if (targetFile) {
          fileLocking.releaseLock(targetFile, agent.id, missionId, task.id);
        }

        return { task, result };
      } catch (err: any) {
        task.status = "FAILED";
        teamRegistry.setAgentStatus(agent.id, "IDLE");

        if (targetFile) {
          fileLocking.releaseLock(targetFile, agent.id, missionId, task.id);
        }

        return { task, error: err };
      }
    });

    const results = await Promise.allSettled(executionPromises);

    executionLog.record({
      missionId,
      agent: "PARALLEL_SCHEDULER",
      event: "PARALLEL_BATCH_COMPLETED",
      metadata: { count: batchToRun.length }
    });

    return results.map((res, index) => {
      if (res.status === "fulfilled") {
        return res.value;
      } else {
        return { task: batchToRun[index], error: res.reason };
      }
    });
  }
};

export default parallelScheduler;
