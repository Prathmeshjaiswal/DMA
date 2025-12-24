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



function App() {
        const [userRole,setUserRole] = useState("");
            const handleUserRole=(userid,password)=>{
              if(userid=="dev@coforge.com" && password=="1234"){
                setUserRole("dev");
              }
              else if(userid=="dm@coforge.com" && password=="1234"){
                  setUserRole("Delivery Manager");
                  navigate("/DashBoard");
                  }
              else if(userid=="pmo@coforge.com" && password=="1234"){
                  setUserRole("PMO");
                  navigate("/DashBoard");
                  }
              else{
                alert("Invalid Credentials")
              }
            }
//     const [user, setUser] = useState(null);
const[demandData,setDemandData] = useState([]);
  const [form, setForm] = useState(()=>{
    return{
    lob: "",
    buisenessFunction:"",
    podprogrammeName:"",
    experience:"",
    noOfPositions: "",
    skillCluster: "",
    primarySkills: "",
    secondarySkills: "",
    demandReceivedDate: "",
    hiringManager: "",
    salesSpoc: "",
    deliveryManager: "",
    priority:"",
    demandLocation:"",
    p1FlagData:"",
    priorityComment:"",
    pmoSpoc:"",
    pmo: "",
    hbu: "",
    band:"",
    p1Age:"",
    demandType: "",
    currentProfileShared:"",
    dateOfProfileShared:"",
    externalInternal:"",
    status:"",
    demandTimeline:"",
    remark:"",
    }
  });



  return (
    <>
    <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/Login" replace />} />
            <Route path="/Login" element={<Login userRole={handleUserRole}/>} />
            <Route path="/DashBoard" element={<DashBoard />} />
            <Route path="/HomePage" element={<HomePage />} />
            <Route path="/AddNewDemands" element={<AddDemands setForm={setForm} form={form} demandData={demandData} setDemandData={setDemandData}/>}/>
            <Route path="/AddDemands2" element={<AddDemands2 demandData={demandData} setDemandData={setDemandData}/>}/>
            <Route path="/EditDemand" element={<EditDemand />}/>
            <Route path="/DemandSheet" element={<DemandSheet userRole={userRole}/>}/>
            <Route path="/OnBoardingTracker" element={<OnBoardingTracker />} />
            <Route path="/ProfileTracker" element={<ProfileTracker />} />
            <Route path="/RDGTeam" element={<RDGTeam />} />
            <Route path="/Report" element={<Report />} />
            <Route path="/TATeam" element={<TATeam />} />
            <Route path="/demands/:demandId" element={<DemandDetails />} />

            {/* Fallback for unknown routes */}
            <Route path="*" element={<h2>Page not found</h2>} />
          </Routes>
        </Router>
      <div>
{/*               {user =="admin" ? <DashBoard />: <Login handleLogin={handleLogin}/>} */}
            </div>
    </>
  )
}

export default App
