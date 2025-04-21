import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function UserNavbar() {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    setAuth({ user: null, token: "" });
    toast.success("Logout Successfully");
    navigate("/login");
  };

  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      {/*Menu Sign to toggle the sidebar*/}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" data-widget="pushmenu" href="#" role="button">
            <i className="fas fa-bars" />
          </a>
        </li>
      </ul>
    </nav>
    // <nav className="main-header navbar navbar-expand navbar-white navbar-light">
    //   {/* Left navbar links */}
    //   <ul className="navbar-nav">
    //     <li className="nav-item">
    //       {/* Sidebar Toggle Button */}
    //       <button
    //         className="nav-link d-md-none d-xd-none"
    //         onClick={() => document.body.classList.toggle("sidebar-open")}
    //         role="button"
    //       >
    //         <i className="fas fa-bars"></i>
    //       </button>
    //     </li>
    //     <a href="index3.html" className="brand-link">
    //       <img
    //         src="/img/excelytech-logo.png"
    //         alt="excelytech-logo"
    //         className="brand-image"
    //       />
    //     </a>
    //   </ul>

    //   {/* Right navbar links */}
    //   <ul className="navbar-nav ml-auto">
    //     <li className="nav-item">
    //       {/* User Dropdown Menu */}
    //       <a
    //         className="nav-link"
    //         data-toggle="dropdown"
    //         href="#"
    //         role="button"
    //         aria-expanded="false"
    //       >
    //         <i className="fas fa-user"></i> {auth?.user?.name || "Admin"}
    //       </a>
    //       <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
    //         {/* <a href="#" className="dropdown-item">
    //           <i className="fas fa-cogs mr-2"></i> Settings
    //         </a>
    //         <a href="#" className="dropdown-item">
    //           <i className="fas fa-lock mr-2"></i> Lock Account
    //         </a>
    //         <div className="dropdown-divider"></div> */}
    //         <button
    //           className="dropdown-item text-danger"
    //           onClick={handleLogout}
    //         >
    //           <i className="fas fa-sign-out-alt mr-2"></i> Logout
    //         </button>
    //       </div>
    //     </li>
    //   </ul>
    // </nav>
  );
}
export default UserNavbar;
