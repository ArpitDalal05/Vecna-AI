export interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  agentCount: number;
}

export let workspacesTable: WorkspaceRow[] = [
  { id: "WS1", name: "VECNA_MAIN_GRID", slug: "vecna-main-grid", description: "Primary intelligence gateway network", agentCount: 24875 },
  { id: "WS2", name: "RESEARCH_GATEWAY", slug: "research-gateway", description: "Sandboxed exploration node Cluster", agentCount: 8847 },
  { id: "WS3", name: "MEMORY_SEGMENT_ALPHA", slug: "memory-segment-alpha", description: "Consolidated vector archive filament", agentCount: 6472 }
];

export let activeWorkspaceId = "WS1";

export function setActiveWorkspaceId(id: string) {
  activeWorkspaceId = id;
}
