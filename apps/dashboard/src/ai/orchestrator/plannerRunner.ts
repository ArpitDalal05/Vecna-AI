import { ProviderFactory } from "../providers/ProviderFactory";
import { FEATURE_FLAGS } from "../../config";
import { planner } from "../../services/mission/planner";
import { Assignment } from "../../types";
import { logger } from "../../services/logging/logger";
import { logAIExecution } from "./observability";
import { contextBuilder } from "../context/contextBuilder";

export const plannerRunner = {
  async decompose(goal: string, priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): Promise<Omit<Assignment, "id" | "startedAt">[]> {
    if (!FEATURE_FLAGS.USE_REAL_AI) {
      logger.info("AI_ORCHESTRATOR", "PLANNER_SIMULATION", "USE_REAL_AI is disabled. Running simulated planner.");
      return planner.decompose(goal, priority);
    }

    const provider = ProviderFactory.getProvider();
    if (!provider) {
      logger.warn("AI_ORCHESTRATOR", "PLANNER_FALLBACK", "No active LLM provider found. Falling back to simulated planner.");
      return planner.decompose(goal, priority);
    }

    try {
      const systemPrompt = contextBuilder.buildSystemPrompt("planner");
      const userPrompt = contextBuilder.buildUserPrompt(`Decompose this goal: "${goal}" with priority ${priority}`, {
        workspace: "Engineering"
      });

      const res = await provider.generate(userPrompt, systemPrompt, {
        temperature: 0.2,
      });

      await logAIExecution({
        agentId: "PLANNER_AGENT",
        provider: provider.constructor.name,
        model: res.modelUsed,
        promptTokens: res.promptTokens,
        completionTokens: res.completionTokens,
        latencyMs: res.latencyMs,
        status: "SUCCESS"
      });

      let cleaned = res.text.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      const parsed = JSON.parse(cleaned);
      let tasksArray: any[] = [];
      if (Array.isArray(parsed)) {
        tasksArray = parsed;
      } else if (parsed && Array.isArray(parsed.tasks)) {
        tasksArray = parsed.tasks;
      } else {
        throw new Error("Parsed result is not in structured format");
      }

      logger.info("AI_ORCHORSTRATOR", "PLANNER_SUCCESS", `Decomposed goal into ${tasksArray.length} tasks via ${res.modelUsed}`);
      return tasksArray.map((item: any) => ({
        agentId: item.agentId || "Synapse-01",
        taskTitle: item.taskTitle || `Execute objective segment`,
        status: "PENDING" as const,
        priority: item.priority || priority,
        progress: 0
      }));
    } catch (err: any) {
      await logAIExecution({
        agentId: "PLANNER_AGENT",
        provider: provider ? provider.constructor.name : "UNKNOWN",
        model: "UNKNOWN",
        promptTokens: 0,
        completionTokens: 0,
        latencyMs: 0,
        status: "FAILURE"
      });
      logger.error("AI_ORCHESTRATOR", "PLANNER_FAIL", `LLM planner failed: ${err.message}. Falling back to simulated planner.`);
      return planner.decompose(goal, priority);
    }
  }
};
export default plannerRunner;
