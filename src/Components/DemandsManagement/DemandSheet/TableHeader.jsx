import React, { useMemo, useState } from "react";

const TableHeader = ({
  columns,
  visibleColumns,
  editingId,
  theadClassName = "bg-gray-50",
  actionsLabel = "Actions",
  // Filter props
  filters = {},
  filterConfig = {},
  onFilterChange = () => {},
}) => {
  const filteredColumns = useMemo(
    () => columns.filter((c) => visibleColumns.includes(c.key)),
    [columns, visibleColumns]
  );

  // Open state per column key: { [key]: boolean }
  const [openFilterByKey, setOpenFilterByKey] = useState({});

  const openFilter = (key) => {
    setOpenFilterByKey((prev) => ({ ...prev, [key]: true }));
  };

  // Close must also clear the value (your requirement)
  const closeAndClearFilter = (key) => {
    onFilterChange(key, ""); // clear the value
    setOpenFilterByKey((prev) => ({ ...prev, [key]: false })); // hide the field
  };

  const renderFilter = (col) => {
    const cfg = filterConfig[col.key];
    if (!cfg) return null; // no filter for this column

    const isOpen = !!openFilterByKey[col.key];
    if (!isOpen) return null; // only render after icon click

    const value = filters[col.key] ?? "";
    const common =
      "mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500";

    if (cfg.type === "select") {
      const opts = Array.isArray(cfg.options) ? cfg.options : [];
      return (
        <div className="flex items-center gap-1 mt-1">
          <select
            className={common}
            value={value}
            onChange={(e) => onFilterChange(col.key, e.target.value)}
            // Keep open until user clicks Close (×)
            autoFocus
          >
            <option value="">All</option>
            {opts.map((o) => {
              const val = String(o.id ?? o.value ?? o.name ?? "");
              const label = String(o.name ?? o.label ?? val);
              // If backend expects id instead of label, change value to `val`
              return (
                <option key={val} value={label}>
                  {label}
                </option>
              );
            })}
          </select>

          {/* Single Close (×): clears AND hides */}
          <button
            type="button"
            title="Close"
            className="rounded border border-gray-300 px-1 text-[12px] leading-4 text-gray-700 hover:bg-gray-100"
            onClick={() => closeAndClearFilter(col.key)}
          >
            ×
          </button>
        </div>
      );
    }

    // Default: text input
    return (
      <div className="flex items-center gap-1 mt-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onFilterChange(col.key, e.target.value)}
          placeholder={`Filter ${col.label}`}
          className={common}
          // Keep open until user clicks Close (×)
          autoFocus
        />
        {/* Single Close (×): clears AND hides */}
        <button
          type="button"
          title="Close"
          className="rounded border border-gray-300 px-1 text-[12px] leading-4 text-gray-700 hover:bg-gray-100"
          onClick={() => closeAndClearFilter(col.key)}
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
          const hasValue = String(filters[col.key] ?? "").trim() !== "";
          const iconActive = isOpen || hasValue;

          return (
            <th
              key={col.key}
              className="whitespace-nowrap border-b border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 align-top"
              style={{ verticalAlign: "top" }}
            >
              <div className="flex flex-col items-stretch gap-1">
                <div className="flex items-center justify-center gap-2">
                  <span>{col.label}</span>

                  {/* Search icon: ONLY opens (no toggle-close) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFilter(col.key);
                    }}
                    className={`p-0.5 rounded hover:bg-gray-100 ${
                      iconActive ? "text-blue-600" : "text-gray-400"
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