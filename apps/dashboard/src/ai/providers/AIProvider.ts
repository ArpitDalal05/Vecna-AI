export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  text: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  modelUsed: string;
}

export interface AIProvider {
  generate(prompt: string, systemPrompt?: string, options?: GenerateOptions): Promise<LLMResponse>;
  stream(
    prompt: string,
    systemPrompt: string | undefined,
    onChunk: (text: string) => void,
    options?: GenerateOptions
  ): Promise<LLMResponse>;
}
