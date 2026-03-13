import api from '../client';

 export async function exportProfileSheet() {
   const res = await api.get('/api/exports/profiles/excel', {
     responseType: 'blob',
     headers: {
       Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream',
     },
   });
   let filename = 'profiles.xlsx';
   const dispo = res.headers['content-disposition'] || res.headers['Content-Disposition'];
   if (dispo) {
     const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(dispo);
     if (match) filename = decodeURIComponent(match[1] || match[2]).trim();
   }
   triggerBrowserDownload(res.data, filename);
 }

// --- Helper: trigger download in browser ---
function triggerBrowserDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}