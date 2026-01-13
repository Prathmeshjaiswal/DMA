import { useState } from 'react'
import './App.css'
import Login from './Components/Auth/Login.jsx'
// import HomePage from './Components/HomePage.jsx'
import OnBoardingTracker from "./Components/DemandsManagement/Tracking/OnBoardingTracker.jsx"
import ProfileTracker from "./Components/DemandsManagement/Tracking/ProfileTracker.jsx"
import RDGTeam from "./Components/DemandsManagement/RDGTeam.jsx"
import Report from "./Components/DemandsManagement/Report.jsx"
import HBU from "./Components/DemandsManagement/HBU.jsx"
import EditDemand from "./Components/DemandsManagement/EditDemand.jsx"
import DashBoard from "./Components/DemandsManagement/DashBoard.jsx"
import DemandDetails from './Components/DemandsManagement/DemandDetails.jsx'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./Components/Auth/Register.jsx"
import ChangePassword from "./Components/Auth/ChangePassword.jsx"
// import DemandSheet2 from './Components/DemandsManagement/DemandSheet2.jsx'
import SetNewPassword from './Components/Auth/SetNewPassword.jsx'
// import DemandSheet1 from './Components/DemandsManagement/DemandSheet1.jsx'
import AddDemands2 from './Components/DemandsManagement/AddNewDemand/AddDemands2.jsx'
// import DemandSheet3 from './Components/DemandsManagement/DemandSheet/DemandSheet3.jsx'
// import DemandSheet4 from './Components/DemandsManagement/DemandSheet4.jsx'
// import DemandSheet5 from './Components/DemandsManagement/DemandSheet5.jsx'
// import DemandSheet6 from './Components/DemandsManagement/DemandSheet6.jsx'
// import DemandTable1 from './Components/DemandsManagement/DemandTable1.jsx'
import DemandSheet1 from './Components/DemandsManagement/DemandSheet/DemandSheet1.jsx'
import AddDemands1 from './Components/DemandsManagement/AddNewDemand/AddDemands1.jsx'

function App() {
  return (
    <>
    <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/Login"/>} />
            <Route path="/Login" element={<Login />} />
            <Route path="/DashBoard" element={<DashBoard />} />
            <Route path="/EditDemand" element={<EditDemand />}/>
            <Route path="/OnBoardingTracker" element={<OnBoardingTracker />} />
            <Route path="/ProfileTracker" element={<ProfileTracker />} />
            <Route path="/RDGTeam" element={<RDGTeam />} />
            <Route path="/Report" element={<Report />} />
            <Route path="/HBU" element={<HBU />} />
            <Route path="/demands/:demandId" element={<DemandDetails />} />
            <Route path="/Register" element={<Register/>} />
            <Route path="/change" element={<ChangePassword />} />   
            <Route path="/setnewpassword" element={<SetNewPassword />} />
            <Route path="/adddemands2" element={<AddDemands2/>}/>
            <Route path="/adddemands1" element={<AddDemands1/>}/>
             <Route path="/demandsheet1" element={<DemandSheet1/>}/>  
            <Route path="*" element={<h2>Page Not Found</h2>} />
          </Routes>
        </Router>
      <div>
            </div>
    </>
  )
}

export default App
