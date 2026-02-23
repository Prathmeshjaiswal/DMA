// src/Components/DemandsManagement/DemandDetailModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Tabs, Button, message, Spin, Alert } from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";

import { getProfiles } from "../../api/Profiles/addProfile.js";
import {
  attachProfilesToDemand,
  getAttachedProfilesByDemandId, // <-- fetch attached profiles from backend
} from "../../api/Demands/attachment.js";

// reuse onboarding list API
import { getAllOnboardings } from "../../api/Onboarding/onBoarding";

// --------------------- helpers ---------------------
const nameOf = (obj) =>
  obj && typeof obj === "object" ? (obj.name ?? "") : (obj ?? "");

/** Normalize API list response */
function extractList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

/** Always use profileId if present; fallback to id (available pool). */
function profileKey(p) {
  return p?.profileId ?? p?.id ?? null;
}

/** ---- Generic helpers ---- */
const BACKEND_FMT = "YYYY-MM-DD";
function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? String(d) : dt.toLocaleString();
}

function toTitleCase(s) {
  if (!s) return "";
  return String(s)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStatusName(p) {
  return (p?.profileTrackerStatus?.name ?? p?.status ?? "-").toString();
}

const OPEN_STATUS_SET = new Set([
  "ATTACHED",
  "PROFILE SHARED",
  "INTERVIEW SCHEDULE",
  "ON HOLD",
]);

function isOpenProfileStatus(p) {
  const status = getStatusName(p).toUpperCase();
  return OPEN_STATUS_SET.has(status);
}

/* ================== Onboarding Detail section (match Demand Detail look) ================== */
function fmtYMD(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** INLINE label/value row just like your Demand detail section */
function RowLabelValue({ label, value }) {
  return (
    <div className="leading-tight text-[12px]">
      <strong className="text-gray-900 whitespace-nowrap">{label}:</strong>{" "}
      <span className="text-gray-800">{value ?? "-"}</span>
    </div>
  );
}

/**
 * Props:
 *  - onboarding: an onboarding object (or null)
 *  - demandId:   string/number (for display)
 *  - profileId:  string/number (for display)
 * Two columns; compact padding; same visual weight as Demand Detail.
 */
function OnboardingDetailSection({ onboarding, demandId, profileId }) {
  const wbsType = onboarding?.wbsType?.name ?? onboarding?.wbsType ?? "-";
  const bgv = onboarding?.bgvStatus?.name ?? onboarding?.bgvStatus ?? "-";
  const status = onboarding?.onboardingStatus?.name ?? onboarding?.onboardingStatus ?? "-";
  const candidateName =
    onboarding?.profile?.candidateName ??
    onboarding?.profileName ??
    null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3  shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6   gap-y-2">
        {/* LEFT */}
        <div className="space-y-1.5">
          <RowLabelValue label="Demand ID" value={demandId ?? "-"} />
          <RowLabelValue label="Candidate ID" value={profileId ?? "-"} />
          {candidateName ? (
            <RowLabelValue label="Candidate" value={candidateName} />
          ) : null}
          <RowLabelValue label="WBS Type" value={wbsType} />
          <RowLabelValue label="Offer Date" value={fmtYMD(onboarding?.offerDate)} />
          <RowLabelValue label="DOJ" value={fmtYMD(onboarding?.dateOfJoining)} />
          <RowLabelValue label="C-Tool ID" value={onboarding?.ctoolId ?? "-"} />
        </div>

        {/* RIGHT */}
        <div className="space-y-1.5">
          <RowLabelValue label="BGV Status" value={bgv} />
          <RowLabelValue
            label="PEV Upload"
            value={fmtYMD(onboarding?.pevUploadDate ?? onboarding?.pevUpdateDate)}
          />
          <RowLabelValue label="VP Tagging" value={fmtYMD(onboarding?.vpTagging)} />
          <RowLabelValue label="Tech Select" value={fmtYMD(onboarding?.techSelectDate)} />
          <RowLabelValue label="HSBC Onboard" value={fmtYMD(onboarding?.hsbcOnboardingDate)} />
          <RowLabelValue label="Onboarding Status" value={status} />
        </div>
      </div>
    </div>
  );
}

/* ============== Demand id normalization helpers for matching ============== */
/** Extract numeric demand id from strings like "MSS-104" or "ET100"; fallback to the original */
function toDemandIdComparable(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (/^\d+$/.test(s)) return s; // already numeric
  const m = s.match(/(\d+)\s*$/); // capture trailing number (e.g., MSS-104 -> 104)
  return m ? m[1] : s;
}

/** Try to read a comparable demand id from the demand row in this modal */
function getComparableDemandIdFromRow(row) {
  const candidates = [
    row?.displayDemandId,
    row?.demandId, // often "MSS-104"
    row?.code,
    row?.id, // PK fallback
  ];
  for (const c of candidates) {
    const n = toDemandIdComparable(c);
    if (n != null) return n;
  }
  return null;
}

/** ---- Profile Card ---- */
function ProfileCard({ p }) {
  const candidateName = toTitleCase(p?.candidateName ?? "-");

  const primaryNames =
    Array.isArray(p?.primarySkills) && p.primarySkills.length
      ? p.primarySkills.map(nameOf).join(", ")
      : "-";

  const secondaryNames =
    Array.isArray(p?.secondarySkills) && p.secondarySkills.length
      ? p.secondarySkills.map(nameOf).join(", ")
      : null;

  const attachedDateDisplay = p?.attachedDate ?? "-";

  const statusName = getStatusName(p);

  const hbuName = nameOf(p?.hbu) || "-";
  const experienceText =
    p?.experience != null && p?.experience !== ""
      ? `${p.experience} Yrs`
      : "-";

  return (
    <div className="rounded-lg border border-gray-200 p-3 shadow-sm">
      {/* Header: name on left, STATUS on right */}
      <div className="flex items-center justify-between">
        <div className="font-semibold text-gray-800">{candidateName}</div>
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            background: "#EDF2F7",
            color: "#2D3748",
            border: "1px solid #CBD5E0",
          }}
          title="Status"
        >
          {statusName}
        </span>
      </div>

      {/* Body: two columns */}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {/* LEFT */}
        <div className="col-span-1 whitespace-normal break-words">
          <div className="mb-1">
            <strong>Primary Skills:</strong> {primaryNames}
          </div>
          {secondaryNames ? (
            <div className="mb-1 whitespace-normal break-words">
              <strong>Secondary Skills:</strong> {secondaryNames}
            </div>
          ) : null}
          <div className="mb-1">
            <strong>Attached Date:</strong> {attachedDateDisplay}
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-1">
          <div className="mb-1">
            <strong>HBU:</strong> {nameOf(p?.hbu) || "-"}
          </div>
          <div className="mb-1">
            <strong>Experience:</strong>{" "}
            {p?.experience != null && p?.experience !== "" ? `${p.experience} Yrs` : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Attach button row in "Attach Profile" mode */
function ProfileRow({ p, selected, onToggle }) {
  const isServerAttached = !!(p?.attachedDate || p?.profileAttachedDate || p?.dateAttached);
  const isSelected = !!selected;

  let label = "Attach";
  let btnType = "default";
  let disabled = false;

  if (isServerAttached) {
    label = "Attached";
    btnType = "primary";
    disabled = true;
  } else if (isSelected) {
    label = "Attached";
    btnType = "primary";
    disabled = false; // allow unselect
  }

  const handleClick = disabled ? undefined : () => onToggle?.(p);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 py-2">
      <div className="min-w-0">
        <div className="font-medium text-gray-800 truncate">
          {toTitleCase(p?.candidateName ?? "-")}
        </div>
        <div className="text-xs text-gray-500">
          Exp: {p?.experience ?? "-"}&nbsp;Yrs&nbsp;•&nbsp; HBU: {nameOf(p?.hbu) || "-"}&nbsp;•&nbsp; Loc{" "}
          {nameOf(p?.location) || "-"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="small"
          type={btnType}
          disabled={disabled}
          onClick={handleClick}
          htmlType="button"
        >
          {label}
        </Button>
      </div>
    </div>
  );
}

// ====================== main component ======================
export default function DemandDetailModal({
  open,
  onClose,
  row,
  statusChip,
}) {
  const [tab, setTab] = useState("details");
  const [attachMode, setAttachMode] = useState(false);

  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const [attachedProfiles, setAttachedProfiles] = useState([]);
  const [loadingAttached, setLoadingAttached] = useState(false);

  const [working, setWorking] = useState(false);
  const [selectedMap, setSelectedMap] = useState({}); // key = profileId

  // inner tabs under "Profile Shared": open / archived
  const [profileSubTab, setProfileSubTab] = useState("open");

  const demandPkId = row?.id ?? null;

  // ===== Onboarding state (list) =====
  const [onbLoading, setOnbLoading] = useState(false);
  const [onbError, setOnbError] = useState(null);
  const [onboardingList, setOnboardingList] = useState([]); // store ALL matches

  // *** UPDATED: derived single record to display in Onboarding tab
  const currentDemandComparable = useMemo(() => getComparableDemandIdFromRow(row), [row]);

  // Seed selection using stable profile identity
  useEffect(() => {
    if (attachMode) {
      const seeded = {};
      (attachedProfiles || []).forEach((p) => {
        const key = profileKey(p);
        if (key != null) seeded[key] = p;
      });
      setSelectedMap(seeded);
    }
  }, [attachMode, attachedProfiles]);

  const loadAvailable = async () => {
    try {
      setLoadingProfiles(true);
      const resp = await getProfiles();
      const list = extractList(resp);
      setAvailableProfiles(list);
    } catch (e) {
      console.error(e);
      message.error(e?.message || "Failed to load profiles");
    } finally {
      setLoadingProfiles(false);
    }
  };

  const loadAttached = async () => {
    if (!demandPkId) return;
    try {
      setLoadingAttached(true);
      const res = await getAttachedProfilesByDemandId(demandPkId);
      const list = extractList(res);
      setAttachedProfiles(list);
    } catch (e) {
      console.error(e);
      message.error(e?.message || "Failed to load attached profiles");
    } finally {
      setLoadingAttached(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (tab === "profile") {
      if (attachMode) {
        loadAvailable();
      } else {
        loadAttached();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, attachMode, demandPkId]);

  // Toggle by stable profile key
  const toggleSelect = (p) => {
    const key = profileKey(p);
    if (key == null) return;
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = p;
      return next;
    });
  };

  // Build selected array from map
  const selectedArray = useMemo(() => Object.values(selectedMap), [selectedMap]);

  const submitAttach = async () => {
    if (!demandPkId) {
      message.error("Missing demand primary key id");
      return;
    }
    const ids = selectedArray
      .map((p) => profileKey(p))
      .filter((v) => v != null);

    if (!ids.length) {
      message.warning("Select at least one profile to attach.");
      return;
    }
    try {
      setWorking(true);
      await attachProfilesToDemand({ demandPkId, profileIds: ids });
      message.success("Profiles attached");
      setAttachMode(false);
      await loadAttached();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to attach profiles";
      message.error(msg);
    } finally {
      setWorking(false);
    }
  };

  /** Split attached profiles by status */
  const openAttached = useMemo(
    () => (attachedProfiles || []).filter(isOpenProfileStatus),
    [attachedProfiles]
  );
  const archivedAttached = useMemo(
    () => (attachedProfiles || []).filter((p) => !isOpenProfileStatus(p)),
    [attachedProfiles]
  );

  /** ---- Header ---- */
  const header = (
    <div className="flex items-center justify-between pr-2">
      <div className="flex items-center gap-3 text-gray-800">
        <EyeOutlined />
        <span className="font-semibold">
          Demand Details — {row?.demandId}
        </span>
        {statusChip ? (
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: "#EDF2F7",
              color: "#2D3748",
              border: "1px solid #CBD5E0",
            }}
            title="Status"
          >
            {statusChip}
          </span>
        ) : null}
      </div>
      <div />
    </div>
  );

  // Load ALL matching onboardings for this demand; collect matches
  useEffect(() => {
    if (!open) return;

    setOnbError(null);
    setOnbLoading(true);
    setOnboardingList([]);

    const comparable = getComparableDemandIdFromRow(row);

    if (!comparable) {
      setOnbLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        // 1) Optionally collect attached profileIds for this demand (best-effort filter)
        let attachedIds = new Set();
        try {
          if (row?.id) {
            const resAttached = await getAttachedProfilesByDemandId(row.id);
            const list = extractList(resAttached);
            (list || []).forEach((p) => {
              const pid = p?.profileId ?? p?.id ?? p?.profile?.profileId ?? null;
              if (pid != null) attachedIds.add(String(pid));
            });
          }
        } catch {
          // best-effort only
        }

        // 2) Page through onboarding list, COLLECT matches for this demand
        let page = 0;
        const size = 50;
        const MAX_PAGES = 20;
        const matches = [];

        while (!cancelled && page < MAX_PAGES) {
          const res = await getAllOnboardings(page, size);
          const list = Array.isArray(res?.content) ? res.content : [];
          const last = Boolean(res?.last);

          for (const r of list) {
            const rDemandId = r?.demand?.demandId ?? r?.demandId ?? null;
            const rProfileId = r?.profile?.profileId ?? r?.profileId ?? null;

            const rDemandComparable = toDemandIdComparable(rDemandId);

            const demandMatch =
              rDemandComparable != null &&
              comparable != null &&
              String(rDemandComparable) === String(comparable);

            const profileOk =
              attachedIds.size === 0
                ? true
                : attachedIds.has(String(rProfileId ?? ""));

            if (demandMatch && profileOk) {
              matches.push(r);
            }
          }

          if (last) break;
          page += 1;
        }

        if (!cancelled) setOnboardingList(matches);
      } catch (e) {
        if (!cancelled) setOnbError(e?.response?.data?.message || e?.message || "Failed to load onboarding.");
      } finally {
        if (!cancelled) setOnbLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, row]);

  // ---------- Helpers to classify onboarding status ----------
  const isOnboardedStatus = (rec) => {
    const s =
      (rec?.onboardingStatus?.name ?? rec?.onboardingStatus ?? "")
        .toString()
        .trim()
        .toUpperCase();
    // Covers "ONBOARDED", "ON-BOARDED", "ONBOARD"
    return s.includes("ONBOARD");
  };
  const isOpenOnboardingStatus = (rec) => {
    const s =
      (rec?.onboardingStatus?.name ?? rec?.onboardingStatus ?? "")
        .toString()
        .trim()
        .toUpperCase();
    // Covers "IN PROGRESS", "IN-PROGRESS", "PENDING"
    return s.includes("PROGRESS") || s.includes("PENDING") || s.includes("INPROGRESS");
  };

  // *** UPDATED: choose **one** record to display in Onboarding tab
  const onboardedMatch = useMemo(
    () => (onboardingList || []).find(isOnboardedStatus) || null,
    [onboardingList]
  );
  const openMatch = useMemo(
    () => (onboardingList || []).find(isOpenOnboardingStatus) || null,
    [onboardingList]
  );

  // *** UPDATED: prepare a placeholder record (all fields "-") when only openMatch exists
  const placeholderFromOpen = useMemo(() => {
    if (!openMatch) return null;
    // Keep demand/profile identity to show context; scrub dates/fields to '-'
    return {
      offerDate: null,
      dateOfJoining: null,
      ctoolId: null,
      pevUploadDate: null,
      vpTagging: null,
      techSelectDate: null,
      hsbcOnboardingDate: null,
      bgvStatus: null,
      onboardingStatus: openMatch?.onboardingStatus ?? { name: "In Progress" },
      wbsType: null,
      demand: {
        demandId: openMatch?.demand?.demandId ?? currentDemandComparable ?? "-",
      },
      profile: {
        profileId: openMatch?.profile?.profileId ?? "-",
        candidateName: openMatch?.profile?.candidateName ?? null,
      },
    };
  }, [openMatch, currentDemandComparable]);

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={980} title={header}>
      {!row ? null : (
        <div className="space-y-4">
          <Tabs
            activeKey={tab}
            onChange={(k) => {
              setTab(k);
              if (k !== "profile") setAttachMode(false);
            }}
            items={[
              {
                key: "details",
                label: "Demand Detail",
                children: (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-sm">
                      <div><strong>RR:</strong> {row.rrNumber || "-"}</div>
                      <div><strong>Pod/Programme:</strong> {row.prodProgramName || "-"}</div>
                      <div><strong>LOB:</strong> {row.lob || "-"}</div>
                      <div><strong>Skill Cluster:</strong> {row.skillCluster || "-"}</div>
                      <div><strong>Primary Skill:</strong> {row.primarySkills || "-"}</div>
                      <div><strong>Secondary Skill:</strong> {row.secondarySkills || "-"}</div>
                      <div><strong>Priority:</strong> {row.priority || "-"}</div>
                      <div><strong>Status:</strong> {row.status || "-"}</div>
                      <div><strong>Band:</strong> {row.band || "-"}</div>
                      <div><strong>Experience:</strong> {row.experience || "-"}</div>
                      <div><strong>Hiring Manager:</strong> {row.hiringManager || "-"}</div>
                      <div><strong>Delivery Manager:</strong> {row.deliveryManager || "-"}</div>
                      <div><strong>PM:</strong> {row.pm || "-"}</div>
                      <div><strong>PMO SPOC:</strong> {row.pmoSpoc || "-"}</div>
                      <div><strong>Sales Spoc:</strong> {row.salesSpoc || "-"}</div>
                      <div><strong>PMO:</strong> {row.pmo || "-"}</div>
                      <div><strong>HBU:</strong> {row.hbu || "-"}</div>
                      <div><strong>Timeline:</strong> {row.demandTimeline || "-"}</div>
                      <div><strong>Type:</strong> {row.demandType || "-"}</div>
                      <div><strong>Received Date:</strong> {row.demandReceivedDate || "-"}</div>
                      <div className="sm:col-span-2"><strong>Location:</strong> {row.demandLocation || "-"}</div>
                      <div className="sm:col-span-2"><strong>Remark:</strong> {row.remark || "-"}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: "profile",
                label: "Profile Shared",
                children: (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm text-sm">
                    {/* Inner tabs: Open Profiles / Archived Profiles */}
                    <Tabs
                      activeKey={profileSubTab}
                      onChange={(k) => {
                        setProfileSubTab(k);
                        setAttachMode(false);
                      }}
                      items={[
                        { key: "open", label: "Open Profiles" },
                        { key: "archived", label: "Archived Profiles" },
                      ]}
                    />

                    {/* Header actions - only in Open tab */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-gray-700 font-medium">
                        {profileSubTab === "open" ? "Open Profiles" : "Archived Profiles"}
                      </div>

                      {profileSubTab === "open" && !attachMode ? (
                        <Button
                          icon={<PlusOutlined />}
                          type="primary"
                          onClick={() => {
                            setAttachMode(true);
                            loadAvailable();
                          }}
                        >
                          Attach Profile
                        </Button>
                      ) : profileSubTab === "open" && attachMode ? (
                        <div className="flex items-center gap-2">
                          <Button onClick={() => setAttachMode(false)} disabled={working}>
                            Back
                          </Button>
                          <Button type="primary" loading={working} onClick={submitAttach}>
                            Submit
                          </Button>
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>

                    {/* Body */}
                    {profileSubTab === "archived" ? (
                      <>
                        {loadingAttached ? (
                          <div className="text-gray-500 text-sm px-2 py-6">
                            Loading archived profiles…
                          </div>
                        ) : archivedAttached?.length ? (
                          <div className="grid sm:grid-cols-2 gap-3">
                            {archivedAttached.map((p) => (
                              <ProfileCard key={profileKey(p)} p={p} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-600">No archived profiles.</div>
                        )}
                      </>
                    ) : !attachMode ? (
                      <>
                        {loadingAttached ? (
                          <div className="text-gray-500 text-sm px-2 py-6">
                            Loading attached profiles…
                          </div>
                        ) : openAttached?.length ? (
                          <div className="grid sm:grid-cols-2 gap-3">
                            {openAttached.map((p) => (
                              <ProfileCard key={profileKey(p)} p={p} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-600">No profile attached.</div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="rounded-md border border-gray-100 p-2">
                          {loadingProfiles ? (
                            <div className="text-gray-500 text-sm px-2 py-6">
                              Loading profiles…
                            </div>
                          ) : availableProfiles?.length ? (
                            <div className="divide-y divide-gray-200">
                              {availableProfiles.map((p) => {
                                const key = profileKey(p);
                                return (
                                  <ProfileRow
                                    key={key}
                                    p={p}
                                    selected={!!selectedMap[key]}
                                    onToggle={toggleSelect}
                                  />
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm px-2 py-6">
                              No profiles available.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ),
              },

              // ======================= Onboarding Detail (SINGLE SECTION) =======================
              // *** UPDATED: remove inner tabs; show either onboarded record, or placeholder for open, or nothing
              {
                key: "onboarding",
                label: "Onboarding Detail",
                children: (
                  <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm text-sm">
                    {onbLoading ? (
                      <div className="py-6 flex items-center justify-center">
                        <Spin size="small" />
                      </div>
                    ) : onbError ? (
                      <Alert type="error" showIcon message={onbError} />
                    ) : onboardedMatch ? (
                      <OnboardingDetailSection
                        onboarding={onboardedMatch}
                        demandId={row?.demandId ?? row?.id ?? "-"}
                        profileId={onboardedMatch?.profile?.profileId ?? "-"}
                      />
                    ) : placeholderFromOpen ? (
                      <OnboardingDetailSection
                        onboarding={placeholderFromOpen}
                        demandId={row?.demandId ?? row?.id ?? "-"}
                        profileId={placeholderFromOpen?.profile?.profileId ?? "-"}
                      />
                    ) : (
                      <div className="text-gray-600 text-sm py-4 text-center">
                        Not onboarded yet.
                      </div>
                    )}
                  </div>
                ),
              },
              // ==========================================================================

              {
                key: "history",
                label: "History",
                children: (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="space-y-2 text-sm">
                      <div><strong>Updated By:</strong> {"-"}{}</div>
                      <div><strong>Updated At:</strong> {"-"} </div>
                      <div><strong>Updated Data:</strong></div>
                      <pre className="bg-gray-50 p-2 rounded border border-gray-200 overflow-auto text-xs">
                        {"No change log available."}
                      </pre>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </Modal>
  );
}