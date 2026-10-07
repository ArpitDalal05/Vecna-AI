import { FileOperationAudit } from "../../types";
import { workspaceManager } from "../workspace/workspaceManager";
import { createClient } from "../../lib/supabase/client";
import { FEATURE_FLAGS } from "../../config";
import { logger } from "../../services/logging/logger";

export const fileAuditLogs: FileOperationAudit[] = [];

export const fileEditor = {
  async performFileOperation(params: {
    missionId: string;
    taskId?: string;
    filePath: string;
    operation: "CREATE" | "READ" | "UPDATE" | "RENAME" | "DELETE";
    newContent?: string;
    newFilePath?: string;
    agent: string;
    requiresApproval?: boolean;
  }): Promise<{ success: boolean; previousContent?: string; error?: string; audit: FileOperationAudit }> {
    const { missionId, taskId, filePath, operation, newContent = "", newFilePath, agent, requiresApproval } = params;
    const now = new Date().toISOString();

    let previousContent: string | undefined = undefined;

    // Check if approval required
    if (requiresApproval) {
      const pendingAudit: FileOperationAudit = {
        id: `audit_${Math.random().toString(36).substring(2, 9)}`,
        missionId,
        taskId,
        filePath,
        operation,
        previousVersion: undefined,
        newVersion: newContent.substring(0, 500),
        timestamp: now,
        agent,
        result: "PENDING_APPROVAL"
      };
      fileAuditLogs.push(pendingAudit);
      return { success: false, error: "Operation requires user approval in Approval Required mode.", audit: pendingAudit };
    }

    try {
      // 1. Read current contents if exists
      try {
        previousContent = workspaceManager.readFile(filePath);
      } catch {
        previousContent = undefined;
      }

      // 2. Perform operation
      if (operation === "CREATE" || operation === "UPDATE") {
        workspaceManager.editFile(filePath, newContent);
      } else if (operation === "RENAME") {
        if (!newFilePath) throw new Error("newFilePath required for RENAME operation.");
        workspaceManager.renameFile(filePath, newFilePath);
      } else if (operation === "DELETE") {
        workspaceManager.deleteFile(filePath);
      }

      const auditRecord: FileOperationAudit = {
        id: `audit_${Math.random().toString(36).substring(2, 9)}`,
        missionId,
        taskId,
        filePath: operation === "RENAME" && newFilePath ? newFilePath : filePath,
        operation,
        previousVersion: previousContent ? previousContent.substring(0, 500) : undefined,
        newVersion: newContent ? newContent.substring(0, 500) : undefined,
        timestamp: now,
        agent,
        result: "SUCCESS"
      };

      fileAuditLogs.push(auditRecord);

      if (!FEATURE_FLAGS.USE_MOCK_DATA) {
        try {
          const supabase = createClient();
          await supabase.from("file_operations").insert({
            mission_id: missionId,
            task_id: taskId,
            file_path: auditRecord.filePath,
            operation: auditRecord.operation,
            previous_version: auditRecord.previousVersion,
            new_version: auditRecord.newVersion,
            agent: auditRecord.agent,
            result: auditRecord.result
          });
        } catch (dbErr) {
          console.warn("Could not insert file operation to Supabase:", dbErr);
        }
      }

      logger.info("FILE_EDITOR", operation, `File ${operation} on "${filePath}" succeeded by ${agent}`);
      return { success: true, previousContent, audit: auditRecord };

    } catch (err: any) {
      const failedAudit: FileOperationAudit = {
        id: `audit_${Math.random().toString(36).substring(2, 9)}`,
        missionId,
        taskId,
        filePath,
        operation,
        previousVersion: previousContent,
        newVersion: newContent.substring(0, 500),
        timestamp: now,
        agent,
        result: "FAILED"
      };
      fileAuditLogs.push(failedAudit);
      logger.error("FILE_EDITOR", `${operation}_FAILED`, `File ${operation} on "${filePath}" failed: ${err.message}`);
      return { success: false, error: err.message, audit: failedAudit };
    }
  },

  getAuditLogs(missionId?: string): FileOperationAudit[] {
    if (missionId) {
      return fileAuditLogs.filter(a => a.missionId === missionId);
    }
    return fileAuditLogs;
  }
};

export default fileEditor;
