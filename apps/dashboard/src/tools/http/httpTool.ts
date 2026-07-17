import { Tool, ToolMetadata } from "../toolTypes";
import { logger } from "../../services/logging/logger";

export class HttpTool implements Tool {
  metadata(): ToolMetadata {
    return {
      name: "http",
      description: "Execute outbound HTTP request sequences",
      permissions: ["http:outbound"]
    };
  }

  validate(args: any): { valid: boolean; error: string | null } {
    if (!args.url) return { valid: false, error: "URL is required" };
    if (!args.method) return { valid: false, error: "HTTP method is required" };
    return { valid: true, error: null };
  }

  async execute(args: any): Promise<any> {
    const url = args.url;
    const method = args.method;
    logger.info("HTTP_TOOL", "REQUEST", `${method} request requested on endpoint: ${url}`);

    try {
      const response = await fetch(url, {
        method,
        headers: args.headers,
        body: args.body ? JSON.stringify(args.body) : undefined
      });
      
      const text = await response.text();
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: text
      };
    } catch (err: any) {
      logger.error("HTTP_TOOL", "REQUEST_FAIL", `Fetch error: ${err.message}`);
      return { status: 500, error: err.message };
    }
  }

  async health(): Promise<{ status: "HEALTHY" | "UNHEALTHY"; error: string | null }> {
    return { status: "HEALTHY", error: null };
  }
}
export default HttpTool;
