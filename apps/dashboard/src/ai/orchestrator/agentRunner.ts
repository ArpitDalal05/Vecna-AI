import { ProviderFactory } from "../providers/ProviderFactory";
import { FEATURE_FLAGS } from "../../config";
import { getPrompt } from "../../prompts";
import { logger } from "../../services/logging/logger";
import { logAIExecution } from "./observability";

export interface AgentResult {
  plan: string;
  suggestions: string;
  architecture: string;
}

export const agentRunner = {
  async runBackendAgent(taskTitle: string): Promise<AgentResult> {
    const defaultVal: AgentResult = {
      plan: `Mock plan for task: ${taskTitle}`,
      suggestions: `Mock suggestions for task: ${taskTitle}`,
      architecture: `Mock architectural guidance for task: ${taskTitle}`
    };

    if (!FEATURE_FLAGS.USE_REAL_AI) {
      return defaultVal;
    }

    const provider = ProviderFactory.getProvider();
    if (!provider) {
      return defaultVal;
    }

    try {
      const systemPrompt = getPrompt("backend");
      const userPrompt = `Generate implementation plan, code suggestions, and architecture guidance for: "${taskTitle}"`;

      const res = await provider.generate(userPrompt, systemPrompt, {
        temperature: 0.7
      });

      await logAIExecution({
        agentId: "BACKEND_AGENT",
        provider: provider.constructor.name,
        model: res.modelUsed,
        promptTokens: res.promptTokens,
        completionTokens: res.completionTokens,
        latencyMs: res.latencyMs,
        status: "SUCCESS"
      });

      return {
        plan: `Plan: ${res.text.substring(0, 300)}...`,
        suggestions: res.text,
        architecture: `Architecture details for: ${taskTitle}`
      };
    } catch (err: any) {
      await logAIExecution({
        agentId: "BACKEND_AGENT",
        provider: provider ? provider.constructor.name : "UNKNOWN",
        model: "UNKNOWN",
        promptTokens: 0,
        completionTokens: 0,
        latencyMs: 0,
        status: "FAILURE"
      });
      logger.error("AI_ORCHESTRATOR", "AGENT_RUNNER_FAIL", `Backend agent failed: ${err.message}`);
      return defaultVal;
    }
  }
};
export default agentRunner;
