
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
            {col.label}
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
