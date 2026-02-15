// // ================== src/pages/api/Profiles/profileTrack.js ==================
// import api from "../client";

// // -------- Demand <-> Profile attachments ---------

// /**
//  * Attach many demands to one profile.
//  * Body: { profilePkId: Long, demandIds: Long[] }
//  * Returns a success message string.
//  */
// export async function attachDemandsToProfileApi(profilePkId, demandIds = []) {
//   if (!profilePkId) throw new Error("profilePkId is required");
//   const ids = Array.from(new Set((demandIds || []).filter((v) => v != null))).map(Number);
//   if (ids.length === 0) throw new Error("At least one demand id is required");

//   const res = await api.post("/profile-track/attach/demands-to-profile", {
//     profilePkId: Number(profilePkId),
//     demandIds: ids,
//   });
//   return res?.data; // your BaseController.success(...) wraps value
// }

// /**
//  * Get demands associated with a profile.
//  * GET /profile-track/{profileId}/demands
//  * Returns List<DemandSharedResponseDTO>
//  */
// export async function getDemandsByProfileApi(profileId) {
//   if (!profileId) throw new Error("profileId is required");
//   const res = await api.get(`/profile-track/${profileId}/demands`);
//   // Expected shape: [{ id, attachedDate, createdAt, demandId, primarySkills, secondarySkills, hbu }]
//   return Array.isArray(res?.data) ? res.data : [];
// }

// /**
//  * Attach many profiles to one demand (if/when needed on the other screen).
//  * Body: { demandPkId: Long, profileIds: Long[] }
//  */
// export async function attachProfilesToDemandApi(demandPkId, profileIds = []) {
//   if (!demandPkId) throw new Error("demandPkId is required");
//   const ids = Array.from(new Set((profileIds || []).filter((v) => v != null))).map(Number);
//   if (ids.length === 0) throw new Error("At least one profile id is required");

//   const res = await api.post("/profile-track/attach/profiles-to-demand", {
//     demandPkId: Number(demandPkId),
//     profileIds: ids,
//   });
//   return res?.data;
// }

// /**
//  * Get profiles associated with a demand.
//  * GET /profile-track/{demandId}/profiles
//  */
// export async function getProfilesByDemandApi(demandId) {
//   if (!demandId) throw new Error("demandId is required");
//   const res = await api.get(`/profile-track/${demandId}/profiles`);
//   return Array.isArray(res?.data) ? res.data : [];
// }

// /**
//  * Edit a tracker row (dates/status)
//  * PUT /profile-track/{trackerId}/edit
//  * Body: { profileSharedDate?, interviewDate?, decisionDate?, evaluationStatusId?, profileTrackerStatusId? }
//  */
// export async function editProfileTrackerApi(trackerId, patch = {}) {
//   if (!trackerId) throw new Error("trackerId is required");
//   const res = await api.put(`/profile-track/${trackerId}/edit`, patch);
//   return res?.data;
// }


// ================== src/pages/api/Profiles/attachedDemand.js ==================
import api from "../client";

// Unwrap BaseController.success({... data })
function unwrap(res) {
  const d = res?.data;
  if (d && Object.prototype.hasOwnProperty.call(d, "data")) return d.data;
  return d;
}

/**
 * Attach many demands to one profile.
 * Body: { profilePkId: Long, demandIds: Long[] }
 * Returns server message string (wrapped).
 */
export async function attachDemandsToProfileApi(profilePkId, demandIds = []) {
  if (!profilePkId) throw new Error("profilePkId is required");
  const ids = Array.from(new Set((demandIds || []).filter((v) => v != null))).map(Number);
  if (ids.length === 0) throw new Error("At least one demand id is required");

  const res = await api.post("/profile-track/attach/demands-to-profile", {
    profilePkId: Number(profilePkId),
    demandIds: ids,
  });
  return unwrap(res); // "Demands Attached to Profile Successfully"
}

/**
 * Get demands associated with a profile.
 * GET /profile-track/{profileId}/demands
 * Returns List<DemandSharedResponseDTO>  (unwrapped from {success,message,data})
 */
export async function getDemandsByProfileApi(profileId) {
  if (!profileId) throw new Error("profileId is required");
  const res = await api.get(`/profile-track/${profileId}/demands`, {
    headers: { "Cache-Control": "no-cache" }, // avoid caching in some browsers
  });
  const payload = unwrap(res);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

/**
 * Attach many profiles to one demand (for Demand screen).
 * Body: { demandPkId: Long, profileIds: Long[] }
 */
export async function attachProfilesToDemandApi(demandPkId, profileIds = []) {
  if (!demandPkId) throw new Error("demandPkId is required");
  const ids = Array.from(new Set((profileIds || []).filter((v) => v != null))).map(Number);
  if (ids.length === 0) throw new Error("At least one profile id is required");

  const res = await api.post("/profile-track/attach/profiles-to-demand", {
    demandPkId: Number(demandPkId),
    profileIds: ids,
  });
  return unwrap(res);
}

/**
 * Get profiles associated with a demand.
 * GET /profile-track/{demandId}/profiles
 */
export async function getProfilesByDemandApi(demandId) {
  if (!demandId) throw new Error("demandId is required");
  const res = await api.get(`/profile-track/${demandId}/profiles`);
  const payload = unwrap(res);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

/**
 * Edit a tracker row (dates/status)
 * PUT /profile-track/{trackerId}/edit
 */
export async function editProfileTrackerApi(trackerId, patch = {}) {
  if (!trackerId) throw new Error("trackerId is required");
  const res = await api.put(`/profile-track/${trackerId}/edit`, patch);
  return unwrap(res);
}