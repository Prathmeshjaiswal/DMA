import { useState } from 'react'
import './App.css'
import Login from './Components/Auth/Login.jsx'
import OnBoardingTracker from "./Components/DemandsManagement/Tracking/OnBoardingTracker.jsx"
import ProfileTracker from "./Components/DemandsManagement/Tracking/ProfileTracker.jsx"
import RDGTATeam from "./Components/DemandsManagement/RDGTATeam.jsx"
import Report from "./Components/DemandsManagement/Report.jsx"
import HBU from "./Components/DemandsManagement/HBU.jsx"
import EditDemand from "./Components/DemandsManagement/EditDemand.jsx"
import DashBoard from "./Components/DemandsManagement/DashBoard.jsx"
import DemandDetails from './Components/DemandsManagement/DemandDetails.jsx'
import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
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

// ⬇️ NEW: route-level permission guard
import RequirePermission from './Components/Auth/RequirePermission.jsx'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/Login"/>} />
          <Route path="/Login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/change" element={<PublicRoute><ChangePassword /></PublicRoute>}/>

          {/* protected */}
          <Route path="/DashBoard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
          <Route path="/EditDemand" element={<ProtectedRoute><EditDemand /></ProtectedRoute>}/>
          <Route path="/OnBoardingTracker" element={<ProtectedRoute><OnBoardingTracker /></ProtectedRoute>} />
          <Route path="/ProfileTracker" element={<ProtectedRoute><RequirePermission module="DashBoard" child="DashBoard"><ProfileTracker /></RequirePermission></ProtectedRoute>} />
          <Route path="/RDGTATeam" element={<ProtectedRoute><RequirePermission module="DashBoard" child="DashBoard"><RDGTATeam /></RequirePermission></ProtectedRoute>} />

          {/* Reports: need DashBoard → Reports. If page only renders reports listing, child-level is enough.
             If the page performs downloads, add action="Download Reports". */}
          <Route
            path="/Report"
            element={
              <ProtectedRoute>
                <RequirePermission module="DashBoard" child="Reports">
                  <Report />
                </RequirePermission>
              </ProtectedRoute>
            }
          />

          <Route path="/HBU" element={<ProtectedRoute><RequirePermission module="DashBoard" child="DashBoard"><HBU /></RequirePermission></ProtectedRoute>} />
          <Route path="/demands/:demandId" element={<ProtectedRoute><DemandDetails /></ProtectedRoute>} />

          {/* User Management: you DON'T have this in your example; this will 403/unauthorized */}
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

          {/* CreateUser requires the "Create User" action; keep list page guard above */}
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

          {/* EditUser requires the "Edit User" action */}
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

          {/* Role Management list: requires Roles Sheet */}
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

          {/* RoleEditor (create) → "Create Role" */}
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

          {/* RoleEditor (edit) → "Edit Role" */}
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

          {/* Other demand-related routes remain auth-only for now */}
          <Route path="/adddemands2" element={<ProtectedRoute><AddDemands2/></ProtectedRoute>}/>
          <Route path="/adddemands1" element={<ProtectedRoute><AddDemands1/></ProtectedRoute>}/>
          
          <Route path="/demandsheet1" element={<ProtectedRoute><RequirePermission module="DashBoard" child="DashBoard"><DemandSheet1/>  </RequirePermission></ProtectedRoute>}/>



          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Routes>
      </Router>
      <div>
      </div>
    </>
  )
}

export default App