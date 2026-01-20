import React from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";



export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
        <NavBar/>
        <main className="flex-grow">
            {children}
        </main>
        <Footer/>

    </div>
  
  );
}
