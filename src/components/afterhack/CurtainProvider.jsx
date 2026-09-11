import { useCallback, useRef, useState } from "react";
import { wait } from "../../lib/afterhack/motion";
import { CurtainContext } from "./curtainContext";

export function CurtainProvider({ children }) {
  const [closed, setClosed] = useState(false);
  const busyRef = useRef(false);

  const runTransition = useCallback(async (navigate) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setClosed(true);
    await wait(600);
    navigate();
    await wait(100);
    setClosed(false);
    busyRef.current = false;
  }, []);

  return (
    <CurtainContext.Provider value={{ runTransition }}>
      {children}
      <div id="curtain" className={closed ? "closed" : ""} />
    </CurtainContext.Provider>
  );
}
