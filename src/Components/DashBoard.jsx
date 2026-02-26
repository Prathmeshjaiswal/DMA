// ================== src/pages/Dashboard.jsx ==================
import React, { useEffect, useMemo, useState } from 'react';
import { DatePicker, message, Spin } from 'antd';
import dayjs from 'dayjs';
import Layout from './Layout.jsx';

import {
  getDashboardCount,
  getLobSummary,
  getHbuSummary,
  getPrioritySummary,
} from "./api/DashBoardData.js";

import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

const { RangePicker } = DatePicker;

const DASHBOARD_CACHE_KEY = 'dashboardCache_v2';

const readCache = () => {
  try {
    const raw = localStorage.getItem(DASHBOARD_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const writeCache = (payload) => {
  try {
    localStorage.setItem(
      DASHBOARD_CACHE_KEY,
      JSON.stringify({ ...payload, ts: Date.now() })
    );
  } catch {}
};

const timeAgo = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min <= 0) return 'just now';
  if (min < 60) return `${min} min${min > 1 ? 's' : ''} ago`;
  const hr = Math.floor(min / 60);
  return `${hr} hr${hr > 1 ? 's' : ''} ago`;
};

const fmtYMD = (d) => dayjs(d).format('YYYY-MM-DD');

const DEFAULT_COUNT = {
  totalDemands: 0,
  openCount: 0,
  closedCount: 0,
  rejected: 0,
};

const COLORS = ['#ff7f0e', '#2ca02c', '#1f77b4', '#d62728'];

/** Helpers to extract labels */
const getLobName = (row) =>
  row?.lob?.name ?? row?.lob ?? row?.name ?? row?.label ?? '';

const getHbuName = (row) =>
  row?.hbu?.name ?? row?.hbu ?? row?.name ?? row?.label ?? '';

/** Build grouped rows for LOB/HBU charts */
const normalizeLobStack = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map((row) => ({
    name: String(getLobName(row) || 'Unknown'),
    open: Number(row?.openDemand ?? 0),
    fulfilled: Number(row?.fulfilledDemand ?? 0),
    shared: Number(row?.profileSharedCount ?? 0),
  }));
};

const normalizeHbuStack = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map((row) => ({
    name: String(getHbuName(row) || 'Unknown'),
    open: Number(row?.openDemand ?? 0),
    fulfilled: Number(row?.fulfilledDemand ?? 0),
    shared: Number(row?.profileSharedCount ?? 0),
  }));
};

/* ---- Priority parser for object {p0Count, p1Count, p2Count} ---- */
const normalizePriorityObject = (obj) => {
  if (!obj || typeof obj !== 'object') return [];
  // Coerce to numbers; keep zeros (do not filter).
  const p0 = Number(obj.p0Count ?? 0);
  const p1 = Number(obj.p1Count ?? 0);
  const p2 = Number(obj.p2Count ?? 0);
  return [
    { name: 'P0', value: Number.isFinite(p0) ? p0 : 0 },
    { name: 'P1', value: Number.isFinite(p1) ? p1 : 0 },
    { name: 'P2', value: Number.isFinite(p2) ? p2 : 0 },
  ];
};

export default function Dashboard() {
  // default date range: today-30 -> today
  const [selectedDate, setSelectedDate] = useState([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  const cached = readCache();
  const [count, setCount] = useState(cached?.count || DEFAULT_COUNT);
  const [lobRows, setLobRows] = useState(cached?.lob || []);
  const [hbuRows, setHbuRows] = useState(cached?.hbu || []);
  const [priorityRaw, setPriorityRaw] = useState(cached?.priority || {}); // should be an object
  const [lastUpdated, setLastUpdated] = useState(cached?.ts || null);
  const [loading, setLoading] = useState(false);

  const lobStack = useMemo(() => normalizeLobStack(lobRows), [lobRows]);
  const hbuStack = useMemo(() => normalizeHbuStack(hbuRows), [hbuRows]);

  // Parse priority directly from the object you said the API returns
  const priorityData = useMemo(() => normalizePriorityObject(priorityRaw), [priorityRaw]);

  // Total for conditional rendering (render if any slice > 0)
  const priorityTotal = useMemo(
    () => (priorityData || []).reduce((s, d) => s + (Number(d.value) || 0), 0),
    [priorityData]
  );

  const fetchAll = async (from, to) => {
    setLoading(true);
    try {
      const [c, lob, hbu, pri] = await Promise.all([
        getDashboardCount(from, to),
        getLobSummary(from, to),
        getHbuSummary(from, to),
        getPrioritySummary(from, to),
      ]);

      setCount(c || DEFAULT_COUNT);
      setLobRows(Array.isArray(lob) ? lob : (Array.isArray(lob?.data) ? lob.data : []));
      setHbuRows(Array.isArray(hbu) ? hbu : (Array.isArray(hbu?.data) ? hbu.data : []));
      // ✅ Unwrap potential Axios shape; your API returns a P0/P1/P2 object
      setPriorityRaw((pri && (pri.data ?? pri)) || {});
//       console.log("priorityu",pri);
      writeCache({ count: c, lob, hbu, priority: pri, ts: Date.now() });
      setLastUpdated(Date.now());
    } catch (err) {
      message.error(err?.message || "Failed loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const [f, t] = selectedDate;
    fetchAll(fmtYMD(f), fmtYMD(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRangeChange = (range) => {
    if (!range) return;
    setSelectedDate(range);
    const [f, t] = range;
    fetchAll(fmtYMD(f), fmtYMD(t));
  };

  const displayFormat = (v) => v ? v.format('DD-MMM-YYYY').toLowerCase() : '';

  const cards = useMemo(() => ([
    { key: 'totalDemands', label: 'Total Demands', labelClass: 'text-sm text-orange-400', value: count.totalDemands },
    { key: 'openPositions', label: 'Open Positions', labelClass: 'text-sm text-gray-300', value: count.openCount },
    { key: 'closedPositions', label: 'Closed Positions', labelClass: 'text-sm text-gray-300', value: count.closedCount },
    { key: 'Demand Abandoned', label: 'Demand Abandoned', labelClass: 'text-sm text-gray-300', value: count.rejectedCount },
  ]), [count]);

  // Small tooltip styling for all charts
  const tooltipStyle = { fontSize: 11, padding: '4px 8px', borderRadius: 6 };
  const tooltipItemStyle = { fontSize: 11 };
  const legendStyle = { fontSize: 11 };

  // Set your desired ticks; change to [1,2,3,4,5] if small values
  const FIXED_TICKS = [1,2,3,4,5];

  return (
    <>
      <Layout>
        <div className="bg-white mt-5">
          <div className="max-w-7xl mx-auto px-4 py-4">

            {/* Header */}
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                {lastUpdated && (
                  <span className="text-xs text-slate-500">Updated {timeAgo(lastUpdated)}</span>
                )}
              </div>

              <RangePicker
                value={selectedDate}
                onChange={handleRangeChange}
                className="w-[320px]"
                format={displayFormat}
                allowClear={false}
                disabledDate={(c) => c && c.isAfter(dayjs(), 'day')}
              />
            </header>

            {loading && <Spin size="small" className="mb-2" />}

            {/* KPI Cards */}
            <section className="grid grid-cols-12 gap-4 mb-5">
              {cards.map((card) => (
                <div
                  key={card.key}
                  className="col-span-12 md:col-span-3 rounded-lg border border-slate-700 bg-gray-800 px-4 py-2 text-white"
                >
                  <div className={card.labelClass}>{card.label}</div>
                  <div className="text-sm mt-1">{card.value}</div>
                </div>
              ))}
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* LOB GROUPED BAR (attached bars, no background boxes) */}
              <div className="rounded-lg border p-3">
                <div className="text-sm font-semibold mb-2">LOB Summary</div>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={lobStack}
                      barGap={0}           // attach series within a category
                      barCategoryGap="18%" // spacing between categories
                    >
                      {/* No CartesianGrid to remove background boxes */}
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} ticks={FIXED_TICKS} />
                      <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                      <Legend wrapperStyle={legendStyle} />
                      <Bar dataKey="open" name="Open Demand" fill="#ff7f0e" maxBarSize={18} />
                      <Bar dataKey="fulfilled" name="Fulfilled Demand" fill="#2ca02c" maxBarSize={18} />
                      <Bar dataKey="shared" name="Profile Shared" fill="#1f77b4" maxBarSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* HBU GROUPED BAR (attached bars, no background boxes) */}
              <div className="rounded-lg border p-3">
                <div className="text-sm font-semibold mb-2">HBU Summary</div>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={hbuStack}
                      barGap={0}
                      barCategoryGap="18%"
                    >
                      {/* No grid */}
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} ticks={FIXED_TICKS} />
                      <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                      <Legend wrapperStyle={legendStyle} />
                      <Bar dataKey="open" name="Open Demand" fill="#ff7f0e" maxBarSize={18} />
                      <Bar dataKey="fulfilled" name="Fulfilled Demand" fill="#2ca02c" maxBarSize={18} />
                      <Bar dataKey="shared" name="Profile Shared" fill="#1f77b4" maxBarSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* PRIORITY PIE (compact tooltip; render only if any value > 0) */}
              <div className="rounded-lg border p-3">
                <div className="text-sm font-semibold mb-2">Priority Summary</div>
                <div style={{ width: '100%', height: 260 }}>
{/*                   {priorityTotal > 0 ? ( */}
                    <ResponsiveContainer>
                      <PieChart>
                        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                        <Legend wrapperStyle={legendStyle} />
                        <Pie
                          data={priorityData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                          labelStyle={{ fontSize: 11 }}
                        >
                          {priorityData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
{/*                   ) : ( */}
{/*                     <div className="text-sm text-gray-500 flex items-center justify-center h-full"> */}
{/*                       No priority datas. */}
{/*                     </div> */}
{/*                   )} */}
                </div>
              </div>

            </section>

          </div>
        </div>
      </Layout>
    </>
  );
}