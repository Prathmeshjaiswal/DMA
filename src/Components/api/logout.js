import axios from 'axios';
import api from './client.js'

export const logout = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return { success: true
    , message: "Already logged out (no token found)." };
  }

  try {
    const res = await api.post(
      '/auth_user/logout',
      {},
    );
    localStorage.clear();
    return res.data;
  } catch (err) {
    return {
      success: false,
      message:
        err?.response?.data?.message ||
        "Logout failed, but local cleanup will happen.",
    };
  }
};
