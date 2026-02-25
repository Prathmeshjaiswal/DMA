
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

/* ---------- get decision date baseline from Profile Tracker ---------- */
function getProfileDecisionDateFromRow(row) {
  const candidates = [
    row?.decisionDate,
    row?.profileTracker?.decisionDate,
    row?.tracker?.decisionDate,
    row?.profile?.decisionDate,
    row?.onboarding?.decisionDate,
  ];
  for (const c of candidates) {
    const n = normalizeYMD(c);
    if (n && /^\d{4}-\d{2}-\d{2}$/.test(n)) return n;
  }
  return '';
}
function toDateOrNull(s) {
  if (!s) return null;
  const n = normalizeYMD(s);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(n)) return null;
  const d = new Date(n);
  return Number.isNaN(d.getTime()) ? null : d;
}
function gteDate(aStr, bStr) {
  const a = toDateOrNull(aStr);
  const b = toDateOrNull(bStr);
  if (!a || !b) return true; // if any missing, don't fail hard
  return a.getTime() >= b.getTime();
}

export default function OnboardingEditModal({
  open,
  onClose,
  row,
  onUpdated,
  decisionBaseline: decisionBaselineProp,
}) {
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
  const initialRef = useRef(initial || null);

  // ---------- Decision baseline ----------
  const decisionBaseline = useMemo(() => {
    return decisionBaselineProp || (row ? getProfileDecisionDateFromRow(row) : '');
  }, [decisionBaselineProp, row]);

  // ---------- Load dropdowns + backfill ----------
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
            const inProg = findIdByName(a?.onboardingStatuses, 'name', 'progress')
              ?? findIdByName(a?.onboardingStatuses, 'name', 'in progress');
            if (inProg) patch.onboardingStatusId = inProg;
          }
          // keep initial snapshot sanitized for consistent compare
          patch.ctoolId = sanitizeCtool(patch.ctoolId);
          initialRef.current = { ...patch };
          return patch;
        });
      } finally {
        setLoadingDD(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, row]);

  // ---------- Derived gating ----------
  const ctoolClean = sanitizeCtool(form.ctoolId);
  const ctoolLen = ctoolClean.length;
  const ctoolValid = /^\d{6,8}$/.test(ctoolClean);
  const ctoolTooShort = ctoolLen > 0 && ctoolLen < 6;

  const profileTypeStr = String(form.profileExternalInternal || '').trim().toLowerCase();
  const isInternal = profileTypeStr.includes('internal');
  const isExternal = !isInternal;

  // BGV name + completion flag
  const bgvName = nameById(dd.bgvStatuses, form.bgvStatusId).toLowerCase();
  const bgvCompleted = bgvName.includes('complete'); // 'Completed' / 'Complete'

  const needOffer = isExternal;
  const needDoj = isExternal;

  // Common required fields for Completed; base for Onboarded
  const baseRequiredFilled =
    ctoolValid &&
    form.wbsTypeId &&
    (needOffer ? form.offerDate : true) &&
    (needDoj ? form.dateOfJoining : true) &&
    form.pevUploadDate &&
    form.hsbcOnboardingDate;

  // For Completed: base fields (no BGV dependency)
  const allForComplete = baseRequiredFilled;

  // For Onboarded: base fields + BGV Completed
  const allForOnboarded = baseRequiredFilled && bgvCompleted;

  // Status IDs
  const inProgId = useMemo(() =>
    findIdByName(dd.onboardingStatuses, 'name', 'progress') ??
    findIdByName(dd.onboardingStatuses, 'name', 'in progress'),
  [dd.onboardingStatuses]);

  const completeId = useMemo(() =>
    findIdByName(dd.onboardingStatuses, 'name', 'complete') ??
    findIdByName(dd.onboardingStatuses, 'name', 'completed'),
  [dd.onboardingStatuses]);

  const onboardedId = useMemo(() =>
    findIdByName(dd.onboardingStatuses, 'name', 'onboarded') ??
    findIdByName(dd.onboardingStatuses, 'name', 'on boarded'),
  [dd.onboardingStatuses]);

  // Auto-revert invalid target statuses
  useEffect(() => {
    if (!open) return;
    setForm((prev) => {
      if (!allForComplete && completeId && String(prev.onboardingStatusId) === String(completeId)) {
        return { ...prev, onboardingStatusId: inProgId ?? prev.onboardingStatusId };
      }
      if (!allForOnboarded && onboardedId && String(prev.onboardingStatusId) === String(onboardedId)) {
        return { ...prev, onboardingStatusId: inProgId ?? prev.onboardingStatusId };
      }
      if (!prev.onboardingStatusId && inProgId) {
        return { ...prev, onboardingStatusId: inProgId };
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, allForComplete, allForOnboarded, completeId, onboardedId, inProgId]);

  if (!open || !row) return null;

  // ---------- Validation ----------
  function validate(formArg = form) {
    const e = {};
    if (!formArg.onboardingStatusId) e.onboardingStatusId = "Onboarding status is required.";

    // Optional: explicit C-Tool error (so Save blocks if invalid)
    const cleanCtool = sanitizeCtool(formArg.ctoolId);
    if (cleanCtool && !/^\d{6,8}$/.test(cleanCtool)) {
      e.ctoolId = "C-Tool ID must be 6–8 digits.";
    }

    // Decision baseline: all dates must be >= baseline
    if (decisionBaseline) {
      // compact message under fields
      const msg = (label) => ` Decision Date (${decisionBaseline}).`;
      const checks = [
        { key: 'offerDate', label: 'Offer Date' },
        { key: 'dateOfJoining', label: 'Date of Joining' },
        { key: 'pevUploadDate', label: 'PEV Upload Date' },
        { key: 'vpTagging', label: 'VP Tagging Date' },
        { key: 'techSelectDate', label: 'Tech Select Date' },
        { key: 'hsbcOnboardingDate', label: 'HSBC Onboarding Date' },
      ];
      for (const { key, label } of checks) {
        const val = formArg[key];
        if (val && !gteDate(val, decisionBaseline)) {
          e[key] = msg(label);
        }
      }
    }

    // Re-evaluate base + BGV locally
    const profileTypeLocal = String(formArg.profileExternalInternal || '').trim().toLowerCase();
    const isExternalLocal = !profileTypeLocal.includes('internal');
    const baseRequiredLocal =
      /^\d{6,8}$/.test(sanitizeCtool(formArg.ctoolId)) &&
      formArg.wbsTypeId &&
      (isExternalLocal ? formArg.offerDate : true) &&
      (isExternalLocal ? formArg.dateOfJoining : true) &&
      formArg.pevUploadDate &&
      formArg.hsbcOnboardingDate;

    // Completed gate
    if (completeId && String(formArg.onboardingStatusId) === String(completeId) && !baseRequiredLocal) {
      e.onboardingStatusId =
        "Cannot mark as Completed until required fields are filled: C-Tool (6–8), WBS Type, " +
        (isExternalLocal ? "Offer Date, DOJ, " : "") +
        "PEV Upload Date, and HSBC Onboarding Date.";
    }

    // Onboarded: base + BGV Completed
    const bgvNameLocal = nameById(dd.bgvStatuses, formArg.bgvStatusId).toLowerCase();
    const bgvDoneLocal = bgvNameLocal.includes('complete');
    if (onboardedId && String(formArg.onboardingStatusId) === String(onboardedId)) {
      if (!baseRequiredLocal) {
        e.onboardingStatusId =
          "Cannot mark as Onboarded until required fields are filled: C-Tool (6–8), WBS Type, " +
          (isExternalLocal ? "Offer Date, DOJ, " : "") +
          "PEV Upload Date, and HSBC Onboarding Date.";
      } else if (!bgvDoneLocal) {
        e.onboardingStatusId = "Cannot mark as Onboarded until BGV Status is Completed.";
      }
    }

    return e;
  }

  // live updates with validation
  function setField(name, value) {
    setForm(prev => {
      const next = { ...prev, [name]: value };
      setErrors(validate(next));
      return next;
    });
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
    // bgvStatusId
    if (!eq(base?.bgvStatusId, curr.bgvStatusId)) {
      patch.bgvStatusId = curr.bgvStatusId ? Number(curr.bgvStatusId) : null;
    }
    // offerDate
    if (!eq(base?.offerDate, curr.offerDate)) {
      patch.offerDate = curr.offerDate || null;
    }
    // dateOfJoining
    if (!eq(base?.dateOfJoining, curr.dateOfJoining)) {
      patch.dateOfJoining = curr.dateOfJoining || null;
    }
    // ✅ C-Tool: compare sanitized; send as string; allow null to clear; NEVER Number()
   // ctoolId (allow update regardless of other fields)
if (!eq(base?.ctoolId, curr.ctoolId)) {
  patch.ctoolId = Number(sanitizeCtool(curr.ctoolId));
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
                >
                  <option value="">Select status</option>
                  {(dd.onboardingStatuses || []).map((s) => {
                    const isCompletedOpt = completeId && String(s.id) === String(completeId);
                    const isOnboardedOpt = onboardedId && String(s.id) === String(onboardedId);
                    const disableCompleted = isCompletedOpt && !allForComplete;
                    const disableOnboarded = isOnboardedOpt && !allForOnboarded; // base fields + BGV Completed
                    return (
                      <option
                        key={s.id}
                        value={s.id}
                        disabled={disableCompleted || disableOnboarded}
                      >
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

              {/* BGV Status */}
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
                {(ctoolTooShort || errors.ctoolId) && (
                  <div className={errorCls}>C-Tool ID must be 6–8 digits.</div>
                )}
              </div>

              {/* DOJ — only for External */}
              {!isInternal && (
                <div>
                  <label className={labelCls}>Date of Joining (DOJ)</label>
                  <DateInput
                    value={form.dateOfJoining}
                    onValue={(v) => setField('dateOfJoining', v)}
                  />
                  {errors.dateOfJoining && <div className={errorCls}>{errors.dateOfJoining}</div>}
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
                  {errors.offerDate && <div className={errorCls}>{errors.offerDate}</div>}
                </div>
              )}

              {/* PEV Upload Date */}
              <div>
                <label className={labelCls}>PEV Upload Date</label>
                <DateInput
                  value={form.pevUploadDate}
                  onValue={(v) => setField('pevUploadDate', v)}
                />
                {errors.pevUploadDate && <div className={errorCls}>{errors.pevUploadDate}</div>}
              </div>

              {/* VP Tagging Date */}
              <div>
                <label className={labelCls}>VP Tagging Date</label>
                <DateInput
                  value={form.vpTagging}
                  onValue={(v) => setField('vpTagging', v)}
                />
                {errors.vpTagging && <div className={errorCls}>{errors.vpTagging}</div>}
              </div>

              {/* Tech Select Date */}
              <div>
                <label className={labelCls}>Tech Select Date</label>
                <DateInput
                  value={form.techSelectDate}
                  onValue={(v) => setField('techSelectDate', v)}
                />
                {errors.techSelectDate && <div className={errorCls}>{errors.techSelectDate}</div>}
              </div>

              {/* HSBC Onboarding Date */}
              <div>
                <label className={labelCls}>HSBC Onboarding Date</label>
                <DateInput
                  value={form.hsbcOnboardingDate}
                  onValue={(v) => setField('hsbcOnboardingDate', v)}
                />
                {errors.hsbcOnboardingDate && <div className={errorCls}>{errors.hsbcOnboardingDate}</div>}
              </div>

              {/* Optional: show baseline
              <div className="md:col-span-2 text-xs text-gray-500">
                Decision Date (from Profile Tracker): {decisionBaseline || '-'}
              </div> */}
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