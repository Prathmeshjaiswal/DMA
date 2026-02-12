
import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Button, message, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { submitUpdateDemand } from "../../api/Demands/updatedemands";

/** Map backend lists [{id,name}] -> [{label,value}] */
const toOptions = (list) =>
  Array.isArray(list)
    ? list.map((x) => ({
        label: String(x?.name ?? "").trim(),
        value: Number(x?.id),
      })).filter(o => o.label && Number.isFinite(o.value))
    : [];

/** try to resolve id(s) from names string (CSV) or array of names */
const namesToIds = (options, value) => {
  if (!options?.length || value == null) return [];
  const labels = Array.isArray(value)
    ? value.map((s) => String(s).trim()).filter(Boolean)
    : String(value).split(",").map((s) => s.trim()).filter(Boolean);
  const map = new Map(options.map((o) => [o.label.toLowerCase(), o.value]));
  const ids = [];
  labels.forEach((name) => {
    const id = map.get(name.toLowerCase());
    if (id != null) ids.push(id);
  });
  return Array.from(new Set(ids));
};

const ONE = (options, name) => {
  const ids = namesToIds(options, name);
  return ids.length ? ids[0] : null;
};

export default function RowEdit({
  row,
  columns,
  visibleColumns,
  dropdowns,     // <-- expect full lists from getDropDownData()
  onSaved,
  cancelEdit,
}) {
  const navigate = useNavigate();

  // Build Select options map once
  const dd = dropdowns || {};
  const opt = useMemo(() => ({
    skillCluster:       toOptions(dd.skillClusterList),
    primarySkills:      toOptions(dd.primarySkillsList),
    secondarySkills:    toOptions(dd.secondarySkillsList),
    hiringManager:      toOptions(dd.hiringManagerList),
    deliveryManager:    toOptions(dd.deliveryManagerList),
    pm:                 toOptions(dd.projectManagerList),
    pmoSpoc:            toOptions(dd.pmoSpocList),
    salesSpoc:          toOptions(dd.salesSpocList),
    hbu:                toOptions(dd.hbuList),
    demandTimeline:     toOptions(dd.demandTimelineList),
    demandType:         toOptions(dd.demandTypeList),
    demandLocation:     toOptions(dd.demandLocationList),
    priority:           toOptions(dd.priorityList),
    status:             toOptions(dd.statusList),
    pod:                toOptions(dd.podList),
    band:               toOptions(dd.bandList),
  }), [dropdowns]);

  // Draft state – keep raw row fields for non-select inputs
  const [draft, setDraft] = useState({});
  // Select state – keep selected IDs for dropdown fields
  const [sel, setSel] = useState({
    skillClusterId: null,
    primarySkillsId: [],
    secondarySkillsId: [],
    hiringManagerId: null,
    deliveryManagerId: null,
    projectManagerId: null,
    pmoSpocId: null,
    salesSpocId: null,
    hbuId: null,
    demandTimelineId: null,
    demandTypeId: null,
    demandLocationId: [],
    priorityId: null,
    statusId: null,
    podId: null,
    bandId: null,
  });

  const [uploadFile, setUploadFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(row ?? {});
  }, [row]);

  // Prefill Selects from row names (match by label)
  useEffect(() => {
    if (!row) return;
    setSel((prev) => ({
      ...prev,
      skillClusterId: ONE(opt.skillCluster, row.skillCluster),
      primarySkillsId: namesToIds(opt.primarySkills, row.primarySkills),
      secondarySkillsId: namesToIds(opt.secondarySkills, row.secondarySkills),
      hiringManagerId: ONE(opt.hiringManager, row.hiringManager),
      deliveryManagerId: ONE(opt.deliveryManager, row.deliveryManager),
      projectManagerId: ONE(opt.pm, row.pm),
      pmoSpocId: ONE(opt.pmoSpoc, row.pmoSpoc),
      salesSpocId: ONE(opt.salesSpoc, row.salesSpoc),
      hbuId: ONE(opt.hbu, row.hbu),
      demandTimelineId: ONE(opt.demandTimeline, row.demandTimeline),
      demandTypeId: ONE(opt.demandType, row.demandType),
      demandLocationId: namesToIds(opt.demandLocation, row.demandLocation),
      priorityId: ONE(opt.priority, row.priority),
      statusId: ONE(opt.status, row.status),
      podId: ONE(opt.pod, row.pod),
      bandId: ONE(opt.band, row.band),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row, opt.skillCluster, opt.primarySkills, opt.secondarySkills, opt.hiringManager, opt.deliveryManager, opt.pm, opt.pmoSpoc, opt.salesSpoc, opt.hbu, opt.demandTimeline, opt.demandType, opt.demandLocation, opt.priority, opt.status, opt.pod, opt.band]);

  const onDraftChange = (key, value) =>
    setDraft((d) => ({ ...d, [key]: value }));

  // File selection (optional)
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

  // ---------- SAVE ----------
  const handleSave = async () => {
    const backendId = row?.id ?? draft?.id;
    const idNum = Number(backendId);
    if (!Number.isFinite(idNum)) {
      message.error(`Record id is invalid. Got "${backendId}".`);
      return;
    }
    // Optional RR validation
    if (draft?.rrNumber !== undefined && draft.rrNumber !== "") {
      const n = Number(draft.rrNumber);
      if (!Number.isFinite(n) || n < 0) {
        message.error("RR Number must be a non-negative number.");
        return;
      }
    }

    // Build minimal payload of changed fields
    const edited = {
      rrNumber: draft?.rrNumber === "" ? undefined : (draft?.rrNumber != null ? Number(draft.rrNumber) : undefined),
      experience: draft?.experience,
      remark: draft?.remark,

      // map selects to payload IDs
      skillClusterId: sel.skillClusterId,
      primarySkillsId: sel.primarySkillsId,
      secondarySkillsId: sel.secondarySkillsId,
      hiringManagerId: sel.hiringManagerId,
      deliveryManagerId: sel.deliveryManagerId,
      projectManagerId: sel.projectManagerId,
      pmoSpocId: sel.pmoSpocId,
      salesSpocId: sel.salesSpocId,
      hbuId: sel.hbuId,
      demandTimelineId: sel.demandTimelineId,
      demandTypeId: sel.demandTypeId,
      demandLocationId: sel.demandLocationId,
      priorityId: sel.priorityId,
      statusId: sel.statusId,
      podId: sel.podId,
      bandId: sel.bandId,
    };

    // Drop undefined/empty (so we only send changed/meaningful fields)
    const updateDemandDTO = {};
    Object.entries(edited).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        if (v.length) updateDemandDTO[k] = v;
      } else if (v !== undefined && v !== null && v !== "") {
        updateDemandDTO[k] = v;
      }
    });

    if (!Object.keys(updateDemandDTO).length && !uploadFile) {
      message.info("Nothing to update.");
      return;
    }

    try {
      setIsSaving(true);

if (uploadFile) {
  updateDemandDTO.fileName = uploadFile.name;
  updateDemandDTO.filenameHint = uploadFile.name.replace(/\.[^/.]+$/, '') || 'JD';
  updateDemandDTO.clearJd = false;
  // optionally: updateDemandDTO.jdText = null;
}

      const resp=await submitUpdateDemand({
        id: idNum,
        updateDemandDTO,
        file: uploadFile ?? null,   // optional
      });

      if(resp) {message.success("Demand updated successfully!");
      navigate(0);
      onSaved?.(updateDemandDTO);
      cancelEdit?.();
      }
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

  const multiSelectKeys = new Set([
    "primarySkills", "secondarySkills", "demandLocation"
  ]);

  // Render a dropdown cell for a given column key (single/multi)
  const renderSelectCell = (colKey, placeholder = "Select…") => {
    let options = [];
    let value;
    let onChange;
    let mode; // undefined or "multiple"

    switch (colKey) {
      case "skillCluster":
        options = opt.skillCluster; value = sel.skillClusterId ?? null;
        onChange = (v) => setSel((s) => ({ ...s, skillClusterId: v ?? null }));
        break;
      case "primarySkills":
        options = opt.primarySkills; value = sel.primarySkillsId;
        onChange = (v) => setSel((s) => ({ ...s, primarySkillsId: v || [] })); mode = "multiple";
        break;
      case "secondarySkills":
        options = opt.secondarySkills; value = sel.secondarySkillsId;
        onChange = (v) => setSel((s) => ({ ...s, secondarySkillsId: v || [] })); mode = "multiple";
        break;
      case "hiringManager":
        options = opt.hiringManager; value = sel.hiringManagerId ?? null;
        onChange = (v) => setSel((s) => ({ ...s, hiringManagerId: v ?? null }));
        break;
      case "deliveryManager":
        options = opt.deliveryManager; value = sel.deliveryManagerId ?? null;
        onChange = (v) => setSel((s) => ({ ...s, deliveryManagerId: v ?? null }));
        break;
      case "pm":
        options = opt.pm; value = sel.projectManagerId ?? null;
        onChange = (v) => setSel((s) => ({ ...s, projectManagerId: v ?? null }));
        break;
      case "pmoSpoc":
        options = opt.pmoSpoc; value = sel.pmoSpocId ?? null;
        onChange = (v) => setSel((s) => ({ ...s, pmoSpocId: v ?? null }));
        break;
      case "salesSpoc":
        options = opt.salesSpoc; value = sel.salesSpocId ?? null;
        onChange = (v) => setSel((s) => ({ ...s, salesSpocId: v ?? null }));
        break;
      case "hbu":
        options = opt.hbu; value = sel.hbuId ?? null;
        onChange = (v) => setSel((s) => ({ ...s, hbuId: v ?? null }));
        break;
      case "demandTimeline":
        options = opt.demandTimeline; value = sel.demandTimelineId ?? null;
        onChange = (v) => setSel((s) => ({ ...s, demandTimelineId: v ?? null }));
        break;
      case "demandType":
        options = opt.demandType; value = sel.demandTypeId ?? null;
        onChange = (v) => setSel((s) => ({ ...s, demandTypeId: v ?? null }));
        break;
      case "demandLocation":
        options = opt.demandLocation; value = sel.demandLocationId;
        onChange = (v) => setSel((s) => ({ ...s, demandLocationId: v || [] })); mode = "multiple";
        break;
      case "priority":
        options = opt.priority; value = sel.priorityId ?? null;
        onChange = (v) => setSel((s) => ({ ...s, priorityId: v ?? null }));
        break;
      case "status":
        options = opt.status; value = sel.statusId ?? null;
        onChange = (v) => setSel((s) => ({ ...s, statusId: v ?? null }));
        break;
      case "pod":
        options = opt.pod; value = sel.podId ?? null;
        onChange = (v) => setSel((s) => ({ ...s, podId: v ?? null }));
        break;
      default:
        return null;
    }

    return (
      <Select
        style={{ width: '100%' }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        options={options}
        mode={mode}
        allowClear
        showSearch
        optionFilterProp="label"
        disabled={isSaving}
      />
    );
  };

  // Render
  return (
    <tr key={row?.demandId ?? "editing-row"} className="hover:bg-gray-50">
      {columns
        .filter((c) => visibleColumns.includes(c.key))
        .map((col) => {
          const colKey = col.key;
          const value = draft[colKey];

          if (colKey === "demandId") {
            const linkClass =
              "inline-flex justify-center rounded-md bg-olive-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-olive-700";
            return (
              <td key={colKey} className="border-b border-gray-200 px-4 py-3">
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

          // Dropdown-rendered keys
          const dropdownKeys = new Set([
            "skillCluster","primarySkills","secondarySkills","hiringManager","deliveryManager",
            "pm","pmoSpoc","salesSpoc","hbu","demandTimeline","demandType","demandLocation",
            "priority","status","pod"
          ]);

          if (dropdownKeys.has(colKey)) {
            return (
              <td key={colKey} className="border-b border-gray-200 px-4 py-3" style={{ minWidth: 180 }}>
                {renderSelectCell(colKey, `Select ${col.label}`)}
              </td>
            );
          }

          // Non-dropdown special cases
          if (colKey === "rrNumber") {
            return (
              <td key={colKey} className="border-b border-gray-200 px-4 py-3">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={draft.rrNumber ?? ""}
                  onChange={(e) => onDraftChange("rrNumber", e.target.value)}
                  className="w-32 rounded-md border border-gray-300 bg-white p-2 text-sm"
                  disabled={isSaving}
                />
              </td>
            );
          }

          // Dates if you want inline datepicker later:
          // if (colKey === "demandReceivedDate") { ... }

          // Fallback text input (experience, remark, etc.)
          return (
            <td key={colKey} className="border-b border-gray-200 px-4 py-3">
              <input
                type="text"
                value={value ?? ""}
                onChange={(e) => onDraftChange(colKey, e.target.value)}
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
              Attach JD
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