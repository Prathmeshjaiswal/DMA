//
// import React, { useEffect, useMemo, useState } from "react";
// import {Button,Empty,Space,Switch,Table,Tag,Tooltip,Modal,message,} from "antd";
// import {EditOutlined,EyeOutlined,CheckOutlined,CloseOutlined,PlusOutlined} from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";
// import Layout from "../Layout.jsx";
// import { PERMISSIONS_TREE, ALL_LEAF_KEYS } from "./permissions";
// // import {EyeOutlined,EditOutlined,PlusOutlined,CheckOutlined,} from "@ant-design/icons";
//
// /* ---------- Helpers ---------- */
//
// const formatDateTime = (iso) => {
//   if (!iso) return "-";
//   const d = new Date(iso);
//   return d.toLocaleString(undefined, {
//     year: "numeric",
//     month: "short",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };
//
// const asArray = (x) =>
//   Array.isArray(x) ? x : x && typeof x === "object" ? Object.values(x) : [];
//
// const loadRoles = () => {
//   try {
//     const rawPlural = localStorage.getItem("role");
//     const rawSingular = localStorage.getItem("role"); // legacy support
//     const parsed = rawPlural
//       ? JSON.parse(rawPlural)
//       : rawSingular
//       ? JSON.parse(rawSingular)
//       : [];
//     return asArray(parsed);
//   } catch {
//     return [];
//   }
// };
//
// // const saveRoles = (roles) => {
// //   localStorage.setItem("roles", JSON.stringify(roles));
// // };
//
// const getCurrentUserFromLocalStorage = () => {
//   try {
//     const userId = localStorage.getItem("userId");
//     const username = localStorage.getItem("username");
//     return {
//       userId: userId || "unknown",
//       username: username || "Unknown User",
//     };
//   } catch {
//     return { userId: "unknown", username: "Unknown User" };
//   }
// };
//
//
//
// function ViewPermissionsModal({ open, role, onClose }) {
//   if (!role) return null;
//   return (
//     <Modal
//       title={`Permissions for ${role.name}`}
//       open={open}
//       onCancel={onClose}
//       onOk={onClose}
//       okText="Close"
//       cancelButtonProps={{ style: { display: "none" } }}
//       width={520}
//     >
//       <ul className="pl-5 mt-1 list-disc">
//         {role.permissions && role.permissions.length > 0 ? (
//           role.permissions.map((p) => (
//             <li key={p} className="mb-1">
//               <Tag color="blue">{p}</Tag>
//             </li>
//           ))
//         ) : (
//           <li>
//             <Tag>No permissions</Tag>
//           </li>
//         )}
//       </ul>
//     </Modal>
//   );
// }
//
// /* ---------- Main ---------- */
//
// export default function RoleManagement() {
//   const navigate = useNavigate();
//
//   const [roles, setRoles] = useState(() => loadRoles());
//   const [viewOpen, setViewOpen] = useState(false);
//   const [viewRole, setViewRole] = useState(null);
//
//   // One-time soft migration: ensure creation + update metadata exist
// //   useEffect(() => {
// //     try {
// //       const fixed = asArray(roles).map((r) => ({
// //         ...r,
// //         createdBy:
// //           r.createdBy || ({ userId: "unknown", username: "Unknown User" } as any),
// //         createdAt: r.createdAt || new Date().toISOString(),
// //         updatedBy:
// //           r.updatedBy ||
// //           r.createdBy || { userId: "unknown", username: "Unknown User" },
// //         updatedAt: r.updatedAt || r.createdAt || new Date().toISOString(),
// //       }));
// //       const changed = JSON.stringify(fixed) !== JSON.stringify(roles);
// //       if (changed) setRoles(fixed);
// //     } catch {}
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);
//
//   // Persist roles to localStorage whenever they change
// //   useEffect(() => {
// //     saveRoles(roles);
// //   }, [roles]);
//
//   const openViewModal = (role) => {
//     setViewRole(role);
//     setViewOpen(true);
//   };
//
//   const openEditPage = (role) => {
//     navigate(`/roleeditor/${role.id}`, { state: { role } });
//   };
//
//   const openAddPage = () => {
//     navigate(`/roleeditor`);
//   };
//
//   const toggleActive = (roleId, nextActive) => {
//     const { userId, username } = getCurrentUserFromLocalStorage();
//     const now = new Date().toISOString();
//
//     setRoles((prev) =>
//       prev.map((r) =>
//         r.id === roleId
//           ? {
//               ...r,
//               active: nextActive,
//               updatedBy: { userId, username },
//               updatedAt: now,
//             }
//           : r
//       )
//     );
//     message.success(`Role ${nextActive ? "activated" : "deactivated"}.`);
//   };
//
//   const columns = [
//     {
//       title: "Role Name",
//       dataIndex: "name",
//       key: "name",
//       width: 180,
//       render: (text) => <span className="font-medium">{text}</span>,
//       ellipsis: true,
//     },
//     {
//       title: "Created By",
//       key: "createdBy",
//       width: 200,
//       render: (_, record) => {
//         const by = record.createdBy || {};
//         return (
//           <div className="leading-5">
//             <div className="font-medium text-gray-800 truncate">
//               {by.username || "Unknown User"}
//             </div>
//             <div className="text-xs text-gray-500 truncate">
//               ({by.userId || "unknown"})
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       title: "Created At",
//       dataIndex: "createdAt",
//       key: "createdAt",
//       width: 160,
//       render: (value) => (
//         <span className="text-gray-700">{formatDateTime(value)}</span>
//       ),
//       sorter: (a, b) =>
//         new Date(a.createdAt || 0).getTime() -
//         new Date(b.createdAt || 0).getTime(),
//       defaultSortOrder: "descend",
//     },
//     {
//       title: "Updated By",
//       key: "updatedBy",
//       width: 200,
//       render: (_, record) => {
//         const by = record.updatedBy || {};
//         return (
//           <div className="leading-5">
//             <div className="font-medium text-gray-800 truncate">
//               {by.username || "Unknown User"}
//             </div>
//             <div className="text-xs text-gray-500 truncate">
//               ({by.userId || "unknown"})
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       title: "Updated At",
//       dataIndex: "updatedAt",
//       key: "updatedAt",
//       width: 160,
//       render: (value) => (
//         <span className="text-gray-700">{formatDateTime(value)}</span>
//       ),
//       sorter: (a, b) =>
//         new Date(a.updatedAt || 0).getTime() -
//         new Date(b.updatedAt || 0).getTime(),
//     },
//     {
//       title: "Status",
//       dataIndex: "active",
//       key: "status",
//       width: 140,
//       render: (value, record) => (
//         <Space size={6}>
//           <Switch
//             size="small"
//             checked={value}
//             onChange={(checked) => toggleActive(record.id, checked)}
//             checkedChildren={<CheckOutlined />}
//             unCheckedChildren={<CloseOutlined />}
//           />
//           <Tag color={value ? "green" : "red"} style={{ marginInlineStart: 4 }}>
//             {value ? "Active" : "Inactive"}
//           </Tag>
//         </Space>
//       ),
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       width: 120,
//       render: (_, record) => (
//         <Space size={4}>
//           <Tooltip title="View permissions">
//             <Button
//               size="small"
//               type="text"
//               icon={<EyeOutlined />}
//               onClick={() => openViewModal(record)}
//             />
//           </Tooltip>
//           <Tooltip title="Edit role & permissions">
//             <Button
//               size="small"
//               type="text"
//               icon={<EditOutlined />}
//               onClick={() => openEditPage(record)}
//             />
//           </Tooltip>
//         </Space>
//       ),
//       fixed: "right",
//     },
//   ];
//
//   // Minimal, content-first header
//   return (
//     <>
//       <Layout>
//         <style>{`
//
//           .rm-header { margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
//           .rm-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }
//           .compact-table .ant-table { background: #fff; }
//           .compact-table .ant-table-thead > tr > th {
//             padding: 6px 8px !important;
//             background: #f8fafc;
//             font-weight: 600;
//           }
//           .compact-table .ant-table-tbody > tr > td { padding: 6px 8px !important; }
//           .compact-table .ant-table-tbody > tr > td .ant-tag { line-height: 18px; padding: 0 6px; }
//           .compact-table .ant-table-tbody > tr:hover > td { background: #fcfcff; }
//           .compact-table .ant-table-placeholder { padding: 12px !important; }
//           .compact-table .ant-pagination { margin: 8px 0 0 0; }
//         `}</style>
//
//         <div className="rm-wrapper">
//           <div className="rm-header">
//             <h1 className="rm-title">Role Management</h1>
//             <div>
//               <Button type="primary" icon={<PlusOutlined />} onClick={openAddPage}>
//                  Add Role
//               </Button>
//             </div>
//           </div>
//           {roles.length === 0 ? (
//             <div
//               className="rounded-md border border-dashed border-gray-200 bg-white p-6 text-center"
//               style={{ paddingTop: 18, paddingBottom: 18 }}
//             >
//               <Empty
//                 description="No roles yet"
//                 image={Empty.PRESENTED_IMAGE_SIMPLE}
//               >
//                 <Button type="primary" onClick={openAddPage}>
//                   + Add Role
//                 </Button>
//               </Empty>
//             </div>
//           ) : (
//             <div className="compact-table">
//               <Table
//                 rowKey="id"
//                 columns={columns}
//                 dataSource={asArray(roles)}
//                 size="small"
//                 pagination={{
//                   size: "small",
//                   showSizeChanger: true,
//                   pageSizeOptions: [10, 20, 50, 100],
//                   defaultPageSize: 10,
//                   showTotal: (total) => `${total} roles`,
//                 }}
//                 tableLayout="fixed"
//                 scroll={{ x: 900 }}
//               />
//             </div>
//           )}
//
//           {/* View Permissions Modal */}
//           <ViewPermissionsModal
//             open={viewOpen}
//             role={viewRole}
//             onClose={() => {
//               setViewOpen(false);
//               setViewRole(null);
//             }}
//           />
//         </div>
//       </Layout>
//     </>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
import { Button, Empty, Space, Switch, Table, Tag, Tooltip, Modal, message, Spin } from "antd";
import { EditOutlined, EyeOutlined, CheckOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout.jsx";
import { getroles, getpermissions } from "../api/RoleManagement.js";

const formatDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const asArray = (x) => (Array.isArray(x) ? x : x && typeof x === "object" ? Object.values(x) : []);


const buildPermissionLookups = (modules) => {
  const moduleNameById = new Map();
  const childNameById = new Map();
  asArray(modules).forEach((m) => {
    moduleNameById.set(String(m.moduleId), m.moduleName);
    asArray(m.childModule).forEach((c) => {
      childNameById.set(String(c.childModuleId), c.childModuleName);
    });
  });
  return { moduleNameById, childNameById };
};

function ViewPermissionsModal({ open, role, onClose, lookups }) {
  if (!role) return null;
  const items = asArray(role.moduleChildModule);

  return (
    <Modal
      title={`Permissions for ${role.role || role.name || "-"}`}
      open={open}
      onCancel={onClose}
      onOk={onClose}
      okText="Close"
      cancelButtonProps={{ style: { display: "none" } }}
      width={560}
    >
      {items.length === 0 ? (
        <Tag>No permissions</Tag>
      ) : (
        <div className="space-y-3">
          {items.map((m, idx) => {
            const modId = String(m.module);
            const modName = lookups?.moduleNameById?.get(modId) || `Module ${modId}`;
            const childIds = asArray(m.childModule);
            return (
              <div key={`${modId}-${idx}`} className="border rounded p-2">
                <div className="font-medium mb-1">{modName}</div>
                <div className="flex flex-wrap gap-6">
                  {childIds.length > 0 ? (
                    childIds.map((cid, i) => {
                      const cKey = String(cid);
                      const cName = lookups?.childNameById?.get(cKey) || `Child ${cKey}`;
                      return (
                        <Tag key={`${modId}-${cKey}-${i}`} color="blue">
                          {cName}
                        </Tag>
                      );
                    })
                  ) : (
                    <Tag>None</Tag>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}


export default function RoleManagement() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPerm, setLoadingPerm] = useState(false);
  const [error, setError] = useState("");

  const [viewOpen, setViewOpen] = useState(false);
  const [viewRole, setViewRole] = useState(null);

  // Permission lookups for nicer display in the modal
  const [lookups, setLookups] = useState({ moduleNameById: new Map(), childNameById: new Map() });

  // Load roles
  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getroles();
      // backend could return {data: [...] } or raw array
      const list = asArray(res?.data ?? res);
      setRoles(list);
    } catch (e) {
      console.error("Get roles error:", e);
      const msg = e?.response?.data?.message || e?.message || "Failed to load roles.";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Load permissions to build name lookups
  const fetchPermissions = async () => {
    setLoadingPerm(true);
    try {
      const res = await getpermissions();
      const modules = asArray(res?.data ?? res);
      setLookups(buildPermissionLookups(modules));
    } catch (e) {
      console.warn("Permissions lookup failed (modal will show IDs).", e);
      // Non-blocking — we simply won't have names for modal tags
    } finally {
      setLoadingPerm(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const openViewModal = (role) => {
    setViewRole(role);
    setViewOpen(true);
  };

  const openEditPage = (role) => {
    const rid = role?.id ?? role?.roleId ?? role?._id;
    if (!rid) {
      message.error("Role identifier missing.");
      return;
    }
    navigate(`/roleeditor/${rid}`, { state: { role } });
  };

  const openAddPage = () => {
    navigate(`/roleeditor`);
  };

  // Local toggle only (no API provided). Remove or replace with API if you add one later.
  const toggleActive = (record) => {
    const nextActive = !record.active;
    setRoles((prev) =>
      prev.map((r) => (r === record || r.id === record.id ? { ...r, active: nextActive } : r))
    );
    message.success(`Role ${nextActive ? "activated" : "deactivated"} (local).`);
  };

  const columns = [
    {
      title: "Role Name",
      dataIndex: "role",
      key: "role",
      width: 140,
      render: (_, record) => <span className="font-medium">{record.role || record.name || "-"}</span>,
      ellipsis: true,
    },
    {
      title: "Created By",
      key: "createdBy",
      width: 140,
      render: (_, record) => {
        const by = record.createdBy || {};
        return (
          <div className="leading-5">
            <div className="font-medium text-gray-800 truncate">{by.userName || "Unknown User"}</div>
            <div className="text-xs text-gray-500 truncate">{by.userId || "unknown"}</div>
          </div>
        );
      },
    },
    {
      title: "Created Date",
      dataIndex: "creationDate",
      key: "creationDate",
      width: 180,
      render: (value) => <span className="text-gray-700">{formatDateTime(value)}</span>,
      sorter: (a, b) => new Date(a.creationDate || 0).getTime() - new Date(b.creationDate || 0).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Updated By",
      key: "updatedBy",
      width: 180,
      render: (_, record) => {
        const by = record.updatedBy || {};
        return (
          <div className="leading-5">
            <div className="font-medium text-gray-800 truncate">{by.username || "Unknown User"}</div>
            <div className="text-xs text-gray-500 truncate">({by.userId || "unknown"})</div>
          </div>
        );
      },
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (value) => <span className="text-gray-700">{formatDateTime(value)}</span>,
      sorter: (a, b) => new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime(),
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "status",
      width: 160,
      render: (value, record) => (
        <Space size={6}>
          <Switch
            size="small"
            checked={!!value}
            onChange={() => toggleActive(record)}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
          />
          <Tag color={value ? "green" : "red"} style={{ marginInlineStart: 4 }}>
            {value ? "Active" : "Inactive"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="View permissions">
            <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => openViewModal(record)} />
          </Tooltip>
          <Tooltip title="Edit role & permissions">
            <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openEditPage(record)} />
          </Tooltip>
        </Space>
      ),
      fixed: "right",
    },
  ];

  return (
    <>
      <Layout>
        <style>{`
          .rm-header { margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
          .rm-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }
          .compact-table .ant-table { background: #fff; }
          .compact-table .ant-table-thead > tr > th {
            padding: 6px 8px !important; background: #f8fafc; font-weight: 600;
          }
          .compact-table .ant-table-tbody > tr > td { padding: 6px 8px !important; }
          .compact-table .ant-table-tbody > tr > td .ant-tag { line-height: 18px; padding: 0 6px; }
          .compact-table .ant-table-tbody > tr:hover > td { background: #fcfcff; }
          .compact-table .ant-table-placeholder { padding: 12px !important; }
          .compact-table .ant-pagination { margin: 8px 0 0 0; }
        `}</style>

        <div className="rm-wrapper">
          <div className="rm-header">
            <h1 className="rm-title">Role Management</h1>
            <div>
              <Button type="primary" icon={<PlusOutlined />} onClick={openAddPage}>
                Add Role
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-md border bg-white p-6 text-center">
              <Spin tip="Loading roles..." />
            </div>
          ) : roles.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-200 bg-white p-6 text-center" style={{ paddingTop: 18, paddingBottom: 18 }}>
              <Empty description="No roles yet" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button type="primary" onClick={openAddPage}>+ Add Role</Button>
              </Empty>
            </div>
          ) : (
            <div className="compact-table">
              <Table
                rowKey={(r, i) => r.id ?? r.roleId ?? r._id ?? i}
                columns={columns}
                dataSource={asArray(roles)}
                size="small"
                pagination={{
                  size: "small",
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50, 100],
                  defaultPageSize: 10,
                  showTotal: (total) => `${total} roles`,
                }}
                tableLayout="fixed"
                scroll={{ x: 980 }}
              />
            </div>
          )}

          {/* View Permissions Modal */}
          <ViewPermissionsModal
            open={viewOpen}
            role={viewRole}
            lookups={lookups}
            onClose={() => {
              setViewOpen(false);
              setViewRole(null);
            }}
          />
        </div>
      </Layout>
    </>
  );
}


