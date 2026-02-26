// ================== src/api/history.js ==================
import axios from "axios";
import api from './client.js';
/**
 * You can swap this client with your shared axios instance if you have one (e.g., import client from './http')
 * but this standalone client will work out of the box with the /api prefix.
 */


/**
 * Normalize backend PageResponse safely.
 * Compatible with variants like { data: { content, totalElements, ... } } or plain content.
 */
export function normalizePageResponse(raw) {
  const data = raw?.data ?? raw;
  const content =
    data?.content ??
    data?.items ??
    data?.records ??
    data?.list ??
    [];

  const page = data?.number ?? data?.page ?? 0;
  const size = data?.size ?? data?.pageSize ?? content.length ?? 0;
  const total = data?.totalElements ?? data?.total ?? content.length ?? 0;
  const totalPages =
    data?.totalPages ??
    (size > 0 ? Math.ceil(total / size) : 1);

  return { content, page, size, total, totalPages, raw: raw ?? {} };
}

/**
 * Demand history
 */
export async function getDemandHistory(demandId, { page = 0, size = 20, includeDiff = false } = {}) {
  if (demandId == null) throw new Error("demandId is required");
  const res = await api.get(`/api/demands/${encodeURIComponent(demandId)}/history`, {
    params: { page, size, includeDiff },
  });
  return normalizePageResponse(res.data);
}

/**
 * Profile history
 */
export async function getProfileHistory(profileId, { page = 0, size = 20, includeDiff = false } = {}) {
  if (profileId == null) throw new Error("profileId is required");
  const res = await api.get(`/api/profile/${encodeURIComponent(profileId)}/history`, {
    params: { page, size, includeDiff },
  });
  return normalizePageResponse(res.data);
}
