import { Mission } from "../../types";

export const missionValidator = {
  validate(mission: Omit<Mission, "id" | "createdAt" | "updatedAt">): { valid: boolean; error: string | null } {
    if (!mission.title || mission.title.trim().length === 0) {
      return { valid: false, error: "Mission Title is required" };
    }
    if (!mission.goal || mission.goal.trim().length === 0) {
      return { valid: false, error: "Mission Goal is required" };
    }
    return { valid: true, error: null };
  }
};
