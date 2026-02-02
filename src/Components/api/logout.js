import api from "./client"; // USE your axios instance with interceptors
 
// POST /auth_user/logout
export const logout = async () => {
  const token = localStorage.getItem("token");
 
  if (!token) {
    return {
      success: true,
      message: "Already logged out (no token found)",
    };
  }
 
  try {
    const res = await api.post("/auth_user/logout");
    return {
      success: true,
      // message: res?.data?.message || "Logout successful",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err?.response?.data?.message ||
        "Logout failed, local cleanup will be done",
    };
  }
};