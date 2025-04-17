import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BASE_URL } from "../../../shared/utils/endPointNames.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/utils/routes.js";
import AddPaymentMethod from "../PaymentMethod/NewPaymentMethod";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

const PaymentMethods = () => {
  const stripePromise = loadStripe(
    "pk_test_51PeI4kRovk9fbY7NlzADRlATaI6qOOBcb1bINnZDiPqcfaEdxjC9OPTMv5I6J95SgAyjGqyu4hfwkXSOuwsATkjC00dWcAlFWU"
  );
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);

  // Toggle function to open and close the modal
  const toggle = () => setModal(!modal);

  // Fetch payment methods from the API
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/paymentMethod/all`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        setPaymentMethods(response.data);
        setLoading(false);
        console.log("Pay Method", response.data);
      } catch (err) {
        setError("Failed to fetch payment methods");
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  // Handle delete payment method
  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this payment method?")
    ) {
      try {
        await axios.delete(`${BASE_URL}/paymentMethod/${id}`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        setPaymentMethods(paymentMethods.filter((method) => method._id !== id));
        alert("Payment method deleted successfully.");
      } catch (err) {
        console.error(err);
        alert("Failed to delete the payment method.");
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="card">
          <div className="card-header">
            <div className="row align-items-center justify-content-between my-3">
              <div className="col-md-4">
                <h3 className="text-left font-weight">Payment Method</h3>
              </div>
              <div className="col-md-8 d-flex justify-content-end">
                <button onClick={toggle} className="btn btn-success ml-2">
                  <i className="fas fa-plus mr-1"></i> Add Payment Method
                </button>
                <Modal
                  isOpen={modal}
                  toggle={toggle}
                  backdrop="static"
                  size="lg"
                >
                  <ModalHeader toggle={toggle}>New Payment Method</ModalHeader>
                  <ModalBody>
                    <Elements stripe={stripePromise}>
                      <AddPaymentMethod />
                    </Elements>
                  </ModalBody>
                </Modal>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              {paymentMethods?.map((paymentMethod) => (
                <div key={paymentMethod._id} className="col-md-4 mb-4">
                  <div
                    className={`card ${
                      paymentMethod.methodType === "credit_card" ||
                      paymentMethod.methodType === "debit_card"
                        ? "credit-card"
                        : "shadow-sm"
                    }`}
                  >
                    <div className="card-body">
                      {/* Credit/Debit Card Design */}
                      {(paymentMethod.methodType === "credit_card" ||
                        paymentMethod.methodType === "debit_card") && (
                        <div className="credit-card-content">
                          {/* <div className="bank-name">YOUR BANK</div> */}
                          <div className="card-number">
                            {paymentMethod.cardDetails.cardNumber.replace(
                              /\d{4}(?=\d)/g,
                              "**** "
                            )}
                          </div>
                          <div className="card-footer-details text-white">
                            <span>
                              <strong>Exp:</strong>{" "}
                              {paymentMethod.cardDetails.expiryDate}
                            </span>
                            {/* <span>
                            <strong>CVV:</strong>{" "}
                            {paymentMethod.cardDetails.cvv}
                          </span> */}
                          </div>
                        </div>
                      )}

                      {/* Other Payment Methods */}
                      {paymentMethod.methodType !== "credit_card" &&
                        paymentMethod.methodType !== "debit_card" && (
                          <>
                            {/* <p>
                            <strong>Method Type:</strong>{" "}
                            {paymentMethod.methodType.replace("_", " ")}
                          </p> */}
                            {paymentMethod.methodType === "bank_account" && (
                              <p>
                                <strong>Bank:</strong>{" "}
                                {paymentMethod.bankDetails.bankName} <br />
                                <strong>Account:</strong>{" "}
                                {paymentMethod.bankDetails.accountNumber.slice(
                                  -4
                                )}
                              </p>
                            )}
                            {paymentMethod.methodType === "upi" && (
                              <p>
                                <strong>UPI ID:</strong>{" "}
                                {paymentMethod.upiDetails.upiId}
                              </p>
                            )}
                            {paymentMethod.methodType === "paypal" && (
                              <p>
                                <strong>PayPal Email:</strong>{" "}
                                {paymentMethod.paypalDetails.paypalEmail}
                              </p>
                            )}
                          </>
                        )}
                    </div>
                    <div className="card-footer text-right">
                      {paymentMethod.isDefault && (
                        <span className="badge badge-success mr-2">
                          Default
                        </span>
                      )}
                      <button
                        onClick={() =>
                          navigate(ROUTES.USER.EDIT_PAY_METHOD(paymentMethod._id))
                        }
                        className="btn btn-warning btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(paymentMethod._id)}
                        className="btn btn-danger btn-sm ml-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>{" "}
      </section>
    </div>
  );
};

export default PaymentMethods;

{
  /*  */
}
