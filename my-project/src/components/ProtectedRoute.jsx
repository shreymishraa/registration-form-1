import { Navigate } from "react-router-dom";
import { hasAuthToken } from "../lib/auth";

function ProtectedRoute({ children }) {

  if (!hasAuthToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
