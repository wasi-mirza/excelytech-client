import React, { useEffect, useState } from "react";
import UserSidebar from "./UserSidebar";
import { Outlet } from "react-router-dom";
import UserNavbar from "./UserNavbar";
// import UserNavbar from "./UserNavbar";

interface UserSidebarProps {
  isOpen: boolean;  
  toggleSidebar: () => void;
}

function UserLayout() {
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = screenSize < 992;

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
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

      <UserNavbar />
      <UserSidebar isOpen={isSidebarVisible} toggleSidebar={toggleSidebar} />
      <div className="content">
        <Outlet />
      </div>
      {/* Control Sidebar */}
      <aside className="control-sidebar control-sidebar-dark">
        {/* Control sidebar content goes here */}
      </aside>
      {/* /.control-sidebar */}
    </div>
    //     <div className="wrapper">
    //       {/* Main Header */}
    //       {/* <nav className="main-header navbar navbar-expand navbar-light">

    //         {isMobile && (
    //           <button
    //             className="btn btn-success ml-2"
    //             onClick={toggleSidebar}
    //           >
    //             <i className="fas fa-bars"></i>
    //           </button>
    //         )}
    //         <ul className="navbar-nav ml-auto">
    //           <li className="nav-item">
    //             <a className="nav-link" href="#">
    //               <i className="fas fa-user-circle"></i>
    //             </a>
    //           </li>
    //         </ul>
    //       </nav> */}
    // {/* <UserNavbar/> */}
    //       {/* Sidebar */}
    //       <aside
    //         className={`main-sidebar sidebar-dark-primary elevation-4 ${
    //           isMobile && !isSidebarVisible ? "d-none" : ""
    //         }`}
    //       >
    //         {/* Brand Logo */}
    //         {/* <a href="/" className="brand-link">
    //           <img
    //             src="/img/logo.png" // Replace with your logo
    //             alt="Logo"
    //             className="brand-image img-circle elevation-3"
    //             style={{ opacity: ".8" }}
    //           />
    //           <span className="brand-text font-weight-dark">User Panel</span>
    //         </a> */}

    //         {/* Sidebar Content */}
    //         <div className="sidebar">
    //           <UserSidebar />
    //         </div>
    //       </aside>

    //       {/* Content Wrapper */}
    //       <div className="wrapper">
    //         <section className="content">
    //           <div className="container-fluid">
    //             <Outlet />
    //           </div>
    //         </section>
    //       </div>

    //       {/* Footer */}
    //       {/* <footer className="main-footer">
    //         <strong>
    //           Copyright &copy; 2024 <a href="#">Your Company</a>.
    //         </strong>
    //         All rights reserved.
    //         <div className="float-right d-none d-sm-inline-block">
    //           <b>Version</b> 1.0.0
    //         </div>
    //       </footer> */}
    //     </div>
  );
}

export default UserLayout;
