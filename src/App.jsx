// src/App.jsx
import { useState } from 'react'
import './App.css'
import Login from './Components/Auth/Login.jsx'
import OnBoardingTracker from "./Components/DemandsManagement/Tracking/OnBoardingTracker.jsx"
import ProfileTracker from "./Components/DemandsManagement/Tracking/ProfileTracker.jsx"
import RDGTATeam from "./Components/Profiles/RDGTATeam.jsx"
import Report from "./Components/DemandsManagement/Report.jsx"
import HBU from "./Components/DemandsManagement/HBU.jsx"
import EditDemand from "./Components/DemandsManagement/EditDemand.jsx"
import DashBoard from "./Components/DemandsManagement/DashBoard.jsx"
import DemandDetails from './Components/DemandsManagement/DemandDetails.jsx'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CreateUser from "./Components/UserManagement/CreateUser.jsx"
import ChangePassword from "./Components/Auth/ChangePassword.jsx"
import SetNewPassword from './Components/Auth/SetNewPassword.jsx'
import AddDemands2 from './Components/DemandsManagement/AddNewDemand/AddDemands2.jsx'
import DemandSheet1 from './Components/DemandsManagement/DemandSheet/DemandSheet1.jsx'
import AddDemands1 from './Components/DemandsManagement/AddNewDemand/AddDemands1.jsx'
import ProtectedRoute from './Components/Auth/ProtectedRoute.jsx'
import PublicRoute from './Components/Auth/PublicRoute.jsx'
import RoleManagement from './Components/RoleManagement/RoleManagement.jsx'
import UserManagement from './Components/UserManagement/UserManagement.jsx'
import RoleEditor from './Components/RoleManagement/RoleEditor.jsx'
import EditUser from './Components/UserManagement/EditUser.jsx'
import ProfileSheet from "./Components/Profiles/ProfileSheet.jsx";
import Draft1 from './Components/DemandsManagement/AddNewDemand/Draft1.jsx'
import OnboardingList from "./Components/OnBoarding/OnboardingList.jsx"





// ⬇️ NEW: route-level permission guard
import RequirePermission from './Components/Auth/RequirePermission.jsx'
// <-- adjust path if needed

// ⬇️ add a tiny component (inline) for unauthorized page, or create a separate file if you prefer
const Unauthorized = () => (
  <div style={{ padding: 24 }}>
    <h2>403 — Unauthorized</h2>
    <p>You don’t have permission to view this page.</p>
  </div>
);

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/Login" />} />
          <Route path="/Login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/change" element={<PublicRoute><ChangePassword /></PublicRoute>} />

          {/* protected */}
          <Route path="/DashBoard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
          <Route path="/OnBoardingTracker" element={<ProtectedRoute><OnBoardingTracker /></ProtectedRoute>} />

          {/* ✅ UPDATED: Map to specific child modules under DashBoard */}
          <Route
            path="/ProfileTracker"
            element={
              <ProtectedRoute>
                <RequirePermission module="DashBoard" child="Track"> {/* UPDATED */}
                  <ProfileTracker />
                </RequirePermission>
              </ProtectedRoute>
            }
          />

          <Route
            path="/RDGTATeam"
            element={
              <ProtectedRoute>
                <RequirePermission module="DashBoard" child="RDG/TA"> {/* UPDATED */}
                  <RDGTATeam />
                </RequirePermission>
              </ProtectedRoute>
            }
          />

          {/* ✅ UPDATED: Reports requires child + action */}
          <Route
            path="/Report"
            element={
              <ProtectedRoute>
                <RequirePermission module="DashBoard" child="Reports" action="Download Reports"> {/* UPDATED */}
                  <Report />
                </RequirePermission>
              </ProtectedRoute>
            }
          />

          <Route
            path="/HBU"
            element={
              <ProtectedRoute>
                <RequirePermission module="DashBoard" child="HBU"> {/* UPDATED */}
                  <HBU />
                </RequirePermission>
              </ProtectedRoute>
            }
          />
          <Route path="/demands/:demandId" element={<ProtectedRoute><DemandDetails /></ProtectedRoute>} />

          {/* User Management (kept as-is) */}
          <Route
            path="/UserManagement"
            element={
              <ProtectedRoute>
                <RequirePermission module="User Management" child="Users Sheet">
                  <UserManagement />
                </RequirePermission>
              </ProtectedRoute>
            }
          />

          <Route path="/EditDemand"  element={
              <ProtectedRoute>
                <RequirePermission module="User Management" child="Users Sheet">
                  <EditDemand />
                </RequirePermission>
              </ProtectedRoute>
            } />
          <Route
            path="/createuser"
            element={
              <ProtectedRoute>
                <RequirePermission module="User Management" child="Users Sheet" action="Create User">
                  <CreateUser />
                </RequirePermission>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edituser/:id"
            element={
              <ProtectedRoute>
                <RequirePermission module="User Management" child="Users Sheet" action="Edit User">
                  <EditUser />
                </RequirePermission>
              </ProtectedRoute>
            }
          />

          {/* Role Management (kept as-is) */}
          <Route
            path="/rolemanagement"
            element={
              <ProtectedRoute>
                <RequirePermission module="Role Management" child="Roles Sheet">
                  <RoleManagement />
                </RequirePermission>
              </ProtectedRoute>
            }
          />
          <Route
            path="/roleeditor"
            element={
              <ProtectedRoute>
                <RequirePermission module="Role Management" child="Roles Sheet" action="Create Role">
                  <RoleEditor />
                </RequirePermission>
              </ProtectedRoute>
            }
          />
          <Route
            path="/roleeditor/:id"
            element={
              <ProtectedRoute>
                <RequirePermission module="Role Management" child="Roles Sheet" action="Edit Role">
                  <RoleEditor />
                </RequirePermission>
              </ProtectedRoute>
            }
          />

          {/* ✅ UPDATED: Demands routes require child "Demands" */}
          <Route
            path="/adddemands2"
            element={
              <ProtectedRoute>
                <RequirePermission module="DashBoard" child="Demands"> {/* UPDATED */}
                  <AddDemands2 />
                </RequirePermission>
              </ProtectedRoute>
            }
          />
          <Route
            path="/adddemands1"
            element={
              <ProtectedRoute>
                <RequirePermission module="DashBoard" child="Demands"> {/* UPDATED */}
                  <AddDemands1 />
                </RequirePermission>
              </ProtectedRoute>
            }
          />

          {/* Minimal Drafts route (protected) */}
          <Route path="/drafts1" element={
              <ProtectedRoute>
                <RequirePermission module="DashBoard" child="Demands"> {/* UPDATED */}
                  <Draft1 />
                </RequirePermission>
              </ProtectedRoute>
            }/>

          {/* ✅ UPDATED: Demands main sheet is also under child "Demands" */}
          <Route
            path="/demandsheet1"
            element={
              <ProtectedRoute>
                <RequirePermission module="DashBoard" child="Demands"> {/* UPDATED */}
                  <DemandSheet1 />
                </RequirePermission>
              </ProtectedRoute>
            }
          />

          <Route path="/profileSheet" element={
              <ProtectedRoute>
                <RequirePermission module="DashBoard" child="RDG/TA"> {/* UPDATED */}
                  <ProfileSheet/>
                </RequirePermission>
              </ProtectedRoute>
            } />



<Route
  path="/onboardinglist"
  element={
    <ProtectedRoute>
      <RequirePermission module="DashBoard" child="Track">
        <OnboardingList />
      </RequirePermission>
    </ProtectedRoute>
  }
/>



          {/* Unauthorized page */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Routes>
      </Router>
      <div></div>
    </>
  )
}

export default App