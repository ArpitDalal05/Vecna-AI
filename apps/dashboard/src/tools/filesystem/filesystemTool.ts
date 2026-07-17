import { Tool, ToolMetadata } from "../toolTypes";
import { sandbox } from "../security/sandbox";
import { logger } from "../../services/logging/logger";

export class FilesystemTool implements Tool {
  metadata(): ToolMetadata {
    return {
      name: "filesystem",
      description: "Perform sandboxed filesystem operations",
      permissions: ["fs:read", "fs:write"]
    };
  }

  validate(args: any): { valid: boolean; error: string | null } {
    if (!args.action) return { valid: false, error: "Action is required" };
    if (!args.path) return { valid: false, error: "Path is required" };
    return { valid: true, error: null };
  }

  async execute(args: any): Promise<any> {
    const action = args.action;
    const cleanPath = sandbox.sanitizePath(args.path);

    logger.info("FS_TOOL", "EXECUTE_ACTION", `Filesystem action "${action}" requested on path: ${cleanPath}`);

    switch (action) {
      case "readFile":
        return { content: `[Sandboxed File Contents for: ${cleanPath}]` };
      case "writeFile":
      case "createFile":
        return { success: true, message: `File created successfully at ${cleanPath}` };
      case "deleteFile":
        return { success: true, message: `File deleted successfully at ${cleanPath}` };
      case "listDirectory":
        return { files: ["index.tsx", "styles.css", "package.json"] };
      default:
        throw new Error(`Unsupported action "${action}"`);
    }
  }

  async health(): Promise<{ status: "HEALTHY" | "UNHEALTHY"; error: string | null }> {
    return { status: "HEALTHY", error: null };
  }
}
export default FilesystemTool;
