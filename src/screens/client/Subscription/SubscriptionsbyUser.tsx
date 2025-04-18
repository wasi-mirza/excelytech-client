import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/utils/routes";
function SubscriptionsbyUser() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [auth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Set default value to empty string
  const navigate = useNavigate();
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch subscriptions on component mount or when page changes
  const fetchSubscriptions = async (page = 1) => {
    console.log("auth", auth);

    try {
      const response = await axios.get(
        `${BASE_URL}/subscription/${auth.user._id}?page=${page}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      // console.log("response", response.data.subscriptions[0].customer);
      setSubscriptions(response.data.subscriptions); // Set subscriptions data
      setTotalPages(response.data.totalPages); // Set total pages
      setCurrentPage(page); // Set current page
    } catch (err) {
      setError("Failed to fetch subscriptions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchSubscriptions(currentPage);
    }
  }, [auth, currentPage]);

  // Handle Page Change
  const handlePageChange = (page) => {
    fetchSubscriptions(page);
  };

  // Handle Previous Page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchSubscriptions(currentPage - 1);
    }
  };

  // Handle Next Page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchSubscriptions(currentPage + 1);
    }
  };

  // Handle Search Input Change
  const handleSearch = (event) => {
    setSearchQuery(event.target.value); // Update searchQuery when input changes
  };

  const handleViewSubscription = (data) => {
    navigate(ROUTES.USER.SUBSCRIPTION_DETAILS(data._id));
  };

  // // Filter subscriptions based on the search query
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    return (
      subscription.customer.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      subscription.subscriptionStatus
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between my-3">
            <div className="col-12 col-md-4 mb-2 mb-md-0">
              <h1 className="font-weight-bold">SubscriptionDetails</h1>
            </div>
            <div className="col-12 col-md-8 d-flex flex-column flex-md-row justify-content-md-end">
              {/* <div className="form-group mb-2 mb-md-0 flex-grow-1 mr-md-3">
                <div className="input-group">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search..."
                    value={searchQuery} // Bind searchQuery to the input field
                    onChange={handleSearch} // Call handleSearch when input changes
                  />
                  <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button">
                      <i className="fa fa-search" />
                    </button>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {/* Subscription Table */}
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="bg-dark">
                    <tr>
                      {/* <th>Active Payment </th> */}
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Product(s)</th>
                      <th>Subscription Start Date</th>
                      <th>Subscription End Date</th>
                      {/* <th>Duration (months)</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {/* If no error, map over filtered subscriptions */}
                    {/* Loading and Error Messages */}
                    {loading && (
                      <tr className="text-center" role="alert">
                        Loading...
                      </tr>
                    )}
                    {error && (
                      <tr className="text-center" role="alert">
                        {error}
                      </tr>
                    )}
                    {!error &&
                      filteredSubscriptions.map((subscription) => (
                        <tr
                          key={subscription._id}
                          onClick={() => handleViewSubscription(subscription)}
                        >
                          <td>
                            <span
                              className={`badge ${
                                subscription.subscriptionStatus === "Sent"
                                  ? "badge-warning"
                                  : subscription.subscriptionStatus === "active"
                                  ? "badge-success"
                                  : subscription.subscriptionStatus ===
                                    "inactive"
                                  ? "badge-dark"
                                  : "badge-danger"
                              }`}
                            >
                              {subscription.subscriptionStatus}
                            </span>
                          </td>
                          <td>
                            {subscription.grandTotalCurrency}{" "}
                            {subscription.finalAmount}
                          </td>
                          <td>
                            {subscription.products.map((product, index) => (
                              <td key={index}>
                                <div>{product.productId.name}</div>
                              </td>
                            ))}
                          </td>
                          <td>
                            {new Date(
                              subscription.subscriptionStartDate
                            ).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              // hour: "2-digit",
                              // minute: "2-digit",
                              hour12: true,
                            })}
                            <br />
                            for {subscription.subscriptionDurationInMonths}
                            Months
                          </td>
                          <td>
                            {" "}
                            {new Date(
                              subscription.subscriptionEndDate
                            ).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              // hour: "2-digit",
                              // minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                        </tr>
                      ))}

                    {/* If no subscriptions found and no error */}
                    {!loading &&
                      !error &&
                      filteredSubscriptions.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center">
                            No subscriptions found.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="card-footer d-flex justify-content-center mt-4">
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-primary mr-2"
                        disabled={currentPage === 1}
                        onClick={handlePrevPage}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          className={`btn mr-2 ${
                            currentPage === index + 1
                              ? "btn-success"
                              : "btn-light"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        className="btn btn-outline-primary"
                        disabled={currentPage === totalPages}
                        onClick={handleNextPage}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SubscriptionsbyUser;
