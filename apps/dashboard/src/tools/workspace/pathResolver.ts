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

export function getWorkspaceRoot(): string {
  const pathMod = getNativePath();
  const fsMod = getNativeFs();

  const envRoot = process.env.VECNA_WORKSPACE_ROOT;
  if (envRoot && envRoot.trim() !== "") {
    const resolved = pathMod ? pathMod.resolve(envRoot) : envRoot;
    if (fsMod && !fsMod.existsSync(resolved)) {
      try {
        fsMod.mkdirSync(resolved, { recursive: true });
      } catch (err) {
        console.warn("Could not create env VECNA_WORKSPACE_ROOT:", err);
      }
    }
    return resolved;
  }

  const defaultRoot = pathMod ? pathMod.resolve("D:/Vecna-AI/workspace") : "D:/Vecna-AI/workspace";
  if (fsMod && !fsMod.existsSync(defaultRoot)) {
    try {
      fsMod.mkdirSync(defaultRoot, { recursive: true });
    } catch (err) {
      console.warn("Could not create default VECNA_WORKSPACE_ROOT:", err);
    }
  }
  return defaultRoot;
}

export function resolveWorkspacePath(relativePath: string): { safePath: string; isWithinWorkspace: boolean; error?: string } {
  const root = getWorkspaceRoot();
  const pathMod = getNativePath();

  const cleanRel = relativePath.replace(/^[\/\\]+/, "");
  const resolved = pathMod ? pathMod.resolve(root, cleanRel) : `${root}/${cleanRel}`;

  const relativeFromRoot = pathMod ? pathMod.relative(root, resolved) : cleanRel;
  const isOutside = relativeFromRoot.startsWith("..") || (pathMod ? pathMod.isAbsolute(relativeFromRoot) : false);

  if (isOutside) {
    return {
      safePath: "",
      isWithinWorkspace: false,
      error: `Security Violation: Path "${relativePath}" escapes configured workspace root "${root}".`
    };
  }

  const lowerResolved = resolved.toLowerCase();
  const forbiddenKeywords = [
    "c:\\windows",
    "c:\\program files",
    "/etc",
    "/usr",
    "id_rsa",
    "id_ed25519",
    "browser_data"
  ];

  for (const keyword of forbiddenKeywords) {
    if (lowerResolved.includes(keyword)) {
      return {
        safePath: "",
        isWithinWorkspace: false,
        error: `Security Violation: Access to system directory "${keyword}" is strictly forbidden.`
      };
    }
  }

  return { safePath: resolved, isWithinWorkspace: true };
}

export default resolveWorkspacePath;
