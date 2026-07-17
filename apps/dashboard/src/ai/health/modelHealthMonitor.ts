export interface ModelHealth {
  modelId: string;
  isAvailable: boolean;
  averageLatencyMs: number;
  requestCount: number;
  successRate: number;
  consecutiveFailures: number;
  lastSuccessTimestamp: string | null;
  lastErrorTimestamp: string | null;
}

class ModelHealthMonitor {
  private healthData: Map<string, ModelHealth> = new Map();

  recordSuccess(modelId: string, latencyMs: number) {
    const health = this.getOrInit(modelId);
    health.requestCount++;
    health.consecutiveFailures = 0;
    health.isAvailable = true;
    health.lastSuccessTimestamp = new Date().toISOString();
    
    health.averageLatencyMs = health.averageLatencyMs === 0 
      ? latencyMs 
      : Math.floor((health.averageLatencyMs * 4 + latencyMs) / 5);
      
    this.recalcSuccessRate(health, true);
  }

  recordFailure(modelId: string) {
    const health = this.getOrInit(modelId);
    health.requestCount++;
    health.consecutiveFailures++;
    health.lastErrorTimestamp = new Date().toISOString();

    if (health.consecutiveFailures >= 3) {
      health.isAvailable = false;
    }

    this.recalcSuccessRate(health, false);
  }

  isModelHealthy(modelId: string): boolean {
    const health = this.healthData.get(modelId);
    if (!health) return true;
    return health.isAvailable;
  }

  getHealth(modelId: string): ModelHealth {
    return this.getOrInit(modelId);
  }

  getAllHealth(): ModelHealth[] {
    return Array.from(this.healthData.values());
  }

  private getOrInit(modelId: string): ModelHealth {
    let health = this.healthData.get(modelId);
    if (!health) {
      health = {
        modelId,
        isAvailable: true,
        averageLatencyMs: 0,
        requestCount: 0,
        successRate: 1.0,
        consecutiveFailures: 0,
        lastSuccessTimestamp: null,
        lastErrorTimestamp: null
      };
      this.healthData.set(modelId, health);
    }
    return health;
  }

  private recalcSuccessRate(health: ModelHealth, success: boolean) {
    const prevSuccessCount = Math.round(health.successRate * (health.requestCount - 1));
    const currentSuccessCount = prevSuccessCount + (success ? 1 : 0);
    health.successRate = health.requestCount > 0 
      ? currentSuccessCount / health.requestCount 
      : 1.0;
  }
}

export const modelHealthMonitor = new ModelHealthMonitor();
export default modelHealthMonitor;
