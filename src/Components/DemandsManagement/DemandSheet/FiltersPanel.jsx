import React from "react";

export default function FiltersPanel({
  filtersEnabled,
  setFiltersEnabled,
  filters,
  setFilters,
  enabledFilterFields,
  toggleFilterField,
  ALL_COLUMNS,
  SELECT_OPTIONS,
  className = "",
}) {
  const allFilterKeys = Object.keys(filters);

  return (
    <section className={`w-full ${className}`}>
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
              {allFilterKeys.map((key) => {
                const label = ALL_COLUMNS.find((c) => c.key === key)?.label ?? key;
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
              {allFilterKeys.map((key) => {
                if (!enabledFilterFields[key]) return null;

                const isSelect = SELECT_OPTIONS[key] && SELECT_OPTIONS[key].length > 0;
                const label = ALL_COLUMNS.find((c) => c.key === key)?.label ?? key;

                return (
                  <div key={key} className="flex flex-col">
                    <label className="mb-1 text-xs font-medium text-gray-500">
                      {label}
                    </label>

                    {isSelect ? (
                      <select
                        className="rounded-md border border-gray-300 bg-white p-2 text-sm"
                        value={filters[key]}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                      >
                        <option value="">All</option>
                        {SELECT_OPTIONS[key].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="rounded-md border border-gray-300 p-2 text-sm"
                        placeholder="Type to filter"
                        value={filters[key]}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, [key]: e.target.value }))
                        }
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
  );
}