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

    console.log("[DEBUG] Planner Started decomposing goal:", goal);
    console.log("[DEBUG] Provider Selected:", provider.constructor.name);

    const systemPrompt = contextBuilder.buildSystemPrompt("planner");
    const userPrompt = contextBuilder.buildUserPrompt(`Decompose this goal: "${goal}" with priority ${priority}.
You MUST return a JSON object containing a "mission" field (string summary) and a "tasks" array.
Each task in the array must contain:
- "agent" (string identifier like "Synapse-01")
- "taskTitle" (string name/description of the task)
- "priority" (LOW, MEDIUM, HIGH, or CRITICAL)
- "dependencies" (array of strings)
- "estimatedDuration" (string)
- "reasoning" (string)
- "successCriteria" (string)

Return JSON ONLY. Do not wrap in extra commentary outside JSON.`, {
      workspace: "Engineering"
    });

    let retryAttempt = 0;
    while (retryAttempt <= 1) {
      try {
        const res = await provider.generate(userPrompt, systemPrompt, {
          temperature: 0.1,
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

        if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
          throw new Error("Missing 'tasks' array in planner response JSON schema.");
        }

        console.log("[DEBUG] Tasks Parsed successfully. Count:", parsed.tasks.length);

        logger.info("AI_ORCHESTRATOR", "PLANNER_SUCCESS", `Decomposed goal into ${parsed.tasks.length} tasks via ${res.modelUsed}`);
        return parsed.tasks.map((item: any) => ({
          agentId: item.agent || item.agentId || "Synapse-01",
          taskTitle: item.taskTitle || item.title || item.task || `Execute segment`,
          status: "PENDING" as const,
          priority: item.priority || priority,
          progress: 0,
          dependencies: item.dependencies || [],
          estimatedDuration: item.estimatedDuration || "2h",
          reasoning: item.reasoning || "",
          successCriteria: item.successCriteria || ""
        }));

      } catch (err: any) {
        retryAttempt++;
        if (retryAttempt > 1) {
          await logAIExecution({
            agentId: "PLANNER_AGENT",
            provider: provider.constructor.name,
            model: "UNKNOWN",
            promptTokens: 0,
            completionTokens: 0,
            latencyMs: 0,
            status: "FAILURE"
          });
          logger.error("AI_ORCHESTRATOR", "PLANNER_FAIL", `LLM planner failed: ${err.message}.`);
          throw new Error(`Planner failed JSON validation: ${err.message}`);
        }
        logger.warn("AI_ORCHESTRATOR", "PLANNER_RETRY", `Planner JSON parsing failed. Retrying... Error: ${err.message}`);
      }
    }

    throw new Error("Planner failed");
  }
};
export default plannerRunner;
