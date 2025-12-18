import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar.jsx"

export default function DemandSheet(props) {
const CAN_EDIT_ROLES = ["Delivery Manager", "PMO"];
const pillOrange = "rounded-md bg-orange-700 text-white px-4 py-2 border border-orange-800 shadow-sm";
const pillGreen  = "rounded-md bg-gray-800 text-white px-4 py-2 border border-[#52624E] shadow-sm";
const inputBox   = "w-full rounded-md border border-[#52624E] px-2 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400";
const badge      = "inline-block rounded-md bg-[#8FA58A] text-white px-3 py-1 text-sm border border-[#52624E]";

const todayISO = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const initialRows = [
  {
    demandId: "DMD-1001",
    rr: "RR-501",
    lob: "Banking",
    manager: "Alice",
    skillCluster: "Java",
    primarySkill: "Spring",
    secondarySkill: "React",
    currentProfileShared: "No",
    dateOfProfileShared: "",
    externalInternal: "External",
    status: "Open",
  },
  {
    demandId: "DMD-1002",
    rr: "RR-502",
    lob: "Insurance",
    manager: "Bob",
    skillCluster: "Data",
    primarySkill: "Python",
    secondarySkill: "PowerBI",
    currentProfileShared: "Yes",
    dateOfProfileShared: "2025-12-17",
    externalInternal: "Internal",
    status: "Closed",
  },
];

const ALL_COLUMNS = [
  { key: "demandId", label: "Demand ID", alwaysVisible: true },
  { key: "rr", label: "RR" },
  { key: "demandRecievedDate", label: "Demand Recieved Date" },
  { key: "buisenessFunction", label: "Buiseness Function" },
  { key: "podprogrammeName", label: "Pod /Programme Name" },
  { key: "lob", label: "LOB" },
  { key: "manager", label: "HSBC Hiring Manager" },
  { key: "skillCluster", label: "Skill Cluster" },
  { key: "primarySkill", label: "Primary Skill" },
  { key: "secondarySkill", label: "Secondary Skill" },
  { key: "experience", label: "Experience" },
  { key: "priority", label: "Priority" },
  { key: "demandLocation", label: "Demand Location" },
  { key: "salesSpoc", label: "Sales Spoc" },
  { key: "p1FlagData", label: "P1 Flag Date" },
  { key: "priorityComment", label: "Priority Comment" },
  { key: "pmoSpoc", label: "PMO SPOC" },
  { key: "pm", label: "PM" },
  { key: "hbu", label: "HBU" },
  { key: "band", label: "Band" },
  { key: "p1Age", label: "P1 Age" },
  { key: "currentProfileShared", label: "Current Profile Shared (Drop Down)" },
  { key: "dateOfProfileShared", label: "Date of Profile Shared (Auto Populate)" },
  { key: "externalInternal", label: "External / Internal" },
  { key: "status", label: "Status" },
];

const SELECT_OPTIONS = {
  currentProfileShared: ["Yes", "No"],
  externalInternal: ["External", "Internal"],
  status: ["Open", "Closed", "Profile Shared" ,"On Hold","Selected"],
};

  const [rows, setRows] = useState(initialRows);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);


  const defaultVisible = ALL_COLUMNS
    .filter(c => c.alwaysVisible || ["rr","lob","manager","skillCluster","primarySkill","secondarySkill","currentProfileShared","dateOfProfileShared","externalInternal","status"].includes(c.key))
    .map(c => c.key);
  const [visibleColumns, setVisibleColumns] = useState(defaultVisible);


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

  return (
      <>
      <NavBar />
    <div className="p-16">
      {/* Controls above the table */}
      <div className="mb-4 flex flex-col gap-4">
        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 font-medium text-gray-800">Columns</div>
          <div className="flex flex-wrap gap-3">
            {ALL_COLUMNS.map(col => (
              <label
                key={col.key}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm ${col.alwaysVisible ? "opacity-70 cursor-not-allowed" : "cursor-pointer"} ${
                  visibleColumns.includes(col.key) ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-gray-50"
                }`}
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
        </div>

        {/* Optional data filters */}
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
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {Object.keys(filters).map((key) => {
                const isSelect = SELECT_OPTIONS[key] && SELECT_OPTIONS[key].length > 0;
                return (
                  <div key={key} className="flex flex-col">
                    <label className="mb-1 text-xs font-medium text-gray-500">
                      {ALL_COLUMNS.find(c => c.key === key)?.label ?? key}
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
                        placeholder="Type to filter"
                        value={filters[key]}
                        onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
                {editingId && <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const isEditing = editingId === row.demandId;
                return (
                  <tr key={row.demandId} className="hover:bg-gray-50">
                    {ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(col => {
                      const value = isEditing ? draft[col.key] : row[col.key];

                      // Demand ID cell: clickable pill that starts edit
                      if (col.key === "demandId") {
                        return (
                          <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={draft.demandId}
                                onChange={(e) => onDraftChange("demandId", e.target.value)}
                                className="w-36 rounded-md border border-gray-300 p-2 text-sm"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(row)}
                                className="inline-flex w-32 justify-center rounded-md bg-olive-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-olive-700"
                                style={{
                                  backgroundColor: "#6b8e23", // Tailwind doesn’t have 'olive' by default, use inline
                                }}
                              >
                                {row.demandId}
                              </button>
                            )}
                          </td>
                        );
                      }

                      // Editing UI for other cells
                      if (isEditing) {
                        // dropdowns for select columns
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

                      // Read-only cells
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
