
import React from "react";
import { useNavigate } from "react-router-dom";
import {useState} from "react";
import NavBar from "../NavBar.jsx";
export default function RDGTATeam() {
  const navigate = useNavigate();

const [form, setForm] = useState({
    lob: "",
    manager: "",
    skillCluster: "",
    primarySkill: "",
    secondarySkill: "",
    employeeId: "",
    candidateName: "",
    yearsOfExp: "",
    location: "",
    summary: "",
    cv: null,
    dateOfProfileShared: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleAddMore = () => {
    alert("Add More clicked — implement dynamic row addition as needed.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement submit logic (API call etc.)
    console.log("Form submitted:", form);
    alert("Submitted! Check console for payload.");
  };

  const labelClass =
    "text-sm font-medium text-gray-200 mb-1";
  const fieldClass =
    "w-full rounded-md bg-[#0c2f53] text-gray-100 placeholder-gray-400 border border-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 outline-none px-3 py-2 transition";

  return (
      <>
      <NavBar />
    <div className="min-h-screen bg-[#082340] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Form cards */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* Left column - labels styled like original green buttons (now gray theme) */}
          <div className="space-y-4">

{/*             <Field label="Practise"></span> */}
{/*             <select className={fieldClass} value={form.demandLocation} onChange={(e) => setForm({...form,demandLocation: e.target.value})}> */}
{/*               <option value="">Select Practise</option> */}
{/*               {options.lob.map((o) => ( */}
{/*                 <option key={String(o.value)} value={String(o.value)}> */}
{/*                   {o.label} */}
{/*                 </option> */}
{/*               ))} */}
{/*             </select> */}

            <Field label="Primary Skills">
              <input
                name="primarySkill"
                value={form.primarySkill}
                onChange={handleChange}
                className={fieldClass}
                placeholder="e.g., Mobile Testing"
              />
            </Field>

            <Field label="Secondary Skills">
              <input
                name="secondarySkill"
                value={form.secondarySkill}
                onChange={handleChange}
                className={fieldClass}
                placeholder="e.g., API"
              />
            </Field>

            <Field label="Employee ID">
              <input
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                className={fieldClass}
                placeholder="Employee ID"
              />
            </Field>

            <Field label="Name of the candidate">
              <input
                name="candidateName"
                value={form.candidateName}
                onChange={handleChange}
                className={fieldClass}
                placeholder="Candidate Name"
              />
            </Field>

            <Field label="Year of experience">
              <input
                type="number"
                name="yearsOfExp"
                value={form.yearsOfExp}
                onChange={handleChange}
                className={fieldClass}
                placeholder="Years"
                min={0}
              />
            </Field>

            <Field label="Location">
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className={fieldClass}
                placeholder="City, Country"
              />
            </Field>

            <Field label="Brief Summary of candidate">
              <textarea
                name="summary"
                value={form.summary}
                onChange={handleChange}
                className={`${fieldClass} min-h-[96px]`}
                placeholder="Write a concise summary..."
              />
            </Field>

            <Field label="Attach CV">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                name="cv"
                onChange={handleChange}
                className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-orange-600 file:text-white
                           hover:file:bg-orange-500 transition"
              />
              {form.cv && (
                <p className="mt-2 text-gray-300 text-xs">
                  Selected: <span className="font-medium">{form.cv.name}</span>
                </p>
              )}
            </Field>
          </div>

          {/* Right column - helper panel */}
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-700 bg-[#0c2f53] p-4 shadow-lg">
              <h3 className="text-lg font-semibold">Guidelines</h3>
              <ul className="mt-2 list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Keep summaries crisp (2–3 lines).</li>
                <li>Use primary & secondary skills consistently.</li>
                <li>Attach the latest CV in PDF or DOCX.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-700 bg-[#0c2f53] p-4 shadow-lg">
              <h3 className="text-lg font-semibold">Status</h3>
              <p className="text-gray-300 text-sm mt-1">
                Fill in mandatory fields and click <span className="font-medium">Submit</span>.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddMore}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 rounded-md shadow transition"
                >
                  Add More
                </button>
                <button
                  type="submit"
                  className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 rounded-md shadow transition"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </form>

      </div>
    </div>
    </>
  );
}

/** ---------- Helper Components ---------- */
function Field({ label, children }) {
  return (
    <div className="group">
      <div className="flex items-center gap-3">
        <div
          className="select-none min-w-[180px] rounded-md bg-gray-600/90 text-gray-100 px-4 py-2
                     shadow-sm group-hover:shadow-md group-hover:bg-gray-500 transition"
        >
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>

  );
}
