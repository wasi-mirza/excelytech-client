import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import toast from "react-hot-toast";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

interface Product {
  productId: {
    sku: string;
    name: string;
  };
  newTotalCost: number;
  quantity: number;
  discount: number;
  discountType: string;
  newTax: number;
  newTotalCostWithTax: number;
}

interface PaymentDetail {
  createdAt: string;
  paymentMethod: string;
  currency: string;
  amount: number;
  status: string;
  billed: string;
}

interface SubscriptionInfo {
  _id: string;
  subscriptionStatus: string;
  customer: {
    email: string;
  };
  finalAmount: number;
  products: Product[];
  grandTotalCurrency: string;
  subscriptionDurationInMonths: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  paymentHistory: PaymentDetail[];
}

interface PaymentDetailsTableProps {
  paymentDetails: PaymentDetail[];
}

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: (token: string, subscriptionId: string) => void;
  email: string;
  finalAmount: number;
  productName: string;
  token: string;
  clientId: string;
  subscriptionId: string;
}

function ClientSubscriptionDetails() {
  const stripePromise = loadStripe(
    "pk_test_51PeI4kRovk9fbY7NlzADRlATaI6qOOBcb1bINnZDiPqcfaEdxjC9OPTMv5I6J95SgAyjGqyu4hfwkXSOuwsATkjC00dWcAlFWU"
  );

  const [auth] = useAuth();
  const { id } = useParams();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = (token: string, subscriptionId: string) => {
    setModalIsOpen(false);
    fetchSubscriptionInfo(token, subscriptionId);
  };

  const fetchSubscriptionInfo = async (token: string, subscriptionId: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/subscription/getSubscriptionById/${subscriptionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubscriptionInfo(response.data);
      console.log("SubscriptionInfo", response.data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  useEffect(() => {
    if (auth?.token && id) {
      fetchSubscriptionInfo(auth.token, id);
    }
  }, [auth, id]);

  return (
    <div className="content-wrapper ">
      <section className="content-header">
        <h1>Subscription Details </h1>{" "}
      </section>

      <section className="content">
        {subscriptionInfo ? (
          <div className="invoice p-3 mb-3">
            {/* Subscription Information */}
            <div className="card card-olive card-outline">
              <div className="card-header d-flex justify-content-between">
                <h3 className="card-title">Subscription Details</h3>
                {["inactive", "processing"].includes(
                  subscriptionInfo.subscriptionStatus
                ) && (
                  <button className="btn btn-danger" onClick={openModal}>
                    Activate Subscription
                  </button>
                )}
              </div>
              <Elements stripe={stripePromise}>
                <SubscriptionForm
                  isOpen={modalIsOpen}
                  onClose={closeModal}
                  email={subscriptionInfo.customer.email}
                  finalAmount={subscriptionInfo.finalAmount}
                  productName={
                    subscriptionInfo.products[0].productId.name +
                    subscriptionInfo.customer.email
                  }
                  token={auth?.token || ""}
                  clientId={auth?.user._id || ""}
                  subscriptionId={subscriptionInfo._id}
                />
              </Elements>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>Subscription Status:</strong>{" "}
                      <span
                        className={`badge ${
                          subscriptionInfo.subscriptionStatus === "Sent"
                            ? "badge-warning"
                            : subscriptionInfo.subscriptionStatus === "active"
                            ? "badge-success"
                            : subscriptionInfo.subscriptionStatus === "inactive"
                            ? "badge-dark"
                            : "badge-danger"
                        }`}
                      >
                        {subscriptionInfo.subscriptionStatus}
                      </span>
                    </p>

                    <p>
                      <strong>Total Amount:</strong>{" "}
                      {`${subscriptionInfo.grandTotalCurrency} ${subscriptionInfo.finalAmount} `}
                    </p>
                    <p>
                      <strong> Total no of products:</strong>{" "}
                      {`${subscriptionInfo.products.length} `}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong> Duration :</strong>{" "}
                      {subscriptionInfo.subscriptionDurationInMonths} Months
                    </p>
                    <p>
                      <strong> Start Date:</strong>{" "}
                      {new Date(
                        subscriptionInfo.subscriptionStartDate
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour12: true,
                      })}
                    </p>
                    <p>
                      <strong> End Date:</strong>{" "}
                      {new Date(
                        subscriptionInfo.subscriptionEndDate
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="card card-olive card-outline mt-4">
              <div className="card-header">
                <h3 className="card-title">Product Details</h3>
              </div>
              <div className="card-body">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Cost</th>
                      <th>Quantity</th>
                      <th>Discount</th>
                      <th>Tax</th>
                      <th>Total Cost With Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionInfo.products.map((product, index) => (
                      <tr key={index}>
                        <td>
                          <div>
                            {product.productId.sku}
                            <br />
                            {product.productId.name}
                          </div>
                        </td>
                        <td>{`${subscriptionInfo.grandTotalCurrency} ${product.newTotalCost}`}</td>
                        <td>{product.quantity}</td>
                        <td>{`${product.discount} ${product.discountType}`}</td>

                        <td>{product.newTax} %</td>
                        <td>
                          {subscriptionInfo.grandTotalCurrency}{" "}
                          {product.newTotalCostWithTax}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card card-olive card-outline mt-4">
              <div className="card-header">
                <h3 className="card-title">Payment Details</h3>
              </div>
              <div className="card-body">
                <PaymentDetailsTable
                  paymentDetails={subscriptionInfo.paymentHistory}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>Loading Subscription details...</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ClientSubscriptionDetails;

const PaymentDetailsTable: React.FC<PaymentDetailsTableProps> = ({ paymentDetails }) => {
  return (
    <table className="table table-bordered">
      <thead className="bg-gray">
        <tr>
          <th>Payment Date</th>
          <th>Payment Method</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Billed</th>
        </tr>
      </thead>
      <tbody>
        {paymentDetails.map((detail, index) => (
          <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
            <td>{new Date(detail.createdAt).toLocaleDateString()}</td>
            <td>{detail.paymentMethod}</td>
            <td>{detail.currency + " " + detail.amount}</td>
            <td>{detail.status}</td>
            <td>{detail.billed}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  isOpen,
  onClose,
  email,
  finalAmount,
  productName,
  token,
  subscriptionId,
  clientId,
}) => {
  const [price, setPrice] = useState(finalAmount);
  const [billingInterval, setBillingInterval] = useState("month");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedInterval = e.target.value;
    setBillingInterval(selectedInterval);

    if (selectedInterval === "year") {
      setPrice(finalAmount * 12);
    } else {
      setPrice(finalAmount);
    }
  };

  const updateSubscriptionStatus = async (subscriptionId: string) => {
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

      await response.json();
      onClose(token, subscriptionId);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleAddPayment = async (paymentData: any, subscriptionId: string) => {
    try {
      const payload = {
        paymentData,
        subscriptionId,
      };

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
        toast.success("Payment succeeded!");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.error || "An error occurred. Please try again."
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const paymentMethodRequest = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { email },
      });

      if (paymentMethodRequest.error) {
        throw new Error(paymentMethodRequest.error.message);
      }

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
          billingInterval,
          paymentMethodId: paymentMethodRequest.paymentMethod.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription.");
      }

      const { clientSecret, stripeCustomerId, stripeSubscriptionId } = data;

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodRequest.paymentMethod.id,
      });

      if (paymentResult.error) {
        const { type, message, code } = paymentResult.error;

        console.error("Error type:", type);
        console.error("Error message:", message);
        console.error("Error code:", code);

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

        toast.error(userMessage);
      } else {
        const paymentIntent = paymentResult.paymentIntent;

        if (paymentIntent.status === "requires_payment_method") {
          toast.error("Payment failed. Please provide a new payment method.");

          const cardElement = elements.getElement(CardElement);
          if (!cardElement) {
            throw new Error("Card element not found");
          }

          const newPaymentMethodRequest = await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
            billing_details: { email },
          });

          if (newPaymentMethodRequest.error) {
            toast.error(
              "Failed to create new payment method. Please try again."
            );
            return;
          }

          const retryPaymentResult = await stripe.confirmCardPayment(
            clientSecret,
            {
              payment_method: newPaymentMethodRequest.paymentMethod.id,
            }
          );

          if (retryPaymentResult.error) {
            console.error(
              "Error confirming payment with new method:",
              retryPaymentResult.error
            );
            toast.error("Payment failed again. Please try a different method.");
          } else {
            if (retryPaymentResult.paymentIntent.status === "succeeded") {
              await updateSubscriptionStatus(subscriptionId);

              const paymentData = {
                amount: price,
                currency: "USD",
                paymentMethod: "card",
                status: paymentIntent.status,
                stripePaymentIntentId: paymentIntent.id,
                stripeSubscriptionId: stripeSubscriptionId,
                stripeCustomerId: stripeCustomerId,
                customer: clientId,
                stripeInvoiceLink: "",
                billed: billingInterval,
              };
              await handleAddPayment(paymentData, subscriptionId);
            }
          }
        } else if (paymentIntent.status === "canceled") {
          toast.error("The payment was canceled. Please try again.");
        } else if (paymentIntent.status === "requires_action") {
          const result = await stripe.handleCardAction(
            paymentIntent.client_secret || ""
          );
          if (result.error) {
            console.error("3D Secure failed:", result.error.message);
            toast.error("3D Secure authentication failed. Please try again.");
          } else {
            await updateSubscriptionStatus(subscriptionId);
            const paymentData = {
              amount: price,
              currency: "USD",
              paymentMethod: "card",
              status: paymentIntent.status,
              stripePaymentIntentId: paymentIntent.id,
              stripeSubscriptionId: stripeSubscriptionId,
              stripeCustomerId: stripeCustomerId,
              customer: clientId,
              stripeInvoiceLink: "",
              billed: billingInterval,
            };
            await handleAddPayment(paymentData, subscriptionId);
          }
        } else if (paymentIntent.status === "succeeded") {
          await updateSubscriptionStatus(subscriptionId);

          const paymentData = {
            amount: price,
            currency: "USD",
            paymentMethod: "card",
            status: paymentIntent.status,
            stripePaymentIntentId: paymentIntent.id,
            stripeSubscriptionId: stripeSubscriptionId,
            stripeCustomerId: stripeCustomerId,
            customer: clientId,
            stripeInvoiceLink: "",
            billed: billingInterval,
          };
          await handleAddPayment(paymentData, subscriptionId);
        } else {
          toast.error("Unexpected payment status. Please try again.");
        }
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`modal fade ${isOpen ? "show" : ""}`}
      id="subscriptionModal"
      tabIndex={-1}
      aria-labelledby="subscriptionModalLabel"
      aria-hidden={!isOpen}
      style={{ display: isOpen ? "block" : "none" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="subscriptionModalLabel">
              Create Subscription
            </h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => onClose(token, subscriptionId)}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label>Email: {email}</label>
              </div>

              <div className="form-group">
                <label>Price (in USD):</label>
                <input
                  type="number"
                  value={price}
                  readOnly
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Billing Interval:</label>
                <div>
                  <div className="custom-control custom-radio">
                    <input
                      type="radio"
                      id="monthly"
                      name="interval"
                      value="month"
                      checked={billingInterval === "month"}
                      onChange={handleIntervalChange}
                      className="custom-control-input"
                    />
                    <label className="custom-control-label" htmlFor="monthly">
                      Monthly
                    </label>
                  </div>
                  <div className="custom-control custom-radio">
                    <input
                      type="radio"
                      id="yearly"
                      name="interval"
                      value="year"
                      checked={billingInterval === "year"}
                      onChange={handleIntervalChange}
                      className="custom-control-input"
                    />
                    <label className="custom-control-label" htmlFor="yearly">
                      Yearly
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Card Details:</label>
                <CardElement />
              </div>

              {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
            <div className="modal-footer">
              <button
                type="submit"
                className="btn btn-success"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Subscribe"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onClose(token, subscriptionId)}
                data-dismiss="modal"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
