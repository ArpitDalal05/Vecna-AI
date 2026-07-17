import { AIProvider, GenerateOptions, LLMResponse } from "./AIProvider";
import { aiConfigManager } from "../aiConfig";
import { modelHealthMonitor } from "../health/modelHealthMonitor";
import { usageManager } from "../limits/usageManager";
import { eventBus } from "../../services/runtime/eventBus";
import { logger } from "../../services/logging/logger";

const FALLBACK_CHAINS: Record<string, string[]> = {
  "qwen/qwen3-coder-480b-a35b-instruct": [
    "qwen/qwen3-coder-480b-a35b-instruct",
    "meta-llama/llama-3.3-70b-instruct",
    "nousresearch/hermes-3-405b-instruct"
  ],
  "nousresearch/hermes-3-405b-instruct": [
    "nousresearch/hermes-3-405b-instruct",
    "qwen/qwen3-coder-480b-a35b-instruct",
    "meta-llama/llama-3.3-70b-instruct"
  ],
  "meta-llama/llama-3.3-70b-instruct": [
    "meta-llama/llama-3.3-70b-instruct",
    "qwen/qwen3-coder-480b-a35b-instruct",
    "nousresearch/hermes-3-405b-instruct"
  ],
  "meta-llama/llama-3.2-3b-instruct": [
    "meta-llama/llama-3.2-3b-instruct",
    "meta-llama/llama-3.3-70b-instruct",
    "qwen/qwen3-coder-480b-a35b-instruct"
  ]
};

export class OpenRouterProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    const config = aiConfigManager.getConfig();
    this.apiKey = apiKey || (config.currentKeyIndex === 0 ? config.openrouterApiKey : config.backupOpenrouterApiKey || config.openrouterApiKey);
    this.baseUrl = baseUrl || config.openrouterBaseUrl || "https://openrouter.ai/api/v1";
  }

  async generate(prompt: string, systemPrompt?: string, options?: GenerateOptions): Promise<LLMResponse> {
    const config = aiConfigManager.getConfig();
    const primaryModel = options?.model || config.defaultModel || "qwen/qwen3-coder-480b-a35b-instruct";
    const temperature = options?.temperature ?? config.temperature;
    const maxTokens = options?.maxTokens || config.maxTokens;

    const usageCheck = usageManager.acquireRequest("agent_node");
    if (!usageCheck.allowed) {
      throw new Error(`Usage block: ${usageCheck.reason}`);
    }

    const modelChain = FALLBACK_CHAINS[primaryModel] || [primaryModel];
    let lastError: any = null;

    eventBus.emit("AI_REQUEST_STARTED", { model: primaryModel });

    for (const model of modelChain) {
      if (!modelHealthMonitor.isModelHealthy(model)) {
        continue;
      }

      let attempts = 0;
      const maxAttempts = config.retryCount || 3;

      while (attempts < maxAttempts) {
        attempts++;
        const startTime = Date.now();

        try {
          const messages = [];
          if (systemPrompt) {
            messages.push({ role: "system", content: systemPrompt });
          }
          messages.push({ role: "user", content: prompt });

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 15000);

          const activeKey = config.currentKeyIndex === 0 
            ? (config.openrouterApiKey || this.apiKey)
            : (config.backupOpenrouterApiKey || config.openrouterApiKey || this.apiKey);

          const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${activeKey}`,
            },
            body: JSON.stringify({
              model,
              messages,
              temperature,
              max_tokens: maxTokens,
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.status === 429 || response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504) {
            if (config.backupOpenrouterApiKey) {
              const nextIndex = config.currentKeyIndex === 0 ? 1 : 0;
              aiConfigManager.saveConfig({ currentKeyIndex: nextIndex });
              eventBus.emit("PROVIDER_SWITCHED", { keyIndex: nextIndex });
            }

            const delay = Math.pow(2, attempts) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }

          const json = await response.json();
          const text = json.choices?.[0]?.message?.content || "";
          const promptTokens = json.usage?.prompt_tokens || 0;
          const completionTokens = json.usage?.completion_tokens || 0;

          const latencyMs = Date.now() - startTime;
          modelHealthMonitor.recordSuccess(model, latencyMs);
          usageManager.releaseRequest(promptTokens + completionTokens);

          eventBus.emit("AI_REQUEST_COMPLETED", { model, latencyMs, cost: (promptTokens * 0.00000015 + completionTokens * 0.0000006) });

          return {
            text,
            promptTokens,
            completionTokens,
            latencyMs,
            modelUsed: model,
          };

        } catch (err: any) {
          lastError = err;
          modelHealthMonitor.recordFailure(model);
          eventBus.emit("AI_REQUEST_FAILED", { model, error: err.message });
          
          const delay = Math.pow(2, attempts) * 500;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    usageManager.releaseRequest(0);
    throw new Error(`AI Request failed on all model fallback chains. Last error: ${lastError?.message}`);
  }

  async stream(
    prompt: string,
    systemPrompt: string | undefined,
    onChunk: (text: string) => void,
    options?: GenerateOptions
  ): Promise<LLMResponse> {
    eventBus.emit("AI_REQUEST_STREAMING");
    const res = await this.generate(prompt, systemPrompt, options);
    onChunk(res.text);
    return res;
  }
}
export default OpenRouterProvider;
