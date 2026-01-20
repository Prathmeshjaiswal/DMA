
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import { COLORS } from "./theme/colors";
import { changePassword } from "../api/changePassword";
import {message,Spin} from "antd";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ userId: "", tempPassword: "",password:"" });
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const [changing, setChanging] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg("");
    setLoading(true);

    try {
      const payload ={ userId: form.userId,tempPassword: form.tempPassword ,password:form.password}
      const resp = await changePassword(payload);
      if (resp?.success) {
        setServerMsg(resp?.data || "Password changed successfully.");
        message.success("Temporary password verified.");
        message.success("Password Changed Successfully.");
      } else {
        setServerMsg(resp?.message || "Failed to change password.");
      }
    } catch (err) {
      const errormsg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to change password. Please try again.";
      setServerMsg(errormsg);
      console.log(errormsg);
      message.error(errormsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col"
      style={{ backgroundColor: COLORS.white, color: COLORS.white }}
    >
      <NavBar />

      <main className="max-w-xl mx-auto w-full px-4 py-10 flex-1">
        <div
          className="rounded-xl p-6 shadow-lg"
          style={{
            backgroundColor: COLORS.navyTint,
            border: `1px solid ${COLORS.white10}`,
            boxShadow: "0 16px 32px rgba(0,0,0,0.35)",
          }}
        >
<div className="my-2 space-y-3">
          <h2 className="text-2xl font-semibold">Change Password</h2>
            <input
              type="name"
              name="userId"
              value={form.userId}
              onChange={onChange}
              required
              placeholder="Employee ID"
              className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.white10}`,
                color: COLORS.white,
                outlineColor: COLORS.orange,
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.orange)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.accent)}
            />
          </div>
          <div className="mt-3 space-y-3">
{/*             <label className="block text-sm mb-1">Temporary Password</label> */}
            <input
              type="password"
              name="tempPassword"
              className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.white10}`,
                color: COLORS.white,
                outlineColor: COLORS.orange,
              }}
              value={form.tempPassword}
              onChange={onChange}          
              placeholder="Temporary Password"
              required
            />
<div className="mt-2">
{/*           <label className="block text-sm mb-1" style={{ color: COLORS.white }}> */}
{/*               New Password */}
{/*             </label> */}
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
                placeholder="Password"
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
          <div className="mt-2">
{/*             <label className="block text-sm mb-1" style={{ color: COLORS.white }}> */}
{/*               Confirm New Password */}
{/*             </label> */}
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
                placeholder="Confirm Password"
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
            <button
              type="button"                
              onClick={handleSubmit}
              disabled={loading}
            className="w-5/6 py-2 mt-5 rounded-md font-medium transition-colors"
            style={{
              backgroundColor: COLORS.orange,
              color: COLORS.white,
              border: `2px solid ${COLORS.white10}`
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d64f37")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.orange)}
          >
              {loading && <Spin />}
              {loading ? "Changing..." : "Change"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
