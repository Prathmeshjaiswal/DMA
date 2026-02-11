// ================== src/pages/Profiles/RDGTATeam.jsx ==================
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import Select, { components } from "react-select";
import Layout from "../Layout.jsx";
import { getAllDropdowns } from "../api/UserManagement.js";

// NEW API imports (real backend)
import { getProfileDropdowns, submitProfileCreate, submitProfileUpdate } from "../api/addProfile.js";

/* ============================= COMPACT UI TOKENS ============================= */
const labelCls = "block text-[12px] font-bold text-gray-800";
const labelTitle = "block text-[15px] font-bold text-gray-800";
const inputCls =
  "w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900";
const cardWrap =
  "max-w-4xl mx-auto bg-white rounded-md shadow-md border border-gray-200 p-5 md:p-6 mt-[-30px]";
const grid2 = "grid grid-cols-1 gap-4 sm:grid-cols-2";
const grid1 = "grid grid-cols-1 gap-4";
const sectionGap = "mt-5";
const safe = (arr) => (Array.isArray(arr) ? arr : []);

const SectionTitle = ({ children }) => (
  <h2 className="text-[18px] font-extrabold text-gray-900">{children}</h2>
);

const CheckboxOption = (props) => (
  <components.Option {...props}>
    <div className="flex items-center justify-between">
      <span className="text-[13px]">{props.label}</span>
      <input type="checkbox" checked={props.isSelected} readOnly />
    </div>
  </components.Option>
);

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 34,
    height: 34,
    borderColor: state.isFocused ? "#111827" : "#D1D5DB",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(17,24,39,0.15)" : "none",
    ":hover": { borderColor: "#111827" },
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 8px", fontSize: 13 }),
  indicatorsContainer: (base) => ({ ...base, paddingRight: 6 }),
  menu: (base) => ({ ...base, fontSize: 13 }),
};

/* ------------------------ HELPERS ------------------------ */
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
function getCurrentUser() {
  if (window.__currentUser && (window.__currentUser.userId || window.__currentUser.name)) {
    const u = window.__currentUser;
    return {
      userId: String(u.userId ?? u.id ?? "").trim(),
      name: String(u.name ?? u.fullName ?? u.displayName ?? "").trim(),
    };
  }
  const candidates = [
    tryJson(localStorage.getItem("user")),
    tryJson(localStorage.getItem("authUser")),
    tryJson(localStorage.getItem("currentUser")),
    tryJson(localStorage.getItem("profile")),
  ].filter(Boolean);
  if (candidates.length) {
    const u = candidates[0];
    const userId = String(
      u.userId ?? u.id ?? u.employeeId ?? u.empId ?? u.username ?? ""
    ).trim();
    const name = String(
      u.name ?? u.fullName ?? u.displayName ?? u.empName ?? u.username ?? ""
    ).trim();
    if (userId || name) return { userId, name };
  }
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const payload = token ? decodeJwt(token) : null;
  if (payload) {
    const userId = String(payload.userId ?? payload.empId ?? payload.sub ?? "").trim();
    const name = String(
      payload.name ?? payload.given_name ?? payload.preferred_username ?? ""
    ).trim();
    if (userId || name) return { userId, name };
  }
  return { userId: "128713", name: "Simran" };
}

// ------------------------ NEW: read role & map to profile type ------------------------
// UPDATED: derive role name from stored login response or JWT and map RDG->Internal, TA->External
function getCurrentRoleName() {
  // Try a few likely places the login JSON might be stored
  const fromMem = window.__currentUser?.role?.role || window.__currentUser?.role;
  if (fromMem) return String(fromMem);

  const candidates = [
    tryJson(localStorage.getItem("loginResponse")),
    tryJson(localStorage.getItem("user")),
    tryJson(localStorage.getItem("authUser")),
    tryJson(localStorage.getItem("currentUser")),
  ].filter(Boolean);

  for (const u of candidates) {
    const roleObj = u?.role;
    if (roleObj?.role) return String(roleObj.role);
    if (typeof roleObj === "string") return roleObj;
    if (u?.roleName) return String(u.roleName);
  }

  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const payload = token ? decodeJwt(token) : null;
  if (payload?.role) return String(payload.role);

  return "";
}

function mapRoleToProfileType(roleName) {
  const r = String(roleName || "").toLowerCase();
  if (r.includes("rdg")) return "Internal";
  if (r.includes("ta")) return "External";
  return ""; // unknown: allow URL/state to decide
}

function onlyDigits(s = "") {
  return (s || "").replace(/\D+/g, "");
}
function getPhoneRegexByCallingCode(callingCode) {
  switch (callingCode) {
    case "+91":
      return /^[6-9]\d{9}$/;
    case "+1":
      return /^(?:[2-9]\d{2}[2-9]\d{6})$/;
    case "+44":
      return /^(?:\d{9}|\d{10})$/;
    case "+61":
      return /^(?:[23478]\d{8})$/;
    default:
      return /^$/;
  }
}
function validatePhoneByCountry(rawPhone, callingCode) {
  const nsn = onlyDigits(rawPhone);
  const re = getPhoneRegexByCallingCode(callingCode);
  if (!re.test(nsn)) {
    const reasons = {
      "+91": "For India (+91), enter 10 digits starting with 6-9 (e.g., 98XXXXXXXX).",
      "+1": "For United States (+1), enter 10 digits; area and central office cannot start with 0 or 1.",
      "+44": "For United Kingdom (+44), enter 9–10 digits (no leading trunk '0').",
      "+61": "For Australia (+61), enter 9 digits: mobiles start with 4; landlines 2/3/7/8.",
    };
    return { ok: false, reason: reasons[callingCode] || "Invalid phone number for selected country." };
  }
  return { ok: true };
}
function validateEmpId(raw) {
  const digits = onlyDigits(raw);
  if (!digits) return { ok: false, reason: "Employee ID is required." };
  if (digits.length < 6) return { ok: false, reason: "Employee ID must be at least 6 digits." };
  return { ok: true, value: digits };
}

/** Normalize dropdowns from /profiles/dropdowns into {label,value} arrays */
function adaptOptions(dto = {}) {
  const toOpt = (arr, labelKey = "name", valueKey = "id") =>
    safe(arr).map((x) => ({
      label: String(x?.[labelKey] ?? ""),
      value: String(x?.[valueKey] ?? ""),
    }));

  return {
    // exact keys from your response
    externalInternal: toOpt(dto.externalInternals),   // Internal / External
    hbu: toOpt(dto.hbus),
    demandLocation: toOpt(dto.locations),
    primarySkills: toOpt(dto.primarySkills),
    secondarySkills: toOpt(dto.secondarySkills),
    skillCluster: toOpt(dto.skillClusters),
  };
}

export default function RDGTATeam() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dropdowns, setDropdowns] = useState(null);
  const [options, setOptions] = useState({});
  const [loadErr, setLoadErr] = useState("");

  const [countryCodes, setCountries] = useState([]);
  const [phoneError, setPhoneError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [empIdError, setEmpIdError] = useState("");
  const [empIdTouched, setEmpIdTouched] = useState(false);

  // UPDATED: Prefer role-based profile type; fallback to URL/state
  const roleName = getCurrentRoleName();                 // UPDATED
  const roleProfileType = mapRoleToProfileType(roleName); // UPDATED
  const derivedProfileTypeFromUrl = useMemo(() => {
    const state = location?.state || {};
    const search = new URLSearchParams(location?.search || "");
    const raw =
      state.profileType ??
      state.externalInternal ??
      state.demandType ??
      search.get("profileType") ??
      "";
    const s = String(raw).trim().toLowerCase();
    if (s.includes("external")) return "External";
    if (s.includes("internal")) return "Internal";
    return "";
  }, [location]);

  // UPDATED: final profile type selection order: Role > URL/state > empty
  const resolvedProfileType = roleProfileType || derivedProfileTypeFromUrl || ""; // UPDATED
  const isInternal = (resolvedProfileType || "").toLowerCase() === "internal";   // UPDATED

  const [currentUser, setCurrentUser] = useState({ userId: "", name: "" });

  const [form, setForm] = useState({
    profileType: "",
    empId: "", // — maps to backend
    candidateName: "",
    emailId: "",
    countryId: "",
    phoneNumber: "",
    experience: "", // — maps to backend
    skillCluster: null,
    primarySkills: [],
    secondarySkills: [],
    location: "",
    hbu: "",
    summary: "",
    cv: null,
  });

  useEffect(() => {
    const u = getCurrentUser();
    setCurrentUser(u);
    setForm((p) => ({
      ...p,
      profileType: resolvedProfileType || p.profileType, // UPDATED
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedProfileType]); // UPDATED

  // Load dropdowns (profiles + country codes)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setLoadErr("");

        const [profileDto, umResp] = await Promise.all([
          getProfileDropdowns(),
          getAllDropdowns().catch(() => null),
        ]);

        if (mounted) {
          setDropdowns(profileDto);
          setOptions(adaptOptions(profileDto));
          setCountries(umResp?.data?.countryCodes || []);
        }
      } catch (e) {
        console.error("[AddProfile] dropdowns load error:", e);
        setLoadErr(e?.message || "Failed to load dropdowns.");
        message.error("Failed to load dropdowns.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleInput = (e) => {
    const { name, value, type } = e.target;

    setForm((p) => ({
      ...p,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));

    if (name === "empId") {
      const digits = onlyDigits(value);
      setForm((p) => ({ ...p, empId: digits }));
      setEmpIdTouched(true);
      const r = validateEmpId(digits);
      setEmpIdError(r.ok ? "" : r.reason);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) return setForm((p) => ({ ...p, cv: null }));
    const okExt = /\.(pdf|doc|docx)$/i.test(f.name);
    const okSize = f.size <= 10 * 1024 * 1024;
    if (!okExt) return message.warning("Only PDF, DOC, DOCX files are allowed.");
    if (!okSize) return message.warning("File must be 10MB or less.");
    setForm((p) => ({ ...p, cv: f }));
  };

  const errors = {
    emailId:
      form.emailId && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.emailId)
        ? "Invalid email address"
        : "",
    summary: form.summary && form.summary.length > 2000 ? "Max 2000 characters" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean) || (!!empIdError && isInternal);

  // Find externalInternalId by label ("Internal"/"External") from dropdowns
  const externalInternalId = useMemo(() => {
    const list = safe(options?.externalInternal);
    // Prefer label match
    const label = (isInternal ? "internal" : "external");
    const match = list.find(
      (o) => String(o.label).toLowerCase() === label
    );
    if (match?.value) return Number(match.value);

    // Fallback to your provided IDs
    return isInternal ? 1 : 2;
  }, [options, isInternal]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.candidateName) return message.warning("Candidate name is required.");
    if (!form.emailId) return message.warning("Email is required.");

    if (isInternal) {
      if (!form.empId) {
        setEmpIdTouched(true);
        setEmpIdError("Employee ID is required.");
        return;
      }
      const empCheck = validateEmpId(form.empId);
      if (!empCheck.ok) {
        setEmpIdTouched(true);
        setEmpIdError(empCheck.reason);
        return;
      }
    }

    if (!form.countryId) {
      setPhoneTouched(true);
      setPhoneError("Please select a valid country code.");
      return;
    }
    if (!form.phoneNumber) {
      setPhoneTouched(true);
      setPhoneError("Please enter phone number.");
      return;
    }

    const selectedCountry = countryCodes.find((c) => String(c.id) === String(form.countryId));
    if (!selectedCountry?.callingCode) {
      setPhoneTouched(true);
      setPhoneError("Please select a valid country code.");
      return;
    }
    const phoneCheck = validatePhoneByCountry(form.phoneNumber, selectedCountry.callingCode);
    if (!phoneCheck.ok) {
      setPhoneTouched(true);
      setPhoneError(phoneCheck.reason);
      return;
    }
    setPhoneError("");

    if (form.experience === "" || form.experience == null)
      return message.warning("Experience is required.");
    if (!form.skillCluster) return message.warning("Select a Skill Cluster.");
    if (!form.location) return message.warning("Select a Location.");
    if (hasErrors) return message.error("Please fix the highlighted errors.");

    // UPDATED: keep phoneNumber as string of digits (not Number)
    const payload = {
      candidateName: form.candidateName,
      emailId: form.emailId,
      ...(isInternal ? { empId: String(form.empId) } : {}), // UPDATED

      phoneNumber: onlyDigits(form.phoneNumber),        // UPDATED
      isActive: true,
      experience: Number(form.experience),              // UPDATED: backend uses 'experience'

      skillClusterId: form.skillCluster?.value ? Number(form.skillCluster.value) : null,
      locationId: form.location ? Number(form.location) : null,
      hbuId: form.hbu ? Number(form.hbu) : null,
      externalInternalId, 
      countryId: form.countryId ? Number(form.countryId) : null,

      summary: form.summary?.trim() || "",

      primarySkillsIds: safe(form.primarySkills).map((i) => Number(i.value)),   // UPDATED key name
      secondarySkillsIds: safe(form.secondarySkills).map((i) => Number(i.value)), // UPDATED key name
    };

    try {
      // If you navigate to this page for editing, you can pass an id in location.state.id
      const editId = location?.state?.id;
      if (editId) {
        const res = await submitProfileUpdate(editId, payload, form.cv || null); // file optional
        message.success(res?.message || "Profile updated successfully");
      } else {
        if (!form.cv) {
          message.warning("Please attach CV (PDF/DOC/DOCX).");
          return;
        }
        const res = await submitProfileCreate(payload, form.cv); // file required
        message.success(res?.message || "Profile created successfully");
      }

      // Navigate to listing (adjust route if you have one)
      navigate("/profileSheet");
    } catch (err) {
      console.error("[RDGTATeam] submit error:", err);
      const msg =
        err?.response?.data?.message || err?.message || "Failed to submit profile";
      message.error(msg);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-52">
          <Spin />
          <span className="ml-3 text-gray-600">Loading dropdowns…</span>
        </div>
      </Layout>
    );
  }
  if (loadErr) {
    return (
      <Layout>
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadErr}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className={cardWrap}>
        <SectionTitle>Add Profile</SectionTitle>

        {/* Profile Type info (read-only display if present) */}
        {resolvedProfileType ? (
          <div className="mt-2 text-[12px] text-gray-600">
            Profile Type: <span className="font-semibold">{resolvedProfileType}</span>
          </div>
        ) : null}

        <form onSubmit={onSubmit} noValidate>
          {/* Basics */}
          <div className={`${grid2} mt-4`}>
            <div>
              <label className={labelCls}>Candidate Name</label>
              <input
                className={`${inputCls} mt-1`}
                name="candidateName"
                value={form.candidateName}
                onChange={handleInput}
                placeholder="Candidate Name"
              />
            </div>

            <div>
              <label className={labelCls}>Email Address</label>
              <input
                className={`${inputCls} mt-1`}
                name="emailId"
                type="email"
                value={form.emailId}
                onChange={handleInput}
                placeholder="name@example.com"
              />
              {errors.emailId && (
                <p className="text-[11px] text-red-600 mt-1">{errors.emailId}</p>
              )}
            </div>

            {/* Employee ID — only for Internal */}
            {isInternal && (
              <div>
                <label className={labelCls}>Employee ID</label>
                <input
                  className={`${inputCls} mt-1 ${
                    empIdTouched && empIdError ? "border-red-500 focus:ring-red-600" : ""
                  }`}
                  name="empId"
                  value={form.empId}
                  onChange={handleInput}
                  onBlur={() => {
                    setEmpIdTouched(true);
                    const r = validateEmpId(form.empId);
                    setEmpIdError(r.ok ? "" : r.reason);
                  }}
                  placeholder="e.g., 128713"
                  inputMode="numeric"
                  autoComplete="off"
                />
                {empIdTouched && empIdError && (
                  <p className="text-[11px] text-red-600 mt-1">{empIdError}</p>
                )}
              </div>
            )}

            <div>
              <label className={labelCls}>Experience (years)</label>
              <input
                className={`${inputCls} mt-1`}
                name="experience"
                type="number"
                min={0}
                step="0.1"
                value={form.experience}
                onChange={handleInput}
                placeholder="e.g., 5"
              />
            </div>
          </div>

          {/* Contact Number — UPDATED: same grid & same input size as other fields */}
           <div className="pt-3 pb-">
            <label className={labelTitle}>Contact Number</label>
            </div>
          <div className={`${grid2} ${sectionGap}`}> 
            <div>
            
              <div className="flex items-center gap-2 mt-1">
                <select
                  className="w-28 h-9 rounded-md border border-gray-300 bg-white px-2 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  name="countryId"
                  value={form.countryId}
                  onChange={(e) => {
                    const countryId = e.target.value;
                    setForm((p) => ({ ...p, countryId }));
                    setPhoneTouched(true);
                    const selected = countryCodes.find(
                      (c) => String(c.id) === String(countryId)
                    );
                    if (selected?.callingCode && form.phoneNumber) {
                      const res = validatePhoneByCountry(
                        form.phoneNumber,
                        selected.callingCode
                      );
                      setPhoneError(res.ok ? "" : res.reason);
                    } else {
                      setPhoneError("");
                    }
                  }}
                >
                  <option value="">+91</option>
                  {countryCodes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.callingCode}
                    </option>
                  ))}
                </select>

                <div className="flex-1">
                  {/* UPDATED: use inputCls to match size with other inputs */}
                  <input
                    className={`${inputCls}`} // UPDATED
                    name="phoneNumber"
                    value={form.phoneNumber}
                    placeholder="Phone number"
                    inputMode="numeric"
                    autoComplete="off"
                    onChange={(e) => {
                      const val = onlyDigits(e.target.value);
                      setForm((p) => ({ ...p, phoneNumber: val }));
                      setPhoneTouched(true);
                      const selected = countryCodes.find(
                        (c) => String(c.id) === String(form.countryId)
                      );
                      if (selected?.callingCode && val) {
                        const res = validatePhoneByCountry(val, selected.callingCode);
                        setPhoneError(res.ok ? "" : res.reason);
                      } else {
                        setPhoneError("");
                      }
                    }}
                    onBlur={() => {
                      setPhoneTouched(true);
                      const selected = countryCodes.find(
                        (c) => String(c.id) === String(form.countryId)
                      );
                      if (!selected?.callingCode || !form.phoneNumber) return;
                      const res = validatePhoneByCountry(
                        form.phoneNumber,
                        selected.callingCode
                      );
                      if (!res.ok) setPhoneError(res.reason);
                    }}
                  />
                  {phoneTouched && phoneError && (
                    <p className="text-[11px] text-red-600 mt-1 leading-snug">
                      {phoneError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* empty cell to keep 2-column balance when needed */}
            <div className="hidden sm:block" />
          </div>

          {/* Skills */}
          <div className={`${sectionGap}`}>
            <label className={labelTitle}>Skills</label>
            <div className={`${grid2} mt-3`}>
              <div>
                <label className={labelCls}>Skill Cluster</label>
                <Select
                  options={safe(options?.skillCluster)}
                  isClearable
                  value={form.skillCluster}
                  onChange={(selected) => setForm({ ...form, skillCluster: selected })}
                  placeholder="Select"
                  className="mt-1"
                  styles={selectStyles}
                />
              </div>

              <div>
                <label className={labelCls}>Primary Skills</label>
                <Select
                  options={safe(options?.primarySkills)}
                  isMulti
                  closeMenuOnSelect={false}
                  hideSelectedOptions
                  components={{ Option: CheckboxOption }}
                  value={form.primarySkills}
                  onChange={(selected) => setForm({ ...form, primarySkills: selected || [] })}
                  placeholder="Select"
                  className="mt-1"
                  styles={selectStyles}
                />
              </div>

              <div>
                <label className={labelCls}>Secondary Skills</label>
                <Select
                  options={safe(options?.secondarySkills)}
                  isMulti
                  closeMenuOnSelect={false}
                  hideSelectedOptions
                  components={{ Option: CheckboxOption }}
                  value={form.secondarySkills}
                  onChange={(selected) => setForm({ ...form, secondarySkills: selected || [] })}
                  placeholder="Select"
                  className="mt-1"
                  styles={selectStyles}
                />
              </div>
            </div>
          </div>

          {/* Placement */}
          <div className={`${sectionGap}`}>
            <label className={labelTitle}>Location and HBU</label>
            <div className={`${grid2} mt-3`}>
              <div>
                <label className={labelCls}>Location</label>
                <select
                  className={`${inputCls} mt-1`}
                  name="location"
                  value={form.location}
                  onChange={handleInput}
                >
                  <option value="">Select Location</option>
                  {safe(options?.demandLocation).map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>HBU</label>
                <select
                  className={`${inputCls} mt-1`}
                  name="hbu"
                  value={form.hbu}
                  onChange={handleInput}
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
          </div>

          {/* Summary */}
          <div className={`${sectionGap}`}>
            <label className={labelTitle}>Summary</label>
            <div className="mt-3">
              <textarea
                className="w-full h-24 rounded-md border border-gray-300 px-3 py-2 text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none"
                rows={5}
                maxLength={2000}
                name="summary"
                placeholder="Short summary (e.g., Spring Boot developer)"
                value={form.summary}
                onChange={handleInput}
              />
              <div className="mt-1 text-[11px] text-gray-500 text-right">
                {(form.summary?.length || 0)}/2000
              </div>
              {errors.summary && (
                <p className="text-[11px] text-red-600 mt-1">{errors.summary}</p>
              )}
            </div>
          </div>

          {/* CV */}
          <div className={`${sectionGap}`}>
            <label className={labelTitle}>CV Attachment</label>
            <div className="mt-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFile}
                className="block w-full text-[13px] file:mr-3 file:h-9 file:px-3 file:rounded-md file:border-0 file:text-[13px] file:font-medium file:bg-gray-900 file:text-white hover:file:bg-black transition"
              />
              <p className="text-[12px] text-gray-500 mt-1">
                Allowed: <span className="font-medium">PDF, DOC, DOCX</span> — Max 10&nbsp;MB
              </p>
              {form.cv && (
                <p className="text-[11px] text-gray-600 mt-1">
                  Selected: <span className="font-medium">{form.cv.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-2 text-white bg-gray-900 rounded-md hover:bg-black focus:outline-none"
              disabled={hasErrors || !!phoneError}
            >
              {location?.state?.id ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </section>
    </Layout>
  );
}