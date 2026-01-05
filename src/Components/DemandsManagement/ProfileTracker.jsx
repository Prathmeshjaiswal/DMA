import { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../NavBar.jsx";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
 
export default function ProfileTracker() {
  const [rows] = useState([
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
      dropDown1: "",
      calendar: "",
      dropDown2: "",
      comments: "",
    },

  ]);
 
  // Age calculation
  const calculateAge = (date) => {
    if (!date) return "-";
    const diff =
      (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
    return Math.floor(diff);
  };
 
  return (
    <>
      <NavBar />
 
      <div className="p-16">
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold">Edit</th>
                <th className="px-4 py-3 text-sm font-semibold">Demand ID</th>
                <th className="px-4 py-3 text-sm font-semibold">RR</th>
                <th className="px-4 py-3 text-sm font-semibold">LOB</th>
                <th className="px-4 py-3 text-sm font-semibold">HSBC Hiring Manager</th>
                <th className="px-4 py-3 text-sm font-semibold">Skill Cluster</th>
                <th className="px-4 py-3 text-sm font-semibold">Primary Skill</th>
                <th className="px-4 py-3 text-sm font-semibold">Secondary Skill</th>
                <th className="px-4 py-3 text-sm font-semibold">Current Profile Shared</th>
                <th className="px-4 py-3 text-sm font-semibold">Date of Profile Shared</th>
                <th className="px-4 py-3 text-sm font-semibold">External / Internal</th>
                <th className="px-4 py-3 text-sm font-semibold">Interview Date</th>
                <th className="px-4 py-3 text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-sm font-semibold">Decision Date</th>
                <th className="px-4 py-3 text-sm font-semibold">Age</th>
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
      <td className="px-4 py-3 ">{row.demandId}</td>
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
        <input type="date" className="border rounded px-2 py-1" />
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
        <input type="date" className="border rounded px-2 py-1" />
      </td>
 
      {/* AGE (AUTO) */}
      <td className="px-4 py-3">
        {row.dateOfProfileShared
          ? Math.floor(
              (new Date() - new Date(row.dateOfProfileShared)) /
                (1000 * 60 * 60 * 24)
            )
          : "-"}
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
 
