import { AIProvider } from "./AIProvider";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";
import { OllamaProvider } from "./ollama";
import { OpenRouterProvider } from "./openrouter";

export class ProviderFactory {
  static getProvider(): AIProvider | null {
    const openaiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    const ollamaUrl = process.env.OLLAMA_BASE_URL || process.env.NEXT_PUBLIC_OLLAMA_BASE_URL;

    if (openaiKey) {
      return new OpenAIProvider(openaiKey);
    }
    if (geminiKey) {
      return new GeminiProvider(geminiKey);
    }
    if (anthropicKey) {
      return new AnthropicProvider(anthropicKey);
    }
    if (openrouterKey) {
      return new OpenRouterProvider(openrouterKey);
    }
    if (ollamaUrl) {
      return new OllamaProvider(ollamaUrl);
    }

    return null;
  }
}
export default ProviderFactory;
