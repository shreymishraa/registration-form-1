import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Director from "./pages/Director";
import Teacher from "./pages/Teacher";
import Other from "./pages/Other";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/director" />} />

        <Route path="/director" element={<Director />} />

        <Route path="/teacher" element={<Teacher />} />

        <Route path="/other" element={<Other />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;