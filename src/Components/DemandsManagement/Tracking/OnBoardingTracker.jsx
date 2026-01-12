
// src/pages/ProfileTracker.jsx
import React, { useState } from 'react';
import axios from 'axios';

// If you already have an axios instance, replace with: import { api } from '../lib/api';
const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000,
});

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
}
function parseISODateSafe(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
function calculateAgeDays(dateOfProfileShared, decisionDate) {
  const start = parseISODateSafe(dateOfProfileShared);
  if (!start) return null;
  const end = parseISODateSafe(decisionDate) ?? new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((end.getTime() - start.getTime()) / msPerDay);
  return diffDays < 0 ? 0 : diffDays;
}
/** Format YYYY-MM-DD reliably in local TZ */
function toYMD(dateStr) {
  // Ensures YYYY-MM-DD without time; good for server-side date filters
  const d = parseISODateSafe(dateStr);
  if (!d) return '';
  // Adjust for timezone so date-only doesn’t slip a day
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ProfileTracker() {
  const [mode, setMode] = useState('byId'); // 'byId' | 'byDate'
  const [demandId, setDemandId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchByDemandId(id) {
    const url = `/api/v1/demands/${encodeURIComponent(id)}/profiles`;
    const res = await api.get(url);
    const payload = res?.data?.data ?? res?.data;
    const arr = Array.isArray(payload) ? payload : (payload ? [payload] : []);
    return arr;
  }

  async function fetchByDateRange(from, to) {
    // 🔁 Adjust this path & param names to match your backend
    // Example A:
    const res = await api.get('/api/v1/demands/profiles', {
      params: { from, to },
    });
    // Example B (if your backend uses different keys):
    // const res = await api.get('/api/v1/profiles', { params: { startDate: from, endDate: to } });

    const payload = res?.data?.data ?? res?.data;
    const arr = Array.isArray(payload) ? payload : (payload ? [payload] : []);
    return arr;
  }

  async function onSearch(e) {
    e.preventDefault();
    setError(null);
    setProfiles([]);
    setLoading(true);

    try {
      if (mode === 'byId') {
        const id = demandId.trim();
        if (!id) throw new Error('Please enter a Demand ID.');
        const rows = await fetchByDemandId(id);
        if (rows.length === 0) setError('No profiles found for this Demand ID.');
        setProfiles(rows);
      } else {
        // byDate
        const from = toYMD(fromDate);
        const to = toYMD(toDate);
        if (!from || !to) throw new Error('Please select both From and To dates.');
        if (new Date(from) > new Date(to)) throw new Error('From date must be earlier than To date.');
        const rows = await fetchByDateRange(from, to);
        if (rows.length === 0) setError('No profiles found in this date range.');
        setProfiles(rows);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch profiles';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setDemandId('');
    setFromDate('');
    setToDate('');
    setProfiles([]);
    setError(null);
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Profile Tracker</h1>

      {/* Search Mode Toggle */}
      <div className="mb-3 flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="searchMode"
            value="byId"
            checked={mode === 'byId'}
            onChange={() => setMode('byId')}
            className="h-4 w-4 text-blue-600"
          />
          <span className="text-sm text-gray-800">Search by Demand ID</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="searchMode"
            value="byDate"
            checked={mode === 'byDate'}
            onChange={() => setMode('byDate')}
            className="h-4 w-4 text-blue-600"
          />
          <span className="text-sm text-gray-800">Search by Date Range</span>
        </label>
      </div>

      {/* Search Form */}
      <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3 mb-4">
        {mode === 'byId' ? (
          <div className="flex items-center gap-2">
            <label htmlFor="demandId" className="sr-only">Demand ID</label>
            <input
              id="demandId"
              type="search"
              value={demandId}
              onChange={(e) => setDemandId(e.target.value)}
              placeholder="Enter Demand ID (e.g., HSBC-123)"
              className="w-80 h-9 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <label htmlFor="fromDate" className="text-xs text-gray-600">From</label>
              <input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-44 h-9 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="toDate" className="text-xs text-gray-600">To</label>
              <input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-44 h-9 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="h-9 rounded-md bg-blue-600 px-4 text-white text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="h-9 rounded-md border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-100"
        >
          Clear
        </button>
      </form>

      {/* Status */}
      {loading && <div className="text-sm text-gray-700 mb-2">Loading…</div>}
      {error && <div className="text-sm text-red-600 mb-2">Error: {error}</div>}

      {/* Results table */}
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="min-w-[1100px] w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <Th>EDIT</Th>
              <Th>Demand Id</Th>
              <Th>RR</Th>
              <Th>LOB</Th>
              <Th>HSBC Hiring Manager</Th>
              <Th>Skill Cluster</Th>
              <Th>Primary Skill</Th>
              <Th>Secondary Skill</Th>
              <Th>Current Profile Shared</Th>
              <Th>Date of Profile Shared</Th>
              <Th>External/Internal</Th>
              <Th>Interview Date</Th>
              <Th>Status</Th>
              <Th>Decision Date</Th>
              <Th>Age (days)</Th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 && !loading ? (
              <tr>
                <td className="p-3 text-sm text-gray-500" colSpan={15}>
                  No data. Use the search above.
                </td>
              </tr>
            ) : (
              profiles.map((p, idx) => (
                <tr key={p.id ?? `${p.demandId}-${idx}`} className="even:bg-gray-50/50">
                  <Td>
                    <button
                      type="button"
                      onClick={() => alert(`Edit profile ${p.id ?? idx}`)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                    >
                      Edit
                    </button>
                  </Td>
                  <Td>{p?.demandId ?? '-'}</Td>
                  <Td>{p?.rr ?? '-'}</Td>
                  <Td>{p?.lob ?? '-'}</Td>
                  <Td>{p?.hiringManager ?? '-'}</Td>
                  <Td>{p?.skillCluster ?? '-'}</Td>
                  <Td>{p?.primarySkill ?? '-'}</Td>
                  <Td>{p?.secondarySkill ?? '-'}</Td>
                  <Td>{p?.currentProfileShared ?? '-'}</Td>
                  <Td>{formatDate(p?.dateOfProfileShared)}</Td>
                  <Td>{p?.externalInternal ?? '-'}</Td>
                  <Td>{formatDate(p?.interviewDate)}</Td>
                  <Td>{p?.status ?? '-'}</Td>
                  <Td>{formatDate(p?.decisionDate)}</Td>
                  <Td>{calculateAgeDays(p?.dateOfProfileShared, p?.decisionDate) ?? '-'}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-gray-500">* Fixed data coming from Demand Sheet; not editable</p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap border-b border-gray-200">
      {children}
    </th>
  );
}
function Td({ children }) {
  return (
    <td className="px-3 py-2 text-sm text-gray-800 whitespace-nowrap border-b border-gray-100 align-top">
      {children}
    </td>
  );
}
