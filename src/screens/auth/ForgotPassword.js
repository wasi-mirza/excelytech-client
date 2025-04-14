import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/endPointNames.js";
import toast from "react-hot-toast";

// const ForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const [ip, setIp] = useState("");
//   const [browserInfo, setBrowserInfo] = useState("");

//   useEffect(() => {
//     // Get IP Address
//     fetch("https://api.ipify.org?format=json")
//       .then((response) => response.json())
//       .then((data) => setIp(data.ip))
//       .catch((error) => console.error("Error fetching IP:", error));

//     // Get Browser Information
//     const getBrowserInfo = () => {
//       setBrowserInfo(navigator.userAgent);
//     };

//     getBrowserInfo();
//   }, []);

//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const response = await axios.post(
//         `${BASE_URL}/user/resetpasswordbyemail`,
//         { email: email, newPassword }
//         // {
//         //   headers: {
//         //     Authorization: `Bearer ${auth?.token}`,
//         //   },
//         // }
//       );
//       console.log("Response ", response);

//       if (response.status == 200 || response.status == 201) {
//         toast.success(response.data.message || "Password reset successful.");
//         // const res = axios.post(`${BASE_URL}/useractivity/`,
//         //   {
//         //     userId: auth?.user?._id,
//         // activityType: "FORGOT_PASSWORD",
//         // description: "Forgot password",
//         // ipAddress: ip,
//         // userAgent: browserInfo,
//         // },{
//         //     headers: {
//         //       Authorization: `Bearer ${auth?.token}`,
//         //     },
//         //   })
//         // console.log("forgot password",res);

//         // if (res.status == 200 ||  res.status== 201){
//         //   console.log("forgot password");
//         // }

//         navigate("/login");
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "An error occurred. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="hold-transition login-page"
//       style={{ minHeight: "100vh", backgroundColor: "#f4f6f9" }}
//     >
//       <div className="login-box">
//         <div className="login-logo">
//           <img
//             src="/img/excelytech-logo.png"
//             alt="excelytech-logo"
//             className="brand-image"
//             style={{ opacity: ".8", width: "150px" }}
//           />
//         </div>
//         <div className="card">
//           <div className="card-body login-card-body">
//             <p className="login-box-msg">Reset Your Password</p>
//             {error && (
//               <div className="alert alert-danger text-center" role="alert">
//                 {error}
//               </div>
//             )}
//             <form onSubmit={handleResetPassword}>
//               <div className="input-group mb-3">
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="Username or Email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//                 <div className="input-group-append">
//                   <div className="input-group-text">
//                     <span className="fas fa-envelope"></span>
//                   </div>
//                 </div>
//               </div>

//               <div className="input-group mb-3">
//                 <input
//                   type="password"
//                   className="form-control"
//                   placeholder="New Password"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   required
//                 />
//                 <div className="input-group-append">
//                   <div className="input-group-text">
//                     <span className="fas fa-lock"></span>
//                   </div>
//                 </div>
//               </div>

//               <div className="row">
//                 <div className="col-12">
//                   <button
//                     type="submit"
//                     className="btn btn-success btn-block"
//                     disabled={loading}
//                   >
//                     {loading ? "Resetting..." : "Reset Password"}
//                   </button>
//                 </div>
//               </div>
//             </form>

//             <p className="mt-3 mb-1">
//               <a href="/login">Back to Login</a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // const [ip, setIp] = useState("");
  // const [browserInfo, setBrowserInfo] = useState("");

  // useEffect(() => {
  //   // Get IP Address
  //   fetch("https://api.ipify.org?format=json")
  //     .then((response) => response.json())
  //     .then((data) => setIp(data.ip))
  //     .catch((error) => console.error("Error fetching IP:", error));

  //   // Get Browser Information
  //   const getBrowserInfo = () => {
  //     setBrowserInfo(navigator.userAgent);
  //   };

  //   getBrowserInfo();
  // }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate password match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/user/resetpasswordbyemail`,
        { email, newPassword }
      );
      console.log("Response", response);

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message || "Password reset successful.");
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className=" justify-content-center"
      // style={{ minHeight: "100vh", backgroundColor: "#f4f6f9" }}
    >
      <div className="">
        <div className="card">
          <div className="card-body login-card-body">
            <p className="login-box-msg">Reset Password</p>
            {error && (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleResetPassword}>
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
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="input-group-text btn"
                    onClick={toggleShowPassword}
                  >
                    <span
                      className={`fas ${
                        showPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                    ></span>
                  </button>
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="input-group-text btn"
                    // onClick={toggleShowPassword}
                  >
                    <span className={`fas fa-lock`}></span>
                  </button>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-success btn-block"
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
