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
//       message.success(res.message);
    } catch (e) {
      message.error("Server not reachable. Logging out locally.");
    } finally {
        localStorage.clear();
      setIsAuthenticated(false);
      navigate("/Login", { replace: true });
    }
  };
 
  return handleLogout;
};
 
export default Logout;
 