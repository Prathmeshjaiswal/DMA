import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import NavBar from "../NavBar.jsx";
import DemandSheet from "./DemandSheet.jsx";
import OnBoardingTracker from "./OnBoardingTracker.jsx";
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




  return (
    <>
      <NavBar />

      <div className="p-16">
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">

              <tr>
                <th className="px-2 py-2 text-xs font-semibold w-12">Edit</th>
                <th className="px-2 py-2 text-xs font-semibold w-24">Demand ID</th>
                <th className="px-2 py-2 text-xs font-semibold w-16">RR</th>
                <th className="px-2 py-2 text-xs font-semibold w-20">LOB</th>
                <th className="px-2 py-2 text-xs font-semibold w-32">HSBC Hiring Manager</th>
                <th className="px-2 py-2 text-xs font-semibold w-24">Skill Cluster</th>
                <th className="px-2 py-2 text-xs font-semibold w-24">Primary Skill</th>
                <th className="px-2 py-2 text-xs font-semibold w-24">Secondary Skill</th>
                <th className="px-2 py-2 text-xs font-semibold w-32">Current Profile Shared</th>
                <th className="px-2 py-2 text-xs font-semibold w-32">Date of Profile Shared</th>  
                <th className="px-2 py-2 text-xs font-semibold w-28">External/Internal</th>
                <th className="px-2 py-2 text-xs font-semibold w-28">Interview Date</th>
                <th className="px-2 py-2 text-xs font-semibold w-24">Status</th>
                <th className="px-2 py-2 text-xs font-semibold w-28">Decision Date</th>
                <th className="px-2 py-2 text-xs font-semibold w-20">Age</th>
              </tr>

            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.demandId} className="hover:bg-gray-50">

                  {/* EDIT ICON */}
                  <td className="px-4 py-3">
                    <PencilSquareIcon className="h-5 w-5 text-gray-600 cursor-pointer" />
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

                  <td className="px-4 py-3">
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
                      className="border rounded px-2 py-1"
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

            <button onClick={() => navigate("/DemandSheet")} className=" bg-gray-300 rounded-md text-gray-800 py-2 px-10 font-medium tracking-wide hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400">
              Previous
            </button>
            <button onClick={() => navigate("/OnBoardingTracker")} className=" bg-gray-800 rounded-md text-white py-2 px-10 font-medium tracking-wide hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400">
              Next
            </button>

          </div>
      </div>
    </>
  );
}

