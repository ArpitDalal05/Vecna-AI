import { Tool } from "./toolTypes";
import { FilesystemTool } from "./filesystem/filesystemTool";
import { GitTool } from "./git/gitTool";
import { HttpTool } from "./http/httpTool";
import { SearchTool } from "./search/searchTool";
import { TerminalTool } from "./terminal/terminalTool";
import { DatabaseTool } from "./database/databaseTool";

class ToolRegistry {
  private registry: Map<string, Tool> = new Map();

  constructor() {
    this.register("filesystem", new FilesystemTool());
    this.register("git", new GitTool());
    this.register("http", new HttpTool());
    this.register("search", new SearchTool());
    this.register("terminal", new TerminalTool());
    this.register("database", new DatabaseTool());
  }

  register(name: string, tool: Tool) {
    this.registry.set(name, tool);
  }

  get(name: string): Tool | undefined {
    return this.registry.get(name);
  }

  getAll(): Tool[] {
    return Array.from(this.registry.values());
  }
}

export const toolRegistry = new ToolRegistry();
export default toolRegistry;
