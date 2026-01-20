import { createContext,useContext ,useEffect,useState} from "react";

const AuthContext=createContext();


export default function AuthProvider({children}){
    const [isAuthenticated,setIsAuthenticated]=useState(!!localStorage.getItem("token"));

    useEffect(()=>{
        const token=localStorage.getItem("token");
        if(token){
            setIsAuthenticated(true);
        }
    },[])

    
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