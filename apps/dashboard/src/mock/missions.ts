import { Mission } from "../types";

export let missionsTable: Mission[] = [
  {
    id: "M1",
    title: "Optimize WebGL shaders",
    goal: "Verify and compiles all custom canvas shaders for terrain mesh rendering",
    priority: "HIGH",
    workspace: "Engineering",
    executionMode: "Autonomous",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    estimatedTasks: 4,
    completedTasks: 4,
    assignedAgents: ["Synapse-01", "Graph-07"]
  },
  {
    id: "M2",
    title: "Audit database access configurations",
    goal: "Set up security tokens and verify profiles triggers",
    priority: "CRITICAL",
    workspace: "Infrastructure",
    executionMode: "Autonomous",
    status: "RUNNING",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedTasks: 3,
    completedTasks: 1,
    assignedAgents: ["Mem-04", "Decide-02"]
  }
];

export function insertMissionTable(mission: Omit<Mission, "id" | "createdAt" | "updatedAt">): Mission {
  const newMission: Mission = {
    ...mission,
    id: "M" + (missionsTable.length + 1),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  missionsTable.push(newMission);
  return newMission;
}

export function updateMissionTable(id: string, updates: Partial<Mission>): Mission | null {
  const index = missionsTable.findIndex(m => m.id === id);
  if (index === -1) return null;
  missionsTable[index] = {
    ...missionsTable[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return missionsTable[index];
}

export function deleteMissionTable(id: string): boolean {
  const index = missionsTable.findIndex(m => m.id === id);
  if (index === -1) return false;
  missionsTable.splice(index, 1);
  return true;
}
