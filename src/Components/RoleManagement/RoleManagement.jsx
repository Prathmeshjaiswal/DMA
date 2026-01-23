
import React, { useEffect, useMemo, useState } from "react";
import {Button,Empty,Space,Switch,Table,Tag,Tooltip,Modal,message,} from "antd";
import {EditOutlined,EyeOutlined,CheckOutlined,CloseOutlined,} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout.jsx";
 import Footer from "../Footer.jsx";
import { PERMISSIONS_TREE, ALL_LEAF_KEYS } from "./permissions.js";


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

function ViewPermissionsModal({ open, role, onClose }) {
  if (!role) return null;
  return (
    <Modal
      title={`Permissions for ${role.name}`}
      open={open}
      onCancel={onClose}
      onOk={onClose}
      okText="Close"
      cancelButtonProps={{ style: { display: "none" } }}
      width={600}
    >
{/*       <div className="mb-3 text-sm text-gray-600"> */}
{/*         Below are the permissions assigned to this role. */}
{/*       </div> */}
          <ul className="pl-5 mt-2 list-disc">
            {role.permissions && role.permissions.length > 0 ? (
              role.permissions.map((p) => (
                <li key={p} className="mb-1">
                  <Tag color="blue">{p}</Tag>
                </li>
              ))
            ) : (
              <li>
                <Tag>No permissions</Tag>
              </li>
            )}
          </ul>

    </Modal>
  );
}

export default function RoleManagement() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState(() => {
    try {
      const raw = localStorage.getItem("role");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // One-time migration: ensure createdBy / createdAt exist
//   useEffect(() => {
//     try {
//       const fixed = roles.map((r) => ({
//         ...r,
//         createdBy: r.createdBy || {
//           userId: "unknown",
//           username: "Unknown User",
//         },
//         createdAt: r.createdAt || new Date().toISOString(),
//       }));
//       const changed = JSON.stringify(fixed) !== JSON.stringify(roles);
//       if (changed) setRoles(fixed);
//     } catch {}
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

  // Persist roles to localStorage
  // useEffect(() => {
  //   localStorage.setItem("roles", JSON.stringify(roles));
  // }, [roles]);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewRole, setViewRole] = useState(null);

//   const existingNames = useMemo(() => roles.map((r) => r.name), [roles]);

  const openViewModal = (role) => {
    setViewRole(role);
    setViewOpen(true);
  };

  const openEditPage = (role) => {
    navigate(`/roleeditor/${role.id}`, { state: { role } });
  };

  const openAddPage = () => {
    navigate(`/roleeditor`);
  };

  const toggleActive = (roleId, nextActive) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, active: nextActive } : r))
    );
    message.success(`Role ${nextActive ? "activated" : "deactivated"}.`);
  };

  const columns = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Created By",
      key: "createdBy",
      render: (_, record) => {
        const by = record.createdBy || {};
        return (
          <div className="leading-5">
            <div className="font-medium text-gray-800">
              {by.username || "Unknown User"}
            </div>
            <div className="text-xs text-gray-500">
              ({by.userId || "unknown"})
            </div>
          </div>
        );
      },
    },

    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => (
        <span className="text-gray-700">{formatDateTime(value)}</span>
      ),
//       sorter: (a, b) => {
//         const da = new Date(a.createdAt || 0).getTime();
//         const db = new Date(b.createdAt || 0).getTime();
//         return da - db;
//       },
//       defaultSortOrder: "descend",
    },

    // Status column (Switch + tag)
    {
      title: "Status",
      dataIndex: "active",
      key: "status",
      width: 160,
      render: (value, record) => (
        <Space>
          <Switch
            checked={value}
            onChange={(checked) => toggleActive(record.id, checked)}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
          />
          <Tag color={value ? "green" : "red"}>
            {value ? "Active" : "Inactive"}
          </Tag>
        </Space>
      ),
    },

    // Actions with icons: View + Edit
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space>
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
        </Space>
      ),
    },
  ];

  return (
    <>
      <Layout>
      <div className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Role Management
            </h1>
            <p className="text-sm text-gray-500">
              Create roles, manage their status, and view assigned permissions.
            </p>
          </div>
          <Button type="primary" onClick={openAddPage}>
            Add Role
          </Button>
        </div>

        {/* Table or Empty state */}
        <div className="max-w-6xl mx-auto">
          {roles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
              <Empty description="No roles yet">
                <Button type="primary" onClick={openAddPage}>
                  Add Role
                </Button>
              </Empty>
            </div>
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={roles}
              pagination={true}
              className="bg-white rounded-lg"
            />
          )}
        </div>

        {/* View Permissions Modal */}
        <ViewPermissionsModal
          open={viewOpen}
          role={viewRole}
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