// NavBar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/cfg3.png";
import { useAuth } from "./Auth/AuthProvider";
import ProfileMenu from "./ProfileMenu";
import ProfileModel from "./ProfileModel";
import Logout from "../Components/Auth/Logout";

export default function NavBar({
  sidebarOpen,          // controlled by Layout
  onToggleSidebar,      // controlled by Layout
  onCloseSidebar,       // optional, if you want to close from NavBar
  showProfile,          // controlled by parent (Layout)
  setShowProfile,       // controlled by parent (Layout)
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const handleLogout = Logout();

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 bg-[#082340] text-white border-b border-white/10 shadow-md">
        <div className="flex items-center px-3 py-3 gap-3">
          {/* Hamburger (only when authenticated) */}
          {isAuthenticated ? (
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle Sidebar"
              className="inline-flex flex-col items-center justify-center w-10 h-10 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
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

          {/* Profile menu (only when authenticated) */}
          {isAuthenticated ? (
            <ProfileMenu
              onLogout={handleLogout}
              onProfile={() => setShowProfile?.(true)}
            />
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>
      </div>
      {/* navbar spacer */}
      <div className="h-14" />

      {/* Profile modal */}
      <ProfileModel
        isOpen={!!showProfile}
        onClose={() => setShowProfile?.(false)}
      />
    </>
  );
}