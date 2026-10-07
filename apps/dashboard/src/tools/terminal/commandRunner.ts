import { commandPolicy } from "./commandPolicy";
import { CommandRunResult, recordCommandAudit } from "./commandResult";
import { CommandExecutionAudit } from "../../types";
import { createClient } from "../../lib/supabase/client";
import { FEATURE_FLAGS } from "../../config";
import { logger } from "../../services/logging/logger";

function getNativeExec() {
  if (typeof window === "undefined") {
    try {
      return eval("require")("child_process").exec;
    } catch {
      return null;
    }
  }
  return null;
}

export const commandRunner = {
  async executeCommand(params: {
    command: string;
    missionId: string;
    taskId?: string;
    workingDirectory?: string;
    timeoutMs?: number;
    requiresApproval?: boolean;
  }): Promise<CommandRunResult> {
    const { command, missionId, taskId, workingDirectory, timeoutMs = 30000, requiresApproval } = params;
    const now = new Date().toISOString();

    const policyCheck = commandPolicy.isCommandAllowed(command, workingDirectory);
    if (!policyCheck.allowed) {
      const blockedAudit: CommandExecutionAudit = {
        id: `cmd_${Math.random().toString(36).substring(2, 9)}`,
        missionId,
        taskId,
        command,
        arguments: [],
        workingDirectory: workingDirectory || "",
        timeout: timeoutMs,
        exitCode: 1,
        stdout: "",
        stderr: policyCheck.reason || "Command blocked by security policy.",
        duration: 0,
        status: "BLOCKED",
        timestamp: now
      };
      recordCommandAudit(blockedAudit);
      return {
        command,
        args: [],
        workingDirectory: policyCheck.safeCwd,
        exitCode: 1,
        stdout: "",
        stderr: policyCheck.reason || "Blocked by security policy.",
        durationMs: 0,
        status: "BLOCKED",
        audit: blockedAudit
      };
    }

    if (requiresApproval) {
      const approvalAudit: CommandExecutionAudit = {
        id: `cmd_${Math.random().toString(36).substring(2, 9)}`,
        missionId,
        taskId,
        command,
        arguments: [],
        workingDirectory: policyCheck.safeCwd,
        timeout: timeoutMs,
        status: "PENDING_APPROVAL",
        timestamp: now
      };
      recordCommandAudit(approvalAudit);
      return {
        command,
        args: [],
        workingDirectory: policyCheck.safeCwd,
        exitCode: 0,
        stdout: "",
        stderr: "Command pending human approval in Approval Required mode.",
        durationMs: 0,
        status: "PENDING_APPROVAL",
        audit: approvalAudit
      };
    }

    const execFn = getNativeExec();
    if (!execFn) {
      // Browser environment fallback simulation
      const mockAudit: CommandExecutionAudit = {
        id: `cmd_${Math.random().toString(36).substring(2, 9)}`,
        missionId,
        taskId,
        command,
        arguments: [],
        workingDirectory: policyCheck.safeCwd,
        timeout: timeoutMs,
        exitCode: 0,
        stdout: `[Mock stdout response for: ${command}]`,
        stderr: "",
        duration: 150,
        status: "COMPLETED",
        timestamp: now
      };
      recordCommandAudit(mockAudit);
      return {
        command,
        args: [],
        workingDirectory: policyCheck.safeCwd,
        exitCode: 0,
        stdout: `[Mock stdout response for: ${command}]`,
        stderr: "",
        durationMs: 150,
        status: "COMPLETED",
        audit: mockAudit
      };
    }

    const startTime = Date.now();

    return new Promise<CommandRunResult>((resolve) => {
      execFn(
        command,
        {
          cwd: policyCheck.safeCwd,
          timeout: timeoutMs,
          maxBuffer: 50 * 1024 * 1024 // 50MB max buffer
        },
        async (error: any, stdout: string, stderr: string) => {
          const durationMs = Date.now() - startTime;
          const exitCode = error ? (error.code ?? 1) : 0;
          const status = exitCode === 0 ? "COMPLETED" : "FAILED";

          const auditRecord: CommandExecutionAudit = {
            id: `cmd_${Math.random().toString(36).substring(2, 9)}`,
            missionId,
            taskId,
            command,
            arguments: [],
            workingDirectory: policyCheck.safeCwd,
            timeout: timeoutMs,
            exitCode,
            stdout: (stdout || "").substring(0, 5000),
            stderr: (stderr || "").substring(0, 5000),
            duration: durationMs,
            status,
            timestamp: now
          };

          recordCommandAudit(auditRecord);

          if (!FEATURE_FLAGS.USE_MOCK_DATA) {
            try {
              const supabase = createClient();
              await supabase.from("command_executions").insert({
                mission_id: missionId,
                task_id: taskId,
                command,
                working_directory: policyCheck.safeCwd,
                exit_code: exitCode,
                stdout: (stdout || "").substring(0, 5000),
                stderr: (stderr || "").substring(0, 5000),
                duration_ms: durationMs,
                status
              });
            } catch (dbErr) {
              console.warn("Could not insert command execution to Supabase:", dbErr);
            }
          }

          logger.info("COMMAND_RUNNER", status, `Command "${command}" finished with exit code ${exitCode} in ${durationMs}ms`);

          resolve({
            command,
            args: [],
            workingDirectory: policyCheck.safeCwd,
            exitCode,
            stdout: stdout || "",
            stderr: stderr || "",
            durationMs,
            status,
            audit: auditRecord
          });
        }
      );
    });
  }
};

export default commandRunner;
