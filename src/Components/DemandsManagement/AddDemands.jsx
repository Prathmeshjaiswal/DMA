
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "../NavBar.jsx"
import Select, { components } from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"





export default function AddDemands() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    //     demandId: "DMD-1234", // read-only in screenshot
    //     rr: "RR-5678",        // read-only in screenshot
    lob: "",
    positions: "",
    skillCluster: [],//array
    primarySkill: [],
    secondarySkill: [],
    demandReceivedDate: "",
    hiringManager: "",
    salesSpoc: "",
    deliveryManager: "",
    pmo: "",
    hbu: "",
    demandType: "",
  });


  const onUpdate = (e) => {
    e.preventDefault();
    const requiredFields = [
      ["lob", "Line of Business"],
      ["positions", "No. of Positions"],
      ["skillCluster", "Skill Cluster"],
      ["primarySkill", "Primary Skills"],
      ["demandReceivedDate", "Demand Received Date"],
      ["hiringManager", "Hiring Manager"],
      ["salesSpoc", "Sales SPOC"],
      ["deliveryManager", "Delivery Manager"],
      ["pmo", "PMO"],
      ["hbu", "HBU"],
      ["demandType", "Demand Type"],
    ];


    const missing = requiredFields.filter(([k]) => !String(form[k] || "").trim());
    if (missing.length) {
      alert(`Please fill: ${missing.map((m) => m[1]).join(", ")}`);
      return;
    }

    console.log("Form payload:", form);
    console.log("Updated successfully (mock). See console for payload.");
  };


  const [page, setPage] = useState(1);
  const totalPages = 3;
  //   const inputRef = useRef(null);


  const handleNext = () => page < totalPages && setPage(page + 1);
  const handlePrev = () => page > 1 && setPage(page - 1);


  //checkbox
  const CheckboxOption = (props) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center justify-between w-full">
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



  const LOB_OPTIONS = ["WPB", "GDT", "WSIT-GPS", "WSIT-Excluding GPS", "MSS", "Enterprise Technology", "Other-Technology COO", "CTO", "WSIT", "Other- SAB Technology ", "WSIT- GPS", "WSIT- Excluding GPS", "WPB ", "Cybersecurity ", "Other COO ", "Other- Middle east technology "];
  const SKILL_CLUSTERS = ["Full stack tester ", "Web UI developer ", "Senior python developer ", "Cards API Developer", "Cards API QA-Tester", "Cards API QA-Tester"];
  const PRIMARY_SKILLS = ["Java", "React", "Python", "SQL"];
  const SECONDARY_SKILLS = ["Spring", "Redux", "Django", "PowerBI"];
  const MANAGERS = ["Keshav", "Himanshu", "Swati"];
  const SPOCS = ["Anurah", "Naveen", "Neeraj", "Shashwat", "William", "Rajat"];
  const PMO_LIST = ["Shubham Kadam", "Upal / Shubham", "Swati Pahuja", "Gouri /abhishek", "Shobhit Bhardwaj", "Shobhit/Gouri", "Upal / Mayuri"];
  const HBUs = ["HBU-North", "HBU-South", "HBU-East", "HBU-West"];
  const DELIVERY_MANAGERS = ["Nitin", "Anurag", "DM-3"];
  const DEMAND_TYPES = ["Current", "Future"];

  //
  const skillClusterOptions = SKILL_CLUSTERS.map(s => ({ label: s, value: s }))
  const primarySkillOptions = PRIMARY_SKILLS.map(s => ({ label: s, value: s }))
  const secondarySkillOptions = SECONDARY_SKILLS.map(s => ({ label: s, value: s }))


  const cxButtonGreen = "rounded-md bg-gray-800 text-white px-4 py-2 border border-[#52624E] shadow-sm";
  const cxButtonOrange = "rounded-md bg-green-100 text-white px-4 py-2 border border-orange-800 shadow-sm";
  const labelPill = "rounded-md bg-gray-800 text-white px-4 py-1 text-sm font-medium border border-[#52624E]";
  const inputBox = "w-full rounded-md border border-[#52624E] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400";


  return (
    <>
      <NavBar />
      <form onSubmit={onUpdate} className="bg-white pt-15">
        <div className="flex justify-between px-6 mt-6">
          <div className="flex items-center gap-3">
            <button type="button" className="">Add New Demand Here :-</button>
          </div>
        </div>
        {/*           <span className={`${labelPill}`}>Demand ID (Only Text)</span> */}
        {/*           <span className={`${labelPill}`}>RR (Only Text)</span> */}
        {/*         </div> */}
        {/*       </div> */}
        {/*       <div className="mt-4"><hr className="border-gray-300" /></div> */}


        <div className="grid grid-cols-2 gap-5 mx-9 px-9">
          <div className="grid grid-rows-3 items-center">
            <span className={labelPill}>Line of Business</span>
            <select className={inputBox} value={form.lob} onChange={(e) => setForm("lob", e.target.value)}>
              <option value="">Select Line of Business</option>
              {LOB_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>No. of Positions</span>
            <input className={inputBox} type="number" min={1} placeholder="Enter positions" value={form.positions} onChange={(e) => setForm("positions", e.target.value)} />

          </div>

          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Skill Cluster</span>
            {/* <select className={inputBox} value={form.skillCluster} onChange={(e) => setForm("skillCluster", e.target.value)}>
            <option value="">Select Skill Cluster</option>
            {SKILL_CLUSTERS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select> */}

            <Select
              options={skillClusterOptions} isMulti
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={{
                Option: CheckboxOption
              }}
              value={form.skillCluster}
              onChange={(selected) =>
                setForm({ ...form, skillCluster: selected })
              }
              placeholder="Select Skill Cluster"
              className="w-full"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#52624E",
                  minHeight: "42px"
                })
              }}

            />

          </div>

          <div className="grid grid-rows-3 gap-1 items-center mt-0">
            <span className={labelPill}>Primary Skills</span>
            {/* <select className={inputBox} value={form.primarySkill} onChange={(e) => setForm("primarySkill", e.target.value)}>
            <option value="">Select Primary Skill</option>
            {PRIMARY_SKILLS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select> */}

            <Select
              options={primarySkillOptions} isMulti
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={{
                Option: CheckboxOption
              }}
              value={form.primarySkill}
              onChange={(selected) =>{
                if(selected && selected.length > 2){
                  alert("you can select only 2 primary skills");
                  return;
                } 
                setForm({ ...form, primarySkill: selected })
              }}
              placeholder="Select Primary Skills"
              className="w-full"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#52624E",
                  minHeight: "42px"
                })
              }}
            />
          </div>


          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Secondary Skills</span>
            {/* <select className={inputBox} value={form.secondarySkill} onChange={(e) => setForm("secondarySkill", e.target.value)}>
            <option value="">Select Secondary Skill</option>
            {SECONDARY_SKILLS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select> */}

            <Select
              options={secondarySkillOptions} isMulti
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={{
                Option: CheckboxOption
              }}
              value={form.secondarySkill}
              onChange={(selected) =>
                setForm({ ...form, secondarySkill: selected })
              }
              placeholder="Select Secondary Skills"
              className="w-full"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#52624E",
                  minHeight: "42px"
                })
              }}

            />
          </div>

          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Demand Recieved Date</span>
            {/* <input type="date" className={inputBox} value={form.demandReceivedDate} onChange={(e) => setForm("demandReceivedDate", e.target.value)} /> */}

            <DatePicker
              selected={form.demandReceivedDate ? new Date(form.demandReceivedDate) : null}
              onChange={(date) =>
                setForm({ ...form, demandReceivedDate: date })
              }
              dateFormat="dd/MMM/yyyy"
              className={inputBox}
              placeholderText="dd/mm/yyyy"
            />
          </div>

          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Hiring Manager</span>
            <select className={inputBox} value={form.hiringManager} onChange={(e) => setForm("hiringManager", e.target.value)}>
              <option value="">Select Hiring Manager</option>
              {MANAGERS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>


          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Sales SPOC</span>
            <select className={inputBox} value={form.salesSpoc} onChange={(e) => setForm("salesSpoc", e.target.value)}>
              <option value="">Select Sales SPOC</option>
              {SPOCS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>

          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Delivery Manager</span>
            <select className={inputBox} value={form.deliveryManager} onChange={(e) => setForm("deliveryManager", e.target.value)}>
              <option value="">Select Delivery Manager</option>
              {DELIVERY_MANAGERS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>PMO</span>
            <select className={inputBox} value={form.pmo} onChange={(e) => setForm("pmo", e.target.value)}>
              <option value="">Select PMO</option>
              {PMO_LIST.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>HBU</span>
            <select className={inputBox} value={form.hbu} onChange={(e) => setForm("hbu", e.target.value)}>
              <option value="">Select HBU</option>
              {HBUs.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Demand Type</span>
            <select className={inputBox} value={form.demandType} onChange={(e) => setForm("demandType", e.target.value)}>
              <option value="">Select Demand Type</option>
              {DEMAND_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4 m-2 px-6">

            <button onClick={() => navigate("/DashBoard")} className=" bg-gray-300 rounded-md text-gray-800 py-2 px-10 font-medium tracking-wide hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400">
              Previous
            </button>
            <button onClick={() => navigate("/AddDemands2")} className=" bg-gray-800 rounded-md text-white py-2 px-10 font-medium tracking-wide hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400">
              Next
            </button>


          </div>

        </div>
      </form>
    </>
  );
};
