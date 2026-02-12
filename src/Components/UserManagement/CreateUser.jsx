// CreateUser.jsx
import { useEffect, useState } from "react";
import { message, Spin, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import NavBar from "../NavBar.jsx";
import Layout from "../Layout.jsx"
import { createUser } from "../api/userApi.js";
import { getAllDropdowns } from "../api/UserManagement.js";
import { useNavigate } from "react-router-dom";

/** normalizeSubDepartments: Flatten sub-departments and attach proper departmentId via name→id mapping. */
function normalizeSubDepartments(subDepartmentsByName, departments) {
  const nameToId = new Map((departments || []).map((d) => [d.name, d.id]));
  const flat = [];

  Object.entries(subDepartmentsByName || {}).forEach(([deptName, items]) => {
    const deptId = nameToId.get(deptName);
    (items || []).forEach((sd) => {
      flat.push({
        ...sd,
        departmentId: deptId ?? sd.department?.id ?? null,
      });
    });
  });

  return flat;
}

/** onlyDigits: Keep only numeric characters from a string. */
function onlyDigits(s = "") {
  return (s || "").replace(/\D+/g, "");
}


function validateUserId(raw) {
  const digits = onlyDigits(raw);
  if (!digits) return { ok: false, reason: "Employee ID is required." };
  if (digits.length < 6) return { ok: false, reason: "Employee ID must be at least 6 digits." };
  return { ok: true, value: digits };
}


/** getPhoneRegexByCallingCode: Return a country-specific regex for phone validation by calling code. */
function getPhoneRegexByCallingCode(callingCode) {
  switch (callingCode) {
    case "+91": // India: 10 digits, starts 6–9
      return /^[6-9]\d{9}$/;

    case "+1": // US (NANP): 10 digits; area & central office cannot start 0/1
      return /^(?:[2-9]\d{2}[2-9]\d{6})$/;

    case "+44": // UK: pragmatic — allow 9–10 digits (no trunk '0')
      return /^(?:\d{9}|\d{10})$/;

    case "+61": // Australia: 9 digits (mobiles 4xxxxxxxx; landlines 2/3/7/8xxxxxxxx)
      return /^(?:[23478]\d{8})$/;

    default:
      return /^$/; // unsupported → always fail
  }
}

/** validatePhoneByCountry: Validate a raw phone against country rules and return { ok, reason? }. */
function validatePhoneByCountry(rawPhone, callingCode) {
  const nsn = onlyDigits(rawPhone);
  const re = getPhoneRegexByCallingCode(callingCode);

  if (!re.test(nsn)) {
    const reasons = {
      "+91": "For India (+91), enter 10 digits starting with 6-9 (e.g., 98XXXXXXXX).",
      "+1":
        "For United States (+1), enter a 10-digit number; area code and central office cannot start with 0 or 1 (e.g., 4155550123).",
      "+44":
        "For United Kingdom (+44), enter 9-10 digits (no leading trunk '0'; e.g., 7XXXXXXXXX for mobiles).",
      "+61":
        "For Australia (+61), enter 9 digits: mobiles start with 4; landlines start with 2/3/7/8 (e.g., 412345678 or 291234567).",
    };
    return { ok: false, reason: reasons[callingCode] || "Invalid phone format for the selected country." };
  }
  return { ok: true };
}

/** CreateUser: Form to create a user, with dropdowns, dependent sub-depts, and country-based phone validation. */
export default function CreateUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: "",
    name: "",
    emailId: "",
    phoneNumber: "",
    countryId: "",
    roleId: "",
    locationId: "",
    departmentId: "",
    subdepartmentId: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [countryCodes, setCountries] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredSubDepartments, setFilteredSubDepartments] = useState([]);

  const [phoneError, setPhoneError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);

  // add below existing phone state
  const [userIdError, setUserIdError] = useState("");
  const [userIdTouched, setUserIdTouched] = useState(false);

  /** useEffect: Load dropdown data (countries, locations, departments, sub-departments, roles) on mount. */
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllDropdowns();
        const data = res.data;
        setCountries(data.countryCodes || []);
        setLocations(data.locations || []);
        setDepartments(data.departments || []);
        const normalizedSubDepts = normalizeSubDepartments(
          data.subDepartments,
          data.departments
        );
        setSubDepartments(normalizedSubDepts);
        setRoles(data.roles || []);
      } catch {
        message.error("Failed to load dropdown data");
      }
    })();
  }, []);

  /** onChange: Generic input change handler for form fields. */
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  /** handleDepartmentChange: Update department and filter sub-departments accordingly. */
  const handleDepartmentChange = (e) => {
    const departmentId = Number(e.target.value);

    setForm((p) => ({
      ...p,
      departmentId,
      subdepartmentId: "",
    }));

    const filtered = subDepartments.filter(
      (sd) => Number(sd.departmentId) === departmentId
    );
    setFilteredSubDepartments(filtered);
  };

  /** useEffect: Keep filtered sub-departments in sync when data loads or department changes. */
  useEffect(() => {
    if (!form.departmentId) {
      setFilteredSubDepartments([]);
      return;
    }
    const filtered = subDepartments.filter(
      (sd) => Number(sd.departmentId) === Number(form.departmentId)
    );
    setFilteredSubDepartments(filtered);
  }, [form.departmentId, subDepartments]);

  /** handleAddMore: Reset the form and related UI state. */
  const handleAddMore = () => {
    setForm({
      userId: "",
      name: "",
      emailId: "",
      phoneNumber: "",
      countryId: "",
      roleId: "",
      locationId: "",
      departmentId: "",
      subdepartmentId: "",
    });
    setFilteredSubDepartments([]);
    setPhoneError("");
    setUserIdError("");
    setPhoneTouched(false);
    setUserIdTouched(false);
  };

  /** handleCancel: Navigate back to the User Management list. */
  const handleCancel = () => {
    navigate("/UserManagement");
  };

  /** onSubmit: Validate inputs, build payload, create user, and show temp password. */
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.departmentId || !form.subdepartmentId) {
      message.warning("Please select Department and Sub-department");
      return;
    }

    const selectedCountry = countryCodes.find(
      (c) => String(c.id) === String(form.countryId)
    );
    if (!selectedCountry?.callingCode) {
      setPhoneError("Please select a valid country code.");
      setPhoneTouched(true);
      return;
    }

    const phoneCheck = validatePhoneByCountry(
      form.phoneNumber,
      selectedCountry.callingCode
    );
    if (!phoneCheck.ok) {
      setPhoneError(phoneCheck.reason);
      setPhoneTouched(true);
      return;
    }
    setPhoneError("");

    const payload = {
      userId: form.userId,
      name: form.name,
      emailId: form.emailId,
      phoneNumber: form.phoneNumber,
      countryId: Number(form.countryId),
      roleId: Number(form.roleId),
      locationId: Number(form.locationId),
      departmentId: Number(form.departmentId),
      subdepartmentId: Number(form.subdepartmentId),
    };

    try {
      setSubmitting(true);
      const res = await createUser(payload);

      const hide = message.success({
        duration: 0,
        content: (
          <div className="flex items-center justify-between gap-4">
            <span>
              Temporary password:
              <strong className="ml-2 font-mono">
                {res?.data?.tempPassword}
              </strong>
            </span>
            <Button size="small" type="text" icon={<CloseOutlined />} onClick={() => hide()} />
          </div>
        ),
      });
    } catch (err) {
      message.error(err?.response?.dropdowns?.message || "Create user failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Input ring styles for phone field
  const phoneRingBase = "rounded-lg px-3 py-2 bg-gray-50 ring-1 focus:outline-none";
  const phoneRingColor = phoneTouched && phoneError
    ? "ring-red-500 focus:ring-2 focus:ring-red-600"
    : "ring-gray-200 focus:ring-2 focus:ring-blue-700";


  const userIdRingBase = "rounded-lg px-3 py-2 bg-gray-50 ring-1 focus:outline-none";
  const userIdRingColor = userIdTouched && userIdError
    ? "ring-red-500 focus:ring-2 focus:ring-red-600"
    : "ring-gray-200 focus:ring-2 focus:ring-blue-700";

  /** Render: Navbar + centered card with Create User form and validation. */
  return (
    <>
      <Layout>

      {/* Page bg + center container */}
   <div className="mt-[-30px] ">
        <main className="mx-auto w-full max-w-[520px] md:max-w-[640px] px-4 py-6 ">
          <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
            {/* Sticky card header */}
            <div className="px-5 md:px-6 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="text-center">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Create User Account
                </h2>
              </div>
            </div>

            {/* Form */}
            <form className="px-5 md:px-6 py-5" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4">
                {/* Employee ID (validated like phone) */}
                <div className="w-full"> {/* <— wraps input + message in the SAME grid cell */}
                  <input
                    className={`w-full ${userIdRingBase} ${userIdRingColor}`}
                    name="userId"
                    value={form.userId}
                    onChange={(e) => {
                      // keep only digits while typing
                      const val = e.target.value.replace(/\D+/g, "");
                      setForm((p) => ({ ...p, userId: val }));
                      setUserIdTouched(true);

                      // live validation
                      const res = validateUserId(val);
                      setUserIdError(res.ok ? "" : res.reason);
                    }}
                    onBlur={() => {
                      setUserIdTouched(true);
                      const res = validateUserId(form.userId);
                      setUserIdError(res.ok ? "" : res.reason);
                    }}
                    placeholder="Employee ID"
                    inputMode="numeric"
                    autoComplete="off"
                  />

                  {/* Keep the SAME message UI, just move it directly under the input */}
                  {userIdTouched && userIdError && (
                    <p className="mt-1 text-sm text-red-600">{userIdError}</p>
                  )}
                </div>

                {/* Employee Name */}
                <input
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Employee Name"
                  required
                />

                {/* Email */}
                <input
                  type="email"
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  name="emailId"
                  value={form.emailId}
                  onChange={onChange}
                  placeholder="Email ID"
                  required
                />

                {/* Location */}
                <select
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  name="locationId"
                  value={form.locationId}
                  onChange={onChange}
                  required
                >
                  <option value="" disabled>
                    Location
                  </option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>

                {/* Contact No (full row) */}
                <div className="flex gap-3 md:col-span-2">
                  <select
                    className="w-[92px] rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
                    name="countryId"
                    value={form.countryId}
                    onChange={onChange}
                  >
                    <option value="" disabled>
                      +91
                    </option>
                    {countryCodes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.callingCode}
                      </option>
                    ))}
                  </select>

                  <div className="flex-1">
                    <input
                      className={`w-full ${phoneRingBase} ${phoneRingColor}`}
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D+/g, "");
                        setForm((p) => ({ ...p, phoneNumber: val }));
                        setPhoneTouched(true);
                        const selectedCountry = countryCodes.find(
                          (c) => String(c.id) === String(form.countryId)
                        );
                        if (selectedCountry?.callingCode && val) {
                          const res = validatePhoneByCountry(val, selectedCountry.callingCode);
                          setPhoneError(res.ok ? "" : res.reason);
                        } else {
                          setPhoneError("");
                        }
                      }}
                      onBlur={() => {
                        setPhoneTouched(true);
                        const selectedCountry = countryCodes.find(
                          (c) => String(c.id) === String(form.countryId)
                        );
                        if (!selectedCountry?.callingCode || !form.phoneNumber) return;
                        const res = validatePhoneByCountry(
                          form.phoneNumber,
                          selectedCountry.callingCode
                        );
                        if (!res.ok) setPhoneError(res.reason);
                      }}
                      placeholder="Contact Number"
                      required
                    />
                    {phoneTouched && phoneError && (
                      <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                    )}
                  </div>
                </div>

                {/* Department */}
                <select
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  value={form.departmentId}
                  onChange={handleDepartmentChange}
                  required
                >
                  <option value="" disabled>
                    Business Unit
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                {/* Sub-department */}
                <select
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-60"
                  value={form.subdepartmentId}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      subdepartmentId: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  disabled={!form.departmentId}
                  required
                >
                  <option value="" disabled>
                    Business Function
                  </option>
                  {filteredSubDepartments.map((sd) => (
                    <option key={sd.id} value={sd.id}>
                      {sd.name}
                    </option>
                  ))}
                </select>

                {/* Role (full width) */}
                <select
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 md:col-span-2"
                  name="roleId"
                  value={form.roleId}
                  onChange={onChange}
                  required
                >
                  <option value="" disabled>
                    Role
                  </option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddMore}
                  className="text-l text-gray-600 hover:text-gray-800"
                >
                  Reset
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 bg-transparent border-0"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-50 disabled:opacity-70"
                  >
                    {submitting && <Spin size="small" />}
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
      </Layout>
    </>
  );
}