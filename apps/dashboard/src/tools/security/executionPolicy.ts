export interface Policy {
  allowedTools: string[];
  deniedTools: string[];
  allowedWorkspaces: string[];
  dryRun: boolean;
}

export const executionPolicy: Policy = {
  allowedTools: ["filesystem", "git", "http", "search", "terminal", "database"],
  deniedTools: [],
  allowedWorkspaces: ["Engineering", "Research", "Infrastructure", "Creative", "Organization"],
  dryRun: false
};
export default executionPolicy;
