import { getPrompt } from "../../prompts";
import { Mission, Assignment, Organization } from "../../types";

export interface ContextPayload {
  workspace?: string;
  organization?: Organization;
  activeMission?: Mission;
  previousMissionOutputs?: string[];
  activeAssignments?: Assignment[];
  runtimeMetrics?: Record<string, any>;
  providerName?: string;
  memory?: string[];
  currentConversation?: string[];
  userPreferences?: Record<string, any>;
}

export const contextBuilder = {
  buildSystemPrompt(agentRole: string): string {
    const baseSystem = getPrompt("system");
    return `${baseSystem}\n\nActive Swarm Node Role: ${agentRole}`;
  },

  buildUserPrompt(goal: string, payload: ContextPayload): string {
    let prompt = `Core Goal: ${goal}\n`;

    if (payload.workspace) {
      prompt += `\n[Workspace context]\nActive Area: ${payload.workspace}\n`;
    }

    if (payload.organization) {
      prompt += `\n[Organization context]\nName: ${payload.organization.name} (Slug: ${payload.organization.slug})\n`;
    }

    if (payload.activeMission) {
      prompt += `\n[Active Mission parameters]\nTitle: ${payload.activeMission.title}\nGoal: ${payload.activeMission.goal}\n`;
    }

    if (payload.previousMissionOutputs && payload.previousMissionOutputs.length > 0) {
      prompt += `\n[Previous Mission outputs]\n${payload.previousMissionOutputs.join("\n")}\n`;
    }

    if (payload.activeAssignments && payload.activeAssignments.length > 0) {
      prompt += `\n[Swarm Assignments Queue]\n`;
      for (const a of payload.activeAssignments) {
        prompt += `- ${a.taskTitle} (Agent: ${a.agentId}, Status: ${a.status}, Progress: ${a.progress}%)\n`;
      }
    }

    if (payload.runtimeMetrics) {
      prompt += `\n[Telemetry metrics]\n${JSON.stringify(payload.runtimeMetrics, null, 2)}\n`;
    }

    if (payload.providerName) {
      prompt += `\n[Model metadata]\nTransports provider: ${payload.providerName}\n`;
    }

    if (payload.memory && payload.memory.length > 0) {
      prompt += `\n[Memory streams]\n${payload.memory.join("\n")}\n`;
    }

    if (payload.currentConversation && payload.currentConversation.length > 0) {
      prompt += `\n[Conversation history]\n${payload.currentConversation.join("\n")}\n`;
    }

    if (payload.userPreferences) {
      prompt += `\n[User preferences]\n${JSON.stringify(payload.userPreferences, null, 2)}\n`;
    }

    return prompt;
  }
};
export default contextBuilder;
