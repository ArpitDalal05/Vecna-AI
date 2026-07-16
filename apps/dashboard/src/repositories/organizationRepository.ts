import { IOrganizationRepository, RepoResponse } from "./interfaces";
import { departmentsTable, employeesTable, decisionsTable } from "../mock/organization";
import { Department, Employee, Decision } from "../types";
import { cacheManager } from "../services/cache/cacheManager";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class OrganizationRepository implements IOrganizationRepository {
  async getDepartments(): Promise<RepoResponse<Department[]>> {
    const cacheKey = "org_departments";
    const cached = cacheManager.get<Department[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(150 + Math.random() * 150);
    try {
      const data = [...departmentsTable];
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }

  async getEmployees(): Promise<RepoResponse<Employee[]>> {
    const cacheKey = "org_employees";
    const cached = cacheManager.get<Employee[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(200 + Math.random() * 150);
    try {
      const data = [...employeesTable];
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }

  async getDecisions(): Promise<RepoResponse<Decision[]>> {
    const cacheKey = "org_decisions";
    const cached = cacheManager.get<Decision[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(200 + Math.random() * 200);
    try {
      const data = [...decisionsTable];
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }
}

export const organizationRepository = new OrganizationRepository();
export default organizationRepository;
