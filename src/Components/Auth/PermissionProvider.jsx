import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { loadPerm as loadFromDisk } from "../../utils/permUtils";

/**
 * Context holding permission data and helpers.
 */
const PermissionContext = createContext({
  list: { modulesByName: {} },
  hasChild: () => false,
  can: () => false,
  setPerm: () => {},  // set new permissions (after login / refresh)
  reload: () => {},   // re-read from localStorage if needed
  clear: () => {},    // clear on logout
});

const EMPTY = { modulesByName: {} };

/**
 * saveToDisk: Persist permissions to localStorage and broadcast a storage event.
 */
const saveToDisk = (perm) => {
  const payload = JSON.stringify(perm || EMPTY);
  localStorage.setItem("perm", payload);

  // Broadcast to this window + other tabs (native storage event only fires on other tabs)
  try {
    window.dispatchEvent(new StorageEvent("storage", { key: "perm", newValue: payload }));
  } catch {
    // Some environments don't allow constructing StorageEvent; safe to ignore.
  }
};

/**
 * makeApi: Create simple permission-check helpers (hasChild, can) from a permissions list.
 */
const makeApi = (list) => {
  const hasChild = (moduleName, childName) =>
    !!list?.modulesByName?.[moduleName]?.[childName];

  const can = (moduleName, childName, actionName) => {
    const acts = list?.modulesByName?.[moduleName]?.[childName] || [];
    return acts.includes(actionName);
  };

  return { hasChild, can };
};

/**
 * PermissionProvider: Provides permission state, actions and helpers to the app via context.
 */
export function PermissionProvider({ children }) {
  // Reactive permission state (initialized from localStorage)
  const [perm, setPermState] = useState(() => loadFromDisk() || EMPTY);

  /**
   * setPerm: Set, persist, and broadcast new permissions (call after login/refresh).
   */
  const setPerm = useCallback((next) => {
    const final = next || EMPTY;
    setPermState(final);
    saveToDisk(final);
  }, []);

  /**
   * reload: Re-read permissions from localStorage into state.
   */
  const reload = useCallback(() => {
    const fresh = loadFromDisk() || EMPTY;
    setPermState(fresh);
  }, []);

  /**
   * clear: Remove permissions from localStorage and reset state (use on logout).
   */
  const clear = useCallback(() => {
    localStorage.removeItem("perm");
    setPermState(EMPTY);
    try {
      window.dispatchEvent(new StorageEvent("storage", { key: "perm", newValue: null }));
    } catch {
      // Ignore if StorageEvent construction isn't supported.
    }
  }, []);

  /**
   * Effect: Keep this tab in sync with changes from other tabs (and local broadcasts).
   */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "perm") {
        setPermState(e.newValue ? JSON.parse(e.newValue) : EMPTY);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /**
   * Memoized context value: permissions, helpers, and mutators.
   */
  const value = useMemo(
    () => ({
      list: perm,
      ...makeApi(perm),
      setPerm,
      reload,
      clear,
    }),
    [perm, setPerm, reload, clear]
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * usePermissions: Convenience hook to access permission context APIs and data.
 */
export const usePermissions = () => useContext(PermissionContext);