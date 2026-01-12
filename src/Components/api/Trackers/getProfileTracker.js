import api from '../client';


export const getProfilesByDemandID = async () => {
  const res = await api.get('/api/v1/{demandId}/profiles');
  console.log('[getprofiles] response status:', res.status);
  return res.data;
};