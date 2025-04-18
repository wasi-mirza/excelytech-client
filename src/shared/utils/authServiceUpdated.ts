import { jwtDecode } from "jwt-decode";

// Constants
const TOKEN_KEY = "token";
const AUTH_KEY = "auth";
const CHECK_INTERVAL = 1000 * 60 * 2; // 2 minutes
const TOKEN_BUFFER_TIME = 1000 * 60 * 5; // 5 minutes buffer before actual expiration

class AuthService {
  constructor(setAuth, navigate) {
    this.setAuth = setAuth;
    this.navigate = navigate;
    this.intervalId = null;
    this.isChecking = false;
  }

  /** 
   * Check Token Expiration with buffer time
   * @returns {boolean} - Returns true if token is valid, false otherwise
   */
  checkTokenExpiration = () => {
    if (this.isChecking) return true; // Prevent concurrent checks
    
    try {
      this.isChecking = true;
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        this.handleLogout("No token found");
        return false;
      }

      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const expiryTime = decodedToken.exp;
      const bufferExpiryTime = expiryTime - (TOKEN_BUFFER_TIME / 1000);

      if (currentTime >= bufferExpiryTime) {
        this.handleLogout("Token expired or about to expire");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      this.handleLogout("Invalid token");
      return false;
    } finally {
      this.isChecking = false;
    }
  };

  /** 
   * Handle user logout with cleanup
   * @param {string} reason - Reason for logout
   */
  handleLogout = (reason = "User logged out") => {
    try {
      // Clear all auth-related data
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(TOKEN_KEY);
      
      // Clear any other sensitive data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('auth_')) {
          localStorage.removeItem(key);
        }
      });

      // Reset auth state
      this.setAuth({ user: null, token: null });
      
      // Stop token checks
      this.stopTokenCheck();
      
      // Navigate to login with reason
      this.navigate("/login", { 
        state: { logoutReason: reason },
        replace: true 
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Force navigation even if cleanup fails
      this.navigate("/login", { replace: true });
    }
  };

  /** 
   * Start periodic token expiration check
   * @returns {void}
   */
  startTokenCheck = () => {
    if (this.intervalId) {
      this.stopTokenCheck(); // Clear existing interval if any
    }

    // Initial check
    if (!this.checkTokenExpiration()) {
      return;
    }

    // Set up periodic check
    this.intervalId = setInterval(() => {
      this.checkTokenExpiration();
    }, CHECK_INTERVAL);
  };

  /** 
   * Stop token expiration check
   * @returns {void}
   */
  stopTokenCheck = () => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  };

  /** 
   * Get current token
   * @returns {string|null} - Current token or null if not found
   */
  getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  /** 
   * Set new token
   * @param {string} token - New token to set
   * @returns {void}
   */
  setToken = (token: string) => {
    if (!token) {
      throw new Error("Token cannot be null or undefined");
    }
    localStorage.setItem(TOKEN_KEY, token);
  };

  /** 
   * Cleanup on component unmount
   * @returns {void}
   */
  cleanup = () => {
    this.stopTokenCheck();
  };
}

export default AuthService;
