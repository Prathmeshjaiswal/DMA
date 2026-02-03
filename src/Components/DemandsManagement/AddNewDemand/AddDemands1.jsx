//
// import React, { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import Layout from "../../Layout.jsx";
// import Select, { components } from "react-select";
// import { message, Spin } from "antd";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import {
//   LoadingOutlined,
//   AppstoreOutlined,         // Basics
//   ToolOutlined,             // Skills
//   TeamOutlined,             // People
//   ProjectOutlined,          // Business
//   ScheduleOutlined,         // Timeline
//   EnvironmentOutlined,      // Location
//   BarsOutlined,             // Band
//   CalendarOutlined          // Date
// } from "@ant-design/icons";
// import { format } from "date-fns";
//
// import { buildAllOptions } from "../DemandSheet/dropdown.js";
// import { getDropDownData, submitStep1 } from "../../api/Demands/addDemands.js";
//  import { saveStep1Draft } from "../../api/Demands/draft.js";
//
// const todayStr = () => format(new Date(), "dd-MMM-yyyy");
//
// // React-Select list option with a checkbox
// const CheckboxOption = (props) => (
//   <components.Option {...props}>
//     <div className="flex items-center justify-between">
//       <span>{props.label}</span>
//       <input type="checkbox" checked={props.isSelected} readOnly />
//     </div>
//   </components.Option>
// );
//
// // Small section header with icon
// const SectionHeader = ({ icon, title, helper }) => (
//   <div className="flex items-center gap-2 mt-1 mb-3 ml-4 ">
//     <span className="text-gray-700">{icon}</span>
//     <h2 className="text-sm font-bold text-gray-900">{title}</h2>
//     {helper ? <span className="text-xs text-gray-500">• {helper}</span> : null}
//   </div>
// );
//
// /**
//  * Reusable: Dropdown that toggles to a pure text input when user selects “Other”.
//  * - When “Other” is chosen, dropdown is hidden and only a text input is shown
//  * - No placeholder and the input is empty initially
//  * - The same bound value is used for both modes
//  */
// function SelectOrText({
//   label,
//   name,
//   value,
//   onChange,
//   optionsList,
//   placeholder = "Select",
// }) {
//   const [isOther, setIsOther] = useState(false);
//
//   // If current value is not in options, treat it as “Other”
//   useEffect(() => {
//     const list = Array.isArray(optionsList) ? optionsList : [];
//     const found = list.some((o) => String(o.value) === String(value));
//     if (value && !found) {
//       setIsOther(true);
//     }
//   }, [optionsList, value]);
//
//   if (isOther) {
//     return (
//       <div>
//         {label ? <label className="block text-xs font-medium text-gray-700">{label}</label> : null}
//         <div className="mt-1 flex items-center gap-2">
//           <input
//             className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
//             name={name}
//             value={value || ""}   // empty by default
//             onChange={(e) => onChange(e.target.value)}
//           />
//           <button
//             type="button"
//             className="text-xs text-gray-600 underline hover:text-gray-900"
//             onClick={() => {
//               setIsOther(false);
//               onChange(""); // clear when switching back to dropdown
//             }}
//           >
//             Back to list
//           </button>
//         </div>
//       </div>
//     );
//   }
//
//   return (
//     <div>
//       {label ? <label className="block text-xs font-medium text-gray-700">{label}</label> : null}
//       <select
//         className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 mt-1"
//         value={value || ""}
//         onChange={(e) => {
//           const v = e.target.value;
//           if (v === "__other__") {
//             setIsOther(true);
//             onChange(""); // switch to empty text input
//           } else {
//             onChange(v);
//           }
//         }}
//       >
//         <option value="">{placeholder}</option>
//         {(Array.isArray(optionsList) ? optionsList : []).map((o) => (
//           <option key={String(o.value)} value={String(o.value)}>
//             {o.label}
//           </option>
//         ))}
//         <option value="__other__">Other (Specify)</option>
//       </select>
//     </div>
//   );
// }
//
//
// export default function AddDemands1() {
//   const navigate = useNavigate();
//
//   // Minimalist tokens
//   const labelCls = "block text-xs font-medium text-gray-700";
//   const inputCls =
//     "w-full h-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900";
//
//   const [loading, setLoading] = useState(false);
//   const [dropdowns, setDropdowns] = useState(null);
//
//   const [form, setForm] = useState({
//     // Basics
//     lob: "",
//     noOfPositions: "1",
//     // Skills
//     skillCluster: [],
//     primarySkills: [],
//     secondarySkills: [],
//     // People (single string each: either option value or free text)
//     hiringManager: "",
//     deliveryManager: "",
//     pm: "",
//     // Business
//     salesSpoc: "",
//     pmo: "",
//     hbu: "",
//     // Demand details
//     demandTimeline: "",  // defaulted to "Current" after options load
//     demandType: "",      // defaulted to "New" after options load
//     demandLocation: [],  // checkbox pills
//     // Other
//     band: "",
//     priority: "",
//     demandReceivedDate: todayStr(),
//     remark: "",
//   });
//
//   const [dropdownsLoaded, setDropdownsLoaded] = useState(false);
//
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const dd = await getDropDownData();
//         if (mounted) setDropdowns(dd);
//       } catch (e) {
//         console.error("Failed to load dropdowns:", e);
//         message.error("Failed to load form data. Please refresh.");
//       } finally {
//         if (mounted) setDropdownsLoaded(true);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);
//
//   const options = useMemo(() => buildAllOptions(dropdowns), [dropdowns]);
//
//   const safe = (arr) => (Array.isArray(arr) ? arr : []);
//   const strVal = (v) => (v === null || v === undefined ? "" : String(v));
//
//   const handleChange = (e) => {
//     const { name, value, type } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
//     }));
//   };
//
//  // small helpers
//  const toNum = (v) => (v === "" || v == null ? null : Number(v));
//  const toNumArray = (arr) =>
//    Array.isArray(arr)
//      ? arr
//          .map((x) => {
//            const raw = typeof x === "object" ? x.value ?? x : x;
//            const n = Number(raw);
//            return Number.isFinite(n) ? n : null;
//          })
//          .filter((n) => n != null)
//      : [];
//
// const handleSaveDraft = async () => {
//     try {
//       // Build payload as per server schema; assumes your dropdown `value`s are numeric IDs.
//       const payload = {
//         bandId:             toNum(form.band),
//         priorityId:         toNum(form.priority),
//         lobId:              toNum(form.lob),
//         demandTypeId:       toNum(form.demandType),
//         demandTimelineId:   toNum(form.demandTimeline),
//         externalInternalId: toNum(form.externalInternal),  // if not present, will be null
//         statusId:           toNum(form.status),            // if not present, will be null
//         podId:              toNum(form.prodProgramName),   // if you hold pod/program id
//         pmoSpocId:          toNum(form.pmoSpoc),
//         salesSpocId:        toNum(form.salesSpoc),
//         hiringManagerId:    toNum(form.hiringManager),
//         deliveryManagerId:  toNum(form.deliveryManager),
//         skillClusterId:     toNum(form.skillCluster?.value ?? form.skillCluster),
//         pmoId:              toNum(form.pmo),
//         experience:         toNum(form.experience),
//         remark:             form.remark || "",
//         primarySkillsId:    toNumArray(form.primarySkills),
//         secondarySkillsId:  toNumArray(form.secondarySkills),
//         demandLocationId:   toNumArray(form.demandLocation),
//         numberOfPositions:  toNum(form.noOfPositions),
//         hbu_id:             toNum(form.hbu),
//         hbu_spoc_id:        toNum(form.hbuSpoc),           // if you have it, otherwise null
//       };
//
//       const resp = await saveStep1Draft(payload);
//       if (!resp?.success) throw new Error(resp?.message || "Draft save failed");
//
//       const { draftId, assignments } = resp.data || {};
//       // Keep the draftId handy for Step-2 and DemandSheet view
//       localStorage.setItem("step1DraftId", String(draftId));
//       localStorage.setItem("step1DraftAssignments", JSON.stringify(assignments || []));
//
//       message.success(`Draft saved. Draft ID: ${draftId}`);
//     } catch (err) {
//       console.error("[Step1] save draft error:", err);
//       message.error(err?.message || "Could not save draft.");
//     }
//   };
//
//
//   // Restore draft
//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem("addDemandStep1Draft");
//       if (!raw) return;
//       const draft = JSON.parse(raw);
//       setForm((prev) => ({
//         ...prev,
//         ...draft,
//         demandReceivedDate: draft.demandReceivedDate || todayStr(),
//         // normalize location if saved previously as CSV
//         demandLocation: Array.isArray(draft.demandLocation)
//           ? draft.demandLocation.map(String)
//           : typeof draft.demandLocation === "string" && draft.demandLocation.length
//           ? draft.demandLocation.split(",").map((v) => v.trim())
//           : [],
//       }));
//       message.info("Draft restored.");
//     } catch {
//       /* ignore */
//     }
//   }, []);
//
//   // ===== Default "Demand Type: New" and "Demand Timeline: Current" once options are available =====
//   useEffect(() => {
//     if (!options) return;
//     setForm((prev) => {
//       const next = { ...prev };
//       // If empty, try to find match by value first, else by label
//       if (!prev.demandType) {
//         const byVal =
//           safe(options.demandType).find((o) => String(o.value).toLowerCase() === "new");
//         const byLabel =
//           safe(options.demandType).find((o) => String(o.label).toLowerCase() === "new");
//         next.demandType = strVal(byVal?.value ?? byLabel?.value ?? prev.demandType);
//       }
//       if (!prev.demandTimeline) {
//         const byVal =
//           safe(options.demandTimeline).find((o) => String(o.value).toLowerCase() === "current");
//         const byLabel =
//           safe(options.demandTimeline).find((o) => String(o.label).toLowerCase() === "current");
//         next.demandTimeline = strVal(byVal?.value ?? byLabel?.value ?? prev.demandTimeline);
//       }
//       return next;
//     });
//     // run once after options change
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [options?.demandType, options?.demandTimeline]);
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//
//     // Basic validations
//     if (!form.lob) return message.warning("Line of Business is required.");
//     if (!form.noOfPositions || Number(form.noOfPositions) < 1)
//       return message.warning("No. of Positions must be at least 1.");
//     if (!form.skillCluster) return message.warning("Skill Cluster is required.");
//     if (!form.demandReceivedDate)
//       return message.warning("Demand Received Date is required.");
//
//     // Stringify skills
//     const primarySkillsStr = (form.primarySkills || [])
//       .map((i) => i.value)
//       .join(",");
//     const secondarySkillsStr = (form.secondarySkills || [])
//       .map((i) => i.value)
//       .join(",");
//     const skillClusterStr = form.skillCluster?.value || "";
//
//     // Demand Location: CSV
//     const demandLocationStr = (form.demandLocation || []).join(",");
//
//     setLoading(true);
//
//     const payload = {
//       lob: form.lob,
//       noOfPositions: Number(form.noOfPositions || 0),
//       skillCluster: skillClusterStr,
//       primarySkills: primarySkillsStr,
//       secondarySkills: secondarySkillsStr,
//       demandReceivedDate: form.demandReceivedDate,
//
//       // People: directly either option value or free text
//       hiringManager: form.hiringManager,
//       deliveryManager: form.deliveryManager,
//       pm: form.pm,
//
//       // Business + details
//       salesSpoc: form.salesSpoc,
//       hbu: form.hbu,
//       pmo: form.pmo,
//       demandType: form.demandType,
//       demandTimeline: form.demandTimeline,
//       demandLocation: demandLocationStr, // CSV
//       band: form.band,
//       priority: form.priority,
//       remark: form.remark,
//     };
//
//     try {
//       const res = await submitStep1(payload);
//       const serverDTO = res?.data ?? res;
//       message.success("Demand ID has been generated successfully!");
//       localStorage.removeItem("addDemandStep1Draft");
//       navigate("/addDemands2", { state: { form1Data: serverDTO } });
//     } catch (err) {
//       console.error("[Step1] error:", err);
//       message.error(err?.message || "Step 1 failed.");
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   if (!dropdowns || !dropdownsLoaded) {
//     return (
//       <Layout>
//         <div className="flex items-center justify-center h-72">
//           <Spin indicator={<LoadingOutlined style={{ fontSize: 28 }} spin />} />
//           <span className="ml-3 text-gray-600">Loading…</span>
//         </div>
//       </Layout>
//     );
//   }
//
//   // ===== pill radio renderer (re-usable for LOB, Timeline, Type) =====
//   const PillRadios = ({ name, optionsList, value, onChange }) => (
//     <div className="flex flex-wrap gap-3">
//       {safe(optionsList).map((o) => {
//         const val = strVal(o.value);
//         const active = value === val;
//         return (
//           <label
//             key={val}
//             className={`px-3 py-2 rounded-md border cursor-pointer text-sm
//               ${
//                 active
//                   ? "bg-gray-900 text-white border-gray-900"
//                   : "border-gray-300 text-gray-700 hover:border-gray-400"
//               }`}
//           >
//             <input
//               type="radio"
//               name={name}
//               value={val}
//               checked={active}
//               onChange={(e) => onChange(e.target.value)}
//               className="hidden"
//             />
//             <span>{o.label}</span>
//           </label>
//         );
//       })}
//     </div>
//   );
//
//   // ===== checkbox pill renderer for locations =====
//   const PillCheckboxes = ({ name, optionsList, selected, onToggle }) => (
//     <div className="flex flex-wrap gap-3">
//       {safe(optionsList).map((o) => {
//         const val = strVal(o.value);
//         const checked = selected.includes(val);
//         return (
//           <label
//             key={val}
//             className={`px-3 py-2 rounded-md border cursor-pointer text-sm
//               ${
//                 checked
//                   ? "bg-gray-900 text-white border-gray-900"
//                   : "border-gray-300 text-gray-700 hover:border-gray-400"
//               }`}
//           >
//             <input
//               type="checkbox"
//               name={name}
//               value={val}
//               checked={checked}
//               onChange={(e) => onToggle(val, e.target.checked)}
//               className="hidden"
//             />
//             <span>{o.label}</span>
//           </label>
//         );
//       })}
//     </div>
//   );
//
//   return (
//     <Layout>
//       {/* Page Title */}
//       <div className="">
//         <h1 className="text-lg font-bold">Add Demands</h1>
//       </div>
//
//       <form onSubmit={handleSubmit} className="">
//         <div className="bg-white border border-gray-200 ">
//
//           {/* ========= Section: Basics ========= */}
//           <section>
//             <SectionHeader
//               icon={<AppstoreOutlined />}
//               title="Basics"
//               helper="Select the LOB and enter total positions."
//             />
//
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* LOB (pill radios) */}
//               <div className="flex items-start gap-4 px-3 pb-3 w-5/6">
//                 <span className={`${labelCls} whitespace-nowrap mt-2`}>Line of Business:</span>
//                 <PillRadios
//                   name="lob"
//                   optionsList={options?.lob}
//                   value={form.lob}
//                   onChange={(val) => setForm((p) => ({ ...p, lob: val }))}
//                 />
//               </div>
//
//               {/* No. of Positions (inline) */}
//               <div className="flex items-center gap-4 px-3 pb-3">
//                 <label className={`${labelCls} whitespace-nowrap`}>No. of Positions:</label>
//                 <input
//                   className={`${inputCls} w-1/6`}
//                   type="number"
//                   min={1}
//                   placeholder="1"
//                   value={form.noOfPositions}
//                   onChange={(e) => setForm({ ...form, noOfPositions: e.target.value })}
//                 />
//               </div>
//             </div>
//           </section>
//
//           {/* ========= Section: Skills ========= */}
//           <section>
//             <SectionHeader
//               icon={<ToolOutlined />}
//               title="Skills"
//               helper="Choose skill cluster, then primary and secondary skills."
//             />
//
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
//               {/* Skill Cluster (single) */}
//               <div>
//                 <label className={labelCls}>Skill Cluster</label>
//                 <Select
//                   options={safe(options?.skillCluster)}
//                   isMulti={false}
//                   isClearable
//                   value={form.skillCluster}
//                   onChange={(selected) => setForm({ ...form, skillCluster: selected })}
//                   placeholder="Select Skill Cluster"
//                   className="mt-1"
//                   styles={{
//                     control: (base, state) => ({
//                       ...base,
//                       minHeight: 38,
//                       borderColor: state.isFocused ? "#111827" : "#D1D5DB",
//                       boxShadow: state.isFocused ? "0 0 0 2px rgba(17,24,39,0.15)" : "none",
//                       ":hover": { borderColor: "#111827" },
//                     }),
//                     valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
//                     indicatorsContainer: (base) => ({ ...base, paddingRight: 4 }),
//                   }}
//                 />
//               </div>
//
//               {/* Primary Skills (max 5) */}
//               <div>
//                 <label className={labelCls}>Primary Skills (max 5)</label>
//                 <Select
//                   options={safe(options?.primarySkills)}
//                   isMulti
//                   isClearable
//                   closeMenuOnSelect={false}
//                   hideSelectedOptions
//                   components={{ Option: CheckboxOption }}
//                   value={form.primarySkills}
//                   onChange={(selected) => {
//                     if (selected && selected.length > 5) {
//                       message.warning("You can select only 5 primary skills.");
//                       return;
//                     }
//                     setForm({ ...form, primarySkills: selected || [] });
//                   }}
//                   placeholder="Select up to 5"
//                   className="mt-1"
//                   styles={{
//                     control: (base, state) => ({
//                       ...base,
//                       minHeight: 38,
//                       borderColor: state.isFocused ? "#111827" : "#D1D5DB",
//                       boxShadow: state.isFocused ? "0 0 0 2px rgba(17,24,39,0.15)" : "none",
//                       ":hover": { borderColor: "#111827" },
//                     }),
//                     valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
//                     indicatorsContainer: (base) => ({ ...base, paddingRight: 4 }),
//                   }}
//                 />
//               </div>
//
//               {/* Secondary Skills */}
//               <div>
//                 <label className={labelCls}>Secondary Skills</label>
//                 <Select
//                   options={safe(options?.secondarySkills)}
//                   isMulti
//                   isClearable
//                   closeMenuOnSelect={false}
//                   hideSelectedOptions
//                   components={{ Option: CheckboxOption }}
//                   value={form.secondarySkills}
//                   onChange={(selected) => setForm({ ...form, secondarySkills: selected || [] })}
//                   placeholder="Secondary Skills"
//                   className="mt-1 "
//                   styles={{
//                     control: (base, state) => ({
//                       ...base,
//                       minHeight: 38,
//                       borderColor: state.isFocused ? "#111827" : "#D1D5DB",
//                       boxShadow: state.isFocused ? "0 0 0 2px rgba(17,24,39,0.15)" : "none",
//                       ":hover": { borderColor: "#111827" },
//                     }),
//                     valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
//                     indicatorsContainer: (base) => ({ ...base, paddingRight: 4 }),
//                   }}
//                 />
//               </div>
//             </div>
//           </section>
//
//           {/* ========= Section: People ========= */}
//           <section>
//             <SectionHeader
//               icon={<TeamOutlined />}
//               title="People"
//               helper="Select stakeholders for this demand."
//             />
//
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
//               {/* Hiring Manager */}
//               <SelectOrText
//                 label="Hiring Manager"
//                 name="hiringManager"
//                 value={form.hiringManager}
//                 onChange={(v) => setForm((p) => ({ ...p, hiringManager: v }))}
//                 optionsList={options?.hiringManager}
//                 placeholder="Select Hiring Manager"
//               />
//
//               {/* Delivery Manager */}
//               <SelectOrText
//                 label="Delivery Manager"
//                 name="deliveryManager"
//                 value={form.deliveryManager}
//                 onChange={(v) => setForm((p) => ({ ...p, deliveryManager: v }))}
//                 optionsList={options?.deliveryManager}
//                 placeholder="Select Delivery Manager"
//               />
//
//               {/* PM */}
//               <SelectOrText
//                 label="Project Manager (PM)"
//                 name="pm"
//                 value={form.pm}
//                 onChange={(v) => setForm((p) => ({ ...p, pm: v }))}
//                 optionsList={options?.pm}
//                 placeholder="Select Project Manager"
//               />
//             </div>
//           </section>
//
//           {/* ========= Section: Business ========= */}
//           <section>
//             <SectionHeader
//               icon={<ProjectOutlined />}
//               title="Business"
//               helper="Business context and internal ownership."
//             />
//
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
//               {/* Sales SPOC */}
//               <div>
//                 <label className={labelCls}>Sales SPOC</label>
//                 <select
//                   className={`${inputCls} mt-1 `}
//                   value={form.salesSpoc}
//                   onChange={(e) => setForm({ ...form, salesSpoc: e.target.value })}
//                 >
//                   <option value="">Select Sales SPOC</option>
//                   {safe(options?.salesSpoc).map((o) => (
//                     <option key={String(o.value)} value={String(o.value)}>
//                       {o.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//
//               {/* PMO */}
//               <div>
//                 <label className={labelCls}>PMO</label>
//                 <select
//                   className={`${inputCls} mt-1`}
//                   value={form.pmo}
//                   onChange={(e) => setForm({ ...form, pmo: e.target.value })}
//                 >
//                   <option value="">Select PMO</option>
//                   {safe(options?.pmo).map((o) => (
//                     <option key={String(o.value)} value={String(o.value)}>
//                       {o.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//
//               {/* HBU */}
//               <div>
//                 <label className={labelCls}>HBU</label>
//                 <select
//                   className={`${inputCls} mt-1`}
//                   value={form.hbu}
//                   onChange={(e) => setForm({ ...form, hbu: e.target.value })}
//                 >
//                   <option value="">Select HBU</option>
//                   {safe(options?.hbu).map((o) => (
//                     <option key={String(o.value)} value={String(o.value)}>
//                       {o.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </section>
//
//           {/* ========= Section: Demand Details ========= */}
//           <section>
//             <SectionHeader
//               icon={<ScheduleOutlined />}
//               title="Demand Details"
//               helper="Timeline, type and locations."
//             />
//
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
//               {/* Demand Timeline (pill radios) */}
//               <div>
//                 <label className={`${labelCls} mb-1 block`}>Demand Timeline</label>
//                 <PillRadios
//                   name="demandTimeline"
//                   optionsList={options?.demandTimeline}
//                   value={form.demandTimeline}
//                   onChange={(val) => setForm((p) => ({ ...p, demandTimeline: val }))}
//                 />
//               </div>
//
//               {/* Demand Type (pill radios) */}
//               <div>
//                 <label className={`${labelCls} mb-1 block`}>Demand Type</label>
//                 <PillRadios
//                   name="demandType"
//                   optionsList={options?.demandType}
//                   value={form.demandType}
//                   onChange={(val) => setForm((p) => ({ ...p, demandType: val }))}
//                 />
//               </div>
//
//               {/* Priority */}
//               <div>
//                 <label className={labelCls}>Priority</label>
//                 <select
//                   className={`${inputCls}`}
//                   value={form.priority}
//                   onChange={(e) => setForm({ ...form, priority: e.target.value })}
//                 >
//                   <option value="">Select Priority</option>
//                   {safe(options?.priority).map((o) => (
//                     <option key={String(o.value)} value={String(o.value)}>
//                       {o.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </section>
//
//           {/* ========= Section: Band, Locations & Date ========= */}
//           <section>
//             <SectionHeader
//               icon={<BarsOutlined />}
//               title="Band • Locations • Date"
//             />
//
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
//               {/* Band */}
//               <div>
//                 <label className={labelCls}>Band</label>
//                 <select
//                   className={`${inputCls} mt-1`}
//                   value={form.band}
//                   onChange={(e) => setForm({ ...form, band: e.target.value })}
//                 >
//                   <option value="">Select Band</option>
//                   {safe(options?.band).map((o) => (
//                     <option key={String(o.value)} value={String(o.value)}>
//                       {o.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//
//               {/* Demand Location (checkbox pills) */}
//               <div>
//                 <label className={`${labelCls} mb-1 block`}>Demand Location</label>
//                 <PillCheckboxes
//                   name="demandLocation"
//                   optionsList={options?.demandLocation || options?.location || []}
//                   selected={form.demandLocation}
//                   onToggle={(val, isChecked) =>
//                     setForm((prev) => {
//                       const curr = new Set(prev.demandLocation.map(String));
//                       if (isChecked) curr.add(val);
//                       else curr.delete(val);
//                       return { ...prev, demandLocation: Array.from(curr) };
//                     })
//                   }
//                 />
//                 <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pl-22">
//                   <EnvironmentOutlined />
//                   <span>Select one or more locations.</span>
//                 </div>
//               </div>
//
//               {/* Demand Received Date */}
//               <div>
//                 <label className={labelCls}>Demand Received Date</label>
//                 <div className="relative mt-1">
//                   <DatePicker
//                     selected={
//                       form.demandReceivedDate
//                         ? new Date(form.demandReceivedDate)
//                         : new Date()
//                     }
//                     onChange={(date) =>
//                       setForm({
//                         ...form,
//                         demandReceivedDate: date ? format(date, "dd-MMM-yyyy") : "",
//                       })
//                     }
//                     dateFormat="dd-MMM-yyyy"
//                     className={`${inputCls} pr-10`}
//                     placeholderText="dd-MMM-yyyy"
//                   />
//                   <CalendarOutlined className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                 </div>
//               </div>
//             </div>
//           </section>
//
//           {/* ========= Section: Remark ========= */}
//           <section>
//             <SectionHeader title="Remark" />
//             <div className="relative">
//               <textarea
//                 className="w-full h-20 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none"
//                 rows={4}
//                 maxLength={500}
//                 placeholder="Enter Remark (max 500 characters)"
//                 value={form.remark || ""}
//                 onChange={(e) => setForm({ ...form, remark: e.target.value })}
//               />
//               <span className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none select-none">
//                 {(form.remark?.length || 0)}/500
//               </span>
//             </div>
//           </section>
//         </div>
//
//         {/* Footer Actions (right-aligned) */}
//         <div className="flex justify-end gap-3 mt-6">
//           <button
//             type="button"
//             onClick={handleSaveDraft}
//             className="rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
//             disabled={loading}
//           >
//             Save Draft
//           </button>
//           <button
//             type="submit"
//             className="rounded-md bg-gray-900 text-white px-5 py-2 text-sm font-semibold hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-70"
//             disabled={loading}
//           >
//             {loading ? (
//               <>
//                 <LoadingOutlined style={{ marginRight: 8 }} />
//                 Generating…
//               </>
//             ) : (
//               "Next: Generate Demand IDs"
//             )}
//           </button>
//         </div>
//       </form>
//     </Layout>
//   );
// }

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../Layout.jsx";
import Select, { components } from "react-select";
import { message, Spin } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  LoadingOutlined,
  AppstoreOutlined,         // Basics
  ToolOutlined,             // Skills
  TeamOutlined,             // People
  ProjectOutlined,          // Business
  ScheduleOutlined,         // Timeline
  EnvironmentOutlined,      // Location
  BarsOutlined,             // Band
  CalendarOutlined          // Date
} from "@ant-design/icons";
import { format } from "date-fns";

import { getDropDownData, submitStep1 } from "../../api/Demands/addDemands.js";
import { saveStep1Draft } from "../../api/Demands/draft.js";

const todayStr = () => format(new Date(), "dd-MMM-yyyy");

// React-Select list option with a checkbox
const CheckboxOption = (props) => (
  <components.Option {...props}>
    <div className="flex items-center justify-between">
      <span>{props.label}</span>
      <input type="checkbox" checked={props.isSelected} readOnly />
    </div>
  </components.Option>
);

// Small section header with icon
const SectionHeader = ({ icon, title, helper }) => (
  <div className="flex items-center gap-2 mt-1 mb-3 ml-4 ">
    <span className="text-gray-700">{icon}</span>
    <h2 className="text-sm font-bold text-gray-900">{title}</h2>
    {helper ? <span className="text-xs text-gray-500">• {helper}</span> : null}
  </div>
);

// Helpers to build react-select options from {id,name}
const toOptions = (list) =>
  Array.isArray(list)
    ? list
        .map((x) =>
          x && typeof x === "object"
            ? { value: Number(x.id), label: String(x.name ?? "").trim() }
            : null
        )
        .filter((o) => o && o.label)
    : [];

// Small helpers for IDs
const toNum = (v) => (v === "" || v == null ? null : Number(v));
const toNumArrayFromSelect = (arr) =>
  Array.isArray(arr) ? arr.map((o) => Number(o.value)).filter((n) => Number.isFinite(n)) : [];
const toCSV = (arr) => (Array.isArray(arr) ? arr.join(",") : "");

export default function AddDemands1() {
  const navigate = useNavigate();

  // Minimalist tokens
  const labelCls = "block text-xs font-medium text-gray-700";
  const inputCls =
    "w-full h-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900";

  const [loading, setLoading] = useState(false);
  const [dropdowns, setDropdowns] = useState(null);

  const [form, setForm] = useState({
    // Basics
    lob: "",                     // ID
    noOfPositions: "1",
    // Skills
    skillCluster: null,          // react-select option: {value:id,label}
    primarySkills: [],           // react-select options[]
    secondarySkills: [],         // react-select options[]
    // People (IDs)
    hiringManager: "",
    deliveryManager: "",
    pm: "",
    // Business
    salesSpoc: "",
    pmo: "",
    pmoSpoc: "",
    hbu: "",
    // Demand details (IDs)
    demandTimeline: "",          // e.g. 1 = Current
    demandType: "",              // e.g. 1 = New
    demandLocation: [],          // array of numeric IDs (pills)
    // Other
    band: "",
    priority: "",
    demandReceivedDate: todayStr(),
    remark: "",
  });

  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dd = await getDropDownData(); // expects { data: { ...lists } } already unwrapped in your api
        if (!mounted) return;
        setDropdowns(dd?.data || dd); // support both shapes
      } catch (e) {
        console.error("Failed to load dropdowns:", e);
        message.error("Failed to load form data. Please refresh.");
      } finally {
        if (mounted) setDropdownsLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Build options directly from provided lists (id, name)
  const options = useMemo(() => {
    const d = dropdowns || {};
    return {
      lob: toOptions(d.lobList),
      skillCluster: toOptions(d.skillClusterList),
      primarySkills: toOptions(d.primarySkillsList),
      secondarySkills: toOptions(d.secondarySkillsList),
      demandType: toOptions(d.demandTypeList),
      demandTimeline: toOptions(d.demandTimelineList),
      externalInternal: toOptions(d.externalInternalList),
      status: toOptions(d.statusList),
      hbu: toOptions(d.hbuList),
      hiringManager: toOptions(d.hiringManagerList),
      deliveryManager: toOptions(d.deliveryManagerList),
      salesSpoc: toOptions(d.salesSpocList),
      pmo: toOptions(d.pmoList),
      pmoSpoc: toOptions(d.pmoSpocList),
      projectManager: toOptions(d.projectManagerList),
      demandLocation: toOptions(d.demandLocationList),
      band: toOptions(d.bandList),
      priority: toOptions(d.priorityList),
      pod: toOptions(d.podList),
    };
  }, [dropdowns]);

  const safe = (arr) => (Array.isArray(arr) ? arr : []);
  const strVal = (v) => (v === null || v === undefined ? "" : String(v));

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  // ===== Default "Demand Type: New" and "Demand Timeline: Current" once options are available =====
  useEffect(() => {
    if (!options) return;
    setForm((prev) => {
      const next = { ...prev };

      if (!prev.demandType && options?.demandType?.length) {
        // find id by label 'New' (case-insensitive), else pick first
        const newOpt =
          options.demandType.find((o) => o.label?.toLowerCase() === "new") ||
          options.demandType[0];
        next.demandType = strVal(newOpt?.value ?? "");
      }

      if (!prev.demandTimeline && options?.demandTimeline?.length) {
        const curOpt =
          options.demandTimeline.find((o) => o.label?.toLowerCase() === "current") ||
          options.demandTimeline[0];
        next.demandTimeline = strVal(curOpt?.value ?? "");
      }

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.demandType, options?.demandTimeline]);

  // Save draft to SERVER (Step-1) — send only IDs
  const handleSaveDraft = async () => {
    try {
      const payload = {
        bandId:             toNum(form.band),
        priorityId:         toNum(form.priority),
        lobId:              toNum(form.lob),
        demandTypeId:       toNum(form.demandType),
        demandTimelineId:   toNum(form.demandTimeline),
        externalInternalId: toNum(form.externalInternal),   // if you add UI for this
        statusId:           toNum(form.status),             // if you add UI for this
        podId:              toNum(form.pod),                // if you add UI for this
        pmoSpocId:          toNum(form.pmoSpoc),
        salesSpocId:        toNum(form.salesSpoc),
        hiringManagerId:    toNum(form.hiringManager),
        deliveryManagerId:  toNum(form.deliveryManager),
        skillClusterId:     toNum(form.skillCluster?.value ?? form.skillCluster),
        pmoId:              toNum(form.pmo),
        experience:         toNum(form.experience),
        remark:             form.remark || "",
        primarySkillsId:    toNumArrayFromSelect(form.primarySkills),
        secondarySkillsId:  toNumArrayFromSelect(form.secondarySkills),
        demandLocationId:   form.demandLocation.map((id) => Number(id)).filter((n) => Number.isFinite(n)),
        numberOfPositions:  toNum(form.noOfPositions),
        hbu_id:             toNum(form.hbu),
        hbu_spoc_id:        toNum(form.hbuSpoc),            // if you add UI for this
      };

      const resp = await saveStep1Draft(payload);
      if (!resp?.success) throw new Error(resp?.message || "Draft save failed");

      const { draftId, assignments } = resp.data || {};
      localStorage.setItem("step1DraftId", String(draftId));
      localStorage.setItem("step1DraftAssignments", JSON.stringify(assignments || []));

      message.success(`Draft saved. Draft ID: ${draftId}`);
    } catch (err) {
      console.error("[Step1] save draft error:", err);
      message.error(err?.message || "Could not save draft.");
    }
  };

  // ===== pill radio renderer (re-usable for LOB, Timeline, Type) =====
  const PillRadios = ({ name, optionsList, value, onChange }) => (
    <div className="flex flex-wrap gap-3">
      {safe(optionsList).map((o) => {
        const val = String(o.value);
        const active = String(value) === val;
        return (
          <label
            key={val}
            className={`px-3 py-2 rounded-md border cursor-pointer text-sm
              ${
                active
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
          >
            <input
              type="radio"
              name={name}
              value={val}
              checked={active}
              onChange={(e) => onChange(e.target.value)}
              className="hidden"
            />
            <span>{o.label}</span>
          </label>
        );
      })}
    </div>
  );

  // ===== checkbox pill renderer for locations =====
  const PillCheckboxes = ({ name, optionsList, selected, onToggle }) => (
    <div className="flex flex-wrap gap-3">
      {safe(optionsList).map((o) => {
        const val = String(o.value);
        const checked = selected.map(String).includes(val);
        return (
          <label
            key={val}
            className={`px-3 py-2 rounded-md border cursor-pointer text-sm
              ${
                checked
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
          >
            <input
              type="checkbox"
              name={name}
              value={val}
              checked={checked}
              onChange={(e) => onToggle(val, e.target.checked)}
              className="hidden"
            />
            <span>{o.label}</span>
          </label>
        );
      })}
    </div>
  );

  const submitting = loading;
  const setSubmitting = setLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!form.lob) return message.warning("Line of Business is required.");
    if (!form.noOfPositions || Number(form.noOfPositions) < 1)
      return message.warning("No. of Positions must be at least 1.");
    if (!form.skillCluster) return message.warning("Skill Cluster is required.");
    if (!form.demandReceivedDate)
      return message.warning("Demand Received Date is required.");

    setSubmitting(true);

    // Build Step-1 SUBMIT payload with only IDs (arrays as CSV)
    const payload = {
      bandId:             toNum(form.band),
      priorityId:         toNum(form.priority),
      lobId:              toNum(form.lob),
      demandTypeId:       toNum(form.demandType),
      demandTimelineId:   toNum(form.demandTimeline),
      externalInternalId: toNum(form.externalInternal),
      statusId:           toNum(form.status),
      podId:              toNum(form.pod),
      pmoSpocId:          toNum(form.pmoSpoc),
      salesSpocId:        toNum(form.salesSpoc),
      hiringManagerId:    toNum(form.hiringManager),
      deliveryManagerId:  toNum(form.deliveryManager),
      skillClusterId:     toNum(form.skillCluster?.value ?? form.skillCluster),
      pmoId:              toNum(form.pmo),
      experience:         toNum(form.experience),
      remark:             form.remark || "",
      primarySkillsId:    toCSV(toNumArrayFromSelect(form.primarySkills)),
      secondarySkillsId:  toCSV(toNumArrayFromSelect(form.secondarySkills)),
      demandLocationId:   toCSV(form.demandLocation.map((id) => Number(id)).filter((n) => Number.isFinite(n))),
      numberOfPositions:  toNum(form.noOfPositions),
      hbu_id:             toNum(form.hbu),
      hbu_spoc_id:        toNum(form.hbuSpoc),
      demandReceivedDate: form.demandReceivedDate, // keeping as date string (dd-MMM-yyyy)
    };

    try {
      const res = await submitStep1(payload);
      const serverDTO = res?.data ?? res;
      message.success("Demand ID has been generated successfully!");
      navigate("/addDemands2", { state: { form1Data: serverDTO } });
    } catch (err) {
      console.error("[Step1] error:", err);
      message.error(err?.message || "Step 1 failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!dropdowns || !dropdownsLoaded) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-72">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 28 }} spin />} />
          <span className="ml-3 text-gray-600">Loading…</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Title */}
      <div className="">
        <h1 className="text-lg font-bold">Add Demands</h1>
      </div>

      <form onSubmit={handleSubmit} className="">
        <div className="bg-white border border-gray-200 ">
          {/* ========= Section: Basics ========= */}
          <section>
            <SectionHeader
              icon={<AppstoreOutlined />}
              title="Basics"
              helper="Select the LOB and enter total positions."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LOB (pill radios, values are IDs) */}
              <div className="flex items-start gap-4 px-3 pb-3 w-5/6">
                <span className={`${labelCls} whitespace-nowrap mt-2`}>Line of Business:</span>
                <PillRadios
                  name="lob"
                  optionsList={options?.lob}
                  value={form.lob}
                  onChange={(val) => setForm((p) => ({ ...p, lob: val }))}
                />
              </div>

              {/* No. of Positions (inline) */}
              <div className="flex items-center gap-4 px-3 pb-3">
                <label className={`${labelCls} whitespace-nowrap`}>No. of Positions:</label>
                <input
                  className={`${inputCls} w-1/6`}
                  type="number"
                  min={1}
                  placeholder="1"
                  value={form.noOfPositions}
                  onChange={(e) => setForm({ ...form, noOfPositions: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* ========= Section: Skills ========= */}
          <section>
            <SectionHeader
              icon={<ToolOutlined />}
              title="Skills"
              helper="Choose skill cluster, then primary and secondary skills."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
              {/* Skill Cluster (single, stores option object but payload uses id) */}
              <div>
                <label className={labelCls}>Skill Cluster</label>
                <Select
                  options={safe(options?.skillCluster)}
                  isMulti={false}
                  isClearable
                  value={form.skillCluster}
                  onChange={(selected) => setForm({ ...form, skillCluster: selected })}
                  placeholder="Select Skill Cluster"
                  className="mt-1"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      minHeight: 38,
                      borderColor: state.isFocused ? "#111827" : "#D1D5DB",
                      boxShadow: state.isFocused ? "0 0 0 2px rgba(17,24,39,0.15)" : "none",
                      ":hover": { borderColor: "#111827" },
                    }),
                    valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
                    indicatorsContainer: (base) => ({ ...base, paddingRight: 4 }),
                  }}
                />
              </div>

              {/* Primary Skills (max 5) */}
              <div>
                <label className={labelCls}>Primary Skills (max 5)</label>
                <Select
                  options={safe(options?.primarySkills)}
                  isMulti
                  isClearable
                  closeMenuOnSelect={false}
                  hideSelectedOptions
                  components={{ Option: CheckboxOption }}
                  value={form.primarySkills}
                  onChange={(selected) => {
                    if (selected && selected.length > 5) {
                      message.warning("You can select only 5 primary skills.");
                      return;
                    }
                    setForm({ ...form, primarySkills: selected || [] });
                  }}
                  placeholder="Select up to 5"
                  className="mt-1"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      minHeight: 38,
                      borderColor: state.isFocused ? "#111827" : "#D1D5DB",
                      boxShadow: state.isFocused ? "0 0 0 2px rgba(17,24,39,0.15)" : "none",
                      ":hover": { borderColor: "#111827" },
                    }),
                    valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
                    indicatorsContainer: (base) => ({ ...base, paddingRight: 4 }),
                  }}
                />
              </div>

              {/* Secondary Skills */}
              <div>
                <label className={labelCls}>Secondary Skills</label>
                <Select
                  options={safe(options?.secondarySkills)}
                  isMulti
                  isClearable
                  closeMenuOnSelect={false}
                  hideSelectedOptions
                  components={{ Option: CheckboxOption }}
                  value={form.secondarySkills}
                  onChange={(selected) => setForm({ ...form, secondarySkills: selected || [] })}
                  placeholder="Secondary Skills"
                  className="mt-1 "
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      minHeight: 38,
                      borderColor: state.isFocused ? "#111827" : "#D1D5DB",
                      boxShadow: state.isFocused ? "0 0 0 2px rgba(17,24,39,0.15)" : "none",
                      ":hover": { borderColor: "#111827" },
                    }),
                    valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
                    indicatorsContainer: (base) => ({ ...base, paddingRight: 4 }),
                  }}
                />
              </div>
            </div>
          </section>

          {/* ========= Section: People ========= */}
          <section>
            <SectionHeader
              icon={<TeamOutlined />}
              title="People"
              helper="Select stakeholders for this demand."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
              {/* Hiring Manager (IDs) */}
              <div>
                <label className={labelCls}>Hiring Manager</label>
                <select
                  className={`${inputCls} mt-1`}
                  value={form.hiringManager}
                  onChange={(e) => setForm({ ...form, hiringManager: e.target.value })}
                >
                  <option value="">Select Hiring Manager</option>
                  {safe(options?.hiringManager).map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Manager (IDs) */}
              <div>
                <label className={labelCls}>Delivery Manager</label>
                <select
                  className={`${inputCls} mt-1`}
                  value={form.deliveryManager}
                  onChange={(e) => setForm({ ...form, deliveryManager: e.target.value })}
                >
                  <option value="">Select Delivery Manager</option>
                  {safe(options?.deliveryManager).map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* PM (projectManagerList) */}
              <div>
                <label className={labelCls}>Project Manager (PM)</label>
                <select
                  className={`${inputCls} mt-1`}
                  value={form.pm}
                  onChange={(e) => setForm({ ...form, pm: e.target.value })}
                >
                  <option value="">Select Project Manager</option>
                  {safe(options?.projectManager).map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ========= Section: Business ========= */}
          <section>
            <SectionHeader
              icon={<ProjectOutlined />}
              title="Business"
              helper="Business context and internal ownership."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
              {/* Sales SPOC */}
              <div>
                <label className={labelCls}>Sales SPOC</label>
                <select
                  className={`${inputCls} mt-1 `}
                  value={form.salesSpoc}
                  onChange={(e) => setForm({ ...form, salesSpoc: e.target.value })}
                >
                  <option value="">Select Sales SPOC</option>
                  {safe(options?.salesSpoc).map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* PMO */}
              <div>
                <label className={labelCls}>PMO</label>
                <select
                  className={`${inputCls} mt-1`}
                  value={form.pmo}
                  onChange={(e) => setForm({ ...form, pmo: e.target.value })}
                >
                  <option value="">Select PMO</option>
                  {safe(options?.pmo).map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* PMO SPOC */}
              <div>
                <label className={labelCls}>PMO SPOC</label>
                <select
                  className={`${inputCls} mt-1`}
                  value={form.pmoSpoc}
                  onChange={(e) => setForm({ ...form, pmoSpoc: e.target.value })}
                >
                  <option value="">Select PMO SPOC</option>
                  {safe(options?.pmoSpoc).map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ========= Section: Demand Details ========= */}
          <section>
            <SectionHeader
              icon={<ScheduleOutlined />}
              title="Demand Details"
              helper="Timeline, type and locations."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
              {/* Demand Timeline (pill radios, IDs) */}
              <div>
                <label className={`${labelCls} mb-1 block`}>Demand Timeline</label>
                <PillRadios
                  name="demandTimeline"
                  optionsList={options?.demandTimeline}
                  value={form.demandTimeline}
                  onChange={(val) => setForm((p) => ({ ...p, demandTimeline: val }))}
                />
              </div>

              {/* Demand Type (pill radios, IDs) */}
              <div>
                <label className={`${labelCls} mb-1 block`}>Demand Type</label>
                <PillRadios
                  name="demandType"
                  optionsList={options?.demandType}
                  value={form.demandType}
                  onChange={(val) => setForm((p) => ({ ...p, demandType: val }))}
                />
              </div>

              {/* Priority (IDs) */}
              <div>
                <label className={labelCls}>Priority</label>
                <select
                  className={`${inputCls}`}
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="">Select Priority</option>
                  {safe(options?.priority).map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ========= Section: Band, Locations & Date ========= */}
          <section>
            <SectionHeader
              icon={<BarsOutlined />}
              title="Band • Locations • Date"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
              {/* Band (IDs) */}
              <div>
                <label className={labelCls}>Band</label>
                <select
                  className={`${inputCls} mt-1`}
                  value={form.band}
                  onChange={(e) => setForm({ ...form, band: e.target.value })}
                >
                  <option value="">Select Band</option>
                  {safe(options?.band).map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Demand Location (checkbox pills with IDs) */}
              <div>
                <label className={`${labelCls} mb-1 block`}>Demand Location</label>
                <PillCheckboxes
                  name="demandLocation"
                  optionsList={options?.demandLocation || []}
                  selected={form.demandLocation}
                  onToggle={(val, isChecked) =>
                    setForm((prev) => {
                      const curr = new Set(prev.demandLocation.map(String));
                      if (isChecked) curr.add(val);
                      else curr.delete(val);
                      return { ...prev, demandLocation: Array.from(curr).map((x) => Number(x)) };
                    })
                  }
                />
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pl-22">
                  <EnvironmentOutlined />
                  <span>Select one or more locations.</span>
                </div>
              </div>

              {/* Demand Received Date */}
              <div>
                <label className={labelCls}>Demand Received Date</label>
                <div className="relative mt-1">
                  <DatePicker
                    selected={
                      form.demandReceivedDate
                        ? new Date(form.demandReceivedDate)
                        : new Date()
                    }
                    onChange={(date) =>
                      setForm({
                        ...form,
                        demandReceivedDate: date ? format(date, "dd-MMM-yyyy") : "",
                      })
                    }
                    dateFormat="dd-MMM-yyyy"
                    className={`${inputCls} pr-10`}
                    placeholderText="dd-MMM-yyyy"
                  />
                  <CalendarOutlined className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>
          </section>

          {/* ========= Section: Remark ========= */}
          <section>
            <SectionHeader title="Remark" />
            <div className="relative">
              <textarea
                className="w-full h-20 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none"
                rows={4}
                maxLength={500}
                placeholder="Enter Remark (max 500 characters)"
                value={form.remark || ""}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
              />
              <span className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none select-none">
                {(form.remark?.length || 0)}/500
              </span>
            </div>
          </section>
        </div>

        {/* Footer Actions (right-aligned) */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
            disabled={loading}
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="rounded-md bg-gray-900 text-white px-5 py-2 text-sm font-semibold hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingOutlined style={{ marginRight: 8 }} />
                Generating…
              </>
            ) : (
              "Next: Generate Demand IDs"
            )}
          </button>
        </div>
      </form>
    </Layout>
  );
}