
import api from '../client';

export const getDemandsheet = async (page = null, size = null) => {
  const url = (page == null || size == null)
    ? '/addNewDemand/demands'
    : `/addNewDemand/demands?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;


  const res = await api.get(url);
  console.log('[getDemandsheet] response status:', res.data);
  return res.data;
};


export async function searchDemands(filter = {}, page = 0, size = 10) {
  const res = await api.post('/addNewDemand/search', filter, {
    params: { page, size },
    headers: { 'Content-Type': 'application/json' },
  });
  return res?.data ?? res;
}


const DEMAND_JD_DOWNLOAD_BY_FILENAME = (fileName) =>
  `/api/jd/demand/download/${String(fileName)}`;

export const downloadDemandJDByFileName = async (fileName) => {
  if (!fileName) throw new Error('fileName is required');
//  console.log(fileName);
  const res = await api.get(DEMAND_JD_DOWNLOAD_BY_FILENAME(fileName), {
    responseType: 'blob',
  });

  // Parse filename from Content-Disposition; fallback to provided fileName
  const cd = res.headers?.['content-disposition'] || '';
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
  const serverName = decodeURIComponent(match?.[1] || match?.[2] || fileName);

  const blob = new Blob([res.data]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = serverName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
