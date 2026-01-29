
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { message, Spin, Button } from "antd";
// import NavBar from "../NavBar";
// import { getAllDropdowns, updateUserById, getAllUsers /* getUserById? */ } from "../api/masterApi";

// /* ---------- Phone helpers: SAME as CreateUser ---------- */

// function onlyDigits(s = "") {
//   return  String(s ?? "").replace(/\D+/g, "");
// }

// function getPhoneRegexByCallingCode(callingCode) {
//   switch (callingCode) {
//     case "+91": // India: 10 digits, starts 6–9
//       return /^[6-9]\d{9}$/;

//     case "+1": // United States (NANP): 10 digits; area & central office cannot start 0/1
//       return /^(?:[2-9]\d{2}[2-9]\d{6})$/;

//     case "+44": // United Kingdom: pragmatic — allow 9–10 digits (no trunk '0')
//       // If you want mobiles only: use /^7\d{9}$/
//       return /^(?:\d{9}|\d{10})$/;

//     case "+61": // Australia: 9 digits; mobiles 4XXXXXXXX; landlines 2/3/7/8XXXXXXXX
//       return /^(?:[23478]\d{8})$/;

//     default:
//       // Reject all for unsupported codes
//       return /^$/;
//   }
// }

// function validatePhoneByCountry(rawPhone, callingCode) {
//   const nsn = onlyDigits(rawPhone); // national significant number
//   const re = getPhoneRegexByCallingCode(callingCode);

//   if (!re.test(nsn)) {
//     const reasons = {
//       "+91":
//         "For India (+91), enter 10 digits starting with 6-9 (e.g., 98XXXXXXXX).",
//       "+1":
//         "For United States (+1), enter a 10-digit number; area code and central office cannot start with 0 or 1 (e.g., 4155550123).",
//       "+44":
//         "For United Kingdom (+44), enter 9-10 digits (no leading trunk '0'; e.g., 7XXXXXXXXX for mobiles).",
//       "+61":
//         "For Australia (+61), enter 9 digits: mobiles start with 4; landlines start with 2/3/7/8 (e.g., 412345678 or 291234567).",
//     };
//     return {
//       ok: false,
//       reason:
//         reasons[callingCode] ||
//         "Invalid phone format for the selected country.",
//     };
//   }
//   return { ok: true };
// }

// /* ------------------------------------------------------- */

// export default function EditUser() {
//   const { id,idParam } = useParams();


  
//  // DECODE HERE (handles encoded IDs like emails, GUIDs, etc.)
//   const decodedId = (() => {
//     try {
//       return decodeURIComponent(idParam ?? "");
//     } catch {
//       return idParam ?? "";
//     }
//   })();


//   const navigate = useNavigate();
//   const { state } = useLocation();
//   const userFromState = state?.user || null;

//   const [form, setForm] = useState({
//     userId: "",
//     name: "",
//     emailId: "",
//     phoneNumber: "",
//     countryId: "",
//     roleId: "",
//     locationId: "",
//     departmentId: "",
//     subdepartmentId: "",
//   });

//   // Start without spinner if we have state.user to render instantly
//   const [initialLoading, setInitialLoading] = useState(!userFromState);
//   const [loading, setLoading] = useState(false);

//   const [countryCodes, setCountries] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [subDepartments, setSubDepartments] = useState([]);
//   const [filteredSubDepartments, setFilteredSubDepartments] = useState([]);

//   // Phone validation UI states (same pattern as CreateUser)
//   const [phoneError, setPhoneError] = useState("");
//   const [phoneTouched, setPhoneTouched] = useState(false);

//   const phoneRingBase =
//     "rounded-lg px-3 py-2 bg-gray-50 ring-1 focus:outline-none";
//   const phoneRingColor =
//     phoneTouched && phoneError
//       ? "ring-red-500 focus:ring-2 focus:ring-red-600"
//       : "ring-gray-200 focus:ring-2 focus:ring-blue-700";

//   const normalizeSubDepartments = (subDepartmentsByName, departments) => {
//     const nameToId = new Map((departments || []).map((d) => [d.name, d.id]));
//     const flat = [];
//     Object.entries(subDepartmentsByName || {}).forEach(([deptName, items]) => {
//       const deptId = nameToId.get(deptName);
//       (items || []).forEach((sd) => {
//         flat.push({
//           ...sd,
//           departmentId: deptId ?? sd.department?.id ?? null,
//         });
//       });
//     });
//     return flat;
//   };

//   /* ---------- Hydrate immediately from navigation state (no spinner) ---------- */
//   useEffect(() => {
//     if (!userFromState) return;

//     const initialPhoneRaw =
//       userFromState.phoneNumber ?? userFromState.mobile ?? "";
//     const cleanedPhone = onlyDigits(initialPhoneRaw);

//     setForm({
//       userId: userFromState.userId ?? "",
//       name: userFromState.empName ?? userFromState.name ?? "",
//       emailId: userFromState.emailId ?? userFromState.email ?? "",
//       phoneNumber: cleanedPhone,
//       countryId: userFromState.country?.id ?? "",
//       roleId: userFromState.role?.id ?? "", // may be string in list; background refresh will correct
//       locationId: userFromState.location?.id ?? "",
//       departmentId: userFromState.department?.id ?? "",
//       subdepartmentId:
//         userFromState.subdepartment?.id ??
//         userFromState.subDepartment?.id ??
//         "",
//     });

//     // We’ll validate later on change/blur because countryCodes might not be loaded yet.
//     setPhoneError("");
//     setPhoneTouched(false);
//   }, [userFromState]);

//   /* ---------- Fetch dropdowns ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await getAllDropdowns();
//         const data = res?.data ?? res;

//         setCountries(data.countryCodes || []);
//         setLocations(data.locations || []);
//         setDepartments(data.departments || []);
//         setRoles(data.roles || []);

//         const normalized = Array.isArray(data.subDepartments)
//           ? data.subDepartments
//           : normalizeSubDepartments(data.subDepartments, data.departments);
//         setSubDepartments(normalized);
//       } catch {
//         message.error("Failed to load dropdowns");
//       }
//     })();
//   }, []);

//   /* ---------- Background refresh the user ---------- */
//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       try {
//         // Prefer getUserById(id) if available.
//         const res = await getAllUsers();
//         const list = res?.data ?? res;

//         let user = Array.isArray(list)
//           ? list.find((u) => String(u.id) === String(decodedId))
//           : null;
//         if (!user && Array.isArray(list)) {
//           user = list.find((u) => String(u.userId) === String(decodedId)) || null;
//         }
//         if (!mounted) return;

        
// if (!user) {
//           if (userFromState) {
//             console.warn("[EditUser] User not found by row id =", decodedId, "— using navigation state."); // UPDATED
//           } else {
//             message.error("User not found"); // UPDATED
//           }
//           setInitialLoading(false);
//           return;
//         }

//         const rawPhone = user.phoneNumber ?? user.mobile ?? "";
//         const cleanedPhone = onlyDigits(rawPhone);

//         setForm({
//           userId: user.userId ?? "",
//           name: user.name ?? "",
//           emailId: user.emailId ?? "",
//           phoneNumber: cleanedPhone,
//           countryId: user.country?.id ?? "",
//           roleId: user.role?.id ?? "",
//           locationId: user.location?.id ?? "",
//           departmentId: user.department?.id ?? "",
//           subdepartmentId:
//             user.subdepartment?.id ?? user.subDepartment?.id ?? "",
//         });

//         // Don’t force error yet—let user interaction (change/blur) validate as in CreateUser
//         setPhoneError("");
//         setPhoneTouched(false);
//       } catch {
     
//  if (!userFromState) {
//           message.error("Failed to load user");
//         } else {
//           console.warn("[EditUser] Failed to refresh from server; rendering state.user.");
//         }
//       } finally {
//         if (mounted) setInitialLoading(false);
//       }
//     })();


//     return () => {
//       mounted = false;
//     };
//   }, [decodedId,userFromState]);

//   /* ---------- Dept → Sub-dept filtering ---------- */
//   useEffect(() => {
//     if (!form.departmentId) {
//       setFilteredSubDepartments([]);
//       return;
//     }
//     const filtered = subDepartments.filter(
//       (sd) => Number(sd.departmentId) === Number(form.departmentId)
//     );
//     setFilteredSubDepartments(filtered);
//   }, [form.departmentId, subDepartments]);

//   /* ---------- Handlers ---------- */
//   const onChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "phoneNumber") {
//       const val = onlyDigits(value);
//       setForm((p) => ({ ...p, phoneNumber: val }));
//       setPhoneTouched(true);

//       // Live validate if country is selected
//       const selectedCountry = countryCodes.find(
//         (c) => String(c.id) === String(form.countryId)
//       );
//       if (selectedCountry?.callingCode && val) {
//         const res = validatePhoneByCountry(val, selectedCountry.callingCode);
//         setPhoneError(res.ok ? "" : res.reason);
//       } else {
//         setPhoneError(""); // reset when country not selected or empty input
//       }
//       return;
//     }

//     if (name === "countryId") {
//       // Update country, then (optionally) validate existing phone against the new country
//       setForm((p) => ({ ...p, countryId: value }));
//       if (form.phoneNumber) {
//         const selectedCountry = countryCodes.find(
//           (c) => String(c.id) === String(value)
//         );
//         if (selectedCountry?.callingCode) {
//           const res = validatePhoneByCountry(
//             form.phoneNumber,
//             selectedCountry.callingCode
//           );
//           setPhoneError(res.ok ? "" : res.reason);
//           setPhoneTouched(true);
//         }
//       }
//       return;
//     }

//     setForm((p) => ({ ...p, [name]: value }));
//   };

//   const onPhoneBlur = () => {
//     setPhoneTouched(true);
//     const selectedCountry = countryCodes.find(
//       (c) => String(c.id) === String(form.countryId)
//     );
//     if (!selectedCountry?.callingCode || !form.phoneNumber) return;

//     const res = validatePhoneByCountry(
//       form.phoneNumber,
//       selectedCountry.callingCode
//     );
//     if (!res.ok) {
//       setPhoneError(res.reason);
  
//     }
//   };

//   const handleDepartmentChange = (e) => {
//     const departmentId = Number(e.target.value);
//     setForm((p) => ({
//       ...p,
//       departmentId,
//       subdepartmentId: "",
//     }));
//   };

//   /* ---------- Submit ---------- */
//   const onSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.departmentId || !form.subdepartmentId) {
//       message.warning("Please select Department and Sub-department");
//       return;
//     }

//     const selectedCountry = countryCodes.find(
//       (c) => String(c.id) === String(form.countryId)
//     );
//     if (!selectedCountry?.callingCode) {
//       setPhoneError("Please select a valid country code.");
//       setPhoneTouched(true);
//       return;
//     }

//     const phoneCheck = validatePhoneByCountry(
//       form.phoneNumber,
//       selectedCountry.callingCode
//     );
//     if (!phoneCheck.ok) {
//       setPhoneError(phoneCheck.reason);
//       setPhoneTouched(true);
//       return;
//     }

//     setPhoneError("");

//     const payload = {
//       userId: form.userId,
//       name: form.name,
//       emailId: form.emailId,
//       phoneNumber: form.phoneNumber, // already digits-only and validated
//       countryId: Number(form.countryId),
//       roleId: Number(form.roleId),
//       locationId: Number(form.locationId),
//       departmentId: Number(form.departmentId),
//       subdepartmentId: Number(form.subdepartmentId),
//     };

//     try {
//       setLoading(true);
//       await updateUserById(decodedId, payload);
//       message.success("User updated successfully");
//       navigate("/usermanagement");
//     } catch (err) {
//       message.error(err?.response?.data?.message ?? "Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------- Initial loading state ---------- */
//   if (initialLoading && !userFromState) {
//     return (
//       <>
//         <NavBar />
//         <div className="w-full h-[60vh] flex items-center justify-center">
//           <Spin />
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <NavBar />

//       <div className="min-h-[calc(100vh-64px)] bg-gray-50 mt-[-50px]">
//         <main className="mx-auto w-full max-w-[720px] px-4 py-6">
//           <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
//             <div className="px-5 md:px-6 py-4 border-b border-gray-100 text-center">
//               <h2 className="text-lg md:text-xl font-semibold text-gray-900">Edit User</h2>
//             </div>

//             <form onSubmit={onSubmit} className="px-5 md:px-6 py-5">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
//                 <input
//                   className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                   value={form.userId}
//                   name="userId"
//                   onChange={onChange}
//                   placeholder="Employee ID"
//                   required
//                 />
//                 <input
//                   className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                   value={form.name}
//                   name="name"
//                   onChange={onChange}
//                   placeholder="Name"
//                   required
//                 />
//                 <input
//                   type="email"
//                   className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                   value={form.emailId}
//                   name="emailId"
//                   onChange={onChange}
//                   placeholder="Email"
//                   required
//                 />
//                 <select
//                   className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                   name="locationId"
//                   value={form.locationId}
//                   onChange={onChange}
//                   required
//                 >
//                   <option value="" disabled>
//                     Select Location
//                   </option>
//                   {locations.map((l) => (
//                     <option key={l.id} value={l.id}>
//                       {l.name}
//                     </option>
//                   ))}
//                 </select>

//                 {/* Phone (country + number) — same UX as CreateUser */}
//                 <div className="md:col-span-2 flex gap-3">
//                   <select
//                     className="w-[110px] h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                     name="countryId"
//                     value={form.countryId}
//                     onChange={onChange}
//                     required
//                   >
//                     <option value="" disabled>
//                       Select
//                     </option>
//                     {countryCodes.map((c) => (
//                       <option key={c.id} value={c.id}>
//                         {c.callingCode}
//                       </option>
//                     ))}
//                   </select>

//                   <div className="flex-1">
//                     <input
//                       className={`w-full ${phoneRingBase} ${phoneRingColor}`}
//                       value={form.phoneNumber}
//                       name="phoneNumber"
//                       onChange={onChange}
//                       onBlur={onPhoneBlur}
//                       placeholder="Contact Number"
//                       required
//                     />
//                     {phoneTouched && phoneError && (
//                       <p className="mt-1 text-xs text-red-600">{phoneError}</p>
//                     )}
//                   </div>
//                 </div>

//                 <select
//                   className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                   value={form.departmentId}
//                   onChange={handleDepartmentChange}
//                   required
//                 >
//                   <option value="" disabled>
//                     Select Department
//                   </option>
//                   {departments.map((d) => (
//                     <option key={d.id} value={d.id}>
//                       {d.name}
//                     </option>
//                   ))}
//                 </select>

//                 <select
//                   className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 text-gray-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                   value={form.subdepartmentId}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       subdepartmentId:
//                         e.target.value === "" ? "" : Number(e.target.value),
//                     }))
//                   }
//                   disabled={!form.departmentId}
//                   required
//                 >
//                   <option value="" disabled>
//                     Select Sub-department
//                   </option>
//                   {filteredSubDepartments.map((sd) => (
//                     <option key={sd.id} value={sd.id}>
//                       {sd.name}
//                     </option>
//                   ))}
//                 </select>

//                 <select
//                   className="md:col-span-2 w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                   name="roleId"
//                   value={form.roleId}
//                   onChange={onChange}
//                   required
//                 >
//                   <option value="" disabled>
//                     Select Role
//                   </option>
//                   {roles.map((r) => (
//                     <option key={r.id} value={r.id}>
//                       {r.role}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="mt-5 flex items-center justify-end gap-3">
//                 <Button onClick={() => navigate("/usermanagement")}>Cancel</Button>
//                 <Button type="primary" htmlType="submit" loading={loading}>
//                   Update User
//                 </Button>
//               </div>
//             </form>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { message, Spin, Button } from "antd";
import NavBar from "../NavBar";
import { getAllDropdowns, updateUserById, getAllUsers } from "../api/masterApi";

/* ---------- Helpers (keep id numeric) ---------- */

// Base64URL -> string; if not valid base64url, just return raw
const fromBase64Url = (s) => {
  if (!s || /[^A-Za-z0-9\-_]/.test(s)) return s; // not base64url: treat as raw
  try {
    const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    return atob(b64);
  } catch {
    return s;
  }
};

// Try to get a NUMBER row id from the URL param (supports raw, decodeURIComponent, base64url)
const parseRowId = (idParam) => { // UPDATED
  if (idParam == null) return null;

  // Try base64url first (if you ever encode), then decodeURIComponent, then raw
  const candidates = [
    fromBase64Url(idParam),
    (() => { try { return decodeURIComponent(idParam); } catch { return idParam; } })(),
    idParam,
  ];

  for (const c of candidates) {
    const n = Number(c);
    if (!Number.isNaN(n)) return n;
  }
  return null; // not a valid number
};

/* ---------- Phone helpers (unchanged) ---------- */
function onlyDigits(s = "") {
  return String(s ?? "").replace(/\D+/g, "");
}

function getPhoneRegexByCallingCode(callingCode) {
  switch (callingCode) {
    case "+91": return /^[6-9]\d{9}$/;
    case "+1": return /^(?:[2-9]\d{2}[2-9]\d{6})$/;
    case "+44": return /^(?:\d{9}|\d{10})$/;
    case "+61": return /^(?:[23478]\d{8})$/;
    default: return /^$/;
  }
}

function validatePhoneByCountry(rawPhone, callingCode) {
  const nsn = onlyDigits(rawPhone);
  const re = getPhoneRegexByCallingCode(callingCode);
  if (!re.test(nsn)) {
    const reasons = {
      "+91": "For India (+91), enter 10 digits starting with 6-9 (e.g., 98XXXXXXXX).",
      "+1": "For United States (+1), enter a 10-digit number; area code and central office cannot start with 0 or 1 (e.g., 4155550123).",
      "+44": "For United Kingdom (+44), enter 9-10 digits (no leading trunk '0'; e.g., 7XXXXXXXXX for mobiles).",
      "+61": "For Australia (+61), enter 9 digits: mobiles start with 4; landlines start with 2/3/7/8 (e.g., 412345678 or 291234567).",
    };
    return { ok: false, reason: reasons[callingCode] || "Invalid phone format for the selected country." };
  }
  return { ok: true };
}

/* ------------------------------------------------------- */

export default function EditUser() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const userFromState = state?.user || null;

  // 🔽 Compute a NUMBER row id from the URL param (supports raw and encoded)
  const rowId = useMemo(() => { // UPDATED
    const n = parseRowId(idParam);
    console.log("[EditUser] idParam =", idParam, "| parsed rowId (Number) =", n);
    return n;
  }, [idParam]);

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

  // Start without spinner if we have state.user to render instantly
  const [initialLoading, setInitialLoading] = useState(!userFromState);
  const [loading, setLoading] = useState(false);

  const [countryCodes, setCountries] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [filteredSubDepartments, setFilteredSubDepartments] = useState([]);

  // Phone UI state
  const [phoneError, setPhoneError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);

  const phoneRingBase = "rounded-lg px-3 py-2 bg-gray-50 ring-1 focus:outline-none";
  const phoneRingColor =
    phoneTouched && phoneError
      ? "ring-red-500 focus:ring-2 focus:ring-red-600"
      : "ring-gray-200 focus:ring-2 focus:ring-blue-700";

  const normalizeSubDepartments = (subDepartmentsByName, departments) => {
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
  };

  /* ---------- Hydrate immediately from navigation state (no spinner) ---------- */
  useEffect(() => {
    if (!userFromState) return;

    const initialPhoneRaw = userFromState.phoneNumber ?? userFromState.mobile ?? "";
    const cleanedPhone = onlyDigits(initialPhoneRaw);

    setForm({
      userId: userFromState.userId ?? "",
      name: userFromState.empName ?? userFromState.name ?? "",
      emailId: userFromState.emailId ?? userFromState.email ?? "",
      phoneNumber: cleanedPhone,
      countryId: userFromState.country?.id ?? "",
      roleId: userFromState.role?.id ?? "",
      locationId: userFromState.location?.id ?? "",
      departmentId: userFromState.department?.id ?? "",
      subdepartmentId:
        userFromState.subdepartment?.id ??
        userFromState.subDepartment?.id ??
        "",
    });

    setPhoneError("");
    setPhoneTouched(false);
  }, [userFromState]);

  /* ---------- Fetch dropdowns ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllDropdowns();
        const data = res?.data ?? res;

        setCountries(data.countryCodes || []);
        setLocations(data.locations || []);
        setDepartments(data.departments || []);
        setRoles(data.roles || []);

        const normalized = Array.isArray(data.subDepartments)
          ? data.subDepartments
          : normalizeSubDepartments(data.subDepartments, data.departments);
        setSubDepartments(normalized);
      } catch {
        message.error("Failed to load dropdowns");
      }
    })();
  }, []);

  /* ---------- Background refresh (match by numeric row id) ---------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (rowId == null || Number.isNaN(rowId)) {
        console.warn("[EditUser] Invalid rowId from URL param:", idParam, rowId);
        if (!userFromState) message.error("Invalid user id in URL");
        setInitialLoading(false);
        return;
      }

      try {
        const res = await getAllUsers();
        const list = res?.data ?? res;

        console.log("[EditUser] getAllUsers length =", Array.isArray(list) ? list.length : "n/a");

        const user = Array.isArray(list)
          ? list.find((u) => Number(u.id) === rowId) // ✅ numeric match
          : null;

        if (!mounted) return;

        if (!user) {
          if (userFromState) {
            console.warn("[EditUser] User not found by id =", rowId, "— using navigation state.");
          } else {
            message.error("User not found");
          }
          setInitialLoading(false);
          return;
        }

        const rawPhone = user.phoneNumber ?? user.mobile ?? "";
        const cleanedPhone = onlyDigits(rawPhone);

        setForm({
          userId: user.userId ?? "",
          name: user.name ?? "",
          emailId: user.emailId ?? user.email ?? "",
          phoneNumber: cleanedPhone,
          countryId: user.country?.id ?? "",
          roleId: user.role?.id ?? "",
          locationId: user.location?.id ?? "",
          departmentId: user.department?.id ?? "",
          subdepartmentId:
            user.subdepartment?.id ?? user.subDepartment?.id ?? "",
        });

        setPhoneError("");
        setPhoneTouched(false);
      } catch (err) {
        console.error("[EditUser] Failed to load user:", err);
        if (!userFromState) {
          message.error("Failed to load user");
        } else {
          console.warn("[EditUser] Refresh failed; rendering state.user.");
        }
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [rowId, userFromState, idParam]);

  /* ---------- Dept → Sub-dept filtering ---------- */
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

  /* ---------- Handlers ---------- */
  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const val = onlyDigits(value);
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
      return;
    }

    if (name === "countryId") {
      setForm((p) => ({ ...p, countryId: value }));
      if (form.phoneNumber) {
        const selectedCountry = countryCodes.find(
          (c) => String(c.id) === String(value)
        );
        if (selectedCountry?.callingCode) {
          const res = validatePhoneByCountry(
            form.phoneNumber,
            selectedCountry.callingCode
          );
          setPhoneError(res.ok ? "" : res.reason);
          setPhoneTouched(true);
        }
      }
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const onPhoneBlur = () => {
    setPhoneTouched(true);
    const selectedCountry = countryCodes.find(
      (c) => String(c.id) === String(form.countryId)
    );
    if (!selectedCountry?.callingCode || !form.phoneNumber) return;

    const res = validatePhoneByCountry(
      form.phoneNumber,
      selectedCountry.callingCode
    );
    if (!res.ok) {
      setPhoneError(res.reason);
    }
  };

  const handleDepartmentChange = (e) => {
    const departmentId = Number(e.target.value);
    setForm((p) => ({
      ...p,
      departmentId,
      subdepartmentId: "",
    }));
  };

  /* ---------- Submit ---------- */
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

    if (rowId == null || Number.isNaN(rowId)) { // ✅ extra guard
      message.error("Invalid user id");
      return;
    }

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
      setLoading(true);
      console.log("[EditUser] updateUserById rowId(Number) =", rowId, "payload =", payload);
      await updateUserById(rowId, payload); // ✅ numeric id
      message.success("User updated successfully");
      navigate("/usermanagement");
    } catch (err) {
      console.error("[EditUser] Update failed:", err);
      message.error(err?.response?.data?.message ?? "Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Initial loading state ---------- */
  if (initialLoading && !userFromState) {
    return (
      <>
        <NavBar />
        <div className="w-full h-[60vh] flex items-center justify-center">
          <Spin />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />

      <div className="min-h-[calc(100vh-64px)] bg-gray-50 mt-[-50px]">
        <main className="mx-auto w-full max-w-[720px] px-4 py-6">
          <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-gray-100 text-center">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Edit User</h2>
            </div>

            <form onSubmit={onSubmit} className="px-5 md:px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <input
                  className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={form.userId}
                  name="userId"
                  onChange={onChange}
                  placeholder="Employee ID"
                  required
                />
                <input
                  className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={form.name}
                  name="name"
                  onChange={onChange}
                  placeholder="Name"
                  required
                />
                <input
                  type="email"
                  className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={form.emailId}
                  name="emailId"
                  onChange={onChange}
                  placeholder="Email"
                  required
                />
                <select
                  className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  name="locationId"
                  value={form.locationId}
                  onChange={onChange}
                  required
                >
                  <option value="" disabled>
                    Select Location
                  </option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>

                {/* Phone (country + number) */}
                <div className="md:col-span-2 flex gap-3">
                  <select
                    className="w-[110px] h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    name="countryId"
                    value={form.countryId}
                    onChange={onChange}
                    required
                  >
                    <option value="" disabled>
                      Select
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
                      value={form.phoneNumber}
                      name="phoneNumber"
                      onChange={onChange}
                      onBlur={onPhoneBlur}
                      placeholder="Contact Number"
                      required
                    />
                    {phoneTouched && phoneError && (
                      <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                    )}
                  </div>
                </div>

                <select
                  className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={form.departmentId}
                  onChange={handleDepartmentChange}
                  required
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 text-gray-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={form.subdepartmentId}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      subdepartmentId:
                        e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  disabled={!form.departmentId}
                  required
                >
                  <option value="" disabled>
                    Select Sub-department
                  </option>
                  {filteredSubDepartments.map((sd) => (
                    <option key={sd.id} value={sd.id}>
                      {sd.name}
                    </option>
                  ))}
                </select>

                <select
                  className="md:col-span-2 w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  name="roleId"
                  value={form.roleId}
                  onChange={onChange}
                  required
                >
                  <option value="" disabled>
                    Select Role
                  </option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <Button onClick={() => navigate("/usermanagement")}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update User
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}