import React from "react";
import { Drawer } from "antd";
import { BellOutlined } from "@ant-design/icons";

const dummyNotifications = [
  {
    id: 1,
    title: "Xcelerate",
    desc: "Click here to update your skills and certifications on Xcelerate. Please ignore if already updated.",
  },
  {
    id: 2,
    title: "Tax Regime",
    desc: "Click here to act now!",
  },
  {
    id: 3,
    title: "Personalized Compensation",
    desc: "Personalized compensation structure workflow is now open.",
  },
  {
    id: 4,
    title: "Online Nominations",
    desc: "Click here to declare your nominee for statutory benefits.",
  },
  {
    id: 5,
    title: "Employee Welfare Trust",
    desc: "Click here to take action.",
  },
];

export default function NotificationDrawer({ open, onClose }) {
  return (
    <Drawer
      title="NOTIFICATIONS"
      placement="right"
      width={360}
      onClose={onClose}
      open={open}
      bodyStyle={{ padding: 0 }}
    >
      <div className="divide-y">
        {dummyNotifications.map((n) => (
          <div
            key={n.id}
            className="flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <BellOutlined className="text-gray-600" />
            </div>

            <div className="flex-1">
              <div className="font-semibold text-sm">{n.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {n.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
