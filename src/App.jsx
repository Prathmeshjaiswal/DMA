import { useState } from 'react'
import './App.css'
import Login from './Components/Auth/Login.jsx'
import HomePage from './Components/HomePage.jsx'
import AddDemands from "./Components/DemandsManagement/AddDemands.jsx"
import DemandSheet from "./Components/DemandsManagement/DemandSheet.jsx"
import OnBoardingTracker from "./Components/DemandsManagement/OnBoardingTracker.jsx"
import ProfileTracker from "./Components/DemandsManagement/ProfileTracker.jsx"
import RDGTeam from "./Components/DemandsManagement/RDGTeam.jsx"
import Report from "./Components/DemandsManagement/Report.jsx"
import TATeam from "./Components/DemandsManagement/TATeam.jsx"
import AddDemands2 from "./Components/DemandsManagement/AddDemands2.jsx"
import EditDemand from "./Components/DemandsManagement/EditDemand.jsx"
import DashBoard from "./Components/DemandsManagement/DashBoard.jsx"
import DemandDetails from './Components/DemandsManagement/DemandDetails.jsx'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login1 from "./Components/Auth/Login1.jsx"
import Register from "./Components/Auth/Register.jsx"
import ChangePassword from "./Components/Auth/ChangePassword.jsx"
import DemandSheet2 from './Components/DemandsManagement/DemandSheet2.jsx'
import SetNewPassword from './Components/Auth/SetNewPassword.jsx'
import DemandSheet1 from './Components/DemandsManagement/DemandSheet1.jsx'
import AddDemands7 from './Components/DemandsManagement/AddNewDemand/AddDemands7.jsx'
import DemandSheet3 from './Components/DemandsManagement/DemandSheet3.jsx'
import DemandSheet4 from './Components/DemandsManagement/DemandSheet4.jsx'
import DemandSheet5 from './Components/DemandsManagement/DemandSheet5.jsx'
import DemandSheet6 from './Components/DemandsManagement/DemandSheet6.jsx'
import DemandTable1 from './Components/DemandsManagement/DemandTable1.jsx'
import DemandSheet7 from './Components/DemandsManagement/DemandSheet/DemandSheet7.jsx'
import AddDemands8 from './Components/DemandsManagement/AddNewDemand/AddDemands8.jsx'

function App() {
  return (
    <>
    <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login1"/>} />
            {/* <Route path="/Login" element={<Login />} /> */}
            <Route path="/DashBoard" element={<DashBoard />} />
            <Route path="/HomePage" element={<HomePage />} />
            <Route path="/AddNewDemands" element={<AddDemands />}/>
            <Route path="/AddDemands2" element={<AddDemands2 />}/>
            <Route path="/EditDemand" element={<EditDemand />}/>
            {/* <Route path="/DemandSheet" element={<DemandSheet userRole={userRole}/>}/> */}
            <Route path="/OnBoardingTracker" element={<OnBoardingTracker />} />
            <Route path="/ProfileTracker" element={<ProfileTracker />} />
            <Route path="/RDGTeam" element={<RDGTeam />} />
            <Route path="/Report" element={<Report />} />
            <Route path="/TATeam" element={<TATeam />} />
            <Route path="/demands/:demandId" element={<DemandDetails />} />
            <Route path="/register" element={<Register/>} />    
            <Route path="/change" element={<ChangePassword />} />   
            <Route path="/setnewpassword" element={<SetNewPassword />} />   
            <Route path="/login1" element={<Login1/>} />  
            {/* <Route path="/DemandSheet1" element={<DemandSheet1/>}/>
            <Route path="/DemandSheet2" element={<DemandSheet2/>}/>  */}
            <Route path="/adddemands7" element={<AddDemands7/>}/>   
            <Route path="/adddemands8" element={<AddDemands8/>}/>   
            <Route path="/demandsheet3" element={<DemandSheet3/>}/>    
            {/* <Route path="/demandsheet4" element={<DemandSheet4/>}/>     */}
            {/* <Route path="/demandsheet5" element={<DemandSheet5/>}/> 
            <Route path="/demandsheet6" element={<DemandSheet6/>}/>  */}
            <Route path="/demandsheet7" element={<DemandSheet7/>}/> 
             {/* <Route path="/demand" element={<DemandTable1/>}/>  */}
            <Route path="*" element={<h2>Page Not Found</h2>} />
          </Routes>
        </Router>
      <div>
{/*               {user =="admin" ? <DashBoard />: <Login handleLogin={handleLogin}/>} */}
            </div>
    </>
  )
}

export default App
