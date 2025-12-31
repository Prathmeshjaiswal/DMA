
import React from "react";
import { Link } from "react-router-dom";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

export default function RowView({
  row,
  columns,
  visibleColumns,
  startEdit,
  isLocked,
}) {
  return (
    <tr key={row.demandId} className="hover:bg-gray-50">
      {columns
        .filter((c) => visibleColumns.includes(c.key))
        .map((col) => {
          const value = row[col.key];

          if (col.key === "demandId") {
            const containerClass = "flex items-center gap-2";
            const linkClass =
              "inline-flex w-32 justify-center rounded-md bg-olive-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-olive-700";

            return (
              <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                <div className={`${containerClass} transition-all duration-200`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isLocked) return;
                      startEdit(row);
                    }}
                    disabled={isLocked}
                    className={
                      "inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 " +
                      (isLocked
                        ? "opacity-50 cursor-not-allowed hover:bg-white"
                        : "")
                    }
                    aria-disabled={isLocked}
                    aria-label={`Edit demand ${row.demandId}`}
                    title={
                      isLocked
                        ? "Finish current edit before editing another row"
                        : "Edit"
                    }
                  >
                    <PencilSquareIcon
                      className={"h-6 w-6 " + (isLocked ? "text-gray-400" : "text-gray-700")}
                    />
                  </button>

                  <Link
                    to={`/demands/${row.demandId}`}
                    className={`${linkClass} transition-all duration-200`}
                    style={{ backgroundColor: "#6b8e23" }}
                    title="View details"
                  >
                    {row.demandId}
                  </Link>
                </div>
              </td>
            );
          }

          // Read-only cells
          return (
            <td
              key={col.key}
              className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-sm text-gray-800"
            >
              {value ?? ""}
            </td>
          );
        })}
    </tr>
  );
}
