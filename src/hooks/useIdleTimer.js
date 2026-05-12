import { useEffect, useRef, useState } from "react";
import api from "../Components/api/client";
import { logout } from "../Components/api/logout";

//  CONFIG (production values)
const WARNING_TIME = 40 * 60 * 1000;  // 10 minutes idle → show popup
const LOGOUT_TIME = 45 * 60 * 1000;  // 15 minutes idle → logout

export default function useIdleTimer() {
    const lastActivityRef = useRef(Date.now());
    const intervalRef = useRef(null);
    const hasLoggedOutRef = useRef(false);
    const isLoggedOutRef = useRef(false);


    const [showWarning, setShowWarning] = useState(false);

    //  Record user activity (working state)
    // const recordActivity = () => {
    //     lastActivityRef.current = Date.now();
    //     hasLoggedOutRef.current = false;   // ✅ reset logout eligibility

    //     if (showWarning) {
    //         setShowWarning(false);
    //     }
    // };

    
const recordActivity = () => {
  if (showWarning || isLoggedOutRef.current) return;

  lastActivityRef.current = Date.now();
  hasLoggedOutRef.current = false;
};


    // User clicked "Continue"
    const continueSession = async () => {
        try {
            // Optional but recommended: refresh token
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                const res = await api.post("/auth_user/refresh", { refreshToken });
                if (res?.data?.token) {
                    localStorage.setItem("token", res.data.token);
                }
            }
        } catch (e) {
            await logout();
            return;
        }

        lastActivityRef.current = Date.now();
        hasLoggedOutRef.current = false;    //  VERY IMPORTANT
        setShowWarning(false);

    };

    useEffect(() => {
        const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
        events.forEach(e => window.addEventListener(e, recordActivity));

        //  Check idle state every second
        intervalRef.current = setInterval(() => {
            const idleTime = Date.now() - lastActivityRef.current;

            // Logout condition

            if (idleTime >= LOGOUT_TIME && !hasLoggedOutRef.current) {
                hasLoggedOutRef.current = true;
                isLoggedOutRef.current = true;

                setShowWarning(false); //  close modal
                logout();
                return;
            }



            //  Warning condition (only once)
            if (idleTime >= WARNING_TIME && !showWarning) {
                setShowWarning(true);
            }
        }, 1000);

        return () => {
            events.forEach(e => window.removeEventListener(e, recordActivity));
            clearInterval(intervalRef.current);
        };
    }, [showWarning]);

    return { showWarning, continueSession };
}
