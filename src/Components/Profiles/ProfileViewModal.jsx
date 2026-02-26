// ================== src/pages/Profiles/ProfileViewModal.jsx ==================
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Tabs, Button, Checkbox, Spin, Alert, message } from "antd";
import { EyeOutlined, PlusOutlined, PaperClipOutlined } from "@ant-design/icons";

// APIs used inside modal
import { getDemandsheet } from "../api/Demands/getDemands.js";
import {
  attachDemandsToProfileApi,
  getDemandsByProfileApi,
} from "../api/Profiles/attachedDemand.js";
import { getAllOnboardings } from "../api/Onboarding/onBoarding";

// History panel
import HistoryPanel from "../../components/history/HistoryPanel";

/* ---------------- utils --------------- */
const formatDateOnly = (v) => {
  if (!v) return "-";
  try {
    const d = new Date(v);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return String(v);
  }
};

function evalTone(name) {
  const s = String(name || "").toLowerCase();
  if (!s) return "amber";
  if (s.includes("reject")) return "red";
  if (s.includes("select")) return "green";
  return "amber";
}
function toneStyles(tone) {
  switch (tone) {
    case "green":
      return { borderColor: "#16a34a", backgroundColor: "#f0fdf4" };
    case "red":
      return { borderColor: "#dc2626", backgroundColor: "#fef2f2" };
    default:
      return { borderColor: "#f59e0b", backgroundColor: "#fffbeb" };
  }
}
function toneTextColor(tone) {
  switch (tone) {
    case "green": return "#166534";
    case "red": return "#991b1b";
    default: return "#92400e";
  }
}
const RowL = ({ label, value, w = 120 }) => (
  <div className="flex items-start gap-2" style={{ textAlign: "left" }}>
    <span className="font-bold text-gray-900 shrink-0" style={{ width: w, textAlign: "left" }}>
      {label}:
    </span>
    <span className="text-gray-800 min-w-0">{value ?? "-"}</span>
  </div>
);
function fmtYMD(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ---------------- Onboarding compact section ---------------- */
function OnboardingDetailSection({ onboarding, demandId, profileId }) {
  const wbsType = onboarding?.wbsType?.name ?? onboarding?.wbsType ?? "-";
  const bgv = onboarding?.bgvStatus?.name ?? onboarding?.bgvStatus ?? "-";
  const status = onboarding?.onboardingStatus?.name ?? onboarding?.onboardingStatus ?? "-";
  const candidateName = onboarding?.profile?.candidateName ?? onboarding?.profileName ?? null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm" style={{ textAlign: "left" }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4" style={{ justifyItems: "start" }}>
        <div className="space-y-1.5 text-[13px] leading-tight">
          <RowL label="Demand ID" value={demandId ?? "-"} w={110} />
          <RowL label="Candidate ID" value={profileId ?? "-"} w={110} />
          {candidateName ? <RowL label="Candidate" value={candidateName} w={110} /> : null}
          <RowL label="WBS Type" value={wbsType} w={110} />
          <RowL label="Offer Date" value={fmtYMD(onboarding?.offerDate)} w={110} />
          <RowL label="DOJ" value={fmtYMD(onboarding?.dateOfJoining)} w={110} />
          <RowL label="C-Tool ID" value={onboarding?.ctoolId ?? "-"} w={110} />
        </div>
        <div className="space-y-1.5 text-[13px] leading-tight">
          <RowL label="BGV Status" value={bgv} w={130} />
          <RowL label="PEV Upload" value={fmtYMD(onboarding?.pevUploadDate ?? onboarding?.pevUpdateDate)} w={130} />
          <RowL label="VP Tagging" value={fmtYMD(onboarding?.vpTagging)} w={130} />
          <RowL label="Tech Select" value={fmtYMD(onboarding?.techSelectDate)} w={130} />
          <RowL label="HSBC Onboard" value={fmtYMD(onboarding?.hsbcOnboardingDate)} w={130} />
          <RowL label="Onboarding Status" value={status} w={130} />
        </div>
      </div>
    </div>
  );
}
const isOnboardedStatus = (rec) => {
  const s = (rec?.onboardingStatus?.name ?? rec?.onboardingStatus ?? "").toString().trim().toUpperCase();
  return s.includes("ONBOARD");
};
const isOpenOnboardingStatus = (rec) => {
  const s = (rec?.onboardingStatus?.name ?? rec?.onboardingStatus ?? "").toString().trim().toUpperCase();
  return s.includes("PROGRESS") || s.includes("PENDING") || s.includes("INPROGRESS");
};

/* ---------------- Main Modal ---------------- */
export default function ProfileViewModal({ open, onClose, profile, width = 900 }) {
  const [activeTab, setActiveTab] = useState("profile");

  // attachments (demands)
  const [matchingDemands, setMatchingDemands] = useState([]);
  const [selectedDemandIds, setSelectedDemandIds] = useState([]);
  const [attachedDemands, setAttachedDemands] = useState([]);
  const [attachMode, setAttachMode] = useState(false);

  const demandMetaRef = useRef({});

  const toggleSelect = (id, checked) => {
    const rowId = String(id);
    setSelectedDemandIds((prev) => {
      const s = new Set(prev.map(String));
      if (checked) s.add(rowId); else s.delete(rowId);
      return Array.from(s);
    });
  };

  const loadAttachedFromBackend = useCallback(async (profileId) => {
    try {
      let res = await getDemandsByProfileApi(profileId);
      let list;
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.items)) list = res.items;
      else if (Array.isArray(res?.content)) list = res.content;
      else list = [];

      const metaIndex = demandMetaRef.current || {};
      const mapped = list.map((x) => {
        const key = String(x.demandId ?? x.id ?? "");
        const meta = key ? metaIndex[key] : undefined;

        const evaluationStatusName = x?.evaluationStatus?.name ?? x?.evaluationStatus ?? null;
        const profileTrackerStatusName = x?.profileTrackerStatus?.name ?? x?.profileTrackerStatus ?? null;

        // ✅ Fix flicker: prefer backend primarySkills if present; fallback to meta
        const primarySkillsStr = (() => {
          if (Array.isArray(x?.primarySkills)) {
            return x.primarySkills.map((r) => r?.name).filter(Boolean).join(", ");
          }
          if (typeof x?.primarySkills === "string" && x.primarySkills.trim() !== "") {
            return x.primarySkills.trim();
          }
          if (typeof meta?.primarySkills === "string" && meta.primarySkills.trim() !== "") {
            return meta.primarySkills.trim();
          }
          return "";
        })();

        return {
          trackerId: x.id,
          id: x.demandId ?? x.id,
          demandId: x.demandId ?? x.id,

          hbu: x?.hbu?.name || meta?.hbu || "",
          skillCluster: meta?.skillCluster || "",
          primarySkills: primarySkillsStr,

          attachedDate: x.attachedDate,
          createdAt: x.createdAt,
          title: [meta?.skillCluster || "", x?.hbu?.name || meta?.hbu || ""].filter(Boolean).join(" • "),

          evaluationStatusName,
          profileTrackerStatusName,
        };
      });

      setAttachedDemands(mapped);
      // ✅ Keep attach panel open if user opened it; otherwise auto-open when there are zero attachments
      setAttachMode((prev) => prev || mapped.length === 0);
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
    const hbuId = row.hbuId || row.hbu_id || row.hbu_id_fk || null;

    try {
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
        metaEntries[key] = { hbu: n.hbu || "", skillCluster: n.skillCluster || "", primarySkills: n.primarySkills || "" };
      }
      demandMetaRef.current = { ...(demandMetaRef.current || {}), ...metaEntries };

      const already = new Set(attachedDemands.map((a) => String(a.id)));
      const filtered = normalized.filter((d) => !already.has(String(d.id)));
      setMatchingDemands(filtered);
    } catch (err) {
      console.error("loadMatchingDemands error:", err);
      message.error(err?.message || "Failed to load matching demands");
      setMatchingDemands([]);
    }
  }, [attachedDemands]);

  const attachSelected = async () => {
    const rawId = profile?.id ?? profile?.profileId;
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
      if (profile) loadMatchingDemands(profile);
    } catch (err) {
      console.error("attachSelected error:", err);
      const backendMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to attach demands";
      message.error(backendMsg);
    }
  };

  // Onboarding state
  const [onbLoading, setOnbLoading] = useState(false);
  const [onbError, setOnbError] = useState(null);
  const [onboardingList, setOnboardingList] = useState([]);

  const onboardedMatch = useMemo(
    () => (onboardingList || []).find(isOnboardedStatus) || null,
    [onboardingList]
  );
  const openMatch = useMemo(
    () => (onboardingList || []).find(isOpenOnboardingStatus) || null,
    [onboardingList]
  );
  const placeholderFromOpen = useMemo(() => {
    if (!openMatch) return null;
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
        demandId: openMatch?.demand?.demandId ?? openMatch?.demandId ?? "-",
      },
      profile: {
        profileId: openMatch?.profile?.profileId ?? "-",
        candidateName: openMatch?.profile?.candidateName ?? null,
      },
    };
  }, [openMatch]);

  // lifecycle for modal open/close & tabs
  useEffect(() => {
    if (!open) {
      setActiveTab("profile");
      setMatchingDemands([]);
      setSelectedDemandIds([]);
      setAttachedDemands([]);
      setAttachMode(false);
      setOnboardingList([]);
      setOnbLoading(false);
      setOnbError(null);
      demandMetaRef.current = {};
    }
  }, [open]);

  useEffect(() => {
    if (!open || activeTab !== "demand" || !profile) return;
    const rawId = profile.id ?? profile.profileId;
    const numericProfileId = Number(rawId);
    if (!numericProfileId || Number.isNaN(numericProfileId)) {
      message.warning("Cannot load attachments without a valid profile id");
      return;
    }
    (async () => {
      await Promise.all([
        loadAttachedFromBackend(numericProfileId),
        loadMatchingDemands(profile),
      ]);
    })();
  }, [open, activeTab, profile, loadAttachedFromBackend, loadMatchingDemands]);

  useEffect(() => {
    if (!open || activeTab !== "onboarding" || !profile) return;

    const rawId = profile.profileId ?? profile.id;
    const profileId = Number(rawId);
    if (!profileId || Number.isNaN(profileId)) {
      setOnboardingList([]);
      return;
    }

    let cancelled = false;
    setOnbError(null);
    setOnbLoading(true);
    setOnboardingList([]);

    (async () => {
      try {
        let page = 0;
        const size = 50;
        const MAX_PAGES = 20;
        const matches = [];

        while (!cancelled && page < MAX_PAGES) {
          const res = await getAllOnboardings(page, size);
          const list = Array.isArray(res?.content) ? res.content : [];
          const last = Boolean(res?.last);

          for (const r of list) {
            const rProfileId = r?.profile?.profileId ?? r?.profileId ?? null;
            if (String(rProfileId ?? "") === String(profileId)) {
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

    return () => { cancelled = true; };
  }, [open, activeTab, profile]);

  const profileId = profile?.id ?? profile?.profileId;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={width}
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
      {!profile ? (
        <div className="text-center text-gray-500 py-6">No details available</div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "profile",
              label: "Profile Details",
              children: (
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm text-sm" style={{ textAlign: "left" }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4" style={{ justifyItems: "start" }}>
                    <div className="space-y-1.5 leading-tight">
                      <RowL label="Candidate" value={profile.candidateName || "-"} />
                      <RowL label="Email" value={profile.emailId || "-"} />
                      <RowL label="Phone" value={profile.phoneNumber || "-"} />
                      <RowL label="Experience" value={profile.experienceYears || "-"} />
                      <RowL label="Location" value={profile.location || "-"} />
                      <RowL label="HBU" value={profile.hbu || "-"} />
                    </div>
                    <div className="space-y-1.5 leading-tight">
                      <RowL label="Skill Cluster" value={profile.skillCluster || "-"} />
                      <RowL label="Primary Skills" value={profile.primarySkills || "-"} />
                      <RowL label="Secondary Skills" value={profile.secondarySkills || "-"} />
                      <RowL label="Employee ID" value={profile.empId || "-"} />
                      <RowL label="Summary" value={profile.summary || "-"} />
                    </div>
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

                  {/* Attached cards */}
                  {!attachMode && attachedDemands.length > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Attached Demands</h4>
                        <span className="text-[12px] text-gray-500">{attachedDemands.length} attached</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {attachedDemands.map((d) => {
                          const tone = evalTone(d?.evaluationStatusName);
                          const cardStyle = toneStyles(tone);
                          const colorText = toneTextColor(tone);

                          return (
                            <div
                              key={`demand-${String(d.demandId ?? d.id)}`}
                              className="border rounded-md p-3 shadow-sm"
                              style={{ ...cardStyle, textAlign: "left" }}
                            >
                              {/* Top row: Demand # + date only */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-semibold text-[13px]" style={{ color: colorText }}>
                                  Demand #{d.demandId ?? d.id}
                                </div>
                                <div className="text-[11px] text-gray-600" style={{ textAlign: "left" }}>
                                  {d.attachedDate ? formatDateOnly(d.attachedDate) : "-"}
                                </div>
                              </div>

                              {!!d.hbu && (
                                <div className="text-[12px] text-gray-700 mt-1">
                                  <strong>HBU:</strong> {d.hbu}
                                </div>
                              )}
                              {!!d.skillCluster && (
                                <div className="text-[12px] text-gray-700">
                                  <strong>Skill Cluster:</strong> {d.skillCluster}
                                </div>
                              )}
                              <div className="text-[12px] text-gray-700" style={{ minHeight: 18 }}>
                                <strong>Primary:</strong> {d.primarySkills || "—"}
                              </div>

                              <div className="text-[12px] text-gray-700 mt-1">
                                <strong>Status:</strong> {d.profileTrackerStatusName || "—"}
                              </div>
                            </div>
                          );
                        })}
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
                                  style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingLeft: 12, paddingRight: 12 }}
                                >
                                  <Checkbox
                                    id={cbId}
                                    checked={checked}
                                    onChange={(e) => toggle(e.target.checked)}
                                  />
                                  <label htmlFor={cbId} className="min-w-0 cursor-pointer select-none flex-1" style={{ textAlign: "left" }}>
                                    <div className="font-medium">Demand #{item.demandId ?? item.id}</div>
                                    <div className="text-gray-700">{item.title}</div>
                                    <div className="text-gray-500 text-[12px]">Primary: {item.primarySkills || "-"}</div>
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
              key: "onboarding",
              label: "Onboarding Detail",
              children: (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm text-sm" style={{ textAlign: "left" }}>
                  {onbLoading ? (
                    <div className="py-6 flex items-center justify-center">
                      <Spin size="small" />
                    </div>
                  ) : onbError ? (
                    <Alert type="error" showIcon message={onbError} />
                  ) : onboardedMatch ? (
                    <OnboardingDetailSection
                      onboarding={onboardedMatch}
                      demandId={onboardedMatch?.demand?.demandId ?? onboardedMatch?.demandId ?? "-"}
                      profileId={onboardedMatch?.profile?.profileId ?? profile?.profileId ?? profile?.id ?? "-"}
                    />
                  ) : placeholderFromOpen ? (
                    <OnboardingDetailSection
                      onboarding={placeholderFromOpen}
                      demandId={placeholderFromOpen?.demand?.demandId ?? "-"}
                      profileId={placeholderFromOpen?.profile?.profileId ?? profile?.profileId ?? profile?.id ?? "-"}
                    />
                  ) : (
                    <div className="text-gray-600 text-sm py-4 text-center">
                      Not onboarded yet.
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "history",
              label: "History",
              children: (
                // ✅ Left aligned like DemandDetailModal
                <div className="p-1 text-left" style={{ textAlign: "left" }}>
                  <HistoryPanel mode="profile" entityId={profileId} fetchSize={100} />
                </div>
              ),
            },
          ]}
        />
      )}
    </Modal>
  );
}