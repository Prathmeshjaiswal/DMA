// import React, { useEffect, useMemo, useState } from 'react';
// import dayjs from 'dayjs';
// import { DatePicker, message, Tooltip, Pagination } from 'antd'; // <-- ✅ ADDED Pagination here
// import { EditOutlined, SaveOutlined, CloseOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
// import Layout from '../../Layout';
// import {
//   listProfileTracker,
//   updateProfileTracker,
//   getProfileTrackerDropdowns,
//   searchProfileTracker,
// } from "../../api/Trackers/tracker";

// // ⬇️ Ensure paths are correct in your project
// import { downloadDemandJDByFileName } from '../../api/Demands/getDemands';
// import { downloadProfileCv } from '../../api/Profiles/addProfile';

// const BACKEND_FMT = 'YYYY-MM-DD';

// /* ----------------------- existing helpers ----------------------- */
// function parseISODateSafe(value) {
//   if (!value) return null;
//   const d = new Date(value);
//   return Number.isNaN(d.getTime()) ? null : d;
// }

// function calculateDaysFrom(attachedDate) {
//   const start = parseISODateSafe(attachedDate);
//   if (!start) return null;
//   const end = new Date();
//   const msPerDay = 24 * 60 * 60 * 1000;
//   const diff = Math.floor((end.getTime() - start.getTime()) / msPerDay);
//   return diff < 0 ? 0 : diff;
// }

// const nameOf = (obj) => (obj && typeof obj === 'object' ? obj.name ?? '' : obj ?? '');

// function TdWrapWithTooltip({ text, w }) {
//   const display = text ?? '-';
//   return (
//     <td
//       className="px-3 py-2 text-sm text-gray-800 border-b border-gray-100 align-middle truncate"
//       style={{ width: w, maxWidth: w }}
//     >
//       <Tooltip title={display} mouseEnterDelay={0.3}>
//         <div className="leading-snug">{display}</div>
//       </Tooltip>
//     </td>
//   );
// }

// function Pill({ priority }) {
//   const p = String(priority ?? '').toUpperCase();
//   const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold';
//   if (p === 'P1')
//     return (
//       <span className={base} style={{ background: '#E6FFFA', color: '#065F46', border: '1px solid #99F6E4' }}>
//         P1
//       </span>
//     );
//   if (p === 'P2')
//     return (
//       <span className={base} style={{ background: '#FFF7ED', color: '#92400E', border: '1px solid #FED7AA' }}>
//         P2
//       </span>
//     );
//   if (p === 'P3')
//     return (
//       <span className={base} style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
//         P3
//       </span>
//     );
//   return (
//     <span className={base} style={{ background: '#EDF2F7', color: '#2D3748', border: '1px solid #CBD5E0' }}>
//       {p || '-'}
//     </span>
//   );
// }

// function Th({ children, w }) {
//   return (
//     <th
//       className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap border-b border-gray-200"
//       style={w ? { width: w } : undefined}
//     >
//       {children}
//     </th>
//   );
// }
// function Td({ children }) {
//   return (
//     <td className="px-3 py-2 text-sm text-gray-800 whitespace-nowrap border-b border-gray-100 align-top">
//       {children}
//     </td>
//   );
// }

// function toDayjs(val) {
//   if (!val) return null;
//   return dayjs(val, BACKEND_FMT).isValid() ? dayjs(val, BACKEND_FMT) : dayjs(val).isValid() ? dayjs(val) : null;
// }

// function displayDate(value) {
//   if (!value) return '';
//   const d = parseISODateSafe(value) ?? (typeof value === 'string' ? dayjs(value, BACKEND_FMT).toDate() : null);
//   if (!d) return String(value);
//   return dayjs(d).format(BACKEND_FMT);
// }

// function getAttachedDate(row) {
//   return row?.attachedDate ?? row?.dateAttached ?? row?.profileAttachedDate ?? null;
// }

// /* ---------- stable row id helper (FIX) ---------- */
// function getRowId(r) {
//   return (
//     r?.id ??
//     r?.profileTrackerId ??     // if backend uses this
//     r?.trackerId ??            // or this
//     r?.profileTrackId ??       // or this
//     r?.key ??                  // UI key
//     `${r?.demand?.demandId ?? 'd'}-${r?.profile?.profileId ?? 'p'}` // final fallback
//   );
// }

// /* ---------- filename helpers ---------- */
// function basename(name) {
//   if (!name) return '';
//   const s = String(name);
//   return s.split('/').pop().split('\\').pop();
// }

// function prettifyFilename(raw) {
//   if (!raw) return '';
//   const base = basename(raw);
//   const m = base.match(/^(.*?)(\.[A-Za-z0-9]+)$/);
//   const namePart = (m ? m[1] : base) || '';
//   const extPart = (m ? m[2] : '');

//   let n = namePart;
//   n = n.replace(/[ \t]+/g, '_');
//   n = n.replace(/^(?:rr|profile|cv|jd|demand)[-_]?\d*[-_]?/i, '');
//   n = n.replace(/^\d+[-_]?/, '');
//   n = n.replace(/([_-])\d{8}$/, '');
//   n = n.replace(/([_-])\d{8}([_-])\d{6}$/, '');
//   n = n.replace(/[-_]{2,}/g, '_').replace(/^[-_]+|[-_]+$/g, '');
//   return `${n || base}${extPart}`;
// }

// /** Format aging number like "4D" */
// function formatAging(aging) {
//   if (!Number.isFinite(aging)) return '-';
//   return `${aging}d`; // FIX: uppercase D
// }

// /* ---------- extract file names ---------- */
// function getJdFileName(row) {
//   const d = row?.demand ?? {};
//   return (
//     d.jdFileName ||
//     d.jdFile ||
//     d.jd ||
//     d.jobDescriptionFileName ||
//     d.jobDescription ||
//     d.fileName ||
//     null
//   );
// }
// function getCvFileName(row) {
//   const prof = row?.profile ?? {};
//   return (
//     prof.cvFileName ||
//     prof.cv ||
//     prof.resumeFileName ||
//     prof.resume ||
//     prof.fileName ||
//     null
//   );
// }

// /* ---------- click handlers ---------- */
// async function handleJdDownload(fileName, e) {
//   e?.stopPropagation?.();
//   if (!fileName) return;
//   const hide = message.loading('Downloading JD…', 0);
//   try {
//     await downloadDemandJDByFileName(fileName);
//   } catch (err) {
//     message.error(err?.response?.data?.message || 'Failed to download JD');
//   } finally {
//     hide();
//   }
// }
// async function handleCvDownload(fileName, e) {
//   e?.stopPropagation?.();
//   if (!fileName) return;
//   const hide = message.loading('Downloading CV…', 0);
//   try {
//     await downloadProfileCv(fileName);
//   } catch (err) {
//     message.error(err?.response?.data?.message || 'Failed to download CV');
//   } finally {
//     hide();
//   }
// }

// /* ===================== FILTER & PAGINATION (ProfileSheet-like) ===================== */

// // Filters for columns that exist in your UI (now extended)
// const DEFAULT_FILTERS = {
//   // text filters
//   demandId: '',
//   name: '',
//   cluster: '',
//   primary: '',
//   secondary: '',
//   hbu: '',
//   lob: '',
//   location: '',
//   profileType: '',
//   hiringManager: '',

//   // date ranges (YYYY-MM-DD)
//   attachedFrom: '',
//   attachedTo: '',
//   sharedFrom: '',
//   sharedTo: '',
//   interviewFrom: '',
//   interviewTo: '',
//   decisionFrom: '',
//   decisionTo: '',

//   // dropdowns (ids)
//   evaluationStatusId: '',
//   profileTrackerStatusId: '',

//   // aging range
//   agingMin: '',
//   agingMax: '',
// };

// // debounce like ProfileSheet
// function useDebounced(value, delay = 300) {
//   const [v, setV] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setV(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);
//   return v;
// }

// // build a compact q string; backend can parse tokens or do contains
// function buildQFromFilters(f) {
//   const t = [];
//   // text fields
//   if (f.demandId) t.push(`demand:${f.demandId}`);
//   if (f.name) t.push(`name:${f.name}`);
//   if (f.cluster) t.push(`cluster:${f.cluster}`);
//   if (f.primary) t.push(`primary:${f.primary}`);
//   if (f.secondary) t.push(`secondary:${f.secondary}`);
//   if (f.hbu) t.push(`hbu:${f.hbu}`);
//   if (f.lob) t.push(`lob:${f.lob}`);
//   if (f.location) t.push(`loc:${f.location}`);
//   if (f.profileType) t.push(`ptype:${f.profileType}`);
//   if (f.hiringManager) t.push(`hm:${f.hiringManager}`);

//   // date ranges
//   const rng = (fromKey, toKey, tag) => {
//     const from = (f[fromKey] || '').trim();
//     const to = (f[toKey] || '').trim();
//     if (from || to) t.push(`${tag}:${from || ''}..${to || ''}`);
//   };
//   rng('attachedFrom', 'attachedTo', 'attached');
//   rng('sharedFrom', 'sharedTo', 'shared');
//   rng('interviewFrom', 'interviewTo', 'interview');
//   rng('decisionFrom', 'decisionTo', 'decision');

//   // dropdowns (ids)
//   if (f.evaluationStatusId) t.push(`eval:${f.evaluationStatusId}`);
//   if (f.profileTrackerStatusId) t.push(`status:${f.profileTrackerStatusId}`);

//   // aging range
//   const aMin = String(f.agingMin || '').trim();
//   const aMax = String(f.agingMax || '').trim();
//   if (aMin || aMax) t.push(`aging:${aMin}..${aMax}`);

//   return t.join(' ');
// }

// // Header controls (same compact style as ProfileSheet)
// function HeaderWithSearch({ label, keyName, filters, setFilters, openSearch, toggle }) {
//   return (
//     <div className="flex flex-col items-start justify-center gap-1">
//       <div className="flex items-center gap-2">
//         <span>{label}</span>
//         <SearchOutlined
//           className={`text-gray-400 text-xs cursor-pointer ${openSearch[keyName] ? 'text-blue-600' : ''}`}
//           onClick={(e) => { e.stopPropagation(); toggle(keyName); }}
//           title="Search"
//         />
//       </div>
//       {openSearch[keyName] && (
//         <input
//           className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
//           placeholder={`Search ${label}`}
//           value={filters[keyName] ?? ''}
//           onChange={(e) => setFilters((f) => ({ ...f, [keyName]: e.target.value }))}
//           onClick={(e) => e.stopPropagation()}
//           style={{ width: 140 }}
//         />
//       )}
//     </div>
//   );
// }

// function HeaderDateRange({ keyFrom, keyTo, label, filters, setFilters, openSearch, toggle }) {
//   const openKey = `${keyFrom}__${keyTo}`;
//   return (
//     <div className="flex flex-col items-start gap-1">
//       <div className="flex items-center gap-2">
//         <span>{label}</span>
//         <SearchOutlined
//           className={`text-gray-400 text-xs cursor-pointer ${openSearch[openKey] ? 'text-blue-600' : ''}`}
//           onClick={(e) => { e.stopPropagation(); toggle(openKey); }}
//           title="Search"
//         />
//       </div>
//       {openSearch[openKey] && (
//         <div className="flex items-center gap-1">
//           <input
//             className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
//             placeholder="From (YYYY-MM-DD)"
//             value={filters[keyFrom] ?? ''}
//             onChange={(e) => setFilters((f) => ({ ...f, [keyFrom]: e.target.value }))}
//             style={{ width: 120 }}
//             onClick={(e) => e.stopPropagation()}
//           />
//           <span className="text-gray-400 text-xs">–</span>
//           <input
//             className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
//             placeholder="To (YYYY-MM-DD)"
//             value={filters[keyTo] ?? ''}
//             onChange={(e) => setFilters((f) => ({ ...f, [keyTo]: e.target.value }))}
//             style={{ width: 120 }}
//             onClick={(e) => e.stopPropagation()}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// function HeaderSelect({ label, keyName, options, getLabel = (o) => o.name, getValue = (o) => o.id, filters, setFilters, openSearch, toggle }) {
//   return (
//     <div className="flex flex-col items-start gap-1">
//       <div className="flex items-center gap-2">
//         <span>{label}</span>
//         <SearchOutlined
//           className={`text-gray-400 text-xs cursor-pointer ${openSearch[keyName] ? 'text-blue-600' : ''}`}
//           onClick={(e) => { e.stopPropagation(); toggle(keyName); }}
//           title="Search"
//         />
//       </div>
//       {openSearch[keyName] && (
//         <select
//           className="h-7 px-2 text-xs rounded border border-gray-300 bg-white"
//           value={filters[keyName] ?? ''}
//           onChange={(e) => setFilters((f) => ({ ...f, [keyName]: e.target.value }))}
//           onClick={(e) => e.stopPropagation()}
//           style={{ width: 160 }}
//         >
//           <option value="">All</option>
//           {(options || []).map((o) => (
//             <option key={getValue(o)} value={getValue(o)}>
//               {getLabel(o)}
//             </option>
//           ))}
//         </select>
//       )}
//     </div>
//   );
// }

// function HeaderNumberRange({ keyMin, keyMax, label, filters, setFilters, openSearch, toggle }) {
//   const openKey = `${keyMin}__${keyMax}`;
//   return (
//     <div className="flex flex-col items-start gap-1">
//       <div className="flex items-center gap-2">
//         <span>{label}</span>
//         <SearchOutlined
//           className={`text-gray-400 text-xs cursor-pointer ${openSearch[openKey] ? 'text-blue-600' : ''}`}
//           onClick={(e) => { e.stopPropagation(); toggle(openKey); }}
//           title="Search"
//         />
//       </div>
//       {openSearch[openKey] && (
//         <div className="flex items-center gap-1">
//           <input
//             className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
//             placeholder="Min"
//             value={filters[keyMin] ?? ''}
//             onChange={(e) => setFilters((f) => ({ ...f, [keyMin]: e.target.value }))}
//             style={{ width: 70 }}
//             onClick={(e) => e.stopPropagation()}
//           />
//           <span className="text-gray-400 text-xs">–</span>
//           <input
//             className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
//             placeholder="Max"
//             value={filters[keyMax] ?? ''}
//             onChange={(e) => setFilters((f) => ({ ...f, [keyMax]: e.target.value }))}
//             style={{ width: 70 }}
//             onClick={(e) => e.stopPropagation()}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default function ProfileTracker() {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [apiErr, setApiErr] = useState(null);

//   const [editId, setEditId] = useState(null);
//   const [editDraft, setEditDraft] = useState({});

//   const [dd, setDd] = useState({
//     evaluationStatuses: [],
//     profileTrackerStatuses: [],
//   });

//   // header filters + toggles
//   const [filters, setFilters] = useState(DEFAULT_FILTERS);
//   const [openSearch, setOpenSearch] = useState({});
//   const toggleSearch = (key) => setOpenSearch((s) => ({ ...s, [key]: !s[key] }));
//   const debouncedFilters = useDebounced(filters, 300);
//   const q = useMemo(() => buildQFromFilters(debouncedFilters), [debouncedFilters]);

//   // server-side pagination
//   const [page, setPage] = useState(0); // 0-based
//   const [size, setSize] = useState(10);
//   const [total, setTotal] = useState(0);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await getProfileTrackerDropdowns();
//         setDd({
//           evaluationStatuses: res?.evaluationStatuses ?? [],
//           profileTrackerStatuses: res?.profileTrackerStatuses ?? [],
//         });
//       } catch (e) {
//         setDd({ evaluationStatuses: [], profileTrackerStatuses: [] });
//       }
//     })();
//   }, []);

//   const load = async (pg = page, sz = size, query = q) => {
//     try {
//       setLoading(true);
//       setApiErr(null);

//       let resp;
//       if (query && query.trim()) {
//         resp = await searchProfileTracker({ q: query, page: pg, size: sz });
//       } else {
//         resp = await listProfileTracker({ page: pg, size: sz });
//       }

//       const items = Array.isArray(resp?.items) ? resp.items : [];
//       setRows(items);
//       setTotal(Number(resp?.totalElements ?? items.length ?? 0));
//       setPage(Number(resp?.page ?? pg));
//       setSize(Number(resp?.size ?? sz));
//     } catch (e) {
//       const msg = e?.response?.data?.message || e?.message || 'Failed to load tracker';
//       setApiErr(msg);
//       setRows([]);
//       setTotal(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // initial
//   useEffect(() => {
//     load(0, size, q);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // when filters change → reset to page 0
//   useEffect(() => {
//     load(0, size, q);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [q]);

//   /* ✅ AntD Pagination handler (copied from your first code) */
//   const onPageChange = (current, pageSize) => {
//     const newPage = current - 1; // convert to 0-based
//     if (pageSize !== size) {
//       load(0, pageSize, q);
//     } else {
//       load(newPage, pageSize, q);
//     }
//   };

//   const onEdit = (row) => {
//     setEditId(getRowId(row));
//     setEditDraft({
//       evaluationStatusId: row?.evaluationStatus?.id ?? '',
//       statusId: row?.profileTrackerStatus?.id ?? '',
//       profileSharedDate: row?.profileSharedDate ? displayDate(row.profileSharedDate) : '',
//       interviewDate: row?.interviewDate ? displayDate(row.interviewDate) : '',
//       decisionDate: row?.decisionDate ? displayDate(row.decisionDate) : '',
//     });
//   };

//   const onCancel = () => {
//     setEditId(null);
//     setEditDraft({});
//   };

//   const onSave = async (row) => {
//     const id = getRowId(row);
//     if (id == null) {
//       message.error('Missing row id');
//       return;
//     }

//     const payload = {
//       profileSharedDate: editDraft.profileSharedDate ? dayjs(editDraft.profileSharedDate).format(BACKEND_FMT) : null,
//       interviewDate: editDraft.interviewDate ? dayjs(editDraft.interviewDate).format(BACKEND_FMT) : null,
//       decisionDate: editDraft.decisionDate ? dayjs(editDraft.decisionDate).format(BACKEND_FMT) : null,
//       evaluationStatusId: editDraft.evaluationStatusId ? Number(editDraft.evaluationStatusId) : null,
//       profileTrackerStatusId: editDraft.statusId ? Number(editDraft.statusId) : null,
//     };

//     try {
//       await updateProfileTracker({ id, payload });
//       setRows((prev) =>
//         prev.map((r) => {
//           if (getRowId(r) !== id) return r;
//           const next = { ...r };

//           if (payload.profileSharedDate !== null) next.profileSharedDate = payload.profileSharedDate;
//           if (payload.interviewDate !== null) next.interviewDate = payload.interviewDate;
//           if (payload.decisionDate !== null) next.decisionDate = payload.decisionDate;

//           if (payload.evaluationStatusId) {
//             const found = dd.evaluationStatuses.find((x) => String(x.id) === String(payload.evaluationStatusId));
//             next.evaluationStatus = found ? { id: found.id, name: found.name } : next.evaluationStatus;
//           }
//           if (payload.profileTrackerStatusId) {
//             const found = dd.profileTrackerStatuses.find(
//               (x) => String(x.id) === String(payload.profileTrackerStatusId)
//             );
//             next.profileTrackerStatus = found ? { id: found.id, name: found.name } : next.profileTrackerStatus;
//           }
//           return next;
//         })
//       );
//       message.success('Row updated');
//       onCancel();
//     } catch (e) {
//       const msg = e?.response?.data?.message || e?.message || 'Failed to update';
//       message.error(msg);
//     }
//   };

//   return (
//     <Layout>
//       <div className="p-4">
//         <h2 className="text-2xl md:text-2xl font-bold tracking-tight text-gray-900">Profile Tracker</h2>

//         {/* Status */}
//         {loading && <div className="text-sm text-gray-700 my-2">Loading…</div>}
//         {apiErr && <div className="text-sm text-red-600 my-2">Error: {apiErr}</div>}

//         {/* TABLE — UI unchanged; headers now have toggled search controls */}
//         <div className="overflow-x-auto rounded-md border border-gray-200">
//           <table className="max-w-[1600px] w-full border-collapse">
//             <thead className="bg-gray-50">
//               <tr>
//                 <Th w={60}>EDIT</Th>

//                 {/* Demand Id — text filter */}
//                 <Th w={180}>
//                   <HeaderWithSearch
//                     label="Demand Id"
//                     keyName="demandId"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 {/* Candidate Name — text */}
//                 <Th>
//                   <HeaderWithSearch
//                     label="Candidate Name"
//                     keyName="name"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th>Priority</Th>

//                 {/* Skill Cluster / Primary / Secondary — text */}
//                 <Th w={180}>
//                   <HeaderWithSearch
//                     label="Skill Cluster"
//                     keyName="cluster"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>
//                 <Th w={220}>
//                   <HeaderWithSearch
//                     label="Primary Skill"
//                     keyName="primary"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>
//                 <Th w={220}>
//                   <HeaderWithSearch
//                     label="Secondary Skill"
//                     keyName="secondary"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 {/* LOB / HBU / Location — text */}
//                 <Th>
//                   <HeaderWithSearch
//                     label="LOB"
//                     keyName="lob"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>
//                 <Th>
//                   <HeaderWithSearch
//                     label="HBU"
//                     keyName="hbu"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>
//                 <Th>
//                   <HeaderWithSearch
//                     label="Location"
//                     keyName="location"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 {/* Profile Type — text */}
//                 <Th>
//                   <HeaderWithSearch
//                     label="Profile Type"
//                     keyName="profileType"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 {/* Hiring Manager — text */}
//                 <Th>
//                   <HeaderWithSearch
//                     label="Hiring Manager"
//                     keyName="hiringManager"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 {/* Attached / Shared / Interview / Decision — date ranges */}
//                 <Th>
//                   <HeaderDateRange
//                     label="Attached Date"
//                     keyFrom="attachedFrom"
//                     keyTo="attachedTo"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>
//                 <Th>
//                   <HeaderDateRange
//                     label="Profile Shared Date"
//                     keyFrom="sharedFrom"
//                     keyTo="sharedTo"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>
//                 <Th>
//                   <HeaderDateRange
//                     label="Interview Date"
//                     keyFrom="interviewFrom"
//                     keyTo="interviewTo"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>
//                 <Th>
//                   <HeaderDateRange
//                     label="Decision Date"
//                     keyFrom="decisionFrom"
//                     keyTo="decisionTo"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 {/* Evaluation / Status — SELECT from dd lists */}
//                 <Th>
//                   <HeaderSelect
//                     label="Evaluation Status"
//                     keyName="evaluationStatusId"
//                     options={dd.evaluationStatuses}
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>
//                 <Th>
//                   <HeaderSelect
//                     label="Status"
//                     keyName="profileTrackerStatusId"
//                     options={dd.profileTrackerStatuses}
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 {/* Aging — number range */}
//                 <Th>
//                   <HeaderNumberRange
//                     label="Aging"
//                     keyMin="agingMin"
//                     keyMax="agingMax"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>
//               </tr>
//             </thead>

//             <tbody>
//               {(!rows || rows.length === 0) && !loading ? (
//                 <tr>
//                   <td className="p-3 text-sm text-gray-500" colSpan={19}>
//                     No data found.
//                   </td>
//                 </tr>
//               ) : (
//                 rows.map((p, idx) => {
//                   const rowId = getRowId(p);               // FIX: stable id
//                   const isEdit = editId === rowId;         // FIX: proper compare

//                   const demandCode =
//                     p?.demand?.displayDemandId ||
//                     (() => {
//                       const lobName = p?.demand?.lob?.name ?? '';
//                       const demId = p?.demand?.demandId ?? '';
//                       return [lobName, demId].filter(Boolean).join('-');
//                     })();

//                   const skillClusterText = p?.demand?.skillCluster?.name ?? '-';
//                   const primarySkillsText = Array.isArray(p?.demand?.primarySkills)
//                     ? p.demand.primarySkills.map(nameOf).join(', ')
//                     : p?.demand?.primarySkills ?? '-';
//                   const secondarySkillsText = Array.isArray(p?.demand?.secondarySkills)
//                     ? p.demand.secondarySkills.map(nameOf).join(', ')
//                     : p?.demand?.secondarySkills ?? '-';

//                   const attachedDate = getAttachedDate(p);
//                   const aging = calculateDaysFrom(attachedDate);

//                   const candidateName = p?.profile?.candidateName ?? '-';
//                   const empId = p?.profile?.empId;

//                   const jdFileName = getJdFileName(p);
//                   const cvFileName = getCvFileName(p);

//                   return (
//                     <tr key={rowId} className="even:bg-gray-50/50">
//                       {/* Edit */}
//                       <Td>
//                         {!isEdit ? (
//                           <button
//                             type="button"
//                             onClick={() => onEdit(p)}
//                             className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
//                             title="Edit"
//                           >
//                             <EditOutlined /> Edit
//                           </button>
//                         ) : (
//                           <div className="flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() => onSave(p)}
//                               className="inline-flex items-center gap-1 rounded border border-green-600 text-green-700 px-2 py-1 text-xs hover:bg-green-50"
//                               title="Save"
//                             >
//                               <SaveOutlined /> Save
//                             </button>
//                             <button
//                               type="button"
//                               onClick={onCancel}
//                               className="inline-flex items-center gap-1 rounded border border-gray-400 px-2 py-1 text-xs hover:bg-gray-100"
//                               title="Cancel"
//                             >
//                               <CloseOutlined /> Cancel
//                             </button>
//                           </div>
//                         )}
//                       </Td>

//                       {/* Demand Id: pill + JD download icon */}
//                       <Td>
//                         <div className="flex items-center justify-between gap-2 min-h-[44px]">
//                           <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-600 px-2 py-0.5 text-xs font-semibold">
//                             {demandCode || '-'}
//                           </span>

//                           <div className="shrink-0 flex items-center">
//                             <Tooltip title={jdFileName ? `Download JD (${prettifyFilename(jdFileName)})` : 'JD not available'}>
//                               <button
//                                 type="button"
//                                 onClick={(e) => jdFileName && handleJdDownload(jdFileName, e)}
//                                 className={`p-1 rounded ${jdFileName ? 'hover:bg-blue-50 hover:text-blue-700' : 'text-gray-300 cursor-not-allowed'}`}
//                                 disabled={!jdFileName}
//                                 aria-label={jdFileName ? `Download JD (${prettifyFilename(jdFileName)})` : 'JD not available'}
//                               >
//                                 <DownloadOutlined />
//                               </button>
//                             </Tooltip>
//                           </div>
//                         </div>
//                       </Td>

//                       {/* Candidate Name + EmpID under + CV icon */}
//                       <Td>
//                         <div className="flex items-center justify-between gap-2 min-h-[44px]">
//                           <div className="flex flex-col leading-tight">
//                             <span className="font-medium text-gray-900 whitespace-nowrap">{candidateName}</span>
//                             {empId ? (
//                               <span className="text-xs text-gray-500 whitespace-nowrap">({empId})</span>
//                             ) : null}
//                           </div>

//                           <div className="shrink-0 flex items-center">
//                             <Tooltip title={cvFileName ? `Download CV (${prettifyFilename(cvFileName)})` : 'CV not available'}>
//                               <button
//                                 type="button"
//                                 onClick={(e) => cvFileName && handleCvDownload(cvFileName, e)}
//                                 className={`p-1 rounded ${cvFileName ? 'hover:bg-blue-50 hover:text-blue-700' : 'text-gray-300 cursor-not-allowed'}`}
//                                 disabled={!cvFileName}
//                                 aria-label={cvFileName ? `Download CV (${prettifyFilename(cvFileName)})` : 'CV not available'}
//                               >
//                                 <DownloadOutlined />
//                               </button>
//                             </Tooltip>
//                           </div>
//                         </div>
//                       </Td>

//                       {/* Priority */}
//                       <Td>
//                         <Pill priority={p?.demand?.priority?.name ?? p?.priority} />
//                       </Td>

//                       {/* Skills */}
//                       <TdWrapWithTooltip text={skillClusterText} w={180} />
//                       <TdWrapWithTooltip text={primarySkillsText} w={220} />
//                       <TdWrapWithTooltip text={secondarySkillsText} w={220} />

//                       {/* Others */}
//                       <Td>{p?.demand?.lob?.name || '-'}</Td>
//                       <Td>{p?.demand?.hbu?.name || '-'}</Td>
//                       <Td>{nameOf(p?.profile?.location) || '-'}</Td>
//                       <Td>{nameOf(p?.profile?.externalInternal) || '-'}</Td>
//                       <Td>{p?.demand?.hiringManager?.name ?? '-'}</Td>

//                       {/* Attached Date */}
//                       <Td>{displayDate(attachedDate) || '-'}</Td>

//                       {/* Profile Shared Date (editable) */}
//                       <Td>
//                         {!isEdit ? (
//                           displayDate(p?.profileSharedDate) || '-'
//                         ) : (
//                           <DatePicker
//                             allowClear
//                             value={toDayjs(editDraft.profileSharedDate)}
//                             format={BACKEND_FMT}
//                             onChange={(d) =>
//                               setEditDraft((x) => ({
//                                 ...x,
//                                 profileSharedDate: d ? d.format(BACKEND_FMT) : '',
//                               }))
//                             }
//                             size="small"
//                           />
//                         )}
//                       </Td>

//                       {/* Interview Date (editable) */}
//                       <Td>
//                         {!isEdit ? (
//                           displayDate(p?.interviewDate) || '-'
//                         ) : (
//                           <DatePicker
//                             allowClear
//                             value={toDayjs(editDraft.interviewDate)}
//                             format={BACKEND_FMT}
//                             onChange={(d) =>
//                               setEditDraft((x) => ({
//                                 ...x,
//                                 interviewDate: d ? d.format(BACKEND_FMT) : '',
//                               }))
//                             }
//                             size="small"
//                           />
//                         )}
//                       </Td>

//                       {/* Decision Date (editable) */}
//                       <Td>
//                         {!isEdit ? (
//                           displayDate(p?.decisionDate) || '-'
//                         ) : (
//                           <DatePicker
//                             allowClear
//                             value={toDayjs(editDraft.decisionDate)}
//                             format={BACKEND_FMT}
//                             onChange={(d) =>
//                               setEditDraft((x) => ({
//                                 ...x,
//                                 decisionDate: d ? d.format(BACKEND_FMT) : '',
//                               }))
//                             }
//                             size="small"
//                           />
//                         )}
//                       </Td>

//                       {/* Evaluation Status (editable) */}
//                       <Td>
//                         {!isEdit ? (
//                           p?.evaluationStatus?.name ?? '-'
//                         ) : (
//                           <select
//                             className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
//                             value={String(editDraft.evaluationStatusId ?? '')}
//                             onChange={(e) =>
//                               setEditDraft((d) => ({ ...d, evaluationStatusId: e.target.value }))
//                             }
//                           >
//                             <option value="">-</option>
//                             {Array.isArray(dd.evaluationStatuses) && dd.evaluationStatuses.length > 0 ? (
//                               dd.evaluationStatuses.map((o) => (
//                                 <option key={o.id} value={o.id}>
//                                   {o.name}
//                                 </option>
//                               ))
//                             ) : (
//                               <option value="" disabled>{loading ? 'Loading…' : 'No options'}</option>
//                             )}
//                           </select>
//                         )}
//                       </Td>

//                       {/* Status (editable) */}
//                       <Td>
//                         {!isEdit ? (
//                           p?.profileTrackerStatus?.name ?? '-'
//                         ) : (
//                           <select
//                             className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
//                             value={String(editDraft.statusId ?? '')}
//                             onChange={(e) => setEditDraft((d) => ({ ...d, statusId: e.target.value }))}
//                           >
//                             <option value="">-</option>
//                             {Array.isArray(dd.profileTrackerStatuses) && dd.profileTrackerStatuses.length > 0 ? (
//                               dd.profileTrackerStatuses.map((o) => (
//                                 <option key={o.id} value={o.id}>
//                                   {o.name}
//                                 </option>
//                               ))
//                             ) : (
//                               <option value="" disabled>{loading ? 'Loading…' : 'No options'}</option>
//                             )}
//                           </select>
//                         )}
//                       </Td>

//                       {/* Aging */}
//                       <Td>{formatAging(aging)}</Td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* ✅ Bottom pagination (AntD Pagination, same as your first snippet) */}
//         <div className="mt-3 flex items-center justify-end">
//           <Pagination
//             current={page + 1}
//             pageSize={size}
//             total={total}
//             showSizeChanger
//             pageSizeOptions={[10, 20, 50, 100]}
//             onChange={onPageChange}
//             showTotal={(t, range) => `${range[0]}-${range[1]} of ${t}`}
//           />
//         </div>
//       </div>
//     </Layout>
//   );
// }
  


import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker, message, Tooltip, Pagination } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import Layout from '../../Layout';

import {
  listProfileTracker,
  updateProfileTracker,
  getProfileTrackerDropdowns,
  searchProfileTracker,
} from "../../api/Trackers/tracker";

import { downloadDemandJDByFileName } from '../../api/Demands/getDemands';
import { downloadProfileCv } from '../../api/Profiles/addProfile';

const BACKEND_FMT = 'YYYY-MM-DD';

/* ----------------------- helpers ----------------------- */
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
    <td
      className="px-3 py-2 text-sm text-gray-800 border-b border-gray-100 align-middle truncate"
      style={{ width: w, maxWidth: w }}
    >
      <Tooltip title={display} mouseEnterDelay={0.3}>
        <div className="leading-snug">{display}</div>
      </Tooltip>
    </td>
  );
}
function Pill({ priority }) {
  const p = String(priority ?? '').toUpperCase();
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold';
  if (p === 'P1')
    return (
      <span className={base} style={{ background: '#E6FFFA', color: '#065F46', border: '1px solid #99F6E4' }}>
        P1
      </span>
    );
  if (p === 'P2')
    return (
      <span className={base} style={{ background: '#FFF7ED', color: '#92400E', border: '1px solid #FED7AA' }}>
        P2
      </span>
    );
  if (p === 'P3')
    return (
      <span className={base} style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
        P3
      </span>
    );
  return (
    <span className={base} style={{ background: '#EDF2F7', color: '#2D3748', border: '1px solid #CBD5E0' }}>
      {p || '-'}
    </span>
  );
}
function Th({ children, w }) {
  return (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap border-b border-gray-200"
      style={w ? { width: w } : undefined}
    >
      {children}
    </th>
  );
}
function Td({ children }) {
  return <td className="px-3 py-2 text-sm text-gray-800 whitespace-nowrap border-b border-gray-100 align-top">{children}</td>;
}
function toDayjs(val) {
  if (!val) return null;
  return dayjs(val, BACKEND_FMT).isValid() ? dayjs(val, BACKEND_FMT) : dayjs(val).isValid() ? dayjs(val) : null;
}
function displayDate(value) {
  if (!value) return '';
  const d = parseISODateSafe(value) ?? (typeof value === 'string' ? dayjs(value, BACKEND_FMT).toDate() : null);
  if (!d) return String(value);
  return dayjs(d).format(BACKEND_FMT);
}
function getAttachedDate(row) {
  return row?.attachedDate ?? row?.dateAttached ?? row?.profileAttachedDate ?? null;
}
/* ---------- stable row id helper ---------- */
function getRowId(r) {
  return (
    r?.id ??
    r?.profileTrackerId ??
    r?.trackerId ??
    r?.profileTrackId ??
    r?.key ??
    `${r?.demand?.demandId ?? 'd'}-${r?.profile?.profileId ?? 'p'}`
  );
}
/* ---------- filename helpers ---------- */
function basename(name) {
  if (!name) return '';
  const s = String(name);
  return s.split('/').pop().split('\\').pop();
}
function prettifyFilename(raw) {
  if (!raw) return '';
  const base = basename(raw);
  const m = base.match(/^(.*?)(\.[A-Za-z0-9]+)$/);
  const namePart = (m ? m[1] : base) || '';
  const extPart = (m ? m[2] : '');
  let n = namePart;
  n = n.replace(/[ \t]+/g, '_');
  n = n.replace(/^(?:rr|profile|cv|jd|demand)[-_]?\d*[-_]?/i, '');
  n = n.replace(/^\d+[-_]?/, '');
  n = n.replace(/([_-])\d{8}$/, '');
  n = n.replace(/([_-])\d{8}([_-])\d{6}$/, '');
  n = n.replace(/[-_]{2,}/g, '_').replace(/^[-_]+|[-_]+$/g, '');
  return `${n || base}${extPart}`;
}
/** Format aging like "4d" */
function formatAging(aging) {
  if (!Number.isFinite(aging)) return '-';
  return `${aging}d`;
}
/* ---------- extract file names ---------- */
function getJdFileName(row) {
  const d = row?.demand ?? {};
  return d.jdFileName || d.jdFile || d.jd || d.jobDescriptionFileName || d.jobDescription || d.fileName || null;
}
function getCvFileName(row) {
  const prof = row?.profile ?? {};
  return prof.cvFileName || prof.cv || prof.resumeFileName || prof.resume || prof.fileName || null;
}
/* ---------- click handlers ---------- */
async function handleJdDownload(fileName, e) {
  e?.stopPropagation?.();
  if (!fileName) return;
  const hide = message.loading('Downloading JD…', 0);
  try {
    await downloadDemandJDByFileName(fileName);
  } catch (err) {
    message.error(err?.response?.data?.message || 'Failed to download JD');
  } finally {
    hide();
  }
}
async function handleCvDownload(fileName, e) {
  e?.stopPropagation?.();
  if (!fileName) return;
  const hide = message.loading('Downloading CV…', 0);
  try {
    await downloadProfileCv(fileName);
  } catch (err) {
    message.error(err?.response?.data?.message || 'Failed to download CV');
  } finally {
    hide();
  }
}

/* ===================== FILTER & PAGINATION ===================== */

const DEFAULT_FILTERS = {
  // text inputs
  demandId: '',          // numeric → demandNumber
  name: '',              // → candidateName
  priority: '',          // → priorityName
  cluster: '',           // → skillClusterName
  primary: '',           // → demandPrimarySkillNames (CSV -> list)
  secondary: '',         // → demandSecondarySkillNames (CSV -> list)
  lob: '',               // → lobName
  hbu: '',               // → hbuName
  location: '',          // backend spec has no field; kept in UI (no-op)
  profileType: '',       // → externalInternalName
  hiringManager: '',     // → hiringManagerName

  // date ranges (YYYY-MM-DD)
  attachedFrom: '',
  attachedTo: '',
  sharedFrom: '',
  sharedTo: '',
  interviewFrom: '',
  interviewTo: '',
  decisionFrom: '',
  decisionTo: '',

  // dropdowns (ids -> names for backend)
  evaluationStatusId: '',
  profileTrackerStatusId: '',

  // aging (days) → attached date range
  agingMin: '',
  agingMax: '',
};

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/** split CSV / newline into names array */
const splitNames = (v) =>
  String(v ?? '')
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Build DTO that exactly matches ProfileTrackerFilterRequest */
function buildFilterPayload(f, dd) {
  const payload = {};

  // direct keys
  if (f.demandId && /^\d+$/.test(String(f.demandId).trim())) {
    payload.demandNumber = Number(String(f.demandId).trim());
  }
  // demandPkId/profileId not in UI — skip

  // demand-side names
  if (f.priority) payload.priorityName = f.priority;
  if (f.cluster) payload.skillClusterName = f.cluster;
  if (f.lob) payload.lobName = f.lob;
  if (f.hbu) payload.hbuName = f.hbu;
  if (f.profileType) payload.externalInternalName = f.profileType;
  if (f.hiringManager) payload.hiringManagerName = f.hiringManager;

  // skills (ANY)
  const prim = splitNames(f.primary);
  if (prim.length) payload.demandPrimarySkillNames = prim;
  const sec = splitNames(f.secondary);
  if (sec.length) payload.demandSecondarySkillNames = sec;

  // profile identity
  if (f.name) payload.candidateName = f.name;
  // (empId/emailId not in UI inputs)

  // masters (IDs -> names)
  if (f.evaluationStatusId) {
    const found = (dd?.evaluationStatuses || []).find((x) => String(x.id) === String(f.evaluationStatusId));
    if (found?.name) payload.evaluationStatusName = found.name;
  }
  if (f.profileTrackerStatusId) {
    const found = (dd?.profileTrackerStatuses || []).find((x) => String(x.id) === String(f.profileTrackerStatusId));
    if (found?.name) payload.profileTrackerStatusName = found.name;
  }

  // date ranges (inclusive)
  const addDate = (fromKey, toKey, outFrom, outTo) => {
    const from = String(f[fromKey] || '').trim();
    const to = String(f[toKey] || '').trim();
    if (from) payload[outFrom] = from;
    if (to) payload[outTo] = to;
  };
  addDate('sharedFrom', 'sharedTo', 'profileSharedDateFrom', 'profileSharedDateTo');
  addDate('interviewFrom', 'interviewTo', 'interviewDateFrom', 'interviewDateTo');
  addDate('attachedFrom', 'attachedTo', 'attachedDateFrom', 'attachedDateTo');
  addDate('decisionFrom', 'decisionTo', 'decisionDateFrom', 'decisionDateTo');

  // aging → attached date window: [today - max .. today - min]
  const aMin = f.agingMin !== '' ? Number(f.agingMin) : null;
  const aMax = f.agingMax !== '' ? Number(f.agingMax) : null;
  if ((aMin !== null && Number.isFinite(aMin)) || (aMax !== null && Number.isFinite(aMax))) {
    const today = dayjs();
    const from = Number.isFinite(aMax) ? today.subtract(aMax, 'day').format(BACKEND_FMT) : null;
    const to = Number.isFinite(aMin) ? today.subtract(aMin, 'day').format(BACKEND_FMT) : null;
    if (from) payload.attachedDateFrom = from;
    if (to) payload.attachedDateTo = to;
  }

  return payload;
}

/* ---------- Header controls ---------- */
function HeaderWithSearch({ label, keyName, filters, setFilters, openSearch, toggle }) {
  return (
    <div className="flex flex-col items-start justify-center gap-1">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <SearchOutlined
          className={`text-gray-400 text-xs cursor-pointer ${openSearch[keyName] ? 'text-blue-600' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggle(keyName); }}
          title="Search"
        />
      </div>
      {openSearch[keyName] && (
        <input
          className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
          placeholder={`Search ${label}`}
          value={filters[keyName] ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, [keyName]: e.target.value }))}
          onClick={(e) => e.stopPropagation()}
          style={{ width: 140 }}
        />
      )}
    </div>
  );
}
function HeaderDateRange({ keyFrom, keyTo, label, filters, setFilters, openSearch, toggle }) {
  const openKey = `${keyFrom}__${keyTo}`;
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <SearchOutlined
          className={`text-gray-400 text-xs cursor-pointer ${openSearch[openKey] ? 'text-blue-600' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggle(openKey); }}
          title="Search"
        />
      </div>
      {openSearch[openKey] && (
        <div className="flex items-center gap-1">
          <input
            className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
            placeholder="From (YYYY-MM-DD)"
            value={filters[keyFrom] ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, [keyFrom]: e.target.value }))}
            style={{ width: 120 }}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
            placeholder="To (YYYY-MM-DD)"
            value={filters[keyTo] ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, [keyTo]: e.target.value }))}
            style={{ width: 120 }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
function HeaderSelect({ label, keyName, options, getLabel = (o) => o.name, getValue = (o) => o.id, filters, setFilters, openSearch, toggle }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <SearchOutlined
          className={`text-gray-400 text-xs cursor-pointer ${openSearch[keyName] ? 'text-blue-600' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggle(keyName); }}
          title="Search"
        />
      </div>
      {openSearch[keyName] && (
        <select
          className="h-7 px-2 text-xs rounded border border-gray-300 bg-white"
          value={filters[keyName] ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, [keyName]: e.target.value }))}
          onClick={(e) => e.stopPropagation()}
          style={{ width: 160 }}
        >
          <option value="">All</option>
          {(options || []).map((o) => (
            <option key={getValue(o)} value={getValue(o)}>
              {getLabel(o)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
function HeaderNumberRange({ keyMin, keyMax, label, filters, setFilters, openSearch, toggle }) {
  const openKey = `${keyMin}__${keyMax}`;
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <SearchOutlined
          className={`text-gray-400 text-xs cursor-pointer ${openSearch[openKey] ? 'text-blue-600' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggle(openKey); }}
          title="Search"
        />
      </div>
      {openSearch[openKey] && (
        <div className="flex items-center gap-1">
          <input
            className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
            placeholder="Min"
            value={filters[keyMin] ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, [keyMin]: e.target.value }))}
            style={{ width: 70 }}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
            placeholder="Max"
            value={filters[keyMax] ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, [keyMax]: e.target.value }))}
            style={{ width: 70 }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default function ProfileTracker() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const [dd, setDd] = useState({
    evaluationStatuses: [],
    profileTrackerStatuses: [],
  });

  // header filters + toggles
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [openSearch, setOpenSearch] = useState({});
  const toggleSearch = (key) => setOpenSearch((s) => ({ ...s, [key]: !s[key] }));
  const debouncedFilters = useDebounced(filters, 300);

  // compute backend payload from UI filters (matches DTO)
  const filterPayload = useMemo(() => buildFilterPayload(debouncedFilters, dd), [debouncedFilters, dd]);

  // server-side pagination (0-based)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfileTrackerDropdowns();
        setDd({
          evaluationStatuses: res?.evaluationStatuses ?? [],
          profileTrackerStatuses: res?.profileTrackerStatuses ?? [],
        });
      } catch {
        setDd({ evaluationStatuses: [], profileTrackerStatuses: [] });
      }
    })();
  }, []);

  /** ✅ Force UI page/size to requested values (do not rely on backend echo). */
  const load = async (pg = page, sz = size, payload = filterPayload) => {
    try {
      setLoading(true);
      setApiErr(null);

      const hasFilter = payload && Object.keys(payload).length > 0;
      const resp = hasFilter
        ? await searchProfileTracker({ filter: payload, page: pg, size: sz })
        : await listProfileTracker({ page: pg, size: sz });

      const items = Array.isArray(resp?.items) ? resp.items : [];
      const totalElements = Number(resp?.totalElements ?? items.length ?? 0);

      setRows(items);
      setTotal(totalElements);

      // lock UI to requested page/size
      setPage(pg);
      setSize(sz);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load tracker';
      setApiErr(msg);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // initial
  useEffect(() => {
    load(0, size, filterPayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when filters change → reset to page 0
  useEffect(() => {
    load(0, size, filterPayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPayload]);

  /** AntD onChange(page1Based, pageSize) */
  const onPageChange = (current, pageSize) => {
    const newPage = current - 1; // convert to 0-based
    load(newPage, pageSize, filterPayload);
  };

  /** Optional: explicit onShowSizeChange handler */
  const onShowSizeChange = (current, pageSize) => {
    // Go to first page when page size changes
    load(0, pageSize, filterPayload);
  };

  const onEdit = (row) => {
    setEditId(getRowId(row));
    setEditDraft({
      evaluationStatusId: row?.evaluationStatus?.id ?? '',
      statusId: row?.profileTrackerStatus?.id ?? '',
      profileSharedDate: row?.profileSharedDate ? displayDate(row.profileSharedDate) : '',
      interviewDate: row?.interviewDate ? displayDate(row.interviewDate) : '',
      decisionDate: row?.decisionDate ? displayDate(row.decisionDate) : '',
    });
  };
  const onCancel = () => {
    setEditId(null);
    setEditDraft({});
  };
  const onSave = async (row) => {
    const id = getRowId(row);
    if (id == null) {
      message.error('Missing row id');
      return;
    }
    const payload = {
      profileSharedDate: editDraft.profileSharedDate ? dayjs(editDraft.profileSharedDate).format(BACKEND_FMT) : null,
      interviewDate: editDraft.interviewDate ? dayjs(editDraft.interviewDate).format(BACKEND_FMT) : null,
      decisionDate: editDraft.decisionDate ? dayjs(editDraft.decisionDate).format(BACKEND_FMT) : null,
      evaluationStatusId: editDraft.evaluationStatusId ? Number(editDraft.evaluationStatusId) : null,
      profileTrackerStatusId: editDraft.statusId ? Number(editDraft.statusId) : null,
    };
    try {
      await updateProfileTracker({ id, payload });
      setRows((prev) =>
        prev.map((r) => {
          if (getRowId(r) !== id) return r;
          const next = { ...r };
          if (payload.profileSharedDate !== null) next.profileSharedDate = payload.profileSharedDate;
          if (payload.interviewDate !== null) next.interviewDate = payload.interviewDate;
          if (payload.decisionDate !== null) next.decisionDate = payload.decisionDate;
          if (payload.evaluationStatusId) {
            const found = dd.evaluationStatuses.find((x) => String(x.id) === String(payload.evaluationStatusId));
            next.evaluationStatus = found ? { id: found.id, name: found.name } : next.evaluationStatus;
          }
          if (payload.profileTrackerStatusId) {
            const found = dd.profileTrackerStatuses.find((x) => String(x.id) === String(payload.profileTrackerStatusId));
            next.profileTrackerStatus = found ? { id: found.id, name: found.name } : next.profileTrackerStatus;
          }
          return next;
        })
      );
      message.success('Row updated');
      onCancel();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to update';
      message.error(msg);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl md:text-2xl font-bold tracking-tight text-gray-900">Profile Tracker</h2>

        {loading && <div className="text-sm text-gray-700 my-2">Loading…</div>}
        {apiErr && <div className="text-sm text-red-600 my-2">Error: {apiErr}</div>}

        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="max-w-[1600px] w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <Th w={60}>EDIT</Th>

                {/* Demand Id — text (numeric -> demandNumber) */}
                <Th w={180}>
                  <HeaderWithSearch
                    label="Demand Id"
                    keyName="demandId"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                {/* Candidate Name — text -> candidateName */}
                <Th>
                  <HeaderWithSearch
                    label="Candidate Name"
                    keyName="name"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                {/* Priority — text -> priorityName */}
                <Th>
                  <HeaderWithSearch
                    label="Priority"
                    keyName="priority"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                {/* Skill Cluster / Primary / Secondary */}
                <Th w={180}>
                  <HeaderWithSearch
                    label="Skill Cluster"
                    keyName="cluster"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>
                <Th w={220}>
                  <HeaderWithSearch
                    label="Primary Skill"
                    keyName="primary"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>
                <Th w={220}>
                  <HeaderWithSearch
                    label="Secondary Skill"
                    keyName="secondary"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                {/* LOB / HBU / Location */}
                <Th>
                  <HeaderWithSearch
                    label="LOB"
                    keyName="lob"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>
                <Th>
                  <HeaderWithSearch
                    label="HBU"
                    keyName="hbu"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>
                <Th>
                  <HeaderWithSearch
                    label="Location"
                    keyName="location"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                {/* Profile Type -> externalInternalName */}
                <Th>
                  <HeaderWithSearch
                    label="Profile Type"
                    keyName="profileType"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                {/* Hiring Manager -> hiringManagerName */}
                <Th>
                  <HeaderWithSearch
                    label="Hiring Manager"
                    keyName="hiringManager"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                {/* Dates */}
                <Th>
                  <HeaderDateRange
                    label="Attached Date"
                    keyFrom="attachedFrom"
                    keyTo="attachedTo"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>
                <Th>
                  <HeaderDateRange
                    label="Profile Shared Date"
                    keyFrom="sharedFrom"
                    keyTo="sharedTo"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>
                <Th>
                  <HeaderDateRange
                    label="Interview Date"
                    keyFrom="interviewFrom"
                    keyTo="interviewTo"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>
                <Th>
                  <HeaderDateRange
                    label="Decision Date"
                    keyFrom="decisionFrom"
                    keyTo="decisionTo"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                {/* Evaluation / Status (select; mapped to names in payload) */}
                <Th>
                  <HeaderSelect
                    label="Evaluation Status"
                    keyName="evaluationStatusId"
                    options={dd.evaluationStatuses}
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>
                <Th>
                  <HeaderSelect
                    label="Status"
                    keyName="profileTrackerStatusId"
                    options={dd.profileTrackerStatuses}
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                {/* Aging */}
                <Th>
                  <HeaderNumberRange
                    label="Aging"
                    keyMin="agingMin"
                    keyMax="agingMax"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>
              </tr>
            </thead>

            <tbody>
              {(!rows || rows.length === 0) && !loading ? (
                <tr>
                  <td className="p-3 text-sm text-gray-500" colSpan={20}>
                    No data found.
                  </td>
                </tr>
              ) : (
                rows.map((p) => {
                  const rowId = getRowId(p);
                  const isEdit = editId === rowId;

                  const demandCode =
                    p?.demand?.displayDemandId ||
                    (() => {
                      const lobName = p?.demand?.lob?.name ?? '';
                      const demId = p?.demand?.demandId ?? '';
                      return [lobName, demId].filter(Boolean).join('-');
                    })();

                  const skillClusterText = p?.demand?.skillCluster?.name ?? '-';
                  const primarySkillsText = Array.isArray(p?.demand?.primarySkills)
                    ? p.demand.primarySkills.map(nameOf).join(', ')
                    : p?.demand?.primarySkills ?? '-';
                  const secondarySkillsText = Array.isArray(p?.demand?.secondarySkills)
                    ? p.demand.secondarySkills.map(nameOf).join(', ')
                    : p?.demand?.secondarySkills ?? '-';

                  const attachedDate = getAttachedDate(p);
                  const aging = calculateDaysFrom(attachedDate);

                  const candidateName = p?.profile?.candidateName ?? '-';
                  const empId = p?.profile?.empId;

                  const jdFileName = getJdFileName(p);
                  const cvFileName = getCvFileName(p);

                  return (
                    <tr key={rowId} className="even:bg-gray-50/50">
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

                      {/* Demand Id + JD */}
                      <Td>
                        <div className="flex items-center justify-between gap-2 min-h-[44px]">
                          <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-600 px-2 py-0.5 text-xs font-semibold">
                            {demandCode || '-'}
                          </span>
                          <div className="shrink-0 flex items-center">
                            <Tooltip title={jdFileName ? `Download JD (${prettifyFilename(jdFileName)})` : 'JD not available'}>
                              <button
                                type="button"
                                onClick={(e) => jdFileName && handleJdDownload(jdFileName, e)}
                                className={`p-1 rounded ${jdFileName ? 'hover:bg-blue-50 hover:text-blue-700' : 'text-gray-300 cursor-not-allowed'}`}
                                disabled={!jdFileName}
                                aria-label={jdFileName ? `Download JD (${prettifyFilename(jdFileName)})` : 'JD not available'}
                              >
                                <DownloadOutlined />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </Td>

                      {/* Candidate + CV */}
                      <Td>
                        <div className="flex items-center justify-between gap-2 min-h-[44px]">
                          <div className="flex flex-col leading-tight">
                            <span className="font-medium text-gray-900 whitespace-nowrap">{candidateName}</span>
                            {empId ? <span className="text-xs text-gray-500 whitespace-nowrap">({empId})</span> : null}
                          </div>
                          <div className="shrink-0 flex items-center">
                            <Tooltip title={cvFileName ? `Download CV (${prettifyFilename(cvFileName)})` : 'CV not available'}>
                              <button
                                type="button"
                                onClick={(e) => cvFileName && handleCvDownload(cvFileName, e)}
                                className={`p-1 rounded ${cvFileName ? 'hover:bg-blue-50 hover:text-blue-700' : 'text-gray-300 cursor-not-allowed'}`}
                                disabled={!cvFileName}
                                aria-label={cvFileName ? `Download CV (${prettifyFilename(cvFileName)})` : 'CV not available'}
                              >
                                <DownloadOutlined />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </Td>

                      {/* Priority pill */}
                      <Td>
                        <Pill priority={p?.demand?.priority?.name ?? p?.priority} />
                      </Td>

                      {/* Skills */}
                      <TdWrapWithTooltip text={skillClusterText} w={180} />
                      <TdWrapWithTooltip text={primarySkillsText} w={220} />
                      <TdWrapWithTooltip text={secondarySkillsText} w={220} />

                      {/* Others */}
                      <Td>{p?.demand?.lob?.name || '-'}</Td>
                      <Td>{p?.demand?.hbu?.name || '-'}</Td>
                      <Td>{nameOf(p?.profile?.location) || '-'}</Td>
                      <Td>{nameOf(p?.profile?.externalInternal) || '-'}</Td>
                      <Td>{p?.demand?.hiringManager?.name ?? '-'}</Td>

                      {/* Dates */}
                      <Td>{displayDate(attachedDate) || '-'}</Td>
                      <Td>
                        {!isEdit ? (
                          displayDate(p?.profileSharedDate) || '-'
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

                      {/* Masters */}
                      <Td>
                        {!isEdit ? (
                          p?.evaluationStatus?.name ?? '-'
                        ) : (
                          <select
                            className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
                            value={String(editDraft.evaluationStatusId ?? '')}
                            onChange={(e) => setEditDraft((d) => ({ ...d, evaluationStatusId: e.target.value }))}
                          >
                            <option value="">-</option>
                            {Array.isArray(dd.evaluationStatuses) && dd.evaluationStatuses.length > 0 ? (
                              dd.evaluationStatuses.map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.name}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>
                                {loading ? 'Loading…' : 'No options'}
                              </option>
                            )}
                          </select>
                        )}
                      </Td>
                      <Td>
                        {!isEdit ? (
                          p?.profileTrackerStatus?.name ?? '-'
                        ) : (
                          <select
                            className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
                            value={String(editDraft.statusId ?? '')}
                            onChange={(e) => setEditDraft((d) => ({ ...d, statusId: e.target.value }))}
                          >
                            <option value="">-</option>
                            {Array.isArray(dd.profileTrackerStatuses) && dd.profileTrackerStatuses.length > 0 ? (
                              dd.profileTrackerStatuses.map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.name}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>
                                {loading ? 'Loading…' : 'No options'}
                              </option>
                            )}
                          </select>
                        )}
                      </Td>

                      {/* Aging */}
                      <Td>{formatAging(aging)}</Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom pagination */}
        <div className="mt-3 flex items-center justify-end">
          <Pagination
            current={page + 1}               // AntD is 1-based
            pageSize={size}
            total={total}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={onPageChange}
            onShowSizeChange={onShowSizeChange}
            showTotal={(t, range) => `${range[0]}-${range[1]} of ${t}`}
          />
        </div>
      </div>
    </Layout>
  );
}