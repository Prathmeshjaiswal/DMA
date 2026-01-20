
import React,{useState} from "react";
import { Link } from "react-router-dom";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

export default function RowView({
  row,
  columns,
  visibleColumns,
  startEdit,
  isLocked,
}) {

    const [copied, setCopied] = useState(false);


const copyToClipboard = async (e) => {
    e.preventDefault();      // avoid any default behavior
    e.stopPropagation();     // ensure Link click isn't triggered

    const text = String(row.demandId ?? "");

    try {
      // Prefer the modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      // Reset the “Copied!” indicator after 1.2s
      window.setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Failed to copy demandId:", err);
    }
  };

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

<button
          type="button"
          onClick={copyToClipboard}
          className="p-1 rounded hover:bg-gray-100 active:bg-gray-200 transition"
          aria-label="Copy demand ID"
          title={copied ? "Copied!" : "Copy demand ID"}
        >
          {/* Clipboard icon (inline SVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5m-7 0h8m-8 0A2.5 2.5 0 0 0 6.5 10v7A2.5 2.5 0 0 0 9 19.5h6A2.5 2.5 0 0 0 17.5 17v-7A2.5 2.5 0 0 0 15 7.5"
            />
          </svg>
        </button>

        {/* Tiny “Copied!” badge (optional) */}
        {copied && (
          <span className="text-xs text-green-600 select-none">Copied!</span>
        )}

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
