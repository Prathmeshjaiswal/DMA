export function buildPermFromRole(role) {
  // Final shape: modulesByName[module][child] = ['View','Edit',...]
  const modulesByName = {};

  // Normalize any input to an array: array → itself, object → values, else empty
  const asArray = (x) => (Array.isArray(x) ? x : x && typeof x === "object" ? Object.values(x) : []);

  // Safely iterate modules; optional chaining protects if role is null/undefined
  asArray(role?.moduleChildModule).forEach((m) => {
    // Prefer names; fallback to ID-based labels; normalize & trim
    const mName = String(m.moduleName || `Module ${m.moduleId}`).trim();
    // Ensure nested object exists
    modulesByName[mName] = modulesByName[mName] || {};

    // Iterate child modules
    asArray(m.childModules).forEach((c) => {
      const cName = String(c.childModuleName || `Child ${c.childModuleId}`).trim();
      const set = new Set(); // enforce unique action names

      // Iterate actions and add non-empty actionName
      asArray(c.actions).forEach((a) => {
        if (a?.actionName) set.add(String(a.actionName).trim());
      });

      // Convert Set to Array for JSON/storage friendliness
      modulesByName[mName][cName] = Array.from(set);
    });
  });

  return { modulesByName };
}

export function loadPerm() {
  try {
    // Read from localStorage; default to "null" string to make JSON.parse safe
    const raw = JSON.parse(localStorage.getItem("perm") || "null");
    // If null/undefined, return empty structure
    return raw ?? { modulesByName: {} };
  } catch {
    // If parsing failed, also return empty structure
    return { modulesByName: {} };
  }
}

export function savePerm(perm) {
  // Store a JSON string; default to empty structure if perm is falsy
  localStorage.setItem("perm", JSON.stringify(perm || { modulesByName: {} }));
}