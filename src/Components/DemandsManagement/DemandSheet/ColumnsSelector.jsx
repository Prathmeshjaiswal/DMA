
import React from "react";

export default function ColumnsPanel({
  columnsEnabled,
  setColumnsEnabled,
  ALL_COLUMNS,
  visibleColumns,
  toggleColumn,
  className = "",
}) {
  return (
    <section className={`w-full md:sticky md:top-4 self-start ${className}`}>
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
            {ALL_COLUMNS.map((col) => (
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
  );
}
