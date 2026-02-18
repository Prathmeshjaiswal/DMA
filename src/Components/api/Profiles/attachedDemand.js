
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




