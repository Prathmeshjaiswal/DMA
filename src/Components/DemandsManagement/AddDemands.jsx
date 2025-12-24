
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useRef ,useEffect} from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "../NavBar.jsx"
import Select, { components } from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import axios from 'axios'





export default function AddDemands(props) {
  const navigate = useNavigate();
  //storage
  const STORAGE_KEY="addDemandsFormData"

   const [dropDownData, setDropDownData] = useState([]);

   const handleChange= (e)=>{props.setForm({...props.form,[e.target.name]: e.target.value})}

   useEffect(() => {
    fetchDropDownData();
  }, []);

// useEffect(() => {
//   console.log("dropDownData:", dropDownData);
// }, [dropDownData]);



  const onUpdate = (e) => {
    e.preventDefault();
    const requiredFields = [
      ["lob", "Line of Business"],
      ["noOfPositions", "No. of Positions"],
      ["skillCluster", "Skill Cluster"],
      ["primarySkills", "Primary Skills"],
      ["demandReceivedDate", "Demand Received Date"],
      ["hiringManager", "Hiring Manager"],
      ["salesSpoc", "Sales SPOC"],
      ["deliveryManager", "Delivery Manager"],
      ["pmo", "PMO"],
      ["hbu", "HBU"],
      ["demandType", "Demand Type"],
      ["demandTimeline","Demand Timeline"]
    ];


    const missing = requiredFields.filter(([k]) => !String(props.form[k] || "").trim());
    if (missing.length) {
      alert(`Please fill: ${missing.map((m) => m[1]).join(", ")}`);
      return;
    }

     postDemandData();
//     console.log("Form payload:", form);
//     console.log("Updated successfully (mock). See console for payload.");
  };
  const fetchDropDownData =()=>{
      axios.get("http://localhost:8080/addNewDemand/home")
      .then((res)=>{
          console.log("payload",res?.data?.data);
          setDropDownData(res?.data?.data ?? {});
          })
      .catch((error)=>{console.log(error);
              })
      }

  const postDemandData =()=>{
      axios.post("http://localhost:8080/addNewDemand/step1",props.form,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
      .then((res)=>{
          console.log("DemandData",res?.data?.data);
          setDemandData(res?.data?.data);
          })
      .catch((error)=>{
  console.error('Status:', error.response?.status);
  console.error('Body:', error.response?.data)

              })

      }
  const [page, setPage] = useState(1);
  const totalPages = 3;
  //   const inputRef = useRef(null);


  const handleNext = () => page < totalPages && setPage(page + 1);
  const handlePrev = () => page > 1 && setPage(page - 1);


const options = Array.isArray(dropDownData)
  ? dropDownData
  : dropDownData?.options ?? [];

  //checkbox
//   const CheckboxOption = (props) => {
//     return (
//       <components.Option {...props}>
//         <div className="flex items-center justify-between w-fu">
//           <span>{props.label}</span>
//           <input
//             type="checkbox"
//             checked={props.isSelected}
//             readOnly
//           />
//
//         </div>
//
//       </components.Option>
//
//     )
//   }



  const LOB_OPTIONS = dropDownData?.lobList ?? [];
  const SKILL_CLUSTERS_OPTIONS = dropDownData?.skillClusterList ?? [];
  const PRIMARY_SKILLS_OPTIONS = dropDownData?.primarySkillsList ?? [];
  const SECONDARY_SKILLS_OPTIONS = dropDownData?.secondarySkillsList ?? [];
  const HIRING_MANAGERS_OPTIONS = dropDownData?.hiringManagerList ?? [];
  const SALES_SPOCS_OPTIONS = dropDownData?.salesSpocList ?? [];
  const PMO_LIST_OPTIONS = dropDownData?.pmoList ?? [];
  const HBUs_OPTIONS = dropDownData?.hbuList ?? [];
  const DELIVERY_MANAGERS_OPTIONS = dropDownData?.deliveryManagerList ?? [];
  const DEMAND_TIMELINE_OPTIONS = ["CURRENT","FUTURE"];
  const DEMAND_TYPES_OPTIONS = dropDownData?.demandTypeList ?? [];
//
//
//   const skillClusterOptions = SKILL_CLUSTERS.map(s => ({ label: s, value: s }))
//   const primarySkillOptions = PRIMARY_SKILLS.map(s => ({ label: s, value: s }))
//   const secondarySkillOptions = SECONDARY_SKILLS.map(s => ({ label: s, value: s }))


  const cxButtonGreen = "rounded-md bg-gray-800 text-white px-4 py-2 border border-[#52624E] shadow-sm";
  const cxButtonOrange = "rounded-md bg-green-100 text-white px-4 py-2 border border-orange-800 shadow-sm";
  const labelPill = "rounded-md bg-gray-800 text-white px-4 pt-1  text-sm font-medium border border-[#52624E]";
  const inputBox = "w-full rounded-md border border-[#52624E] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400";
  // const inputBox2 = "w-full  border-[#52624E] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400";


  return (
    <>
      <NavBar />
      <form onSubmit={onUpdate} className="bg-white pt-1">
        <div className="flex justify-between px-45 mt-1">
          <div className="flex items-center gap-3">
            <button type="button" className="font-bold">Add New Demand Here :-</button>
          </div>
        </div>
        {/*           <span className={`${labelPill}`}>Demand ID (Only Text)</span> */}
        {/*           <span className={`${labelPill}`}>RR (Only Text)</span> */}
        {/*         </div> */}
        {/*       </div> */}
        {/*       <div className="mt-4"><hr className="border-gray-300" /></div> */}


        <div className="grid grid-cols-2 gap-5 justify-between px-20 mx-30">

          <div className="grid grid-rows-2 pb-3 mr-10 items-center">
            <span className={labelPill}>Line of Business</span>
            <select className={inputBox} name="lob" value={props.form.lob} onChange={handleChange}>
              <option value="">Select Line of Business</option>
              {LOB_OPTIONS.map((opt) => <option key={opt.id} value={opt.lob}>
                  {opt.lob}</option>)}
            </select>
          </div>

          <div className="grid grid-rows-2 pb-3 ml-10 gap-1 items-center">
            <span className={labelPill}>No. of Positions</span>
            <input className={inputBox} name="noOfPositions" type="number" min={1} placeholder="Enter positions" value={props.form.noOfPositions} onChange={handleChange} />
          </div>

           <div className="grid grid-rows-2 pb-3 mr-10 gap-1 items-center">
            <span className={labelPill}>Skill Cluster</span>
             <select className={inputBox} name="skillCluster" value={props.form.skillCluster} onChange={handleChange}>
               <option value="">Select Skill Cluster</option>
              {SKILL_CLUSTERS_OPTIONS.map((opt) => <option key={opt.id} value={opt.value}>
                  {opt.skillCluster}</option>)}
              </select>

           </div>

          <div className="grid grid-rows-2 pb-3 gap-1 ml-10 items-center mt-0">
            <span className={labelPill}>Primary Skills</span>
          <select className={inputBox}  name="primarySkills" value={props.form.primarySkills} onChange={handleChange} >
            <option value="">Select Primary Skill</option>
             {PRIMARY_SKILLS_OPTIONS.map((opt) => <option key={opt.id} value={opt.value}>{opt.primarySkills}</option>)}
           </select>
          </div>


          <div className="grid grid-rows-2 pb-3 gap-1 mr-10 items-center">
            <span className={labelPill}>Secondary Skills</span>
            <select className={inputBox} name="secondarySkills" value={props.form.secondarySkills} onChange={handleChange}>
            <option value="">Select Secondary Skill</option>
            {SECONDARY_SKILLS_OPTIONS.map((opt) => <option key={opt.id} value={opt.value}>{opt.secondarySkills}</option>)}
          </select>
          </div>

          <div className="grid grid-rows-2 pb-3 gap-1 ml-10 items-center">
            <span className={labelPill}>Demand Recieved Date</span>
{/*             <input type="date" className={inputBox} value={form.demandReceivedDate} onChange={(e) => setForm("demandReceivedDate", e.target.value)} /> */}
            <DatePicker
              selected={props.form.demandReceivedDate ? new Date(props.form.demandReceivedDate) : null}
              onChange={(date) =>
                props.setForm({ ...props.form, demandReceivedDate: date })
              }
              dateFormat="dd-MMM-yyyy"
              className={inputBox}
              placeholderText="dd-mmm-yyyy"
            />
          </div>

          <div className="grid grid-rows-2 pb-3 gap-1 mr-10 items-center">
            <span className={labelPill}>Hiring Manager</span>
            <select className={inputBox} name="hiringManager" value={props.form.hiringManager} onChange={handleChange}>
              <option value="">Select Hiring Manager</option>
              {HIRING_MANAGERS_OPTIONS.map((opt) => <option key={opt.id} value={opt.value}>{opt.hiringManager}</option>)}
            </select>


          </div>
          <div className="grid grid-rows-2 pb-3 gap-1 ml-10 items-center">
            <span className={labelPill}>Sales SPOC</span>
            <select className={inputBox} name="salesSpoc" value={props.form.salesSpoc} onChange={handleChange}>
              <option value="">Select Sales SPOC</option>
              {SALES_SPOCS_OPTIONS.map((opt) => <option key={opt.id} value={opt.salesSpoc}>{opt.salesSpoc}</option>)}
            </select>

          </div>
          <div className="grid grid-rows-2 pb-3 gap-1 mr-10 items-center">
            <span className={labelPill}>Delivery Manager</span>
            <select className={inputBox} name="deliveryManager" value={props.form.deliveryManager} onChange={handleChange}>
              <option value="">Select Delivery Manager</option>
              {DELIVERY_MANAGERS_OPTIONS.map((opt) => <option key={opt.id} value={opt.deliveryManager}>{opt.deliveryManager}</option>)}
            </select>
          </div>
          <div className="grid grid-rows-2 pb-3 gap-1 ml-10 items-center">
            <span className={labelPill}>PMO</span>
            <select className={inputBox} name="pmo" value={props.form.pmo} onChange={handleChange}>
              <option value="">Select PMO</option>
              {PMO_LIST_OPTIONS.map((opt) => <option key={opt.id} value={opt.pmo}>{opt.pmo}</option>)}
            </select>
          </div>
          <div className="grid grid-rows-2 pb-3 gap-1 mr-10 items-center">
            <span className={labelPill}>HBU</span>
            <select className={inputBox} name="hbu" value={props.form.hbu} onChange={handleChange}>
              <option value="">Select HBU</option>
              {HBUs_OPTIONS.map((opt) => <option key={opt.id} value={opt.hbu}>{opt.hbu}</option>)}
            </select>
          </div>
{/*           <div className="grid grid-rows-3 gap-1 items-center"> */}
{/*             <span className={labelPill}>Demand Timeline</span> */}
{/*             <select className={inputBox} value={form.demandTimeline} onChange={(e) => setForm({...form,demandTimeline: e.target.value})}> */}
{/*               <option value="">Select Demand Timeline</option> */}
{/*               {DEMAND_TIMELINE_OPTIONS.map((opt) => <option key={opt.id} value={opt}>{o}</option>)} */}
{/*             </select> */}
{/*           </div> */}
          <div className="grid grid-rows-2 pb-3 gap-1 ml-10 items-center">
            <span className={labelPill}>Demand Timeline</span>
            <select className={inputBox} name="demandTimeline" value={props.form.demandTimeline} onChange={handleChange}>
              <option value="">Select Demand Timeline</option>
              {DEMAND_TIMELINE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="grid grid-rows-2 pb-3 gap-0.5 mr-10 items-center">
            <span className={labelPill}>Demand Type</span>
            <select className={inputBox} name="demandType" value={props.form.demandType} onChange={handleChange}>
               <option value="">Select Demand Type</option>
             {DEMAND_TYPES_OPTIONS.map((opt) => <option key={opt.id} value={opt.demandType}>{opt.demandType}</option>)}
            </select>
          </div>
          <div className="grid grid-rows-2 pb-3 ml-10 gap-0.5 items-center">
            <span className={labelPill}>Remark</span>
            <textarea className={inputBox} name="remark"
             rows={1}
             maxLength={250}
             placeholder="Enter remark (max 250 char)"
             value={props.form.remark}
            onChange={handleChange}
            />
{/*              <span className="text-xs text-gray-500"> */}
{/*               {props.form.remark?.length || 0}/250 */}
{/*             </span> */}

          </div>
          <div className="flex items-center gap-4 m-2 px-6">

            <button onClick={() => navigate("/DashBoard")} className=" bg-gray-300 rounded-md text-gray-800 py-2 px-10 font-medium tracking-wide hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400">
              Previous
            </button>
            <button onClick={() =>navigate("/AddDemands2")}
 className=" bg-gray-800 rounded-md text-white py-2 px-10 font-medium tracking-wide hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400">
              Next
            </button>

          </div>

        </div>
      </form>
    </>
  );
};
