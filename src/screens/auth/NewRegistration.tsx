import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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


interface Step {
  title: string;
}

interface SimpleStepperProps {
  steps: Step[];
  activeStep: number;
}

const SimpleStepper: React.FC<SimpleStepperProps> = ({ steps, activeStep }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
    {steps.map((step, idx) => (
      <React.Fragment key={idx}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: idx <= activeStep ? "#007bff" : "#e0e0e0",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              fontWeight: "bold",
            }}
          >
            {idx + 1}
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: idx <= activeStep ? "#007bff" : "#888" }}>
            {step.title}
          </div>
        </div>
        {idx < steps.length - 1 && (
          <div
            style={{
              flex: 1,
              height: 2,
              background: idx < activeStep ? "#007bff" : "#e0e0e0",
              margin: "0 8px",
            }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  userAgreementUrl: string;
  isFirstTimeLogin: boolean;
  isfirstPasswordResetDone?: boolean;
}

interface Auth {
  token: string;
  user: User;
}

interface Product {
  productId: {
    name: string;
  }
}

interface Subscription {
  _id: string;
  productName: string;
  products: Product[];
  subscriptionDurationInMonths: number;
  grandTotal: number;
  grandTotalCurrency: string;
  checked?: boolean;
  subscriptionDetailsConfirmed?: boolean;
}

interface CardFormProps {
  paymentMethod: string;
  subscriptions: Subscription[];
  userDetails: User | null;
  handlePrevious: () => void;
  token: string;
  userDetail: User | null;
}

interface PaymentData {
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  stripePaymentIntentId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  customer: string;
  stripeInvoiceLink: string;
  billed: string;
}

interface CardDetails {
  stripePaymentMethodRequestTokenId: string;
  cardNumber: string;
  brand: string;
  expiryDate: string;
}

const NewRegistration: React.FC = () => {
  const stripePromise = loadStripe(
    "pk_test_51PeI4kRovk9fbY7NlzADRlATaI6qOOBcb1bINnZDiPqcfaEdxjC9OPTMv5I6J95SgAyjGqyu4hfwkXSOuwsATkjC00dWcAlFWU"
  );
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const [auth] = useAuth();
  const [subscriptionDetails, setSubscriptionDetails] = useState<Subscription[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("Credit Card");
  const [ip, setIp] = useState<string>("");
  const [browserInfo, setBrowserInfo] = useState<string>("");
  const navigate = useNavigate();

  // Fetch fetchUserDetails details
  const fetchUserDetails = useCallback(async () => {
    if (!auth?.user._id || !auth?.token) return;

    try {
      const response = await axios.get<User>(`${BASE_URL}/user/${auth.user._id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      console.log("userDetails", response.data);
      if (response.data.isfirstPasswordResetDone) {
        setActiveStep(1);
      }
      if (!response.data.isFirstTimeLogin) {
        navigate(ROUTES.USER.HOME);
      }
      setUserDetails(response.data);
    } catch (error) {
      console.error("Error fetching userDetails:", error);
      toast.error("Failed to fetch userDetails. Please try again.");
    }
  }, [auth, navigate]);

  // update isfirstPasswordResetDone for user
  const updateIsfirstPasswordResetDone = async (isfirstPasswordResetDone: boolean): Promise<void> => {
    if (!auth?.user._id || !auth?.token) return;

    try {
      await axios.patch(
        `${BASE_URL}/user/update-password/reset-status`,
        {
          userId: auth.user._id,
          isfirstPasswordResetDone,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error in updateIsfirstPasswordResetDone:", error);
      toast.error("Failed in updateIsfirstPasswordResetDone. Please try again.");
    }
  };

  // update subscriptionDetailsConfirmed for user
  const updateSubscriptionDetailsConfirmed = async (
    subscriptionId: string,
    subscriptionDetailsConfirmed: boolean
  ): Promise<void> => {
    if (!auth?.token) return;

    try {
      await axios.patch(
        `${BASE_URL}/subscription/${subscriptionId}`,
        {
          subscriptionDetailsConfirmed,
        },
        {
          headers: {
            "Content-Type": "application/json", 
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error in subscriptionDetailsConfirmed:", error);
      toast.error("Failed in subscriptionDetailsConfirmed. Please try again.");
    }
  };

  const handleCheckboxChange = (id: string): void => {
    setSubscriptionDetails((prevDetails) =>
      prevDetails.map((sub) => {
        if (sub._id === id) {
          return { ...sub, checked: !sub.checked };
        }
        return sub;
      })
    );
  };

  // Fetch subscription details on component mount
  const fetchSubscriptionDetails = useCallback(async () => {
    if (!auth?.user._id || !auth?.token) return;

    try {
      const response = await axios.get<{subscriptions: Subscription[]}>(
        `${BASE_URL}/subscription/${auth.user._id}`,
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
          checked: sub.subscriptionDetailsConfirmed || false,
        })
      );

      setSubscriptionDetails(subscriptionsWithCheckBox);
      
      if (subscriptionsWithCheckBox.every((sub) => sub.checked)) {
        setActiveStep(2);
      }

    } catch (error) {
      console.error("Error fetching subscription details:", error);
      toast.error("Failed to fetch subscription details. Please try again.");
    }
  }, [auth]);

  useEffect(() => {
    fetchUserDetails();
    fetchSubscriptionDetails();
  }, [auth, fetchUserDetails, fetchSubscriptionDetails]);

  useEffect(() => {
    getPublicIp()
      .then((ip) => setIp(ip))
      .catch((error) => console.error("Error fetching IP:", error));

    setBrowserInfo(navigator.userAgent);
  }, []);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validatePassword = (): void => {
    const isValid = password === confirmPassword;
    setIsPasswordValid(isValid);
  };

  const handleNext = async (): Promise<void> => {
    if (activeStep === 0) {
      try {
        if (!auth?.user._id || !auth?.token) return;

        const createPasswordResponse = await axios.post(
          `${BASE_URL}/password/create`,
          {
            clientId: auth.user._id,
            password,
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
          
          await axios.post(
            `${BASE_URL}/useractivity/`,
            {
              userId: auth.user._id,
              activityType: "CREATE",
              description: "Create Password",
              ipAddress: ip,
              userAgent: browserInfo,
            },
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );

          setConfirmPassword("");
          setIsPasswordValid(false);
        } else {
          toast.error("Failed to generate password. Please try again.");
          return;
        }

        const email = auth.user.email;
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
          await updateIsfirstPasswordResetDone(true);
          setActiveStep(activeStep + 1);

          await axios.post(
            `${BASE_URL}/useractivity/`,
            {
              userId: auth.user._id,
              activityType: "RESET_PASSWORD", 
              description: "Reset Password",
              ipAddress: ip,
              userAgent: browserInfo,
            },
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );
        } else {
          toast.error("Failed to reset password. Please try again.");
        }
      } catch (error) {
        console.error("Error during password reset:", error);
        toast.error("An error occurred. Please try again.");
      }
    }

    if (activeStep === 1) {
      await Promise.all(subscriptionDetails.map(async (sub) => {
        if (sub.checked) {
          await updateSubscriptionDetailsConfirmed(sub._id, sub.checked);
        }
      }));
      setActiveStep(activeStep + 1);
    } else if (activeStep < 2) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = (): void => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="container mt-5">
      <SimpleStepper
        steps={[
          { title: "Reset Password" },
          { title: "Select Subscription" },
          { title: "Agreement & Payment" },
        ]}
        activeStep={activeStep}
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
                  className="btn btn-success mt-3"
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
                      subscriptionDetails.map((sub) => (
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
                        <td colSpan={4} className="text-center">
                          Loading subscriptions...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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

              {(paymentMethod === "credit_card" ||
                paymentMethod === "debit_card") && (
                <Elements stripe={stripePromise}>
                  <CardForm
                    paymentMethod={paymentMethod}
                    subscriptions={subscriptionDetails}
                    handlePrevious={handlePrevious}
                    userDetails={userDetails}
                    token={auth?.token || ""}
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
const CardForm: React.FC<CardFormProps> = ({
  paymentMethod: initialPaymentMethod,
  subscriptions,
  userDetails,
  handlePrevious,
  token,
  userDetail,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const stripe = useStripe();
  const elements = useElements();

  const openModal = () => {
    fetchAgreementPdf();
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const fetchAgreementPdf = async (): Promise<void> => {
    if (!userDetails?.userAgreementUrl) return;

    try {
      const response = await fetch(
        `${BASE_URL}${userDetails.userAgreementUrl.replace("/uploads/", "/media/")}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
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
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const updateSubscriptionStatus = async (subscriptionId: string): Promise<void> => {
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
    } catch (error) {
      console.error("Error updating subscription status:", error);
      throw error;
    }
  };

  const handleAddPayment = async (paymentData: PaymentData, subscriptionId: string): Promise<void> => {
    try {
      const response = await axios.post(
        `${BASE_URL}/payment/newPayment`,
        {
          paymentData,
          subscriptionId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 && userDetail?._id) {
        const userResponse = await fetch(`${BASE_URL}/user/${userDetail._id}`, {
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

        if (userResponse.status === 200) {
          toast.success("Payment succeeded! Your subscription is active");
          setLoading(false);
          navigate(ROUTES.USER.HOME);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "An error occurred. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements || !userDetail?.email) {
      setLoading(false);
      return;
    }

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const paymentMethodRequest = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { email: userDetail.email },
      });

      if (paymentMethodRequest.error) {
        throw new Error(paymentMethodRequest.error.message);
      }

      if (!paymentMethodRequest.paymentMethod) {
        throw new Error("Payment method creation failed");
      }

      const { id: paymentMethodId, card } = paymentMethodRequest.paymentMethod;

      if (!card) {
        throw new Error("Card details not found");
      }

      const cardDetails: CardDetails = {
        stripePaymentMethodRequestTokenId: paymentMethodId,
        cardNumber: card.last4,
        brand: card.brand,
        expiryDate: `${card.exp_month}/${card.exp_year}`,
      };

      if (!userDetail._id) {
        throw new Error("User ID not found");
      }

      const data = {
        clientId: userDetail._id,
        methodType: initialPaymentMethod,
        cardDetails,
        isDefault: true,
      };

      const res = await axios.post(`${BASE_URL}/paymentMethod/create`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 201) {
        toast.success("Payment Method Stored");
      }

      const subscription = subscriptions[0];
      const subscriptionDurationInMonths = subscription.subscriptionDurationInMonths;
      const billingInterval = subscriptionDurationInMonths === 1 ? "month" : "year";

      const randomNumber = Math.floor(Math.random() * 9000) + 1000;
      const productName = `${subscription.productName}${userDetail.username}${randomNumber}`;
      const currency = subscription.grandTotalCurrency.toLowerCase();
      const price = subscription.grandTotal;

      const response = await fetch(`${BASE_URL}/stripe/create-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: userDetail.email,
          productName,
          price,
          currency,
          billingInterval,
          paymentMethodId,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create subscription");
      }

      const { clientSecret, stripeCustomerId, stripeSubscriptionId } = responseData;

      if (!clientSecret) {
        throw new Error("Client secret not received");
      }

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId,
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      if (!paymentResult.paymentIntent) {
        throw new Error("Payment intent not found");
      }

      const { status, id: paymentIntentId } = paymentResult.paymentIntent;

      if (status === "succeeded") {
        await updateSubscriptionStatus(subscription._id);

        const paymentData = {
          amount: price,
          currency,
          paymentMethod: "card",
          status,
          stripePaymentIntentId: paymentIntentId,
          stripeSubscriptionId,
          stripeCustomerId,
          customer: userDetail._id,
          stripeInvoiceLink: "",
          billed: billingInterval,
        };

        await handleAddPayment(paymentData, subscription._id);
      }

    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {(initialPaymentMethod === "credit_card" || initialPaymentMethod === "debit_card") && (
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
                    border: "1px solid #ced4da",
                    borderRadius: "0.25rem",
                    padding: "0.375rem 0.75rem",
                  }}
                >
                  <CardElement
                    id="card-element"
                    options={{
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
                type="button"
              >
                Check Subscription Details
              </button>

              {loading ? (
                <Spinner color="primary" size="lg" />
              ) : (
                <button
                  className="btn btn-success"
                  disabled={!agreed}
                  type="submit"
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
