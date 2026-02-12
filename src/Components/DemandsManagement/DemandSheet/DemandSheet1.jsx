// src/Components/DemandsManagement/DemandSheet1.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Alert, Button, Modal, message, Tabs, Pagination } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";

import Layout from "../../Layout.jsx";
import ColumnsSelector from "./ColumnsSelector.jsx";
import DemandTable from "./DemandTable.jsx";

import { getDemandsheet } from "../../api/Demands/getDemands.js";
import { getStep1Draft } from "../../api/Demands/draft.js";
import { getDropDownData } from "../../api/Demands/addDemands.js";

// ---------- helpers to flatten backend objects ----------
const nameOf = (obj) =>
  (obj && typeof obj === "object" ? (obj.name ?? "") : String(obj ?? ""));

const joinNames = (arr) =>
  Array.isArray(arr)
    ? arr.map(nameOf).filter(Boolean).join(", ")
    : nameOf(arr);

/**
 * Normalize backend DTO (objects with {id,name}, arrays) to flat table row.
 * Prefers displayDemandId (e.g., "CTO-100") as demandId for the table chip.
 */
const normalizeDemandDto = (d) => ({
  demandId: d.displayDemandId ?? d.demandId ?? d.id ?? "",
  rrNumber: String(d.rrNumber ?? ""),

  // People / org (flatten {id,name} -> name)
  lob: nameOf(d.lob),
  skillCluster: nameOf(d.skillCluster),
  hiringManager: nameOf(d.hiringManager),
  deliveryManager: nameOf(d.deliveryManager),
  pm: nameOf(d.projectManager),
  pmoSpoc: nameOf(d.pmoSpoc),
  pmo: nameOf(d.pmo),
  salesSpoc: nameOf(d.salesSpoc),
  hbu: nameOf(d.hbu),

  // Skills & locations
  primarySkills: joinNames(d.primarySkills),
  secondarySkills: joinNames(d.secondarySkills),
  demandLocation: joinNames(d.demandLocations),

  // Meta
  priority: nameOf(d.priority),
  band: nameOf(d.band),
  experience: d.experience ?? "",
  status: nameOf(d.status),
  demandType: nameOf(d.demandType),
  demandTimeline: nameOf(d.demandTimeline),

  // Dates & extra
  demandReceivedDate: d.demandReceivedDate ?? "",
  remark: d.remark ?? "",

  // Raw id / file name
  id: d.id,
  jdFileName: d.jdFileName ?? d.fileName ?? null,
});

export default function DemandSheet1() {
  const navigate = useNavigate();

  // === Columns in required sequence (as per your new order requirement) ===
  const ALL_COLUMNS = [
    { key: "demandId",        label: "Demand ID", alwaysVisible: true },
    { key: "rrNumber",        label: "RR" },
    { key: "lob",             label: "LOB" },
    { key: "skillCluster",    label: "Skill Cluster" },
    { key: "primarySkills",   label: "Primary Skill" },
    { key: "secondarySkills", label: "Secondary Skill" },

    // order right after secondary skill
    { key: "priority",        label: "Priority" },
    { key: "status",          label: "Status" },
    { key: "hbu",             label: "HBU" },
    { key: "p1Age",           label: "P1 Age" },
    { key: "demandTimeline",  label: "Demand Timeline" },
    { key: "demandType",      label: "Demand Type" },

    // remaining
    { key: "demandLocation",  label: "Demand Location" },
    { key: "hiringManager", label: "Hiring Manager" },
    { key: "deliveryManager", label: "Delivery Manager" },
    { key: "pm",              label: "PM" },
    { key: "pmoSpoc",         label: "PMO SPOC" },
    { key: "salesSpoc",       label: "Sales Spoc" },
    { key: "pmo",             label: "PMO" },
    { key: "band",            label: "Band" },
    { key: "experience",      label: "Experience" },
    { key: "statusNote",      label: "Status Note" },

    // keep available (not default-visible)
    { key: "prodProgramName",   label: "Pod /Programme Name" },
    { key: "demandReceivedDate",label: "Demand Recieved Date" },
    { key: "priorityComment",   label: "Priority Comment" },
    { key: "currentProfileShared", label: "Current Profile Shared (Drop Down)" },
    { key: "externalInternal",  label: "External / Internal" },
  ];

  // Default visible columns matching the same order (you can tweak)
  const defaultVisible = [
    "demandId","rrNumber","lob","skillCluster","primarySkills","secondarySkills",
    "priority","status","hbu","p1Age","demandTimeline","demandType",
    "demandLocation","hiringManager","deliveryManager","pm","pmoSpoc","salesSpoc","pmo","band","experience"
  ];

  // API state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Dropdowns (for RowEdit inside DemandTable)
  const [dropdowns, setDropdowns] = useState(null);
  const [ddLoading, setDdLoading] = useState(false);

  // Pagination state (UI is 1-based)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Columns selector state
  const [visibleColumns, setVisibleColumns] = useState(defaultVisible);
  const [columnsEnabled, setColumnsEnabled] = useState(false);

  // Demand details modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [detailTab, setDetailTab] = useState("details"); // 'details' | 'profile' | 'history'

  // -------- fetch and normalize list (with pagination) --------
  const loadDemands = useCallback(async (uiPage = currentPage, uiSize = pageSize) => {
    try {
      setLoading(true);
      const apiPage = Math.max(0, Number(uiPage) - 1);
      const apiSize = Number(uiSize);
      const resp = await getDemandsheet(apiPage, apiSize);

      const list =
        Array.isArray(resp?.data?.content) ? resp.data.content :
        Array.isArray(resp?.content)        ? resp.content :
        Array.isArray(resp)                 ? resp :
        [];

      const total =
        resp?.data?.totalElements ?? resp?.totalElements ??
        resp?.data?.total ?? resp?.total ??
        (Array.isArray(resp) ? resp.length : 0);

      const pageIndex =
        resp?.data?.number ?? resp?.number ?? apiPage; // 0-based
      const pageSz =
        resp?.data?.size ?? resp?.size ?? apiSize;

      const normalized = list.map(normalizeDemandDto);

      setRows(normalized);
      setTotalItems(Number.isFinite(total) ? total : normalized.length);
      setCurrentPage(Number(pageIndex) + 1);
      setPageSize(pageSz);
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
  }, [currentPage, pageSize]);

  // -------- fetch dropdowns once --------
  const loadDropdowns = async () => {
    try {
      setDdLoading(true);
      const dd = await getDropDownData();
      const data = dd?.data || dd;
      setDropdowns(data || {});
    } catch (err) {
      console.error("dropdowns load error:", err);
      message.error("Failed to load dropdown data");
    } finally {
      setDdLoading(false);
    }
  };

  useEffect(() => {
    loadDemands(1, pageSize);
    loadDropdowns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pagination handlers
  const onPageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    loadDemands(page, size);
  };
  const onPageSizeChange = (page, size) => {
    setCurrentPage(1);
    setPageSize(size);
    loadDemands(1, size);
  };

  // -------- detail modal handlers --------
  const onViewRow = (row) => {
    setDetailRow(row);
    setDetailOpen(true);
    setDetailTab("details");
  };
  const closeDetails = () => {
    setDetailOpen(false);
    setDetailRow(null);
    setDetailTab("details");
  };

  // -------- View Draft modal handlers --------
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const closeDraft = () => { setDraftOpen(false); setDraftData(null); };

  if (loading || ddLoading) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'200px' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }
  if (apiError) {
    return (
      <div style={{ padding:'16px' }}>
        <Alert message="Error" description={apiError} type="error" showIcon />
      </div>
    );
  }

  return (
    <>
      <Layout>
        <div className="">
          {/* SAME ROW: left = ColumnsSelector, center = title, right = buttons */}
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
            <div>
              <h1 className="text-lg font-bold">Demand Sheet</h1>
            </div>
            <div className="flex items-start justify-end gap-1 pt-1">
              <Button onClick={() => navigate("/drafts1")}>View Draft</Button>
              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={() =>{
    try {
      localStorage.removeItem('step1DraftId');
    } catch {}
    navigate('/addDemands1'); // change to '/addDemands1' if that's your route
  }}

                className="bg-green-800 hover:bg-green-900 text-white font-semibold border border-green-900 px-4 py-2"
              >
                Add New Demands
              </Button>
            </div>
          </div>

          {/* Table – pass dropdowns so RowEdit can use them */}
          <DemandTable
            rows={rows}
            columns={ALL_COLUMNS}
            visibleColumns={visibleColumns}
            dropdowns={dropdowns}
            onViewRow={onViewRow}
          />

          {/* Pagination controls */}
          <div className="mt-4 flex justify-end">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalItems}
              showSizeChanger
              onChange={onPageChange}
              onShowSizeChange={onPageSizeChange}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
            />
          </div>
        </div>
      </Layout>

      {/* Demand Details Modal (read-only; Update & JD removed) */}
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
                <span className="font-semibold">
                  Demand Details — {detailRow?.demandId}
                </span>
              </div>
            </div>
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
          <div className="space-y-4">
            <Tabs
              activeKey={detailTab}
              onChange={setDetailTab}
              items={[
                {
                  key: "details",
                  label: "Demand Detail",
                  children: (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      {/* Full read-only matrix including Priority, Band, Status, etc. */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div><strong>RR:</strong> {detailRow.rrNumber || "-"}</div>
                        <div><strong>Pod/Programme:</strong> {detailRow.prodProgramName || "-"}</div>

                        <div><strong>LOB:</strong> {detailRow.lob || "-"}</div>
                        <div><strong>Skill Cluster:</strong> {detailRow.skillCluster || "-"}</div>

                        <div><strong>Primary Skill:</strong> {detailRow.primarySkills || "-"}</div>
                        <div><strong>Secondary Skill:</strong> {detailRow.secondarySkills || "-"}</div>

                        <div><strong>Priority:</strong> {detailRow.priority || "-"}</div>
                        <div><strong>Status:</strong> {detailRow.status || "-"}</div>

                        <div><strong>Band:</strong> {detailRow.band || "-"}</div>
                        <div><strong>Experience:</strong> {detailRow.experience || "-"}</div>

                        <div><strong>Hiring Manager:</strong> {detailRow.hiringManager || "-"}</div>
                        <div><strong>Delivery Manager:</strong> {detailRow.deliveryManager || "-"}</div>

                        <div><strong>PM:</strong> {detailRow.pm || "-"}</div>
                        <div><strong>PMO SPOC:</strong> {detailRow.pmoSpoc || "-"}</div>

                        <div><strong>Sales Spoc:</strong> {detailRow.salesSpoc || "-"}</div>
                        <div><strong>PMO:</strong> {detailRow.pmo || "-"}</div>

                        <div><strong>HBU:</strong> {detailRow.hbu || "-"}</div>
                        <div><strong>Timeline:</strong> {detailRow.demandTimeline || "-"}</div>

                        <div><strong>Type:</strong> {detailRow.demandType || "-"}</div>
                        <div><strong>Received Date:</strong> {detailRow.demandReceivedDate || "-"}</div>

                        <div className="sm:col-span-2"><strong>Location:</strong> {detailRow.demandLocation || "-"}</div>
                        <div className="sm:col-span-2"><strong>Remark:</strong> {detailRow.remark || "-"}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "profile",
                  label: "Profile Shared",
                  children: (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm text-sm">
                      <div className="space-y-2">
                        <div><strong>Current Profile Shared:</strong> {"-"}</div>
                        <div><strong>Date of Profile Shared:</strong> {"-"}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "history",
                  label: "History",
                  children: (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="space-y-2 text-sm">
                        <div><strong>Updated By:</strong> {"-"}</div>
                        <div><strong>Updated At:</strong> {"-"} </div>
                        <div><strong>Updated Data:</strong></div>
                        <pre className="bg-gray-50 p-2 rounded border border-gray-200 overflow-auto text-xs">
                          {"No change log available."}
                        </pre>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
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