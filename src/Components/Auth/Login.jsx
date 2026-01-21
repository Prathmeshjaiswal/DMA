
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "./theme/colors";
import NavBar from "../NavBar";
import { login } from "../api/login";
import { message } from "antd";
import Register from "./Register.jsx"
import Footer from ".././Footer.jsx"
import { useAuth } from "./AuthProvider.jsx"; 

export default function Login() {
//by simran
const {setIsAuthenticated}=useAuth();

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
      const resp = await login(form);
      setServerMsg(resp?.message || "");

      if (resp?.success) {
          localStorage.setItem("token", resp.data.token);
          localStorage.setItem("userId", resp.data.userId);
          localStorage.setItem("roles", JSON.stringify(resp.data.roles));

          //by simran
          setIsAuthenticated(true);

//           message.success({ content: "Logged in successfully.", duration: 2 });
          // Navigate to dashboard
          navigate("/DashBoard");
        } else {
          setServerMsg(resp?.message || "Login failed.");
        }
      }
     catch (err) {
      const errormessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to login. Please try again.";
      setServerMsg(errormessage);
      message.error(errormessage);
    } finally {
        setLoading(false)
      setForm({ userId: "", password: "" });
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center "
      style={{ backgroundColor: COLORS.white }}
    >
      <NavBar />

      <div
        className="shadow-lg rounded-lg px-8  py-15 w-[400px]"
        style={{ backgroundColor: COLORS.navyTint }}
      >
        {/* Header */}
        <div className="text-center mb-8">
{/*           <h1 className="text-3xl font-bold"> */}
{/*             <span style={{ color: COLORS.orange }}>Co</span> */}
{/*             <span style={{ color: COLORS.white }}>forge Limited</span> */}
{/*           </h1> */}
          <p className="text-lg font-bold">
            <h1 style={{ color: COLORS.orange }} className="text-3xl">
              HSBC
            </h1>
            <span style={{ color: COLORS.white }} className="text-xl">Demand Management System</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: COLORS.white }}
            >
            </label>
            <input
              type="name"
              name="userId"
              value={form.userId}
              onChange={onChange}
              required
              placeholder="Employee ID "
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
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              placeholder="Password"
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

{/* <Footer /> */}
    </div>
  );
}