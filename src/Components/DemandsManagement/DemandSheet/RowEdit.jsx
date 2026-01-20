
import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Button, message,Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { makeGetFieldOptions } from "./dropDownOptions";
import { submitUpdateDemand } from "../../api/Demands/updateDemands"; 

export default function RowEdit({
  row,
  columns,
  visibleColumns,
  dropdowns,
  onSaved,    // optional: (updatedEntity) => void
  cancelEdit, // optional: () => void
}) {
  const dateFields = useMemo(() => ["demandReceivedDate"], []);
  const [draft, setDraft] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setDraft(row ?? {});
  }, [row]);

  const getFieldOptions = useMemo(() => makeGetFieldOptions(dropdowns), [dropdowns]);
  const hasOptions = (opts) => Array.isArray(opts) && opts.length > 0;

  const onDraftChange = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  // File selection 
  const beforeSelectFile = (file) => {
    const okExt = /\.(pdf|png|jpg|jpeg|txt|doc|docx)$/i.test(file.name);
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!okExt) {
      message.warning("Only pdf, png, jpg, jpeg, txt, doc, docx are allowed.");
      return Upload.LIST_IGNORE;
    }
    if (!isLt10M) {
      message.warning("File must be smaller than 10 MB.");
      return Upload.LIST_IGNORE;
    }
    setUploadFile(file);
    return false; // block auto upload
  };

  const onActionsUploadChange = (info) => {
    const latest = info.file;
    if (latest?.status === "removed") setUploadFile(null);
    else if (latest?.originFileObj) setUploadFile(latest.originFileObj);
  };

  const actionsFileList = uploadFile
    ? [{ uid: "selected-file", name: uploadFile.name ?? "Selected file", status: "done" }]
    : [];

  // ---------- Helpers: sanitize + date normalization ----------
  const sanitizePayload = (obj) => {
    if (obj == null) return obj;
    const out = Array.isArray(obj) ? [] : {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined) {
        // Use null Change to "" if your backend prefers empty string.
        out[k] = null;
      } else if (v && typeof v === "object" && !(v instanceof File)) {
        out[k] = sanitizePayload(v);
      } else {
        out[k] = v;
      }
    });
    return out;
  };

  const normalizeDates = (payload, toISO = false) => {
    dateFields.forEach((k) => {
      const v = payload[k];
      if (!v) return;
      if (toISO) {
        const dt = new Date(v);
        if (!isNaN(dt.getTime())) payload[k] = dt.toISOString();
      } else {
        // keep as 'YYYY-MM-DD'
        payload[k] = v;
      }
    });
  };

  const validateDraft = () => {
    const errs = [];
    if (!draft?.demandId) errs.push("demandId is required");
    return errs;
  };

  //  Save
  const handleSave = async () => {
    const errors = validateDraft();
    if (errors.length) {
      message.error(errors[0]);
      return;
    }

    setIsSaving(true);
    try {
      const updateDemandDTO = sanitizePayload({ ...draft });
      console.log(updateDemandDTO)
      normalizeDates(updateDemandDTO, /* toISO: */ false);
      const updatedEntity = await submitUpdateDemand({
        updateDemandDTO,
        file: uploadFile ?? null,
      });

      message.success(`Demand updated successfully!`);
      navigate(0)
      onSaved?.(updatedEntity);
      cancelEdit?.();
    } catch (err) {
      console.error(err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save. Please try again.";
      message.error(serverMsg);
    } finally {
      setIsSaving(false);
    }
  };
// "Java,python" -> ["Java", "python"]
const toList = (s) =>
  (typeof s === 'string' ? s : String(s ?? ''))
    .split(',')
    .map(v => v.trim())
    .filter(v => v.length > 0);

// Dedupe while preserving order (case-insensitive)
const dedupe = (arr) => {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    const key = v.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(v);
    }
  }
  return out;
};



// ["Java","python"] -> "Java, python"
const toDisplayString = (arr) => (Array.isArray(arr) ? arr.join(', ') : String(arr ?? ''));
  return (
    <tr key={row?.demandId ?? "editing-row"} className="hover:bg-gray-50">
      {columns
        .filter((c) => visibleColumns.includes(c.key))
        .map((col) => {
          const value = draft[col.key];

          if (col.key === "demandId") {
            const linkClass =
              "inline-flex justify-center rounded-md bg-olive-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-olive-700";
            return (
              <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                <Link
                  to={`/demands/${row.demandId}`}
                  className={`${linkClass} transition-all duration-200`}
                  style={{ backgroundColor: "#6b8e23" }}
                  title="View details"
                >
                  {row.demandId}
                </Link>
              </td>
            );
          }

          if (col.key === "rrNumber") {
            return (
              <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                  {row.rrNumber}
              </td>
            );
          }
          if (col.key === "lob") {
            return (
              <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                  {row.lob}
              </td>
            );
          }
            const multiSelectFields = new Set(['skillCluter', 'primarySkills', 'secondarySkills']);
            const apiOpts = getFieldOptions(col.key);
            const isMulti = multiSelectFields.has(col.key);

          if (hasOptions(apiOpts)) {

              if (isMulti) {
                // 1) Parse selected values from the draft string
                const selectedList = dedupe(toList(value));       
                const selectedSet = new Set(selectedList.map(v => v.toLowerCase()));
                const mergedOptions = [
                ...apiOpts,
                ...selectedList
                    .filter(v => !apiOpts.some(o => String(o.value).toLowerCase() === v.toLowerCase()))
                    .map(v => ({ label: v, value: v }))               // injected options for missing selections
                ];

                return (
                <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                    
                        <Select
                        mode="multiple"
                        placeholder="Please select"
                        value={selectedList}                          // <-- controlled array
                        onChange={(nextArray) => {                    // nextArray: string[]
                            onDraftChange(col.key, toDisplayString(nextArray)); // store "a, b, c"
                        }}
                        style={{ width: '100%' }}
                        options={mergedOptions}                       // [{label, value}]
                        disabled={isSaving}
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        maxTagCount="responsive"
                        />

                </td>
                );
            }
            return (
              <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                <select
                  value={value ?? ""}
                  onChange={(e) => onDraftChange(col.key, e.target.value)}
                  className="w-40 rounded-md border border-gray-300 bg-white p-2 text-sm"
                  disabled={isSaving}
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {apiOpts.map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </td>
            );
          }

          if (dateFields.includes(col.key)) {
            return (
              <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                <input
                  type="date"
                  value={value ?? ""}
                  onChange={(e) => onDraftChange(col.key, e.target.value)}
                  className="w-40 rounded-md border border-gray-300 bg-white p-2 text-sm"
                  disabled={isSaving}
                />
              </td>
            );
          }

          return (
            <td key={col.key} className="border-b border-gray-200 px-4 py-3">
              <input
                type="text"
                value={value ?? ""}
                onChange={(e) => onDraftChange(col.key, e.target.value)}
                className="w-40 rounded-md border border-gray-300 bg-white p-2 text-sm"
                disabled={isSaving}
              />
            </td>
          );
        })}

      {/* Actions */}
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Upload
            multiple={false}
            maxCount={1}
            fileList={actionsFileList}
            beforeUpload={beforeSelectFile}
            onChange={onActionsUploadChange}
            showUploadList={{ showRemoveIcon: true }}
            listType="text"
            accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
            disabled={isSaving}
          >
            <Button size="small" icon={<UploadOutlined />} disabled={isSaving}>
              Attach file
            </Button>
          </Upload>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white shadow-sm ${
              isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>

          <button
            type="button"
            onClick={cancelEdit}
            disabled={isSaving}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 ${
              isSaving ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}
