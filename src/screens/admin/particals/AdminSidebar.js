import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../../utils/endPointNames";
import AuthService from "../../utils/authService";
import {
  ALL_EMAILTEMPLATES,
  ALL_PRODUCTS,
  ALL_PROPOSALS,
  CATEGORYS,
  LOGIN,
  PROPOSAL_TEMPLATES,
} from "../../utils/routeNames";

const AdminSidebar = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null); // Track which menu is expanded
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

  // const checkTokenExpiration = () => {
  //   console.log("Checking token expiration...");
  //   const token = localStorage.getItem("token");
  //   console.log("Token from localStorage:", token);
  //   if (token) {
  //     try {
  //       const decodedToken = jwtDecode(token);
  //       console.log("Decoded token:", decodedToken);
  //       const currentTime = Date.now() / 1000; // Current time in seconds
  //       const localTime = new Date(currentTime * 1000).toLocaleString();

  //       console.log("Current time (seconds):", currentTime);
  //       console.log("Local time:", localTime);

  //       // Print the expiry time from the token
  //       const expiryTime = decodedToken.exp;
  //       console.log("Token expiry time (seconds since epoch):", expiryTime);

  //       // Convert expiry time to a human-readable date/time string
  //       const expiryDate = new Date(expiryTime * 1000); // Multiply by 1000 to convert seconds to milliseconds

  //       const formattedExpiryDate = expiryDate
  //         .toLocaleDateString("en-CA", {
  //           year: "numeric",
  //           month: "short",
  //           day: "numeric",
  //           hour: "2-digit",
  //           minute: "2-digit",
  //           second: "2-digit",
  //           hour12: true,
  //           timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, //add this line to ensure the time is properly parsed
  //         })
  //         .replace(",", ""); // Remove the comma

  //       console.log("Token expiry date/time:", formattedExpiryDate);

  //       if (decodedToken.exp < currentTime) {
  //         console.log("Token has expired!");
  //         handleLogout();
  //       } else {
  //         console.log("Token is still valid.");
  //       }
  //     } catch (error) {
  //       console.error("Error decoding token:", error);
  //       handleLogout(); // Or some other error handling
  //     }
  //   } else {
  //     console.log("No token found in localStorage.");
  //   }
  // };

  // useEffect(() => {
  //   console.log("Component mounted, setting up token expiration check."); // Added print statement
  //   checkTokenExpiration();
  //   const intervalId = setInterval(checkTokenExpiration, 1000 * 60 * 2);
  //   console.log("Interval ID:", intervalId); // Added print statement
  //   return () => {
  //     console.log("Component unmounted, clearing interval."); // Added print statement
  //     clearInterval(intervalId);
  //   };
  // }, []);

  const authService = new AuthService(setAuth, navigate);
  useEffect(() => {
    authService.startTokenCheck(); // Start checking token expiration

    return () => {
      authService.stopTokenCheck(); // Cleanup on unmount
    };
  }, [setAuth, navigate]);
  const handleLogout = () => {
    authService.handleLogout();
  };
  useEffect(() => {
    if (!auth.user) {
      navigate(LOGIN); // Redirect when user is logged out
    }
  }, [auth.user]); // Runs when auth.user changes

  const toggleSidebar = () => {
    // setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMenu = (menu) => {
    setExpandedMenu(menu);
  };

  return (
    <>
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a
              className="nav-link"
              data-widget="pushmenu"
              href="#"
              role="button"
            >
              <i className="fas fa-bars" />
            </a>
          </li>
        </ul>
      </nav>
      <aside
        className={`main-sidebar sidebar-light-olive elevation-4 d-flex flex-column`}
        style={{ height: "100vh", position: "fixed", zIndex: 999 }}
      >
        <a href="#" className="brand-link">
          <img
            src="/img/excelytech-logo.png"
            alt="excelytech-logo"
            className="brand-image"
          />
        </a>

        <div className="sidebar flex-grow-1">
          <div className="user-panel mt-3 pb-3 mb-3 d-flex">
            <div className="info">
              <a href="#" className="d-block">
                {auth?.user?.name ?? "Admin"}
              </a>
            </div>
          </div>

          <nav className="mt-2">
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              data-widget="treeview"
              role="menu"
              data-accordion="false"
            >
              {/* Dashboard */}
              <li className="nav-item">
                <NavLink
                  to="/home"
                  className="nav-link"
                  onClick={() => {
                    toggleMenu(null);
                  }}
                >
                  <i className="nav-icon fas fa-tachometer-alt"></i>
                  <p>Dashboard</p>
                </NavLink>
              </li>

              {/* Account Centre */}
              <li className="nav-item">
                <NavLink
                  to="allusers"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={() => {
                    toggleMenu(null);
                  }}
                >
                  <i className="nav-icon fas fa-users"></i>
                  <p>Account Centre</p>
                </NavLink>
              </li>

              {/* Product Suite */}
              <li
                className={`nav-item has-treeview ${
                  expandedMenu === "productSuite" ? "menu-open" : ""
                }`}
              >
                <a
                  href={CATEGORYS}
                  className={`nav-link ${
                    expandedMenu === "productSuite" ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMenu("productSuite");
                  }}
                >
                  <i className="nav-icon fas fa-box"></i>
                  <p>
                    Product Suite
                    <i
                      className={`right fas fa-angle-left ${
                        expandedMenu === "productSuite" ? "rotate-90" : ""
                      }`}
                    ></i>
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview ${
                    expandedMenu === "productSuite" ? "" : "d-none"
                  }`}
                >
                  <li className="nav-item">
                    <NavLink
                      to={CATEGORYS}
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                    >
                      <i className="fas fa-th-list nav-icon"></i>
                      <p>Categories</p>
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      to={ALL_PRODUCTS}
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                    >
                      <i className="fas fa-gift nav-icon"></i>
                      <p>Products</p>
                    </NavLink>
                  </li>
                </ul>
              </li>

              {/* subscriptions */}
              <li className="nav-item">
                <NavLink
                  to="subscriptions"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={() => {
                    toggleMenu(null);
                  }}
                >
                  <i className="nav-icon fas fa-shopping-cart"></i>
                  <p>Subscriptions</p>
                </NavLink>
              </li>
              {/* Leads and Marketing */}
              <li
                className={`nav-item has-treeview ${
                  expandedMenu === "leadsAndMarketing" ? "menu-open" : ""
                }`}
              >
                <a
                  href={ALL_PROPOSALS}
                  className={`nav-link ${
                    expandedMenu === "leadsAndMarketing" ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMenu("leadsAndMarketing");
                  }}
                >
                  <i className="nav-icon fas fa-file-signature"></i>
                  <p>
                    Leads and Quotes
                    <i
                      className={`right fas fa-angle-left ${
                        expandedMenu === "leadsAndMarketing" ? "rotate-90" : ""
                      }`}
                    ></i>
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview ${
                    expandedMenu === "leadsAndMarketing" ? "" : "d-none"
                  }`}
                >
                  <li className="nav-item">
                    <NavLink
                      to={ALL_PROPOSALS}
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                    >
                      <i className="fas fa-clipboard-list nav-icon"></i>
                      <p>All Proposals</p>
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      to={PROPOSAL_TEMPLATES}
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                    >
                      <i className="fas fa-file-alt nav-icon"></i>
                      <p>Proposal Templates</p>
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      to={ALL_EMAILTEMPLATES}
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                    >
                      <i className="fas fa-file-alt nav-icon"></i>
                      <p>Email Templates</p>
                    </NavLink>
                  </li>
                </ul>
              </li>

              {/* Service Desk */}
              <li className="nav-item">
                <NavLink
                  to="tickets"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={() => {
                    toggleMenu(null);
                  }}
                >
                  <i className="nav-icon fas fa-ticket-alt"></i>
                  <p>Service Desk</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="chats" className="nav-link">
                  <i className="nav-icon fas fa-shopping-cart"></i>
                  <p>Chat</p>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>

        <div className="logout-section">
          <li className="nav-item mt-auto">
            <button className="btn btn-danger w-100" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </li>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
