import React, { useEffect, useState, useMemo } from "react";
import { Button, Empty, Modal, Space, Table, Tag, Switch, Tooltip, message, Pagination } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../Layout"
import {
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { getAllDropdowns, getAllUsers, updateUserStatus } from "../api/masterApi";




/* ---------- Utilities ---------- */
const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};




export default function UserManagement() {
  const navigate = useNavigate();
  const locationHook = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [deptMap, setDeptMap] = useState({});
  const [roleMap, setRoleMap] = useState({});
  const [subDeptMap, setSubDeptMap] = useState({});
  const [mastersLoaded, setMastersLoaded] = useState(false);



  const [page, setPage] = useState(1);
  const [pageSize /*, setPageSize*/] = useState(10)


// Sort state (since we use external Pagination)
  const [sorterInfo, setSorterInfo] = useState({ field: null, order: null });


  const buildMap = (arr, idKey = "id", nameKey = "name") =>
    Array.isArray(arr)
      ? Object.fromEntries(arr.map((it) => [it?.[idKey], it?.[nameKey]]))
      : {};


  const flattenSubDepartments = (subDepartmentsObjOrArray) => {
    if (Array.isArray(subDepartmentsObjOrArray)) {
      return buildMap(subDepartmentsObjOrArray, "id", "name");
    }
    const out = {};
    if (subDepartmentsObjOrArray && typeof subDepartmentsObjOrArray === "object") {
      for (const deptName of Object.keys(subDepartmentsObjOrArray)) {
        const list = subDepartmentsObjOrArray[deptName];
        if (Array.isArray(list)) {
          for (const s of list) {
            out[s.id] = s.name;
          }
        }
      }
    }
    return out;
  };


  const fetchMasters = async () => {
    try {
      const body = await getAllDropdowns(); // envelope
      const data = body?.data ?? body; // be robust

      setRoleMap(buildMap(data?.roles, "id", "role"));
      setDeptMap(buildMap(data?.departments, "id", "name"));
      setSubDeptMap(flattenSubDepartments(data?.subDepartments));

      setMastersLoaded(true);
    } catch (e) {
      console.error("Failed to load dropdowns:", e?.response ?? e);
      // Continue with IDs if names are unavailable
      setMastersLoaded(true);
      message.warning("Dropdowns failed to load. Sub-department names may be blank.");
    }
  };



  const fetchUsers = async () => {
    try {
      setLoading(true);
      const body = await getAllUsers();

      // Typically from BaseController.success -> body.data is an array
      const payload =
        body?.data ??
        body?.users ??
        body?.content ??
        (Array.isArray(body) ? body : null);

      const raw = Array.isArray(payload) ? payload : payload ? [payload] : [];
      console.log(" RAW USERS FROM BACKEND:", raw);

      const mapped = raw.map((u) => {

        const subDeptId =
          u.subdepartmentId ??
          u.subDepartmentId ??
          u.subdepartment?.id ??
          null;


        // Normalize active to boolean (support 1/0 or true/false)
        const active =
          typeof u.active === "boolean"
            ? u.active
            : typeof u.isActive === "boolean"
              ? u.isActive
              : u.active === 1 || u.isActive === 1;

        return {
          id: u.id,
          userId: u.userId ?? u.id ?? "—",
          empName: u.name ?? u.empName ?? "—",
          emailId: u.emailId ?? u.email ?? "—",
          phoneNumber: u.phoneNumber ?? u.mobile ?? u.phone ?? "—",
          location: u.location?.name ?? u.locationName ?? u.locationId ?? "—",

          // Translate IDs -> names; fallback to ID or "—"
          role: roleMap[u.roleId] ?? u.role?.role ?? u.roleName ?? u.roleId ?? "—",
          department:
            deptMap[u.departmentId] ??
            u.department?.name ??
            u.departmentName ??
            u.departmentId ??
            "—",
          subDepartment:
            subDeptMap[subDeptId] ??
            u.subdepartment?.name ??
            u.subDepartment?.name ??
            u.subDeptName ??
            "—",

          active,
          createdOn: u.createdOn ?? u.createdAt ?? null,
           updatedAt: u.updatedAt ?? u.updatedOn ?? null,
        };
      });

      setUsers(mapped);
    } catch (e) {
      console.error("getAllUsers failed:", e?.response ?? e);
      message.error(e?.response?.data?.message ?? e?.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Effects ---------- */
  useEffect(() => {
    fetchMasters();
  }, []);


 useEffect(() => {
    if (users.length > 0 && !sorterInfo.field) {
      setSorterInfo({ field: "createdOn", order: "descend" });
    }
  }, [users, sorterInfo.field]);




  // Fetch users after masters are ready; refetch when navigating back
  useEffect(() => {
    if (!mastersLoaded) return;
    fetchUsers();

  }, [mastersLoaded, locationHook.key]);



  // Reset to first page if users change (e.g., refresh / filter)
  useEffect(() => {
    setPage(1);
  }, [users.length]);


  const handleStatusToggle = async (record, checked) => {
    const prevUsers = users;
    // Optimistic UI
    setUsers((prev) =>
      prev.map((u) => (u.userId === record.userId ? { ...u, active: checked } : u))
    );

    try {
      await updateUserStatus(record.userId, checked);
      message.success(`User ${checked ? "activated" : "deactivated"}`);
      // Optional: uncomment to ensure full sync with server truth
      // await fetchUsers();
    } catch (e) {
      console.error("updateUserStatus failed:", e?.response ?? e);
      message.error(e?.response?.data?.message ?? "Failed to update status");
      // Rollback optimistic change
      setUsers(prevUsers);
    }
  };

  const StatusSwitch = ({ value, onChange }) => (
    <Switch
      checked={value}
      onChange={onChange}
      checkedChildren={<CheckOutlined />}
      style={{ backgroundColor: value ? "#1677ff" : "#e5e7eb" }}
    />
  );



  /* ---------- sorter and Pagination (client-side) ---------- */

  const handleTableChange = (_pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    setSorterInfo({
      field: s?.field ?? s?.columnKey ?? null,
      order: s?.order ?? null,
    });
  };



 const sortedUsers = useMemo(() => {
    const list = [...users];
    const { field, order } = sorterInfo || {};
    if (!field || !order) return list;

    const getTime = (v) => {
      const t = v ? new Date(v).getTime() : 0;
      return Number.isNaN(t) ? 0 : t;
    };

list.sort((a, b) => {
      let cmp = 0;
      if (field === "createdOn" || field === "updatedAt") {
        cmp = getTime(a[field]) - getTime(b[field]);
      } else {
        // Fallback string sorter
        const av = a[field] ?? "";
        const bv = b[field] ?? "";
        cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      }
      return order === "ascend" ? cmp : -cmp;
    });

    return list;
  }, [users, sorterInfo]);


  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, page, pageSize]);


  const columns = useMemo(
    () => [
      {
        title: "User Name",
        key: "empName",
        render: (_, record) => {
          const name = record.empName || "—";
          const id = record.userId || "";
          return (
            <div className="leading-tight">
              <div className="font-medium text-gray-900">{name}</div>
              {id ? <div style={{ color: "#7d7d7d", fontSize: 12 }}>({id})</div> : null}
            </div>
          );
        },
      },
      { title: "Role Name", dataIndex: "role", key: "role" },
      { title: "Department", dataIndex: "department", key: "department" },
      // IMPORTANT: this must match the mapped key "subDepartment"
      { title: "Sub Department", dataIndex: "subDepartment", key: "subDepartment" },
      // {
      //   title: "Created At",
      //   dataIndex: "createdOn",
      //   key: "createdOn",
      //   render: (d) => {
      //     if (!d || d === "—") return "—";
      //     const dt = new Date(d);
      //     if (isNaN(dt)) return "—";
      //     return dt.toLocaleString(undefined, {
      //       year: "numeric",
      //       month: "short",
      //       day: "2-digit",
      //       hour: "2-digit",
      //       minute: "2-digit",
      //     });
      //   },
      // },


{
        title: "Created At",
        dataIndex: "createdOn",
        key: "createdOn",
        width: 200,
        render: (value) => <span className="text-gray-700">{formatDateTime(value)}</span>,
        sorter: (a, b) =>
          new Date(a.createdOn || 0).getTime() - new Date(b.createdOn || 0).getTime(),
        sortOrder: sorterInfo.field === "createdOn" ? sorterInfo.order : null,
        sortDirections: ["ascend", "descend", "ascend"],
      },


 {
        title: "Updated At",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 180,
        render: (value) => <span className="text-gray-700">{formatDateTime(value)}</span>,
        sorter: (a, b) =>
          new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime(),
        sortOrder: sorterInfo.field === "updatedAt" ? sorterInfo.order : null,
        sortDirections: ["ascend", "descend", "ascend"],
      },




      {
        title: "Status",
        dataIndex: "active",
        key: "active",
        render: (v, record) => (
          <Space size="middle">
            <StatusSwitch
              value={v}
              onChange={(checked) => handleStatusToggle(record, checked)}
            />
            <Tag
              color={v ? "success" : "error"}
              style={{
                borderRadius: 6,
                background: v ? "#ecfdf5" : "#fff1f0",
                color: v ? "#16a34a" : "#d32f2f",
                border: "none",
              }}
            >
              {v ? "Active" : "Inactive"}
            </Tag>
          </Space>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space size="large">
            <Tooltip title="View">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => setViewUser(record)}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/edituser/${record.id}`)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [users,sorterInfo]
  );



  return (
    <>
      <Layout>
        <div className="p-4 mt-10px">
          {/* PAGE HEADER */}
          <div
            className="mb-4 flex items-center justify-between"

          >
            <div >
              <h1 className="text-lg font-bold">User Management</h1>

            </div>

            {/* Right-aligned Add button like your design */}
            <div style={{ position: "absolute", right: 24 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/createuser")}
              >
                Add User
              </Button>
            </div>
          </div>

          {/* Table Card */}
          <div
            className="rounded-lg"
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 0,
              overflow: "hidden",
            }}
          >
            {users.length === 0 ? (
              <div
                className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center"
                style={{ border: "1px dashed #e5e7eb", borderRadius: 12 }}
              >
                <Empty description="No users yet">
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/createuser")}>
                    Add User
                  </Button>
                </Empty>
              </div>
            ) : (
              <Table
                rowKey={(r) => r.id}
                columns={columns}
                dataSource={pagedUsers}
                loading={loading}
                pagination={false}
                size="small"
                className="bg-white"
                 onChange={handleTableChange}
                style={{
                  borderRadius: 12,
                }}
              />
            )}
          </div>


          {users.length > 0 && (
            <Pagination
              current={page}
              total={sortedUsers.length}
              pageSize={pageSize}
              onChange={(p) => setPage(p)}
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "flex-end",
              }}
            />
          )}

          {/* VIEW MODAL */}
          <Modal
            open={!!viewUser}
            onCancel={() => setViewUser(null)}
            footer={null}
            title="User Details"
          >
            {viewUser && (
              <div className="space-y-1">
                <p>
                  <b>Employee ID:</b> {viewUser.userId}
                </p>
                <p>
                  <b>Name:</b> {viewUser.empName}
                </p>
                <p>
                  <b>Phone:</b> {viewUser.phoneNumber}
                </p>
                <p>
                  <b>Email:</b> {viewUser.emailId}

                </p>
                <p>
                  <b>Role:</b> {viewUser.role}
                </p>
                <p>
                  <b>Location:</b> {viewUser.location}
                </p>

                <p>
                  <b>Department:</b> {viewUser.department || "—"}
                </p>
                <p>
                  <b>Sub Department:</b> {viewUser.subDepartment || "—"}
                </p>

                <p>
                  <b>Status:</b> {viewUser.active ? "Active" : "Inactive"}
                </p>
              </div>
            )}
          </Modal>
        </div>
      </Layout>
    </>
  );
}