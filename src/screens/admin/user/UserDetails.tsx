
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import moment from "moment";
import toast from "react-hot-toast";
import ReusableDialog from "../../../shared/components/DialogComponent";
import axios from "axios";

import { Modal, ModalHeader, ModalBody } from "reactstrap";
function View() {
  const navigate = useNavigate();
  const [viewInfo, setViewInfo] = useState(null);
  const [auth] = useAuth();
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [noteContent, setNoteContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [userAgreementUrl, setUserAgreementUrl] = useState("");
  const [resetEmail] = useState("");

  const notesPerPage = 4; // Set number of notes per page

  // Function to fetch user details
  const viewpage = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/${id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      if (res.status === 200 || res.status === 201) setViewInfo(res.data);
      // console.log("viewInfo", res.data);
      setNotes(res.data.notes || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserAgreement = async () => {
    try {
      let AgreementUrl = null;

      // Step 1: Upload the file to /upload/productImage
      if (userAgreementUrl != null || userAgreementUrl.length !== 0) {
        console.log("Agreemwnt url", userAgreementUrl);
        const fileData = new FormData();
        fileData.append("doc", userAgreementUrl);
        console.log("fileData", fileData);

        const uploadResponse = await axios.post(
          `${BASE_URL}/upload/doc`,
          fileData,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("userAgreementUrl", uploadResponse);

        AgreementUrl = uploadResponse.data.fileUrl; // Assume fileUrl is returned by the API
      }
      const updatedUser = {
        ...viewInfo,
        userAgreementUrl: AgreementUrl || "",
      };
      console.log("update userrr", updatedUser);

      const res = await axios.patch(`${BASE_URL}/user/${id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      if (res.status == 200 || res.status == 201) {
        toast.success("User agreement Uploaded");
        setIsAgreementOpen(false);
        viewpage();
        console.log("ViewInfo", viewInfo);
      }
    } catch (err) {
      console.log("Error", err);
    }
  };

  // Function to handle adding new note
  const handleAddNote = async (e) => {
    e.preventDefault();

    try {
      const newNote = {
        content: noteContent,
        noteMadeBy: auth?.user._id,
        createdAt: new Date().toISOString(),
      };

      const updatedUser = {
        ...viewInfo,
        notes: [newNote, ...(viewInfo?.notes || [])],
      };

      const res = await axios.patch(`${BASE_URL}/user/${id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });

      const sortedNotes = res.data.notes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setViewInfo(res.data);
      setNotes(sortedNotes); // Update local notes array with sorted notes
      setNoteContent(""); // Clear the textarea
      setCurrentPage(1); // Reset to the first page
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };
  useEffect(() => {
    if (auth?.token) {
      viewpage();
    }
  }, [auth]);

  // Get notes for current page
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = notes.slice(indexOfFirstNote, indexOfLastNote);

  // Pagination handlers
  const totalPages = Math.ceil(notes.length / notesPerPage);

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
  const handleDelete = async (data) => {
    try {
      const res = await axios.delete(`${BASE_URL}/user/${data._id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      if (res === 200) {
        toast.success("Deleted Successfully");
      } else {
        toast.error("Deleted Failed");
      }
    } catch (error) {
      toast.error("Unable to delete");
      // console.log(error);
    }
  };
  const handleUpdateForm = (id) => {
    console.log("Data", id);

    navigate(`/admin-dashboard/update/${id}`);
  };
  const [isDeleteUserDialog, setDeleteUserDialog] = useState(false);

  const toggleDeleteUserDialog = () => {
    setDeleteUserDialog(!isDeleteUserDialog);
  };

  // const handleConfirm = async (data) => {
  //   handleDelete(data);
  // };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserAgreementUrl(file);
    }
  };

  const handleCancelDeleteUserDialog = () => {
    // console.log("Cancelled!");
    toggleDeleteUserDialog();
  };

  const [message, setMessage] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmHandler, setConfirmHandler] = useState(null);

  const toggleDialog = (msg, handler) => {
    setMessage(msg);
    setConfirmHandler(() => handler);
    setDialogOpen(!isDialogOpen);
  };

  const handleCancel = () => {
    console.log("Cancelled!");
    toggleDialog();
  };
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      <div className="content-wrapper">
        <ReusableDialog
          isOpen={isDialogOpen}
          toggle={toggleDialog}
          message={message}
          onConfirm={confirmHandler}
          onCancel={handleCancel}
        />
        <ReusableDialog
          isOpen={isDeleteUserDialog}
          toggle={toggleDeleteUserDialog}
          message="Are you sure you want to perform this action?"
          onConfirm={() => handleDelete(viewInfo)}
          onCancel={handleCancelDeleteUserDialog}
        />
        {isModalOpen && (
          <PasswordResetModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            // onReset={handleResetPassword}
            resetEmail={viewInfo.email}
            auth={auth}
            // setResetEmail={setResetEmail}
            // newPassword={newPassword}
            // setNewPassword={setNewPassword}
          />
        )}
        {showModal && (
          <AgreementModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            userAgreementUrl={viewInfo?.userAgreementUrl}
          />
        )}
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6 d-flex ">
                <h1 className="text-dark">User Details</h1>
                <div>
                  {" "}
                  <button
                    className="btn btn-sm btn-link text-dark p-0 mx-3 "
                    onClick={() => handleUpdateForm(viewInfo._id)}
                  >
                    <i className="fas fa-edit" />
                  </button>
                  <button
                    className="btn btn-sm btn-link text-danger p-0 mx-3"
                    onClick={() => toggleDeleteUserDialog()}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <a href="#">Home</a>
                  </li>
                  <li className="breadcrumb-item active">User Details</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="content container-fluid">
          <div className="row">
            {/* User Info Card */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header ">
                  <h3 className="card-title">Account Owner</h3>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-4">Name:</dt>
                    <dd className="col-sm-8">{viewInfo?.name}</dd>

                    <dt className="col-sm-4">Email:</dt>
                    <dd className="col-sm-8">{viewInfo?.email}</dd>

                    <dt className="col-sm-4">Phone:</dt>
                    <dd className="col-sm-8">{viewInfo?.phone}</dd>

                    <dt className="col-sm-4">User Type:</dt>
                    <dd className="col-sm-8">{viewInfo?.userType}</dd>

                    <dt className="col-sm-4">Account Manager:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.accountManagers?.name || "Not Assigned"}
                    </dd>

                    <dt className="col-sm-4">User Agreement:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.userAgreementUrl ? (
                        <div className="d-flex justify-content-between align-items-center">
                          <button
                            className="btn btn-link "
                            onClick={() => setShowModal(true)} // Trigger modal to view the agreement
                          >
                            View Agreement
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setIsAgreementOpen(true)} // Trigger modal to view the agreement
                          >
                            Upload New Agreement
                          </button>
                        </div>
                      ) : (
                        "Not available"
                      )}
                    </dd>
                    <Modal
                      isOpen={isAgreementOpen}
                      toggle={() => setIsAgreementOpen(false)}
                      size="lg"
                      centered
                    >
                      <ModalHeader>
                        Upload New User Agreement Document
                      </ModalHeader>
                      <ModalBody>
                        <div className="form-group">
                          {/* File Input */}

                          <div className="form-group">
                            <label htmlFor="userAgreement">
                              Upload User Agreement
                            </label>
                            <div className="input-group">
                              <div className="custom-file">
                                <input
                                  type="file"
                                  id="userAgreement"
                                  className="custom-file-input"
                                  onChange={handleFileChange}
                                />
                                <label
                                  className="custom-file-label"
                                  htmlFor="userAgreement"
                                >
                                  Choose file
                                </label>
                              </div>
                            </div>

                            {/* Display Selected File Name */}
                            {userAgreementUrl && (
                              <div className="mt-3">
                                <p className="text-muted">Selected File:</p>
                                <div className="d-flex align-items-center justify-content-between p-2 border rounded">
                                  <span
                                    className="text-truncate"
                                    title={userAgreementUrl.name}
                                  >
                                    {userAgreementUrl.name}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 text-right">
                            <button
                              className="btn btn-warning mr-2"
                              onClick={handleUserAgreement}
                              disabled={!userAgreementUrl} // Disable if no file selected
                            >
                              Add New Agreement
                            </button>
                          </div>
                        </div>
                      </ModalBody>
                    </Modal>
                  </dl>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header ">
                  <h3 className="card-title">Address </h3>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-4">Time Zone:</dt>
                    <dd className="col-sm-8">{viewInfo?.timeZone}</dd>

                    <dt className="col-sm-4">Street 1:</dt>
                    <dd className="col-sm-8">{viewInfo?.address?.street1}</dd>

                    <dt className="col-sm-4">Street 2:</dt>
                    <dd className="col-sm-8">{viewInfo?.address?.street2}</dd>

                    <dt className="col-sm-4">City:</dt>
                    <dd className="col-sm-8">{viewInfo?.address?.city}</dd>

                    <dt className="col-sm-4">State:</dt>
                    <dd className="col-sm-8">{viewInfo?.address?.state}</dd>

                    <dt className="col-sm-4">Zip Code:</dt>
                    <dd className="col-sm-8">{viewInfo?.address?.zipCode}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Business Details Card */}
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header ">
                  <h3 className="card-title">Business Information</h3>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-4">Client Name:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.businessDetails?.clientName}
                    </dd>

                    <dt className="col-sm-4">Company Name:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.businessDetails?.companyName}
                    </dd>

                    <dt className="col-sm-4">Company Type:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.businessDetails?.companyType}
                    </dd>

                    <dt className="col-sm-4">Tax ID:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.businessDetails?.taxId}
                    </dd>

                    <dt className="col-sm-4">Employee Size:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.businessDetails?.employeeSize}
                    </dd>

                    <dt className="col-sm-4">Owner Phone:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.businessDetails?.ownerPhone}
                    </dd>

                    <dt className="col-sm-4">Owner Email:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.businessDetails?.ownerEmail}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Miscellaneous Info Card */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header ">
                  <h3 className="card-title">Account Status</h3>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-4">Account Manager:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.accountManagers?.name || "Not Assigned"}
                    </dd>
                    <dt className="col-sm-4">Allow Login:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.allowLogin ? "Yes" : "No"}
                    </dd>

                    <dt className="col-sm-4">Account Active:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.activeAccount ? "Yes" : "No"}
                    </dd>

                    <dt className="col-sm-4">First-Time Login:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.isFirstTimeLogin ? "Yes" : "No"}
                    </dd>

                    <dt className="col-sm-4">Password Reset Completed:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.isFirstPasswordResetDone ? "Yes" : "No"}
                    </dd>

                    <dt className="col-sm-4">Agreement Accepted:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.agreementAccepted ? "Yes" : "No"}
                    </dd>

                    <div className="mt-3">
                      <button
                        className="btn btn-warning mr-2"
                        onClick={() => setIsModalOpen(true)}
                      >
                        Reset Password
                      </button>
                    </div>

                    {/* <dt className="col-sm-4">Account Banned:</dt>
                    <dd className="col-sm-8">
                      {viewInfo?.bannedAccount ? "Yes" : "No"}
                    </dd> */}
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="card">
              <div className="card-header bg-olive">
                <h3 className="card-title">Notes</h3>
              </div>
              <div className="row">
                {/* Left Section: Display Notes */}
                <div className="col-md-6">
                  <div
                    className="card-body h-100 overflow-auto"
                    style={{ maxHeight: "400px" }}
                  >
                    {currentNotes.length > 0 ? (
                      currentNotes.map((note, index) => (
                        <div className="card mb-3" key={index}>
                          <div className="card-body">
                            <p className="card-text">{note.content}</p>
                            <small className="text-muted d-block text-end">
                              {moment(note.createdAt).format(
                                "HH:mm - DD, MMMM YYYY"
                              )}
                            </small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No notes available</p>
                    )}

                    {/* Pagination Controls */}
                    <div className="d-flex justify-content-between mt-3">
                      <button
                        className="btn btn-outline-primary"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="btn btn-outline-primary"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Section: Add New Note */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <form onSubmit={handleAddNote}>
                        <div className="form-group">
                          <label htmlFor="noteContent">Add New Note</label>
                          <textarea
                            id="noteContent"
                            className="form-control"
                            placeholder="Enter note content"
                            rows="5"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            required
                          ></textarea>
                        </div>
                        <button type="submit" className="btn btn-success">
                          Add Note
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default View;

function AgreementModal({ isOpen, onClose, userAgreementUrl }) {
  if (!isOpen) return null;
  const newUrl = BASE_URL.replace("/api", "");
  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" centered>
      <ModalHeader toggle={onClose}>Agreement </ModalHeader>
      <ModalBody style={{ padding: "0", height: "90vh" }}>
        {userAgreementUrl ? (
          <iframe
            src={`${newUrl}${userAgreementUrl}`}
            width="100%"
            height="100%"
            title="Agreement Document"
            style={{ border: "none", display: "block" }}
          ></iframe>
        ) : (
          <p>No agreement available.</p>
        )}
      </ModalBody>
    </Modal>
  );
}

function PasswordResetModal({ isOpen, onClose, auth, resetEmail }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  if (!isOpen) return null;

  const validatePassword = () => {
    const isValid = newPassword === confirmPassword; //&& passwordRegex.test(password);
    setIsPasswordValid(isValid);
  };
  const handleResetPassword = async () => {
    try {
      if (!resetEmail || !newPassword) {
        toast.error("Please provide both email and new password.");
        return;
      }
      const response = await axios.post(
        `${BASE_URL}/user/resetpasswordbyemail`,
        { email: resetEmail, newPassword },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      // console.log("response", response);
      if (response.status == 200 || response.status == 201) {
        toast.success(response.data.message || "Password reset successful.");
        onClose();
      }
    } catch (error) {
      // console.error("Error resetting password:", error);
      toast.error(error.response?.data?.message || "Failed to reset password.");
    }
  };
  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Reset Password</h5>
            <button type="button" className="close" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <form>
              <div className="form-group">
                <label>Email: {resetEmail || "Enter your email"}</label>
                {/* <input
                  type="email"
                  className="form-control"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                /> */}
              </div>
              <div className="form-group">
                <label>New Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      onBlur={validatePassword}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={validatePassword}
                  required
                />
              </div>
              {!isPasswordValid && confirmPassword.length > 0 && (
                <small className="text-danger">
                  Passwords do not match or are invalid!
                </small>
              )}
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleResetPassword}
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
