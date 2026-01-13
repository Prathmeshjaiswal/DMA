
import React, { useEffect, useState } from 'react';
import NavBar from '../NavBar';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;
import dayjs from 'dayjs';
import { DashBoardData } from "../api/DashBoardData.js";


export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(); // default to today
  //   const [selectedChart, setSelectedChart] = useState(null);

  const CARD_COLOR = 'text-blue-400';

  //   const cards = [
  //     { key: 'total', title: 'Total Demands', value: 121, description: 'Overall demand count captured.' },
  //     { key: 'open', title: 'Open Positions', value: 53, description: 'Active positions currently open.' },
  //     { key: 'closed', title: 'Closed Positions', value: 89, description: 'Positions successfully closed.' },
  //     { key: 'on-hold', title: 'On Hold', value: 12, description: 'Demands temporarily on hold.' },
  //     { key: 'abandoned', title: 'Abandoned', value: 37, description: 'Demands abandoned' },
  //     { key: 'fulfilled', title: 'Fulfilled', value: 24, description: 'Demand fulfilled' },
  //     { key: 'onboarding', title: 'On Boarding Inprogress', value: 15, description: 'On Boarding inprogress' },
  //     { key: 'profile shared', title: 'Profile Shared', value: 9, description: 'profile shared' },
  //     { key: 'selected', title: 'Rejected', value: 31, description: 'Profiles rejected in the process.' },
  //     { key: 'soft select', title: 'Soft Select', value: 64, description: 'soft select' },
  //     { key: 'candidate resigned', title: 'Candidate Resigned', value: 22, description: 'Candidate Resigned' },
  //     { key: 'duplicate demand', title: 'Duplicate Demand', value: 18, description: 'Duplicate Demand' },
  //   ];

  const displayFormat = (value) =>
    value ? value.format('DD-MMM-YYYY').toLowerCase() : '';

  //   const selectedCard = cards.find((c) => c.key === selectedChart);

  const [data, setData] = useState(null);      // response payload
  const [loading, setLoading] = useState(true); // loading flag
  const [error, setError] = useState(null);     // error object or message

  useEffect(() => {
    let isMounted = true; // guard against state updates after unmount
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await DashBoardData(); //
        if (!isMounted) return;
        console.log(res?.data?.data);
        setData(res?.data);
      } catch (err) {
        if (!isMounted) return;
        const msg = err?.response?.data?.message || err.message || 'Unknown error';
        setError(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => { isMounted = false; }; // cleanup
  }, []);

  if (loading) {
    return <div className="skeleton">Loading dashboard…</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Failed to load dashboard: {error}</p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 px-2 py-1">Retry</button>
      </div>
    );
  }

  if (!data) {
    return <div className="empty-state">No data available yet.</div>;

  }


  return (

    <>
      <NavBar />
      <div className="flex flex-col bg-white">
        <div className="bg-white mt-1">
          <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <header className="relative mb-5 flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-wide text-center">
                Talent Overview Dashboard
              </h1>
              <div className="absolute right-0">
                {/* <DatePicker
                  value={selectedDate}            
                  onChange={setSelectedDate}
                  placeholder="Pick a date"
                  className="w-[200px]"
                  size="middle"
                  allowClear={false}              
                  format={displayFormat}
                /> */}
                <RangePicker
                  value={selectedDate}
                  onChange={(range) => setSelectedDate(range)}
                  placeholder={["Start date", "End date"]}
                  className="w-[320px]"      // wider for two inputs
                  size="middle"
                  allowClear={false}
                  format={displayFormat}
                />

              </div>
            </header>

            {/* Card grid*/}
            <section className="grid grid-cols-12 gap-4">
              {/* {Object.entries(data).map(([key,value]) => (
                <div
                  key={key} */}
              {/* //                   onClick={() => setSelectedChart(card.key)}
              //     className="col-span-12 md:col-span-3 rounded-xl border border-slate-800 bg-gray-800 p-4 cursor-pointer hover:bg-gray-700 transition-all"
              //   >
              //     <div className="text-sm text-white">{key}</div>
              //    <div className={`mt-1 text-3xl font-bold ${CARD_COLOR}`}>{value}</div>
              //   </div>
              // ))} */}
              {/* <div>{console.log(Object.entries(data))}</div> */}


              <aside className="col-span-12 md:col-span-5 lg:col-span-4">
                {/* Optional sticky for better UX */}
                <div className="md:sticky md:top-4">
                  {/*Force two columns for the cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(data).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl border border-slate-800 bg-gray-800 p-4 cursor-pointer hover:bg-gray-700 transition-all"
                        title={key}
                      >
                        <div className="text-sm text-white break-words">{key}</div>
                        <div className={`mt-1 text-3xl font-bold ${CARD_COLOR}`}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>






              {/* Chart placeholder */}
              {/* <div className="col-span-12 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur p-4">
                <div className="text-sm text-gray-200">
                  Charts/graphs will render here based on selected date.
                </div>
              </div> */}




              <main className="col-span-12 md:col-span-7 lg:col-span-8">
                {/* Three smaller chart placeholders stacked vertically */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-800/50 border border-slate-700 rounded-lg h-[180px] flex items-center justify-center text-gray-300">
                    Chart 1
                  </div>
                  <div className="bg-gray-800/50 border border-slate-700 rounded-lg h-[180px] flex items-center justify-center text-gray-300">
                    Chart 2
                  </div>
                  <div className="bg-gray-800/50 border border-slate-700 rounded-lg h-[180px] flex items-center justify-center text-gray-300">
                    Chart 3
                  </div>
                </div>

              </main>



            </section>
          </div>
        </div>
      </div>

      {/* SINGLE REUSABLE MODAL FOR ALL CARDS */}
      {/*       {selectedChart && ( */}
      {/*         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"> */}
      {/*           <div className="bg-white rounded-lg shadow-2xl w-full max-w-md"> */}
      {/*             <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50"> */}
      {/*               <h2 className="text-lg font-bold text-gray-800">{selectedCard?.title}</h2> */}
      {/*               <button */}
      {/*                 onClick={() => setSelectedChart(null)} */}
      {/*                 className="text-gray-500 hover:text-gray-700 text-2xl" */}
      {/*                 aria-label="Close modal" */}
      {/*               > */}
      {/*                 × */}
      {/*               </button> */}
      {/*             </div> */}

      {/*              */}{/* Body */}
      {/*             <div className="p-6 text-center"> */}
      {/*               <div className={`text-5xl font-bold ${CARD_COLOR} mb-2`}>{selectedCard?.value}</div> */}
      {/*               <p className="text-gray-600 mb-6">{selectedCard?.description}</p> */}
      {/*             </div> */}

      {/*              */}{/* Footer */}
      {/*             <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end"> */}
      {/*               <button */}
      {/*                 onClick={() => setSelectedChart(null)} */}
      {/*                 className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" */}
      {/*               > */}
      {/*                 Close */}
      {/*               </button> */}
      {/*             </div> */}
      {/*           </div> */}
      {/*         </div> */}
      {/*       )} */}

      <footer className=" text-center text-sm text-black">
        © Coforge, 2026 | Confidential
      </footer>
    </>
  );
}
