
import React, { useEffect, useState } from "react";
import { Button, Empty,  Modal, Space, Table, Tag, message } from "antd";
import { useNavigate } from "react-router-dom";
import Layout from "../Components/Layout"

export default function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState(() => {
    try {
      const raw = localStorage.getItem("users");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Save to storage
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const [viewUser, setViewUser] = useState(null);

  // Columns setup
  const columns = [
    {
      title: "Employee Name",
      dataIndex: "empName",
      key: "empName",
      render: (t) => <span className="font-medium">{t}</span>,
    },
    {
      title: "Role Name",
      dataIndex: "role",
      key: "role",
      render: (r) => <Tag color="blue">{r}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (v) =>
        v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: "View",
      key: "view",
      render: (_, record) => (
        <Button size="small" onClick={() => setViewUser(record)}>
          View
        </Button>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Button size="small" disabled>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <>
    <Layout>
    <div className="p-4">

      {/* PAGE HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">User Management</h1>

        <Button type="primary" onClick={() => navigate("/Register")}>
          Add User
        </Button>
      </div>

      {/* EMPTY STATE */}
      {users.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
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
          pagination={false}
          className="bg-white rounded-lg"
        />
      )}

      {/* VIEW MODAL */}
      <Modal
        open={!!viewUser}
        onCancel={() => setViewUser(null)}
        footer={null}
        title="User Details"
      >
        {viewUser && (
          <div className="space-y-1">
            <p><b>Employee ID:</b> {viewUser.empId}</p>
            <p><b>Name:</b> {viewUser.empName}</p>
            <p><b>Phone:</b> {viewUser.empPhone}</p>
            <p><b>Email:</b> {viewUser.empEmail}</p>
            <p><b>Role:</b> {viewUser.role}</p>
            <p><b>Status:</b> {viewUser.active ? "Active" : "Inactive"}</p>
          </div>
        )}
      </Modal>
    </div>
    </Layout>
    </>
  );
}
