// NavBar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/cfg3.png";
import { useAuth } from "./Auth/AuthProvider";
import ProfileMenu from "./ProfileMenu";
import ProfileModel from "./ProfileModel";
import Logout from "../Components/Auth/Logout";
import { usePermissions } from "./Auth/PermissionProvider";

/** NavBar: Top bar with sidebar toggle, logo, title, and profile menu; builds permission-gated links (not rendered here). */
export default function NavBar({
  sidebarOpen,        // controlled by Layout
  onToggleSidebar,    // controlled by Layout
  onCloseSidebar,     // optional, if you want to close from NavBar
  showProfile,        // controlled by parent (Layout)
  setShowProfile,     // controlled by parent (Layout)
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const handleLogout = Logout();

  const { hasChild } = usePermissions();

  const showDashboardShortcuts = hasChild("DashBoard", "DashBoard");
  const showReports = hasChild("DashBoard", "Reports");

  const links = [
    showDashboardShortcuts ? { label: "Demands", to: "/demandsheet1" } : null,
    showReports ? { label: "Reports", to: "/Report" } : null,
    hasChild("DashBoard", "Reports") ? { label: "Reports", to: "/Report" } : null,
    hasChild("User Management", "Users Sheet")
      ? { label: "Users", to: "/UserManagement" }
      : null,
    showDashboardShortcuts ? { label: "Track", to: "/ProfileTracker" } : null,
    showDashboardShortcuts ? { label: "RDG", to: "/RDGTeam" } : null,
    showDashboardShortcuts ? { label: "TA", to: "/TATeam" } : null,
  ].filter(Boolean);

  // ====== NEW: Welcome text state (shown in NavBar below the Profile icon) ======
  const [displayName, setDisplayName] = useState("User");
  const [displayId, setDisplayId] = useState("");

  useEffect(() => {
    let name = "";
    let uid = "";

    try {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        const u = JSON.parse(userJson);
        name = u?.name ?? u?.username ?? u?.userName ?? name;
        uid = u?.userId ?? u?.empId ?? u?.id ?? uid;
      }
    } catch {
      // ignore parse errors and fall back to flat keys
    }

    if (!name) {
      name =
        localStorage.getItem("userName") ??
        localStorage.getItem("username") ??
        localStorage.getItem("name") ??
        "";
    }
    if (!uid) {
      uid =
        localStorage.getItem("userId") ??
        localStorage.getItem("empId") ??
        localStorage.getItem("id") ??
        "";
    }

    name = String(name || "").trim();
    uid = String(uid || "").trim();

    setDisplayName(name || "User");
    setDisplayId(uid);
  }, []);
  // ====== /NEW ======

  return (
    <div className="mb-10">
      <div className="fixed inset-x-0 top-0 z-40 bg-[#082340] text-white border-b border-white/10 shadow-md">
        <div className="flex items-start px-3 py-2 gap-3">
          {/* Hamburger (only when authenticated) */}
          {isAuthenticated ? (
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle Sidebar"
              className="inline-flex flex-col items-center justify-center w-10 h-10 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 mt-0.5"
            >
              <span className=" w-6 h-0.5 bg-white "></span>
              <span className=" w-6 h-0.5 bg-white mt-1"></span>
              <span className=" w-6 h-0.5 bg-white mt-1"></span>
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}

          {/* Logo */}
          <img
            src={logo}
            alt="LOGO"
            className="h-10 w-auto cursor-pointer"
            onClick={() => {
              if (isAuthenticated) navigate("/DashBoard");
              else navigate("/Login");
            }}
          />

          {/* Title */}
          <header className="flex-1 text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              HSBC Demand Management System
            </h1>
          </header>

          {/* Profile area (ProfileMenu + Welcome text BELOW it) */}
          {isAuthenticated ? (
            <div className="flex flex-col items-end">
              {/* Keep your existing ProfileMenu (icon + dropdown) */}
              <ProfileMenu
                onLogout={handleLogout}
                onProfile={() => setShowProfile?.(true)}
              />

              {/* Welcome text BELOW the profile icon (FULL text, wraps, no max-width) */}
                  <div
                    className="rounded text-xs text-green-300 shadow-sm  whitespace-normal break-words"
                    title={`${displayName}${displayId ? ` (${displayId})` : ""}`}
                  >
{/*                     <span role="img" aria-label="wave">👋</span> Welcome,&nbsp; */}
                    <span className="font-medium">{displayName}</span>
                    {displayId ? <span className="text-green"> ({displayId})</span> : null}
                  </div>
            </div>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>
      </div>

      {/* navbar spacer */}
      <div className="h-2" />

      {/* Profile modal/drawer (unchanged) */}
      <ProfileModel
        isOpen={!!showProfile}
        onClose={() => setShowProfile?.(false)}
      />
    </div>
  );
}