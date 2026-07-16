import { IAnalyticsRepository, RepoResponse } from "./interfaces";
import { analyticsTable, ChartDataPoint } from "../mock/analytics";
import { cacheManager } from "../services/cache/cacheManager";
import { FEATURE_FLAGS } from "../config";
import { createClient } from "../lib/supabase/client";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AnalyticsRepository implements IAnalyticsRepository {
  async getChartHistory(): Promise<RepoResponse<ChartDataPoint[]>> {
    const cacheKey = "analytics_history";
    const cached = cacheManager.get<ChartDataPoint[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(180 + Math.random() * 180);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const data = [...analyticsTable];
        cacheManager.set(cacheKey, data);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("analytics").select("*").order("timestamp", { ascending: true });
        if (error) throw new Error(error.message);

        const mapped: ChartDataPoint[] = (data || []).map((row: any) => ({
          timestamp: row.timestamp,
          cpu: Number(row.cpu),
          memory: Number(row.memory),
          latency: Number(row.latency),
          bandwidth: Number(row.bandwidth)
        }));

        cacheManager.set(cacheKey, mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase fetch failed, falling back to mock analytics:", err);
        return { data: [...analyticsTable], error: null, loading: false };
      }
    }
  }
}

export const analyticsRepository = new AnalyticsRepository();
export default analyticsRepository;
