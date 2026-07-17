import { createClient } from "../../lib/supabase/client";
import { FEATURE_FLAGS } from "../../config";
import { logger } from "../../services/logging/logger";

export interface AILogParams {
  agentId: string;
  missionId?: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  cost?: number;
  retryCount?: number;
  executionDuration?: number;
  status: "SUCCESS" | "WARNING" | "FAILURE";
}

export async function logAIExecution(params: AILogParams) {
  const totalTokens = params.promptTokens + params.completionTokens;
  const estimatedCost = params.cost ?? (params.promptTokens * 0.00000015 + params.completionTokens * 0.0000006);
  const retryCount = params.retryCount ?? 0;
  const duration = params.executionDuration ?? params.latencyMs;

  if (FEATURE_FLAGS.USE_MOCK_DATA) {
    logger.info(
      "AI_OBSERVABILITY",
      `EXECUTION_${params.status}`,
      `Agent ${params.agentId} executed ${params.model} via ${params.provider} in ${duration}ms. Retries: ${retryCount}. Tokens: ${totalTokens}. Cost: $${estimatedCost.toFixed(6)}`,
      {
        provider: params.provider,
        model: params.model,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens,
        latencyMs: params.latencyMs,
        executionDuration: duration,
        retryCount,
        estimatedCost,
        missionId: params.missionId
      }
    );
  } else {
    try {
      const supabase = createClient();
      await supabase.from("agent_logs").insert({
        agent_id: params.agentId,
        module: "AI_ORCHESTRATOR",
        action: `Execution via ${params.provider} (${params.model})`,
        status: params.status,
        payload: {
          provider: params.provider,
          model: params.model,
          prompt_tokens: params.promptTokens,
          completion_tokens: params.completionTokens,
          total_tokens: totalTokens,
          latency_ms: params.latencyMs,
          execution_duration: duration,
          retry_count: retryCount,
          estimated_cost: estimatedCost,
          mission_id: params.missionId
        }
      });
    } catch (err: any) {
      console.warn("Supabase agent_logs insert failed:", err);
      logger.info(
        "AI_OBSERVABILITY",
        `EXECUTION_${params.status}`,
        `Agent ${params.agentId} executed ${params.model} via ${params.provider} in ${duration}ms. Retries: ${retryCount}. Tokens: ${totalTokens}. Cost: $${estimatedCost.toFixed(6)}`,
        {
          provider: params.provider,
          model: params.model,
          promptTokens: params.promptTokens,
          completionTokens: params.completionTokens,
          totalTokens,
          latencyMs: params.latencyMs,
          executionDuration: duration,
          retryCount,
          estimatedCost,
          missionId: params.missionId
        }
      );
    }
  }
}
