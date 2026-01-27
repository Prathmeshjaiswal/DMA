import axios from 'axios';
import api from './client.js';

export const createrole = async(payload) => {
  console.log('[createRole] payload:', payload);
  const res = await api.post('/user_management/createrole', payload);
  console.log('createRole response status:', res.status);
  return res.data;
}


export const editrole = async(roleId,payload) => {
console.log('[editRole] payload:', payload);
  const res = await api.put(`/user_management/${roleId}`, payload);
  console.log('editRole response status:', res.status);
  return res.data;
}


export const getpermissions = async() => {
  const res = await api.get('/user_management/getallmodulechildmodules');
  console.log('GET permission response status:', res.status);
  return res.data;
}

export const getroles = async() => {
  const res = await api.get('/user_management/getallroles');
  console.log('GetRoles response status:', res.status);
  return res.data;
}