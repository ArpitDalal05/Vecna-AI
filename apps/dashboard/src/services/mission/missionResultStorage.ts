import { createClient } from "../../lib/supabase/client";
import { FEATURE_FLAGS } from "../../config";
import { logger } from "../logging/logger";

export interface MissionResult {
  missionId: string;
  missionTitle: string;
  generatedPlan: string;
  generatedTasks: any[];
  reasoning: string;
  agentAssignments: string[];
  executionTime: number;
  modelUsed: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  cost: number;
}

export const mockMissionResultsStore: Map<string, MissionResult> = new Map();

export const missionResultStorage = {
  async store(result: MissionResult): Promise<void> {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      mockMissionResultsStore.set(result.missionId, result);
      logger.info("MISSION_OBSERVABILITY", "RESULT_STORED_MOCK", `Stored mission results for "${result.missionTitle}" in memory.`);
    } else {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("mission_results").insert({
          mission_id: result.missionId,
          plan: result.generatedPlan,
          tasks: result.generatedTasks,
          reasoning: result.reasoning,
          assignments: result.agentAssignments,
          model_used: result.modelUsed,
          prompt_tokens: result.promptTokens,
          completion_tokens: result.completionTokens,
          total_tokens: result.totalTokens,
          latency_ms: result.latencyMs,
          cost: result.cost,
          duration: result.executionTime
        });
        if (error) {
          throw new Error(error.message);
        }
        logger.info("MISSION_OBSERVABILITY", "RESULT_STORED_DB", `Stored mission results for "${result.missionTitle}" in Supabase.`);
      } catch (err: any) {
        console.warn("Could not insert to public.mission_results, saving to memory instead:", err.message);
        mockMissionResultsStore.set(result.missionId, result);
      }
    }
  },

  get(missionId: string): MissionResult | undefined {
    return mockMissionResultsStore.get(missionId);
  }
};
export default missionResultStorage;
