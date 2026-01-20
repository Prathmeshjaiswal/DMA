import React, { useState, useRef, useEffect } from "react";


export default function ProfileMenu({ onProfile, onLogout }) {

    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    //close drop down when click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);



    return (
        <div className="relative flex item-center gap-1" ref={menuRef}>

            {/* profile circle */}
            <div
                onClick={() => setOpen(!open)}
                className="w-10 h-10 rounded-full bg-[#F15B40] text-white flex items-center justify-center cursor-pointer font-bold"
            >
                U
            </div>
            {/* arrow */}
            <button
                onClick={() => setOpen(!open)}
                className="text-white text-xs"
            >
                ▼
            </button>


            {/* dropdown */}
            {open && (
                <div className="absolute right-0 top-11 w-44 bg-white border rounded shadow z-50 text-sm">

                    <button
                        onClick={() => {
                            onProfile();     //open profile on same page
                            setOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-blue-600 font-medium"
                    >
                        Profile
                    </button>

                    <div className="border-t" />

                    <button
                        onClick={onLogout}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 font-medium"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}