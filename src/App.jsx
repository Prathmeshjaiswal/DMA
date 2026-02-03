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
            <Route path="/ProfileTracker" element={<ProtectedRoute><ProfileTracker /></ProtectedRoute>} />
            <Route path="/RDGTATeam" element={<ProtectedRoute><RDGTATeam /></ProtectedRoute>} />
            <Route path="/Report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
            <Route path="/HBU" element={<ProtectedRoute><HBU /></ProtectedRoute>} />
            <Route path="/demands/:demandId" element={<ProtectedRoute><DemandDetails /></ProtectedRoute>} />
            <Route path="/createuser" element={<ProtectedRoute><CreateUser/></ProtectedRoute>} />
{/*             <Route path="/setnewpassword" element={<ProtectedRoute><SetNewPassword /></ProtectedRoute>} /> */}
            <Route path="/adddemands2" element={<ProtectedRoute><AddDemands2/></ProtectedRoute>}/>
            <Route path="/adddemands1" element={<ProtectedRoute><AddDemands1/></ProtectedRoute>}/>
             <Route path="/demandsheet1" element={<ProtectedRoute><DemandSheet1/></ProtectedRoute>}/>
             <Route path="/rolemanagement" element={<ProtectedRoute><RoleManagement/></ProtectedRoute>}/>
             <Route path="/UserManagement" element={<ProtectedRoute><UserManagement/></ProtectedRoute>}/>
              <Route path="/roleeditor" element={<ProtectedRoute><RoleEditor /></ProtectedRoute>} />
             <Route path="/roleeditor/:id" element={<ProtectedRoute><RoleEditor /></ProtectedRoute>} />
              <Route path="/edituser/:id" element={<ProtectedRoute><EditUser/></ProtectedRoute>} />
             
            <Route path="*" element={<h2>Page Not Found</h2>} />
          </Routes>
        </Router>
      <div>
            </div>
    </>
  )
}

export default App
