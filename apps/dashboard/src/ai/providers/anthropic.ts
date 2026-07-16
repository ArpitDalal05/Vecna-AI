import { AIProvider, GenerateOptions, LLMResponse } from "./AIProvider";

export class AnthropicProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(prompt: string, systemPrompt?: string, options?: GenerateOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = options?.model || "claude-3-5-sonnet-20241022";

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          system: systemPrompt,
          messages: [{ role: "user", content: prompt }],
          max_tokens: options?.maxTokens || 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API failed with status ${response.status}`);
      }

      const json = await response.json();
      const text = json.content[0]?.text || "";
      const promptTokens = json.usage?.input_tokens || 0;
      const completionTokens = json.usage?.output_tokens || 0;

      return {
        text,
        promptTokens,
        completionTokens,
        latencyMs: Date.now() - startTime,
        modelUsed: model,
      };
    } catch (err: any) {
      throw new Error(`Anthropic call failed: ${err.message}`);
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
