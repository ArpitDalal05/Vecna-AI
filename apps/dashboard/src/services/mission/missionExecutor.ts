import { Mission } from "../../types";
import { autonomousExecutor } from "../../runtime/execution/autonomousExecutor";

export const missionExecutor = {
  async execute(mission: Mission): Promise<void> {
    await autonomousExecutor.executeMission(mission);
  }
};
export default missionExecutor;
