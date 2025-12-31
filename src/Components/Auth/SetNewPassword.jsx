
import React, { useState } from "react";
import COLORS from "./theme/colors";
import NavBar from "../NavBar";
import { changePassword } from "../api/changepassword";
import { useNavigate } from "react-router-dom";
import { message,Spin } from "antd";
export default function SetNewPassword() {
  const [userId, setUserId] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [changing, setChanging] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // Helper to convert axios error to readable text
  const parseAxiosError = (error) => {
    if (error?.response) {
      const status = error.response.status;
      const serverMsg =
        error.response.data?.message ||
        error.response.data?.error ||
        "Server returned an error.";
      return `(${status}) ${serverMsg}`;
    }
    if (error?.request) {
      return "Network error: Unable to reach the server. Please try again.";
    }
    return error?.message || "Unexpected error occurred.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ prevent page reload on form submit
    setMsg({ type: "", text: "" });

    if (changing) return; // prevent double submit

    // Validation (as per your current rules)
    if (!userId.trim()) {
      return setMsg({ type: "error", text: "User ID is required." });
    }
    if (!newPwd || !confirmPwd) {
      return setMsg({
        type: "error",
        text: "New password and confirmation are required.",
      });
    }
    if (newPwd !== confirmPwd) {
      return setMsg({ type: "error", text: "Passwords do not match." });
    }

    try {
      setChanging(true);
      const payload = { userId: userId.trim(), password: newPwd };

      const data = await changePassword(payload);

      const successText =
        data?.message ??
        `Password changed successfully for User ID "${userId}". Use your new password from next login.`;
      message.success(`Password changed successfully for User ID "${userId}". Use your new password from next login.`);
      setMsg({ type: "success", text: successText });
      setNewPwd("");
      setConfirmPwd("");
      navigate("/login1",5000);
    } catch (err) {
      const errText = parseAxiosError(err);
      setMsg({
        type: "error",
        text: `Could not change password. ${errText}`,
      });
      message.error("Failed to change password. Please try again.");
    } finally {
      setChanging(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="max-w-xl mx-auto w-full px-4 py-10 flex-1">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-6 shadow-lg border"
          style={{
            backgroundColor: COLORS.navyTint,
            borderColor: COLORS.white10,
            color: COLORS.white,
            boxShadow: "0 16px 32px rgba(0,0,0,0.35)",
          }}
        >
          <h3 className="text-xl font-semibold mb-3">Set New Password</h3>

          {/* User ID */}
          <div className="mt-1">
            <label className="block text-sm mb-1" style={{ color: COLORS.white }}>
              User ID
            </label>
            <input
              type="text"
              name="userId"
              className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.white10}`,
                color: COLORS.white,
                outlineColor: COLORS.orange,
              }}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your User ID"
              required
              autoComplete="username"
            />
          </div>

          {/* New Password */}
          <div className="mt-4">
            <label className="block text-sm mb-1" style={{ color: COLORS.white }}>
              New Password
            </label>
            <div className="flex items-center gap-2">
              <input
                type={showNewPwd ? "text" : "password"}
                name="newPassword"
                className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.white10}`,
                  color: COLORS.white,
                  outlineColor: COLORS.orange,
                }}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Create a strong password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPwd((v) => !v)}
                className="px-3 py-2 rounded-lg font-medium transition-transform hover:scale-[1.02] border"
                style={{
                  backgroundColor: COLORS.navy,
                  color: COLORS.white,
                  borderColor: COLORS.white10,
                }}
                aria-label={showNewPwd ? "Hide new password" : "Show new password"}
              >
                {showNewPwd ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mt-4">
            <label className="block text-sm mb-1" style={{ color: COLORS.white }}>
              Confirm New Password
            </label>
            <div className="flex items-center gap-2">
              <input
                type={showConfirmPwd ? "text" : "password"}
                name="confirmPassword"
                className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.white10}`,
                  color: COLORS.white,
                  outlineColor: COLORS.orange,
                }}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Re-enter new password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd((v) => !v)}
                className="px-3 py-2 rounded-lg font-medium transition-transform hover:scale-[1.02] border"
                style={{
                  backgroundColor: COLORS.navy,
                  color: COLORS.white,
                  borderColor: COLORS.white10,
                }}
                aria-label={showConfirmPwd ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPwd ? "Hide" : "Show"}
              </button>
            </div>
          </div>

            {/* Feedback */}
            {msg.text && (
              <div
                className="mt-4 rounded-lg p-3 border"
                style={{
                  backgroundColor: COLORS.navy,
                  borderColor: COLORS.white10,
                  color: msg.type === "success" ? "#87ffa5" : COLORS.accent,
                }}
                aria-live="polite"
              >
                {msg.text}
              </div>
            )}
          {/* Submit */}
          <div className="mt-6">
            <button
              type="submit"               
              disabled={changing}
              className="px-4 py-2 rounded-lg font-medium transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: COLORS.orange,
                color: COLORS.white,
                opacity: changing ? 0.7 : 1,
                cursor: changing ? "not-allowed" : "pointer",
              }}
              aria-busy={changing}
            >
              {changing && <Spin/>}
              {changing ? "Changing..." : "Change Password"}
            </button>
          </div>

        </form>
      </main>
    </>
  );
}
