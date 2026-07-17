export interface ModelInfo {
  id: string;
  name: string;
  purpose: string;
  recommendedRole: string;
}

export const modelRegistry: Record<string, ModelInfo> = {
  planner: {
    id: "qwen/qwen3-coder-480b-a35b-instruct",
    name: "Qwen 3 Coder 480B",
    purpose: "Mission planning, Architecture, Task decomposition, Repository reasoning",
    recommendedRole: "Lead Planner"
  },
  backend: {
    id: "qwen/qwen3-coder-480b-a35b-instruct",
    name: "Qwen 3 Coder 480B",
    purpose: "Backend generation, APIs, TypeScript, Next.js, Database, Refactoring",
    recommendedRole: "Lead Backend Agent"
  },
  frontend: {
    id: "qwen/qwen3-coder-480b-a35b-instruct",
    name: "Qwen 3 Coder 480B",
    purpose: "React, Tailwind, Next.js, UI logic, Component generation",
    recommendedRole: "Lead Frontend Agent"
  },
  reviewer: {
    id: "nousresearch/hermes-3-405b-instruct",
    name: "Hermes 3 405B",
    purpose: "Code review, Quality scoring, Security review, Architecture validation",
    recommendedRole: "Code Reviewer"
  },
  research: {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    purpose: "Documentation, Research, Summaries, Technical explanations",
    recommendedRole: "Researcher"
  },
  documentation: {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    purpose: "Documentation generation, Architecture documents, Markdown creation",
    recommendedRole: "Documenter"
  },
  assistant: {
    id: "meta-llama/llama-3.2-3b-instruct",
    name: "Llama 3.2 3B",
    purpose: "Simple UI requests, Quick summaries, Small utility tasks",
    recommendedRole: "Assistant"
  },
  experimental: {
    id: "venice/venice-uncensored",
    name: "Venice Uncensored",
    purpose: "Experimental, Uncensored workflows (disabled by default)",
    recommendedRole: "Experimental Node"
  }
};

export function getModelForAgent(role: keyof typeof modelRegistry, enableExperimental = false): string {
  if (role === "experimental" && !enableExperimental) {
    return modelRegistry.assistant.id;
  }
  return modelRegistry[role]?.id || modelRegistry.assistant.id;
}
export default modelRegistry;
