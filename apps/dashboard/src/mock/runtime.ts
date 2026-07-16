import { Assignment } from "../types";

export let assignmentsTable: Assignment[] = [
  { id: "A1", agentId: "AGENT_DEB_01", taskTitle: "Audit codebase for over-engineering", status: "RUNNING", priority: "CRITICAL", progress: 42, startedAt: new Date().toISOString() },
  { id: "A2", agentId: "AGENT_OPT_05", taskTitle: "Optimize WebGL shader pipeline", status: "RUNNING", priority: "HIGH", progress: 65, startedAt: new Date().toISOString() },
  { id: "A3", agentId: "AGENT_MEM_12", taskTitle: "Consolidate episodic memory vectors", status: "PENDING", priority: "MEDIUM", progress: 0, startedAt: new Date().toISOString() },
  { id: "A4", agentId: "AGENT_SEC_02", taskTitle: "Monitor Supabase session redirects", status: "COMPLETED", priority: "HIGH", progress: 100, startedAt: new Date().toISOString(), completedAt: new Date().toISOString() },
];

export function updateAssignmentTable(id: string, updates: Partial<Assignment>) {
  assignmentsTable = assignmentsTable.map(task =>
    task.id === id ? { ...task, ...updates } : task
  );
}

export function insertAssignmentTable(task: Assignment) {
  assignmentsTable.push(task);
  if (assignmentsTable.length > 50) {
    assignmentsTable.shift();
  }
}
