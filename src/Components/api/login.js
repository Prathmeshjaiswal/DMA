
import axios from 'axios';
import api from './client.js'

export const login = async (payload) => {
  console.log('[login] payload:', payload);
  const res = await api.post('/auth_user/login', payload);
  console.log('[login] response status:', res.status);
  return res.data;
};
