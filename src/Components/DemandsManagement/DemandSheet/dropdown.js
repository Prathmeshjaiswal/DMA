// ================== options helpers (safe & generic) ==================

/**
 * Generic: turn any list of primitives or objects into [{label, value}]
 * - For objects, it uses the first available of:
 *   value:  x.value | x.id | x.code | x.key | x.name | x.label | x.title | x.displayName
 *   label:  x.label | x.name | x.displayName | x.title | (valueCandidate)
 */
export function toOptions(arr) {
  if (!Array.isArray(arr)) return [];

  return arr
    .map((x) => {
      if (x && typeof x === "object") {
        const valueCandidate =
          x.value ??
          x.id ??
          x.code ??
          x.key ??
          x.name ??
          x.label ??
          x.title ??
          x.displayName;

        const labelCandidate =
          x.label ?? x.name ?? x.displayName ?? x.title ?? valueCandidate;

        const label = String(labelCandidate ?? "").trim();
        const value = valueCandidate ?? "";

        if (!label) return null;
        return { label, value };
      }

      const s = String(x ?? "").trim();
      if (!s) return null;
      return { label: s, value: s };
    })
    .filter(Boolean);
}

/**
 * If you truly need to extract a sub-field from each item first (rare now),
 * keep this helper—but prefer passing the whole list directly to toOptions().
 */
export function listToOptionsByField(list = [], itemField) {
  const values = Array.isArray(list)
    ? list
        .map((item) => (item && typeof item === "object" ? item[itemField] : item))
        .filter((v) => v != null && String(v).trim() !== "")
    : [];
  return toOptions(values);
}

/**
 * Build all options in one shot—safe defaults & tolerant keys.
 * NOTE:
 * - We pass the whole list directly to toOptions(), so {id,name} works out of the box.
 * - We support both demandTimelineList & demandTimeLineList.
 */
export function buildAllOptions(dropdowns) {
  const d = dropdowns || {};

  // Support both timeline key variants
  const demandTimelineRaw =
    d.demandTimelineList ?? d.demandTimeLineList ?? [];

  return {
    lob:              toOptions(d.lobList               ?? []),
    skillCluster:     toOptions(d.skillClusterList      ?? []),
    primarySkills:    toOptions(d.primarySkillsList     ?? []),
    secondarySkills:  toOptions(d.secondarySkillsList   ?? []),
    demandType:       toOptions(d.demandTypeList        ?? []),
    demandTimeline:   toOptions(demandTimelineRaw),
    externalInternal: toOptions(d.externalInternalList  ?? []),
    status:           toOptions(d.statusList            ?? []),
    hbu:              toOptions(d.hbuList               ?? []),

    // People/org (works if items are { id, name } or similar)
    hiringManager:    toOptions(d.hiringManagerList     ?? []),
    deliveryManager:  toOptions(d.deliveryManagerList   ?? []),
    salesSpoc:        toOptions(d.salesSpocList         ?? []),
    pmo:              toOptions(d.pmoList               ?? []),
    pmoSpoc:          toOptions(d.pmoSpocList           ?? []),

    // Add others as needed:
    demandLocation:   toOptions(d.demandLocationList    ?? d.locationList ?? []),
    band:             toOptions(d.bandList              ?? []),
    priority:         toOptions(d.priorityList          ?? []),
    pod:              toOptions(d.podList               ?? d.prodProgramNameList ?? []),
  };
}

/**
 * Optional: per-field getter if you like that style.
 * Internally it now just calls buildAllOptions() and returns the right set.
 */
export function makeGetFieldOptions(dropdowns) {
  const all = buildAllOptions(dropdowns);
  return function getFieldOptions(field) {
    return all[field] ?? [];
  };
}