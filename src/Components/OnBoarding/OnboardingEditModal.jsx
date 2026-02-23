// ================== src/pages/Onboarding/OnboardingEditModal.jsx ==================
import React, { useEffect, useMemo, useState } from 'react';
import { getOnboardingDropdowns, editOnboarding } from '../api/Onboarding/onBoarding';

const inputCls =
  "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const labelCls = "block text-xs font-medium text-gray-700 mb-1";
const errorCls = "mt-1 text-xs text-red-500";

export default function OnboardingEditModal({ open, onClose, row, onUpdated }) {
  const [loadingDD, setLoadingDD] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [dd, setDd] = useState({
    onboardingStatuses: [],
    wbsTypes: [],
//     bgvStatuses: [],
  });

  const initial = useMemo(() => {
    if (!row) return null;
    return {
      onboardingStatusId: row?.onboardingStatusId ?? null,
      wbsTypeId: row?.wbsTypeId ?? null,
//       bgvStatusId: row?.bgvStatusId ?? null,
      offerDate: row?.offerDate || "",
      dateOfJoining: row?.dateOfJoining || "",
      ctoolId: row?.ctoolId ?? "",
      pevUpdateDate: row?.pevUpdateDate || "",
      vpTagging: row?.vpTagging || "",
      techSelectDate: row?.techSelectDate || "",
      hsbcOnboardingDate: row?.hsbcOnboardingDate || "",
    };
  }, [row]);

  const [form, setForm] = useState(initial || {});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(initial || {});

    (async () => {
      setLoadingDD(true);
      try {
        const a = await getOnboardingDropdowns();
        setDd({
          onboardingStatuses: a?.onboardingStatuses || [],
          wbsTypes: a?.wbsTypes || [],
//           bgvStatuses: a?.bgvStatuses || [],
        });

        // Auto-map ids from names if ids not present in row
        setForm(prev => {
          const patch = { ...prev };
          if (!patch.onboardingStatusId && row?.onboardingStatus) {
            const m = (a?.onboardingStatuses || []).find(s => s.name === row.onboardingStatus);
            if (m) patch.onboardingStatusId = m.id;
          }
          if (!patch.wbsTypeId && row?.wbsType) {
            const m = (a?.wbsTypes || []).find(s => s.name === row.wbsType);
            if (m) patch.wbsTypeId = m.id;
          }
          if (!patch.bgvStatusId && row?.bgvStatus) {
            const m = (a?.bgvStatuses || []).find(s => s.name === row.bgvStatus);
            if (m) patch.bgvStatusId = m.id;
          }
          return patch;
        });
      } finally {
        setLoadingDD(false);
      }
    })();
  }, [open, initial, row]);

  if (!open || !row) return null;

  function setField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function validate() {
    const e = {};
    if (!form.onboardingStatusId) e.onboardingStatusId = "Required";
    if (!form.wbsTypeId) e.wbsTypeId = "Required";
//     if (!form.bgvStatusId) e.bgvStatusId = "Required";
    if (!form.offerDate) e.offerDate = "Required";
    if (!form.dateOfJoining) e.dateOfJoining = "Required";
    if (!String(form.ctoolId || "").trim()) e.ctoolId = "Required";
    return e;
  }

  async function handleSave() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      const payload = {
        onboardingStatusId: Number(form.onboardingStatusId),
        wbsTypeId: Number(form.wbsTypeId),
//         bgvStatusId: Number(form.bgvStatusId),
        offerDate: form.offerDate,
        dateOfJoining: form.dateOfJoining,
        ctoolId:
          form.ctoolId !== null && form.ctoolId !== undefined && String(form.ctoolId).trim() !== ""
            ? Number(form.ctoolId)
            : null,
        pevUpdateDate: form.pevUpdateDate || null,
        vpTagging: form.vpTagging || null,
        techSelectDate: form.techSelectDate || null,
        hsbcOnboardingDate: form.hsbcOnboardingDate || null,
      };

      await editOnboarding(row.onboardingId, payload);
      onUpdated && onUpdated();
      onClose && onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900">Edit Onboarding</h3>
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
                  {dd.onboardingStatuses.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
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
                {errors.wbsTypeId && <div className={errorCls}>{errors.wbsTypeId}</div>}
              </div>

{/*               BGV Status */}
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
                {errors.bgvStatusId && <div className={errorCls}>{errors.bgvStatusId}</div>}
              </div>

              {/* Offer Date */}
              <div>
                <label className={labelCls}>Offer Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.offerDate || ""}
                  onChange={(e) => setField('offerDate', e.target.value)}
                />
                {errors.offerDate && <div className={errorCls}>{errors.offerDate}</div>}
              </div>

              {/* DOJ */}
              <div>
                <label className={labelCls}>Date of Joining (DOJ)</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.dateOfJoining || ""}
                  onChange={(e) => setField('dateOfJoining', e.target.value)}
                />
                {errors.dateOfJoining && <div className={errorCls}>{errors.dateOfJoining}</div>}
              </div>

              {/* C-Tool ID */}
              <div>
                <label className={labelCls}>C-Tool ID</label>
                <input
                  type="number"
                  className={inputCls}
                  value={form.ctoolId}
                  onChange={(e) => setField('ctoolId', e.target.value)}
                  placeholder="e.g. 987654321"
                />
                {errors.ctoolId && <div className={errorCls}>{errors.ctoolId}</div>}
              </div>

              {/* PEV Update */}
              <div>
                <label className={labelCls}>PEV Update</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.pevUpdateDate || ""}
                  onChange={(e) => setField('pevUpdateDate', e.target.value)}
                />
              </div>

              {/* VP Tagging */}
              <div>
                <label className={labelCls}>VP Tagging</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.vpTagging || ""}
                  onChange={(e) => setField('vpTagging', e.target.value)}
                />
              </div>

              {/* Tech Select Date */}
              <div>
                <label className={labelCls}>Tech Select Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.techSelectDate || ""}
                  onChange={(e) => setField('techSelectDate', e.target.value)}
                />
              </div>

              {/* HSBC Onboarding Date */}
              <div>
                <label className={labelCls}>HSBC Onboarding Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.hsbcOnboardingDate || ""}
                  onChange={(e) => setField('hsbcOnboardingDate', e.target.value)}
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