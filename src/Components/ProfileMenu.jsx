// ProfileMenu.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { usePermissions } from "./Auth/PermissionProvider";

/** ProfileMenu: Dropdown menu with user-specific links gated by permissions. */
export default function ProfileMenu({ onProfile, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const { hasChild } = usePermissions();

  // Display name and id from localStorage
  const [displayName, setDisplayName] = useState("User");
  const [displayId, setDisplayId] = useState("");

  /** Close dropdown when clicking outside. */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
   setDisplayName(localStorage.getItem("username"));
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  /** go: Navigate to selected page and close menu. */
  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="relative flex items-center" ref={menuRef}>
      {/* Icon + below welcome label */}
      <div className="flex flex-col items-center">
        {/* Profile icon */}
        <div
          onClick={() => setOpen((v) => !v)}
          className="w-10 h-10 rounded-full bg-[#F15B40] text-white flex items-center justify-center cursor-pointer font-bold"
          aria-label="Profile menu"
          title={`${displayName}${displayId ? ` (${displayId})` : ""}`}
        >
          <UserOutlined className="text-white text-lg" />
        </div>

        {/* Welcome label BELOW the icon (outside the dropdown) */}

      </div>

      {/* Dropdown toggle arrow */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="ml-2 text-white text-xs"
        aria-label="Toggle profile menu"
      >
        ▼
      </button>

      {/* Dropdown menu (unchanged, no welcome inside) */}
      {open && (
        <div className="absolute right-0 top-12 w-56 bg-white border rounded shadow z-50 text-sm py-1">
          {/* Permission: User Management → Users Sheet */}
          {hasChild("User Management", "Users Sheet") && (
            <button
              onClick={() => go("/UserManagement")}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-black font-medium"
            >
              User Management
            </button>
          )}

          {/* Permission: Role Management → Roles Sheet */}
          {hasChild("Role Management", "Roles Sheet") && (
            <button
              onClick={() => go("/rolemanagement")}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-black font-medium"
            >
              Roles Management
            </button>
          )}

          {/* Logout */}
          <button
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            className="w-full px-4 py-2 text-left text-black hover:bg-red-50 font-medium"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}