

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
  onViewRow = () => { },

  loading = false,

  canViewDemands = false,
  canUpdateDemands = false,

  // Header filters
  filters = {},
  filterConfig = {},
  onFilterChange = () => { },
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
    <>
    
<style>
      {`
        .sticky-demand-col {
          position: sticky;
          left: 0;
          z-index: 5;
          background: white;
          white-space: nowrap;
          box-shadow: 2px 0 6px rgba(0, 0, 0, 0.08);
        }

        thead .sticky-demand-col {
          z-index: 10;
          background: #f9fafb;
        }
      `}
    </style>

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
            {loading ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="text-center py-8 text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
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
                      onSaved={cancelEdit}
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
                    canUpdateDemands={canUpdateDemands}
                    canViewDemands={canViewDemands}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
    

    </>
  );
}