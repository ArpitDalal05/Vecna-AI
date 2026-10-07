import { CommandExecutionAudit } from "../../types";

export interface CommandRunResult {
  command: string;
  args: string[];
  workingDirectory: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
  durationMs: number;
  status: "SUCCESS" | "FAILED" | "BLOCKED" | "PENDING_APPROVAL";
  audit: CommandExecutionAudit;
}

export const commandExecutionLogs: CommandExecutionAudit[] = [];

export function recordCommandAudit(audit: CommandExecutionAudit) {
  commandExecutionLogs.push(audit);
}

export function getCommandAuditLogs(missionId?: string): CommandExecutionAudit[] {
  if (missionId) {
    return commandExecutionLogs.filter(c => c.missionId === missionId);
  }
  return commandExecutionLogs;
}
