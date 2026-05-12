
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import { useAuth } from "../../Auth/AuthProvider.jsx";
import { Navigate } from "react-router-dom";



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

    pod: nameOf(d.pod),
    //     externalInternal: nameOf(d.externalInternal),

  };
};



const hasAccessToken = () => {
  const t = localStorage.getItem("token");
  return Boolean(t);
};





export default function DemandSheet1() {
  const navigate = useNavigate();
  const isFirstLoad = useRef(true);
  const hasLoadedOnce = useRef(false);
  const { isAuthenticated } = useAuth();

const [isHbuReady, setIsHbuReady] = useState(false);

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
  const canAccessDemandPage = can("DashBoard", "Demands", "View Demand Page");

  const allowedHbus = useMemo(() => {
    const list = [];

    if (can("DashBoard", "HBU", "Engineering")) list.push("Engineering");
    if (can("DashBoard", "HBU", "Experience")) list.push("Experience");
    if (can("DashBoard", "HBU", "AI")) list.push("AI");
    if (can("DashBoard", "HBU", "DATA")) list.push("DATA");
    if (can("DashBoard", "HBU", "DPA")) list.push("DPA");
    if (can("DashBoard", "HBU", "CIMS")) list.push("CIMS");
    if (can("DashBoard", "HBU", "QE")) list.push("QE");
    if (can("DashBoard", "HBU", "HBU1")) list.push("HBU1");
    if (can("DashBoard", "HBU", "HBU2")) list.push("HBU2");

    return list;
  }, [can]);


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
    { key: "experience", label: "Experience (yrs)" },
    { key: "pod", label: "Pod / Programme Name" },

    // ✅ EXTRA COLUMNS (selectable from column panel)
    // { key: "statusNote", label: "Status Note" },
    // { key: "pod", label: "Pod / Programme Name" },
    { key: "demandReceivedDate", label: "Demand Received Date" },
    // { key: "priorityComment", label: "Priority Comment" },
    // { key: "currentProfileShared", label: "Current Profile Shared" },
    //     { key: "externalInternal", label: "External / Internal" },
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

    // "pod",
    // "externalInternal",

  ];

  /* ================= STATE ================= */
  const [rows, setRows] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);  // initial load
  const [tableLoading, setTableLoading] = useState(false); // search/filter/pagination

  const [apiError, setApiError] = useState(null);
  const [dropdowns, setDropdowns] = useState(null);

  const filteredHbuOptions = useMemo(() => {
    if (!dropdowns?.hbuList) return [];

    if (allowedHbus.length > 0) {
      return dropdowns.hbuList.filter(h =>
        allowedHbus.includes(h.name || h)
      );
    }

    return dropdowns.hbuList;
  }, [dropdowns, allowedHbus]);


  const [ddLoading, setDdLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const [visibleColumns, setVisibleColumns] = useState(defaultVisible);
  const [columnsEnabled, setColumnsEnabled] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  /* ================= FILTERS ================= */
  // const [filters, setFilters] = useState({
  //   demandId: "",
  //   rrNumber: "",
  //   lob: "",
  //   skillCluster: "",
  //   primarySkills: "",
  //   secondarySkills: "",
  //   priority: "",
  //   status: "",
  //   karat: "",
  //   hbu: "",
  //   demandTimeline: "",
  //   demandType: "",
  //   demandLocation: "",
  //   hiringManager: "",
  //   deliveryManager: "",
  //   pm: "",
  //   salesSpoc: "",
  //   pmo: "",
  //   band: "",
  //   experience: "",
  // });


  const [filters, setFilters] = useState({

    demandId: "",
    rrNumber: "",
    experience: "",

    lob: [],
    skillCluster: [],
    primarySkills: [],
    secondarySkills: [],
    priority: [],
    status: [],
    karat: [],
    hbu: [],
    pod: [],
    demandTimeline: [],
    demandType: [],
    demandLocation: [],
    hiringManager: [],
    deliveryManager: [],
    pm: [],
    salesSpoc: [],
    pmo: [],
    band: [],
  });


  const filterConfig = useMemo(() => {
    const text = { type: "text" };
    const mkSel = (arr) =>
      Array.isArray(arr) ? { type: "select", options: arr } : text;

    return {
      demandId: { type: "number", inputProps: { placeholder: "ID", step: 1 } },
      rrNumber: text,
      // lob: text,
      // skillCluster: text,
      // primarySkills: text,
      // secondarySkills: text,


      // hiringManager: text,
      // deliveryManager: text,
      // pm: text,
      // salesSpoc: text,
      // pmo: text,
      // band: text,
      experience: text,
      // demandLocation: text,

      lob: { type: "select", options: dropdowns?.lobList || [] },
      skillCluster: { type: "select", options: dropdowns?.skillClusterList || [] },
      primarySkills: { type: "select", options: dropdowns?.primarySkillsList || [] },
      secondarySkills: { type: "select", options: dropdowns?.secondarySkillsList || [] },

      hiringManager: { type: "select", options: dropdowns?.hiringManagerList || [] },
      deliveryManager: { type: "select", options: dropdowns?.deliveryManagerList || [] },
      pm: { type: "select", options: dropdowns?.projectManagerList || [] },
      salesSpoc: { type: "select", options: dropdowns?.salesSpocList || [] },
      pmo: { type: "select", options: dropdowns?.pmoList || [] },

      band: { type: "select", options: dropdowns?.bandList || [] },
      // hbu: { type: "select", options: dropdowns?.hbuList || [] },
      hbu: { type: "select", options: filteredHbuOptions },

      pod: { type: "select", options: dropdowns?.podList || [] },

      demandType: { type: "select", options: dropdowns?.demandTypeList || [] },

      demandTimeline: { type: "select", options: dropdowns?.demandTimelineList || [] },


      demandLocation: {
        type: "select",
        options: [
          ...(dropdowns?.onshoreLocationList || []),
          ...(dropdowns?.offshoreLocationList || []),
        ],
      },
      priority: { type: "select", options: dropdowns?.priorityList || [] },
      status: { type: "select", options: dropdowns?.statusList || [] },
      karat: {
        type: "select",
        options: [
          { name: "Yes", value: "true" },
          { name: "No", value: "false" },
        ],
      },


    };
  }, [dropdowns]);

  // const hasAnyFilter = useMemo(
  //   () => Object.values(filters).some((v) => String(v ?? "").trim() !== ""),
  //   [filters]
  // );


useEffect(() => {
  if (allowedHbus.length > 0) {
    setFilters((prev) => ({
      ...prev,
      hbu: allowedHbus
    }));
  }

  // ✅ mark ready AFTER setting filter
  setIsHbuReady(true);
}, [allowedHbus]);



  const hasAnyFilter = useMemo(
    () =>
      Object.values(filters).some((v) =>
        Array.isArray(v)
          ? v.length > 0
          : String(v ?? "").trim() !== ""
      ),
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

    // if (f.lob) payload.lobName = f.lob;
    if (f.lob?.length) payload.lobNames = f.lob;


    if (f.skillCluster?.length) payload.skillClusterNames = f.skillCluster;
    if (f.hiringManager?.length) payload.hiringManagerNames = f.hiringManager;
    if (f.deliveryManager?.length) payload.deliveryManagerNames = f.deliveryManager;
    if (f.pm?.length) payload.projectManagerNames = f.pm;
    if (f.salesSpoc?.length) payload.salesSpocNames = f.salesSpoc;
    if (f.pmo?.length) payload.pmoNames = f.pmo;
    if (f.status?.length) payload.statusNames = f.status;
    if (f.priority?.length) payload.priorityNames = f.priority;
    if (f.demandType?.length) payload.demandTypeNames = f.demandType;
    // if (f.hbu?.length) payload.hbuNames = f.hbu;
   // ✅ CASE 1: both permission + UI selection
if (allowedHbus.length > 0 && f.hbu?.length > 0) {
  payload.hbuNames = f.hbu.filter(h => allowedHbus.includes(h));
}

// ✅ CASE 2: only permission
else if (allowedHbus.length > 0) {
  payload.hbuNames = allowedHbus;
}

// ✅ CASE 3: only UI filter
else if (f.hbu?.length > 0) {
  payload.hbuNames = f.hbu;
}

    if (f.pod?.length) payload.podNames = f.pod;


    if (f.karat?.length) {
      if (f.karat.length === 1) {
        payload.karatFlag = f.karat[0] === "Yes";
      }
    }

    if (f.demandTimeline?.length) {
      payload.demandTimelineNames = f.demandTimeline;
    }

    if (f.band?.length) {
      payload.bandNames = f.band;
    }


    // ✅ EXPERIENCE RANGE FILTER (minExperience, maxExperience, experienceRange)
    if (f.experience) {
      payload.experienceRange = f.experience;
    }



    if (f.primarySkills?.length) payload.primarySkillNames = f.primarySkills;
    if (f.secondarySkills?.length) payload.secondarySkillNames = f.secondarySkills;



    if (f.demandLocation?.length) {
      payload.locationNames = f.demandLocation;
    }

    // ✅ CLEAN EMPTY ARRAY FIELDS (VERY IMPORTANT)
    Object.keys(payload).forEach((key) => {
      if (Array.isArray(payload[key]) && payload[key].length === 0) {
        delete payload[key];
      }
    });


    return payload;
  };


  /* ================= API ================= */
  const loadDemands = useCallback(
    async (page = 1, size = 10) => {

      // Prevent StrictMode double hit
      // if (hasLoadedOnce.current && !hasAnyFilter) {
      //   return;
      // }
      // hasLoadedOnce.current = true;

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



  //   useEffect(() => {
  //   (async () => {
  //     setPageLoading(true);
  //     try {
  //       await loadDropdowns();
  //       await loadDemands(1, pageSize);
  //     } finally {
  //       setPageLoading(false);
  //     }
  //   })();
  // }, []);
useEffect(() => {
  if (!isAuthenticated) return;
  if (!canAccessDemandPage) return;
  if (!hasAccessToken()) return;
  if (!isHbuReady) return; // ✅ WAIT FOR FILTER

  (async () => {
    setPageLoading(true);
    try {
      await loadDropdowns();
      await loadDemands(1, pageSize); // ✅ now correct filter applied
    } finally {
      setPageLoading(false);
    }
  })();
}, [isAuthenticated, canCreateDemand, isHbuReady]);



  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    const t = setTimeout(() => {
      loadDemands(1, pageSize);
    }, 400);

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
  //         display: "flex",ac
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

                pageSizeOptions={['5', '10', '20', '50', '100']}

                onChange={onPageChange}
                onShowSizeChange={onPageSizeChange}
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