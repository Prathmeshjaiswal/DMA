
// import axios from 'axios'; by Prathmesh HAHAHAHAHAHAHAHAh
import api from './client.js'
//const api = axios.create({
//  baseURL: 'http://localhost:8080',
//  headers: { 'Content-Type': 'application/json' },
//});

export const login = async (payload) => {
  console.log('[login] payload:', payload);
  const res = await api.post('/auth_user/login', payload);

  
 const data = res.data.data; // because BaseController wraps response

  localStorage.setItem('token', data.token);
  localStorage.setItem('refreshToken', data.refreshToken);

  

  // console.log('[login] response status:', res.status);
  return data;
};
