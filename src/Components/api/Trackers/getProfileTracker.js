import api from '../client';


export const getProfilesByDemandID = async (demandId) => {
  const res = await api.get(`/profile_tracker/profiles/${demandId}`);//${encodeURIComponent(demandId)
  console.log('[getprofiles] response status:',res.status);
  console.log(res.data);
  return res.data;
};

export const getProfilesByDateRange = async (selectedDate) => {
  const { startDate, endDate } = selectedDate || {};
  if (!startDate || !endDate) {
  console.log();
    throw new Error("startDate and endDate are required in 'dd-MMM-yyyy' format.");
  }
  const res = await api.get('/profile_tracker/retrieveProfiles',{ params: { startDate, endDate },});
  console.log('[getprofiles] response status:', res.status);
  return res.data;
};