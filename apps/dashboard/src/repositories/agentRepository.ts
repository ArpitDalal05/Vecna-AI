import { IAgentRepository, RepoResponse } from "./interfaces";
import { agentsTable, AgentRow } from "../mock/agents";
import { cacheManager } from "../services/cache/cacheManager";
import { FEATURE_FLAGS } from "../config";
import { createClient } from "../lib/supabase/client";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AgentRepository implements IAgentRepository {
  async getAgents(): Promise<RepoResponse<AgentRow[]>> {
    const cacheKey = "agents_list";
    const cached = cacheManager.get<AgentRow[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(200 + Math.random() * 200);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const data = [...agentsTable];
        cacheManager.set(cacheKey, data);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("agents").select("*");
        if (error) throw new Error(error.message);

        const mapped: AgentRow[] = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          designation: row.designation || "",
          status: row.status,
          cpuUsage: Number(row.cpu_usage),
          memoryUsage: Number(row.memory_usage),
          reliabilityRating: Number(row.reliability_rating),
          cluster: row.cluster,
          lastHeartbeat: row.last_heartbeat,
          createdAt: row.created_at
        }));

        cacheManager.set(cacheKey, mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase fetch failed, falling back to mock agents:", err);
        return { data: [...agentsTable], error: null, loading: false };
      }
    }
  }
}

export const agentRepository = new AgentRepository();
export default agentRepository;
