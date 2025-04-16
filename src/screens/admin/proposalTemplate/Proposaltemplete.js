import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../shared/utils/endPointNames.js";

const Proposaltemplete = () => {
  const [loader, setLoader] = useState(true);
  const [proposalTemplete, setProposalTemplete] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 16;
  const navigate = useNavigate();
  const [auth] = useAuth();

  // Fetch templates from the API
  const getProposalTemplete = async () => {
    setLoader(true); // Show loader while fetching
    try {
      const res = await axios.get(
        `${BASE_URL}/proposalTemplate/templates?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      setProposalTemplete(res.data.templates);
      setTotalPages(res.data.totalPages);
      setLoader(false);
    } catch (error) {
      console.error(error);
      setLoader(false);
    }
  };

  // Fetch data on component mount and when search or page changes
  useEffect(() => {
    if (auth?.token) {
      getProposalTemplete();
    }
  }, [auth, searchQuery, currentPage]);

  const handleUpdateForm = (data) => {
    //setProposalTempleteDetails(data);
    navigate(`/admin-dashboard/updateproposaltemplete/${data._id}`);
  };

  const HandleView = (data) => {
    //setProposalTempleteDetails(data);
    console.log(data);
    navigate(`/admin-dashboard/viewproposaltemplete/${data._id}`);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/proposalTemplate/templates/${id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      getProposalTemplete(); // Re-fetch templates after delete
      toast.success("Templete Deleted Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  // Pagination controls
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleClick = () => {
    navigate("/admin-dashboard/newproposaltemplete");
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between my-3">
            {/* Title */}
            <div className="col-12 col-md-4 mb-2 mb-md-0">
              <h1 className="font-weight-bold">Proposal Template</h1>
            </div>

            {/* Search Bar and Add Button */}
            <div className="col-12 col-md-8 d-flex flex-column flex-md-row justify-content-md-end">
              {/* Search Bar */}
              <div className="form-group mb-2 mb-md-0 flex-grow-1 mr-md-3">
                <div className="input-group">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search by title"
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
                onClick={handleClick}
                className="btn btn-success mt-2 mt-md-0"
              >
                <i className="fas fa-plus mr-1"></i> Add Proposal Template
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className=" card m-2 p-2">
        <section className="content">
          <div className="container-fluid">
            {loader ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
              >
                <div className="spinner-border" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row justify-content-center">
                {proposalTemplete.length === 0 ? (
                  <div className="col-12 text-center p-4">
                    <div className="alert alert-warning rounded shadow-sm">
                      <p className="mb-0 fw-bold text-secondary">
                        🚀 No matching templates found!
                      </p>
                    </div>
                  </div>
                ) : (
                  proposalTemplete.map((data) => (
                    <div
                      key={data._id}
                      className="col-12 col-md-3 mb-4"
                      style={{ maxWidth: "600px" }}
                    >
                      <div
                        className="card card-olive card-outline"
                        style={{
                          height: "400px",
                          width: "100%",
                        }}
                      >
                        {/* Card Header */}
                        <div
                          className="card-header d-flex justify-content-between align-items-center"
                          // style={{
                          //   backgroundColor: "#007bff",
                          //   color: "white",
                          //   fontWeight: "bold",
                          // }}
                        >
                          <h5
                            className="card-title mb-0 text-truncate"
                            style={{ maxWidth: "70%" }}
                          >
                            {data.title}
                          </h5>
                          <div className="ml-auto">
                            <button
                              className="btn btn-sm btn-link text-dark p-0 mr-2"
                              onClick={() => HandleView(data)}
                            >
                              <i className="fas fa-eye" />
                            </button>
                            <button
                              className="btn btn-sm btn-link text-dark p-0 mr-2"
                              onClick={() => handleUpdateForm(data)}
                            >
                              <i className="fas fa-edit" />
                            </button>
                            <button
                              className="btn btn-sm btn-link text-dark p-0"
                              onClick={() => handleDelete(data._id)}
                            >
                              <i className="fas fa-trash" />
                            </button>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div
                          className="card-body overflow-auto"
                          style={{ maxHeight: "300px" }}
                        >
                          <p
                            className="card-text"
                            dangerouslySetInnerHTML={{
                              __html: data.description,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

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
                        currentPage === index + 1 ? "btn-success" : "btn-light"
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
        </section>
      </div>
    </div>
  );
};

export default Proposaltemplete;
