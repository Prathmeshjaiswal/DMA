import api from '../client';


export const getDemandsheet = async () => {
  const res = await api.get('/demandsheet/demands');
  console.log('[getDemands] response status:', res.status);
  return res.data;
};