import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext.jsx";
import { BASE_URL } from "../../../shared/utils/endPointNames.js";

const ViewTicket = () => {
  const [auth] = useAuth();
  const { id } = useParams();
  const [ticketData, setTicketData] = useState({ attachments: [] });
  const [comment, setComment] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

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
      console.log("comment", res.data);
      setComment("");
      fetchTicket();
      // Re-fetch ticket data to display the new comment
    } catch (error) {
      console.log("error in Comment", error);
    }
  };
  const fetchTicket = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/ticket/${id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      setTicketData(response.data);
      console.log("Fetched ticket data:", response.data);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    }
  };
  useEffect(() => {
    if (auth?.user?.role) {
      console.log("role:", auth?.user?.role);
    }
    if (auth?.token) {
      fetchTicket();
    }
  }, [auth, id]);
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
              <div className="card-header">
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
                  <dd className="col-sm-8">{ticketData?.status}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card card-olive card-outline">
              <div className="card-header ">
                <h3 className="card-title">Client Details</h3>
              </div>
              <div className="card-body">
                <dl className="row">
                  <dt className="col-sm-4">Client Name:</dt>
                  <dd className="col-sm-8">{ticketData?.client?.name}</dd>

                  <dt className="col-sm-4">Email:</dt>
                  <dd className="col-sm-8">{ticketData?.client?.email}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card card-olive card-outline direct-chat direct-chat-primary">
              <div className="card-header">
                <h3 className="card-title">Comments</h3>
              </div>
              <div className="card-body">
                <div className="direct-chat-messages">
                  {ticketData?.comments?.map((comment, index) => {
                    // Check if the current user is admin
                    const isAdmin = comment?.user?.name !== "client";
                    return (
                      <div
                        key={index}
                        className={`direct-chat-msg ${
                          isAdmin ? "left" : "right"
                        }`}
                      >
                        <div className="direct-chat-infos clearfix">
                          <span
                            className={`direct-chat-name float-${
                              !isAdmin ? "right" : "left"
                            }`}
                          >
                            {comment.user.name}
                          </span>
                          <span
                            className={`direct-chat-timestamp float-${
                              !isAdmin ? "left" : "right"
                            }`}
                          >
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Replace image based on user type */}
                        <div
                          className="direct-chat-img"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: isAdmin ? "#459a70" : "#ffc107", // Blue for Admin, Yellow for Client
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            fontWeight: "bold",
                            fontSize: "18px",
                          }}
                        >
                          {isAdmin ? "A" : "C"}
                        </div>

                        <div className={`direct-chat-text`}>
                          {comment.message}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
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
            </div>
          </div>
        </div>

        {/* Uploaded Documents Card */}
        {Array.isArray(ticketData.attachments) &&
          ticketData.attachments?.length > 0 && (
            <div className="row mt-3">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header bg-primary">
                    <h3 className="card-title">Uploaded Documents</h3>
                  </div>
                  <div className="card-body table-responsive">
                    <table className="table table-bordered table-striped">
                      <tbody>
                        {ticketData.attachments.map((attachment, index) => (
                          <tr key={index}>
                            <td>
                              {/* Check if the filename suggests it's an image */}
                              {attachment.filename.match(
                                /\.(jpg|jpeg|png|gif)$/i
                              ) ? (
                                <img
                                  src={attachment.path} // Use the correct path to access the image
                                  alt={attachment.filename}
                                  style={{ width: "100px", height: "auto" }}
                                />
                              ) : (
                                <a
                                  href={attachment.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {attachment.filename}
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Back Button */}
      </section>
    </div>
  );
};

export default ViewTicket;
