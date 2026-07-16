import { ISettingsRepository, RepoResponse } from "./interfaces";
import { workspacesTable, activeWorkspaceId, setActiveWorkspaceId, WorkspaceRow } from "../mock/workspace";
import { cacheManager } from "../services/cache/cacheManager";
import { FEATURE_FLAGS } from "../config";
import { createClient } from "../lib/supabase/client";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class SettingsRepository implements ISettingsRepository {
  async getWorkspaces(): Promise<RepoResponse<WorkspaceRow[]>> {
    const cacheKey = "settings_workspaces";
    const cached = cacheManager.get<WorkspaceRow[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(150);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const data = [...workspacesTable];
        cacheManager.set(cacheKey, data);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("workspaces").select("*");
        if (error) throw new Error(error.message);

        const mapped: WorkspaceRow[] = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description || "",
          agentCount: Number(row.agent_count)
        }));

        cacheManager.set(cacheKey, mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase fetch failed, falling back to mock workspaces:", err);
        return { data: [...workspacesTable], error: null, loading: false };
      }
    }
  }

  async getActiveWorkspace(): Promise<RepoResponse<WorkspaceRow>> {
    const cacheKey = "active_workspace";
    const cached = cacheManager.get<WorkspaceRow>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(100);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const active = workspacesTable.find(w => w.id === activeWorkspaceId) || workspacesTable[0];
        cacheManager.set(cacheKey, active);
        return { data: active, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const workspacesRes = await this.getWorkspaces();
        // Return active workspace matching activeWorkspaceId or default to the first workspace
        const active = (workspacesRes.data || []).find(w => w.id === activeWorkspaceId) 
          || (workspacesRes.data ? workspacesRes.data[0] : workspacesTable[0]);
        
        cacheManager.set(cacheKey, active);
        return { data: active, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase active workspace fetch failed, falling back to mock active workspace:", err);
        const active = workspacesTable.find(w => w.id === activeWorkspaceId) || workspacesTable[0];
        return { data: active, error: null, loading: false };
      }
    }
  }

  async setActiveWorkspace(id: string): Promise<{ error: Error | null }> {
    await delay(100);
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        setActiveWorkspaceId(id);
        cacheManager.invalidate("active_workspace");
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    } else {
      try {
        setActiveWorkspaceId(id);
        cacheManager.invalidate("active_workspace");
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    }
  }
}

export const settingsRepository = new SettingsRepository();
export default settingsRepository;
