import { Tool, ToolMetadata } from "../toolTypes";
import { commandRunner } from "./commandRunner";
import { commandPolicy } from "./commandPolicy";
import { logger } from "../../services/logging/logger";

export class TerminalTool implements Tool {
  metadata(): ToolMetadata {
    return {
      name: "terminal",
      description: "Execute approved commands in terminal sandbox context",
      permissions: ["terminal:execute"]
    };
  }

  validate(args: any): { valid: boolean; error: string | null } {
    if (!args.command) return { valid: false, error: "Command is required" };
    return { valid: true, error: null };
  }

  async execute(args: any): Promise<any> {
    const cmd = args.command;
    const cwd = args.workingDirectory || args.cwd;
    const missionId = args.missionId || "standalone";
    const taskId = args.taskId;
    const requiresApproval = args.requiresApproval || false;

    const check = commandPolicy.isCommandAllowed(cmd, cwd);
    if (!check.allowed) {
      throw new Error(`Command "${cmd}" blocked by security policy: ${check.reason}`);
    }

    logger.info("TERMINAL_TOOL", "EXECUTE_CMD", `Executing terminal command: ${cmd}`);
    return await commandRunner.executeCommand({
      command: cmd,
      missionId,
      taskId,
      workingDirectory: cwd,
      requiresApproval
    });
  }

  async health(): Promise<{ status: "HEALTHY" | "UNHEALTHY"; error: string | null }> {
    return { status: "HEALTHY", error: null };
  }
}

export default TerminalTool;
