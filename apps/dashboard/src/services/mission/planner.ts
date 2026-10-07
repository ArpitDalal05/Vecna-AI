import { Assignment } from "../../types";

export const planner = {
  decompose(goal: string, priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): Omit<Assignment, "id" | "startedAt">[] {
    const goalLower = goal.toLowerCase();

    if (goalLower.includes("todo") || goalLower.includes("api") || goalLower.includes("express") || goalLower.includes("node")) {
      return [
        {
          agentId: "Coder-01",
          taskTitle: "Initialize project manifest and package.json configuration",
          targetArtifact: "package.json",
          status: "PENDING" as const,
          priority,
          progress: 0
        },
        {
          agentId: "Coder-01",
          taskTitle: "Configure TypeScript tsconfig.json compiler settings",
          targetArtifact: "tsconfig.json",
          status: "PENDING" as const,
          priority,
          progress: 0
        },
        {
          agentId: "Coder-02",
          taskTitle: "Define Todo domain types and interfaces in src/types.ts",
          targetArtifact: "src/types.ts",
          status: "PENDING" as const,
          priority,
          progress: 0
        },
        {
          agentId: "Coder-02",
          taskTitle: "Implement input validation rules in src/validation/todo.ts",
          targetArtifact: "src/validation/todo.ts",
          status: "PENDING" as const,
          priority,
          progress: 0
        },
        {
          agentId: "Coder-01",
          taskTitle: "Build Express CRUD endpoints router in src/routes/todos.ts",
          targetArtifact: "src/routes/todos.ts",
          status: "PENDING" as const,
          priority,
          progress: 0
        },
        {
          agentId: "Coder-01",
          taskTitle: "Create Express application server entry point in src/server.ts",
          targetArtifact: "src/server.ts",
          status: "PENDING" as const,
          priority,
          progress: 0
        },
        {
          agentId: "Coder-04",
          taskTitle: "Write unit test suite for API routes in tests/todos.test.ts",
          targetArtifact: "tests/todos.test.ts",
          status: "PENDING" as const,
          priority,
          progress: 0
        },
        {
          agentId: "Coder-03",
          taskTitle: "Generate service documentation in README.md",
          targetArtifact: "README.md",
          status: "PENDING" as const,
          priority,
          progress: 0
        }
      ];
    }

    return [
      {
        agentId: "Coder-01",
        taskTitle: `Analyze scope and requirements for ${goal.substring(0, 40)}`,
        status: "PENDING" as const,
        priority,
        progress: 0
      },
      {
        agentId: "Coder-02",
        taskTitle: `Design architecture layout and data schemas for goal`,
        status: "PENDING" as const,
        priority,
        progress: 0
      },
      {
        agentId: "Coder-04",
        taskTitle: `Build validation test suite and verify integration bounds`,
        status: "PENDING" as const,
        priority,
        progress: 0
      }
    ];
  }
};

export default planner;
