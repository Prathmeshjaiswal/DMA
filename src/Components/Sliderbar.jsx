
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, onClose, links = [] }) {
  const navigate = useNavigate();
  const [openLabel, setOpenLabel] = useState(null);
  const COLORS = {
    navy: "#082340",       // base
    navyTint: "#0D3559",   // darker tint for items
    navyShade: "#0A2D4B",  // section background
    orange: "#F15B40",     // primary action
    accent: "#F1A899",     // small indicators
    white: "#FFFFFF",
    white10: "rgba(255,255,255,0.10)",
    backdrop: "rgba(0,0,0,0.40)",
  };

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggle = (label) => setOpenLabel((prev) => (prev === label ? null : label));
  const childButtonsMap = {
    Demands: [
      { text: "Add", onClick: () => navigate("/addDemands1") },
      { text: "View", onClick: () => navigate("/DemandSheet1") },
    ],
    Track: [
      { text: "Profiles", onClick: () => navigate("/ProfileTracker") },
      { text: "Onboarding", onClick: () => navigate("/OnBoardingTracker") },
    ],
    RDG: [{ text: "Addprofiles", onClick: () => navigate("/RDGTeam") }],
    TA: [{ text: "AddProfiles", onClick: () => navigate("/TATeam") }],
    Reports: [{ text: "Download", onClick: () => navigate("/Report") }],

//
  };

  const getButtons = (label) =>
    childButtonsMap[label] ?? [
//       { text: "Action 1", onClick: () => console.log(`${label}: Action 1`) },
//       { text: "Action 2", onClick: () => console.log(`${label}: Action 2`) },
//       { text: "Action 3", onClick: () => console.log(`${label}: Action 3`) },
    ];

  return (
    <>
      {/* Backdrop (slight dark overlay) */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
        style={{ backgroundColor: COLORS.backdrop }}
      />

      {/* Sidebar Drawer */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Vertical Navigation"
        style={{
          backgroundColor: COLORS.navy,
          color: COLORS.white,
          boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: `1px solid ${COLORS.white10}` }}
        >
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: COLORS.orange,
              color: COLORS.white,
              borderRadius: 6,
              padding: "6px 12px",
            }}
          >
            Close
          </button>
        </div>

        {/* Scrollable content area */}
        <nav
          className="px-3 py-3 space-y-2 flex-1 overflow-y-auto overscroll-y-contain"
          style={{ scrollbarGutter: "stable both-edges" }}
        >
          {links.map((item) => {
            const isOpenSection = openLabel === item.label;
            const buttons = getButtons(item.label);

            return (
              <div key={`sidebar-${item.label}`} className="w-full">
                {/* Parent button */}
                <button
                  onClick={() => toggle(item.label)}
                  className="flex w-full items-center justify-between rounded px-3 py-2 text-left"
                  aria-expanded={isOpenSection}
                  aria-controls={`section-${item.label}`}
                  style={{
                    backgroundColor: COLORS.navyTint,
                    color: COLORS.white,
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ color: COLORS.accent, fontSize: 12 }}>
                    {isOpenSection ? "▲" : "▼"}
                  </span>
                </button>

                {/* child content */}
                {isOpenSection && (
                  <div
                    id={`section-${item.label}`}
                    className="mt-2 rounded px-3 py-2"
                    style={{
                      border: `1px solid ${COLORS.white10}`,
                      backgroundColor: COLORS.navyShade,
                    }}
                  >
                    <div className="space-y-2">
                      {buttons.map((btn, idx) => (
                        <button
                          key={`${item.label}-btn-${idx}`}
                          className="w-full rounded px-3 py-2"
                          onClick={btn.onClick}
                          style={{
                            backgroundColor: COLORS.orange,
                            color: COLORS.white,
                          }}
                        >
                          {btn.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}