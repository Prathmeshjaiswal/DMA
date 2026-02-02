
import React, { useEffect, useMemo, useState } from "react";
import { Button, Space, Tree, Tag, message, Input, Spin } from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Layout from "../Layout.jsx";
import { createrole, editrole, getpermissions } from "../api/RoleManagement.js";

/* ---------- Helpers ---------- */
const asArray = (x) => (Array.isArray(x) ? x : x && typeof x === "object" ? Object.values(x) : []);
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
};

/**
 * Unique keys in the Tree (avoid collisions):
 *  - Module: `m:<moduleId>`
 *  - Child : `c:<childModuleId>`
 *  - Action: `a:<childModuleId>:<actionId>`
 */
export default function RoleEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);

  /* ---------- Role from navigation (for edit prefill) ---------- */
  const initialRole = useMemo(() => {
    if (!isEdit) return null;
    return location.state?.role || null;
  }, [isEdit, location.state]);

  /* ---------- PUT path param ---------- */
  const RoleId = useMemo(() => {
    const r = location.state?.role;
    return r?.roleId ?? r?.id ?? r?._id ?? id ?? null;
  }, [location.state, id]);

  const [name, setName] = useState(initialRole?.role || initialRole?.name || "");

  /* ---------- Tree states ---------- */
  const [treeData, setTreeData] = useState([]);
  const [defaultExpandedModuleKeys, setDefaultExpandedModuleKeys] = useState([]);

  // All keys (for select all)
  const [allModuleKeys, setAllModuleKeys] = useState([]);
  const [allChildKeys, setAllChildKeys] = useState([]);
  const [allActionKeys, setAllActionKeys] = useState([]);

  // Maps for cascade & payload building
  const [childKeyToModuleKey, setChildKeyToModuleKey] = useState(new Map());     // 'c:3' -> 'm:1'
  const [childKeyToModuleId, setChildKeyToModuleId] = useState(new Map());       // 'c:3' -> 1
  const [childIdToModuleId, setChildIdToModuleId] = useState(new Map());         // '3'   -> 1
  const [childKeyToActionKeys, setChildKeyToActionKeys] = useState(new Map());   // 'c:3' -> ['a:3:15','a:3:16']
  const [actionKeyToChildKey, setActionKeyToChildKey] = useState(new Map());     // 'a:3:15' -> 'c:3'
  const [childKeyToActionList, setChildKeyToActionList] = useState(new Map());   // 'c:3' -> [{id, name, key}...]

  // Checked state for Tree
  const [checkedKeys, setCheckedKeys] = useState([]);           // full: modules + children + actions
  const [checkedChildKeys, setCheckedChildKeys] = useState([]); // only 'c:'
  const [checkedActionKeys, setCheckedActionKeys] = useState([]); // only 'a:'

  const [loadingTree, setLoadingTree] = useState(false);
  const [treeError, setTreeError] = useState("");
  const [saving, setSaving] = useState(false);

  /* ---------- Load permissions & build 3-level tree ---------- */
  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoadingTree(true);
      setTreeError("");
      try {
        const res = await getpermissions();
        // IMPORTANT: many backends respond as { success, message, data: [...] }
        const modules = asArray(res?.data?.data ?? res?.data ?? res);

        const moduleKeys = [];
        const childKeys  = [];
        const actionKeys = [];

        const _childKeyToModuleKey = new Map();
        const _childKeyToModuleId  = new Map();
        const _childIdToModuleId   = new Map();
        const _childKeyToActionKeys= new Map();
        const _actionKeyToChildKey = new Map();
        const _childKeyToActionList= new Map();

        const nodes = modules.map((mod) => {
          const moduleId = num(mod.moduleId);
          const moduleKey = `m:${moduleId}`;
          moduleKeys.push(moduleKey);

          const childNodes = asArray(mod.childModules).map((child) => {
            const childId  = num(child.childModuleId);
            const childKey = `c:${childId}`;
            childKeys.push(childKey);

            _childKeyToModuleKey.set(childKey, moduleKey);
            _childKeyToModuleId.set(childKey, moduleId);
            _childIdToModuleId.set(String(childId), moduleId);

            const aNodes = asArray(child.actions).map((ac) => {
              const aId  = num(ac.id);
              const aKey = `a:${childId}:${aId}`;
              actionKeys.push(aKey);
              _actionKeyToChildKey.set(aKey, childKey);
              return {
                id: aId,
                key: aKey,
                name: String(ac.action), // store the action friendly name
                node: {
                  key: aKey,
                  title: <Tag color="geekblue">{ac.action}</Tag>,
                  isLeaf: true,
                  selectable: false,
                }
              };
            });

            _childKeyToActionKeys.set(childKey, aNodes.map((x) => x.key));
            _childKeyToActionList.set(childKey, aNodes.map(({ id, key, name }) => ({ id, key, name })));

            return {
              key: childKey,
              title: child.childModule,
              selectable: false,
              children: aNodes.map((x) => x.node),
            };
          });

          return {
            key: moduleKey,
            title: mod.moduleName,
            selectable: false,
            children: childNodes,
          };
        });

        if (!alive) return;

        setTreeData(nodes);
        setDefaultExpandedModuleKeys(moduleKeys);
        setAllModuleKeys(moduleKeys);
        setAllChildKeys(childKeys);
        setAllActionKeys(actionKeys);

        setChildKeyToModuleKey(_childKeyToModuleKey);
        setChildKeyToModuleId(_childKeyToModuleId);
        setChildIdToModuleId(_childIdToModuleId);
        setChildKeyToActionKeys(_childKeyToActionKeys);
        setActionKeyToChildKey(_actionKeyToChildKey);
        setChildKeyToActionList(_childKeyToActionList);

        // ---- Prefill checks on Edit ----
        if (isEdit && initialRole) {
          const { fullTreeKeys, childOnly, actionOnly } = computePrecheckedKeys(
            initialRole,
            {
              moduleKeys,
              childKeys,
              actionKeys,
              _childKeyToActionKeys,
              _actionKeyToChildKey,
              _childKeyToModuleKey
            }
          );
          setCheckedKeys(Array.from(fullTreeKeys));
          setCheckedChildKeys(Array.from(childOnly));
          setCheckedActionKeys(Array.from(actionOnly));
        }
      } catch (e) {
        console.error("Permissions fetch error:", e);
        setTreeError(e?.message || "Failed to load permissions.");
        message.error("Failed to load permissions.");
      } finally {
        if (alive) setLoadingTree(false);
      }
    };

    load();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, initialRole?.moduleChildModule, initialRole?.checkedKeys]);

  /* ---------- Prefill computation ---------- */
  const computePrecheckedKeys = (
    role,
    { moduleKeys, childKeys, actionKeys, _childKeyToActionKeys, _actionKeyToChildKey, _childKeyToModuleKey }
  ) => {
    const fullSet = new Set();
    const childOnly = new Set();
    const actionOnly = new Set();

    const treeKeySet = new Set([...moduleKeys, ...childKeys, ...actionKeys]);

    // A) If backend (or we) saved exact checkedKeys, restore directly.
    const saved = asArray(role.checkedKeys || role.checked_keys).map(String);
    if (saved.length > 0) {
      saved.forEach((k) => {
        if (treeKeySet.has(k)) {
          fullSet.add(k);
          if (k.startsWith("c:")) childOnly.add(k);
          if (k.startsWith("a:")) actionOnly.add(k);
        }
      });
      // Expand parents of actions/children for completeness
      [...actionOnly].forEach((ak) => {
        const ck = _actionKeyToChildKey.get(ak);
        if (ck) {
          fullSet.add(ck);
          const mk = _childKeyToModuleKey.get(ck);
          if (mk) fullSet.add(mk);
        }
      });
      [...childOnly].forEach((ck) => {
        const mk = _childKeyToModuleKey.get(ck);
        if (mk) fullSet.add(mk);
        const acts = _childKeyToActionKeys.get(ck) || [];
        acts.forEach((ak) => fullSet.add(ak)); // if child checked earlier, include actions
      });
      return { fullTreeKeys: fullSet, childOnly, actionOnly };
    }

    // B) Else prefill from your payload shape:
    // role.moduleChildModule = [{ module, childModule: [{ id, action:{ name: boolean } }] }]
    const mcm = asArray(role.moduleChildModule || []);
    mcm.forEach((m) => {
      const modId = num(m.module);
      const mk = `m:${modId}`;
      if (moduleKeys.includes(mk)) fullSet.add(mk);

      asArray(m.childModule).forEach((c) => {
        const childId = num(c.id);
        const ck = `c:${childId}`;
        const actsMap = c.action || {};
        const trueActionNames = Object.entries(actsMap)
          .filter(([, val]) => !!val)
          .map(([name]) => String(name));

        // Map action names back to action keys/ids
        const actionList = childKeyToActionList.get(ck) || [];
        const selectedKeys = actionList
          .filter((a) => trueActionNames.includes(a.name))
          .map((a) => a.key);

        // Mark actions checked
        selectedKeys.forEach((ak) => {
          actionOnly.add(ak);
          fullSet.add(ak);
        });

        // If "all actions" true → check child as well
        const allKeys = (childKeyToActionKeys.get(ck) || []);
        const allSelected = allKeys.length > 0 && selectedKeys.length === allKeys.length;
        if (allSelected) {
          childOnly.add(ck);
          fullSet.add(ck);
          // ensure parent module checked too:
          const pmk = childKeyToModuleKey.get(ck);
          if (pmk) fullSet.add(pmk);
        } else if (selectedKeys.length > 0) {
          // partial → ensure parent module is half/checked by cascading
          const pmk = childKeyToModuleKey.get(ck);
          if (pmk) fullSet.add(pmk);
        }
      });
    });

    return { fullTreeKeys: fullSet, childOnly, actionOnly };
  };

  /* ---------- Tree handlers ---------- */
  const onCheck = (keysOrObj) => {
    const fullChecked = Array.isArray(keysOrObj) ? keysOrObj : keysOrObj?.checked || [];
    const normalized = fullChecked.map(String);

    const childOnly = normalized.filter((k) => k.startsWith("c:"));
    const actionOnly = normalized.filter((k) => k.startsWith("a:"));

    setCheckedKeys(normalized);
    setCheckedChildKeys(childOnly);
    setCheckedActionKeys(actionOnly);
  };

  const selectAll = () => {
    const union = [...allModuleKeys, ...allChildKeys, ...allActionKeys];
    setCheckedKeys(union);
    setCheckedChildKeys(allChildKeys);
    setCheckedActionKeys(allActionKeys);
  };

  const clearAll = () => {
    setCheckedKeys([]);
    setCheckedChildKeys([]);
    setCheckedActionKeys([]);
  };

  /* ---------- Build YOUR payload shape ---------- */
  // moduleChildModule = [
  //   {
  //     module: <number>,
  //     childModule: [
  //       {
  //         id: <number>,
  //         action: { "<actionName>": true, ... }   // ONLY selected actions set to true
  //       }
  //     ]
  //   }
  // ]
  const buildModuleChildActionPayload = (childKeys, actionKeysSel) => {
    const actionSet = new Set(actionKeysSel); // 'a:<childId>:<actionId>'
    const childSet  = new Set(childKeys);     // 'c:<childId>'

    // gather children to include: (checked child) ∪ (children with any action checked)
    const includeChildren = new Set(childKeys);
    actionKeysSel.forEach((ak) => {
      const ck = actionKeyToChildKey.get(ak);
      if (ck) includeChildren.add(ck);
    });

    // group by module id (number)
    const byModule = new Map(); // moduleId -> [{ id, action }]
    includeChildren.forEach((ck) => {
      const moduleId = childKeyToModuleId.get(ck);
      if (moduleId == null) return;
      const childIdStr = ck.split(":")[1];
      const childId = Number(childIdStr);

      // determine which actions are selected for this child
      const allActions = childKeyToActionList.get(ck) || [];
      const actionsObj = {};

      if (childSet.has(ck)) {
        // child checked → all actions true
        allActions.forEach((a) => {
          actionsObj[a.name] = true;
        });
      } else {
        // partial: only selected actions
        allActions.forEach((a) => {
          const aKey = `a:${childId}:${a.id}`;
          if (actionSet.has(aKey)) {
            actionsObj[a.name] = true;
          }
        });
      }

      const entry = { id: childId, action: actionsObj };

      if (!byModule.has(moduleId)) byModule.set(moduleId, []);
      byModule.get(moduleId).push(entry);
    });

    // to array, with your field names
    return Array.from(byModule.entries()).map(([moduleId, childArr]) => ({
      module: Number(moduleId),
      childModule: childArr
    }));
  };

  /* ---------- Save ---------- */
  const mapsReady =
    treeData.length > 0 &&
    allChildKeys.length > 0 &&
    childKeyToModuleId.size > 0;

  const canSave = name.trim().length > 0 && !saving && mapsReady;

  const handleSave = async () => {
    const trimmedName = name.trim().toUpperCase();

    const moduleChildModule = buildModuleChildActionPayload(
      checkedChildKeys,
      checkedActionKeys
    );

    const payload = {
      role: trimmedName,
      moduleChildModule, // ✅ your required shape
      // Optionally store checkedKeys so edit can prefill exactly next time:
      checkedKeys
    };

    // debug preview
    // console.log("[payload]", JSON.stringify(payload, null, 2));

    setSaving(true);
    try {
      if (isEdit) {
        if (!RoleId) {
          message.error("Editable role id not found.");
          setSaving(false);
          return;
        }
        const roleIdNum = Number(RoleId);
        if (!Number.isFinite(roleIdNum)) {
          message.error("Role id is not numeric.");
          setSaving(false);
          return;
        }
        await editrole(roleIdNum, payload);
        message.success("Role updated.");
      } else {
        await createrole(payload);
        message.success("Role created.");
      }
      navigate("/rolemanagement", { replace: true });
    } catch (e) {
      const body = e?.response?.data;
      console.error("Save role error:", e, body);
      const msg =
        (body && (body.message || body.error || JSON.stringify(body))) ||
        e?.message ||
        "Failed to save role.";
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/rolemanagement");

  /* ---------- UI ---------- */
  return (
    <>
      <Layout>
        <div className="px-4 py-10 mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-slate-900 m-0">
              {isEdit ? "Edit Role" : "Add Role"}
            </h1>
          </div>

        <div className="mt-1 flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700 w-24">Role Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setName((v) => v.toUpperCase().trim())}
            placeholder="ADMIN, PMO, DM"
            className="focus:!ring-2 focus:!ring-blue-200 focus:!border-blue-500 transition"
            style={{ width: 288 }}
            disabled={saving}
          />
        </div>

        <div className="mt-3 grid grid-cols-1">
          <div className="rounded-md border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <div className="text-sm text-slate-600">Select permissions</div>
              <Space size="small">
                <Button size="small" onClick={selectAll} disabled={saving || loadingTree || !!treeError}>
                  Select All
                </Button>
                <Button size="small" onClick={clearAll} disabled={saving || loadingTree}>
                  Clear
                </Button>
              </Space>
            </div>

            <div className="flex flex-col px-3 py-2" style={{ minHeight: 200 }}>
              {loadingTree ? (
                <div className="flex items-center justify-center py-6">
                  <Spin tip="Loading permissions..." />
                </div>
              ) : treeError ? (
                <div className="text-red-600 text-sm py-3">{treeError}</div>
              ) : (
                <Tree
                  checkable
                  selectable={false}
                  // Expand only modules by default; childModules collapsed
                  defaultExpandedKeys={defaultExpandedModuleKeys}
                  // NO checkStrictly → keep cascade & half-checked behavior
                  checkedKeys={checkedKeys}
                  onCheck={onCheck}
                  treeData={treeData}
                  disabled={saving}
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 border-t border-slate-200 pt-2 flex justify-end gap-2">
          <Button onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            disabled={!canSave || loadingTree || !!treeError}
            loading={saving}
          >
            {isEdit ? "Save Changes" : "Create Role"}
          </Button>
        </div>
      </div>
    </Layout>
  </>
  );
}





