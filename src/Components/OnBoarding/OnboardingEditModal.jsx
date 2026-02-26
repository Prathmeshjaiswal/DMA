import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getOnboardingDropdowns, editOnboarding } from '../api/Onboarding/onBoarding';

const inputCls =
  "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const labelCls = "block text-xs font-medium text-gray-700 mb-1";
const errorCls = "mt-1 text-xs text-red-500";

/* ---------- helpers ---------- */
function safeName(v) {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v.name ?? '';
  return String(v);
}
function buildDemandCode(row) {
  if (!row) return '-';
  if (row.displayDemandId) return row.displayDemandId;
  if (row.demandCode) return row.demandCode;
  const d = row.demand || {};
  if (d.displayDemandId) return d.displayDemandId;
  const lob = safeName(d.lob);
  const id = d.demandId != null ? String(d.demandId) : '';
  const parts = [];
  if (lob) parts.push(lob);
  if (id) parts.push(id);
  return parts.length ? parts.join('-') : '-';
}
function findIdByName(list = [], key, contains) {
  const needle = String(contains || '').toLowerCase();
  const hit = list.find((x) => String(x?.[key] ?? x?.name ?? '').toLowerCase().includes(needle));
  return hit?.id ?? null;
}
function nameById(list = [], id) {
  if (id == null) return '';
  const item = list.find((x) => String(x.id) === String(id));
  return item?.name ?? '';
}
/** digits-only, max 8 */
function sanitizeCtool(value) {
  return String(value ?? '').replace(/\D+/g, '').slice(0, 8);
}

/* ---------- Date utils (typable + pickable) ---------- */
function normalizeYMD(s) {
  if (!s) return '';
  const str = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // DD/MM/YYYY or DD-MM-YYYY -> YYYY-MM-DD
  const m = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  return str;
}
function DateInput({ value, onValue, disabled, placeholder = 'YYYY-MM-DD' }) {
  const [mode, setMode] = useState('text');
  const val = value || '';
  return (
    <input
      type={mode === 'date' ? 'date' : 'text'}
      className={inputCls}
      value={val}
      disabled={disabled}
      inputMode="numeric"
      placeholder={placeholder}
      pattern="\d{4}-\d{2}-\d{2}"
      onFocus={() => setMode('date')}
      onBlur={(e) => {
        setMode('text');
        const v = normalizeYMD(e.target.value);
        onValue(v);
      }}
      onChange={(e) => {
        const v = normalizeYMD(e.target.value);
        onValue(v);
      }}
    />
  );
}

// Shallow equality for primitives/strings
function eq(a, b) {
  return String(a ?? '') === String(b ?? '');
}

export default function OnboardingEditModal({ open, onClose, row, onUpdated }) {
  const [loadingDD, setLoadingDD] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [dd, setDd] = useState({
    onboardingStatuses: [],
    wbsTypes: [],
    bgvStatuses: [],
  });

  // ---------- Initial form from row ----------
  const initial = useMemo(() => {
    if (!row) return null;
    return {
      onboardingStatusId: row?.onboardingStatusId ?? null,
      wbsTypeId: row?.wbsTypeId ?? null,
      bgvStatusId: row?.bgvStatusId ?? null,
      offerDate: row?.offerDate || "",
      dateOfJoining: row?.dateOfJoining || "",
      ctoolId: row?.ctoolId != null ? String(row.ctoolId) : "",
      pevUploadDate: row?.pevUploadDate || "",
      vpTagging: row?.vpTagging || "",
      techSelectDate: row?.techSelectDate || "",
      hsbcOnboardingDate: row?.hsbcOnboardingDate || "",
      profileExternalInternal: safeName(
        row?.profile?.externalInternal ?? row?.profileExternalInternal ?? ''
      ),
    };
  }, [row]);

  const [form, setForm] = useState(initial || {});
  // Keep a snapshot to compute deltas for partial update
  const initialRef = useRef(initial || null);

  // ---------- Load dropdowns + backfill missing IDs & default onboarding status ----------
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(initial || {});
    initialRef.current = initial || null;

    (async () => {
      setLoadingDD(true);
      try {
        const a = await getOnboardingDropdowns();
        setDd({
          onboardingStatuses: a?.onboardingStatuses || [],
          wbsTypes: a?.wbsTypes || [],
          bgvStatuses: a?.bgvStatuses || [],
        });
        setForm((prev) => {
          const patch = { ...prev };
          if (!patch.onboardingStatusId && row?.onboardingStatusName) {
            const m = (a?.onboardingStatuses || []).find(s => s.name === row.onboardingStatusName);
            if (m) patch.onboardingStatusId = m.id;
          }
          if (!patch.wbsTypeId && row?.wbsTypeName) {
            const m = (a?.wbsTypes || []).find(s => s.name === row.wbsTypeName);
            if (m) patch.wbsTypeId = m.id;
          }
          if (!patch.bgvStatusId && row?.bgvStatusName) {
            const m = (a?.bgvStatuses || []).find(s => s.name === row.bgvStatusName);
            if (m) patch.bgvStatusId = m.id;
          }
          if (!patch.onboardingStatusId) {
            const inProgId =
              findIdByName(a?.onboardingStatuses, 'name', 'progress') ??
              findIdByName(a?.onboardingStatuses, 'name', 'in progress');
            if (inProgId) patch.onboardingStatusId = inProgId;
          }
          patch.ctoolId = sanitizeCtool(patch.ctoolId);
          // also update initialRef with sanitized base so delta compares are consistent
          initialRef.current = { ...patch };
          return patch;
        });
      } finally {
        setLoadingDD(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, row]);

  function setField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // ---------- Derived gating ----------
  const ctoolClean = sanitizeCtool(form.ctoolId);
  const ctoolLen = ctoolClean.length;
  const ctoolValid = /^\d{6,8}$/.test(ctoolClean);      // keep 6–8 digits rule
  const ctoolTooShort = ctoolLen > 0 && ctoolLen < 6;   // inline hint

  // No field disablement based on C-Tool
  const profileType = String(form.profileExternalInternal || '').trim().toLowerCase();
  const isInternal = profileType.includes('internal');
  const isExternal = !isInternal;

  // BGV no longer gates anything
  const bgvName = nameById(dd.bgvStatuses, form.bgvStatusId).toLowerCase();
  const bgvCompleted = bgvName.includes('complete'); // informational only

  // Fields are editable regardless of C-Tool or BGV
  const canEditOthers = true;
  const canEditPevHsbc = true; // <- always enabled now

  const needOffer = isExternal;
  const needDoj = isExternal;

  // For "Completed", require C-Tool 6–8 + other fields (no BGV dependency)
  const allForComplete =
    ctoolValid &&
    form.wbsTypeId &&
    (needOffer ? form.offerDate : true) &&
    (needDoj ? form.dateOfJoining : true) &&
    form.pevUploadDate &&
    form.hsbcOnboardingDate;

  const inProgId =
    findIdByName(dd.onboardingStatuses, 'name', 'progress') ??
    findIdByName(dd.onboardingStatuses, 'name', 'in progress');
  const completeId =
    findIdByName(dd.onboardingStatuses, 'name', 'complete') ??
    findIdByName(dd.onboardingStatuses, 'name', 'completed');

  useEffect(() => {
    if (!open) return;
    setForm((prev) => {
      if (!allForComplete && completeId && String(prev.onboardingStatusId) === String(completeId)) {
        return { ...prev, onboardingStatusId: inProgId ?? prev.onboardingStatusId };
      }
      if (!prev.onboardingStatusId && inProgId) {
        return { ...prev, onboardingStatusId: inProgId };
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, allForComplete, completeId, inProgId]);

  if (!open || !row) return null;

  // ---------- Validation ----------
  function validate() {
    const e = {};
    if (!form.onboardingStatusId) e.onboardingStatusId = "Onboarding status is required.";

    // Enforce only for Completed; BGV removed from requirements
    if (completeId && String(form.onboardingStatusId) === String(completeId) && !allForComplete) {
      e.onboardingStatusId =
        "Cannot mark as Completed until required fields are filled: C-Tool (6–8), WBS Type, " +
        (isExternal ? "Offer Date, DOJ, " : "") +
        "PEV Upload Date, and HSBC Onboarding Date.";
    }
    return e;
  }

  // ---------- Partial payload builder ----------
  function buildPartialPayload(base, curr) {
    const patch = {};

    // onboardingStatusId
    if (!eq(base?.onboardingStatusId, curr.onboardingStatusId)) {
      patch.onboardingStatusId = curr.onboardingStatusId ? Number(curr.onboardingStatusId) : null;
    }

    // wbsTypeId
    if (!eq(base?.wbsTypeId, curr.wbsTypeId)) {
      patch.wbsTypeId = curr.wbsTypeId ? Number(curr.wbsTypeId) : null;
    }

    // bgvStatusId (still allowed to update, but no validation dependency)
    if (!eq(base?.bgvStatusId, curr.bgvStatusId)) {
      patch.bgvStatusId = curr.bgvStatusId ? Number(curr.bgvStatusId) : null;
    }

    // offerDate (external)
    if (!eq(base?.offerDate, curr.offerDate)) {
      if (isExternal) {
        patch.offerDate = curr.offerDate || null;
      }
    }

    // dateOfJoining (external)
    if (!eq(base?.dateOfJoining, curr.dateOfJoining)) {
      if (isExternal) {
        patch.dateOfJoining = curr.dateOfJoining || null;
      }
    }

    // ctoolId (send only if valid 6–8; otherwise omit so backend retains old)
    if (!eq(base?.ctoolId, curr.ctoolId)) {
      if (ctoolValid) patch.ctoolId = Number(sanitizeCtool(curr.ctoolId));
    }

    // pevUploadDate
    if (!eq(base?.pevUploadDate, curr.pevUploadDate)) {
      patch.pevUploadDate = curr.pevUploadDate || null;
    }

    // vpTagging
    if (!eq(base?.vpTagging, curr.vpTagging)) {
      patch.vpTagging = curr.vpTagging || null;
    }

    // techSelectDate
    if (!eq(base?.techSelectDate, curr.techSelectDate)) {
      patch.techSelectDate = curr.techSelectDate || null;
    }

    // hsbcOnboardingDate
    if (!eq(base?.hsbcOnboardingDate, curr.hsbcOnboardingDate)) {
      patch.hsbcOnboardingDate = curr.hsbcOnboardingDate || null;
    }

    return patch;
  }

  async function handleSave() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    const base = initialRef.current || {};
    const patch = buildPartialPayload(base, { ...form, ctoolId: ctoolClean });

    // If nothing changed, short-circuit
    if (!Object.keys(patch).length) {
      onClose && onClose();
      return;
    }

    setSaving(true);
    try {
      await editOnboarding(row.onboardingId, patch);
      onUpdated && onUpdated();
      onClose && onClose();
    } finally {
      setSaving(false);
    }
  }

  const title = `Onboarding — ${buildDemandCode(row)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900">
            {title}
          </h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {loadingDD ? (
            <div className="py-6 text-sm text-gray-600">Loading dropdowns…</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Onboarding Status */}
              <div>
                <label className={labelCls}>Onboarding Status</label>
                <select
                  className={inputCls}
                  value={form.onboardingStatusId ?? ""}
                  onChange={(e) => setField('onboardingStatusId', e.target.value)}
//                   disabled={!allForComplete && !!completeId}
                >
                  <option value="">Select status</option>
                  {(dd.onboardingStatuses || []).map((s) => {
                    const isCompletedOpt = completeId && String(s.id) === String(completeId);
                    return (
                      <option key={s.id} value={s.id} disabled={!allForComplete && isCompletedOpt}>
                        {s.name}
                      </option>
                    );
                  })}
                </select>
                {errors.onboardingStatusId && <div className={errorCls}>{errors.onboardingStatusId}</div>}
              </div>

              {/* WBS Type */}
              <div>
                <label className={labelCls}>WBS Type</label>
                <select
                  className={inputCls}
                  value={form.wbsTypeId ?? ""}
                  onChange={(e) => setField('wbsTypeId', e.target.value)}
                >
                  <option value="">Select WBS Type</option>
                  {dd.wbsTypes.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* BGV Status (still editable, but no gating) */}
              <div>
                <label className={labelCls}>BGV Status</label>
                <select
                  className={inputCls}
                  value={form.bgvStatusId ?? ""}
                  onChange={(e) => setField('bgvStatusId', e.target.value)}
                >
                  <option value="">Select BGV Status</option>
                  {dd.bgvStatuses.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* C-Tool ID */}
              <div>
                <label className={labelCls}>C-Tool ID</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  className={inputCls}
                  value={ctoolClean}
                  onChange={(e) => setField('ctoolId', sanitizeCtool(e.target.value))}
                  placeholder="e.g. 123456"
                />
                {ctoolTooShort && <div className={errorCls}>C-Tool ID must be 6–8 digits.</div>}
                {errors.ctoolId && <div className={errorCls}>{errors.ctoolId}</div>}
              </div>

              {/* DOJ — only for External */}
              {!isInternal && (
                <div>
                  <label className={labelCls}>Date of Joining (DOJ)</label>
                  <DateInput
                    value={form.dateOfJoining}
                    onValue={(v) => setField('dateOfJoining', v)}
                  />
                </div>
              )}

              {/* Offer Date — only for External */}
              {!isInternal && (
                <div>
                  <label className={labelCls}>Offer Date</label>
                  <DateInput
                    value={form.offerDate}
                    onValue={(v) => setField('offerDate', v)}
                  />
                </div>
              )}

              {/* PEV Upload Date (always enabled) */}
              <div>
                <label className={labelCls}>PEV Upload Date</label>
                <DateInput
                  value={form.pevUploadDate}
                  onValue={(v) => setField('pevUploadDate', v)}
                  disabled={!canEditPevHsbc}
                />
              </div>

              {/* VP Tagging Date */}
              <div>
                <label className={labelCls}>VP Tagging Date</label>
                <DateInput
                  value={form.vpTagging}
                  onValue={(v) => setField('vpTagging', v)}
                />
              </div>

              {/* Tech Select Date */}
              <div>
                <label className={labelCls}>Tech Select Date</label>
                <DateInput
                  value={form.techSelectDate}
                  onValue={(v) => setField('techSelectDate', v)}
                />
              </div>

              {/* HSBC Onboarding Date (always enabled) */}
              <div>
                <label className={labelCls}>HSBC Onboarding Date</label>
                <DateInput
                  value={form.hsbcOnboardingDate}
                  onValue={(v) => setField('hsbcOnboardingDate', v)}
                  disabled={!canEditPevHsbc}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-5 py-3">
          <button
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={saving || loadingDD}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}