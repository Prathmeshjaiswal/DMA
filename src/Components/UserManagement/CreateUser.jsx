import { useEffect, useState } from "react";
import { message, Spin, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import NavBar from "../NavBar.jsx";

import { createUser } from "../api/userApi.js";
import {
  getCountries,
  getLocations,
  getDepartments,
  getSubDepartments,
  getRoles,
} from "../api/masterApi.js";

export default function CreateUser() {
  const [form, setForm] = useState({
    userId: "",
    emailId: "",
    countryCode: "",
    phoneNumber: "",
    role: "",
    empName: "",
    location: "",
    department: "",
    subDepartment: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [roles, setRoles] = useState([]);
  const [countries, setCountries] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);

  /* ---------------- LOAD MASTER DATA ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const [countryRes, locRes, deptRes, roleRes] = await Promise.all([
          getCountries(),
          getLocations(),
          getDepartments(),
          getRoles(),
        ]);

        setCountries(countryRes.data || []);
        setLocations(locRes.data || []);
        setDepartments(deptRes.data || []);
        setRoles(roleRes.data || []);
      } catch (e) {
        message.error("Failed to load master data");
      }
    })();
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;

    setForm((prev) => ({
      ...prev,
      department: departmentId,
      subDepartment: "",
    }));

    try {
      const res = await getSubDepartments(departmentId);
      setSubDepartments(res.data || []);
    } catch {
      message.error("Failed to load sub-departments");
    }
  };

  const handleAddMore = () => {
    setForm({
      userId: "",
      emailId: "",
      countryCode: "",
      phoneNumber: "",
      role: "",
      empName: "",
      location: "",
      department: "",
      subDepartment: "",
    });
    setSubDepartments([]);
  };

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const payload = {
        userId: form.userId,
        empName: form.empName,
        emailId: form.emailId,
        countryCode: form.countryCode,
        phoneNumber: form.phoneNumber,
        role: form.role,
        location: form.location,
        department: form.department,
        subDepartments: form.subDepartment,


      };

      const data = await createUser(payload);

      if (data?.success) {
        const hide = message.success({
          duration: 0,
          content: (
            <div className="flex items-center justify-between gap-4">
              <span>
                Temporary password:
                <strong className="ml-2 font-mono">
                  {data.data.tempPassword}
                </strong>
              </span>
              <Button
                size="small"
                type="text"
                icon={<CloseOutlined />}
                onClick={() => hide()}
              />
            </div>
          ),
        });

        const createdOn = new Date().toISOString();

        const combinedUser = {
          ...form,
          createdOn,
          active: true,
        };

        const existingUsers =
          JSON.parse(localStorage.getItem("users")) || [];

        const filtered = existingUsers.filter(
          (u) => u.userId !== combinedUser.userId
        );

        localStorage.setItem(
          "users",
          JSON.stringify([...filtered, combinedUser])
        );
      } else {
        message.error(data?.message || "Create user failed");
      }
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Create user failed"
      );
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
                  name="userId" value={form.userId} onChange={onChange} placeholder="Employee ID" required
                />

                {/* Employee Name */}
                <input
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  name="empName" value={form.empName} onChange={onChange} placeholder="Employee Name" required
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
                  name="location" value={form.location} onChange={onChange} required>
                  <option value="" disabled>Select Location</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.code}>{l.name}</option>
                  ))}
                </select>

                {/* Contact No (full row) */}
                <div className="flex gap-3 md:col-span-2">
                  <select
                    className="w-[92px] rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                  text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
                    name="countryCode" value={form.countryCode} onChange={onChange}>
                    <option value="+91">+91</option>
                  </select>

                  <input
                    className="flex-1 rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                  focus:outline-none focus:ring-2 focus:ring-blue-700"
                    name="phoneNumber" value={form.phoneNumber} onChange={onChange} placeholder="Contact Number" required />
                </div>

                {/* Department */}
                <select
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  value={form.department} onChange={handleDepartmentChange} required>
                  <option value="" disabled>Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>

                {/* Sub-department */}
                <select
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-60"
                  value={form.subDepartment}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subDepartment: e.target.value }))
                  }
                  disabled={!form.department}
                  required
                >
                  <option value="" disabled>Select Sub-department</option>
                  {subDepartments.map((sd) => (
                    <option key={sd.id} value={sd.id}>{sd.name}</option>
                  ))}
                </select>

                {/* Role (full width) */}
                <select
                  className="w-full rounded-lg px-3 py-2 bg-gray-50 ring-1 ring-gray-200 
                text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 md:col-span-2"
                  name="role"
                  value={form.role}
                  onChange={onChange}
                  required
                >
                  <option value="" disabled>Select Role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.role}>{r.role}</option>
                  ))}
                </select>

              </div>

              {/* Buttons */}
              <div className="mt-6 flex items-center justify-between">
                <button type="button" onClick={handleAddMore} className="text-sm text-gray-600 hover:text-gray-800">
                  + Create another user
                </button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg              
                font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-50 disabled:opacity-70"
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