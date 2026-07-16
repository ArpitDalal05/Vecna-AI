import { Assignment } from "../../types";

export const planner = {
  decompose(goal: string, priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): Omit<Assignment, "id" | "startedAt">[] {
    return [
      {
        agentId: "Synapse-01",
        taskTitle: `Analyze scope: ${goal.substring(0, 50)}...`,
        status: "PENDING" as const,
        priority,
        progress: 0
      },
      {
        agentId: "Mem-04",
        taskTitle: `Index semantic references for goal`,
        status: "PENDING" as const,
        priority,
        progress: 0
      },
      {
        agentId: "Decide-02",
        taskTitle: `Evaluate consensus override options`,
        status: "PENDING" as const,
        priority,
        progress: 0
      }
    ];
  }
};
