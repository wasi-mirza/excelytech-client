import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext.jsx";
import { BASE_URL } from "../../../shared/utils/endPointNames.js";
import toast from "react-hot-toast";
const ViewTicket = () => {
  const [auth] = useAuth();
  const messagesEndRef = useRef(null);
  const [status, setStatus] = useState("");
  const { id } = useParams();
  const [ticketData, setTicketData] = useState(null); // Initially set to null
  const [comment, setComment] = useState(""); // For comment
  const [resolutionNotes, setResolutionNotes] = useState(""); // For resolution notes (string)

  const fetchTicket = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/ticket/${id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      setTicketData(response.data);
      setStatus(response.data.status); // Set initial status
      setResolutionNotes(response.data.resolutionNotes || ""); // Set initial resolution notes, if any
      console.log("Fetched ticket data:", response.data);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchTicket();
    }
  }, [auth, id]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleUpdateStatus = async () => {
    try {
      const updatedData = {
        status: status,
        // Empty attachments
      };

      // Send only the status update with empty fields for other fields
      const res = await axios.patch(
        `${BASE_URL}/ticket/${id}`,
        updatedData, // Send the updated data with other fields empty
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      if (res.status === 200 || res.status === 201) {
        fetchTicket();
        toast.success(`Status updated successfully to ${status}`);
      }
      // navigate(-1);
      // console.log("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // const handleAddResolutionNotes = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await axios.post(
  //       `${BASE_URL}/ticket/resolutionNotes/${id}`,
  //       {
  //         resolutionNotes: resolutionNotes,
  //       },
  //       {
  //         headers: { Authorization: `Bearer ${auth?.token}` },
  //       }
  //     );
  //     if (res.status === 200 || res.status === 201) {
  //       toast.success(`Resolution Notes added`);
  //       setResolutionNotes("");
  //       fetchTicket();
  //     }
  //   } catch (error) {
  //     console.log("Error adding resolution notes:", error);
  //   }
  // };

  const handleUpdateResolutionNotes = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(
        `${BASE_URL}/ticket/resolutionNotes/${id}`,
        {
          resolutionNotes: resolutionNotes,
        },
        {
          headers: { Authorization: `Bearer ${auth?.token}` },
        }
      );
      if (res.status === 200 || res.status === 201) {
        toast.success(`Resolution Notes added`);
        setResolutionNotes("");
        fetchTicket();
      }
    } catch (error) {
      console.log("Error updating resolution notes:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${BASE_URL}/ticket/comment/${id}`,
        {
          userId: auth?.user.userId,
          name: auth?.user.role,
          email: auth?.user?.email,
          message: comment,
        },
        {
          headers: { Authorization: `Bearer ${auth?.token}` },
        }
      );
      console.log("Comment added:", res.data);
      setComment(""); // Clear the comment field
      fetchTicket(); // Re-fetch ticket data to display the new comment
    } catch (error) {
      console.log("Error adding comment:", error);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticketData?.comments]);

  if (!ticketData) {
    return <p>Loading ticket details...</p>;
  }

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>View Ticket</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Ticket Details Section */}
      <section className="content">
        <div className="row">
          <div className="col-md-6">
            <div className="card card-olive card-outline">
              <div className="card-header ">
                <h3 className="card-title">Ticket Information</h3>
              </div>
              <div className="card-body">
                <dl className="row">
                  <dt className="col-sm-4">Title:</dt>
                  <dd className="col-sm-8">{ticketData?.title}</dd>

                  <dt className="col-sm-4">Description:</dt>
                  <dd className="col-sm-8">{ticketData?.description}</dd>

                  <dt className="col-sm-4">Priority:</dt>
                  <dd className="col-sm-8">{ticketData?.priority}</dd>

                  <dt className="col-sm-4">Status:</dt>
                  {ticketData?.status === "Closed" ? (
                    <span className="badge badge-success">{status}</span>
                  ) : (
                    <dd className="col-sm-8">
                      <select
                        value={status}
                        onChange={handleStatusChange}
                        className="form-control text-sm"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <br />
                      <button
                        className="btn btn-success"
                        onClick={handleUpdateStatus}
                      >
                        Update Status
                      </button>
                    </dd>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="col-md-6">
            <div className="card card-olive card-outline">
              <div className="card-header ">
                <h3 className="card-title">Account</h3>
              </div>
              <div className="card-body">
                <dl className="row">
                  <dt className="col-sm-4">Name:</dt>
                  <dd className="col-sm-8">
                    {ticketData?.client?.user.businessDetails.clientName}
                  </dd>

                  <dt className="col-sm-4">Email:</dt>
                  <dd className="col-sm-8">
                    {ticketData?.client?.user.businessDetails.ownerEmail}
                  </dd>
                  <dt className="col-sm-4">Phone:</dt>
                  <dd className="col-sm-8">
                    {ticketData?.client?.user.businessDetails.ownerPhone}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          {/* Resolution Notes Section */}
          <div className="col-md-6">
            <div className="card card-olive card-outline direct-chat direct-chat-primary">
              <div className="card-header">
                <h3 className="card-title">Resolution Notes</h3>
              </div>
              {ticketData.resolutionNotes ? (
                <div className="card-body">
                  <div className="direct-chat-messages">
                    <p>{resolutionNotes}</p>
                  </div>
                </div>
              ) : (
                <>
                  {" "}
                  <div className="card-body">
                    <div className="direct-chat-messages">
                      {/* <form onSubmit={handleAddResolutionNotes}> */}
                      <div className="input-group">
                        <textarea
                          name="resolutionNotes"
                          placeholder="Add Resolution Notes ..."
                          className="form-control"
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          rows="7 "
                        />
                      </div>
                      <span>
                        {/* <button type="submit" className=" m-2 btn btn-success">
                        Add Note
                      </button> */}
                      </span>
                      {/* </form> */}
                    </div>
                  </div>
                  <div className="card-footer">
                    <button
                      className="btn btn-warning mt-2"
                      onClick={handleUpdateResolutionNotes}
                    >
                      Update Resolution
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Comments Section */}
          <div className="col-md-6">
            <div className="card card-olive card-outline direct-chat direct-chat-primary">
              <div className="card-header">
                <h3 className="card-title">Comments</h3>
              </div>
              <div className="card-body">
                <div className="direct-chat-messages">
                  {ticketData?.comments?.map((comment, index) => {
                    const isAdmin = comment?.user?.name !== "admin";
                    return (
                      <div
                        key={index}
                        className={`direct-chat-msg ${
                          isAdmin ? "left mr-auto" : "right ml-auto"
                        }`}
                      >
                        <div className="direct-chat-infos clearfix">
                          <span
                            className={`direct-chat-name float-${
                              isAdmin ? "left" : "right"
                            }`}
                          >
                            {comment.user.name}
                          </span>
                          <span
                            className={`direct-chat-timestamp float-${
                              isAdmin ? "right" : "left"
                            }`}
                          >
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <img
                          className="direct-chat-img"
                          src="/img/user1-128x128.jpg"
                          alt="Message User"
                        />
                        <div className="direct-chat-text">
                          {comment.message}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              {status === "Closed" ? (
                <div></div>
              ) : (
                <div className="card-footer">
                  <form onSubmit={handleAddComment}>
                    <div className="input-group">
                      <input
                        type="text"
                        name="message"
                        placeholder="Type Comment ..."
                        className="form-control"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <span className="input-group-append">
                        <button type="submit" className="btn btn-success">
                          Send
                        </button>
                      </span>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ViewTicket;
