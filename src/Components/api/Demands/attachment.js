// src/api/Demands/profile.js
import api from '../client';

const USE_DEMO = true;

const PROFILE_GET_ENDPOINT   = (demandId) => `/demandsheet/profile/${encodeURIComponent(String(demandId))}`;
const PROFILE_UPLOAD_ENDPOINT = '/demandsheet/profile/upload';

export const getProfiles = async (demandId) => {
  if (!demandId) throw new Error('demandId is required');
  const res = await api.get(PROFILE_GET_ENDPOINT(demandId), {
    headers: { Accept: 'application/json' },
  });
  return res.data;
};

//export const uploadProfileAttachment = async (demandId, file) => {
//  if (!demandId) throw new Error('demandId is required');
//  if (!file) throw new Error('file is required');
//
//  const formData = new FormData();
//  formData.append('demandId', String(demandId));
//  formData.append('file', file);
//
//  const res = await api.post(PROFILE_UPLOAD_ENDPOINT, formData, {
//    headers: {
//      // let browser set boundary
//    },
//  });
//  return res.data;
//};

export const attachProfilesToDemand = async ({ demandPkId, profileIds }) => {
  const url = "/profile-track/attach/profiles-to-demand";
  const payload = { demandPkId, profileIds };
  const res = await api.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res?.data ?? res;
};