import axios from 'axios';
import api from './client.js';
//const api = axios.create({
//  baseURL: 'http://localhost:8080',
////  headers: {
////    "Content-Type": "application/json",
////    Authorization: `Bearer ${localStorage.getItem("token")}`
//});

export const DashBoardData = async () => {

  const res = await api.get('/talent_dashboard/overview');
  console.log('dashboard response status:', res.status);
  console.log('[dashboard] payload:',res);
  console.log('[dashboard] payload:',res.data.data);
  return res.data
  ;
};