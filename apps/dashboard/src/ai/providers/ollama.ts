import { AIProvider, GenerateOptions, LLMResponse } from "./AIProvider";

export class OllamaProvider implements AIProvider {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl || "http://localhost:11434";
  }

  async generate(prompt: string, systemPrompt?: string, options?: GenerateOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = options?.model || "llama3";

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt,
          system: systemPrompt,
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens || 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API failed with status ${response.status}`);
      }

      const json = await response.json();
      const text = json.response || "";
      const promptTokens = Math.floor(prompt.length / 4);
      const completionTokens = Math.floor(text.length / 4);

      return {
        text,
        promptTokens,
        completionTokens,
        latencyMs: Date.now() - startTime,
        modelUsed: model,
      };
    } catch (err: any) {
      throw new Error(`Ollama call failed: ${err.message}`);
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
