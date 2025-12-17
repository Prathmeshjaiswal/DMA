import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import AddDemands from "./DemandsManagement/AddDemands.jsx"
import DemandSheet from "./DemandsManagement/DemandSheet.jsx"
import OnBoardingTracker from "./DemandsManagement/OnBoardingTracker.jsx"
import ProfileTracker from "./DemandsManagement/ProfileTracker.jsx"
import RDGTeam from "./DemandsManagement/RDGTeam.jsx"
import Report from "./DemandsManagement/Report.jsx"
import TATeam from "./DemandsManagement/TATeam.jsx"
import {useState} from "react"


export default function HomePage(){
    const navigate = useNavigate();
    return(
        <>
        <div className=""><h1>{props.userRole}</h1></div>
        <div className="grid grid-cols-3 gap-5 mx-9 px-9">

            <div className="">
                <button onClick={() => navigate("/AddNewDemands")} className="bg-amber-400 p-5 text-grey text-sm rounded-md font-medium hover:bg-amber-500 hover:text-black focus:border-black border-2  transition mt-8">Add New Demands</button>
            </div>
            <div className="">
                <button onClick={() => navigate("/DemandSheet")} className="bg-amber-400 p-5 text-grey text-sm rounded-md font-medium hover:bg-amber-500 hover:text-black focus:border-black border-2  transition mt-8">Demand Sheet</button>
            </div>
            <div className="">
                <button onClick={() => navigate("/OnBoardingTracker")} className="bg-amber-400 p-5 text-grey text-sm rounded-md font-medium hover:bg-amber-500 hover:text-black focus:border-black border-2  transition mt-8">OnBoarding Tracker</button>
            </div>
            <div className="">
                <button onClick={() => navigate("/RDGTeam")} className="bg-amber-400 p-5 text-grey text-sm rounded-md font-medium hover:bg-amber-500 hover:text-black focus:border-black border-2  transition mt-8">RDG Team</button>
            </div>
            <div className="">
                <button onClick={() => navigate("/TATeam")} className="bg-amber-400 p-5 text-grey text-sm rounded-md font-medium hover:bg-amber-500 hover:text-black focus:border-black border-2  transition mt-8">TA Team</button>
            </div>
            <div className="">
                <button onClick={() => navigate("/ProfileTracker")} className="bg-amber-400 p-5 text-grey text-sm rounded-md font-medium hover:bg-amber-500 hover:text-black focus:border-black border-2  transition mt-8">Profile Tracker</button>
            </div>
            <div className="">
                <button onClick={() => navigate("/Report")} className="bg-amber-400 p-5 text-grey text-sm rounded-md font-medium hover:bg-amber-500 hover:text-black focus:border-black border-2  transition mt-8">Report</button>
            </div>


        </div>



        </>
        );
    }
