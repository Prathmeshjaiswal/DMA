import React, { useMemo, useState } from "react";
import { Select } from "antd";


const TableHeader = ({
  columns,
  visibleColumns,
  editingId,
  theadClassName = "bg-gray-50",
  actionsLabel = "Actions",
  // Filter props
  filters = {},
  filterConfig = {},
  onFilterChange = () => { },
}) => {
  const filteredColumns = useMemo(
    () => columns.filter((c) => visibleColumns.includes(c.key)),
    [columns, visibleColumns]
  );



  const excludeDropdown = ["demandId", "rrNumber", "experience"];

  // Open state per column key: { [key]: boolean }
  const [openFilterByKey, setOpenFilterByKey] = useState({});

  const openFilter = (key) => {
    setOpenFilterByKey((prev) => ({ ...prev, [key]: true }));
  };

  // Close must also clear the value (your requirement)
  const closeAndClearFilter = (key) => {
    onFilterChange(key, []); // clear the value
    setOpenFilterByKey((prev) => ({ ...prev, [key]: false })); // hide the field
  };

 

  const renderFilter = (col) => {
    const cfg = filterConfig[col.key];
    if (!cfg) return null;

    const isOpen = !!openFilterByKey[col.key];
    if (!isOpen) return null;

    // ✅ TEXT fields (DemandId, RR, Experience)
    if (excludeDropdown.includes(col.key)) {
      return (
        <div className="flex items-center gap-1 mt-1">
          <input
            type="text"
            value={filters[col.key] ?? ""}
            onChange={(e) => onFilterChange(col.key, e.target.value)}

            className="w-full rounded border px-3 py-2 text-sm"
            style={{ minWidth: "160px", height: "36px" }}

          />

          <button
            onClick={() => closeAndClearFilter(col.key)}
            className="border px-1 text-xs"
          >
            ×
          </button>
        </div>
      );
    }

    // ✅ DROPDOWN filters
    const value = filters[col.key] ?? [];

    const opts = Array.isArray(cfg.options)
      ? cfg.options.map((o) => ({
        label: o.name ?? o.label ?? o.value,
        value: (o.name ?? o.label ?? o.value)?.toString().trim(),
      }))
      : [];

    return (
      <div className="flex items-center gap-1 mt-1">
        <Select
          mode="multiple"
          showSearch
          value={value}
          placeholder={`Select ${col.label}`}
          options={opts}
          onChange={(val) => onFilterChange(col.key, val)}
          optionFilterProp="label"

          maxTagCount={1}              // VERY IMPORTANT (stop wrapping)
          // maxTagTextLength={10}        // cut long names
          style={{
            width: "100%",
            minWidth: 160,
            maxWidth: 200,
          }}
          className="custom-select-single-line"


          dropdownMatchSelectWidth={false} // prevents jump
        />

        <button
          onClick={() => closeAndClearFilter(col.key)}
          className="border px-1 text-xs"
        >
          ×
        </button>
      </div>
    );
  };



  return (
    <thead className={theadClassName}>
      <tr>
        {filteredColumns.map((col) => {
          const isOpen = !!openFilterByKey[col.key];
          // const hasValue = String(filters[col.key] ?? "").trim() !== "";
          const val = filters[col.key];
          const hasValue = Array.isArray(val)
            ? val.length > 0
            : String(val ?? "").trim() !== "";
          const iconActive = isOpen || hasValue;

          return (
            // <th
            //   key={col.key}
            //   className="whitespace-nowrap border-b border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 align-top"
            //   style={{ verticalAlign: "top" }}
            // >


            <th
              key={col.key}
              className={`whitespace-nowrap border-b border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 align-top
      ${col.key === "demandId" ? "sticky-demand-col" : ""}
    `}
            >
              <div className="flex flex-col items-stretch gap-1"
              >

                <div className="flex items-center justify-center gap-2">
                  <span>{col.label}</span>

                  {/* Search icon: ONLY opens (no toggle-close) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFilter(col.key);
                    }}
                    className={`p-0.5 rounded hover:bg-gray-100 ${iconActive ? "text-blue-600" : "text-gray-400"
                      }`}
                    title={isOpen ? "Filter open" : "Show filter"}
                    aria-pressed={isOpen}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-4.3-4.3M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Search field visible only after click; remains until Close (×) */}
                {renderFilter(col)}
              </div>
            </th>
          );
        })}

        {editingId && (
          <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
            {actionsLabel}
          </th>
        )}
      </tr>
    </thead>
  );
};

export default TableHeader;