export interface Artifact {
  id: string;
  version: number;
  timestamp: string;
  missionId: string;
  authorAgent: string;
  status: "CREATED" | "COMMITTED" | "ARCHIVED";
  type: "Source Code" | "Markdown" | "JSON" | "Image" | "PDF" | "Config" | "Report";
  content: string;
  name: string;
}
export default Artifact;
