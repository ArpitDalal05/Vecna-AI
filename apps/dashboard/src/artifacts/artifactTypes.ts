export type ArtifactFileType =
  | "TXT"
  | "MD"
  | "JSON"
  | "SQL"
  | "TS"
  | "TSX"
  | "JS"
  | "CSS"
  | "YAML"
  | "Source Code"
  | "Markdown"
  | "Config"
  | "Report";

export interface Artifact {
  id: string;
  missionId: string;
  name: string;
  path: string;
  type: ArtifactFileType;
  version: number;
  status: "CREATED" | "COMMITTED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  content: string;
  checksum: string;
  // Backward compatibility alias:
  authorAgent?: string;
  timestamp?: string;
}

export default Artifact;
