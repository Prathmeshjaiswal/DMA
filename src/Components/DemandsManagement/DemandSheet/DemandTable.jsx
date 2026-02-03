import React, { useState } from "react";
import TableHeader from "./TableHeader";
import RowEdit from "./RowEdit";
import RowView from "./RowView";

export default function DemandTable({
  rows,
  columns,
  visibleColumns,
  dropdowns,
  className = "",
  onViewRow = () => {},
}) {
  const [editingId, setEditingId] = useState(null);

  const startEdit = (row) => {
    if (editingId && editingId !== row.demandId) return;
    setEditingId(row.demandId);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <TableHeader
            columns={columns}
            visibleColumns={visibleColumns}
            editingId={editingId}
            actionsLabel="Actions"
          />
          <tbody>
            {rows.map((row) => {
              const isEditing = editingId === row.demandId;
              const isEditingAny = Boolean(editingId);
              const isLocked = isEditingAny && !isEditing;

              if (isEditing) {
                return (
                  <RowEdit
                    key={row.demandId}
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
                  key={row.demandId}
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


// import React, { useState } from "react";
// import TableHeader from "./TableHeader";
// import RowEdit from "./RowEdit";
// import RowView from "./RowView";
//
// export default function DemandTable({
//   rows,
//   columns,
//   visibleColumns,
//   dropdowns,
//   className = "",
//   // NEW: column search in header
//   showFilterRow = true,
//   columnQuery = {},
//   onColumnSearchChange = () => {},
//   // OPEN DETAILS when clicking demandId chip
//   onViewRow = () => {},
//   // Column chooser passthrough (unchanged UI externally)
//   columnsEnabled,
//   setColumnsEnabled,
//   setVisibleColumns,
//   defaultVisible,
// }) {
//   const [editingId, setEditingId] = useState(null);
//
//   const startEdit = (row) => {
//     if (editingId && editingId !== row.demandId) return;
//     setEditingId(row.demandId);
//     // NOTE: if you manage draft/saving here, keep as in your original
//     // setDraft({ ...row }); setSaving(false);  // (not included to avoid changing your logic)
//   };
//
//   const cancelEdit = () => {
//     setEditingId(null);
//     // setDraft({}); setSaving(false); // keep your original behavior
//   };
//
//   return (
//     <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
//       <div className="overflow-x-auto">
//         <table className="min-w-full border-collapse">
//           <TableHeader
//             columns={columns}
//             visibleColumns={visibleColumns}
//             editingId={editingId}
//             actionsLabel="Actions"
//             // NEW: show filter inputs under titles
//             showFilterRow={showFilterRow}
//             columnQuery={columnQuery}
//             onColumnSearchChange={onColumnSearchChange}
//           />
//
//           <tbody>
//             {rows.map((row) => {
//               const isEditing = editingId === row.demandId;
//               const isEditingAny = Boolean(editingId);
//               const isLocked = isEditingAny && !isEditing;
//
//               if (isEditing) {
//                 return (
//                   <RowEdit
//                     key={row.demandId}
//                     row={row}
//                     columns={columns}
//                     visibleColumns={visibleColumns}
//                     dropdowns={dropdowns}
//                     onSaved={(updated) => {
//                       // update your list if needed, then close edit
//                       cancelEdit?.();
//                     }}
//                     cancelEdit={cancelEdit}
//                   />
//                 );
//               }
//
//               return (
//                 <RowView
//                   key={row.demandId}
//                   row={row}
//                   columns={columns}
//                   visibleColumns={visibleColumns}
//                   startEdit={startEdit}
//                   isLocked={isLocked}
//                   onViewRow={onViewRow} // NEW
//                 />
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
