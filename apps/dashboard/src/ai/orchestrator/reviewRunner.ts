import { ProviderFactory } from "../providers/ProviderFactory";
import { FEATURE_FLAGS } from "../../config";
import { logger } from "../../services/logging/logger";
import { logAIExecution } from "./observability";
import { contextBuilder } from "../context/contextBuilder";

export interface ReviewResult {
  score: number;
  recommendations: string[];
  summary: string;
}

export const reviewRunner = {
  async runReviewerAgent(codeSuggestions: string): Promise<ReviewResult> {
    const defaultVal: ReviewResult = {
      score: 85,
      recommendations: ["Ensure robust connection pools", "Verify RLS Policies"],
      summary: "Simulation review: code looks solid but requires standard sandbox verification"
    };

    if (!FEATURE_FLAGS.USE_REAL_AI) {
      return defaultVal;
    }

    const provider = ProviderFactory.getProvider();
    if (!provider) {
      return defaultVal;
    }

    try {
      const systemPrompt = contextBuilder.buildSystemPrompt("reviewer");
      const userPrompt = contextBuilder.buildUserPrompt(`Review this code:\n${codeSuggestions}`, {
        workspace: "Engineering"
      });

      const res = await provider.generate(userPrompt, systemPrompt, {
        temperature: 0.2
      });

      await logAIExecution({
        agentId: "REVIEWER_AGENT",
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
      const recs = parsed.recommendations || parsed.issues || ["Check configurations"];
      const approvalText = parsed.approval !== undefined ? `Approval Status: ${parsed.approval}. ` : "";
      return {
        score: parsed.score || 90,
        recommendations: recs,
        summary: parsed.summary || `${approvalText}Review finished successfully.`
      };
    } catch (err: any) {
      await logAIExecution({
        agentId: "REVIEWER_AGENT",
        provider: provider ? provider.constructor.name : "UNKNOWN",
        model: "UNKNOWN",
        promptTokens: 0,
        completionTokens: 0,
        latencyMs: 0,
        status: "FAILURE"
      });
      logger.error("AI_ORCHESTRATOR", "REVIEW_RUNNER_FAIL", `Reviewer agent failed: ${err.message}`);
      return defaultVal;
    }
  }
};
export default reviewRunner;
