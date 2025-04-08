import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { AuthProvider } from "./context/AuthContext.jsx";

import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster></Toaster>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
