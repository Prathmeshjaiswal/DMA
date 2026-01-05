import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

export const register = async(payload) => {
    
console.log('[register] payload:', payload);
  const res = await api.post('/api/user/register', payload);
  console.log('[register] response status:', res.status);
  return res.data;
}
