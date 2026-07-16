import { IMissionRepository, RepoResponse } from "./interfaces";
import { Mission } from "../types";
import { missionsTable, insertMissionTable, updateMissionTable, deleteMissionTable } from "../mock/missions";
import { cacheManager } from "../services/cache/cacheManager";
import { FEATURE_FLAGS } from "../config";
import { createClient } from "../lib/supabase/client";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MissionRepository implements IMissionRepository {
  async createMission(mission: Omit<Mission, "id" | "createdAt" | "updatedAt">): Promise<RepoResponse<Mission>> {
    await delay(150);
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const data = insertMissionTable(mission);
        cacheManager.invalidate("missions_list");
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("missions").insert({
          title: mission.title,
          goal: mission.goal,
          description: mission.description,
          priority: mission.priority,
          workspace: mission.workspace,
          execution_mode: mission.executionMode,
          status: mission.status,
          estimated_tasks: mission.estimatedTasks,
          completed_tasks: mission.completedTasks,
          assigned_agents: mission.assignedAgents,
          owner: mission.owner
        }).select().single();

        if (error) throw new Error(error.message);

        const mapped: Mission = {
          id: data.id,
          title: data.title,
          goal: data.goal,
          description: data.description || "",
          priority: data.priority,
          workspace: data.workspace,
          executionMode: data.execution_mode,
          status: data.status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          estimatedTasks: Number(data.estimated_tasks),
          completedTasks: Number(data.completed_tasks),
          assignedAgents: data.assigned_agents || [],
          owner: data.owner
        };

        cacheManager.invalidate("missions_list");
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase createMission failed, falling back to mock:", err);
        const data = insertMissionTable(mission);
        return { data, error: null, loading: false };
      }
    }
  }

  async updateMission(id: string, updates: Partial<Mission>): Promise<RepoResponse<Mission>> {
    await delay(100);
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const data = updateMissionTable(id, updates);
        if (!data) throw new Error("Mission not found");
        cacheManager.invalidate("missions_list");
        cacheManager.invalidate(`mission_${id}`);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.goal !== undefined) dbUpdates.goal = updates.goal;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.workspace !== undefined) dbUpdates.workspace = updates.workspace;
        if (updates.executionMode !== undefined) dbUpdates.execution_mode = updates.executionMode;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.estimatedTasks !== undefined) dbUpdates.estimated_tasks = updates.estimatedTasks;
        if (updates.completedTasks !== undefined) dbUpdates.completed_tasks = updates.completedTasks;
        if (updates.assignedAgents !== undefined) dbUpdates.assigned_agents = updates.assignedAgents;

        const { error } = await supabase.from("missions").update(dbUpdates).eq("id", id);
        if (error) throw new Error(error.message);

        cacheManager.invalidate("missions_list");
        cacheManager.invalidate(`mission_${id}`);
        
        return this.getMission(id);
      } catch (err: any) {
        console.warn("Supabase updateMission failed, falling back to mock:", err);
        const data = updateMissionTable(id, updates);
        if (!data) return { data: null, error: new Error("Mission not found"), loading: false };
        return { data, error: null, loading: false };
      }
    }
  }

  async deleteMission(id: string): Promise<{ error: Error | null }> {
    await delay(100);
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      const ok = deleteMissionTable(id);
      cacheManager.invalidate("missions_list");
      cacheManager.invalidate(`mission_${id}`);
      return { error: ok ? null : new Error("Mission not found") };
    } else {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("missions").delete().eq("id", id);
        if (error) throw error;
        cacheManager.invalidate("missions_list");
        cacheManager.invalidate(`mission_${id}`);
        return { error: null };
      } catch (err: any) {
        console.warn("Supabase deleteMission failed, falling back to mock:", err);
        const ok = deleteMissionTable(id);
        return { error: ok ? null : new Error("Mission not found") };
      }
    }
  }

  async getMission(id: string): Promise<RepoResponse<Mission>> {
    const cacheKey = `mission_${id}`;
    const cached = cacheManager.get<Mission>(cacheKey);
    if (cached) return { data: cached, error: null, loading: false };

    await delay(100);
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      const data = missionsTable.find(m => m.id === id);
      if (!data) return { data: null, error: new Error("Mission not found"), loading: false };
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("missions").select("*").eq("id", id).single();
        if (error) throw error;

        const mapped: Mission = {
          id: data.id,
          title: data.title,
          goal: data.goal,
          description: data.description || "",
          priority: data.priority,
          workspace: data.workspace,
          executionMode: data.execution_mode,
          status: data.status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          estimatedTasks: Number(data.estimated_tasks),
          completedTasks: Number(data.completed_tasks),
          assignedAgents: data.assigned_agents || [],
          owner: data.owner
        };

        cacheManager.set(cacheKey, mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase getMission failed, falling back to mock:", err);
        const data = missionsTable.find(m => m.id === id);
        if (!data) return { data: null, error: new Error("Mission not found"), loading: false };
        return { data, error: null, loading: false };
      }
    }
  }

  async getAllMissions(): Promise<RepoResponse<Mission[]>> {
    const cacheKey = "missions_list";
    const cached = cacheManager.get<Mission[]>(cacheKey);
    if (cached) return { data: cached, error: null, loading: false };

    await delay(150);
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      const data = [...missionsTable];
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("missions").select("*");
        if (error) throw error;

        const mapped: Mission[] = (data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          goal: row.goal,
          description: row.description || "",
          priority: row.priority,
          workspace: row.workspace,
          executionMode: row.execution_mode,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          estimatedTasks: Number(row.estimated_tasks),
          completedTasks: Number(row.completed_tasks),
          assignedAgents: row.assigned_agents || [],
          owner: row.owner
        }));

        cacheManager.set(cacheKey, mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase getAllMissions failed, falling back to mock:", err);
        return { data: [...missionsTable], error: null, loading: false };
      }
    }
  }

  async pauseMission(id: string): Promise<{ error: Error | null }> {
    const res = await this.updateMission(id, { status: "PAUSED" });
    return { error: res.error };
  }

  async resumeMission(id: string): Promise<{ error: Error | null }> {
    const res = await this.updateMission(id, { status: "RUNNING" });
    return { error: res.error };
  }

  async cancelMission(id: string): Promise<{ error: Error | null }> {
    const res = await this.updateMission(id, { status: "CANCELLED" });
    return { error: res.error };
  }
}

export const missionRepository = new MissionRepository();
export default missionRepository;
