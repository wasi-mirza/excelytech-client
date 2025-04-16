import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as Routes from "../../../shared/utils/routeNames.js";
import { BASE_URL } from "../../../shared/utils/endPointNames.js";

const Users = () => {
  const [auth] = useAuth();
  const [userdata, setUserdata] = useState([]);
  const [deleteId, setDeleteId] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 32;
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/user/users?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      setUserdata(res.data.data); // Assuming 'data' contains the user list
      setTotalPages(res.data.totalPages); // Assuming 'totalPages' is in the response
      setLoading(false); // Stop loading after successful response
      // console.log("Userdata : ", res.data.data);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleDelete = async (data) => {
    try {
      if (
        window.confirm("Are you sure you want to delete this payment method?")
      ) {
        await axios.delete(`${BASE_URL}/user/${data}`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        toast.success("Deleted Successfully");
        /// add toast alert on delete
        getUser();
      }
    } catch (error) {
      toast.error("Unable to delete");
      console.log(error);
    }
  };
  const handleUpdateForm = (id) => {
    console.log("Data", id);

    navigate(`/admin-dashboard/update/${id}`);
  };
  useEffect(() => {
    if (auth?.token) {
      getUser();
    }
  }, [auth, currentPage, searchQuery]);

  const handleAddUser = () => {
    navigate(Routes.NEW_USER);
  };

  const HandleView = (data) => {
    navigate(`/admin-dashboard/view/${data._id}`);
  };

  const handleSupportChat = () => {
    //  navigate(Routes.CHATS);
    navigate("/chats");
  };
  console.log("asdfsf", userdata);

  return (
    <>
      <div className="content-wrapper">
        {/* Page Header */}
        <section className="content-header">
          <div className="container-fluid">
            <div className="row align-items-center justify-content-between my-3">
              <div className="col-12 col-md-4 mb-2 mb-md-0">
                <h1 className="font-weight-bold">Clients</h1>
              </div>
              <div className="col-12 col-md-8 d-flex flex-column flex-md-row justify-content-md-end">
                <div className="form-group mb-2 mb-md-0 flex-grow-1 mr-md-3">
                  <div className="input-group">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Search accounts"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="input-group-append">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                      >
                        <i className="fa fa-search" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAddUser}
                  className="btn btn-success mt-2 mt-md-0"
                >
                  <i className="fas fa-plus mr-1"></i> Add Client
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid">
            <div className="card p-2">
              <div className="row">
                {loading ? (
                  <div className="col-12 text-center">
                    <div className="spinner-border" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                ) : userdata?.length === 0 ? (
                  <div className="col-12 text-center">
                    <p>No data found</p>
                  </div>
                ) : (
                  // .filter((data) => data.businessDetails?.companyType !== "N/A")
                  userdata?.map((data) => (
                    <div
                      className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                      key={data._id}
                    >
                      <div
                        className="card h-100"
                        // onClick={() => HandleView(data)}
                      >
                        {/* Card Header */}
                        <div className="card-header">
                          <div className="d-flex justify-content-between">
                            <h5 className="card-title text-secondary mb-0">
                              {data.businessDetails?.clientName}
                            </h5>
                            <span
                              className={`badge ${
                                data.activeAccount
                                  ? "badge-success"
                                  : "badge-danger"
                              }`}
                            >
                              {data.activeAccount ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="card-body">
                          <p className="card-text ">
                            <strong>
                              {data?.businessDetails?.companyName}{" "}
                              {data?.businessDetails?.companyType}
                            </strong>
                          </p>
                          <p className="card-text">
                            <strong>
                              <i className="fas fa-map-marker-alt"></i>
                            </strong>
                            <small>
                              {" "}
                              {data?.address?.street1}, {data?.address?.state},{" "}
                              {data?.address?.country}
                            </small>
                          </p>
                          <p className="card-text justify-content-between">
                            <span>
                              <strong>
                                <i className="fas fa-clock"></i>
                              </strong>
                              <small> {data.timeZone}</small>
                            </span>
                          </p>
                          <span>
                            <strong>
                              <i className="fas fa-envelope"></i>
                            </strong>
                            <small> {data.email}</small>
                          </span>
                        </div>

                        {/* Card Footer */}
                        <div className="card-footer d-flex justify-content-end align-items-center">
                          {/* View, Edit, Delete Icons */}
                          <div className="d-flex">
                            <button
                              className="btn btn-sm btn-link text-dark p-0 mx-3 "
                              onClick={() => HandleView(data)}
                            >
                              <i className="fas fa-eye" />
                            </button>
                            <button
                              className="btn btn-sm btn-link text-dark p-0 mx-3 "
                              onClick={() => handleUpdateForm(data._id)}
                            >
                              <i className="fas fa-edit" />
                            </button>
                            <button
                              className="btn btn-sm btn-link text-danger p-0 mx-3"
                              onClick={() => handleDelete(data._id)}
                            >
                              <i className="fas fa-trash" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="card-foote">
                  <div className="d-flex justify-content-center mt-3">
                    <button
                      className="btn btn-outline-primary mr-2"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
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
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Users;
