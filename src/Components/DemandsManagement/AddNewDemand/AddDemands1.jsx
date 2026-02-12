// src/Components/DemandsManagement/AddNewDemand/AddDemands1.jsx
import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../Layout.jsx";
import Select, { components } from "react-select";
import { message, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  LoadingOutlined,
  AppstoreOutlined,
  ToolOutlined,
  TeamOutlined,
  ProjectOutlined,
  ScheduleOutlined,
  EnvironmentOutlined,
  BarsOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

import { getDropDownData, submitStep1 } from "../../api/Demands/addDemands.js";
import { getStep1Draft, updateDraft } from "../../api/Demands/draft.js";

// ------------------------ helpers ------------------------
const todayStr = () => format(new Date(), "dd-MMM-yyyy");

// react-select checkbox option renderer
const CheckboxOption = (props) => (
  <components.Option {...props}>
    <div className="flex items-center justify-between">
      <span>{props.label}</span>
      <input type="checkbox" checked={props.isSelected} readOnly />
    </div>
  </components.Option>
);

const SectionHeader = ({ icon, title, helper }) => (
  <div className="flex items-center gap-2 mt-1 mb-3 ml-4 ">
    <span className="text-gray-700">{icon}</span>
    <h2 className="text-sm font-bold text-gray-900">{title}</h2>
    {helper ? <span className="text-xs text-gray-500">• {helper}</span> : null}
  </div>
);

// Map backend lists [{id,name}] -> react-select options [{value,label}]
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

const safe = (arr) => (Array.isArray(arr) ? arr : []);
const toNum = (v) => (v === "" || v == null ? null : Number(v));
const toNumArrayFromSelect = (arr) =>
  Array.isArray(arr) ? arr.map((o) => Number(o?.value ?? o)).filter(Number.isFinite) : [];
const toNumArray = (arr) =>
  Array.isArray(arr) ? arr.map((v) => Number(v)).filter(Number.isFinite) : [];

// format dd-MMM-yyyy -> yyyy-MM-dd
const toYyyyMmDd = (d) => {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(d))) return d;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
};

// Build EXACT payload for Step‑1 draft
const buildDraftCreateRequest = (form) => ({
  hbuId: toNum(form.hbu),
  hubSpocId: toNum(form.hbuSpoc),
  bandId: toNum(form.band),
  priorityId: toNum(form.priority),
  lobId: toNum(form.lob),
  demandTypeId: toNum(form.demandType),
  demandTimelineId: toNum(form.demandTimeline),
  externalInternalId: toNum(form.externalInternal),
  statusId: toNum(form.status),
  podId: toNum(form.pod),
  pmoSpocId: toNum(form.pmoSpoc),
  salesSpocId: toNum(form.salesSpoc),
  hiringManagerId: toNum(form.hiringManager),
  deliveryManagerId: toNum(form.deliveryManager),
  skillClusterId: toNum(form.skillCluster?.value ?? form.skillCluster),
  pmoId: toNum(form.pmo),

  experience: form.experience ?? "5-7",
  remark: form.remark ?? "Saving as draft from Step-1 (mix file + text)",

  numberOfPositions: toNum(form.noOfPositions),

  primarySkillIds: toNumArrayFromSelect(form.primarySkills),
  secondarySkillIds: toNumArrayFromSelect(form.secondarySkills),
  locationIds: toNumArray(form.demandLocation),

  flag: true,

  demandReceivedDate: toYyyyMmDd(form.demandReceivedDate),

  rrDrafts: Array.isArray(form.rrDrafts) ? form.rrDrafts : [],
});

/** Inline component: Select with “Other” mode in the SAME space. */
function OtherableSelect({
  label,
  name,
  value,
  options,
  placeholder = "Select",
  otherValue = "",
  onChangeSelect,
  onChangeOther,
  inputCls,
  labelCls,
}) {
  const showOther = String(value) === "__other__";
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {!showOther ? (
        <select className={`${inputCls} mt-1`} value={value} onChange={(e) => onChangeSelect(e.target.value)}>
          <option value="">{placeholder}</option>
          {safe(options).map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
          <option value="__other__">Other</option>
        </select>
      ) : (
        <div className="mt-1 flex items-center gap-2">
          <input
            className={inputCls}
            type="text"
            value={otherValue}
            placeholder={`Enter ${label}`}
            onChange={(e) => onChangeOther(e.target.value)}
          />
          <button
            type="button"
            onClick={() => onChangeSelect("")}
            className="text-xs text-gray-700 underline hover:text-black"
            title="Back to list"
          >
            Back to list
          </button>
        </div>
      )}
    </div>
  );
}

// ------------------------ component ------------------------
export default function AddDemands1() {
  const location = useLocation();
  const navigate = useNavigate();

  const labelCls = "block text-xs font-medium text-gray-700";
  const inputCls =
    "w-full h-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900";

  const [loading, setLoading] = useState(false);
  const [dropdowns, setDropdowns] = useState(null);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);

  // draftId from navigation or storage
  const [draftId, setDraftId] = useState(() => {
    const fromNav = location?.state?.draftId;
    const fromStorage = localStorage.getItem("step1DraftId");
    const n = Number(fromNav ?? fromStorage);
    return Number.isFinite(n) && n > 0 ? n : null;
  });

  // Step-1 form
  const [form, setForm] = useState({
    lob: "",
    noOfPositions: "1",
    skillCluster: null,
    primarySkills: [],
    secondarySkills: [],
    hiringManager: "",
    hiringManagerOther: "",
    deliveryManager: "",
    deliveryManagerOther: "",
    pm: "",
    pmOther: "",
    salesSpoc: "",
    salesSpocOther: "",
    pmoSpoc: "",
    pmoSpocOther: "",
    pmo: "",
    pmoOther: "",
    hbu: "",
    hbuOther: "",
    hbuSpoc: "",
    hbuSpocOther: "",

    demandTimeline: "",
    demandType: "",
    demandLocation: [],
    band: "",
    priority: "",
    externalInternal: "",
    status: "",
    pod: "",
    demandReceivedDate: todayStr(),
    experience: "",
    remark: "",
    rrDrafts: [],
  });

  // dropdowns
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dd = await getDropDownData();
        if (!mounted) return;
        setDropdowns(dd?.data || dd);
      } catch (e) {
        console.error("Failed to load dropdowns:", e);
        message.error("Failed to load form data. Please refresh.");
      } finally {
        if (mounted) setDropdownsLoaded(true);
      }
    })();
    return () => {
      setDropdownsLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      hbuSpoc: toOptions(d.hbuSpocList || d.hubSpocList || []),

      hiringManager: toOptions(d.hiringManagerList),
      deliveryManager: toOptions(d.deliveryManagerList),
      projectManager: toOptions(d.projectManagerList),
      salesSpoc: toOptions(d.salesSpocList),
      pmo: toOptions(d.pmoList),
      pmoSpoc: toOptions(d.pmoSpocList),

      demandLocation: toOptions(d.demandLocationList),

      band: toOptions(d.bandList),
      priority: toOptions(d.priorityList),

      pod: toOptions(d.podList),
    };
  }, [dropdowns]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  // ---------- HYDRATE FROM DRAFT (if draftId exists) ----------
  useEffect(() => {
    const idNum = Number(draftId);
    if (!Number.isFinite(idNum) || idNum <= 0) return;

    (async () => {
      try {
        setLoading(true);
        const res = await getStep1Draft(idNum);
        const data = res?.data || res;

        setForm((prev) => ({
          ...prev,
          lob: String(data?.lob?.id ?? data?.lobId ?? prev.lob ?? ""),
          noOfPositions: String(data?.numberOfPositions ?? prev.noOfPositions ?? "1"),
          skillCluster: data?.skillCluster
            ? {
                value: Number(data.skillCluster.id ?? data.skillClusterId),
                label: String(data.skillCluster.name ?? ""),
              }
            : prev.skillCluster,
          primarySkills: Array.isArray(data?.primarySkills)
            ? data.primarySkills.map((s) => ({ value: Number(s.id), label: String(s.name) }))
            : prev.primarySkills,
          secondarySkills: Array.isArray(data?.secondarySkills)
            ? data.secondarySkills.map((s) => ({ value: Number(s.id), label: String(s.name) }))
            : prev.secondarySkills,

          hiringManager: String(data?.hiringManager?.id ?? data?.hiringManagerId ?? ""),
          deliveryManager: String(data?.deliveryManager?.id ?? data?.deliveryManagerId ?? ""),
          pm: String(data?.projectManager?.id ?? data?.projectManagerId ?? ""),

          salesSpoc: String(data?.salesSpoc?.id ?? data?.salesSpocId ?? ""),
          pmoSpoc: String(data?.pmoSpoc?.id ?? data?.pmoSpocId ?? ""),
          pmo: String(data?.pmo?.id ?? data?.pmoId ?? ""),

          hbu: String(data?.hbu?.id ?? data?.hbuId ?? ""),
          hbuSpoc: String(data?.hbuSpoc?.id ?? data?.hbuSpocId ?? ""),

          demandTimeline: String(data?.demandTimeline?.id ?? data?.demandTimelineId ?? ""),
          demandType: String(data?.demandType?.id ?? data?.demandTypeId ?? ""),
          demandLocation: Array.isArray(data?.demandLocations)
            ? data.demandLocations.map((l) => Number(l.id))
            : prev.demandLocation,

          band: String(data?.band?.id ?? data?.bandId ?? ""),
          priority: String(data?.priority?.id ?? data?.priorityId ?? ""),

          externalInternal: String(data?.externalInternal?.id ?? data?.externalInternalId ?? ""),
          status: String(data?.status?.id ?? data?.statusId ?? ""),
          pod: String(data?.pod?.id ?? data?.podId ?? ""),

          demandReceivedDate: data?.demandReceivedDate || prev.demandReceivedDate,
          experience: data?.experience ?? prev.experience,
          remark: data?.remark ?? prev.remark,
          rrDrafts: Array.isArray(data?.rrDrafts) ? data.rrDrafts : prev.rrDrafts,
        }));

        localStorage.setItem("step1DraftId", String(idNum));
      } catch (e) {
        console.error("load draft error:", e);
        message.error("Failed to load draft for editing.");
      } finally {
        setLoading(false);
      }
    })();
  }, [draftId]);

  // Defaults for Demand Type + Timeline — only if not set
useEffect(() => {
  setForm((prev) => {
    const next = { ...prev };

    // demandType default -> "New"
    if (!prev.demandType && options?.demandType?.length) {
      const newOpt =
        options.demandType.find((o) => o.label?.toLowerCase() === "new") ||
        options.demandType[0];
      next.demandType = String(newOpt?.value ?? "");
    }

    // demandTimeline default -> "Current"
    if (!prev.demandTimeline && options?.demandTimeline?.length) {
      const curOpt =
        options.demandTimeline.find((o) => o.label?.toLowerCase() === "current") ||
        options.demandTimeline[0];
      next.demandTimeline = String(curOpt?.value ?? "");
    }

    // ✅ demandLocations default -> include "Pune"
    if ((!prev.demandLocation || prev.demandLocation.length === 0) && options?.demandLocation?.length) {
      const pune =
        options.demandLocation.find((o) => o.label?.toLowerCase() === "pune") ||
        null;

      if (pune?.value != null) {
        // MULTI-SELECT: store as array of values
        next.demandLocation = [String(pune.value)];
      } else {
        // fallback to first option if Pune not found
        const first = options.demandLocation[0];
        next.demandLocation = first?.value != null ? [String(first.value)] : [];
      }
    }

    return next;
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [options?.demandType, options?.demandTimeline, options?.demandLocations]);

  // ===== pill radios (LOB, Timeline, Type) =====
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

  // ===== pill checkboxes (Locations) =====
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

  // Build payload and call API:
  // - If draftId exists -> PUT via updateDraft (payload only; no files, NO rrDrafts)
  // - Else -> POST via submitStep1 (normal flow)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!form.lob) return message.warning("Line of Business is required.");
    if (!form.noOfPositions || Number(form.noOfPositions) < 1)
      return message.warning("No. of Positions must be at least 1.");
    if (!form.skillCluster) return message.warning("Skill Cluster is required.");
    if (!form.demandReceivedDate) return message.warning("Demand Received Date is required.");

    setLoading(true);
    try {
      const request = buildDraftCreateRequest(form);

      let resp;
      let effDraftId = Number(draftId) || null;

      if (effDraftId) {
        // strip rrDrafts on Step‑1 update (server enforces rrDraftId/positionIndex)
        const { rrDrafts: _omit, ...requestWithoutRrDrafts } = request;
        await updateDraft({ draftId: effDraftId, request: requestWithoutRrDrafts, files: [] });
        resp = { data: { draftId: effDraftId } };
      } else {
        resp = await submitStep1(request);
        const newId = Number(resp?.data?.draftId ?? resp?.draftId);
        if (Number.isFinite(newId) && newId > 0) {
          effDraftId = newId;
          setDraftId(newId);
          localStorage.setItem("step1DraftId", String(newId));
        }
      }

      const serverDTO = resp?.data ?? resp;
      const finalDraftId = Number(serverDTO?.draftId ?? effDraftId) || effDraftId || null;

      const forStep2 = {
        ...request, // what we sent
        ...serverDTO,
        draftId: finalDraftId,
        noOfPositions: form.noOfPositions,
      };

      // ➜ Navigate to Step‑2 page with required data
      navigate("/addDemands2", { state: { draftId: finalDraftId, form1Data: forStep2 } });
    } catch (err) {
      console.error("[Step1] error:", err);
      const msg = err?.response?.data?.message || err?.message || "Step 1 failed.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!dropdowns || !dropdownsLoaded || loading) {
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
      <div className="">
        <h1 className="text-lg font-bold">Add Demands</h1>
      </div>

      <form onSubmit={handleSubmit} className="">
        <div className="bg-white border border-gray-200 ">
          {/* ========= Basics ========= */}
          <section>
            <SectionHeader
              icon={<AppstoreOutlined />}
              title="Basics"
              helper="Select the LOB and enter total positions."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 px-3 pb-3 w-5/6">
                <span className={`${labelCls} whitespace-nowrap mt-2`}>Line of Business:</span>
                <PillRadios
                  name="lob"
                  optionsList={options?.lob}
                  value={form.lob}
                  onChange={(val) => setForm((p) => ({ ...p, lob: val }))}
                />
              </div>
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

          {/* ========= Skills ========= */}
          <section>
            <SectionHeader icon={<ToolOutlined />} title="Skills" helper="Choose cluster and skills." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
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
                />
              </div>

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
                />
              </div>

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
                />
              </div>
            </div>
          </section>

          {/* ========= People ========= */}
          <section>
            <SectionHeader icon={<TeamOutlined />} title="People" helper="Select stakeholders." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
              <OtherableSelect
                label="Hiring Manager"
                name="hiringManager"
                value={form.hiringManager}
                options={options?.hiringManager}
                placeholder="Select Hiring Manager"
                otherValue={form.hiringManagerOther}
                onChangeSelect={(val) => setForm({ ...form, hiringManager: val })}
                onChangeOther={(val) => setForm({ ...form, hiringManagerOther: val })}
                inputCls={inputCls}
                labelCls={labelCls}
              />

              <OtherableSelect
                label="Delivery Manager"
                name="deliveryManager"
                value={form.deliveryManager}
                options={options?.deliveryManager}
                placeholder="Select Delivery Manager"
                otherValue={form.deliveryManagerOther}
                onChangeSelect={(val) => setForm({ ...form, deliveryManager: val })}
                onChangeOther={(val) => setForm({ ...form, deliveryManagerOther: val })}
                inputCls={inputCls}
                labelCls={labelCls}
              />

              <OtherableSelect
                label="Project Manager (PM)"
                name="pm"
                value={form.pm}
                options={options?.projectManager}
                placeholder="Select Project Manager"
                otherValue={form.pmOther}
                onChangeSelect={(val) => setForm({ ...form, pm: val })}
                onChangeOther={(val) => setForm({ ...form, pmOther: val })}
                inputCls={inputCls}
                labelCls={labelCls}
              />
            </div>
          </section>

          {/* ========= Business ========= */}
          <section>
            <SectionHeader icon={<ProjectOutlined />} title="Business" helper="Context & ownership." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
              <OtherableSelect
                label="Sales SPOC"
                name="salesSpoc"
                value={form.salesSpoc}
                options={options?.salesSpoc}
                placeholder="Select Sales SPOC"
                otherValue={form.salesSpocOther}
                onChangeSelect={(val) => setForm({ ...form, salesSpoc: val })}
                onChangeOther={(val) => setForm({ ...form, salesSpocOther: val })}
                inputCls={inputCls}
                labelCls={labelCls}
              />

              <OtherableSelect
                label="PMO"
                name="pmo"
                value={form.pmo}
                options={options?.pmo}
                placeholder="Select PMO"
                otherValue={form.pmoOther}
                onChangeSelect={(val) => setForm({ ...form, pmo: val })}
                onChangeOther={(val) => setForm({ ...form, pmoOther: val })}
                inputCls={inputCls}
                labelCls={labelCls}
              />

              <OtherableSelect
                label="PMO SPOC"
                name="pmoSpoc"
                value={form.pmoSpoc}
                options={options?.pmoSpoc}
                placeholder="Select PMO SPOC"
                otherValue={form.pmoSpocOther}
                onChangeSelect={(val) => setForm({ ...form, pmoSpoc: val })}
                onChangeOther={(val) => setForm({ ...form, pmoSpocOther: val })}
                inputCls={inputCls}
                labelCls={labelCls}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
              <OtherableSelect
                label="HBU"
                name="hbu"
                value={form.hbu}
                options={options?.hbu}
                placeholder="Select HBU"
                otherValue={form.hbuOther}
                onChangeSelect={(val) => setForm({ ...form, hbu: val })}
                onChangeOther={(val) => setForm({ ...form, hbuOther: val })}
                inputCls={inputCls}
                labelCls={labelCls}
              />

              <OtherableSelect
                label="HBU SPOC"
                name="hbuSpoc"
                value={form.hbuSpoc}
                options={options?.hbuSpoc}
                placeholder="Select HBU SPOC"
                otherValue={form.hbuSpocOther}
                onChangeSelect={(val) => setForm({ ...form, hbuSpoc: val })}
                onChangeOther={(val) => setForm({ ...form, hbuSpocOther: val })}
                inputCls={inputCls}
                labelCls={labelCls}
              />

              <div className="hidden md:block" />
            </div>
          </section>

          {/* ========= Demand Details ========= */}
          <section>
            <SectionHeader icon={<ScheduleOutlined />} title="Demand Details" helper="Timeline, type & locations." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
              <div>
                <label className={`${labelCls} mb-1 block`}>Demand Timeline</label>
                <PillRadios
                  name="demandTimeline"
                  optionsList={options?.demandTimeline}
                  value={form.demandTimeline}
                  onChange={(val) => setForm((p) => ({ ...p, demandTimeline: val }))}
                />
              </div>

              <div>
                <label className={`${labelCls} mb-1 block`}>Demand Type</label>
                <PillRadios
                  name="demandType"
                  optionsList={options?.demandType}
                  value={form.demandType}
                  onChange={(val) => setForm((p) => ({ ...p, demandType: val }))}
                />
              </div>

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

          {/* ========= Band, Locations & Date ========= */}
          <section>
            <SectionHeader icon={<BarsOutlined />} title="Band • Locations • Date" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-3 pb-3">
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
                  <option value="__other__">Other</option>
                </select>
                {String(form.band) === "__other__" && (
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      className={inputCls}
                      type="text"
                      value={form.bandOther || ""}
                      placeholder="Enter Band"
                      onChange={(e) => setForm({ ...form, bandOther: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, band: "" })}
                      className="text-xs text-gray-700 underline hover:text-black"
                    >
                      Back to list
                    </button>
                  </div>
                )}
              </div>

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

              <div>
                <label className={labelCls}>Demand Received Date</label>
                <div className="relative mt-1">
                  <DatePicker
                    selected={form.demandReceivedDate ? new Date(form.demandReceivedDate) : new Date()}
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


          {/* ========= Remark ========= */}
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

        <div className="flex justify-end gap-3 mt-6">
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
              "Save & Next"
            )}
          </button>
        </div>
      </form>
    </Layout>
  );
}