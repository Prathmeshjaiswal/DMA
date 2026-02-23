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

export async function getProfileTrackerDropdowns() {
  const res = await api.get('/profile-track/dropdowns');
  // in your code, success() likely wraps as {data: {...}}
  const data = res?.data?.data ?? res?.data ?? res;

  return {
    evaluationStatuses: data?.evaluationStatuses ?? data?.evaluationStatus ?? [],
    profileTrackerStatuses: data?.profileTrackerStatuses ?? data?.profileTrackerStatus ?? [],
  };
}

// export const getDropDownData = async () => {
//   const res = await api.get('/profile-track/dropdowns', {
//     headers: { Accept: 'application/json' },
//   });
//   return res.data?.data ?? res.data ?? res;
// };

// export const searchProfileTracker = async ({ q = '', page = 0, size = 10 }) => {
//   const url = `/profile-track/search?q=${encodeURIComponent(q)}&page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;
//   const res = await api.get(url);
//   return normalizePageResponse(res);
// };

export const searchProfileTracker = async ({ filter = {}, page = 0, size = 10 }) => {
  const url = `/profile-track/search?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;
  const res = await api.post(url, filter);
  const unwrapped = res?.data?.data ?? res?.data ?? res;
  return normalizePageResponse(unwrapped);
};
