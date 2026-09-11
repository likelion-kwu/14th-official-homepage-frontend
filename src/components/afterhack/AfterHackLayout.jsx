import { Outlet } from "react-router-dom";
import { CurtainProvider } from "./CurtainProvider";
import "../../styles/afterhack.css";

export default function AfterHackLayout() {
  return (
    <div className="after-hack">
      <CurtainProvider>
        <Outlet />
      </CurtainProvider>
    </div>
  );
}
