import React, { useState, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Spinner, Container } from "reactstrap";

interface CardDetails {
  stripePaymentMethodRequestTokenId: string;
  cardNumber: string;
  expiryDate: string;
  brand: string;
  cvv: string;
}

interface BankDetails {
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

interface UpiDetails {
  upiId: string;
}

interface PaypalDetails {
  paypalEmail: string;
  payerId: string;
}

interface Auth {
  user: {
    _id: string;
    email: string;
  };
  token: string;
}

interface PaymentMethodRequest {
  error?: {
    message: string;
  };
  paymentMethod?: {
    id: string;
    card: {
      last4: string;
      brand: string;
      exp_month: number;
      exp_year: number;
    };
  };
}

function AddPaymentMethod() {
  const [methodType, setMethodType] = useState("");
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    stripePaymentMethodRequestTokenId: "",
    cardNumber: "",
    expiryDate: "",
    brand: "",
    cvv: "",
  });
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountNumber: "",
    bankName: "",
    ifscCode: "",
  });
  const [upiDetails, setUpiDetails] = useState<UpiDetails>({ upiId: "" });
  const [paypalDetails, setPaypalDetails] = useState<PaypalDetails>({
    paypalEmail: "",
    payerId: "",
  });
  const [showDefault, setShowDefault] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [auth, setAuth] = useAuth();
  
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const email = auth?.user.email;

    if (methodType === "") {
      toast.error("Choose Payment method");
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const paymentMethodRequest = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { email: email || "" }
      }) as PaymentMethodRequest;

      if (paymentMethodRequest.error) {
        throw new Error(paymentMethodRequest.error.message);
      }

      if (paymentMethodRequest.paymentMethod?.id) {
        console.log(
          "paymentMethodRequest.id",
          paymentMethodRequest.paymentMethod.id
        );

        const cardDetails = {
          stripePaymentMethodRequestTokenId: paymentMethodRequest.paymentMethod.id,
          cardNumber: paymentMethodRequest.paymentMethod.card.last4,
          brand: paymentMethodRequest.paymentMethod.card.brand,
          expiryDate: `${paymentMethodRequest.paymentMethod.card.exp_month}/${paymentMethodRequest.paymentMethod.card.exp_year}`,
        };

        console.log("Card details", cardDetails);

        const data = {
          clientId: auth?.user._id,
          methodType: methodType,
          cardDetails: cardDetails,
          isDefault: true,
        };

        console.log("data", `${BASE_URL}/paymentMethod/create`, data);

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
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast.error("Failed to add payment method");
      setLoading(false);
    }
  };

  const handleInputInvalid = (e: React.InvalidEvent<HTMLInputElement>, message: string) => {
    e.currentTarget.setCustomValidity(message);
  };

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.setCustomValidity("");
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setBankDetails({
                    ...bankDetails,
                    accountNumber: e.target.value,
                  })
                }
                onInvalid={(e: any) => handleInputInvalid(e, "Account Number must contain only numbers.")}
                onInput={handleInputChange}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setBankDetails({ ...bankDetails, bankName: e.target.value })
                }
                onInvalid={(e: any) => handleInputInvalid(e, "Please enter a valid bank name.")}
                onInput={handleInputChange}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setBankDetails({ ...bankDetails, ifscCode: e.target.value })
                }
                onInvalid={(e: any) => handleInputInvalid(e, "IFSC Code must follow the pattern: 4 letters followed by 7 digits.")}
                onInput={handleInputChange}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUpiDetails({ ...upiDetails, upiId: e.target.value })
              }
              onInvalid={(e: any) => handleInputInvalid(e, "UPI ID must be in the format username@bank.")}
              onInput={handleInputChange}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPaypalDetails({
                    ...paypalDetails,
                    paypalEmail: e.target.value,
                  })
                }
                onInvalid={(e: any) => handleInputInvalid(e, "Please enter a valid email address.")}
                onInput={handleInputChange}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPaypalDetails({
                    ...paypalDetails,
                    payerId: e.target.value,
                  })
                }
                onInvalid={(e: any) => handleInputInvalid(e, "Payer ID must contain only alphanumeric characters.")}
                onInput={handleInputChange}
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
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setMethodType(e.target.value)}
          required
        >
          <option value="">Select Method</option>
          <option value="credit_card">Credit Card</option>
          <option value="debit_card">Debit Card</option>
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
