import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import axios from "axios";
import { BASE_URL } from "../../../utils/endPointNames.js";
import toast from "react-hot-toast";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// import { stripePromise } from "./StripeConfig";
function ClientSubscriptionDetails() {
  const stripePromise = loadStripe(
    "pk_test_51PeI4kRovk9fbY7NlzADRlATaI6qOOBcb1bINnZDiPqcfaEdxjC9OPTMv5I6J95SgAyjGqyu4hfwkXSOuwsATkjC00dWcAlFWU"
  );

  const [auth] = useAuth();
  const { id } = useParams();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  // for stripe dialog
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = (token, subscriptionId) => {
    setModalIsOpen(false);
    fetchSubscriptionInfo(token, subscriptionId);
  };

  const fetchSubscriptionInfo = async (token, subscriptionId) => {
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
        {/* Show button only if the status is inactive or processing */}
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
                  token={auth?.token}
                  clientId={auth?.user._id}
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

                    {/* <p>
                    <strong>Shipping Address:</strong>{" "}
                    {`${subscriptionInfo.address.street1}, ${subscriptionInfo.shippingAddress.city}, ${subscriptionInfo.shippingAddress.state}, ${subscriptionInfo.shippingAddress.country}`}
                  </p> */}
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
                        // hour: "2-digit",
                        // minute: "2-digit",
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
                        // hour: "2-digit",
                        // minute: "2-digit",
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

const PaymentDetailsTable = ({ paymentDetails }) => {
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

const SubscriptionForm = ({
  isOpen,
  onClose,
  email,
  finalAmount,
  productName,
  token,
  subscriptionId,
  clientId,
}) => {
  const [price, setPrice] = useState(finalAmount); // Default monthly price
  const [billingInterval, setBillingInterval] = useState("month");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  // Function to adjust price based on billing interval
  const handleIntervalChange = (e) => {
    const selectedInterval = e.target.value;
    setBillingInterval(selectedInterval);

    // Adjust the price for yearly
    if (selectedInterval === "year") {
      setPrice(finalAmount * 12); // Example: Monthly price is 1000 INR, yearly price is 1000 * 12
    } else {
      setPrice(finalAmount); // Reset to monthly price
    }
  };

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

      onClose(token, subscriptionId);
      // setSuccessMessage(data.message);
    } catch (err) {
      // toast.error(err);
      setError(err.message);
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
        toast.success("Payment succeeded!");
        // toast.success(response.data.message); // Success message from backend
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

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Step 1: Create payment method with Stripe Elements
      const paymentMethodRequest = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
        billing_details: { email },
      });

      if (paymentMethodRequest.error) {
        throw new Error(paymentMethodRequest.error.message);
      }

      //   console.log(
      //   "Payment method created:",
      //   paymentMethodRequest.paymentMethod
      // );

      // Step 2: Send paymentMethod.id and other details to your backend
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

        // Log the error for debugging
        console.error("Error type:", type);
        console.error("Error message:", message);
        console.error("Error code:", code);

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
          //   console.log("Payment succeeded:", paymentIntent);
        } else {
          // If the status is unexpected (though it shouldn't be)
          toast.error("Unexpected payment status. Please try again.");
        }
      }

      // toast.success("Subscription successful!");
    } catch (err) {
      //   console.log("Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`modal fade ${isOpen ? "show" : ""}`}
      id="subscriptionModal"
      tabIndex="-1"
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
              onClick={onClose}
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
                onClick={onClose}
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
