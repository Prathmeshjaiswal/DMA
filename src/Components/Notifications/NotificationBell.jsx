import React from "react";
import { BellFilled } from "@ant-design/icons";

export default function NotificationBell({ count = 0, onClick }) {
  return (
    <div
      className="relative cursor-pointer select-none"
      onClick={onClick}
    >
      {/*  Bell icon */}
      <BellFilled
        className="text-[24px]"
        style={{ color: "#F5B301" } } // ✅ premium yellow
      />

      {/*  Notification Badge */}
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
