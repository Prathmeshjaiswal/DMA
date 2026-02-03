import api from '../client';

export const submitStep1 = async (form1Data) => {
  const params = new URLSearchParams();
  Object.entries(form1Data).forEach(([key, value]) => {
    params.append(key, value ?? '');
  });

  const res = await api.post('/addNewDemand/step1', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  });

  console.log('[submitStep1] response status:', res.data);
  return res.data;
};



export const submitStep2 = async (payload) => {
  let formData;

  if (payload instanceof FormData) {
    // Caller already prepared FormData (advanced use case)
    formData = payload;
  } else {
    const {
      addNewDemandDTO,
      file = null,          // legacy single file
      files = [],           // preferred: multiple files
      filesMeta = null,     // optional mapping: [{ index, demandId }]
    } = payload || {};

    if (!addNewDemandDTO) {
      throw new Error('addNewDemandDTO is required');
    }

    formData = new FormData();
    if (file) {
      formData.append('file', file);
      formData.append('files', file, file.name);
    }

    if (Array.isArray(files) && files.length) {
      files.forEach((f) => {
        if (f) formData.append('files', f, f.name);
      });
    }

    // ---- DTO as JSON Blob ----
    formData.append(
      'addNewDemandDTO',
      new Blob([JSON.stringify(addNewDemandDTO)], { type: 'application/json' })
    );

    // ---- filesMeta (index → demandId) ----
    let meta = filesMeta;
    if (!meta && Array.isArray(addNewDemandDTO?.demandRRDTOList)) {
      meta = addNewDemandDTO.demandRRDTOList.map((item, index) => ({
        index,
        demandId: item?.demandId,
      }));
    }
    if (meta) {
      formData.append('filesMeta', typeof meta === 'string' ? meta : JSON.stringify(meta));
    }
  }

  // Let the browser/axios set the correct multipart boundary automatically.
  const res = await api.post('/addNewDemand/step2', formData, {
    headers: {
      // 'Content-Type': 'multipart/form-data'  // not needed; browser sets boundary
    },
  });

  return res;
};


export const getDropDownData = async () => {
  const res = await api.get('/addNewDemand/home', {
    headers: { Accept: 'application/json' },
  });

  console.log('[getDropDownData of Add Data] response status:', res.data);

  // If backend returns { status, message, data }, unwrap data; else return as-is
  return res.data?.data ?? res.data;
};

// Normalize to {label, value} (handles strings/objects, trims, dedupes)
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

