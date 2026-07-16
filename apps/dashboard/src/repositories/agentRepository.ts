import { IAgentRepository, RepoResponse } from "./interfaces";
import { agentsTable, AgentRow } from "../mock/agents";
import { cacheManager } from "../services/cache/cacheManager";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AgentRepository implements IAgentRepository {
  async getAgents(): Promise<RepoResponse<AgentRow[]>> {
    const cacheKey = "agents_list";
    const cached = cacheManager.get<AgentRow[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(200 + Math.random() * 200);
    try {
      const data = [...agentsTable];
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }
}

export const agentRepository = new AgentRepository();
export default agentRepository;
