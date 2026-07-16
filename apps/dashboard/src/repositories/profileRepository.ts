import { IProfileRepository, RepoResponse } from "./interfaces";
import { profileTable, ProfileRow, updateProfileTable } from "../mock/profile";
import { cacheManager } from "../services/cache/cacheManager";
import { FEATURE_FLAGS } from "../config";
import { createClient } from "../lib/supabase/client";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ProfileRepository implements IProfileRepository {
  async getProfile(): Promise<RepoResponse<ProfileRow>> {
    const cacheKey = "user_profile";
    const cached = cacheManager.get<ProfileRow>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(150 + Math.random() * 150);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const data = { ...profileTable };
        cacheManager.set(cacheKey, data);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error(authErr?.message || "No authenticated user");

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (error) throw new Error(error.message);

        const mapped: ProfileRow = {
          id: data.id,
          email: data.email,
          fullName: data.full_name || "",
          designation: data.designation || "Core Cognitive Unit",
          role: data.role || "ADMINISTRATOR",
          nodeId: data.node_id || "",
          syncRank: data.sync_rank || "Initiate (L1)",
          organization: data.organization || "Vecna Swarm Systems",
          permissions: data.permissions || [],
          preferences: typeof data.preferences === "string" 
            ? JSON.parse(data.preferences) 
            : (data.preferences || { theme: "DARK", enableNotifications: true, syncFrequency: 3000 }),
          createdAt: data.created_at,
          lastSignIn: data.last_sign_in || data.created_at
        };

        cacheManager.set(cacheKey, mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase profile fetch failed, falling back to mock profile:", err);
        return { data: { ...profileTable }, error: null, loading: false };
      }
    }
  }

  async updateProfile(updates: Partial<ProfileRow>): Promise<RepoResponse<ProfileRow>> {
    await delay(250);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        updateProfileTable(updates);
        const data = { ...profileTable };
        cacheManager.set("user_profile", data);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error(authErr?.message || "No authenticated user");

        const dbUpdates: any = {};
        if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
        if (updates.designation !== undefined) dbUpdates.designation = updates.designation;
        if (updates.role !== undefined) dbUpdates.role = updates.role;
        if (updates.preferences !== undefined) dbUpdates.preferences = updates.preferences;

        const { error } = await supabase.from("profiles").update(dbUpdates).eq("id", user.id);
        if (error) throw new Error(error.message);

        const { data: updatedData, error: fetchErr } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (fetchErr) throw new Error(fetchErr.message);

        const mapped: ProfileRow = {
          id: updatedData.id,
          email: updatedData.email,
          fullName: updatedData.full_name || "",
          designation: updatedData.designation || "Core Cognitive Unit",
          role: updatedData.role || "ADMINISTRATOR",
          nodeId: updatedData.node_id || "",
          syncRank: updatedData.sync_rank || "Initiate (L1)",
          organization: updatedData.organization || "Vecna Swarm Systems",
          permissions: updatedData.permissions || [],
          preferences: typeof updatedData.preferences === "string" 
            ? JSON.parse(updatedData.preferences) 
            : (updatedData.preferences || { theme: "DARK", enableNotifications: true, syncFrequency: 3000 }),
          createdAt: updatedData.created_at,
          lastSignIn: updatedData.last_sign_in || updatedData.created_at
        };

        cacheManager.set("user_profile", mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase profile update failed, falling back to mock profile updates:", err);
        updateProfileTable(updates);
        return { data: { ...profileTable }, error: null, loading: false };
      }
    }
  }
}

export const profileRepository = new ProfileRepository();
export default profileRepository;
