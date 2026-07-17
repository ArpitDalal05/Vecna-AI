import { AIProvider } from "./AIProvider";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";
import { OllamaProvider } from "./ollama";
import { OpenRouterProvider } from "./openrouterProvider";
import { aiConfigManager } from "../aiConfig";

export class ProviderFactory {
  static getProvider(): AIProvider | null {
    const config = aiConfigManager.getConfig();

    if (!config.useRealAi) {
      return null;
    }

    if (config.openrouterApiKey) {
      return new OpenRouterProvider(config.openrouterApiKey, config.openrouterBaseUrl);
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (openrouterKey) {
      return new OpenRouterProvider(openrouterKey);
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || config.geminiApiKey;
    if (geminiKey) {
      return new GeminiProvider(geminiKey);
    }

    return null;
  }
}
export default ProviderFactory;
