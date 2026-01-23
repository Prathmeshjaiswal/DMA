import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/logout";
import { useAuth } from "../Auth/AuthProvider";
 
const Logout = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
 
  const handleLogout = async () => {
    try {
      const res = await logout();
      message.success(res.message);
    } catch (e) {
      message.error("Server not reachable. Logging out locally.");
    } finally {
      //  local cleanup
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("roles");
 
      setIsAuthenticated(false);
      navigate("/Login", { replace: true });
    }
  };
 
  return handleLogout;
};
 
export default Logout;
 