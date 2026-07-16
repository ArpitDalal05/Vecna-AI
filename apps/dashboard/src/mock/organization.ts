import { Employee, Department, Decision } from "../types";

export let departmentsTable: Department[] = [
  { id: "D1", name: "Cognition Core", description: "Core agent reasoning and thought pathways", createdAt: new Date().toISOString() },
  { id: "D2", name: "Distributed Memory", description: "Episodic, semantic, and vector database managers", createdAt: new Date().toISOString() },
  { id: "D3", name: "Hive Consensus", description: "Agent voting and debate protocol pipelines", createdAt: new Date().toISOString() }
];

export let employeesTable: Employee[] = [
  { id: "E1", fullName: "Synapse-01", designation: "Knowledge Architect", departmentId: "D1", status: "ACTIVE", reliabilityRating: 98, createdAt: new Date().toISOString() },
  { id: "E2", fullName: "Mem-04", designation: "Episodic Logger", departmentId: "D2", status: "ACTIVE", reliabilityRating: 95, createdAt: new Date().toISOString() },
  { id: "E3", fullName: "Decide-02", designation: "Consensus Manager", departmentId: "D3", status: "IDLE", reliabilityRating: 99, createdAt: new Date().toISOString() },
  { id: "E4", fullName: "Graph-07", designation: "Security Auditor", departmentId: "D1", status: "ACTIVE", reliabilityRating: 97, createdAt: new Date().toISOString() }
];

export let decisionsTable: Decision[] = [
  { id: "DECN1", title: "Scale Hive capacity to OMEGA-10", description: "Deploy 5,000 additional autonomous containers to handle concurrent indexing tasks.", status: "DEBATING", consensusPercentage: 84.5, yesVotes: 420, noVotes: 77, createdAt: new Date().toISOString() },
  { id: "DECN2", title: "De-prioritize flat layout renderers", description: "Switch UI grids globally to glassmorphic holographic design configurations.", status: "RESOLVED", consensusPercentage: 99.2, yesVotes: 512, noVotes: 4, createdAt: new Date().toISOString() }
];

export function updateDecisionTable(id: string, updates: Partial<Decision>) {
  decisionsTable = decisionsTable.map(d =>
    d.id === id ? { ...d, ...updates } : d
  );
}

export function insertDecisionTable(decision: Decision) {
  decisionsTable.push(decision);
}
