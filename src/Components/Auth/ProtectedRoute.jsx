import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({children}){
    const {isAuthenticated}=useAuth();
    return isAuthenticated? children:<Navigate to="/Login" replace/>
}
