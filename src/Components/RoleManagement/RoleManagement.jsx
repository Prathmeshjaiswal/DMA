// src/Components/RoleManagement/RoleManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Empty,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Modal,
  message,
  Spin,
  Input,
  Select,
} from "antd";
import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout.jsx";
import { getroles, getpermissions, updateRoleStatus } from "../api/RoleManagement.js";
import { usePermissions } from "../Auth/PermissionProvider";

/** formatDateTime: Convert an ISO string/date-like value to a readable local datetime. */
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

/** asArray: Safely normalize any input into an array. */
const asArray = (x) =>
  Array.isArray(x) ? x : x && typeof x === "object" ? Object.values(x) : [];

/** buildPermissionLookups: Create quick maps (moduleName, childName, actions by child) for display. */
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

/** ViewPermissionsModal: Modal to display a role’s module → child → action permissions. */
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
            const modId = String(m.moduleId);
            const children = asArray(m.childModules || m.childModule || []);
            const modName =
              lookups?.moduleNameById?.get(modId) || `Module ${modId}`;

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
                      const cName =
                        lookups?.childNameById?.get(cid) || `Child ${cid}`;
                      const availableActs =
                        lookups?.actionsByChildId?.get(cid) || [];

                      const selectedIds = Array.isArray(child.actionIds)
                        ? child.actionIds.map((x) => String(x))
                        : null;

                      const actsToShow = selectedIds
                        ? availableActs.filter((a) =>
                            selectedIds.includes(String(a.id))
                          )
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

/** RoleManagement: List roles with filters, view/edit, and activate/deactivate (permission-aware). */
export default function RoleManagement() {
  const navigate = useNavigate();

  /** Permission checks (computed at render): control visibility of actions/buttons. */
  const { can } = usePermissions();
  const canCreateRole = can("Role Management", "Roles Sheet", "Create Role");
  const canEditRole = can("Role Management", "Roles Sheet", "Edit Role");
  const canToggleRole = can(
    "Role Management",
    "Roles Sheet",
    "Activate/Deactivate Role"
  );

  /** Roles + UI state: loading, errors, modal state. */
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPerm, setLoadingPerm] = useState(false);
  const [error, setError] = useState("");

  const [viewOpen, setViewOpen] = useState(false);
  const [viewRole, setViewRole] = useState(null);

  /** Local filters: search by role name and active/inactive status. */
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'

  /** Lookups for nicer display in the modal (module/child/action names). */
  const [lookups, setLookups] = useState({
    moduleNameById: new Map(),
    childNameById: new Map(),
    actionsByChildId: new Map(),
  });

  /** Client-side sorting state. */
  const [sorterInfo, setSorterInfo] = useState({ field: null, order: null });

  /** fetchRoles: Load all roles from API and normalize 'active' boolean. */
  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getroles();
      const list = asArray(res?.data ?? res);

      const mapped = list.map((role) => {
        const active =
          typeof role.active === "boolean"
            ? role.active
            : typeof role.isActive === "boolean"
            ? role.isActive
            : typeof role.isactive === "boolean"
            ? role.isactive
            : typeof role.is_active === "boolean"
            ? role.is_active
            : typeof role.enabled === "boolean"
            ? role.enabled
            : role.active === 1 ||
              role.isActive === 1 ||
              role.isactive === 1 ||
              role.is_active === 1 ||
              role.enabled === 1;

        return { ...role, active };
      });

      setRoles(mapped);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load roles.";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /** fetchPermissions: Load permission master to build label lookups for modal. */
  const fetchPermissions = async () => {
    setLoadingPerm(true);
    try {
      const res = await getpermissions();
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

  /** useEffect: Load roles and master permission lookups on mount. */
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  /** openViewModal: Open permissions modal for a selected role. */
  const openViewModal = (role) => {
    setViewRole(role);
    setViewOpen(true);
  };

  /** openEditPage: Navigate to role edit page with role in state. */
  const openEditPage = (role) => {
    const rid = role?.id ?? role?.roleId ?? role?._id;
    if (!rid) {
      message.error("Role identifier missing.");
      return;
    }
    navigate(`/roleeditor/${rid}`, { state: { role } });
  };

  /** openAddPage: Navigate to role creation page. */
  const openAddPage = () => {
    navigate(`/roleeditor`);
  };

  /** toggleActive: Optimistically toggle role status, call backend, rollback on error. */
  const toggleActive = async (record) => {
    const nextActive = !record.active;
    const roleId = record.id ?? record.roleId ?? record._id;

    if (!roleId) {
      message.error("Role id not found");
      return;
    }

    const prevRoles = roles;
    setRoles((prev) =>
      prev.map((r) => (r.id === record.id ? { ...r, active: nextActive } : r))
    );

    try {
      await updateRoleStatus(roleId, nextActive);
      message.success(`Role ${nextActive ? "activated" : "deactivated"}`);
    } catch (e) {
      const serverMsg =
        e?.response?.data?.message ??
        e?.response?.data?.detail ??
        (e?.response?.data ? JSON.stringify(e.response.data) : undefined) ??
        e?.message ??
        "Failed to update role status";
      message.error(serverMsg);
      setRoles(prevRoles); // rollback
    }
  };

  /** extractNameId: Read a plausible display name and id from diverse backend shapes. */
  const extractNameId = (userLike) => {
    if (!userLike) return { name: null, id: null };
    if (typeof userLike === "string") {
      const s = userLike.trim();
      const parts = s.split(/[\s-]+/).filter(Boolean);
      if (parts.length >= 2) {
        const idPart = parts.find((p) => /^\d+$/.test(p)) || null;
        const namePart = parts.find((p) => !/^\d+$/.test(p)) || null;
        return { name: namePart || null, id: idPart || null };
      }
      if (/^\d+$/.test(s)) return { name: null, id: s };
      return { name: s, id: null };
    }
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

  /** renderUserCell: Nicely render “Created/Updated by” cells from flexible shapes. */
  const renderUserCell = (value, fallbackLabel = "-") => {
    const { name, id } = extractNameId(value);
    if (!name && !id) return <span>-</span>;
    return (
      <div className="leading-5">
        <div className="font-medium text-gray-800 truncate">
          {name || fallbackLabel}
        </div>
        <div className="text-xs text-gray-500 truncate">({id ?? "-"})</div>
      </div>
    );
  };

  /** columns: Table columns with permission-aware actions. */
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
      render: (_, record) => renderUserCell(record.createdBy, "Unknown"),
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
      render: (_, record) => renderUserCell(record.updatedBy, "Unknown"),
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
      width: 160,
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

          {canEditRole && (
            <Tooltip title="Edit role & permissions">
              <Button
                size="small"
                type="text"
                icon={<EditOutlined />}
                onClick={() => openEditPage(record)}
              />
            </Tooltip>
          )}

          {canToggleRole && (
            <Switch
              size="small"
              checked={!!record.active}
              onChange={() => toggleActive(record)}
            />
          )}
        </Space>
      ),
      fixed: "right",
    },
  ];

  /** handleTableChange: Track current sorter to reapply client-side sorting. */
  const handleTableChange = (_pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    setSorterInfo({
      field: s?.field ?? s?.columnKey ?? null,
      order: s?.order ?? null,
    });
  };

  /** filteredRoles: Apply search text and status filter. */
  const filteredRoles = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return roles.filter((r) => {
      const isActive = !!r.active;
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "inactive" && isActive) return false;

      if (!q) return true;
      const name = String(r.role || r.name || "").toLowerCase();
      return name.includes(q);
    });
  }, [roles, searchText, statusFilter]);

  /** sortedRoles: Sort roles with actives first, then apply current column sorter. */
  const sortedRoles = useMemo(() => {
    const all = [...filteredRoles];
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
        cmp = String(av).localeCompare(String(bv), undefined, {
          numeric: true,
        });
      }
      return order === "ascend" ? cmp : -cmp;
    };

    const { field, order } = sorterInfo || {};
    const actives = all.filter((r) => !!r.active);
    const inactives = all.filter((r) => !r.active);

    actives.sort((a, b) => cmpByField(a, b, field, order));
    inactives.sort((a, b) => cmpByField(a, b, field, order));

    return [...actives, ...inactives];
  }, [filteredRoles, sorterInfo]);

  /** Render: Page layout, filters, table, and permissions modal. */
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

            <Space wrap size="middle">
              <Input
                allowClear
                placeholder="Filter by role name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 220 }}
              />

              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 160 }}
                options={[
                  { label: "All status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
              />
            </Space>

            <div>
              {canCreateRole && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openAddPage}
                >
                  Add Role
                </Button>
              )}
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
                {canCreateRole && (
                  <Button type="primary" onClick={openAddPage}>
                    + Add Role
                  </Button>
                )}
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
                  showTotal: (total) => `${total} role${total === 1 ? "" : "s"}`,
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