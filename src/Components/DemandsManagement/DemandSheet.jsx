

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar.jsx"

export default function DemandSheet(props) {
const CAN_EDIT_ROLES = ["Delivery Manager", "PMO"];
const pillOrange = "rounded-md bg-orange-700 text-white px-4 py-2 border border-orange-800 shadow-sm";
const pillGreen  = "rounded-md bg-gray-800 text-white px-4 py-2 border border-[#52624E] shadow-sm";
const inputBox   = "w-full rounded-md border border-[#52624E] px-2 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400";
const badge      = "inline-block rounded-md bg-[#8FA58A] text-white px-3 py-1 text-sm border border-[#52624E]";

const todayISO = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const initialRows = [
  {
    demandId: "DMD-1001",
    rr: "RR-501",
    lob: "Banking",
    hsbcHiringManager: "Alice",
    skillCluster: "Java",
    primarySkill: "Spring",
    secondarySkill: "React",
    currentProfileShared: "No",
    dateOfProfileShared: "",
    externalInternal: "External",
    status: "Open",
  },
  {
    demandId: "DMD-1002",
    rr: "RR-502",
    lob: "Insurance",
    hsbcHiringManager: "Bob",
    skillCluster: "Data",
    primarySkill: "Python",
    secondarySkill: "PowerBI",
    currentProfileShared: "Yes",
    dateOfProfileShared: todayISO(),
    externalInternal: "Internal",
    status: "Closed",
  },
];


const LOBS = ["Banking", "Insurance", "Retail", "Telecom"];
const MANAGERS = ["Alice", "Bob", "Charlie"];
const CLUSTERS = ["Java", "Data", "Cloud", "Testing"];
const PRIMARY = ["Spring", "React", "Python", "SQL"];
const SECONDARY = ["Redux", "Django", "PowerBI", "Kafka"];
const SHARED_OPTIONS = ["Yes", "No"];
const EXT_INT = ["External", "Internal"];
const STATUS_OPTIONS = ["Open", "In Progress", "Closed", "Reopened"];


  const [rows, setRows] = useState(initialRows);
  const [editable, setEditable] = useState(false);
  const [saving, setSaving] = useState(false);
   const [updateError, setUpdateError] = useState("");
//   const[userMsg,setUserMsg] = useState("");
  const canEdit = CAN_EDIT_ROLES.includes(props.userRole);
  const navigate = useNavigate();


  const message =() =>{
      if(!canEdit) alert("You are not authorized to edit this demand sheet");
      else navigate("/EditDemand");

      }

  const setCell = (idx, key, value) => {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[idx] };

      if (key === "currentProfileShared") {
        row.currentProfileShared = value;
        row.dateOfProfileShared = value === "Yes" ? todayISO() : "";
      } else {
        row[key] = value;
      }

      next[idx] = row;
      return next;
    });
  };


  const onUpdate = async (e) => {
    e.preventDefault();
    setUpdateError("");
    setSaving(true);
    try {
      // TODO: Replace with real API call
      // await fetch("/api/demand-sheet/update", { method: "POST", body: JSON.stringify(rows) });
      await new Promise((r) => setTimeout(r, 1000));
      console.log("Demand sheet saved:", rows);
      console.log("Demand sheet updated (mock). Check console for payload.");
      setEditable(false);
    } catch {
      setUpdateError("Update failed. Please try again.")
    } finally {

      setSaving(false);
    }
  };

  return (
      <>
      <NavBar />
    <form onSubmit={onUpdate} className="pt-10 min-h-screen bg-white">
      <div className="flex justify-between px-6 pt-6">
        <div className="flex items-center gap-3">
          <span className="">Demand Sheet :-</span>
        </div>
      </div>


      <div className="mt-4"><hr className="border-gray-300" /></div>
      <div className="mx-auto w-full max-w-6xl px-6 mt-6">
        <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
          <table className="min-w-[900px] w-full table-fixed">
            <thead className="bg-gray-50">
              <tr className="text-sm text-gray-700">
                {[
                  "Demand ID",
                  "RR",
                  "LOB",
                  "HSBC Hiring Manager",
                  "Skill Cluster",
                  "Primary Skill",
                  "Secondary Skill",
                  "Current Profile Shared (Drop Down)",
                  "Date of Profile Shared (Auto Populate)",
                  "External / Internal",
                  "Status",
                ].map((h) => (
                  <th key={h} className="border border-gray-300 px-2 py-2 text-left font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.demandId} className="text-sm">
                  <td className="border border-gray-300 px-2 py-2">
                    <div className={badge}>{r.demandId}</div>
                  </td>

                  <td className="border border-gray-300 px-2 py-2">
                    <div className="inline-block  text-black px-3 py-1 text-sm ">{r.rr}</div>
                  </td>

                  <td className="border border-gray-300 px-2 py-2">
                         {r.lob}
                  </td>

                  <td className="border border-gray-300 px-2 py-2">
                       {r.hsbcHiringManager}
                  </td>

                  <td className="border border-gray-300 px-2 py-2">
                       {r.skillCluster}
                  </td>


                  <td className="border border-gray-300 px-2 py-2">
                    {r.primarySkill}
                  </td>

                  <td className="border border-gray-300 px-2 py-2">
                     {r.secondarySkill}
                  </td>

                  <td className="border border-gray-300 px-2 py-2">
                       {r.currentProfileShared}
                  </td>

                  <td className="border border-gray-300 px-2 py-2">
                    {r.dateOfProfileShared}
                  </td>

                  <td className="border border-gray-300 px-2 py-2">
                    {r.externalInternal}
                  </td>

                  <td className="border border-gray-300 px-2 py-2">
                    {r.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

{/* {!canEdit&&( */}
{/*           <div className="mt-3 flex items-start gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-red-800 shadow-sm"> */}
{/*             <span className="font-semibold">Access denied:</span> */}
{/*             <span className="flex-1">{message}</span> */}
{/*             <button type="button" className="rounded bg-red-100 px-2 py-1 text-xs hover:bg-red-200"> */}
{/*               Close */}
{/*             </button> */}
{/*           </div> */}
{/* )} */}
      </div>


        <div className="mx-auto max-w-6xl px-6 py-3">
          <button type="submit" onClick={message} disabled={!canEdit} className={pillGreen}>
            Edit Demand Sheet
          </button>
      </div>
    </form>
    </>
   );
};
