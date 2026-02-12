import React, { useState } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import Sliderbar from "./Sliderbar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const SIDEBAR_WIDTH = 256;

  return (
    <div className="h-full">
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

      <main
        className="transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
        }}
      >

        <div className="flex flex-col ">
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}