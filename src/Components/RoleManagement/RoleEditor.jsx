

// src/Components/RoleManagement/RoleEditor.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Button, Space, Tree, Tag, message, Input, Spin } from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Layout from "../Layout.jsx";
import { createrole, editrole, getpermissions } from "../api/RoleManagement.js";

/** asArray: Safely normalize any input into an array. */
const asArray = (x) =>
  Array.isArray(x) ? x : x && typeof x === "object" ? Object.values(x) : [];

/** num: Convert to Number if finite; otherwise return original. */
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
};

/** RoleEditor: Create/Edit role by selecting module→child→action permissions. */
export default function RoleEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);

  /** initialRole: Role from navigation state used to prefill on edit. */
  const initialRole = useMemo(() => {
    if (!isEdit) return null;
    return location.state?.role || null;
  }, [isEdit, location.state]);

  /** RoleId: Resolve a role identifier from state/params for edit API. */
  const RoleId = useMemo(() => {
    const r = location.state?.role;
    return r?.roleId ?? r?.id ?? r?._id ?? id ?? null;
  }, [location.state, id]);

  /** name: Role name (uppercased on blur). */
  const [name, setName] = useState(
    initialRole?.role || initialRole?.name || ""
  );

  /** Tree data & expansion. */
  const [treeData, setTreeData] = useState([]);
  const [defaultExpandedModuleKeys, setDefaultExpandedModuleKeys] = useState([]);

  /** All keys (used for Select All). */
  const [allModuleKeys, setAllModuleKeys] = useState([]);
  const [allChildKeys, setAllChildKeys] = useState([]);
  const [allActionKeys, setAllActionKeys] = useState([]);

  /** Maps for cascade and payload building. */
  const [childKeyToModuleKey, setChildKeyToModuleKey] = useState(new Map());
  const [childKeyToModuleId, setChildKeyToModuleId] = useState(new Map());
  const [childIdToModuleId, setChildIdToModuleId] = useState(new Map());
  const [childKeyToActionKeys, setChildKeyToActionKeys] = useState(new Map());
  const [actionKeyToChildKey, setActionKeyToChildKey] = useState(new Map());
  const [childKeyToActionList, setChildKeyToActionList] = useState(new Map());

  /** Checked state (store only child/action keys, never module keys). */
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [checkedChildKeys, setCheckedChildKeys] = useState([]);
  const [checkedActionKeys, setCheckedActionKeys] = useState([]);

  /** UI busy/error flags. */
  const [loadingTree, setLoadingTree] = useState(false);
  const [treeError, setTreeError] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ NEW: force-check Dashboard MODULE (UI only)
  const [forcedModuleKeys, setForcedModuleKeys] = useState([]); // e.g., ['m:3'] // UPDATED: comment clarifies moduleId 3 is Dashboard in your backend

  /** computePrecheckedKeys: Prefill checked keys from existing role (edit path). */
  const computePrecheckedKeys = (
    role,
    {
      childKeys,
      childKeyToActionKeys,
      actionKeyToChildKey,
      childKeyToActionList,
      childIdToModuleId,
      nodes
    }
  ) => {
    const fullSet = new Set();
    const childOnly = new Set(); // 'c:<moduleId>:<childId>'
    const actionOnly = new Set(); // 'a:<moduleId>:<childId>:<actionId>'

    // ✅ Find Dashboard module key for forced UI check
    const dashModuleKeys = nodes
      .filter((n) => String(n.title).trim().toLowerCase() === "dashboard")
      .map((n) => n.key); // ['m:<moduleId>'] if present

    setForcedModuleKeys(dashModuleKeys);

    // Convert legacy keys (c:<childId> / a:<childId>:<actionId>) to module-scoped.
    const upgradeLegacyKey = (k) => {
      if (typeof k !== "string") return null;
      if (k.startsWith("c:") && k.split(":").length === 2) {
        const [, childIdRaw] = k.split(":");
        const childId = num(childIdRaw);
        const mid = childIdToModuleId.get(String(childId));
        return Number.isFinite(mid) ? `c:${mid}:${childId}` : null;
      }
      if (k.startsWith("a:") && k.split(":").length === 3) {
        const [, childIdRaw, actionIdRaw] = k.split(":");
        const childId = num(childIdRaw);
        const actionId = num(actionIdRaw);
        const mid = childIdToModuleId.get(String(childId));
        return Number.isFinite(mid) ? `a:${mid}:${childId}:${actionId}` : null;
      }
      return k; // already module-scoped
    };

    // Map of child -> all its action keys.
    const allActionsByChild = {};
    childKeys.forEach((ck) => {
      allActionsByChild[ck] = new Set(childKeyToActionKeys.get(ck) || []);
    });

    // 1) Prefer backend-provided moduleChildModule shape.
    const mcm = asArray(role.moduleChildModule || []);
    mcm.forEach((m) => {
      const moduleId = num(m.moduleId ?? m.id);
      const children = asArray(m.childModules ?? m.childModule ?? []);
      children.forEach((c) => {
        const childId = num(c.childModuleId ?? c.id);
        const ck = `c:${moduleId}:${childId}`;

        // Gather selected action IDs from possible shapes.
        let selectedIds = [];
        if (Array.isArray(c.actionIds)) {
          selectedIds = c.actionIds.map(Number).filter(Number.isFinite);
        } else if (Array.isArray(c.actions)) {
          selectedIds = c.actions
            .map((a) => Number(a.actionId))
            .filter(Number.isFinite);
        } else if (c.action && typeof c.action === "object") {
          const entries = Object.entries(c.action)
            .filter(([, v]) => !!v)
            .map(([name]) => String(name));
          const list = childKeyToActionList.get(ck) || [];
          selectedIds = entries
            .map((nm) => {
              const hit = list.find((x) => String(x.name) === nm);
              return hit ? Number(hit.id) : NaN;
            })
            .filter(Number.isFinite);
        }

        // Map IDs -> action keys (already module-scoped in map).
        const list = childKeyToActionList.get(ck) || [];
        list.forEach((a) => {
          if (selectedIds.includes(Number(a.id))) actionOnly.add(a.key);
        });

        // Mark child as checked if (a) all actions selected or (b) zero-action child.
        const allKeys = childKeyToActionKeys.get(ck) || [];
        const selectedForChildCount = [...actionOnly].filter(
          (ak) => actionKeyToChildKey.get(ak) === ck
        ).length;

        const zeroByActionIds =
          Array.isArray(c.actionIds) && c.actionIds.length === 0;
        const zeroByActionsArr =
          Array.isArray(c.actions) && c.actions.length === 0;
        const zeroByActionObject =
          c.action &&
          typeof c.action === "object" &&
          Object.values(c.action).every((v) => !v);

        const isZeroActionChildFromBackend =
          zeroByActionIds || zeroByActionsArr || zeroByActionObject;

        if (
          (allKeys.length > 0 && selectedForChildCount === allKeys.length) ||
          isZeroActionChildFromBackend
        ) {
          childOnly.add(ck);
        }
      });
    });

    // 2) Merge saved checkedKeys (upgrade legacy -> module-scoped).
    const rawSaved = asArray(role.checkedKeys || role.checked_keys)
      .map(String)
      .filter((k) => !k.startsWith("m:"));
    const savedUpgraded = rawSaved.map(upgradeLegacyKey).filter(Boolean);
    savedUpgraded.forEach((k) => {
      if (k.startsWith("a:")) actionOnly.add(k);
      if (k.startsWith("c:")) childOnly.add(k);
    });

    // Drop partially selected children (keep only fully-selected or zero-action).
    [...childOnly].forEach((ck) => {
      const allForChild = allActionsByChild[ck] || new Set();
      if (allForChild.size === 0) return; // zero-action child -> keep
      const selectedForChild = new Set(
        [...actionOnly].filter((ak) => actionKeyToChildKey.get(ak) === ck)
      );
      const fullySelected = selectedForChild.size === allForChild.size;
      if (!fullySelected) childOnly.delete(ck);
    });

    // 3) Final set: only child/action keys.
    actionOnly.forEach((ak) => fullSet.add(ak));
    childOnly.forEach((ck) => fullSet.add(ck));

    return { fullTreeKeys: fullSet, childOnly, actionOnly };
  };

  /** useEffect: Load permission master, build tree, and prefill selections on edit. */
  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoadingTree(true);
      setTreeError("");
      try {
        const res = await getpermissions();
        const modules = asArray(res?.data?.data ?? res?.data ?? res);

        const moduleKeys = [];
        const childKeys = [];
        const actionKeys = [];

        const _childKeyToModuleKey = new Map();
        const _childKeyToModuleId = new Map();
        const _childIdToModuleId = new Map();
        const _childKeyToActionKeys = new Map();
        const _actionKeyToChildKey = new Map();
        const _childKeyToActionList = new Map();

        // Build 3-level tree with module-scoped keys.
        const nodes = modules.map((mod) => {
          const moduleId = num(mod.moduleId);
          const moduleKey = `m:${moduleId}`;
          moduleKeys.push(moduleKey);

          const isDashboardModule =
            String(mod.moduleName).trim().toLowerCase() === "dashboard"; // UPDATED: this drives the grey checkbox and forced-checked behavior

          const childNodes = asArray(mod.childModules).map((child) => {
            const childId = num(child.childModuleId);
            const childKey = `c:${moduleId}:${childId}`;
            childKeys.push(childKey);

            _childKeyToModuleKey.set(childKey, moduleKey);
            _childKeyToModuleId.set(childKey, moduleId);
            _childIdToModuleId.set(String(childId), moduleId);

            const aNodes = asArray(child.actions).map((ac) => {
              const aId = num(ac.actionId);
              const aKey = `a:${moduleId}:${childId}:${aId}`;
              actionKeys.push(aKey);
              _actionKeyToChildKey.set(aKey, childKey);
              return {
                id: aId,
                key: aKey,
                name: String(ac.actionName),
                node: {
                  key: aKey,
                  title: <Tag color="geekblue">{ac.actionName}</Tag>,
                  isLeaf: true,
                  selectable: false,
                },
              };
            });

            _childKeyToActionKeys.set(
              childKey,
              aNodes.map((x) => x.key)
            );
            _childKeyToActionList.set(
              childKey,
              aNodes.map(({ id, key, name }) => ({ id, key, name }))
            );

            return {
              key: childKey,
              title: child.childModuleName,
              selectable: false,
              children: aNodes.map((x) => x.node),
            };
          });

          return {
            key: moduleKey,
            title: mod.moduleName,
            selectable: false,
            checkable: true,
            disableCheckbox: isDashboardModule, // grey & non-editable for Dashboard module node
            children: childNodes,
          };
        });

        if (!alive) return;

        // Set tree and key registries.
        setTreeData(nodes);
        setDefaultExpandedModuleKeys([...moduleKeys, ...childKeys]);
        setAllModuleKeys(moduleKeys);
        setAllChildKeys(childKeys);
        setAllActionKeys(actionKeys);

        // Publish maps.
        setChildKeyToModuleKey(_childKeyToModuleKey);
        setChildKeyToModuleId(_childKeyToModuleId);
        setChildIdToModuleId(_childIdToModuleId);
        setChildKeyToActionKeys(_childKeyToActionKeys);
        setActionKeyToChildKey(_actionKeyToChildKey);
        setChildKeyToActionList(_childKeyToActionList);

        // Prefill checks on Edit.
        if (isEdit && initialRole) {
          const { fullTreeKeys, childOnly, actionOnly } = computePrecheckedKeys(
            initialRole,
            {
              moduleKeys,
              childKeys,
              actionKeys,
              childKeyToActionKeys: _childKeyToActionKeys,
              actionKeyToChildKey: _actionKeyToChildKey,
              childKeyToModuleKey: _childKeyToModuleKey,
              childKeyToActionList: _childKeyToActionList,
              childIdToModuleId: _childIdToModuleId,
              nodes,
            }
          );
          setCheckedKeys(Array.from(fullTreeKeys));
          setCheckedChildKeys(Array.from(childOnly));
          setCheckedActionKeys(Array.from(actionOnly));
          setDefaultExpandedModuleKeys([...moduleKeys, ...childKeys]);
        }
      } catch (e) {
        setTreeError(e?.message || "Failed to load permissions.");
        message.error("Failed to load permissions.");
      } finally {
        if (alive) setLoadingTree(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, initialRole?.moduleChildModule, initialRole?.checkedKeys]);

  /** onCheck: Normalize Tree checks (drop module keys; keep child/action only). */
  const onCheck = (keysOrObj) => {
    const fullChecked = Array.isArray(keysOrObj)
      ? keysOrObj
      : keysOrObj?.checked || [];
    const normalized = fullChecked.map(String).filter((k) => !k.startsWith("m:"));
    const childOnly = normalized.filter((k) => k.startsWith("c:"));
    const actionOnly = normalized.filter((k) => k.startsWith("a:"));

    setCheckedKeys(normalized);
    setCheckedChildKeys(childOnly);
    setCheckedActionKeys(actionOnly);
  };

  /** selectAll: Check all child and action keys (never module keys). */
  const selectAll = () => {
    const union = [...allChildKeys, ...allActionKeys];
    setCheckedKeys(union);
    setCheckedChildKeys(allChildKeys);
    setCheckedActionKeys(allActionKeys);
  };

  /** clearAll: Uncheck all keys. */
  const clearAll = () => {
    setCheckedKeys([]);
    setCheckedChildKeys([]);
    setCheckedActionKeys([]);
  };

  /** buildModuleChildActionPayload: Build backend payload grouped by module. */
  const buildModuleChildActionPayload = (childKeys, actionKeysSel) => {
    const actionSet = new Set(actionKeysSel); // 'a:<moduleId>:<childId>:<actionId>'
    const childSet = new Set(childKeys); // 'c:<moduleId>:<childId>'

    // Include explicit child checks + any child with selected actions.
    const includeChildren = new Set(childKeys);
    actionKeysSel.forEach((ak) => {
      const ck = actionKeyToChildKey.get(ak);
      if (ck) includeChildren.add(ck);
    });

    const byModule = new Map(); // moduleId -> [{ childModuleId, actionIds }]
    includeChildren.forEach((ck) => {
      const moduleId = childKeyToModuleId.get(ck);
      if (moduleId == null) return;

      const parts = ck.split(":"); // ['c','<moduleId>','<childId>']
      const childId = Number(parts[2]);

      const allActions = childKeyToActionList.get(ck) || [];
      const actionIds = [];

      if (childSet.has(ck)) {
        // Child checked -> include all actions (may be zero).
        allActions.forEach((a) => actionIds.push(a.id));
      } else {
        // Partial -> include only selected actions.
        allActions.forEach((a) => {
          const aKey = `a:${moduleId}:${childId}:${a.id}`;
          if (actionSet.has(aKey)) actionIds.push(a.id);
        });
      }

      const entry = { childModuleId: childId, actionIds };
      if (!byModule.has(moduleId)) byModule.set(moduleId, []);
      byModule.get(moduleId).push(entry);
    });

    // Keep only children explicitly checked or with any actions selected.
    const result = Array.from(byModule.entries())
      .map(([moduleId, childArr]) => ({
        moduleId: Number(moduleId),
        childModules: childArr.filter((c) => {
          const ck = `c:${moduleId}:${c.childModuleId}`;
          return childSet.has(ck) || c.actionIds.length > 0;
        }),
      }))
      .filter((m) => m.childModules.length > 0);

    return result;
  };

  /** handleSave: Validate, build payload, and call create/edit API. */
  const handleSave = async () => {
    const trimmedName = name.trim().toUpperCase();

    const moduleChildModule = buildModuleChildActionPayload(
      checkedChildKeys,
      checkedActionKeys
    );

    const payload = {
      role: trimmedName,
      moduleChildModule,
      checkedKeys, // Persist only child/action keys (never module keys, even though Dashboard is force-checked in UI)
    };

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
        const resp = await editrole(roleIdNum, payload);
        message.success(resp?.message || "Role updated.");
      } else {
        const resp = await createrole(payload);
        message.success(resp?.message || "Role created.");
      }
      navigate("/rolemanagement", { replace: true });
    } catch (e) {
      const body = e?.response?.data;
      const msg =
        (body && (body.message || body.error || JSON.stringify(body))) ||
        e?.message ||
        "Failed to save role.";
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /** handleCancel: Navigate back to role management list. */
  const handleCancel = () => navigate("/rolemanagement");

  /** Render: Role form + permission tree + save/cancel controls. */
  return (
    <>
      <Layout>
        <div className="px-4 py-6 mx-auto w-full max-w-4xl  mt-[-40px]">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">
              {isEdit ? "Edit Role" : "Create Role"}
            </h1>
          </div>

          {/* Card */}
          <div className="bg-white shadow rounded-lg border border-gray-200 p-4">
            {/* Role Name */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Role Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setName((v) => v.toUpperCase().trim())}
                placeholder="ADMIN, PMO, DM"
                className="!h-9 rounded-md"
                disabled={saving}
              />
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-gray-700">Permissions</h2>
                <Space size="small">
                  <Button
                    size="small"
                    onClick={selectAll}
                    disabled={saving || loadingTree}
                  >
                    Select All
                  </Button>
                  <Button size="small" onClick={clearAll} disabled={saving}>
                    Clear
                  </Button>
                </Space>
              </div>

              <div
                className="border rounded-md bg-gray-50 p-2"
                style={{ minHeight: 150, maxHeight: 350, overflowY: "auto" }}
              >
                {loadingTree ? (
                  <div className="flex items-center justify-center py-6">
                    <Spin tip="Loading permissions..." />
                  </div>
                ) : treeError ? (
                  <div className="text-red-600 text-sm py-2">{treeError}</div>
                ) : (
                  <Tree
                    checkable
                    defaultExpandedKeys={defaultExpandedModuleKeys}
                    checkedKeys={{
                      checked: Array.from(
                        new Set([...(checkedKeys || []), ...(forcedModuleKeys || [])])
                      ),
                      halfChecked: [],
                    }}
                    onCheck={onCheck}
                    treeData={treeData}
                    disabled={saving}
                  />
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
              <Button onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleSave}
                loading={saving}
                disabled={
                  !(
                    name.trim().length > 0 &&
                    !saving &&
                    treeData.length > 0 &&
                    childKeyToModuleId.size > 0
                  ) ||
                  loadingTree ||
                  !!treeError
                }
              >
                {isEdit ? "Save Changes" : "Create Role"}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
