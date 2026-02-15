// src/Components/DemandsManagement/DemandTable.jsx
import React, { useState } from "react";
import TableHeader from "./TableHeader";
import RowEdit from "./RowEdit";
import RowView from "./RowView";

/**
 * DemandTable
 *
 * Props:
 * - rows: Array<object>
 * - columns: Array<{ key: string, label: string, ... }>
 * - visibleColumns: string[] (keys in columns to render)
 * - dropdowns: object (forwarded to RowEdit)
 * - className: string (wrapper classes)
 * - onViewRow: fn(row) (open detail modal)
 * - filters: object (per-column filter values)           // <-- NEW
 * - filterConfig: object (per-column filter config)      // <-- NEW
 * - onFilterChange: fn(key, value)                       // <-- NEW
 * - theadClassName: string (optional header class)
 * - actionsLabel: string (optional actions col label)
 */
export default function DemandTable({
  rows = [],
  columns = [],
  visibleColumns = [],
  dropdowns = {},
  className = "",
  onViewRow = () => {},
  // Header filters
  filters = {},
  filterConfig = {},
  onFilterChange = () => {},
  // Optional header props
  theadClassName = "bg-gray-50",
  actionsLabel = "Actions",
}) {
  const [editingId, setEditingId] = useState(null);

  const startEdit = (row) => {
    const id = row?.demandId ?? row?.id;
    if (id == null) return;
    // Only one row can be edited at a time
    if (editingId && editingId !== id) return;
    setEditingId(id);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse">
          <TableHeader
            columns={columns}
            visibleColumns={visibleColumns}
            editingId={editingId}
            theadClassName={theadClassName}
            actionsLabel={actionsLabel}
            // Filters in header
            filters={filters}
            filterConfig={filterConfig}
            onFilterChange={onFilterChange}
          />

          <tbody>
            {rows.map((row, idx) => {
              const rowKey = row?.demandId ?? row?.id ?? `row-${idx}`;
              const isEditing = editingId === (row?.demandId ?? row?.id);
              const isEditingAny = Boolean(editingId);
              const isLocked = isEditingAny && !isEditing;

              if (isEditing) {
                return (
                  <RowEdit
                    key={rowKey}
                    row={row}
                    columns={columns}
                    visibleColumns={visibleColumns}
                    dropdowns={dropdowns}
                    onSaved={() => {
                      cancelEdit?.();
                    }}
                    cancelEdit={cancelEdit}
                  />
                );
              }

              return (
                <RowView
                  key={rowKey}
                  row={row}
                  columns={columns}
                  visibleColumns={visibleColumns}
                  startEdit={startEdit}
                  isLocked={isLocked}
                  onViewRow={onViewRow}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}