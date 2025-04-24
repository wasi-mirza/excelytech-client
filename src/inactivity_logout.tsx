import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // adjust path as needed
import toast from "react-hot-toast";
import { ROUTES } from "./shared/utils/routes"; // adjust path as needed

const InactivityLogout = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  const handleLogout = () => {
    localStorage.clear(); // or localStorage.removeItem('token') and localStorage.removeItem('auth')
    setAuth({ user: null, token: "" });
    toast.success("Logged out due to inactivity");
    navigate(ROUTES.AUTH.LOGIN);
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(handleLogout, inactivityTime);
  };

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []); // Removed unnecessary dependencies

  return null; // This component doesn't render anything
};

export default InactivityLogout;
