

// // ================== src/pages/api/Profiles/addProfile.js ==================
// import api from "../client";

// /** Get Profile dropdowns from backend: { success, message, data: {...} } -> return data */
// export async function getProfileDropdowns() {
//   const res = await api.get("/profiles/dropdowns");
//   return res.data?.data ?? {};
// }

// /** Normalize common PageResponse variants (works with your current JSON) */
// function normalizePageResponse(raw) {
//   const data = raw?.data ?? raw;

//   const content =
//     data?.content ??
//     data?.items ??
//     data?.records ??
//     data?.list ??
//     [];

//   const page = Number(data?.page ?? data?.pageNumber ?? data?.number ?? 0);
//   const size = Number(
//     data?.size ?? data?.pageSize ?? data?.limit ?? content.length ?? 10
//   );
//   const totalElements = Number(
//     data?.totalElements ?? data?.total ?? content.length ?? 0
//   );
//   const totalPages = Number(
//     data?.totalPages ?? (size ? Math.ceil(totalElements / size) : 1)
//   );

//   return { items: content, page, size, totalElements, totalPages, raw: data };
// }

// /** List profiles (server-side pagination) — cache buster + no-cache headers */
// export async function getProfiles(page = 0, size = 10) {
//   const res = await api.get("/profiles", {
//     params: { page, size, _t: Date.now() }, // cache buster
//     headers: {
//       "Cache-Control": "no-cache",
//       Pragma: "no-cache",
//       Expires: "0",
//     },
//   });
//   return normalizePageResponse(res.data);
// }

// /** Server search — uses backend pagination & filters (URL uses '&', not HTML escaped) */
// export async function searchProfilesApi(filter = {}, page = 0, size = 20) {
//   const res = await api.post(`/profiles/search?page=${page}&size=${size}`, filter);
//   return normalizePageResponse(res.data);
// }

// /** Download CV by file name (Blob) */
// export async function downloadProfileCv(fileName) {
//   if (!fileName) throw new Error("Missing file name to download");
//   const res = await api.get(
//     `/api/jd/profile/download/${encodeURIComponent(fileName)}`,
//     { responseType: "blob" }
//   );
//   return res.data;
// }

// /** CREATE (multipart: payload + file) */
// export async function submitProfileCreate(payload, file) {
//   if (!file) throw new Error("CV file is required for create.");

//   const formData = new FormData();
//   formData.append(
//     "payload",
//     new Blob([JSON.stringify(payload)], { type: "application/json" })
//   );
//   formData.append("file", file, file.name);

//   const res = await api.post("/profiles/create", formData);
//   return res.data;
// }

// /** UPDATE (ALWAYS multipart; payload as PLAIN STRING) */
// export async function submitProfileUpdate(id, payload, file = null) {
//   if (!id) throw new Error("Missing profile id");

//   const formData = new FormData();
//   formData.append("payload", JSON.stringify(payload)); // plain string expected
//   if (file) formData.append("file", file, file.name);

//   const res = await api.put(`/profiles/update/${id}`, formData, {
//     headers: { "Cache-Control": "no-cache" },
//     transformRequest: [(data) => data], // keep FormData intact
//   });

//   return res.data;
// }


// // ================== src/pages/api/addProfile.js ==================
// import api from "./client";

// /** Get Profile dropdowns from backend: { success, message, data: {...} } -> return data */
// export async function getProfileDropdowns() {
//   const res = await api.get("/profiles/dropdowns");
//   return res.data?.data ?? {};
// }

// /** Normalize common PageResponse variants (works with your current JSON) */
// function normalizePageResponse(raw) {
//   const data = raw?.data ?? raw;

//   const content =
//     data?.content ??
//     data?.items ??
//     data?.records ??
//     data?.list ??
//     [];

//   const page = Number(data?.page ?? data?.pageNumber ?? data?.number ?? 0);
//   const size = Number(
//     data?.size ?? data?.pageSize ?? data?.limit ?? content.length ?? 10
//   );
//   const totalElements = Number(
//     data?.totalElements ?? data?.total ?? content.length ?? 0
//   );
//   const totalPages = Number(
//     data?.totalPages ?? (size ? Math.ceil(totalElements / size) : 1)
//   );

//   return { items: content, page, size, totalElements, totalPages, raw: data };
// }

// /** List profiles (server-side pagination) — cache buster + no-cache headers */
// export async function getProfiles(page = 0, size = 10) {
//   const res = await api.get("/profiles", {
//     params: { page, size, _t: Date.now() }, // <-- cache buster to avoid stale lists
//     headers: {
//       "Cache-Control": "no-cache",
//       Pragma: "no-cache",
//       Expires: "0",
//     },
//   });
//   return normalizePageResponse(res.data);
// }

// /** Server search (FIXED: use '&' in URL, NOT HTML '&amp;') */
// // UPDATED: replaced &amp; with &
// export async function searchProfilesApi(filter = {}, page = 0, size = 20) {
//   const res = await api.post(`/profiles/search?page=${page}&size=${size}`, filter);
//   return normalizePageResponse(res.data);
// }

// /** Download CV by file name (Blob) */
// export async function downloadProfileCv(fileName) {
//   if (!fileName) throw new Error("Missing file name to download");
//   const res = await api.get(
//     `/api/jd/profile/download/${encodeURIComponent(fileName)}`,
//     { responseType: "blob" }
//   );
//   return res.data;
// }

// /** CREATE (multipart: payload + file)
//  * Backend create endpoint consumes MULTIPART_FORM_DATA and binds @RequestPart ProfileCreateRequestDTO.
//  * Send payload as a JSON Blob, but DO NOT set Content-Type manually—let Axios set boundary.
//  */
// export async function submitProfileCreate(payload, file) {
//   if (!file) throw new Error("CV file is required for create.");

//   const formData = new FormData();
//   formData.append(
//     "payload",
//     new Blob([JSON.stringify(payload)], { type: "application/json" })
//   );
//   formData.append("file", file, file.name);

//   // Do NOT force Content-Type; Axios/browser will set proper multipart boundary
//   const res = await api.post("/profiles/create", formData);
//   return res.data;
// }

// /** UPDATE (ALWAYS multipart; payload as PLAIN STRING)
//  * Backend:
//  *  @PutMapping(value="/update/{id}", consumes=MULTIPART_FORM_DATA_VALUE)
//  *  updateProfile(@PathVariable Long id,
//  *                @RequestPart("payload") String payload,
//  *                @RequestPart(value="file", required=false) MultipartFile file)
//  */
// export async function submitProfileUpdate(id, payload, file = null) {
//   if (!id) throw new Error("Missing profile id");

//   const formData = new FormData();
//   formData.append("payload", JSON.stringify(payload)); // plain string expected by controller
//   if (file) formData.append("file", file, file.name);

//   const res = await api.put(`/profiles/update/${id}`, formData, {
//     headers: { "Cache-Control": "no-cache" },
//     transformRequest: [(data) => data], // keep FormData intact
//   });

//   return res.data;
// }


// ================== src/pages/api/Profiles/addProfile.js ==================
import api from "../client";

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
    params: { page, size, _t: Date.now() }, // cache buster
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
  return normalizePageResponse(res.data);
}

/** Server search — uses backend pagination & filters (URL uses '&', not HTML escaped) */
export async function searchProfilesApi(filter = {}, page = 0, size = 20) {
  const res = await api.post(`/profiles/search?page=${page}&size=${size}`, filter);
  return normalizePageResponse(res.data);
}

// /** Download CV by file name (Blob) */
// export async function downloadProfileCv(fileName) {
//   if (!fileName) throw new Error("Missing file name to download");
//   const res = await api.get(
//     `/api/jd/profile/download/${encodeURIComponent(fileName)}`,
//     { responseType: "blob" }
//   );
//   return res.data;
// }
/** Download CV by file name (Blob -> force browser download with fallbacks) */
export async function downloadProfileCv(fileName) {
  if (!fileName || String(fileName).trim() === "") {
    throw new Error("Missing file name to download");
  }

  // 1) POINT THIS TO YOUR REAL ENDPOINT
  //    You earlier showed /api/jd/profile/download/{fileName}
  const downloadUrl = `/api/jd/profile/download/${encodeURIComponent(fileName)}`;

  try {
    // 2) Main attempt: fetch as BLOB and force download
    const res = await api.get(downloadUrl, {
      responseType: "blob",
      headers: {
        "Cache-Control": "no-cache",
        Accept: "*/*",
      },
    });

    // Content-Type & Content-Disposition (may be missing)
    const contentType = res.headers?.["content-type"] || "application/octet-stream";
    const dispo = res.headers?.["content-disposition"] || "";

    // Parse filename from header if present
    let suggestedName = String(fileName);
    const m = dispo.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)/i);
    if (m && m[1]) {
      try {
        suggestedName = decodeURIComponent(m[1].replace(/"/g, ""));
      } catch {
        suggestedName = m[1].replace(/"/g, "");
      }
    } else {
      // If server didn't provide an extension, guess from content-type
      if (!/\.[a-z0-9]+$/i.test(suggestedName)) {
        if (contentType.includes("pdf")) suggestedName += ".pdf";
        else if (contentType.includes("msword") || contentType.includes("wordprocessingml"))
          suggestedName += ".docx";
        else if (contentType.includes("rtf")) suggestedName += ".rtf";
      }
    }

    const blob = new Blob([res.data], { type: contentType });

    // IE/Edge legacy (just in case)
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, suggestedName);
      return;
    }

    // Normal browsers: hidden <a> click
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = suggestedName; // Save As...
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (err) {
    // 3) Fallback: open the URL in a new tab (server should send Content-Disposition: attachment)
    try {
      const w = window.open(downloadUrl, "_blank", "noopener,noreferrer");
      if (!w) {
        // Pop‑up blocked
        console.warn("Popup blocked. Ask user to allow popups for this site.");
      }
    } catch (e) {
      console.error("Download fallback failed:", e);
      throw err;
    }
  }
}

/** CREATE (multipart: payload + file) */
export async function submitProfileCreate(payload, file) {
  if (!file) throw new Error("CV file is required for create.");

  const formData = new FormData();
  formData.append(
    "payload",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );
  formData.append("file", file, file.name);

  const res = await api.post("/profiles/create", formData);
  return res.data;
}

/** UPDATE (ALWAYS multipart; payload as PLAIN STRING) */
export async function submitProfileUpdate(id, payload, file = null) {
  if (!id) throw new Error("Missing profile id");

  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload)); // plain string expected
  if (file) formData.append("file", file, file.name);

  const res = await api.put(`/profiles/update/${id}`, formData, {
    headers: { "Cache-Control": "no-cache" },
    transformRequest: [(data) => data], // keep FormData intact
  });

  return res.data;
}
