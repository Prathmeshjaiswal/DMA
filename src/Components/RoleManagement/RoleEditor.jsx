import React, { useEffect, useMemo, useState } from "react";
import { Button, Space, Tree, Tag, message, Input } from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Layout from "../Layout.jsx";
import { PERMISSIONS_TREE,ALL_LEAF_KEYS} from "./permissions";


const getCurrentUserFromLocalStorage = () => {
  try {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    return {
      userId: userId || "unknown",
      username: username || "Unknown User",
    };
  } catch {
    return { userId: "unknown", username: "Unknown User" };
  }
};

export default function RoleEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);

  const initialRole = useMemo(() => {
    if (!isEdit) return null;
    const fromState = location.state?.role;
    if (fromState) return fromState;

    try {
      const raw = localStorage.getItem("roles");
      const list = raw ? JSON.parse(raw) : [];
      return list.find((r) => r.id === id) || null;
    } catch {
      return null;
    }
  }, [id, isEdit, location.state]);

  const [name, setName] = useState(initialRole?.name || "");
  const [checkedKeys, setCheckedKeys] = useState(
    initialRole?.permissions || []
  );

  useEffect(() => {
    if (isEdit) {
      setName(initialRole?.name || "");
      setCheckedKeys(initialRole?.permissions || []);
    }
  }, [isEdit, initialRole]);

//   useEffect(() => {
//     if (!isEdit) {
//       const upper = name.trim().toUpperCase();
//       if (ROLE_DEFAULTS[upper]) {
//         setCheckedKeys(ROLE_DEFAULTS[upper]);
//       }
//     }
//   }, [name, isEdit]);

  const onCheck = (keysOrObj) => {
    const keys = Array.isArray(keysOrObj)
      ? keysOrObj
      : keysOrObj?.checked || [];
    setCheckedKeys(keys);
  };

  const selectAll = () => setCheckedKeys(ALL_LEAF_KEYS);
  const clearAll = () => setCheckedKeys([]);

  // const existingNames = useMemo(() => {
  //   try {
  //     const raw = localStorage.getItem("roles");
  //     return raw ? JSON.parse(raw).map((r) => r.name) : [];
  //   } catch {
  //     return [];
  //   }
  // }, []);

//   const isDuplicateName = useMemo(() => {
//     const trimmed = name.trim().toUpperCase();
//     if (!trimmed) return false;
//     return existingNames
//       .filter((n) => n !== (initialRole?.name || ""))
//       .map((n) => n.toUpperCase())
//       .includes(trimmed);
//   }, [name, existingNames, initialRole]);

  const canSave = name.trim().length > 0 ;

  const handleSave = () => {
    const trimmedName = name.trim().toUpperCase();

    try {
      const raw = localStorage.getItem("roles");
      const list = raw ? JSON.parse(raw) : [];

      if (isEdit && initialRole) {
        const updated = list.map((r) =>
          r.id === initialRole.id
            ? {
                ...r,
                name: trimmedName,
                permissions: checkedKeys,
              }
            : r
        );
        localStorage.setItem("roles", JSON.stringify(updated));
        message.success("Role updated.");
      } else {
        const id =
          (crypto?.randomUUID && crypto.randomUUID()) || `r_${Date.now()}`;
        const { userId, username } = getCurrentUserFromLocalStorage();

        const newRole = {
          id,
          name: trimmedName,
          permissions: checkedKeys,
          active: true,
          createdBy: { userId, username },
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem("roles", JSON.stringify([...list, newRole]));
        message.success("Role created.");
      }

      navigate("/rolemanagement", { replace: true });
    } catch (e) {
      message.error("Failed to save role.");
    }
  };

  const handleCancel = () => navigate("/rolemanagement");

  return (
    <>
      <Layout>

      {/* No extra space above */}
      <div className="px-4 py-2 max-w-5xl mx-auto">
        {/* Title aligned hard-left */}
        <h1 className="text-lg font-semibold mb-2">
          {isEdit ? "Edit Role" : "Add Role"}
        </h1>

        {/* Role name row – left aligned, short width */}
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm font-medium text-gray-700 w-24">
            Role Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setName((v) => v.toUpperCase().trim())}
            placeholder="ADMIN, PMO, DM"
            style={{ width: 280 }}   // ✅ SHORT WIDTH
          />
        </div>

{/*         {isDuplicateName && ( */}
{/*           <div className="ml-24 mb-2 text-xs text-red-600"> */}
{/*             A role with this name already exists. */}
{/*           </div> */}
{/*         )} */}

        {/* Permissions toolbar */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-500">
            Select permissions
          </div>
          <Space size="small">
            <Button size="small" onClick={selectAll}>Select All</Button>
            <Button size="small" onClick={clearAll}>Clear</Button>
          </Space>
        </div>

        {/* Permission Tree */}
        <Tree
          checkable
          selectable={false}
          defaultExpandAll
          checkedKeys={checkedKeys}
          onCheck={onCheck}
          treeData={PERMISSIONS_TREE}
        />

        {/* Preview */}
        {checkedKeys.length > 0 && (
          <div className="mt-2">
            <Space size={[6, 6]} wrap>
              {checkedKeys.map((p) => (
                <Tag key={p} color="blue">{p}</Tag>
              ))}
            </Space>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex justify-end gap-2">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSave} disabled={!canSave}>
            {isEdit ? "Save Changes" : "Create Role"}
          </Button>
        </div>
      </div>
    </Layout>
        </>
  );
}