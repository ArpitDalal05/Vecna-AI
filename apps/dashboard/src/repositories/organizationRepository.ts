import { IOrganizationRepository, RepoResponse } from "./interfaces";
import { departmentsTable, employeesTable, decisionsTable } from "../mock/organization";
import { Department, Employee, Decision } from "../types";
import { cacheManager } from "../services/cache/cacheManager";
import { FEATURE_FLAGS } from "../config";
import { createClient } from "../lib/supabase/client";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class OrganizationRepository implements IOrganizationRepository {
  async getDepartments(): Promise<RepoResponse<Department[]>> {
    const cacheKey = "org_departments";
    const cached = cacheManager.get<Department[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(150 + Math.random() * 150);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const data = [...departmentsTable];
        cacheManager.set(cacheKey, data);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("departments").select("*");
        if (error) throw new Error(error.message);

        const mapped: Department[] = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description || "",
          managerId: row.manager_id || undefined,
          createdAt: row.created_at
        }));

        cacheManager.set(cacheKey, mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase departments fetch failed, falling back to mock departments:", err);
        return { data: [...departmentsTable], error: null, loading: false };
      }
    }
  }

  async getEmployees(): Promise<RepoResponse<Employee[]>> {
    const cacheKey = "org_employees";
    const cached = cacheManager.get<Employee[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(200 + Math.random() * 150);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const data = [...employeesTable];
        cacheManager.set(cacheKey, data);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("employees").select("*");
        if (error) throw new Error(error.message);

        const mapped: Employee[] = (data || []).map((row: any) => ({
          id: row.id,
          fullName: row.full_name,
          designation: row.designation || "",
          departmentId: row.department_id || "",
          status: row.status,
          reliabilityRating: Number(row.reliability_rating),
          createdAt: row.created_at
        }));

        cacheManager.set(cacheKey, mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase employees fetch failed, falling back to mock employees:", err);
        return { data: [...employeesTable], error: null, loading: false };
      }
    }
  }

  async getDecisions(): Promise<RepoResponse<Decision[]>> {
    const cacheKey = "org_decisions";
    const cached = cacheManager.get<Decision[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(200 + Math.random() * 200);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const data = [...decisionsTable];
        cacheManager.set(cacheKey, data);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("decisions").select("*");
        if (error) throw new Error(error.message);

        const mapped: Decision[] = (data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description || "",
          status: row.status,
          consensusPercentage: Number(row.consensus_percentage),
          yesVotes: Number(row.yes_votes),
          noVotes: Number(row.no_votes),
          createdAt: row.created_at
        }));

        cacheManager.set(cacheKey, mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase decisions fetch failed, falling back to mock decisions:", err);
        return { data: [...decisionsTable], error: null, loading: false };
      }
    }
  }
}

export const organizationRepository = new OrganizationRepository();
export default organizationRepository;
