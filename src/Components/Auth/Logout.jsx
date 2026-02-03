// Components/Auth/Logout.jsx
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/logout";
import { useAuth } from "../Auth/AuthProvider";
import { usePermissions } from "../Auth/PermissionProvider";

/** Logout: Returns an async handler that logs out, clears auth & permissions, and redirects to /Login. */
const Logout = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const { clear } = usePermissions() || {};

  /** handleLogout: Best-effort server call, then local cleanup + redirect. */
  const handleLogout = async () => {
    try {
      await logout(); // best-effort server call
      // message.success(res?.message || "Logged out");
    } catch {
      message.warning("Server not reachable. Logging out locally.");
    } finally {
      // Local cleanup
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("roles");

        // Prefer reactive permission clear (updates UI immediately)
        if (typeof clear === "function") {
          clear();
        } else {
          // Fallback: clear localStorage and broadcast for other tabs
          localStorage.removeItem("perm");
          try {
            window.dispatchEvent(
              new StorageEvent("storage", { key: "perm", newValue: null })
            );
          } catch {
            // Some browsers block manual StorageEvent; safe to ignore
          }
        }

        setIsAuthenticated(false);
      } finally {
        navigate("/Login", { replace: true });
      }
    }
  };

  return handleLogout;
};

export default Logout;