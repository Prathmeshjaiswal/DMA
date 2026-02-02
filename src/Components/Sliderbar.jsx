// Sidebar.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CloseOutlined } from "@ant-design/icons"; // 👈 ADD THIS

export default function Sliderbar({
  isOpen,
  onClose,
  width = 256,
}) {
  const navigate = useNavigate();

  const COLORS = {
    navy: "#082340",
    navyTint: "#0D3559",
    orange: "#F15B40",
    white: "#FFFFFF",
    white10: "rgba(255,255,255,0.10)",
  };

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const MENU = [
    { label: "Demands", onClick: () => navigate("/demandsheet1") },
    { label: "Track", onClick: () => navigate("/ProfileTracker") },
    { label: "RDG/TA", onClick: () => navigate("/RDGTATeam") },
    { label: "HBU", onClick: () => navigate("/HBU") },
    { label: "Reports", onClick: () => navigate("/Report") },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-full
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col
      `}
      style={{
        width,
        backgroundColor: COLORS.navy,
        color: COLORS.white,
        boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
      }}
      aria-label="Sidebar Navigation"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: `1px solid ${COLORS.white10}` }}
      >
        <h2 className="text-lg font-semibold">Dashboard</h2>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close Sidebar"
            className="inline-flex items-center justify-center rounded-md"
            style={{
              backgroundColor: COLORS.orange,
              color: COLORS.white,
              padding: "6px 10px",
            }}
          >
            <CloseOutlined style={{ fontSize: 16 }} />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav
        className="px-3 py-3 flex-1 overflow-y-auto overscroll-y-contain space-y-2"
        style={{ scrollbarGutter: "stable both-edges" }}
      >
        {MENU.map((item) => (
          <button
            key={`menu-${item.label}`}
            onClick={item.onClick}
            className="w-full rounded px-3 py-2 text-left"
            style={{
              backgroundColor: COLORS.navyTint,
              color: COLORS.white,
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}