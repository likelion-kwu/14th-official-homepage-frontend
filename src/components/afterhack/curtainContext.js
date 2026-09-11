import { createContext, useContext } from "react";

export const CurtainContext = createContext(null);

export function useCurtain() {
  const ctx = useContext(CurtainContext);
  if (!ctx) throw new Error("useCurtain must be used within CurtainProvider");
  return ctx;
}
