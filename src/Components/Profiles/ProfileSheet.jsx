// ================== src/pages/Profiles/ProfileSheet.jsx ==================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, message, Menu, Dropdown, Modal } from "antd";
import { PlusOutlined, ExportOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import Layout from "../Layout.jsx";
import ProfileTable from "./ProfileTable.jsx";
import ProfileView from "./ProfileView.jsx"
import { exportProfileSheet } from '../api/Export/profilesheet.js'
import {
  getProfiles,
  getProfileDropdowns,
  submitProfileUpdate,
  downloadProfileCv,
  searchProfilesApi,
} from "../api/Profiles/addProfile.js";

import { bulkUploadProfiles } from "../api/Profiles/addProfile.js";

import { usePermissions } from "../Auth/PermissionProvider.jsx";
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
  const toOpt = (arr) =>
    safe(arr).map((x) => ({
      label: String(x?.name ?? ""),
      value: String(x?.id ?? ""),
    }));

  return {
    externalInternal: toOpt(dto.externalInternals),
    hbu: toOpt(dto.hbus),
    demandLocation: toOpt(dto.locations),
    primarySkills: toOpt(dto.primarySkills),
    secondarySkills: toOpt(dto.secondarySkills),
    skillCluster: toOpt(dto.skillClusters),

    // ADD THIS
    profileStatus: toOpt(dto.profileStatusList),


    

origins: toOpt(dto.origins),
  karatStatuses: toOpt(dto.karatStatuses),
  sources: toOpt(dto.sources),
  overallStatuses: toOpt(dto.overallStatuses),


  };
}
``
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

  const sapId = asText(pick("sapId", "sapID", "sap_id"));
  const isActive = item?.isActive;
  const activeStatus =
    isActive === true || isActive === 1 ? "Active" : "Inactive";



  const location = asText(pick("locationName", "location", "locationLabel"));
  const hbu = asText(pick("hbuName", "hbu", "hbuLabel"));
  const skillCluster = asText(pick("skillClusterName", "skillCluster", "skillClusterLabel"));
  const externalInternal = asText(pick("externalInternalName", "externalInternal"));


  const l1InterviewDate = pick("l1InterviewDate", "l1_interview_date");
  const currentLocation = asText(pick("currentLocation", "current_location"));
  const officialNP = asText(pick("officialNP", "official_np"));
  const negotiableNpLwd = pick("negotiableNpLwd", "negotiable_np_lwd");
  const recruiter = asText(pick("recruiter"));

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

  // PAN kept in data; UI visibility controlled by a flag
  const panNumber = asText(pick("panNumber", "pan", "pan_no", "panNo", "taxId")) || "";


  // --- NEW RDG FIELDS ---
 const origin = asText(item?.origin?.name || item?.originName);
const karatStatus = asText(item?.karatStatus?.name || item?.karatStatusName);
const source = asText(item?.source?.name || item?.sourceName);
const overallStatus = asText(item?.overallStatusRdg?.name || item?.overallStatusName);

  const dateOfSubmission = pick("dateOfSubmission");
  const weekOf = pick("weekOf");
  const accountReceivedOn = pick("accountReceivedOn");
  const statusDate = pick("statusDate");

  const karatReadiness = asText(pick("karatReadiness"));
  const lobShared = asText(pick("lobShared"));
  const practice = asText(pick("practice"));
  const band = asText(pick("band"));
  const ageing = pick("ageing");
  const ageingRange = asText(pick("ageingRange"));
  const codes = asText(pick("codes"));
  const codeType = asText(pick("codeType"));
  const minBillingRate = pick("minBillingRate");
  const projectCode = asText(pick("projectCode"));


  // Status (backend returns profileStatus as RefDTO {id,name})
  const profileStatus = asText(pick("profileStatus", "profileStatusName", "status", "statusName"));
  const profileStatusId =
    pick("profileStatusId") ??
    (item?.profileStatus?.id != null ? Number(item.profileStatus.id) : undefined);

  return {
    id: pick("id", "profileId"),
    profileId: pick("profileId", "id"),
    candidateName,
    emailId,
    phoneNumber,
    experienceYears: experience ?? "",
    empId,
    panNumber, // kept

    activeStatus,

    l1InterviewDate,
    currentLocation,
    officialNP,
    negotiableNpLwd,
    recruiter,


    profileStatus,
    profileStatusId,
    location,
    hbu,
    skillCluster,
    externalInternal,
    locationId,
    hbuId,
    sapId,
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

    origin,
    weekOf,
    accountReceivedOn,
    statusDate,

    karatReadiness,
    lobShared,
    practice,
    band,
    ageing,
    ageingRange,
    codes,
    codeType,
    minBillingRate,
    projectCode,

    karatStatus,
    source,
    overallStatus,

    dateOfSubmission,

  };
}


/* --------------------- component --------------------- */
export default function ProfileSheet() {
  const navigate = useNavigate();


  const [bulkErrors, setBulkErrors] = useState([]);
  const [showBulkErrorModal, setShowBulkErrorModal] = useState(false);

  const [isHbuReady, setIsHbuReady] = useState(false);


  const handleBulkUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    //  VERY IMPORTANT: hide it
    input.style.display = "none";

    //  attach to DOM (required by some browsers)
    document.body.appendChild(input);

    input.onchange = async () => {
      const file = input.files?.[0];

      //  cleanup immediately (THIS REMOVES “Choose file” text)
      document.body.removeChild(input);

      if (!file) return;

      try {
        message.loading({ content: "Uploading profiles…", key: "bulkUpload" });

        const result = await bulkUploadProfiles(file);

        message.success({
          content: `Upload successful (${result.successCount} profiles added)`,
          key: "bulkUpload",
        });


        if (result.failureCount > 0 && Array.isArray(result.errors)) {
          setBulkErrors(result.errors);
          setShowBulkErrorModal(true);


          message.warning(
            `⚠️ ${result.failureCount} profiles failed. Click to view details.`
          );

          // ✅ refresh table
          fetchServer(0, size);
        }

      } catch (err) {
        setBulkErrors(err?.response?.data?.errors || []);
        setShowBulkErrorModal(true);

        message.error({
          content: "Bulk upload failed. Please review errors.",
          key: "bulkUpload",
        });
      }

    };

    // ✅ open file chooser
    input.click();
  };





  const uploadMenu = {
    items: [
      {
        key: "single",
        icon: <PlusOutlined />,
        label: "Single Upload",
      },
      {
        key: "bulk",
        icon: <UploadOutlined />,
        label: "Bulk Upload",
      },
    ],
    onClick: ({ key }) => {
      if (key === "single") {
        navigate("/RDGTATeam");
      }
      if (key === "bulk") {
        handleBulkUpload();
      }
    },
  };

  //permission check

  const { can, list } = usePermissions();
  const canAttachDemand = can("DashBoard", "Profiles", "Attach Demand");
  const canCreateProfile = can("DashBoard", "Profiles", "Create Profile");
  const canViewDemandData = can("DashBoard", "Profiles", "Demand Detail");
  const canExcelExport = can("DashBoard", "Profiles", "Export Profile Sheet");
  const canViewHistory = can("DashBoard", "Profiles", "Profile History");
  const canViewOnboardingdata = can("DashBoard", "Profiles", "Onboarding Data");
  const canPanVisibility = can("DashBoard", "Profiles", "Pan Visibility");
  const canUpdateProfile = can("DashBoard", "Profiles", "Update Profile");
  const canViewProfile = can("DashBoard", "Profiles", "View Profile");


  const allowedHbus = useMemo(() => {
  const list = [];

  if (can("DashBoard", "HBU", "HBU1")) list.push("HBU1");
  if (can("DashBoard", "HBU", "HBU2")) list.push("HBU2");
  if (can("DashBoard", "HBU", "Engineering")) list.push("Engineering");
  if (can("DashBoard", "HBU", "QE")) list.push("QE");
  if (can("DashBoard", "HBU", "AI")) list.push("AI");
  if (can("DashBoard", "HBU", "DATA")) list.push("DATA");
  if (can("DashBoard", "HBU", "DPA")) list.push("DPA");
  if (can("DashBoard", "HBU", "CIMS")) list.push("CIMS");

  return list;
}, [can]);









  // console.log("canExcelExport:", canExcelExport);
  // console.log(
  //   "RDG/TA PERMS:",
  //   list?.modulesByName?.DashBoard?.["RDG/TA"]
  // );



  // ----- Simple feature flag: 0 = hide PAN column; 1 = show -----
  const SHOW_PAN = 0;

  // view modal (now separated)
  const [viewOpen, setViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [viewInitialTab, setViewInitialTab] = useState("profile");

  // role
  const roleName = getCurrentRoleName();

  const adminView = isAdminRole(roleName);
  const showEmpId = isRDGRole(roleName) || isAdminRole(roleName);

  const showSapId = isRDGRole(roleName) || isAdminRole(roleName);


  // const isPmoRole = String(roleName || "")
  //   .toLowerCase()
  //   .includes("pmo");

  const currentUserId = useMemo(() => getCurrentUserId(), []);

  // All possible columns (PAN included here but filtered by SHOW_PAN)
  const ALL_COLUMNS_BASE = useMemo(
    () => [
      { key: "candidateName", label: "Candidate Name" },
      { key: "emailId", label: "Email ID" },

      { key: "l1InterviewDate", label: "L1 Interview Date" },
      { key: "currentLocation", label: "Current Location" },
      { key: "location", label: "Coforge Location" },
      { key: "officialNP", label: "Official NP" },
      { key: "negotiableNpLwd", label: "Negotiable NP / LWD" },
      { key: "recruiter", label: "Recruiter" },

      { key: "panNumber", label: "PAN Number" },
      { key: "empId", label: "Employee ID" },
      { key: "activeStatus", label: "Status" },
      { key: "profileStatus", label: "Profile Status" },

      { key: "origin", label: "Origin" },
       {key: "lobShared", label: "LOB Shared" },
      { key: "practice", label: "Practice" },
      { key: "band", label: "Band" },

      { key: "ageing", label: "Ageing" },
      { key: "ageingRange", label: "Ageing Range" },

      { key: "codes", label: "Codes" },
      { key: "codeType", label: "Code Type" },

      { key: "minBillingRate", label: "Min Billing Rate" },
      { key: "projectCode", label: "Project Code" },

      { key: "karatStatus", label: "Karat Status" },
      { key: "source", label: "Source" },
      { key: "overallStatus", label: "Overall Status" },

      { key: "dateOfSubmission", label: "DOS" },
      { key: "weekOf", label: "Week Of" },
      { key: "accountReceivedOn", label: "Account Received On" },
      { key: "statusDate", label: "Status Date" },

      { key: "karatReadiness", label: "Karat Readiness" },

      { key: "sapId", label: "SAP ID" },
      { key: "phoneNumber", label: "Phone" },
      { key: "experienceYears", label: "Exp (yrs)" },
      { key: "skillCluster", label: "Skill Cluster" },
      { key: "primarySkills", label: "Primary Skills" },
      { key: "secondarySkills", label: "Secondary Skills" },
      { key: "hbu", label: "HBU" },
      { key: "summary", label: "Summary" },
    ],
    []
  );

  // Apply flag to actually send columns to table (removes PAN column when SHOW_PAN === 0)
  // const ALL_COLUMNS = useMemo(
  //   () => (SHOW_PAN ? ALL_COLUMNS_BASE : ALL_COLUMNS_BASE.filter((c) => c.key !== "panNumber")),
  //   [SHOW_PAN, ALL_COLUMNS_BASE]
  // );

  //   const ALL_COLUMNS = useMemo(() => {
  //   return isPmoRole
  //     ? ALL_COLUMNS_BASE
  //     : ALL_COLUMNS_BASE.filter((c) => c.key !== "panNumber");
  // }, [isPmoRole, ALL_COLUMNS_BASE]);

  const ALL_COLUMNS = useMemo(() => {
    return ALL_COLUMNS_BASE.filter((col) => {
      if (col.key === "panNumber" && !canPanVisibility) return false;
      if (col.key === "sapId" && !showSapId) return false;
      return true;
    });
  }, [canPanVisibility, showSapId, ALL_COLUMNS_BASE]);

  // Default visible (PAN present in base list but filtered by flag below)
  const defaultVisibleBase = useMemo(
    () => [
      "candidateName",
      "emailId",

      "activeStatus",
      "l1InterviewDate",
      "currentLocation",
      "officialNP",
      "negotiableNpLwd",
      "recruiter",
      "profileStatus",

      ...(canPanVisibility ? ["panNumber"] : []),
      // ...(isPmoRole ? ["panNumber"] : []), //  CONDITIONAL
      ...(showEmpId ? ["empId"] : []),

      ...(showSapId ? ["sapId"] : []),

      // "panNumber", // filtered out when SHOW_PAN === 0
      // ...(showEmpId ? ["empId"] : []),
      "profileStatus",
      "phoneNumber",
      "experienceYears",
      "skillCluster",
      "primarySkills",
      "secondarySkills",
      "location",
      "hbu",


  "origin",
  "karatStatus",
  "source",
  "overallStatus",

  "dateOfSubmission",
  "weekOf",
  "accountReceivedOn",
  "statusDate",

  "karatReadiness",
  "lobShared",
  "practice",
  "band",

  "ageing",
  "ageingRange",

  "codes",
  "codeType",

  "minBillingRate",
  "projectCode",


    ],
    [showEmpId, showSapId, canPanVisibility]
    // [showEmpId,isPmoRole]
  );

  const defaultVisible = useMemo(
    () => defaultVisibleBase,
    [defaultVisibleBase]
  );

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
      // console.log("RAW profile dropdown DTO:", dto);
      setDropdownOptions(adaptOptions(dto));


      const adapted = adaptOptions(dto);
      // console.log("ADAPTED profileStatus options:", adapted.profileStatus);

    } catch { }
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
   // ✅ CASE 1: both permission + UI
if (allowedHbus.length > 0 && clean(query.hbu)) {
  if (allowedHbus.includes(clean(query.hbu))) {
    filter.hbuName = clean(query.hbu);
  } else {
    filter.hbuName = allowedHbus[0];
  }
}

// ✅ CASE 2: only permission
else if (allowedHbus.length > 0) {
  filter.hbuName = allowedHbus[0];
}

// ✅ CASE 3: only UI
else if (clean(query.hbu)) {
  filter.hbuName = clean(query.hbu);
}

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

    // (OPTIONAL) Future filters:
    // if (clean(query.profileStatus)) filter.profileStatusName = clean(query.profileStatus);
    // if (clean(query.panNumber)) filter.panNumber = clean(query.panNumber);

    // if (!adminView) filter.createdByUserId = currentUserId;

    return filter;
  }, [query, adminView, currentUserId]);

  // fetch
  const fetchServer = useCallback(
    async (nextPage, nextSize) => {
      setLoading(true);
      try {
        const filter = buildServerFilter();
        const forceSearch = !adminView;
        const hasAnyFilter = Object.keys(filter).length > (adminView ? 0 : 1);

        const resp =
          hasAnyFilter || forceSearch
            ? await searchProfilesApi(filter, nextPage, nextSize)
            : await getProfiles(nextPage, nextSize);


        // console.log("RAW API RESPONSE:", resp);

        // const adapted = Array.isArray(resp.items)
        //   ? resp.items.map((it) => adaptRow(it))
        //   : [];
        const list = resp.items || resp.content || [];
const adapted = Array.isArray(list)
  ? list.map((it) => adaptRow(it))
  : [];

        setRows(adapted);
        setTotal(resp.totalElements ?? adapted.length);
        setPage(nextPage);
        setSize(nextSize);
      } catch (e) {
        // HANDLE NO-DATA CASE
        const msg = e?.response?.data?.message || e?.message || "";

        if (msg.includes("No profiles found")) {
          setRows([]);           //  empty table
          setTotal(0);
          setPage(nextPage);
          setSize(nextSize);
        } else {
          message.error(msg || "Failed to load profiles");
        }
      } finally {
        setLoading(false);
      }
    },
    [buildServerFilter, adminView]
  );

  // initial
  useEffect(() => {
    loadDropdowns();
  }, [loadDropdowns]);



useEffect(() => {
  if (!isHbuReady) return; // ✅ WAIT FOR HBU

  fetchServer(0, size);
}, [isHbuReady]);



useEffect(() => {
  if (allowedHbus.length > 0) {
    setQuery((prev) => ({
      ...prev,
      hbu: allowedHbus[0]
    }));
  }

  // ✅ mark ready AFTER setting filter
  setIsHbuReady(true);
}, [allowedHbus]);



  const handleExport = async () => {
    try {
      setLoading(true);
      await exportProfileSheet();
      message.success('ProfileSheet exported successfully.');
    } catch (e) {
      message.error('Failed to export ProfileSheet.');
    } finally {
      setLoading(false);
    }
  };


  const handleQueryChange = (key, value) => setQuery((prev) => ({ ...prev, [key]: value }));
  useEffect(() => {
    const t = setTimeout(() => {
      fetchServer(0, size);     //  reset ONLY on filter / size change
    }, 250);

    return () => clearTimeout(t);
  }, [query, size]);           //  no fetchServer dependency

  // pagination
  const handlePageChange = (uiPage) => {
    fetchServer(Math.max(uiPage - 1, 0), size); //  prevent -1
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
        if (patch.panNumber != null) next.panNumber = patch.panNumber; // reflect PAN

        if (patch.profileStatusId != null) next.profileStatusId = patch.profileStatusId; // optional future
        if (patch.profileStatusName != null) next.profileStatus = patch.profileStatusName; // optional future

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

  const handleUploadCv = async (row, file) => {
    await uploadProfileCvApi(row.id, file); // ✅ your backend API
    refreshTable(); // ✅ reload table data
  };


  return (


    <>
      <Layout>
        <div>
          {/* title + add */}
          <div className="mt-2 mb-3 grid grid-cols-3 w-full items-center">
            <div />
            <div className=" text-center">
              <h1 className="text-lg font-bold m-0">Profile Sheet</h1>
            </div>
            <div className="flex items-start justify-end gap-2">
              {canCreateProfile && (
                <Dropdown menu={uploadMenu} trigger={["click"]}>
                  <Button
                    type="default"
                    icon={<PlusOutlined />}
                    className="bg-green-800 hover:bg-green-900 text-white font-semibold border border-green-900 px-4 py-2"
                  >
                    Add New Profile
                  </Button>
                </Dropdown>
              )}

              {canExcelExport && (
                <Button
                  type="default"
                  icon={<ExportOutlined />}
                  loading={loading}
                  onClick={handleExport}
                  className="bg-green-800 hover:bg-green-900 text-white font-semibold border border-green-900 px-4 py-2"
                >
                  Export ProfileSheet
                </Button>

              )}
            </div>
          </div>

          {/* {!adminView && (
              <div className="text-xs text-gray-600 mb-2">
                Viewing profiles created by you (User ID:{" "}
                <span className="font-semibold">{currentUserId || "-"}</span>)
              </div>
            )} */}



          {/* Table — server-driven list + search */}
          <ProfileTable
            rows={rows}
            columns={ALL_COLUMNS}            /* PAN column hidden when SHOW_PAN === 0 */
            visibleColumns={visibleColumns}  /* PAN not in defaults when SHOW_PAN === 0 */
            onViewRow={onViewRow}
            onDownload={downloadProfileCv ? (row) => downloadProfileCv(row.cvFileName) : undefined}
            onUploadCv={handleUploadCv}
            onSavePatch={handleSavePatch}
            dropdownOptions={dropdownOptions}
            serverPage={page + 1}
            serverSize={size}
            serverTotal={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            query={query}
            onQueryChange={handleQueryChange}

            canUpdateProfile={canUpdateProfile}
            canViewProfile={canViewProfile}
            canPanVisibility={canPanVisibility}

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
        canViewDemandData={canViewDemandData}
        canViewHistory={canViewHistory}
        canViewOnboardingdata={canViewOnboardingdata}
        canAttachDemand={canAttachDemand}
      />




      <Modal
        open={showBulkErrorModal}
        onCancel={() => setShowBulkErrorModal(false)}
        footer={null}
        title="Bulk Upload Errors"
        width={700}
      >
        <div className="max-h-[400px] overflow-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-3 py-2">Row</th>
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {bulkErrors.map((err, idx) => (
                <tr key={idx} className="hover:bg-red-50">
                  <td className="border px-3 py-2 text-center">
                    {err.row}
                  </td>
                  <td className="border px-3 py-2">
                    {err.email || "-"}
                  </td>
                  <td className="border px-3 py-2 text-red-600 font-medium">
                    {err.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bulkErrors.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No detailed error information available.
            </div>
          )}
        </div>
      </Modal>

    </>
  );
}