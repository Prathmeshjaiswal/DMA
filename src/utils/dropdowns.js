
export function toOptions(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => ({
    label:
      x?.label ??
      x?.name ??
      x?.displayName ??
      x?.title ??
      String(x?.value ?? x?.id ?? x?.code ?? x?.key ?? x ?? 'Unknown'),
    value:
      x?.value ?? x?.id ?? x?.code ?? x?.key ?? x?.label ?? x?.name ?? x ?? ''
  }));
}



export function getFieldOptions(field) {
  // Map each UI field to: which list to read, and which property inside each item to use
  const map = {
    lob:             { listKey: "lobList",              itemField: "lob" },
    skillCluter:     { listKey: "skillClusterList",     itemField: "skillCluster" }, // tolerate backend typo
    primarySkills:   { listKey: "primarySkillsList",    itemField: "primarySkills" }, // adjust to "primarySkill" if needed
    secondarySkills: { listKey: "secondarySkillsList",  itemField: "secondarySkills" }, // adjust to "secondarySkill" if needed
    demandType:      { listKey: "demandTypeList",       itemField: "demandType" },
    hbu:             { listKey: "hbuList",              itemField: "hbu" },
    hiringManager:   { listKey: "hiringManagerList",    itemField: "hiringManager" },
    salesSpoc:       { listKey: "salesSpocList",        itemField: "salesSpoc" },
    deliveryManager: { listKey: "deliveryManagerList",  itemField: "deliveryManager" }, // change to "name" if items are { id, name }
    pmo:             { listKey: "pmoList",              itemField: "pmo" },
    pmoSpoc:         { listKey: "pmoSpocList",          itemField: "pmoSpoc" },
    demandTimeline:  { listKey: "demandTimeLineList",   itemField: "demandTimeline" }, // list key uses TimeLine
    externalInternal:{ listKey: "externalInternalList", itemField: "externalInternal" },
    status:          { listKey: "statusList",           itemField: "status" },
  };

  const config = map[field];
  if (!config) return toOptions([], undefined);

  const { listKey, itemField } = config;
  const raw = dropdowns?.[listKey] ?? [];

  // Extract just the values you want (e.g., 'lob' from each object),
  // while also supporting primitive arrays (strings/numbers) gracefully.
  const values = Array.isArray(raw)
    ? raw
        .map(item => (item && typeof item === "object" ? item[itemField] : item))
        .filter(v => v != null && String(v).trim() !== "")
    : [];

  return toOptions(values, listKey);
}
