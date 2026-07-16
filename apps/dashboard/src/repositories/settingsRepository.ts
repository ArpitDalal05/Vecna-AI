import { ISettingsRepository, RepoResponse } from "./interfaces";
import { workspacesTable, activeWorkspaceId, setActiveWorkspaceId, WorkspaceRow } from "../mock/workspace";
import { cacheManager } from "../services/cache/cacheManager";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class SettingsRepository implements ISettingsRepository {
  async getWorkspaces(): Promise<RepoResponse<WorkspaceRow[]>> {
    const cacheKey = "settings_workspaces";
    const cached = cacheManager.get<WorkspaceRow[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(150);
    try {
      const data = [...workspacesTable];
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }

  async getActiveWorkspace(): Promise<RepoResponse<WorkspaceRow>> {
    const cacheKey = "active_workspace";
    const cached = cacheManager.get<WorkspaceRow>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(100);
    try {
      const active = workspacesTable.find(w => w.id === activeWorkspaceId) || workspacesTable[0];
      cacheManager.set(cacheKey, active);
      return { data: active, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }

  async setActiveWorkspace(id: string): Promise<{ error: Error | null }> {
    await delay(100);
    try {
      setActiveWorkspaceId(id);
      cacheManager.invalidate("active_workspace");
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }
}

export const settingsRepository = new SettingsRepository();
export default settingsRepository;
