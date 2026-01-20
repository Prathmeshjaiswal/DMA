import { createContext,useContext ,useEffect,useState} from "react";

const AuthContext=createContext();


export default function AuthProvider({children}){
    const [isAuthenticated,setIsAuthenticated]=useState(false);


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