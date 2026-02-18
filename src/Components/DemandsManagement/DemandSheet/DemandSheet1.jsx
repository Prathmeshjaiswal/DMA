// src/Components/DemandsManagement/DemandSheet1.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Alert, Button, message, Pagination } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import Layout from "../../Layout.jsx";
import ColumnsSelector from "./ColumnsSelector.jsx";
import DemandTable from "./DemandTable.jsx";
import DemandDetailModal from "./DemandDetailModal.jsx";


import { getDemandsheet } from "../../api/Demands/getDemands.js";
import { getDropDownData } from "../../api/Demands/addDemands.js";
import { searchDemands } from "../../api/Demands/getDemands.js";

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

  // === Columns in required sequence (as per your order) ===
  const ALL_COLUMNS = [
    { key: "demandId",        label: "Demand ID", alwaysVisible: true },
    { key: "rrNumber",        label: "RR" },
    { key: "lob",             label: "LOB" },
    { key: "skillCluster",    label: "Skill Cluster" },
    { key: "primarySkills",   label: "Primary Skill" },
    { key: "secondarySkills", label: "Secondary Skill" },
    { key: "priority",        label: "Priority" },
    { key: "status",          label: "Status" },
    { key: "hbu",             label: "HBU" },
    { key: "p1Age",           label: "P1 Age" }, // (kept for order; not filtering)
    { key: "demandTimeline",  label: "Demand Timeline" },
    { key: "demandType",      label: "Demand Type" },
    { key: "demandLocation",  label: "Demand Location" },
    { key: "hiringManager",   label: "Hiring Manager" },
    { key: "deliveryManager", label: "Delivery Manager" },
    { key: "pm",              label: "PM" },
    { key: "pmoSpoc",         label: "PMO SPOC" },
    { key: "salesSpoc",       label: "Sales Spoc" },
    { key: "pmo",             label: "PMO" },
    { key: "band",            label: "Band" },
    { key: "experience",      label: "Experience" },
    { key: "statusNote",      label: "Status Note" },

    // keep available (not default-visible)
    { key: "prodProgramName",     label: "Pod /Programme Name" },
    { key: "demandReceivedDate",  label: "Demand Recieved Date" },
    { key: "priorityComment",     label: "Priority Comment" },
    { key: "currentProfileShared",label: "Current Profile Shared (Drop Down)" },
    { key: "externalInternal",    label: "External / Internal" },
  ];

  // Default visible columns matching the same order
  const defaultVisible = [
    "demandId","rrNumber","lob","skillCluster","primarySkills","secondarySkills",
    "priority","status","hbu","p1Age","demandTimeline","demandType",
    "demandLocation","hiringManager","deliveryManager","pm","pmoSpoc","salesSpoc","pmo","band","experience"
  ];

  // API state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Dropdowns (for filter selects)
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

  // ---------------- Filters (header) ----------------
  const [filters, setFilters] = useState({
    demandId: "",
    rrNumber: "",
    lob: "",
    skillCluster: "",
    primarySkills: "",
    secondarySkills: "",
    priority: "",           // P1/P2/P3
    status: "",
    hbu: "",
    demandTimeline: "",
    demandType: "",
    demandLocation: "",
    hiringManager: "",
    deliveryManager: "",
    pm: "",
    pmoSpoc: "",
    salesSpoc: "",
    pmo: "",
    band: "",
    experience: "",
  });

  const filterConfig = useMemo(() => {
    const text = { type: "text" };
    const mkSel = (arr) => Array.isArray(arr) ? { type: "select", options: arr } : text;

    return {
      demandId: text,
      rrNumber: text,
      lob: text,
      skillCluster: text,
      primarySkills: text,
      secondarySkills: text,
      priority: { type: "select", options: [{ name: "P1" }, { name: "P2" }, { name: "P3" }] },
      status: text,
      hbu: text,
      demandTimeline: mkSel(dropdowns?.demandTimeline), // expects [{id,name}]
      demandType: mkSel(dropdowns?.demandType),         // expects [{id,name}]
      demandLocation: text,
      hiringManager: text,
      deliveryManager: text,
      pm: text,
      pmoSpoc: text,
      salesSpoc: text,
      pmo: text,
      band: text,
      experience: text,
    };
  }, [dropdowns]);

  const hasAnyFilter = useMemo(
    () => Object.values(filters).some((v) => String(v ?? "").trim() !== ""),
    [filters]
  );

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const buildFilterPayload = (f) => {
    return {
      demandId: f.demandId || undefined,
      rrNumber: f.rrNumber || undefined,
      lob: f.lob || undefined,
      skillCluster: f.skillCluster || undefined,
      primarySkills: f.primarySkills || undefined,
      secondarySkills: f.secondarySkills || undefined,
      priority: f.priority || undefined, // P1/P2/P3
      status: f.status || undefined,
      hbu: f.hbu || undefined,
      demandTimeline: f.demandTimeline || undefined,
      demandType: f.demandType || undefined,
      demandLocation: f.demandLocation || undefined,
      hiringManager: f.hiringManager || undefined,
      deliveryManager: f.deliveryManager || undefined,
      pm: f.pm || undefined,
      pmoSpoc: f.pmoSpoc || undefined,
      salesSpoc: f.salesSpoc || undefined,
      pmo: f.pmo || undefined,
      band: f.band || undefined,
      experience: f.experience || undefined,
    };
  };

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

  const loadDemands = useCallback(
    async (uiPage = currentPage, uiSize = pageSize) => {
      try {
        setLoading(true);
        const apiPage = Math.max(0, Number(uiPage) - 1);
        const apiSize = Number(uiSize);

        let resp;
        if (hasAnyFilter) {
          const payload = buildFilterPayload(filters);
          resp = await searchDemands(payload, apiPage, apiSize);
        } else {
          resp = await getDemandsheet(apiPage, apiSize);
        }

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
    },
    [currentPage, pageSize, filters, hasAnyFilter]
  );

  useEffect(() => {
    loadDropdowns();
    loadDemands(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadDemands(1, pageSize);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

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

  const onViewRow = (row) => {
    setDetailRow(row);
    setDetailOpen(true);
  };
  const closeDetails = () => {
    setDetailOpen(false);
    setDetailRow(null);
  };

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
                  try { localStorage.removeItem('step1DraftId'); } catch {}
                  navigate('/addDemands1');
                }}
                className="bg-green-800 hover:bg-green-900 text-white font-semibold border border-green-900 px-4 py-2"
              >
                Add New Demands
              </Button>
            </div>
          </div>

          {/* Table – with header search fields */}
          <DemandTable
            rows={rows}
            columns={ALL_COLUMNS}
            visibleColumns={visibleColumns}
            dropdowns={dropdowns}
            onViewRow={onViewRow}
            filters={filters}
            filterConfig={filterConfig}
            onFilterChange={setFilter}
            onClearAllFilters={() => {
              setFilters((prev) =>
                Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: "" }), {})
              );
              setCurrentPage(1);
            }}
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

      {/* Demand Details Modal (fetches attached profiles from backend itself) */}
      <DemandDetailModal
        open={detailOpen}
        onClose={closeDetails}
        row={detailRow}
        statusChip={detailRow?.status}
      />
    </>
  );
}