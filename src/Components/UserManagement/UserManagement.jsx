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


// --- Add near the top (below imports) ---
// Encodes a numeric id to Base64URL (e.g., 1 -> "MQ")
const toBase64Url = (n) =>
  btoa(String(n))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

// Optional: small wrapper to navigate safely and show a toast if id is missing
const openEdit = (navigate, record) => {
  if (record?.id == null) {
    message.error("Missing row id");
    return;
  }
  navigate(`/edituser/${toBase64Url(record.id)}`, { state: { user: record } });
};

/* ---------- Utilities ---------- */
const toTime = (iso) => {
  if (!iso) return NaN;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? NaN : t;
};


const essentiallySameTime = (a, b, toleranceMs = 5000) => {
  const ta = toTime(a);
  const tb = toTime(b);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return false;
  return Math.abs(ta - tb) <= toleranceMs;
};



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


/* ---------- Small helpers for View modal ---------- */
const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

const safe = (v) => (v === null || v === undefined || v === "" ? "—" : v);


// Theme palette based on status
const getViewTheme = (isActive) => {
  if (isActive) {
    return {
      // tiles (cards)
      tileBg: "#ecfdf5",        // green-50
      tileBorder: "#a7f3d0",    // green-200
      labelColor: "#065f46",    // green-800
      valueColor: "#064e3b",    // green-900

      // status pill
      badgeBg: "#ecfdf5",
      badgeBorder: "#a7f3d0",
      badgeText: "#047857",
    };
  }
  // inactive (your current gray tones)
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

  const [searchText, setSearchText] = useState("");



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
        // const active =
        //   typeof u.active === "boolean"
        //     ? u.active
        //     : typeof u.isActive === "boolean"
        //       ? u.isActive
        //       : u.active === 1 || u.isActive === 1;


        const active = (() => {
          const v = u.active ?? u.isActive ?? u.status ?? u.enabled;
          if (typeof v === "boolean") return v;                 // true/false
          if (typeof v === "number") return v === 1;            // 1/0
          if (typeof v === "string") {
            const s = v.trim().toLowerCase();
            if (s === "1" || s === "true" || s === "yes" || s === "active") return true;
            if (s === "0" || s === "false" || s === "no" || s === "inactive") return false;
          }
          return false;
        })();




        const createdOn = u.createdOn ?? u.createdAt ?? null;
        const updatedAtRaw = u.updatedAt ?? u.updatedOn ?? null;



        const displayUpdatedAt =
          updatedAtRaw && !essentiallySameTime(updatedAtRaw, createdOn)
            ? updatedAtRaw
            : null;




        const updatedByName =
          u.updatedBy ??
          u.updatedByName ??
          u.updated_user_name ??
          u.updatedUser?.name ??
          u.updatedUser?.username ??
          u.lastModifiedBy ??
          u.modifierName ??
          "—";


        const updatedByUserId =
          u.updatedByUserId ??
          u.updatedById ??
          u.updatedUser?.userId ??
          u.updatedUser?.id ??
          u.lastModifiedById ??
          null; // UPDATED



        const updatedBySortKey = `${updatedByName || ""} ${updatedByUserId || ""}`.trim(); // UPDATED




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
          createdOn,
          updatedAt: updatedAtRaw,       // keep the raw for sorting
          displayUpdatedAt,

          updatedByName,   // UPDATED
          updatedByUserId, // UPDATED
          updatedBySortKey


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
  }, [searchText]);


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


  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, page, pageSize]);



  const renderUpdatedByCell = (record) => {            // UPDATED
    const hasEverUpdated = !!record.updatedAt;         // was it ever updated?
    const name = record.updatedByName || null;
    const uid = record.updatedByUserId || null;

    if (!hasEverUpdated || (!name && !uid)) return <span>-</span>;  // show hyphen

    return (
      <div className="leading-tight">
        <div className="font-medium text-gray-900">{name || "-"}</div>

        {uid ? <div style={{ color: "#7d7d7d", fontSize: 12 }}>({uid})</div> : null}
      </div>
    );
  };



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



      { title: "Business Unit", dataIndex: "department", key: "department" }, // UPDATED

      // IMPORTANT: this must match the mapped key "subDepartment"

      {
        title: "Business Function",
        dataIndex: "subDepartment",
        key: "subDepartment",
      },
      { title: "Assigned Role", dataIndex: "role", key: "role" },
      { title: "Location", dataIndex: "location", key: "location" },

      {
        title: "Created At",
        dataIndex: "createdOn",
        key: "createdOn",
        width: 200,
        render: (value) => (<span className="text-gray-700">{formatDateTime(value)}</span>
        ),
      },


      {
        title: "Updated By",
        key: "updatedBy",                 // sorterInfo.field will be "updatedBy"
        render: (_, record) => renderUpdatedByCell(record), // UPDATED
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
             
        onClick={() => openEdit(navigate, record)} // UPDATED: Base64URL-encoded numeric id


        />


            </Tooltip>

            <StatusSwitch
              value={record.active}
              onChange={(checked) => handleStatusToggle(record, checked)}
            />
          </Space>
        ),
      },
    ],
    [users, sorterInfo, navigate]
  );



  return (
    <>
      <Layout>
        <div className="p-4 mt-[-60px]">
          {/* PAGE HEADER */}
          <div
            className="mb-4 flex items-center justify-between"

          >
            <div >
              <h1 className="text-lg font-bold">User Management</h1>

            </div>

            {/* Right-aligned Add button like your design */}
            <div style={{ position: "absolute", right: 24, display: "flex", gap: 12, alignItems: "center" }}>


              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by name, role, business unit..."
                className="h-9 w-[260px] rounded-md px-3 bg-white ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

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

          <Modal
            open={!!viewUser}
            onCancel={() => setViewUser(null)}
            footer={null}
            width={560}
            title={null} // we'll render a custom header
          >
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
                    paddingRight:40,
                  }}
                >
                  {/* Soft avatar circle with initials */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "#eef2ff", // indigo-50
                      color: "#1f2937", // gray-800
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    {getInitials(viewUser.empName || viewUser.name)}
                  </div>

                  {/* Name + ID + Status */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                      {safe(viewUser.empName || viewUser.name)}
                    </div>
                    {viewUser.userId ? (
                      <div style={{ color: "#6b7280", fontSize: 12 }}>
                        ID: {viewUser.userId}
                      </div>
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
                  {/* 2-column grid on medium widths */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
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
                      <div style={{ fontSize: 14, color: "#111827" }}>
                        {safe(viewUser.emailId)}
                      </div>
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
                      <div style={{ fontSize: 14, color: "#111827" }}>
                        {safe(viewUser.phoneNumber)}
                      </div>
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
                      <div style={{ fontSize: 14, color: "#111827" }}>
                        {safe(viewUser.role)}
                      </div>
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
                      <div style={{ fontSize: 14, color: "#111827" }}>
                        {safe(viewUser.location)}
                      </div>
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
                      <div style={{ fontSize: 14, color: "#111827" }}>
                        {safe(viewUser.department)}
                      </div>
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
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        Business Function
                      </div>
                      <div style={{ fontSize: 14, color: "#111827" }}>
                        {safe(viewUser.subDepartment)}
                      </div>
                    </div>
                  </div>

                  {/* Meta row: Created / Updated (if available) */}
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

                        {viewUser.updatedByName && viewUser.updatedAt ? (
                          viewUser.updatedByUserId
                            ? `${viewUser.updatedByName} (${viewUser.updatedByUserId})`
                            : viewUser.updatedByName
                        ) : null}

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





// <Modal
//   open={!!viewUser}
//   onCancel={() => setViewUser(null)}
//   footer={null}
//   width={560}
//   title={null}
// >
//   {viewUser && (
//     <div>
//       {/** pick palette based on status */}
//       {(() => {
//         const T = getViewTheme(!!viewUser.active);

//         return (
//           <>
//             {/* Header */}
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 12,
//                 paddingBottom: 12,
//                 borderBottom: "1px solid #f0f0f0",
//                 marginBottom: 12,
//                 paddingRight: 48, // keep space for the X
//               }}
//             >
//               {/* Avatar */}
//               <div
//                 style={{
//                   width: 44,
//                   height: 44,
//                   borderRadius: "50%",
//                   background: "#eef2ff",
//                   color: "#1f2937",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontWeight: 600,
//                   letterSpacing: 0.5,
//                 }}
//               >
//                 {getInitials(viewUser.empName || viewUser.name)}
//               </div>

//               {/* Name + ID */}
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
//                   {safe(viewUser.empName || viewUser.name)}
//                 </div>
//                 {viewUser.userId ? (
//                   <div style={{ color: "#6b7280", fontSize: 12 }}>
//                     ID: {viewUser.userId}
//                   </div>
//                 ) : null}
//               </div>

//               {/* Status pill */}
//               <div
//                 style={{
//                   padding: "2px 10px",
//                   borderRadius: 999,
//                   fontSize: 12,
//                   fontWeight: 600,
//                   background: T.badgeBg,              // THEME
//                   color: T.badgeText,                  // THEME
//                   border: `1px solid ${T.badgeBorder}`,// THEME
//                   whiteSpace: "nowrap",
//                   marginLeft: 4,
//                 }}
//               >
//                 {viewUser.active ? "Active" : "Inactive"}
//               </div>
//             </div>

//             {/* Body */}
//             <div style={{ display: "grid", gap: 12 }}>
//               {/* 2-column grid */}
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: 12,
//                 }}
//               >
//                 {/* A reusable tile component-like style */}
//                 {[
//                   { label: "Email", value: safe(viewUser.emailId) },
//                   { label: "Phone", value: safe(viewUser.phoneNumber) },
//                   { label: "Role", value: safe(viewUser.role) },
//                   { label: "Location", value: safe(viewUser.location) },
//                   { label: "Business Unit", value: safe(viewUser.department) },
//                   { label: "Business Function", value: safe(viewUser.subDepartment) },
//                 ].map((tile, i) => (
//                   <div
//                     key={i}
//                     style={{
//                       background: T.tileBg,                 // THEME
//                       border: `1px solid ${T.tileBorder}`,  // THEME
//                       borderRadius: 8,
//                       padding: "10px 12px",
//                     }}
//                   >
//                     <div style={{ fontSize: 12, color: T.labelColor }}>{tile.label}</div>
//                     <div style={{ fontSize: 14, color: T.valueColor }}>{tile.value}</div>
//                   </div>
//                 ))}
//               </div>

//               {/* Meta row */}
//               <div
//                 style={{
//                   marginTop: 4,
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: 12,
//                 }}
//               >
//                 <div
//                   style={{
//                     background: T.tileBg,                 // THEME
//                     border: `1px solid ${T.tileBorder}`,  // THEME
//                     borderRadius: 8,
//                     padding: "10px 12px",
//                   }}
//                 >
//                   <div style={{ fontSize: 12, color: T.labelColor }}>Created At</div>
//                   <div style={{ fontSize: 13, color: T.valueColor }}>
//                     {safe(formatDateTime(viewUser.createdOn))}
//                   </div>
//                 </div>

//                 <div
//                   style={{
//                     background: T.tileBg,                 // THEME
//                     border: `1px solid ${T.tileBorder}`,  // THEME
//                     borderRadius: 8,
//                     padding: "10px 12px",
//                   }}
//                 >
//                   <div style={{ fontSize: 12, color: T.labelColor }}>Updated By</div>
//                   <div style={{ fontSize: 13, color: T.valueColor }}>
//                     {viewUser.updatedByName && viewUser.updatedAt
//                       ? viewUser.updatedByUserId
//                         ? `${viewUser.updatedByName} (${viewUser.updatedByUserId})`
//                         : viewUser.updatedByName
//                       : "—"}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         );
//       })()}
//     </div>
//   )}
// </Modal>