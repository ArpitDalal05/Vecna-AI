import { IProfileRepository, RepoResponse } from "./interfaces";
import { profileTable, ProfileRow, updateProfileTable } from "../mock/profile";
import { cacheManager } from "../services/cache/cacheManager";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ProfileRepository implements IProfileRepository {
  async getProfile(): Promise<RepoResponse<ProfileRow>> {
    const cacheKey = "user_profile";
    const cached = cacheManager.get<ProfileRow>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(150 + Math.random() * 150);
    try {
      const data = { ...profileTable };
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }

  async updateProfile(updates: Partial<ProfileRow>): Promise<RepoResponse<ProfileRow>> {
    await delay(250);
    try {
      updateProfileTable(updates);
      const data = { ...profileTable };
      cacheManager.set("user_profile", data);
      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }
}

export const profileRepository = new ProfileRepository();
export default profileRepository;
