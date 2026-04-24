import api from "../client";

// ✅ Combined Excel Export (All Sheets)
export async function exportAllCombinedExcel() {
  const res = await api.get("/api/exports/all", {
    responseType: "blob",
    headers: {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream",
    },
  });

  const now = new Date();
  const timestamp =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "_" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0");

  let filename = `Hsbc_Dma_Report_${timestamp}.xlsx`;

  // ✅ respect backend filename if sent
  const dispo =
    res.headers["content-disposition"] ||
    res.headers["Content-Disposition"];

  if (dispo) {
    const match =
      /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(dispo);
    if (match) {
      filename = decodeURIComponent(match[1] || match[2]).trim();
    }
  }

  triggerBrowserDownload(res.data, filename);
}

// --- helper ---
function triggerBrowserDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "export.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}