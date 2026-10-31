import { useNavigate } from "react-router-dom";
import { clearAuth } from "../lib/auth";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Settings,
  LogOut
} from "lucide-react";

function Sidebar() {

  const navigate = useNavigate();

  const logout = () => {
    clearAuth();

    navigate("/login");
  };

  return (
    <aside className="sidebar">

      <h2>HiPATH</h2>

      <ul>

        <li>
          <LayoutDashboard size={20} />
          Dashboard
        </li>

        <li>
          <Users size={20} />
          Students
        </li>

        <li>
          <GraduationCap size={20} />
          Teachers
        </li>

        <li>
          <Settings size={20} />
          Settings
        </li>

        <li onClick={logout}>
          <LogOut size={20} />
          Logout
        </li>

      </ul>

    </aside>
  );
}

export default Sidebar;
