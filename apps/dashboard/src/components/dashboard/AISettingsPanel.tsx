import React, { useState, useEffect } from "react";
import { aiConfigManager, AIConfig } from "../../ai/aiConfig";
import { modelRegistry } from "../../ai/modelRegistry";

export default function AISettingsPanel() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [status, setStatus] = useState<"Connected" | "Offline">("Offline");
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    setConfig(aiConfigManager.getConfig());
  }, []);

  useEffect(() => {
    if (config?.openrouterApiKey) {
      setStatus("Connected");
    } else {
      setStatus("Offline");
    }
  }, [config]);

  if (!config) return null;

  const handleSave = (updates: Partial<AIConfig>) => {
    aiConfigManager.saveConfig(updates);
    setConfig(aiConfigManager.getConfig());
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[8px] tracking-[0.25em] text-violet uppercase font-semibold">INTELLIGENCE CONTROL</span>
        <h1 className="font-sans text-2xl font-black text-white tracking-tight uppercase">AI Settings // swarm</h1>
        <p className="text-xs text-zinc-400 leading-relaxed">Configure API routes, models registries, context thresholds, and streaming pipelines.</p>
      </div>

      {savedMessage && (
        <div className="p-3 rounded-lg border border-green-900 bg-green-950/20 text-green-400 font-mono text-[9px] uppercase tracking-wider">
          [OK] Swarm configuration updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-2 p-6 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-md flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">OpenRouter API Key</label>
            <input
              type="password"
              value={config.openrouterApiKey}
              onChange={(e) => handleSave({ openrouterApiKey: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none focus:border-violet/60"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">Default Model</label>
            <select
              value={config.defaultModel}
              onChange={(e) => handleSave({ defaultModel: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none"
            >
              {Object.entries(modelRegistry).map(([key, value]) => (
                <option key={key} value={value.id}>
                  {value.name} ({value.recommendedRole})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={config.temperature}
                onChange={(e) => handleSave({ temperature: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">Max Output Tokens</label>
              <input
                type="number"
                value={config.maxTokens}
                onChange={(e) => handleSave({ maxTokens: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">Timeout (ms)</label>
              <input
                type="number"
                value={config.timeoutMs}
                onChange={(e) => handleSave({ timeoutMs: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">Retry Attempts</label>
              <input
                type="number"
                value={config.retryCount}
                onChange={(e) => handleSave({ retryCount: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-900/60">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-zinc-450 uppercase">Use Real AI</span>
              <input
                type="checkbox"
                checked={config.useRealAi}
                onChange={(e) => handleSave({ useRealAi: e.target.checked })}
                className="rounded border-zinc-900 bg-zinc-950 text-violet focus:ring-violet focus:ring-opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-zinc-450 uppercase">Mock Fallback Mode</span>
              <input
                type="checkbox"
                checked={config.useMockData}
                onChange={(e) => handleSave({ useMockData: e.target.checked })}
                className="rounded border-zinc-900 bg-zinc-950 text-violet focus:ring-violet focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-md flex flex-col shadow-[0_0_20px_rgba(123,44,191,0.02)]">
            <h3 className="font-mono text-[8px] tracking-[0.25em] text-zinc-500 uppercase mb-4">
              PROVIDER TELEMETRY
            </h3>
            
            <div className="space-y-3 font-mono text-[9px]">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-900/60">
                <span className="text-zinc-500">Status</span>
                <span className={`font-bold uppercase ${status === "Connected" ? "text-green-500" : "text-crimson"}`}>
                  {status}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-900/60">
                <span className="text-zinc-500">Model Registry</span>
                <span className="text-zinc-200">OpenRouter (8 models)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-900/60">
                <span className="text-zinc-500">Avg Swarm Latency</span>
                <span className="text-cyan font-semibold">1.24s</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-md flex flex-col shadow-[0_0_20px_rgba(123,44,191,0.02)]">
            <h3 className="font-mono text-[8px] tracking-[0.25em] text-zinc-500 uppercase mb-3">
              ACTIVE INTELLIGENCE ROLES
            </h3>
            <div className="space-y-3 text-[9px] font-mono">
              {Object.entries(modelRegistry).map(([key, model]) => (
                <div key={key} className="flex flex-col gap-0.5 pb-2 border-b border-zinc-900/40 last:border-0 last:pb-0">
                  <span className="text-zinc-200 font-bold uppercase">{key} Agent</span>
                  <span className="text-[8px] text-zinc-500 font-mono truncate">{model.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
