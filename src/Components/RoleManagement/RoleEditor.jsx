// import React, { useEffect, useMemo, useState } from "react";
// import { Button, Space, Tree, Tag, message, Input } from "antd";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import Layout from "../Layout.jsx";
// import { PERMISSIONS_TREE, ALL_LEAF_KEYS } from "./permissions";
// import { Checkbox } from "antd";
// import {EyeOutlined,EditOutlined,PlusOutlined,CheckOutlined,} from "@ant-design/icons";
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
// const asArray = (x) =>
//   Array.isArray(x) ? x : x && typeof x === "object" ? Object.values(x) : [];
//
// export default function RoleEditor() {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const location = useLocation();
//   const isEdit = Boolean(id);
//
//   // Resolve initial role from router state or localStorage("role")
//   const initialRole = useMemo(() => {
//     if (!isEdit) return null;
//     const fromState = location.state?.role;
//     if (fromState) return fromState;
//
//     try {
//       const raw = localStorage.getItem("role");
//       const list = raw ? asArray(JSON.parse(raw)) : [];
//       return list.find((r) => r.id === id) || null;
//     } catch {
//       return null;
//     }
//   }, [id, isEdit, location.state]);
//
//   const [name, setName] = useState(initialRole?.name || "");
//   const [checkedKeys, setCheckedKeys] = useState(initialRole?.permissions || []);
//
//   useEffect(() => {
//     if (isEdit) {
//       setName(initialRole?.name || "");
//       setCheckedKeys(initialRole?.permissions || []);
//     }
//   }, [isEdit, initialRole]);
//
//   // Tree handlers
//   const onCheck = (keysOrObj) => {
//     const keys = Array.isArray(keysOrObj) ? keysOrObj : keysOrObj?.checked || [];
//     setCheckedKeys(keys);
//   };
//   const selectAll = () => setCheckedKeys(ALL_LEAF_KEYS);
//   const clearAll = () => setCheckedKeys([]);
//
//   const canSave = name.trim().length > 0;
//
//   const handleSave = () => {
//     const trimmedName = name.trim().toUpperCase();
//     try {
//       const raw = localStorage.getItem("role");
//       const list = raw ? asArray(JSON.parse(raw)) : [];
//
//       if (isEdit && initialRole) {
//         const { userId, username } = getCurrentUserFromLocalStorage();
//         const now = new Date().toISOString();
//
//         const updated = list.map((r) =>
//           r.id === initialRole.id
//             ? {
//                 ...r,
//                 name: trimmedName,
//                 permissions: checkedKeys,
//                 // preserve created*; set updated*
//                 createdBy:
//                   r.createdBy || { userId: "unknown", username: "Unknown User" },
//                 createdAt: r.createdAt || now,
//                 updatedBy: { userId, username },
//                 updatedAt: now,
//               }
//             : r
//         );
// //         localStorage.setItem("role", JSON.stringify(updated));
//         message.success("Role updated.");
//       } else {
// //         const newId =
// //           (crypto?.randomUUID && crypto.randomUUID()) || `r_${Date.now()}`;
//         const { userId, username } = getCurrentUserFromLocalStorage();
//         const now = new Date().toISOString();
//
//         const newRole = {
// //           id: newId,
//           name: trimmedName,
//           permissions: checkedKeys,
//           active: true,
//           createdBy: { userId, username },
//           createdAt: now,
//           updatedBy: null,
//           updatedAt: null,
//
//         };
//
// //         localStorage.setItem("role", JSON.stringify([...list, newRole]));
// console.log("role",json.stringfy([...list,newRole]));
//         message.success("Role created.");
//       }
//
//       navigate("/rolemanagement", { replace: true });
//     } catch (e) {
//       console.error(e);
//       message.error("Failed to save role.");
//     }
//   };
//
//   const handleCancel = () => navigate("/rolemanagement");
//
//   return (
//     <>
//       <Layout>
//         <div className="px-4 py-10 mx-auto w-full max-w-6xl">
//           <div className="flex items-center justify-between">
//             <h1 className="text-base font-semibold text-slate-900 m-0">
//               {isEdit ? "Edit Role" : "Add Role"}
//             </h1>
//           </div>
//           <div className="mt-1 flex items-center gap-3">
//             <label className="text-sm font-medium text-slate-700 w-24">
//               Role Name
//             </label>
//             <Input
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               onBlur={() => setName((v) => v.toUpperCase().trim())}
//               placeholder="ADMIN, PMO, DM"
//               className="focus:!ring-2 focus:!ring-blue-200 focus:!border-blue-500 transition"
//               style={{ width: 288 }} // w-72
//             />
//           </div>
//           <div className="mt-3 grid grid-cols-1">
//             <div className="rounded-md border border-slate-200 bg-white">
//               <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
//                 <div className="text-sm text-slate-600">Select permissions</div>
//                 <Space size="small">
//                   <Button size="small" onClick={selectAll}>
//                     Select All
//                   </Button>
//                   <Button size="small" onClick={clearAll}>
//                     Clear
//                   </Button>
//                 </Space>
//               </div>
//               <div className="flex flex-col px-3 py-2">
//                 <Tree
//                   checkable
//                   selectable={false}
//                   defaultExpandAll
//                   checkedKeys={checkedKeys}
//                   onCheck={onCheck}
//                   treeData={PERMISSIONS_TREE}
//                 />
//               </div>
//             </div>
//            </div>
//
//           <div className="mt-3 border-t border-slate-200 pt-2 flex justify-end gap-2">
//             <Button onClick={handleCancel}>Cancel</Button>
//             <Button type="primary" onClick={handleSave} disabled={!canSave}>
//               {isEdit ? "Save Changes" : "Create Role"}
//             </Button>
//           </div>
//         </div>
//       </Layout>
//     </>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
import { Button, Space, Tree, Tag, message, Input, Spin } from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Layout from "../Layout.jsx";
import { createrole, editrole, getpermissions } from "../api/RoleManagement.js";

/** Utility: safe array */
const asArray = (x) => (Array.isArray(x) ? x : x && typeof x === "object" ? Object.values(x) : []);


export default function RoleEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);

  // Initial role (from navigation state if edit came from list)
  const initialRole = useMemo(() => {
    if (!isEdit) return null;
    const fromState = location.state?.role;
    return fromState || null;
  }, [isEdit, location.state]);

  const [name, setName] = useState(initialRole?.role || initialRole?.name || "");
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [saving, setSaving] = useState(false);

  // Permissions tree state
  const [treeData, setTreeData] = useState([]);
  const [allLeafKeys, setAllLeafKeys] = useState([]);
  const [childToParent, setChildToParent] = useState(new Map());
  const [loadingTree, setLoadingTree] = useState(false);
  const [treeError, setTreeError] = useState("");

  // Load permissions from backend
  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoadingTree(true);
      setTreeError("");
      try {
        const res = await getpermissions();
        const data = res?.data ?? res;
        const modules = asArray(data);

        const childParentMap = new Map();
        const leafKeys = [];
        const nodes = modules.map((mod) => {
          const moduleKey = String(mod.moduleId);
          const children = asArray(mod.childModule).map((child) => {
            const childKey = String(child.childModuleId);
            childParentMap.set(childKey, moduleKey);
            leafKeys.push(childKey);
            return {
              key: childKey,
              title: (
                <span>
                  {child.childModuleName}
                  {child.actionFlag ? (
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {String(child.actionFlag)}
                    </Tag>
                  ) : null}
                </span>
              ),
              isLeaf: true,
            };
          });

          return {
            key: moduleKey,
            title: mod.moduleName,
            children,
          };
        });

        if (!alive) return;
        setTreeData(nodes);
        setChildToParent(childParentMap);
        setAllLeafKeys(leafKeys);

        // Pre-check in edit mode if role has moduleChildModule
        if (isEdit && initialRole?.moduleChildModule) {
          const prechecked = initialRole.moduleChildModule.flatMap((m) =>
            asArray(m.childModule).map((cid) => String(cid))
          );
          setCheckedKeys(prechecked);
        }
      } catch (e) {
        console.error("Permissions fetch error:", e);
        setTreeError(e?.message || "Failed to load permissions.");
        message.error("Failed to load permissions.");
      } finally {
        if (alive) setLoadingTree(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [isEdit, initialRole?.moduleChildModule]);

  // Tree handlers
  const onCheck = (keysOrObj) => {
    const keys = Array.isArray(keysOrObj) ? keysOrObj : keysOrObj?.checked || [];
    setCheckedKeys(keys.map((k) => String(k)));
  };
  const selectAll = () => setCheckedKeys(allLeafKeys);
  const clearAll = () => setCheckedKeys([]);


  const canSave = name.trim().length > 0 && !saving;

  // Helper: keep IDs numeric if numeric, else strings
  const numify = (k) => {
    const n = Number(k);
    return Number.isFinite(n) ? n : k;
  };

  // Build payload: group selected child IDs by parent moduleId
  const buildModuleChildPayload = (selectedChildKeys) => {
    const byModule = new Map(); // moduleId -> childId[]
    for (const childKey of selectedChildKeys) {
      const parentKey = childToParent.get(String(childKey));
      if (!parentKey) continue;
      const moduleId = numify(parentKey);
      const childId = numify(childKey);
      if (!byModule.has(moduleId)) byModule.set(moduleId, []);
      byModule.get(moduleId).push(childId);
    }
    return Array.from(byModule.entries()).map(([module, childModule]) => ({
      module,
      childModule,
    }));
  };

  // const existingNames = useMemo(() => {
  //   try {
  //     const raw = localStorage.getItem("roles");
  //     return raw ? JSON.parse(raw).map((r) => r.name) : [];
  //   } catch {
  //     return [];
  //   }
  // }, []);


  // Save (create or edit)
  const handleSave = async () => {
    const trimmedName = name.trim().toUpperCase();
    const payload = {
      role: trimmedName,
      moduleChildModule: buildModuleChildPayload(checkedKeys),
      ...(isEdit ? { id } : {}), // include id for edit API
    };

    setSaving(true);
    try {
      if (isEdit) {
        await editrole(payload);
        message.success("Role updated.");
      } else {
        await createrole(payload);
        message.success("Role created.");
      }
      navigate("/rolemanagement", { replace: true });
    } catch (e) {
      console.error("Save role error:", e);
      const msg = e?.response?.data?.message || e?.message || "Failed to save role.";
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/rolemanagement");

  return (
    <>
      <Layout>
        <div className="px-4 py-10 mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-slate-900 m-0">
              {isEdit ? "Edit Role" : "Add Role"}
            </h1>
          </div>

          <div className="mt-1 flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 w-24">Role Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setName((v) => v.toUpperCase().trim())}
              placeholder="ADMIN, PMO, DM"
              className="focus:!ring-2 focus:!ring-blue-200 focus:!border-blue-500 transition"
              style={{ width: 288 }}
              disabled={saving}
            />
          </div>

          <div className="mt-3 grid grid-cols-1">
            <div className="rounded-md border border-slate-200 bg-white">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <div className="text-sm text-slate-600">Select permissions</div>
                <Space size="small">
                  <Button size="small" onClick={selectAll} disabled={saving || loadingTree || !!treeError}>
                    Select All
                  </Button>
                  <Button size="small" onClick={clearAll} disabled={saving || loadingTree}>
                    Clear
                  </Button>
                </Space>
              </div>

              <div className="flex flex-col px-3 py-2" style={{ minHeight: 180 }}>
                {loadingTree ? (
                  <div className="flex items-center justify-center py-6">
                    <Spin tip="Loading permissions..." />
                  </div>
                ) : treeError ? (
                  <div className="text-red-600 text-sm py-3">{treeError}</div>
                ) : (
                  <Tree
                    checkable
                    selectable={false}
                    defaultExpandAll
                    checkedKeys={checkedKeys}
                    onCheck={onCheck}
                    treeData={treeData}
                    disabled={saving}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-200 pt-2 flex justify-end gap-2">
            <Button onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSave} disabled={!canSave || loadingTree || !!treeError} loading={saving}>
              {isEdit ? "Save Changes" : "Create Role"}
            </Button>
          </div>
        </div>
      </Layout>
    </>
  );
}