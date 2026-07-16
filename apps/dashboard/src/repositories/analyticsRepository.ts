import { IAnalyticsRepository, RepoResponse } from "./interfaces";
import { analyticsTable, ChartDataPoint } from "../mock/analytics";
import { cacheManager } from "../services/cache/cacheManager";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AnalyticsRepository implements IAnalyticsRepository {
  async getChartHistory(): Promise<RepoResponse<ChartDataPoint[]>> {
    const cacheKey = "analytics_history";
    const cached = cacheManager.get<ChartDataPoint[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(180 + Math.random() * 180);
    try {
      const data = [...analyticsTable];
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }
}

export const analyticsRepository = new AnalyticsRepository();
export default analyticsRepository;
