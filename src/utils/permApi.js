// Adjust to your API surface
import { buildPermFromRole } from "./permUtils";

export async function fetchMyPermissions() {
  // Example GET /auth/me/permissions → return user's role/perm payload
  // Must include moduleChildModule (or equivalent you already use)
  const res = await fetch(`/auth/me/permissions`, { credentials: "include" });
  if (!res.ok) throw new Error(`perm refresh failed: ${res.status}`);
  return res.json();
}

// Apply perms into your PermissionProvider
export async function refreshPermissionList(applyFn) {
  const data = await fetchMyPermissions();
  // If your endpoint returns { role: {...} } or array—normalize as needed:
  const permList = buildPermFromRole(data.role || data);
  applyFn(permList);
  return permList;
}