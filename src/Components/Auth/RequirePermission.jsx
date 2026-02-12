// // src/Components/Auth/RequirePermission.jsx
// import React from "react";
// import { usePermissions } from "../../Components/Auth/PermissionProvider";

// /**
//  * RequirePermission:
//  * Protects UI/routes by allowing access only if required permissions exist.
//  */
// export default function RequirePermission({ module, child, action, children }) {
//   const { hasChild, can } = usePermissions();

//   // Decide permission: if action is provided, require it; else only require child-level access
//   const allowed = action
//     ? can(module, child, action)
//     : hasChild(module, child);

//   if (!allowed) {
//     return <NavigateToUnauthorized />;
//   }

//   return children;
// }

// /**
//  * NavigateToUnauthorized:
//  * Triggers a controlled re-render for redirecting to an unauthorized page (placeholder).
//  */
// function NavigateToUnauthorized() {
//   const [go, setGo] = React.useState(false);

//   React.useEffect(() => setGo(true), []);

//   if (!go) return null;

//   return null;
// }



// src/Components/Auth/RequirePermission.jsx
import React from "react";
import { Navigate } from "react-router-dom"; // ✅ UPDATED: import Navigate
import { usePermissions } from "../../Components/Auth/PermissionProvider";

/**
 * RequirePermission:
 * Protects UI/routes by allowing access only if required permissions exist.
 */
export default function RequirePermission({ module, child, action, children }) {
  const { hasChild, can } = usePermissions();

  // Decide permission: if action is provided, require it; else only require child-level access
  const allowed = action ? can(module, child, action) : hasChild(module, child);

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />; // ✅ UPDATED: Redirect to 403 page
  }

  return children;
}