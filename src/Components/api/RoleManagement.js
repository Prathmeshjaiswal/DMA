import axios from 'axios';
import api from './api.js';

export const RoleManagement = async(payload) => {

console.log('[register] payload:', payload);
  const res = await api.post('/auth_user/register', payload);
  console.log('[register] response status:', res.status);
  return res.data;
}