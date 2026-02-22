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

/* ---------- demand location display helper ---------- */
function demandLocationNamesText(row) {
  const d = row?.demand ?? {};
  if (Array.isArray(d?.demandLocations) && d.demandLocations.length) {
    return d.demandLocations.map(nameOf).join(', ');
  }
  // fallback to a single demand location or profile location if present
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
/** DTO-aligned filter keys (frontend only) */
const DEFAULT_FILTERS = {
  // DTO name-aligned text inputs
  demandNumber: '',            // numeric
  candidateName: '',           // profile identity
  priorityName: '',
  skillClusterName: '',
  demandPrimarySkillNames: '', // CSV -> array
  demandSecondarySkillNames: '',

  lobName: '',
  hbuName: '',
  externalInternalName: '',
  hiringManagerName: '',

  // demand locations (CSV -> array of names for backend)
  demandLocationNames: '',

  // date ranges using exact DTO names
  attachedDateFrom: '',
  attachedDateTo: '',
  profileSharedDateFrom: '',
  profileSharedDateTo: '',
  interviewDateFrom: '',
  interviewDateTo: '',
  decisionDateFrom: '',
  decisionDateTo: '',

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

/* ====== strict date validation & input sanitization (no local filter) ====== */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/; // strict YYYY-MM-DD

function isValidDateStr(v) {
  const s = String(v ?? '').trim();
  return DATE_RE.test(s) && dayjs(s, BACKEND_FMT, true).isValid();
}

/** Keep only digits and hyphen while typing; hard cap length to 10 */
function sanitizeDateInput(v) {
  return String(v ?? '').replace(/[^\d-]/g, '').slice(0, 10);
}

/** Build DTO that exactly matches ProfileTrackerFilterRequest */
function buildFilterPayload(f, dd) {
  const payload = {};

  // direct key (number)
  if (f.demandNumber && /^\d+$/.test(String(f.demandNumber).trim())) {
    payload.demandNumber = Number(String(f.demandNumber).trim());
  }

  // demand-side names
  if (f.priorityName) payload.priorityName = f.priorityName;
  if (f.skillClusterName) payload.skillClusterName = f.skillClusterName;
  if (f.lobName) payload.lobName = f.lobName;
  if (f.hbuName) payload.hbuName = f.hbuName;
  if (f.externalInternalName) payload.externalInternalName = f.externalInternalName;
  if (f.hiringManagerName) payload.hiringManagerName = f.hiringManagerName;

  // skills (ANY) — convert from CSV text to array
  const prim = splitNames(f.demandPrimarySkillNames);
  if (prim.length) payload.demandPrimarySkillNames = prim;
  const sec = splitNames(f.demandSecondarySkillNames);
  if (sec.length) payload.demandSecondarySkillNames = sec;

  // demand locations (ANY) — convert CSV -> list of names
  const loc = splitNames(f.demandLocationNames);
  if (loc.length) payload.demandLocationNames = loc; // e.g., ["Pune","Mumbai"]

  // profile identity
  if (f.candidateName) payload.candidateName = f.candidateName;

  // masters (IDs -> names per dropdowns)
  if (f.evaluationStatusId) {
    const found = (dd?.evaluationStatuses || []).find((x) => String(x.id) === String(f.evaluationStatusId));
    if (found?.name) payload.evaluationStatusName = found.name;
  }
  if (f.profileTrackerStatusId) {
    const found = (dd?.profileTrackerStatuses || []).find((x) => String(x.id) === String(f.profileTrackerStatusId));
    if (found?.name) payload.profileTrackerStatusName = found.name;
  }

  // dates (inclusive) — ONLY include if full YYYY-MM-DD
  const passDate = (k) => {
    const raw = String(f[k] ?? '').trim();
    if (isValidDateStr(raw)) {
      payload[k] = raw;
    }
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
            onChange={(e) => {
              const v = sanitizeDateInput(e.target.value);
              setFilters((f) => ({ ...f, [keyFrom]: v }));
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
              setFilters((f) => ({ ...f, [keyTo]: v }));
            }}
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

  // header filters + toggles (DTO-aligned keys)
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

                {/* Demand Number — text (numeric -> demandNumber) */}
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

                {/* Candidate Name */}
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

                {/* Priority */}
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

                {/* Skill Cluster / Primary / Secondary */}
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

                {/* LOB / HBU / Location */}
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

                {/* Location — server-side filter on demand locations by name list */}
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

                {/* External/Internal */}
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

                {/* Hiring Manager */}
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

                {/* Dates — DTO-aligned keys */}
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

                      {/* Demand Number + JD */}
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

                      {/* Location: show Demand locations to match the filter */}
                      <Td>{demandLocationNamesText(p)}</Td>

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
