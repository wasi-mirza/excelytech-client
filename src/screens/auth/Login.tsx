import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { ROUTES } from "../../shared/utils/routes";
import ForgotPassword from "./ForgotPassword";
import { getPublicIp, getBrowserInfo } from "../../shared/utils/commonUtils";
import { loginUser, logUserActivity } from "../../shared/services/authService";
// MUI imports
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Modal,
  useTheme,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [auth, setAuth] = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function generateRandomIP() {
    const octet = () => Math.floor(Math.random() * 256);
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
  }
  const [ip, setIp] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    getPublicIp()
      .then((ip) => setIp(ip))
      .catch((error) => console.error("Error fetching IP:", error));
    setBrowserInfo(getBrowserInfo());
  }, []);

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const authData = localStorage.getItem("auth");
    if (token && authData) {
      const isValid = checkTokenExpiration();
      if (isValid) {
        const userInfo = JSON.parse(authData);
        if (userInfo.isFirstTimeLogin && userInfo.role !== "admin") {
          navigate(ROUTES.AUTH.FORMALITY);
        } else {
          userInfo.role === "admin"
            ? navigate(ROUTES.ADMIN.HOME)
            : navigate(ROUTES.USER.HOME);
        }
      }
    }
  }, [navigate]);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  useEffect(() => {
    checkTokenExpiration();
    const intervalId = setInterval(checkTokenExpiration, 60 * 1000 * 10);
    return () => clearInterval(intervalId);
  }, []);

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
          navigate(ROUTES.AUTH.FORMALITY);
        } else {
          userInfo.role === "admin"
            ? navigate(ROUTES.ADMIN.HOME)
            : navigate(ROUTES.USER.HOME);
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
      setError(
        ((err as AxiosError).response?.data as { message?: string })?.message ||
        "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left Section */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          background: theme.palette.background.paper,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 0,
          backgroundColor: '#F0FBF9'
        }}
      >
        <Box sx={{ width: "100%", }}>
          {/* <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <img
              src="/img/excelytech-logo.png"
              alt="excelytech-logo"
              style={{ width: 48, marginRight: 16 }}
            />
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Excelytech
            </Typography>
          </Box> */}
          <Box
            sx={{
              height: '100vh',
              width: '90%',
              background: theme.palette.grey[100],
              // borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: '#F0FBF9'
              // mb: 3,
            }}
          >
            {/* Placeholder for image */}
            {/* <Typography color="text.secondary" align="center"> */}
            <img src="/img/excelytech-login.png" alt="login-display" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            {/* </Typography> */}
          </Box>
          {/* <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
            “This is a placeholder testimonial. Your product or service can help users achieve amazing results!”
          </Typography>
          <Typography variant="body2" color="text.secondary">
            — John Doe, Company Inc.
          </Typography> */}
        </Box>

        <Typography variant="body2" color="primary.dark" align="center" sx={{ position: 'absolute', bottom: 16, transform: 'translateX(-50%)', left: '25%' }}>
          Your Data, Always Safe. Always Recoverable
        </Typography>
      </Grid>
      {/* Right Section */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.palette.background.default,

        }}
      >
        <Paper elevation={4} sx={{ p: 5, width: "100%", maxWidth: 400, borderRadius: 3, boxShadow: 0, elevation: 0, border: '1px solid #e0e0e0' }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Login to your account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your credentials to continue
            </Typography>
          </Box>
          {error && (
            <Box mb={2}>
              <Typography color="error" align="center">
                {error}
              </Typography>
            </Box>
          )}
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              margin="normal"
              label="Email or Username"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button variant="text" size="small" onClick={toggleModal} sx={{ textTransform: "none" }}>
                Forgot password?
              </Button>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, mb: 1, py: 1.2, fontWeight: 600, color: 'white', boxShadow: 0, elevation: 0 }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Sign In"}
            </Button>
          </form>
          <Divider sx={{ my: 2 }}>or</Divider>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            sx={{ mb: 1, py: 1.2, fontWeight: 600 }}
            startIcon={<img src="/img/Google-Icon.png" alt="Google" style={{ width: 30, height: 30 }} />}
          // onClick={handleGithubLogin} // Add your GitHub login logic here
          >
            Sign in with Google
          </Button>
          <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 2 }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </Paper>
        {/* Forgot Password Modal */}
        <Modal open={isModalOpen} onClose={toggleModal} aria-labelledby="forgot-password-modal" >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              outline: "none",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <img
                src="/img/excelytech-logo.png"
                alt="excelytech-logo"
                style={{ width: 100, marginBottom: 8 }}
              />
              <Typography variant="h6">Service Portal</Typography>
            </Box>
            <ForgotPassword onClose={toggleModal} />
          </Box>
        </Modal>
      </Grid>
    </Grid>
  );
};

export default Login;
