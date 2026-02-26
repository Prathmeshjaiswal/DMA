// src/Components/DemandsManagement/AddNewDemand/AddDemands2.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { message, Spin } from 'antd';
import { submitStep2 } from '../../api/Demands/addDemands';
import { getStep1Draft, updateDraft } from '../../api/Demands/draft';
import Layout from '../../Layout';

export default function AddDemands2() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // From navigation
  const navDraftId = state?.draftId ?? null;
  const navForm1Data = state?.form1Data ?? null;

  // Keep a single meta object to build payloads
  const [meta, setMeta] = useState(navForm1Data || null);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const REQUIRE_INPUT_PER_ROW = true;
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  const WORD_LIMIT = 2000;

  const [submitting, setSubmitting] = useState(false);

  // draftId (prefer nav, fall back to localStorage)
  const draftIdNum = useMemo(() => {
    const id = navDraftId ?? localStorage.getItem('step1DraftId');
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [navDraftId]);

  // Hydrate meta if not provided via navigation
  useEffect(() => {
    if (meta || !draftIdNum) return;
    (async () => {
      try {
        setLoadingMeta(true);
        const res = await getStep1Draft(draftIdNum);
        const data = res?.data ?? res ?? {};
        // Normalize to shape expected by previous Step‑2 logic
        setMeta({
          draftId: draftIdNum,

          // scalar ids (prefer *_id if present)
          hbuId: data?.hbu?.id ?? data?.hbuId ?? null,
          hubSpocId: data?.hbuSpoc?.id ?? data?.hbuSpocId ?? data?.hubSpocId ?? null,
          bandId: data?.band?.id ?? data?.bandId ?? null,
          priorityId: data?.priority?.id ?? data?.priorityId ?? null,
          lobId: data?.lob?.id ?? data?.lobId ?? null,
          demandTypeId: data?.demandType?.id ?? data?.demandTypeId ?? null,
          demandTimelineId: data?.demandTimeline?.id ?? data?.demandTimelineId ?? null,
          externalInternalId: data?.externalInternal?.id ?? data?.externalInternalId ?? null,
          statusId: data?.status?.id ?? data?.statusId ?? null,
          podId: data?.pod?.id ?? data?.podId ?? null,
          pmoSpocId: data?.pmoSpoc?.id ?? data?.pmoSpocId ?? null,
          pmoId: data?.pmo?.id ?? data?.pmoId ?? null,
          salesSpocId: data?.salesSpoc?.id ?? data?.salesSpocId ?? null,
          hiringManagerId: data?.hiringManager?.id ?? data?.hiringManagerId ?? null,
          deliveryManagerId: data?.deliveryManager?.id ?? data?.deliveryManagerId ?? null,
          skillClusterId: data?.skillCluster?.id ?? data?.skillClusterId ?? null,

          // text/scalars
          experience: data?.experience ?? '',
          remark: data?.remark ?? '',
          numberOfPositions: data?.numberOfPositions ?? 0,
          noOfPositions: data?.numberOfPositions ?? 0, // keep compatibility with earlier code
          flag: true,
          demandReceivedDate: data?.demandReceivedDate ?? '',

          // arrays
          primarySkillIds: Array.isArray(data?.primarySkills) ? data.primarySkills.map(s => Number(s.id)) : [],
          secondarySkillIds: Array.isArray(data?.secondarySkills) ? data.secondarySkills.map(s => Number(s.id)) : [],
          locationIds: Array.isArray(data?.demandLocations) ? data.demandLocations.map(l => Number(l.id)) : [],

          rrDrafts: Array.isArray(data?.rrDrafts) ? data.rrDrafts : [],
        });
      } catch (e) {
        console.error('Step‑2 hydrate error:', e);
        message.error('Failed to hydrate Step‑2. Go back to Step‑1.');
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, [meta, draftIdNum]);

  // Row count: prefer server list length, else positions
  const rowCount = useMemo(() => {
    const fromList = Array.isArray(meta?.demandRRDTOList) ? meta.demandRRDTOList.length : 0;
    const fromPositions = Number(meta?.numberOfPositions ?? meta?.noOfPositions ?? 0);
    return Math.max(fromList, fromPositions, 0);
  }, [meta]);

  // RR numbers per row
  const [rrNumbers, setRrNumbers] = useState([]);
  useEffect(() => {
    setRrNumbers(Array.from({ length: rowCount }, () => ''));
  }, [rowCount]);

  const onChangeRR = (index, value) => {
    const cleaned = (value || '').replace(/\D/g, '');
    setRrNumbers((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
  };

  // Per-row file input refs
  const fileRefs = useRef({});
  const setFileRef = (idx, el) => { fileRefs.current[idx] = el; };

  // Per-row state
  const [rowFiles, setRowFiles] = useState({});
  const [rowRawFiles, setRowRawFiles] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [rowMode, setRowMode] = useState({}); // 'file' | 'text'
  const [rowText, setRowText] = useState({});

  // Default to file mode for all rows
  useEffect(() => {
    const init = {};
    for (let i = 0; i < rowCount; i++) init[i] = 'file';
    setRowMode(init);
  }, [rowCount]);

  const isAllowedType = (f) => {
    if (!f) return false;
    const allowedMimes = new Set([
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);
    const mime = f.type || '';
    if (mime.startsWith('image/')) return true;
    if (allowedMimes.has(mime)) return true;
    const name = (f.name || '').toLowerCase();
    return (
      name.endsWith('.txt') ||
      name.endsWith('.pdf') ||
      name.endsWith('.doc') ||
      name.endsWith('.docx') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg')
    );
  };

  const validateFile = (f) => {
    if (!f) return REQUIRE_INPUT_PER_ROW ? 'Please select a file.' : '';
    if (!isAllowedType(f)) return 'Unsupported file type. Allowed: txt, pdf, doc, docx, images.';
    if (f.size === 0) return 'Selected file is empty.';
    if (f.size >= MAX_BYTES) return 'File too large. It must be less than 5 MB.';
    return '';
  };

  const triggerFileDialog = (idx) => fileRefs.current[idx]?.click();

  const clearRowFile = (idx) => {
    setRowFiles(({ [idx]: _, ...rest }) => rest);
    setRowRawFiles(({ [idx]: _, ...rest }) => rest);
    setRowErrors(({ [idx]: _, ...rest }) => rest);
    if (fileRefs.current[idx]) fileRefs.current[idx].value = '';
  };

  const handleSelectedFile = async (idx, f) => {
    const msg = validateFile(f);
    if (msg) {
      setRowErrors((prev) => ({ ...prev, [idx]: msg }));
      setRowFiles(({ [idx]: _, ...rest }) => rest);
      setRowRawFiles(({ [idx]: _, ...rest }) => rest);
      return;
    }
    setRowErrors((prev) => ({ ...prev, [idx]: '' }));
    setRowRawFiles((prev) => ({ ...prev, [idx]: f }));
    setRowFiles((prev) => ({ ...prev, [idx]: f }));
  };

  const onFileChange = async (idx, e) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    setRowMode((prev) => ({ ...prev, [idx]: 'file' }));
    await handleSelectedFile(idx, f);
  };

  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const onDrop = async (idx, e) => {
    e.preventDefault(); e.stopPropagation();
    const f = e.dataTransfer?.files?.[0] || null;
    if (!f) return;
    setRowMode((prev) => ({ ...prev, [idx]: 'file' }));
    await handleSelectedFile(idx, f);
  };

  const countWords = (text) =>
    (text || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

  // ---------- Helpers ----------
  const toNum = (v) => (v === '' || v == null ? null : Number(v));
  const toNumArr = (v) => (Array.isArray(v) ? v.map((x) => Number(x)).filter(Number.isFinite) : []);
  const pickFirst = (...candidates) => {
    for (const c of candidates) {
      if (c !== undefined && c !== null && c !== '') return c;
    }
    return undefined;
  };

  // ---------- Save Draft ----------
  const onSaveDraft = async () => {
    try {
      const draftIdLocal = draftIdNum;
      if (!Number.isFinite(draftIdLocal)) {
        message.warning('No valid draftId found. Cannot save draft.');
        return;
      }

      const maxIndex =
        (Array.isArray(meta?.rrDrafts) ? meta.rrDrafts.length : 0) ||
        Number(meta?.numberOfPositions ?? meta?.noOfPositions ?? rowCount) ||
        rowCount;

      const getRrDraftIdAt = (i) => {
        if (!Array.isArray(meta?.rrDrafts) || !meta.rrDrafts[i]) return null;
        const row = meta.rrDrafts[i];
        const cand = row.rrDraftId ?? row.id ?? row.rrId ?? row.rr_draft_id ?? null;
        const n = Number(cand);
        return Number.isFinite(n) ? n : null;
      };

      const files = [];
      const rrDrafts = [];

      for (let idx = 0; idx < rowCount; idx++) {
        const rrNumber = Number(rrNumbers[idx] || 0);
        const mode = rowMode[idx];

        const rrDraftId = getRrDraftIdAt(idx);
        const positionIndex = idx + 1;

        let fileName = null;
        let jdText = null;

        if (mode === 'file') {
          const f = rowFiles[idx];
          if (f) {
            files.push(f);
            fileName = f.name || `RR${rrNumber || positionIndex}.txt`;
          }
        } else {
          const content = (rowText[idx] || '').trim();
          if (content) jdText = content;
        }

        const noRR = !rrNumbers[idx] || String(rrNumbers[idx]).trim() === '';
        const noContent = !fileName && !jdText;
        if (rrDraftId == null && noRR && noContent) continue;

        if (rrDraftId == null && (positionIndex < 1 || positionIndex > maxIndex)) {
          message.error(`Row #${idx + 1}: positionIndex out of range (${positionIndex}). Expected 1..${maxIndex}.`);
          return;
        }

        const rowEntry = {
          rrNumber: Number.isFinite(rrNumber) ? rrNumber : 0,
          fileName: fileName || null,
          jdText: jdText || null,
          filenameHint: `RR${rrNumber || positionIndex}_JD`,
          clearFile: false,
        };
        if (rrDraftId != null) rowEntry.rrDraftId = rrDraftId;
        else rowEntry.positionIndex = positionIndex;

        rrDrafts.push(rowEntry);
      }

      if (!rrDrafts.length) {
        message.info('Nothing to save in draft yet.');
        return;
      }

      const request = {
        hbuId:              toNum(pickFirst(meta?.hbuId, meta?.hbu)),
        hubSpocId:          toNum(pickFirst(meta?.hubSpocId, meta?.hbuSpoc, meta?.hbu_spoc_id)),
        bandId:             toNum(pickFirst(meta?.bandId, meta?.band)),
        priorityId:         toNum(pickFirst(meta?.priorityId, meta?.priority)),
        lobId:              toNum(pickFirst(meta?.lobId, meta?.lob)),
        demandTypeId:       toNum(pickFirst(meta?.demandTypeId, meta?.demandType)),
        demandTimelineId:   toNum(pickFirst(meta?.demandTimelineId, meta?.demandTimeline)),
        externalInternalId: toNum(pickFirst(meta?.externalInternalId, meta?.externalInternal)),
        statusId:           toNum(pickFirst(meta?.statusId, meta?.status)),
        podId:              toNum(pickFirst(meta?.podId, meta?.pod)),
        pmoSpocId:          toNum(pickFirst(meta?.pmoSpocId, meta?.pmoSpoc)),
        pmoId:              toNum(pickFirst(meta?.pmoId, meta?.pmo)),
        salesSpocId:        toNum(pickFirst(meta?.salesSpocId, meta?.salesSpoc)),
        hiringManagerId:    toNum(pickFirst(meta?.hiringManagerId, meta?.hiringManager)),
        deliveryManagerId:  toNum(pickFirst(meta?.deliveryManagerId, meta?.deliveryManager)),
        skillClusterId:     toNum(pickFirst(meta?.skillClusterId, meta?.skillCluster?.value, meta?.skillCluster)),
        experience:         String(pickFirst(meta?.experience, '') ?? ''),
        remark:             String(pickFirst(meta?.remark, '') ?? ''),
        numberOfPositions:  toNum(pickFirst(meta?.numberOfPositions, meta?.noOfPositions)) ?? rowCount,
        flag: true,
        demandReceivedDate: String(pickFirst(meta?.demandReceivedDate, '')),
        primarySkillIds:    toNumArr(pickFirst(meta?.primarySkillIds, meta?.primarySkillsId, meta?.primarySkills)),
        secondarySkillIds:  toNumArr(pickFirst(meta?.secondarySkillIds, meta?.secondarySkillsId, meta?.secondarySkills)),
        locationIds:        toNumArr(pickFirst(meta?.locationIds, meta?.demandLocationId, meta?.demandLocation)),
        rrDrafts,
      };

      await updateDraft({ draftId: draftIdLocal, request, files });
      message.success('Draft updated.');
      navigate("/drafts1");

      // Clear stored draftId so new flows don't prefill
      try { localStorage.removeItem('step1DraftId'); } catch {}

      // Go to drafts list or keep user here — you choose:
      // navigate('/drafts1');
    } catch (err) {
      console.error('[Step‑2 Save Draft] error:', err);
      message.error(err?.response?.data?.message || err?.message || 'Could not save draft.');
    }
  };

  // ---------- Submit (final) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!meta) return;

    if (rowCount === 0) {
      message.error('No rows to submit. Please go back to Step 1.');
      return;
    }

    // RR validation
    const invalidRR = Array.from({ length: rowCount }).some((_, idx) => {
      const v = rrNumbers[idx];
      return v === undefined || v === '' || isNaN(Number(v)) || Number(v) < 0;
    });
    if (invalidRR) {
      message.warning('Please provide valid RR numbers (non-negative).');
      return;
    }

    // Per-row validation
    for (let idx = 0; idx < rowCount; idx++) {
      const mode = rowMode[idx];
      if (!mode) {
        message.warning(`Please choose input for row #${idx + 1}.`);
        return;
      }
      if (mode === 'file') {
        if (!rowFiles[idx]) {
          message.warning(`Please attach JD for row #${idx + 1}.`);
          return;
        }
        const msg = validateFile(rowRawFiles[idx] || rowFiles[idx]);
        if (msg) {
          setRowErrors((prev) => ({ ...prev, [idx]: msg }));
          message.warning(`Row ${idx + 1}: ${msg}`);
          return;
        }
      } else if (mode === 'text') {
        const t = (rowText[idx] || '').trim();
        if (!t) {
          message.warning(`Please enter text (JD) for row #${idx + 1}.`);
          return;
        }
        const words = countWords(t);
        if (words > WORD_LIMIT) {
          message.warning(`Text exceeds ${WORD_LIMIT} words for row #${idx + 1}. Current: ${words}`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const files = [];
      const rrs = [];

      for (let idx = 0; idx < rowCount; idx++) {
        let f = null;
        let fileName = null;

        if (rowMode[idx] === 'file') {
          f = rowFiles[idx];
        } else {
          const content = (rowText[idx] || '').trim();
          const blob = new Blob([content], { type: 'text/plain' });
          const fname = `JD_row${idx + 1}.txt`;
          try {
            f = new File([blob], fname, { type: 'text/plain' });
          } catch {
            blob.lastModifiedDate = new Date();
            blob.name = fname;
            f = blob;
          }
        }

        if (f) {
          fileName = f.name || `JD_row${idx + 1}.txt`;
          files.push(f);
        } else {
          fileName = `JD_row${idx + 1}.txt`;
        }

        rrs.push({
          rrNumber: Number(rrNumbers[idx] || 0),
          fileName,
        });
      }

      // Build Step‑2 payload
      const payload = {
        rrs,
        bandId:             toNum(pickFirst(meta?.bandId, meta?.band)),
        deliveryManagerId:  toNum(pickFirst(meta?.deliveryManagerId, meta?.deliveryManager)),
        demandLocationId:   toNumArr(pickFirst(meta?.demandLocationId, meta?.locationIds, meta?.demandLocation)),
        demandTimelineId:   toNum(pickFirst(meta?.demandTimelineId, meta?.demandTimeline)),
        demandTypeId:       toNum(pickFirst(meta?.demandTypeId, meta?.demandType)),
        experience:         String(pickFirst(meta?.experience, '') || ''),
        externalInternalId: toNum(pickFirst(meta?.externalInternalId, meta?.externalInternal)),
        hbuId:              toNum(pickFirst(meta?.hbuId, meta?.hbu)),
        hbuSpocId:          toNum(pickFirst(meta?.hbuSpocId, meta?.hubSpocId, meta?.hbu_spoc_id)),
        hiringManagerId:    toNum(pickFirst(meta?.hiringManagerId, meta?.hiringManager)),
        lobId:              toNum(pickFirst(meta?.lobId, meta?.lob)),
        numberOfPositions:  toNum(pickFirst(meta?.numberOfPositions, meta?.noOfPositions)),
        pmoId:              toNum(pickFirst(meta?.pmoId, meta?.pmo)),
        pmoSpocId:          toNum(pickFirst(meta?.pmoSpocId, meta?.pmoSpoc)),
        podId:              toNum(pickFirst(meta?.podId, meta?.pod)),
        primarySkillsId:    toNumArr(pickFirst(meta?.primarySkillsId, meta?.primarySkillIds, meta?.primarySkills)),
        priorityId:         toNum(pickFirst(meta?.priorityId, meta?.priority)),
        projectManagerId:   toNum(pickFirst(meta?.projectManagerId, meta?.pm)),
        remark:             String(pickFirst(meta?.remark, '') || ''),
        salesSpocId:        toNum(pickFirst(meta?.salesSpocId, meta?.salesSpoc)),
        secondarySkillsId:  toNumArr(pickFirst(meta?.secondarySkillsId, meta?.secondarySkillIds, meta?.secondarySkills)),
        skillClusterId:     toNum(pickFirst(meta?.skillClusterId, meta?.skillCluster?.value, meta?.skillCluster)),
        statusId:           toNum(pickFirst(meta?.statusId, meta?.status)),
      };

      // Build multipart: 'payload' + 'files'
      const formData = new FormData();
      formData.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      files.forEach((f) => formData.append('files', f, f.name));

      const res = await submitStep2(formData);
      const server = res?.data ?? res;

      message.success('Demands created successfully.');

      // Clear stored draftId so new flows don't prefill
      try { localStorage.removeItem('step1DraftId'); } catch {}

      // Go to Demand Sheet
      navigate("/demandsheet1");
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error('[Step2] submit error:', { status, data, err });
      message.error(data?.message || data?.detail || err?.message || 'Step 2 failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!draftIdNum) {
    return (
      <Layout>
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          No draftId found. Please complete Step‑1 first.
        </div>
      </Layout>
    );
  }

  if (!meta || loadingMeta) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-72">
          <Spin />
          <span className="ml-3 text-gray-600">Loading Step‑2…</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="flex top-0 flex-col w-full m-0 p-0">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-center">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Submit Demands</h1>
            </div>
          </div>
        </div>

        {/* Rows */}
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-4 sm:mt-6">
          <div className="rounded-xl bg-white shadow-sm border border-gray-200">
            <div className="px-4 sm:px-6 pt-6">
              <div className="grid grid-cols-[90px_150px_1fr] sm:grid-cols-[110px_180px_1fr] items-center gap-3 sm:gap-4">
                <div className="text-gray-700 font-medium">Serial</div>
                <div className="text-gray-700 font-medium">Enter RR No.</div>
                <div className="text-gray-700 font-medium">JD Input</div>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-6">
              <div className="mt-4 space-y-2">
                {rowCount === 0 ? (
                  <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    No rows available. Please go back to Step 1.
                  </div>
                ) : (
                  Array.from({ length: rowCount }).map((_, idx) => {
                    const mode = rowMode[idx] || 'file';
                    return (
                      <div
                        key={`row-${idx}`}
                        className="grid grid-cols-[90px_150px_1fr] sm:grid-cols-[110px_180px_1fr] items-start gap-3 sm:gap-4 rounded-lg bg-white p-3 sm:p-4 border border-gray-200 shadow-sm"
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          const f = e.dataTransfer?.files?.[0] || null;
                          if (!f) return;
                          setRowMode((prev) => ({ ...prev, [idx]: 'file' }));
                          handleSelectedFile(idx, f);
                        }}
                      >
                        {/* Serial */}
                        <div className="inline-flex w-12 items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                          #{idx + 1}
                        </div>

                        {/* RR number */}
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="\d{6}"
                          value={rrNumbers[idx] ?? ''}
                          onChange={(e) => onChangeRR(idx, e.target.value)}
                          placeholder="RR No."
                          className="w-2/3 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />

                        {/* JD Input row */}
                        <div className="flex items-start gap-3">
                          {/* LEFT: content */}
                          <div className="flex-1 min-w-0">
                            {mode === 'text' ? (
                              <div className="w-full">
                                <textarea
                                  rows={4}
                                  placeholder={`Paste or type JD text (max ${WORD_LIMIT} words)…`}
                                  value={rowText[idx] ?? ''}
                                  onChange={(e) => setRowText((p) => ({ ...p, [idx]: e.target.value }))}
                                  className="w-full h-20 md:w-11/12 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                              </div>
                            ) : (
                              <div
                                className={`flex-1 min-w-0 h-12 rounded-md border px-3 py-2 text-xs flex items-center justify-between cursor-pointer ${
                                  rowFiles[idx]
                                    ? 'border-green-300 bg-green-50 text-green-800'
                                    : 'border-dashed border-gray-300 text-gray-600 bg-gray-50'
                                }`}
                                title="You can also drop a file here"
                                onClick={() => triggerFileDialog(idx)}
                              >
                                <span className="truncate">
                                  {rowFiles[idx] ? rowFiles[idx].name : 'Drop here or click Attach JD'}
                                </span>
                                <input
                                  ref={(el) => setFileRef(idx, el)}
                                  type="file"
                                  accept=".txt,.pdf,.doc,.docx,image/*"
                                  onChange={(e) => onFileChange(idx, e)}
                                  className="sr-only"
                                  aria-hidden="true"
                                />
                              </div>
                            )}
                          </div>

                          {/* RIGHT: controls */}
                          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                            <button
                              type="button"
                              onClick={() => clearRowFile(idx)}
                              className={`inline-flex items-center justify-center rounded px-2 py-1 text-xs border border-gray-300 ${
                                mode === 'file' && rowFiles[idx] ? 'bg-white text-gray-700 hover:bg-gray-50' : 'invisible'
                              }`}
                            >
                              Clear
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setRowMode((p) => ({ ...p, [idx]: 'file' }));
                                setTimeout(() => triggerFileDialog(idx), 0);
                              }}
                              className="inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-white text-xs font-semibold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
                            >
                              Attach JD
                            </button>

                            <button
                              type="button"
                              onClick={() => setRowMode((p) => ({ ...p, [idx]: 'text' }))}
                              className={`inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                                mode === 'text' ? 'invisible' : ''
                              }`}
                            >
                              Add Text
                            </button>
                          </div>
                        </div>

                        {/* Row error */}
                        {rowErrors[idx] ? (
                          <div className="col-span-full text-xs text-red-700">⚠ {rowErrors[idx]}</div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-4">
            <div className="flex justify-end gap-3">
              {/* Previous -> go back to Step‑1 route with draftId */}
              <button
                type="button"
                onClick={() => {
                  if (draftIdNum) {
                    localStorage.setItem('step1DraftId', String(draftIdNum));
                    navigate('/addDemands1', { state: { draftId: draftIdNum, __fromStep2: true } });
                  } else {
                    navigate('/addDemands1');
                  }
                }}
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-white text-sm font-semibold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
              >
                Previous
              </button>

              {/* Save Draft */}
              <button
                type="button"
                onClick={onSaveDraft}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Save Draft
              </button>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  submitting ||
                  rowCount === 0 ||
                  Array.from({ length: rowCount }).some((_, idx) => {
                    const v = rrNumbers[idx];
                    return v === undefined || v === '' || isNaN(Number(v)) || Number(v) < 0;
                  }) ||
                  Array.from({ length: rowCount }).some((_, idx) => {
                    const mode = rowMode[idx];
                    if (!mode) return true;
                    if (mode === 'file') return !rowFiles[idx];
                    if (mode === 'text') return !(rowText[idx] || '').trim();
                    return true;
                  })
                }
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-white text-sm font-semibold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'Submit Demands'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
}