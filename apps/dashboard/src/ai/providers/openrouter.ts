import { AIProvider, GenerateOptions, LLMResponse } from "./AIProvider";

export class OpenRouterProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(prompt: string, systemPrompt?: string, options?: GenerateOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = options?.model || "meta-llama/llama-3-8b-instruct:free";

    try {
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens || 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API failed with status ${response.status}`);
      }

      const json = await response.json();
      const text = json.choices[0]?.message?.content || "";
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
      throw new Error(`OpenRouter call failed: ${err.message}`);
    }
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
