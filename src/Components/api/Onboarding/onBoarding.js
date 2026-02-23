// src/pages/api/Onboarding/onBoarding.js
import api from '../client';

/** Unwrap success envelopes */
function unwrap(res) {
  const d = res?.data;
  if (d && typeof d === 'object') {
    if ('data' in d) return d.data;
    if ('success' in d && d.success === true && 'data' in d) return d.data;
  }
  return d ?? res;
}

/** Normalize PageResponse */
function normalizePage(data) {
  if (!data) {
    return {
      content: [],
      empty: true,
      first: true,
      last: true,
      size: 0,
      totalElements: 0,
      totalPages: 0,
    };
  }
  return {
    content: Array.isArray(data.content) ? data.content : [],
    empty: !!data.empty,
    first: !!data.first,
    last: !!data.last,
    size:
      typeof data.size === 'number'
        ? data.size
        : Array.isArray(data.content)
        ? data.content.length
        : 0,
    totalElements: Number(data.totalElements ?? 0),
    totalPages: Number(data.totalPages ?? 0),
  };
}

/** GET /onboarding (without filters) */
export async function getAllOnboardings(page = 0, size = 20) {
  const res = await api.get('/onboarding', { params: { page, size } });
  const payload = unwrap(res);
  return normalizePage(payload);
}

/** PUT /onboarding/{onboardingId}/edit */
export async function editOnboarding(onboardingId, payload) {
  if (onboardingId == null) {
    throw new Error('onboardingId is required');
  }

  const body = {
    onboardingStatusId: Number(payload.onboardingStatusId),
    wbsTypeId: Number(payload.wbsTypeId),
    bgvStatusId: Number(payload.bgvStatusId),
    offerDate: payload.offerDate || null,
    dateOfJoining: payload.dateOfJoining || null,
    ctoolId:
      payload.ctoolId != null && payload.ctoolId !== '' ? Number(payload.ctoolId) : null,
    // ✅ backend expects pevUploadDate
    pevUploadDate: payload.pevUploadDate || null,
    vpTagging: payload.vpTagging || null,
    techSelectDate: payload.techSelectDate || null,
    hsbcOnboardingDate: payload.hsbcOnboardingDate || null,
  };

  const res = await api.put(`/onboarding/${onboardingId}/edit`, body);
  return unwrap(res);
}

/** GET /onboarding/dropdowns */
export async function getOnboardingDropdowns() {
  const res = await api.get('/onboarding/dropdowns');
  return unwrap(res) ?? { onboardingStatuses: [], wbsTypes: [], bgvStatuses: [] };
}

/** POST /onboarding/search — server-side filtering */
export async function searchOnboardings(filter = {}, page = 0, size = 20) {
  const res = await api.post('/onboarding/search', filter, { params: { page, size } });
  const payload = unwrap(res);
  return normalizePage(payload);
}