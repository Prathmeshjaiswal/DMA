// src/api/Demands/profile.js
import api from '../client';

/**
 * DEMO PROFILE APIS
 * - Toggle USE_DEMO to switch between simulated responses and real endpoints.
 * - Real endpoints are placeholders: update them when backend is ready.
 */
const USE_DEMO = true;

// ---- Real endpoints (adjust when backend is ready) ----
const PROFILE_GET_ENDPOINT   = (demandId) => `/demandsheet/profile/${encodeURIComponent(String(demandId))}`;
const PROFILE_UPLOAD_ENDPOINT = '/demandsheet/profile/upload';

/**
 * getProfiles(demandId)
 * Demo returns a small array of profile metadata.
 * Real: GET /demandsheet/profile/{demandId}
 */
export const getProfiles = async (demandId) => {
  if (!demandId) throw new Error('demandId is required');

  if (USE_DEMO) {
    // Simulated small delay + mock data
    await new Promise((r) => setTimeout(r, 300));
    return {
      success: true,
      data: [
        {
          id: 101,
          demandId,
          fileName: `profile_${demandId}_cv1.pdf`,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'demo.user@coforge.com',
        },
        {
          id: 102,
          demandId,
          fileName: `profile_${demandId}_cv2.docx`,
          uploadedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
          uploadedBy: 'demo.user@coforge.com',
        },
      ],
    };
  }

  // Real call
  const res = await api.get(PROFILE_GET_ENDPOINT(demandId), {
    headers: { Accept: 'application/json' },
  });
  return res.data;
};

/**
 * uploadProfileAttachment(demandId, file)
 * Demo returns a fake success after a short delay.
 * Real: POST /demandsheet/profile/upload with FormData { demandId, file }
 */
export const uploadProfileAttachment = async (demandId, file) => {
  if (!demandId) throw new Error('demandId is required');
  if (!file) throw new Error('file is required');

  if (USE_DEMO) {
    // Simulate a successful upload
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      message: `Profile uploaded for demand ${demandId} (demo).`,
      data: {
        id: Math.floor(Math.random() * 100000),
        fileName: file.name || 'uploaded_profile',
        uploadedAt: new Date().toISOString(),
      },
    };
  }

  // Real call
  const formData = new FormData();
  formData.append('demandId', String(demandId));
  formData.append('file', file);

  const res = await api.post(PROFILE_UPLOAD_ENDPOINT, formData, {
    headers: {
      // let browser set boundary
    },
  });
  return res.data;
};