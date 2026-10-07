import { resolveWorkspacePath } from "./pathResolver";

export const workspacePolicy = {
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB limit

  isPathAllowed(relativePath: string): { allowed: boolean; safePath: string; reason?: string } {
    const check = resolveWorkspacePath(relativePath);
    if (!check.isWithinWorkspace || !check.safePath) {
      return { allowed: false, safePath: "", reason: check.error || "Path outside workspace scope." };
    }

    // Check sensitive file names
    const fileName = relativePath.split(/[\/\\]/).pop() || "";
    if (fileName === ".env.production" || fileName === ".gitconfig" || fileName === "credentials") {
      return { allowed: false, safePath: "", reason: `File "${fileName}" is restricted by security policy.` };
    }

    return { allowed: true, safePath: check.safePath };
  },

  isContentAllowed(content: string): { allowed: boolean; reason?: string } {
    if (content.length > this.maxFileSizeBytes) {
      return { allowed: false, reason: "Content size exceeds max allowed file size (10MB)." };
    }
    return { allowed: true };
  }
};

export default workspacePolicy;
