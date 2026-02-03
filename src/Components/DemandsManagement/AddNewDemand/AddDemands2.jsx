import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitStep2 } from '../../api/Demands/addDemands';
import { message } from 'antd';
import Layout from "../../Layout.jsx";
import { saveStep2DraftBulk } from '../../api/Demands/draft';

export default function AddDemands2() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const form1Data = state?.form1Data ?? null;

  const REQUIRE_FILE_PER_ROW = true;
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  const DRAFT_KEY = 'addDemandStep2Draft';

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!form1Data) {
      navigate('/addDemands1', { replace: true });
    }
  }, [form1Data, navigate]);

  // Demand IDs from backend DTO
  const demandIds = useMemo(() => {
    const list = Array.isArray(form1Data?.demandRRDTOList) ? form1Data.demandRRDTOList : [];
    return list.map((item) => item?.demandId).filter(Boolean);
  }, [form1Data]);

  // RR numbers (plain text numeric)
  const [rrNumbers, setRrNumbers] = useState([]); // idx -> string digits

  const onChangeRR = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
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
  const [rowFiles, setRowFiles] = useState({});        // idx -> File to submit
  const [rowRawFiles, setRowRawFiles] = useState({});  // idx -> original selected File
  const [rowErrors, setRowErrors] = useState({});      // idx -> error string
  const [rowMode, setRowMode] = useState({});          // idx -> 'file' | 'text'
  const [rowText, setRowText] = useState({});          // idx -> string (max 5000)

  // Allowed file types
  const isAllowedType = (f) => {
    if (!f) return false;
    const allowedMimes = new Set([
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);
    const mime = f.type || '';
    if (mime.startsWith('image/')) return true; // images allowed as-is
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
    if (!f) return REQUIRE_FILE_PER_ROW ? 'Please select a file.' : '';
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

  // Handle file select (no OCR — images saved as-is)
  const handleSelectedFile = async (idx, f) => {
    const msg = validateFile(f);
    if (msg) {
      setRowErrors((prev) => ({ ...prev, [idx]: msg }));
      setRowFiles(({ [idx]: _, ...rest }) => rest);
      setRowRawFiles(({ [idx]: _, ...rest }) => rest);
      return;
    }
    // Save as-is (including images)
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

  // Drag & drop area handlers
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const onDrop = async (idx, e) => {
    e.preventDefault(); e.stopPropagation();
    const f = e.dataTransfer?.files?.[0] || null;
    if (!f) return;
    setRowMode((prev) => ({ ...prev, [idx]: 'file' }));
    await handleSelectedFile(idx, f);
  };


const saveDraft = async () => {
    try {
      const draftId = localStorage.getItem("step1DraftId");
      if (!draftId) {
        message.warning("No Step-1 draft found. Please save Step-1 draft first.");
        return;
      }

      const files = [];
      const assignments = [];

      demandIds.forEach((id, idx) => {
        const rr = Number(rrNumbers[idx] || 0);
        const mode = rowMode[idx];
        if (mode === 'file') {
          const f = rowFiles[idx];
          if (f) {
            const fileIndex = files.length;
            files.push(f); // keep order
            assignments.push({
              demandId: id,
              rrNumber: rr,
              fileIndex,
            });
          }
        } else if (mode === 'text') {
          const content = (rowText[idx] || '').trim();
          if (content) {
            assignments.push({
              demandId: id,
              rrNumber: rr,
              jdText: content,
              filenameHint: `JD_${id}.txt`,
            });
          }
        }
      });

      if (assignments.length === 0) {
        message.info("Nothing to save in draft yet.");
        return;
      }

      const resp = await saveStep2DraftBulk({ draftId: Number(draftId), assignments }, files);
      if (!resp?.success) throw new Error(resp?.message || "Step-2 draft save failed");
      message.success(resp?.message || "Step-2 draft saved.");
    } catch (err) {
      console.error("[Step2] save draft error:", err);
      message.error(err?.message || "Could not save draft.");
    }
  };


  // Restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft?.byId) return;

      const nextRR = [];
      const nextMode = {};
      const nextText = {};
      demandIds.forEach((id, idx) => {
        const rec = draft.byId[id];
        if (rec) {
          nextRR[idx] = String(rec.rr || '');
          if (rec.mode) nextMode[idx] = rec.mode;
          if (rec.text) nextText[idx] = rec.text;
        }
      });
      setRrNumbers(nextRR);
      setRowMode(nextMode);
      setRowText(nextText);
      message.info('Draft restored.');
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandIds.join(',')]);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form1Data) return;

    if (demandIds.length === 0) {
      message.error('No demand IDs found in backend response. Please go back to Step 1.');
      return;
    }

    // Validate RR numbers
    const invalidRR = demandIds.some((_, idx) => {
      const v = rrNumbers[idx];
      return v === undefined || v === '' || isNaN(Number(v)) || Number(v) < 0;
    });
    if (invalidRR) {
      message.warning('Please provide valid RR numbers (non-negative).');
      return;
    }

    // Validate per-row input
    for (let idx = 0; idx < demandIds.length; idx++) {
      const mode = rowMode[idx];
      if (!mode) {
        message.warning(`Please choose "Add File" or "Add Text" for demand #${idx + 1}.`);
        return;
      }
      if (mode === 'file') {
        if (!rowFiles[idx]) {
          message.warning(`Please attach JD for demand #${idx + 1}.`);
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
          message.warning(`Please enter text (JD) for demand #${idx + 1}.`);
          return;
        }
        if (t.length > 5000) {
          message.warning(`Text exceeds 5000 characters for demand #${idx + 1}.`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      // Build DTO
      const demandRRDTOList = demandIds.map((id, idx) => ({
        demandId: id,
        rrNumber: Number(rrNumbers[idx] || 0),
      }));

      const addNewDemandDTO = {
        ...form1Data,
        demandRRDTOList,
      };

      // Build multipart
      const formData = new FormData();
      formData.append(
        'addNewDemandDTO',
        new Blob([JSON.stringify(addNewDemandDTO)], { type: 'application/json' })
      );

      const filesMeta = [];
      for (let idx = 0; idx < demandIds.length; idx++) {
        const id = demandIds[idx];
        let f = null;

        if (rowMode[idx] === 'file') {
          // attach the selected file as-is (including images)
          f = rowFiles[idx];
        } else {
          // build a text file from typed JD
          const content = (rowText[idx] || '').trim();
          const blob = new Blob([content], { type: 'text/plain' });
          const fname = `JD_${id}.txt`;
          try {
            f = new File([blob], fname, { type: 'text/plain' });
          } catch {
            blob.lastModifiedDate = new Date();
            blob.name = fname;
            f = blob;
          }
        }

        if (f) {
          formData.append('files', f, f.name || `JD_${id}.txt`);
          filesMeta.push({ index: idx, demandId: id });
        }
      }

      formData.append('filesMeta', JSON.stringify(filesMeta));

      const res = await submitStep2(formData);
      const serverResponse = res?.data ?? res;
      message.success('Demand has been created successfully!');
      localStorage.removeItem(DRAFT_KEY);
      navigate('/DemandSheet1', {
        state: { form1Data: addNewDemandDTO, serverResponse },
      });
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error('[Step2] submit error:', { status, data, err });
      message.error(err?.message || 'Step 2 failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="">
        <div className="mx-auto w-full max-w-6xl px-6 pt-6">
          <hr className="border-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Page header */}
          <div className="mx-auto w-full max-w-6xl px-6 mt-6">
            <div className="flex items-center justify-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Submit Demands</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Map generated demand IDs to RR numbers and attach the JD per demand.
                </p>
              </div>
            </div>
          </div>

          {/* Demand mapping rows */}
          <section className="mx-auto w-full max-w-6xl px-6 mt-6">
            <div className="rounded-xl bg-white shadow-sm border border-gray-200">
              {/* Header row (kept Serial # AND ID) */}
              <div className="px-6 pt-6">
                <div className="grid grid-cols-[110px_180px_60px_180px_1fr] items-center gap-4">
                  <div className="text-gray-700 font-medium">Serial</div>
                  <div className="text-gray-700 font-medium">Generated ID</div>
                  <div />
                  <div className="text-gray-700 font-medium">Enter RR No.</div>
                  <div className="text-gray-700 font-medium">JD Input</div>
                </div>
              </div>

              {/* Rows */}
              <div className="px-6 pb-6">
                <div className="mt-4 space-y-4">
                  {demandIds.length === 0 ? (
                    <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                      No demand IDs found in backend response. Please go back to Step 1.
                    </div>
                  ) : (
                    demandIds.map((id, idx) => {
                      const mode = rowMode[idx];
                      return (
                        <div
                          key={id}
                          className="grid grid-cols-[110px_180px_60px_180px_1fr] items-center gap-4 rounded-lg bg-white p-4 border border-gray-200 shadow-sm"
                          onDragOver={onDragOver}
                          onDrop={(e) => onDrop(idx, e)}
                        >
                          {/* Serial Number */}
                          <div className="inline-flex w-12 items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                            #{idx + 1}
                          </div>

                          {/* Demand ID (readonly) */}
                          <input
                            type="text"
                            value={id}
                            readOnly
                            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            title={`Demand ID ${id}`}
                          />

                          {/* Arrow */}
                          <div className="flex items-center justify-center text-gray-400">
                            <span className="select-none text-lg">↔︎</span>
                          </div>

                          {/* RR text */}
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={rrNumbers[idx] ?? ''}
                            onChange={(e) => onChangeRR(idx, e.target.value)}
                            placeholder="RR No."
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />

                          {/* JD Input area */}
                          <div className="flex flex-col gap-2">
                            {/* If no mode selected yet -> radio choices */}
                            {!mode ? (
                              <div className="flex items-center gap-6">
                                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`mode-${idx}`}
                                    value="file"
                                    onChange={() => setRowMode((p) => ({ ...p, [idx]: 'file' }))}
                                  />
                                  <span>Add File</span>
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`mode-${idx}`}
                                    value="text"
                                    onChange={() => setRowMode((p) => ({ ...p, [idx]: 'text' }))}
                                  />
                                  <span>Add Text</span>
                                </label>
                              </div>
                            ) : null}

                            {/* Mode = file */}
                            {mode === 'file' && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => triggerFileDialog(idx)}
                                  className="inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-white text-sm font-semibold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
                                >
                                  Attach JD
                                </button>

                                <input
                                  ref={(el) => setFileRef(idx, el)}
                                  type="file"
                                  accept=".txt,.pdf,.doc,.docx,image/*"
                                  onChange={(e) => onFileChange(idx, e)}
                                  className="sr-only"
                                  aria-hidden="true"
                                />

                                {/* Drop pill */}
                                <div
                                  className={`flex-1 min-w-0 h-10 rounded-md border px-3 py-2 text-xs flex items-center justify-between ${
                                    rowFiles[idx]
                                      ? 'border-green-300 bg-green-50 text-green-800'
                                      : 'border-dashed border-gray-300 text-gray-600 bg-gray-50'
                                  }`}
                                  title="You can also drop a file here"
                                >
                                  <span className="truncate">
                                    {rowFiles[idx] ? rowFiles[idx].name : 'Drop here or click Attach JD'}
                                  </span>
                                  {rowFiles[idx] && (
                                    <button
                                      type="button"
                                      onClick={() => clearRowFile(idx)}
                                      className="ml-3 inline-flex items-center justify-center rounded px-2 py-0.5 text-[11px] bg-white/60 hover:bg-white text-gray-700 border border-gray-300"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Mode = text */}
                            {mode === 'text' && (
                              <div className="relative">
                                <textarea
                                  maxLength={5000}
                                  rows={3}
                                  placeholder="Paste or type JD text (max 5000 characters)…"
                                  value={rowText[idx] ?? ''}
                                  onChange={(e) =>
                                    setRowText((p) => ({ ...p, [idx]: e.target.value }))
                                  }
                                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                                <span className="absolute bottom-2 right-2 text-[11px] text-gray-500">
                                  {(rowText[idx]?.length ?? 0)}/5000
                                </span>
                              </div>
                            )}

                            {/* Per-row error */}
                            {rowErrors[idx] ? (
                              <div className="text-xs text-red-700">⚠ {rowErrors[idx]}</div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Footer actions (right aligned, smaller buttons, with Save Draft in the middle) */}
          <footer className="mt-8 pb-12">
            <div className="mx-auto w-full max-w-6xl px-6">
              <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-4">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/addDemands1')}
                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-white text-sm font-semibold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={saveDraft}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Save Draft
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      demandIds.some((_, idx) => !!rowErrors[idx]) ||
                      demandIds.some((_, idx) => {
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
          </footer>
        </form>
      </div>
    </Layout>
  );
}
