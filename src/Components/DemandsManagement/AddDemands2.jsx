import {useState,useEffect,useRef} from "react"
// import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar.jsx"
import DashBoard from "./DashBoard.jsx"
export default function AddDemands2(){
 const navigate = useNavigate();
  const ROWS = 6;


  const [demands, setDemands] = useState(
    Array.from({ length: ROWS }, (_, i) => ({
      demandId: `DMD-${1001 + i}`,
      rrNo: "",
    }))
  );

  const handleRRChange = (index, value) => {
    setDemands((prev) => {
      const next = [...prev];
      next[index].rrNo = value;
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Do something with demands, e.g., send to API
    console.log("Submitting:", demands);
    alert("Submitted! Check console.");
          navigate("/DashBoard");
  };

const cxButtonGreen = "rounded-md bg-[#8FA58A] text-white px-4 py-2 border border-[#52624E] shadow-sm";
  const cxButtonOrange = "rounded-md bg-orange-700 text-white px-4 py-2 border border-orange-800 shadow-sm";
  const labelPill = "rounded-md bg-[#8FA58A] text-white px-4 py-1 text-sm font-medium border border-[#52624E]";
  const inputBox = "w-full rounded-md border border-[#52624E] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400";


const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTS = ["doc", "pdf"];
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const triggerFileDialog = () => inputRef.current?.click();



  const getExt = (name = "") => {
    const parts = name.trim().toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  };


  const validateFile = (f) => {
    if (!f) return "Please select a file.";
    const ext = getExt(f.name);

    if (!ALLOWED_EXTS.includes(ext)) {
      return "Invalid file type. Allowed only .doc and .pdf";
    }
    if (f.size >= MAX_BYTES) {
      return "File too large. It must be less than 5 MB.";
    }
    return "";
  };


  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    const msg = validateFile(f);
    setError(msg);
    setFile(msg ? null : f);
  };


  const clearFile = () => {
    setFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };



  const onUpload = async () => {
    if (!file) return;
    const msg = validateFile(file);
    if (msg) {
      setError(msg);
      return;
    }

    setUploading(true);
    try {
      // TODO: replace with your API call
      // const formData = new FormData();
      // formData.append("jd", file);
      // const res = await fetch("/api/upload", { method: "POST", body: formData });

      await new Promise((r) => setTimeout(r, 1200)); // simulate upload
      alert(`Uploaded: ${file.name}`);
      clearFile();
    }
    catch (err) {
      setError("Upload failed. Please try again.");
    }
    finally {
      setUploading(false);
    }
};


    return(
        <>
    <NavBar />
    <form onSubmit={handleSubmit} className=" pt-10 pr-10 min-h-screen bg-white flex flex-col">
      <div className="mt-2">
        <hr className="border-gray-300" />
      </div>

      <div className="mx-auto w-full max-w-4xl px-6">
        <div className="mt-2 ml-80 grid grid-cols-[160px_1fr_1fr] items-center gap-4">
          <div className="text-gray-800 font-medium">Demand Id:</div>
          <div className="text-gray-800 font-medium">Enter RR No.</div>
        </div>


        <div className="mt-4 space-y-3">
          {demands.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[160px_1fr_60px_1fr] items-center gap-4">
              <div/>
              <input type="text" value={row.demandId} readOnly className="w-full rounded-md border border-gray-800 bg-white px-3 py-2 text-gray-900 shadow-sm "/>
              <div className="flex items-center justify-center text-gray-500">
                <span className="select-none">↔︎</span>
              </div>
              <input type="text" value={row.rrNo} onChange={(e) => handleRRChange(idx, e.target.value)} placeholder="Enter RR No." className="w-full rounded-md border border-gray-800 bg-white px-3 py-2 text-gray-900 shadow-sm "/>
            </div>
          ))}
        </div>
      </div>

   <div className="w-full px-6 py-4">
      <div className="mx-auto  flex w-4/5 items-center gap-4">
        <button type="button" onClick={triggerFileDialog} className={`w-1/6 h-9 rounded-md bg-[#8FA58A] hover:bg-[#81977C] text-white px-4 py-2 border cxButtonGreen shadow-sm transition-colors`}>Attach JD
        </button>
        <input ref={inputRef} type="file" accept=".doc,.pdf" onChange={onFileChange} className="sr-only" aria-hidden="true"/>
        <div className={` w-4/6 h-9 flex-1 rounded-md bg-[#8FA58A] px-4 py-2 border cxButtonGreen shadow-sm text-white/95 flex items-center justify-between`} role="status" aria-live="polite">
          <span className="truncate"> {file ? file.name : "No file selected"}</span>

          {file && (
            <button type="button" onClick={clearFile} className="ml-3 w-1/6 h-9 rounded text-xs bg-white/20 hover:bg-white/30 text-white">Clear
            </button>
          )}
        </div>

        <button type="button" onClick={onUpload} disabled={!file || uploading} className={`w-1/6 h-9 rounded-md bg-[#8FA58A] hover:bg-[#81977C] text-white px-4 py-2 border border-[#52624E] shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}>
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>

      {error && (
        <div className="mx-auto max-w-5xl mt-2 text-sm text-red-700">
          {error}
        </div>
      )}


      <div className="mx-auto max-w-5xl mt-1 text-xs text-gray-600">
        Allowed file types: <code>.doc</code>, <code>.pdf</code> • Max size: <strong>&lt; 5 MB</strong>
      </div>
    </div>
          <div className="mt-8">
            <div className="mx-auto max-w-4xl px-6 py-3 flex gap-4">
            <button type="button" onClick={()=>navigate("/AddNewDemands")} className="w-1/2 rounded-md bg-gray-800 text-white py-2 font-medium tracking-wide hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-700">Previous
            </button>
              <button type="submit" className="w-1/2 rounded-md bg-gray-800 text-white py-2 font-medium tracking-wide hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-700">Submit
              </button>
            </div>
          </div>
    </form>
</>
);
};