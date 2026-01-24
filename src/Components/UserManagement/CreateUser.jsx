import { useEffect, useMemo, useState } from "react";
import { message, Spin, Button, Modal, Tree, Tag, Space, Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { COLORS } from "../Auth/theme/colors.js";
import { createUser, getRolePermission } from "../api/userApi.js";
import NavBar from "../NavBar.jsx";


export default function CreateUser() {


  const [form, setForm] = useState({
    userId: "",
    emailId: "",
    countryCode: "+91",
    phoneNumber: "",
    role: "",

    //by simran
    empName: "",
    location: "",
    // createdOn:"",

    department: "",        // e.g. HBU / LOB
    subDepartment: "",     // depends on department

  });



  // Department → Sub-department mapping
  const DEPARTMENT_OPTIONS = [
    { value: "HBU", label: "HBU" },
    { value: "LOB", label: "LOB" },
    // add more departments here if needed
  ];

  const SUB_DEPARTMENT_MAP = {
    HBU: [
      "ADM",
      "ADMS",
      "AI",
      "AI/ML",
      "CIMS",
      "Cybersecurity",
      "DAS",
      "Data",
      "Data & AI",
      "DIS",
      "Engineering",
      "Experiance",
      "DPA",
      "Intelligence Automation",
      "QE",
      "Salesforce",
      "Security Service",
    ],
    LOB: [
      "CIB",
      "HBEU Technology",
      "CTO",
      "Cybersecurity",
      "DAO",
      "Enterprise Technology",
      "GDT",
      "MSS",
      "WSIT",
      "WPB",
      "SSIT",
    ]
  };



  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);


  useEffect(() => {
    (async () => {
      try {
        const res = await getRolePermission();
        if (res.success) {
          setRoles(res.data.rolesList || []);
          setPermissions(res.data.permissionsList || []);
        }
      } catch (e) {
        // console.error(e);
        message.error(e ? e : "Failed to load roles & permissions")

      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };



  const handleAddMore = () => {
    setForm({
      userId: "",
      emailId: "",
      countryCode: "+91",
      // contactNo: "",
      phoneNumber: "",
      role: "",
      //by simran
      empName: "",
      location: "",


      department: "",
      subDepartment: "",

    });
  };


  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      department: value,
      subDepartment: "", // reset when department changes
    }));
  };

  const handleSubDepartmentChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, subDepartment: value }));
  };





  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    try {
      setSubmitting(true);

      const payload = {
        userId: form.userId,
        emailId: form.emailId,
        countryCode: form.countryCode,
        phoneNumber: form.phoneNumber,
        role: form.role,
      };


      const data = await createUser(payload);
      console.log("data", data);



      if (data?.success) {
        setMsg({
          type: "success",
          text: data?.message || "Registered successfully",
        });

        const hide = message.success({
          duration: 0,
          content: (
            <div className="flex items-center justify-between gap-4">
              <span className="text-base">
                Temporary password is:{" "}
                <strong className="text-lg font-mono">
                  {data.data.tempPassword}
                </strong>
              </span>
              <div className="flex gap-2">
                <Button
                  size="small"
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        data.data.tempPassword
                      );
                      message.success("Copied to clipboard");
                    } catch {
                      message.error("Copy failed");
                    }
                  }}
                >
                  Copy
                </Button>
                <Button
                  size="small"
                  type="text"
                  icon={<CloseOutlined />}
                  className="text-gray-600 hover:text-red-500"
                  onClick={() => hide()}
                />
              </div>
            </div>
          ),
        });


        const createdOn = new Date().toISOString();

        //COMBINED OBJECT = backend payload + UI fields (no password)
        const combinedUser = {
          userId: form.userId,         // backend
          emailId: form.emailId,       // backend
          countryCode: form.countryCode, // backend
          phoneNumber: form.phoneNumber, // backend
          role: form.role,

          // UI extras:
          empName: form.empName,      // username displayed in UI
          location: form.location,     // UI

          department: form.department,        // NEW
          subDepartment: form.subDepartment,  // NEW

          createdOn,                   // UI
          active: true,                // default active in UI
          // (optional) include any IDs returned by backend, e.g. data.data.userId
          // backendUserId: data?.data?.userId,
        };



        //CONSOLE OUTPUT (as you requested)
        console.groupCollapsed(" Registered User (Combined)");
        console.table([combinedUser]);
        console.groupEnd();





        // PERSIST TO LOCALSTORAGE FOR USER MANAGEMENT VIEW
        // 1) Append to "users" list (flat array used by your table)
        const existingUsers = JSON.parse(localStorage.getItem("users")) || [];

        const withoutDuplicate = existingUsers.filter(
          (u) => (u.userId || u.empId) !== combinedUser.userId
        );
        localStorage.setItem(
          "users",
          JSON.stringify([...withoutDuplicate, combinedUser])
        );


        const uiDetailsMap = JSON.parse(localStorage.getItem("userUiDetailsMap")) || {};
        uiDetailsMap[combinedUser.userId] = {
          empName: combinedUser.empName,
          location: combinedUser.location,
          createdOn: combinedUser.createdOn,
        };
        localStorage.setItem("userUiDetailsMap", JSON.stringify(uiDetailsMap));

        return;
      } else {
        setMsg({
          type: "error",
          text: data?.message || "Registration failed",
        });
      }
    } catch (err) {
      const text =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed";
      message.error(text);
      setMsg({ type: "error", text });
    } finally {
      setSubmitting(false);
    }
  };



  

  return (
    <>
      <NavBar />

      {/* Page bg + center container */}
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 mt-[-50px]">
        <main className="mx-auto w-full max-w-[520px] md:max-w-[640px] px-4 py-6">
          <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
            {/* Sticky card header (optional) */}
            <div className="px-5 md:px-6 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="text-center">
                
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 ">
                    Create User Account
                  </h2>
                
              </div>
            </div>

            {/* Full-height form content (no overflow, no maxHeight) */}

            <form className="px-5 md:px-6 py-5" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4">

                {/* Employee ID */}
                <input
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  name="userId"
                  value={form.userId}
                  onChange={onChange}
                  placeholder="Employee ID"
                  required
                />

                {/* Employee Name */}
                <input
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  name="empName"
                  value={form.empName}
                  onChange={onChange}
                  placeholder="Employee Name"
                  required
                />

                {/* Email */}
                <input
                  type="email"
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  name="emailId"
                  value={form.emailId}
                  onChange={onChange}
                  placeholder="Email ID"
                  required
                />

                {/* Location */}
                <select
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  required
                >
                  <option value="" disabled>Select Location</option>
                  <option value="MUMBAI">Mumbai</option>
                  <option value="PUNE">Pune</option>
                  <option value="BANGALORE">Bangalore</option>
                  <option value="HYDERABAD">Hyderabad</option>
                </select>

                {/* Contact No (full row) */}
                <div className="flex gap-3 md:col-span-2">
                  <select
                    name="countryCode"
                    value={form.countryCode}
                    onChange={onChange}
                    className="w-[92px] rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                   text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
                    required
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+48">🇵🇱 +48</option>
                    <option value="+52">🇲🇽 +52</option>
                  </select>

                  <input
                    className="flex-1 rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                   focus:outline-none focus:ring-2 focus:ring-blue-700"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={onChange}
                    placeholder="Contact Number"
                    inputMode="numeric"
                    required
                  />
                </div>

                {/* Department */}
                <select
                  name="department"
                  value={form.department}
                  onChange={handleDepartmentChange}
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  required
                >
                  <option value="" disabled>Select Department</option>
                  {DEPARTMENT_OPTIONS.map((dep) => (
                    <option key={dep.value} value={dep.value}>{dep.label}</option>
                  ))}
                </select>

                {/* Sub-department */}
                <select
                  name="subDepartment"
                  value={form.subDepartment}
                  onChange={handleSubDepartmentChange}
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-60"
                  required
                  disabled={!form.department}
                >
                  <option value="" disabled>
                    {form.department ? "Select Sub-department" : "Select Department first"}
                  </option>
                  {(SUB_DEPARTMENT_MAP[form.department] || []).map((sd) => (
                    <option key={sd} value={sd}>{sd}</option>
                  ))}
                </select>

                {/* Role (full width) */}
                <select
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 md:col-span-2"
                  name="role"
                  onChange={onChange}
                  value={form.role}
                  required
                >
                  <option value="" disabled>Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.role}>{role.role}</option>
                  ))}
                </select>

              </div>

              {/* Buttons */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddMore}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  + Create another user
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg 
                 font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                 disabled:opacity-70"
                >
                  {submitting && <Spin size="small" />}
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>

          </div>
        </main>
      </div>
    </>
  );

}







