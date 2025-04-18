import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { ROUTES } from "../../shared/utils/routes.js";
import axios from "axios";

function UserSidebar() {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ip, setIp] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");

  useEffect(() => {
    // Get IP Address
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => setIp(data.ip))
      .catch((error) => console.error("Error fetching IP:", error));

    // Get Browser Information
    const getBrowserInfo = () => {
      setBrowserInfo(navigator.userAgent);
    };

    getBrowserInfo();
  }, []);

  const checkTokenExpiration = () => {
    console.log("Checking token expiration...");
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded token:", decodedToken);
        const currentTime = Date.now() / 1000; // Current time in seconds
        const localTime = new Date(currentTime * 1000).toLocaleString();

        console.log("Current time (seconds):", currentTime);
        console.log("Local time:", localTime);

        // Print the expiry time from the token
        const expiryTime = decodedToken.exp;
        console.log("Token expiry time (seconds since epoch):", expiryTime);

        // Convert expiry time to a human-readable date/time string
        const expiryDate = new Date(expiryTime * 1000); // Multiply by 1000 to convert seconds to milliseconds

        const formattedExpiryDate = expiryDate
          .toLocaleDateString("en-CA", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, //add this line to ensure the time is properly parsed
          })
          .replace(",", ""); // Remove the comma

        console.log("Token expiry date/time:", formattedExpiryDate);

        if (decodedToken.exp < currentTime) {
          console.log("Token has expired!");
          handleLogout();
        } else {
          console.log("Token is still valid.");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        handleLogout(); // Or some other error handling
      }
    } else {
      console.log("No token found in localStorage.");
    }
  };

  useEffect(() => {
    console.log("Component mounted, setting up token expiration check."); // Added print statement
    checkTokenExpiration();
    const intervalId = setInterval(checkTokenExpiration, 1000 * 60 * 2);
    console.log("Interval ID:", intervalId); // Added print statement
    return () => {
      console.log("Component unmounted, clearing interval."); // Added print statement
      clearInterval(intervalId);
    };
  }, []);

  const handleLogout = () => {
    console.log("Logging out user...");
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    setAuth({ user: null, token: "" }, () => {
      // THIS IS THE KEY CHANGE: Use the callback to ensure navigation happens after state update
      toast.success("Logout successfully");
      navigate(ROUTES.AUTH.LOGIN);
    });
  };

  // Handle window resize to determine mobile screen size
  const handleResize = () => {
    setIsMobile(window.innerWidth < 400); // Update threshold for mobile view (< 400px)
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <aside
      className={`main-sidebar sidebar-light-olive elevation-4 d-flex flex-column ${
        isSidebarOpen ? "d-block" : "d-none"
      } ${isMobile ? "sidebar-mobile" : "d-md-flex"}`}
      style={{ height: "100vh", position: "fixed", zIndex: 999 }}
    >
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          className="btn btn-success d-block d-md-none m-3"
          type="button"
          onClick={toggleSidebar}
        >
          <i className="fas fa-bars"></i> {/* Hamburger Icon */}
        </button>
      )}

      {/* Brand Logo */}
      <a href="#" className="brand-link text-dark">
        <img
          src="/img/excelytech-logo.png"
          alt="excelytech-logo"
          className="brand-image"
        />
      </a>

      <div className="sidebar flex-grow-1">
        {/* Sidebar user panel */}
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="info">
            <NavLink to={"clientprofile"} className="d-block text-dark">
              <strong>{auth?.user?.name || "Welcome Client"}</strong>
            </NavLink>
          </div>
        </div>

        <nav className="mt-2">
          <ul
            className="nav nav-pills nav-sidebar flex-column text-dark"
            data-widget="treeview"
            role="menu"
            data-accordion="false"
          >
            <li className="nav-item">
              <NavLink
                to={ROUTES.USER.HOME}
                className={({ isActive }) =>
                  isActive ? "nav-link active text-light" : "nav-link text-dark"
                }
              >
                <i className="nav-icon fas fa-tachometer-alt"></i>
                <p>Dashboard</p>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to={ROUTES.USER.SUBSCRIPTIONS}
                className={({ isActive }) =>
                  isActive ? "nav-link active text-light" : "nav-link text-dark"
                }
              >
                <i className="nav-icon fas fa-calendar-check"></i>
                <p>My Subscriptions</p>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to={ROUTES.USER.SERVICE_DESK}
                className={({ isActive }) =>
                  isActive ? "nav-link active text-light" : "nav-link text-dark"
                }
              >
                <i className="nav-icon fas fa-headset"></i>
                <p>Service Desk</p>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to={ROUTES.USER.PAY_METHOD}
                className={({ isActive }) =>
                  isActive ? "nav-link active text-light" : "nav-link text-dark"
                }
              >
                <i className="nav-icon fas fa-credit-card"></i>
                <p>Payment Method</p>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to={ROUTES.USER.USER_CHATS}
                className={({ isActive }) =>
                  isActive ? "nav-link active text-light" : "nav-link text-dark"
                }
              >
                <i className="nav-icon fas fa-credit-card"></i>
                <p>Chats</p>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="logout-section">
        <li className="nav-item mt-auto">
          <button
            className="btn btn-danger w-100 px-2"
            onClick={handleLogout}
            style={{ color: "black" }} // Ensure text color is black
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="18"
              fill="currentColor"
              className="bi bi-box-arrow-right"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
              />
              <path
                fillRule="evenodd"
                d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
              />
            </svg>
            Logout
          </button>
        </li>
      </div>
    </aside>
  );
}

export default UserSidebar;
