import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getOpenTicketsByPriority,
  getMonthlyRevenue,
  getSubscriptionStats,
} from "../../../shared/api/endpoints/home";
import {
  OpenTicketsByPriority,
  SubscriptionStats,
} from "../../../shared/api/types/home.types";
function AdminHome() {
  const [auth] = useAuth();
  const [subscriptionStats, setSubscriptionStats] =
    useState<SubscriptionStats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null);
  const [ticketsByPriority, setTicketsByPriority] =
    useState<OpenTicketsByPriority | null>(null);

  const fetchOpenTicketsByPriority = async () => {
    try {
      const response = await getOpenTicketsByPriority();
      if (response.status === 200) {
        setTicketsByPriority(response.data);
      }
    } catch (error) {
      console.error("Error fetching open tickets by priority:", error);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const today = new Date(); // Get the current date
      const year = today.getFullYear(); // Get the current year
      const month = today.getMonth() + 1; // Get the current month (0-based, so add 1 to match 1-12 range)

      const response = await getMonthlyRevenue({
        year, // Pass the dynamically calculated year
        month, // Pass the dynamically calculated month
      });

      if (response.status === 200 || response.status === 201) {
        setMonthlyRevenue(response?.data?.monthlyRevenue);
        // Check if the expected structure exists
      } else {
        console.warn("Unexpected status for monthly revenue:", response.status);
        setMonthlyRevenue(null); // Default to 0 if the status is unexpected
      }
    } catch (activeError) {
      console.error("Error fetching monthly revenue:", activeError);
      setMonthlyRevenue(null); // Fallback to 0 if an error occurs
    }
  };

  const fetchsubscriptionStats = async () => {
    try {
      const response = await getSubscriptionStats();

      if (response.status === 200 || response.status === 201) {
        //console.log("Active Subscriptions Response:", response.data);

        setSubscriptionStats(response.data);
        // Check if the expected structure exists
      } else {
        console.warn(
          "Unexpected status for active subscriptions:",
          response.status
        );
        setSubscriptionStats(null); // Default to 0 if the status is unexpected
      }
    } catch (activeError) {
      console.error("Error fetching active subscriptions:", activeError);
      setSubscriptionStats(null); // Fallback to 0 if an error occurs
    }
  };

  useEffect(() => {
    fetchsubscriptionStats();
    fetchMonthlyRevenue();
    fetchOpenTicketsByPriority();
  }, [auth]);

  return (
    <div className="content-wrapper">
      {/* Content Header (Page header) */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Dashboard</h1>
            </div>
            {/* /.col */}
            {/* <div className="col-sm-6">
              <form className="form-inline float-right">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search for accounts"
                  />
                  <div className="input-group-append">
                    <button type="submit" className="btn btn-success">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div> */}
            {/* /.col */}
          </div>
          {/* /.row */}
        </div>
        {/* /.container-fluid */}
      </div>
      {/* /.content-header */}

      {/* Main Content */}
      <section className="content">
        <div className="container-fluid">
          {/* Overview Section */}
          <div className="row">
            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>{subscriptionStats?.active}</h3>
                  <p>Active Subscriptions</p>
                </div>
                <div className="icon">
                  <i className="fas fa-users"></i>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>${monthlyRevenue}</h3>
                  <p>Monthly Revenue</p>
                </div>
                <div className="icon">
                  <i className="fas fa-chart-line"></i>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>5</h3>
                  <p>Top Clients</p>
                </div>
                <div className="icon">
                  <i className="fas fa-user-tie"></i>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-danger">
                <div className="inner">
                  <h3>
                    {ticketsByPriority === null
                      ? 0
                      : ticketsByPriority?.totalOpenTickets}
                  </h3>
                  <p>Open Tickets</p>
                </div>
                <div className="icon">
                  <i className="fas fa-ticket-alt"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Management Section */}
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title">Subscription Management</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <p>
                    <strong>Active vs. Expired Subscriptions:</strong>
                    <br /> Active : {subscriptionStats?.active}, Expired :{" "}
                    {subscriptionStats?.expired}
                  </p>
                </div>
                <div className="col-md-4">
                  <p>
                    <strong>Processing vs. Inactive Subscriptions:</strong>
                    <br /> Processing : {subscriptionStats?.processing},
                    Inactive : {subscriptionStats?.inactive}
                  </p>
                </div>
                <div className="col-md-4">
                  <p>
                    <strong>Cancelled :</strong> {subscriptionStats?.cancelled}
                  </p>
                </div>

                {/* <div className="col-md-4">
                  <p>
                    <strong>Churn Rate:</strong> 5% this month.
                  </p>
                </div> */}
              </div>
            </div>
          </div>

          {/* Support & Incidents Section */}
          <div className="card">
            <div className="card-header bg-warning text-white">
              <h3 className="card-title">Support & Incidents</h3>
            </div>
            <div className="card-body">
              {ticketsByPriority === null ? (
                <div>No Tickets or Incidents</div>
              ) : (
                <div className="row">
                  <div className="col-md-4">
                    <p>
                      <strong>Open Tickets by Priority:</strong>{" "}
                      {ticketsByPriority?.openTicketsByPriority.map(
                        (tickets) => (
                          <p>
                            {tickets?._id}:{tickets?.count}
                          </p>
                        )
                      )}
                    </p>
                  </div>
                  {/* <div className="col-md-4">
                    <p>
                      <strong>Avg. Response Time:</strong> 2 hours
                    </p>
                  </div>
                  <div className="col-md-4">
                    <p>
                      <strong>SLA Compliance:</strong> 90%
                    </p>
                  </div> */}
                </div>
              )}
            </div>
          </div>

          {/* Service Utilization Section */}
          {/* <div className="card">
            <div className="card-header bg-info text-white">
              <h3 className="card-title">Service Utilization</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <p>
                    <strong>Service Usage Metrics:</strong> Data usage: 80%
                  </p>
                </div>
                <div className="col-md-4">
                  <p>
                    <strong>Top-Used Services:</strong> Backup and Analytics
                  </p>
                </div>
                <div className="col-md-4">
                  <p>
                    <strong>Alerts:</strong> 2 clients exceeding limits.
                  </p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </section>
    </div>
  );
}

export default AdminHome;
