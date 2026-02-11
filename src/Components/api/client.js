// src/pages/api/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
 
  headers: { Accept: 'application/json' }, // (optional)
});

// ---- Request Interceptor ----
api.interceptors.request.use((config) => {
  // ✅ Attach token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ Only set JSON content-type when NOT sending FormData
  //    This preserves browser's automatic multipart/form-data + boundary for FormData.
  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData;

  if (!isFormData) {
    // Only set if caller hasn’t already provided one
    if (!config.headers['Content-Type'] && !config.headers['content-type']) {
      config.headers['Content-Type'] = 'application/json';
    }
  } else {
    // Ensure we DO NOT carry a leftover JSON content-type on FormData requests
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }

  return config;
});

// ---- Response Interceptor (unchanged except small hardening) ----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Token expired or unauthorized
      try {
        alert('Session expired. Please login again.');
      } catch (_) {}
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
