import { IRuntimeRepository, RepoResponse } from "./interfaces";
import { assignmentsTable } from "../mock/runtime";
import { Assignment } from "../types";
import { cacheManager } from "../services/cache/cacheManager";
import { FEATURE_FLAGS } from "../config";
import { createClient } from "../lib/supabase/client";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class RuntimeRepository implements IRuntimeRepository {
  async getAssignments(): Promise<RepoResponse<Assignment[]>> {
    const cacheKey = "runtime_assignments";
    const cached = cacheManager.get<Assignment[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(150 + Math.random() * 150);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const data = [...assignmentsTable];
        cacheManager.set(cacheKey, data);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("assignments").select("*");
        if (error) throw new Error(error.message);

        const mapped: Assignment[] = (data || []).map((row: any) => ({
          id: row.id,
          agentId: row.agent_id || "",
          taskTitle: row.task_title,
          status: row.status,
          priority: row.priority,
          progress: Number(row.progress),
          startedAt: row.started_at,
          completedAt: row.completed_at
        }));

        cacheManager.set(cacheKey, mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase fetch failed, falling back to mock assignments:", err);
        return { data: [...assignmentsTable], error: null, loading: false };
      }
    }
  }
}

export const runtimeRepository = new RuntimeRepository();
export default runtimeRepository;
