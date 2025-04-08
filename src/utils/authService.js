import { jwtDecode } from "jwt-decode";

class AuthService {
  constructor(setAuth, navigate) {
    this.setAuth = setAuth;
    this.navigate = navigate;
  }

  /** ✅ Check Token Expiration */
  checkTokenExpiration = () => {
    console.log("Checking token expiration...");
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded token:", decodedToken);

        const currentTime = Date.now() / 1000; // Current time in seconds
        console.log("Current time (seconds):", currentTime);

        const expiryTime = decodedToken.exp;
        console.log("Token expiry time:", expiryTime);

        if (expiryTime < currentTime) {
          console.log("Token has expired!");
          this.handleLogout();
        } else {
          console.log("Token is still valid.");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        this.handleLogout(); // Handle invalid token
      }
    } else {
      console.log("No token found in localStorage.");
    }
  };

  /** ✅ Logout User */
  handleLogout = () => {
    // console.log("Logging out user...");
    localStorage.removeItem("auth");
    localStorage.removeItem("token");

    this.setAuth({ user: null, token: "" });
    // this.toast.success("Logout successfully");
    this.navigate("/login");
  };

  /** ✅ Start Token Expiration Check */
  startTokenCheck = () => {
    // console.log("Setting up token expiration check...");
    this.checkTokenExpiration(); // Initial check
    this.intervalId = setInterval(this.checkTokenExpiration, 1000 * 60 * 2);
    // console.log("Interval ID:", this.intervalId);
  };

  /** ✅ Stop Token Expiration Check */
  stopTokenCheck = () => {
    console.log("Clearing token expiration interval.");
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  };
}

export default AuthService;
