import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/utils/routes";
import { BASE_URL } from "../../../shared/utils/endPointNames";

function Tickets() {
  const [auth] = useAuth();
  const [ticketdata, setTicketData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchTicketData = async (page = 1, limit = 32, search = "") => {
    try {
      const res = await axios.get(
        `${BASE_URL}/ticket/tickets?page=${page}&limit=${limit}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
          params: {
            page,
            limit,
            search,
          },
        }
      );
      setTicketData(res.data.tickets);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.log(error);
    }
  };

  const handleView = (data) => {
    navigate(`${ROUTES.ADMIN.TICKETS}/${data._id}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    fetchTicketData(1, 32, e.target.value);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchTicketData(currentPage - 1, 5, searchTerm);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchTicketData(currentPage + 1, 5, searchTerm);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchTicketData(currentPage, 5, searchTerm);
    }
  }, [auth, currentPage]);

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between my-3">
            <div className="col-12 col-md-4 mb-2 mb-md-0">
              <h1 className="font-weight-bold">Tickets</h1>
            </div>
            <div className="col-12 col-md-8 d-flex flex-column flex-md-row justify-content-md-end">
              <div className="form-group mb-2 mb-md-0 flex-grow-1 mr-md-3">
                <div className="input-group">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button">
                      <i className="fa fa-search" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          <div className="row m-2">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover ">
                      <thead className="bg-dark">
                        <tr>
                          <th>Title</th>
                          <th>Description</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Assigned To</th>
                          <th>Created At</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ticketdata.length === 0 ? (
                          <tr>
                            <td colSpan="7">No tickets found</td>
                          </tr>
                        ) : (
                          ticketdata.map((ticket) => (
                            <tr key={ticket._id}>
                              <td>{ticket.title}</td>
                              <td>{ticket.description}</td>
                              <td>{ticket.priority}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    ticket.status === "Closed"
                                      ? "badge-success"
                                      : ticket.status === "In Progress"
                                      ? "badge-warning"
                                      : ticket.status === "Open"
                                      ? "badge-danger"
                                      : "badge-secondary" // Default for unrecognized statuses
                                  } mt-2`}
                                >
                                  {ticket.status}
                                </span>
                              </td>
                              <td>
                                {ticket.assignedTo
                                  ? ticket.assignedTo.name
                                  : "N/A"}
                              </td>
                              <td>
                                {new Date(ticket.createdAt).toLocaleString()}
                              </td>
                              <td>
                                <button
                                  className="btn btn-success"
                                  onClick={() => handleView(ticket)}
                                >
                                  <i className="fas fa-file-alt"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="card-footer d-flex justify-content-center mt-4">
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
                          onClick={() =>
                            fetchTicketData(index + 1, 15, searchTerm)
                          }
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Tickets;
