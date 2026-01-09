import { useState,useMemo} from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import NavBar from "../NavBar.jsx";
import { PencilSquareIcon } from "@heroicons/react/24/solid";


export default function ProfileTracker() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([
    {
      demandId: "DMD-1001",
      rr: "RR-501", //fixed
      lob: "Banking",//fixed
      manager: "Alice",//fixed
      skillCluster: "Java",//fixed
      primarySkill: "Spring",//fixed
      secondarySkill: "React",//fixed
      currentProfileShared: "",
      dateOfProfileShared: "",
      externalInternal: "",
      interviewDate: "",
      status: "",
      decisionDate: "",
      age: "",
    },

  ]);


  
 // Date range state (filter inputs)
  const [fromDate, setFromDate] = useState(""); // yyyy-mm-dd
  const [toDate, setToDate] = useState("");     // yyyy-mm-dd


  // Age calculation
  const calculateAge = (profileDate, decisionDate) => {
    if (!profileDate) return "-";

    const startDate = new Date(profileDate);
    const endDate = decisionDate
      ? new Date(decisionDate)
      : new Date(); // current date

    const diffInMs = endDate - startDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays >= 0 ? diffInDays : "-";
  };


  
 // Utility: safe parse yyyy-mm-dd -> Date or null
  const parseDate = (str) => {
    if (!str) return null;
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };


  
 // Filter logic (inclusive range on dateOfProfileShared)
  const filteredRows = useMemo(() => {
    const from = parseDate(fromDate);
    const to = parseDate(toDate);

    

 // If both filters empty, return all rows
    if (!from && !to) return rows;

    return rows.filter((row) => {
      const profileDate = parseDate(row.dateOfProfileShared);
      // If the row has no date, it should not match any filter
      if (!profileDate) return false;

      
      // Inclusive comparison
      const afterFrom = from ? profileDate >= from : true;
      const beforeTo = to ? profileDate <= to : true;

      return afterFrom && beforeTo;
    });
  }, [rows, fromDate, toDate]);

  
 // Reset filters
  const resetFilters = () => {
    setFromDate("");
    setToDate("");
  };





  return (
    <>
      <NavBar />

      <div className="p-32  bg-[#082340]">
 {/* Filter bar - top left */}
        <div className="mb-4 flex items-end gap-4">
          <div className="flex flex-col">
            <label className="text-gray-200 text-sm mb-1">From date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded px-2 py-1 bg-[#0F3A66] text-gray-200 border-gray-500"
            />
          </div>


          
          <div className="flex flex-col">
            <label className="text-gray-200 text-sm mb-1">To date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded px-2 py-1 bg-[#0F3A66] text-gray-200 border-gray-500"
            />
          </div>



<button
            onClick={resetFilters}
            className="h-[36px] mt-[22px] bg-gray-600 rounded-md text-white px-4 font-medium tracking-wide hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400"
          >
            Reset
          </button>



  {/* Optional: show count */}
          <span className="text-gray-300 ml-2 mt-[22px]">
            Showing {filteredRows.length} {filteredRows.length === 1 ? "profile" : "profiles"}
          </span>
        </div>


        <div className="overflow-x-auto rounded-lg border border-gray-500 bg-[#0F3A66] shadow-sm">
          <table className="min-w-full border-collapse text-gray-400">
            <thead className="bg-[#11406F]">

              <tr >
                <th className="px-2 py-2 text-gray-200 text-sm font-semibold w-10">Edit</th>
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-24">Demand ID</th>
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-16">RR</th>
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-20">LOB</th>
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-32">HSBC Hiring Manager</th>
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-24">Skill Cluster</th>
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-24">Primary Skill</th>
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-24">Secondary Skill</th>
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-32">Current Profile Shared</th>
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-32">Date of Profile Shared</th>  
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-28">External/Internal</th>
                <th className="px-2 py-2  text-gray-200 -sm font-semibold w-28">Interview Date</th>
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-24">Status</th>
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-28">Decision Date</th>
                <th className="px-2 py-2  text-gray-200 text-sm font-semibold w-20">Age</th>
              </tr>

            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.demandId} className="hover:bg-[#0F3A66]">

                  {/* EDIT ICON */}
                  <td className="px-4 py-3">
                    <PencilSquareIcon className="h-5 w-5  cursor-pointer" />
                  </td>

                  {/* FIXED DATA (READ ONLY) */}
                  <td className="px-4 py-3  ">{row.demandId}</td>
                  <td className="px-4 py-3">{row.rr}</td>
                  <td className="px-4 py-3">{row.lob}</td>
                  <td className="px-4 py-3">{row.manager}</td>
                  <td className="px-4 py-3">{row.skillCluster}</td>
                  <td className="px-4 py-3">{row.primarySkill}</td>
                  <td className="px-4 py-3">{row.secondarySkill}</td>

                  {/* EDITABLE FIELDS */}
                  <td className="px-4 py-3">
                    <select className="border rounded px-2 py-1">
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </td>

                  <td className="px-4 py-3 ">
                    <input
                      type="date"
                      
                      value={row.dateOfProfileShared || ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        setRows(prev =>
                          prev.map(r =>
                            r.demandId === row.demandId
                              ? { ...r, dateOfProfileShared: value }
                              : r
                          )
                        );
                      }}
                      className="border rounded px-2 py-1 "
                    />
                  </td>

                  <td className="px-4 py-3">
                    <select className="border rounded px-2 py-1">
                      <option value="">Select</option>
                      <option value="External">External</option>
                      <option value="Internal">Internal</option>
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <input type="date" className="border rounded px-2 py-1" />
                  </td>

                  <td className="px-4 py-3">
                    <select className="border rounded px-2 py-1">
                      <option value="">Select</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={row.decisionDate || ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        setRows(prev =>
                          prev.map(r =>
                            r.demandId === row.demandId
                              ? { ...r, decisionDate: value }
                              : r
                          )
                        );
                      }}
                      className="border rounded px-2 py-1"
                    />
                  </td>

                  {/* AGE (AUTO) */}
                  <td className="px-4 py-3">
                    {calculateAge(
                      row.dateOfProfileShared,
                      row.decisionDate
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          <div className="flex items-center gap-4 m-20 px-2">

            <button onClick={() => navigate("/DemandSheet")} className=" bg-gray-600 rounded-md text-white py-2 px-10 font-medium tracking-wide hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400">
              Previous
            </button>
            <button onClick={() => navigate("/OnBoardingTracker")} className=" bg-[#F15B40] rounded-md text-white py-2 px-10 font-medium tracking-wide hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400">
              Next
            </button>

          </div>
      </div>
    </>
  );
}

