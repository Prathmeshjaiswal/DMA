import api from '../client';

const PART_NAME = 'req'; // or 'request'

export const submitStep1 = async (requestPayload = {}) => {
  try {
    const fd = new FormData();
    fd.append(PART_NAME, new Blob([JSON.stringify(requestPayload)], { type: 'application/json' }));
    const res = await api.post('/draft/create', fd, {
      headers: {

      },
    });
    return res.data;
  } catch (err) {
    const data = err?.response?.data;
    const msg = data?.message || data?.detail || data?.title || err?.message || 'Step-1 failed.';
    console.error('[submitStep1] error:', err?.response || err);
    throw new Error(msg);
  }
};

export const updateStep1Draft = async (draftId,requestPayload = {}) => {
  try {
    const fd = new FormData();
    fd.append(PART_NAME, new Blob([JSON.stringify(requestPayload)], { type: 'application/json' }));
    const res = await api.put(`/edit/${draftId}`, fd, {
      headers: {},
    });
    return res.data;
  } catch (err) {
    const data = err?.response?.data;
    const msg = data?.message || data?.detail || data?.title || err?.message || 'Draft update failed.';
    console.error('[updateStep1Draft] error:', err?.response || err);
    throw new Error(msg);
  }
};

/** POST /addNewDemand/step2/submit/bulk (final submit) — unchanged */
export const submitStep2 = async (payload) => {
  let formData;

  try {
    if (payload instanceof FormData) {
      formData = payload;

    } else {
      const {
        addNewDemandDTO,
        file = null,
        files = [],
        filesMeta = null,
      } = payload || {};

      if (!addNewDemandDTO) throw new Error('addNewDemandDTO is required');

      formData = new FormData();

      if (file) {
        formData.append('file', file);
        formData.append('files', file, file.name);
      }

      if (Array.isArray(files) && files.length) {
        files.forEach((f) => f && formData.append('files', f, f.name));
      }

      formData.append(
        'addNewDemandDTO',
        new Blob([JSON.stringify(addNewDemandDTO)], { type: 'application/json' })
      );

      let meta = filesMeta;
      if (!meta && Array.isArray(addNewDemandDTO?.demandRRDTOList)) {
        meta = addNewDemandDTO.demandRRDTOList.map((item, index) => ({
          index,
          demandId: item?.demandId ?? null,
          rrNumber: item?.rrNumber ?? null,
        }));
      }
      if (meta) formData.append('filesMeta', typeof meta === 'string' ? meta : JSON.stringify(meta));
    }

    const res = await api.post('/addNewDemand/step2/submit/bulk', formData, { headers: {} });
    return res;
  } catch (err) {
    const data = err?.response?.data;
    const msg = data?.message || data?.detail || data?.title || err?.message || 'Step-2 failed.';
    console.error('[submitStep2] error:', err?.response || err);
    throw new Error(msg);
  }
};

/** Dropdowns unchanged */
export const getDropDownData = async () => {
  const res = await api.get('/addNewDemand/home', {
    headers: { Accept: 'application/json' },
  });
  return res.data?.data ?? res.data;
};

// Normalize to {label, value}
export const toOptions = (arr) => {
  if (!Array.isArray(arr)) return [];
  const normalized = arr
    .map((x) => {
      if (x && typeof x === "object") {
        const valueCandidate =
          x.value ?? x.id ?? x.code ?? x.key ?? x.name ?? x.label ?? x.title ?? x.displayName;
        const labelCandidate = x.label ?? x.name ?? x.displayName ?? x.title ?? valueCandidate;
        const label = String(labelCandidate ?? "").trim();
        const value = valueCandidate ?? "";
        return { label: label || "Unknown", value };
      }
      const s = String(x ?? "").trim();
      return { label: s || "Unknown", value: s };
    })
    .filter((o) => o.label && String(o.label).trim() !== "");
  return Array.from(new Map(normalized.map((o) => [String(o.value), o])).values());
};