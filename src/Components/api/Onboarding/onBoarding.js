// // src/pages/api/onBoarding.js
// import api from '../client';

// /**
//  * Unwrap common success envelopes.
//  * Supports:
//  *  - { success: true, data: ..., message?: string }
//  *  - { data: ... }
//  *  - plain payload
//  */
// function unwrap(res) {
//   const d = res?.data;
//   if (d && typeof d === 'object') {
//     if ('data' in d) return d.data;
//     // If your BaseController returns {success, message, data}
//     if ('success' in d && d.success === true && 'data' in d) return d.data;
//   }
//   return d ?? res;
// }

// /**
//  * Normalize PageResponse coming from backend.
//  * Expected backend shape (from your controller):
//  * {
//  *   content, empty, first, last, size, totalElements, totalPages
//  * }
//  */
// function normalizePage(data) {
//   if (!data) {
//     return {
//       content: [],
//       empty: true,
//       first: true,
//       last: true,
//       size: 0,
//       totalElements: 0,
//       totalPages: 0,
//     };
//   }
//   return {
//     content: Array.isArray(data.content) ? data.content : [],
//     empty: !!data.empty,
//     first: !!data.first,
//     last: !!data.last,
//     size: typeof data.size === 'number' ? data.size : (Array.isArray(data.content) ? data.content.length : 0),
//     totalElements: Number(data.totalElements ?? 0),
//     totalPages: Number(data.totalPages ?? 0),
//   };
// }

// /*
//  * GET /onboarding?page=0&size=20
//  * @param {number} page
//  * @param {number} size
//  * @returns {Promise<{content:any[], empty:boolean, first:boolean, last:boolean, size:number, totalElements:number, totalPages:number}>}
//  */
// export async function getAllOnboardings(page = 0, size = 20) {
//   const res = await api.get('/onboarding', { params: { page, size } });
//   const payload = unwrap(res);
//   return normalizePage(payload);
// }

// /*
//  * PUT /onboarding/{onboardingId}/edit
//  * @param {number|string} onboardingId
//  * @param {{
//  *   onboardingStatusId:number|string,
//  *   wbsTypeId:number|string,
//  *   bgvStatusId:number|string,
//  *   offerDate:string|null,
//  *   dateOfJoining:string|null,
//  *   ctoolId:number|string|null,
//  *   pevUpdateDate?:string|null,
//  *   vpTagging?:string|null,
//  *   techSelectDate?:string|null,
//  *   hsbcOnboardingDate?:string|null
//  * }} payload
//  * @returns {Promise<any>} Usually "Onboarding updated successfully" (from BaseController.success)
//  */
// export async function editOnboarding(onboardingId, payload) {
//   if (!onboardingId && onboardingId !== 0) {
//     throw new Error('onboardingId is required');
//   }

//   // Defensive casting to match backend DTO types
//   const body = {
//     onboardingStatusId: Number(payload.onboardingStatusId),
//     wbsTypeId: Number(payload.wbsTypeId),
//     bgvStatusId: Number(payload.bgvStatusId),
//     offerDate: payload.offerDate || null,
//     dateOfJoining: payload.dateOfJoining || null,
//     ctoolId: payload.ctoolId != null && payload.ctoolId !== '' ? Number(payload.ctoolId) : null,
//     pevUpdateDate: payload.pevUpdateDate || null,
//     vpTagging: payload.vpTagging || null,
//     techSelectDate: payload.techSelectDate || null,
//     hsbcOnboardingDate: payload.hsbcOnboardingDate || null,
//   };

//   const res = await api.put(`/onboarding/${onboardingId}/edit`, body);
//   return unwrap(res);
// }

// /**
//  * GET /onboarding/dropdowns
//  * Expected:
//  * {
//  *   onboardingStatuses:[{id,name}],
//  *   wbsTypes:[{id,name}],
//  *   bgvStatuses:[{id,name}]
//  * }
//  */
// export async function getOnboardingDropdowns() {
//   const res = await api.get('/onboarding/dropdowns');
//   return unwrap(res) ?? { onboardingStatuses: [], wbsTypes: [], bgvStatuses: [] };
// }


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
    size: typeof data.size === 'number' ? data.size : (Array.isArray(data.content) ? data.content.length : 0),
    totalElements: Number(data.totalElements ?? 0),
    totalPages: Number(data.totalPages ?? 0),
  };
}

export async function getAllOnboardings(page = 0, size = 20) {
  const res = await api.get('/onboarding', { params: { page, size } });
  const payload = unwrap(res);
  return normalizePage(payload);
}

/*
 * PUT /onboarding/{onboardingId}/edit
 */
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
    // ✅ match backend field name
    pevUploadDate: payload.pevUploadDate || null,  // UPDATED
    vpTagging: payload.vpTagging || null,
    techSelectDate: payload.techSelectDate || null,
    hsbcOnboardingDate: payload.hsbcOnboardingDate || null,
  };

  const res = await api.put(`/onboarding/${onboardingId}/edit`, body);
  return unwrap(res);
}

export async function getOnboardingDropdowns() {
  const res = await api.get('/onboarding/dropdowns');
  return unwrap(res) ?? { onboardingStatuses: [], wbsTypes: [], bgvStatuses: [] };
}