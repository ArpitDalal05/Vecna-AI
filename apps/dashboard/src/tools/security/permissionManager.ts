import { executionPolicy } from "./executionPolicy";
import { logger } from "../../services/logging/logger";

export const permissionManager = {
  validate(toolName: string, workspace: string): { allowed: boolean; error: string | null } {
    if (executionPolicy.deniedTools.includes(toolName)) {
      const error = `Tool "${toolName}" is explicitly blocked by system policies.`;
      logger.error("SECURITY", "PERMISSION_DENIED", error);
      return { allowed: false, error };
    }

    if (!executionPolicy.allowedTools.includes(toolName)) {
      const error = `Tool "${toolName}" is not registered in allow list.`;
      logger.error("SECURITY", "PERMISSION_DENIED", error);
      return { allowed: false, error };
    }

    if (!executionPolicy.allowedWorkspaces.includes(workspace)) {
      const error = `Tool execution is restricted in workspace "${workspace}".`;
      logger.error("SECURITY", "PERMISSION_DENIED", error);
      return { allowed: false, error };
    }

    logger.info("SECURITY", "PERMISSION_APPROVED", `Execution request for "${toolName}" approved in workspace "${workspace}".`);
    return { allowed: true, error: null };
  }
};
export default permissionManager;
