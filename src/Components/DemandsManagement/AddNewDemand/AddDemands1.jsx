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
  FlagOutlined,             // Priority
  BarsOutlined,             // Band
  CalendarOutlined          // Date
} from "@ant-design/icons";
import { format } from "date-fns";

import { buildAllOptions } from "../DemandSheet/dropdown.js";
import { getDropDownData, submitStep1 } from "../../api/Demands/addDemands.js";

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
    lob: "",
    noOfPositions: "",
    // Skills
    skillCluster: null,
    primarySkills: [],
    secondarySkills: [],
    // People
    hiringManager: "",
    hiringManagerOther: "",
    deliveryManager: "",
    deliveryManagerOther: "",
    pm: "",
    pmOther: "",
    // Business
    salesSpoc: "",
    pmo: "",
    hbu: "",
    // Demand details
    demandTimeline: "",  // defaulted to "Current" after options load
    demandType: "",      // defaulted to "New" after options load
    demandLocation: [],  // checkbox pills
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
        const dd = await getDropDownData();
        if (mounted) setDropdowns(dd);
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

  const options = useMemo(() => buildAllOptions(dropdowns), [dropdowns]);

  const safe = (arr) => (Array.isArray(arr) ? arr : []);
  const strVal = (v) => (v === null || v === undefined ? "" : String(v));

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  // Save draft (local)
  const handleSaveDraft = () => {
    try {
      const draft = { ...form, _savedAt: new Date().toISOString() };
      localStorage.setItem("addDemandStep1Draft", JSON.stringify(draft));
      message.success("Draft saved locally.");
    } catch {
      message.error("Could not save draft.");
    }
  };

  // Restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem("addDemandStep1Draft");
      if (!raw) return;
      const draft = JSON.parse(raw);
      setForm((prev) => ({
        ...prev,
        ...draft,
        demandReceivedDate: draft.demandReceivedDate || todayStr(),
        // normalize location if saved previously as CSV
        demandLocation: Array.isArray(draft.demandLocation)
          ? draft.demandLocation.map(String)
          : typeof draft.demandLocation === "string" && draft.demandLocation.length
          ? draft.demandLocation.split(",").map((v) => v.trim())
          : [],
      }));
      message.info("Draft restored.");
    } catch {
      /* ignore */
    }
  }, []);

  // ===== Default "Demand Type: New" and "Demand Timeline: Current" once options are available =====
  useEffect(() => {
    if (!options) return;
    setForm((prev) => {
      const next = { ...prev };
      // If empty, try to find match by value first, else by label
      if (!prev.demandType) {
        const byVal =
          safe(options.demandType).find((o) => String(o.value).toLowerCase() === "new");
        const byLabel =
          safe(options.demandType).find((o) => String(o.label).toLowerCase() === "new");
        next.demandType = strVal(byVal?.value ?? byLabel?.value ?? prev.demandType);
      }
      if (!prev.demandTimeline) {
        const byVal =
          safe(options.demandTimeline).find((o) => String(o.value).toLowerCase() === "current");
        const byLabel =
          safe(options.demandTimeline).find((o) => String(o.label).toLowerCase() === "current");
        next.demandTimeline = strVal(byVal?.value ?? byLabel?.value ?? prev.demandTimeline);
      }
      return next;
    });
    // run once after options change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.demandType, options?.demandTimeline]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!form.lob) return message.warning("Line of Business is required.");
    if (!form.noOfPositions || Number(form.noOfPositions) < 1)
      return message.warning("No. of Positions must be at least 1.");
    if (!form.skillCluster) return message.warning("Skill Cluster is required.");
    if (!form.demandReceivedDate)
      return message.warning("Demand Received Date is required.");

    // Stringify skills
    const primarySkillsStr = (form.primarySkills || [])
      .map((i) => i.value)
      .join(",");
    const secondarySkillsStr = (form.secondarySkills || [])
      .map((i) => i.value)
      .join(",");
    const skillClusterStr = form.skillCluster?.value || "";

    // Hiring Manager final (Other inline)
    const hiringManagerFinal =
      (form.hiringManager === "__other__" && form.hiringManagerOther?.trim()) ||
      form.hiringManager ||
      "";

    if (form.hiringManager === "__other__" && !form.hiringManagerOther?.trim()) {
      return message.warning("Please enter Hiring Manager name in the 'Other' field.");
    }

    // Delivery Manager final
    const deliveryManagerFinal =
      (form.deliveryManager === "__other__" && form.deliveryManagerOther?.trim()) ||
      form.deliveryManager ||
      "";

    if (form.deliveryManager === "__other__" && !form.deliveryManagerOther?.trim()) {
      return message.warning("Please enter Delivery Manager name in the 'Other' field.");
    }

    // PM final (Other inline)
    const pmFinal =
      (form.pm === "__other__" && form.pmOther?.trim()) ||
      form.pm ||
      "";

    if (form.pm === "__other__" && !form.pmOther?.trim()) {
      return message.warning("Please enter Project Manager name in the 'Other' field.");
    }

    // Demand Location: CSV
    const demandLocationStr = (form.demandLocation || []).join(",");

    setLoading(true);

    const payload = {
      lob: form.lob,
      noOfPositions: Number(form.noOfPositions || 0),
      skillCluster: skillClusterStr,
      primarySkills: primarySkillsStr,
      secondarySkills: secondarySkillsStr,
      demandReceivedDate: form.demandReceivedDate,
      hiringManager: hiringManagerFinal,
      salesSpoc: form.salesSpoc,
      deliveryManager: deliveryManagerFinal,
      hbu: form.hbu,
      demandType: form.demandType,
      demandTimeline: form.demandTimeline,
      demandLocation: demandLocationStr,        // CSV
      pm: pmFinal,
      band: form.band,
      priority: form.priority,
      pmo: form.pmo,
      remark: form.remark,
    };

    try {
      const res = await submitStep1(payload);
      const serverDTO = res?.data ?? res;
      message.success("Demand ID has been generated successfully!");
      localStorage.removeItem("addDemandStep1Draft");
      navigate("/addDemands2", { state: { form1Data: serverDTO } });
    } catch (err) {
      console.error("[Step1] error:", err);
      message.error(err?.message || "Step 1 failed.");
    } finally {
      setLoading(false);
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

  // ===== pill radio renderer (re-usable for LOB, Timeline, Type) =====
  const PillRadios = ({ name, optionsList, value, onChange }) => (
    <div className="flex flex-wrap gap-3">
      {safe(optionsList).map((o) => {
        const val = strVal(o.value);
        const active = value === val;
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
        const val = strVal(o.value);
        const checked = selected.includes(val);
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

  // ===== Reusable: Select-with-Other inline (no extra bottom space) =====
  // When "__other__" is chosen, we visually disable the select and show an input in the same line.
  const SelectWithOtherInline = ({
    label,
    value,
    onValueChange,
    otherValue,
    onOtherChange,
    optionsList,
    placeholder,
    name,
  }) => {
    const isOther = value === "__other__";
    return (
      <div>
        <label className={labelCls}>{label}</label>
        <div className="relative mt-1">
          <select
            className={`${inputCls} ${isOther ? "opacity-60 pointer-events-none" : ""}`}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
          >
            <option value="">{placeholder}</option>
            {safe(optionsList).map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
            <option value="__other__">Other (Specify)</option>
          </select>

          {/* Inline input shown only when Other is selected - occupying the same visual space */}
          {isOther && (
            <input
              className={`${inputCls} absolute inset-0`}
              name={name}
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder={`Enter ${label}`}
              autoFocus
            />
          )}
        </div>
      </div>
    );
  };

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
              {/* LOB (pill radios) */}
              <div className="flex items-start gap-4 px-3 pb-3">
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
                  className={`${inputCls} w-28`}
                  type="number"
                  min={1}
                  placeholder="0"
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
              {/* Skill Cluster (single) */}
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

              {/* Primary Skills (max 2) */}
              <div>
                <label className={labelCls}>Primary Skills (max 2)</label>
                <Select
                  options={safe(options?.primarySkills)}
                  isMulti
                  isClearable
                  closeMenuOnSelect={false}
                  hideSelectedOptions
                  components={{ Option: CheckboxOption }}
                  value={form.primarySkills}
                  onChange={(selected) => {
                    if (selected && selected.length > 2) {
                      message.warning("You can select only 2 primary skills.");
                      return;
                    }
                    setForm({ ...form, primarySkills: selected || [] });
                  }}
                  placeholder="Select up to 2"
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
                  placeholder="Select"
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
              {/* Hiring Manager (Select with Other inline) */}
              <SelectWithOtherInline
                label="Hiring Manager"
                placeholder="Select Hiring Manager"
                value={form.hiringManager}
                onValueChange={(v) => setForm((p) => ({ ...p, hiringManager: v }))}
                otherValue={form.hiringManagerOther}
                onOtherChange={(v) => setForm((p) => ({ ...p, hiringManagerOther: v }))}
                optionsList={options?.hiringManager}
                name="hiringManagerOther"
              />

              {/* Delivery Manager + Other */}
              <div>
                <label className={labelCls}>Delivery Manager</label>
                <div className="relative mt-1">
                  <select
                    className={`${inputCls} ${form.deliveryManager === "__other__" ? "opacity-60 pointer-events-none" : ""}`}
                    value={form.deliveryManager}
                    onChange={(e) => setForm({ ...form, deliveryManager: e.target.value })}
                  >
                    <option value="">Select Delivery Manager</option>
                    {safe(options?.deliveryManager).map((o) => (
                      <option key={String(o.value)} value={String(o.value)}>
                        {o.label}
                      </option>
                    ))}
                    <option value="__other__">Other (Specify)</option>
                  </select>
                  {form.deliveryManager === "__other__" && (
                    <input
                      className={`${inputCls} absolute inset-0`}
                      name="deliveryManagerOther"
                      value={form.deliveryManagerOther}
                      onChange={handleChange}
                      placeholder="Enter Delivery Manager name"
                      autoFocus
                    />
                  )}
                </div>
              </div>

              {/* PM (Select with Other inline) */}
              <SelectWithOtherInline
                label="Project Manager (PM)"
                placeholder="Select Project Manager"
                value={form.pm}
                onValueChange={(v) => setForm((p) => ({ ...p, pm: v }))}
                otherValue={form.pmOther}
                onOtherChange={(v) => setForm((p) => ({ ...p, pmOther: v }))}
                optionsList={options?.pm}
                name="pmOther"
              />
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

              {/* HBU */}
              <div>
                <label className={labelCls}>HBU</label>
                <select
                  className={`${inputCls} mt-1`}
                  value={form.hbu}
                  onChange={(e) => setForm({ ...form, hbu: e.target.value })}
                >
                  <option value="">Select HBU</option>
                  {safe(options?.hbu).map((o) => (
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
              {/* Demand Timeline (pill radios) */}
              <div>
                <label className={`${labelCls} mb-1 block`}>Demand Timeline</label>
                <PillRadios
                  name="demandTimeline"
                  optionsList={options?.demandTimeline}
                  value={form.demandTimeline}
                  onChange={(val) => setForm((p) => ({ ...p, demandTimeline: val }))}
                />
              </div>

              {/* Demand Type (pill radios) */}
              <div>
                <label className={`${labelCls} mb-1 block`}>Demand Type</label>
                <PillRadios
                  name="demandType"
                  optionsList={options?.demandType}
                  value={form.demandType}
                  onChange={(val) => setForm((p) => ({ ...p, demandType: val }))}
                />
              </div>

              {/* Priority */}
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
              {/* Band */}
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

              {/* Demand Location (checkbox pills) */}
              <div>
                <label className={`${labelCls} mb-1 block`}>Demand Location</label>
                <PillCheckboxes
                  name="demandLocation"
                  optionsList={options?.demandLocation || options?.location || []}
                  selected={form.demandLocation}
                  onToggle={(val, isChecked) =>
                    setForm((prev) => {
                      const curr = new Set(prev.demandLocation.map(String));
                      if (isChecked) curr.add(val);
                      else curr.delete(val);
                      return { ...prev, demandLocation: Array.from(curr) };
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