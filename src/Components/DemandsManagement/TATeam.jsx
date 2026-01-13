
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import NavBar from "../NavBar.jsx";



export default function TATeam() {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState(null);


  // drop profiles
  // const [droppedProfiles, setDroppedProfiles] = useState([]);


   // Demand-wise dropped profiles
  const [demandProfiles, setDemandProfiles] = useState({
    DEM001: [],
    DEM002: [],
    DEM003: [],
  });


//remove profile
  const removeProfileFromDemand = (demandId, profileId) => {
  setDemandProfiles((prev) => ({
    ...prev,
    [demandId]: prev[demandId].filter(
      (p) => p.id !== profileId
    ),
  }));
};


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



  const handleDrop = (e,demandId) => {
    e.preventDefault();
    const profile = JSON.parse(e.dataTransfer.getData("profile"));

       setDemandProfiles((prev) => {
      // prevent duplicates
      if (prev[demandId].some((p) => p.id === profile.id)) {
        return prev;
      }
 
      return {
        ...prev,
        [demandId]: [...prev[demandId], profile],
      };
    });
  };

  return (
    <>
      <NavBar />
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Column - Demand ID */}
        <div className="w-2/4 bg-gray-100 border-r p-4 overflow-y-auto">
         <h2 className="font-semibold mb-4">Demand ID</h2>
          {Object.keys(demandProfiles).map((demandId) => (
          <div
            key={demandId}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, demandId)}
            className="mb-4 bg-white p-3 rounded shadow border border-gray-300"
          >
            <p className="font-semibold mb-2">{demandId}</p>
 
            {demandProfiles[demandId].length === 0 && (
              <p className="text-xs text-gray-400">
                Drag profiles here
              </p>
            )}
 
           {demandProfiles[demandId].map((p) => (
  <div
    key={p.id}
    className="flex items-center justify-between text-sm bg-gray-100 p-1 rounded mt-1"
  >
    <span>{p.name}</span>
 
    <button
      className="text-black-500 hover:text-red-700 text-xs ml-2"
      onClick={() =>
        removeProfileFromDemand(demandId, p.id)
      }
    >
      ✕
    </button>
  </div>
))}
          </div>
        ))}
        </div>

        {/* Right Column - Profile */}
        <div className="w-2/4 p-6 relative">
          <h2 className="font-semibold mb-4">Profiles</h2>

          {/* Profile list */}
          <div className="flex flex-col gap-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData(
                    "profile",
                    JSON.stringify(profile)
                  )
                }
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
            <div className="absolute  right-0  w-2/3 bg-white border-l shadow-lg  p-6 transition-all">

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


