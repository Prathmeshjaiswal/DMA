
// src/App.jsx
import React, { useMemo, useState } from 'react';
import HomePage from "../HomePage.jsx"
import NavBar from "../NavBar.jsx"
import { useNavigate } from 'react-router-dom';
import Select, { components } from "react-select";

        

export default function DashBoard() {

  const navigate = useNavigate();

  //
  const [selectedChart, setSelectedChart] = useState(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('');




  // Data for all cards
  const cardData = {
    total: {
      title: 'Total Demands',
      value: '121',
      description: 'Total demands across all quarters',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400'
    },
    open: {
      title: 'Open Positions',
      value: '53',
      description: 'Open positions available',
      color: 'text-amber-400',
      bgColor: 'bg-amber-400'
    },
    closed: {
      title: 'Closed Positions',
      value: '89',
      description: 'Positions closed this year',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400'
    }
  };


   //checkbox
    const CheckboxOption = (props) => {
      return (
        <components.Option {...props}>
          <div className="flex items-center justify-between w-fu">
            <span>{props.label}</span>
            <input
              type="checkbox"
              checked={props.isSelected}
              readOnly
            />
  
          </div>
  
        </components.Option>
  
      )
    }


    


  return (
    <>
      <NavBar />
      <div className="flex flex-col px-8 pt-6 bg-white">

        <div className="bg-white mt-5">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Header */}
            <header className="flex items-center justify-between mb-5">
              <h1 className="text-lg font-semibold tracking-wide">Talent Overview Dashboard</h1>
              <div className="text-black text-sm">
                {new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </div>
            </header>

            <section className="grid grid-cols-12 gap-4">

              {/* Total Demands Card */}
              <div
                onClick={() => setSelectedChart('total')}
                className="col-span-12 md:col-span-4 rounded-xl border border-slate-800 bg-gray-800 p-4 cursor-pointer hover:bg-gray-700 transition-all"
              >
                <div className="text-sm text-white">{cardData.total.title}</div>
                <div className="mt-1 text-3xl font-bold text-blue-400">{cardData.total.value}</div>
              </div>

              {/* Open Positions Card */}
              <div
                onClick={() => setSelectedChart('open')}
                className="col-span-12 md:col-span-4 rounded-xl border border-slate-800 bg-gray-800 p-4 cursor-pointer hover:bg-gray-700 transition-all"
              >
                <div className="text-sm text-white">{cardData.open.title}</div>
                <div className="mt-1 text-3xl font-bold text-amber-400">{cardData.open.value}</div>
              </div>

              {/* Closed Positions Card */}
              <div
                onClick={() => setSelectedChart('closed')}
                className="col-span-12 md:col-span-4 rounded-xl border border-slate-800 bg-gray-800 p-4 cursor-pointer hover:bg-gray-700 transition-all"
              >
                <div className="text-sm text-white">{cardData.closed.title}</div>
                <div className="mt-1 text-3xl font-bold text-emerald-400">{cardData.closed.value}</div>
              </div>



              {/* 
          <div className="col-span-12 md:col-span-4 rounded-xl border border-slate-800 bg-gray-800  p-4">
            <div className="text-sm text-white">Total Demands</div>
            <div className="mt-1 text-3xl font-bold text-blue-400">121</div>
          </div>

          <div className="col-span-12 md:col-span-4 rounded-xl border border-slate-800 bg-gray-800  p-4">
            <div className="text-sm text-white">Open Positions</div>
            <div className="mt-1 text-3xl font-bold text-amber-400">53</div>
          </div>

          <div className="col-span-12 md:col-span-4 rounded-xl border border-slate-800 bg-gray-800 p-4">
            <div className="text-sm text-white">Closed Positions</div>
            <div className="mt-1 text-3xl font-bold text-emerald-400">89</div>
          </div> */}


              {/* Chart Card */}
              <div className="col-span-12 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur p-4">
                <div className="flex items-center gap-4 mb-3">
                  {/*           <select className="text-black"> */}
                  {/*             <option value="">Select Charts</option> */}
                  {/*             <option>Pie chart</option> */}
                  {/*             <option>Bar Graph</option> */}
                  {/*             <option>Line Graph</option> */}
                  {/*             </select> */}
                  {/* <select className="text-black">
                    <option value="">Select Time Period</option>
                    <option>6 Months</option>
                    <option>12 Months</option>
                    <option>18 Months</option>
                    <option>24 Months</option>
                  </select> */}


                  {/* Time Period Dropdown */}
                  <select
                    className="text-black px-3 py-2 rounded border border-gray-300 flex-1"
                    value={selectedTimePeriod}
                    onChange={(e) => setSelectedTimePeriod(e.target.value)}
                  >
                    <option value="">Select Time Period</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="18">18 Months</option>
                    <option value="24">24 Months</option>
                  </select>

                  <select
                    className="text-black px-3 py-2 rounded border border-gray-300 flex-1"
                    value={selectedTimePeriod}
                    onChange={(e) => setSelectedTimePeriod(e.target.value)}
              
                  >
                    <option value="">Select Time Period2</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="18">18 Months</option>
                    <option value="24">24 Months</option>
                  </select>

                  
                  
                 
                </div>
              </div>

            </section>

            <div className="mt-6 text-center text-sm text-gray-800">
              Sample data for demo.WIll Replace datasets in the form of graphs/charts (Visual Representation) as needed.
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE REUSABLE MODAL FOR ALL THREE CARDS */}
      {selectedChart && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {cardData[selectedChart]?.title}
              </h2>
              <button
                onClick={() => setSelectedChart(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>


            {/* Body */}
            <div className="p-6">
              <div className="text-center">
                <div className={`text-5xl font-bold ${cardData[selectedChart]?.color} mb-2`}>
                  {cardData[selectedChart]?.value}
                </div>
                <p className="text-gray-600 mb-6">
                  {cardData[selectedChart]?.description}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2 justify-end">
              <button
                onClick={() => setSelectedChart(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='footer'>
        <footer className=" mt-15 text-center text-sm text-black">
          © Coforge, 2026 | Confidential
        </footer>
      </div>
    </>
  );
}
