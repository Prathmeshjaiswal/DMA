import api from '../client';

export const saveStep1Draft = async (payload) => {
  const res = await api.post('/addNewDemand/drafts/step1', payload
  );
  return res.data; // { success, message, data: { assignments:[...], draftId } }
};

export const saveStep2DraftBulk = async ({ draftId, assignments }, files = []) => {
  const formData = new FormData();
  formData.append('payload', JSON.stringify({ draftId, assignments }));
  (files || []).forEach((f) => f && formData.append('files', f, f.name));

  const res = await api.post('/addNewDemand/drafts/step2/bulk', formData, {
    headers: {
      // Let browser set boundary; no need to set Content-Type manually
    },
  });
  return res.data; // { success, message, data }
};

export const getStep1Draft = async (draftId) => {
  if (!draftId) throw new Error('draftId is required');
  const res = await api.get(`/addNewDemand/drafts/step1/${draftId}`, {
    headers: { Accept: 'application/json' },
  });
  return res.data; // { success, message, data }
};