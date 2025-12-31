
import api from '../client';
export const submitStep1 = async (form1Data) => {
  const params = new URLSearchParams();
  Object.entries(form1Data).forEach(([key, value]) => {
    params.append(key, value ?? '');
  });

  const res = await api.post('/addNewDemand/step1', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  });

  console.log('[submitStep1] response status:', res.status);
  return res.data;
};


export const submitStep2 = async ({ addNewDemandDTO, file = null }) => {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }

  const dtoBlob = new Blob([JSON.stringify(addNewDemandDTO)], {
    type: 'application/json',
  });
  formData.append('addNewDemandDTO', dtoBlob);

  const res = await api.post('/addNewDemand/step2', formData, {    
    headers: { 'Content-Type': undefined },

  });

  console.log('[submitStep2] response status:', res.status);
  return res.data; 
};



export const getDropDownData = async () => {
  const res = await api.get('/addNewDemand/home', {
    headers: { Accept: 'application/json' },
  });

  console.log('[getHome] response status:', res.status);

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

