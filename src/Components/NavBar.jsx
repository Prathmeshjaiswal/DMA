
import React, { useState } from "react";
import {useNavigate} from 'react-router-dom'
import Login from "./Auth/Login.jsx"
  import {
    CButton,
  } from '@coreui/react'
export default function NavBar() {
  const navigate = useNavigate();

  return (

      <div className="absolute inset-x-0 top-5 z-50 bg-gray-900 text-white">
    <div className="flex gap-4 bg-gray-800 w-300 pl-1 text-white py-5">
              <img src="HSBC_DMA_Frontend/src/assets/Progress.png" alt="LOGO" />
      <button onClick={() => navigate("/DashBoard")} className="">
        Dashboard
      </button>

      <button onClick={() => navigate("/HomePage")} className="">
        HomePage
      </button>

      <button onClick={() => navigate("/AddNewDemands")} className="">Add New Demands</button>
      <button onClick={() => navigate("/DemandSheet")} className="">
        View Demand Sheet
      </button>

      <button onClick={() => navigate("/ProfileTracker")} className="">
        Track Profile
      </button>

      <button onClick={() => navigate("/ProfileTracker")} className="">
        Track OnBoarding
      </button>

      <button onClick={() => navigate("/Report")} className="">
        Reports
      </button>

      <button onClick={() => navigate("/Report")} className="">
        RDG
      </button>

            <button onClick={() => navigate("/Report")} className="">
              TA
            </button>

<div className="grid grid-flow-col justify-items-end ">
      <button onClick={() => navigate("/contact")} className="pl-30">
        Contact Admin
      </button>
    </div>
    </div>
    </div>
  );
}

