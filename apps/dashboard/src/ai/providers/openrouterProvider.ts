import { AIProvider, GenerateOptions, LLMResponse } from "./AIProvider";
import { aiConfigManager } from "../aiConfig";

export class OpenRouterProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    const config = aiConfigManager.getConfig();
    this.apiKey = apiKey || config.openrouterApiKey;
    this.baseUrl = baseUrl || config.openrouterBaseUrl || "https://openrouter.ai/api/v1";
  }

  async generate(prompt: string, systemPrompt?: string, options?: GenerateOptions): Promise<LLMResponse> {
    const config = aiConfigManager.getConfig();
    const model = options?.model || config.defaultModel || "qwen/qwen3-coder-480b-a35b-instruct";
    const temperature = options?.temperature ?? config.temperature;
    const maxTokens = options?.maxTokens || config.maxTokens;

    let attempts = 0;
    const maxAttempts = config.retryCount || 3;
    let lastError: any = null;

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

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
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

        if (response.status === 429) {
          const delay = Math.pow(2, attempts) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        if (!response.ok) {
          throw new Error(`OpenRouter API status ${response.status}: ${await response.text()}`);
        }

        const json = await response.json();
        const text = json.choices?.[0]?.message?.content || "";
        const promptTokens = json.usage?.prompt_tokens || 0;
        const completionTokens = json.usage?.completion_tokens || 0;

        return {
          text,
          promptTokens,
          completionTokens,
          latencyMs: Date.now() - startTime,
          modelUsed: model,
        };
      } catch (err: any) {
        lastError = err;
        const delay = Math.pow(2, attempts) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`OpenRouter API failed after ${maxAttempts} attempts. Last error: ${lastError?.message}`);
  }

  async stream(
    prompt: string,
    systemPrompt: string | undefined,
    onChunk: (text: string) => void,
    options?: GenerateOptions
  ): Promise<LLMResponse> {
    const res = await this.generate(prompt, systemPrompt, options);
    onChunk(res.text);
    return res;
  }
}
export default OpenRouterProvider;
