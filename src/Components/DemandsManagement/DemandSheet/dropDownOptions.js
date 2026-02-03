
// src/utils/dropdownOptions.js

/**
 * Normalize array items (objects or primitives) into { label, value } options.
 * @param {Array<any>} arr
 * @returns {{label:string, value:any}[]}
 */
export function toOptions(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => ({
    label:
      x?.label ??
      x?.name ??
      x?.displayName ??
      x?.title ??
      String(x?.value ?? x?.id ?? x?.code ?? x?.key ?? x ?? "Unknown"),
    value:
      x?.value ?? x?.id ?? x?.code ?? x?.key ?? x?.label ?? x?.name ?? x ?? "",
  }));
}

/**
 * Returns a function getFieldOptions(field) bound to the provided dropdowns object.
 * The mapping links UI fields to the list key and the item property to read.
 *
 * @param {Record<string, any>} dropdowns
 * @returns {(field: string) => {label:string, value:any}[]}
 */
export function makeGetFieldOptions(dropdowns) {
  return function getFieldOptions(field) {
    // Map each UI field to: which list to read, and which property inside each item to use
    const map = {
      lob:             { listKey: "lobList",              itemField: "lob" },
      skillCluster:     { listKey: "skillClusterList",     itemField: "skillCluster" }, // tolerate backend typo
      primarySkills:   { listKey: "primarySkillsList",    itemField: "primarySkills" }, // adjust to "primarySkill" if needed
      secondarySkills: { listKey: "secondarySkillsList",  itemField: "secondarySkills" }, // adjust to "secondarySkill" if needed
      demandType:      { listKey: "demandTypeList",       itemField: "demandType" },
      hbu:             { listKey: "hbuList",              itemField: "hbu" },
      hiringManager:   { listKey: "hiringManagerList",    itemField: "hiringManager" },
      salesSpoc:       { listKey: "salesSpocList",        itemField: "salesSpoc" },
      deliveryManager: { listKey: "deliveryManagerList",  itemField: "deliveryManager" }, // change to 'name' if items are { id, name }
      pmo:             { listKey: "pmoList",              itemField: "pmo" },
      pmoSpoc:         { listKey: "pmoSpocList",          itemField: "pmoSpoc" },
      demandTimeline:  { listKey: "demandTimeLineList",   itemField: "demandTimeLine" }, // list key uses TimeLine
      externalInternal:{ listKey: "externalInternalList", itemField: "externalInternal" },
      status:          { listKey: "statusList",           itemField: "status" },
    };

    const config = map[field];
    if (!config || !dropdowns) return [];

    const { listKey, itemField } = config;
    const raw = dropdowns?.[listKey] ?? [];

    // Extract just the values you want (e.g., 'lob' from each object),
    // while also supporting primitive arrays (strings/numbers) gracefully.
    const values = Array.isArray(raw)
      ? raw
          .map((item) =>
            item && typeof item === "object" ? item[itemField] : item
          )
          .filter((v) => v != null && String(v).trim() !== "")
      : [];

    return toOptions(values);
  };
}
