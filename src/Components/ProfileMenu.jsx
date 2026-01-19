import React, { useState, useRef, useEffect } from "react";


export default function ProfileMenu({ userId, onLogout }) {

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
        <div className="relative" ref={menuRef}>

            {/* profile circle */}
            <div
                onClick={() => setOpen(!open)}
                className="w-10 h-10 rounded-full bg-[#F15B40] text-white flex items-center justify-center cursor-pointer font-bold"
            >
                {userId?.charAt(0)?.toUpperCase()}
            </div>


            {/* dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border text-sm overflow-hidden">

                    {/* User Info */}
                    <div className=" px-4 py-2 border-b">
                        <span className="font-semibold text-gray-800">User Id:</span>{" "}
                        <span className="text-gray-700">
                            {userId}
                        </span>

                    </div>

                    {/* Logout */}
                    <button
                        onClick={onLogout}
                        className="w-full flex justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 font-medium"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );

}