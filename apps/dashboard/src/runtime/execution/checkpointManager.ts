import { Mission, MissionTask } from "../../types";
import { Artifact } from "../../artifacts/artifactTypes";
import { logger } from "../../services/logging/logger";

export interface MissionCheckpoint {
  id: string;
  missionId: string;
  timestamp: string;
  stepName: string;
  currentPhase: Mission["currentPhase"];
  executionProgress: number;
  completedTasks: number;
  totalTasks: number;
  tasks: MissionTask[];
  artifacts: Artifact[];
  lastError?: string;
}

export const checkpointStore: Map<string, MissionCheckpoint[]> = new Map();

export const checkpointManager = {
  createCheckpoint(
    mission: Mission,
    stepName: string,
    tasks: MissionTask[],
    artifacts: Artifact[],
    lastError?: string
  ): MissionCheckpoint {
    const checkpoint: MissionCheckpoint = {
      id: `chk_${Math.random().toString(36).substring(2, 9)}`,
      missionId: mission.id,
      timestamp: new Date().toISOString(),
      stepName,
      currentPhase: mission.currentPhase || "EXECUTING",
      executionProgress: mission.executionProgress || 0,
      completedTasks: mission.completedTasks || 0,
      totalTasks: mission.totalTasks || tasks.length,
      tasks: [...tasks],
      artifacts: [...artifacts],
      lastError
    };

    const list = checkpointStore.get(mission.id) || [];
    list.push(checkpoint);
    checkpointStore.set(mission.id, list);

    logger.info("CHECKPOINT", "CREATED", `Checkpoint "${stepName}" created for mission ${mission.id}`);
    return checkpoint;
  },

  getLatestCheckpoint(missionId: string): MissionCheckpoint | null {
    const list = checkpointStore.get(missionId);
    if (!list || list.length === 0) return null;
    return list[list.length - 1];
  },

  getCheckpoints(missionId: string): MissionCheckpoint[] {
    return checkpointStore.get(missionId) || [];
  },

  restoreCheckpoint(checkpointId: string): MissionCheckpoint | null {
    for (const list of checkpointStore.values()) {
      const found = list.find(c => c.id === checkpointId);
      if (found) {
        logger.info("CHECKPOINT", "RESTORED", `Restored checkpoint "${found.stepName}" for mission ${found.missionId}`);
        return found;
      }
    }
    return null;
  }
};

export default checkpointManager;
