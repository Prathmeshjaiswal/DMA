
// ================== src/pages/Profiles/ProfileSheet.jsx ==================
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import Layout from "../Layout.jsx";
import ProfileTable from "./ProfileTable.jsx";
// src/Components/Profiles/ProfileSheet.jsx
import ProfileView from "./ProfileView.jsx"

import {
  getProfiles,
  getProfileDropdowns,
  submitProfileUpdate,
  downloadProfileCv,
  searchProfilesApi,
} from "../api/Profiles/addProfile.js";

/* --------------------- helpers --------------------- */
// ---------- role helpers ----------
function tryJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function getCurrentRoleName() {
  const mem =
    (window.__currentUser && (window.__currentUser.role?.role || window.__currentUser.role)) || null;
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

// ---------- adapters ----------
const safe = (x) => (Array.isArray(x) ? x : []);
const asText = (v) => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(asText).filter(Boolean).join(", ");
  if (typeof v === "object") return String(v.name ?? v.label ?? v.value ?? "");
  return String(v);
};
function adaptOptions(dto = {}) {
  const toOpt = (arr) => safe(arr).map((x) => ({ label: String(x?.name ?? ""), value: String(x?.id ?? "") }));
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
  return optsArr
    .filter((o) => set.has(String(o.value)))
    .map((o) => o.label)
    .join(", ");
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
  const externalInternalId =
    pick("externalInternalId") ?? (item?.externalInternal && Number(item.externalInternal.id)) ?? undefined;

  const primarySkillsArray = (() => {
    const ids = safe(pick("primarySkillsIds", "primarySkillIds")).map(Number);
    if (ids.length) return ids;
    return safe(item?.primarySkills)
      .map((s) => Number(s?.id))
      .filter(Boolean);
  })();
  const secondarySkillsArray = (() => {
    const ids = safe(pick("secondarySkillsIds", "secondarySkillIds")).map(Number);
    if (ids.length) return ids;
    return safe(item?.secondarySkills)
      .map((s) => Number(s?.id))
      .filter(Boolean);
  })();

  const primarySkills =
    asText(pick("primarySkillsText")) ||
    safe(pick("primarySkills", "primarySkillNames"))
      .map((n) => n?.name ?? n)
      .join(", ") ||
    "";
  const secondarySkills =
    asText(pick("secondarySkillsText")) ||
    safe(pick("secondarySkills", "secondarySkillNames"))
      .map((n) => n?.name ?? n)
      .join(", ") ||
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

/* --------------------- component --------------------- */
export default function ProfileSheet() {
  const navigate = useNavigate();

  // view modal (now separated)
  const [viewOpen, setViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [viewInitialTab, setViewInitialTab] = useState("profile");

  // role
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

  // paging + data
  const [rows, setRows] = useState([]);
  const [visibleColumns] = useState(defaultVisible);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [dropdownOptions, setDropdownOptions] = useState({});
  const [query, setQuery] = useState({});

  // dropdowns
  const loadDropdowns = useCallback(async () => {
    try {
      const dto = await getProfileDropdowns();
      setDropdownOptions(adaptOptions(dto));
    } catch {}
  }, []);

  // filter
  const buildServerFilter = useCallback(() => {
    const filter = {};
    const clean = (s) => String(s ?? "").trim();

    if (clean(query.candidateName)) filter.candidateName = clean(query.candidateName);
    if (clean(query.emailId)) filter.emailId = clean(query.emailId);

    if (clean(query.empId) && clean(query.empId) !== "-") {
      filter.empId = clean(query.empId);
    }

    if (query.phoneNumber != null) {
      const digits = clean(query.phoneNumber).replace(/\D+/g, "");
      if (digits) filter.phoneNumber = Number(digits);
    }

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
      const raw = clean(query.primarySkills);
      const names = raw.includes(",") ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [raw];
      filter.primarySkillNames = names;
    }
    if (clean(query.secondarySkills)) {
      const raw = clean(query.secondarySkills);
      const names = raw.includes(",") ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [raw];
      filter.secondarySkillNames = names;
    }

    if (clean(query.summary)) filter.summary = clean(query.summary);

    if (!adminView) filter.createdByUserId = currentUserId;

    return filter;
  }, [query, adminView, currentUserId]);

  // fetch
  const fetchServer = useCallback(
    async (nextPage = page, nextSize = size) => {
      setLoading(true);
      try {
        const filter = buildServerFilter();
        const forceSearch = !adminView;
        const hasAnyFilter = Object.keys(filter).length > (adminView ? 0 : 1);
        const resp = hasAnyFilter || forceSearch
          ? await searchProfilesApi(filter, nextPage, nextSize)
          : await getProfiles(nextPage, nextSize);

        const adapted = Array.isArray(resp.items) ? resp.items.map((it) => adaptRow(it)) : [];
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
    [page, size, buildServerFilter, adminView, currentUserId]
  );

  // initial
  useEffect(() => {
    loadDropdowns();
  }, [loadDropdowns]);
  useEffect(() => {
    fetchServer(0, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // search debounce
  const handleQueryChange = (key, value) => setQuery((prev) => ({ ...prev, [key]: value }));
  useEffect(() => {
    const t = setTimeout(() => fetchServer(0, size), 250);
    return () => clearTimeout(t);
  }, [query, size, fetchServer]);

  // pagination
  const handlePageChange = (nextPage) => {
    fetchServer(nextPage, size);
  };
  const handlePageSizeChange = (nextSize) => {
    fetchServer(0, nextSize);
  };

  // inline update
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

  // open modal from table — keep same behavior (open on "Demand" tab)
  const onViewRow = (row) => {
    setViewRow(row);
    setViewInitialTab("demand");
    setViewOpen(true);
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

      {/* DETAILS MODAL (separated) */}
      <ProfileView
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setViewRow(null);
          setViewInitialTab("profile");
        }}
        profile={viewRow}
        width={900}
        initialTab={viewInitialTab}
      />
    </>
  );
}