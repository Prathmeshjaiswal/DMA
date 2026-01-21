
import React, { useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Modal, Space, Switch, Table, Tag, Tree, message } from "antd";
// import { useNavigate } from "react-router-dom"; // if you need it elsewhere
// import 'antd/dist/reset.css'; // ensure this is in your app root once

/** -------------------- Permission Tree & Defaults -------------------- **/
const PERMISSIONS_TREE = [
  {
    title: "Demands",
    key: "demands",
    children: [
      { title: "Create", key: "demands:create" },
      { title: "View", key: "demands:view" },
      { title: "Update", key: "demands:update" },
    ],
  },
  {
    title: "Profile",
    key: "profile",
    children: [
      { title: "Add Profile", key: "profile:add" },
      { title: "View Profile", key: "profile:view" },
      { title: "Track Profile", key: "profile:track" },
      { title: "Assign Profile to Demand", key: "profile:assignToDemand" },
    ],
  },
];

const ALL_LEAF_KEYS = PERMISSIONS_TREE.flatMap((m) =>
  (m.children || []).map((c) => c.key)
);

const ROLE_DEFAULTS = {
  ADMIN: ALL_LEAF_KEYS,
  PMO: ["demands:view", "profile:view", "profile:track"],
  DM: [
    "demands:create",
    "demands:view",
    "demands:update",
    "profile:assignToDemand",
    "profile:view",
  ],
  "RDG/TA": ["profile:add", "profile:view", "profile:track"],
  RDG: ["profile:add", "profile:view", "profile:track"],
  HBU: ["demands:view", "profile:view"],
};

/** -------------------- Role Modal (Add / Edit) -------------------- **/
function RoleModal({
  open,
  mode, // 'add' | 'edit'
  initialRole, // { id?, name, permissions, active }
  existingNames = [], // for duplicate validation
  onCancel,
  onSave, // (payload) => void  payload: { name, permissions, active? }
}) {
  const [name, setName] = useState(initialRole?.name || "");
  const [checkedKeys, setCheckedKeys] = useState(initialRole?.permissions || []);
  const isEdit = mode === "edit";

  // When opening, preset name & permissions (also auto-fill permissions from defaults for new roles)
  useEffect(() => {
    const initialName = initialRole?.name || "";
    setName(initialName);
    if (isEdit) {
      setCheckedKeys(initialRole?.permissions || []);
    } else {
      const upper = initialName.toUpperCase();
      const preset = ROLE_DEFAULTS[upper] || [];
      setCheckedKeys(preset);
    }
  }, [open, initialRole, isEdit]);

  // When the name changes in Add mode, optionally prefill default permissions
  useEffect(() => {
    if (!isEdit && name) {
      const upper = name.toUpperCase();
      if (ROLE_DEFAULTS[upper]) setCheckedKeys(ROLE_DEFAULTS[upper]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const onCheck = (keysOrObj) => {
    const keys = Array.isArray(keysOrObj) ? keysOrObj : keysOrObj?.checked || [];
    setCheckedKeys(keys);
  };

  const selectAll = () => setCheckedKeys(ALL_LEAF_KEYS);
  const clearAll = () => setCheckedKeys([]);

  const dupName =
    name.trim().length > 0 &&
    existingNames
      .filter((n) => n !== (initialRole?.name || "")) // allow unchanged case on edit
      .map((n) => n.toUpperCase())
      .includes(name.trim().toUpperCase());

  const canSave = name.trim().length > 0 && !dupName;

  return (
    <Modal
      title={isEdit ? "Edit Role & Permissions" : "Add Role & Permissions"}
      open={open}
      onCancel={onCancel}
      onOk={() => onSave({ name: name.trim().toUpperCase(), permissions: checkedKeys })}
      okText={isEdit ? "Save Changes" : "Create Role"}
      cancelText="Cancel"
      width={660}
      destroyOnHidden
      okButtonProps={{ disabled: !canSave }}
    >
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., ADMIN, PMO, DM, RDG/TA, HBU"
          onBlur={() => setName((v) => v.trim().toUpperCase())}
        />
        {dupName && (
          <div className="mt-1 text-xs text-red-600">
            A role with this name already exists.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500">
          Select allowed permissions for this role.
        </div>
        <Space size="small">
          <Button size="small" onClick={selectAll}>Select All</Button>
          <Button size="small" onClick={clearAll}>Clear</Button>
        </Space>
      </div>

      <Tree
        checkable
        selectable={false}
        defaultExpandAll
        checkedKeys={checkedKeys}
        onCheck={onCheck}
        treeData={PERMISSIONS_TREE}
      />

      <div className="mt-3 text-xs text-gray-500">
        Tip: Use “Select All” for ADMIN-like roles; “Clear” for custom minimal roles.
      </div>
    </Modal>
  );
}

/** -------------------- Main Page -------------------- **/
export default function RoleManagement() {
  // const navigate = useNavigate(); // if you need route transitions later

  const [roles, setRoles] = useState(() => {
    try {
      const raw = localStorage.getItem("roles");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Persist roles to localStorage
  useEffect(() => {
    localStorage.setItem("roles", JSON.stringify(roles));
  }, [roles]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [editingRole, setEditingRole] = useState(null); // role object

  const existingNames = useMemo(() => roles.map((r) => r.name), [roles]);

  // Top-right "Add Role" button
  const openAddModal = () => {
    setEditingRole(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setModalMode("edit");
    setModalOpen(true);
  };

  // Activate / Deactivate
  const toggleActive = (roleId, nextActive) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, active: nextActive } : r))
    );
    message.success(`Role ${nextActive ? "activated" : "deactivated"}.`);
  };

  // Save from modal
  const handleSave = ({ name, permissions }) => {
    if (modalMode === "edit" && editingRole) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRole.id ? { ...r, name, permissions } : r
        )
      );
      message.success("Role updated.");
    } else {
      // Add new role
      const id = (crypto?.randomUUID && crypto.randomUUID()) || `r_${Date.now()}`;
      const active = true;
      setRoles((prev) => [...prev, { id, name, permissions, active }]);
      message.success("Role created.");
    }
    setModalOpen(false);
    setEditingRole(null);
  };

  // Table columns
  const columns = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Permissions",
      key: "permissions",
      render: (_, record) => (
        <Space size={[6, 6]} wrap>
          {record.permissions.slice(0, 6).map((p) => (
            <Tag key={p} color="blue">{p}</Tag>
          ))}
          {record.permissions.length > 6 && (
            <Tag>+{record.permissions.length - 6} more</Tag>
          )}
        </Space>
      ),
      responsive: ["lg"], // hide on small screens
    },
//     {
//       title: "Active",
//       dataIndex: "active",
//       key: "active",
//       width: 110,
//       render: (value, record) => (
//         <Switch
//           checked={value}
//           onChange={(checked) => toggleActive(record.id, checked)}
//           checkedChildren="Active"
//           unCheckedChildren="Inactive"
//         />
//       ),
//     },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          {record.active ? (
            <Button size="small" danger onClick={() => toggleActive(record.id, false)}>
              Deactivate
            </Button>
          ) : (
            <Button size="small" type="primary" onClick={() => toggleActive(record.id, true)}>
              Activate
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Role Management</h1>
        <Button type="primary" onClick={openAddModal}>
          Add Role
        </Button>
      </div>

      {/* Table or Empty state */}
      {roles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <Empty description="No roles yet">
            <Button type="primary" onClick={openAddModal}>Add Role</Button>
          </Empty>
        </div>
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={roles}
          pagination={false}
          className="bg-white rounded-lg"
        />
      )}

      {/* Add/Edit Modal */}
      <RoleModal
        open={modalOpen}
        mode={modalMode}
        initialRole={editingRole}
        existingNames={existingNames}
        onCancel={() => {
          setModalOpen(false);
          setEditingRole(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
``
