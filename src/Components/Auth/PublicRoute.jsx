
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/DashBoard" replace /> : children;
}
