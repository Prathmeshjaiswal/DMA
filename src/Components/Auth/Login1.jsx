
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "./theme/colors";
import NavBar from "../NavBar";
import { login } from "../api/login";
import { message } from "antd";

export default function Login1() {
  const [form, setForm] = useState({
    userId: "",
    password: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState("");

  const navigate = useNavigate();

  // Generic change handler: relies on input name attributes
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = async(e) => {
    e.preventDefault();
    console.log("Submitted form:", form);
    // call api pending
    try {
      // Call backend
      const resp = await login(form);
      setServerMsg(resp?.message || "");

      if (resp?.success) {
        const status = resp?.data?.status;

        if (status === "SUCCESS") {
          // Store auth
          localStorage.setItem("token", resp.data.token);
          localStorage.setItem("userId", resp.data.userId);
          localStorage.setItem("roles", JSON.stringify(resp.data.roles));
          message.success({ content: "Logged in successfully.", duration: 2 });
          // Navigate to dashboard
          navigate("/Dashboard");
        } else {
          setServerMsg(resp?.message || "Login failed.");
        }
      } else {
        setServerMsg(resp?.message || "Login failed.");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to login. Please try again.";
      setServerMsg(message);
    } finally {
        setLoading(false)
      setForm({ userId: "", password: "" });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: COLORS.white }}
    >
      <NavBar />

      <div
        className="shadow-lg rounded-lg p-8 w-[400px]"
        style={{ backgroundColor: COLORS.navyTint }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span style={{ color: COLORS.orange }}>Co</span>
            <span style={{ color: COLORS.white }}>forge Limited</span>
          </h1>
          <p className="text-lg font-semibold mt-2">
            <span style={{ color: COLORS.orange }} className="text-xl">
              HSBC
            </span>
            <br />
            <span style={{ color: COLORS.white }}>Demand Management System</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: COLORS.white }}
            >
              User ID
            </label>
            <input
              type="name"
              name="userId"
              value={form.userId}
              onChange={onChange}
              required
              placeholder="Enter your UserId"
              className="w-full px-3 py-2 rounded-md outline-none"
              style={{
                backgroundColor: COLORS.white,
                color: COLORS.navy,
                border: `2px solid ${COLORS.accent}`
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.orange)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.accent)}
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: COLORS.white }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              placeholder="Enter password"
              className="w-full px-3 py-2 rounded-md outline-none"
              style={{
                backgroundColor: COLORS.white,
                color: COLORS.navy,
                border: `2px solid ${COLORS.accent}`
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.orange)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.accent)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-md font-medium transition-colors"
            style={{
              backgroundColor: COLORS.orange,
              color: COLORS.white,
              border: `2px solid ${COLORS.white10}`
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d64f37")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.orange)}
          >
            Login
          </button>
        </form>
      </div>

      <footer className="text-center text-sm mt-6 sticky" style={{ color: COLORS.navy }}>
        © Coforge, 2026 | Confidential
      </footer>
    </div>
  );
}