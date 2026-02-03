// UserManagement.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Empty,
  Modal,
  Space,
  Table,
  Switch,
  Tooltip,
  message,
  Pagination,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../Layout";
import {
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  getAllDropdowns,
  getAllUsers,
  updateUserStatus,
} from "../api/UserManagement";
import { usePermissions } from "../Auth/PermissionProvider";

/* ---------- Utilities ---------- */

/** toBase64Url: Encode a numeric id to base64url-safe string. */
const toBase64Url = (n) =>
  btoa(String(n)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

/** openEdit: Navigate to edit page with encoded id and pass the full record as state. */
const openEdit = (navigate, record) => {
  if (record?.id == null) {
    message.error("Missing row id");
    return;
  }
  navigate(`/edituser/${toBase64Url(record.id)}`, { state: { user: record } });
};

/** toTime: Convert ISO string to epoch ms (NaN if invalid). */
const toTime = (iso) => {
  if (!iso) return NaN;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? NaN : t;
};

/** essentiallySameTime: Compare two ISO datetimes within a tolerance. */
const essentiallySameTime = (a, b, toleranceMs = 5000) => {
  const ta = toTime(a);
  const tb = toTime(b);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return false;
  return Math.abs(ta - tb) <= toleranceMs;
};

/** formatDateTime: Format ISO date to a readable local string. */
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

/** getInitials: Compute initials from a full name. */
const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

/** safe: Return em dash if value is empty/undefined. */
const safe = (v) => (v === null || v === undefined || v === "" ? "—" : v);

/** getViewTheme: Return palette tokens by status (used for status badge in modal). */
const getViewTheme = (isActive) => {
  if (isActive) {
    return {
      tileBg: "#ecfdf5",
      tileBorder: "#a7f3d0",
      labelColor: "#065f46",
      valueColor: "#064e3b",
      badgeBg: "#ecfdf5",
      badgeBorder: "#a7f3d0",
      badgeText: "#047857",
    };
  }
  return {
    tileBg: "#fafafa",
    tileBorder: "#f0f0f0",
    labelColor: "#6b7280",
    valueColor: "#111827",
    badgeBg: "#fff1f0",
    badgeBorder: "#fecaca",
    badgeText: "#b91c1c",
  };
};

/** UserManagement: List users with search/sort/pagination and permission-aware actions. */
export default function UserManagement() {
  const navigate = useNavigate();
  const locationHook = useLocation();

  /** Permission checks: Control Add/Edit/Toggle visibility. */
  const { can } = usePermissions();
  const canCreateUser = can("User Management", "Users Sheet", "Create User");
  const canEditUser = can("User Management", "Users Sheet", "Edit User");
  const canToggleUser = can(
    "User Management",
    "Users Sheet",
    "Activate/Deactivate User"
  );

  // Core state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  // Masters (labels)
  const [deptMap, setDeptMap] = useState({});
  const [roleMap, setRoleMap] = useState({});
  const [subDeptMap, setSubDeptMap] = useState({});
  const [mastersLoaded, setMastersLoaded] = useState(false);

  // UI state
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize /*, setPageSize*/] = useState(10);
  const [sorterInfo, setSorterInfo] = useState({ field: null, order: null });

  /** buildMap: Convert array to id->name map. */
  const buildMap = (arr, idKey = "id", nameKey = "name") =>
    Array.isArray(arr)
      ? Object.fromEntries(arr.map((it) => [it?.[idKey], it?.[nameKey]]))
      : {};

  /** flattenSubDepartments: Support either array or grouped object shape. */
  const flattenSubDepartments = (subDepartmentsObjOrArray) => {
    if (Array.isArray(subDepartmentsObjOrArray)) {
      return buildMap(subDepartmentsObjOrArray, "id", "name");
    }
    const out = {};
    if (subDepartmentsObjOrArray && typeof subDepartmentsObjOrArray === "object") {
      for (const deptName of Object.keys(subDepartmentsObjOrArray)) {
        const list = subDepartmentsObjOrArray[deptName];
        if (Array.isArray(list)) {
          for (const s of list) out[s.id] = s.name;
        }
      }
    }
    return out;
  };

  /** fetchMasters: Load dropdown masters and build label maps. */
  const fetchMasters = async () => {
    try {
      const body = await getAllDropdowns();
      const data = body?.data ?? body;

      setRoleMap(buildMap(data?.roles, "id", "role"));
      setDeptMap(buildMap(data?.departments, "id", "name"));
      setSubDeptMap(flattenSubDepartments(data?.subDepartments));

      setMastersLoaded(true);
    } catch (e) {
      console.error("Failed to load dropdowns:", e?.response ?? e);
      setMastersLoaded(true);
      message.warning("Dropdowns failed to load. Sub-department names may be blank.");
    }
  };

  /** fetchUsers: Load users and normalize flexible backend shapes for the table. */
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const envelope = await getAllUsers(); // { data: [...] }
      const raw = Array.isArray(envelope?.data) ? envelope.data : [];

      const mapped = raw.map((u) => {
        const createdByUserId =
          u.createdBy ??
          u.createdByUserId ??
          u.createdById ??
          u.createdUser?.userId ??
          u.createdUser?.id ??
          null;

        const createdByName =
          u.createdByName ??
          u.created_user_name ??
          u.createdUser?.name ??
          u.createdUser?.username ??
          null;

        const subDeptId =
          u.subdepartmentId ?? u.subDepartmentId ?? u.subdepartment?.id ?? null;

        const active = (() => {
          const v = u.active ?? u.isActive ?? u.status ?? u.enabled;
          if (typeof v === "boolean") return v;
          if (typeof v === "number") return v === 1;
          if (typeof v === "string") {
            const s = v.trim().toLowerCase();
            if (["1", "true", "yes", "active"].includes(s)) return true;
            if (["0", "false", "no", "inactive"].includes(s)) return false;
          }
          return false;
        })();

        const createdOn = u.createdOn ?? u.createdAt ?? null;
        const updatedAtRaw = u.updatedAt ?? u.updatedOn ?? null;

        const displayUpdatedAt =
          updatedAtRaw && !essentiallySameTime(updatedAtRaw, createdOn)
            ? updatedAtRaw
            : null;

        // Back-end DTO: updatedBy = userId (string), updatedByName = name
        const updatedByUserId =
          u.updatedBy ??
          u.updatedByUserId ??
          u.updatedById ??
          u.updatedUser?.userId ??
          u.updatedUser?.id ??
          u.lastModifiedById ??
          null;

        const updatedByName =
          u.updatedByName ??
          u.updated_user_name ??
          u.updatedUser?.name ??
          u.updatedUser?.username ??
          u.lastModifiedBy ??
          u.modifierName ??
          (updatedByUserId ? "" : "—");

        const updatedBySortKey = `${updatedByName || ""} ${updatedByUserId || ""}`.trim();
        const safeUpdatedByUserId =
          updatedByUserId && /^\d+$/.test(String(updatedByUserId)) ? updatedByUserId : "";

        return {
          id: u.id,
          userId: u.userId ?? u.id ?? "—",
          empName: u.name ?? u.empName ?? "—",
          emailId: u.emailId ?? u.email ?? "—",
          phoneNumber: u.phoneNumber ?? u.mobile ?? u.phone ?? "—",
          location: u.location?.name ?? u.locationName ?? u.locationId ?? "—",

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
          createdOn,
          updatedAt: updatedAtRaw,
          displayUpdatedAt,

          updatedByName,
          updatedByUserId,
          updatedBySortKey,
          safeUpdatedByUserId,

          createdByName,
          createdByUserId,
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

  /** Effect: Load masters once on mount. */
  useEffect(() => {
    fetchMasters();
  }, []);

  /** Effect: Set default sorter once users load. */
  useEffect(() => {
    if (users.length > 0 && !sorterInfo.field) {
      setSorterInfo({ field: "createdOn", order: "descend" });
    }
  }, [users, sorterInfo.field]);

  /** Effect: Fetch users after masters are loaded or on route key change (refresh). */
  useEffect(() => {
    if (!mastersLoaded) return;
    fetchUsers();
  }, [mastersLoaded, locationHook.key]);

  /** Effect: Reset page to 1 on search text change. */
  useEffect(() => {
    setPage(1);
  }, [searchText]);

  /** Effect (debug): Log updatedBy fields of the first row (if present). */
  useEffect(() => {
    if (users.length) {
      console.log("UpdatedBy (name, id):", users[0].updatedByName, users[0].updatedByUserId);
      console.log("RAW first row:", users[0]);
    }
  }, [users]);

  /* ---------- Handlers ---------- */

  /** handleStatusToggle: Optimistic toggle with rollback on failure. */
  const handleStatusToggle = async (record, checked) => {
    const prevUsers = users;
    setUsers((prev) =>
      prev.map((u) => (u.userId === record.userId ? { ...u, active: checked } : u))
    );

    try {
      await updateUserStatus(record.userId, checked);
      message.success(`User ${checked ? "activated" : "deactivated"}`);
    } catch (e) {
      console.error("updateUserStatus failed:", e?.response ?? e);
      message.error(e?.response?.data?.message ?? "Failed to update status");
      setUsers(prevUsers); // rollback
    }
  };

  /** StatusSwitch: Styled switch for active/inactive state. */
  const StatusSwitch = ({ value, onChange }) => (
    <Switch
      checked={value}
      onChange={onChange}
      checkedChildren={<CheckOutlined />}
      style={{ backgroundColor: value ? "#1677ff" : "#e5e7eb" }}
    />
  );

  /* ---------- Sorting + Pagination ---------- */

  /** handleTableChange: Capture sorter to apply client-side sorting. */
  const handleTableChange = (_pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    setSorterInfo({
      field: s?.field ?? s?.columnKey ?? null,
      order: s?.order ?? null,
    });
  };

  /** filteredUsers: Search by name, role, or department. */
  const filteredUsers = useMemo(() => {
    if (!searchText?.trim()) return users;
    const q = searchText.trim().toLowerCase();
    const str = (v) => (v == null ? "" : String(v)).toLowerCase();

    return users.filter((u) => {
      const byName = str(u.empName).includes(q);
      const byRole = str(u.role).includes(q);
      const byDepartment = str(u.department).includes(q);
      return byName || byRole || byDepartment;
    });
  }, [users, searchText]);

  /** sortedUsers: Keep actives first, then apply current column sorter. */
  const sortedUsers = useMemo(() => {
    const all = [...filteredUsers];
    if (!all.length) return all;

    const getTime = (v) => {
      const t = v ? new Date(v).getTime() : 0;
      return Number.isNaN(t) ? 0 : t;
    };

    const cmpByField = (a, b, field, order) => {
      if (!field || !order) return 0;

      if (field === "updatedBy") {
        const av = a.updatedBySortKey || "";
        const bv = b.updatedBySortKey || "";
        const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
        return order === "ascend" ? cmp : -cmp;
      }

      let cmp = 0;
      if (field === "createdOn" || field === "updatedAt") {
        cmp = getTime(a[field]) - getTime(b[field]);
      } else {
        const av = a[field] ?? "";
        const bv = b[field] ?? "";
        cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      }
      return order === "ascend" ? cmp : -cmp;
    };

    const actives = all.filter((u) => !!u.active);
    const inactives = all.filter((u) => !u.active);

    const { field, order } = sorterInfo || {};
    actives.sort((a, b) => cmpByField(a, b, field, order));
    inactives.sort((a, b) => cmpByField(a, b, field, order));

    return [...actives, ...inactives];
  }, [filteredUsers, sorterInfo]);

  /** pagedUsers: Slice current page of sorted users. */
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, page, pageSize]);

  /** renderUpdatedByCell: Compact two-line cell with name and id (fallbacks applied). */
  const renderUpdatedByCell = (record) => {
    const hasEverUpdated = !!record.updatedAt;
    let name = record.updatedByName;
    let uid = record.safeUpdatedByUserId || record.updatedByUserId;

    if (!hasEverUpdated) {
      name = record.createdByName ?? name;
      uid = record.safeUpdatedByUserId ?? record.updatedByUserId;
    }
    if (!name && !uid) return <span>-</span>;

    return (
      <div className="leading-tight">
        <div className="font-medium text-gray-900">{name || "-"}</div>
        {uid ? <div style={{ color: "#7d7d7d", fontSize: 12 }}>({uid})</div> : null}
      </div>
    );
  };

  /* ---------- Columns (permission-aware actions) ---------- */
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
      { title: "Business Unit", dataIndex: "department", key: "department" },
      { title: "Business Function", dataIndex: "subDepartment", key: "subDepartment" },
      { title: "Assigned Role", dataIndex: "role", key: "role" },
      { title: "Location", dataIndex: "location", key: "location" },
      {
        title: "Created At",
        dataIndex: "createdOn",
        key: "createdOn",
        width: 200,
        render: (value) => <span className="text-gray-700">{formatDateTime(value)}</span>,
      },
      {
        title: "Updated By",
        key: "updatedBy",
        render: (_, record) => renderUpdatedByCell(record),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space size="large">
            <Tooltip title="View">
              <Button type="text" icon={<EyeOutlined />} onClick={() => setViewUser(record)} />
            </Tooltip>

            {canEditUser && (
              <Tooltip title="Edit">
                <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(navigate, record)} />
              </Tooltip>
            )}

            {canToggleUser && (
              <StatusSwitch
                value={record.active}
                onChange={(checked) => handleStatusToggle(record, checked)}
              />
            )}
          </Space>
        ),
      },
    ],
    [navigate, canEditUser, canToggleUser, filteredUsers]
  );

  /** Render: Page layout with header, search, permission-aware actions, table, pagination, and view modal. */
  return (
    <>
      <Layout>
        <div className="p-4 ">
          {/* PAGE HEADER */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">User Management</h1>
            </div>

            {/* Right-aligned search + Add button */}
            <div
              style={{
                position: "absolute",
                right: 24,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by name, role, business unit..."
                className="h-9 w-[260px] rounded-md px-3 bg-white ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              {canCreateUser && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/createuser")}>
                  Add User
                </Button>
              )}
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
                  {canCreateUser && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/createuser")}>
                      Add User
                    </Button>
                  )}
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
                style={{ borderRadius: 12 }}
              />
            )}
          </div>

          {users.length > 0 && (
            <Pagination
              current={page}
              total={sortedUsers.length}
              pageSize={pageSize}
              onChange={(p) => setPage(p)}
              style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}
            />
          )}

          {/* View Modal */}
          <Modal open={!!viewUser} onCancel={() => setViewUser(null)} footer={null} width={560} title={null}>
            {viewUser && (
              <div>
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    paddingBottom: 12,
                    borderBottom: "1px solid #f0f0f0",
                    marginBottom: 12,
                    paddingRight: 40,
                  }}
                >
                  {/* Soft avatar circle with initials */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "#eef2ff",
                      color: "#1f2937",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    {getInitials(viewUser.empName || viewUser.name)}
                  </div>

                  {/* Name + ID */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                      {safe(viewUser.empName || viewUser.name)}
                    </div>
                    {viewUser.userId ? (
                      <div style={{ color: "#6b7280", fontSize: 12 }}>ID: {viewUser.userId}</div>
                    ) : null}
                  </div>

                  {/* Status pill */}
                  <div
                    style={{
                      padding: "2px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      background: viewUser.active ? "#ecfdf5" : "#fff1f0",
                      color: viewUser.active ? "#05931b" : "#b91c1c",
                      border: `1px solid ${viewUser.active ? "rgb(10, 180, 100)" : "#fecaca"}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {viewUser.active ? "Active" : "Inactive"}
                  </div>
                </div>

                {/* Body */}
                <div style={{ display: "grid", gap: 12 }}>
                  {/* 2-column grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {/* Email */}
                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Email</div>
                      <div style={{ fontSize: 14, color: "#111827" }}>{safe(viewUser.emailId)}</div>
                    </div>

                    {/* Phone */}
                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Phone</div>
                      <div style={{ fontSize: 14, color: "#111827" }}>{safe(viewUser.phoneNumber)}</div>
                    </div>

                    {/* Role */}
                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Role</div>
                      <div style={{ fontSize: 14, color: "#111827" }}>{safe(viewUser.role)}</div>
                    </div>

                    {/* Location */}
                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Location</div>
                      <div style={{ fontSize: 14, color: "#111827" }}>{safe(viewUser.location)}</div>
                    </div>

                    {/* Department */}
                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Business Unit</div>
                      <div style={{ fontSize: 14, color: "#111827" }}>{safe(viewUser.department)}</div>
                    </div>

                    {/* Sub Department */}
                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Business Function</div>
                      <div style={{ fontSize: 14, color: "#111827" }}>{safe(viewUser.subDepartment)}</div>
                    </div>
                  </div>

                  {/* Meta row: Created / Updated */}
                  <div
                    style={{
                      marginTop: 4,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Created At</div>
                      <div style={{ fontSize: 13, color: "#374151" }}>
                        {safe(formatDateTime(viewUser.createdOn))}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Updated By</div>
                      <div style={{ fontSize: 13, color: "#374151" }}>
                        {viewUser.updatedByName && viewUser.updatedAt
                          ? (viewUser.safeUpdatedByUserId || viewUser.updatedByUserId)
                            ? `${viewUser.updatedByName} (${viewUser.safeUpdatedByUserId || viewUser.updatedByUserId})`
                            : viewUser.updatedByName
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </Layout>
    </>
  );
}