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
import RequirePermission from './Components/Auth/RequirePermission.jsx'
import Draft1 from './Components/DemandsManagement/AddNewDemand/Draft1.jsx'
import DemandDetailModal from "./Components/DemandsManagement/DemandSheet/DemandDetailModal.jsx";


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
          <Route path="/DashBoard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
          <Route path="/OnBoardingTracker" element={<ProtectedRoute><OnBoardingTracker /></ProtectedRoute>} />
          <Route path="/ProfileTracker" element={<ProtectedRoute><RequirePermission module="DashBoard" child="Track"><ProfileTracker /></RequirePermission></ProtectedRoute>} />
          <Route path="/RDGTATeam" element={<ProtectedRoute><RequirePermission module="DashBoard" child="RDG/TA"><RDGTATeam /></RequirePermission></ProtectedRoute>} />
          <Route path="/Report" element={ <ProtectedRoute><RequirePermission module="DashBoard" child="Reports"><Report /></RequirePermission></ProtectedRoute>}/>
          <Route path="/HBU" element={<ProtectedRoute><RequirePermission module="DashBoard" child="DashBoard"><HBU /></RequirePermission></ProtectedRoute>} />
          <Route path="/demands/:demandId" element={<ProtectedRoute><DemandDetails /></ProtectedRoute>} />
          <Route path="/UserManagement" element={ <ProtectedRoute> <RequirePermission module="User Management" child="Users Sheet"> <UserManagement /> </RequirePermission></ProtectedRoute>}/>
          <Route path="/createuser" element={ <ProtectedRoute> <RequirePermission module="User Management" child="Users Sheet" action="Create User"> <CreateUser /></RequirePermission></ProtectedRoute>}/>
          <Route path="/edituser/:id" element={ <ProtectedRoute> <RequirePermission module="User Management" child="Users Sheet" action="Edit User"> <EditUser /></RequirePermission></ProtectedRoute>}/>
         <Route path="/rolemanagement" element={ <ProtectedRoute> <RequirePermission module="Role Management" child="Roles Sheet"> <RoleManagement /> </RequirePermission></ProtectedRoute>}/>
          <Route path="/roleeditor" element={ <ProtectedRoute> <RequirePermission module="Role Management" child="Roles Sheet" action="Create Role"> <RoleEditor /></RequirePermission></ProtectedRoute>}/>
          <Route path="/roleeditor/:id" element={ <ProtectedRoute> <RequirePermission module="Role Management" child="Roles Sheet" action="Edit Role"> <RoleEditor /></RequirePermission></ProtectedRoute>}/>
          <Route path="/adddemands2" element={<ProtectedRoute><RequirePermission module="DashBoard" child="Demands"><AddDemands2/></RequirePermission></ProtectedRoute>}/>
           <Route path="/adddemands1" element={<ProtectedRoute><RequirePermission module="DashBoard" child="Demands"><AddDemands1/></RequirePermission></ProtectedRoute>}/>
          <Route path="/drafts1" element={<ProtectedRoute><RequirePermission module="DashBoard" child="Demands"><Draft1/></RequirePermission></ProtectedRoute>} />
          <Route path="/demandsheet1" element={<ProtectedRoute><RequirePermission module="DashBoard" child="Demands"><DemandSheet1/>  </RequirePermission></ProtectedRoute>}/>
{/*           <Route path="/demandsheet1" element={<ProtectedRoute><RequirePermission module="DashBoard" child="Demands"><DemandSheet1/>  </RequirePermission></ProtectedRoute>}/> */}

          <Route path="/profileSheet" element={ <ProtectedRoute><RequirePermission module="DashBoard" child="RDG/TA"><ProfileSheet/></RequirePermission></ProtectedRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Routes>
      </Router>
      <div></div>
    </>
  )
}

export default App