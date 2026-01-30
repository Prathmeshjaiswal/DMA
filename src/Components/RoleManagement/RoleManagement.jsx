// import React, { useEffect, useMemo, useState } from "react";
// import { Button, Empty, Space, Switch, Table, Tag, Tooltip, Modal, message, Spin } from "antd";
// import { EditOutlined, EyeOutlined, CheckOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";
// import Layout from "../Layout.jsx";
// import { getroles, getpermissions, updateRoleStatus } from "../api/RoleManagement.js";


// const formatDateTime = (iso) => {
//   if (!iso) return "-";
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return String(iso);
//   return d.toLocaleString(undefined, {
//     year: "numeric",
//     month: "short",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// const asArray = (x) =>
//   Array.isArray(x) ? x : x && typeof x === "object" ? Object.values(x) : [];

// const buildPermissionLookups = (modules) => {
//   const moduleNameById = new Map();
//   const childNameById = new Map();
//   const actionsByChildId = new Map();

//   asArray(modules).forEach((m) => {
//     const modId = String(m.moduleId);
//     moduleNameById.set(modId, m.moduleName);

//     asArray(m.childModules).forEach((c) => {
//       const cid = String(c.childModuleId);
//       childNameById.set(cid, c.childModuleName);

//       const acts = asArray(c.actions).map((a) => ({
//         id: a.actionId,
//         action: a.actionName,
//       }));
//       actionsByChildId.set(cid, acts);
//     });
//   });

//   return { moduleNameById, childNameById, actionsByChildId };
// };

// function ViewPermissionsModal({ open, role, onClose, lookups }) {
//   if (!role) return null;

//   const items = asArray(role.moduleChildModule);
//   return (
//     <Modal
//       title={`Permissions for ${role.role || role.name || "-"}`}
//       open={open}
//       onCancel={onClose}
//       onOk={onClose}
//       okText="Close"
//       cancelButtonProps={{ style: { display: "none" } }}
//       width={640}
//     >
//       {items.length === 0 ? (
//         <Tag>No permissions</Tag>
//       ) : (
//         <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//           {items.map((m, idx) => {
//             // Normalize field names
//             const modId = String(m.moduleId);
//             const children = asArray(m.childModules || m.childModule || []);

//             const modName = `Module ${modId}`; // role payload usually doesn't include moduleName

//             return (
//               <div
//                 key={`${modId}-${idx}`}
//                 className="border rounded"
//                 style={{ padding: 12 }}
//               >
//                 <div className="font-medium" style={{ marginBottom: 8 }}>
//                   {modName}
//                 </div>

//                 {children.length === 0 ? (
//                   <Tag>None</Tag>
//                 ) : (
//                   <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//                     {children.map((child, i) => {
//                       const cid = String(child.childModuleId ?? child.id);
//                       const cName = lookups?.childNameById?.get(cid) || `Child ${cid}`;
//                       const availableActs = lookups?.actionsByChildId?.get(cid) || [];

//                       // If role payload includes explicit actionIds for this child, show only those
//                       const selectedIds = Array.isArray(child.actionIds)
//                         ? child.actionIds.map((x) => String(x))
//                         : null;

//                       const actsToShow = selectedIds
//                         ? availableActs.filter((a) => selectedIds.includes(String(a.id)))
//                         : availableActs;

//                       return (
//                         <div key={`${modId}-${cid}-${i}`} style={{ paddingLeft: 8 }}>
//                           <div className="text-gray-800" style={{ marginBottom: 4 }}>
//                             • {cName}
//                           </div>
//                           {actsToShow.length > 0 ? (
//                             <div
//                               style={{
//                                 display: "flex",
//                                 gap: 6,
//                                 flexWrap: "wrap",
//                                 paddingLeft: 16,
//                               }}
//                             >
//                               {actsToShow.map((a) => (
//                                 <Tag key={`${cid}-act-${a.id}`} color="geekblue">
//                                   {a.action}
//                                 </Tag>
//                               ))}
//                             </div>
//                           ) : (
//                             <div style={{ paddingLeft: 16 }}>
//                               <Tag>no actions</Tag>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </Modal>
//   );
// }

// export default function RoleManagement() {
//   const navigate = useNavigate();

//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingPerm, setLoadingPerm] = useState(false);
//   const [error, setError] = useState("");

//   const [viewOpen, setViewOpen] = useState(false);
//   const [viewRole, setViewRole] = useState(null);

//   // Lookups for nicer display in the modal
//   const [lookups, setLookups] = useState({
//     moduleNameById: new Map(),
//     childNameById: new Map(),
//     actionsByChildId: new Map(),
//   });

//   // Sorter state for client-side sorting
//   const [sorterInfo, setSorterInfo] = useState({ field: null, order: null });

//   const fetchRoles = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await getroles();
//       const list = asArray(res?.data ?? res);
      
//       console.log("[fetchRoles] Raw response:", res);
//       console.log("[fetchRoles] Raw list:", list);
      
//       // Map active status from common field names
//       const mapped = list.map((role) => {
//         const active = 
//           typeof role.active === "boolean" ? role.active :
//           typeof role.isActive === "boolean" ? role.isActive :
//           typeof role.isactive === "boolean" ? role.isactive :
//           typeof role.is_active === "boolean" ? role.is_active :
//           typeof role.enabled === "boolean" ? role.enabled :
//           role.active === 1 || role.isActive === 1 || role.isactive === 1 || role.is_active === 1 || role.enabled === 1;
        
//         return { ...role, active };
//       });
      
//       console.log("[fetchRoles] Mapped roles:", mapped);
//       setRoles(mapped);
//     } catch (e) {
//       console.error("Get roles error:", e);
//       const msg =
//         e?.response?.data?.message || e?.message || "Failed to load roles.";
//       setError(msg);
//       message.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPermissions = async () => {
//     setLoadingPerm(true);
//     try {
//       const res = await getpermissions();
//       // Your API often sends { success, message, data: [...] }
//       const modules = asArray(res?.data?.data ?? res?.data ?? res);
//       setLookups(buildPermissionLookups(modules));
//     } catch (e) {
//       console.warn(
//         "Permissions lookup failed (modal will show generic labels).",
//         e
//       );
//     } finally {
//       setLoadingPerm(false);
//     }
//   };

//   useEffect(() => {

//     fetchRoles();
//     fetchPermissions();
//   }, []);

//   const openViewModal = (role) => {
//     setViewRole(role);
//     setViewOpen(true);
//   };

//   const openEditPage = (role) => {
//     const rid = role?.id ?? role?.roleId ?? role?._id;
//     if (!rid) {
//       message.error("Role identifier missing.");
//       return;
//     }
//     navigate(`/roleeditor/${rid}`, { state: { role } });
//   };

//   const openAddPage = () => {
//     navigate(`/roleeditor`);
//   };

//   // Toggle active: call dedicated status endpoint on backend (updateStatus)
//   const toggleActive = async (record) => {
//     const nextActive = !record.active;
//     const roleId = record.id ?? record.roleId ?? record._id;

//     if (!roleId) {
//       message.error("Role id not found");
//       return;
//     }

//     // Optimistic UI update
//     const prevRoles = roles;
//     setRoles((prev) => prev.map((r) => (r.id === record.id ? { ...r, active: nextActive } : r)));

//     try {
//       await updateRoleStatus(roleId, nextActive);
//       message.success(`Role ${nextActive ? "activated" : "deactivated"}`);
//       console.log(`[toggleActive] updated role ${roleId} ->`, nextActive);
//     } catch (e) {
//       console.error("[toggleActive] update failed:", e, e?.response?.data);
//       const serverMsg =
//         e?.response?.data?.message ??
//         e?.response?.data?.detail ??
//         (e?.response?.data ? JSON.stringify(e.response.data) : undefined) ??
//         e?.message ??
//         "Failed to update role status";
//       message.error(serverMsg);
//       // rollback
//       setRoles(prevRoles);
//     }
//   };

//   // Render "By" fields that might be a string or an object
//   const renderByField = (value, fallbackLabel) => {
//     if (!value) {
//       return (
//         <div className="leading-5">
//           <div className="font-medium text-gray-800 truncate">{fallbackLabel}</div>
//           <div className="text-xs text-gray-500 truncate">(unknown)</div>
//         </div>
//       );
//     }
//     if (typeof value === "string") {
//       return (
//         <div className="leading-5">
//           <div className="font-medium text-gray-800 truncate">{value}</div>
//           <div className="text-xs text-gray-500 truncate">({value})</div>
//         </div>
//       );
//     }
//     const username = value.username || value.name || "Unknown User";
//     const userId = value.userId || value.id || "unknown";
//     return (
//       <div className="leading-5">
//         <div className="font-medium text-gray-800 truncate">{username}</div>
//         <div className="text-xs text-gray-500 truncate">({userId})</div>
//       </div>
//     );
//   };



  
//  const renderUpdatedByCell = (updatedBy, updatedAt) => { // UPDATED
//     // Until we have an updater OR updatedAt, show hyphen
//     if (!updatedAt || !updatedBy) return <span>-</span>; // UPDATED

//     // String case (e.g., "Simran"). Show name; only show id if we can infer it.
//     if (typeof updatedBy === "string") { // UPDATED
//       return (
//         <div className="leading-5">
//           <div className="font-medium text-gray-800 truncate">{updatedBy}</div>
//           {/* no userId available from a plain string */}
//         </div>
//       );
//     }


    
//  // Object case: try to extract name + id from common keys
//     const username =
//       updatedBy.username ||
//       updatedBy.name ||
//       updatedBy.fullName ||
//       updatedBy.displayName ||
//       null; // UPDATED

//     const userId =
//       updatedBy.userId ||
//       updatedBy.id ||
//       updatedBy.empId ||
//       updatedBy.employeeId ||
//       null; 

      
//  if (!username && !userId) return <span>-</span>; // UPDATED

//     return (
//       <div className="leading-5"> {/* UPDATED */}
//         <div className="font-medium text-gray-800 truncate">{username || "-"}</div>
//         {userId ? (
//           <div className="text-xs text-gray-500 truncate">({userId})</div>
//         ) : null}
//       </div>
//     );
//   }; // UPDATED


//   const columns = [
//     {
//       title: "Role Name",
//       dataIndex: "role",
//       key: "role",
//       width: 140,
//       render: (_, record) => (
//         <span className="font-medium">{record.role || record.name || "-"}</span>
//       ),
//       ellipsis: true,
//     },
//     {
//       title: "Created By",
//       key: "createdBy",
//       width: 180,
//       render: (_, record) => renderByField(record.createdBy, "Unknown"),
//     },
//     {
//       title: "Created At",
//       dataIndex: "createdAt",
//       key: "createdAt",
//       width: 200,
//       render: (value) => (
//         <span className="text-gray-700">{formatDateTime(value)}</span>
//       ),
     
//     },
//     {
//       title: "Updated By",
//       key: "updatedBy",
//       width: 180,
//       render: (_, record) => renderUpdatedByCell(record.updatedBy, record.updatedAt),
//     },
//     {
//       title: "Updated At",
//       dataIndex: "updatedAt",
//       key: "updatedAt",
//       width: 180,
//       render: (value) => (
//         <span className="text-gray-700">{formatDateTime(value)}</span>
//       ),
      
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       width: 140,
//       render: (_, record) => (
//         <Space size="large">
//           <Tooltip title="View permissions">
//             <Button
//               type="text"
//               icon={<EyeOutlined />}
//               onClick={() => openViewModal(record)}
//             />
//           </Tooltip>
//           <Tooltip title="Edit role & permissions">
//             <Button
//               type="text"
//               icon={<EditOutlined />}
//               onClick={() => openEditPage(record)}
//             />
//           </Tooltip>
//           <Switch value={record.active}
//           onChange={() => toggleActive(record)}
//           />
//         </Space>
//       ),
//       fixed: "right",
//     },
//   ];

//   // Handle table sort change
//   const handleTableChange = (_pagination, _filters, sorter) => {
//     const s = Array.isArray(sorter) ? sorter[0] : sorter;
//     setSorterInfo({
//       field: s?.field ?? s?.columnKey ?? null,
//       order: s?.order ?? null,
//     });
//   };

//   // Memoized sorted roles: partition by active/inactive, sort within each group
//   const sortedRoles = useMemo(() => {
//     const all = [...roles];
//     if (!all.length) return all;

//     const getTime = (v) => {
//       const t = v ? new Date(v).getTime() : 0;
//       return Number.isNaN(t) ? 0 : t;
//     };

//     const cmpByField = (a, b, field, order) => {
//       if (!field || !order) return 0;

//       let cmp = 0;
//       if (field === "createdAt" || field === "updatedAt") {
//         cmp = getTime(a[field]) - getTime(b[field]);
//       } else {
//         const av = a[field] ?? "";
//         const bv = b[field] ?? "";
//         cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
//       }
//       return order === "ascend" ? cmp : -cmp;
//     };

//     const { field, order } = sorterInfo || {};
    
//     // Partition: active first, then inactive
//     const actives = all.filter((r) => !!r.active);
//     const inactives = all.filter((r) => !r.active);

//     actives.sort((a, b) => cmpByField(a, b, field, order));
//     inactives.sort((a, b) => cmpByField(a, b, field, order));

//     return [...actives, ...inactives];
//   }, [roles, sorterInfo]);

//   return (
//     <>
//       <Layout>
//         <style>{`
//           .rm-header { margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
//           .rm-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }
//           .compact-table .ant-table { background: #fff; }
//           .compact-table .ant-table-thead > tr > th {
//             padding: 6px 8px !important; background: #f8fafc; font-weight: 600;
//           }
//           .compact-table .ant-table-tbody > tr > td { padding: 6px 8px !important; }
//           .compact-table .ant-table-tbody > tr > td .ant-tag { line-height: 18px; padding: 0 6px; }
//           .compact-table .ant-table-tbody > tr:hover > td { background: #fcfcff; }
//           .compact-table .ant-table-placeholder { padding: 12px !important; }
//           .compact-table .ant-pagination { margin: 8px 0 0 0; }
//         `}</style>

//         <div className="rm-wrapper">
//           <div className="rm-header">
//             <h1 className="rm-title">Role Management</h1>
//             <div>
//               <Button type="primary" icon={<PlusOutlined />} onClick={openAddPage}>
//                 Add Role
//               </Button>
//             </div>
//           </div>

//           {loading ? (
//             <Spin tip="Loading roles..." spinning={true}>
//               <div className="rounded-md border bg-white p-6 text-center">
//                 <div style={{ minHeight: 200 }} />
//               </div>
//             </Spin>
//           ) : roles.length === 0 ? (
//             <div
//               className="rounded-md border border-dashed border-gray-200 bg-white p-6 text-center"
//               style={{ paddingTop: 18, paddingBottom: 18 }}
//             >
//               <Empty description="No roles yet" image={Empty.PRESENTED_IMAGE_SIMPLE}>
//                 <Button type="primary" onClick={openAddPage}>
//                   + Add Role
//                 </Button>
//               </Empty>
//             </div>
//           ) : (
//             <div className="compact-table">
//               <Table
//                 rowKey={(r) => r.id ?? r.roleId ?? r._id ?? "unknown"}
//                 columns={columns}
//                 dataSource={asArray(sortedRoles)}
//                 size="small"
//                 pagination={{
//                   size: "small",
//                   showSizeChanger: true,
//                   pageSizeOptions: [10, 20, 50, 100],
//                   defaultPageSize: 10,
//                   showTotal: (total) => `${total} roles`,
//                 }}
//                 tableLayout="fixed"
//                 scroll={{ x: 980 }}
//                 onChange={handleTableChange}
//               />
//             </div>
//           )}

//           {/* View Permissions Modal */}
//           <ViewPermissionsModal
//             open={viewOpen}
//             role={viewRole}
//             lookups={lookups}
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
import { getroles, getpermissions, updateRoleStatus } from "../api/RoleManagement.js";

const formatDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const asArray = (x) =>
  Array.isArray(x) ? x : x && typeof x === "object" ? Object.values(x) : [];

const buildPermissionLookups = (modules) => {
  const moduleNameById = new Map();
  const childNameById = new Map();
  const actionsByChildId = new Map();

  asArray(modules).forEach((m) => {
    const modId = String(m.moduleId);
    moduleNameById.set(modId, m.moduleName);

    asArray(m.childModules).forEach((c) => {
      const cid = String(c.childModuleId);
      childNameById.set(cid, c.childModuleName);

      const acts = asArray(c.actions).map((a) => ({
        id: a.actionId,
        action: a.actionName,
      }));
      actionsByChildId.set(cid, acts);
    });
  });

  return { moduleNameById, childNameById, actionsByChildId };
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
      width={640}
    >
      {items.length === 0 ? (
        <Tag>No permissions</Tag>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((m, idx) => {
            // Normalize field names
            const modId = String(m.moduleId);
            const children = asArray(m.childModules || m.childModule || []);

            const modName = `Module ${modId}`; // role payload usually doesn't include moduleName

            return (
              <div
                key={`${modId}-${idx}`}
                className="border rounded"
                style={{ padding: 12 }}
              >
                <div className="font-medium" style={{ marginBottom: 8 }}>
                  {modName}
                </div>

                {children.length === 0 ? (
                  <Tag>None</Tag>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {children.map((child, i) => {
                      const cid = String(child.childModuleId ?? child.id);
                      const cName = lookups?.childNameById?.get(cid) || `Child ${cid}`;
                      const availableActs = lookups?.actionsByChildId?.get(cid) || [];

                      // If role payload includes explicit actionIds for this child, show only those
                      const selectedIds = Array.isArray(child.actionIds)
                        ? child.actionIds.map((x) => String(x))
                        : null;

                      const actsToShow = selectedIds
                        ? availableActs.filter((a) => selectedIds.includes(String(a.id)))
                        : availableActs;

                      return (
                        <div key={`${modId}-${cid}-${i}`} style={{ paddingLeft: 8 }}>
                          <div className="text-gray-800" style={{ marginBottom: 4 }}>
                            • {cName}
                          </div>
                          {actsToShow.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                                paddingLeft: 16,
                              }}
                            >
                              {actsToShow.map((a) => (
                                <Tag key={`${cid}-act-${a.id}`} color="geekblue">
                                  {a.action}
                                </Tag>
                              ))}
                            </div>
                          ) : (
                            <div style={{ paddingLeft: 16 }}>
                              <Tag>no actions</Tag>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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

  // Lookups for nicer display in the modal
  const [lookups, setLookups] = useState({
    moduleNameById: new Map(),
    childNameById: new Map(),
    actionsByChildId: new Map(),
  });

  // Sorter state for client-side sorting
  const [sorterInfo, setSorterInfo] = useState({ field: null, order: null });

  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getroles();
      const list = asArray(res?.data ?? res);

      console.log("[fetchRoles] Raw response:", res);
      console.log("[fetchRoles] Raw list:", list);

      // Map active status from common field names
      const mapped = list.map((role) => {
        const active =
          typeof role.active === "boolean" ? role.active :
          typeof role.isActive === "boolean" ? role.isActive :
          typeof role.isactive === "boolean" ? role.isactive :
          typeof role.is_active === "boolean" ? role.is_active :
          typeof role.enabled === "boolean" ? role.enabled :
          role.active === 1 || role.isActive === 1 || role.isactive === 1 || role.is_active === 1 || role.enabled === 1;

        return { ...role, active };
      });

      console.log("[fetchRoles] Mapped roles:", mapped);
      setRoles(mapped);
    } catch (e) {
      console.error("Get roles error:", e);
      const msg =
        e?.response?.data?.message || e?.message || "Failed to load roles.";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    setLoadingPerm(true);
    try {
      const res = await getpermissions();
      // Your API often sends { success, message, data: [...] }
      const modules = asArray(res?.data?.data ?? res?.data ?? res);
      setLookups(buildPermissionLookups(modules));
    } catch (e) {
      console.warn(
        "Permissions lookup failed (modal will show generic labels).",
        e
      );
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

  // Toggle active: call dedicated status endpoint on backend (updateStatus)
  const toggleActive = async (record) => {
    const nextActive = !record.active;
    const roleId = record.id ?? record.roleId ?? record._id;

    if (!roleId) {
      message.error("Role id not found");
      return;
    }

    // Optimistic UI update
    const prevRoles = roles;
    setRoles((prev) => prev.map((r) => (r.id === record.id ? { ...r, active: nextActive } : r)));

    try {
      await updateRoleStatus(roleId, nextActive);
      message.success(`Role ${nextActive ? "activated" : "deactivated"}`);
      console.log(`[toggleActive] updated role ${roleId} ->`, nextActive);
    } catch (e) {
      console.error("[toggleActive] update failed:", e, e?.response?.data);
      const serverMsg =
        e?.response?.data?.message ??
        e?.response?.data?.detail ??
        (e?.response?.data ? JSON.stringify(e.response.data) : undefined) ??
        e?.message ??
        "Failed to update role status";
      message.error(serverMsg);
      // rollback
      setRoles(prevRoles);
    }
  };

  // ------------------------------
  // : Common helper to extract name & id from different shapes (string or object)
  // Supports "128713-Simran" or "Simran-128713" (either order), plain name, plain id, or object forms.
  const extractNameId = (userLike) => { // UPDATED
    if (!userLike) return { name: null, id: null };

    // If it's a string, try to parse patterns:
    if (typeof userLike === "string") {
      const s = userLike.trim();

      // Try "id-name" or "name-id" (split by '-' or whitespace)
      // Will pick the numeric chunk as id and the non-numeric as name
      const parts = s.split(/[\s-]+/).filter(Boolean);
      if (parts.length >= 2) {
        const idPart = parts.find(p => /^\d+$/.test(p)) || null;
        const namePart = parts.find(p => !/^\d+$/.test(p)) || null;
        return {
          name: namePart || null,
          id: idPart || null
        };
      }

      // Pure digits => id only
      if (/^\d+$/.test(s)) return { name: null, id: s };

      // Otherwise treat whole string as name
      return { name: s, id: null };
    }

    // Object case: try common keys
    const name =
      userLike.username ||
      userLike.name ||
      userLike.fullName ||
      userLike.displayName ||
      null;

    const id =
      userLike.userId ||
      userLike.id ||
      userLike.empId ||
      userLike.employeeId ||
      null;

    return { name, id };
  };

 // 👇 UPDATED to show just "-" when neither name nor id exists
const renderUserCell = (value, fallbackLabel = "-") => {
  const { name, id } = extractNameId(value);

  // If both missing → show only a dash
  if (!name && !id) {          // UPDATED
    return <span>-</span>;     // UPDATED
  }

  return (
    <div className="leading-5">
      <div className="font-medium text-gray-800 truncate">{name || fallbackLabel}</div>
      <div className="text-xs text-gray-500 truncate">
        ({id ?? "-"})
      </div>
    </div>
  );
};

  // ------------------------------

  const columns = [
    {
      title: "Role Name",
      dataIndex: "role",
      key: "role",
      width: 140,
      render: (_, record) => (
        <span className="font-medium">{record.role || record.name || "-"}</span>
      ),
      ellipsis: true,
    },
    {
      title: "Created By",
      key: "createdBy",
      width: 180,
      render: (_, record) => renderUserCell(record.createdBy, "Unknown"), // UPDATED
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (value) => (
        <span className="text-gray-700">{formatDateTime(value)}</span>
      ),
    },
    {
      title: "Updated By",
      key: "updatedBy",
      width: 180,
      render: (_, record) => renderUserCell(record.updatedBy, "Unknown"), // UPDATED
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (value) => (
        <span className="text-gray-700">{formatDateTime(value)}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space size="large">
          <Tooltip title="View permissions">
            <Button
            size="small"
              type="text"
              icon={<EyeOutlined />}
              onClick={() => openViewModal(record)}
            />
          </Tooltip>
          <Tooltip title="Edit role & permissions">
            <Button
            size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditPage(record)}
            />
          </Tooltip>
          <Switch
          size="small"
            checked={!!record.active} // UPDATED (was value)
            onChange={() => toggleActive(record)}
          />
        </Space>
      ),
      fixed: "right",
    },
  ];

  // Handle table sort change
  const handleTableChange = (_pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    setSorterInfo({
      field: s?.field ?? s?.columnKey ?? null,
      order: s?.order ?? null,
    });
  };

  // Memoized sorted roles: partition by active/inactive, sort within each group
  const sortedRoles = useMemo(() => {
    const all = [...roles];
    if (!all.length) return all;

    const getTime = (v) => {
      const t = v ? new Date(v).getTime() : 0;
      return Number.isNaN(t) ? 0 : t;
    };

    const cmpByField = (a, b, field, order) => {
      if (!field || !order) return 0;

      let cmp = 0;
      if (field === "createdAt" || field === "updatedAt") {
        cmp = getTime(a[field]) - getTime(b[field]);
      } else {
        const av = a[field] ?? "";
        const bv = b[field] ?? "";
        cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      }
      return order === "ascend" ? cmp : -cmp;
    };

    const { field, order } = sorterInfo || {};

    // Partition: active first, then inactive
    const actives = all.filter((r) => !!r.active);
    const inactives = all.filter((r) => !r.active);

    actives.sort((a, b) => cmpByField(a, b, field, order));
    inactives.sort((a, b) => cmpByField(a, b, field, order));

    return [...actives, ...inactives];
  }, [roles, sorterInfo]);

  return (
    <>
      <Layout>
        <style>{`
          .rm-header { margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
          .rm-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
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
            <Spin tip="Loading roles..." spinning={true}>
              <div className="rounded-md border bg-white p-6 text-center">
                <div style={{ minHeight: 200 }} />
              </div>
            </Spin>
          ) : roles.length === 0 ? (
            <div
              className="rounded-md border border-dashed border-gray-200 bg-white p-6 text-center"
              style={{ paddingTop: 18, paddingBottom: 18 }}
            >
              <Empty description="No roles yet" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button type="primary" onClick={openAddPage}>
                  + Add Role
                </Button>
              </Empty>
            </div>
          ) : (
            <div className="compact-table">
              <Table
                rowKey={(r) => r.id ?? r.roleId ?? r._id ?? "unknown"}
                columns={columns}
                dataSource={asArray(sortedRoles)}
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
                onChange={handleTableChange}
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
