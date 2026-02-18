import api from '../client';

function normalizePageResponse(raw) {
  const data = raw?.data ?? raw;
  const content =
    data?.content ??
    data?.items ??
    data?.records ??
    data?.list ??
    (Array.isArray(data) ? data : []) ??
    [];
  const page = Number(data?.page ?? data?.pageNumber ?? data?.number ?? 0);
  const size = Number(data?.size ?? data?.pageSize ?? data?.limit ?? content.length ?? 10);
  const totalElements = Number(
    data?.totalElements ?? data?.total ?? (Array.isArray(content) ? content.length : 0)
  );
  const totalPages = Number(data?.totalPages ?? (size ? Math.ceil(totalElements / size) : 1));
  return { items: content, page, size, totalElements, totalPages, raw: data };
}


export async function listProfileTracker(params = {}) {
  // Default page/size if not provided
  const { page = 0, size = 10 } = params;
  const res = await api.get('/profile-track', { params: { page, size } });
  return normalizePageResponse(res);
}

export async function updateProfileTracker({ id, payload }) {
  const url = `/profile-track/${encodeURIComponent(String(id))}/edit`;
  const res = await api.put(url, payload, {
    headers: {
//    'Content-Type': 'application/json'
    },
  });
  return res?.data ?? res;
}
