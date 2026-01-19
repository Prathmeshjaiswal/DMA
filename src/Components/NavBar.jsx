import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sliderbar";
import logo from "../assets/cfg3.png";
import { useAuth } from "./AuthProvider";

export default function NavBar() {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);


  const handleLogout = () => {
    localStorage.removeItem("roles");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    setIsAuthenticated(false);
    navigate("/Login");

  }

  const links = [
    { label: "Demands", to: "/DashBoard" },
    { label: "Track", to: "/ProfileTracker" },
    { label: "RDG", to: "/RDGTeam" },
    { label: "TA", to: "/TATeam" },
    { label: "Reports", to: "/Report" },
  ];

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 bg-[#082340] text-white border-b border-white/10 shadow-md">
        <div className="flex items-center px-3 py-3 gap-3">
          <img
            src={logo}
            alt="LOGO"
            className="h-10 w-auto cursor-pointer"
            onClick={() => navigate("/DashBoard")}
          />

          {/* Demand ONLY when authenticated */}
          {isAuthenticated && (
            <button
              onClick={() => setIsOpen(true)}
              className="px-3 py-1 rounded bg-[#F15B40] text-white hover:brightness-110"
            >
              Demand
            </button>
          )}

          <header className="flex-1 text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              HSBC Demand Management System
            </h1>
          </header>

          {/* Logout ONLY when authenticated */}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="font-bold text-xl hover:brightness-110"
            >
              Logout
            </button>

          )}
        </div>
      </div>

      <div className="h-11" />

      {/* Sidebar ONLY when authenticated */}
      {isAuthenticated && (
        <Sidebar
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          links={links}
        />
      )}
    </>
  );
}