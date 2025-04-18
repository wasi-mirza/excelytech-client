import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "react-stepper-horizontal";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../../shared/utils/endPointNames";
import toast from "react-hot-toast";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { Spinner, Container } from "reactstrap";
import { ROUTES } from "../../shared/utils/routes";
import { getPublicIp } from '../../shared/utils/commonUtils';
const NewRegistration = () => {
  const stripePromise = loadStripe(
    "pk_test_51PeI4kRovk9fbY7NlzADRlATaI6qOOBcb1bINnZDiPqcfaEdxjC9OPTMv5I6J95SgAyjGqyu4hfwkXSOuwsATkjC00dWcAlFWU"
  );
  const [userDetails, setUserDetails] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [auth] = useAuth();
  const [subscriptionDetails, setSubscriptionDetails] = useState([]);

  // Fetch fetchUserDetails details
  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/${auth?.user._id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
      });

      console.log("userDetails", response.data);
      if (response.data["isfirstPasswordResetDone"]) {
        setActiveStep(1);
      }
      if (!response.data["isFirstTimeLogin"]) {
        navigate(ROUTES.USER.HOME);
      }
      setUserDetails(response.data);
    } catch (error) {
      console.error("Error fetching userDetails:", error);
      toast.error("Failed to fetch userDetails. Please try again.");
    }
  }, [auth]);
  // update  isfirstPasswordResetDone for user
  const updateIsfirstPasswordResetDone = async (isfirstPasswordResetDone) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/user/update-password/reset-status`,
        {
          userId: auth.user._id,
          isfirstPasswordResetDone: isfirstPasswordResetDone,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      console.log("updateIsfirstPasswordResetDone", response.data);
    } catch (error) {
      console.error("Error in updateIsfirstPasswordResetDone:", error);
      toast.error(
        "Failed in updateIsfirstPasswordResetDone. Please try again."
      );
    }
  };
  // update  subscriptionDetailsConfirmed for user
  const updateSubscriptionDetailsConfirmed = async (
    subscriptionId,
    subscriptionDetailsConfirmed
  ) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/subscription/${subscriptionId}`,
        {
          subscriptionDetailsConfirmed: subscriptionDetailsConfirmed,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      console.log("subscriptionDetailsConfirmed", response.data);
    } catch (error) {
      console.error("Error in subscriptionDetailsConfirmed:", error);
      toast.error("Failed in subscriptionDetailsConfirmed. Please try again.");
    }
  };

  const handleCheckboxChange = (id) => {
    setSubscriptionDetails((prevDetails) =>
      prevDetails.map((sub) => {
        if (sub._id === id) {
          const updatedSub = { ...sub, checked: !sub.checked };
          console.log(
            `Sub id: ${updatedSub._id}, sub.checked: ${updatedSub.checked}`
          );
          return updatedSub;
        }
        return sub; // Return the subscription as is if it's not the one being toggled
      })
    );
  };

  // const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [subscriptionId, setSubscriptionId] = useState([]);

  const [ip, setIp] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getPublicIp()
      .then((ip) => setIp(ip))
      .catch((error) => console.error("Error fetching IP:", error));

    // Get Browser Information
    const getBrowserInfo = () => {
      setBrowserInfo(navigator.userAgent);
    };

    getBrowserInfo();
  }, []);
  // Fetch subscription details on component mount
  const fetchSubscriptionDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/subscription/${auth?.user._id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      // Add 'checked' property with default value false
      const subscriptionsWithCheckBox = response.data.subscriptions.map(
        (sub) => ({
          ...sub,
          checked: sub.subscriptionDetailsConfirmed
            ? sub.subscriptionDetailsConfirmed
            : false,
        })
      );
      if (subscriptionDetails.every((sub) => sub.checked)) {
        setSubscriptionDetails(subscriptionsWithCheckBox);
        setActiveStep(2);
      }

      console.log("Sub", subscriptionDetails);
    } catch (error) {
      console.error("Error fetching subscription details:", error); // commenet this on production
      toast.error("Failed to fetch subscription details. Please try again."); // commenet this on production
    }
  }, [auth]);
  useEffect(() => {
    fetchUserDetails();
    fetchSubscriptionDetails();
  }, [auth]);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validatePassword = () => {
    const isValid = password === confirmPassword; //&& passwordRegex.test(password);
    setIsPasswordValid(isValid);
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      try {
        const createPasswordResponse = await axios.post(
          `${BASE_URL}/password/create`,
          {
            clientId: auth?.user._id, // Send clientId
            password: password, // Send password
          },
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        if (createPasswordResponse.status === 201) {
          setPassword(createPasswordResponse.data.password);
          console.log("Password Created Successfully");
          const res = axios.post(
            `${BASE_URL}/useractivity/`,
            {
              userId: auth?.user?._id,
              activityType: "CREATE",
              description: "Create Password",
              ipAddress: ip,
              userAgent: browserInfo,
            },
            {
              headers: {
                Authorization: `Bearer ${auth?.token}`,
              },
            }
          );
          console.log("create password", res);

          setConfirmPassword("");
          setIsPasswordValid(false);
        } else {
          alert("Failed to generate password. Please try again.");
          return;
        }
        const email = auth?.user.email;
        const resetPasswordResponse = await axios.post(
          `${BASE_URL}/user/resetpasswordbyemail`,
          { email, newPassword: password },
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        if (
          resetPasswordResponse.status === 200 ||
          resetPasswordResponse.status === 201
        ) {
          updateIsfirstPasswordResetDone(true);
          setActiveStep(activeStep + 1);

          const res = axios.post(
            `${BASE_URL}/useractivity/`,
            {
              userId: auth?.user?._id,
              activityType: "RESET_PASSWORD",
              description: "Reset Password",
              ipAddress: ip,
              userAgent: browserInfo,
            },
            {
              headers: {
                Authorization: `Bearer ${auth?.token}`,
              },
            }
          );
          console.log("Reset password", res);
        } else {
          alert("Failed to reset password. Please try again.");
        }
      } catch (error) {
        console.error("Error during password reset:", error);
        alert("An error occurred. Please try again.");
      }
    }
    if (activeStep === 1) {
      subscriptionDetails.map(async (sub) => {
        if (sub.checked) {
          await updateSubscriptionDetailsConfirmed(sub._id, sub.checked);
        }
      });
      setActiveStep(activeStep + 1);
    } else if (activeStep < 2) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="container mt-5">
      {/* Stepper */}
      <Stepper
        steps={[
          { title: "Reset Password" },
          { title: "Select Subscription" },
          { title: "Agreement & Payment" },
        ]}
        activeStep={activeStep}
        activeColor="#007bff"
      />

      <div className="card mt-4">
        <div className="card-body">
          {activeStep === 0 && (
            <div>
              <h3>Step 1: Reset Password</h3>
              <div className="form-group">
                <label>Old Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={validatePassword}
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
                        className={`fas ${
                          showPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={validatePassword}
                />
                {!isPasswordValid && confirmPassword.length > 0 && (
                  <small className="text-danger">
                    Passwords do not match or are invalid!
                  </small>
                )}
              </div>
              <div className="d-flex justify-content-end mt-3">
                <button
                  className="btn btn-success mt-3 "
                  disabled={!isPasswordValid}
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Confirm Your Subscriptions</h3>
              </div>
              {/* /.card-header */}
              <div className="card-body table-responsive p-0">
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Products</th>
                      <th>Subscription Duration</th>
                      <th>Grand Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionDetails?.length > 0 ? (
                      subscriptionDetails.map((sub, index) => (
                        <tr key={sub._id}>
                          <td>
                            <div className="icheck-primary">
                              <input
                                type="checkbox"
                                id={`subscription-${sub._id}`}
                                checked={sub.checked}
                                onChange={() => handleCheckboxChange(sub._id)}
                              />
                              <label
                                htmlFor={`subscription-${sub._id}`}
                              ></label>
                            </div>
                          </td>
                          <td>
                            {sub.products
                              .map((product) => product.productId.name)
                              .join(", ")}
                          </td>
                          <td>{sub.subscriptionDurationInMonths} months</td>
                          <td>
                            {sub.grandTotalCurrency} {sub.grandTotal}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          Loading subscriptions...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* /.card-body */}
              <div className="card-footer d-flex justify-content-end">
                <button
                  className="btn btn-success"
                  disabled={!subscriptionDetails.every((sub) => sub.checked)}
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div>
              <h3>Step 3: Agreement & Payment</h3>
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="null">Select</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                </select>
              </div>

              {/* Conditional Payment Form */}
              {(paymentMethod === "credit_card" ||
                paymentMethod === "debit_card") && (
                <Elements stripe={stripePromise}>
                  <CardForm
                    paymentMethod={paymentMethod}
                    subscriptions={subscriptionDetails}
                    handlePrevious={handlePrevious}
                    userDetails={userDetails}
                    token={auth?.token}
                    userDetail={userDetails}
                  />
                </Elements>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewRegistration;

// CardForm Component to handle card input
const CardForm = ({
  paymentMethod: initialPaymentMethod,
  subscriptions: subscriptions,
  userDetails: userDetails,
  handlePrevious: handlePrevious,
  token: token,
  userDetails: userDetail,
}) => {
  // Use a different name for the state variable to avoid conflict
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const openModal = () => {
    fetchAgreementPdf();
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  const [agreed, setAgreed] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const fetchAgreementPdf = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}${userDetails.userAgreementUrl.replace(
          "/uploads/",
          "/media/"
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Add token for authentication
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch the agreement PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error fetching the PDF:", error);
    }
  };
  useEffect(() => {
    // Revoke blob URL on unmount to free memory
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);
  const [paymentMethod] = useState(initialPaymentMethod);
  const stripe = useStripe();
  const elements = useElements();
  const [cardDetails, setCardDetails] = useState({});

  //Method to activate the subscription
  const updateSubscriptionStatus = async (subscriptionId) => {
    // setIsLoading(true);
    // setError(null);
    // setSuccessMessage(null);

    try {
      const response = await fetch(
        `${BASE_URL}/subscription/update-subscription-status/${subscriptionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subscriptionStatus: "active",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update subscription status.");
      }

      const data = await response.json();
      // console.log("update-subscription-status", data);

      // onClose(token, subscriptionId);
      // setSuccessMessage(data.message);
    } catch (err) {
      // toast.error(err);
      // setError(err.message);
    } finally {
      // setIsLoading(false);
    }
  };
  const handleAddPayment = async (paymentData, subscriptionId) => {
    try {
      // Prepare data to send to API
      const payload = {
        paymentData,
        subscriptionId, // Ensure subscriptionId is set
      };

      // Make API call to create payment and update subscription
      const response = await axios.post(
        `${BASE_URL}/payment/newPayment`,

        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        const response = await fetch(`${BASE_URL}/user/${userDetail._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            agreementAccepted: true,
            isFirstTimeLogin: false,
          }),
        });
        if (response.status === 200) {
          toast.success("Payment succeeded! Your subscription is active");
          setLoading(false);
          navigate(ROUTES.USER.HOME);
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || "An error occurred. Please try again."
      );
      //   console.log("newPayment err :", err);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!stripe || !elements) {
      // setError("Stripe has not loaded yet.");
      return;
    }
    const email = userDetail.email;
    // setIsLoading(true);
    // setError("");

    try {
      // Step 1: Create payment method with Stripe Elements
      const paymentMethodRequest = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
        billing_details: { email },
      });
      if (paymentMethodRequest["error"]) {
        throw new Error(paymentMethodRequest["error"].message);
      }
      if (paymentMethodRequest["paymentMethod"].id) {
        console.log(
          "paymentMethodRequest.id",
          paymentMethodRequest["paymentMethod"].id
        );

        const cardDetails = {
          stripePaymentMethodRequestTokenId:
            paymentMethodRequest["paymentMethod"].id,
          cardNumber: paymentMethodRequest["paymentMethod"].card.last4, // Use card details directly
          brand: paymentMethodRequest["paymentMethod"].card.brand,
          expiryDate: `${paymentMethodRequest["paymentMethod"].card.exp_month}/${paymentMethodRequest["paymentMethod"].card.exp_year}`,
        };
        console.log("Card details", cardDetails);

        const data = {
          clientId: userDetail._id,
          methodType: paymentMethod,
          cardDetails: cardDetails,
          isDefault: true,
        };
        // Store card details to the db
        // Add the new payment method
        const res = await axios.post(`${BASE_URL}/paymentMethod/create`, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 201) {
          toast.success("Payment Method Stored");
        }
      }

      // Step 2: Send paymentMethod.id and other details to your backend
      const subscription = subscriptions[0];
      // console.log("Subscription Details", subscription);
      const subscriptionDurationInMonths =
        subscription.subscriptionDurationInMonths;
      let billingInterval;

      // Check subscription duration and set billingInterval accordingly
      switch (subscriptionDurationInMonths) {
        case 1:
          billingInterval = "month"; // 1 means monthly billing
          break;

        case 12:
          billingInterval = "year"; // 12 means yearly billing
          break;
        default:
          throw new Error("Invalid subscription duration");
      }
      // const email = userDetail.email;
      // Generate a random number (e.g., between 1000 and 9999)
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;

      // Concatenate the productName, username, and the random number
      const productName = `${subscription.productName}${userDetail.username}${randomNumber}`;

      const currency = subscription.grandTotalCurrency.toLowerCase();

      console.log("currency", currency);

      const price = subscription.grandTotal;

      const response = await fetch(`${BASE_URL}/stripe/create-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          productName,
          price,
          currency,
          billingInterval,
          paymentMethodId: paymentMethodRequest.paymentMethod.id, // Send paymentMethod.id
        }),
      });

      const data = await response.json();
      //   console.log("Backend response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription.");
      }

      const { clientSecret, stripeCustomerId, stripeSubscriptionId } = data;

      // Step 3: Confirm the payment intent to finalize subscription
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodRequest.paymentMethod.id,
      });
      //   console.log("paymentResult", paymentResult);

      if (paymentResult.error) {
        const { type, message, code } = paymentResult.error;

        // // Log the error for debugging
        // console.error("Error type:", type);
        // console.error("Error message:", message);
        // console.error("Error code:", code);

        // Display user-friendly message
        let userMessage = "An error occurred during the payment process.";
        if (code === "card_declined") {
          userMessage = "Your card was declined. Please try another card.";
        } else if (code === "insufficient_funds") {
          userMessage = "Insufficient funds. Please try a different card.";
        } else if (code === "expired_card") {
          userMessage = "Your card has expired. Please use a different card.";
        } else {
          userMessage = message || userMessage;
        }

        toast.error(userMessage); // Show message to the user
      } else {
        // Check the payment intent status
        const paymentIntent = paymentResult.paymentIntent;
        //   console.log("paymentIntent", paymentIntent);

        if (paymentIntent.status === "requires_payment_method") {
          // Display a message to the user indicating the payment failed and they need to enter a new method
          toast.error("Payment failed. Please provide a new payment method.");

          // Step 1: Allow the user to enter a new payment method
          const newPaymentMethodRequest = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardElement),
            billing_details: { email }, // Include the user's email or other billing details
            // billing_details:billing_details,
          });

          if (newPaymentMethodRequest.error) {
            // Handle error if the new payment method creation fails
            toast.error(
              "Failed to create new payment method. Please try again."
            );
            return;
          }

          // Step 2: Attach the new payment method to the existing payment intent
          const updatedPaymentIntent = await stripe.paymentIntents.update(
            paymentIntent.id,
            {
              payment_method: newPaymentMethodRequest.paymentMethod.id,
            }
          );

          // Step 3: Confirm the payment intent with the new payment method
          const retryPaymentResult = await stripe.confirmCardPayment(
            updatedPaymentIntent.client_secret,
            {
              payment_method: newPaymentMethodRequest.paymentMethod.id,
            }
          );

          // Handle retry result
          if (retryPaymentResult.error) {
            console.error(
              "Error confirming payment with new method:",
              retryPaymentResult.error
            );
            toast.error("Payment failed again. Please try a different method.");
          } else {
            if (retryPaymentResult.paymentIntent.status === "succeeded") {
              await updateSubscriptionStatus(subscription._id);

              const paymentData = {
                amount: price,
                currency: currency,
                paymentMethod: "card",
                status: paymentIntent.status,
                stripePaymentIntentId: paymentIntent.id,
                stripeSubscriptionId: stripeSubscriptionId,
                stripeCustomerId: stripeCustomerId,
                customer: userDetail._id,
                stripeInvoiceLink: "",
                billed: billingInterval,
              };
              await handleAddPayment(paymentData, subscription._id);
            }
          }
        } else if (paymentIntent.status === "canceled") {
          // The payment was canceled
          toast.error("The payment was canceled. Please try again.");
        } else if (paymentIntent.status === "requires_action") {
          // Handle the 3D Secure authentication process
          const result = await stripe.handleCardAction(
            paymentIntent.client_secret
          );
          if (result.error) {
            console.error("3D Secure failed:", result.error.message);
            toast.error("3D Secure authentication failed. Please try again.");
          } else {
            // Payment succeeded after 3D Secure authentication
            await updateSubscriptionStatus(subscription._id);
            const paymentData = {
              amount: price,
              currency: currency,
              paymentMethod: "card",
              status: paymentIntent.status,
              stripePaymentIntentId: paymentIntent.id,
              stripeSubscriptionId: stripeSubscriptionId,
              stripeCustomerId: stripeCustomerId,
              customer: userDetail._id,
              stripeInvoiceLink: "",
              billed: billingInterval,
            };
            await handleAddPayment(paymentData, subscription._id);
          }
        } else if (paymentIntent.status === "succeeded") {
          await updateSubscriptionStatus(subscription._id);

          const paymentData = {
            amount: price,
            currency: currency,
            paymentMethod: "card",
            status: paymentIntent.status,
            stripePaymentIntentId: paymentIntent.id,
            stripeSubscriptionId: stripeSubscriptionId,
            stripeCustomerId: stripeCustomerId,
            customer: userDetail._id,
            stripeInvoiceLink: "",
            billed: billingInterval,
          };
          await handleAddPayment(paymentData, subscription._id);
          //   console.log("Payment succeeded:", paymentIntent);
        } else {
          // If the status is unexpected (though it shouldn't be)
          toast.error("Unexpected payment status. Please try again.");
        }
      }

      // toast.success("Subscription successful!");
    } catch (err) {
      //   console.log("Error:", err);
      // setError(err.message);
    } finally {
      // setIsLoading(false);
    }
  };
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {(paymentMethod === "credit_card" || paymentMethod === "debit_card") && (
        <form onSubmit={handleSubmit}>
          <div className="payment-form mt-3">
            <div className="form-group">
              <label>Card Number</label>
              <form autoComplete="off">
                <div
                  style={{
                    fontSize: "16px",
                    color: "#32325d",
                    backgroundColor: "#fff",
                    border: "1px solid #ced4da", // Bootstrap form-control border
                    borderRadius: "0.25rem", // Bootstrap border-radius
                    padding: "0.375rem 0.75rem", // Bootstrap padding
                    "::placeholder": { color: "#aab7c4" },
                  }}
                >
                  <CardElement
                    id="card-element"
                    options={{
                      autocomplete: "new-password",
                      hidePostalCode: true,
                    }}
                  />
                </div>
              </form>
            </div>
            <div className="form-group mt-3">
              <div className="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="agreeCheckbox"
                  checked={agreed}
                  disabled={!stripe}
                  onChange={() => setAgreed(!agreed)}
                />
                <label
                  className="custom-control-label mr-2"
                  htmlFor="agreeCheckbox"
                >
                  <p>I accept the Agreement</p>
                </label>
                <div>
                  <span
                    style={{ color: "blue", cursor: "pointer" }}
                    onClick={openModal}
                  >
                    Read the Agreement
                  </span>
                </div>
                {/* AdminLTE Modal for Agreement */}
                {/* Modal Component */}
                <Modal
                  isOpen={showModal}
                  toggle={closeModal}
                  size="lg"
                  centered
                >
                  <ModalHeader toggle={closeModal}>Agreement </ModalHeader>
                  <ModalBody style={{ padding: "0", height: "90vh" }}>
                    {pdfUrl ? (
                      <iframe
                        src={pdfUrl}
                        width="100%"
                        height="100%"
                        title="Agreement Document"
                        style={{ border: "none", display: "block" }}
                      ></iframe>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </ModalBody>
                </Modal>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-secondary mr-3"
                onClick={handlePrevious}
              >
                Check Subscription Details
              </button>

              {loading ? (
                <Spinner color="primary" size="lg" /> // Show spinner when loading
              ) : (
                <button
                  className="btn btn-success"
                  // disabled={ || !selectedSubscriptionId}
                  disabled={!agreed}
                  onClick={handleSubmit}
                >
                  Activate Subscription
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
