import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";

export default function ProfileMenu({ onProfile, onLogout }) {

    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
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

            <div
                onClick={() => setOpen(!open)}
                className="w-10 h-10 rounded-full bg-[#F15B40] text-white flex items-center justify-center cursor-pointer font-bold"
            >
                <UserOutlined className="text-white text-lg" />
            </div>

            {/* arrow */}
            <button
                onClick={() => setOpen(!open)}
                className="text-white text-xs"
            >
                ▼
            </button>

            {open && (
                <div className="absolute right-0 top-11 w-44 bg-white border rounded shadow z-50 text-sm">
                     <button
                         onClick={() => {navigate("/UserManagement")}}
                         className="w-full px-4 py-2 text-left hover:bg-gray-100 text-green-600 font-medium"
                     >
                         User Management
                     </button>
                    <button
                        onClick={() => {navigate("/rolemanagement")}}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-yellow-600 font-medium"
                    >
                        Roles Management
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