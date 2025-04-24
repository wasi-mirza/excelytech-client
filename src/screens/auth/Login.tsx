import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode"; // Add this package to decode JWT tokens
import toast from "react-hot-toast";
import { ROUTES } from "../../shared/utils/routes";
import ForgotPassword from "./ForgotPassword";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { getPublicIp, getBrowserInfo } from "../../shared/utils/commonUtils";
import { loginUser, logUserActivity } from "../../shared/services/authService";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  var [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [auth, setAuth] = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function generateRandomIP() {
    const octet = () => Math.floor(Math.random() * 256);
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
  }
  
  const randomIP = generateRandomIP();
  console.log("randomIP", randomIP);
  const [ip, setIp] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");

  useEffect(() => {
    // Get IP Address
    getPublicIp()
      .then((ip) => setIp(ip))
      .catch((error) => console.error("Error fetching IP:", error));

    // Get Browser Information
    setBrowserInfo(getBrowserInfo());
  }, []);

  // Check token expiration
  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Current time in seconds

        if (decodedToken.exp && decodedToken.exp < currentTime) {
          localStorage.removeItem("token");
          localStorage.removeItem("auth");
          setAuth(null as any);
          return false;
        }
        return true;
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("auth");
        setAuth(null as any);
        return false;
      }
    }
    return false;
  };
  // Redirect if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const authData = localStorage.getItem("auth");
    console.log("token and authdata", token, authData);

    if (token && authData) {
      const isValid = checkTokenExpiration();
      console.log("isValid", isValid);

      if (isValid) {
        const userInfo = JSON.parse(authData);
        if (userInfo.isFirstTimeLogin && userInfo.role !== "admin") {
          navigate(ROUTES.AUTH.FORMALITY);
        } else {
          userInfo.role === "admin" ? navigate(ROUTES.ADMIN.HOME) : navigate(ROUTES.USER.HOME);
        }
      }
    }
  }, [navigate]);
  const [isModalOpen, setModalOpen] = useState(false);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  // Automatically check for token expiration on component mount and at intervals
  useEffect(() => {
    // Check for token expiration on initial render
    checkTokenExpiration();

    // Check for token expiration at regular intervals (e.g., every minute)
    const intervalId = setInterval(checkTokenExpiration, 60 * 1000 * 10); // 1 minute

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, []);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(email, password);

      if (response.status === 200) {
        const userInfo = response.data.userInfo;
        const token = response.data.token;
        localStorage.setItem("auth", JSON.stringify(userInfo));
        localStorage.setItem("token", token);

        setAuth({ user: userInfo, token });

        toast.success("Logged in successfully");

        if (userInfo.isFirstTimeLogin && userInfo.role !== "admin") {
          navigate(ROUTES.AUTH.FORMALITY); // Replace with the correct route
        } else {
          // Redirect to the appropriate dashboard
          userInfo.role === "admin" ? navigate(ROUTES.ADMIN.HOME) : navigate(ROUTES.USER.HOME);
        }
        await logUserActivity(
          userInfo._id,
          "LOGIN",
          "User logged in",
          ip,
          browserInfo,
          token
        );
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      console.log("err :", err);

      setError(
        ((err as AxiosError).response?.data as { message?: string })?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="hold-transition login-page"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
        backgroundImage: "url('/img/portal-login-bg.jpg')", // Replace with the actual path
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="login-box">
        <div className="login-logo">
          <img
            src="/img/excelytech-logo.png"
            alt="excelytech-logo"
            className="brand-image"
            style={{ opacity: "1", width: "250px" }}
          />
          <h6> Service Portal</h6>
        </div>
        <div className="card">
          <div className="card-body login-card-body">
            <p className="login-box-msg">Login</p>

            {error && (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Username or Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-envelope"></span>
                  </div>
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="input-group-append">
                  <button
                    type="button"
                    className="input-group-text btn"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  >
                    <span
                      className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                    ></span>
                  </button>
                </div>
              </div>

              <div className="row">
                <div className="col-8"></div>
                <div className="col-4">
                  <button
                    type="submit"
                    className="btn btn-success btn-block"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : " Sign In"}
                  </button>
                </div>
              </div>
            </form>

            <p className="mb-0">
              {/* <div className="button" color="btn" onClick={toggleModal}>
                Open Forgot Password
              </div> */}
              <u>
                {/* <Link onClick={toggleModal}>Forgot password?</Link> */}
                <Modal
                  isOpen={isModalOpen}
                  toggle={toggleModal}
                  // style={{ maxWidth: "none", width: "auto" }}
                  size="md"
                  centered
                >
                  <ModalHeader toggle={toggleModal}>
                    <div className="d-flex flex-column justify-content-center align-items-center ">
                      <img
                        src="/img/excelytech-logo.png"
                        alt="excelytech-logo"
                        className="brand-image"
                        style={{ opacity: ".8", width: "150px" }}
                      />
                      <h6> Service Portal</h6>
                    </div>
                  </ModalHeader>
                  <ModalBody>
                    <ForgotPassword onClose={toggleModal} />
                  </ModalBody>
                </Modal>
              </u>
            </p>
            {/* <p className="mb-0">
              <a href="/register" className="text-center">
                Register a new membership
              </a>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
