import { AgentMember, AgentCapability, AgentRole } from "../../types";
import { logger } from "../../services/logging/logger";

export const initialAgentRegistry: AgentMember[] = [
  {
    id: "Coder-01",
    name: "Synapse-Backend",
    role: "CODER_BACKEND",
    capabilities: ["BACKEND", "INTEGRATION"],
    model: "qwen/qwen3-coder-480b-a35b-instruct",
    status: "IDLE",
    workload: 0,
    permissions: ["workspace:read", "workspace:write"],
    workspaceScope: "*"
  },
  {
    id: "Coder-02",
    name: "Schema-Database",
    role: "CODER_DATABASE",
    capabilities: ["DATABASE", "BACKEND"],
    model: "qwen/qwen3-coder-480b-a35b-instruct",
    status: "IDLE",
    workload: 0,
    permissions: ["workspace:read", "workspace:write"],
    workspaceScope: "*"
  },
  {
    id: "Coder-03",
    name: "Vector-Frontend",
    role: "CODER_FRONTEND",
    capabilities: ["FRONTEND"],
    model: "qwen/qwen3-coder-480b-a35b-instruct",
    status: "IDLE",
    workload: 0,
    permissions: ["workspace:read", "workspace:write"],
    workspaceScope: "*"
  },
  {
    id: "Coder-04",
    name: "TestRunner-QA",
    role: "CODER_TEST",
    capabilities: ["TESTING", "BACKEND"],
    model: "qwen/qwen3-coder-480b-a35b-instruct",
    status: "IDLE",
    workload: 0,
    permissions: ["workspace:read", "workspace:write", "terminal:execute"],
    workspaceScope: "*"
  },
  {
    id: "Critic-01",
    name: "Aegis-Critic",
    role: "CRITIC",
    capabilities: ["CRITICISM"],
    model: "nousresearch/hermes-3-405b-instruct",
    status: "IDLE",
    workload: 0,
    permissions: ["workspace:read"],
    workspaceScope: "*"
  },
  {
    id: "Auditor-01",
    name: "Sentinel-Auditor",
    role: "AUDITOR",
    capabilities: ["AUDIT"],
    model: "nousresearch/hermes-3-405b-instruct",
    status: "IDLE",
    workload: 0,
    permissions: ["workspace:read"],
    workspaceScope: "*"
  },
  {
    id: "Security-01",
    name: "Vault-Security",
    role: "SECURITY_REVIEWER",
    capabilities: ["SECURITY"],
    model: "nousresearch/hermes-3-405b-instruct",
    status: "IDLE",
    workload: 0,
    permissions: ["workspace:read"],
    workspaceScope: "*"
  },
  {
    id: "QA-01",
    name: "Spectra-QA",
    role: "QA_REVIEWER",
    capabilities: ["TESTING"],
    model: "nousresearch/hermes-3-405b-instruct",
    status: "IDLE",
    workload: 0,
    permissions: ["workspace:read", "terminal:execute"],
    workspaceScope: "*"
  },
  {
    id: "Senior-01",
    name: "Apex-Architect",
    role: "SENIOR_REVIEWER",
    capabilities: ["ARCHITECT", "AUDIT"],
    model: "nousresearch/hermes-3-405b-instruct",
    status: "IDLE",
    workload: 0,
    permissions: ["workspace:read", "decision:approve"],
    workspaceScope: "*"
  }
];

export const activeAgentsStore: Map<string, AgentMember> = new Map(
  initialAgentRegistry.map(a => [a.id, { ...a }])
);

export const teamRegistry = {
  getAgent(id: string): AgentMember | undefined {
    return activeAgentsStore.get(id);
  },

  getAllAgents(): AgentMember[] {
    return Array.from(activeAgentsStore.values());
  },

  findBestAgentForCapabilities(reqCapabilities: AgentCapability[]): AgentMember {
    const all = Array.from(activeAgentsStore.values());
    
    // Filter coders matching capabilities
    const matching = all.filter(agent =>
      reqCapabilities.some(cap => agent.capabilities.includes(cap))
    );

    if (matching.length === 0) {
      // Fallback to Coder-01 default
      return activeAgentsStore.get("Coder-01") || all[0];
    }

    // Sort by workload ascending
    matching.sort((a, b) => a.workload - b.workload);
    return matching[0];
  },

  setAgentStatus(id: string, status: AgentMember["status"], currentTaskId?: string): void {
    const agent = activeAgentsStore.get(id);
    if (agent) {
      agent.status = status;
      agent.currentTaskId = currentTaskId;
      if (status === "BUSY") {
        agent.workload += 1;
      } else if (status === "IDLE" && agent.workload > 0) {
        agent.workload -= 1;
      }
      activeAgentsStore.set(id, agent);
      logger.info("TEAM_REGISTRY", "STATUS_CHANGE", `Agent ${id} (${agent.role}) status changed to ${status}`);
    }
  }
};

export default teamRegistry;
