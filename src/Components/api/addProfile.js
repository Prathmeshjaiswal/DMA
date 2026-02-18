// ================== src/pages/api/addProfile.js ==================
import api from "./client";

/** Get Profile dropdowns from backend: { success, message, data: {...} } -> return data */
export async function getProfileDropdowns() {
  const res = await api.get("/profiles/dropdowns");
  return res.data?.data ?? {};
}

/** Normalize common PageResponse variants (works with your current JSON) */
function normalizePageResponse(raw) {
  const data = raw?.data ?? raw;

  const content =
    data?.content ??
    data?.items ??
    data?.records ??
    data?.list ??
    [];

  const page = Number(data?.page ?? data?.pageNumber ?? data?.number ?? 0);
  const size = Number(
    data?.size ?? data?.pageSize ?? data?.limit ?? content.length ?? 10
  );
  const totalElements = Number(
    data?.totalElements ?? data?.total ?? content.length ?? 0
  );
  const totalPages = Number(
    data?.totalPages ?? (size ? Math.ceil(totalElements / size) : 1)
  );

  return { items: content, page, size, totalElements, totalPages, raw: data };
}

/** List profiles (server-side pagination) — cache buster + no-cache headers */
export async function getProfiles(page = 0, size = 10) {
  const res = await api.get("/profiles", {
    params: { page, size, _t: Date.now() }, // <-- cache buster to avoid stale lists
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
  return normalizePageResponse(res.data);
}

/** Server search (FIXED: use '&' in URL, NOT HTML '&amp;') */
// UPDATED: replaced &amp; with &
export async function searchProfilesApi(filter = {}, page = 0, size = 20) {
  const res = await api.post(`/profiles/search?page=${page}&size=${size}`, filter);
  return normalizePageResponse(res.data);
}

/** Download CV by file name (Blob) */
export async function downloadProfileCv(fileName) {
  if (!fileName) throw new Error("Missing file name to download");
  const res = await api.get(
    `/api/jd/profile/download/${encodeURIComponent(fileName)}`,
    { responseType: "blob" }
  );
  return res.data;
}

export async function submitProfileCreate(payload, file) {
  if (!file) throw new Error("CV file is required for create.");

  const formData = new FormData();
  formData.append(
    "payload",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );
  formData.append("file", file, file.name);

  // Do NOT force Content-Type; Axios/browser will set proper multipart boundary
  const res = await api.post("/profiles/create", formData);
  return res.data;
}

export async function submitProfileUpdate(id, payload, file = null) {
  if (!id) throw new Error("Missing profile id");

  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload)); // plain string expected by controller
  if (file) formData.append("file", file, file.name);

  const res = await api.put(`/profiles/update/${id}`, formData, {
    headers: { "Cache-Control": "no-cache" },
    transformRequest: [(data) => data], // keep FormData intact
  });

  return res.data;
}

