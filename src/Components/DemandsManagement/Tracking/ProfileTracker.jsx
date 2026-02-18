// src/Components/Trackers/ProfileTracker.jsx
import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker, message, Tooltip } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import Layout from '../../Layout';
import { listProfileTracker, updateProfileTracker } from '../../api/Trackers/tracker';
import { getDropDownData } from '../../api/Demands/addDemands'; // <-- uses getDropdown from adddemands.js

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

const nameOf = (obj) =>
  obj && typeof obj === 'object' ? (obj.name ?? '') : (obj ?? '');

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
  if (p === 'P1') return <span className={`${base}`} style={{ background:'#E6FFFA', color:'#065F46', border:'1px solid #99F6E4' }}>P1</span>;
  if (p === 'P2') return <span className={`${base}`} style={{ background:'#FFF7ED', color:'#92400E', border:'1px solid #FED7AA' }}>P2</span>;
  if (p === 'P3') return <span className={`${base}`} style={{ background:'#FEF2F2', color:'#991B1B', border:'1px solid #FECACA' }}>P3</span>;
  return <span className={`${base}`} style={{ background:'#EDF2F7', color:'#2D3748', border:'1px solid #CBD5E0' }}>{p || '-'}</span>;
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
  // Support raw ISO or yyyy-MM-dd strings
  return dayjs(val, BACKEND_FMT).isValid() ? dayjs(val, BACKEND_FMT) : (dayjs(val).isValid() ? dayjs(val) : null);
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

  // Dropdowns from adddemands.js
  const [dd, setDd] = useState({
    priority: [],
    location: [],
    evaluationStatus: [],
    profileTrackerStatus: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getDropDownData();
        // Normalize common keys
        setDd({
          priority: res?.priorityList ?? [],
          location: res?.demandLocationList ?? [],
          evaluationStatus: res?.evaluationStatus ?? res?.evaluationStatuses ?? [],
          profileTrackerStatus: res?.profileTrackerStatus ?? res?.statuses ?? [],
        });
      } catch {
        // If dropdown fetch fails, we still allow manual values from fallback
        setDd((prev) => ({
          ...prev,
          priority: prev.priority?.length ? prev.priority : [{ name: 'P1' }, { name: 'P2' }, { name: 'P3' }],
        }));
      }
    })();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setApiErr(null);
      const page = await listProfileTracker({ page: 0, size: 100 });
      const list = Array.isArray(page?.items) ? page.items : [];
      setRows(list);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load tracker';
      setApiErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onEdit = (row) => {
    setEditId(row.id ?? row.key ?? null);
    setEditDraft({
      // dropdown/editable fields
      priority: row?.demand?.priority?.name ?? row?.priority ?? '',
      location: nameOf(row?.profile?.location) || '',
      evaluationStatus: row?.evaluationStatus ?? '',
      status: row?.profileTrackerStatus?.name ?? row?.status ?? '',

      // editable dates
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
      // dropdowns -> names
      priority: editDraft.priority || null,
      location: editDraft.location || null,
      evaluationStatus: editDraft.evaluationStatus || null,
      status: editDraft.status || null,

      // dates -> yyyy-MM-dd (or null)
      profileSharedDate: editDraft.profileSharedDate ? dayjs(editDraft.profileSharedDate).format(BACKEND_FMT) : null,
      interviewDate: editDraft.interviewDate ? dayjs(editDraft.interviewDate).format(BACKEND_FMT) : null,
      decisionDate: editDraft.decisionDate ? dayjs(editDraft.decisionDate).format(BACKEND_FMT) : null,
    };

    try {
      const updated = await updateProfileTracker({ id, payload });
      setRows((prev) =>
        prev.map((r) => ((r.id ?? r.key) === id ? { ...r, ...payload, ...updated } : r))
      );
      message.success('Row updated');
      onCancel();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to update';
      message.error(msg);
    }
  };

  // Helpers to render <option/> list from dropdowns
  const renderOptions = (items = []) =>
    (Array.isArray(items) ? items : []).map((o, idx) => {
      const value = o?.name ?? String(o ?? '');
      return (
        <option key={idx} value={value}>
          {value}
        </option>
      );
    });

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl md:text-2xl font-bold tracking-tight text-gray-900">
          Profile Tracker
        </h2>

        {/* Status */}
        {loading && <div className="text-sm text-gray-700 my-2">Loading…</div>}
        {apiErr && (
          <div className="text-sm text-red-600 my-2">Error: {apiErr}</div>
        )}

        {/* Results table */}
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="max-w-[1600px] w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <Th w={60}>EDIT</Th>
                <Th w={120}>Demand Id</Th>

                {/* New order */}
                <Th>Candidate Name</Th>
                <Th>Emp ID</Th>
                <Th>Priority</Th>

                <Th w={180}>Skill Cluster</Th>
                <Th w={220}>Primary Skill</Th>
                <Th w={220}>Secondary Skill</Th>

                <Th>LOB</Th>
                <Th>HBU</Th>
                <Th>Location</Th>
                <Th>Profile Type</Th>
                <Th>Hiring Manager</Th>

                <Th>Attached Date</Th>
                <Th>Profile Shared Date</Th>
                <Th>Interview Date</Th>
                <Th>Decision Date</Th>
                <Th>Evaluation Status</Th>
                <Th>Status</Th>
                <Th>Aging</Th>
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
                rows.map((p, idx) => {
                  const key = p.id ?? `${p.demandId ?? 'row'}-${idx}`;
                  const isEdit = editId === (p.id ?? p.key);

                  const lobCode =
                    p?.lob ??
                    p?.demand?.lob?.code ??
                    p?.demand?.lob?.name ??
                    '';
                  const demId = p?.demand?.demandId ?? p?.demandId ?? '';
                  const demandCode = [lobCode, demId].filter(Boolean).join('-');

                  const skillClusterText = p?.demand?.skillCluster?.name ?? '-';
                  const primarySkillsText = Array.isArray(p?.demand?.primarySkills)
                    ? p.demand.primarySkills.map(nameOf).join(', ')
                    : (p?.demand?.primarySkills ?? '-');
                  const secondarySkillsText = Array.isArray(p?.demand?.secondarySkills)
                    ? p.demand.secondarySkills.map(nameOf).join(', ')
                    : (p?.demand?.secondarySkills ?? '-');

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

                      {/* Demand Id as green button/pill */}
                      <Td>
                        <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-600 px-2 py-0.5 text-xs font-semibold">
                          {demandCode || '-'}
                        </span>
                      </Td>

                      {/* Candidate Name */}
                      <Td>{p?.profile?.candidateName ?? '-'}</Td>

                      {/* Emp ID */}
                      <Td>{p?.empId ?? '-'}</Td>

                      {/* Priority (editable via dropdown) */}
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
                      <Td>{lobCode || '-'}</Td>

                      {/* HBU */}
                      <Td>{nameOf(p?.demand?.hbu?.name) || '-'}</Td>

                      {/* Location (editable via dropdown) */}
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
                            onChange={(e) => setEditDraft((d) => ({ ...d, evaluationStatus: e.target.value }))}
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

                      {/* Aging (non-editable; current date - attached date) */}
                      <Td>{Number.isFinite(aging) ? aging : '-'}</Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
