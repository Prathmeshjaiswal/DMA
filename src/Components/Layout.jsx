// import React from "react";
// import NavBar from "./NavBar";
// import Footer from "./Footer";
//
//
//
// export default function Layout({ children }) {
//   return (
//     <div className="flex flex-col max-h-screen">
//         <NavBar/>
//         <main className="flex-grow">
//             {children}
//         </main>
//         <Footer/>
//
//     </div>
//
//   );
// }


// Layout.jsx
import React, { useState } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import Sliderbar from "./Sliderbar"; // ensure file name matches (not "Sliderbar")

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const SIDEBAR_WIDTH = 256; // must match Sidebar width prop

  return (
    <div className="h-full">
      {/* Top bar */}
      <NavBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        onCloseSidebar={() => setSidebarOpen(false)}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
      />

      {/* Sidebar */}
      <Sliderbar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={SIDEBAR_WIDTH}
      />

      {/* Push content when sidebar is open */}
      <main
        className="transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
        }}
      >
        {/* Your routed pages */}
        <div className="flex flex-col "> {/* account for navbar height */}
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}