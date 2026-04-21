
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Alert, Button, Pagination, message } from "antd";
import { PlusOutlined, ExportOutlined } from "@ant-design/icons";

import Layout from "../../Layout.jsx";
import ColumnsSelector from "./ColumnsSelector.jsx";
import DemandTable from "./DemandTable.jsx";
import DemandDetailModal from "./DemandDetailModal.jsx";
import { exportDemandSheet } from "../../api/Export/demandsheet.js";
import { getDemandsheet, searchDemands } from "../../api/Demands/getDemands.js";
import { getDropDownData } from "../../api/Demands/addDemands.js";
import { usePermissions } from "../../Auth/PermissionProvider.jsx";

/* ================= HELPERS ================= */
const nameOf = (obj) =>
  obj && typeof obj === "object" ? obj.name ?? "" : String(obj ?? "");

const joinNames = (arr) =>
  Array.isArray(arr) ? arr.map(nameOf).filter(Boolean).join(", ") : nameOf(arr);

const onlyDigits = (s = "") => String(s ?? "").replace(/\D+/g, "");

const splitNames = (v) =>
  String(v ?? "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

// const normalizeDemandDto = (d) => ({
//   demandId: d.displayDemandId ?? d.demandId ?? d.id ?? "",
//   rrNumber: String(d.rrNumber ?? ""),
//   lob: nameOf(d.lob),
//   skillCluster: nameOf(d.skillCluster),
//   hiringManager: nameOf(d.hiringManager),
//   deliveryManager: nameOf(d.deliveryManager),
//   pm: nameOf(d.projectManager),
//   pmo: nameOf(d.pmo),
//   salesSpoc: nameOf(d.salesSpoc),
//   hbu: nameOf(d.hbu),
//   primarySkills: joinNames(d.primarySkills),
//   secondarySkills: joinNames(d.secondarySkills),
//   demandLocation: joinNames(d.demandLocations),
//   priority: nameOf(d.priority),
//   band: nameOf(d.band),
//   experience: d.experience ?? "",
//   status: nameOf(d.status),
//   demandTimeline: nameOf(d.demandTimeline),
//   demandType: nameOf(d.demandType),
//   demandReceivedDate: d.demandReceivedDate ?? "",
//   remark: d.remark ?? "",
//   karat: d.karatFlag === true ? "Yes" : d.karatFlag === false ? "No" : "",
//   id: d.id,
//   jdFileName: d.jdFileName ?? d.fileName ?? null,
// });


const normalizeDemandDto = (d) => {
  const lobName = nameOf(d.lob);
  const subLobName = nameOf(d.subLob);

  // ✅ FINAL DEMAND ID DISPLAY LOGIC
  let displayId = d.displayDemandId ?? d.demandId ?? d.id ?? "";

  // ✅ ONLY FOR CIB → use Sub‑LOB
  if (
    lobName?.toUpperCase() === "CIB" &&
    subLobName
  ) {
    const rawId =
      String(d.demandId ?? d.id ?? "")
        .replace(/^(.*?-)/, ""); // remove existing prefix if any

    displayId = `${subLobName}-${rawId}`;
  }

  return {
    demandId: displayId,
    rrNumber: String(d.rrNumber ?? ""),
    lob: lobName,
    skillCluster: nameOf(d.skillCluster),
    hiringManager: nameOf(d.hiringManager),
    deliveryManager: nameOf(d.deliveryManager),
    pm: nameOf(d.projectManager),
    pmo: nameOf(d.pmo),
    salesSpoc: nameOf(d.salesSpoc),
    hbu: nameOf(d.hbu),
    primarySkills: joinNames(d.primarySkills),
    secondarySkills: joinNames(d.secondarySkills),
    demandLocation: joinNames(d.demandLocations),
    priority: nameOf(d.priority),
    band: nameOf(d.band),
    experience: d.experience ?? "",
    status: nameOf(d.status),
    demandTimeline: nameOf(d.demandTimeline),
    demandType: nameOf(d.demandType),
    demandReceivedDate: d.demandReceivedDate ?? "",
    remark: d.remark ?? "",
    karat: d.karatFlag === true ? "Yes" : d.karatFlag === false ? "No" : "",
    id: d.id,
    jdFileName: d.jdFileName ?? d.fileName ?? null,
  };
};

export default function DemandSheet1() {
  const navigate = useNavigate();


  //permission check
  const { can } = usePermissions();
  const canCreateDemand = can("DashBoard", "Demands", "Create Demands");
  const canViewDemands = can("DashBoard", "Demands", "View Demands");
  const canExportExcel = can("DashBoard", "Demands", "Export DemandSheet");
  const canViewDrafts = can("DashBoard", "Demands", "View Drafts");
  const canUpdateDemands = can("DashBoard", "Demands", "Update Demands");
  const canUpdateDrafts = can("DashBoard", "Demands", "Update Drafts");
  const canAttachProfiles = can("DashBoard", "Demands", "Attach Profiles");
  const canViewProfileData = can("DashBoard", "Demands", "Profile Shared Details");
  const canViewOnboarding = can("DashBoard", "Demands", "Onboarding Data");
  const canViewHistory = can("DashBoard", "Demands", "Demand History");

  // console.log("PERMISSIONS:", canUpdateDemands);
  // const { list } = usePermissions();
  // console.log("PERM LIST:", list.modulesByName?.DashBoard?.Demands);



  /* ================= COLUMNS (✅ FULL SET RESTORED) ================= */
  const ALL_COLUMNS = [
    { key: "demandId", label: "Demand ID", alwaysVisible: true },
    { key: "rrNumber", label: "RR" },
    { key: "lob", label: "LOB" },
    { key: "skillCluster", label: "Skill Cluster" },
    { key: "primarySkills", label: "Primary Skill" },
    { key: "secondarySkills", label: "Secondary Skill" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
    { key: "karat", label: "Karat" },
    { key: "hbu", label: "HBU" },
    { key: "p1Age", label: "P1 Age" },
    { key: "demandTimeline", label: "Demand Timeline" },
    { key: "demandType", label: "Demand Type" },
    { key: "demandLocation", label: "Demand Location" },
    { key: "hiringManager", label: "Hiring Manager" },
    { key: "deliveryManager", label: "Delivery Manager" },
    { key: "pm", label: "PM" },
    { key: "salesSpoc", label: "Sales Spoc" },
    { key: "pmo", label: "PMO" },
    { key: "band", label: "Band" },
    { key: "experience", label: "Experience" },

    // ✅ EXTRA COLUMNS (selectable from column panel)
    // { key: "statusNote", label: "Status Note" },
    { key: "prodProgramName", label: "Pod / Programme Name" },
    { key: "demandReceivedDate", label: "Demand Received Date" },
    // { key: "priorityComment", label: "Priority Comment" },
    // { key: "currentProfileShared", label: "Current Profile Shared" },
    { key: "externalInternal", label: "External / Internal" },
  ];

  const defaultVisible = [
    "demandId",
    "rrNumber",
    "lob",
    "skillCluster",
    "primarySkills",
    "secondarySkills",
    "priority",
    "status",
    "karat",
    "hbu",
    "p1Age",
    "demandTimeline",
    "demandType",
    "demandLocation",
    "hiringManager",
    "deliveryManager",
    "pm",
    "salesSpoc",
    "pmo",
    "band",
    "experience",
  ];

  /* ================= STATE ================= */
  const [rows, setRows] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);  // initial load
  const [tableLoading, setTableLoading] = useState(false); // search/filter/pagination

  const [apiError, setApiError] = useState(null);
  const [dropdowns, setDropdowns] = useState(null);
  const [ddLoading, setDdLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [visibleColumns, setVisibleColumns] = useState(defaultVisible);
  const [columnsEnabled, setColumnsEnabled] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  /* ================= FILTERS ================= */
  const [filters, setFilters] = useState({
    demandId: "",
    rrNumber: "",
    lob: "",
    skillCluster: "",
    primarySkills: "",
    secondarySkills: "",
    priority: "",
    status: "",
    karat: "",
    hbu: "",
    demandTimeline: "",
    demandType: "",
    demandLocation: "",
    hiringManager: "",
    deliveryManager: "",
    pm: "",
    salesSpoc: "",
    pmo: "",
    band: "",
    experience: "",
  });

  const filterConfig = useMemo(() => {
    const text = { type: "text" };
    const mkSel = (arr) =>
      Array.isArray(arr) ? { type: "select", options: arr } : text;

    return {
      demandId: { type: "number", inputProps: { placeholder: "ID", step: 1 } },
      rrNumber: text,
      lob: text,
      skillCluster: text,
      primarySkills: text,
      secondarySkills: text,


      hiringManager: text,
      deliveryManager: text,
      pm: text,
      salesSpoc: text,
      pmo: text,
      band: text,
      experience: text,
      demandLocation: text,

      priority: { type: "select", options: [{ name: "P1" }, { name: "P2" }, { name: "P3" }] },
      status: text,
      karat: { type: "select", options: [{ name: "Yes" }, { name: "No" }] },
      hbu: text,
      demandTimeline: mkSel(dropdowns?.demandTimeline),
      demandType: mkSel(dropdowns?.demandType),
    };
  }, [dropdowns]);

  const hasAnyFilter = useMemo(
    () => Object.values(filters).some((v) => String(v ?? "").trim() !== ""),
    [filters]
  );

  /* ================= SEARCH PAYLOAD ================= */
  const buildFilterPayload = (f) => {
    const payload = {};

    if (f.demandId) {
      const d = onlyDigits(f.demandId);
      if (d) payload.demandId = Number(d);
    }
    if (f.rrNumber) {
      const r = onlyDigits(f.rrNumber);
      payload.rrNumber = r ? Number(r) : f.rrNumber;
    }

    if (f.lob) payload.lobName = f.lob;
    if (f.skillCluster) payload.skillClusterName = f.skillCluster;
    if (f.hiringManager) payload.hiringManagerName = f.hiringManager;
    if (f.deliveryManager) payload.deliveryManagerName = f.deliveryManager;
    if (f.pm) payload.projectManagerName = f.pm;
    if (f.salesSpoc) payload.salesSpocName = f.salesSpoc;
    if (f.pmo) payload.pmoName = f.pmo;


    if (f.status) payload.statusName = f.status;
    if (f.priority) payload.priorityName = f.priority;
    if (f.demandType) payload.demandTypeName = f.demandType;
    if (f.hbu) payload.hbuName = f.hbu;

    
if (f.demandType) {
    payload.demandTypeName = f.demandType;
  }

  if (f.band) {
    payload.bandName = String(f.band);
  }


  // ✅ EXPERIENCE RANGE FILTER (minExperience, maxExperience, experienceRange)
if (f.experience) {
  const raw = String(f.experience).trim();

  // Save original string for backend (if it uses experienceRange)
  payload.experienceRange = raw;

  // Case 1: Range like "3-5"
  if (raw.includes("-")) {
    const [min, max] = raw.split("-").map(v => Number(v.trim()));
    if (!isNaN(min)) payload.minExperience = min;
    if (!isNaN(max)) payload.maxExperience = max;
  }
  // Case 2: Single value like "5"
  else {
    const val = Number(raw);
    if (!isNaN(val)) {
      payload.minExperience = val;
      payload.maxExperience = val;
    }
  }
}



    const prim = splitNames(f.primarySkills);
    if (prim.length) payload.primarySkillNames = prim;

    const sec = splitNames(f.secondarySkills);
    if (sec.length) payload.secondarySkillNames = sec;



    if (f.demandLocation) {
      payload.locationNames = splitNames(f.demandLocation);
    }



    return payload;
  };

  /* ================= API ================= */
  const loadDemands = useCallback(
    async (page = 1, size = 10) => {
      setTableLoading(true);
      const apiPage = page - 1;
      const sort = "displayDemandId,desc";

      const resp = hasAnyFilter
        ? await searchDemands(buildFilterPayload(filters), apiPage, size, sort)
        : await getDemandsheet(apiPage, size, sort);

      const data = resp?.data || resp;
      setRows((data?.content || []).map(normalizeDemandDto));
      setTotalItems(data?.totalElements || 0);
      setCurrentPage(apiPage + 1);
      setPageSize(size);
      setTableLoading(false);
    },
    [filters, hasAnyFilter]
  );


  useEffect(() => {
    (async () => {
      setPageLoading(true);
      await loadDropdowns();
      await loadDemands(1, pageSize);
      setPageLoading(false);
    })();
  }, []);


  useEffect(() => {
    const t = setTimeout(() => loadDemands(1, pageSize), 400);
    return () => clearTimeout(t);
  }, [filters]);

  const loadDropdowns = async () => {
    setDdLoading(true);
    const dd = await getDropDownData();
    setDropdowns(dd?.data || dd || {});
    setDdLoading(false);
  };


  const handleExport = async () => {
    try {
      setLoading(true);
      await exportDemandSheet();
      message.success("DemandSheet exported successfully.");
    } catch (e) {
      message.error("Failed to export DemandSheet.");
    } finally {
      setLoading(false);
    }
  };



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

  // if (loading || ddLoading) {
  //   return (
  //     <div
  //       style={{
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         height: "200px",
  //       }}
  //     >
  //       <Spin size="large" tip="Loading..." />
  //     </div>
  //   );
  // }

  if (pageLoading || ddLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", height: "200px" }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }
  if (apiError) {
    return (
      <div style={{ padding: "16px" }}>
        <Alert message="Error" description={apiError} type="error" showIcon />
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <>
      <Layout>
        <div className="flex gap-4 transition-all duration-300">
          {/* LEFT SLIDER */}
          <div className={`transition-all duration-300 overflow-hidden ${columnsEnabled ? "w-72" : "w-0"}`}>
            {columnsEnabled && (
              <ColumnsSelector
                columnsEnabled={columnsEnabled}
                setColumnsEnabled={setColumnsEnabled}
                ALL_COLUMNS={ALL_COLUMNS}
                visibleColumns={visibleColumns}
                toggleColumn={(key) => {
                  const meta = ALL_COLUMNS.find((c) => c.key === key);
                  if (meta?.alwaysVisible) return;
                  setVisibleColumns((prev) =>
                    prev.includes(key)
                      ? prev.filter((k) => k !== key)
                      : [...prev, key]
                  );
                }}
              />
            )}
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 min-w-0">
            <div className="mb-4 flex justify-between">
              <Button onClick={() => setColumnsEnabled((v) => !v)}>⚙ Columns</Button>
              <h1 className="text-lg font-bold">Demand Sheet</h1>
              <div className="flex gap-2">

                {canViewDrafts && (
                  <Button onClick={() => navigate("/drafts1")}>View Draft</Button>)}

                {canCreateDemand && (
                  <Button icon={<PlusOutlined />} onClick={() => navigate("/addDemands1")} className="bg-green-800 text-white">
                    Add New Demands
                  </Button>
                )}

                {canExportExcel && (
                  <Button icon={<ExportOutlined />} onClick={exportDemandSheet} className="bg-green-800 text-white">
                    Export DemandSheet
                  </Button>
                )}
              </div>
            </div>

            <DemandTable
              rows={rows}
              loading={tableLoading}
              columns={ALL_COLUMNS}
              visibleColumns={visibleColumns}
              dropdowns={dropdowns}
              filters={filters}
              filterConfig={filterConfig}
              onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
              onViewRow={onViewRow}
              canUpdateDemands={canUpdateDemands}
              canViewDemands={canViewDemands}

            />

            <div className="mt-4 flex justify-end">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalItems}
                showSizeChanger
                onChange={(page, size) => loadDemands(page, size)}
              />
            </div>
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