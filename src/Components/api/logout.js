import api from "./client"; // USE your axios instance with interceptors



// export const logout = async () => {
//   try {
//     await api.post("/auth_user/logout");
//   } catch (e) {
//     // ignore backend failure
//   } finally {
//     localStorage.clear();
//     window.location.href = "/login";
//   }
// };

 
// // POST /auth_user/logout
// export const logout = async () => {
//   const token = localStorage.getItem("token");
 
//   if (!token) {
//     return {
//       success: true,
//       message: "Already logged out (no token found)",
//     };
//   }
 
//   try {
//     const res = await api.post("/auth_user/logout");
//     return {
//       success: true,
//       // message: res?.data?.message || "Logout successful",
//     };
//   } catch (err) {
//     return {
//       success: false,
//       message:
//         err?.response?.data?.message ||
//         "Logout failed, local cleanup will be done",
//     };
//   }
// };


// import api from "./client";

/**
 * ✅ Logout must ALWAYS:
 * 1. Try backend logout (best effort)
 * 2. Clear local storage
 * 3. Force redirect to login
 */
export const logout = async () => {
  try {
    // ✅ Best-effort backend logout
    await api.post("/auth_user/logout");
  } catch (e) {
    // ✅ Ignore 401 / 403 / 500
    // Token may already be expired
  } finally {
    // ✅ HARD cleanup (must happen)
    localStorage.clear();
    sessionStorage.clear();

    // ✅ HARD redirect -> kills all React state, timers, polling
    window.location.href = "/login";
  }
};
