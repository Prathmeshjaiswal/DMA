//
//import axios from 'axios';
//
//const api = axios.create({
//  baseURL: 'http://localhost:8080',
//  headers: { 'Content-Type': 'application/json' },
//});
//
//api.interceptors.request.use((config) => {
//  const token = localStorage.getItem('token');
//  if (token) {
//    config.headers.Authorization = `Bearer ${token}`;
//  }
//  return config;
//}, (error) => Promise.reject(error));
//
//export default api;


import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//update by simran
// Response interceptor to handle expired token
api.interceptors.response.use(
  (response) => response, // return response normally if ok
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      // clear token & user info
      window.location.href = "/login"; // redirect to login
      alert("Session expired. Please login again.");
      localStorage.clear();
    }

    return Promise.reject(error);
  }
);


export default api;


