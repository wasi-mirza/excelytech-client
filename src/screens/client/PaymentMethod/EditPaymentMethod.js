import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../shared/utils/endPointNames.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import * as Routes from "../../../shared/utils/routes.js";

const EditPaymentMethod = () => {
  const { id } = useParams(); // Getting the payment method ID from the URL
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [methodType, setMethodType] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
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
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [auth] = useAuth();
  const navigate = useNavigate();

  // Fetch the payment method data to edit
  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/paymentMethod/${id}`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        const data = response.data;
        setPaymentMethod(data);
        setMethodType(data.methodType);
        setIsDefault(data.isDefault);

        // Set specific details based on method type
        if (
          data.methodType === "credit_card" ||
          data.methodType === "debit_card"
        ) {
          setCardDetails(data.cardDetails);
          console.log("cardDetails", data.cardDetails);
        } else if (data.methodType === "bank_account") {
          setBankDetails(data.bankDetails);
        } else if (data.methodType === "upi") {
          setUpiDetails(data.upiDetails);
        } else if (data.methodType === "paypal") {
          setPaypalDetails(data.paypalDetails);
        }
      } catch (error) {
        alert("Error fetching payment method data");
      }
    };

    fetchPaymentMethod();
  }, [id, auth?.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updatedData = {
      methodType,
      cardDetails:
        methodType === "credit_card" || methodType === "debit_card"
          ? cardDetails
          : {},
      bankDetails: methodType === "bank_account" ? bankDetails : {},
      upiDetails: methodType === "upi" ? upiDetails : {},
      paypalDetails: methodType === "paypal" ? paypalDetails : {},
      isDefault,
    };

    if (isDefault) {
      await axios.patch(
        `${BASE_URL}/paymentMethod/default`,
        { clientId: auth?.user._id },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      // console.log("Res",response);
    }

    try {
      await axios.put(`${BASE_URL}/paymentMethod/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      alert("Payment method updated successfully!");
      navigate(-1); // Navigate to the list of payment methods
    } catch (error) {
      alert("Error updating payment method");
      setLoading(false);
    }
  };

  if (!paymentMethod) {
    return <div>Loading...</div>;
  }

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between my-3">
            <div className="col-md-4">
              {/* <h1 className="text-left font-weight">Edit Payment Method</h1> */}
            </div>
          </div>
        </div>
      </section>
      <div className="card">
        <div className="card-header bg-primary">
          <h3 className="card-title">Edit Payment Method</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Payment Method Type</label>
              <select
                className="form-control"
                value={methodType}
                onChange={(e) => setMethodType(e.target.value)}
                required
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_account">Bank Account</option>
                <option value="upi">UPI</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {methodType === "credit_card" || methodType === "debit_card" ? (
              <>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={cardDetails.cardNumber}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cardNumber: e.target.value,
                      })
                    }
                    maxLength="16"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    className="form-control"
                    value={cardDetails.expiryDate}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        expiryDate: e.target.value,
                      })
                    }
                    pattern="^(0[1-9]|1[0-2])\/\d{2}$"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="cvv is not visible for security reasons"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                    maxLength="4"
                    // required
                  />
                </div>
              </>
            ) : methodType === "bank_account" ? (
              <>
                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={bankDetails.accountNumber}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        accountNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={bankDetails.bankName}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        bankName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={bankDetails.ifscCode}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        ifscCode: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </>
            ) : methodType === "upi" ? (
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={upiDetails.upiId}
                  onChange={(e) =>
                    setUpiDetails({ ...upiDetails, upiId: e.target.value })
                  }
                  required
                />
              </div>
            ) : methodType === "paypal" ? (
              <>
                <div className="form-group">
                  <label>PayPal Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={paypalDetails.paypalEmail}
                    onChange={(e) =>
                      setPaypalDetails({
                        ...paypalDetails,
                        paypalEmail: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payer ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={paypalDetails.payerId}
                    onChange={(e) =>
                      setPaypalDetails({
                        ...paypalDetails,
                        payerId: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </>
            ) : null}

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
              type="submit"
              className="btn btn-success mt-4"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Payment Method"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPaymentMethod;
