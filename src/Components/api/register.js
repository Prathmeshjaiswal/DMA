import axios from 'axios';
import api from './client.js';

//const api = axios.create({
//  baseURL: 'http://localhost:8080',
//  headers: { 'Content-Type': 'application/json' },
//});

export const register = async(payload) => {
    
console.log('[register] payload:', payload);
  const res = await api.post('/auth_user/register', payload);
  console.log('[register] response status:', res.status);
  return res.data;
}

export const getRolePermission = async () => {
  const res = await api.get('/auth_user/register');
  console.log('[getRolePermission] response status:', res.status);
  return res.data;
}

// export const fetchUsers = async () => {
//   const res = await api.get('/auth_user/users'); // Assuming the endpoint is /auth_user/users
//   console.log('[fetchUsers] response status:', res.status);
//   return res.data;
// };
