import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Col, Row, ProgressBar, Table, Badge } from "react-bootstrap";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import { useAuth } from "../../../context/AuthContext";

interface Payment {
  createdAt: string;
  amount: number;
  currency: string;
}

interface AuthUser {
  _id: string;
  token: string;
  user: {
    _id: string;
  };
}

const ClientHome = () => {
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [inactiveSubscriptions, setInActiveSubscriptions] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [auth] = useAuth();
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [userName, setUserName] = useState("John Doe");

  const fetchPaymentsByCustomer = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/payment/byClient/${auth?.user._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      // Check response status
      if (response.status === 200) {
        console.log("Payments fetched successfully:", response.data);
        setRecentPayments(response.data);
        return response.data; // Return the payments data
      } else {
        console.error("Failed to fetch payments:", response.statusText);
        return { error: response.statusText };
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error fetching payments by customer:", err.message);
      return { error: err.message };
    }
  };

  // Fetch subscriptions and tickets from API
  const fetchData = async () => {
    try {
      // Fetch active subscriptions
      try {
        const response = await axios.get(
          `${BASE_URL}/subscription/active/${auth?.user._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );
        console.log("URI", `${BASE_URL}/subscription/active/${auth?.user._id}`);

        if (response.status === 200 || response.status === 201) {
          console.log("Active Subscriptions Response:", response.data);
          setActiveSubscriptions(response.data.activeSubscriptions.length);
        } else {
          console.warn(
            "Unexpected status for active subscriptions:",
            response.status
          );
        }
      } catch (activeError) {
        console.error("Error fetching active subscriptions:", activeError);
        setActiveSubscriptions(0); // Fallback to 0 if an error occurs
      }

      // Fetch inactive subscriptions
      try {
        const res = await axios.get(
          `${BASE_URL}/subscription/inactive/${auth?.user._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );

        if (res.status === 200 || res.status === 201) {
          console.log("Inactive Subscriptions Response:", res.data);
          setInActiveSubscriptions(res.data.inactiveSubscriptions.length);
        } else {
          console.warn(
            "Unexpected status for inactive subscriptions:",
            res.status
          );
        }
      } catch (inactiveError) {
        console.error("Error fetching inactive subscriptions:", inactiveError);
        setInActiveSubscriptions(0); // Fallback to 0 if an error occurs
      }

      // Fetch open tickets
      try {
        const ticketResponse = await axios.get(
          `${BASE_URL}/ticket/getticketforclient/${auth?.user._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );

        if (ticketResponse.status === 200 || ticketResponse.status === 201) {
          console.log("Tickets Response:", ticketResponse.data);
          setOpenTickets(ticketResponse.data.tickets.length);
        } else {
          console.warn("Unexpected status for tickets:", ticketResponse.status);
        }
      } catch (ticketError) {
        console.error("Error fetching open tickets:", ticketError);
        setOpenTickets(0); // Fallback to 0 if an error occurs
      }
    } catch (error) {
      console.error("Unexpected error in fetchData:", error);
    }
    fetchPaymentsByCustomer();
  };

  useEffect(() => {
    fetchData();
  }, [auth]);

  return (
    <div className="content-wrapper ">
      <div className="container-fluid">
        <Row>
          {/* Welcome Message */}
          <Col md={12} className="mb-4 mt-4 px-6">
            <h3 className="text-start">Welcome, {userName}!</h3>
          </Col>
        </Row>
        <Row className="gy-4">
          {/* Active Subscriptions */}
          <Col md={4}>
            <div className="small-box bg-success">
              <div className="inner">
                <h3>{activeSubscriptions}</h3>
                <p>Active Subscriptions</p>
              </div>
              <div className="icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="progress">
                <div
                  className="progress-bar bg-dark"
                  style={{
                    width: `${activeSubscriptions * 10}%`,
                    height: "10px",
                  }}
                ></div>
              </div>
            </div>
          </Col>

          {/* Inactive Subscriptions */}
          <Col md={4}>
            <div className="small-box bg-danger">
              <div className="inner">
                <h3>{inactiveSubscriptions}</h3>
                <p>Inactive Subscriptions</p>
              </div>
              <div className="icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="progress">
                <div
                  className="progress-bar bg-dark"
                  style={{
                    width: `${inactiveSubscriptions * 10}%`,
                    height: "10px",
                  }}
                ></div>
              </div>
            </div>
          </Col>

          {/* Open Tickets */}
          <Col md={4}>
            <div className="small-box bg-warning">
              <div className="inner">
                <h3>{openTickets}</h3>
                <p>Open/In progress Tickets</p>
              </div>
              <div className="icon">
                <i className="fas fa-ticket-alt"></i>
              </div>
              <div className="progress">
                <div
                  className="progress-bar bg-dark"
                  style={{ width: `${openTickets * 10}%`, height: "10px" }}
                ></div>
              </div>
            </div>
          </Col>
        </Row>

        <br />
        {/* Recent Payments */}
        <Row className="gy-4">
          <Col md={6}>
            <div className="card card-info shadow-sm">
              <div className="card-header">
                <h3 className="card-title text-uppercase fw-bold">
                  Recent Payments
                </h3>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover table-bordered table-sm">
                    <thead className="thead-light">
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments && recentPayments.length > 0 ? (
                        recentPayments.map((payment, index) => (
                          <tr key={index}>
                            <td>
                              {new Date(payment.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}
                            </td>
                            <td>{payment.currency + " " + payment.amount}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center text-muted">
                            No recent payments available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ClientHome;
