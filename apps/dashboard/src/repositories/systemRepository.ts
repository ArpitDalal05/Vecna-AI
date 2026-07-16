import { ISystemRepository, RepoResponse } from "./interfaces";
import { systemMetricsTable, SystemMetricRow } from "../mock/system";
import { cacheManager } from "../services/cache/cacheManager";
import { FEATURE_FLAGS } from "../config";
import { createClient } from "../lib/supabase/client";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class SystemRepository implements ISystemRepository {
  async getMetrics(): Promise<RepoResponse<SystemMetricRow[]>> {
    const cacheKey = "system_metrics";
    const cached = cacheManager.get<SystemMetricRow[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(150 + Math.random() * 150);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const data = [...systemMetricsTable];
        cacheManager.set(cacheKey, data);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("runtime_metrics").select("*");
        if (error) throw new Error(error.message);

        const mapped = (data || []).map((row: any) => ({
          id: row.metric_id,
          name: row.name,
          value: Number(row.value),
          unit: row.unit || "",
          updatedAt: row.updated_at
        }));
        
        cacheManager.set(cacheKey, mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase fetch failed, falling back to mock data:", err);
        return { data: [...systemMetricsTable], error: null, loading: false };
      }
    }
  }

  async getHealth(): Promise<RepoResponse<number>> {
    const cacheKey = "system_health";
    const cached = cacheManager.get<number>(cacheKey);
    if (cached !== null) {
      return { data: cached, error: null, loading: false };
    }

    await delay(100 + Math.random() * 100);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const healthRow = systemMetricsTable.find(r => r.id === "health");
        const data = healthRow ? healthRow.value : 100;
        cacheManager.set(cacheKey, data);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("runtime_metrics").select("value").eq("metric_id", "health").single();
        if (error) throw new Error(error.message);
        
        const val = Number(data.value);
        cacheManager.set(cacheKey, val);
        return { data: val, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase health fetch failed, falling back to mock data:", err);
        const healthRow = systemMetricsTable.find(r => r.id === "health");
        return { data: healthRow ? healthRow.value : 100, error: null, loading: false };
      }
    }
  }
}

export const systemRepository = new SystemRepository();
export default systemRepository;
