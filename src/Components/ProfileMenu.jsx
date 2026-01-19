import React,{useState,useRef,useEffect} from "react";


export default function ProfileMenu({userId,onLogout}){

    const[open,setOpen]=useState(false);
    const menuRef=useRef(null);

    //close drop down when click outside
    useEffect(()=>{
        const handleClickOutside=(e)=>{
            if(menuRef.current && !menuRef.current.contains(e.target)){
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return ()=>
        document.removeEventListener("mousedown",handleClickOutside);    
    },[]);



    return(
        <div className="relative" ref={menuRef}>

            {/* profile circle */}
            <div
            onClick={()=>setOpen(!open)}
            className="w-10 h-10 rounded-full bg-[#F15B40] fkex items-center justify-center cursor-pointer font-bold"
            >
                {userId?.charAt(0)?.toUpperCase() || "U"}
            </div>


            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded shadow-lg border">
                    <div className="px-4 py-2 text-sm border-b">
                        User ID: <span className="font-semibold">{userId}</span>
                    </div>
                    <button 
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                    Logout
                    </button>
                </div>
            )}

        </div>
    )

}