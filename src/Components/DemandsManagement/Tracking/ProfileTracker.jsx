// // ---------------------------------------------------------------

// import React, { useEffect, useMemo, useState } from 'react';
// import dayjs from 'dayjs';
// import { DatePicker, message, Tooltip, Pagination } from 'antd';
// import {
//   EditOutlined,
//   SaveOutlined,
//   CloseOutlined,
//   DownloadOutlined,
//   SearchOutlined,
// } from '@ant-design/icons';
// import Layout from '../../Layout';

// import {
//   listProfileTracker,
//   updateProfileTracker,
//   getProfileTrackerDropdowns,
//   searchProfileTracker,
// } from '../../api/Trackers/tracker';

// import { downloadDemandJDByFileName } from '../../api/Demands/getDemands';
// import { downloadProfileCv } from '../../api/Profiles/addProfile';

// const BACKEND_FMT = 'YYYY-MM-DD';

// /* ----------------------- helpers ----------------------- */
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
// const nameOf = (obj) =>
//   obj && typeof obj === 'object' ? obj.name ?? '' : obj ?? '';
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
//   const base =
//     'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold';
//   if (p === 'P1')
//     return (
//       <span
//         className={base}
//         style={{
//           background: '#E6FFFA',
//           color: '#065F46',
//           border: '1px solid #99F6E4',
//         }}
//       >
//         P1
//       </span>
//     );
//   if (p === 'P2')
//     return (
//       <span
//         className={base}
//         style={{
//           background: '#FFF7ED',
//           color: '#92400E',
//           border: '1px solid #FED7AA',
//         }}
//       >
//         P2
//       </span>
//     );
//   if (p === 'P3')
//     return (
//       <span
//         className={base}
//         style={{
//           background: '#FEF2F2',
//           color: '#991B1B',
//           border: '1px solid #FECACA',
//         }}
//       >
//         P3
//       </span>
//     );
//   return (
//     <span
//       className={base}
//       style={{
//         background: '#EDF2F7',
//         color: '#2D3748',
//         border: '1px solid #CBD5E0',
//       }}
//     >
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
//   return dayjs(val, BACKEND_FMT).isValid()
//     ? dayjs(val, BACKEND_FMT)
//     : dayjs(val).isValid()
//     ? dayjs(val)
//     : null;
// }
// function displayDate(value) {
//   if (!value) return '';
//   const d =
//     parseISODateSafe(value) ??
//     (typeof value === 'string'
//       ? dayjs(value, BACKEND_FMT).toDate()
//       : null);
//   if (!d) return String(value);
//   return dayjs(d).format(BACKEND_FMT);
// }
// function getAttachedDate(row) {
//   return (
//     row?.attachedDate ??
//     row?.dateAttached ??
//     row?.profileAttachedDate ??
//     null
//   );
// }
// function getRowId(r) {
//   return (
//     r?.id ??
//     r?.profileTrackerId ??
//     r?.trackerId ??
//     r?.profileTrackId ??
//     r?.key ??
//     `${r?.demand?.demandId ?? 'd'}-${
//       r?.profile?.profileId ?? 'p'
//     }`
//   );
// }
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
//   const extPart = m ? m[2] : '';
//   let n = namePart;
//   n = n.replace(/[ \t]+/g, '_');
//   n = n.replace(/^(?:rr|profile|cv|jd|demand)[-_]?\d*[-_]?/i, '');
//   n = n.replace(/^\d+[-_]?/, '');
//   n = n.replace(/([_-])\d{8}$/, '');
//   n = n.replace(/([_-])\d{8}([_-])\d{6}$/, '');
//   n = n.replace(/[-_]{2,}/g, '_').replace(/^[-_]+|[-_]+$/g, '');
//   return `${n || base}${extPart}`;
// }
// function formatAging(aging) {
//   if (!Number.isFinite(aging)) return '-';
//   return `${aging}d`;
// }
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
// function demandLocationNamesText(row) {
//   const d = row?.demand ?? {};
//   if (
//     Array.isArray(d?.demandLocations) &&
//     d.demandLocations.length
//   ) {
//     return d.demandLocations.map(nameOf).join(', ');
//   }
//   return nameOf(d?.location) || nameOf(row?.profile?.location) || '-';
// }

// /* ---------- click handlers ---------- */
// async function handleJdDownload(fileName, e) {
//   e?.stopPropagation?.();
//   if (!fileName) return;
//   const hide = message.loading('Downloading JD…', 0);
//   try {
//     await downloadDemandJDByFileName(fileName);
//   } catch (err) {
//     message.error(
//       err?.response?.data?.message || 'Failed to download JD'
//     );
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
//     message.error(
//       err?.response?.data?.message || 'Failed to download CV'
//     );
//   } finally {
//     hide();
//   }
// }

// /* ===================== FILTER & PAGINATION ===================== */
// const DEFAULT_FILTERS = {
//   demandNumber: '',
//   candidateName: '',
//   priorityName: '',
//   skillClusterName: '',
//   demandPrimarySkillNames: '',
//   demandSecondarySkillNames: '',
//   lobName: '',
//   hbuName: '',
//   externalInternalName: '',
//   hiringManagerName: '',
//   demandLocationNames: '',
//   attachedDateFrom: '',
//   attachedDateTo: '',
//   profileSharedDateFrom: '',
//   profileSharedDateTo: '',
//   interviewDateFrom: '',
//   interviewDateTo: '',
//   decisionDateFrom: '',
//   decisionDateTo: '',
//   profileTrackerStatusId: '',
//   agingMin: '',
//   agingMax: '',
// };

// function useDebounced(value, delay = 300) {
//   const [v, setV] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setV(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);
//   return v;
// }

// const splitNames = (v) =>
//   String(v ?? '')
//     .split(/[,;\n]/)
//     .map((s) => s.trim())
//     .filter(Boolean);

// const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// function isValidDateStr(v) {
//   const s = String(v ?? '').trim();
//   return (
//     DATE_RE.test(s) && dayjs(s, BACKEND_FMT, true).isValid()
//   );
// }

// function sanitizeDateInput(v) {
//   return String(v ?? '')
//     .replace(/[^\d-]/g, '')
//     .slice(0, 10);
// }

// function buildFilterPayload(f, dd) {
//   const payload = {};

//   if (f.demandNumber && /^\d+$/.test(String(f.demandNumber).trim())) {
//     payload.demandNumber = Number(
//       String(f.demandNumber).trim()
//     );
//   }

//   if (f.priorityName) payload.priorityName = f.priorityName;
//   if (f.skillClusterName)
//     payload.skillClusterName = f.skillClusterName;
//   if (f.lobName) payload.lobName = f.lobName;
//   if (f.hbuName) payload.hbuName = f.hbuName;
//   if (f.externalInternalName)
//     payload.externalInternalName = f.externalInternalName;
//   if (f.hiringManagerName)
//     payload.hiringManagerName = f.hiringManagerName;

//   const prim = splitNames(f.demandPrimarySkillNames);
//   if (prim.length) payload.demandPrimarySkillNames = prim;

//   const sec = splitNames(f.demandSecondarySkillNames);
//   if (sec.length) payload.demandSecondarySkillNames = sec;

//   const loc = splitNames(f.demandLocationNames);
//   if (loc.length) payload.demandLocationNames = loc;

//   if (f.candidateName)
//     payload.candidateName = f.candidateName;

//   // Removed evaluation status completely

//   if (f.profileTrackerStatusId) {
//     const found = dd.profileTrackerStatuses.find(
//       (x) =>
//         String(x.id) === String(f.profileTrackerStatusId)
//     );
//     if (found?.name)
//       payload.profileTrackerStatusName = found.name;
//   }

//   const passDate = (k) => {
//     const raw = String(f[k] ?? '').trim();
//     if (isValidDateStr(raw)) payload[k] = raw;
//   };

//   [
//     'profileSharedDateFrom',
//     'profileSharedDateTo',
//     'interviewDateFrom',
//     'interviewDateTo',
//     'attachedDateFrom',
//     'attachedDateTo',
//     'decisionDateFrom',
//     'decisionDateTo',
//   ].forEach(passDate);

//   const aMin = f.agingMin !== '' ? Number(f.agingMin) : null;
//   const aMax = f.agingMax !== '' ? Number(f.agingMax) : null;

//   if (
//     (aMin !== null && Number.isFinite(aMin)) ||
//     (aMax !== null && Number.isFinite(aMax))
//   ) {
//     const today = dayjs();
//     const from = Number.isFinite(aMax)
//       ? today.subtract(aMax, 'day').format(BACKEND_FMT)
//       : null;
//     const to = Number.isFinite(aMin)
//       ? today.subtract(aMin, 'day').format(BACKEND_FMT)
//       : null;
//     if (from) payload.attachedDateFrom = from;
//     if (to) payload.attachedDateTo = to;
//   }

//   return payload;
// }

// /* ---------- Header controls ---------- */

// function HeaderWithSearch({
//   label,
//   keyName,
//   filters,
//   setFilters,
//   openSearch,
//   toggle,
// }) {
//   return (
//     <div className="flex flex-col items-start justify-center gap-1">
//       <div className="flex items-center gap-2">
//         <span>{label}</span>
//         <SearchOutlined
//           className={`text-gray-400 text-xs cursor-pointer ${
//             openSearch[keyName] ? 'text-blue-600' : ''
//           }`}
//           onClick={(e) => {
//             e.stopPropagation();
//             toggle(keyName);
//           }}
//           title="Search"
//         />
//       </div>
//       {openSearch[keyName] && (
//         <input
//           className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
//           placeholder={`Search ${label}`}
//           value={filters[keyName] ?? ''}
//           onChange={(e) =>
//             setFilters((f) => ({
//               ...f,
//               [keyName]: e.target.value,
//             }))
//           }
//           onClick={(e) => e.stopPropagation()}
//           style={{ width: 140 }}
//         />
//       )}
//     </div>
//   );
// }

// function HeaderDateRange({
//   keyFrom,
//   keyTo,
//   label,
//   filters,
//   setFilters,
//   openSearch,
//   toggle,
// }) {
//   const openKey = `${keyFrom}__${keyTo}`;
//   return (
//     <div className="flex flex-col items-start gap-1">
//       <div className="flex items-center gap-2">
//         <span>{label}</span>
//         <SearchOutlined
//           className={`text-gray-400 text-xs cursor-pointer ${
//             openSearch[openKey] ? 'text-blue-600' : ''
//           }`}
//           onClick={(e) => {
//             e.stopPropagation();
//             toggle(openKey);
//           }}
//           title="Search"
//         />
//       </div>
//       {openSearch[openKey] && (
//         <div className="flex items-center gap-1">
//           <input
//             className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
//             placeholder="From (YYYY-MM-DD)"
//             value={filters[keyFrom] ?? ''}
//             onChange={(e) => {
//               const v = sanitizeDateInput(e.target.value);
//               setFilters((f) => ({
//                 ...f,
//                 [keyFrom]: v,
//               }));
//             }}
//             style={{ width: 120 }}
//             onClick={(e) => e.stopPropagation()}
//           />
//           <span className="text-gray-400 text-xs">–</span>
//           <input
//             className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
//             placeholder="To (YYYY-MM-DD)"
//             value={filters[keyTo] ?? ''}
//             onChange={(e) => {
//               const v = sanitizeDateInput(e.target.value);
//               setFilters((f) => ({
//                 ...f,
//                 [keyTo]: v,
//               }));
//             }}
//             style={{ width: 120 }}
//             onClick={(e) => e.stopPropagation()}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// function HeaderSelect({
//   label,
//   keyName,
//   options,
//   getLabel = (o) => o.name,
//   getValue = (o) => o.id,
//   filters,
//   setFilters,
//   openSearch,
//   toggle,
// }) {
//   return (
//     <div className="flex flex-col items-start gap-1">
//       <div className="flex items-center gap-2">
//         <span>{label}</span>
//         <SearchOutlined
//           className={`text-gray-400 text-xs cursor-pointer ${
//             openSearch[keyName] ? 'text-blue-600' : ''
//           }`}
//           onClick={(e) => {
//             e.stopPropagation();
//             toggle(keyName);
//           }}
//           title="Search"
//         />
//       </div>
//       {openSearch[keyName] && (
//         <select
//           className="h-7 px-2 text-xs rounded border border-gray-300 bg-white"
//           value={filters[keyName] ?? ''}
//           onChange={(e) =>
//             setFilters((f) => ({
//               ...f,
//               [keyName]: e.target.value,
//             }))
//           }
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

// function HeaderNumberRange({
//   keyMin,
//   keyMax,
//   label,
//   filters,
//   setFilters,
//   openSearch,
//   toggle,
// }) {
//   const openKey = `${keyMin}__${keyMax}`;
//   return (
//     <div className="flex flex-col items-start gap-1">
//       <div className="flex items-center gap-2">
//         <span>{label}</span>
//         <SearchOutlined
//           className={`text-gray-400 text-xs cursor-pointer ${
//             openSearch[openKey] ? 'text-blue-600' : ''
//           }`}
//           onClick={(e) => {
//             e.stopPropagation();
//             toggle(openKey);
//           }}
//           title="Search"
//         />
//       </div>
//       {openSearch[openKey] && (
//         <div className="flex items-center gap-1">
//           <input
//             className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
//             placeholder="Min"
//             value={filters[keyMin] ?? ''}
//             onChange={(e) =>
//               setFilters((f) => ({
//                 ...f,
//                 [keyMin]: e.target.value,
//               }))
//             }
//             style={{ width: 70 }}
//             onClick={(e) => e.stopPropagation()}
//           />
//           <span className="text-gray-400 text-xs">–</span>
//           <input
//             className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
//             placeholder="Max"
//             value={filters[keyMax] ?? ''}
//             onChange={(e) =>
//               setFilters((f) => ({
//                 ...f,
//                 [keyMax]: e.target.value,
//               }))
//             }
//             style={{ width: 70 }}
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
//     profileTrackerStatuses: [],
//   });

//   const [filters, setFilters] = useState(DEFAULT_FILTERS);
//   const [openSearch, setOpenSearch] = useState({});
//   const toggleSearch = (key) =>
//     setOpenSearch((s) => ({ ...s, [key]: !s[key] }));
//   const debouncedFilters = useDebounced(filters);

//   const filterPayload = useMemo(
//     () => buildFilterPayload(debouncedFilters, dd),
//     [debouncedFilters, dd]
//   );

//   const [page, setPage] = useState(0);
//   const [size, setSize] = useState(10);
//   const [total, setTotal] = useState(0);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await getProfileTrackerDropdowns();
//         setDd({
//           profileTrackerStatuses:
//             res?.profileTrackerStatuses ?? [],
//         });
//       } catch {
//         setDd({
//           profileTrackerStatuses: [],
//         });
//       }
//     })();
//   }, []);

//   const load = async (pg = page, sz = size, payload = filterPayload) => {
//     try {
//       setLoading(true);
//       setApiErr(null);

//       const hasFilter =
//         payload && Object.keys(payload).length > 0;

//       const resp = hasFilter
//         ? await searchProfileTracker({
//             filter: payload,
//             page: pg,
//             size: sz,
//           })
//         : await listProfileTracker({
//             page: pg,
//             size: sz,
//           });

//       const items = Array.isArray(resp?.items)
//         ? resp.items
//         : [];
//       const totalElements = Number(
//         resp?.totalElements ?? items.length ?? 0
//       );

//       setRows(items);
//       setTotal(totalElements);

//       setPage(pg);
//       setSize(sz);
//     } catch (e) {
//       setApiErr(
//         e?.response?.data?.message ||
//           e?.message ||
//           'Failed to load tracker'
//       );
//       setRows([]);
//       setTotal(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load(0, size, filterPayload);
//     // eslint-disable-next-line
//   }, []);

//   useEffect(() => {
//     load(0, size, filterPayload);
//   }, [filterPayload]);

//   const onPageChange = (current, pageSize) => {
//     load(current - 1, pageSize, filterPayload);
//   };

//   const onShowSizeChange = (current, pageSize) => {
//     load(0, pageSize, filterPayload);
//   };

//   // ✅ UPDATED: keep original values to detect true changes
//   const onEdit = (row) => {
//     const original = {
//       statusId: row?.profileTrackerStatus?.id ?? null,
//       profileSharedDate: row?.profileSharedDate
//         ? displayDate(row.profileSharedDate)
//         : '',
//       interviewDate: row?.interviewDate
//         ? displayDate(row.interviewDate)
//         : '',
//       decisionDate: row?.decisionDate
//         ? displayDate(row.decisionDate)
//         : '',
//     };

//     setEditId(getRowId(row));
//     setEditDraft({
//       statusId: original.statusId ?? '',
//       profileSharedDate: original.profileSharedDate,
//       interviewDate: original.interviewDate,
//       decisionDate: original.decisionDate,
//       __original: original, // snapshot for diff
//     });
//   };

//   const onCancel = () => {
//     setEditId(null);
//     setEditDraft({});
//   };

//   // ✅ UPDATED: send only changed fields; omit profileTrackerStatusId unless user actually changed it
//   const onSave = async (row) => {
//     const id = getRowId(row);
//     if (id == null) {
//       message.error('Missing row id');
//       return;
//     }

//     const normId = (v) =>
//       v === '' || v === null || v === undefined ? null : Number(v);

//     const orig = editDraft.__original || {};
//     const payload = {};

//     // Dates: include only if changed (string compare on YYYY-MM-DD)
//     if (
//       editDraft.profileSharedDate &&
//       editDraft.profileSharedDate !== (orig.profileSharedDate || '')
//     ) {
//       payload.profileSharedDate = dayjs(editDraft.profileSharedDate).format(BACKEND_FMT);
//     }
//     if (
//       editDraft.interviewDate &&
//       editDraft.interviewDate !== (orig.interviewDate || '')
//     ) {
//       payload.interviewDate = dayjs(editDraft.interviewDate).format(BACKEND_FMT);
//     }
//     if (
//       editDraft.decisionDate &&
//       editDraft.decisionDate !== (orig.decisionDate || '')
//     ) {
//       payload.decisionDate = dayjs(editDraft.decisionDate).format(BACKEND_FMT);
//     }

//     // Status: only if changed vs original
//     const curStatusId = normId(editDraft.statusId);
//     const origStatusId = normId(orig.statusId);
//     if (curStatusId !== origStatusId) {
//       payload.profileTrackerStatusId = curStatusId;
//     }

//     if (Object.keys(payload).length === 0) {
//       message.warning('No changes to save');
//       return;
//     }

//     try {
//       await updateProfileTracker({ id, payload });

//       // Pull fresh data so we see backend’s derived status
//       await load(page, size, filterPayload);

//       message.success('Row updated');
//       onCancel();
//     } catch (e) {
//       message.error(
//         e?.response?.data?.message ||
//           e?.message ||
//           'Failed to update'
//       );
//     }
//   };

//   return (
//     <Layout>
//       <div className="p-4">
//         <h2 className="text-2xl md:text-2xl font-bold tracking-tight text-gray-900">
//           Profile Tracker
//         </h2>

//         {loading && (
//           <div className="text-sm text-gray-700 my-2">
//             Loading…
//           </div>
//         )}
//         {apiErr && (
//           <div className="text-sm text-red-600 my-2">
//             Error: {apiErr}
//           </div>
//         )}

//         <div className="overflow-x-auto rounded-md border border-gray-200">
//           <table className="max-w-[1600px] w-full border-collapse">
//             <thead className="bg-gray-50">
//               <tr>
//                 <Th w={60}>EDIT</Th>

//                 <Th w={180}>
//                   <HeaderWithSearch
//                     label="Demand Number"
//                     keyName="demandNumber"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th>
//                   <HeaderWithSearch
//                     label="Candidate Name"
//                     keyName="candidateName"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th>
//                   <HeaderWithSearch
//                     label="Priority"
//                     keyName="priorityName"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th w={180}>
//                   <HeaderWithSearch
//                     label="Skill Cluster"
//                     keyName="skillClusterName"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th w={220}>
//                   <HeaderWithSearch
//                     label="Primary Skill"
//                     keyName="demandPrimarySkillNames"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th w={220}>
//                   <HeaderWithSearch
//                     label="Secondary Skill"
//                     keyName="demandSecondarySkillNames"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th>
//                   <HeaderWithSearch
//                     label="LOB"
//                     keyName="lobName"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th>
//                   <HeaderWithSearch
//                     label="HBU"
//                     keyName="hbuName"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th>
//                   <HeaderWithSearch
//                     label="Location"
//                     keyName="demandLocationNames"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th>
//                   <HeaderWithSearch
//                     label="External/Internal"
//                     keyName="externalInternalName"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th>
//                   <HeaderWithSearch
//                     label="Hiring Manager"
//                     keyName="hiringManagerName"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th>
//                   <HeaderDateRange
//                     label="Attached Date"
//                     keyFrom="attachedDateFrom"
//                     keyTo="attachedDateTo"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th>
//                   <HeaderDateRange
//                     label="Profile Shared Date"
//                     keyFrom="profileSharedDateFrom"
//                     keyTo="profileSharedDateTo"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th>
//                   <HeaderDateRange
//                     label="Interview Date"
//                     keyFrom="interviewDateFrom"
//                     keyTo="interviewDateTo"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 <Th>
//                   <HeaderDateRange
//                     label="Decision Date"
//                     keyFrom="decisionDateFrom"
//                     keyTo="decisionDateTo"
//                     filters={filters}
//                     setFilters={setFilters}
//                     openSearch={openSearch}
//                     toggle={toggleSearch}
//                   />
//                 </Th>

//                 {/* ONLY ONE STATUS SELECT REMAINS */}
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
//               {!rows?.length && !loading ? (
//                 <tr>
//                   <td
//                     colSpan={20}
//                     className="p-3 text-sm text-gray-500"
//                   >
//                     No data found.
//                   </td>
//                 </tr>
//               ) : (
//                 rows.map((p) => {
//                   const rowId = getRowId(p);
//                   const isEdit = editId === rowId;

//                   const demandCode =
//                     p?.demand?.displayDemandId ||
//                     `${
//                       p?.demand?.lob?.name ?? ''
//                     }-${p?.demand?.demandId}`;

//                   const skillClusterText =
//                     p?.demand?.skillCluster?.name ?? '-';
//                   const primarySkillsText = Array.isArray(
//                     p?.demand?.primarySkills
//                   )
//                     ? p.demand.primarySkills
//                         .map(nameOf)
//                         .join(', ')
//                     : p?.demand?.primarySkills ?? '-';

//                   const secondarySkillsText = Array.isArray(
//                     p?.demand?.secondarySkills
//                   )
//                     ? p.demand.secondarySkills
//                         .map(nameOf)
//                         .join(', ')
//                     : p?.demand?.secondarySkills ?? '-';

//                   const attachedDate = getAttachedDate(p);
//                   const aging = calculateDaysFrom(attachedDate);

//                   const candidateName =
//                     p?.profile?.candidateName ?? '-';
//                   const empId = p?.profile?.empId;

//                   const jdFileName = getJdFileName(p);
//                   const cvFileName = getCvFileName(p);

//                   return (
//                     <tr key={rowId} className="even:bg-gray-50/50">
//                       <Td>
//                         {!isEdit ? (
//                           <button
//                             type="button"
//                             onClick={() => onEdit(p)}
//                             className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
//                           >
//                             <EditOutlined /> Edit
//                           </button>
//                         ) : (
//                           <div className="flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() => onSave(p)}
//                               className="inline-flex items-center gap-1 rounded border border-green-600 text-green-700 px-2 py-1 text-xs hover:bg-green-50"
//                             >
//                               <SaveOutlined /> Save
//                             </button>
//                             <button
//                               type="button"
//                               onClick={onCancel}
//                               className="inline-flex items-center gap-1 rounded border border-gray-400 px-2 py-1 text-xs hover:bg-gray-100"
//                             >
//                               <CloseOutlined /> Cancel
//                             </button>
//                           </div>
//                         )}
//                       </Td>

//                       <Td>
//                         <div className="flex items-center justify-between gap-2 min-h-[44px]">
//                           <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-600 px-2 py-0.5 text-xs font-semibold">
//                             {demandCode || '-'}
//                           </span>
//                           <div className="shrink-0 flex items-center">
//                             <Tooltip
//                               title={
//                                 jdFileName
//                                   ? `Download JD (${prettifyFilename(
//                                       jdFileName
//                                     )})`
//                                   : 'JD not available'
//                               }
//                             >
//                               <button
//                                 type="button"
//                                 onClick={(e) =>
//                                   jdFileName &&
//                                   handleJdDownload(
//                                     jdFileName,
//                                     e
//                                   )
//                                 }
//                                 className={`p-1 rounded ${
//                                   jdFileName
//                                     ? 'hover:bg-blue-50 hover:text-blue-700'
//                                     : 'text-gray-300 cursor-not-allowed'
//                                 }`}
//                                 disabled={!jdFileName}
//                               >
//                                 <DownloadOutlined />
//                               </button>
//                             </Tooltip>
//                           </div>
//                         </div>
//                       </Td>

//                       <Td>
//                         <div className="flex items-center justify-between gap-2 min-h-[44px]">
//                           <div className="flex flex-col leading-tight">
//                             <span className="font-medium text-gray-900 whitespace-nowrap">
//                               {candidateName}
//                             </span>
//                             {empId ? (
//                               <span className="text-xs text-gray-500 whitespace-nowrap">
//                                 ({empId})
//                               </span>
//                             ) : null}
//                           </div>
//                           <div className="shrink-0 flex items-center">
//                             <Tooltip
//                               title={
//                                 cvFileName
//                                   ? `Download CV (${prettifyFilename(
//                                       cvFileName
//                                     )})`
//                                   : 'CV not available'
//                               }
//                             >
//                               <button
//                                 type="button"
//                                 onClick={(e) =>
//                                   cvFileName &&
//                                   handleCvDownload(
//                                     cvFileName,
//                                     e
//                                   )
//                                 }
//                                 className={`p-1 rounded ${
//                                   cvFileName
//                                     ? 'hover:bg-blue-50 hover:text-blue-700'
//                                     : 'text-gray-300 cursor-not-allowed'
//                                 }`}
//                                 disabled={!cvFileName}
//                               >
//                                 <DownloadOutlined />
//                               </button>
//                             </Tooltip>
//                           </div>
//                         </div>
//                       </Td>

//                       <Td>
//                         <Pill
//                           priority={
//                             p?.demand?.priority?.name ??
//                             p?.priority
//                           }
//                         />
//                       </Td>

//                       <TdWrapWithTooltip
//                         text={skillClusterText}
//                         w={180}
//                       />
//                       <TdWrapWithTooltip
//                         text={primarySkillsText}
//                         w={220}
//                       />
//                       <TdWrapWithTooltip
//                         text={secondarySkillsText}
//                         w={220}
//                       />

//                       <Td>{p?.demand?.lob?.name || '-'}</Td>
//                       <Td>{p?.demand?.hbu?.name || '-'}</Td>

//                       <Td>{demandLocationNamesText(p)}</Td>

//                       <Td>
//                         {nameOf(p?.profile?.externalInternal) || '-'}
//                       </Td>
//                       <Td>
//                         {p?.demand?.hiringManager?.name ?? '-'}
//                       </Td>

//                       <Td>{displayDate(attachedDate) || '-'}</Td>

//                       <Td>
//                         {!isEdit ? (
//                           displayDate(p?.profileSharedDate) || '-'
//                         ) : (
//                           <DatePicker
//                             allowClear
//                             value={toDayjs(
//                               editDraft.profileSharedDate
//                             )}
//                             format={BACKEND_FMT}
//                             onChange={(d) =>
//                               setEditDraft((x) => ({
//                                 ...x,
//                                 profileSharedDate: d
//                                   ? d.format(BACKEND_FMT)
//                                   : '',
//                               }))
//                             }
//                             size="small"
//                           />
//                         )}
//                       </Td>

//                       <Td>
//                         {!isEdit ? (
//                           displayDate(p?.interviewDate) || '-'
//                         ) : (
//                           <DatePicker
//                             allowClear
//                             value={toDayjs(
//                               editDraft.interviewDate
//                             )}
//                             format={BACKEND_FMT}
//                             onChange={(d) =>
//                               setEditDraft((x) => ({
//                                 ...x,
//                                 interviewDate: d
//                                   ? d.format(BACKEND_FMT)
//                                   : '',
//                               }))
//                             }
//                             size="small"
//                           />
//                         )}
//                       </Td>

//                       <Td>
//                         {!isEdit ? (
//                           displayDate(p?.decisionDate) || '-'
//                         ) : (
//                           <DatePicker
//                             allowClear
//                             value={toDayjs(
//                               editDraft.decisionDate
//                             )}
//                             format={BACKEND_FMT}
//                             onChange={(d) =>
//                               setEditDraft((x) => ({
//                                 ...x,
//                                 decisionDate: d
//                                   ? d.format(BACKEND_FMT)
//                                   : '',
//                               }))
//                             }
//                             size="small"
//                           />
//                         )}
//                       </Td>

//                       {/* FINAL REMAINING STATUS COLUMN */}
//                       <Td>
//                         {!isEdit ? (
//                           p?.profileTrackerStatus?.name ?? '-'
//                         ) : (
//                           <select
//                             className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
//                             value={String(
//                               editDraft.statusId ?? ''
//                             )}
//                             onChange={(e) =>
//                               setEditDraft((d) => ({
//                                 ...d,
//                                 statusId: e.target.value,
//                               }))
//                             }
//                           >
//                             <option value="">-</option>
//                             {dd.profileTrackerStatuses.map(
//                               (o) => (
//                                 <option
//                                   key={o.id}
//                                   value={o.id}
//                                 >
//                                   {o.name}
//                                 </option>
//                               )
//                             )}
//                           </select>
//                         )}
//                       </Td>

//                       <Td>{formatAging(aging)}</Td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="mt-3 flex items-center justify-end">
//           <Pagination
//             current={page + 1}
//             pageSize={size}
//             total={total}
//             showSizeChanger
//             pageSizeOptions={[10, 20, 50, 100]}
//             onChange={onPageChange}
//             onShowSizeChange={onShowSizeChange}
//             showTotal={(t, range) =>
//               `${range[0]}-${range[1]} of ${t}`
//             }
//           />
//         </div>
//       </div>
//     </Layout>
//   );
// }

// ---------------------------------------------------------------
import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker, message, Tooltip, Pagination } from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DownloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import Layout from '../../Layout';

import {
  listProfileTracker,
  updateProfileTracker,
  getProfileTrackerDropdowns,
  searchProfileTracker,
} from '../../api/Trackers/tracker';

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
const nameOf = (obj) =>
  obj && typeof obj === 'object' ? obj.name ?? '' : obj ?? '';
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
  const base =
    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold';
  if (p === 'P1')
    return (
      <span
        className={base}
        style={{
          background: '#E6FFFA',
          color: '#065F46',
          border: '1px solid #99F6E4',
        }}
      >
        P1
      </span>
    );
  if (p === 'P2')
    return (
      <span
        className={base}
        style={{
          background: '#FFF7ED',
          color: '#92400E',
          border: '1px solid #FED7AA',
        }}
      >
        P2
      </span>
    );
  if (p === 'P3')
    return (
      <span
        className={base}
        style={{
          background: '#FEF2F2',
          color: '#991B1B',
          border: '1px solid #FECACA',
        }}
      >
        P3
      </span>
    );
  return (
    <span
      className={base}
      style={{
        background: '#EDF2F7',
        color: '#2D3748',
        border: '1px solid #CBD5E0',
      }}
    >
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
  return (
    <td className="px-3 py-2 text-sm text-gray-800 whitespace-nowrap border-b border-gray-100 align-top">
      {children}
    </td>
  );
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
    (typeof value === 'string'
      ? dayjs(value, BACKEND_FMT).toDate()
      : null);
  if (!d) return String(value);
  return dayjs(d).format(BACKEND_FMT);
}
function getAttachedDate(row) {
  return (
    row?.attachedDate ??
    row?.dateAttached ??
    row?.profileAttachedDate ??
    null
  );
}
function getDemandCreationDate(row) {
  // Try common keys; fallback to demandReceivedDate if creation date not present
  return (
    row?.demand?.demandCreationDate ||
    row?.demand?.createdDate ||
    row?.demand?.demandReceivedDate ||
    null
  );
}
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
  const extPart = m ? m[2] : '';
  let n = namePart;
  n = n.replace(/[ \t]+/g, '_');
  n = n.replace(/^(?:rr|profile|cv|jd|demand)[-_]?\d*[-_]?/i, '');
  n = n.replace(/^\d+[-_]?/, '');
  n = n.replace(/([_-])\d{8}$/, '');
  n = n.replace(/([_-])\d{8}([_-])\d{6}$/, '');
  n = n.replace(/[-_]{2,}/g, '_').replace(/^[-_]+|[-_]+$/g, '');
  return `${n || base}${extPart}`;
}
function formatAging(aging) {
  if (!Number.isFinite(aging)) return '-';
  return `${aging}d`;
}
function getJdFileName(row) {
  const d = row?.demand ?? {};
  return (
    d.jdFileName ||
    d.jdFile ||
    d.jd ||
    d.jobDescriptionFileName ||
    d.jobDescription ||
    d.fileName ||
    null
  );
}
function getCvFileName(row) {
  const prof = row?.profile ?? {};
  return (
    prof.cvFileName ||
    prof.cv ||
    prof.resumeFileName ||
    prof.resume ||
    prof.fileName ||
    null
  );
}
function demandLocationNamesText(row) {
  const d = row?.demand ?? {};
  if (Array.isArray(d?.demandLocations) && d.demandLocations.length) {
    return d.demandLocations.map(nameOf).join(', ');
  }
  return nameOf(d?.location) || nameOf(row?.profile?.location) || '-';
}

/* ---------- click handlers ---------- */
async function handleJdDownload(fileName, e) {
  e?.stopPropagation?.();
  if (!fileName) return;
  const hide = message.loading('Downloading JD…', 0);
  try {
    await downloadDemandJDByFileName(fileName);
  } catch (err) {
    message.error(
      err?.response?.data?.message || 'Failed to download JD'
    );
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
    message.error(
      err?.response?.data?.message || 'Failed to download CV'
    );
  } finally {
    hide();
  }
}

/* ===================== FILTER & PAGINATION ===================== */
const DEFAULT_FILTERS = {
  demandNumber: '',
  candidateName: '',
  priorityName: '',
  skillClusterName: '',
  demandPrimarySkillNames: '',
  demandSecondarySkillNames: '',
  lobName: '',
  hbuName: '',
  externalInternalName: '',
  hiringManagerName: '',
  demandLocationNames: '',
  attachedDateFrom: '',
  attachedDateTo: '',
  profileSharedDateFrom: '',
  profileSharedDateTo: '',
  interviewDateFrom: '',
  interviewDateTo: '',
  decisionDateFrom: '',
  decisionDateTo: '',
  profileTrackerStatusId: '',
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

const splitNames = (v) =>
  String(v ?? '')
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateStr(v) {
  const s = String(v ?? '').trim();
  return DATE_RE.test(s) && dayjs(s, BACKEND_FMT, true).isValid();
}

function sanitizeDateInput(v) {
  return String(v ?? '')
    .replace(/[^\d-]/g, '')
    .slice(0, 10);
}

function buildFilterPayload(f, dd) {
  const payload = {};

  if (f.demandNumber && /^\d+$/.test(String(f.demandNumber).trim())) {
    payload.demandNumber = Number(String(f.demandNumber).trim());
  }

  if (f.priorityName) payload.priorityName = f.priorityName;
  if (f.skillClusterName) payload.skillClusterName = f.skillClusterName;
  if (f.lobName) payload.lobName = f.lobName;
  if (f.hbuName) payload.hbuName = f.hbuName;
  if (f.externalInternalName) payload.externalInternalName = f.externalInternalName;
  if (f.hiringManagerName) payload.hiringManagerName = f.hiringManagerName;

  const prim = splitNames(f.demandPrimarySkillNames);
  if (prim.length) payload.demandPrimarySkillNames = prim;

  const sec = splitNames(f.demandSecondarySkillNames);
  if (sec.length) payload.demandSecondarySkillNames = sec;

  const loc = splitNames(f.demandLocationNames);
  if (loc.length) payload.demandLocationNames = loc;

  if (f.candidateName) payload.candidateName = f.candidateName;

  if (f.profileTrackerStatusId) {
    const found = dd.profileTrackerStatuses.find(
      (x) => String(x.id) === String(f.profileTrackerStatusId)
    );
    if (found?.name) payload.profileTrackerStatusName = found.name;
  }

  const passDate = (k) => {
    const raw = String(f[k] ?? '').trim();
    if (isValidDateStr(raw)) payload[k] = raw;
  };

  [
    'profileSharedDateFrom',
    'profileSharedDateTo',
    'interviewDateFrom',
    'interviewDateTo',
    'attachedDateFrom',
    'attachedDateTo',
    'decisionDateFrom',
    'decisionDateTo',
  ].forEach(passDate);

  const aMin = f.agingMin !== '' ? Number(f.agingMin) : null;
  const aMax = f.agingMax !== '' ? Number(f.agingMax) : null;

  if ((aMin !== null && Number.isFinite(aMin)) || (aMax !== null && Number.isFinite(aMax))) {
    const today = dayjs();
    const from = Number.isFinite(aMax)
      ? today.subtract(aMax, 'day').format(BACKEND_FMT)
      : null;
    const to = Number.isFinite(aMin)
      ? today.subtract(aMin, 'day').format(BACKEND_FMT)
      : null;
    if (from) payload.attachedDateFrom = from;
    if (to) payload.attachedDateTo = to;
  }

  return payload;
}

/* ---------- Header controls ---------- */

function HeaderWithSearch({
  label,
  keyName,
  filters,
  setFilters,
  openSearch,
  toggle,
}) {
  return (
    <div className="flex flex-col items-start justify-center gap-1">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <SearchOutlined
          className={`text-gray-400 text-xs cursor-pointer ${
            openSearch[keyName] ? 'text-blue-600' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggle(keyName);
          }}
          title="Search"
        />
      </div>
      {openSearch[keyName] && (
        <input
          className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
          placeholder={`Search ${label}`}
          value={filters[keyName] ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              [keyName]: e.target.value,
            }))
          }
          onClick={(e) => e.stopPropagation()}
          style={{ width: 140 }}
        />
      )}
    </div>
  );
}

function HeaderDateRange({
  keyFrom,
  keyTo,
  label,
  filters,
  setFilters,
  openSearch,
  toggle,
}) {
  const openKey = `${keyFrom}__${keyTo}`;
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <SearchOutlined
          className={`text-gray-400 text-xs cursor-pointer ${
            openSearch[openKey] ? 'text-blue-600' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggle(openKey);
          }}
          title="Search"
        />
      </div>
      {openSearch[openKey] && (
        <div className="flex items-center gap-1">
          <input
            className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
            placeholder="From (YYYY-MM-DD)"
            value={filters[keyFrom] ?? ''}
            onChange={(e) => {
              const v = sanitizeDateInput(e.target.value);
              setFilters((f) => ({
                ...f,
                [keyFrom]: v,
              }));
            }}
            style={{ width: 120 }}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
            placeholder="To (YYYY-MM-DD)"
            value={filters[keyTo] ?? ''}
            onChange={(e) => {
              const v = sanitizeDateInput(e.target.value);
              setFilters((f) => ({
                ...f,
                [keyTo]: v,
              }));
            }}
            style={{ width: 120 }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function HeaderSelect({
  label,
  keyName,
  options,
  getLabel = (o) => o.name,
  getValue = (o) => o.id,
  filters,
  setFilters,
  openSearch,
  toggle,
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <SearchOutlined
          className={`text-gray-400 text-xs cursor-pointer ${
            openSearch[keyName] ? 'text-blue-600' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggle(keyName);
          }}
          title="Search"
        />
      </div>
      {openSearch[keyName] && (
        <select
          className="h-7 px-2 text-xs rounded border border-gray-300 bg-white"
          value={filters[keyName] ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              [keyName]: e.target.value,
            }))
          }
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

function HeaderNumberRange({
  keyMin,
  keyMax,
  label,
  filters,
  setFilters,
  openSearch,
  toggle,
}) {
  const openKey = `${keyMin}__${keyMax}`;
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <SearchOutlined
          className={`text-gray-400 text-xs cursor-pointer ${
            openSearch[openKey] ? 'text-blue-600' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggle(openKey);
          }}
          title="Search"
        />
      </div>
      {openSearch[openKey] && (
        <div className="flex items-center gap-1">
          <input
            className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
            placeholder="Min"
            value={filters[keyMin] ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                [keyMin]: e.target.value,
              }))
            }
            style={{ width: 70 }}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            className="h-7 px-2 text-xs rounded border border-gray-300 outline-none"
            placeholder="Max"
            value={filters[keyMax] ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                [keyMax]: e.target.value,
              }))
            }
            style={{ width: 70 }}
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
  const [editErrors, setEditErrors] = useState({
    attachedDate: '',
    profileSharedDate: '',
    interviewDate: '',
    decisionDate: '',
  });

  const [dd, setDd] = useState({
    profileTrackerStatuses: [],
  });

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [openSearch, setOpenSearch] = useState({});
  const toggleSearch = (key) =>
    setOpenSearch((s) => ({ ...s, [key]: !s[key] }));
  const debouncedFilters = useDebounced(filters);

  const filterPayload = useMemo(
    () => buildFilterPayload(debouncedFilters, dd),
    [debouncedFilters, dd]
  );

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfileTrackerDropdowns();
        setDd({
          profileTrackerStatuses:
            res?.profileTrackerStatuses ?? [],
        });
      } catch {
        setDd({
          profileTrackerStatuses: [],
        });
      }
    })();
  }, []);

  const load = async (pg = page, sz = size, payload = filterPayload) => {
    try {
      setLoading(true);
      setApiErr(null);

      const hasFilter =
        payload && Object.keys(payload).length > 0;

      const resp = hasFilter
        ? await searchProfileTracker({
            filter: payload,
            page: pg,
            size: sz,
          })
        : await listProfileTracker({
            page: pg,
            size: sz,
          });

      const items = Array.isArray(resp?.items)
        ? resp.items
        : [];
      const totalElements = Number(
        resp?.totalElements ?? items.length ?? 0
      );

      setRows(items);
      setTotal(totalElements);

      setPage(pg);
      setSize(sz);
    } catch (e) {
      setApiErr(
        e?.response?.data?.message ||
          e?.message ||
          'Failed to load tracker'
      );
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0, size, filterPayload);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    load(0, size, filterPayload);
  }, [filterPayload]);

  const onPageChange = (current, pageSize) => {
    load(current - 1, pageSize, filterPayload);
  };

  const onShowSizeChange = (current, pageSize) => {
    load(0, pageSize, filterPayload);
  };

  /* ====== DATE ORDER VALIDATION: demandCreation ≤ attached ≤ shared ≤ interview ≤ decision (all inclusive) ====== */
  const parseYmd = (s) => {
    const t = String(s || '').trim();
    if (!t) return null;
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  function validateTrackerDates(draft, minDate, attachedDateValue) {
    const e = {
      attachedDate: '',
      profileSharedDate: '',
      interviewDate: '',
      decisionDate: '',
    };

    const dAttached = parseYmd(attachedDateValue);
    const dShared = parseYmd(draft?.profileSharedDate);
    const dInterview = parseYmd(draft?.interviewDate);
    const dDecision = parseYmd(draft?.decisionDate);

    const min = parseYmd(minDate); // demand creation date (or received date fallback)

    const lte = (a, b) => (a && b ? a.getTime() <= b.getTime() : true); // allow equal / ignore if missing

    const minText =
      typeof minDate === 'string'
        ? minDate
        : min
        ? dayjs(min).format(BACKEND_FMT)
        : '';

    // Rule 1: Everything ≥ Demand Creation Date (inclusive)
    if (min) {
      if (dAttached && !lte(min, dAttached)) {
        e.attachedDate = `Attached Date must be ≥ Demand Creation Date (${minText})`;
      }
      if (dShared && !lte(min, dShared)) {
        e.profileSharedDate = `Must be ≥ Demand Creation Date (${minText})`;
      }
      if (dInterview && !lte(min, dInterview)) {
        e.interviewDate = `Must be ≥ Demand Creation Date (${minText})`;
      }
      if (dDecision && !lte(min, dDecision)) {
        e.decisionDate = `Must be ≥ Demand Creation Date (${minText})`;
      }
    }

    // Rule 2: attached ≤ shared ≤ interview ≤ decision (inclusive)
    if (dAttached && dShared && !lte(dAttached, dShared)) {
      e.profileSharedDate = e.profileSharedDate || 'Profile Shared must be ≥ Attached Date';
    }
    if (dShared && dInterview && !lte(dShared, dInterview)) {
      e.interviewDate = e.interviewDate || 'Interview must be ≥ Profile Shared';
    }
    if (dInterview && dDecision && !lte(dInterview, dDecision)) {
      e.decisionDate = e.decisionDate || 'Decision must be ≥ Interview Date';
    }

    const valid =
      !e.attachedDate &&
      !e.profileSharedDate &&
      !e.interviewDate &&
      !e.decisionDate;

    return { valid, errors: e };
  }

  // ✅ keep original values to detect true changes
  const onEdit = (row) => {
    const original = {
      statusId: row?.profileTrackerStatus?.id ?? null,
      profileSharedDate: row?.profileSharedDate
        ? displayDate(row.profileSharedDate)
        : '',
      interviewDate: row?.interviewDate
        ? displayDate(row.interviewDate)
        : '',
      decisionDate: row?.decisionDate
        ? displayDate(row.decisionDate)
        : '',
    };

    setEditId(getRowId(row));
    setEditDraft({
      statusId: original.statusId ?? '',
      profileSharedDate: original.profileSharedDate,
      interviewDate: original.interviewDate,
      decisionDate: original.decisionDate,
      __original: original, // snapshot for diff
    });
    setEditErrors({
      attachedDate: '',
      profileSharedDate: '',
      interviewDate: '',
      decisionDate: '',
    });
  };

  const onCancel = () => {
    setEditId(null);
    setEditDraft({});
    setEditErrors({
      attachedDate: '',
      profileSharedDate: '',
      interviewDate: '',
      decisionDate: '',
    });
  };

  //  send only changed fields; block if invalid ordering
  const onSave = async (row) => {
    const demandCreationStr =
      getDemandCreationDate(row) ? displayDate(getDemandCreationDate(row)) : '';
    const attachedDateStr = getAttachedDate(row) ? displayDate(getAttachedDate(row)) : '';

    // Validate full chain first
    const { valid, errors } = validateTrackerDates(editDraft, demandCreationStr, attachedDateStr);
    if (!valid) {
      setEditErrors(errors);
      message.error(
        'Fix date rules: demandCreation ≤ attached ≤ shared ≤ interview ≤ decision (all inclusive)'
      );
      return;
    }

    const id = getRowId(row);
    if (id == null) {
      message.error('Missing row id');
      return;
    }

    const normId = (v) =>
      v === '' || v === null || v === undefined ? null : Number(v);

    const orig = editDraft.__original || {};
    const payload = {};

    // Dates: include only if changed (string compare on YYYY-MM-DD)
    if (
      editDraft.profileSharedDate &&
      editDraft.profileSharedDate !== (orig.profileSharedDate || '')
    ) {
      payload.profileSharedDate = dayjs(editDraft.profileSharedDate).format(BACKEND_FMT);
    }
    if (
      editDraft.interviewDate &&
      editDraft.interviewDate !== (orig.interviewDate || '')
    ) {
      payload.interviewDate = dayjs(editDraft.interviewDate).format(BACKEND_FMT);
    }
    if (
      editDraft.decisionDate &&
      editDraft.decisionDate !== (orig.decisionDate || '')
    ) {
      payload.decisionDate = dayjs(editDraft.decisionDate).format(BACKEND_FMT);
    }

    // Status: only if changed vs original
    const curStatusId = normId(editDraft.statusId);
    const origStatusId = normId(orig.statusId);
    if (curStatusId !== origStatusId) {
      payload.profileTrackerStatusId = curStatusId;
    }

    if (Object.keys(payload).length === 0) {
      message.warning('No changes to save');
      return;
    }

    try {
      await updateProfileTracker({ id, payload });

      // Pull fresh data so we see backend’s derived status
      await load(page, size, filterPayload);

      message.success('Row updated');
      onCancel();
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          'Failed to update'
      );
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl md:text-2xl font-bold tracking-tight text-gray-900">
          Profile Tracker
        </h2>

        {loading && (
          <div className="text-sm text-gray-700 my-2">
            Loading…
          </div>
        )}
        {apiErr && (
          <div className="text-sm text-red-600 my-2">
            Error: {apiErr}
          </div>
        )}

        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="max-w-[1600px] w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <Th w={60}>EDIT</Th>

                <Th w={180}>
                  <HeaderWithSearch
                    label="Demand Number"
                    keyName="demandNumber"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th>
                  <HeaderWithSearch
                    label="Candidate Name"
                    keyName="candidateName"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th>
                  <HeaderWithSearch
                    label="Priority"
                    keyName="priorityName"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th w={180}>
                  <HeaderWithSearch
                    label="Skill Cluster"
                    keyName="skillClusterName"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th w={220}>
                  <HeaderWithSearch
                    label="Primary Skill"
                    keyName="demandPrimarySkillNames"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th w={220}>
                  <HeaderWithSearch
                    label="Secondary Skill"
                    keyName="demandSecondarySkillNames"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th>
                  <HeaderWithSearch
                    label="LOB"
                    keyName="lobName"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th>
                  <HeaderWithSearch
                    label="HBU"
                    keyName="hbuName"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th>
                  <HeaderWithSearch
                    label="Location"
                    keyName="demandLocationNames"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th>
                  <HeaderWithSearch
                    label="External/Internal"
                    keyName="externalInternalName"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th>
                  <HeaderWithSearch
                    label="Hiring Manager"
                    keyName="hiringManagerName"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th>
                  <HeaderDateRange
                    label="Attached Date"
                    keyFrom="attachedDateFrom"
                    keyTo="attachedDateTo"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th>
                  <HeaderDateRange
                    label="Profile Shared Date"
                    keyFrom="profileSharedDateFrom"
                    keyTo="profileSharedDateTo"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th>
                  <HeaderDateRange
                    label="Interview Date"
                    keyFrom="interviewDateFrom"
                    keyTo="interviewDateTo"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                <Th>
                  <HeaderDateRange
                    label="Decision Date"
                    keyFrom="decisionDateFrom"
                    keyTo="decisionDateTo"
                    filters={filters}
                    setFilters={setFilters}
                    openSearch={openSearch}
                    toggle={toggleSearch}
                  />
                </Th>

                {/* ONLY ONE STATUS SELECT REMAINS */}
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
              {!rows?.length && !loading ? (
                <tr>
                  <td
                    colSpan={20}
                    className="p-3 text-sm text-gray-500"
                  >
                    No data found.
                  </td>
                </tr>
              ) : (
                rows.map((p) => {
                  const rowId = getRowId(p);
                  const isEdit = editId === rowId;

                  const demandCode =
                    p?.demand?.displayDemandId ||
                    `${p?.demand?.lob?.name ?? ''}-${p?.demand?.demandId}`;

                  const skillClusterText =
                    p?.demand?.skillCluster?.name ?? '-';
                  const primarySkillsText = Array.isArray(
                    p?.demand?.primarySkills
                  )
                    ? p.demand.primarySkills
                        .map(nameOf)
                        .join(', ')
                    : p?.demand?.primarySkills ?? '-';

                  const secondarySkillsText = Array.isArray(
                    p?.demand?.secondarySkills
                  )
                    ? p.demand.secondarySkills
                        .map(nameOf)
                        .join(', ')
                    : p?.demand?.secondarySkills ?? '-';

                  const attachedDate = getAttachedDate(p);
                  const aging = calculateDaysFrom(attachedDate);

                  const candidateName =
                    p?.profile?.candidateName ?? '-';
                  const empId = p?.profile?.empId;

                  const jdFileName = getJdFileName(p);
                  const cvFileName = getCvFileName(p);

                  // --- BASE DATES FOR VALIDATION (inside rows.map) ---
                  const demandCreationStr = getDemandCreationDate(p)
                    ? displayDate(getDemandCreationDate(p))
                    : '';
                  const attachedDateStr = attachedDate ? displayDate(attachedDate) : '';

                  return (
                    <tr key={rowId} className="even:bg-gray-50/50">
                      <Td>
                        {!isEdit ? (
                          <button
                            type="button"
                            onClick={() => onEdit(p)}
                            className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                          >
                            <EditOutlined /> Edit
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onSave(p)}
                              className="inline-flex items-center gap-1 rounded border border-green-600 text-green-700 px-2 py-1 text-xs hover:bg-green-50"
                            >
                              <SaveOutlined /> Save
                            </button>
                            <button
                              type="button"
                              onClick={onCancel}
                              className="inline-flex items-center gap-1 rounded border border-gray-400 px-2 py-1 text-xs hover:bg-gray-100"
                            >
                              <CloseOutlined /> Cancel
                            </button>
                          </div>
                        )}
                      </Td>

                      <Td>
                        <div className="flex items-center justify-between gap-2 min-h-[44px]">
                          <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-600 px-2 py-0.5 text-xs font-semibold">
                            {demandCode || '-'}
                          </span>
                          <div className="shrink-0 flex items-center">
                            <Tooltip
                              title={
                                jdFileName
                                  ? `Download JD (${prettifyFilename(
                                      jdFileName
                                    )})`
                                  : 'JD not available'
                              }
                            >
                              <button
                                type="button"
                                onClick={(e) =>
                                  jdFileName &&
                                  handleJdDownload(
                                    jdFileName,
                                    e
                                  )
                                }
                                className={`p-1 rounded ${
                                  jdFileName
                                    ? 'hover:bg-blue-50 hover:text-blue-700'
                                    : 'text-gray-300 cursor-not-allowed'
                                }`}
                                disabled={!jdFileName}
                              >
                                <DownloadOutlined />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </Td>

                      <Td>
                        <div className="flex items-center justify-between gap-2 min-h-[44px]">
                          <div className="flex flex-col leading-tight">
                            <span className="font-medium text-gray-900 whitespace-nowrap">
                              {candidateName}
                            </span>
                            {empId ? (
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                ({empId})
                              </span>
                            ) : null}
                          </div>
                          <div className="shrink-0 flex items-center">
                            <Tooltip
                              title={
                                cvFileName
                                  ? `Download CV (${prettifyFilename(
                                      cvFileName
                                    )})`
                                  : 'CV not available'
                              }
                            >
                              <button
                                type="button"
                                onClick={(e) =>
                                  cvFileName &&
                                  handleCvDownload(
                                    cvFileName,
                                    e
                                  )
                                }
                                className={`p-1 rounded ${
                                  cvFileName
                                    ? 'hover:bg-blue-50 hover:text-blue-700'
                                    : 'text-gray-300 cursor-not-allowed'
                                }`}
                                disabled={!cvFileName}
                              >
                                <DownloadOutlined />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </Td>

                      <Td>
                        <Pill
                          priority={
                            p?.demand?.priority?.name ??
                            p?.priority
                          }
                        />
                      </Td>

                      <TdWrapWithTooltip
                        text={skillClusterText}
                        w={180}
                      />
                      <TdWrapWithTooltip
                        text={primarySkillsText}
                        w={220}
                      />
                      <TdWrapWithTooltip
                        text={secondarySkillsText}
                        w={220}
                      />

                      <Td>{p?.demand?.lob?.name || '-'}</Td>
                      <Td>{p?.demand?.hbu?.name || '-'}</Td>

                      <Td>{demandLocationNamesText(p)}</Td>

                      <Td>
                        {nameOf(p?.profile?.externalInternal) || '-'}
                      </Td>
                      <Td>
                        {p?.demand?.hiringManager?.name ?? '-'}
                      </Td>

                      {/* Attached Date + (show rule error in edit mode if any) */}
                      <Td>
                        <div className="flex flex-col">
                          <span>{displayDate(attachedDate) || '-'}</span>
                          {isEdit && editErrors.attachedDate ? (
                            <div className="text-xs text-red-600 mt-1 leading-tight whitespace-normal">
                              {editErrors.attachedDate}
                            </div>
                          ) : null}
                        </div>
                      </Td>

                      {/* Profile Shared Date */}
                      <Td>
                        {!isEdit ? (
                          displayDate(p?.profileSharedDate) || '-'
                        ) : (
                          <>
                            <DatePicker
                              allowClear
                              value={toDayjs(
                                editDraft.profileSharedDate
                              )}
                              format={BACKEND_FMT}
                              onChange={(d) =>
                                setEditDraft((x) => {
                                  const next = {
                                    ...x,
                                    profileSharedDate: d
                                      ? d.format(BACKEND_FMT)
                                      : '',
                                  };
                                  const { errors } = validateTrackerDates(
                                    next,
                                    demandCreationStr,
                                    attachedDateStr
                                  );
                                  setEditErrors(errors);
                                  return next;
                                })
                              }
                              size="small"
                            />
                            {editErrors.profileSharedDate ? (
                              <div className="text-xs text-red-600 mt-1 leading-tight">
                                {editErrors.profileSharedDate}
                              </div>
                            ) : null}
                          </>
                        )}
                      </Td>

                      {/* Interview Date */}
                      <Td>
                        {!isEdit ? (
                          displayDate(p?.interviewDate) || '-'
                        ) : (
                          <>
                            <DatePicker
                              allowClear
                              value={toDayjs(
                                editDraft.interviewDate
                              )}
                              format={BACKEND_FMT}
                              onChange={(d) =>
                                setEditDraft((x) => {
                                  const next = {
                                    ...x,
                                    interviewDate: d
                                      ? d.format(BACKEND_FMT)
                                      : '',
                                  };
                                  const { errors } = validateTrackerDates(
                                    next,
                                    demandCreationStr,
                                    attachedDateStr
                                  );
                                  setEditErrors(errors);
                                  return next;
                                })
                              }
                              size="small"
                            />
                            {editErrors.interviewDate ? (
                              <div className="text-xs text-red-600 mt-1 leading-tight">
                                {editErrors.interviewDate}
                              </div>
                            ) : null}
                          </>
                        )}
                      </Td>

                      {/* Decision Date */}
                      <Td>
                        {!isEdit ? (
                          displayDate(p?.decisionDate) || '-'
                        ) : (
                          <>
                            <DatePicker
                              allowClear
                              value={toDayjs(
                                editDraft.decisionDate
                              )}
                              format={BACKEND_FMT}
                              onChange={(d) =>
                                setEditDraft((x) => {
                                  const next = {
                                    ...x,
                                    decisionDate: d
                                      ? d.format(BACKEND_FMT)
                                      : '',
                                  };
                                  const { errors } = validateTrackerDates(
                                    next,
                                    demandCreationStr,
                                    attachedDateStr
                                  );
                                  setEditErrors(errors);
                                  return next;
                                })
                              }
                              size="small"
                            />
                            {editErrors.decisionDate ? (
                              <div className="text-xs text-red-600 mt-1 leading-tight">
                                {editErrors.decisionDate}
                              </div>
                            ) : null}
                          </>
                        )}
                      </Td>

                      {/* FINAL REMAINING STATUS COLUMN */}
                      <Td>
                        {!isEdit ? (
                          p?.profileTrackerStatus?.name ?? '-'
                        ) : (
                          <select
                            className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
                            value={String(
                              editDraft.statusId ?? ''
                            )}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                statusId: e.target.value,
                              }))
                            }
                          >
                            <option value="">-</option>
                            {dd.profileTrackerStatuses.map(
                              (o) => (
                                <option
                                  key={o.id}
                                  value={o.id}
                                >
                                  {o.name}
                                </option>
                              )
                            )}
                          </select>
                        )}
                      </Td>

                      <Td>{formatAging(aging)}</Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-end">
          <Pagination
            current={page + 1}
            pageSize={size}
            total={total}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={onPageChange}
            onShowSizeChange={onShowSizeChange}
            showTotal={(t, range) =>
              `${range[0]}-${range[1]} of ${t}`
            }
          />
        </div>
      </div>
    </Layout>
  );
}
