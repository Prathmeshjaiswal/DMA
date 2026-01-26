//
// import React, { useEffect, useState } from 'react';
// import NavBar from '../NavBar';
// import { DatePicker } from 'antd';
// import dayjs from 'dayjs';
// import { DashBoardData } from "../api/DashBoardData.js";
// import Layout from '../Layout.jsx';
//
// //by simran for chart
// import ChartContainer from "../Charts/ChartContainer.jsx";
// import BarStatusChart from '../Charts/BarStatusChart.jsx';
// import LineStatusChart from '../Charts/LineStatusChart.jsx';
// import PieStatusChart from '../Charts/PieStatusChart.jsx';
//
//
//
// const { RangePicker } = DatePicker;
//
//
//
//
//
// export default function Dashboard() {
//
//   // states
//
//   const [selectedDate, setSelectedDate] = useState(
//     [
//       dayjs().subtract(30, 'day'),//update by simran
//       dayjs()
//     ]
//   ); // default to today
//
//   //by simran
//   const [cards, setCards] = useState([]);
//
//   const [selectedStatus, setSelectedStatus] = useState([
//     "openPosition",
//     "closedPosition",
//     "rejected",
//   ]);
//
//   const [timeline, setTimeline] = useState("monthly");
//
//   const [data, setData] = useState(null);      // response payload
//   const [loading, setLoading] = useState(true); // loading flag
//   const [error, setError] = useState(null);     // error object or message
//
//
//   const mockChartData = [
//     { month: "Dec", openPosition: 20, closedPosition: 10, rejected: 5 },
//     { month: "Jan", openPosition: 24, closedPosition: 20, rejected: 6 },
//     { month: "Feb", openPosition: 25, closedPosition: 30, rejected: 7 },
//   ];
//
//
//   const CARD_COLOR = 'text-blue-400';
//
//   //changed by simran
//   const ALLOWED_KEYS = ["totalDemands", "openPositions", "closedPositions", "rejected"];
//
//
//   const displayFormat = (value) =>
//     value ? value.format('DD-MMM-YYYY').toLowerCase() : '';
//
//   //   const selectedCard = cards.find((c) => c.key === selectedChart);
//
//
//   //by simran
//   const CARD_CONFIG = {
//     totalDemands: {
//       label: "Total Demands",
//       labelClass: "text-sm  text-orange-400",
//     },
//     openPositions: {
//       label: "Open Positions",
//       labelClass: "text-sm  text-gray-300",
//     },
//     closedPositions: {
//       label: "Closed Positions",
//       labelClass: "text-sm  text-gray-300",
//     },
//     rejected: {
//       label: "Rejected",
//       labelClass: "text-sm  text-gray-300",
//     },
//   };
//
//   //by simran
//   useEffect(() => {
//     let isMounted = true;
//
//     const fetchDashboard = async () => {
//       setLoading(true);
//       setError(null);
//
//       try {
//         const res = await DashBoardData();
//         if (!isMounted) return;
//
//         const apiData = res?.data;
//
//         const formattedCards = Object.keys(CARD_CONFIG).map((key) => ({
//           key,
//           label: CARD_CONFIG[key].label,
//           labelClass: CARD_CONFIG[key].labelClass,
//           value: apiData?.[key] ?? 0,
//         }));
//
//         setData(apiData);
//         setCards(formattedCards);
//
//       } catch (err) {
//         if (!isMounted) return;
//         setError(err?.response?.data?.message || err.message || 'Unknown error');
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };
//
//     fetchDashboard();
//     return () => { isMounted = false; };
//   }, []);
//
//
//
//   if (loading) {
//     return <div className="skeleton">Loading dashboard…</div>;
//   }
//
//   if (error) {
//     return (
//       <div className="error">
//         <p>Failed to load dashboard: {error}</p>
//         <button onClick={() => window.location.reload()} className="bg-blue-600 px-2 py-1">Retry</button>
//       </div>
//     );
//   }
//
//   if (!data) {
//     return <div className="empty-state">No data available yet.</div>;
//
//   }
//
//
//   return (
//
//     <>
//       <Layout>
//       {/* change by simran */}
//       <div className=" bg-white">
//         {/* main added by simran */}
//           <div className="max-w-7xl mx-auto px-4 py-4">
//
//
//
//             {/* Header */}
//             <header className="flex  items-center justify-between mb-6">
//               <h1 className="text-2xl font-bold  ">
//                 Dashboard
//               </h1>
//
//               <RangePicker
//                 value={selectedDate}
//                 onChange={(range) => setSelectedDate(range)}
//                 placeholder={["Start date", "End date"]}
//                 className="w-[320px]"      // wider for two inputs
//                 size="middle"
//                 allowClear={false}
//                 format={displayFormat}
//
//                 // Prevent selecting future dates
//                 disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
//
//               />
//
//             </header>
//
//
//
//             {/* by simran */}
//             <section className="grid grid-cols-12 gap-4 mb-6">
//               {cards.map((card) => (
//                 <div
//                   key={card.key}
//                   className="col-span-12 md:col-span-3 rounded-lg border border-slate-700 bg-gray-800 px-4 py-1.5 cursor-pointer hover:bg-gray-700 transition-all "
//                 >
//                   <div className={card.labelClass}>
//                     {card.label}
//                   </div>
//
//                   {/* <div className={card.labelClass}>
//                     {card.value}
//                   </div> */}
//
//                   <div className="text-sm text-white mt-1">
//                     {card.value}
//                   </div>
//                 </div>
//               ))}
//             </section>
//
//
//             <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
//
//               <ChartContainer
//                 title="Bar Chart"
//                 selectedStatus={selectedStatus}
//                 onStatusChange={setSelectedStatus}
//                 selectedTimeline={timeline}
//                 onTimelineChange={setTimeline}
//               >
//                 <BarStatusChart
//                   data={mockChartData}
//                   selectedStatus={selectedStatus}
//                 />
//               </ChartContainer>
//
//               <ChartContainer
//                 title="Line Chart"
//                 selectedStatus={selectedStatus}
//                 onStatusChange={setSelectedStatus}
//                 selectedTimeline={timeline}
//                 onTimelineChange={setTimeline}
//               >
//                 <LineStatusChart
//                   data={mockChartData}
//                   selectedStatus={selectedStatus}
//                 />
//               </ChartContainer>
//
//               <ChartContainer
//                 title="Pie Chart"
//                 selectedStatus={selectedStatus}
//                 onStatusChange={setSelectedStatus}
//                 selectedTimeline={timeline}
//                 onTimelineChange={setTimeline}
//               >
//                 <PieStatusChart
//                   data={mockChartData}
//                   selectedStatus={selectedStatus}
//                 />
//               </ChartContainer>
//
//             </section>
//
//           </div>
//
//
//
//
//
//       </div>
// </Layout>
//     </>
//   );
// }


import React, { useEffect, useMemo, useState } from 'react';
import { DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import Layout from '../Layout.jsx';
import NavBar from '../NavBar'; // if your Layout already includes it, you can remove this import
import { DashBoardData } from "../api/DashBoardData.js";

// Charts
import ChartContainer from "../Charts/ChartContainer.jsx";
import BarStatusChart from '../Charts/BarStatusChart.jsx';
import LineStatusChart from '../Charts/LineStatusChart.jsx';
import PieStatusChart from '../Charts/PieStatusChart.jsx';

const { RangePicker } = DatePicker;

/** ------- Helpers (cache + timeago) ------- */
const DASHBOARD_CACHE_KEY = 'dashboardCache';

const readCache = () => {
  try {
    const raw = localStorage.getItem(DASHBOARD_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    localStorage.setItem(
      DASHBOARD_CACHE_KEY,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {
    // ignore quota errors
  }
};

const timeAgo = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min <= 0) return 'just now';
  if (min < 60) return `${min} min${min > 1 ? 's' : ''} ago`;
  const hr = Math.floor(min / 60);
  return `${hr} hr${hr > 1 ? 's' : ''} ago`;
};

/** ------- Safe defaults so UI is instant ------- */
const DEFAULT_API_DATA = {
  totalDemands: 0,
  openPositions: 0,
  closedPositions: 0,
  rejected: 0,
};

/** Mock for charts until real arrives */
const MOCK_CHART_DATA = [
  { month: "Dec", openPosition: 20, closedPosition: 10, rejected: 5 },
  { month: "Jan", openPosition: 24, closedPosition: 20, rejected: 6 },
  { month: "Feb", openPosition: 25, closedPosition: 30, rejected: 7 },
];

const CARD_CONFIG = {
  totalDemands: {
    label: "Total Demands",
    labelClass: "text-sm text-orange-400",
  },
  openPositions: {
    label: "Open Positions",
    labelClass: "text-sm text-gray-300",
  },
  closedPositions: {
    label: "Closed Positions",
    labelClass: "text-sm text-gray-300",
  },
  rejected: {
    label: "Rejected",
    labelClass: "text-sm text-gray-300",
  },
};

export default function Dashboard() {
  /** State */
  const [selectedDate, setSelectedDate] = useState([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  const [selectedStatus, setSelectedStatus] = useState([
    "openPosition",
    "closedPosition",
    "rejected",
  ]);

  const [timeline, setTimeline] = useState("monthly");

  // Core data + metadata
  const cached = readCache();
  const [data, setData] = useState(cached?.data || DEFAULT_API_DATA);
  const [lastUpdated, setLastUpdated] = useState(cached?.ts || null);
  const [chartData, setChartData] = useState(MOCK_CHART_DATA); // replace with real when you have it

  /** Build cards from current data (instant) */
  const cards = useMemo(() => {
    return Object.keys(CARD_CONFIG).map((key) => ({
      key,
      label: CARD_CONFIG[key].label,
      labelClass: CARD_CONFIG[key].labelClass,
      value: data?.[key] ?? 0,
    }));
  }, [data]);

  /** Background fetch: SWR style (stale-while-revalidate) */
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await DashBoardData();
        if (!isMounted) return;

        const apiData = res?.data || DEFAULT_API_DATA;

        // Update UI
        setData(apiData);
        setLastUpdated(Date.now());

        // If your API someday returns series for charts, set it here.
        // setChartData(res?.data?.series || MOCK_CHART_DATA);

        // Cache for next visit
        writeCache(apiData);
      } catch (err) {
        // No blocking error UI; keep current view. Optionally toast once.
        // message.error(err?.response?.data?.message || err.message || 'Failed to refresh dashboard');
        // You can keep it silent to avoid any flicker/annoyance.
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []); // run once on mount

  const displayFormat = (value) =>
    value ? value.format('DD-MMM-YYYY').toLowerCase() : '';

  /** Render — no loading gates; UI is instant */
  return (
    <>
      <Layout>
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Header (tight, no delays) */}
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                {lastUpdated && (
                  <span className="text-xs text-slate-500">
                    Updated {timeAgo(lastUpdated)}
                  </span>
                )}
              </div>

              <RangePicker
                value={selectedDate}
                onChange={(range) => setSelectedDate(range)}
                placeholder={["Start date", "End date"]}
                className="w-[320px]"
                size="middle"
                allowClear={false}
                format={displayFormat}
                disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
              />
            </header>

            {/* KPI Cards — render immediately from cache/defaults */}
            <section className="grid grid-cols-12 gap-4 mb-5">
              {cards.map((card) => (
                <div
                  key={card.key}
                  className="
                    col-span-12 md:col-span-3 rounded-lg
                    border border-slate-700 bg-gray-800
                    px-4 py-2 cursor-pointer hover:bg-gray-700 transition-all
                  "
                >
                  <div className={card.labelClass}>{card.label}</div>
                  <div className="text-sm text-white mt-1">{card.value}</div>
                </div>
              ))}
            </section>

            {/* Charts (show mock until real series available) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ChartContainer
                title="Bar Chart"
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedTimeline={timeline}
                onTimelineChange={setTimeline}
              >
                <BarStatusChart
                  data={chartData}
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
                  data={chartData}
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
                  data={chartData}
                  selectedStatus={selectedStatus}
                />
              </ChartContainer>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
}
