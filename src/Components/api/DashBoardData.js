// ================== src/api/DashBoardData.js ==================
import axios from "axios";
import api from './client.js';
//const API_BASE = "/api/dashboard";



// Dashboard count
export const getDashboardCount = async (fromDate, toDate) => {
  const { data } = await api.get(`/api/dashboard/dashboard-count`, {
    params: { fromDate, toDate },
  });
  return data; // expected: { totalDemands, openPositions, closedPositions, rejected, ... }
};

// LOB summary (list)
export const getLobSummary = async (fromDate, toDate) => {
  const { data } = await api.get(`/api/dashboard/lob-summary`, {
    params: { fromDate, toDate },
  });
  // expected: List<LobSummaryDto>; e.g., [{ lob: "Payments", total: 10, ... }, ...]
  return Array.isArray(data) ? data : [];
};

// HBU summary (list)
export const getHbuSummary = async (fromDate, toDate) => {
  const { data } = await api.get(`/api/dashboard/hbu-summary`, {
    params: { fromDate, toDate },
  });
  // expected: List<HbuSummaryDto>; e.g., [{ hbu: "BFSI", total: 12, ... }, ...]
  return Array.isArray(data) ? data : [];
};

// Priority summary
export const getPrioritySummary = async (fromDate, toDate) => {
  const { data } = await api.get(`/api/dashboard/priority-summary`, {
    params: { fromDate, toDate },
  });
  // expected: e.g., [{ priority: "P1", count: 5 }, { priority: "P2", count: 12 }, ...]
  // If backend returns a map, adapt here accordingly.
  return data ? data : [];
};

// Convenience: fetch all 4 in parallel
//export const fetchDashboardAll = async (fromDate, toDate) => {
//  const [count, lob, hbu, priority] = await Promise.all([
//    getDashboardCount(fromDate, toDate),
//    getLobSummary(fromDate, toDate),
//    getHbuSummary(fromDate, toDate),
//    getPrioritySummary(fromDate, toDate),
//  ]);
//  return { count, lob, hbu, priority };
//};