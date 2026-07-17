import { logger } from "../../services/logging/logger";

class UsageManager {
  private activeCount = 0;
  private requestsThisMinute = 0;
  private dailyTokens = 0;
  private monthlyTokens = 0;
  private activeAgents = 0;
  private isEmergencyStop = false;

  constructor() {
    if (typeof window !== "undefined") {
      setInterval(() => {
        this.requestsThisMinute = 0;
      }, 60000);
    }
  }

  acquireRequest(agentId: string): { allowed: boolean; reason: string | null } {
    if (this.isEmergencyStop) {
      return { allowed: false, reason: "Swarm Emergency Stop Threshold exceeded." };
    }

    if (this.activeCount >= 5) {
      return { allowed: false, reason: "Max concurrent request bounds exceeded." };
    }

    if (this.requestsThisMinute >= 60) {
      return { allowed: false, reason: "Rate limit: max requests per minute reached." };
    }

    if (this.dailyTokens >= 5000000) {
      return { allowed: false, reason: "Daily token limit exceeded." };
    }

    this.activeCount++;
    this.requestsThisMinute++;
    this.activeAgents++;
    
    logger.info("LIMITS", "REQUEST_ACQUIRED", `Active concurrent: ${this.activeCount}/5. Requests/min: ${this.requestsThisMinute}/60.`);
    return { allowed: true, reason: null };
  }

  releaseRequest(tokensUsed = 0) {
    this.activeCount = Math.max(0, this.activeCount - 1);
    this.activeAgents = Math.max(0, this.activeAgents - 1);
    this.dailyTokens += tokensUsed;
    this.monthlyTokens += tokensUsed;
  }

  triggerEmergencyStop() {
    this.isEmergencyStop = true;
    logger.error("LIMITS", "EMERGENCY_STOP", "Usage manager has triggered an emergency stop block.");
  }

  resetEmergencyStop() {
    this.isEmergencyStop = false;
    logger.info("LIMITS", "EMERGENCY_STOP_RELEASE", "Emergency stop block released.");
  }

  getUsageStats() {
    return {
      activeRequests: this.activeCount,
      requestsThisMinute: this.requestsThisMinute,
      dailyTokens: this.dailyTokens,
      monthlyTokens: this.monthlyTokens,
      activeAgents: this.activeAgents,
      isEmergencyStop: this.isEmergencyStop
    };
  }
}

export const usageManager = new UsageManager();
export default usageManager;
