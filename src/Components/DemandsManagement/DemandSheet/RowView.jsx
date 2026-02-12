
import React, { useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { Button, message, Tooltip } from "antd";
import { EyeOutlined, UnlockOutlined,DownloadOutlined, LockOutlined } from "@ant-design/icons";
import { downloadDemandJDByFileName } from "../../api/Demands/getDemands";

export default function RowView({
  row,
  columns,
  visibleColumns,
  startEdit,
  isLocked,
  onViewRow = () => {},
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const copyToClipboard = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = String(row.demandId ?? "");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
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
      window.setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Failed to copy demandId:", err);
    }
  };

  const onDownload = async (e) => {
    e?.stopPropagation?.();
    try {
      const fileName = row?.jdFileName || row?.fileName;
      if (!fileName) {
        message.warning("No JD file name available for this demand.");
        return;
      }
      setDownloading(true);
      await downloadDemandJDByFileName(fileName);
    } catch (e) {
      message.error("Failed to download JD.");
    } finally {
      setDownloading(false);
    }
  };

  // Priority pill render
  const renderPriority = (value) => {
    const v = String(value || "").trim().toUpperCase();
    let cls = "bg-gray-100 text-gray-700 border border-gray-300";
    if (v === "P1") cls = "bg-green-50 text-green-700 border border-green-600/30";
    else if (v === "P2") cls = "bg-amber-50 text-amber-700 border border-amber-600/30";
    else if (v === "P3") cls = "bg-red-50 text-red-700 border border-red-600/30";
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
        {value || "-"}
      </span>
    );
  };

  return (
    <tr key={row.id ?? row.demandId ?? Math.random()} className="hover:bg-gray-50">
      {columns
        .filter((c) => visibleColumns.includes(c.key))
        .map((col) => {
          const value = row[col.key];

          if (col.key === "demandId") {
            const chipClass =
              "inline-flex items-center justify-between rounded-md bg-olive-600 pl-3 pr-2 py-2 text-sm font-semibold text-white shadow-sm hover:bg-olive-700";
            const fileName = row?.jdFileName || row?.fileName;

            return (
              <td key={col.key} className="border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* Edit */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLocked) return;
                      startEdit(row);
                    }}
                    disabled={isLocked}
                    className={
                      "inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 " +
                      (isLocked ? "opacity-50 cursor-not-allowed hover:bg-white" : "")
                    }
                    aria-disabled={isLocked}
                    title={isLocked ? "Finish current edit before editing another row" : "Edit"}
                  >
                    <PencilSquareIcon
                      className={"h-6 w-6 " + (isLocked ? "text-gray-400" : "text-gray-700")}
                    />
                  </button>

                  {/* Demand ID chip with Eye + Lock inside */}
                  <div
                    className={`${chipClass}`}
                    style={{ backgroundColor: "#6b8e23", minWidth: "8rem" }}
                    title="View details / Copy demand ID"
                  >
                    <span className="truncate pr-2">{row.demandId}</span>
                    <div className="flex items-center gap-2">
                      {/* Eye: open details */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRow(row);
                        }}
                        className="hover:opacity-90"
                        title="View details"
                      >
                        <EyeOutlined style={{ color: "white" }} />
                      </button>

                      {/* Lock: copy demand id */}

                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="hover:opacity-90"
                        title={copied ? "Copied!" : "Copy demand ID"}
                      >
                        {copied ? (
                          <LockOutlined style={{ color: "white" }} />
                        ) : (
                          <UnlockOutlined style={{ color: "white" }} />
                        )}
                      </button>

                      {/* Small 'Copied!' text while active */}
                      {copied && (
                        <span className="text-[10px] font-normal text-white/90 select-none">
                          Copied!
                        </span>
                      )}

                    </div>
                  </div>

                  {/* JD Download (kept as-is per your instruction) */}
                  <Tooltip title={fileName ? `Download JD (${fileName})` : "No JD file available"}>
                    <Button
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={onDownload}
                      loading={downloading}
                      disabled={!fileName || downloading}
                    />
                  </Tooltip>
                </div>
              </td>
            );
          }

          if (col.key === "priority") {
            return (
              <td
                key={col.key}
                className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-sm text-gray-800"
              >
                {renderPriority(value)}
              </td>
            );
          }

          if (col.key === "priority") {
            return (
              <td
                key={col.key}
                className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-sm text-gray-800"
              >
                {renderPriority(value)}
              </td>
            );
          }
      if(col.key === "skillCluster" || col.key === "primarySkills" || col.key === "secondarySkills" ){
return (
    <Tooltip title={`${value}`}>
  <td
    key={col.key}
    className="border-b border-gray-200 px-4 py-3 text-sm text-gray-800 align-middle"
  >
    <div className="block max-w-40 truncate">
      {value ?? ""}
    </div>
  </td>
  </Tooltip>
);
}


return (
      <td
        key={col.key}
        className="border-b border-gray-200 px-4 py-3 text-sm text-gray-800 align-middle"
      >
        <div className="block max-w-40 truncate">
          {value ?? ""}
        </div>
      </td>
      )

        })}
    </tr>
  );
}