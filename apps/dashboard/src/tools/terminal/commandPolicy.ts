import { resolveWorkspacePath } from "../workspace/pathResolver";

export const commandPolicy = {
  allowedBaseCommands: [
    "npm",
    "npm.cmd",
    "pnpm",
    "pnpm.cmd",
    "node",
    "node.exe",
    "npx",
    "npx.cmd",
    "git",
    "git.exe",
    "python",
    "python.exe",
    "echo",
    "dir",
    "ls"
  ],

  forbiddenSubstrings: [
    "format",
    "diskpart",
    "shutdown",
    "reg",
    "Invoke-Expression",
    "Invoke-WebRequest",
    "rm -rf /",
    "rm -rf c:",
    "del /s /q c:",
    "rmdir /s /q c:"
  ],

  isCommandAllowed(commandString: string, requestedCwd?: string): { allowed: boolean; reason?: string; safeCwd: string } {
    const trimmed = commandString.trim();
    if (!trimmed) {
      return { allowed: false, reason: "Command cannot be empty.", safeCwd: "" };
    }

    const lower = trimmed.toLowerCase();
    for (const forbidden of this.forbiddenSubstrings) {
      if (lower.includes(forbidden)) {
        return { allowed: false, reason: `Command contains forbidden destructive instruction "${forbidden}".`, safeCwd: "" };
      }
    }

    // Extract base binary
    const parts = trimmed.split(/\s+/);
    const baseCmd = parts[0].toLowerCase().replace(/^.*[\\\/]/, "");

    const isBaseAllowed = this.allowedBaseCommands.some(allowed => allowed.toLowerCase() === baseCmd);
    if (!isBaseAllowed) {
      return { allowed: false, reason: `Command executable "${baseCmd}" is not in the approved security allowlist.`, safeCwd: "" };
    }

    // Check CWD scope
    let safeCwd = resolveWorkspacePath("").safePath;
    if (requestedCwd && requestedCwd.trim() !== "") {
      const checkCwd = resolveWorkspacePath(requestedCwd);
      if (!checkCwd.isWithinWorkspace || !checkCwd.safePath) {
        return { allowed: false, reason: `Requested working directory "${requestedCwd}" is outside approved workspace scope.`, safeCwd: "" };
      }
      safeCwd = checkCwd.safePath;
    }

    return { allowed: true, safeCwd };
  }
};

export default commandPolicy;
