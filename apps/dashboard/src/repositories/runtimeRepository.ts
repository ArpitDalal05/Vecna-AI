import { IRuntimeRepository, RepoResponse } from "./interfaces";
import { assignmentsTable } from "../mock/runtime";
import { Assignment } from "../types";
import { cacheManager } from "../services/cache/cacheManager";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class RuntimeRepository implements IRuntimeRepository {
  async getAssignments(): Promise<RepoResponse<Assignment[]>> {
    const cacheKey = "runtime_assignments";
    const cached = cacheManager.get<Assignment[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(150 + Math.random() * 150);
    try {
      const data = [...assignmentsTable];
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }
}

export const runtimeRepository = new RuntimeRepository();
export default runtimeRepository;
