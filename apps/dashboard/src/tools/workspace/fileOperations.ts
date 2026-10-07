import { workspacePolicy } from "./workspacePolicy";

function getNativePath() {
  if (typeof window === "undefined") {
    try {
      return eval("require")("path");
    } catch {
      return null;
    }
  }
  return null;
}

function getNativeFs() {
  if (typeof window === "undefined") {
    try {
      return eval("require")("fs");
    } catch {
      return null;
    }
  }
  return null;
}

export interface FileMetadata {
  name: string;
  relativePath: string;
  size: number;
  isDirectory: boolean;
  updatedAt: string;
}

// In-memory workspace cache for browser environment fallback
const virtualFiles: Map<string, { content: string; updatedAt: string }> = new Map();

export const fileOperations = {
  listFiles(subDir = ""): FileMetadata[] {
    const policy = workspacePolicy.isPathAllowed(subDir);
    if (!policy.allowed || !policy.safePath) {
      throw new Error(policy.reason || "Access denied.");
    }

    const fsMod = getNativeFs();
    const pathMod = getNativePath();

    if (fsMod && pathMod) {
      if (!fsMod.existsSync(policy.safePath)) {
        return [];
      }

      const entries = fsMod.readdirSync(policy.safePath, { withFileTypes: true });
      return entries.map((entry: any) => {
        const fullPath = pathMod.join(policy.safePath, entry.name);
        const stat = fsMod.statSync(fullPath);
        const rel = pathMod.relative(policy.safePath, fullPath).replace(/\\/g, "/");
        return {
          name: entry.name,
          relativePath: subDir ? `${subDir}/${rel}` : rel,
          size: stat.size,
          isDirectory: entry.isDirectory(),
          updatedAt: stat.mtime.toISOString()
        };
      });
    }

    // Fallback virtual listing
    const results: FileMetadata[] = [];
    for (const [key, val] of virtualFiles.entries()) {
      if (subDir === "" || key.startsWith(subDir)) {
        results.push({
          name: key.split("/").pop() || key,
          relativePath: key,
          size: val.content.length,
          isDirectory: false,
          updatedAt: val.updatedAt
        });
      }
    }
    return results;
  },

  readFile(relPath: string): string {
    const policy = workspacePolicy.isPathAllowed(relPath);
    if (!policy.allowed || !policy.safePath) {
      throw new Error(policy.reason || "Access denied.");
    }

    const fsMod = getNativeFs();
    if (fsMod) {
      if (!fsMod.existsSync(policy.safePath)) {
        throw new Error(`File "${relPath}" does not exist in workspace.`);
      }
      return fsMod.readFileSync(policy.safePath, "utf-8");
    }

    const cached = virtualFiles.get(relPath);
    if (!cached) {
      throw new Error(`File "${relPath}" does not exist in virtual workspace.`);
    }
    return cached.content;
  },

  createFile(relPath: string, content: string): void {
    const policy = workspacePolicy.isPathAllowed(relPath);
    if (!policy.allowed || !policy.safePath) {
      throw new Error(policy.reason || "Access denied.");
    }

    const contentPolicy = workspacePolicy.isContentAllowed(content);
    if (!contentPolicy.allowed) {
      throw new Error(contentPolicy.reason);
    }

    const fsMod = getNativeFs();
    const pathMod = getNativePath();

    if (fsMod && pathMod) {
      const dir = pathMod.dirname(policy.safePath);
      if (!fsMod.existsSync(dir)) {
        fsMod.mkdirSync(dir, { recursive: true });
      }
      fsMod.writeFileSync(policy.safePath, content, "utf-8");
    }

    virtualFiles.set(relPath, { content, updatedAt: new Date().toISOString() });
  },

  editFile(relPath: string, content: string): void {
    this.createFile(relPath, content);
  },

  renameFile(oldRelPath: string, newRelPath: string): void {
    const oldPolicy = workspacePolicy.isPathAllowed(oldRelPath);
    const newPolicy = workspacePolicy.isPathAllowed(newRelPath);

    if (!oldPolicy.allowed || !oldPolicy.safePath) throw new Error(oldPolicy.reason || "Access denied.");
    if (!newPolicy.allowed || !newPolicy.safePath) throw new Error(newPolicy.reason || "Access denied.");

    const fsMod = getNativeFs();
    const pathMod = getNativePath();

    if (fsMod && pathMod) {
      if (!fsMod.existsSync(oldPolicy.safePath)) {
        throw new Error(`Source file "${oldRelPath}" does not exist.`);
      }

      const newDir = pathMod.dirname(newPolicy.safePath);
      if (!fsMod.existsSync(newDir)) {
        fsMod.mkdirSync(newDir, { recursive: true });
      }

      fsMod.renameSync(oldPolicy.safePath, newPolicy.safePath);
    }

    const existing = virtualFiles.get(oldRelPath);
    if (existing) {
      virtualFiles.delete(oldRelPath);
      virtualFiles.set(newRelPath, existing);
    }
  },

  createDirectory(relPath: string): void {
    const policy = workspacePolicy.isPathAllowed(relPath);
    if (!policy.allowed || !policy.safePath) throw new Error(policy.reason || "Access denied.");

    const fsMod = getNativeFs();
    if (fsMod && !fsMod.existsSync(policy.safePath)) {
      fsMod.mkdirSync(policy.safePath, { recursive: true });
    }
  },

  deleteFile(relPath: string): void {
    const policy = workspacePolicy.isPathAllowed(relPath);
    if (!policy.allowed || !policy.safePath) throw new Error(policy.reason || "Access denied.");

    const fsMod = getNativeFs();
    if (fsMod && fsMod.existsSync(policy.safePath)) {
      const stat = fsMod.statSync(policy.safePath);
      if (stat.isDirectory()) {
        fsMod.rmSync(policy.safePath, { recursive: true, force: true });
      } else {
        fsMod.unlinkSync(policy.safePath);
      }
    }

    virtualFiles.delete(relPath);
  },

  getFileMetadata(relPath: string): FileMetadata {
    const policy = workspacePolicy.isPathAllowed(relPath);
    if (!policy.allowed || !policy.safePath) throw new Error(policy.reason || "Access denied.");

    const fsMod = getNativeFs();
    const pathMod = getNativePath();

    if (fsMod && pathMod) {
      if (!fsMod.existsSync(policy.safePath)) {
        throw new Error(`File "${relPath}" not found.`);
      }
      const stat = fsMod.statSync(policy.safePath);
      return {
        name: pathMod.basename(policy.safePath),
        relativePath: relPath,
        size: stat.size,
        isDirectory: stat.isDirectory(),
        updatedAt: stat.mtime.toISOString()
      };
    }

    const cached = virtualFiles.get(relPath);
    return {
      name: relPath.split("/").pop() || relPath,
      relativePath: relPath,
      size: cached ? cached.content.length : 0,
      isDirectory: false,
      updatedAt: cached ? cached.updatedAt : new Date().toISOString()
    };
  }
};

export default fileOperations;
