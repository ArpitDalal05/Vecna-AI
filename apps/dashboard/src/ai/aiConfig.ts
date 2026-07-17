export interface AIConfig {
  openrouterApiKey: string;
  backupOpenrouterApiKey: string;
  currentKeyIndex: number;
  keyFailures: number;
  providerPriority: string[];
  openrouterBaseUrl: string;
  geminiApiKey: string;
  defaultModel: string;
  enableStreaming: boolean;
  useMockData: boolean;
  useRealAi: boolean;
  timeoutMs: number;
  retryCount: number;
  temperature: number;
  maxTokens: number;
  enableExperimentalModel: boolean;
}

const DEFAULT_CONFIG: AIConfig = {
  openrouterApiKey: "",
  backupOpenrouterApiKey: "",
  currentKeyIndex: 0,
  keyFailures: 0,
  providerPriority: ["openrouter", "gemini"],
  openrouterBaseUrl: "https://openrouter.ai/api/v1",
  geminiApiKey: "",
  defaultModel: "qwen/qwen3-coder-480b-a35b-instruct",
  enableStreaming: true,
  useMockData: false,
  useRealAi: true,
  timeoutMs: 15000,
  retryCount: 3,
  temperature: 0.7,
  maxTokens: 2048,
  enableExperimentalModel: false
};

export const aiConfigManager = {
  getConfig(): AIConfig {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    const stored = localStorage.getItem("vecna_ai_config");
    const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";
    const backupKey = process.env.BACKUP_OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_BACKUP_OPENROUTER_API_KEY || "";
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    const baseConfig = {
      ...DEFAULT_CONFIG,
      openrouterApiKey: openrouterKey,
      backupOpenrouterApiKey: backupKey,
      geminiApiKey: geminiKey
    };

    if (!stored) {
      localStorage.setItem("vecna_ai_config", JSON.stringify(baseConfig));
      return baseConfig;
    }
    try {
      return { ...baseConfig, ...JSON.parse(stored) };
    } catch {
      return baseConfig;
    }
  },

  saveConfig(updates: Partial<AIConfig>) {
    if (typeof window === "undefined") return;
    const current = this.getConfig();
    const updated = { ...current, ...updates };
    localStorage.setItem("vecna_ai_config", JSON.stringify(updated));
    window.dispatchEvent(new Event("vecna_ai_config_changed"));
  }
};
export default aiConfigManager;
