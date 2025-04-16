import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../shared/utils/endPointNames.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

import { Spinner, Container } from "reactstrap";

function AddPaymentMethod() {
  const [methodType, setMethodType] = useState("");
  const [cardDetails, setCardDetails] = useState({
    stripePaymentMethodRequestTokenId: "",
    cardNumber: "",
    expiryDate: "",
    brand: "",
    cvv: "",
  });
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    bankName: "",
    ifscCode: "",
  });
  const [upiDetails, setUpiDetails] = useState({ upiId: "" });
  const [paypalDetails, setPaypalDetails] = useState({
    paypalEmail: "",
    payerId: "",
  });
  const [showDefault, setShowDefault] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [auth] = useAuth();
  // Replace with your actual base URL
  const stripe = useStripe();
  const elements = useElements();
  const handleSubmit = async (e) => {
    const email = auth?.user.email;
    e.preventDefault();
    if (methodType === "") {
      toast.error("Choose Payment method");
      return;
    }
    setLoading(true);
    try {
      // // If `isDefault` is true, reset all other methods for this client
      // if (isDefault) {
      //   await axios.patch(
      //     `${BASE_URL}/paymentMethod/default`,
      //     { clientId: auth?.user._id },
      //     {
      //       headers: {
      //         Authorization: `Bearer ${auth?.token}`,
      //       },
      //     }
      //   );
      //   // console.log("Res",response);
      // }
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
          clientId: auth?.user._id,
          methodType: methodType,
          cardDetails: cardDetails,
          isDefault: true,
        };
        console.log("data", `${BASE_URL}/paymentMethod/create`, data);

        // Store card details to the db
        // Add the new payment method
        const res = await axios.post(`${BASE_URL}/paymentMethod/create`, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        if (res.status === 201) {
          toast.success("Payment Method Stored");

          setLoading(false);
          navigate(-1);
        } else {
          setLoading(false);
          toast.error("Failed to store Payment Method");
        }
      }
      // const data = {
      //   clientId: auth?.user._id,
      //   methodType,
      //   cardDetails: methodType.includes("card") ? cardDetails : "",
      //   bankDetails: methodType === "bank_account" ? bankDetails : "",
      //   upiDetails: methodType === "upi" ? upiDetails : "",
      //   paypalDetails: methodType === "paypal" ? paypalDetails : "",
      //   isDefault,
      // };

      // // Add the new payment method
      // const res = await axios.post(`${BASE_URL}/paymentMethod/create`, data, {
      //   headers: {
      //     Authorization: `Bearer ${auth?.token}`,
      //   },
      // });
    } catch (error) {
      console.error("Error adding payment method:", error);
      alert(error.res.data?.message || "Failed to add payment method.");
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (methodType) {
      case "credit_card":
      case "debit_card":
        return (
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
            </div>
          </form>
        );
      case "bank_account":
        return (
          <>
            <div className="form-group">
              <label>
                Account Number{" "}
                <small className="text-muted">(e.g., 1234567890)</small>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter account number"
                pattern="^[0-9]+$"
                value={bankDetails.accountNumber}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    accountNumber: e.target.value,
                  })
                }
                onInvalid={(e) =>
                  e.target.setCustomValidity(
                    "Account Number must contain only numbers."
                  )
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
            </div>
            <div className="form-group">
              <label>
                Bank Name{" "}
                <small className="text-muted">
                  (e.g., State Bank of India)
                </small>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter bank name"
                value={bankDetails.bankName}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, bankName: e.target.value })
                }
                onInvalid={(e) =>
                  e.target.setCustomValidity("Please enter a valid bank name.")
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
            </div>
            <div className="form-group">
              <label>
                IFSC Code{" "}
                <small className="text-muted">(e.g., SBIN0001234)</small>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter IFSC code"
                pattern="^[A-Za-z]{4}\d{7}$"
                value={bankDetails.ifscCode}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, ifscCode: e.target.value })
                }
                onInvalid={(e) =>
                  e.target.setCustomValidity(
                    "IFSC Code must follow the pattern: 4 letters followed by 7 digits (e.g., SBIN0001234)."
                  )
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
            </div>
          </>
        );
      case "upi":
        return (
          <div className="form-group">
            <label>
              UPI ID <small className="text-muted">(e.g., username@bank)</small>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter UPI ID"
              pattern="^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$"
              value={upiDetails.upiId}
              onChange={(e) =>
                setUpiDetails({ ...upiDetails, upiId: e.target.value })
              }
              onInvalid={(e) =>
                e.target.setCustomValidity(
                  "UPI ID must be in the format username@bank (e.g., john.doe@hdfc)."
                )
              }
              onInput={(e) => e.target.setCustomValidity("")}
              required
            />
          </div>
        );
      case "paypal":
        return (
          <>
            <div className="form-group">
              <label>
                PayPal Email{" "}
                <small className="text-muted">(e.g., example@email.com)</small>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter PayPal email"
                value={paypalDetails.paypalEmail}
                onChange={(e) =>
                  setPaypalDetails({
                    ...paypalDetails,
                    paypalEmail: e.target.value,
                  })
                }
                onInvalid={(e) =>
                  e.target.setCustomValidity(
                    "Please enter a valid email address (e.g., example@email.com)."
                  )
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
            </div>
            <div className="form-group">
              <label>
                Payer ID{" "}
                <small className="text-muted">(e.g., 123456789ABCDEF)</small>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Payer ID"
                pattern="^[a-zA-Z0-9]+$"
                value={paypalDetails.payerId}
                onChange={(e) =>
                  setPaypalDetails({
                    ...paypalDetails,
                    payerId: e.target.value,
                  })
                }
                onInvalid={(e) =>
                  e.target.setCustomValidity(
                    "Payer ID must contain only alphanumeric characters."
                  )
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Payment Method Type</label>
        <select
          className="form-control"
          value={methodType}
          onChange={(e) => setMethodType(e.target.value)}
          required
        >
          <option value="">Select Method</option>
          <option value="credit_card">Credit Card</option>
          <option value="debit_card">Debit Card</option>
          {/* <option value="bank_account">Bank Account</option>
                  <option value="upi">UPI</option>
                  <option value="paypal">PayPal</option> */}
        </select>
      </div>
      {renderFormFields()}
      <div className="d-flex justify-content-between align-items-center">
        <div className="form-check mt-3">
          <input
            type="checkbox"
            className="form-check-input"
            checked={isDefault}
            onChange={() => setIsDefault(!isDefault)}
          />
          <label className="form-check-label">Set as Default</label>
        </div>

        <button
          className="btn btn-success"
          disabled={!stripe || loading}
          onClick={handleSubmit}
        >
          {loading ? "Adding..." : " Add Payment Method"}
        </button>
      </div>
    </form>
  );
}

export default AddPaymentMethod;
