import { createContext,useContext ,useEffect,useState} from "react";

const AuthContext=createContext();


export default function AuthProvider({children}){
    const [isAuthenticated,setIsAuthenticated]=useState(false);

    //auto login on refresh if token exists
    // useEffect(()=>{
    //     const token =localStorage.getItem("token")
    //     if(token && token !=="undefined" && token !==""){
    //         setIsAuthenticated(true);
    //     }else{
    //         setIsAuthenticated(false);
    //     }
    // },[]);

    return(
        <AuthContext.Provider 
        value={{isAuthenticated,setIsAuthenticated}}
        >
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth =()=>
    useContext(AuthContext);