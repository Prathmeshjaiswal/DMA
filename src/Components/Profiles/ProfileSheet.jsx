

// ================== src/pages/Profiles/ProfileSheet.jsx ==================
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal, message, Tabs, Checkbox } from "antd";
import { PlusOutlined, EyeOutlined, PaperClipOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import Layout from "../Layout.jsx";
import ProfileTable from "./ProfileTable.jsx";

import {
  getProfiles,
  getProfileDropdowns,
  submitProfileUpdate,
  downloadProfileCv,
  searchProfilesApi,
} from "../api/Profiles/addProfile.js";

import { getDemandsheet } from "../api/Demands/getDemands.js";
import {
  attachDemandsToProfileApi,
  getDemandsByProfileApi,
} from "../api/Profiles/attachedDemand.js";

/* ---------- role helpers ---------- */
function tryJson(s) { try { return JSON.parse(s); } catch { return null; } }
function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch { return null; }
}
function getCurrentRoleName() {
  const mem = (window.__currentUser && (window.__currentUser.role?.role || window.__currentUser.role)) || null;
  if (mem) return String(mem);
  const candidates = [
    tryJson(localStorage.getItem("loginResponse")),
    tryJson(localStorage.getItem("user")),
    tryJson(localStorage.getItem("authUser")),
    tryJson(localStorage.getItem("currentUser")),
  ].filter(Boolean);
  for (const u of candidates) {
    const r = u?.role;
    if (r?.role) return String(r.role);
    if (typeof r === "string") return r;
    if (u?.roleName) return String(u.roleName);
  }
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const payload = token ? decodeJwt(token) : null;
  if (payload?.role) return String(payload.role);
  return "";
}
const isRDGRole = (roleName) => String(roleName || "").toLowerCase().includes("rdg");
const isAdminRole = (roleName) => String(roleName || "").toLowerCase().includes("admin");
function getCurrentUserId() {
  const mem =
    window.__currentUser?.userId ||
    window.__currentUser?.id ||
    window.__currentUser?.employeeId ||
    window.__currentUser?.empId;
  if (mem) return String(mem).trim();
  const candidates = [
    tryJson(localStorage.getItem("loginResponse")),
    tryJson(localStorage.getItem("user")),
    tryJson(localStorage.getItem("authUser")),
    tryJson(localStorage.getItem("currentUser")),
  ].filter(Boolean);
  for (const u of candidates) {
    const id = u?.userId ?? u?.id ?? u?.employeeId ?? u?.empId ?? u?.username;
    if (id) return String(id).trim();
  }
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const payload = token ? decodeJwt(token) : null;
  if (payload) {
    const id = payload.userId ?? payload.empId ?? payload.sub;
    if (id) return String(id).trim();
  }
  return "";
}

/* ---------- adapters ---------- */
const safe = (x) => (Array.isArray(x) ? x : []);
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
const resolveLabel = (optsArr, id) => {
  if (!Array.isArray(optsArr) || id == null) return undefined;
  const found = optsArr.find((o) => String(o.value) === String(id));
  return found?.label;
};
const resolveLabelsFromIds = (optsArr, ids = []) => {
  if (!Array.isArray(optsArr) || !Array.isArray(ids)) return "";
  const set = new Set(ids.map((v) => String(v)));
  return optsArr.filter((o) => set.has(String(o.value))).map((o) => o.label).join(", ");
};

function adaptRow(item) {
  const pick = (...keys) => {
    for (const k of keys) {
      const v = item?.[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return undefined;
  };

  const candidateName = asText(pick("candidateName", "name"));
  const emailId = asText(pick("emailId", "email"));
  const phoneNumber = asText(pick("phoneNumber", "phone"));
  const experience = pick("experience", "experienceYears", "expYears");

  const location = asText(pick("locationName", "location", "locationLabel"));
  const hbu = asText(pick("hbuName", "hbu", "hbuLabel"));
  const skillCluster = asText(pick("skillClusterName", "skillCluster", "skillClusterLabel"));
  const externalInternal = asText(pick("externalInternalName", "externalInternal"));

  const locationId = pick("locationId") ?? (item?.location && Number(item.location.id)) ?? undefined;
  const hbuId = pick("hbuId") ?? (item?.hbu && Number(item.hbu.id)) ?? undefined;
  const skillClusterId = pick("skillClusterId") ?? (item?.skillCluster && Number(item.skillCluster.id)) ?? undefined;
  const externalInternalId = pick("externalInternalId") ?? (item?.externalInternal && Number(item.externalInternal.id)) ?? undefined;

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
    safe(pick("primarySkills", "primarySkillNames")).map((n) => n?.name ?? n).join(", ") ||
    "";
  const secondarySkills =
    asText(pick("secondarySkillsText")) ||
    safe(pick("secondarySkills", "secondarySkillNames")).map((n) => n?.name ?? n).join(", ") ||
    "";

  const summary = asText(pick("summary", "remark", "notes"));
  const cvFileName = asText(pick("cvFileName", "cvPath", "resumeFileName", "fileName"));
  const empId = asText(pick("empId", "employeeId", "empID"));

  const createdByUserId = asText(pick("createdByUserId", "createdBy", "createdById", "createdByUser"));
  const updatedByUserId = asText(pick("updatedByUserId", "updatedBy", "updatedById", "updatedByUser"));
  const createdAt = pick("createdAt", "created_on");
  const updatedAt = pick("updatedAt", "updated_on");

  return {
    id: pick("id", "profileId"),
    profileId: pick("profileId", "id"),
    candidateName,
    emailId,
    phoneNumber,
    experienceYears: experience ?? "",
    empId,
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
    createdByUserId,
    updatedByUserId,
    createdAt,
    updatedAt,
  };
}

/* ---------- utils ---------- */
const formatDateTime = (v) => {
  if (!v) return "-";
  try {
    const d = new Date(v);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return String(v);
  }
};


export default function ProfileSheet() {
  const navigate = useNavigate();

  /* modal */
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [activeViewTab, setActiveViewTab] = useState("profile");

  /* attach */
  const [matchingDemands, setMatchingDemands] = useState([]);
  const [selectedDemandIds, setSelectedDemandIds] = useState([]);
  const [attachedDemands, setAttachedDemands] = useState([]);
  const [attachMode, setAttachMode] = useState(false);

  const [demandMetaById, setDemandMetaById] = useState({});
  const demandMetaRef = useRef({});
  useEffect(() => { demandMetaRef.current = demandMetaById; }, [demandMetaById]);

  /* role */
  const roleName = getCurrentRoleName();
  const adminView = isAdminRole(roleName);
  const showEmpId = isRDGRole(roleName) || isAdminRole(roleName);
  const currentUserId = useMemo(() => getCurrentUserId(), []);

  const ALL_COLUMNS = [
    { key: "candidateName", label: "Candidate Name" },
    { key: "emailId", label: "Email ID" },
    { key: "empId", label: "Employee ID" },
    { key: "phoneNumber", label: "Phone" },
    { key: "experienceYears", label: "Exp (yrs)" },
    { key: "skillCluster", label: "Skill Cluster" },
    { key: "primarySkills", label: "Primary Skills" },
    { key: "secondarySkills", label: "Secondary Skills" },
    { key: "location", label: "Location" },
    { key: "hbu", label: "HBU" },
    { key: "summary", label: "Summary" },
  ];
  const defaultVisible = [
    "candidateName",
    "emailId",
    ...(showEmpId ? ["empId"] : []),
    "phoneNumber",
    "experienceYears",
    "skillCluster",
    "primarySkills",
    "secondarySkills",
    "location",
    "hbu",
  ];

  /* paging */
  const [rows, setRows] = useState([]);
  const [visibleColumns] = useState(defaultVisible);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [dropdownOptions, setDropdownOptions] = useState({});
  const [query, setQuery] = useState({});

  /* dropdowns */
  const loadDropdowns = useCallback(async () => {
    try {
      const dto = await getProfileDropdowns();
      setDropdownOptions(adaptOptions(dto));
    } catch { }
  }, []);

  /* build filter (EXACT phone/emp/email; contains name; exact/range experience) */
  const buildServerFilter = useCallback(() => {
    const filter = {};
    const clean = (s) => String(s ?? "").trim();

    if (clean(query.candidateName)) filter.candidateName = clean(query.candidateName);
    if (clean(query.emailId)) filter.emailId = clean(query.emailId);

    // empId exact, ignore placeholder '-'
    if (clean(query.empId) && clean(query.empId) !== "-") {
      filter.empId = clean(query.empId);
    }

    // phone: digits only (exact)
    if (query.phoneNumber != null) {
      const digits = clean(query.phoneNumber).replace(/\D+/g, "");
      if (digits) filter.phoneNumber = Number(digits);
    }

    // experience: single -> exact (min=max), range "x-y"
    if (clean(query.experienceYears)) {
      const s = clean(query.experienceYears);
      if (s.includes("-")) {
        const [a, b] = s.split("-").map((t) => Number(String(t).trim()));
        if (Number.isFinite(a)) filter.minExperience = a;
        if (Number.isFinite(b)) filter.maxExperience = b;
      } else {
        const exp = Number(s);
        if (!Number.isNaN(exp)) {
          filter.minExperience = exp;
          filter.maxExperience = exp;
        }
      }
    }

    if (clean(query.skillCluster)) filter.skillClusterName = clean(query.skillCluster);
    if (clean(query.location)) filter.locationName = clean(query.location);
    if (clean(query.hbu)) filter.hbuName = clean(query.hbu);

    if (clean(query.primarySkills)) {
      const names = String(query.primarySkills)
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (names.length) filter.primarySkillNames =  names;
    }
    if (clean(query.secondarySkills)) {
      const names = String(query.secondarySkills)
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (names.length) filter.secondarySkillNames =  names;
    }

    if (clean(query.summary)) filter.summary = clean(query.summary);

    if (!adminView) filter.createdByUserId = currentUserId;

    return filter;
  }, [query, adminView, currentUserId]);

  /* fetch */
  const fetchServer = useCallback(
    async (nextPage = page, nextSize = size) => {
      setLoading(true);
      try {
        const filter = buildServerFilter();
        // Always use searchProfilesApi for non-admins to enforce user-based filtering
        const forceSearch = !adminView;
        const hasAnyFilter = Object.keys(filter).length > (adminView ? 0 : 1);
        const resp = (hasAnyFilter || forceSearch)
          ? await searchProfilesApi(filter, nextPage, nextSize)
          : await getProfiles(nextPage, nextSize);

        const adapted = Array.isArray(resp.items) ? resp.items.map((it) => adaptRow(it)) : [];
        // Frontend filter: for non-admins, only show profiles created by current user
        const filteredRows = adminView
          ? adapted
          : adapted.filter((row) => String(row.createdByUserId) === String(currentUserId));
        setRows(filteredRows);
        setTotal(resp.totalElements ?? adapted.length);
        setPage(resp.page ?? nextPage);
        setSize(resp.size ?? nextSize);
      } catch (e) {
        message.error(e?.message || "Failed to load profiles");
      } finally {
        setLoading(false);
      }
    },
    [page, size, buildServerFilter, adminView]
  );

  /* initial */
  useEffect(() => { loadDropdowns(); }, [loadDropdowns]);
  useEffect(() => { fetchServer(0, size); /* eslint-disable-next-line */ }, []);

  /* header search — set query only; DEBOUNCE actual fetch */
  const handleQueryChange = (key, value) => {
    setQuery((prev) => ({ ...prev, [key]: value }));
  };

  // *** DEBOUNCED: run fetch 250ms after the latest keystroke, with LATEST query
  useEffect(() => {
    const t = setTimeout(() => fetchServer(0, size), 250);
    return () => clearTimeout(t);
  }, [query, size, fetchServer]);

  /* pagination */
  const handlePageChange = (nextPage) => { fetchServer(nextPage, size); };
  const handlePageSizeChange = (nextSize) => { fetchServer(0, nextSize); };

  /* inline update */
  const handleSavePatch = async (id, patch) => {
    if (!id) throw new Error("Profile id not found for update");
    await submitProfileUpdate(id, patch, null);

    setRows((prev) =>
      prev.map((r) => {
        const rowId = r.id ?? r.profileId;
        if (String(rowId) !== String(id)) return r;

        const next = { ...r };
        if (patch.experience != null) next.experienceYears = patch.experience;
        if (patch.emailId != null) next.emailId = patch.emailId;
        if (patch.summary != null) next.summary = patch.summary;
        if (patch.candidateName != null) next.candidateName = patch.candidateName;
        if (patch.phoneNumber != null) next.phoneNumber = patch.phoneNumber;
        if (patch.empId != null) next.empId = patch.empId;

        if (patch.locationId != null) next.locationId = patch.locationId;
        if (patch.hbuId != null) next.hbuId = patch.hbuId;
        if (patch.skillClusterId != null) next.skillClusterId = patch.skillClusterId;

        if (Array.isArray(patch.primarySkillsIds)) next.primarySkillsArray = patch.primarySkillsIds;
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

    await fetchServer(page, size);
  };

  /* attachments */
  const loadAttachedFromBackend = useCallback(async (profileId) => {
    try {
      let list = await getDemandsByProfileApi(profileId);
      if (!Array.isArray(list)) {
        const maybeData = list?.data;
        if (Array.isArray(maybeData)) list = maybeData;
        else if (Array.isArray(list?.items)) list = list.items;
        else list = [];
      }
      const metaIndex = demandMetaRef.current;
      const mapped = list.map((x) => {
        const key = String(x.demandId ?? x.id ?? "");
        const meta = key ? metaIndex[key] : undefined;
        return {
          trackerId: x.id,
          id: x.demandId ?? x.id,
          demandId: x.demandId ?? x.id,
          hbu: x.hbu?.name || meta?.hbu || "",
          skillCluster: meta?.skillCluster || "",
          primarySkills:
            meta?.primarySkills ||
            (Array.isArray(x.primarySkills)
              ? x.primarySkills.map((r) => r?.name).filter(Boolean).join(", ")
              : ""),
          attachedDate: x.attachedDate,
          createdAt: x.createdAt,
          title: [meta?.skillCluster || "", x.hbu?.name || meta?.hbu || ""]
            .filter(Boolean).join(" • "),
        };
      });
      setAttachedDemands(mapped);
      setAttachMode(mapped.length === 0);
      setSelectedDemandIds(mapped.map((d) => String(d.id)));
    } catch (err) {
      console.error("Failed to load demands by profile:", err);
      message.error(err?.message || "Failed to load attached demands");
      setAttachedDemands([]);
      setAttachMode(true);
    }
  }, []);

  const loadMatchingDemands = useCallback(async (row) => {
    if (!row) { setMatchingDemands([]); return; }
    // Try to get hbuId from row (prefer id over name)
    const hbuId = row.hbuId || row.hbu_id || row.hbu_id_fk || null;

    try {
      // Pass hbuId to backend for filtering
      const resp = await getDemandsheet(0, 200, hbuId);
      const list =
        Array.isArray(resp?.data?.content) ? resp.data.content :
          Array.isArray(resp?.content) ? resp.content :
            Array.isArray(resp) ? resp :
              [];

      const normalized = list.map((d) => {
        const id = d.id ?? d.demandId ?? d.displayDemandId ?? Math.random();
        const nameOf = (obj) => (obj && typeof obj === "object" ? (obj.name ?? "") : String(obj ?? ""));
        const join = (arr) => (Array.isArray(arr) ? arr.map((x) => nameOf(x)).filter(Boolean).join(", ") : nameOf(arr));
        return {
          id,
          demandId: d.displayDemandId ?? d.demandId ?? String(id),
          hbu: nameOf(d.hbu),
          skillCluster: nameOf(d.skillCluster),
          primarySkills: join(d.primarySkills),
          title: [nameOf(d.skillCluster), nameOf(d.hbu)].filter(Boolean).join(" • "),
        };
      });

      const metaEntries = {};
      for (const n of normalized) {
        const key = String(n.id);
        metaEntries[key] = {
          hbu: n.hbu || "",
          skillCluster: n.skillCluster || "",
          primarySkills: n.primarySkills || "",
        };
      }
      setDemandMetaById((prev) => ({ ...prev, ...metaEntries }));

      const already = new Set(attachedDemands.map((a) => String(a.id)));
      // No need to filter by HBU here, backend already filtered
      const filtered = normalized.filter(
        (d) => !already.has(String(d.id))
      );
      setMatchingDemands(filtered);
    } catch (err) {
      console.error("loadMatchingDemands error:", err);
      message.error(err?.message || "Failed to load matching demands");
      setMatchingDemands([]);
    }
  }, [attachedDemands]);

  const onViewRow = (row) => {
    setDetailRow(row);
    setDetailOpen(true);
    setActiveViewTab("demand");
  };
  useEffect(() => {
    if (detailOpen && activeViewTab === "demand" && detailRow) {
      const rawId = detailRow.id ?? detailRow.profileId;
      const numericProfileId = Number(rawId);
      if (!numericProfileId || Number.isNaN(numericProfileId)) {
        message.warning("Cannot load attachments without a valid profile id");
        return;
      }
      loadAttachedFromBackend(numericProfileId).then(() => loadMatchingDemands(detailRow));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailOpen, activeViewTab, detailRow]);

  const closeDetails = () => {
    setDetailOpen(false);
    setDetailRow(null);
    setActiveViewTab("profile");
    setMatchingDemands([]);
    setSelectedDemandIds([]);
    setAttachedDemands([]);
    setAttachMode(false);
  };

  const toggleSelect = (id, checked) => {
    const rowId = String(id);
    setSelectedDemandIds((prev) => {
      const s = new Set(prev.map(String));
      if (checked) s.add(rowId); else s.delete(rowId);
      return Array.from(s);
    });
  };

  const attachSelected = async () => {
    if (!detailRow) return;

    const rawId = detailRow.id ?? detailRow.profileId;
    const profileId = Number(rawId);
    if (!profileId || Number.isNaN(profileId)) {
      message.error("Invalid profile id for attachment");
      return;
    }

    const ids = Array.from(new Set(
      selectedDemandIds.map((x) => Number(x)).filter((n) => !Number.isNaN(n))
    ));
    if (ids.length === 0) {
      message.warning("Select at least one demand to attach");
      return;
    }

    try {
      await attachDemandsToProfileApi(profileId, ids);
      message.success("Demands attached to profile");

      const selSet = new Set(selectedDemandIds.map(String));
      const selectedObjs = matchingDemands.filter((d) => selSet.has(String(d.id)));
      const nowIso = new Date().toISOString();
      const optimisticCards = selectedObjs.map((n) => ({
        trackerId: `tmp-${n.id}-${Date.now()}`,
        id: n.id,
        demandId: n.demandId ?? n.id,
        hbu: n.hbu || "",
        skillCluster: n.skillCluster || "",
        primarySkills: n.primarySkills || "",
        attachedDate: n.attachedDate || nowIso,
        createdAt: nowIso,
        title: [n.skillCluster || "", n.hbu || ""].filter(Boolean).join(" • "),
      }));

      setAttachedDemands((prev) => {
        const map = new Map(prev.map((x) => [String(x.id), x]));
        for (const c of optimisticCards) map.set(String(c.id), c);
        return Array.from(map.values());
      });

      setMatchingDemands((prev) => prev.filter((d) => !selSet.has(String(d.id))));
      setSelectedDemandIds([]);
      setAttachMode(false);

      await loadAttachedFromBackend(profileId);
      if (detailRow) loadMatchingDemands(detailRow);
    } catch (err) {
      console.error("attachSelected error:", err);
      const backendMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to attach demands";
      message.error(backendMsg);
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

          {!adminView && (
            <div className="text-xs text-gray-600 mb-2">
              Viewing profiles created by you (User ID:{" "}
              <span className="font-semibold">{currentUserId || "-"}</span>)
            </div>
          )}

          {/* Table — server-driven list + search */}
          <ProfileTable
            rows={rows}
            columns={ALL_COLUMNS}
            visibleColumns={visibleColumns}
            onViewRow={onViewRow}
            onDownload={downloadProfileCv ? (row) => downloadProfileCv(row.cvFileName) : undefined}
            onSavePatch={handleSavePatch}
            dropdownOptions={dropdownOptions}
            serverPage={page}
            serverSize={size}
            serverTotal={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            query={query}
            onQueryChange={handleQueryChange}
          />
        </div>
      </Layout>

      {/* DETAILS MODAL */}
      <Modal
        open={detailOpen}
        onCancel={closeDetails}
        footer={null}
        width={900}
        zIndex={2000}
        getContainer={false}
        destroyOnHidden
        maskClosable
        title={
          <div className="flex items-center justify-between pr-10">
            <div className="flex items-center gap-2 text-gray-800">
              <EyeOutlined />
              <span className="text-sm font-bold">Profile View</span>
            </div>
          </div>
        }
      >
        {detailRow ? (
          <Tabs
            activeKey={activeViewTab}
            onChange={setActiveViewTab}
            items={[
              {
                key: "profile",
                label: "Profile Details",
                children: (
                  <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-1">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <h3 className="text-sm font-semibold mb-3">Basic Info</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        <div><strong>Candidate:</strong> {detailRow.candidateName || "-"}</div>
                        <div><strong>Email:</strong> {detailRow.emailId || "-"}</div>
                        <div><strong>Phone:</strong> {detailRow.phoneNumber || "-"}</div>
                        <div><strong>Experience:</strong> {detailRow.experienceYears || "-"}</div>
                        <div><strong>Location:</strong> {detailRow.location || "-"}</div>
                        <div><strong>HBU:</strong> {detailRow.hbu || "-"}</div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <h3 className="text-sm font-semibold mb-3">Skills</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        <div><strong>Skill Cluster:</strong> {detailRow.skillCluster || "-"}</div>
                        <div><strong>Primary Skills:</strong> {detailRow.primarySkills || "-"}</div>
                        <div className="sm:col-span-2"><strong>Secondary Skills:</strong> {detailRow.secondarySkills || "-"}</div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <h3 className="text-sm font-semibold mb-3">Summary</h3>
                      <div>{detailRow.summary || "-"}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: "demand",
                label: "Demand Details",
                children: (
                  <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Demands</h4>
                      {!attachMode && attachedDemands.length > 0 ? (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAttachMode(true)}>
                          Attach Demand
                        </Button>
                      ) : null}
                    </div>

                    {!attachMode && attachedDemands.length > 0 && (
                      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">Attached Demands</h4>
                          <span className="text-[12px] text-gray-500">
                            {attachedDemands.length} attached
                          </span>
                        </div>

                        {/* --- inside Demand Details tab -> attachedDemands.map(...) --- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {attachedDemands.map((d) => (
                            <div
                              key={`${String(d.trackerId || d.id)}`}
                              className="border border-gray-200 rounded-md p-3 shadow-sm bg-white"
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-semibold text-[13px]">
                                  Demand #{d.demandId ?? d.id}
                                </div>
                                <div className="text-[11px] text-gray-500 text-right">
                                 {d.attachedDate ? formatDateTime(d.attachedDate) : formatDateTime(d.attachedDate)}
                                </div>
                              </div>

                              {/* REMOVED title line to avoid duplicate HBU/Skill text */}
                              {/* !!d.title && (
        <div className="text-[12px] text-gray-700 mt-1">{d.title}</div>
      ) */}

                              {/* UPDATED: Keep only these three lines in this order */}
                              {!!d.hbu && (
                                <div className="text-[12px] text-gray-600 mt-1">{/* UPDATED */}
                                  <strong>HBU:</strong> {d.hbu}
                                </div>
                              )}
                              {!!d.skillCluster && (
                                <div className="text-[12px] text-gray-600">{/* UPDATED */}
                                  <strong>Skill Cluster:</strong> {d.skillCluster}
                                </div>
                              )}
                              {!!d.primarySkills && (
                                <div className="text-[12px] text-gray-600">{/* UPDATED */}
                                  <strong>Primary:</strong> {d.primarySkills}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(attachMode || attachedDemands.length === 0) && (
                      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold">Attach Demands</h3>
                          <div className="flex items-center gap-2">
                            {attachedDemands.length > 0 && (
                              <Button onClick={() => setAttachMode(false)}>Back</Button>
                            )}
                            <Button
                              type="default"
                              icon={<PaperClipOutlined />}
                              onClick={attachSelected}
                              className="bg-gray-900 text-white hover:bg-black"
                            >
                              Attach
                            </Button>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-md">
                          {Array.isArray(matchingDemands) && matchingDemands.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                              {matchingDemands.map((item) => {
                                const rowId = String(item.id);
                                const checked = selectedDemandIds.map(String).includes(rowId);
                                const toggle = (next) => toggleSelect(rowId, next);
                                const cbId = `attach-demand-${rowId}`;

                                return (
                                  <div
                                    key={rowId}
                                    className="px-3 py-2 hover:bg-gray-50"
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 12,
                                      paddingLeft: 12,
                                      paddingRight: 12,
                                    }}
                                  >
                                    <Checkbox
                                      id={cbId}
                                      checked={checked}
                                      onChange={(e) => toggle(e.target.checked)}
                                    />
                                    <label
                                      htmlFor={cbId}
                                      className="min-w-0 cursor-pointer select-none flex-1"
                                      onClick={() => toggle(!checked)}
                                    >
                                      <div className="font-medium">Demand #{item.demandId ?? item.id}</div>
                                      <div className="text-gray-700">{item.title}</div>
                                      <div className="text-gray-500 text-[12px]">
                                        Primary: {item.primarySkills || "-"}
                                      </div>
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm px-3 py-6">
                              No matching demands (HBU) for this profile.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "history",
                label: "History",
                children: (
                  <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-1">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        <div><strong>Created By (User ID):</strong> {detailRow.createdByUserId || "-"}</div>
                        <div><strong>Created At:</strong> { formatDateTime(detailRow.createdAt)}</div>
                        <div><strong>Updated By (User ID):</strong> {detailRow.updatedByUserId || "-"}</div>
                        <div><strong>Updated At:</strong> { formatDateTime(detailRow.updatedAt)}</div>
                        <div>
                          <strong>Status:</strong>{" "}
                          {String(detailRow.isActive ?? "") === "" ? "-" : detailRow.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <div className="text-center text-gray-500 py-6">No details available</div>
        )}
      </Modal>
    </>
  );
}