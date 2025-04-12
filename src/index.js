import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider } from "./context/AuthContext.jsx";

// Components
import App from "./App";

// Styles
import "./index.css";

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong.</h1>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create root
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render app
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
