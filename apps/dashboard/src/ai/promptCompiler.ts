import { getPrompt } from "../prompts";
import { Mission } from "../types";
import { Artifact } from "../artifacts/artifactTypes";

export interface CompilerOptions {
  mission?: Mission;
  workspace?: string;
  agentRole: string;
  memory?: string[];
  artifacts?: Artifact[];
  runtimeMetrics?: Record<string, any>;
}

export const promptCompiler = {
  compile(options: CompilerOptions): { systemPrompt: string; userPrompt: string } {
    const systemPrompt = getPrompt("system") + `\n\nActive Agent Role: ${options.agentRole}`;

    let userPrompt = ``;
    if (options.mission) {
      userPrompt += `Mission Objective: ${options.mission.title}\n`;
      userPrompt += `Goal Parameters: ${options.mission.goal}\n`;
    }

    if (options.workspace) {
      userPrompt += `Target Workspace: ${options.workspace}\n`;
    }

    if (options.runtimeMetrics) {
      userPrompt += `\nRuntime Metrics:\n${JSON.stringify(options.runtimeMetrics, null, 2)}\n`;
    }

    if (options.memory && options.memory.length > 0) {
      userPrompt += `\nRelevant Memory Threads:\n${options.memory.join("\n")}\n`;
    }

    if (options.artifacts && options.artifacts.length > 0) {
      userPrompt += `\nGenerated Artifacts:\n`;
      for (const art of options.artifacts) {
        userPrompt += `- [${art.type}] ${art.name} (v${art.version}):\n${art.content.substring(0, 500)}\n`;
      }
    }

    return { systemPrompt, userPrompt };
  }
};
export default promptCompiler;
