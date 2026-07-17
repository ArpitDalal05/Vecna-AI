import { modelHealthMonitor } from "./modelHealthMonitor";
import { aiConfigManager } from "../aiConfig";
import { requestQueue } from "../requestQueue";
import { usageManager } from "../limits/usageManager";

export const healthService = {
  getStats() {
    const config = aiConfigManager.getConfig();
    const usage = usageManager.getUsageStats();
    const monitorHealth = modelHealthMonitor.getAllHealth();
    
    const requestCount = monitorHealth.reduce((sum, h) => sum + h.requestCount, 0);
    const failureCount = monitorHealth.reduce((sum, h) => sum + h.consecutiveFailures, 0);
    
    const latencies = monitorHealth.filter(h => h.averageLatencyMs > 0).map(h => h.averageLatencyMs);
    const averageLatency = latencies.length > 0 
      ? Math.floor(latencies.reduce((sum, l) => sum + l, 0) / latencies.length) 
      : 1240;

    const totalSuccessRate = requestCount > 0 
      ? monitorHealth.reduce((sum, h) => sum + (h.successRate * h.requestCount), 0) / requestCount 
      : 1.0;

    return {
      currentProvider: "OpenRouter",
      activeModel: config.defaultModel,
      averageLatency,
      requestCount,
      activeRequests: usage.activeRequests,
      tokenUsage: usage.dailyTokens,
      successRate: totalSuccessRate,
      failureCount,
      providerHealth: failureCount >= 3 ? "Degraded" : "Healthy",
      queueSize: requestQueue.getQueueSize()
    };
  }
};
export default healthService;
