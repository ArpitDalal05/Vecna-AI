import { ExecutionLogEntry } from "../../types";
import { eventBus } from "../../services/runtime/eventBus";
import { createClient } from "../../lib/supabase/client";
import { FEATURE_FLAGS } from "../../config";
import { logger } from "../../services/logging/logger";

export const executionLogStore: ExecutionLogEntry[] = [];

export const executionLog = {
  async record(entry: Omit<ExecutionLogEntry, "id" | "timestamp">): Promise<ExecutionLogEntry> {
    const fullEntry: ExecutionLogEntry = {
      id: `log_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };

    executionLogStore.push(fullEntry);
    logger.info("EXECUTION_LOG", fullEntry.event, `[${fullEntry.event}] Mission: ${fullEntry.missionId} | Agent: ${fullEntry.agent || "SYSTEM"}`, fullEntry.metadata);

    eventBus.emit("EXECUTION_LOG_EMITTED", fullEntry);

    if (!FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const supabase = createClient();
        await supabase.from("execution_logs").insert({
          mission_id: fullEntry.missionId,
          task_id: fullEntry.taskId,
          agent: fullEntry.agent,
          event: fullEntry.event,
          metadata: fullEntry.metadata
        });
      } catch (dbErr) {
        console.warn("Could not record execution log to Supabase:", dbErr);
      }
    }

    return fullEntry;
  },

  getLogsForMission(missionId: string): ExecutionLogEntry[] {
    return executionLogStore.filter(l => l.missionId === missionId);
  },

  getAllLogs(): ExecutionLogEntry[] {
    return executionLogStore;
  }
};

export default executionLog;
