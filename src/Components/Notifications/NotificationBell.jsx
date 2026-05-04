import React from "react";
import { BellFilled } from "@ant-design/icons";
import "./notificationBell.css";

export default function NotificationBell({ count = 0, onClick }) {

  return (
    <div
      className="relative cursor-pointer select-none"
      onClick={onClick}
    >

      {/* Bell Icon */}
      <BellFilled
        className={`text-[24px] ${count > 0 ? "bell-ring" : ""}`}
        style={{ color: "#F5B301" }}
      />


      {/* Notification Badge */}
      {count > 0 && (
        <span
          className="
            absolute 
            -top-1 
            -right-1 
            min-w-[16px] 
            h-[16px] 
            px-[4px]
            bg-red-600 
            text-white 
            text-[10px] 
            rounded-full 
            flex 
            items-center 
            justify-center 
            font-semibold
            leading-none
            shadow
          "
        >
          {count}
        </span>
      )}
    </div>
  );
}