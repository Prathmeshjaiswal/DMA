// src/api/Demands/profile.js
import api from '../client';

const USE_DEMO = true;

const PROFILE_GET_ENDPOINT   = (demandId) => `/demandsheet/profile/${encodeURIComponent(String(demandId))}`;

export const getProfiles = async (demandId) => {
  if (!demandId) throw new Error('demandId is required');
  const res = await api.get(PROFILE_GET_ENDPOINT(demandId), {
    headers: { Accept: 'application/json' },
  });
  return res.data;
};

export const getAttachedProfilesByDemandId = async (demandId) => {
  if (!demandId) throw new Error('demandId is required');
  const res = await api.get(`/profile-track/${encodeURIComponent(String(demandId))}/profiles`, {
    headers: {
    },
  });
  return res.data;
};

export const attachProfilesToDemand = async ({ demandPkId, profileIds }) => {
  const url = "/profile-track/attach/profiles-to-demand";
  const payload = { demandPkId, profileIds };
  const res = await api.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res?.data ?? res;
};