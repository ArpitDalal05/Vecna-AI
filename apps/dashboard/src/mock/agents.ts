export interface AgentRow {
  id: string;
  name: string;
  designation: string;
  status: "ACTIVE" | "IDLE" | "OFFLINE";
  cpuUsage: number;
  memoryUsage: number;
  reliabilityRating: number;
  cluster: "RESEARCH" | "DATA" | "CREATIVE" | "STRATEGIC" | "SYSTEM";
  lastHeartbeat: string;
  createdAt: string;
}

export let agentsTable: AgentRow[] = [
  { id: "E1", name: "Synapse-01", designation: "Knowledge Architect", status: "ACTIVE", cpuUsage: 42, memoryUsage: 75, reliabilityRating: 98, cluster: "RESEARCH", lastHeartbeat: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "E2", name: "Mem-04", designation: "Episodic Logger", status: "ACTIVE", cpuUsage: 65, memoryUsage: 88, reliabilityRating: 95, cluster: "DATA", lastHeartbeat: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "E3", name: "Decide-02", designation: "Consensus Manager", status: "IDLE", cpuUsage: 10, memoryUsage: 35, reliabilityRating: 99, cluster: "STRATEGIC", lastHeartbeat: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "E4", name: "Graph-07", designation: "Security Auditor", status: "ACTIVE", cpuUsage: 50, memoryUsage: 62, reliabilityRating: 97, cluster: "SYSTEM", lastHeartbeat: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "E5", name: "Synthesis-09", designation: "Creative Director", status: "ACTIVE", cpuUsage: 82, memoryUsage: 91, reliabilityRating: 94, cluster: "CREATIVE", lastHeartbeat: new Date().toISOString(), createdAt: new Date().toISOString() }
];

export function updateAgentMetrics(id: string, updates: Partial<AgentRow>) {
  agentsTable = agentsTable.map(agent =>
    agent.id === id ? { ...agent, ...updates, lastHeartbeat: new Date().toISOString() } : agent
  );
}

export function insertAgent(agent: AgentRow) {
  agentsTable.push(agent);
}
