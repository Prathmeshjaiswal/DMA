

// src/Components/DemandsManagement/DemandTable.jsx
import React, { useState } from "react";
import TableHeader from "./TableHeader";
import RowEdit from "./RowEdit";
import RowView from "./RowView";

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



  const scrollRef = React.useRef(null);
const isDownRef = React.useRef(false);
const startXRef = React.useRef(0);
const scrollLeftRef = React.useRef(0);

  

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


        /* ✅ Sticky Header */
thead th {
  position: sticky;
  top: 0;
  z-index: 8;           /* below demandId header */
  background: #f9fafb;  /* REQUIRED otherwise it becomes transparent */
}



  .custom-select-single-line .ant-select-selector {
  display: flex !important;
  align-items: center !important;
  height: 36px !important;
  overflow: hidden !important;
}

.custom-select-single-line .ant-select-selection-overflow {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow: hidden !important;
}

.custom-select-single-line .ant-select-selection-item {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-select-single-line .ant-select-selection-overflow-item-rest {
  white-space: nowrap !important;
}


.no-select {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
      `}
      </style>

      <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>


     <div
  ref={scrollRef}
  className="overflow-auto max-h-[70vh] cursor-grab active:cursor-grabbing profiles-table"

  onMouseDown={(e) => {
    const btn = e.target.closest('.ant-btn');
    if (btn) return; // ✅ allow button click

    isDownRef.current = true;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;

    document.body.classList.add("no-select");
  }}

  onMouseLeave={() => {
    isDownRef.current = false;
    document.body.classList.remove("no-select");
  }}

  onMouseUp={() => {
    isDownRef.current = false;
    document.body.classList.remove("no-select");
  }}

  onMouseMove={(e) => {
    if (!isDownRef.current) return;

    e.preventDefault();

    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;

    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  }}
>

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
                  // const rowKey = row?.demandId ?? row?.id ?? `row-${idx}`;
                  const rowKey = row?.id ?? `${row?.demandId}-${idx}`;
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