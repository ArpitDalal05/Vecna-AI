import { useState, useCallback } from "react";
import { useHiveState } from "./useHiveState";
import { Mission } from "../types";
import { missionService } from "../services/mission/missionService";

export function useMission() {
  const { 
    missions, 
    activeMission, 
    loadMissions 
  } = useHiveState() as any;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);

  const createMission = useCallback(async (missionInput: Omit<Mission, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true);
    setErrors(null);
    try {
      const created = await missionService.createMission(missionInput);
      if (loadMissions) await loadMissions();
      return created;
    } catch (err: any) {
      setErrors(err.message || "Failed to create mission");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadMissions]);

  const executeMission = useCallback(async (id: string) => {
    setLoading(true);
    setErrors(null);
    try {
      const executed = await missionService.executeMission(id);
      if (loadMissions) await loadMissions();
      return executed;
    } catch (err: any) {
      setErrors(err.message || "Failed to execute mission");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadMissions]);

  const pauseMission = useCallback(async (id: string) => {
    setLoading(true);
    setErrors(null);
    try {
      await missionService.pauseMission(id);
      if (loadMissions) await loadMissions();
    } catch (err: any) {
      setErrors(err.message || "Failed to pause mission");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadMissions]);

  const resumeMission = useCallback(async (id: string) => {
    setLoading(true);
    setErrors(null);
    try {
      await missionService.resumeMission(id);
      if (loadMissions) await loadMissions();
    } catch (err: any) {
      setErrors(err.message || "Failed to resume mission");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadMissions]);

  const cancelMission = useCallback(async (id: string) => {
    setLoading(true);
    setErrors(null);
    try {
      await missionService.cancelMission(id);
      if (loadMissions) await loadMissions();
    } catch (err: any) {
      setErrors(err.message || "Failed to cancel mission");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadMissions]);

  return {
    createMission,
    executeMission,
    pauseMission,
    resumeMission,
    cancelMission,
    missions: missions || [],
    activeMission: activeMission || null,
    loading,
    errors
  };
}

export default useMission;
