import { useState } from "react";
import axios from "axios";
import { COLORS } from "./theme/colors";
import NavBar from "../NavBar";
import {message,Spin} from "antd";
import { register } from "../api/register";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userId: "",
    password: null,
    tempPwd: null,
    dept: "",
    emailId: "",
    roles: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    
    console.log(form);
    e.preventDefault();
    setMsg({ type: "", text: "" });
    try {
    console.log('[onSubmit] form:', form);
    // Basic validation
    if (
      !form.userId.trim() ||
      !form.dept.trim() ||
      !form.emailId.trim()
    ) {
      console.warn('[onSubmit] validation failed: empty fields');
      setMsg({ type: "error", text: "All fields are required." });
      console.log(msg)
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailId)) {
      console.warn('[onSubmit] validation failed: bad email');
      setMsg({ type: "error", text: "Invalid email format." });
      return;
    }

    // role is selected or not 
    if (form.roles.length === 0) {
      console.warn('[onSubmit] validation failed: no roles');
      setMsg({ type: "error", text: "Select at least one role." });
      return;
    }


    setSubmitting(true);
    // Payload
    const payload = {
      userId: form.userId.trim(),
      password: form.password,
      tempPwd: form.tempPwd,
      dept: form.dept.trim(),
      emailId: form.emailId.trim(),
      roles: form.roles,
    };


      // calling api
      console.log('Calling register API with payload:', payload);
      const data = await register(payload) 
      await new Promise((res) => setTimeout(res, 1200));
      // success
      if (data?.success) {
        setMsg({
          type: 'success',
          text: data?.message || 'Registered successfully',
        });
        message.success("Account registered successfully.");
        message.success("A temporary password has been sent to your registered email address.");
        console.log(msg);
        await new Promise((res) => setTimeout(res, 800));
        navigate("/change")
      return;

      }
      // fail
      else{
        setMsg({
          type: 'error',
          text: body?.message || 'Registration failed',
        });
        console.log(msg)
      }
    } catch (err) {
      const text =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed";
      message.error("Registration failed. Please try again.");
      setMsg({ type: "error", text });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: COLORS.white, color: COLORS.white }}
    >
    <NavBar/>

      {/* Main */}
      <main className="max-w-xl mx-auto w-full px-4 py-10 flex-1">
        <div
          className="rounded-xl p-6 shadow-lg"
          style={{
            backgroundColor: COLORS.navyTint,
            border: `1px solid ${COLORS.white10}`,
            boxShadow: "0 16px 32px rgba(0,0,0,0.35)",
          }}
        >
          <h2 className="text-2xl font-semibold">Create Account</h2>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm mb-1">User ID</label>
              <input
                className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.white10}`,
                  color: COLORS.white,
                  outlineColor: COLORS.orange,
                }}
                name="userId"
                value={form.userId}
                onChange={onChange}
                placeholder="Enter UserID"
                required
              />
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.white10}`,
                    color: COLORS.white,
                    outlineColor: COLORS.orange,
                  }}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Strong password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Temp Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.white10}`,
                    color: COLORS.white,
                    outlineColor: COLORS.orange,
                  }}
                  name="tempPwd"
                  value={form.tempPwd}
                  onChange={onChange}
                  placeholder="Temporary / initial password"
                  required
                />
              </div>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Department</label>
                <input
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.white10}`,
                    color: COLORS.white,
                    outlineColor: COLORS.orange,
                  }}
                  name="dept"
                  value={form.dept}
                  onChange={onChange}
                  placeholder="Enter Department"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLORS.white10}`,
                    color: COLORS.white,
                    outlineColor: COLORS.orange,
                  }}
                  name="emailId"
                  value={form.emailId}
                  onChange={onChange}
                  placeholder="Enter Coforge Email Id"
                  required
                />
              </div>
            </div>

            {/* roles */}
            <div>
              <label className="block text-sm mb-1">Roles</label>
              <div
                className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.white10}`,
                  color: COLORS.white,
                  outlineColor: COLORS.orange,
                }}
              >
                {/* Checkbox group */}
                <div className="grid grid-cols-2 gap-2">
                  {["ADMIN", "PMO", "PMO_MANAGER", "RDG", "TAT"].map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-2 cursor-pointer"
                      style={{ userSelect: "none" }}
                    >
                      <input
                        type="checkbox"
                        name="roles"          
                        value={role}
                        checked={form.roles.includes(role)}
                        onChange={(e) => {
                          const { checked } = e.target;
                          setForm((prev) => {
                            const roles = checked
                              ? [...prev.roles, role]
                              : prev.roles.filter((r) => r !== role);
                            return {
                              ...prev,
                              roles,
                          
                            };
                          });
                        }}
                        className="h-4 w-4 rounded border"
                        style={{
                          accentColor: COLORS.orange,
                          borderColor: COLORS.white10,
                        }}
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {msg.text && (
              <div
                className="rounded-lg p-3"
                style={{
                  border: `1px solid ${COLORS.white10}`,
                  backgroundColor: COLORS.navy,
                  color: msg.type === "success" ? "#87ffa5" : COLORS.accent,
                }}
              >
                {msg.text}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg font-medium transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: COLORS.orange,
                  color: COLORS.white,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting && <Spin />}
                {submitting ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
