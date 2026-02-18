// src/Components/Trackers/ProfileTracker.jsx
import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker, Input, Pagination, message, Tooltip, Button } from 'antd';
import {EditOutlined,SaveOutlined,CloseOutlined,SearchOutlined,ReloadOutlined,CloseCircleFilled,} from '@ant-design/icons';
import Layout from '../../Layout';
import {listProfileTracker,updateProfileTracker,searchProfileTracker,getDropDownData} from '../../api/Trackers/tracker';
// import { getDropdown } from '../../api/adddemands';

const BACKEND_FMT = 'YYYY-MM-DD';


function parseISODateSafe(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
function calculateDaysFrom(attachedDate) {
  const start = parseISODateSafe(attachedDate);
  if (!start) return null;
  const end = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.floor((end.getTime() - start.getTime()) / msPerDay);
  return diff < 0 ? 0 : diff;
}
const nameOf = (obj) => (obj && typeof obj === 'object' ? obj.name ?? '' : obj ?? '');

function TdWrapWithTooltip({ text, w }) {
  const display = text ?? '-';
  return (
// <<<<<<< HEAD
    <td
      className="px-3 py-2 text-sm text-gray-800 border-b border-gray-100 align-middle truncate"
      style={{ width: w, maxWidth: w }}
    >
      <Tooltip title={display} mouseEnterDelay={0.3}>
        <div className="leading-snug">{display}</div>
      </Tooltip>
    </td>
// =======
//       <>
// {/*        <NavBar /> */}
// <Layout>
//     <div className="p-4">
//             <h2 className="text-2xl md:text-2xl font-bold tracking-tight text-gray-900">
//                 Profile Tracker
//             </h2>
//
//       {/* Search Mode Toggle */}
//       <div className="mb-3 flex items-center gap-6">
//         <label className="flex items-center gap-2">
//           <input
//             type="radio"
//             name="searchMode"
//             value="bydemandId"
//             checked={mode === 'bydemandId'}
//             onChange={() => setMode('bydemandId')}
//             className="h-4 w-4 text-blue-600"
//           />
//           <span className="text-sm text-gray-800">Search by Demand ID</span>
//         </label>
//         <label className="flex items-center gap-2">
//           <input
//             type="radio"
//             name="searchMode"
//             value="byDate"
//             checked={mode === 'byDate'}
//             onChange={() => setMode('byDate')}
//             className="h-4 w-4 text-blue-600"
//           />
//           <span className="text-sm text-gray-800">Search by Date Range</span>
//         </label>
//       </div>
//
//       {/* Search Form */}
//       <form onSubmit={submit} className="flex flex-wrap items-end gap-3 mb-4">
//         {mode === 'bydemandId' ? (
//           <div className="flex items-center gap-2">
//             <label htmlFor="demandId" className="sr-only">Demand ID</label>
//             <input
//               id="demandId"
//               type="text"
//               value={demandId}
//               onChange={(e) => setDemandId(e.target.value)}
//               placeholder="Enter Demand ID (e.g., HSBC-123)"
//               className="w-80 h-9 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//             />
//           </div>
//         ) : (
//           <div className="flex items-center gap-2">
//                 <RangePicker
//       value={[
//           selectedDate?.startDate ? dayjs(selectedDate.startDate, displayFormat) : null,
//           selectedDate?.endDate ? dayjs(selectedDate.endDate, displayFormat) : null,
//
//       ]}
//
//                   onChange={handleChange}
//                   placeholder={["Start date", "End date"]}
//                   className="w-[320px]"      // wider for two inputs
//                   size="middle"
//                   allowClear={false}
//                   format={displayFormat}
//                 />
//           </div>
//         )}
//
//         <button
//           type="submit"
//           className="h-9 rounded-md bg-gray-900 px-4 text-white text-sm font-medium"
//         >
//           Search
//         </button>
//         <button
//           type="button"
//           onClick={clearAll}
//           className="h-9 rounded-md border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-100"
//         >
//           Clear
//         </button>
//       </form>
//
//       {/* Status */}
//       {loading && <div className="text-sm text-gray-700 mb-2">Loading…</div>}
//       {error && <div className="text-sm text-red-600 mb-2">Error: {error}</div>}
//
//       {/* Results table */}
//       <div className="overflow-x-auto rounded-md border border-gray-200">
//         <table className="min-w-[1100px] w-full border-collapse">
//           <thead className="bg-gray-50">
//             <tr>
//               <Th>EDIT</Th>
//               <Th>Demand Id</Th>
//               <Th>RR</Th>
//               <Th>LOB</Th>
//               <Th>HSBC Hiring Manager</Th>
//               <Th>Skill Cluster</Th>
//               <Th>Primary Skill</Th>
//               <Th>Secondary Skill</Th>
//               <Th>Profile Shared</Th>
//               <Th>Date of Profile Shared</Th>
//               <Th>External/Internal</Th>
//               <Th>Interview Date</Th>
//               <Th>Status</Th>
//               <Th>Decision Date</Th>
//               <Th>Age (days)</Th>
//             </tr>
//           </thead>
//           <tbody>
//             {profiles.length === 0 && !loading ? (
//               <tr>
//                 <td className="p-3 text-sm text-gray-500" colSpan={15}>
//                   No data. Use the search above.
//                 </td>
//               </tr>
//             ) : (
//               profiles.map((p, idx) => (
//                 <tr key={p.id ?? `${p.demandId}-${idx}`} className="even:bg-gray-50/50">
//                   <Td>
//                     <button
//                       type="button"
//                       onClick={() => alert(`Edit profile ${p.id ?? idx}`)}
//                       className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
//                     >
//                       Edit
//                     </button>
//                   </Td>
//                   <Td>{p?.demandId ?? '-'}</Td>
//                   <Td>{p?.rrNumber ?? '-'}</Td>
//                   <Td>{p?.lob ?? '-'}</Td>
//                   <Td>{p?.hiringManager ?? '-'}</Td>
//                   <Td>{p?.skillCluter ?? '-'}</Td>
//                   <Td>{p?.primarySkills ?? '-'}</Td>
//                   <Td>{p?.secondarySkills ?? '-'}</Td>
//                   <Td>{p?.currentProfileShared ?? '-'}</Td>
//                   <Td>{displayFormat(p?.dateOfProfileShared)}</Td>
//                   <Td>{p?.externalInternal ?? '-'}</Td>
//                   <Td>{displayFormat(p?.interviewDate)}</Td>
//                   <Td>{p?.status ?? '-'}</Td>
//                   <Td>{displayFormat(p?.decisionDate)}</Td>
//                   <Td>{calculateAgeDays(p?.dateOfProfileShared, p?.decisionDate) ?? '-'}</Td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//        </Layout>
//     </>
// >>>>>>> simran_ui
  );
}
function Pill({ priority }) {
  const p = String(priority ?? '').toUpperCase();
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold';
  if (p === 'P1')
    return (
      <span
        className={base}
        style={{ background: '#E6FFFA', color: '#065F46', border: '1px solid #99F6E4' }}
      >
        P1
      </span>
    );
  if (p === 'P2')
    return (
      <span
        className={base}
        style={{ background: '#FFF7ED', color: '#92400E', border: '1px solid #FED7AA' }}
      >
        P2
      </span>
    );
  if (p === 'P3')
    return (
      <span
        className={base}
        style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}
      >
        P3
      </span>
    );
  return (
    <span
      className={base}
      style={{ background: '#EDF2F7', color: '#2D3748', border: '1px solid #CBD5E0' }}
    >
      {p || '-'}
    </span>
  );
}
function Th({ children, w }) {
  return (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap border-b border-gray-200 align-bottom"
      style={w ? { width: w } : undefined}
    >
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
// <<<<<<< HEAD
}
function toDayjs(val) {
  if (!val) return null;
  return dayjs(val, BACKEND_FMT).isValid()
    ? dayjs(val, BACKEND_FMT)
    : dayjs(val).isValid()
    ? dayjs(val)
    : null;
}
function displayDate(value) {
  if (!value) return '';
  const d =
    parseISODateSafe(value) ??
    (typeof value === 'string' ? dayjs(value, BACKEND_FMT).toDate() : null);
  if (!d) return String(value);
  return dayjs(d).format(BACKEND_FMT);
}
function getAttachedDate(row) {
  return row?.attachedDate ?? row?.dateAttached ?? row?.profileAttachedDate ?? null;
}

export default function ProfileTracker() {
  // data for current page view
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState(null);

  // edit
  const [editId, setEditId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  // dropdowns
  const [dd, setDd] = useState({
    priority: [],
    location: [],
    evaluationStatus: [],
    profileTrackerStatus: [],
  });

  // pagination (UI 1-based, API 0-based)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  // when filtered, we client-side paginate this cached full list
  const [searchCache, setSearchCache] = useState([]);

  // column filters toggle (visibility of inputs)
  const [filterOpen, setFilterOpen] = useState({
    demandCode: false,
    candidateName: false,
    empId: false,
    priority: false,
    skillCluster: false, // (no control yet)
    primarySkills: false, // (no control yet)
    secondarySkills: false, // (no control yet)
    lob: false,
    hbu: false,
    location: false,
    profileType: false,
    hiringManager: false,
    evaluationStatus: false,
    status: false,
  });

  // actual filter values
  const [filters, setFilters] = useState({
    demandCode: '',
    candidateName: '',
    empId: '',
    priority: '',
    lob: '',
    hbu: '',
    location: '',
    profileType: '',
    hiringManager: '',
    evaluationStatus: '',
    status: '',
  });

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v != null && String(v).trim() !== ''),
    [filters]
  );

  // load dropdowns once
  useEffect(() => {
    (async () => {
      try {
        const res = await getDropdown();
        setDd({
          priority: res?.priority ?? res?.priorities ?? [],
          location: res?.location ?? res?.locations ?? [],
          evaluationStatus: res?.evaluationStatus ?? res?.evaluationStatuses ?? [],
          profileTrackerStatus: res?.profileTrackerStatus ?? res?.statuses ?? [],
        });
      } catch {
        setDd((prev) => ({
          ...prev,
          priority:
            prev.priority?.length ? prev.priority : [{ name: 'P1' }, { name: 'P2' }, { name: 'P3' }],
        }));
      }
    })();
  }, []);

  // helper to extract array from any response shape
  const itemsFrom = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    const data = res?.data ?? res;
    return (
      data?.items ??
      data?.content ??
      data?.records ??
      data?.list ??
      data?.data ??
      []
    );
  };

  // LOAD: if filters active -> call search with only filters, cache, client-paginate
  //       else -> list with page/size (server-side pagination)
  const load = async ({ page: p = page, size: s = size } = {}) => {
    try {
      setLoading(true);
      setApiErr(null);

      if (hasActiveFilters) {
        // Build filters-only payload (remove empty)
        const payload = Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v != null && String(v).trim() !== '')
        );
        const res = await searchProfileTracker(payload); // <-- ONLY FILTERS
        const all = itemsFrom(res);
        setSearchCache(all);

        // client-side slice for the current page
        const start = p * s;
        const end = start + s;
        const pageSlice = all.slice(start, end);

        setRows(pageSlice);
        setTotal(all.length);
        setPage(p);
        setSize(s);
      } else {
        setSearchCache([]); // clear cache when not filtering
        const resp = await listProfileTracker(p, s);
        const items = itemsFrom(resp);
        const t =
          resp?.total ??
          resp?.totalElements ??
          resp?.data?.total ??
          resp?.page?.totalElements ??
          items.length;

        setRows(items);
        setTotal(Number.isFinite(t) ? t : items.length);
        setPage(Number.isFinite(resp?.page) ? resp.page : p);
        setSize(Number.isFinite(resp?.size) ? resp.size : s);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load tracker';
      setApiErr(msg);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // first load
  useEffect(() => {
    load({ page: 0, size });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (resetToFirst = true) => {
    const nextPage = resetToFirst ? 0 : page;
    load({ page: nextPage, size });
  };

  // pagination change
  const onPageChange = (current, pageSize) => {
    const newPage = current - 1;
    const newSize = pageSize;
    setPage(newPage);
    setSize(newSize);

    if (hasActiveFilters) {
      // paginate client-side over searchCache
      const start = newPage * newSize;
      const end = start + newSize;
      const slice = searchCache.slice(start, end);
      setRows(slice);
      setTotal(searchCache.length);
    } else {
      // server-side paging
      load({ page: newPage, size: newSize });
    }
  };

  // open/close a column filter input
  const toggleFilterOpen = (key) => {
    setFilterOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const clearFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
    setFilterOpen((prev) => ({ ...prev, [key]: false }));
    applyFilters(true);
  };

  // editing
  const onEdit = (row) => {
    setEditId(row.id ?? row.key ?? null);
    setEditDraft({
      priority: row?.demand?.priority?.name ?? row?.priority ?? '',
      location: nameOf(row?.profile?.location) || '',
      evaluationStatus: row?.evaluationStatus ?? '',
      status: row?.profileTrackerStatus?.name ?? row?.status ?? '',
      profileSharedDate: row?.dateOfProfileShared ? displayDate(row?.dateOfProfileShared) : '',
      interviewDate: row?.interviewDate ? displayDate(row?.interviewDate) : '',
      decisionDate: row?.decisionDate ? displayDate(row?.decisionDate) : '',
    });
  };
  const onCancel = () => {
    setEditId(null);
    setEditDraft({});
  };
  const onSave = async (row) => {
    const id = row.id ?? row.key;
    if (id == null) {
      message.error('Missing row id');
      return;
    }
    const payload = {
      priority: editDraft.priority || null,
      location: editDraft.location || null,
      evaluationStatus: editDraft.evaluationStatus || null,
      status: editDraft.status || null,
      profileSharedDate: editDraft.profileSharedDate
        ? dayjs(editDraft.profileSharedDate).format(BACKEND_FMT)
        : null,
      interviewDate: editDraft.interviewDate ? dayjs(editDraft.interviewDate).format(BACKEND_FMT) : null,
      decisionDate: editDraft.decisionDate ? dayjs(editDraft.decisionDate).format(BACKEND_FMT) : null,
    };

    try {
      const updated = await updateProfileTracker({ id, payload });
      setRows((prev) => prev.map((r) => ((r.id ?? r.key) === id ? { ...r, ...payload, ...updated } : r)));
      message.success('Row updated');
      onCancel();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to update';
      message.error(msg);
    }
  };

  const renderOptions = (items = []) =>
    (Array.isArray(items) ? items : []).map((o, idx) => {
      const value = o?.name ?? String(o ?? '');
      return (
        <option key={idx} value={value}>
          {value}
        </option>
      );
    });

  const getDemandCode = (p) => {
    const lobCode = p?.lob ?? p?.demand?.lob?.code ?? p?.demand?.lob?.name ?? '';
    const demId = p?.demand?.demandId ?? p?.demandId ?? '';
    return [lobCode, demId].filter(Boolean).join('-');
  };

  const FilterHeader = ({ label, colKey }) => (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      <button
        type="button"
        className="text-gray-500 hover:text-gray-700"
        onClick={() => toggleFilterOpen(colKey)}
        title="Search"
      >
        <SearchOutlined />
      </button>
    </div>
  );

  const renderFilterRow = () => (
    <tr className="bg-gray-50">
      {/* EDIT col (no filter) */}
      <th className="px-3 py-1 border-b border-gray-200" />

      {/* Demand Id */}
      <th className="px-3 py-1 border-b border-gray-200">
        {filterOpen.demandCode ? (
          <div className="flex items-center gap-2">
            <Input
              size="small"
              placeholder="LOB-101"
              value={filters.demandCode}
              onChange={(e) => setFilters((f) => ({ ...f, demandCode: e.target.value }))}
              onPressEnter={() => applyFilters(true)}
              className="w-36"
            />
            <Button size="small" type="text" icon={<CloseCircleFilled />} onClick={() => clearFilter('demandCode')} />
          </div>
        ) : null}
      </th>

      {/* Candidate Name */}
      <th className="px-3 py-1 border-b border-gray-200">
        {filterOpen.candidateName ? (
          <div className="flex items-center gap-2">
            <Input
              size="small"
              placeholder="Candidate"
              value={filters.candidateName}
              onChange={(e) => setFilters((f) => ({ ...f, candidateName: e.target.value }))}
              onPressEnter={() => applyFilters(true)}
              className="w-40"
            />
            <Button size="small" type="text" icon={<CloseCircleFilled />} onClick={() => clearFilter('candidateName')} />
          </div>
        ) : null}
      </th>

      {/* Emp ID */}
      <th className="px-3 py-1 border-b border-gray-200">
        {filterOpen.empId ? (
          <div className="flex items-center gap-2">
            <Input
              size="small"
              placeholder="Emp ID"
              value={filters.empId}
              onChange={(e) => setFilters((f) => ({ ...f, empId: e.target.value }))}
              onPressEnter={() => applyFilters(true)}
              className="w-32"
            />
            <Button size="small" type="text" icon={<CloseCircleFilled />} onClick={() => clearFilter('empId')} />
          </div>
        ) : null}
      </th>

      {/* Priority */}
      <th className="px-3 py-1 border-b border-gray-200">
        {filterOpen.priority ? (
          <div className="flex items-center gap-2">
            <select
              className="h-7 rounded border border-gray-300 bg-white px-2 text-xs"
              value={filters.priority}
              onChange={(e) => {
                setFilters((f) => ({ ...f, priority: e.target.value }));
                applyFilters(true);
              }}
            >
              <option value="">All</option>
              {renderOptions(dd.priority)}
            </select>
            <Button size="small" type="text" icon={<CloseCircleFilled />} onClick={() => clearFilter('priority')} />
          </div>
        ) : null}
      </th>

      {/* Skill Cluster */}
      <th className="px-3 py-1 border-b border-gray-200" />
      {/* Primary Skills */}
      <th className="px-3 py-1 border-b border-gray-200" />
      {/* Secondary Skills */}
      <th className="px-3 py-1 border-b border-gray-200" />

      {/* LOB */}
      <th className="px-3 py-1 border-b border-gray-200">
        {filterOpen.lob ? (
          <div className="flex items-center gap-2">
            <Input
              size="small"
              placeholder="LOB"
              value={filters.lob}
              onChange={(e) => setFilters((f) => ({ ...f, lob: e.target.value }))}
              onPressEnter={() => applyFilters(true)}
              className="w-28"
            />
            <Button size="small" type="text" icon={<CloseCircleFilled />} onClick={() => clearFilter('lob')} />
          </div>
        ) : null}
      </th>

      {/* HBU */}
      <th className="px-3 py-1 border-b border-gray-200">
        {filterOpen.hbu ? (
          <div className="flex items-center gap-2">
            <Input
              size="small"
              placeholder="HBU"
              value={filters.hbu}
              onChange={(e) => setFilters((f) => ({ ...f, hbu: e.target.value }))}
              onPressEnter={() => applyFilters(true)}
              className="w-28"
            />
            <Button size="small" type="text" icon={<CloseCircleFilled />} onClick={() => clearFilter('hbu')} />
          </div>
        ) : null}
      </th>

      {/* Location */}
      <th className="px-3 py-1 border-b border-gray-200">
        {filterOpen.location ? (
          <div className="flex items-center gap-2">
            <select
              className="h-7 rounded border border-gray-300 bg-white px-2 text-xs"
              value={filters.location}
              onChange={(e) => {
                setFilters((f) => ({ ...f, location: e.target.value }));
                applyFilters(true);
              }}
            >
              <option value="">All</option>
              {renderOptions(dd.location)}
            </select>
            <Button size="small" type="text" icon={<CloseCircleFilled />} onClick={() => clearFilter('location')} />
          </div>
        ) : null}
      </th>

      {/* Profile Type */}
      <th className="px-3 py-1 border-b border-gray-200">
        {filterOpen.profileType ? (
          <div className="flex items-center gap-2">
            <Input
              size="small"
              placeholder="Internal/External"
              value={filters.profileType}
              onChange={(e) => setFilters((f) => ({ ...f, profileType: e.target.value }))}
              onPressEnter={() => applyFilters(true)}
              className="w-40"
            />
            <Button size="small" type="text" icon={<CloseCircleFilled />} onClick={() => clearFilter('profileType')} />
          </div>
        ) : null}
      </th>

      {/* Hiring Manager */}
      <th className="px-3 py-1 border-b border-gray-200">
        {filterOpen.hiringManager ? (
          <div className="flex items-center gap-2">
            <Input
              size="small"
              placeholder="Hiring Manager"
              value={filters.hiringManager}
              onChange={(e) => setFilters((f) => ({ ...f, hiringManager: e.target.value }))}
              onPressEnter={() => applyFilters(true)}
              className="w-40"
            />
            <Button size="small" type="text" icon={<CloseCircleFilled />} onClick={() => clearFilter('hiringManager')} />
          </div>
        ) : null}
      </th>

      {/* Attached Date */}
      <th className="px-3 py-1 border-b border-gray-200" />
      {/* Profile Shared Date */}
      <th className="px-3 py-1 border-b border-gray-200" />
      {/* Interview Date */}
      <th className="px-3 py-1 border-b border-gray-200" />
      {/* Decision Date */}
      <th className="px-3 py-1 border-b border-gray-200" />

      {/* Evaluation Status */}
      <th className="px-3 py-1 border-b border-gray-200">
        {filterOpen.evaluationStatus ? (
          <div className="flex items-center gap-2">
            <select
              className="h-7 rounded border border-gray-300 bg-white px-2 text-xs"
              value={filters.evaluationStatus}
              onChange={(e) => {
                setFilters((f) => ({ ...f, evaluationStatus: e.target.value }));
                applyFilters(true);
              }}
            >
              <option value="">All</option>
              {renderOptions(dd.evaluationStatus)}
            </select>
            <Button
              size="small"
              type="text"
              icon={<CloseCircleFilled />}
              onClick={() => clearFilter('evaluationStatus')}
            />
          </div>
        ) : null}
      </th>

      {/* Status */}
      <th className="px-3 py-1 border-b border-gray-200">
        {filterOpen.status ? (
          <div className="flex items-center gap-2">
            <select
              className="h-7 rounded border border-gray-300 bg-white px-2 text-xs"
              value={filters.status}
              onChange={(e) => {
                setFilters((f) => ({ ...f, status: e.target.value }));
                applyFilters(true);
              }}
            >
              <option value="">All</option>
              {renderOptions(dd.profileTrackerStatus)}
            </select>
            <Button size="small" type="text" icon={<CloseCircleFilled />} onClick={() => clearFilter('status')} />
          </div>
        ) : null}
      </th>

      {/* Aging */}
      <th className="px-3 py-1 border-b border-gray-200" />
    </tr>
  );

  return (
    <Layout>
      <div className="p-4">
        {/* Top bar with summary + pagination */}
                <div>
                  <h1 className="text-lg font-bold">Profile Tracker</h1>
                </div>

        {/* Status */}
        {loading && <div className="text-sm text-gray-700 my-2">Loading…</div>}
        {apiErr && <div className="text-sm text-red-600 my-2">Error: {apiErr}</div>}

        {/* Table */}
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="max-w-[1600px] w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <Th w={60}>EDIT</Th>
                <Th w={140}>
                  <FilterHeader label="Demand Id" colKey="demandCode" />
                </Th>

                <Th>
                  <FilterHeader label="Candidate Name" colKey="candidateName" />
                </Th>
                <Th>
                  <FilterHeader label="Emp ID" colKey="empId" />
                </Th>
                <Th>
                  <FilterHeader label="Priority" colKey="priority" />
                </Th>

                <Th w={180}>Skill Cluster</Th>
                <Th w={220}>Primary Skill</Th>
                <Th w={220}>Secondary Skill</Th>

                <Th>
                  <FilterHeader label="LOB" colKey="lob" />
                </Th>
                <Th>
                  <FilterHeader label="HBU" colKey="hbu" />
                </Th>
                <Th>
                  <FilterHeader label="Location" colKey="location" />
                </Th>
                <Th>
                  <FilterHeader label="Profile Type" colKey="profileType" />
                </Th>
                <Th>
                  <FilterHeader label="Hiring Manager" colKey="hiringManager" />
                </Th>

                <Th>Attached Date</Th>
                <Th>Profile Shared Date</Th>
                <Th>Interview Date</Th>
                <Th>Decision Date</Th>
                <Th>
                  <FilterHeader label="Evaluation Status" colKey="evaluationStatus" />
                </Th>
                <Th>
                  <FilterHeader label="Status" colKey="status" />
                </Th>
                <Th>Aging</Th>
              </tr>
              {renderFilterRow()}
            </thead>

            <tbody>
              {(!rows || rows.length === 0) && !loading ? (
                <tr>
                  <td className="p-3 text-sm text-gray-500" colSpan={20}>
                    No data found.
                  </td>
                </tr>
              ) : (
                rows.map((p, idx) => {
                  const key = p.id ?? `${p.demandId ?? 'row'}-${idx}`;
                  const isEdit = editId === (p.id ?? p.key);
                  const demandCode = getDemandCode(p);

                  const skillClusterText = p?.demand?.skillCluster?.name ?? '-';
                  const primarySkillsText = Array.isArray(p?.demand?.primarySkills)
                    ? p.demand.primarySkills.map(nameOf).join(', ')
                    : p?.demand?.primarySkills ?? '-';
                  const secondarySkillsText = Array.isArray(p?.demand?.secondarySkills)
                    ? p.demand.secondarySkills.map(nameOf).join(', ')
                    : p?.demand?.secondarySkills ?? '-';

                  const attachedDate = getAttachedDate(p);
                  const aging = calculateDaysFrom(attachedDate);

                  return (
                    <tr key={key} className="even:bg-gray-50/50">
                      {/* Edit */}
                      <Td>
                        {!isEdit ? (
                          <button
                            type="button"
                            onClick={() => onEdit(p)}
                            className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                            title="Edit"
                          >
                            <EditOutlined /> Edit
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onSave(p)}
                              className="inline-flex items-center gap-1 rounded border border-green-600 text-green-700 px-2 py-1 text-xs hover:bg-green-50"
                              title="Save"
                            >
                              <SaveOutlined /> Save
                            </button>
                            <button
                              type="button"
                              onClick={onCancel}
                              className="inline-flex items-center gap-1 rounded border border-gray-400 px-2 py-1 text-xs hover:bg-gray-100"
                              title="Cancel"
                            >
                              <CloseOutlined /> Cancel
                            </button>
                          </div>
                        )}
                      </Td>

                      {/* Demand Id as green pill */}
                      <Td>
                        <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-600 px-2 py-0.5 text-xs font-semibold">
                          {demandCode || '-'}
                        </span>
                      </Td>

                      {/* Candidate Name */}
                      <Td>{p?.profile?.candidateName ?? '-'}</Td>

                      {/* Emp ID */}
                      <Td>{p?.empId ?? '-'}</Td>

                      {/* Priority (editable dropdown) */}
                      <Td>
                        {!isEdit ? (
                          <Pill priority={p?.demand?.priority?.name ?? p?.priority} />
                        ) : (
                          <select
                            className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
                            value={String(editDraft.priority ?? '')}
                            onChange={(e) => setEditDraft((d) => ({ ...d, priority: e.target.value }))}
                          >
                            <option value="">-</option>
                            {renderOptions(dd.priority)}
                          </select>
                        )}
                      </Td>

                      {/* Skill Cluster */}
                      <TdWrapWithTooltip text={skillClusterText} w={180} />

                      {/* Primary Skill */}
                      <TdWrapWithTooltip text={primarySkillsText} w={220} />

                      {/* Secondary Skill */}
                      <TdWrapWithTooltip text={secondarySkillsText} w={220} />

                      {/* LOB */}
                      <Td>{p?.lob ?? p?.demand?.lob?.code ?? p?.demand?.lob?.name ?? '-'}</Td>

                      {/* HBU */}
                      <Td>{nameOf(p?.demand?.hbu?.name) || '-'}</Td>

                      {/* Location (editable dropdown) */}
                      <Td>
                        {!isEdit ? (
                          nameOf(p?.profile?.location) || '-'
                        ) : (
                          <select
                            className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
                            value={String(editDraft.location ?? '')}
                            onChange={(e) => setEditDraft((d) => ({ ...d, location: e.target.value }))}
                          >
                            <option value="">-</option>
                            {renderOptions(dd.location)}
                          </select>
                        )}
                      </Td>

                      {/* Profile Type */}
                      <Td>{nameOf(p?.profile?.externalInternal) || '-'}</Td>

                      {/* Hiring Manager */}
                      <Td>{p?.demand?.hiringManager?.name ?? '-'}</Td>

                      {/* Attached Date (non-editable) */}
                      <Td>{displayDate(attachedDate) || '-'}</Td>

                      {/* Profile Shared Date (editable - date) */}
                      <Td>
                        {!isEdit ? (
                          displayDate(p?.dateOfProfileShared) || '-'
                        ) : (
                          <DatePicker
                            allowClear
                            value={toDayjs(editDraft.profileSharedDate)}
                            format={BACKEND_FMT}
                            onChange={(d) =>
                              setEditDraft((x) => ({
                                ...x,
                                profileSharedDate: d ? d.format(BACKEND_FMT) : '',
                              }))
                            }
                            size="small"
                          />
                        )}
                      </Td>

                      {/* Interview Date (editable - date) */}
                      <Td>
                        {!isEdit ? (
                          displayDate(p?.interviewDate) || '-'
                        ) : (
                          <DatePicker
                            allowClear
                            value={toDayjs(editDraft.interviewDate)}
                            format={BACKEND_FMT}
                            onChange={(d) =>
                              setEditDraft((x) => ({
                                ...x,
                                interviewDate: d ? d.format(BACKEND_FMT) : '',
                              }))
                            }
                            size="small"
                          />
                        )}
                      </Td>

                      {/* Decision Date (editable - date) */}
                      <Td>
                        {!isEdit ? (
                          displayDate(p?.decisionDate) || '-'
                        ) : (
                          <DatePicker
                            allowClear
                            value={toDayjs(editDraft.decisionDate)}
                            format={BACKEND_FMT}
                            onChange={(d) =>
                              setEditDraft((x) => ({
                                ...x,
                                decisionDate: d ? d.format(BACKEND_FMT) : '',
                              }))
                            }
                            size="small"
                          />
                        )}
                      </Td>

                      {/* Evaluation Status (editable dropdown) */}
                      <Td>
                        {!isEdit ? (
                          p?.evaluationStatus ?? '-'
                        ) : (
                          <select
                            className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
                            value={String(editDraft.evaluationStatus ?? '')}
                            onChange={(e) =>
                              setEditDraft((d) => ({ ...d, evaluationStatus: e.target.value }))
                            }
                          >
                            <option value="">-</option>
                            {renderOptions(dd.evaluationStatus)}
                          </select>
                        )}
                      </Td>

                      {/* Status (editable dropdown) */}
                      <Td>
                        {!isEdit ? (
                          p?.profileTrackerStatus?.name ?? p?.status ?? '-'
                        ) : (
                          <select
                            className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
                            value={String(editDraft.status ?? '')}
                            onChange={(e) => setEditDraft((d) => ({ ...d, status: e.target.value }))}
                          >
                            <option value="">-</option>
                            {renderOptions(dd.profileTrackerStatus)}
                          </select>
                        )}
                      </Td>

                      {/* Aging */}
                      <Td>{Number.isFinite(aging) ? aging : '-'}</Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom pagination for visibility */}
        <div className="mt-3 flex items-center justify-end">
          <Pagination
            current={page + 1}
            pageSize={size}
            total={total}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={onPageChange}
            showTotal={(t, range) => `${range[0]}-${range[1]} of ${t}`}
          />
        </div>
      </div>
    </Layout>
  );
}
// =======
// }
// >>>>>>> simran_ui
