import { useContext } from "react";
import { HiveStateContext, HiveStateContextType } from "../providers/HiveStateProvider";

export function useHiveState(): HiveStateContextType {
  const context = useContext(HiveStateContext);
  if (context === undefined) {
    throw new Error("useHiveState must be used within a HiveStateProvider");
  }
  return context;
}

export default useHiveState;
