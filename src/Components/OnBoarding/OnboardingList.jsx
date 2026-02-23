// src/pages/OnboardingList.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Layout from "../Layout";
import {
  Table,
  Tooltip,
  Button,
  message,
  Alert,
  Modal,
  Tabs,
  Input,
  Select,
  Pagination,
} from "antd";
import { EditOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import {
  getAllOnboardings,
  searchOnboardings,
  getOnboardingDropdowns, // ✅ dropdown API
} from "../api/Onboarding/onBoarding";
import OnboardingEditModal from "./OnboardingEditModal";

/* ---------------- helpers ---------------- */
function fmtDate(d) {
  if (!d) return "-";
  const parts = String(d).split("-");
  if (parts.length !== 3) return String(d);
  const [y, m, day] = parts;
  const date = new Date(Number(y), Number(m) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

const chip =
  "inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700";

/** string or {name} -> label */
const nameOf = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return v.name ?? "";
  return String(v ?? "");
};

/* ---------- NORMALIZE a raw onboarding row to consistent nested shape ---------- */
function normalizeOnboardingRow(item = {}) {
  const asNameObj = (v) => {
    if (v == null || v === "") return null;
    if (typeof v === "string") return { name: v };
    if (typeof v === "number") return { name: String(v) };
    if (typeof v === "object") {
      if ("name" in v && v.name != null) return { ...v, name: String(v.name) };

      const masterKeys = [
        "onboardingStatus",
        "bgvStatus",
        "wbsType",
        "lob",
        "hbu",
        "band",
        "hiringManager",
        "pmoSpoc",
        "externalInternal",
        "value",
        "label",
        "title",
        "onboardingStatusName",
        "bgvStatusName",
        "wbsTypeName",
        "lobName",
        "hbuName",
        "bandName",
        "hiringManagerName",
        "pmoSpocName",
        "profileType",
        "externalInternalName",
      ];
      for (const k of masterKeys) {
        if (k in v && v[k] != null && typeof v[k] !== "object") {
          return { ...v, name: String(v[k]) };
        }
      }

      const k2 = Object.keys(v).find((x) => x.toLowerCase().includes("name"));
      if (k2 && v[k2] != null) return { ...v, name: String(v[k2]) };

      const primKeys = Object.keys(v).filter((k) => {
        const t = typeof v[k];
        return t === "string" || t === "number" || t === "boolean";
      });
      if (primKeys.length === 1) {
        return { ...v, name: String(v[primKeys[0]]) };
      }
      return v;
    }
    return { name: String(v) };
  };

  // --- keep demandNumber / demandPkId and never fallback to row.id ---
  const demandNumber =
    item?.demand?.demandNumber ?? item?.demandNumber ?? null;
  const demandPkId =
    item?.demand?.demandPkId ?? item?.demandPkId ?? null;

  const demandId =
    item?.demand?.demandId ??
    item?.demandId ??
    demandNumber ??
    demandPkId ??
    item?.demandID ??
    null;

  const displayDemandId =
    item?.demand?.displayDemandId ??
    item?.displayDemandId ??
    item?.demandDisplayId ??
    item?.demand?.demandDisplayId ??
    null;

  const demand = {
    demandId,
    demandNumber,
    demandPkId,
    displayDemandId,
    lob: asNameObj(item?.demand?.lob ?? item?.lob ?? item?.lobName ?? item?.demandLobName),
    hbu: asNameObj(item?.demand?.hbu ?? item?.hbu ?? item?.hbuName ?? item?.demandHbuName),
    band: asNameObj(item?.demand?.band ?? item?.band ?? item?.bandName ?? item?.demandBandName),
    hiringManager: asNameObj(
      item?.demand?.hiringManager ??
        item?.hiringManager ??
        item?.hiringManagerName ??
        item?.demandHiringManagerName
    ),
    pmoSpoc: asNameObj(
      item?.demand?.pmoSpoc ??
        item?.pmoSpoc ??
        item?.pmoSpocName ??
        item?.demandPmoSpocName
    ),
  };

  const profileId =
    item?.profile?.profileId ?? item?.profileId ?? item?.candidateId ?? null;
  const profile = {
    profileId,
    candidateName:
      item?.profile?.candidateName ?? item?.candidateName ?? item?.profileName ?? null,
    externalInternal:
      item?.profile?.externalInternal ??
      item?.externalInternal ??
      item?.profileType ??
      item?.externalInternalName ??
      null,
  };

  const wbsType = asNameObj(item?.wbsType ?? item?.wbsTypeName);
  const bgvStatus = asNameObj(item?.bgvStatus ?? item?.bgvStatusName);
  const onboardingStatus = asNameObj(item?.onboardingStatus ?? item?.onboardingStatusName);

  const offerDate = item?.offerDate ?? null;
  const dateOfJoining = item?.dateOfJoining ?? item?.doj ?? null;
  const profileSharedDate =
    item?.profileTracker?.profileSharedDate ?? item?.profileSharedDate ?? null;
  const pevUploadDate = item?.pevUploadDate ?? item?.pevUpdateDate ?? null;
  const vpTagging = item?.vpTagging ?? item?.vpTaggingDate ?? null;
  const techSelectDate = item?.techSelectDate ?? null;
  const hsbcOnboardingDate = item?.hsbcOnboardingDate ?? null;

  const ctoolId = item?.ctoolId ?? item?.ctoolID ?? item?.cToolId ?? null;

  const onboardingId =
    item?.onboardingId ??
    item?.id ??
    item?.onboarding?.onboardingId ??
    null;

  return {
    ...item,
    onboardingId,
    demand,
    profile,
    wbsType,
    bgvStatus,
    onboardingStatus,
    offerDate,
    dateOfJoining,
    profileSharedDate,
    pevUploadDate,
    vpTagging,
    techSelectDate,
    hsbcOnboardingDate,
    ctoolId,
  };
}

function normalizeOnboardingList(list) {
  return Array.isArray(list) ? list.map((x) => normalizeOnboardingRow(x)) : [];
}

const ensureId = (row) =>
  row?.onboardingId ?? row?.id ?? row?.onboarding?.onboardingId ?? null;

/* Demand pill: prefer displayDemandId; else LOB-demandNumber (then fallback to demandId) */
function demandCode(row) {
  const disp = row?.demand?.displayDemandId ?? row?.displayDemandId;
  if (disp) return disp;

  const lob = nameOf(row?.demand?.lob);
  const num = row?.demand?.demandNumber ?? row?.demand?.demandId ?? null;

  if (lob && num != null) return `${lob}-${num}`;
  if (num != null) return String(num);
  return "-";
}

/** Compact text cell with tooltip */
function TextCell({ value, max = 220 }) {
  const v = value == null || value === "" ? "-" : String(value);
  return (
    <Tooltip title={v}>
      <div
        className="text-gray-800"
        style={{
          maxWidth: max,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {v}
      </div>
    </Tooltip>
  );
}

/* ---------- HeaderWithFilter: text | number | select | daterange ---------- */
function HeaderWithFilter({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  options = [],
  valueFrom,
  valueTo,
  onChangeRange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1 items-stretch">
      <div className="flex items-center justify-center font-semibold">
        <span>{label}</span>
        <button
          type="button"
          aria-label="Search"
          className="ml-1 text-gray-500 hover:text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
        >
          <SearchOutlined />
        </button>
      </div>

      {open && (
        <div
          className="flex gap-1 items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {type === "select" ? (
            <Select
              size="small"
              allowClear
              showSearch
              style={{ minWidth: 150, maxWidth: 220 }}
              placeholder={placeholder || "Select"}
              value={value || undefined}
              onChange={(val) => onChange?.(val || "")}
              options={options}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          ) : type === "daterange" ? (
            <>
              <Input
                size="small"
                type="date"
                value={valueFrom || ""}
                onChange={(e) => onChangeRange?.(e.target.value || "", valueTo || "")}
                style={{ width: 120 }}
                placeholder="From"
              />
              <span className="text-gray-500 text-xs px-1">to</span>
              <Input
                size="small"
                type="date"
                value={valueTo || ""}
                onChange={(e) => onChangeRange?.(valueFrom || "", e.target.value || "")}
                style={{ width: 120 }}
                placeholder="To"
              />
            </>
          ) : (
            <Input
              size="small"
              value={value ?? ""}
              onChange={(e) => onChange?.(e.target.value)}
              allowClear
              placeholder={placeholder || ""}
              type={type === "number" ? "number" : "text"}
              style={{ minWidth: 140, maxWidth: 220 }}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- View modal mini sections ---------- */
function Section({ title, children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      {title ? <div className="text-sm font-semibold mb-2">{title}</div> : null}
      <div className="space-y-1 text-[13px]">{children}</div>
    </div>
  );
}
function RowLine({ label, value }) {
  return (
    <div className="leading-tight">
      <strong className="text-gray-900">{label}: </strong>
      <span className="text-gray-800">{value ?? "-"}</span>
    </div>
  );
}

export default function OnboardingList() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // View details modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState(null);

  // 🔎 Query values (server-driven)
  const [query, setQuery] = useState({});

  // Server dropdown values for search selects
  const [dd, setDd] = useState({
    wbsType: [],
    bgvStatus: [],
    onboardingStatus: [],
  });
  const [ddLoading, setDdLoading] = useState(false);

  // Fetch dropdowns once
  useEffect(() => {
    let alive = true;
    const normalizeToOptions = (arr) => {
      if (!Array.isArray(arr)) return [];
      const toLabel = (x) => {
        if (x == null) return "";
        if (typeof x === "string" || typeof x === "number") return String(x);
        return (
          x.name ??
          x.label ??
          x.title ??
          x.wbsTypeName ??
          x.bgvStatusName ??
          x.onboardingStatusName ??
          x.value ??
          ""
        ).toString();
      };
      const opts = arr
        .map((x) => {
          const label = toLabel(x).trim();
          return label ? { label, value: label } : null;
        })
        .filter(Boolean);
      const seen = new Set();
      return opts.filter((o) => (seen.has(o.label) ? false : (seen.add(o.label), true)));
    };

    (async () => {
      try {
        setDdLoading(true);
        const res = await getOnboardingDropdowns();

        const wbsRaw =
          res?.wbsType ??
          res?.wbsTypes ??
          res?.wbsTypeList ??
          res?.data?.wbsType ??
          res?.data?.wbsTypes ??
          res?.data?.wbsTypeList ??
          [];
        const bgvRaw =
          res?.bgvStatus ??
          res?.bgvStatuses ??
          res?.bgvStatusList ??
          res?.data?.bgvStatus ??
          res?.data?.bgvStatuses ??
          res?.data?.bgvStatusList ??
          [];
        const obRaw =
          res?.onboardingStatus ??
          res?.onboardingStatuses ??
          res?.onboardingStatusList ??
          res?.data?.onboardingStatus ??
          res?.data?.onboardingStatuses ??
          res?.data?.onboardingStatusList ??
          [];

        if (!alive) return;
        setDd({
          wbsType: normalizeToOptions(wbsRaw),
          bgvStatus: normalizeToOptions(bgvRaw),
          onboardingStatus: normalizeToOptions(obRaw),
        });
      } catch (e) {
        console.warn("Failed fetching onboarding dropdowns", e);
      } finally {
        if (alive) setDdLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Build server DTO filter (no local filtering)
  const buildServerFilter = useCallback(() => {
    const clean = (s) => String(s ?? "").trim();
    const has = (s) => !!clean(s);
    const isFullDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(clean(s));
    const intFrom = (s) => {
      const t = clean(s);
      return /^\d+$/.test(t) ? Number(t) : null;
    };

    const f = {};

    // -------- From AddDemand --------
    const did = intFrom(query.demandId);
    if (did != null) f.demandId = did;
    if (has(query.hbu)) f.hbu = clean(query.hbu);
    if (has(query.hiringManager)) f.hiringManager = clean(query.hiringManager);
    if (has(query.pmoSpoc)) f.pmoSpoc = clean(query.pmoSpoc);
    if (has(query.band)) f.band = clean(query.band);
    if (has(query.lob)) f.lob = clean(query.lob);

    // -------- From Profile --------
    if (has(query.candidateName)) f.candidateName = clean(query.candidateName);
    if (has(query.empId)) f.empId = clean(query.empId);
    if (has(query.profileType)) f.externalInternal = clean(query.profileType);

    // -------- From Onboarding --------
    if (has(query.wbsType)) f.wbsType = clean(query.wbsType);
    if (has(query.bgvStatus)) f.bgvStatus = clean(query.bgvStatus);
    if (has(query.onboardingStatus)) f.onboardingStatus = clean(query.onboardingStatus);

    const ctool = intFrom(query.ctoolId);
    if (ctool != null) f.ctoolId = ctool;

    // Date ranges (From/To)
    const maybePassRange = (base) => {
      const fromKey = `${base}From`;
      const toKey = `${base}To`;
      if (isFullDate(query[fromKey])) f[fromKey] = clean(query[fromKey]);
      if (isFullDate(query[toKey])) f[toKey] = clean(query[toKey]);
    };
    [
      "profileSharedDate",
      "offerDate",
      "dateOfJoining",
      "pevUploadDate",
      "vpTagging",
      "techSelectDate",
      "hsbcOnboardingDate",
    ].forEach(maybePassRange);

    return f;
  }, [query]);

  // ✅ FIXED: stabilize fetchServer (do not depend on page/size)
  const fetchServer = useCallback(
    async (nextPage, nextSize) => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const filter = buildServerFilter();
        const hasAny = Object.keys(filter).length > 0;

        const res = hasAny
          ? await searchOnboardings(filter, nextPage, nextSize)
          : await getAllOnboardings(nextPage, nextSize);

        const raw = Array.isArray(res?.content) ? res.content : [];
        const normalized = normalizeOnboardingList(raw);

        setRows(normalized);
        setTotal(Number(res?.totalElements ?? normalized.length ?? 0));
        setFirst(Boolean(res?.first));
        setLast(Boolean(res?.last));

        // keep state in sync with what we just fetched
        setPage(nextPage);
        setSize(nextSize);
      } catch (err) {
        const apiMsg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load Onboarding.";
        setErrorMsg(apiMsg);
        setRows([]);
        setTotal(0);
        setFirst(true);
        setLast(true);
      } finally {
        setLoading(false);
      }
    },
    [buildServerFilter] // ❗️only depends on filter builder
  );

  // initial load
  useEffect(() => {
    fetchServer(0, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ FIXED: debounce on query/size only (not on changing fetchServer identity)
  useEffect(() => {
    const t = setTimeout(() => fetchServer(0, size), 250);
    return () => clearTimeout(t);
  }, [query, size, fetchServer]); // fetchServer is now stable

  // column query change
  const handleQueryChange = (key, value) => {
    setQuery((prev) => ({ ...prev, [key]: value }));
  };

  function openEdit(row) {
    const id = ensureId(row);
    if (!id) {
      message.warning("Cannot edit: onboarding ID not found.");
      return;
    }
    setEditRow({
      onboardingId: id,
      displayDemandId: row?.demand?.displayDemandId ?? demandCode(row),
      demand: {
        displayDemandId: row?.demand?.displayDemandId ?? demandCode(row),
        lob: row?.demand?.lob ?? null,
        demandId: row?.demand?.demandId ?? null,
      },
      profileExternalInternal: row?.profile?.externalInternal ?? null,
      onboardingStatusName: row?.onboardingStatus?.name ?? null,
      wbsTypeName: row?.wbsType?.name ?? null,
      bgvStatusName: row?.bgvStatus?.name ?? null,
      onboardingStatusId: row?.onboardingStatus?.id ?? null,
      wbsTypeId: row?.wbsType?.id ?? null,
      bgvStatusId: row?.bgvStatus?.id ?? null,
      offerDate: row?.offerDate ?? "",
      dateOfJoining: row?.dateOfJoining ?? "",
      ctoolId: row?.ctoolId ?? "",
      pevUploadDate: row?.pevUploadDate ?? "",
      vpTagging: row?.vpTagging ?? "",
      techSelectDate: row?.techSelectDate ?? "",
      hsbcOnboardingDate: row?.hsbcOnboardingDate ?? "",
    });
    setEditOpen(true);
  }
  function closeEdit() {
    setEditOpen(false);
    setEditRow(null);
  }

  function openView(row) {
    setViewRow(row);
    setViewOpen(true);
  }
  function closeView() {
    setViewOpen(false);
    setViewRow(null);
  }

  /* ---------- Build dropdown options from SERVER ---------- */
  const dropdownOptions = useMemo(() => {
    return {
      wbsType: dd.wbsType,
      bgvStatus: dd.bgvStatus,
      onboardingStatus: dd.onboardingStatus,
    };
  }, [dd]);

  const colModel = useMemo(
    () => [
      { key: "demandId", label: "Demand ID", placeholder: "ID", type: "number" },
      { key: "candidateName", label: "Candidate Name", type: "text" },

      { key: "profileType", label: "Profile Type", type: "text" },
      { key: "hbu", label: "HBU", type: "text" },
      { key: "hiringManager", label: "Hiring Manager", type: "text" },
      { key: "pmoSpoc", label: "PMO SPOC", type: "text" },
      { key: "band", label: "Band", type: "text" },

      { key: "wbsType", label: "WBS Type", type: "select", optionsKey: "wbsType" },

      { key: "offerDate", label: "Offer Date", type: "daterange" },
      { key: "dateOfJoining", label: "DOJ", type: "daterange" },
      { key: "profileSharedDate", label: "Profile Shared Date", type: "daterange" },

      { key: "ctoolId", label: "C-Tool ID", placeholder: "ID", type: "number" },

      { key: "bgvStatus", label: "BGV Status", type: "select", optionsKey: "bgvStatus" },
      { key: "pevUploadDate", label: "PEV Upload Date", type: "daterange" },
      { key: "vpTagging", label: "VP Tagging Date", type: "daterange" },
      { key: "techSelectDate", label: "Tech Select Date", type: "daterange" },
      { key: "hsbcOnboardingDate", label: "HSBC Onboard Date", type: "daterange" },

      { key: "onboardingStatus", label: "Onboarding Status", type: "select", optionsKey: "onboardingStatus" },
    ],
    []
  );

  const antdColumns = useMemo(() => {
    const base = colModel.map((c) => {
      const isDate =
        c.key === "offerDate" ||
        c.key === "dateOfJoining" ||
        c.key === "pevUploadDate" ||
        c.key === "vpTagging" ||
        c.key === "techSelectDate" ||
        c.key === "hsbcOnboardingDate" ||
        c.key === "profileSharedDate";
      const isStatus = c.key === "bgvStatus" || c.key === "onboardingStatus";

      const renderCell = (_, row) => {
        switch (c.key) {
          case "demandId": {
            const label = demandCode(row);
            const hasId = !!ensureId(row);
            return (
              <div className="flex items-center gap-2">
                <Tooltip title={hasId ? "Edit" : "Edit (ID missing)"}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    disabled={!hasId}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasId) openEdit(row);
                    }}
                  />
                </Tooltip>

                <div
                  className="inline-flex items-center gap-3 text-white font-semibold text-md"
                  style={{
                    backgroundColor: "#6b8e23",
                    padding: "8px 12px",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    borderRadius: 10,
                    minWidth: "8rem",
                    boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
                  }}
                  title={label}
                >
                  <span style={{ letterSpacing: 0.2 }}>{label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openView(row);
                    }}
                    title="View details"
                    className="inline-flex items-center justify-center"
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      color: "#fff",
                      background: "transparent",
                      border: 0,
                      outline: "none",
                    }}
                  >
                    <EyeOutlined style={{ color: "#fff", fontSize: 14 }} />
                  </button>
                </div>
              </div>
            );
          }

          case "candidateName":
            return <TextCell value={row?.profile?.candidateName ?? "-"} max={200} />;

          case "profileType": {
            const typ = nameOf(row?.profile?.externalInternal) || "-";
            return <TextCell value={typ} max={160} />;
          }

          case "hbu":
            return <TextCell value={nameOf(row?.demand?.hbu) || "-"} max={200} />;

          case "hiringManager":
            return <TextCell value={nameOf(row?.demand?.hiringManager) || "-"} max={240} />;

          case "pmoSpoc":
            return <TextCell value={nameOf(row?.demand?.pmoSpoc) || "-"} max={180} />;

          case "band":
            return <TextCell value={nameOf(row?.demand?.band) || "-"} max={120} />;

          case "wbsType": {
            const v = nameOf(row?.wbsType);
            return v ? (
              <span className={chip} style={{ whiteSpace: "nowrap" }}>
                {v}
              </span>
            ) : (
              "-"
            );
          }

          case "ctoolId":
            return <TextCell value={row?.ctoolId ?? "-"} max={140} />;

          case "bgvStatus": {
            const v = nameOf(row?.bgvStatus);
            return v ? (
              <span className={chip} style={{ whiteSpace: "nowrap" }}>
                {v}
              </span>
            ) : (
              "-"
            );
          }

          case "onboardingStatus": {
            const v = nameOf(row?.onboardingStatus);
            return v ? (
              <span
                className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                style={{ whiteSpace: "nowrap" }}
              >
                {v}
              </span>
            ) : (
              "-"
            );
          }

          case "offerDate":
            return (
              <div className="text-gray-800" style={{ whiteSpace: "nowrap" }}>
                {fmtDate(row?.offerDate)}
              </div>
            );

          case "dateOfJoining":
            return (
              <div className="text-gray-800" style={{ whiteSpace: "nowrap" }}>
                {fmtDate(row?.dateOfJoining)}
              </div>
            );

          case "profileSharedDate":
            return (
              <div className="text-gray-800" style={{ whiteSpace: "nowrap" }}>
                {fmtDate(row?.profileSharedDate)}
              </div>
            );

          case "pevUploadDate":
            return (
              <div className="text-gray-800" style={{ whiteSpace: "nowrap" }}>
                {fmtDate(row?.pevUploadDate)}
              </div>
            );

          case "vpTagging":
            return (
              <div className="text-gray-800" style={{ whiteSpace: "nowrap" }}>
                {fmtDate(row?.vpTagging)}
              </div>
            );

          case "techSelectDate":
            return (
              <div className="text-gray-800" style={{ whiteSpace: "nowrap" }}>
                {fmtDate(row?.techSelectDate)}
              </div>
            );

          case "hsbcOnboardingDate":
            return (
              <div className="text-gray-800" style={{ whiteSpace: "nowrap" }}>
                {fmtDate(row?.hsbcOnboardingDate)}
              </div>
            );

          default:
            return <TextCell value={String(row?.[c.key] ?? "-")} />;
        }
      };

      const widthMap = {
        demandId: 240,
        candidateName: 200,
        profileType: 140,
        hbu: 180,
        hiringManager: 220,
        pmoSpoc: 160,
        band: 110,
        wbsType: 120,
        offerDate: 150,
        dateOfJoining: 150,
        profileSharedDate: 170,
        ctoolId: 130,
        bgvStatus: 150,
        pevUploadDate: 150,
        vpTagging: 150,
        techSelectDate: 150,
        hsbcOnboardingDate: 170,
        onboardingStatus: 170,
      };

      const align = c.key === "candidateName" ? "center" : undefined;

      const headerNode =
        c.type === "daterange" ? (
          <HeaderWithFilter
            label={c.label}
            type="daterange"
            valueFrom={query[`${c.key}From`]}
            valueTo={query[`${c.key}To`]}
            onChangeRange={(from, to) =>
              setQuery((prev) => ({
                ...prev,
                [`${c.key}From`]: from || undefined,
                [`${c.key}To`]: to || undefined,
              }))
            }
          />
        ) : c.type === "select" ? (
          <HeaderWithFilter
            label={c.label}
            type="select"
            value={query[c.key]}
            onChange={(v) => handleQueryChange(c.key, v)}
            options={dropdownOptions[c.optionsKey] || []}
            placeholder={ddLoading ? "Loading..." : "Select"}
          />
        ) : (
          <HeaderWithFilter
            label={c.label}
            type={c.type || "text"}
            value={query[c.key]}
            onChange={(v) => handleQueryChange(c.key, v)}
            placeholder={c.placeholder}
          />
        );

      return {
        key: c.key,
        dataIndex: c.key,
        title: headerNode,
        render: renderCell,
        align,
        onHeaderCell: () => ({
          className: "bg-white !py-2 md:!py-2 text-gray-800",
          style: { textAlign: "center" },
        }),
        onCell: () => ({
          className: "align-middle !py-2",
        }),
        width: widthMap[c.key] || (isDate ? 150 : isStatus ? 150 : undefined),
      };
    });

    return base;
  }, [colModel, query, dropdownOptions, ddLoading]);

  /* ---------------- View Details Modal Tabs (History only) ---------------- */
  const viewTabs = useMemo(() => {
    if (!viewRow) return [];

    return [
      {
        key: "history",
        label: "History",
        children: (
          <div className="space-y-3">
            <Section title="">
              <div className="space-y-2">
                <RowLine label="Updated By" value="-" />
                <RowLine label="Updated At" value="-" />
                <div className="leading-tight">
                  <strong className="text-gray-900">Updated Data:</strong>
                  <div
                    className="mt-1 text-gray-700"
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      padding: "8px 10px",
                      background: "#fafafa",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono','Courier New', monospace",
                      fontSize: 12,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    No change log available.
                  </div>
                </div>
              </div>
            </Section>
          </div>
        ),
      },
    ];
  }, [viewRow]);

  return (
    <>
      <Layout>
        <div className="px-4 pt-2 md:px-6 md:pt-3">
          <div className="mb-2 w-full flex items-center justify-center pt-1">
            <h2 className="text-lg font-bold text-gray-900 text-center m-0">
              Onboarding Tracker
            </h2>
          </div>

          <style>{`
            .onboarding-table .ant-table-thead > tr > th {
              border-bottom: 1px solid #eef0f2;
              padding: 10px 18px !important;
              white-space: nowrap;
              background: #fafafa;
              text-align: center;
              letter-spacing: 0.2px;
            }
            .onboarding-table .ant-table-tbody > tr > td {
              border-bottom: 1px solid #f3f4f6;
              padding-bottom: 14px !important;
              vertical-align: middle;
              background: #fff;
            }
            .onboarding-table .ant-table-container table > tbody > tr > td {
              border-color: #f1f3f5;
            }
            .onboarding-table .ant-table-tbody > tr > td:first-child {
              border-left: 1px solid #f1f3f5;
              border-top-left-radius: 8px;
              border-bottom-left-radius: 8px;
            }
            .onboarding-table .ant-table-tbody > tr > td:last-child {
              border-right: 1px solid #f1f3f5;
              border-top-right-radius: 8px;
              border-bottom-right-radius: 8px;
            }
          `}</style>

          {errorMsg && (
            <div className="mb-2">
              <Alert type="error" showIcon message={errorMsg} />
            </div>
          )}

          <Table
            rowKey={(r) =>
              String(
                r.onboardingId ??
                  r.id ??
                  r?.onboarding?.onboardingId ??
                  `${r?.profile?.profileId ?? r?.profileId ?? "p"}-${r?.demand?.demandId ?? r?.demandId ?? "d"}`
              )
            }
            dataSource={rows}
            columns={antdColumns}
            pagination={false}
            size="middle"
            className="onboarding-table"
            loading={loading}
            scroll={{ x: true }}
          />

          {/* External Pagination (same as Profile Tracker style) */}
          <div className="mt-3 flex justify-end">
            <Pagination
              current={page + 1}
              pageSize={size}
              total={total}
              showSizeChanger
              pageSizeOptions={["10", "20", "50"]}
              showTotal={(t) => `${t} records`}
              onChange={(p, pageSize) => {
                if (pageSize !== size) {
                  setPage(0);
                  setSize(pageSize);
                  fetchServer(0, pageSize);
                } else {
                  setPage(p - 1);
                  fetchServer(p - 1, size);
                }
              }}
              onShowSizeChange={(_, pageSize) => {
                setPage(0);
                setSize(pageSize);
                fetchServer(0, pageSize);
              }}
            />
          </div>

          {/* Edit Modal */}
          <OnboardingEditModal
            open={editOpen}
            onClose={closeEdit}
            row={editRow}
            onUpdated={() => fetchServer(page, size)}
          />

          {/* View Details Modal (History only) */}
          <Modal
            open={viewOpen}
            onCancel={closeView}
            footer={null}
            width={900}
            zIndex={2000}
            destroyOnClose
            title={
              <div className="flex items-center gap-2">
                <EyeOutlined />
                <span className="text-sm font-bold">
                  Demand — {viewRow ? demandCode(viewRow) : "-"}
                </span>
              </div>
            }
          >
            {viewRow ? <Tabs defaultActiveKey="history" items={viewTabs} /> : null}
          </Modal>
        </div>
      </Layout>
    </>
  );
}