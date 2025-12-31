
import api from '../client';
// Put Request for updating demand
export const submitUpdateDemand = async ({ updateDemandDTO, file = null }) => {
  const formData = new FormData();

  if (file) {
    formData.append('file', file);
  }
  const dtoBlob = new Blob([JSON.stringify(updateDemandDTO)], {
    type: 'application/json',
  });
  formData.append('updateDemandDTO', dtoBlob);

  const res = await api.put('/demandsheet/saveDemand', formData, {
    headers: { 'Content-Type': undefined },
  });

  console.log('[submitUpdateDemand] response status:', res.status);
  return res.data; 
};
