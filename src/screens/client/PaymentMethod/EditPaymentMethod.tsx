import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import { useAuth } from "../../../context/AuthContext";
import * as Routes from "../../../shared/utils/routes";

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
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

interface PaymentMethod {
  _id: string;
  methodType: string;
  cardDetails?: CardDetails;
  bankDetails?: BankDetails;
  upiDetails?: UpiDetails;
  paypalDetails?: PaypalDetails;
  isDefault: boolean;
}

interface Auth {
  token: string;
  user: {
    _id: string;
  };
}

const EditPaymentMethod = () => {
  const { id } = useParams();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [methodType, setMethodType] = useState<string>("");
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: "",
    expiryDate: "",
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
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [auth] = useAuth();
  const navigate = useNavigate();

  // Fetch the payment method data to edit
  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const response = await axios.get<PaymentMethod>(`${BASE_URL}/paymentMethod/${id}`, {
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
          setCardDetails(data.cardDetails || cardDetails);
          console.log("cardDetails", data.cardDetails);
        } else if (data.methodType === "bank_account") {
          setBankDetails(data.bankDetails || bankDetails);
        } else if (data.methodType === "upi") {
          setUpiDetails(data.upiDetails || upiDetails);
        } else if (data.methodType === "paypal") {
          setPaypalDetails(data.paypalDetails || paypalDetails);
        }
      } catch (error) {
        alert("Error fetching payment method data");
      }
    };

    fetchPaymentMethod();
  }, [id, auth?.token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setMethodType(e.target.value)}
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setCardDetails({
                        ...cardDetails,
                        cardNumber: e.target.value,
                      })
                    }
                    maxLength={16}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    className="form-control"
                    value={cardDetails.expiryDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                    maxLength={4}
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
