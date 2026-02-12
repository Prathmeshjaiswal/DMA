
import api from '../client';
// Put Request for updating demand
export const submitUpdateDemand = async ({ id,updateDemandDTO, file }) => {
  const formData = new FormData();

  if (file) {
    formData.append('files', file,file.name);
  }
//  const dtoBlob = new Blob([JSON.stringify(updateDemandDTO)], {
//    type: 'application/json',
//  });
  formData.append('payload', JSON.stringify(updateDemandDTO));

  const res = await api.put(`/addNewDemand/demands/${id}`, formData, {
    headers: {
//    'Content-Type': undefined
    },
  });

  console.log('[submitUpdateDemand] response status:', res.status);
  return res.data; 
};
