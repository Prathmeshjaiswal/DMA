

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDemandsheet } from "../../api/Demands/getDemands.js";
import ColumnsSelector from "./ColumnsSelector.jsx";
import DemandTable from "./DemandTable.jsx";
import { Spin, Alert, Button, Modal, message, Tag } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import Layout from "../../Layout.jsx";
import { getStep1Draft } from "../../api/Demands/draft.js";

const ORANGE = "#F15B40";

export default function DemandSheet1() {
  const navigate = useNavigate();

  // === Columns in required sequence ===
  const ALL_COLUMNS = [
    { key: "demandId",        label: "Demand ID", alwaysVisible: true },
    { key: "rrNumber",        label: "RR" },
    { key: "lob",             label: "LOB" },
    { key: "skillCluster",    label: "Skill Cluster" },
    { key: "primarySkills",   label: "Primary Skill" },
    { key: "secondarySkills", label: "Secondary Skill" },
    { key: "hiringManager",   label: "HSBC Hiring Manager" },
    { key: "deliveryManager", label: "Delivery Manager" },
    { key: "pm",              label: "PM" },
    { key: "pmoSpoc",         label: "PMO SPOC" },
    { key: "salesSpoc",       label: "Sales Spoc" },
    { key: "hbu",             label: "HBU" },
    { key: "demandTimeline",  label: "Demand Timeline" },
    { key: "demandType",      label: "Demand Type" },
    { key: "demandLocation",  label: "Demand Location" },
    { key: "priority",        label: "Priority" },
    { key: "status",          label: "Status" },
    // extra default-visible fields
    { key: "prodProgramName", label: "Pod /Programme Name" },
    { key: "p1Age",           label: "P1 Age" },

    // keep available (not default-visible)
    { key: "demandReceivedDate", label: "Demand Recieved Date" },
    { key: "pmo",                label: "PMO" },
    { key: "priorityComment",    label: "Priority Comment" },
    { key: "band",               label: "Band" },
    { key: "currentProfileShared", label: "Current Profile Shared (Drop Down)" },
    { key: "externalInternal",   label: "External / Internal" },
    { key: "experience",         label: "Experience" },
  ];

  // Default visible columns per your ask
  const defaultVisible = [
    "demandId","rrNumber","lob","skillCluster","primarySkills","secondarySkills",
    "hiringManager","deliveryManager","pm","pmoSpoc","salesSpoc","hbu",
    "demandTimeline","demandType","demandLocation","priority","status",
    "prodProgramName","p1Age"
  ];

  // API state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Columns selector state
  const [visibleColumns, setVisibleColumns] = useState(defaultVisible);
  const [columnsEnabled, setColumnsEnabled] = useState(false);

  // DTO -> UI
  const normalizeDemandDto = (d) => ({
    demandId: d.demandId ?? "",
    rrNumber: (d.rrNumber ?? d.rr ?? "").toString(),
    demandReceivedDate: d.demandReceivedDate ?? d.demandRecievedDate ?? "",
    prodProgramName: d.prodProgramName ?? d.podprogrammeName ?? "",
    lob: d.lob ?? "",
    hiringManager: d.hiringManager ?? d.manager ?? "",
    deliveryManager: d.deliveryManager ?? "",
    pmo: d.pmo ?? "",
    pmoSpoc: d.pmoSpoc ?? "",
    pm: d.pm ?? "",
    hbu: d.hbu ?? "",
    skillCluster: d.skillCluster ?? "",
    primarySkills: d.primarySkills ?? d.primarySkill ?? "",
    secondarySkills: d.secondarySkills ?? d.secondarySkill ?? "",
    experience: d.experience ?? "",
    priority: d.priority ?? "",
    demandLocation: d.demandLocation ?? "",
    salesSpoc: d.salesSpoc ?? "",
    priorityComment: d.priorityComment ?? "",
    band: d.band ?? "",
    p1Age: d.p1Age ?? "",
    currentProfileShared: d.currentProfileShared,
    dateOfProfileShared: d.dateOfProfileShared ?? "",
    externalInternal: d.externalInternal ?? "",
    status: d.status ?? "",
    demandType: d.demandType ?? "",
    demandTimeline: d.demandTimeline ?? "",
    id: d.id,
    // optional history fields
    updatedBy: d.updatedBy ?? "",
    updatedAt: d.updatedAt ?? "",
    updatedData: d.updatedData ?? null,
  });

  useEffect(() => {
    (async () => {
      try {
        const resp = await getDemandsheet();
        const list = Array.isArray(resp?.data.updateDemandDTOList) ? resp.data.updateDemandDTOList : [];
        const normalized = list.map(normalizeDemandDto);
        setRows(normalized);
      } catch (err) {
        const msg =
          err?.userMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load demands";
        setApiError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Demand details modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const onViewRow = (row) => { setDetailRow(row); setDetailOpen(true); };
  const closeDetails = () => { setDetailOpen(false); setDetailRow(null); };

  // View Draft (Step 1)
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftData, setDraftData] = useState(null);

const openDraft = async () => {
    try {
      const draftId = localStorage.getItem("step1DraftId");
      if (!draftId) {
        message.info("No Step-1 draftId found. Save a Step-1 draft first.");
        return;
      }
      const resp = await getStep1Draft(Number(draftId));
      if (!resp?.success) throw new Error(resp?.message || "Draft fetch failed");
      setDraftData(resp?.data || {});
      setDraftOpen(true);
    } catch (e) {
      console.error("Load draft error:", e);
      message.error(e?.message || "Failed to load draft.");
    }
  };

  const closeDraft = () => { setDraftOpen(false); setDraftData(null); };

  if (loading) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'200px' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }
  if (apiError) {
    return (
      <div style={{ padding:'16px' }}>
        <Alert title="Error" description={apiError} type="error" showIcon />
      </div>
    );
  }

  return (
    <>
      <Layout>
        <div className="">

          {/* SAME ROW: left = ColumnsSelector, right = buttons */}
          <div className="mb-4 grid grid-cols-3 w-full items-center">
            <ColumnsSelector
              columnsEnabled={columnsEnabled}
              setColumnsEnabled={setColumnsEnabled}
              ALL_COLUMNS={ALL_COLUMNS}
              visibleColumns={visibleColumns}
              toggleColumn={(key) =>
                setVisibleColumns((prev) => {
                  const meta = ALL_COLUMNS.find((c) => c.key === key);
                  if (meta?.alwaysVisible) return prev;
                  return prev.includes(key)
                    ? prev.filter((k) => k !== key)
                    : [...prev, key];
                })
              }
            />
            <div >
              <h1 className="text-lg font-bold">Demand Sheet</h1>

            </div>
            <div className="flex items-start justify-end gap-1 pt-1">
              <Button onClick={openDraft}>View Draft</Button>
<Button
type="default"
  icon={<PlusOutlined />}
  onClick={() => navigate("/addDemands1")}
  className="bg-green-800 hover:bg-green-900 text-white font-semibold border border-green-900 px-4 py-2"
>
  Add New Demands
</Button>
            </div>
          </div>

          {/* Table (keeps your UI & edit behavior) */}
          <DemandTable
            rows={rows}
            columns={ALL_COLUMNS}
            visibleColumns={visibleColumns}
            dropdowns={null}
            onViewRow={onViewRow}
          />
        </div>
      </Layout>

      {/* Demand Details Modal — cards + status capsule near close */}
      <Modal
        open={detailOpen}
        onCancel={closeDetails}
        footer={null}
        width={980}
        title={
          <div className="flex items-center justify-between pr-10">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-gray-800">
                <EyeOutlined />
                <span className="font-semibold">Demand Details — {detailRow?.demandId}</span>
              </div>
            </div>

            {/* Status capsule aligned near close btn */}
            {detailRow?.status ? (
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: "#EDF2F7",
                  color: "#2D3748",
                  border: "1px solid #CBD5E0",
                }}
                title="Status"
              >
                {detailRow.status}
              </span>
            ) : null}
          </div>
        }
      >
        {detailRow ? (
          // ⬇️ CHANGED: stacked row layout (three rows)
          <div className="space-y-4">
            {/* Row 1: Details (full width card) */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-3">Details</h3>

              {/* Inside Details: tidy 2-column rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div><strong>RR:</strong> {detailRow.rrNumber || "-"}</div>
                <div><strong>Pod/Programme:</strong> {detailRow.prodProgramName || "-"}</div>

                <div><strong>LOB:</strong> {detailRow.lob || "-"}</div>
                <div><strong>Skill Cluster:</strong> {detailRow.skillCluster || "-"}</div>

                <div><strong>Primary Skill:</strong> {detailRow.primarySkills || "-"}</div>
                <div><strong>Secondary Skill:</strong> {detailRow.secondarySkills || "-"}</div>

                <div><strong>Hiring Manager:</strong> {detailRow.hiringManager || "-"}</div>
                <div><strong>Delivery Manager:</strong> {detailRow.deliveryManager || "-"}</div>

                <div><strong>PM:</strong> {detailRow.pm || "-"}</div>
                <div><strong>PMO SPOC:</strong> {detailRow.pmoSpoc || "-"}</div>

                <div><strong>Sales Spoc:</strong> {detailRow.salesSpoc || "-"}</div>
                <div><strong>HBU:</strong> {detailRow.hbu || "-"}</div>

                <div><strong>Timeline:</strong> {detailRow.demandTimeline || "-"}</div>
                <div><strong>Type:</strong> {detailRow.demandType || "-"}</div>

                <div className="sm:col-span-2"><strong>Location:</strong> {detailRow.demandLocation || "-"}</div>
                {/* Status intentionally removed from Details (shown top‑right) */}
              </div>
            </div>

            {/* Row 2: Profiles Shared (full width card) */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-3">Profiles Shared</h3>
              <div className="text-sm">
                {detailRow.currentProfileShared != null ? (
                  <>Current Profile Shared: <strong>{String(detailRow.currentProfileShared)}</strong></>
                ) : (
                  <span className="text-gray-500">No profile data available.</span>
                )}
              </div>
            </div>

            {/* Row 3: History (full width card) */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-3">History</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Updated By:</strong> {detailRow.updatedBy || "-"}</div>
                <div><strong>Updated At:</strong> {detailRow.updatedAt || "-"}</div>
                <div><strong>Updated Data:</strong></div>
                <pre className="bg-gray-50 p-2 rounded border border-gray-200 overflow-auto text-xs">
                  {detailRow.updatedData ? JSON.stringify(detailRow.updatedData, null, 2) : "No change log available."}
                </pre>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* View Draft Modal */}
      <Modal open={draftOpen} onCancel={closeDraft} footer={null} title="Step 1 Draft" width={720}>
        <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto">
{draftData ? JSON.stringify(draftData, null, 2) : "No draft present."}
        </pre>
      </Modal>
    </>
  );
}
