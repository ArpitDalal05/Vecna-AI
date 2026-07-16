import { Mission, Assignment } from "../../types";
import { plannerRunner } from "../../ai/orchestrator/plannerRunner";
import { insertAssignmentTable } from "../../mock/runtime";
import { createClient } from "../../lib/supabase/client";
import { FEATURE_FLAGS } from "../../config";
import { cacheManager } from "../cache/cacheManager";
import { eventBus } from "../runtime/eventBus";

export const missionExecutor = {
  async execute(mission: Mission): Promise<void> {
    const tasks = await plannerRunner.decompose(mission.goal, mission.priority);
    
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      for (const t of tasks) {
        insertAssignmentTable({
          id: Math.random().toString(36).substring(2, 9),
          agentId: t.agentId,
          taskTitle: t.taskTitle,
          status: "RUNNING",
          priority: t.priority,
          progress: 10,
          startedAt: new Date().toISOString()
        });
      }
      cacheManager.invalidate("runtime_assignments");
      eventBus.emit("DATA_CHANGED");
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
      }
      cacheManager.invalidate("runtime_assignments");
      eventBus.emit("DATA_CHANGED");
    }
  }
};
