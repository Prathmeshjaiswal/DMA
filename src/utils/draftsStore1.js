// ✅ NEW: src/utils/draftsStore1.js
// Minimal local-only drafts store (no backend needed)

const KEY = 'addDemandStep1Drafts'; // array of { id, form, createdAt, updatedAt, _savedBy? }

const newId = () => 'DRAFT-' + Math.random().toString(36).slice(2, 10).toUpperCase();

export function listDrafts1() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveDraftRecord1(record) {
  // record: { id?, form, _savedBy? }
  const now = new Date().toISOString();
  const drafts = listDrafts1();

  if (record.id) {
    const idx = drafts.findIndex(d => d.id === record.id);
    if (idx >= 0) {
      drafts[idx] = { ...drafts[idx], ...record, updatedAt: now };
    } else {
      drafts.push({ ...record, createdAt: now, updatedAt: now });
    }
  } else {
    drafts.push({ ...record, id: newId(), createdAt: now, updatedAt: now });
  }

  localStorage.setItem(KEY, JSON.stringify(drafts));
  // return the saved record
  return drafts[drafts.length - 1];
}

export function getDraft1(id) {
  return listDrafts1().find(d => d.id === id) || null;
}

export function deleteDraft1(id) {
  const next = listDrafts1().filter(d => d.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
}