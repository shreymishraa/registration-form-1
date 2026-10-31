import { Bell, User } from "lucide-react";

function Navbar() {

  const email = localStorage.getItem("userEmail");

  return (
    <nav className="navbar">

      <h2>HiPATH</h2>

      <div className="navbar-right">

        <Bell size={22} />

        <User size={22} />

        <span>{email || "Administrator"}</span>

      </div>

    </nav>
  );
}

export default Navbar;