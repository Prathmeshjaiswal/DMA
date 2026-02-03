import React, { useMemo } from "react";

const TableHeader = ({
  columns,
  visibleColumns,
  editingId,
  theadClassName = "bg-gray-50",
  actionsLabel = "Actions",
}) => {
  const filteredColumns = useMemo(
    () => columns.filter((c) => visibleColumns.includes(c.key)),
    [columns, visibleColumns]
  );

  return (
    <thead className={theadClassName}>
      <tr>
        {filteredColumns.map((col) => (
          <th
            key={col.key}
            className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700"
          >
            <div className="flex items-center justify-center gap-2">
              <span>{col.label}</span>
              {/* subtle search icon (visual only) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
              </svg>
            </div>
          </th>
        ))}

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

//
// import React, { useMemo } from "react";
//
// const TableHeader = ({
//   columns,
//   visibleColumns,
//   editingId,
//   theadClassName = "bg-gray-50",
//   actionsLabel = "Actions",
//   // NEW:
//   showFilterRow = false,
//   columnQuery = {},
//   onColumnSearchChange = () => {},
// }) => {
//   const filteredColumns = useMemo(
//     () => columns.filter((c) => visibleColumns.includes(c.key)),
//     [columns, visibleColumns]
//   );
//
//   return (
//     <thead className={theadClassName}>
//       {/* Titles row */}
//       <tr>
//         {filteredColumns.map((col) => (
//           <th
//             key={col.key}
//             className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700"
//           >
//             {col.label}
//           </th>
//         ))}
//
//         {editingId && (
//           <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
//             {actionsLabel}
//           </th>
//         )}
//       </tr>
//
//       {/* Optional: small search inputs per column (local, client-side) */}
//       {showFilterRow && (
//         <tr>
//           {filteredColumns.map((col) => (
//             <th
//               key={`filter-${col.key}`}
//               className="border-b border-gray-200 px-4 py-2 text-center"
//             >
//               <input
//                 type="text"
//                 value={columnQuery[col.key] ?? ""}
//                 onChange={(e) => onColumnSearchChange(col.key, e.target.value)}
//                 placeholder={`Search ${col.label}`}
//                 className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
//               />
//             </th>
//           ))}
//           {editingId && <th className="border-b border-gray-200 px-4 py-2"></th>}
//         </tr>
//       )}
//     </thead>
//   );
// };
//
// export default TableHeader;