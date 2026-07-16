import { AgentLog } from "../../types";

class LoggerService {
  private logs: AgentLog[] = [];
  private maxLogs = 300;

  info(module: string, action: string, message: string, payload?: Record<string, any>) {
    this.log("SUCCESS", module, action, message, payload);
  }

  warn(module: string, action: string, message: string, payload?: Record<string, any>) {
    this.log("WARNING", module, action, message, payload);
  }

  error(module: string, action: string, message: string, payload?: Record<string, any>) {
    this.log("FAILURE", module, action, message, payload);
  }

  private log(
    status: "SUCCESS" | "WARNING" | "FAILURE",
    module: string,
    action: string,
    message: string,
    payload?: Record<string, any>
  ) {
    const id = typeof crypto !== "undefined" && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);

    const agentLog: AgentLog = {
      id,
      agentId: "SYSTEM",
      module,
      action: `${action}: ${message}`,
      status,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(agentLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    if (process.env.NODE_ENV === "development") {
      const color = status === "SUCCESS" ? "🟢" : status === "WARNING" ? "🟡" : "🔴";
      console.log(`${color} [${module}] [${action}] ${message}`, payload || "");
    }
  }

  getLogs(): AgentLog[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new LoggerService();
export default logger;
