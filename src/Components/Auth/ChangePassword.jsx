
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import { COLORS } from "./theme/colors";
import { login } from "../api/login";
import {message,Spin} from "antd";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ userId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg("");
    setLoading(true);

    try {
      // calling api
      const resp = await login({
        userId: form.userId.trim(),
        password: form.password,
      });
      if (resp?.success) {
        setServerMsg(resp?.data || "Password changed successfully.");
        message.success("Temporary password verified. Please set a new password.");
        setTimeout(() => navigate("/setnewpassword"), 1000);
      } else {
        setServerMsg(resp?.message || "Failed to change password.");
      }
    } catch (err) {
      const errormsg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to change password. Please try again.";
      setServerMsg(errormsg);
      message.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
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
          <h2 className="text-2xl font-semibold">Change Password</h2>

          {/* User ID input */}
          <div className="mt-6">
            <label className="block text-sm mb-1">User ID</label>
            <input
              name="userId"                 
              className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.white10}`,
                color: COLORS.white,
                outlineColor: COLORS.orange,
              }}
              value={form.userId}
              onChange={onChange}           
              placeholder="Enter User Id"
              required
            />
          </div>

          {/* Password field*/}
          <div className="mt-6 space-y-3">
            <label className="block text-sm mb-1">Temporary Password</label>
            <input
              type="password"
              name="password"               
              className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.white10}`,
                color: COLORS.white,
                outlineColor: COLORS.orange,
              }}
              value={form.password}
              onChange={onChange}          
              placeholder="Enter temporary password"
              required
            />

            {/* Feedback message */}
            {/* {serverMsg && (
              <div
                className="mt-4 rounded-lg p-3"
                style={{
                  border: `1px solid ${COLORS.white10}`,
                  backgroundColor: COLORS.navy,
                  color: COLORS.white,
                }}
              >
                {serverMsg}
              </div>
            )} */}
            <button
              type="button"                
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium transition-transform hover:scale-[1.02] disabled:opacity-60"
              style={{
                backgroundColor: COLORS.orange,
                color: COLORS.white,
              }}
            > 
              {loading && <Spin />}
              {loading ? "Saving..." : "Login"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
