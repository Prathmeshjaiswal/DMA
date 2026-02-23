import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker, message, Tooltip, Pagination, Input, Button } from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  SearchOutlined,
  CloseCircleFilled,
} from '@ant-design/icons';
import Layout from '../../Layout';
import {
  listProfileTracker,
  updateProfileTracker,
  getDropDownData,
  searchProfileTracker,
} from "../../api/Trackers/tracker";

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
  return (
    <td className="px-3 py-2 text-sm text-gray-800 whitespace-nowrap border-b border-gray-100 align-top">
      {children}
    </td>
  );
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

export default function ProfileTracker() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  // Dropdowns (supported by /profile-track/dropdowns)
  const [dd, setDd] = useState({
//     evaluationStatuses: [],
    profileTrackerStatuses: [],
  });

  // Pagination (server-side; API is 0-based; AntD UI is 1-based)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Per-column search UI visibility
  const [filterOpen, setFilterOpen] = useState({
    demandCode: false,
    candidateName: false,
    empId: false,
    priority: false,
    lob: false,
    hbu: false,
    location: false,
    profileType: false,
    hiringManager: false,
//     evaluationStatus: false,
    status: false,
  });

  // Per-column filter values
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
//     evaluationStatus: '', // name
    status: '', // name
  });

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v != null && String(v).trim() !== ''),
    [filters]
  );

  // Build the single 'q' string from active column filters (space-joined values)
  const buildQueryFromFilters = () => {
    const values = [];
    if (filters.demandCode) values.push(filters.demandCode);
    if (filters.candidateName) values.push(filters.candidateName);
    if (filters.empId) values.push(filters.empId);
    if (filters.priority) values.push(filters.priority);
    if (filters.lob) values.push(filters.lob);
    if (filters.hbu) values.push(filters.hbu);
    if (filters.location) values.push(filters.location);
    if (filters.profileType) values.push(filters.profileType);
    if (filters.hiringManager) values.push(filters.hiringManager);
//     if (filters.evaluationStatus) values.push(filters.evaluationStatus);
    if (filters.status) values.push(filters.status);
    return values.join(' ').trim();
  };

  // Dropdowns
  useEffect(() => {
    (async () => {
      try {
        const res = await getDropDownData();
        setDd({
//           evaluationStatuses: res?.evaluationStatuses ?? [],
          profileTrackerStatuses: res?.profileTrackerStatuses ?? [],
        });
      } catch {
        setDd({
//           evaluationStatuses: [],
          profileTrackerStatuses: [],
        });
      }
    })();
  }, []);

  // Load rows (list or search) with server pagination
  const load = async ({ page: p = page, size: s = size } = {}) => {
    try {
      setLoading(true);
      setApiErr(null);

      let resp;
      if (hasActiveFilters) {
        const q = buildQueryFromFilters();
        resp = await searchProfileTracker({ q, page: p, size: s });
      } else {
        resp = await listProfileTracker(p, s);
      }

      const items = Array.isArray(resp?.items) ? resp.items : [];
      setRows(items);

      const te = Number.isFinite(resp?.totalElements) ? resp.totalElements : (items?.length || 0);
      setTotalElements(te);

      // Prefer response paging if present, else keep requested
      setPage(Number.isFinite(resp?.page) ? resp.page : p);
      setSize(Number.isFinite(resp?.size) ? resp.size : s);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load tracker';
      setApiErr(msg);
      setRows([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    load({ page: 0, size });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pagination change
  const onPageChange = (current, pageSize) => {
    const newPage = current - 1;
    const newSize = pageSize;
    setPage(newPage);
    setSize(newSize);
    load({ page: newPage, size: newSize });
  };

  // Open/close per-column filter inputs
  const toggleFilterOpen = (key) => {
    setFilterOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const clearFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
    setFilterOpen((prev) => ({ ...prev, [key]: false }));
    // Reset to first page on clearing a filter
    load({ page: 0, size });
  };
  // Apply filters (Enter in input or change in select)
  const applyFilters = () => {
    load({ page: 0, size });
  };

  // Editing
  const onEdit = (row) => {
    setEditId(row.id ?? row.key ?? null);
    setEditDraft({
//       evaluationStatusId: row?.evaluationStatus?.id ?? '',
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
    const id = row.id ?? row.key;
    if (id == null) {
      message.error('Missing row id');
      return;
    }

    const payload = {
      profileSharedDate: editDraft.profileSharedDate ? dayjs(editDraft.profileSharedDate).format(BACKEND_FMT) : null,
      interviewDate: editDraft.interviewDate ? dayjs(editDraft.interviewDate).format(BACKEND_FMT) : null,
      decisionDate: editDraft.decisionDate ? dayjs(editDraft.decisionDate).format(BACKEND_FMT) : null,
//       evaluationStatusId: editDraft.evaluationStatusId ? Number(editDraft.evaluationStatusId) : null,
      profileTrackerStatusId: editDraft.statusId ? Number(editDraft.statusId) : null,
    };

    try {
      const updated = await updateProfileTracker({ id, payload });
      // Optimistic local patch
      setRows((prev) =>
        prev.map((r) => {
          if ((r.id ?? r.key) !== id) return r;
          const next = { ...r };
          if (payload.profileSharedDate !== null) next.profileSharedDate = payload.profileSharedDate;
          if (payload.interviewDate !== null) next.interviewDate = payload.interviewDate;
          if (payload.decisionDate !== null) next.decisionDate = payload.decisionDate;

//           if (payload.evaluationStatusId) {
//             const found = dd.evaluationStatuses.find((x) => String(x.id) === String(payload.evaluationStatusId));
//             next.evaluationStatus = found ? { id: found.id, name: found.name } : next.evaluationStatus;
//           }
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

  // Header search icon + input (sticks until ✕)
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

  // Second header row to render active filter inputs
  const renderFilterRow = () => (
    <tr className="bg-gray-50">
      {/* EDIT col - no filter */}
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
              onPressEnter={applyFilters}
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
              onPressEnter={applyFilters}
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
              onPressEnter={applyFilters}
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
            <Input
              size="small"
              placeholder="P1 / P2 / P3"
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
              onPressEnter={applyFilters}
              className="w-28"
            />
            <Button size="small" type="text" icon={<CloseCircleFilled />} onClick={() => clearFilter('priority')} />
          </div>
        ) : null}
      </th>

      {/* Skill Cluster */}
      <th className="px-3 py-1 border-b border-gray-200" />
      {/* Primary Skill */}
      <th className="px-3 py-1 border-b border-gray-200" />
      {/* Secondary Skill */}
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
              onPressEnter={applyFilters}
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
              onPressEnter={applyFilters}
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
            <Input
              size="small"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
              onPressEnter={applyFilters}
              className="w-40"
            />
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
              placeholder="Internal / External"
              value={filters.profileType}
              onChange={(e) => setFilters((f) => ({ ...f, profileType: e.target.value }))}
              onPressEnter={applyFilters}
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
              onPressEnter={applyFilters}
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

{/*        */}{/* Evaluation Status */}
{/*       <th className="px-3 py-1 border-b border-gray-200"> */}
{/*         {filterOpen.evaluationStatus ? ( */}
{/*           <div className="flex items-center gap-2"> */}
{/*             <select */}
{/*               className="h-7 rounded border border-gray-300 bg-white px-2 text-xs" */}
{/*               value={filters.evaluationStatus} */}
{/*               onChange={(e) => { */}
{/*                 setFilters((f) => ({ ...f, evaluationStatus: e.target.value })); */}
{/*                 applyFilters(); */}
{/*               }} */}
{/*             > */}
{/*               <option value="">All</option> */}
{/*               {(dd.evaluationStatuses || []).map((o) => ( */}
{/*                 <option key={o.id} value={o.name}> */}
{/*                   {o.name} */}
{/*                 </option> */}
{/*               ))} */}
{/*             </select> */}
{/*             <Button size="small" type="text" icon={<CloseCircleFilled />} onClick={() => clearFilter('evaluationStatus')} /> */}
{/*           </div> */}
{/*         ) : null} */}
{/*       </th> */}

      {/* Status */}
      <th className="px-3 py-1 border-b border-gray-200">
        {filterOpen.status ? (
          <div className="flex items-center gap-2">
            <select
              className="h-7 rounded border border-gray-300 bg-white px-2 text-xs"
              value={filters.status}
              onChange={(e) => {
                setFilters((f) => ({ ...f, status: e.target.value }));
                applyFilters();
              }}
            >
              <option value="">All</option>
              {(dd.profileTrackerStatuses || []).map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name}
                </option>
              ))}
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
        <h2 className="text-2xl md:text-2xl font-bold tracking-tight text-gray-900">Profile Tracker</h2>

        {/* Status */}
        {loading && <div className="text-sm text-gray-700 my-2">Loading…</div>}
        {apiErr && <div className="text-sm text-red-600 my-2">Error: {apiErr}</div>}

        {/* Table */}
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="max-w-[1600px] w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <Th w={60}>EDIT</Th>
                <Th w={120}>
                  <FilterHeader label="Demand Id" colKey="demandCode" />
                </Th>

                {/* New order */}
                <Th><FilterHeader label="Candidate Name" colKey="candidateName" /></Th>
                <Th><FilterHeader label="Emp ID" colKey="empId" /></Th>
                <Th><FilterHeader label="Priority" colKey="priority" /></Th>

                <Th w={180}>Skill Cluster</Th>
                <Th w={220}>Primary Skill</Th>
                <Th w={220}>Secondary Skill</Th>

                <Th><FilterHeader label="LOB" colKey="lob" /></Th>
                <Th><FilterHeader label="HBU" colKey="hbu" /></Th>
                <Th><FilterHeader label="Location" colKey="location" /></Th>
                <Th><FilterHeader label="Profile Type" colKey="profileType" /></Th>
                <Th><FilterHeader label="Hiring Manager" colKey="hiringManager" /></Th>

                <Th>Attached Date</Th>
                <Th>Profile Shared Date</Th>
                <Th>Interview Date</Th>
                <Th>Decision Date</Th>
{/*                 <Th><FilterHeader label="Evaluation Status" colKey="evaluationStatus" /></Th> */}
                <Th><FilterHeader label="Status" colKey="status" /></Th>
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

                  // Demand code from backend if available, else LOB-<demandId>
                  const demandCode = p?.demand?.displayDemandId || (() => {
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

                      {/* Demand Id pill */}
                      <Td>
                        <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-600 px-2 py-0.5 text-xs font-semibold">
                          {demandCode || '-'}
                        </span>
                      </Td>

                      {/* Candidate Name */}
                      <Td>{p?.profile?.candidateName ?? '-'}</Td>

                      {/* Emp ID */}
                      <Td>{p?.profile?.empId ?? '-'}</Td>

                      {/* Priority (read-only from demand) */}
                      <Td>
                        <Pill priority={p?.demand?.priority?.name ?? p?.priority} />
                      </Td>

                      {/* Skill Cluster */}
                      <TdWrapWithTooltip text={skillClusterText} w={180} />

                      {/* Primary Skill */}
                      <TdWrapWithTooltip text={primarySkillsText} w={220} />

                      {/* Secondary Skill */}
                      <TdWrapWithTooltip text={secondarySkillsText} w={220} />

                      {/* LOB */}
                      <Td>{p?.demand?.lob?.name || '-'}</Td>

                      {/* HBU */}
                      <Td>{p?.demand?.hbu?.name || '-'}</Td>

                      {/* Location (read-only from profile) */}
                      <Td>{nameOf(p?.profile?.location) || '-'}</Td>

                      {/* Profile Type */}
                      <Td>{nameOf(p?.profile?.externalInternal) || '-'}</Td>

                      {/* Hiring Manager */}
                      <Td>{p?.demand?.hiringManager?.name ?? '-'}</Td>

                      {/* Attached Date (non-editable) */}
                      <Td>{displayDate(attachedDate) || '-'}</Td>

                      {/* Profile Shared Date (editable) */}
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

                      {/* Interview Date (editable) */}
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

                      {/* Decision Date (editable) */}
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

{/*                        */}{/* Evaluation Status (editable) */}
{/*                       <Td> */}
{/*                         {!isEdit ? ( */}
{/*                           p?.evaluationStatus?.name ?? '-' */}
{/*                         ) : ( */}
{/*                           <select */}
{/*                             className="h-8 rounded border border-gray-300 bg-white px-2 text-sm" */}
{/*                             value={String(editDraft.evaluationStatusId ?? '')} */}
{/*                             onChange={(e) => */}
{/*                               setEditDraft((d) => ({ ...d, evaluationStatusId: e.target.value })) */}
{/*                             } */}
{/*                           > */}
{/*                             <option value="">-</option> */}
{/*                             {(dd.evaluationStatuses || []).map((o) => ( */}
{/*                               <option key={o.id} value={o.id}> */}
{/*                                 {o.name} */}
{/*                               </option> */}
{/*                             ))} */}
{/*                           </select> */}
{/*                         )} */}
{/*                       </Td> */}

                      {/* Status (editable) */}
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
                            {(dd.profileTrackerStatuses || []).map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </Td>

                      {/* Aging */}
                      <Td>{Number.isFinite(aging) ? aging : '-'}.</Td>
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
            current={page + 1}
            pageSize={size}
            total={totalElements}
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
