import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

export const changePassword = async (payload) => {
  const res = await api.post('/auth_user/change-password', payload);
  console.log('[changePassword] response status:', res.status);
  return res.data;
};
