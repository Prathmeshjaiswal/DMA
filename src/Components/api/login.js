
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

export const login = async (payload) => {
  console.log('[login] payload:', payload);
  const res = await api.post('/api/user/login', payload);
  console.log('[login] response status:', res.status);
  return res.data;
};
