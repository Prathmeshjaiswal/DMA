// import { useEffect, useMemo, useState } from "react";
// import { message, Spin, Button, Modal, Tree, Tag, Space } from "antd";
// import { CloseOutlined } from "@ant-design/icons";
// import { COLORS } from "./theme/colors";
// import { register } from "../api/register";
// import { getRolePermission } from "../api/register";
// import NavBar from "../NavBar.jsx";
//
//
//
// export default function Register() {
//   const [form, setForm] = useState({
//     userId: "",
//     emailId: "",
//     countryCode: "+91",
//     phoneNumber: "",
//     contactNo: "",
//     role: "",
//   });
//
//   const [submitting, setSubmitting] = useState(false);
//   const [msg, setMsg] = useState({ type: "", text: "" });
//
//   const [permModalOpen, setPermModalOpen] = useState(false);
//   const [permModalPreset, setPermModalPreset] = useState([]);
//
//   const labelPill =
//     "rounded-md bg-gray-800 text-white px-4 py-1 text-sm font-medium border border-[#52624E]";
//   const inputBox =
//     " rounded-md border border-[#52624E] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400";
//
//
//       useEffect(() => {
//         (async () => {
//           try {
//             const res = await getRolePermission();
//
//           } catch (e) {
//         console.error(e);
//         message.error(e? e: "Failed to load roles & permissions")
//   //       message.error("Failed to load roles & permissions");
//           }
//         })();
//       }, []);
//
//   const onChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };
//
//   // When role changes -> open modal with default permissions for that role
// //   const onRoleChange = (e) => {
// //     const role = e.target.value;
// //     const defaults = ROLE_DEFAULTS[role] || [];
// //     setForm((prev) => ({ ...prev, role }));
// //     setPermModalPreset(defaults);
// //     setPermModalOpen(true);
// //   };
//
//   const handlePermSave = (keys) => {
//     setForm((prev) => ({ ...prev, permissions: keys }));
//     setPermModalOpen(false);
//   };
//
//   const handlePermCancel = () => {
//     setPermModalOpen(false);
//   };
//
//   const handleAddMore = () => {
//     setForm({
//       userId: "",
//       emailId: "",
//       countryCode: "+91",
//       contactNo: "",
//       phoneNumber: "",
//       role: "",
//     });
//   };
//
//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setMsg({ type: "", text: "" });
//     try {
//       setSubmitting(true);
//       const payload = {
//         userId: form.userId,
//         emailId: form.emailId,
//         countryCode:form.countryCode,
//         phoneNumber: form.phoneNumber,
//         role: form.role,
//       };
//       // console.log("Register payload:", payload);
//
//       const data = await register(payload);
//
//       if (data?.success) {
//         setMsg({
//           type: "success",
//           text: data?.message || "Registered successfully",
//         });
//
//         const hide = message.success({
//           duration: 0,
//           content: (
//             <div className="flex items-center justify-between gap-4">
//               <span className="text-base">
//                 Temporary password is:{" "}
//                 <strong className="text-lg font-mono">
//                   {data.data.tempPassword}
//                 </strong>
//               </span>
//               <div className="flex gap-2">
//                 <Button
//                   size="small"
//                   className="bg-indigo-600 text-white hover:bg-indigo-700"
//                   onClick={async () => {
//                     try {
//                       await navigator.clipboard.writeText(
//                         data.data.tempPassword
//                       );
//                       message.success("Copied to clipboard");
//                     } catch {
//                       message.error("Copy failed");
//                     }
//                   }}
//                 >
//                   Copy
//                 </Button>
//                 <Button
//                   size="small"
//                   type="text"
//                   icon={<CloseOutlined />}
//                   className="text-gray-600 hover:text-red-500"
//                   onClick={() => hide()}
//                 />
//               </div>
//             </div>
//           ),
//         });
//
//         return;
//       } else {
//         setMsg({
//           type: "error",
//           text: data?.message || "Registration failed",
//         });
//       }
//     } catch (err) {
//       const text =
//         err?.response?.data?.message ||
//         err?.response?.data?.error ||
//         err?.message ||
//         "Registration failed";
//       message.error(text);
//       setMsg({ type: "error", text });
//     } finally {
//       setSubmitting(false);
//     }
//   };
//
//   return (
//       <><NavBar />
//     <div
//       className="flex flex-col"
//       style={{ backgroundColor: COLORS.white, color: COLORS.white }}
//     >
//       <main className="max-w-xl mx-auto w-full px-4 inline-block flex-1">
//         <div
//           className="rounded-xl px-6 shadow-lg"
//           style={{
//             backgroundColor: COLORS.navyTint,
//             border: `1px solid ${COLORS.white10}`,
//             boxShadow: "0 16px 32px rgba(0,0,0,0.35)",
//           }}
//         >
//           <h2 className="text-2xl font-semibold">Create User Account</h2>
//
//           <form className="mt-6 space-y-4" onSubmit={onSubmit}>
//             <div>
//               <input
//                 className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-sky-900 bg-opacity-5"
//                 name="userId"
//                 value={form.userId}
//                 onChange={onChange}
//                 placeholder="Employee ID"
//                 required
//               />
//             </div>
//
//             <div>
//               <input
//                 type="email"
//                 className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-sky-900 bg-opacity-5"
//                 name="emailId"
//                 value={form.emailId}
//                 onChange={onChange}
//                 placeholder="Email ID"
//                 required
//               />
//             </div>
//
//             <div className="w-full grid grid-cols-1">
//               <div className="flex gap-4">
//                 <select
//                   name="countryCode"
//                   value={form.countryCode}
//                   onChange={onChange}
//                   className="w-24 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-sky-900 bg-opacity-5"
//                   required
//                   aria-label="Country code"
//                 >
//                   <option value="+91" className="bg-sky-900">
//                     🇮🇳 +91
//                   </option>
//                   <option value="+44" className="bg-sky-900">
//                     🇬🇧 +44
//                   </option>
//                   <option value="+48" className="bg-sky-900">
//                     🇵🇱 +48
//                   </option>
//                   <option value="+52" className="bg-sky-900">
//                     mx +48
//                   </option>
//                 </select>
//
//                 <input
//                   className="w-102 rounded-lg px-1 py-2 focus:outline-none focus:ring-2 bg-sky-900 bg-opacity-5"
//                   name="phoneNumber"
//                   value={form.phoneNumber}
//                   onChange={onChange}
//                   placeholder="Contact number"
//                   inputMode="numeric"
//                   required
//                 />
//               </div>
//             </div>
//
//             <div className="grid grid-rows-2 gap-1 items-center">
//               <select
//                 className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-sky-900 bg-opacity-5"
//                 name="role"
//                 onChange={onChange}
//                 value={form.role}
//                 required
//               >
//                 <option value="" disabled>
//                   Select Role
//                 </option>
//                 <option value="ADMIN">ADMIN</option>
//                 <option value="PMO">PMO</option>
//                 <option value="DM">DM</option>
//                 <option value="RDG/TA">RDG/TA</option>
//                 <option value="HBU">HBU</option>
//               </select>
//
//               {/* Show selected permissions as tags */}
//               {form.permissions?.length > 0 && (
//                 <div className="mt-2 flex flex-wrap gap-2">
//                   {form.permissions.map((k) => (
//                     <Tag key={k} color="geekblue">
//                       {k}
//                     </Tag>
//                   ))}
//                   <Button
//                     size="small"
//                     onClick={() => setPermModalOpen(true)}
//                     className="ml-2"
//                   >
//                     Edit Permissions
//                   </Button>
//                 </div>
//               )}
//             </div>
//
//             <div className="flex justify-center">
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="px-4 py-2 rounded-lg font-medium transition-transform hover:scale-[1.02]"
//                 style={{
//                   backgroundColor: COLORS.orange,
//                   color: COLORS.white,
//                   opacity: submitting ? 0.7 : 1,
//                 }}
//               >
//                 {submitting && <Spin />}
//                 {submitting ? "Submitting..." : "Submit"}
//               </button>
//             </div>
//
//             <button className="" type="button" onClick={handleAddMore}>
//               Create Another User
//             </button>
//           </form>
//         </div>
//       </main>
//
//     </div>
//     </>
//   );
// }
//


import { useEffect, useMemo, useState } from "react";
import { message, Spin, Button, Modal, Tree, Tag, Space, Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { COLORS } from "./theme/colors";
import { register } from "../api/register";
import { getRolePermission } from "../api/register";
import NavBar from "../NavBar.jsx";



export default function Register() {
  const [form, setForm] = useState({
    userId: "",
    emailId: "",
    countryCode: "+91",
    phoneNumber: "",
    contactNo: "",
    role: "",

    //by simran
    empName: "",
    location: "",
    // createdOn:"",
  });




  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permModalPreset, setPermModalPreset] = useState([]);

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const labelPill =
    "rounded-md bg-gray-800 text-white px-4 py-1 text-sm font-medium border border-[#52624E]";
  const inputBox =
    " rounded-md border border-[#52624E] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400";


  useEffect(() => {
    (async () => {
      try {
        const res = await getRolePermission();
        if (res.success) {
          setRoles(res.data.rolesList || []);
          setPermissions(res.data.permissionsList || []);
        }
      } catch (e) {
        console.error(e);
        message.error(e ? e : "Failed to load roles & permissions")

      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };



  const handleAddMore = () => {
    setForm({
      userId: "",
      emailId: "",
      countryCode: "+91",
      contactNo: "",
      phoneNumber: "",
      role: "",
      //by simran
      empName: "",
      location: "",
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    try {
      setSubmitting(true);
      const payload = {
        userId: form.userId,
        emailId: form.emailId,
        countryCode: form.countryCode,
        phoneNumber: form.phoneNumber,
        role: form.role,
      };


      const data = await register(payload);
      console.log("data", data);






      if (data?.success) {
        setMsg({
          type: "success",
          text: data?.message || "Registered successfully",
        });

        const hide = message.success({
          duration: 0,
          content: (
            <div className="flex items-center justify-between gap-4">
              <span className="text-base">
                Temporary password is:{" "}
                <strong className="text-lg font-mono">
                  {data.data.tempPassword}
                </strong>
              </span>
              <div className="flex gap-2">
                <Button
                  size="small"
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        data.data.tempPassword
                      );
                      message.success("Copied to clipboard");
                    } catch {
                      message.error("Copy failed");
                    }
                  }}
                >
                  Copy
                </Button>
                <Button
                  size="small"
                  type="text"
                  icon={<CloseOutlined />}
                  className="text-gray-600 hover:text-red-500"
                  onClick={() => hide()}
                />
              </div>
            </div>
          ),
        });


        const createdOn = new Date().toISOString();

        // 🔧 COMBINED OBJECT = backend payload + UI fields (no password)
        const combinedUser = {
          userId: form.userId,         // backend
          emailId: form.emailId,       // backend
          countryCode: form.countryCode, // backend
          phoneNumber: form.phoneNumber, // backend
          role: form.role,

          // UI extras:
          empName: form.empName,      // username displayed in UI
          location: form.location,     // UI
          createdOn,                   // UI
          active: true,                // default active in UI
          // (optional) include any IDs returned by backend, e.g. data.data.userId
          // backendUserId: data?.data?.userId,
        };



        // 🔧 CONSOLE OUTPUT (as you requested)
        console.groupCollapsed(" Registered User (Combined)");
        console.table([combinedUser]);
        console.groupEnd();





        // 🔧 PERSIST TO LOCALSTORAGE FOR USER MANAGEMENT VIEW
        // 1) Append to "users" list (flat array used by your table)
        const existingUsers = JSON.parse(localStorage.getItem("users")) || [];

        const withoutDuplicate = existingUsers.filter(
          (u) => (u.userId || u.empId) !== combinedUser.userId
        );
        localStorage.setItem(
          "users",
          JSON.stringify([...withoutDuplicate, combinedUser])
        );


        const uiDetailsMap = JSON.parse(localStorage.getItem("userUiDetailsMap")) || {};
        uiDetailsMap[combinedUser.userId] = {
          empName: combinedUser.empName,
          location: combinedUser.location,
          createdOn: combinedUser.createdOn,
        };
        localStorage.setItem("userUiDetailsMap", JSON.stringify(uiDetailsMap));





        return;
      } else {
        setMsg({
          type: "error",
          text: data?.message || "Registration failed",
        });
      }
    } catch (err) {
      const text =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed";
      message.error(text);
      setMsg({ type: "error", text });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <><NavBar />
      <div
        className="flex flex-col"
        style={{ backgroundColor: COLORS.white, color: COLORS.white }}
      >
        <main className="max-w-xl mx-auto w-full px-4 inline-block flex-1">
          <div
            className="rounded-xl px-6 shadow-lg"
            style={{
              backgroundColor: COLORS.navyTint,
              border: `1px solid ${COLORS.white10}`,
              boxShadow: "0 16px 32px rgba(0,0,0,0.35)",
            }}
          >
            <h2 className="text-2xl font-semibold">Create User Account</h2>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <input
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-sky-900 bg-opacity-5"
                  name="userId"
                  value={form.userId}
                  onChange={onChange}
                  placeholder="Employee ID"
                  required
                />
              </div>

              {/* by simran */}
              <div>
                <input
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-sky-900 bg-opacity-5"
                  name="empName"
                  value={form.empName}
                  onChange={onChange}
                  placeholder="Employee Name"
                  required
                />
              </div>


              <div>
                <input
                  type="email"
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-sky-900 bg-opacity-5"
                  name="emailId"
                  value={form.emailId}
                  onChange={onChange}
                  placeholder="Email ID"
                  required
                />
              </div>

              <div className="w-full grid grid-cols-1">
                <div className="flex gap-4">
                  <select
                    name="countryCode"
                    value={form.countryCode}
                    onChange={onChange}
                    className="w-24 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-sky-900 bg-opacity-5"
                    required
                    aria-label="Country code"
                  >
                    <option value="+91" className="bg-sky-900">
                      🇮🇳 +91
                    </option>
                    <option value="+44" className="bg-sky-900">
                      🇬🇧 +44
                    </option>
                    <option value="+48" className="bg-sky-900">
                      🇵🇱 +48
                    </option>
                    <option value="+52" className="bg-sky-900">
                      mx +48
                    </option>
                  </select>

                  <input
                    className="w-102 rounded-lg px-1 py-2 focus:outline-none focus:ring-2 bg-sky-900 bg-opacity-5"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={onChange}
                    placeholder="Contact number"
                    inputMode="numeric"
                    required
                  />
                </div>


                {/* <div>
              
            </div> */}
              </div>


              <div className="grid grid-rows-2 gap-1 items-center">
                <select className="w-full rounded w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-sky-900 bg-opacity-5"
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  required
                >
                  <option value="" disabled>
                    Select Location
                  </option>
                  <option value="MUMBAI">Mumbai</option>
                  <option value="PUNE">Pune</option>
                  <option value="BANGALORE">Bangalore</option>
                  <option value="HYDERABAD">Hyberabad</option>


                </select>
                <select
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-sky-900 bg-opacity-5"
                  name="role"
                  onChange={onChange}
                  value={form.role}
                  required
                >
                  <option value="" disabled>
                    Select Role
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.role}>
                      {role.role}
                    </option>
                  ))}
                </select>

                {/* Show selected permissions as tags */}
                {form.permissions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {form.permissions.map((k) => (
                      <Tag key={k} color="geekblue">
                        {k}
                      </Tag>
                    ))}
                    <Button
                      size="small"
                      onClick={() => setPermModalOpen(true)}
                      className="ml-2"
                    >
                      Edit Permissions
                    </Button>
                  </div>
                )}
              </div>

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
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>

              <button className="" type="button" onClick={handleAddMore}>
                Create Another User
              </button>
            </form>
          </div>
        </main>

      </div>
    </>
  );
}



