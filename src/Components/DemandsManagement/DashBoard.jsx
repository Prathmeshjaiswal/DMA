
import React, { useEffect, useState } from 'react';
import NavBar from '../NavBar';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;
import dayjs from 'dayjs';
import { DashBoardData } from "../api/DashBoardData.js";


export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(
    [
      dayjs().subtract(30, 'day'),
      dayjs()
    ]
  ); // default to today



  const CARD_COLOR = 'text-blue-400';

  //changed by simran 
  const ALLOWED_KEYS = ["totalDemands", "openPositions", "closedPositions", "rejected"];

  
  const displayFormat = (value) =>
    value ? value.format('DD-MMM-YYYY').toLowerCase() : '';

  //   const selectedCard = cards.find((c) => c.key === selectedChart);

  const [data, setData] = useState(null);      // response payload
  const [loading, setLoading] = useState(true); // loading flag
  const [error, setError] = useState(null);     // error object or message

  // const [limit, setLimit] = useState(4);

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
                Dashboard
              </h1>
              <div className="absolute right-0">

                <RangePicker
                  value={selectedDate}
                  onChange={(range) => setSelectedDate(range)}
                  placeholder={["Start date", "End date"]}
                  className="w-[320px]"      // wider for two inputs
                  size="middle"
                  allowClear={false}
                  format={displayFormat}

                  // Prevent selecting future dates
                  disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}

                />
              </div>
            </header>



            {/* Card grid */}
            <section className="grid grid-cols-12 gap-4">
              {Object.entries(data).filter(([key]) => ALLOWED_KEYS.includes(key)).map(([key, value]) => (
                <div
                  key={key}
                  // onClick={() => setSelectedChart(card.key)}
                  className="col-span-12 md:col-span-3 rounded-xl border border-slate-800 bg-gray-800 p-4 cursor-pointer hover:bg-gray-700 transition-all"
                >
                  <div className="text-sm text-white">{key}</div>
                  <div className={`mt-1 text-3xl font-bold ${CARD_COLOR}`}>{value}</div>
                </div>
              ))}
              <div>{console.log(Object.entries(data))}</div>



              {/* Chart placeholder  */}
              <div className="col-span-12 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur p-4">
                <div className="text-sm text-gray-200">
                  Charts/graphs will render here based on selected date.
                </div>
              </div>

            </section>
          </div>
        </div>
      </div>

      <footer className=" text-center text-sm text-black">
        © Coforge, 2026 | Confidential
      </footer>
    </>
  );
}
