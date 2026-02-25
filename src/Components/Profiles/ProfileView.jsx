// // ================== src/pages/Profiles/ProfileView.jsx ==================
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { Modal, Tabs, Button, Checkbox, Spin, Alert, message } from "antd";
// import { EyeOutlined, PlusOutlined, PaperClipOutlined } from "@ant-design/icons";

// // APIs used inside modal
// import { getDemandsheet } from "../api/Demands/getDemands.js";
// import {
//   attachDemandsToProfileApi,
//   getDemandsByProfileApi,
// } from "../api/Profiles/attachedDemand.js";
// import { getAllOnboardings } from "../api/Onboarding/onBoarding.js";

// // History panel
// import HistoryPanel from "../history/HistoryPanel.jsx";

// /* ---------------- utils --------------- */
// const formatDateOnly = (v) => {
//   if (!v) return "-";
//   try {
//     const d = new Date(v);
//     return d.toLocaleDateString(undefined, {
//       year: "numeric",
//       month: "short",
//       day: "2-digit",
//     });
//   } catch {
//     return String(v);
//   }
// };

// // ✅ updated parameter name for clarity; logic unchanged
// function evalTone(statusName) {
//   const s = String(statusName || "").toLowerCase();
//   if (!s) return "amber";
//   if (s.includes("reject")) return "red";
//   if (s.includes("select")) return "green";
//   return "amber";
// }
// function toneStyles(tone) {
//   switch (tone) {
//     case "green":
//       return { borderColor: "#16a34a", backgroundColor: "#f0fdf4" };
//     case "red":
//       return { borderColor: "#dc2626", backgroundColor: "#fef2f2" };
//     default:
//       return { borderColor: "#f59e0b", backgroundColor: "#fffbeb" };
//   }
// }
// function toneTextColor(tone) {
//   switch (tone) {
//     case "green":
//       return "#166534";
//     case "red":
//       return "#991b1b";
//     default:
//       return "#92400e";
//   }
// }
// const RowL = ({ label, value, w = 120 }) => (
//   <div className="flex items-start gap-2" style={{ textAlign: "left" }}>
//     <span className="font-bold text-gray-900 shrink-0" style={{ width: w, textAlign: "left" }}>
//       {label}:
//     </span>
//     <span className="text-gray-800 min-w-0">{value ?? "-"}</span>
//   </div>
// );
// function fmtYMD(v) {
//   if (!v) return "-";
//   const d = new Date(v);
//   if (Number.isNaN(d.getTime())) return String(v);
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// }

// /* ---------------- Onboarding compact section ---------------- */
// function OnboardingDetailSection({ onboarding, demandId, profileId }) {
//   const wbsType = onboarding?.wbsType?.name ?? onboarding?.wbsType ?? "-";
//   const bgv = onboarding?.bgvStatus?.name ?? onboarding?.bgvStatus ?? "-";
//   const status = onboarding?.onboardingStatus?.name ?? onboarding?.onboardingStatus ?? "-";
//   const candidateName = onboarding?.profile?.candidateName ?? onboarding?.profileName ?? null;

//   return (
//     <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm" style={{ textAlign: "left" }}>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4" style={{ justifyItems: "start" }}>
//         <div className="space-y-1.5 text-[13px] leading-tight">
//           <RowL label="Demand ID" value={demandId ?? "-"} w={110} />
//           <RowL label="Candidate ID" value={profileId ?? "-"} w={110} />
//           {candidateName ? <RowL label="Candidate" value={candidateName} w={110} /> : null}
//           <RowL label="WBS Type" value={wbsType} w={110} />
//           <RowL label="Offer Date" value={fmtYMD(onboarding?.offerDate)} w={110} />
//           <RowL label="DOJ" value={fmtYMD(onboarding?.dateOfJoining)} w={110} />
//           <RowL label="C-Tool ID" value={onboarding?.ctoolId ?? "-"} w={110} />
//         </div>
//         <div className="space-y-1.5 text-[13px] leading-tight">
//           <RowL label="BGV Status" value={bgv} w={130} />
//           <RowL label="PEV Upload" value={fmtYMD(onboarding?.pevUploadDate ?? onboarding?.pevUpdateDate)} w={130} />
//           <RowL label="VP Tagging" value={fmtYMD(onboarding?.vpTagging)} w={130} />
//           <RowL label="Tech Select" value={fmtYMD(onboarding?.techSelectDate)} w={130} />
//           <RowL label="HSBC Onboard" value={fmtYMD(onboarding?.hsbcOnboardingDate)} w={130} />
//           <RowL label="Onboarding Status" value={status} w={130} />
//         </div>
//       </div>
//     </div>
//   );
// }
// const isOnboardedStatus = (rec) => {
//   const s = (rec?.onboardingStatus?.name ?? rec?.onboardingStatus ?? "").toString().trim().toUpperCase();
//   return s.includes("ONBOARD");
// };
// const isOpenOnboardingStatus = (rec) => {
//   const s = (rec?.onboardingStatus?.name ?? rec?.onboardingStatus ?? "").toString().trim().toUpperCase();
//   return s.includes("PROGRESS") || s.includes("PENDING") || s.includes("INPROGRESS");
// };

// /* ---------------- Main Modal ---------------- */
// export default function ProfileView({
//   open,
//   onClose,
//   profile,
//   width = 900,
//   initialTab = "profile",
// }) {
//   const [activeTab, setActiveTab] = useState("profile");

//   // attachments (demands)
//   const [matchingDemands, setMatchingDemands] = useState([]);
//   const [selectedDemandIds, setSelectedDemandIds] = useState([]);
//   const [attachedDemands, setAttachedDemands] = useState([]);
//   const [attachMode, setAttachMode] = useState(false);

//   // ✅ refs to avoid re-creating callbacks / effects loops
//   const attachedDemandsRef = useRef([]);
//   const demandTabLoadedForProfileRef = useRef(null);

//   useEffect(() => {
//     attachedDemandsRef.current = attachedDemands;
//   }, [attachedDemands]);

//   // reflect initial tab when opened
//   useEffect(() => {
//     if (open) setActiveTab(initialTab || "profile");
//   }, [open, initialTab]);

//   const toggleSelect = (id, checked) => {
//     const rowId = String(id);
//     setSelectedDemandIds((prev) => {
//       const s = new Set(prev.map(String));
//       if (checked) s.add(rowId);
//       else s.delete(rowId);
//       return Array.from(s);
//     });
//   };

//   // ✅ return mapped list so caller can use it to filter matching
//   const loadAttachedFromBackend = useCallback(async (profileId) => {
//     try {
//       let res = await getDemandsByProfileApi(profileId);
//       let list;
//       if (Array.isArray(res)) list = res;
//       else if (Array.isArray(res?.data)) list = res.data;
//       else if (Array.isArray(res?.items)) list = res.items;
//       else if (Array.isArray(res?.content)) list = res.content;
//       else list = [];

//       const metaIndex = {}; // meta is built by loadMatchingDemands; not critical here

//       const mapped = list.map((x) => {
//         const evaluationStatusName = x?.evaluationStatus?.name ?? x?.evaluationStatus ?? null;
//         const profileTrackerStatusName = x?.profileTrackerStatus?.name ?? x?.profileTrackerStatus ?? null;

//         // prefer backend primarySkills
//         const primarySkillsStr = (() => {
//           if (Array.isArray(x?.primarySkills)) {
//             return x.primarySkills.map((r) => r?.name).filter(Boolean).join(", ");
//           }
//           if (typeof x?.primarySkills === "string" && x.primarySkills.trim() !== "") {
//             return x.primarySkills.trim();
//           }
//           return "";
//         })();

//         return {
//           trackerId: x.id,
//           id: x.demandId ?? x.id,
//           demandId: x.demandId ?? x.id,
//           hbu: x?.hbu?.name || "",
//           skillCluster: x?.skillCluster?.name || "",
//           primarySkills: primarySkillsStr,
//           attachedDate: x.attachedDate,
//           createdAt: x.createdAt,
//           title: [x?.skillCluster?.name || "", x?.hbu?.name || ""].filter(Boolean).join(" • "),
//           evaluationStatusName,
//           profileTrackerStatusName, // <- we will use this for color coding now
//         };
//       });

//       setAttachedDemands(mapped);
//       setAttachMode((prev) => prev || mapped.length === 0);
//       setSelectedDemandIds(mapped.map((d) => String(d.id)));

//       return mapped; // ✅ give caller the exact set we just loaded
//     } catch (err) {
//       console.error("Failed to load demands by profile:", err);
//       message.error(err?.message || "Failed to load attached demands");
//       setAttachedDemands([]);
//       setAttachMode(true);
//       setSelectedDemandIds([]);
//       return [];
//     }
//   }, []);

//   // ✅ Stable callback (no deps) — uses ref to read current attachments
//   const loadMatchingDemands = useCallback(
//     async (row, attachedListOptional) => {
//       if (!row) {
//         setMatchingDemands([]);
//         return;
//       }
//       const hbuId = row.hbuId || row.hbu_id || row.hbu_id_fk || null;

//       try {
//         const resp = await getDemandsheet(0, 200, hbuId);
//         const list =
//           Array.isArray(resp?.data?.content) ? resp.data.content :
//           Array.isArray(resp?.content) ? resp.content :
//           Array.isArray(resp) ? resp :
//           [];

//         const normalized = list.map((d) => {
//           const id = d.id ?? d.demandId ?? d.displayDemandId ?? Math.random();
//           const nameOf = (obj) => (obj && typeof obj === "object" ? (obj.name ?? "") : String(obj ?? ""));
//           const join = (arr) => (Array.isArray(arr) ? arr.map((x) => nameOf(x)).filter(Boolean).join(", ") : nameOf(arr));
//           return {
//             id,
//             demandId: d.displayDemandId ?? d.demandId ?? String(id),
//             hbu: nameOf(d.hbu),
//             skillCluster: nameOf(d.skillCluster),
//             primarySkills: join(d.primarySkills),
//             title: [nameOf(d.skillCluster), nameOf(d.hbu)].filter(Boolean).join(" • "),
//           };
//         });

//         // ✅ use the freshest attached list: either the one passed, or the ref snapshot
//         const attachedSource = Array.isArray(attachedListOptional)
//           ? attachedListOptional
//           : attachedDemandsRef.current;

//         const already = new Set(attachedSource.map((a) => String(a.id)));
//         const filtered = normalized.filter((d) => !already.has(String(d.id)));
//         setMatchingDemands(filtered);
//       } catch (err) {
//         console.error("loadMatchingDemands error:", err);
//         message.error(err?.message || "Failed to load matching demands");
//         setMatchingDemands([]);
//       }
//     },
//     [] // <- no deps, uses refs/params
//   );

//   // ✅ Load ONCE per open/profile when switching to Demand tab
//   useEffect(() => {
//     if (!open || activeTab !== "demand" || !profile) return;

//     const rawId = profile.id ?? profile.profileId;
//     const numericProfileId = Number(rawId);
//     if (!numericProfileId || Number.isNaN(numericProfileId)) {
//       message.warning("Cannot load attachments without a valid profile id");
//       return;
//     }

//     // guard: avoid reloading for the same profile repeatedly
//     if (demandTabLoadedForProfileRef.current === numericProfileId) return;
//     demandTabLoadedForProfileRef.current = numericProfileId;

//     (async () => {
//       const attached = await loadAttachedFromBackend(numericProfileId);
//       await loadMatchingDemands(profile, attached);
//     })();
//   }, [open, activeTab, profile, loadAttachedFromBackend, loadMatchingDemands]);

//   // ✅ Reset guards & state on close
//   useEffect(() => {
//     if (!open) {
//       setActiveTab("profile");
//       setMatchingDemands([]);
//       setSelectedDemandIds([]);
//       setAttachedDemands([]);
//       setAttachMode(false);
//       setOnboardingList([]);
//       setOnbLoading(false);
//       setOnbError(null);
//       attachedDemandsRef.current = [];
//       demandTabLoadedForProfileRef.current = null; // reset the guard
//     }
//   }, [open]);

//   const attachSelected = async () => {
//     const rawId = profile?.id ?? profile?.profileId;
//     const profileId = Number(rawId);
//     if (!profileId || Number.isNaN(profileId)) {
//       message.error("Invalid profile id for attachment");
//       return;
//     }

//     const ids = Array.from(new Set(selectedDemandIds.map((x) => Number(x)).filter((n) => !Number.isNaN(n))));
//     if (ids.length === 0) {
//       message.warning("Select at least one demand to attach");
//       return;
//     }

//     try {
//       await attachDemandsToProfileApi(profileId, ids);
//       message.success("Demands attached to profile");

//       // optimistic UI (kept)
//       const selSet = new Set(selectedDemandIds.map(String));
//       const selectedObjs = matchingDemands.filter((d) => selSet.has(String(d.id)));
//       const nowIso = new Date().toISOString();
//       const optimisticCards = selectedObjs.map((n) => ({
//         trackerId: `tmp-${n.id}-${Date.now()}`,
//         id: n.id,
//         demandId: n.demandId ?? n.id,
//         hbu: n.hbu || "",
//         skillCluster: n.skillCluster || "",
//         primarySkills: n.primarySkills || "",
//         attachedDate: n.attachedDate || nowIso,
//         createdAt: nowIso,
//         title: [n.skillCluster || "", n.hbu || ""].filter(Boolean).join(" • "),
//       }));

//       setAttachedDemands((prev) => {
//         const map = new Map(prev.map((x) => [String(x.id), x]));
//         for (const c of optimisticCards) map.set(String(c.id), c);
//         return Array.from(map.values());
//       });

//       setMatchingDemands((prev) => prev.filter((d) => !selSet.has(String(d.id))));
//       setSelectedDemandIds([]);
//       setAttachMode(false);

//       // ✅ refresh from backend once and recompute matching using the fresh list
//       const freshAttached = await loadAttachedFromBackend(profileId);
//       await loadMatchingDemands(profile, freshAttached);
//     } catch (err) {
//       console.error("attachSelected error:", err);
//       const backendMsg = err?.response?.data?.message || err?.message || "Failed to attach demands";
//       message.error(backendMsg);
//     }
//   };

//   // Onboarding state
//   const [onbLoading, setOnbLoading] = useState(false);
//   const [onbError, setOnbError] = useState(null);
//   const [onboardingList, setOnboardingList] = useState([]);

//   const onboardedMatch = useMemo(
//     () => (onboardingList || []).find(isOnboardedStatus) || null,
//     [onboardingList]
//   );
//   const openMatch = useMemo(
//     () => (onboardingList || []).find(isOpenOnboardingStatus) || null,
//     [onboardingList]
//   );
//   const placeholderFromOpen = useMemo(() => {
//     if (!openMatch) return null;
//     return {
//       offerDate: null,
//       dateOfJoining: null,
//       ctoolId: null,
//       pevUploadDate: null,
//       vpTagging: null,
//       techSelectDate: null,
//       hsbcOnboardingDate: null,
//       bgvStatus: null,
//       onboardingStatus: openMatch?.onboardingStatus ?? { name: "In Progress" },
//       wbsType: null,
//       demand: {
//         demandId: openMatch?.demand?.demandId ?? openMatch?.demandId ?? "-",
//       },
//       profile: {
//         profileId: openMatch?.profile?.profileId ?? "-",
//         candidateName: openMatch?.profile?.candidateName ?? null,
//       },
//     };
//   }, [openMatch]);

//   // Onboarding fetch (unchanged)
//   useEffect(() => {
//     if (!open || activeTab !== "onboarding" || !profile) return;

//     const rawId = profile.profileId ?? profile.id;
//     const profileId = Number(rawId);
//     if (!profileId || Number.isNaN(profileId)) {
//       setOnboardingList([]);
//       return;
//     }

//     let cancelled = false;
//     setOnbError(null);
//     setOnbLoading(true);
//     setOnboardingList([]);

//     (async () => {
//       try {
//         let page = 0;
//         const size = 50;
//         const MAX_PAGES = 20;
//         const matches = [];

//         while (!cancelled && page < MAX_PAGES) {
//           const res = await getAllOnboardings(page, size);
//           const list = Array.isArray(res?.content) ? res.content : [];
//           const last = Boolean(res?.last);

//           for (const r of list) {
//             const rProfileId = r?.profile?.profileId ?? r?.profileId ?? null;
//             if (String(rProfileId ?? "") === String(profileId)) {
//               matches.push(r);
//             }
//           }

//           if (last) break;
//           page += 1;
//         }

//         if (!cancelled) setOnboardingList(matches);
//       } catch (e) {
//         if (!cancelled) setOnbError(e?.response?.data?.message || e?.message || "Failed to load onboarding.");
//       } finally {
//         if (!cancelled) setOnbLoading(false);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [open, activeTab, profile]);

//   const profileId = profile?.id ?? profile?.profileId;

//   return (
//     <Modal
//       open={open}
//       onCancel={onClose}
//       footer={null}
//       width={width}
//       zIndex={2000}
//       getContainer={false}
//       destroyOnHidden
//       maskClosable
//       title={
//         <div className="flex items-center justify-between pr-10">
//           <div className="flex items-center gap-2 text-gray-800">
//             <EyeOutlined />
//             <span className="text-sm font-bold">Profile View</span>
//           </div>
//         </div>
//       }
//     >
//       {!profile ? (
//         <div className="text-center text-gray-500 py-6">No details available</div>
//       ) : (
//         <Tabs
//           activeKey={activeTab}
//           onChange={setActiveTab}
//           items={[
//             {
//               key: "profile",
//               label: "Profile Details",
//               children: (
//                 <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm text-sm" style={{ textAlign: "left" }}>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4" style={{ justifyItems: "start" }}>
//                     <div className="space-y-1.5 leading-tight">
//                       <RowL label="Candidate" value={profile.candidateName || "-"} />
//                       <RowL label="Email" value={profile.emailId || "-"} />
//                       <RowL label="Phone" value={profile.phoneNumber || "-"} />
//                       <RowL label="Experience" value={profile.experienceYears || "-"} />
//                       <RowL label="Location" value={profile.location || "-"} />
//                       <RowL label="HBU" value={profile.hbu || "-"} />
//                     </div>
//                     <div className="space-y-1.5 leading-tight">
//                       <RowL label="Skill Cluster" value={profile.skillCluster || "-"} />
//                       <RowL label="Primary Skills" value={profile.primarySkills || "-"} />
//                       <RowL label="Secondary Skills" value={profile.secondarySkills || "-"} />
//                       <RowL label="Employee ID" value={profile.empId || "-"} />
//                       <RowL label="Summary" value={profile.summary || "-"} />
//                     </div>
//                   </div>
//                 </div>
//               ),
//             },
//             {
//               key: "demand",
//               label: "Demand Details",
//               children: (
//                 <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-1">
//                   <div className="flex items-center justify-between">
//                     <h4 className="font-semibold text-sm">Demands</h4>
//                     {!attachMode && attachedDemands.length > 0 ? (
//                       <Button type="primary" icon={<PlusOutlined />} onClick={() => setAttachMode(true)}>
//                         Attach Demand
//                       </Button>
//                     ) : null}
//                   </div>

//                   {/* Attached cards */}
//                   {!attachMode && attachedDemands.length > 0 && (
//                     <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
//                       <div className="flex items-center justify-between mb-2">
//                         <h4 className="font-semibold text-sm">Attached Demands</h4>
//                         <span className="text[12px] text-gray-500">{attachedDemands.length} attached</span>
//                       </div>

//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                         {attachedDemands.map((d) => {
//                           // ✅ UPDATED: tone is now computed from profile tracker status only
//                           const tone = evalTone(d?.profileTrackerStatusName);
//                           const cardStyle = toneStyles(tone);
//                           const colorText = toneTextColor(tone);

//                           return (
//                             <div
//                               key={`demand-${String(d.demandId ?? d.id)}`}
//                               className="border rounded-md p-3 shadow-sm"
//                               style={{ ...cardStyle, textAlign: "left" }}
//                             >
//                               {/* Top row: Demand # + date only */}
//                               <div className="flex items-start justify-between gap-2">
//                                 <div className="font-semibold text-[13px]" style={{ color: colorText }}>
//                                   Demand #{d.demandId ?? d.id}
//                                 </div>
//                                 <div className="text-[11px] text-gray-600" style={{ textAlign: "left" }}>
//                                   {d.attachedDate ? formatDateOnly(d.attachedDate) : "-"}
//                                 </div>
//                               </div>

//                               {!!d.hbu && (
//                                 <div className="text-[12px] text-gray-700 mt-1">
//                                   <strong>HBU:</strong> {d.hbu}
//                                 </div>
//                               )}
//                               {!!d.skillCluster && (
//                                 <div className="text-[12px] text-gray-700">
//                                   <strong>Skill Cluster:</strong> {d.skillCluster}
//                                 </div>
//                               )}
//                               <div className="text-[12px] text-gray-700" style={{ minHeight: 18 }}>
//                                 <strong>Primary:</strong> {d.primarySkills || "—"}
//                               </div>

//                               {/* Status text remains the same; only color source changed */}
//                               <div className="text-[12px] text-gray-700 mt-1">
//                                 <strong>Status:</strong> {d.profileTrackerStatusName || "—"}
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}

//                   {(attachMode || attachedDemands.length === 0) && (
//                     <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
//                       <div className="flex items-center justify-between mb-2">
//                         <h3 className="text-sm font-semibold">Attach Demands</h3>
//                         <div className="flex items-center gap-2">
//                           {attachedDemands.length > 0 && <Button onClick={() => setAttachMode(false)}>Back</Button>}
//                           <Button
//                             type="default"
//                             icon={<PaperClipOutlined />}
//                             onClick={attachSelected}
//                             className="bg-gray-900 text-white hover:bg-black"
//                           >
//                             Attach
//                           </Button>
//                         </div>
//                       </div>

//                       <div className="border border-gray-200 rounded-md">
//                         {Array.isArray(matchingDemands) && matchingDemands.length > 0 ? (
//                           <div className="divide-y divide-gray-200">
//                             {matchingDemands.map((item) => {
//                               const rowId = String(item.id);
//                               const checked = selectedDemandIds.map(String).includes(rowId);
//                               const toggle = (next) => toggleSelect(rowId, next);
//                               const cbId = `attach-demand-${rowId}`;

//                               return (
//                                 <div
//                                   key={rowId}
//                                   className="px-3 py-2 hover:bg-gray-50"
//                                   style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingLeft: 12, paddingRight: 12 }}
//                                 >
//                                   <Checkbox id={cbId} checked={checked} onChange={(e) => toggle(e.target.checked)} />
//                                   <label htmlFor={cbId} className="min-w-0 cursor-pointer select-none flex-1" style={{ textAlign: "left" }}>
//                                     <div className="font-medium">Demand #{item.demandId ?? item.id}</div>
//                                     <div className="text-gray-700">{item.title}</div>
//                                     <div className="text-gray-500 text-[12px]">Primary: {item.primarySkills || "-"}</div>
//                                   </label>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         ) : (
//                           <div className="text-gray-500 text-sm px-3 py-6">No matching demands (HBU) for this profile.</div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ),
//             },
//             {
//               key: "onboarding",
//               label: "Onboarding Detail",
//               children: (
//                 <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm text-sm" style={{ textAlign: "left" }}>
//                   {onbLoading ? (
//                     <div className="py-6 flex items-center justify-center">
//                       <Spin size="small" />
//                     </div>
//                   ) : onbError ? (
//                     <Alert type="error" showIcon message={onbError} />
//                   ) : onboardedMatch ? (
//                     <OnboardingDetailSection
//                       onboarding={onboardedMatch}
//                       demandId={onboardedMatch?.demand?.demandId ?? onboardedMatch?.demandId ?? "-"}
//                       profileId={onboardedMatch?.profile?.profileId ?? profile?.profileId ?? profile?.id ?? "-"}
//                     />
//                   ) : placeholderFromOpen ? (
//                     <OnboardingDetailSection
//                       onboarding={placeholderFromOpen}
//                       demandId={placeholderFromOpen?.demand?.demandId ?? "-"}
//                       profileId={placeholderFromOpen?.profile?.profileId ?? profile?.profileId ?? profile?.id ?? "-"}
//                     />
//                   ) : (
//                     <div className="text-gray-600 text-sm py-4 text-center">Not onboarded yet.</div>
//                   )}
//                 </div>
//               ),
//             },
//             {
//               key: "history",
//               label: "History",
//               children: (
//                 <div className="p-1 text-left" style={{ textAlign: "left" }}>
//                   <HistoryPanel mode="profile" entityId={profileId} />
//                 </div>
//               ),
//             },
//           ]}
//         />
//       )}
//     </Modal>
//   );
// }


// ================== src/pages/Profiles/ProfileView.jsx ==================
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Tabs, Button, Checkbox, Spin, Alert, message } from "antd";
import { EyeOutlined, PlusOutlined, PaperClipOutlined } from "@ant-design/icons";

// APIs used inside modal
import { getDemandsheet } from "../api/Demands/getDemands.js";
import {
  attachDemandsToProfileApi,
  getDemandsByProfileApi,
} from "../api/Profiles/attachedDemand.js";
import { getAllOnboardings } from "../api/Onboarding/onBoarding.js";

// History panel
import HistoryPanel from "../history/HistoryPanel.jsx";

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

// ✅ updated parameter name for clarity; logic unchanged
function evalTone(statusName) {
  const s = String(statusName || "").toLowerCase();
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
    case "green":
      return "#166534";
    case "red":
      return "#991b1b";
    default:
      return "#92400e";
  }
}

/* ---------------- Compact Label/Value Row ---------------- */
const RowL = ({ label, value, w = 120 }) => (
  <div className="flex items-start gap-1.5" style={{ textAlign: "left" }}>
    <span
      className="font-bold text-gray-900 shrink-0 mr-0.5 whitespace-nowrap"
      style={{ width: w, textAlign: "left" }}
    >
      {label}:
    </span>
    <span className="text-gray-800 min-w-0">{value ?? "-"}</span>
  </div>
);

/* ---------------- Date format util ---------------- */
function fmtYMD(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ---------------- Detail Block (MATCHED to Demand Detail) ---------------- */
/**
 * Matches the Demand Detail container:
 * - rounded-lg
 * - thin gray border
 * - white bg
 * - compact padding
 * - subtle/no shadow
 * - tight gaps between columns
 */
function DetailBlock({ children }) {
  return (
    <div className="border border-gray-300 rounded-lg bg-white p-3 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-1 text-sm">
        {children}
      </div>
    </div>
  );
}

/* ---------------- Onboarding section (using DetailBlock) ---------------- */
function OnboardingDetailSection({ onboarding, demandId, profileId }) {
  const wbsType = onboarding?.wbsType?.name ?? onboarding?.wbsType ?? "-";
  const bgv = onboarding?.bgvStatus?.name ?? onboarding?.bgvStatus ?? "-";
  const status = onboarding?.onboardingStatus?.name ?? onboarding?.onboardingStatus ?? "-";
  const candidateName = onboarding?.profile?.candidateName ?? onboarding?.profileName ?? null;

  return (
    <DetailBlock>
      <div className="space-y-1.5 leading-tight">
        <RowL label="Demand ID" value={demandId ?? "-"} />
        <RowL label="Candidate ID" value={profileId ?? "-"} />
        {candidateName ? <RowL label="Candidate" value={candidateName} /> : null}
        <RowL label="WBS Type" value={wbsType} />
        <RowL label="Offer Date" value={fmtYMD(onboarding?.offerDate)} />
        <RowL label="DOJ" value={fmtYMD(onboarding?.dateOfJoining)} />
        <RowL label="C-Tool ID" value={onboarding?.ctoolId ?? "-"} />
      </div>
      <div className="space-y-1.5 leading-tight">
        <RowL label="BGV Status" value={bgv} />
        <RowL
          label="PEV Upload"
          value={fmtYMD(onboarding?.pevUploadDate ?? onboarding?.pevUpdateDate)}
        />
        <RowL label="VP Tagging" value={fmtYMD(onboarding?.vpTagging)} />
        <RowL label="Tech Select" value={fmtYMD(onboarding?.techSelectDate)} />
        <RowL label="HSBC Onboard" value={fmtYMD(onboarding?.hsbcOnboardingDate)} />
        <RowL label="Onboarding Status" value={status} />
      </div>
    </DetailBlock>
  );
}

const isOnboardedStatus = (rec) => {
  const s = (rec?.onboardingStatus?.name ?? rec?.onboardingStatus ?? "")
    .toString()
    .trim()
    .toUpperCase();
  return s.includes("ONBOARD");
};
const isOpenOnboardingStatus = (rec) => {
  const s = (rec?.onboardingStatus?.name ?? rec?.onboardingStatus ?? "")
    .toString()
    .trim()
    .toUpperCase();
  return (
    s.includes("PROGRESS") || s.includes("PENDING") || s.includes("INPROGRESS")
  );
};

/* ---------------- Main Modal ---------------- */
export default function ProfileView({
  open,
  onClose,
  profile,
  width = 900,
  initialTab = "profile",
}) {
  const [activeTab, setActiveTab] = useState("profile");

  // attachments (demands)
  const [matchingDemands, setMatchingDemands] = useState([]);
  const [selectedDemandIds, setSelectedDemandIds] = useState([]);
  const [attachedDemands, setAttachedDemands] = useState([]);
  const [attachMode, setAttachMode] = useState(false);

  // ✅ refs to avoid re-creating callbacks / effects loops
  const attachedDemandsRef = useRef([]);
  const demandTabLoadedForProfileRef = useRef(null);

  useEffect(() => {
    attachedDemandsRef.current = attachedDemands;
  }, [attachedDemands]);

  // reflect initial tab when opened
  useEffect(() => {
    if (open) setActiveTab(initialTab || "profile");
  }, [open, initialTab]);

  const toggleSelect = (id, checked) => {
    const rowId = String(id);
    setSelectedDemandIds((prev) => {
      const s = new Set(prev.map(String));
      if (checked) s.add(rowId);
      else s.delete(rowId);
      return Array.from(s);
    });
  };

  // ✅ return mapped list so caller can use it to filter matching
  const loadAttachedFromBackend = useCallback(async (profileId) => {
    try {
      let res = await getDemandsByProfileApi(profileId);
      let list;
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.items)) list = res.items;
      else if (Array.isArray(res?.content)) list = res.content;
      else list = [];

      const mapped = list.map((x) => {
        const evaluationStatusName =
          x?.evaluationStatus?.name ?? x?.evaluationStatus ?? null;
        const profileTrackerStatusName =
          x?.profileTrackerStatus?.name ?? x?.profileTrackerStatus ?? null;

        // prefer backend primarySkills
        const primarySkillsStr = (() => {
          if (Array.isArray(x?.primarySkills)) {
            return x.primarySkills
              .map((r) => r?.name)
              .filter(Boolean)
              .join(", ");
          }
          if (typeof x?.primarySkills === "string" && x.primarySkills.trim() !== "") {
            return x.primarySkills.trim();
          }
          return "";
        })();

        return {
          trackerId: x.id,
          id: x.demandId ?? x.id,
          demandId: x.demandId ?? x.id,
          hbu: x?.hbu?.name || "",
          skillCluster: x?.skillCluster?.name || "",
          primarySkills: primarySkillsStr,
          attachedDate: x.attachedDate,
          createdAt: x.createdAt,
          title: [x?.skillCluster?.name || "", x?.hbu?.name || ""]
            .filter(Boolean)
            .join(" • "),
          evaluationStatusName,
          profileTrackerStatusName, // <- used for color coding
        };
      });

      setAttachedDemands(mapped);
      setAttachMode((prev) => prev || mapped.length === 0);
      setSelectedDemandIds(mapped.map((d) => String(d.id)));

      return mapped; // ✅ give caller the exact set we just loaded
    } catch (err) {
      console.error("Failed to load demands by profile:", err);
      message.error(err?.message || "Failed to load attached demands");
      setAttachedDemands([]);
      setAttachMode(true);
      setSelectedDemandIds([]);
      return [];
    }
  }, []);

  // ✅ Stable callback (no deps) — uses ref to read current attachments
  const loadMatchingDemands = useCallback(
    async (row, attachedListOptional) => {
      if (!row) {
        setMatchingDemands([]);
        return;
      }
      const hbuId = row.hbuId || row.hbu_id || row.hbu_id_fk || null;

      try {
        const resp = await getDemandsheet(0, 200, hbuId);
        const list =
          Array.isArray(resp?.data?.content)
            ? resp.data.content
            : Array.isArray(resp?.content)
            ? resp.content
            : Array.isArray(resp)
            ? resp
            : [];

        const normalized = list.map((d) => {
          const id = d.id ?? d.demandId ?? d.displayDemandId ?? Math.random();
          const nameOf = (obj) =>
            obj && typeof obj === "object" ? obj.name ?? "" : String(obj ?? "");
          const join = (arr) =>
            Array.isArray(arr)
              ? arr.map((x) => nameOf(x)).filter(Boolean).join(", ")
              : nameOf(arr);
          return {
            id,
            demandId: d.displayDemandId ?? d.demandId ?? String(id),
            hbu: nameOf(d.hbu),
            skillCluster: nameOf(d.skillCluster),
            primarySkills: join(d.primarySkills),
            title: [nameOf(d.skillCluster), nameOf(d.hbu)]
              .filter(Boolean)
              .join(" • "),
          };
        });

        const attachedSource = Array.isArray(attachedListOptional)
          ? attachedListOptional
          : attachedDemandsRef.current;

        const already = new Set(attachedSource.map((a) => String(a.id)));
        const filtered = normalized.filter((d) => !already.has(String(d.id)));
        setMatchingDemands(filtered);
      } catch (err) {
        console.error("loadMatchingDemands error:", err);
        message.error(err?.message || "Failed to load matching demands");
        setMatchingDemands([]);
      }
    },
    [] // <- no deps, uses refs/params
  );

  // ✅ Load ONCE per open/profile when switching to Demand tab
  useEffect(() => {
    if (!open || activeTab !== "demand" || !profile) return;

    const rawId = profile.id ?? profile.profileId;
    const numericProfileId = Number(rawId);
    if (!numericProfileId || Number.isNaN(numericProfileId)) {
      message.warning("Cannot load attachments without a valid profile id");
      return;
    }

    // guard: avoid reloading for the same profile repeatedly
    if (demandTabLoadedForProfileRef.current === numericProfileId) return;
    demandTabLoadedForProfileRef.current = numericProfileId;

    (async () => {
      const attached = await loadAttachedFromBackend(numericProfileId);
      await loadMatchingDemands(profile, attached);
    })();
  }, [open, activeTab, profile, loadAttachedFromBackend, loadMatchingDemands]);

  // ✅ Reset guards & state on close
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
      attachedDemandsRef.current = [];
      demandTabLoadedForProfileRef.current = null; // reset the guard
    }
  }, [open]);

  const attachSelected = async () => {
    const rawId = profile?.id ?? profile?.profileId;
    const profileId = Number(rawId);
    if (!profileId || Number.isNaN(profileId)) {
      message.error("Invalid profile id for attachment");
      return;
    }

    const ids = Array.from(
      new Set(selectedDemandIds.map((x) => Number(x)).filter((n) => !Number.isNaN(n)))
    );
    if (ids.length === 0) {
      message.warning("Select at least one demand to attach");
      return;
    }

    try {
      await attachDemandsToProfileApi(profileId, ids);
      message.success("Demands attached to profile");

      // optimistic UI (kept)
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

      // ✅ refresh from backend once and recompute matching using the fresh list
      const freshAttached = await loadAttachedFromBackend(profileId);
      await loadMatchingDemands(profile, freshAttached);
    } catch (err) {
      console.error("attachSelected error:", err);
      const backendMsg =
        err?.response?.data?.message || err?.message || "Failed to attach demands";
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

  // Onboarding fetch (unchanged)
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

    return () => {
      cancelled = true;
    };
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
          <div className="flex items-center gap-2 text-gray-8 00">
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
                // ✅ EXACT same compact look as Demand Detail
                <DetailBlock>
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
                </DetailBlock>
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
                    <div className="rounded-lg border border-gray-300 bg-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Attached Demands</h4>
                        <span className="text[12px] text-gray-500">{attachedDemands.length} attached</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {attachedDemands.map((d) => {
                          // ✅ tone computed from profile tracker status only
                          const tone = evalTone(d?.profileTrackerStatusName);
                          const cardStyle = toneStyles(tone);
                          const colorText = toneTextColor(tone);

                          return (
                            <div
                              key={`demand-${String(d.demandId ?? d.id)}`}
                              className="border rounded-md p-3"
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

                              {/* Status text remains the same; only color source changed */}
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
                    <div className="rounded-lg border border-gray-300 bg-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold">Attach Demands</h3>
                        <div className="flex items-center gap-2">
                          {attachedDemands.length > 0 && <Button onClick={() => setAttachMode(false)}>Back</Button>}
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
                                  <Checkbox id={cbId} checked={checked} onChange={(e) => toggle(e.target.checked)} />
                                  <label
                                    htmlFor={cbId}
                                    className="min-w-0 cursor-pointer select-none flex-1"
                                    style={{ textAlign: "left" }}
                                  >
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
                // ✅ EXACT same compact container
                <div className="mt-1">
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
                      profileId={
                        onboardedMatch?.profile?.profileId ?? profile?.profileId ?? profile?.id ?? "-"
                      }
                    />
                  ) : placeholderFromOpen ? (
                    <OnboardingDetailSection
                      onboarding={placeholderFromOpen}
                      demandId={placeholderFromOpen?.demand?.demandId ?? "-"}
                      profileId={
                        placeholderFromOpen?.profile?.profileId ??
                        profile?.profileId ??
                        profile?.id ??
                        "-"
                      }
                    />
                  ) : (
                    <DetailBlock>
                      <div className="col-span-2 text-gray-600">Not onboarded yet.</div>
                    </DetailBlock>
                  )}
                </div>
              ),
            },
            {
              key: "history",
              label: "History",
              children: (
                <div className="p-1 text-left" style={{ textAlign: "left" }}>
                  <HistoryPanel mode="profile" entityId={profileId} />
                </div>
              ),
            },
          ]}
        />
      )}
    </Modal>
  );
}