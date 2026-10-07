import { MissionTask } from "../../types";
import { logger } from "../../services/logging/logger";

export const taskDAG = {
  getReadyTasks(tasks: MissionTask[]): MissionTask[] {
    const completedTaskIds = new Set(
      tasks.filter(t => t.status === "COMPLETED").map(t => t.id || t.taskTitle)
    );

    return tasks.filter(task => {
      if (task.status !== "PENDING") return false;
      if (!task.dependencies || task.dependencies.length === 0) return true;

      // Check if all dependencies are satisfied
      const allSatisfied = task.dependencies.every(depId => completedTaskIds.has(depId));
      return allSatisfied;
    });
  },

  addReworkTask(params: {
    missionId: string;
    parentTaskId?: string;
    title: string;
    description: string;
    requiredCapabilities: string[];
    priority?: MissionTask["priority"];
  }): MissionTask {
    const { missionId, parentTaskId, title, description, priority = "HIGH" } = params;
    const taskId = `rework_${Math.random().toString(36).substring(2, 9)}`;

    const newTask: MissionTask = {
      id: taskId,
      missionId,
      agentId: "UNASSIGNED",
      taskTitle: title,
      description,
      status: "PENDING",
      priority,
      progress: 0,
      dependencies: parentTaskId ? [parentTaskId] : [],
      reasoning: `Targeted rework generated for issue in parent task ${parentTaskId || "system"}`
    };

    logger.info("TASK_DAG", "DYNAMIC_TASK_CREATED", `Created rework task "${title}" (${taskId})`);
    return newTask;
  }
};

export default taskDAG;
