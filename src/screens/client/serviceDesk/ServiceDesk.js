import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { USER_DASHBOARD } from "../../../utils/routeNames.js";
import { BASE_URL } from "../../../utils/endPointNames.js";

function ServiceDesk() {
  const [auth] = useAuth();
  const [ticketData, setTicketData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchTicketData = async (page = 1, search = "") => {
    try {
      const res = await axios.get(`${BASE_URL}/ticket/user/${auth.user._id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });

      const { tickets, pagination } = res.data;
      setTicketData(tickets);
      setTotalPages(pagination.totalPages);
      setCurrentPage(page);
      console.log("tic", res.data, pagination.totalPages);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchTicketData(currentPage, searchTerm);
    }
  }, [auth, currentPage, searchTerm]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePrevPage = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    handlePageChange(currentPage + 1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleAddUser = () => {
    navigate(`${USER_DASHBOARD}/newTicket`);
  };

  const handleView = (data) => {
    navigate(`${USER_DASHBOARD}/${data._id}`);
  };

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
              <button
                onClick={handleAddUser}
                className="btn btn-success mt-2 mt-md-0"
              >
                <i className="fas fa-plus mr-1"></i> Add Ticket
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          <div className="row m-2">
            <div className="col-12">
              <div className="card ">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
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
                        {ticketData.length === 0 || ticketData === null ? (
                          <tr>
                            <td colSpan="7">No tickets found</td>
                          </tr>
                        ) : (
                          ticketData?.map((ticket) => (
                            <tr key={ticket._id}>
                              <td>{ticket.title}</td>
                              <td>{ticket.description}</td>
                              <td>{ticket.priority}</td>
                              <td>{ticket.status}</td>
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

                    {/* Pagination Controls */}
                    <div className=" mt-3">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ServiceDesk;
