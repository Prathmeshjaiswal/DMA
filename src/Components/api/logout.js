
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// POST /logout with Authorization header
export const logout = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return { success: true, message: "Already logged out (no token found)." };
  }

  try {
    const res = await api.post(
      '/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data; // backend returns { success: true, message: "Logged out" }
  } catch (err) {
    return {
      success: false,
      message:
        err?.response?.data?.message ||
        "Logout failed, but local cleanup will happen.",
    };
  }
};
