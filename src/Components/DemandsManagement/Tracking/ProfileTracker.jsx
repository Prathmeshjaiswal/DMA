
import React, { useState } from 'react';
import axios from 'axios';
import Layout from  '../../Layout'
import { getProfilesByDemandID } from '../../api/Trackers/getProfileTracker';
import { getProfilesByDateRange } from '../../api/Trackers/getProfileTracker';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;
import dayjs  from "dayjs";


function calculateAgeDays(dateOfProfileShared, decisionDate) {
  const start = parseISODateSafe(dateOfProfileShared);
  if (!start) return null;
  const end = parseISODateSafe(decisionDate) ?? new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((end.getTime() - start.getTime()) / msPerDay);
  return diffDays < 0 ? 0 : diffDays;
}

function parseISODateSafe(value) {
  if (!value) return null; // handle null/undefined
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date; // return null if invalid
}


export default function ProfileTracker() {
  const [mode, setMode] = useState('bydemandId');
  const [demandId, setDemandId] = useState('');
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState({start:dayjs(),end:dayjs(),});
  const BACKEND_FMT = "DD-MMM-YYYY";
  async function fetchByDemandId(demandId) {
    const res = await getProfilesByDemandID(demandId);
    const payload = res;
    const arr = Array.isArray(payload) ? payload : (payload ? [payload] : []);
    return arr ;
    }

   async function fetchByDateRange(selectedDate) {
     const res = await getProfilesByDateRange(selectedDate);
    const payload = res;
    const arr = Array.isArray(payload) ? payload : (payload ? [payload] : []);
    return arr;
  }

  const displayFormat = (value) =>
    value ? value.format('DD-MMM-YYYY'):'';

//   const [dateRange,SetDateRange] = useState({ range: [dayjs("2026-01-01"), dayjs("2026-01-31")] });

  const handleChange = (values, dateStrings) => {
  if (!values) return;

  const [start,end] = values;

  if (typeof start?.isValid !== "function" || typeof end?.isValid !== "function") {
    console.log("Invalid date values. Ensure RangePicker returns Day.js values.");
    return;
  }

  if (!start.isValid() || !end.isValid()) {
      message.warning("Please select a valid date range.");
    return;
  }

  const startDate = start.format(BACKEND_FMT);
  const endDate = end.format(BACKEND_FMT);
     setSelectedDate({ startDate, endDate });
    console.log({ startDate, endDate, dateStrings });
  };

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setProfiles([]);
    setLoading(true);
//     const err = validateDDMMMYYYYRange(from, to);
//     if (err) return setError(err);

//     const apiFrom = ddMMMYYYY_to_YMD(from);
//     const apiTo   = ddMMMYYYY_to_YMD(to);

//     await onSearch({ from: apiFrom, to: apiTo });


    try {
      if (mode === 'bydemandId') {
        const id = demandId;
        if (!id) throw new Error('Please enter a Demand ID.');
        const rows = await fetchByDemandId(demandId);
        if (rows.length === 0) setError('No profiles found for this Demand ID.');
        setProfiles(rows);
        console.log(rows);
      } else {
        const rows = await fetchByDateRange(selectedDate);
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
    setProfiles([]);
    setError(null);
  }

  return (
      <>
{/*        <NavBar /> */}
<Layout>
    <div className="p-4">
            <h2 className="text-2xl md:text-2xl font-bold tracking-tight text-gray-900">
                Profile Tracker
            </h2>

      {/* Search Mode Toggle */}
      <div className="mb-3 flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="searchMode"
            value="bydemandId"
            checked={mode === 'bydemandId'}
            onChange={() => setMode('bydemandId')}
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
      <form onSubmit={submit} className="flex flex-wrap items-end gap-3 mb-4">
        {mode === 'bydemandId' ? (
          <div className="flex items-center gap-2">
            <label htmlFor="demandId" className="sr-only">Demand ID</label>
            <input
              id="demandId"
              type="text"
              value={demandId}
              onChange={(e) => setDemandId(e.target.value)}
              placeholder="Enter Demand ID (e.g., HSBC-123)"
              className="w-80 h-9 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
                <RangePicker
      value={[
          selectedDate?.startDate ? dayjs(selectedDate.startDate, displayFormat) : null,
          selectedDate?.endDate ? dayjs(selectedDate.endDate, displayFormat) : null,

      ]}

                  onChange={handleChange}
                  placeholder={["Start date", "End date"]}
                  className="w-[320px]"      // wider for two inputs
                  size="middle"
                  allowClear={false}
                  format={displayFormat}
                />
          </div>
        )}

        <button
          type="submit"
          className="h-9 rounded-md bg-gray-900 px-4 text-white text-sm font-medium"
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
              <Th>Profile Shared</Th>
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
                  <Td>{p?.rrNumber ?? '-'}</Td>
                  <Td>{p?.lob ?? '-'}</Td>
                  <Td>{p?.hiringManager ?? '-'}</Td>
                  <Td>{p?.skillCluter ?? '-'}</Td>
                  <Td>{p?.primarySkills ?? '-'}</Td>
                  <Td>{p?.secondarySkills ?? '-'}</Td>
                  <Td>{p?.currentProfileShared ?? '-'}</Td>
                  <Td>{displayFormat(p?.dateOfProfileShared)}</Td>
                  <Td>{p?.externalInternal ?? '-'}</Td>
                  <Td>{displayFormat(p?.interviewDate)}</Td>
                  <Td>{p?.status ?? '-'}</Td>
                  <Td>{displayFormat(p?.decisionDate)}</Td>
                  <Td>{calculateAgeDays(p?.dateOfProfileShared, p?.decisionDate) ?? '-'}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
       </Layout>
    </>
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
