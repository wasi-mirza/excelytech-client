import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../../../shared/utils/endPointNames";

function SubscriptionDetails() {
  const [auth] = useAuth();
  const { id } = useParams();
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  useEffect(() => {
    if (auth?.token && id) {
      axios
        .get(`${BASE_URL}/subscription/getSubscriptionById/${id}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then((res) => {
          setSubscriptionInfo(res.data);
          console.log("SubscriptionInfo", res.data);
        })
        .catch((error) => console.error("Error fetching order:", error));
    }
  }, [auth, id]);
  const calculateSubscriptionEndDate = (
    subscriptionStartDate: any,
    subscriptionDurationInMonths: any
  ) => {
    const startDate = new Date(subscriptionStartDate);
    startDate.setMonth(startDate.getMonth() + subscriptionDurationInMonths);
    return startDate;
  };
  return (
    <div className="content-wrapper">
      <section className="content-header">
        <h1>Subscription Details</h1>
      </section>

      {subscriptionInfo ? (
        <div className="invoice p-3 mb-3">
          {/* Subscription Information */}
          <div className="card card-olive card-outline">
            <div className="card-header">
              <h3 className="card-title">
                Subscription Id: {subscriptionInfo.subscriptionId || "N/A"}
              </h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <strong>Account Owner:</strong>
                  <br />
                  {`${subscriptionInfo.customer?.name} (${subscriptionInfo.customer?.email})`}
                </div>
                <div className="col-md-6">
                  <strong>Business Owner:</strong>
                  <br />
                  {`${subscriptionInfo.customer?.businessDetails.clientName} (${subscriptionInfo.customer?.businessDetails.ownerEmail})`}
                </div>
              </div>
              <br />
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Subscription Status:</strong>
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
                    <strong>Total Amount:</strong>
                    {`${subscriptionInfo.grandTotalCurrency} ${subscriptionInfo.finalAmount}`}
                  </p>
                  <p>
                    <strong>Total no of products:</strong>
                    {`${subscriptionInfo.products.length}`}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Duration:</strong>
                    {subscriptionInfo.subscriptionDurationInMonths} Months
                  </p>
                  <p>
                    <strong>Start Date:</strong>
                    {new Date(
                      subscriptionInfo.subscriptionStartDate
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour12: true,
                    })}
                  </p>
                  <p>
                    <strong>End Date:</strong>
                    {new Date(
                      subscriptionInfo.subscriptionEndDate
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
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
                    <th>Original Cost</th>
                    <th>Modified Cost</th>
                    <th>Quantity</th>
                    <th>Discount</th>
                    <th>Tax</th>
                    <th>Total Cost With Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionInfo.products.map((product: any, index: any) => (
                    <tr key={index}>
                      <td>
                        {product.productId.sku}
                        <br />
                        {product.productId.name}
                      </td>
                      <td>{`${subscriptionInfo.grandTotalCurrency} ${product.productId.cost}`}</td>
                      <td>{`${subscriptionInfo.grandTotalCurrency} ${product.newTotalCost}`}</td>
                      <td>{product.quantity}</td>
                      <td>{`${product.discount} ${product.discountType}`}</td>
                      <td>{product.newTax} %</td>
                      <td>{`${subscriptionInfo.grandTotalCurrency} ${product.newTotalCostWithTax}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Details */}
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
    </div>
  );
}

export default SubscriptionDetails;

const PaymentDetailsTable = ({ paymentDetails }: any) => {
  return (
    <div className="card-body table-responsive p-0">
      <table className="table table-bordered table-hover text-center">
        <thead className="bg-dark text-white">
          <tr>
            <th>Amount</th>
            <th>Payment Date</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Stripe Subscription ID</th>
            <th>Stripe Payment Intent ID</th>
            <th>Stripe Customer ID</th>
          </tr>
        </thead>
        <tbody>
          {paymentDetails.length > 0 ? (
            paymentDetails.map((detail: any, index: any) => (
              <tr key={index}>
                <td>
                  {detail.currency} {detail.amount}
                </td>

                <td>
                  {new Date(detail.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour12: true,
                  })}
                </td>
                <td>{detail.paymentMethod}</td>
                <td>
                  <span
                    className={`badge ${
                      detail.status === "completed"
                        ? "badge-success"
                        : detail.status === "pending"
                        ? "badge-warning"
                        : "badge-danger"
                    }`}
                  >
                    {detail.status}
                  </span>
                </td>
                <td>{detail.stripeSubscriptionId || "N/A"}</td>
                <td>{detail.stripePaymentIntentId || "N/A"}</td>
                <td>{detail.stripeCustomerId || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8}>No payment details available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
