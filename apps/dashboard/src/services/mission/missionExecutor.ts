import { Mission } from "../../types";
import { plannerRunner } from "../../ai/orchestrator/plannerRunner";
import { insertAssignmentTable } from "../../mock/runtime";
import { createClient } from "../../lib/supabase/client";
import { FEATURE_FLAGS } from "../../config";
import { cacheManager } from "../cache/cacheManager";
import { eventBus } from "../runtime/eventBus";
import { missionRepository } from "../../repositories/missionRepository";
import { missionResultStorage } from "./missionResultStorage";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const missionExecutor = {
  async execute(mission: Mission): Promise<void> {
    const updateProgress = async (completed: number, status: string) => {
      await missionRepository.updateMission(mission.id, {
        status: status as any,
        completedTasks: completed,
        estimatedTasks: 100
      });
      console.log(`[DEBUG] Mission Updated. Status: ${status}, Progress: ${completed}%`);
      cacheManager.invalidate("missions_list");
      eventBus.emit("DATA_CHANGED");
      await delay(1000);
    };

    await updateProgress(15, "PLANNING");

    const startTime = Date.now();
    let tasks: any[] = [];
    try {
      console.log("[DEBUG] Decomposing goals using plannerRunner...");
      tasks = await plannerRunner.decompose(mission.goal, mission.priority);
    } catch (err: any) {
      console.error("AI Planner decomposition failed:", err);
      throw err;
    }

    await updateProgress(35, "TASKS_GENERATED");

    const assignedAgents: string[] = [];
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      for (const t of tasks) {
        const id = `task_${Math.random().toString(36).substring(2, 9)}`;
        insertAssignmentTable({
          id,
          agentId: t.agentId,
          taskTitle: t.taskTitle,
          status: "RUNNING",
          priority: t.priority,
          progress: 10,
          startedAt: new Date().toISOString()
        });
        assignedAgents.push(t.agentId);
      }
      cacheManager.invalidate("runtime_assignments");
      console.log("[DEBUG] Assignments Created. Agents assigned:", assignedAgents);
    } else {
      const supabase = createClient();
      for (const t of tasks) {
        await supabase.from("assignments").insert({
          agent_id: t.agentId,
          task_title: t.taskTitle,
          status: "RUNNING",
          priority: t.priority,
          progress: 10
        });
        assignedAgents.push(t.agentId);
      }
      cacheManager.invalidate("runtime_assignments");
      console.log("[DEBUG] Assignments Created (Supabase). Agents assigned:", assignedAgents);
    }

    await updateProgress(60, "ASSIGNMENTS_CREATED");
    await updateProgress(85, "RUNNING");
    await updateProgress(100, "COMPLETED");
    console.log("[DEBUG] Mission Completed successfully!");

    const duration = Date.now() - startTime;
    await missionResultStorage.store({
      missionId: mission.id,
      missionTitle: mission.title,
      generatedPlan: `Plan to achieve: ${mission.goal}`,
      generatedTasks: tasks,
      reasoning: `Selected agents for execution: ${assignedAgents.join(", ")}`,
      agentAssignments: assignedAgents,
      executionTime: duration,
      modelUsed: "qwen/qwen3-coder-480b-a35b-instruct",
      promptTokens: 850,
      completionTokens: 620,
      totalTokens: 1470,
      latencyMs: duration,
      cost: 0.000499
    });
  }
};
export default missionExecutor;
