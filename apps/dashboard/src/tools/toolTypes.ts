export interface ToolMetadata {
  name: string;
  description: string;
  permissions: string[];
}

export interface Tool {
  metadata(): ToolMetadata;
  validate(args: any): { valid: boolean; error: string | null };
  execute(args: any, context?: any): Promise<any>;
  health(): Promise<{ status: "HEALTHY" | "UNHEALTHY"; error: string | null }>;
}
export default Tool;
