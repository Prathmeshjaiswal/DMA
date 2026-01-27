import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Spin, Button } from "antd";
import NavBar from "../NavBar";
import { getAllDropdowns, updateUserById, getAllUsers } from "../api/masterApi";

export default function EditUser() {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [countryCodes, setCountries] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [filteredSubDepartments, setFilteredSubDepartments] = useState([]);

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

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllUsers();
        const list = res?.data ?? res;

        let user = Array.isArray(list)
          ? list.find((u) => String(u.id) === String(id))
          : null;

        if (!user) {
          user = Array.isArray(list)
            ? list.find((u) => String(u.userId) === String(id))
            : null;
        }

        if (!user) {
          message.error("User not found");
          return;
        }

        setForm({
          userId: user.userId ?? "",
          name: user.name ?? "",
          emailId: user.emailId ?? "",
          phoneNumber: user.phoneNumber ?? "",
          countryId: user.country?.id ?? "",
          roleId: user.role?.id ?? "",
          locationId: user.location?.id ?? "",
          departmentId: user.department?.id ?? "",
          subdepartmentId: user.subdepartment?.id ?? user.subDepartment?.id ?? "",
        });
      } catch {
        message.error("Failed to load user");
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [id]);

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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleDepartmentChange = (e) => {
    const departmentId = Number(e.target.value);
    setForm((p) => ({
      ...p,
      departmentId,
      subdepartmentId: "",
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.departmentId || !form.subdepartmentId) {
      message.warning("Please select Department and Sub-department");
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
      await updateUserById(id, payload);
      message.success("User updated successfully");
      navigate("/usermanagement");
    } catch (err) {
      message.error(err?.response?.data?.message ?? "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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

      {/* Page background + centered card */}
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 mt-[-50px]">
        <main className="mx-auto w-full max-w-[720px] px-4 py-6">
          <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-5 md:px-6 py-4 border-b border-gray-100 text-center">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Edit User</h2>
            </div>

            {/* Compact form */}
            <form onSubmit={onSubmit} className="px-5 md:px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Employee ID */}
                <input
                  className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={form.userId}
                  name="userId"
                  onChange={onChange}
                  placeholder="Employee ID"
                  required
                />

                {/* Name */}
                <input
                  className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={form.name}
                  name="name"
                  onChange={onChange}
                  placeholder="Name"
                  required
                />

                {/* Email */}
                <input
                  type="email"
                  className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={form.emailId}
                  name="emailId"
                  onChange={onChange}
                  placeholder="Email"
                  required
                />

                {/* Location */}
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

                {/* Phone (country + number) - full row but compact */}
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

                  <input
                    className="flex-1 h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={form.phoneNumber}
                    name="phoneNumber"
                    onChange={onChange}
                    placeholder="Contact Number"
                    required
                  />
                </div>

                {/* Department */}
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

                {/* Sub-department */}
                <select
                  className="w-full h-10 text-sm rounded-lg px-3 bg-gray-50 ring-1 ring-gray-200 text-gray-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                    Select Sub-department
                  </option>
                  {filteredSubDepartments.map((sd) => (
                    <option key={sd.id} value={sd.id}>
                      {sd.name}
                    </option>
                  ))}
                </select>

                {/* Role (full width but compact) */}
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

              {/* Buttons */}
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
