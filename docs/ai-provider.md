# AI Provider Abstraction Layer

This document details the provider-agnostic interface, model fallback logic, and cost tracking.

---

## 1. Provider Interfaces

```typescript
export interface ILLMProvider {
  generate(prompt: string, options?: GenerateOptions): Promise<LLMResponse>;
  stream(prompt: string, onChunk: (text: string) => void): Promise<LLMResponse>;
}
```

Supported endpoints:
* **Anthropic**: Claude-3 Opus, Sonnet.
* **Google Gemini**: Gemini 1.5 Pro, Flash.
* **OpenAI**: GPT-4o, GPT-4.
* **Ollama**: Local execution fallback (Llama-3, Phi-3).

---

## 2. Fallback Routing & Token Accounting

On HTTP 429 (Rate Limits) or 503 (Server Errors), request handlers execute fallbacks automatically.
Accumulated token limits and API usage are registered inside the **AI Observability** logger.
