import { AIProvider, GenerateOptions, LLMResponse } from "./AIProvider";

export class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(prompt: string, systemPrompt?: string, options?: GenerateOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = options?.model || "gemini-1.5-flash";

    try {
      const contents = [];
      if (systemPrompt) {
        contents.push({ role: "user", parts: [{ text: `System instruction: ${systemPrompt}` }] });
      }
      contents.push({ role: "user", parts: [{ text: prompt }] });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: options?.temperature ?? 0.7,
              maxOutputTokens: options?.maxTokens || 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API failed with status ${response.status}`);
      }

      const json = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
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
      throw new Error(`Gemini call failed: ${err.message}`);
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
