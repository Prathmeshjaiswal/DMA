import React, { useEffect, useMemo, useState } from "react";
import { Button, Empty, Space, Switch, Table, Tag, Tooltip, Modal, message, Spin } from "antd";
import { EditOutlined, EyeOutlined, CheckOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout.jsx";
import { getroles, getpermissions } from "../api/RoleManagement.js";


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
      childNameById.set(cid, c.childModule);

      const acts = asArray(c.actions).map((a) => ({
        id: a.id,
        action: a.action,
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
            const childIds =
//             Array.from(
//               new Set(
                asArray(m.childModules).map((cid) =>
                  String(cid.id)
//                 )
//               )
            );

            const modName =
              m.moduleName || `Module ${modId}`;

            return (
              <div
                key={`${modId}-${idx}`}
                className="border rounded"
                style={{ padding: 12 }}
              >
                <div className="font-medium" style={{ marginBottom: 8 }}>
                  {modName}
                </div>

                {childIds.length === 0 ? (
                  <Tag>None</Tag>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {childIds.map((cid, i) => {
                      const cName =
                        lookups?.childNameById?.get(cid) || `Child ${cid}`;
                      const acts = lookups?.actionsByChildId?.get(cid) || [];

                      return (
                        <div key={`${modId}-${cid}-${i}`} style={{ paddingLeft: 8 }}>
                          <div className="text-gray-800" style={{ marginBottom: 4 }}>
                            • {cName}
                          </div>
                          {acts.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                                paddingLeft: 16,
                              }}
                            >
                              {acts.map((a) => (
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

  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getroles();
      const list = asArray(res?.data ?? res);
      setRoles(list);
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

  // Local toggle only (demo). Replace with real API when available.
  const toggleActive = (record) => {
    const nextActive = !record.active;
    setRoles((prev) =>
      prev.map((r) =>
        r === record || r.id === record.id ? { ...r, active: nextActive } : r
      )
    );
    message.success(`Role ${nextActive ? "activated" : "deactivated"} (local).`);
  };

  // Render "By" fields that might be a string or an object
  const renderByField = (value, fallbackLabel) => {
    if (!value) {
      return (
        <div className="leading-5">
          <div className="font-medium text-gray-800 truncate">{fallbackLabel}</div>
          <div className="text-xs text-gray-500 truncate">(unknown)</div>
        </div>
      );
    }
    if (typeof value === "string") {
      return (
        <div className="leading-5">
          <div className="font-medium text-gray-800 truncate">{value}</div>
          <div className="text-xs text-gray-500 truncate">({value})</div>
        </div>
      );
    }
    const username = value.username || value.name || "Unknown User";
    const userId = value.userId || value.id || "unknown";
    return (
      <div className="leading-5">
        <div className="font-medium text-gray-800 truncate">{username}</div>
        <div className="text-xs text-gray-500 truncate">({userId})</div>
      </div>
    );
  };

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
      render: (_, record) => renderByField(record.createdBy, "Unknown"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (value) => (
        <span className="text-gray-700">{formatDateTime(value)}</span>
      ),
      sorter: (a, b) =>
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Updated By",
      key: "updatedBy",
      width: 180,
      render: (_, record) => renderByField(record.updatedBy, "Unknown"),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (value) => (
        <span className="text-gray-700">{formatDateTime(value)}</span>
      ),
      sorter: (a, b) =>
        new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime(),
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
