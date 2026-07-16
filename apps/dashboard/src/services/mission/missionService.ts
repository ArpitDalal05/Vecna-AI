import { Mission } from "../../types";
import { missionRepository } from "../../repositories/missionRepository";
import { missionValidator } from "./missionValidator";
import { missionExecutor } from "./missionExecutor";
import { logger } from "../logging/logger";
import { eventBus } from "../runtime/eventBus";

export const missionService = {
  async createMission(mission: Omit<Mission, "id" | "createdAt" | "updatedAt">) {
    const validation = missionValidator.validate(mission);
    if (!validation.valid) {
      throw new Error(validation.error || "Validation failed");
    }

    logger.info("MISSION", "MISSION_CREATED", `Mission "${mission.title}" created in workspace ${mission.workspace}`);
    const res = await missionRepository.createMission(mission);
    if (res.error) throw res.error;
    
    eventBus.emit("MISSION_CREATED");
    return res.data;
  },

  async executeMission(id: string) {
    const res = await missionRepository.getMission(id);
    if (res.error || !res.data) throw res.error || new Error("Mission not found");

    const updatedRes = await missionRepository.updateMission(id, { status: "RUNNING" });
    if (updatedRes.error || !updatedRes.data) throw updatedRes.error || new Error("Could not update mission");

    logger.info("MISSION", "MISSION_STARTED", `Mission "${updatedRes.data.title}" execution started`);
    eventBus.emit("MISSION_STARTED");

    await missionExecutor.execute(updatedRes.data);
    return updatedRes.data;
  },

  async pauseMission(id: string) {
    const res = await missionRepository.pauseMission(id);
    if (res.error) throw res.error;
    logger.info("MISSION", "MISSION_PAUSED", `Mission ID ${id} paused`);
    eventBus.emit("MISSION_PAUSED");
  },

  async resumeMission(id: string) {
    const res = await missionRepository.resumeMission(id);
    if (res.error) throw res.error;
    logger.info("MISSION", "MISSION_RESUMED", `Mission ID ${id} resumed`);
    eventBus.emit("MISSION_RESUMED");
  },

  async cancelMission(id: string) {
    const res = await missionRepository.cancelMission(id);
    if (res.error) throw res.error;
    logger.info("MISSION", "MISSION_CANCELLED", `Mission ID ${id} cancelled`);
    eventBus.emit("MISSION_CANCELLED");
  }
};
