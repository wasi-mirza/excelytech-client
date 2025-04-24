import { useState, useContext, useEffect, createContext } from "react";
import React, { Dispatch, SetStateAction } from "react";

type AuthType = { user: any; token: string };
type AuthContextType = [AuthType, Dispatch<SetStateAction<AuthType>>];

const AuthContext = createContext<AuthContextType>([{ user: null, token: "" }, () => {}]);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize auth state from localStorage
  const initialAuth = () => {
    const localAuth = localStorage.getItem("auth");
    const localToken = localStorage.getItem("token");

    if (localAuth && localToken) {
      return { user: JSON.parse(localAuth), token: localToken };
    }

    return { user: null, token: "" }; // Default state
  };

  const [auth, setAuth] = useState(initialAuth);

  // Sync state with localStorage whenever `auth` changes
  useEffect(() => {
    if (auth.user) {
      localStorage.setItem("auth", JSON.stringify(auth.user));
      localStorage.setItem("token", auth.token);
    } else {
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing auth
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
