// import { useState, useContext, useEffect, createContext } from "react";
// const AuthContext = createContext();

// const AuthProvider = ({ children }) => {
//   const [auth, setAuth] = useState({ user: null, token: "" });
//   useEffect(() => {
//     const localAuth = localStorage.getItem("auth");
//     const localToken = localStorage.getItem("token");
//     if (localAuth) {
//       const parselocalAuth = JSON.parse(localAuth);
//       if (parselocalAuth) {
//         setAuth({ user: parselocalAuth, token: localToken });
//       }
//     }
//   }, []);
//   useEffect(() => {
//     console.log("auth-one", auth);
//   }, [auth]);

//   return (
//     <AuthContext.Provider value={[auth, setAuth]}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
// //custom Hook
// const useAuth = () => useContext(AuthContext);
// export { useAuth, AuthProvider };
import { useState, useContext, useEffect, createContext } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
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
