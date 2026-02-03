// ProfileModal.jsx
import React from "react";

/** ProfileModal: Shows a small popup with User ID, Role name, and module summary. */
export default function ProfileModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Get user ID stored during login
  const userId = localStorage.getItem("userId");

  // Safely read saved role object
  let roleObj = null;
  try {
    roleObj = JSON.parse(localStorage.getItem("roles") || "null");
  } catch {
    roleObj = null;
  }

  const roleName = roleObj?.role || "—";

  // Build a readable summary of enabled modules
  const modulesSummary = Array.isArray(roleObj?.moduleChildModule)
    ? roleObj.moduleChildModule
        .map((m) => m?.moduleName || (m?.moduleId ? `Module ${m.moduleId}` : null))
        .filter(Boolean)
        .join(", ")
    : "—";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-80 p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
          aria-label="Close profile modal"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4">Profile</h2>

        <div className="space-y-2 text-gray-700">
          <p>
            <strong>User ID:</strong> {userId || "—"}
          </p>
          <p>
            <strong>Role:</strong> {roleName}
          </p>
          <p>
            <strong>Modules:</strong> {modulesSummary}
          </p>
        </div>
      </div>
    </div>
  );
}