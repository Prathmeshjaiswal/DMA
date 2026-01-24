import api from './client.js';


export const createUser = async(payload) => {
    
console.log('[createUser] payload:', payload);
  const res = await api.post('/auth_user/register', payload);
  console.log('[createUser] response status:', res.status, res.data);
  return res.data;
}

export const getRolePermission = async () => {
  const res = await api.get('/auth_user/register');
  console.log('[getRolePermission] response status:', res.status);
  return res.data;
}

