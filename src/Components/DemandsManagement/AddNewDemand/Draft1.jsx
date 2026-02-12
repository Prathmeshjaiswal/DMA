// src/Components/DemandsManagement/Draft1.jsx
import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../Layout.jsx";
import { useNavigate } from "react-router-dom";
import { Button, Table, message, Tooltip } from "antd";
import { EditOutlined, DownloadOutlined } from "@ant-design/icons";

import { listDrafts, downloadDraftJD } from "../../api/Demands/draft.js";

/* ---------------- helpers to read labels safely ---------------- */

// if obj is {id,name}, return name; if string, return it; else "—"
const labelFrom = (v) => {
  if (v == null) return "—";
  if (typeof v === "string") return v || "—";
  if (typeof v === "number") return String(v);
  if (typeof v === "object") {
    if (v.label != null) return String(v.label || "—");
    if (v.name != null) return String(v.name || "—");
    if (v.value != null) return String(v.value || "—");
  }
  return "—";
};


const firstRRFileName = (draft) => {
  const candidates = [draft?.rrDrafts, draft?.rrs, draft?.rr, draft?.rrList];
  for (const arr of candidates) {
    if (Array.isArray(arr)) {
      const hit = arr.find((x) => x?.fileName);
      if (hit?.fileName) return hit.fileName;
    }
  }
  return null;
};

// join array of objects/strings into "a, b, c"
const joinNames = (arr) => {
  if (!Array.isArray(arr)) return "—";
  const out = arr
    .map((x) => labelFrom(x))
    .map((s) => String(s).trim())
    .filter((s) => s && s !== "—");
  return out.length ? out.join(", ") : "—";
};

// join locations which might be array of {id,name} or array of strings
const joinLocations = (loc) => {
  if (!loc) return "—";
  if (Array.isArray(loc)) return joinNames(loc);
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
    return dt.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const mgrLabel = (value, other) =>
  value === "__other__" ? (other || "—") : labelFrom(value);

// Safely pick first non-null/undefined value by possible keys
const pick = (obj, keys = [], fallback = undefined) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return fallback;
};

/* ---------------------------------------------------------------- */

export default function Draft1() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDraftsFromServer = async () => {
    try {
      setLoading(true);
      const list = await listDrafts();
      setDrafts(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      message.error(e?.message || "Failed to load drafts");
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDraftsFromServer();
    // optional: auto-refresh when the tab gains focus
    const onFocus = () => loadDraftsFromServer();
    const onVisibility = () => {
      if (document.visibilityState === "visible") loadDraftsFromServer();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /**
   * Normalize each draft row for the table — mapping from your current backend shape:
   * e.g. { band: {id,name}, createdByName, createdByUserId, demandLocations:[{id,name}], ... }
   */
  const dataSource = useMemo(
    () =>
      (drafts || []).map((d, idx) => {
        // The draft id may be 'id' or 'draftId'
        const draftKey = pick(d, ["id", "draftId", "key"], `draft-${idx}`);

        // Common fields: fallbacks for either nested {id,name} or direct strings
        const lob = labelFrom(pick(d, ["lob", "lobObj", "lobName"]));
        const skillCluster = labelFrom(
          pick(d, ["skillCluster", "skillClusterObj", "skillClusterName"])
        );
        const priority = labelFrom(
          pick(d, ["priority", "priorityObj", "priorityName"])
        );
        const band = labelFrom(pick(d, ["band", "bandObj", "bandName"]));

        // Managers & SPOCs
        const hiringManager = labelFrom(
          pick(d, ["hiringManager", "hiringManagerObj", "hiringManagerName"])
        );
        const deliveryManager = labelFrom(
          pick(d, ["deliveryManager", "deliveryManagerObj", "deliveryManagerName"])
        );
        const pm = labelFrom(
          pick(d, ["projectManager", "pm", "projectManagerObj", "projectManagerName"])
        );
        const salesSpoc = labelFrom(pick(d, ["salesSpoc", "salesSpocObj", "salesSpocName"]));
        const pmo = labelFrom(pick(d, ["pmo", "pmoObj", "pmoName"]));
        const hbu = labelFrom(pick(d, ["hbu", "hbuObj", "hbuName"]));

        // Types/timeline
        const demandTimeline = labelFrom(
          pick(d, ["demandTimeline", "timeline", "demandTimelineObj", "demandTimelineName"])
        );
        const demandType = labelFrom(
          pick(d, ["demandType", "type", "demandTypeObj", "demandTypeName"])
        );

        // Arrays
        const primarySkills = joinNames(
          pick(d, ["primarySkills", "primarySkillList", "primarySkillIds"], [])
        );
        const secondarySkills = joinNames(
          pick(d, ["secondarySkills", "secondarySkillList", "secondarySkillIds"], [])
        );
        const locations = joinLocations(
          pick(d, ["demandLocations", "locationIds", "locations"], [])
        );

        // Other fields
        const positions = pick(d, ["numberOfPositions", "noOfPositions", "positions"], "—");
        const receivedDate = fmtDate(pick(d, ["demandReceivedDate", "receivedDate"], ""));
        const remark = pick(d, ["remark"], "—");

        // User (COMMENTED OUT COLUMN BELOW — keeping value here if you later re-enable)
        const user = pick(d, ["createdByName", "_savedBy", "savedBy"], "—");

        // Optional JD filename on draft (if your API returns it)
        const fileName = pick(d, ["jdFileName", "fileName"], null) || firstRRFileName(d);

        return {
          key: draftKey,
          _record: d,

          series: idx + 1,
          // user, // (column is commented out below)

          // Step‑1 style columns for display
          lob,                            // 1
          positions,                      // 2
          skillCluster,                   // 3
          primarySkills,                  // 4
          secondarySkills,                // 5
          hiringManager,                  // 6
          deliveryManager,                // 7
          pm,                             // 8
          salesSpoc,                      // 9
          pmo,                            // 10
          hbu,                            // 11
          demandTimeline,                 // 12
          demandType,                     // 13
          locations,                      // 14
          band,                           // 15
          priority,                       // 16
          receivedDate,                   // 17
          remark,                         // 18

          // keep raw filename for JD download button
          __fileName: fileName,
        };
      }),
    [drafts]
  );

  // Column factory
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

  const columns = [
    Col("Series", "series", 80, true),                // 0

    // 👇 COMMENTED OUT: User column (you can re-enable later)
    // Col("User", "user", 160, true),                // 1

    Col("LOB", "lob", 110),                           // 2
    Col("Positions", "positions", 90),                // 3
    Col("Skill Cluster", "skillCluster", 180),        // 4
    Col("Primary Skills", "primarySkills", 220),      // 5
    Col("Secondary Skills", "secondarySkills", 220),  // 6
    Col("Hiring Manager", "hiringManager", 160),      // 7
    Col("Delivery Manager", "deliveryManager", 160),  // 8
    Col("Project Manager", "pm", 160),                // 9
    Col("Sales SPOC", "salesSpoc", 140),              // 10
    Col("PMO", "pmo", 120),                           // 11
    Col("HBU", "hbu", 100),                           // 12
    Col("Timeline", "demandTimeline", 80),           // 13
    Col("Type", "demandType", 60),                   // 14
    Col("Locations", "locations", 100),               // 15
    Col("Band", "band", 50),                          // 16
    Col("Priority", "priority", 80),                 // 17
    Col("Received Date", "receivedDate", 140),        // 18
    Col("Remark", "remark", 240),                     // 19

    // ✅ New JD column with per-row download button
    {
      title: "JD",
      key: "jd",
      width: 70,
//       fixed: "right",
      render: (_, rec) => {
        const fileName = rec.__fileName;
        return (
                <Tooltip title={`${fileName}`}>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            disabled={!fileName}
            onClick={(e) => {
              e.stopPropagation();
              if (!fileName) {
                message.warning("No JD available for this draft.");
                return;
              }
              downloadDraftJD(fileName);
            }}
          >
            JD
          </Button>
          </Tooltip>
        );
      },
    },

    // ✅ Action column (in-table) for Edit
    {
      title: "Action",
      key: "action",
      width: 70,
//       fixed: "right",
      render: (_, rec) => {
        const draftId = rec.key; // we set this from id/draftId above
        return (
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate("/addDemands1", { state: { draftId } });
            }}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  return (
    <Layout>
      <div className="mb-2">
        <h1 className="text-lg font-bold">Drafts</h1>
      </div>

      <Table
        className="drafts-compact drafts-dense"
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={false}        // no pagination as per your preference
        size="small"              // compact height
        rowKey="key"
        scroll={{ x: 3000 }}      // wide table → horizontal scroll
//         sticky
      />
    </Layout>
  );
}