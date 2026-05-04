// // src/pages/api/client.js
// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:8080', 
//   // baseURL: 'http://51.20.178.59:8080',
 
// });

// // ---- Request Interceptor ----
// api.interceptors.request.use((config) => {
//   // ✅ Attach token
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   // ✅ Only set JSON content-type when NOT sending FormData
//   //    This preserves browser's automatic multipart/form-data + boundary for FormData.
//   const isFormData =
//     typeof FormData !== 'undefined' && config.data instanceof FormData;

//   if (!isFormData) {
//     // Only set if caller hasn’t already provided one
//     if (!config.headers['Content-Type'] && !config.headers['content-type']) {
//       config.headers['Content-Type'] = 'application/json';
//     }
//   } else {
//     // Ensure we DO NOT carry a leftover JSON content-type on FormData requests
//     delete config.headers['Content-Type'];
//     delete config.headers['content-type'];
//   }

//   return config;
// });

// // ---- Response Interceptor (unchanged except small hardening) ----
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error?.response?.status;

//     if (status === 401) {
//       // Token expired or unauthorized
//       try {
//         alert('Session expired. Please login again.');
//       } catch (_) {}
//       localStorage.clear();
//       window.location.href = '/login';
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;



// src/pages/api/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  // baseURL: 'http://51.20.178.59:8080',
});

// -------- REQUEST INTERCEPTOR --------
api.interceptors.request.use((config) => {
  // ✅ DO NOT attach access token for refresh API
  if (!config.url.includes('/auth_user/refresh')) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  const isFormData =
    typeof FormData !== 'undefined' &&
    config.data instanceof FormData;

  if (!isFormData) {
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
  }

  return config;
});

// -------- RESPONSE INTERCEPTOR (REFRESH LOGIC) --------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Prevent infinite retry loop
    if (
      error?.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth_user/refresh')
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        hardLogout();
        return Promise.reject(error);
      }

      try {
        const res = await api.post('/auth_user/refresh', {
          refreshToken,
        });

        const newAccessToken = res.data.token;
        localStorage.setItem('token', newAccessToken);

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest); // ✅ retry original request
      } catch (err) {
        hardLogout();
      }
    }

    return Promise.reject(error);
  }
);

function hardLogout() {
  localStorage.clear();
  window.location.href = '/login';
}

export default api;
