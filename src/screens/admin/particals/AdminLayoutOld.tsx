import { Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavBar";
import AdminSidebar from "./AdminSidebar";
import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminLayout = () => {
  const [auth, setAuth] = useState({ user: null, token: "" });
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  const logout = () => {
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleContentClick = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  return (
    <div className="wrapper">
      {/* Preloader
      <div className="preloader flex-column justify-content-center align-items-center">
        <img
          className="animation__shake"
          src="/img/excelytech-favicon.png"
          alt="excelytech-logo"
          height={60}
          width={60}
        />
      </div> */}
      {/* <AdminNavbar /> */}
      <AdminSidebar />
      <div className="content">
        <Outlet />
      </div>
      {/* Control Sidebar */}
      <aside className="control-sidebar control-sidebar-dark">
        {/* Control sidebar content goes here */}
      </aside>
      {/* /.control-sidebar */}
    </div>
  );
};

export default AdminLayout;
