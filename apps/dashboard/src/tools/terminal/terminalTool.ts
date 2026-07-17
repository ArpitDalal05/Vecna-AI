import { Tool, ToolMetadata } from "../toolTypes";
import { sandbox } from "../security/sandbox";
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
    const sanitization = sandbox.sanitizeCommand(cmd);

    if (!sanitization.approved) {
      throw new Error(`Command "${cmd}" is blocked inside the terminal sandbox.`);
    }

    logger.info("TERMINAL_TOOL", "EXECUTE_CMD", `Command execution approved: ${cmd}`);

    return {
      stdout: `[Mock stdout response for sandbox terminal execution of: ${cmd}]`,
      stderr: "",
      exitCode: 0
    };
  }

  async health(): Promise<{ status: "HEALTHY" | "UNHEALTHY"; error: string | null }> {
    return { status: "HEALTHY", error: null };
  }
}
export default TerminalTool;
