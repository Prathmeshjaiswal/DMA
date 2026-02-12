// ================== src/pages/Profiles/ProfileSheet.jsx ==================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Modal, message } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import Layout from "../Layout.jsx";
import ProfileTable from "./ProfileTable.jsx";

import {
  getProfiles,
  getProfileDropdowns,
  submitProfileUpdate,
  downloadProfileCv,
} from "../api/addProfile.js";

/* ------------ Helpers to get role -> RDG/TA for column visibility & filtering ------------ */
// UPDATED: role readers
function tryJson(s) { try { return JSON.parse(s); } catch { return null; } }
function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch { return null; }
}
function getCurrentRoleName() { // UPDATED
  const fromMem = (window.__currentUser && (window.__currentUser.role?.role || window.__currentUser.role)) || null;
  if (fromMem) return String(fromMem);

  const candidates = [
    tryJson(localStorage.getItem("loginResponse")),
    tryJson(localStorage.getItem("user")),
    tryJson(localStorage.getItem("authUser")),
    tryJson(localStorage.getItem("currentUser")),
  ].filter(Boolean);

  for (const u of candidates) {
    const roleObj = u?.role;
    if (roleObj?.role) return String(roleObj.role);
    if (typeof roleObj === "string") return roleObj;
    if (u?.roleName) return String(u.roleName);
  }

  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const payload = token ? decodeJwt(token) : null;
  if (payload?.role) return String(payload.role);

  return "";
}
const isRDGRole = (roleName) => String(roleName || "").toLowerCase().includes("rdg"); // UPDATED
const isTARole  = (roleName) => String(roleName || "").toLowerCase().includes("ta");  // UPDATED

// Helpers to resolve labels from options
const resolveLabel = (optsArr, id) => {
  if (!Array.isArray(optsArr) || id == null) return undefined;
  const found = optsArr.find((o) => String(o.value) === String(id));
  return found?.label;
};

const resolveLabelsFromIds = (optsArr, ids = []) => {
  if (!Array.isArray(optsArr) || !Array.isArray(ids)) return "";
  const set = new Set(ids.map((v) => String(v)));
  return optsArr
    .filter((o) => set.has(String(o.value)))
    .map((o) => o.label)
    .join(", ");
};

/* Adapt dropdowns to {label, value} arrays */
const safe = (x) => (Array.isArray(x) ? x : []);

// helper: force value to printable string
const asText = (v) => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(asText).filter(Boolean).join(", ");
  if (typeof v === "object") return String(v.name ?? v.label ?? v.value ?? "");
  return String(v);
};

function adaptOptions(dto = {}) {
  const toOpt = (arr) =>
    safe(arr).map((x) => ({ label: String(x?.name ?? ""), value: String(x?.id ?? "") }));
  return {
    externalInternal: toOpt(dto.externalInternals),
    hbu: toOpt(dto.hbus),
    demandLocation: toOpt(dto.locations),
    primarySkills: toOpt(dto.primarySkills),
    secondarySkills: toOpt(dto.secondarySkills),
    skillCluster: toOpt(dto.skillClusters),
  };
}

/* Convert backend item -> table row (no serialNo) */
function adaptRow(item) {
  const pick = (...keys) => {
    for (const k of keys) {
      const v = item?.[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return undefined;
  };

  // Names (force string)
  const candidateName = asText(pick("candidateName", "name"));
  const emailId = asText(pick("emailId", "email"));
  const phoneNumber = asText(pick("phoneNumber", "phone"));
  const experience = pick("experience", "experienceYears", "expYears");

  // Labels (force string)
  const location = asText(pick("locationName", "location", "locationLabel"));
  const hbu = asText(pick("hbuName", "hbu", "hbuLabel"));
  const skillCluster = asText(pick("skillClusterName", "skillCluster", "skillClusterLabel"));
  const externalInternal = asText(pick("externalInternalName", "externalInternal"));

  // IDs for editing (fallback to nested objects)
  const locationId =
    pick("locationId") ?? (item?.location && Number(item.location.id)) ?? undefined;
  const hbuId =
    pick("hbuId") ?? (item?.hbu && Number(item.hbu.id)) ?? undefined;
  const skillClusterId =
    pick("skillClusterId") ?? (item?.skillCluster && Number(item.skillCluster.id)) ?? undefined;
  const externalInternalId =
    pick("externalInternalId") ?? (item?.externalInternal && Number(item.externalInternal.id)) ?? undefined;

  // Skills arrays/labels with fallback from object arrays
  const primarySkillsArray = (() => {
    const ids = safe(pick("primarySkillsIds", "primarySkillIds")).map(Number);
    if (ids.length) return ids;
    return safe(item?.primarySkills).map((s) => Number(s?.id)).filter(Boolean);
  })();

  const secondarySkillsArray = (() => {
    const ids = safe(pick("secondarySkillsIds", "secondarySkillIds")).map(Number);
    if (ids.length) return ids;
    return safe(item?.secondarySkills).map((s) => Number(s?.id)).filter(Boolean);
  })();

  const primarySkills =
    asText(pick("primarySkillsText")) ||
    safe(pick("primarySkills", "primarySkillNames"))
      .map((n) => (n?.name ?? n))
      .join(", ") ||
    "";

  const secondarySkills =
    asText(pick("secondarySkillsText")) ||
    safe(pick("secondarySkills", "secondarySkillNames"))
      .map((n) => (n?.name ?? n))
      .join(", ") ||
    "";

  const summary = asText(pick("summary", "remark", "notes"));
  const cvFileName = asText(pick("cvFileName", "cvPath", "resumeFileName", "fileName"));

  // UPDATED: map empId for RDG view/filter
  const empId = asText(pick("empId", "employeeId", "empID")); // UPDATED

  return {
    id: pick("id", "profileId"),
    profileId: pick("profileId", "id"),

    // core fields for UI + patch fallback
    candidateName,
    emailId,
    phoneNumber,
    experienceYears: experience ?? "",

    empId, // UPDATED

    location,
    hbu,
    skillCluster,
    externalInternal,

    locationId,
    hbuId,
    skillClusterId,
    externalInternalId,

    primarySkills,
    secondarySkills,
    primarySkillsArray,
    secondarySkillsArray,

    summary,
    cvFileName,
  };
}

export default function ProfileSheet() {
  const navigate = useNavigate();

  // UPDATED: role-aware visibility + filtering
  const roleName = getCurrentRoleName();        // UPDATED
  const showEmpId = isRDGRole(roleName);        // UPDATED
  const taView    = isTARole(roleName);         // UPDATED

  // Columns (NO Serial No)
  const ALL_COLUMNS = [
    { key: "candidateName",   label: "Candidate Name" },
    { key: "emailId",         label: "Email ID" },
    { key: "empId",           label: "Employee ID" }, // UPDATED
    { key: "phoneNumber",     label: "Phone" },
    { key: "experienceYears", label: "Exp (yrs)" },
    { key: "skillCluster",    label: "Skill Cluster" },
    { key: "primarySkills",   label: "Primary Skills" },
    { key: "secondarySkills", label: "Secondary Skills" },
    { key: "location",        label: "Location" },
    { key: "hbu",             label: "HBU" },
    { key: "summary",         label: "Summary" },
  ];

  // UPDATED: default visible depends on role (RDG gets Employee ID)
  const defaultVisible = [
    "candidateName",
    "emailId",
    ...(showEmpId ? ["empId"] : []), // UPDATED
    "phoneNumber",
    "experienceYears",
    "skillCluster",
    "primarySkills",
    "secondarySkills",
    "location",
    "hbu",
  ];

  const [rows, setRows] = useState([]);
  const [visibleColumns] = useState(defaultVisible);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);     // 0-based
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [dropdownOptions, setDropdownOptions] = useState({});
  const [query, setQuery] = useState({});
  const onQueryChange = (key, value) => setQuery((q) => ({ ...q, [key]: value }));

  const loadDropdowns = useCallback(async () => {
    try {
      const dto = await getProfileDropdowns();
      setDropdownOptions(adaptOptions(dto));
    } catch (e) {
      console.warn("Failed to load profile dropdowns", e);
    }
  }, []);

  const fetchPage = useCallback(async (nextPage = page, nextSize = size) => {
    setLoading(true);
    try {
      const resp = await getProfiles(nextPage, nextSize);
      const items = Array.isArray(resp.items) ? resp.items : [];
      const adapted = items.map((it) => adaptRow(it));
      setRows(adapted);
      setTotal(resp.totalElements ?? adapted.length);
      setPage(resp.page ?? nextPage);
      setSize(resp.size ?? nextSize);
    } catch (e) {
      message.error(e?.message || "Failed to load profiles");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => { loadDropdowns(); }, [loadDropdowns]);
  useEffect(() => { fetchPage(0, size); }, []); // initial load

  const handlePageChange = (nextPage) => { fetchPage(nextPage, size); };
  const handlePageSizeChange = (nextSize) => { fetchPage(0, nextSize); };

  // Update: call API, optimistic merge, then re-fetch
  const handleSavePatch = async (id, patch) => {
    if (!id) throw new Error("Profile id not found for update");

    console.log("[Update] submitProfileUpdate ->", { id, patch });
    const resp = await submitProfileUpdate(id, patch, null);
    console.log("[Update] API response:", resp);

    // 2) Optimistic merge (instant UI)
    setRows((prev) =>
      prev.map((r) => {
        const rowId = r.id ?? r.profileId;
        if (String(rowId) !== String(id)) return r;

        const next = { ...r };

        if (patch.experience != null)     next.experienceYears = patch.experience;
            if (patch.emailId != null)       next.emailId = patch.emailId;
        if (patch.summary != null)        next.summary = patch.summary;
        if (patch.candidateName != null)  next.candidateName = patch.candidateName;
        if (patch.phoneNumber != null)    next.phoneNumber   = patch.phoneNumber;
        if (patch.empId != null)         next.empId = patch.empId; 

        if (patch.locationId != null)     next.locationId     = patch.locationId;
        if (patch.hbuId != null)          next.hbuId          = patch.hbuId;
        if (patch.skillClusterId != null) next.skillClusterId = patch.skillClusterId;

        if (Array.isArray(patch.primarySkillsIds))   next.primarySkillsArray   = patch.primarySkillsIds;
        if (Array.isArray(patch.secondarySkillsIds)) next.secondarySkillsArray = patch.secondarySkillsIds;

        if (patch.locationId != null) {
          next.location = resolveLabel(dropdownOptions.demandLocation, patch.locationId) || next.location;
        }
        if (patch.hbuId != null) {
          next.hbu = resolveLabel(dropdownOptions.hbu, patch.hbuId) || next.hbu;
        }
        if (patch.skillClusterId != null) {
          next.skillCluster = resolveLabel(dropdownOptions.skillCluster, patch.skillClusterId) || next.skillCluster;
        }

        if (Array.isArray(patch.primarySkillsIds)) {
          next.primarySkills = resolveLabelsFromIds(dropdownOptions.primarySkills, patch.primarySkillsIds);
        }
        if (Array.isArray(patch.secondarySkillsIds)) {
          next.secondarySkills = resolveLabelsFromIds(dropdownOptions.secondarySkills, patch.secondarySkillsIds);
        }

        return next;
      })
    );

    // 3) Re-fetch
    await fetchPage(page, size);
  };

  /* Role-based visibility filter + client-side search on current page */
  const filteredRows = useMemo(() => {
    // 1) Role filter
    const hasEmpId = (r) => !!String(r.empId ?? "").trim();
    let base = rows;

    // UPDATED: RDG -> only rows having empId; TA -> only rows without empId; others -> no filter
    if (isRDGRole(roleName)) {
      base = rows.filter(hasEmpId);
    } else if (isTARole(roleName)) {
      base = rows.filter((r) => !hasEmpId(r));
    }

    // 2) Search filter (on visible columns)
    const keys = ALL_COLUMNS
      .filter((c) => visibleColumns.includes(c.key))
      .map((c) => c.key);

    return base.filter((row) =>
      Object.entries(query).every(([k, qVal]) => {
        if (!qVal || !keys.includes(k)) return true;
        const cell = row[k];
        const cellStr = cell == null ? "" : String(cell);
        return cellStr.toLowerCase().includes(String(qVal).toLowerCase());
      })
    );
  }, [rows, query, visibleColumns, roleName]); // UPDATED: depend on roleName

  // details modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  const onViewRow = (row) => { setDetailRow(row); setDetailOpen(true); };
  const closeDetails = () => { setDetailOpen(false); setDetailRow(null); };

  const show = (v) => {
    const s = (v == null || v === "") ? "" : String(v);
    return s || "-";
  };

  // Download using row.cvFileName
  const handleDownload = async (row) => {
    try {
      if (!row?.cvFileName) {
        message.warning("CV file not available.");
        return;
      }
      const blob = await downloadProfileCv(row.cvFileName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = row.cvFileName || "cv.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      message.error(e?.message || "Failed to download CV");
    }
  };

  return (
    <>
      <Layout>
        <div>
          {/* title + add */}
          <div className="mb-4 grid grid-cols-3 w-full items-center">
            <div />
            <div className="text-center">
              <h1 className="text-lg font-bold">Profile Sheet</h1>
            </div>
            <div className="flex items-start justify-end gap-2">
              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={() => navigate("/RDGTATeam")}
                className="bg-green-800 hover:bg-green-900 text-white font-semibold border border-green-900 px-4 py-2"
              >
                Add New Profile
              </Button>
            </div>
          </div>

          {/* Table */}
          <ProfileTable
            rows={filteredRows}
            columns={ALL_COLUMNS}
            visibleColumns={visibleColumns}
            onViewRow={onViewRow}
            onDownload={handleDownload}
            onSavePatch={handleSavePatch}
            dropdownOptions={dropdownOptions}
            serverPage={page}
            serverSize={size}
            serverTotal={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            // search state
            query={query}
            onQueryChange={onQueryChange}
          />
        </div>
      </Layout>

      {/* Details Modal */}
      <Modal
        open={detailOpen}
        onCancel={closeDetails}
        footer={null}
        width={860}
        zIndex={2000}
        getContainer={false}
        destroyOnHidden
        maskClosable
        title={
          <div className="flex items-center justify-between pr-10">
            <div className="flex items-center gap-2 text-gray-800">
              <EyeOutlined />
              <span className="text-sm font-semibold">Profile Details</span>
            </div>
          </div>
        }
      >
        {detailRow ? (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-3">Basic Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <div><strong>Candidate:</strong> {show(detailRow.candidateName)}</div>
                <div><strong>Email:</strong> {show(detailRow.emailId)}</div>
                <div><strong>Phone:</strong> {show(detailRow.phoneNumber)}</div>
                <div><strong>Experience:</strong> {show(detailRow.experienceYears)}</div>
                <div><strong>Location:</strong> {show(detailRow.location)}</div>
                <div><strong>HBU:</strong> {show(detailRow.hbu)}</div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-3">Skills</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <div><strong>Skill Cluster:</strong> {show(detailRow.skillCluster)}</div>
                <div><strong>Primary Skills:</strong> {show(detailRow.primarySkills)}</div>
                <div className="sm:col-span-2"><strong>Secondary Skills:</strong> {show(detailRow.secondarySkills)}</div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-3">Summary</h3>
              <div>{show(detailRow.summary)}</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6">No details available</div>
        )}
      </Modal>
    </>
  );
}