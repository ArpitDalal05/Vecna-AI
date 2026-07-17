import { logger } from "../../services/logging/logger";

export const sandbox = {
  sanitizePath(path: string): string {
    return path.replace(/\.\./g, "");
  },

  sanitizeCommand(cmd: string): { approved: boolean; command: string } {
    const approvedCommands = ["npm", "pnpm", "git", "docker", "node", "python"];
    const baseCommand = cmd.trim().split(" ")[0];

    if (approvedCommands.includes(baseCommand)) {
      return { approved: true, command: cmd };
    }

    logger.warn("SECURITY", "COMMAND_BLOCKED", `Command execution rejected inside sandbox: "${cmd}"`);
    return { approved: false, command: cmd };
  }
};
export default sandbox;
