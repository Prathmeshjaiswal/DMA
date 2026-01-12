import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../NavBar.jsx"
import { getDemandsheet } from "../../api/Demands/getDemands.js";
import ColumnsSelector from "./ColumnsSelector.jsx"
import FiltersPanel from "./FiltersPanel.jsx"
import DemandTable from "./DemandTable.jsx";
// import DemandTable4 from "../DemandTable4.jsx";
import {Spin,Alert} from "antd";
import Footer from "../../Footer.jsx"

export default function DemandSheet1() {

const ALL_COLUMNS = [
  { key: "demandId", label: "Demand ID", alwaysVisible: true },
  { key: "rrNumber", label: "RR" },
  { key: "demandReceivedDate", label: "Demand Recieved Date" }, 
//   { key: "buisenessFunction", label: "Buiseness Function" },
  { key: "prodProgramName", label: "Pod /Programme Name" },
  { key: "lob", label: "LOB" },
  { key: "hiringManager", label: "HSBC Hiring Manager" },           
  { key: "deliveryManager", label: "Delivery Manager" },       // added
  { key: "pmo", label: "PMO" },                                // added
  { key: "pmoSpoc", label: "PMO SPOC" },
  { key: "pm", label: "PM" },
  { key: "hbu", label: "HBU" },
  { key: "skillCluter", label: "Skill Cluster" },
  { key: "primarySkills", label: "Primary Skill" },
  { key: "secondarySkills", label: "Secondary Skill" },
  { key: "experience", label: "Experience" },
  { key: "priority", label: "Priority" },
  { key: "demandLocation", label: "Demand Location" },
  { key: "salesSpoc", label: "Sales Spoc" },
//   { key: "p1FlagData", label: "P1 Flag Date" },
  { key: "priorityComment", label: "Priority Comment" },
  { key: "band", label: "Band" },
  { key: "p1Age", label: "P1 Age" },
  { key: "currentProfileShared", label: "Current Profile Shared (Drop Down)" },
//   { key: "dateOfProfileShared", label: "Date of Profile Shared (Auto Populate)" },
  { key: "externalInternal", label: "External / Internal" },
  { key: "status", label: "Status" },
  { key: "demandType", label: "Demand Type" },                 // added
  { key: "demandTimeline", label: "Demand Timeline" },         // added
];
const SELECT_OPTIONS = {
  currentProfileShared: ["", "Yes", "No"],
  externalInternal: ["", "External", "Internal"],
  status: ["", "Open", "Closed", "Profile Shared", "On Hold", "Selected"],
  priority: ["", "P1", "P2", "P3"],
  demandType: ["", "New", "Backfill", "Replacement"],
};
// API state 
  const [rows, setRows] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // --- Columns 
  const defaultVisible = ALL_COLUMNS
    .filter(
      (c) =>
        c.alwaysVisible ||
        [
          "rrNumber",
          "lob",
          "hiringManager",
          "deliveryManager",
          "pmo",
          "pmoSpoc",
          "skillCluter",
          "primarySkills",
          "secondarySkills",
          "priority",
          "currentProfileShared",
          "dateOfProfileShared",
          "externalInternal",
          "status",
          "demandType",
          "demandTimeline",
        ].includes(c.key)
    )
    .map((c) => c.key);

  const [visibleColumns, setVisibleColumns] = useState(defaultVisible);
  const [columnsEnabled, setColumnsEnabled] = useState(false);
  const [filtersEnabled, setFiltersEnabled] = useState(false);
    // Filters
  const [filters, setFilters] = useState({
    demandId: "",
    rrNumber: "",
    demandReceivedDate: "",
    podprogrammeName: "",
    lob: "",
    hiringManager: "",
    deliveryManager: "",
    pmo: "",
    pmoSpoc: "",
    pm: "",
    hbu: "",
    skillCluster: "",
    primarySkill: "",
    secondarySkill: "",
    experience: "",
    priority: "",
    demandLocation: "",
    salesSpoc: "",
    priorityComment: "",
    band: "",
    p1Age: "",
    currentProfileShared: "",
    externalInternal: "",
    status: "",
    demandType: "",
    demandTimeLine: "",
  });

  const filterKeys = Object.keys(filters);
  const DEFAULT_ENABLED = new Set(["demandId", "rrNumber", "lob"]);
  const [enabledFilterFields, setEnabledFilterFields] = useState(() =>
    filterKeys.reduce((acc, key) => {
      acc[key] = DEFAULT_ENABLED.has(key);
      return acc;
    }, {})
  );


  useEffect(() => {
    setEnabledFilterFields((prev) => {
      const next = {};
      for (const k of filterKeys) next[k] = prev[k] ?? true;
      return next;
    });
  }, [filterKeys.join("|")]);

  const toggleFilterField = (key) => {
    setEnabledFilterFields((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) {
        setFilters((f) => ({ ...f, [key]: "" }));
      }
      return next;
    });
  };

  const filteredRows = useMemo(() => {
    if (!filtersEnabled) return rows;
    return rows.filter((row) =>
      Object.entries(filters).every(([k, v]) => {
        if (!v) return true;
        const cell = (row[k] ?? "").toString().toLowerCase();
        return cell.includes(v.toString().toLowerCase());
      })
    );
  }, [rows, filters, filtersEnabled]);

  const toggleColumn = (key) => {
    setVisibleColumns((prev) => {
      const colMeta = ALL_COLUMNS.find((c) => c.key === key);
      if (colMeta?.alwaysVisible) return prev;
      return prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
    });
  };


  // --- DTO -> UI keys ---
  const normalizeDemandDto = (d) => {
    return {
      demandId: d.demandId ?? "",
      rrNumber: (d.rrNumber ?? d.rr ?? "").toString(),
      demandReceivedDate: d.demandReceivedDate ?? d.demandRecievedDate ?? "",
      prodProgramName: d.prodProgramName ?? d.podprogrammeName ?? "",
      lob: d.lob ?? "",
      hiringManager : d.hiringManager ?? d.manager ?? "",
      deliveryManager: d.deliveryManager ?? "",
      pmo: d.pmo ?? "",
      pmoSpoc: d.pmoSpoc ?? "",
      pm: d.pm ?? "",
      hbu: d.hbu ?? "",
      skillCluter: d.skillCluter ?? d.skillCluster ?? "",
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
    };
  };
  
  const [dropdowns, setDropdowns] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const resp = await getDemandsheet();
        const list = Array.isArray(resp?.data.updateDemandDTOList) ? resp.data.updateDemandDTOList : [];
        const dropdownData = resp?.data?.dropdownDataDTO ?? null;
        console.log(dropdownData)
        setDropdowns(dropdownData)
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
  
  // loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }
  // error
  if (apiError) {
    return (
      <div style={{ padding: '16px' }}>
        <Alert
          title="Error"
          description={apiError}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
      <>
    <NavBar />
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[16rem_1fr]">
         
          <ColumnsSelector
            columnsEnabled={columnsEnabled}
            setColumnsEnabled={setColumnsEnabled}
            ALL_COLUMNS={ALL_COLUMNS}
            visibleColumns={visibleColumns}
            toggleColumn={toggleColumn}
          />

          <FiltersPanel
            filtersEnabled={filtersEnabled}
            setFiltersEnabled={setFiltersEnabled}
            filters={filters}
            setFilters={setFilters}
            enabledFilterFields={enabledFilterFields}
            toggleFilterField={toggleFilterField}
            ALL_COLUMNS={ALL_COLUMNS}
            SELECT_OPTIONS={SELECT_OPTIONS}
          />
        </div>
      </div>
      <DemandTable
        rows={filteredRows}
        columns={ALL_COLUMNS}
        visibleColumns={visibleColumns}
        dropdowns={dropdowns}
      /> 
    </div>
<Footer />
    </>
  );

};

