
import React, { useEffect, useState, useRef } from "react";
import { Drawer, Tabs } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markNotificationRead
} from "../api/notification/notification";

export default function NotificationDrawer({ open, onClose }) {
  const [inbox, setInbox] = useState([]);
  const [archive, setArchive] = useState([]);
  const pollRef = useRef(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();

      const unread = (data || []).filter(n => !n.isRead);
      const read = (data || []).filter(n => n.isRead);

      setInbox(unread);
      setArchive(read);
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  useEffect(() => {
    if (open) {
      loadNotifications();
      pollRef.current = setInterval(loadNotifications, 30000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open]);

  const navigateFromNotification = (n) => {
    switch (n.module) {
      case "PROFILE_TRACKER":
        navigate(`/ProfileTracker?id=${n.referenceId}`);
        break;

      case "DEMAND":
        navigate(`/demandsheet1?id=${n.referenceId}`);
        break;

      case "PROFILE":
        navigate(`/profileSheet?id=${n.referenceId}`);
        break;

      default:
        navigate("/DashBoard");
    }
    onClose();
  };

  const handleClick = async (n) => {
    try {
      if (!n.isRead) {
        await markNotificationRead(n.id);

        // ✅ Move inbox → archive immediately
        setInbox(prev => prev.filter(i => i.id !== n.id));
        setArchive(prev => [{ ...n, isRead: true }, ...prev]);
      }

      navigateFromNotification(n);
    } catch (e) {
      console.error("Notification click failed", e);
    }
  };

  const renderList = (list) =>
    list.length === 0 ? (
      <div className="p-4 text-gray-400 text-sm text-center">
        No notifications
      </div>
    ) : (
      list.map(n => (
        <div
          key={n.id}
          onClick={() => handleClick(n)}
          className={`flex gap-3 px-4 py-3 cursor-pointer ${n.isRead ? "bg-white" : "bg-gray-100"
            } hover:bg-gray-200`}
        >
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <BellOutlined />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{n.title}</div>
            <div className="text-xs text-gray-500">{n.message}</div>
          </div>
        </div>
      ))
    );

  return (
    <Drawer
      title="NOTIFICATIONS"
      placement="right"
      width={360}
      open={open}
      onClose={onClose}
      bodyStyle={{ padding: 0 }}
    >


      <Tabs
        defaultActiveKey="inbox"
        items={[
          {
            key: "inbox",
            label: (
              <span className="font-semibold text-[15px] ml-2">
                Inbox ({inbox.length})
              </span>
            ),
            children: (
              <div className="px-2">
                {renderList(inbox)}
              </div>
            )
          },
          {
            key: "all",
            label: (
              <span className="font-semibold text-[15px] ml-2">
                All
              </span>
            ),
            children: (
              <div className="px-2">
                {renderList([...inbox, ...archive])}
              </div>
            )
          }
        ]}
      />

    </Drawer>
  );
}
