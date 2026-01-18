
import React, { useEffect, useState } from 'react';
import NavBar from '../NavBar';
import { DatePicker} from 'antd';
import dayjs from 'dayjs';
import { DashBoardData } from "../api/DashBoardData.js";


//by simran for chart
import ChartContainer from "../Charts/ChartContainer.jsx";
import BarStatusChart from '../Charts/BarStatusChart.jsx';
import LineStatusChart from '../Charts/LineStatusChart.jsx';
import PieStatusChart from '../Charts/PieStatusChart.jsx';








const { RangePicker } = DatePicker;
export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(
    [
      dayjs().subtract(30, 'day'),//update by simran
      dayjs()
    ]
  ); // default to today

  //by simran
  const [cards, setCards] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState([
    "openPosition",
    "closedPosition",
    "rejected",
  ]);
  const [timeline, setTimeline] = useState("monthly");

  const mockChartData = [
    { month: "Dec", openPosition: 20, closedPosition: 10, rejected: 5 },
    { month: "Jan", openPosition: 24, closedPosition: 20, rejected: 6 },
    { month: "Feb", openPosition: 25, closedPosition: 30, rejected: 7 },
  ];


  const CARD_COLOR = 'text-blue-400';

  //changed by simran 
  const ALLOWED_KEYS = ["totalDemands", "openPositions", "closedPositions", "rejected"];


  const displayFormat = (value) =>
    value ? value.format('DD-MMM-YYYY').toLowerCase() : '';

  //   const selectedCard = cards.find((c) => c.key === selectedChart);

  const [data, setData] = useState(null);      // response payload
  const [loading, setLoading] = useState(true); // loading flag
  const [error, setError] = useState(null);     // error object or message

  //by simran
  const CARD_CONFIG = {
    totalDemands: {
      label: "Total Demands",
      labelClass: "text-sm  text-orange-400",
    },
    openPositions: {
      label: "Open Positions",
      labelClass: "text-sm  text-gray-300",
    },
    closedPositions: {
      label: "Closed Positions",
      labelClass: "text-sm  text-gray-300",
    },
    rejected: {
      label: "Rejected",
      labelClass: "text-sm  text-gray-300",
    },
  };

  //by simran
  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await DashBoardData();
        if (!isMounted) return;

        const apiData = res?.data;

        const formattedCards = Object.keys(CARD_CONFIG).map((key) => ({
          key,
          label: CARD_CONFIG[key].label,
          labelClass: CARD_CONFIG[key].labelClass,
          value: apiData?.[key] ?? 0,
        }));

        setData(apiData);
        setCards(formattedCards);

      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || err.message || 'Unknown error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => { isMounted = false; };
  }, []);



  // useEffect(() => {
  //   let isMounted = true; // guard against state updates after unmount
  //   const fetchDashboard = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const res = await DashBoardData(); //
  //       if (!isMounted) return;
  //       console.log(res?.data?.data);
  //       setData(res?.data);
  //     } catch (err) {
  //       if (!isMounted) return;
  //       const msg = err?.response?.data?.message || err.message || 'Unknown error';
  //       setError(msg);
  //     } finally {
  //       if (isMounted) setLoading(false);
  //     }
  //   };

  //   fetchDashboard();
  //   return () => { isMounted = false; }; // cleanup
  // }, []);

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
      {/* change by simran */}
      <div className="min-h-screen flex flex-col bg-white">
        {/* main added by simran */}
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 py-4">



            {/* Header */}
            <header className="flex  items-center justify-between mb-6">
              <h1 className="text-2xl font-bold  ">
                Dashboard
              </h1>

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

            </header>



            {/* Card grid */}
            {/* <section className="grid grid-cols-12 gap-4">
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
              
              <div>{console.log(Object.entries(data))}</div> */}


            {/* by simran */}
            <section className="grid grid-cols-12 gap-4 mb-6">
              {cards.map((card) => (
                <div
                  key={card.key}
                  className="col-span-12 md:col-span-3 rounded-lg border border-slate-700 bg-gray-800 px-4 py-1.5 cursor-pointer hover:bg-gray-700 transition-all "
                >
                  <div className={card.labelClass}>
                    {card.label}
                  </div>

                  {/* <div className={card.labelClass}>
                    {card.value}
                  </div> */}

                  <div className="text-sm text-white mt-1">
                    {card.value}
                  </div>
                </div>
              ))}
            </section>

            {/* Chart Placeholder */}
            {/* <section className="col-span-12 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur p-4">
                <div className="text-sm text-gray-200">
                  Charts / graphs will render here based on selected date.
                </div>
              </section> */}


            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
 
  <ChartContainer
    title="Bar Chart"
    selectedStatus={selectedStatus}
    onStatusChange={setSelectedStatus}
    selectedTimeline={timeline}
    onTimelineChange={setTimeline}
  >
    <BarStatusChart
      data={mockChartData}
      selectedStatus={selectedStatus}
    />
  </ChartContainer>
 
  <ChartContainer
    title="Line Chart"
    selectedStatus={selectedStatus}
    onStatusChange={setSelectedStatus}
    selectedTimeline={timeline}
    onTimelineChange={setTimeline}
  >
    <LineStatusChart
      data={mockChartData}
      selectedStatus={selectedStatus}
    />
  </ChartContainer>
 
  <ChartContainer
    title="Pie Chart"
    selectedStatus={selectedStatus}
    onStatusChange={setSelectedStatus}
    selectedTimeline={timeline}
    onTimelineChange={setTimeline}
  >
    <PieStatusChart
      data={mockChartData}
      selectedStatus={selectedStatus}
    />
  </ChartContainer>
 
</section>


            {/* Chart placeholder  */}
            {/* <div className="col-span-12 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur p-4">
                <div className="text-sm text-gray-200">
                  Charts/graphs will render here based on selected date.
                </div>
              </div> */}


          </div>

        </main>

        {/* update by simran */}
        <footer className=" text-center text-sm text-black py-4">
          © Coforge, 2026 | Confidential
        </footer>
      </div>

    </>
  );
}
