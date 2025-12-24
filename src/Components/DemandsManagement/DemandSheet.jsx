import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar.jsx"
import { Link } from "react-router-dom";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import axios from 'axios'

export default function DemandSheet(props) {

  useEffect(() => {
    const fetchDemands = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = axios.get("http://localhost:8080/api/v1/demands");
        const data = res.data;
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load demands");
      } finally {
        setLoading(false);
      }
    };

    fetchDemands();
  }, []);

const ALL_COLUMNS = [
  { key: "demandId", value:"121", label: "Demand ID", alwaysVisible: true },
  { key: "rr", value:demandData.rr, label: "RR" },
  { key: "demandRecievedDate", value:demandData.demand_business_id, label: "Demand Recieved Date" },
  { key: "buisenessFunction", value:demandData.demand_business_id, label: "Buiseness Function" },
  { key: "podprogrammeName", value:demandData.demand_business_id, label: "Pod /Programme Name" },
  { key: "lob", value:demandData.demand_business_id, label: "LOB" },
  { key: "manager", value:demandData.demand_business_id, label: "HSBC Hiring Manager" },
  { key: "skillCluster", value:demandData.demand_business_id, label: "Skill Cluster" },
  { key: "primarySkill", value:demandData.demand_business_id, label: "Primary Skill" },
  { key: "secondarySkill", value:demandData.demand_business_id, label: "Secondary Skill" },
  { key: "experience", value:demandData.demand_business_id, label: "Experience" },
  { key: "priority", value:demandData.demand_business_id, label: "Priority" },
  { key: "demandLocation", value:demandData.demand_business_id, label: "Demand Location" },
  { key: "salesSpoc", value:demandData.demand_business_id, label: "Sales Spoc" },
  { key: "p1FlagData", value:demandData.demand_business_id, label: "P1 Flag Date" },
  { key: "priorityComment", value:demandData.demand_business_id, label: "Priority Comment" },
  { key: "pmoSpoc", value:demandData.demand_business_id, label: "PMO SPOC" },
  { key: "pm", value:demandData.demand_business_id, label: "PM" },
  { key: "hbu", value:demandData.demand_business_id, label: "HBU" },
  { key: "band", value:demandData.demand_business_id, label: "Band" },
  { key: "p1Age", value:demandData.demand_business_id, label: "P1 Age" },
  { key: "currentProfileShared", value:demandData.demand_business_id, label: "Current Profile Shared (Drop Down)" },
  { key: "dateOfProfileShared", value:demandData.demand_business_id, label: "Date of Profile Shared (Auto Populate)" },
  { key: "externalInternal", value:demandData.demand_business_id, label: "External / Internal" },
  { key: "status", value:demandData.demand_business_id, label: "Status" },
];

const SELECT_OPTIONS = {
  currentProfileShared: ["Yes", "No"],
  externalInternal: ["External", "Internal"],
  status: ["Open", "Closed", "Profile Shared", "On Hold", "Selected"],

};

  const [rows, setRows] = useState([]);
 const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);

// comment
  const defaultVisible = ALL_COLUMNS
    .filter(c => c.alwaysVisible || ["rr","lob","manager","skillCluster","primarySkill","secondarySkill","currentProfileShared","dateOfProfileShared","externalInternal","status"].includes(c.key))
    .map(c => c.key);
  const [visibleColumns, setVisibleColumns] = useState(defaultVisible);

  const [columnsEnabled, setColumnsEnabled] = useState(false);
  const [filtersEnabled, setFiltersEnabled] = useState(false);
  const [filters, setFilters] = useState({
    demandId:"",
    rr: "",
    demandRecievedDate:"",
    podprogrammeName:"",
    lob: "",
    manager: "",
    skillCluster: "",
    primarySkill: "",
    secondarySkill: "",
    experience:"",
    priority: "",
    demandLocation: "",
    salesSpoc:"",
    priorityComment:"",
    pmoSpoc:"",
    pm:"",
    hbu:"",
    band:"",
    p1Age:"",
    currentProfileShared: "",
    externalInternal: "",
    status: "",
  });

  const filteredRows = useMemo(() => {
    if (!filtersEnabled) return rows;
    return rows.filter(row =>
      Object.entries(filters).every(([k, v]) => {
        if (!v) return true;
        const cell = (row[k] ?? "").toString().toLowerCase();
        return cell.includes(v.toString().toLowerCase());
      })
    );
  }, [rows, filters, filtersEnabled]);

  // --- Helpers ---
  const startEdit = (row) => {
    setEditingId(row.demandId);
    setDraft({ ...row });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (!draft.demandId?.trim()) {
      alert("Demand ID cannot be empty.");
      return;
    }
    setRows(prev =>
      prev.map(r => (r.demandId === editingId ? { ...draft } : r))
    );
    setEditingId(null);
    setDraft(null);
  };

  const onDraftChange = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const toggleColumn = (key) => {
    setVisibleColumns(prev => {
      const colMeta = ALL_COLUMNS.find(c => c.key === key);
      if (colMeta?.alwaysVisible) return prev; // cannot hide always-visible columns
      return prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key];
    });
  };

  // per column filter state
  const filterKeys = Object.keys(filters);
  const DEFAULT_ENABLED = new Set(["demandId", "rr", "lob"]);
  // Per-field enable map
  const [enabledFilterFields, setEnabledFilterFields] = useState(() =>
    filterKeys.reduce((acc, key) => {
        acc[key] = DEFAULT_ENABLED.has(key); // true only for demandId, rrid, lob
        return acc;
      }, {})
  );

  // Keep map in sync if filters keys change dynamically
  useEffect(() => {
    setEnabledFilterFields(prev => {
      const next = {};
      for (const k of filterKeys) next[k] = prev[k] ?? true;
      return next;
    });
  }, [filterKeys.join("|")]);

  // clear its value when turning OFF
  const toggleFilterField = (key) => {
    setEnabledFilterFields(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) {
        setFilters(f => ({ ...f, [key]: "" }));
      }
      return next;
    });
  };

  return (
      <>
    <NavBar />
    <div className="p-16">
      <div className="mb-4 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[16rem_1fr]">
          <section className="w-full md:sticky md:top-4 self-start">
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-gray-800">Columns</span>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-indigo-600"
                    checked={columnsEnabled}
                    onChange={(e) => setColumnsEnabled(e.target.checked)}
                  />
                  Enable columns
                </label>
              </div>

              {/* Scrollable area */}
              {columnsEnabled && (
                <div className="flex flex-col gap-2 max-h-80 overflow-auto pr-1">
                  {ALL_COLUMNS.map(col => (
                    <label
                      key={col.key}
                      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm
                        ${col.alwaysVisible ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
                        ${visibleColumns.includes(col.key) ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-gray-50"}`}
                      title={col.alwaysVisible ? "Always visible" : ""}
                    >
                      <input
                        type="checkbox"
                        className="accent-indigo-600"
                        checked={visibleColumns.includes(col.key)}
                        onChange={() => toggleColumn(col.key)}
                        disabled={col.alwaysVisible}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </section>



<section className="w-full">
  <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
    <div className="mb-2 flex items-center justify-between">
      <span className="font-medium text-gray-800">Filters (optional)</span>
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="accent-indigo-600"
          checked={filtersEnabled}
          onChange={(e) => setFiltersEnabled(e.target.checked)}
        />
        Enable filters
      </label>
    </div>

    {filtersEnabled && (
      // scrollable container
      <div className="max-h-80 overflow-auto pr-1">
        {/* Per-field toggles (like Columns) */}
        <div className="mb-3 flex flex-wrap gap-2">
          {Object.keys(filters).map((key) => {
            const label = ALL_COLUMNS.find(c => c.key === key)?.label ?? key;
            const enabled = enabledFilterFields[key];

            return (
              <label
                key={key}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm
                  ${enabled ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-gray-50"}`}
                title={enabled ? "Filter enabled" : "Filter disabled"}
              >
                <input
                  type="checkbox"
                  className="accent-indigo-600"
                  checked={enabled}
                  onChange={() => toggleFilterField(key)}
                />
                {label}
              </label>
            );
          })}
        </div>

        {/* Inputs grid — render only when the field is enabled */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {Object.keys(filters).map((key) => {
            if (!enabledFilterFields[key]) return null;

            const isSelect = SELECT_OPTIONS[key] && SELECT_OPTIONS[key].length > 0;
            const label = ALL_COLUMNS.find(c => c.key === key)?.label ?? key;

            return (
              <div key={key} className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-gray-500">
                  {label}
                </label>

                {isSelect ? (
                  <select
                    className="rounded-md border border-gray-300 bg-white p-2 text-sm"
                    value={filters[key]}
                    onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                  >
                    <option value="">All</option>
                    {SELECT_OPTIONS[key].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="rounded-md border border-gray-300 p-2 text-sm"
                    placeholder="Type to Search"
                    value={filters[key]}
                    onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
</section>

        </div>
      </div>


      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                {ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(col => (
                  <th
                    key={col.key}
                    className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700"
                  >
                    {col.label}
                  </th>
                ))}
                {/* Actions column only when editing */}
                {editingId && (
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => {
                const isEditing = editingId === row.demandId;

                return (
                  <tr key={row.demandId} className="hover:bg-gray-50">
                    {ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(col => {
                      const value = isEditing ? draft[col.key] : row[col.key];

                      // Demand ID: ALWAYS non-editable
                      if (col.key === "demandId") {
                        return (
                          <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                            <div className="flex items-center gap-2">
                              {/* View mode: pencil + link */}
                              {!isEditing && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEdit(row)}
                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                                    aria-label={`Edit demand ${row.demandId}`}
                                    title="Edit"
                                  >
                                    <PencilSquareIcon className="h-6 w-6 text-gray-700" />
                                  </button>

                                  <Link
                                    to={`/demands/${row.demandId}`}
                                    className="inline-flex w-32 justify-center rounded-md bg-olive-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-olive-700"
                                    style={{ backgroundColor: "#6b8e23" }}
                                    title="View details"
                                  >
                                    {row.demandID || "_"}
                                  </Link>
                                </>
                              )}

                              {/* Edit mode*/}
                              {isEditing && (
                                <Link
                                  to={`/demands/${row.demandId}`}
                                  className="inline-flex w-32 justify-center rounded-md bg-olive-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-olive-700"
                                  style={{ backgroundColor: "#6b8e23" }}
                                  title="View details"
                                >
                                  {row.demandID || "_"}
                                </Link>
                              )}
                            </div>
                          </td>
                        );
                      }
                      if (isEditing) {
                        if (SELECT_OPTIONS[col.key]) {
                          return (
                            <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                              <select
                                value={value ?? ""}
                                onChange={(e) => onDraftChange(col.key, e.target.value)}
                                className="w-40 rounded-md border border-gray-300 bg-white p-2 text-sm"
                              >
                                {SELECT_OPTIONS[col.key].map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </td>
                          );
                        }
                        // date picker
                        if (col.key === "dateOfProfileShared") {
                          return (
                            <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                              <input
                                type="date"
                                value={value ?? ""}
                                onChange={(e) => onDraftChange(col.key, e.target.value)}
                                className="rounded-md border border-gray-300 p-2 text-sm"
                              />
                            </td>
                          );
                        }
                        // text input default
                        return (
                          <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                            <input
                              type="text"
                              value={value ?? ""}
                              onChange={(e) => onDraftChange(col.key, e.target.value)}
                              className="w-40 rounded-md border border-gray-300 p-2 text-sm"
                            />
                          </td>
                        );
                      }

                      // Read-only cells (non-editing)
                      return (
                        <td key={col.key} className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-sm text-gray-800">
                          {value || (col.key === "dateOfProfileShared" ? "" : "")}
                        </td>
                      );
                    })}

                    {/* Actions when editing */}
                    {isEditing && (
                      <td className="border-b border-gray-200 px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {filteredRows.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500"
                    colSpan={visibleColumns.length + (editingId ? 1 : 0)}
                  >
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );

};

