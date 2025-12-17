
// src/App.jsx
import React,{useMemo} from 'react';
import HomePage from "../HomePage.jsx"
import NavBar from "../NavBar.jsx"
import {useNavigate} from 'react-router-dom';

export default function DashBoard() {



const navigate = useNavigate();
  return (
<><NavBar />
        <div className="flex flex-col px-8 pt-6 bg-white">

        <div className="bg-white mt-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-semibold tracking-wide">Talent Overview Dashboard</h1>
          <div className="text-black text-sm">
            {new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
          </div>
        </header>

        <section className="grid grid-cols-12 gap-4">
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
          </div>

          {/* Chart Card */}
          <div className="col-span-12 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur p-4">
            <div className="flex items-center justify-between mb-3">
          <select className="text-black">
            <option value="">Select Charts</option>
            <option>Pie chart</option>
            <option>Bar Graph</option>
            <option>Line Graph</option>
            </select>
          <select className="text-black">
            <option value="">Select Time Period</option>
            <option>6 Months</option>
            <option>12 Months</option>
            <option>18 Months</option>
            <option>24 Months</option>
          </select>
              </div>
            </div>
        </section>

        <div className="mt-6 text-center text-sm text-gray-800">
          Sample data for demo.WIll Replace datasets in the form of graphs/charts (Visual Representation) as needed.
        </div>
      </div>
    </div>
                    <footer className=" mt-15 text-center text-sm text-black">
                      © Coforge, 2026 | Confidential
                    </footer>
    </div>
   </>
     );
   }
   ``
