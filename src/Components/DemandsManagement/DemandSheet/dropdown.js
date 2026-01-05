
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
 * Given a list of items and a field name to extract (e.g., "lob", "deliveryManager"),
 * returns normalized {label, value} options.
 *
 * @param {Array<any>} list
 * @param {string} itemField
 * @returns {{label:string, value:any}[]}
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
 * Returns a function getFieldOptions(field) bound to the provided dropdowns object.
 * The mapping links UI fields to the list key and the item property to read.
 *
 * Usage:
 *   const getFieldOptions = makeGetFieldOptions(dropdowns);
 *   const lobOptions = getFieldOptions('lob'); // -> [{label, value}, ...]
 *
 * @param {Record<string, any>} dropdowns
 * @returns {(field: string) => {label:string, value:any}[]}
 */
export function makeGetFieldOptions(dropdowns) {
  return function getFieldOptions(field) {
    // Map each UI field to: backend list key + the item property to pull from each object.
    // If your list items are { id, name }, change itemField to "name" for that list.
    const map = {
      lob:              { listKey: "lobList",               itemField: "lob" },

      skillCluster:     { listKey: "skillClusterList",      itemField: "skillCluster" },

      primarySkills:    { listKey: "primarySkillsList",     itemField: "primarySkills" },   // or "primarySkill"
      secondarySkills:  { listKey: "secondarySkillsList",   itemField: "secondarySkills" }, // or "secondarySkill"

      demandType:       { listKey: "demandTypeList",        itemField: "demandType" },
      demandTimeline:   { listKey: "demandTimeLineList",    itemField: "demandTimeLine" }, // note: TimeLine in list key

      externalInternal: { listKey: "externalInternalList",  itemField: "externalInternal" },
      status:           { listKey: "statusList",            itemField: "status" },

      hbu:              { listKey: "hbuList",               itemField: "hbu" },

      // People/org lists — switch itemField to 'name' if items are { id, name }
      hiringManager:    { listKey: "hiringManagerList",     itemField: "hiringManager" },
      deliveryManager:  { listKey: "deliveryManagerList",   itemField: "deliveryManager" },
      salesSpoc:        { listKey: "salesSpocList",         itemField: "salesSpoc" },
      pmo:              { listKey: "pmoList",               itemField: "pmo" },
      pmoSpoc:          { listKey: "pmoSpocList",           itemField: "pmoSpoc" },
    };

    const config = map[field];
    if (!config || !dropdowns) return [];

    const { listKey, itemField } = config;
    const raw = dropdowns?.[listKey];

    if (!Array.isArray(raw)) return [];

    return listToOptionsByField(raw, itemField);
  };
}

/**
 * Convenience: build all options at once into a single object.
 * Keeps your component tidy (no many useMemo calls).
 *
 * @param {Record<string, any>} dropdowns
 * @returns {Record<string, {label:string, value:any}[]>}
 */
export function buildAllOptions(dropdowns) {
  if (!dropdowns) {
    return {
      lob: [],
      skillCluster: [],
      primarySkills: [],
      secondarySkills: [],
      demandType: [],
      demandTimeline: [],
      externalInternal: [],
      status: [],
      hbu: [],
      hiringManager: [],
      deliveryManager: [],
      salesSpoc: [],
      pmo: [],
      pmoSpoc: [],
    };
  }

  return {
    lob:              listToOptionsByField(dropdowns.lobList               ?? [], "lob"),
    skillCluster:     listToOptionsByField(dropdowns.skillClusterList      ?? [], "skillCluster"),
    primarySkills:    listToOptionsByField(dropdowns.primarySkillsList     ?? [], "primarySkills"),   // or "primarySkill"
    secondarySkills:  listToOptionsByField(dropdowns.secondarySkillsList   ?? [], "secondarySkills"), // or "secondarySkill"
    demandType:       listToOptionsByField(dropdowns.demandTypeList        ?? [], "demandType"),
    demandTimeline:   listToOptionsByField(dropdowns.demandTimeLineList    ?? [], "demandTimeLine"),
    externalInternal: listToOptionsByField(dropdowns.externalInternalList  ?? [], "externalInternal"),
    status:           listToOptionsByField(dropdowns.statusList            ?? [], "status"),
    hbu:              listToOptionsByField(dropdowns.hbuList               ?? [], "hbu"),
    hiringManager:    listToOptionsByField(dropdowns.hiringManagerList     ?? [], "hiringManager"),   // switch to 'name' if needed
    deliveryManager:  listToOptionsByField(dropdowns.deliveryManagerList   ?? [], "deliveryManager"), // switch to 'name' if needed
    salesSpoc:        listToOptionsByField(dropdowns.salesSpocList         ?? [], "salesSpoc"),       // switch to 'name' if needed
    pmo:              listToOptionsByField(dropdowns.pmoList               ?? [], "pmo"),             // switch to 'name' if needed
    pmoSpoc:          listToOptionsByField(dropdowns.pmoSpocList           ?? [], "pmoSpoc"),         // switch to 'name' if needed
  };
}
