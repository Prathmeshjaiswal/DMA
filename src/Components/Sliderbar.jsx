// src/Components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CloseOutlined } from "@ant-design/icons";
import { usePermissions } from "../Components/Auth/PermissionProvider";

/** Sliderbar: Slide-in sidebar that shows menu items gated by permissions. */
export default function Sliderbar({ isOpen, onClose, width = 256 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasChild /*, can*/ } = usePermissions();

  /** COLORS: Centralized theme tokens for consistent styling. */
  const COLORS = {
    navy: "#082340",
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

  /** Permission gates */
  const allowDemands = hasChild("DashBoard", "Demands");
  const allowTrack = hasChild("DashBoard", "Track");
  const allowRDGTA = hasChild("DashBoard", "RDG/TA");
  const allowHBU = hasChild("DashBoard", "HBU");
  const allowReports = hasChild("DashBoard", "Reports");

  /** Track group open/close (auto-open when on Track routes) */
  const onTrackRoute =
    location.pathname === "/ProfileTracker" ||
    location.pathname === "/onboardinglist"; // if you prefer /OnBoardingTracker, change here and in child button below
  const [trackOpen, setTrackOpen] = useState(onTrackRoute);

  useEffect(() => {
    if (onTrackRoute) setTrackOpen(true);
  }, [onTrackRoute]);

  /** Basic button (shared) */
  const Btn = ({ children, onClick, active = false }) => (
    <button
      onClick={onClick}
      className={`
        w-full rounded px-3 py-2 text-left
        transition-colors duration-150
        hover:bg-white/10 focus:bg-white/15
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
        ${active ? "bg-white/20" : ""}
      `}
      style={{ color: COLORS.white }}
    >
      {children}
    </button>
  );

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
        {/* Demands */}
        {allowDemands && (
          <Btn onClick={() => navigate("/demandsheet1")}>Demands</Btn>
        )}

        {/* Track (group) */}
        {allowTrack && (
          <div>
            <Btn onClick={() => setTrackOpen((v) => !v)} active={trackOpen}>
              Track
            </Btn>

            {trackOpen && (
              <div
                className="mt-1 space-y-1"
                style={{
                  marginLeft: 12,
                  borderLeft: `2px solid ${COLORS.white10}`,
                  paddingLeft: 8,
                }}
              >
                <Btn
                  onClick={() => navigate("/ProfileTracker")}
                  active={location.pathname === "/ProfileTracker"}
                >
                  Profile Tracker
                </Btn>

                <Btn
                  onClick={() => navigate("/onboardinglist")} // if you chose /OnBoardingTracker, change here
                  active={location.pathname === "/onboardinglist"}
                >
                  Onboarding Tracker
                </Btn>
              </div>
            )}
          </div>
        )}

        {/* Profiles */}
        {allowRDGTA && (
          <Btn onClick={() => navigate("/profileSheet")}>Profiles</Btn>
        )}

        {/* HBU */}
        {allowHBU && <Btn onClick={() => navigate("/HBU")}>HBU</Btn>}

        {/* Reports */}
        {allowReports && <Btn onClick={() => navigate("/Report")}>Reports</Btn>}
      </nav>
    </aside>
  );
}