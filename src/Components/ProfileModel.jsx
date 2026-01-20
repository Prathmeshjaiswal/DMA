import React from "react";

export default function ProfileModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-80 p-6 relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4">Profile</h2>

        <div className="space-y-2 text-gray-700">
          <p><strong>User ID:</strong> {userId}</p>
          <p><strong>Roles:</strong> {role.join(", ")}</p>
        </div>
      </div>
    </div>
  );
}