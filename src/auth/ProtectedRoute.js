// src/components/ProtectedRoute.js
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Outlet, Navigate } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
  const { auth } = useAuth();

  // If the user is not logged in, redirect to the login page
  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  // If the user's role does not match, redirect to the correct dashboard
  if (auth.user.role !== role) {
    return (
      <Navigate
        to={auth.user.role === "admin" ? "/admin-dashboard" : "/user-dashboard"}
        replace
      />
    );
  }
};

export default ProtectedRoute;
