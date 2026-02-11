
// Layout.jsx
import React, { useState } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import Sliderbar from "./Sliderbar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const SIDEBAR_WIDTH = 256; // must match Sidebar width prop

  return (
    // Full viewport height + vertical flex
    <div className="min-h-dvh flex flex-col">
      {/* Fixed top bar */}
      <NavBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        onCloseSidebar={() => setSidebarOpen(false)}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
      />

      {/* Sidebar (overlay or pushed) */}
      <Sliderbar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={SIDEBAR_WIDTH}
      />

      {/* Spacer already in NavBar: <div className="h-14" /> so content won't go under fixed header */}

      {/* Content area: grows to fill space; pushes footer down */}
      <main
        className="flex-1 transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {children}
        </div>
      </main>

      {/* Footer: mt-auto ensures it sticks to bottom when content is short */}
      <div
        className="transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0 }}
      >
        <Footer />
      </div>
    </div>
  );
}