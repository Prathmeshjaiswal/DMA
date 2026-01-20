
// src/pages/Step2.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitStep2 } from '../../api/Demands/addDemands';
import {message} from "antd";

export default function AddDemands2() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const form1Data = state?.form1Data ?? null;
  const REQUIRE_FILE = true;
  const [submitting, setSubmitting] = useState(false);

  // Redirect if don't have form1data
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

  const [rrNumbers, setRrNumbers] = useState([]);

//   Initialize RR numbers whenever demandIds change
//   useEffect(() => {
//     setRrNumbers(demandIds.map((_, idx) => 1000 + idx + 1));
//   }, [demandIds]);
  
//  File handling 
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  const validateFile = (f) => {
    if (!f) return REQUIRE_FILE ? "Please select a file." : "";

    if (f.size === 0) return "Selected file is empty.";
    if (f.size >= MAX_BYTES) return "File too large. It must be less than 5 MB.";
    return "";
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    const msg = validateFile(f);
    setError(msg);
    setFile(msg ? null : f);
  };

  const triggerFileDialog = () => fileRef.current?.click();

  const clearFile = () => {
    setFile(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const onChangeRR = (index, value) => {
    setRrNumbers((prev) => {
      const next = [...prev];
      next[index] = value === '' ? '' : Number(value);
      return next;
    });
  };

  //  Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form1Data) return;
    if (demandIds.length === 0) {
      alert('No demand IDs found in backend response. Please go back to Step 1.');
      return;
    }

//     Validate RR numbers (must be numbers >= 0)
//     const invalidRR = rrNumbers.some((n) => n === '' || Number.isNaN(Number(n)) || Number(n) < 0);
//     if (invalidRR) {
//       alert('Please provide valid RR numbers (non-negative).');
//       return;
//     }

    // Validate file before submit
    const currentFile = fileRef.current?.files?.[0] ?? null;
    const msg = validateFile(currentFile);
    if (msg) {
      setError(msg);
      if (REQUIRE_FILE) return; // block submit if required
    } else {
      setError("");
    }

    setSubmitting(true);

    try {
      // Build DTO with backend IDs + user-entered RR numbers
      const addNewDemandDTO = {
        ...form1Data,
        demandRRDTOList: demandIds.map((id, idx) => ({
          demandId: id,
          rrNumber: Number(rrNumbers[idx]),
        })),
      };
      const res = await submitStep2({ addNewDemandDTO, file: currentFile });
      const serverResponse = res?.data ?? res;
      message.success('Demand has been created successfully!');
      navigate('/DemandSheet1', {
        state: {
          form1Data: addNewDemandDTO,
          serverResponse,
          fileName: currentFile?.name ?? null,
        },
      });
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error('[Step2] submit error:', { status, data, err });

//       alert(
//         `Step 2 failed: ${err.message}` +
//         (status ? ` (HTTP ${status})` : '') +
//         (data ? `\nServer says: ${typeof data === 'string' ? data : JSON.stringify(data)}` : '')
//       );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    


<div className="min-h-screen">
  <div className="mx-auto w-full max-w-6xl px-6 pt-6">
    <hr className="border-gray-200" />
  </div>

  <form onSubmit={handleSubmit} className="flex flex-col">
    {/* Page header (simple) */}
    <div className="mx-auto w-full max-w-6xl px-6 mt-6">
      <div className="flex items-center justify-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit Demands</h1>
          <p className="mt-1 text-sm text-gray-600">
            Map generated demand IDs to RR numbers and attach the JD file.
          </p>
        </div>
      </div>
    </div>

    {/* Demand mapping section */}
    <section className="mx-auto w-full max-w-6xl px-6 mt-6">
      <div className="rounded-xl bg-white shadow-sm border border-gray-200">
        <div className="px-6 pt-6">
          <div className="grid grid-cols-[160px_1fr_60px_1fr] items-center gap-4">
            <div className="text-gray-700 font-medium">Demand Id</div>
            <div className="text-gray-700 font-medium">Generated</div>
            <div />
            <div className="text-gray-700 font-medium">Enter RR No.</div>
          </div>
        </div>

        {/* Demand rows */}
        <div className="px-6 pb-6">
          <div className="mt-4 space-y-4">
            {demandIds.length === 0 ? (
              <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                No demand IDs found in backend response. Please go back to Step 1.
              </div>
            ) : (
              demandIds.map((id, idx) => (
                <div
                  key={id}
                  className="grid grid-cols-[160px_1fr_60px_1fr] items-center gap-4 rounded-lg bg-white p-4 border border-gray-200 shadow-sm"
                >
                  <div className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                    Demand #{idx + 1}
                  </div>

                  {/* Demand ID (readonly) */}
                  <input
                    type="text"
                    value={id}
                    readOnly
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />

                  {/* Arrow separator */}
                  <div className="flex items-center justify-center text-gray-400">
                    <span className="select-none text-lg">↔︎</span>
                  </div>

                  {/* RR Number */}
                  <input
                    type="number"
                    min={0}
                    value={rrNumbers[idx] ?? ""}
                    onChange={(e) => onChangeRR(idx, e.target.value)}
                    placeholder="Enter RR No."
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>

    {/* File attach section */}
    <section className="mx-auto w-full max-w-6xl px-6 mt-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 pt-6">
          <h2 className="text-lg font-bold text-gray-900">Attach Job Description</h2>
          <p className="mt-1 text-sm text-gray-600">
            Max size: <strong>&lt; 5 MB</strong>
          </p>
        </div>

        <div className="px-6 py-6 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={triggerFileDialog}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-white font-semibold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
          >
            Attach JD
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="*/*"
            onChange={onFileChange}
            className="sr-only"
            aria-hidden="true"
          />

          <div
            className="flex-1 h-11 rounded-md bg-[#8FA58A] px-4 py-2 border border-[#52624E] shadow-sm text-white/95 flex items-center justify-between"
            role="status"
            aria-live="polite"
          >
            <span className="truncate">
              {file
                ? file.name
                : REQUIRE_FILE
                ? "No file selected (required)"
                : "No file selected"}
            </span>

            {file && (
              <button
                type="button"
                onClick={clearFile}
                className="ml-3 inline-flex items-center justify-center rounded px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error text */}
        {error && (
          <div className="px-6 pb-3 text-sm text-red-700">⚠ {error}</div>
        )}

        {/* Helper text */}
        <div className="px-6 pb-6 text-xs text-gray-600">
          Ensure the JD outlines role, responsibilities, and required skills.
        </div>
      </div>
    </section>

    {/* Footer actions */}
    <footer className="mt-8 pb-12">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate("/addDemands8")}
              className="w-full sm:w-1/2 inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-white font-semibold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
            >
              Previous
            </button>

            <button
              type="submit"
              disabled={submitting || (REQUIRE_FILE && !file) || !!error}
              className="w-full sm:w-1/2 inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-white font-semibold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Demands"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  </form>
</div>
  );
}
