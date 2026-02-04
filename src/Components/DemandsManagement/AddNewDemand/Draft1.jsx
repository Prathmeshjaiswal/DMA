// src/Components/DemandsManagement/AddNewDemand/Draft1.jsx
// Clean, compact list using antd Table. No Draft ID shown.
// Only Edit action; click Edit to open AddDemand (Step-1) to edit the draft.
// ✅ Columns: Series + User + all 18 Step-1 fields + Actions.

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Layout from "../../Layout.jsx";
import { useNavigate } from "react-router-dom";
import { Button, Table } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { listDrafts1 } from "../../../utils/draftsStore1.js";

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

export default function Draft1() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);

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

  // Build the table rows with all 18 fields + Series + User
  const dataSource = useMemo(
    () =>
      (drafts || []).map((d, idx) => {
        const f = d.form || {};
        return {
          key: d.id,                         // internal only
          _record: d,                        // for edit
          series: idx + 1,                   // Series (1-based)
          user: d._savedBy || "—",           // User who saved it
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

  // ✅ Columns: Series before User; Action is "Edit" (no Submit).
  // ✅ Row click navigation removed; navigation only via Edit button.
  const columns = [
    Col("Series", "series", 80, true),          // NEW: Series column
    Col("User", "user", 160, true),
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
      width: 100,
      render: (_, rec) => (
        <Button
          type="default"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation(); // safety
            navigate("/addDemands1", { state: { draftId: rec.key } });
          }}
        >
          Edit
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
       className="drafts-compact drafts-dense"
        // className="drafts-compact"
        columns={columns}
        dataSource={dataSource}
        pagination={false}        // still no pagination
        size="small"             // compact height
        rowKey="key"
        // Removed onRow navigation — row click does nothing now
        scroll={{ x: 3000 }}      // wide table → horizontal scroll
        sticky
      />
    </Layout>
  );
}