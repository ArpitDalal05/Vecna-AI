import { toolRegistry } from "./toolRegistry";
import { permissionManager } from "./security/permissionManager";
import { logger } from "../services/logging/logger";

export const toolManager = {
  async executeTool(name: string, args: any, workspace: string = "Engineering", missionId?: string, agentId?: string): Promise<any> {
    const tool = toolRegistry.get(name);
    if (!tool) {
      throw new Error(`Tool "${name}" is not registered.`);
    }

    const validation = permissionManager.validate(name, workspace);
    if (!validation.allowed) {
      throw new Error(validation.error || "Permission validation failed.");
    }

    const argsValidation = tool.validate(args);
    if (!argsValidation.valid) {
      throw new Error(argsValidation.error || "Arguments validation failed.");
    }

    const startTime = Date.now();
    try {
      const result = await tool.execute(args);
      const executionTime = Date.now() - startTime;

      logger.info(
        "TOOL_EXECUTION",
        "EXECUTE_SUCCESS",
        `Tool "${name}" executed successfully in ${executionTime}ms.`,
        {
          tool: name,
          arguments: args,
          executionTime,
          workspace,
          missionId,
          agentId,
          success: true
        }
      );

      return result;
    } catch (err: any) {
      const executionTime = Date.now() - startTime;
      logger.error(
        "TOOL_EXECUTION",
        "EXECUTE_FAIL",
        `Tool "${name}" execution failed in ${executionTime}ms: ${err.message}`,
        {
          tool: name,
          arguments: args,
          executionTime,
          workspace,
          missionId,
          agentId,
          success: false,
          error: err.message
        }
      );
      throw err;
    }
  }
};
export default toolManager;
