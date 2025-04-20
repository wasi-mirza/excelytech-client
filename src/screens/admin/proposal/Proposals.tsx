import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/utils/routes";

import { BASE_URL } from "../../../shared/utils/endPointNames";

function Proposals() {
  const [auth] = useAuth();
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]);
  // Pagination variablees
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [proposalsPerPage] = useState(32);
  const [totalProposals, setTotalProposals] = useState(0);

  //Search for Proposal
  const [searchQuery, setSearchQuery] = useState("");
  // const filteredProposals = proposals.filter((proposal) =>
  //   // proposal.name.includes(searchQuery)
  // );

  const handleAddProposal = () => {
    navigate(ROUTES.ADMIN.NEW_PROPOSAL);
  };

  const HandleView = (data: any) => {
    // setUserDetails(data);
    navigate(ROUTES.ADMIN.VIEW_PROPOSAL(data._id));
  };
  const getProposals = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/proposal/proposals?page=${currentPage}&limit=${proposalsPerPage}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      console.log("proposals", res.data.proposals);

      setProposals(res.data.proposals);
      setTotalPages(res.data.totalPages);
      setTotalProposals(res.data.total);
    } catch (error) {
      console.error(error);
    }
  };
  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalProposals / proposalsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  useEffect(() => {
    if (auth?.token) {
      getProposals();
    }
  }, [auth, currentPage, searchQuery]);

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between my-3">
            {/* Title */}
            <div className="col-12 col-md-4 mb-2 mb-md-0">
              <h1 className="font-weight-bold">Proposals</h1>
            </div>

            {/* Search Bar and Add Button */}
            <div className="col-12 col-md-8 d-flex flex-column flex-md-row justify-content-md-end">
              {/* Search Bar */}
              <div className="form-group mb-2 mb-md-0 flex-grow-1 mr-md-3">
                <div className="input-group">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button">
                      <i className="fa fa-search" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add Proposal Button */}
              <button
                onClick={handleAddProposal}
                className="btn btn-success mt-2 mt-md-0"
              >
                <i className="fas fa-plus mr-1"></i> Add Proposal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="content container-fluid">
        {/* Table Content */}
        <div className="card">
          <div className="col-12">
            <div className="card-body table-responsive">
              <table id="example2" className="table table-bordered table-hover">
                <thead className="bg-secondary text-white">
                  <tr>
                    <th> Sent To</th>
                    <th> Title</th>
                    <th> Sent On</th>
                    <th> Status</th>
                    {/* <th>
                        Subscription {"\n"}
                        Status
                      </th> */}
                  </tr>
                </thead>
                <tbody>
                  {proposals.length > 0 ? (
                    proposals.map((proposal: any) => (
                      <tr
                        key={proposal._id}
                        onClick={() => HandleView(proposal)}
                      >
                        <td>
                          <i className="fas fa-envelope text-primary mr-2"></i>
                          {proposal.emailTo}
                        </td>
                        <td>
                          {" "}
                          <i className="fas fa-book-open text-secondary mr-2"></i>
                          {proposal.title}
                        </td>
                        <td>
                          <i className="fas fa-clock text-info mr-2"></i>
                          {new Date(proposal.createdAt).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              proposal.status === "Sent"
                                ? "badge-warning"
                                : proposal.status === "Accepted"
                                ? "badge-success"
                                : "badge-danger"
                            }`}
                          >
                            {proposal.status}
                          </span>
                        </td>
                        {/* <td> */}
                        {/* <button
                              onClick={() => HandleView(proposal)}
                              className="btn btn-success btn-sm m-1"
                            >
                              <i className="fas fa-file-alt"></i>
                            </button> */}
                        {/* <div className="d-flex justify-content-center m-2">
                              

                              {/* <button className="btn btn-warning btn-sm m-1">
                                <i className="fas fa-edit"></i>
                              // </button> 
                            </div> */}
                        {/* </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center">
                        No matching Proposal found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* <div className="table-responsive">
                  <table
                    id="example2"
                    className="table table-bordered table-hover"
                    style={{ width: "100%", tableLayout: "fixed" }}
                  >
                    <thead className="bg-secondary text-white">
                      <tr>
                        <th className="text-nowrap" style={{ width: "20%" }}>
                          <i className="fas fa-user"></i> Sent To
                        </th>
                        <th className="text-nowrap" style={{ width: "25%" }}>
                          <i className="fas fa-heading"></i> Title
                        </th>
                        <th className="text-nowrap" style={{ width: "25%" }}>
                          <i className="fas fa-calendar-alt"></i> Sent On
                        </th>
                        <th className="text-nowrap" style={{ width: "15%" }}>
                          <i className="fas fa-info-circle"></i> Status
                        </th>
                        <th
                          className="text-center text-nowrap"
                          style={{ width: "15%" }}
                        >
                          <i className="fas fa-cog"></i> Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposals.length > 0 ? (
                        proposals.map((proposal) => (
                          <tr key={proposal.id} className="align-middle">
                            <td
                              className="text-truncate"
                              style={{ maxWidth: "150px" }}
                            >
                              <i className="fas fa-envelope text-primary mr-2"></i>
                              {proposal.emailTo}
                            </td>
                            <td
                              className="text-truncate"
                              style={{ maxWidth: "180px" }}
                            >
                              <i className="fas fa-book-open text-secondary mr-2"></i>
                              {proposal.title}
                            </td>
                            <td
                              className="text-truncate"
                              style={{ maxWidth: "160px" }}
                            >
                              <i className="fas fa-clock text-info mr-2"></i>
                              {new Date(proposal.createdAt).toLocaleString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  proposal.status === "Sent"
                                    ? "badge-warning"
                                    : proposal.status === "Accepted"
                                    ? "badge-success"
                                    : "badge-danger"
                                }`}
                              >
                                {proposal.status}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                onClick={() => HandleView(proposal)}
                                className="btn btn-success btn-sm m-1"
                                title="View Proposal"
                              >
                                <i className="fas fa-file-alt"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">
                            <i className="fas fa-info-circle"></i> No matching
                            Proposal found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div> */}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="card-footer">
                  <div className="d-flex justify-content-center mt-4">
                    <button
                      className="btn btn-outline-primary mr-2"
                      disabled={currentPage === 1}
                      onClick={handlePreviousPage}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
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
      </section>
    </div>
  );
}

export default Proposals;
