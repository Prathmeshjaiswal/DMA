
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useRef ,useEffect,useMemo} from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "../../NavBar.jsx"
import Select, { components } from "react-select";
import {message,Spin} from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import { LoadingOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

import {
  makeGetFieldOptions,
  buildAllOptions,
} from "../DemandSheet/dropdown.js";

import {getDropDownData, submitStep1} from "../../api/Demands/addDemands.js"

export default function AddDemands1() {
  const CheckboxOption = (props) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center justify-between w-fu">
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

  const labelPill = "rounded-md bg-gray-800 text-white px-4 py-1 text-sm font-medium border border-[#52624E]";
  const inputBox = "w-full rounded-md border border-[#52624E] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // initial state
  const [form, setForm] = useState({
    // Required fields  
    lob: '',
    noOfPositions: '',          
    skillCluter: '',            // keep exact backend field name
    primarySkills: '',
    secondarySkills: '',
    demandReceivedDate: '',     
    hiringManager: '',
    salesSpoc: '',
    deliveryManager: '',
    pmo: '',
    hbu: '',
    demandType: '',
    demandTimeline: '',

    // Optional fields
    prodProgramName: '',
    experience: '3-5 years',
    priority: 'P2',
    demandLocation: 'Pune',
    priorityComment: '',
    pm: 'Rahul',
    band: 'B3',
    p1Age: '',
    currentProfileShared: 0,   // keep numeric in state; easier to work with
    externalInternal: 'External',
    status: 'Open',
    pmoSpoc: 'Shubham Kadam',
    remark: '',
  });

  // Generic change handler for <input>, <select>
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setForm((prev) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lob) return alert('LOB is required');
    if (!form.noOfPositions || Number(form.noOfPositions) < 1) {
      return alert('No. of Positions must be at least 1');
    }
    if (!form.skillCluter) return alert('Skill Cluster is required');
    if (!form.demandReceivedDate) return alert('Demand Received Date is required');
    const skillCluterStr = (form.skillCluter || []).map(i => i.value).join(',');
    const primarySkillsStr = (form.primarySkills || []).map(i => i.value).join(',');
    const secondarySkillsStr = (form.secondarySkills || []).map(i => i.value).join(',');
    setLoading(true);

    // Build payload
    const form1Data = {
      lob: form.lob,
      noOfPositions: Number(form.noOfPositions || 0),
      skillCluter: skillCluterStr,
      primarySkills: primarySkillsStr,
      secondarySkills: secondarySkillsStr,
      demandReceivedDate: form.demandReceivedDate, 
      hiringManager: form.hiringManager,
      salesSpoc: form.salesSpoc,
      deliveryManager: form.deliveryManager,
      pmo: form.pmo,
      hbu: form.hbu,
      demandType: form.demandType,
      demandTimeline: form.demandTimeline,

      // Optional
      prodProgramName: form.prodProgramName,
      experience: form.experience,
      priority: form.priority,
      demandLocation: form.demandLocation,
      priorityComment: form.priorityComment,
      pm: form.pm,
      band: form.band,
      p1Age: form.p1Age,
      currentProfileShared: form.currentProfileShared
        ? Number(form.currentProfileShared)
        : 0,
      externalInternal: form.externalInternal,
      status: form.status,
      pmoSpoc: form.pmoSpoc,
      remark: form.remark,
    };

    try {
      console.log(form1Data)
      const res = await submitStep1(form1Data);
      const serverDTO = res?.data ?? res;
      console.log(serverDTO)
      message.success(`Demand ID has been generated successfully!`);
      navigate('/addDemands2', { state: { form1Data: serverDTO } });
    } catch (err) {
      console.error('[Step1] error:', err);
      alert(`Step 1 failed: ${err.message}`);
      message.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  const [dropdowns, setDropdowns] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dd = await getDropDownData();
        if (mounted) setDropdowns(dd);
        console.log(dd)
      } catch (e) {
        console.error("Failed to load /home:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const options = useMemo(() => buildAllOptions(dropdowns), [dropdowns]);

  return (
    <>
      <NavBar />
      <form onSubmit={handleSubmit} className="bg-white pt-1">
        <div className="flex justify-center px-45 mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                ADD NEW DEMAND
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-8 mx-4 px-30">
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Line of Business</span>
            <select className={inputBox} value={form.lob} onChange={(e) => setForm({...form,lob: e.target.value})}>
              <option value="">Select Line of Business</option>
              {options.lob.map((o) => (
                <option key={String(o.value)} value={String(o.value)}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>No. of Positions</span>
            <input className={inputBox} type="number" min={1} placeholder="Enter positions" value={form.noOfPositions} onChange={(e) => setForm({...form,noOfPositions: e.target.value})} />
          </div>

          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Skill Cluster</span>
            <Select
              options={options.skillCluster} isMulti
              closeMenuOnSelect={false}
              controlShouldRenderValue={true}
              hideSelectedOptions={true}
              components={{
                Option: CheckboxOption,
              }}
              value={form.skillCluter}
              onChange={(selected) =>
                setForm({ ...form, skillCluter: selected })
              }
              placeholder="Select Skill Cluster"
              className="w-full"
             
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: state.isFocused ?"#ea580c" : "#52624E", // Orange border on focus
                  boxShadow: state.isFocused ? "0 0 0 2px rgba(230, 128, 32, 0.97)" : "none",
                  maxHeight:"50px",
                  width:"300px",
                  overflow:"auto",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: state.isFocused ? "#ea580c" : "#52624E",
                  },
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "#d3d3d3" : "#ffffff",
                  color: "#000000",
                  padding: "10px",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#808080",
                  },
                }),
              }}

            />

          </div>

          <div className="grid grid-rows-3 gap-1 items-center mt-0">
            <span className={labelPill}>Primary Skills</span>
            <Select
              options={options.primarySkills} isMulti
              closeMenuOnSelect={false}
              controlShouldRenderValue={true}
              hideSelectedOptions={true}
              components={{
                Option: CheckboxOption
              }}
              value={form.primarySkills}
              onChange={(selected) =>{
                if(selected && selected.length > 2){
                  alert("you can select only 2 primary skills");
                  return;
                } 
                setForm({ ...form, primarySkills: selected })
              }}
              placeholder="Select Primary Skills"
              className="w-full"
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: state.isFocused ?"#ea580c" : "#52624E", // Orange border on focus
                  boxShadow: state.isFocused ? "0 0 0 2px rgba(230, 128, 32, 0.97)" : "none",
                  maxHeight:"50px",
                  width:"300px",
                  overflow:"auto",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: state.isFocused ? "#ea580c" : "#52624E",
                  },
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "#d3d3d3" : "#ffffff",
                  color: "#000000",
                  padding: "10px",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#808080",
                  },
                }),
              }}
            />
          </div>


          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Secondary Skills</span>
            <Select
              options={options.secondarySkills} isMulti
              closeMenuOnSelect={false}
              controlShouldRenderValue={true}
              hideSelectedOptions={true}
              components={{
                Option: CheckboxOption
              }}
              value={form.secondarySkills}
              onChange={(selected) =>
                setForm({ ...form, secondarySkills: selected })
              }
              placeholder="Select Secondary Skills"
              className="w-full"
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: state.isFocused ?"#ea580c" : "#52624E", // Orange border on focus
                  boxShadow: state.isFocused ? "0 0 0 2px rgba(230, 128, 32, 0.97)" : "none",
                  maxHeight:"50px",
                  width:"300px",
                  overflow:"auto",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: state.isFocused ? "#ea580c" : "#52624E",
                  },
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "#d3d3d3" : "#ffffff",
                  color: "#000000",
                  padding: "10px",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#808080",
                  },
                }),
              }}
            />
          </div>

          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Demand Recieved Date</span>
            <DatePicker
              selected={form.demandReceivedDate ? new Date(form.demandReceivedDate) : null}
              onChange={(date) =>{
    const formatted =
      date ? format(date, 'dd-MMM-yyyy').toLowerCase() : '';
    setForm({ ...form, demandReceivedDate: formatted });
  }}

              dateFormat="dd-MMM-yyyy"
              className={inputBox}
              placeholderText="dd-mmm-yyyy"
            />
          </div>

          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Hiring Manager</span>
            <select className={inputBox} value={form.hiringManager} onChange={(e) => setForm({...form,hiringManager: e.target.value})}>
              <option value="">Select Hiring Manager</option>
              {options.hiringManager.map((o) => (
                  <option key={String(o.value)} value={String(o.value)}>
                    {o.label}
                  </option>
                ))}
            </select>


          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Sales SPOC</span>
            <select className={inputBox} value={form.salesSpoc} onChange={(e) =>setForm({...form,salesSpoc: e.target.value})}>
              <option value="">Select Sales SPOC</option>
              {options.salesSpoc.map((o) => (
                <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
            </select>

          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Delivery Manager</span>
            <select className={inputBox} value={form.deliveryManager} onChange={(e) => setForm({...form,deliveryManager: e.target.value})}>
              <option value="">Select Delivery Manager</option>
              {options.deliveryManager.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
          ))}
            </select>
          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>PMO</span>
            <select className={inputBox} value={form.pmo} onChange={(e) => setForm({...form,pmo: e.target.value})}>
              <option value="">Select PMO</option>
              {options.pmo.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
            </select>
          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>HBU</span>
            <select className={inputBox} value={form.hbu} onChange={(e) => setForm({...form,hbu: e.target.value})}>
              <option value="">Select HBU</option>
             {options.hbu.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
            </select>
          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Demand Timeline</span>
            <select className={inputBox} value={form.demandTimeline} onChange={(e) => setForm({...form,demandTimeline: e.target.value})}>
              <option value="">Select Demand Timeline</option>
             {options.demandTimeline.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
            </select>
          </div>
          <div className="grid grid-rows-3 gap-1 items-center">
            <span className={labelPill}>Demand Type</span>
            <select className={inputBox} value={form.demandType} onChange={(e) => setForm({...form,demandType: e.target.value})}>
              <option value="">Select Demand Type</option>
              {options.demandType.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
            </select>
          </div>

          
          <div className="grid grid-rows-3 gap-0.5 items-center">
            <span className={labelPill}>Remark</span>

            <div className="relative">
              <textarea
                className={`${inputBox} resize-none`}
                rows={1}
                maxLength={250}
                placeholder="Enter Remark"
                value={form.remark || ""}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
              />
              <span className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none select-none">
                {(form.remark?.length || 0)}/250
              </span>
            </div>
          </div>

        
          <div className="grid grid-rows-3 gap-0.5 items-center">
            <label className={labelPill}>
              Product/Program Name
            </label>
            <input
              className={inputBox}
              name="prodProgramName"
              value={form.prodProgramName}
              onChange={handleChange}
              placeholder="e.g., RP"
            />
          </div>

          <div className="grid grid-rows-3 gap-0.5 items-center">
              <label className={labelPill}>
                Experience
              </label>
              <input
                className={inputBox}
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g., 5 years"
              />
          </div>

          <div className="grid grid-rows-3 gap-0.5 items-center">
              <label className={labelPill}>
                Priority
              </label>
              <input
                className={inputBox}
                name="priority"
                value={form.priority}
                onChange={handleChange}
                placeholder="e.g., P1 / High"
              />
          </div>

          <div className="grid grid-rows-3 gap-0.5 items-center">
              <label className={labelPill}>
                Demand Location
              </label>
              <input
                className={inputBox}
                name="demandLocation"
                value={form.demandLocation}
                onChange={handleChange}
                placeholder="City / Remote"
              />
          </div>


        
          <div className="grid grid-rows-3 gap-0.5 items-center">
              <label className={labelPill}>
                Priority Comment
              </label>
              <input
                className={inputBox}
                name="priorityComment"
                value={form.priorityComment}
                onChange={handleChange}
                placeholder="Reason for priority"
              />
          </div>      

          <div className="grid grid-rows-3 gap-0.5 items-center">
              <label className={labelPill}>
                Project Manager (PM)
              </label>
              <input
                className={inputBox}
                name="pm"
                value={form.pm}
                onChange={handleChange}
                placeholder="PM name"
              />
          </div>

          {/* Band */}
          <div className="grid grid-rows-3 gap-0.5 items-center">
            <label className={labelPill}>
              Band
            </label>
            <input
              className={inputBox}
              name="band"
              value={form.band}
              onChange={handleChange}
              placeholder="e.g., B2"
            />
          </div>

          {/* P1 Age */}
          <div className="grid grid-rows-3 gap-0.5 items-center">
            <label className={labelPill}>
              P1 Age
            </label>
            <input
              className={inputBox}
              name="p1Age"
              value={form.p1Age}
              onChange={handleChange}
              placeholder="e.g., 12 days"
            />
          </div>

          {/* Current Profile Shared */}
          <div className="grid grid-rows-3 gap-0.5 items-center">
            <label className={labelPill}>
              Current Profile Shared
            </label>
            <input
              className={inputBox}
              name="currentProfileShared"
              type="number"
              min={0}
              value={form.currentProfileShared}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          {/* External/Internal */}
          <div className="grid grid-rows-3 gap-0.5 items-center">
            <label className={labelPill}>
              External/Internal
            </label>
            <select className={inputBox} value={form.externalInternal} onChange={(e) =>setForm({...form,externalInternal: e.target.value})}>
              <option value="">External/Internal</option>
              {options.externalInternal.map((o) => (
                <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
            </select>
          </div>

          {/* Status */}
          <div className="grid grid-rows-3 gap-0.5 items-center">
            <label className={labelPill}>
              Status
            </label>
             <select className={inputBox} value={form.status} onChange={(e) =>setForm({...form,status: e.target.value})}>
              <option value="">Select Status</option>
              {options.status.map((o) => (
                <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
            </select>
          </div>

          {/* PMO SPOC */}
          <div className="grid grid-rows-3 gap-0.5 items-center">
            <label className={labelPill}>
              PMO SPOC
            </label>
            <select className={inputBox} value={form.pmoSpoc} onChange={(e) =>setForm({...form,pmoSpoc: e.target.value})}>
              <option value="">Pmo Spoc</option>
              {options.pmoSpoc.map((o) => (
                <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
            </select>
          </div>
        </div>

        <button type="submit" className=" bg-gray-800 rounded-md text-white py-2 px-10 font-medium tracking-wide hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400" disabled={loading}>
          
        {loading ? (
            <>
              <LoadingOutlined style={{ marginRight: 8 }} />
              Generating…
            </>
          ) : (
            'Generate Demand IDs'
          )}

        </button>
      </form>
      <footer className="mt-6 text-center text-sm text-black">
        © Coforge, 2026 | Confidential
      </footer>
    </>
  );
};
