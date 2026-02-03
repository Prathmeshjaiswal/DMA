// src/Components/Sidebar.jsx
import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CloseOutlined } from "@ant-design/icons";
import { usePermissions } from "../Components/Auth/PermissionProvider";

/** Sliderbar: Slide-in sidebar that shows menu items gated by permissions. */
export default function Sliderbar({ isOpen, onClose, width = 256 }) {
  const navigate = useNavigate();
  const { hasChild } = usePermissions();

  /** COLORS: Centralized theme tokens for consistent styling. */
  const COLORS = {
    navy: "#082340",
    navyTint: "#0D3559",
    orange: "#F15B40",
    white: "#FFFFFF",
    white10: "rgba(255,255,255,0.10)",
  };

  /** Effect: Close sidebar on ESC key. */
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /** Permission gates: Determine which groups/items should be visible. */
  const allowDashboardShortcuts = hasChild("DashBoard", "DashBoard");
  const allowReports = hasChild("DashBoard", "Reports");

  /** MENU: Build visible menu items based on current permissions. */
  const MENU = useMemo(
    () =>
      [
        allowDashboardShortcuts && {
          label: "Demands",
          onClick: () => navigate("/demandsheet1"),
        },
        allowDashboardShortcuts && {
          label: "Track",
          onClick: () => navigate("/ProfileTracker"),
        },
        allowDashboardShortcuts && {
          label: "RDG/TA",
          onClick: () => navigate("/RDGTATeam"),
        },
        allowDashboardShortcuts && {
          label: "HBU",
          onClick: () => navigate("/HBU"),
        },
        allowReports && {
          label: "Reports",
          onClick: () => navigate("/Report"),
        },
      ].filter(Boolean),
    [allowDashboardShortcuts, allowReports, navigate]
  );

  /** Render: Off-canvas sidebar with header, close button, and gated menu. */
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