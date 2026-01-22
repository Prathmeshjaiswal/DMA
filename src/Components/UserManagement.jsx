import React, { useEffect, useState ,useMemo} from "react";
import { Button, Empty,  Modal, Space, Table, Tag, Switch, Tooltip,message } from "antd";
import { useNavigate } from "react-router-dom";
import Layout from "../Components/Layout"
// import { fetchUsers } from "./api/register";

import {
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  CheckOutlined,
} from "@ant-design/icons";


export default function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);



   // Optional: one-time migration if you previously stored empId/empName
  const migrateOldUsersIfAny = (list) => {
    return list.map((u) => {
      // If it's new shape already, return as is
      if (u.userId) return u;
      // Convert older shape to new
      return {
        userId: u.empId ?? `U_${Date.now()}`, // ensure some id
        empName: u.empName ?? "—",
        role: u.role ?? "—",
        emailId: u.empEmail ?? "",
        phoneNumber: u.empPhone ?? "",
        location: u.location ?? "",
        createdOn: u.createdOn ?? new Date().toISOString(),
        active: typeof u.active === "boolean" ? u.active : true,
        countryCode: u.countryCode ?? "+91",
      };
    });
  };



const readUsers = () => {
    const raw = JSON.parse(localStorage.getItem("users")) || [];
    const migrated = migrateOldUsersIfAny(raw);
    // Save back if migration changed shape
    localStorage.setItem("users", JSON.stringify(migrated));
    return migrated;
  };



 useEffect(() => {
    setLoading(true);
    try {
      const list = readUsers();
      setUsers(list);
    } catch (e) {
      message.error("Failed to load users from local storage");
    } finally {
      setLoading(false);
    }
  }, []);






  const saveUsers = (next) => {
    setUsers(next);
    localStorage.setItem("users", JSON.stringify(next));
  };


  const [viewUser, setViewUser] = useState(null);

   // Toggle status handler (UI only; wire to API if needed)

 // Toggle status (persists to localStorage)
  const handleStatusToggle = (record, checked) => {
    const next = users.map((u) =>
      u.userId === record.userId ? { ...u, active: checked } : u
    );
    saveUsers(next);
    message.success(`User ${checked ? "activated" : "deactivated"}`);
  };


  // Styled switch to resemble your blue toggle with a checkmark

const StatusSwitch = ({ value, onChange }) => (
    <Switch
      checked={value}
      onChange={onChange}
      checkedChildren={<CheckOutlined />}
      unCheckedChildren={null}
      style={{ backgroundColor: value ? "#1677ff" : "#e5e7eb" }}
    />
  );

  const columns = useMemo(
    () => [
      {
        title: "User Name",
        dataIndex: "empName",
        key: "empName",
        render: (name) => <span className="font-medium">{name}</span>,
      },

 {
        title: "Role Name",
        dataIndex: "role",
        key: "role",
        render: (role) => <span>{role}</span>,
      },

    //   {
    //     title: "Created By",
    //     dataIndex: "createdByName",
    //     key: "createdByName",
    //     render: (name, record) => (
    //       <div className="leading-tight">
    //         <div style={{ textTransform: "lowercase" }}>{name}</div>
    //         {record.createdById ? (
    //           <div style={{ color: "#7d7d7d", fontSize: 12 }}>({record.createdById})</div>
    //         ) : null}
    //       </div>
    //     ),
    //   },
      {
        title: "Created At",
        dataIndex: "createdOn",
        key: "createdOn",
        render: (d) => {
          if (!d || d === "—") return "—";
          const dt = new Date(d);
          if (isNaN(dt)) return "—";
          return dt.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
      {
        title: "Status",
        dataIndex: "active",
        key: "active",
        render: (v, record) => (
          <Space size="middle">
            <StatusSwitch
              value={v}
              onChange={(checked) => handleStatusToggle(record, checked)}
            />
            <Tag
              color={v ? "success" : "error"}
              style={{
                borderRadius: 6,
                background: v ? "#ecfdf5" : "#fff1f0",
                color: v ? "#16a34a" : "#d32f2f",
                border: "none",
              }}
            >
              {v ? "Active" : "Inactive"}
            </Tag>
          </Space>
        ),
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
                // TODO: navigate to edit page or open edit modal
                onClick={() => message.info("Edit coming soon")}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users]
  );





  return (
    <>
    <Layout>
    <div className="p-4">
          {/* PAGE HEADER */}
          <div
            className="mb-4 flex items-center justify-between"

          >
            <div >
             <h1 className="text-lg font-semibold">User Management</h1>
              {/* <div style={{ color: "#6b7280" }}>
                Create roles, manage their status, and view assigned permissions.
              </div> */}
            </div>

            {/* Right-aligned Add button like your design */}
            <div style={{ position: "absolute", right: 24 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/Register")}
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
                  <Button type="primary" onClick={() => navigate("/Register")}>
                    Add User
                  </Button>
                </Empty>
              </div>
            ) : (
              <Table
                rowKey="empId"
                columns={columns}
                dataSource={users}
                loading={loading}
                pagination={false}
                className="bg-white"
                style={{
                  borderRadius: 12,
                }}
              />
            )}
          </div>

          {/* VIEW MODAL */}
          <Modal
            open={!!viewUser}
            onCancel={() => setViewUser(null)}
            footer={null}
            title="User Details"
          >
            {viewUser && (
              <div className="space-y-1">
                <p>
                  <b>Employee ID:</b> {viewUser.empId}
                </p>
                <p>
                  <b>Name:</b> {viewUser.empName}
                </p>
                <p>
                  <b>Phone:</b> {viewUser.empPhone}
                </p>
                <p>
                  <b>Email:</b> {viewUser.empEmail}
                </p>
                <p>
                  <b>Role:</b> {viewUser.role}
                </p>
                <p>
                  <b>Status:</b> {viewUser.active ? "Active" : "Inactive"}
                </p>
              </div>
            )}
          </Modal>
        </div>
      </Layout>
</>
  );
}