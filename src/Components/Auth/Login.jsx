import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";


export default function Login(props) {
const[userid,setUserid] = useState("");
const[password,setPassword]=useState("");
const [error, setError] = useState(null);
const navigate = useNavigate();
const submitHandler =(e) =>{
        e.preventDefault()
        handleLogin(userid,password)
        setUserid("")
        setPassword("")
        console.log(userid,password);
    }

    const handleLogin=(userid,password)=>{
      if(userid=="dev@coforge.com" && password=="1234"){
        props.setUserRole("dev");
        navigate("/DashBoard");
      }
      else if(userid=="dm@coforge.com" && password=="1234"){
          props.setUserRole("Delivery Manager");
          navigate("/DashBoard");
          }
      else if(userid=="pmo@coforge.com" && password=="1234"){
          props.setUserRole("PMO");
          navigate("/DashBoard");
          }
      else{
        alert("Invalid Credentials")
      }
    }
   return (
    <div className="flex flex-col items-center justify-center bg-gray-100">
        <div className="flex flex-col justify-center px-8 py-8 w-fit">
          <div className="text-center mb-12">
            <div className="mb-2">
              <span className="text-3xl font-bold">
                <span className="text-orange-500">Co</span>
                <span className="text-gray-800">forge Limited</span>
              </span>
            </div>
            <div>
              <span className="text-2xl font-semibold">
                <span className="text-red-500 text-3xl">HSBC </span><br></br>
                <span className="text-grey-500">Demand Management System</span>
              </span>
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
                <form onSubmit={(e)=>{submitHandler(e)}} className="flex bg-gray-800 text-white  items-center justify-center rounded-l border-2 px-3 py-3 w-120">
                           <div className=" flex flex-col items-center justify-center">
                           <div className="flex items-center gap-3 pt-10 ">
                               <label className="text-sm  font-semibold w-24 whitespace-nowrap">USER ID :</label>
                             <input value={userid} onChange={(e)=>{setUserid(e.target.value)}} type="email" required className="w-48 px-3 py-2 text-sm text-gray-900 bg-white border-2 border-sky-400 rounded-l focus:outline-none focus:border-sky-500" id="exampleInputUserid" placeholder='Enter your UserId'/>
                           </div><br></br>
                         <div className="flex items-center gap-3">
                             <label className="text-sm font-semibold w-24 whitespace-nowrap">PASSWORD :</label>
                             <input value={password} onChange={(e)=>{setPassword(e.target.value)}}type="password" required className="w-48 px-3 py-2 text-sm text-gray-900 bg-white border-2 border-sky-400 rounded-l focus:outline-none focus:border-sky-500" id="exampleInputPassword" placeholder="Enter password" />
                         </div>
                         <div className="flex ">
                         <button type="submit" className="px-10 py-2 bg-green-600 cursor-pointer text-black text-sm rounded-md font-medium hover:bg-green-700 hover:text-white focus:border-black border-2  transition m-8">Login</button>
                         </div>
                         </div>
                     </form>
            </div>
          </div>
        </div>
                <footer className="text-center text-sm text-black">
                  © Coforge, 2026 | Confidential
                </footer>
      </div>
//     </div>

  );
}