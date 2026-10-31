import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck
} from "lucide-react";

function Dashboard() {

  const stats = [
    {
      title: "Total Students",
      value: "1,250",
      icon: Users
    },
    {
      title: "Total Teachers",
      value: "85",
      icon: GraduationCap
    },
    {
      title: "Other Staff",
      value: "32",
      icon: BookOpen
    },
    {
      title: "Attendance",
      value: "94%",
      icon: CalendarCheck
    }
  ];

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Navbar />

        <div className="dashboard-content">

          <h1>Dashboard</h1>

          <p>Welcome to HiPATH School Management System.</p>

          <div className="stats-grid">

            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div className="stat-card" key={item.title}>

                  <Icon size={30} />

                  <h3>{item.title}</h3>

                  <h2>{item.value}</h2>

                </div>
              );
            })}

          </div>

          <div className="welcome-card">

            <h2>Welcome to HiPATH!</h2>

            <p>
              Manage your school, teachers, students and
              educational activities from one place.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;