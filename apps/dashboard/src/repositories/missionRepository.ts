import { IMissionRepository, RepoResponse } from "./interfaces";
import { Mission } from "../types";
import { missionsTable, insertMissionTable, updateMissionTable, deleteMissionTable } from "../mock/missions";
import { cacheManager } from "../services/cache/cacheManager";
import { FEATURE_FLAGS } from "../config";
import { createClient } from "../lib/supabase/client";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function mapMissionRow(data: any): Mission {
  return {
    id: data.id,
    title: data.title,
    goal: data.goal,
    description: data.description || "",
    priority: data.priority,
    workspace: data.workspace,
    executionMode: data.execution_mode || data.executionMode,
    status: data.status,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
    estimatedTasks: Number(data.estimated_tasks || data.estimatedTasks || 0),
    completedTasks: Number(data.completed_tasks || data.completedTasks || 0),
    assignedAgents: data.assigned_agents || data.assignedAgents || [],
    owner: data.owner,
    currentPhase: data.current_phase || data.currentPhase,
    currentTask: data.current_task || data.currentTask,
    executionProgress: Number(data.execution_progress ?? data.executionProgress ?? 0),
    totalTasks: Number(data.total_tasks ?? data.totalTasks ?? 0),
    failedTasks: Number(data.failed_tasks ?? data.failedTasks ?? 0),
    startedAt: data.started_at || data.startedAt,
    completedAt: data.completed_at || data.completedAt,
    lastActivityAt: data.last_activity_at || data.lastActivityAt,
    executionError: data.execution_error || data.executionError,
    resultSummary: data.result_summary || data.resultSummary
  };
}

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
          owner: mission.owner,
          current_phase: mission.currentPhase,
          current_task: mission.currentTask,
          execution_progress: mission.executionProgress,
          total_tasks: mission.totalTasks,
          failed_tasks: mission.failedTasks,
          started_at: mission.startedAt,
          completed_at: mission.completedAt,
          last_activity_at: mission.lastActivityAt,
          execution_error: mission.executionError,
          result_summary: mission.resultSummary
        }).select().single();

        if (error) throw new Error(error.message);

        const mapped = mapMissionRow(data);
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
        cacheManager.set(`mission_${id}`, data);
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
        if (updates.currentPhase !== undefined) dbUpdates.current_phase = updates.currentPhase;
        if (updates.currentTask !== undefined) dbUpdates.current_task = updates.currentTask;
        if (updates.executionProgress !== undefined) dbUpdates.execution_progress = updates.executionProgress;
        if (updates.totalTasks !== undefined) dbUpdates.total_tasks = updates.totalTasks;
        if (updates.failedTasks !== undefined) dbUpdates.failed_tasks = updates.failedTasks;
        if (updates.startedAt !== undefined) dbUpdates.started_at = updates.startedAt;
        if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
        if (updates.lastActivityAt !== undefined) dbUpdates.last_activity_at = updates.lastActivityAt;
        if (updates.executionError !== undefined) dbUpdates.execution_error = updates.executionError;
        if (updates.resultSummary !== undefined) dbUpdates.result_summary = updates.resultSummary;

        const { error } = await supabase.from("missions").update(dbUpdates).eq("id", id);
        if (error) throw new Error(error.message);

        cacheManager.invalidate("missions_list");
        cacheManager.invalidate(`mission_${id}`);
        
        return this.getMission(id);
      } catch (err: any) {
        console.warn("Supabase updateMission failed, falling back to mock:", err);
        const data = updateMissionTable(id, updates);
        if (!data) return { data: null, error: new Error("Mission not found"), loading: false };
        cacheManager.set(`mission_${id}`, data);
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

        const mapped = mapMissionRow(data);
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
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      const data = [...missionsTable];
      return { data, error: null, loading: false };
    }

    const cacheKey = "missions_list";
    const cached = cacheManager.get<Mission[]>(cacheKey);
    if (cached) return { data: cached, error: null, loading: false };

    await delay(150);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("missions").select("*");
      if (error) throw error;

      const mapped: Mission[] = (data || []).map(mapMissionRow);
      cacheManager.set(cacheKey, mapped);
      return { data: mapped, error: null, loading: false };
    } catch (err: any) {
      console.warn("Supabase getAllMissions failed, falling back to mock:", err);
      return { data: [...missionsTable], error: null, loading: false };
    }
  }

  async pauseMission(id: string): Promise<{ error: Error | null }> {
    const res = await this.updateMission(id, { status: "PAUSED", currentPhase: "BLOCKED" });
    return { error: res.error };
  }

  async resumeMission(id: string): Promise<{ error: Error | null }> {
    const res = await this.updateMission(id, { status: "RUNNING", currentPhase: "EXECUTING" });
    return { error: res.error };
  }

  async cancelMission(id: string): Promise<{ error: Error | null }> {
    const res = await this.updateMission(id, { status: "CANCELLED", currentPhase: "CANCELLED" });
    return { error: res.error };
  }
}

export const missionRepository = new MissionRepository();
export default missionRepository;
