
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sliderbar";
import logo from "../assets/cfg3.png";

export default function NavBar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { label: "Demands", to: "/DashBoard" },
    { label: "Track", to: "/ProfileTracker" },
    // {label: "Notification", to :"/dummy "},
    { label: "Reports", to: "/Report" },
    {label: "dummy", to :"/dummy "},
    {label: "dummy1", to :"/dummy "},
    {label: "dummy3", to :"/dummy "}
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

          <button
            onClick={() => setIsOpen(true)}
            className="px-3 py-1 rounded bg-[#F15B40] text-white hover:brightness-110"
          >
            Demand
          </button>
        </div>
      </div>

      <div className="h-14" />
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        links={links}
           />
    </>
  );
}