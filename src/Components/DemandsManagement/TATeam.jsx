
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import NavBar from "../NavBar.jsx";



export default function TATeam() {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState(null);



    const profiles = [
    {
      id: 1,
      name: "Prathmesh",
      skill: "Java, React",
      experience: "3 Years",
      location: "Pune",
      email: "p@example.com",
    },
    {
      id: 2,
      name: "Simran",
      skill: "Spring Boot, React",
      experience: "2.5 Years",
      location: "Mumbai",
      email: "simran@example.com",
    },
  ];

  return (
    <>
      <NavBar />
      <div className="flex h-[calc(100vh-64px)]">
  {/* Left Column - Demand ID */}
  <div className="w-2/4 bg-gray-100 border-r p-4 overflow-y-auto">
    <h2 className="font-semibold mb-4">Demand ID</h2>
 
    <ul className="space-y-2">
      <li className="p-2 bg-white rounded shadow cursor-pointer hover:bg-blue-100">
        DMD-01
      </li>
      <li className="p-2 bg-white rounded shadow cursor-pointer hover:bg-blue-100">
        DMD-02
      </li>
      <li className="p-2 bg-white rounded shadow cursor-pointer hover:bg-blue-100">
        DMD-03
      </li>
    </ul>
  </div>
 
  {/* Right Column - Profile */}
  <div className="w-2/4 p-6">
    <h2 className="font-semibold mb-4">Profile</h2>
 
    {/* Profile list */}
        <div className="flex flex-col gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className="bg-white p-4 rounded shadow cursor-pointer hover:bg-blue-50"
            >
              <p className="font-semibold">{profile.name}</p>
              <p className="text-sm text-gray-600">{profile.skill}</p>
            </div>
          ))}
        </div>
 
        {/* Popup inside same container */}
      {selectedProfile && (
  <div className="absolute  right-0  w-1/3 bg-white border-l shadow-lg  p-6 transition-all">
 
    {/* Close button - bottom right */}
    <button
      className="absolute bottom-4 right-4 text-gray-600 hover:text-red-500"
      onClick={() => setSelectedProfile(null)}
    >
    Close
    </button>
 
    <h3 className="text-lg font-semibold mb-4">
      {selectedProfile.name}
    </h3>
 
    <p><b>Skill:</b> {selectedProfile.skill}</p>
    <p><b>Experience:</b> {selectedProfile.experience}</p>
    <p><b>Location:</b> {selectedProfile.location}</p>
    <p><b>Email:</b> {selectedProfile.email}</p>
  </div>
)}
  </div>
</div>




    </>
  );
}


