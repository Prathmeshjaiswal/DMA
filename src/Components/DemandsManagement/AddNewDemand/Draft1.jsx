// // src/Components/DemandsManagement/AddNewDemand/Draft1.jsx
// // Clean, compact "User Management"-style list. No Draft ID shown.
// // Only Submit action; clicking a row opens AddDemand (Step-1) to edit.

// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import Layout from "../../Layout.jsx";
// import { useNavigate } from "react-router-dom";
// import { Button, message, Table } from "antd"; // ✅ use antd Table for perfect alignment
// import { SendOutlined } from "@ant-design/icons";
// import { listDrafts1, deleteDraft1 } from "../../../utils/draftsStore1.js";
// import { submitStep1 } from "../../api/Demands/addDemands.js";

// // ----- helpers -----
// const firstLocation = (loc) => {
//   if (!loc) return "—";
//   if (Array.isArray(loc)) return loc[0] || "—";
//   if (typeof loc === "string") {
//     const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
//     return parts[0] || "—";
//   }
//   return "—";
// };

// const skillLabel = (s) =>
//   (s && typeof s === "object" ? s.label ?? s.value : s) || "—";

// const formatCreatedAt = (iso) => {
//   try {
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return "—";
//     const date = d.toLocaleDateString(undefined, {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//     const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//     return `${date}, ${time}`;
//   } catch {
//     return "—";
//   }
// };

// // Build Step-1 payload (same as your Step-1 submit)
// const toStep1Payload = (form = {}) => {
//   const asCsv = (arr) =>
//     (Array.isArray(arr) ? arr : [])
//       .map((x) => (x?.value ?? x ?? ""))
//       .join(",");

//   const skillClusterStr = form?.skillCluster?.value ?? form?.skillCluster ?? "";

//   const hmFinal =
//     (form?.hiringManager === "__other__" && form?.hiringManagerOther?.trim()) ||
//     form?.hiringManager || "";
//   const dmFinal =
//     (form?.deliveryManager === "__other__" && form?.deliveryManagerOther?.trim()) ||
//     form?.deliveryManager || "";
//   const pmFinal =
//     (form?.pm === "__other__" && form?.pmOther?.trim()) ||
//     form?.pm || "";

//   return {
//     lob: form?.lob || "",
//     noOfPositions: Number(form?.noOfPositions || 0),
//     skillCluster: skillClusterStr,
//     primarySkills: asCsv(form?.primarySkills),
//     secondarySkills: asCsv(form?.secondarySkills),
//     demandReceivedDate: form?.demandReceivedDate || "",
//     hiringManager: hmFinal,
//     salesSpoc: form?.salesSpoc || "",
//     deliveryManager: dmFinal,
//     hbu: form?.hbu || "",
//     demandType: form?.demandType || "",
//     demandTimeline: form?.demandTimeline || "",
//     demandLocation: (form?.demandLocation || []).join(","), // CSV
//     pm: pmFinal,
//     band: form?.band || "",
//     priority: form?.priority || "",
//     pmo: form?.pmo || "",
//     remark: form?.remark || "",
//   };
// };

// export default function Draft1() {
//   const navigate = useNavigate();
//   const [drafts, setDrafts] = useState([]);
//   const [submittingId, setSubmittingId] = useState(null);

//   const loadDrafts = useCallback(() => {
//     setDrafts(listDrafts1() || []);
//   }, []);

//   useEffect(() => {
//     loadDrafts();
//   }, [loadDrafts]);

//   // Auto-refresh when returning to tab
//   useEffect(() => {
//     const onFocus = () => loadDrafts();
//     const onVisibility = () => {
//       if (document.visibilityState === "visible") loadDrafts();
//     };
//     window.addEventListener("focus", onFocus);
//     document.addEventListener("visibilitychange", onVisibility);
//     return () => {
//       window.removeEventListener("focus", onFocus);
//       document.removeEventListener("visibilitychange", onVisibility);
//     };
//   }, [loadDrafts]);

//   // Build the table rows
//   const dataSource = useMemo(
//     () =>
//       (drafts || []).map((d) => {
//         const f = d.form || {};
//         return {
//           key: d.id, // used internally; not shown
//           _record: d, // keep original for submit/edit
//           userName: d._savedBy || "—",
//           businessUnit: f.lob || "—",                // LOB
//           businessFunction: f.hbu || "—",            // mapping: HBU as Business Function
//           assignedRole: skillLabel(f.skillCluster),  // Skill Cluster
//           location: firstLocation(f.demandLocation),
//           createdAt: d.createdAt ? formatCreatedAt(d.createdAt) : "—",
//           updatedBy: d._savedBy || "—",              // we only have _savedBy locally
//         };
//       }),
//     [drafts]
//   );

//   const handleSubmit = async (rec) => {
//     try {
//       setSubmittingId(rec.key);
//       const payload = toStep1Payload(rec._record?.form || {});
//       // Minimal validations
//       if (!payload.lob) return message.warning("LOB is required.");
//       if (!payload.noOfPositions || payload.noOfPositions < 1)
//         return message.warning("No. of Positions must be at least 1.");
//       if (!payload.skillCluster) return message.warning("Skill Cluster is required.");
//       if (!payload.demandReceivedDate)
//         return message.warning("Demand Received Date is required.");

//       const res = await submitStep1(payload);
//       const serverDTO = res?.data ?? res;

//       deleteDraft1(rec.key);
//       loadDrafts();
//       message.success("Demand submitted. Demand ID generated.");
//       navigate("/addDemands2", { state: { form1Data: serverDTO } });
//     } catch (err) {
//       console.error("Submit draft failed:", err);
//       message.error(err?.message || "Could not submit draft.");
//     } finally {
//       setSubmittingId(null);
//     }
//   };

//   // Compact, evenly spaced columns (same widths)
//   const columns = [
//     {
//       title: "User Name",
//       dataIndex: "userName",
//       key: "userName",
//       width: 180,
//       ellipsis: true,
//       render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
//     },
//     {
//       title: "Business Unit",
//       dataIndex: "businessUnit",
//       key: "businessUnit",
//       width: 160,
//       ellipsis: true,
//     },
//     {
//       title: "Business Function",
//       dataIndex: "businessFunction",
//       key: "businessFunction",
//       width: 160,
//       ellipsis: true,
//     },
//     {
//       title: "Assigned Role",
//       dataIndex: "assignedRole",
//       key: "assignedRole",
//       width: 180,
//       ellipsis: true,
//     },
//     {
//       title: "Location",
//       dataIndex: "location",
//       key: "location",
//       width: 140,
//       ellipsis: true,
//     },
//     {
//       title: "Created At",
//       dataIndex: "createdAt",
//       key: "createdAt",
//       width: 180,
//       ellipsis: true,
//     },
//     {
//       title: "Updated By",
//       dataIndex: "updatedBy",
//       key: "updatedBy",
//       width: 160,
//       ellipsis: true,
//       render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       fixed: "right",
//       width: 110,
//       render: (_, rec) => (
//         <Button
//           type="primary"
//           size="small"
//           icon={<SendOutlined />}
//           loading={submittingId === rec.key}
//           onClick={(e) => {
//             e.stopPropagation(); // don’t trigger row click
//             handleSubmit(rec);
//           }}
//         >
//           Submit
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <Layout>
//       <div className="mb-2">
//         <h1 className="text-lg font-bold">Drafts</h1>
//       </div>

//       <Table
//         className="drafts-compact"
//         columns={columns}
//         dataSource={dataSource}
//         pagination={false}       // simple list, no pagination as per your ask
//         size="middle"            // compact height
//         rowKey="key"
//         onRow={(rec) => ({
//           onClick: () => {
//             // Row click → open editor
//             navigate("/addDemands1", { state: { draftId: rec.key } });
//           },
//         })}
//         scroll={{ x: 1290, y: undefined }} // horizontal if needed; header stays aligned
//         sticky
//       />
//     </Layout>
//   );
// }



// src/Components/DemandsManagement/AddNewDemand/Draft1.jsx
// Clean, compact list using antd Table. No Draft ID shown.
// Only Submit action; row click opens AddDemand (Step-1) to edit.
// ✅ Columns: User + all 18 Step-1 fields + Actions.

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Layout from "../../Layout.jsx";
import { useNavigate } from "react-router-dom";
import { Button, message, Table } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { listDrafts1, deleteDraft1 } from "../../../utils/draftsStore1.js";
import { submitStep1 } from "../../api/Demands/addDemands.js";

// ---------- helpers ----------
const joinLabels = (arr) => {
  if (!Array.isArray(arr)) return "—";
  const vals = arr
    .map((x) => (typeof x === "object" ? x.label ?? x.value ?? "" : String(x ?? "")))
    .filter(Boolean);
  return vals.length ? vals.join(", ") : "—";
};
const joinLocations = (loc) => {
  if (!loc) return "—";
  if (Array.isArray(loc)) return loc.length ? loc.join(", ") : "—";
  if (typeof loc === "string") return loc || "—";
  return "—";
};
const fmtDate = (d) => {
  try {
    if (!d) return "—";
    const ddMmm = /^[0-3]?\d-[A-Za-z]{3}-\d{4}$/.test(d);
    if (ddMmm) return d;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
};
const mgrLabel = (value, other) =>
  value === "__other__" ? (other || "—") : (value || "—");

const skillLabel = (s) =>
  (s && typeof s === "object" ? s.label ?? s.value : s) || "—";

// Build Step-1 payload (same as your Step-1 submit)
const toStep1Payload = (form = {}) => {
  const asCsv = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((x) => (x?.value ?? x ?? ""))
      .join(",");

  const skillClusterStr = form?.skillCluster?.value ?? form?.skillCluster ?? "";
  const hmFinal =
    (form?.hiringManager === "__other__" && form?.hiringManagerOther?.trim()) ||
    form?.hiringManager || "";
  const dmFinal =
    (form?.deliveryManager === "__other__" && form?.deliveryManagerOther?.trim()) ||
    form?.deliveryManager || "";
  const pmFinal =
    (form?.pm === "__other__" && form?.pmOther?.trim()) ||
    form?.pm || "";

  return {
    lob: form?.lob || "",
    noOfPositions: Number(form?.noOfPositions || 0),
    skillCluster: skillClusterStr,
    primarySkills: asCsv(form?.primarySkills),
    secondarySkills: asCsv(form?.secondarySkills),
    demandReceivedDate: form?.demandReceivedDate || "",
    hiringManager: hmFinal,
    salesSpoc: form?.salesSpoc || "",
    deliveryManager: dmFinal,
    hbu: form?.hbu || "",
    demandType: form?.demandType || "",
    demandTimeline: form?.demandTimeline || "",
    demandLocation: (form?.demandLocation || []).join(","), // CSV
    pm: pmFinal,
    band: form?.band || "",
    priority: form?.priority || "",
    pmo: form?.pmo || "",
    remark: form?.remark || "",
  };
};

export default function Draft1() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [submittingId, setSubmittingId] = useState(null);

  const loadDrafts = useCallback(() => {
    setDrafts(listDrafts1() || []);
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  // Auto-refresh when returning to tab
  useEffect(() => {
    const onFocus = () => loadDrafts();
    const onVisibility = () => {
      if (document.visibilityState === "visible") loadDrafts();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadDrafts]);

  // Build the table rows with all 18 fields
  const dataSource = useMemo(
    () =>
      (drafts || []).map((d) => {
        const f = d.form || {};
        return {
          key: d.id,                         // internal only
          _record: d,                        // for submit/edit
          user: d._savedBy || "—",           // (extra) leftmost
          lob: f.lob || "—",                 // 1. LOB
          positions: f.noOfPositions ?? "—", // 2. No. of Positions
          skillCluster: skillLabel(f.skillCluster), // 3. Skill Cluster
          primarySkills: joinLabels(f.primarySkills), // 4. Primary Skills
          secondarySkills: joinLabels(f.secondarySkills), // 5. Secondary Skills
          hiringManager: mgrLabel(f.hiringManager, f.hiringManagerOther), // 6
          deliveryManager: mgrLabel(f.deliveryManager, f.deliveryManagerOther), // 7
          pm: mgrLabel(f.pm, f.pmOther),     // 8. Project Manager
          salesSpoc: f.salesSpoc || "—",     // 9
          pmo: f.pmo || "—",                 // 10
          hbu: f.hbu || "—",                 // 11
          demandTimeline: f.demandTimeline || "—", // 12
          demandType: f.demandType || "—",   // 13
          locations: joinLocations(f.demandLocation), // 14
          band: f.band || "—",               // 15
          priority: f.priority || "—",       // 16
          receivedDate: fmtDate(f.demandReceivedDate), // 17
          remark: f.remark || "—",           // 18
        };
      }),
    [drafts]
  );

  // Column factory for consistent ellipsis + title tooltip
  const Col = (title, dataIndex, width = 140, strong = false) => ({
    title,
    dataIndex,
    key: dataIndex,
    width,
    ellipsis: true,
    render: (text) =>
      strong ? (
        <span style={{ fontWeight: 600 }} title={String(text ?? "")}>
          {text}
        </span>
      ) : (
        <span title={String(text ?? "")}>{text}</span>
      ),
  });

  // ✅ Replace previous summary columns with ALL 18 fields (+ User + Actions)
  const columns = [
    Col("User", "user", 160, true),             // (extra) user who saved it
    Col("LOB", "lob", 110),                     // 1
    Col("Positions", "positions", 90),          // 2
    Col("Skill Cluster", "skillCluster", 180),  // 3
    Col("Primary Skills", "primarySkills", 220),// 4
    Col("Secondary Skills", "secondarySkills", 220), // 5
    Col("Hiring Manager", "hiringManager", 160), // 6
    Col("Delivery Manager", "deliveryManager", 160), // 7
    Col("Project Manager", "pm", 160),          // 8
    Col("Sales SPOC", "salesSpoc", 140),        // 9
    Col("PMO", "pmo", 120),                     // 10
    Col("HBU", "hbu", 100),                     // 11
    Col("Timeline", "demandTimeline", 130),     // 12
    Col("Type", "demandType", 110),             // 13
    Col("Locations", "locations", 220),         // 14
    Col("Band", "band", 90),                    // 15
    Col("Priority", "priority", 110),           // 16
    Col("Received Date", "receivedDate", 140),  // 17
    Col("Remark", "remark", 240),               // 18
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 110,
      render: (_, rec) => (
        <Button
          type="primary"
          size="small"
          icon={<SendOutlined />}
          loading={submittingId === rec.key}
          onClick={(e) => {
            e.stopPropagation(); // don’t trigger row click
            (async () => {
              try {
                setSubmittingId(rec.key);
                const payload = toStep1Payload(rec._record?.form || {});
                // Minimal validations
                if (!payload.lob) return message.warning("LOB is required.");
                if (!payload.noOfPositions || payload.noOfPositions < 1)
                  return message.warning("No. of Positions must be at least 1.");
                if (!payload.skillCluster) return message.warning("Skill Cluster is required.");
                if (!payload.demandReceivedDate)
                  return message.warning("Demand Received Date is required.");
                const res = await submitStep1(payload);
                const serverDTO = res?.data ?? res;
                deleteDraft1(rec.key);
                loadDrafts();
                message.success("Demand submitted. Demand ID generated.");
                navigate("/addDemands2", { state: { form1Data: serverDTO } });
              } catch (err) {
                console.error("Submit draft failed:", err);
                message.error(err?.message || "Could not submit draft.");
              } finally {
                setSubmittingId(null);
              }
            })();
          }}
        >
          Submit
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="mb-2">
        <h1 className="text-lg font-bold">Drafts</h1>
      </div>

      <Table
        className="drafts-compact"
        columns={columns}
        dataSource={dataSource}
        pagination={false}        // no pagination as per your ask
        size="middle"             // compact height
        rowKey="key"
        onRow={(rec) => ({
          onClick: () => navigate("/addDemands1", { state: { draftId: rec.key } }),
        })}
        // width sum ~3000px → enable horizontal scroll; sticky keeps header aligned
        scroll={{ x: 3000 }}
        sticky
      />
    </Layout>
  );
}