import { ISystemRepository, RepoResponse } from "./interfaces";
import { systemMetricsTable, SystemMetricRow } from "../mock/system";
import { cacheManager } from "../services/cache/cacheManager";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class SystemRepository implements ISystemRepository {
  async getMetrics(): Promise<RepoResponse<SystemMetricRow[]>> {
    const cacheKey = "system_metrics";
    const cached = cacheManager.get<SystemMetricRow[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(200 + Math.random() * 200);
    try {
      const data = [...systemMetricsTable];
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }

  async getHealth(): Promise<RepoResponse<number>> {
    const cacheKey = "system_health";
    const cached = cacheManager.get<number>(cacheKey);
    if (cached !== null) {
      return { data: cached, error: null, loading: false };
    }

    await delay(100 + Math.random() * 100);
    try {
      const healthRow = systemMetricsTable.find(r => r.id === "health");
      const data = healthRow ? healthRow.value : 100;
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }
}

export const systemRepository = new SystemRepository();
export default systemRepository;
