import { logger } from "../../services/logging/logger";
import { executionLog } from "../execution/executionLog";

export interface FileLock {
  filePath: string;
  agentId: string;
  taskId: string;
  acquiredAt: string;
}

const activeLocks: Map<string, FileLock> = new Map();

export const fileLocking = {
  acquireLock(filePath: string, agentId: string, taskId: string, missionId: string): boolean {
    const cleanPath = filePath.replace(/\\/g, "/").toLowerCase();
    const existing = activeLocks.get(cleanPath);

    if (existing && existing.agentId !== agentId) {
      logger.warn("FILE_LOCK", "LOCK_CONFLICT", `File "${cleanPath}" locked by agent ${existing.agentId}. Agent ${agentId} denied access.`);
      return false;
    }

    const lock: FileLock = {
      filePath: cleanPath,
      agentId,
      taskId,
      acquiredAt: new Date().toISOString()
    };
    activeLocks.set(cleanPath, lock);

    logger.info("FILE_LOCK", "ACQUIRED", `File lock acquired for "${cleanPath}" by ${agentId}`);
    executionLog.record({
      missionId,
      taskId,
      agent: agentId,
      event: "FILE_LOCK_ACQUIRED",
      metadata: { filePath: cleanPath }
    });

    return true;
  },

  releaseLock(filePath: string, agentId: string, missionId: string, taskId?: string): void {
    const cleanPath = filePath.replace(/\\/g, "/").toLowerCase();
    const existing = activeLocks.get(cleanPath);

    if (existing && existing.agentId === agentId) {
      activeLocks.delete(cleanPath);
      logger.info("FILE_LOCK", "RELEASED", `File lock released for "${cleanPath}" by ${agentId}`);
      executionLog.record({
        missionId,
        taskId,
        agent: agentId,
        event: "FILE_LOCK_RELEASED",
        metadata: { filePath: cleanPath }
      });
    }
  },

  isLocked(filePath: string): boolean {
    const cleanPath = filePath.replace(/\\/g, "/").toLowerCase();
    return activeLocks.has(cleanPath);
  }
};

export default fileLocking;
