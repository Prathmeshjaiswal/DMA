import api from '../client';

const toFormUrlEncoded = (obj = {}) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    // Convert arrays to CSV; null/undefined -> ''
    if (Array.isArray(v)) params.append(k, v.join(','));
    else params.append(k, v ?? '');
  });
  return params;
};

/** Extract a useful message from axios error */
const extractErrMsg = (err, fallback = 'Request failed.') => {
  const data = err?.response?.data;
  return (
    data?.message ||
    data?.detail ||
    data?.title ||
    err?.message ||
    fallback
  );
};


export const saveDraft = async (draftPayload = {}) => {
  try {
    const body = toFormUrlEncoded(draftPayload);
    const res = await api.put('/draft/create', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    });
    return res.data;
  } catch (err) {
    console.error('[updateDraftStep1] error:', err?.response || err);
    throw new Error(extractErrMsg(err, 'Draft update failed.'));
  }
};


export const listDrafts = async () => {
  try {
    const res = await api.get('/draft/viewdraft', {
      headers: { Accept: 'application/json' },
    });
    const payload = res.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  } catch (err) {
    console.error('[listDrafts] error:', err?.response || err);
    throw new Error(extractErrMsg(err, 'Failed to list drafts.'));
  }
};


export const getStep1Draft = async (draftId) => {
  if (!draftId && draftId !== 0) throw new Error('draftId is required');
  try {
    const res = await api.get(`/draft/viewdraft/${draftId}`, {
      headers: { Accept: 'application/json' },
    });
    return res.data;
  } catch (err) {
    console.error('[getStep1Draft] error:', err?.response || err);
    throw new Error(extractErrMsg(err, 'Failed to fetch draft.'));
  }
};


export const downloadDraftJD = async (filename) => {
  if (!filename) throw new Error('filename is required');
  try {
    const res = await api.get(`/api/jd/draft/download/${encodeURIComponent(filename)}`, {
      responseType: 'blob',
    });

    // Try to parse filename from Content-Disposition
    const cd = res.headers?.['content-disposition'] || '';
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
    const serverName = decodeURIComponent(match?.[1] || match?.[2] || filename);

    const blob = new Blob([res.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = serverName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('[downloadDraftJD] error:', err?.response || err);
    throw new Error(extractErrMsg(err, 'Download failed.'));
  }
};



export const updateDraft = async ({ draftId, request, files = [] }) => {
  const idNum = Number(draftId);
  if (!Number.isFinite(idNum)) {
    throw new Error(`editDraft: numeric draftId is required, got "${draftId}"`);
  }
  if (!request || typeof request !== 'object') {
    throw new Error('editDraft: request (object) is required');
  }

  const fd = new FormData();
  fd.append("req", new Blob([JSON.stringify(request)], { type: 'application/json' }));
  (files || []).forEach((f) => f && fd.append('files', f, f.name));

  const res = await api.put(`/draft/edit/${idNum}`, fd, {
    headers: {
      // Let browser set multipart boundary
    },
  });
  return res.data;
};