import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/endPointNames.js";
import toast from "react-hot-toast";

const CreateTicket = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    client: {
      user: auth?.user._id,
      name: auth.user.name || "", // Assuming name is available in auth.user
      email: auth.user.email || "", // Assuming email is available in auth.user
    },
    attachments: [],
  });

  const [moreAttachmentsToUpload, setMoreAttachmentsToUpload] = useState([]);
  const [errors, setErrors] = useState({});

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle multiple file upload
  const handleFileChange = (event) => {
    setMoreAttachmentsToUpload(Array.from(event.target.files));
  };

  // Remove an attachment from the list
  const handleRemoveAttachment = (indexToRemove) => {
    setMoreAttachmentsToUpload((prevAttachments) =>
      prevAttachments.filter((_, index) => index !== indexToRemove)
    );
    setFormData((prevData) => ({
      ...prevData,
      attachments: prevData.attachments.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = "Title is required.";
    if (!formData.description) errors.description = "Description is required.";
    if (!formData.priority) errors.priority = "Priority is required.";
    if (!formData.client) errors.client = "Client ID is required.";

    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors).join(", "));
    }
    return Object.keys(errors).length === 0;
  };

  const handleUploadFiles = async () => {
    const uploadData = new FormData();
    moreAttachmentsToUpload.forEach((file) => uploadData.append("docs", file));

    try {
      const response = await axios.post(`${BASE_URL}/upload/docs`, uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (response.status !== 200) {
        throw new Error("File upload failed");
      }
      return response.data.files.map((file) => ({
        filename: file.filename,
        path: `${BASE_URL}${file.url}`,
      }));
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (moreAttachmentsToUpload.length > 0) {
      const uploadedFiles = await handleUploadFiles();
      if (!uploadedFiles) return;

      setFormData((prevData) => ({
        ...prevData,
        attachments: [...prevData.attachments, ...uploadedFiles],
      }));
    }

    try {
      const res = await axios.post(`${BASE_URL}/ticket/new`, formData, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      console.log("res", res.data);

      toast.success("Ticket created successfully!");
      navigate(-1);
    } catch (error) {
      toast.error("Failed to create ticket, please try again.");
      console.error("Error creating ticket:", error);
    }
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Create New Ticket</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-olive card-outline">
            <div className="card-header">
              <h3 className="card-title">Ticket Details</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body">
                {/* Title */}
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter title"
                  />
                  {errors.title && (
                    <p className="text-danger">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                  />
                  {errors.description && (
                    <p className="text-danger">{errors.description}</p>
                  )}
                </div>

                {/* Priority */}
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="form-control"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="">Select Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                  {errors.priority && (
                    <p className="text-danger">{errors.priority}</p>
                  )}
                </div>

                <div className="container-fluid">
                  {/* File Upload Section */}
                  <div className="input-group">
                    <div className="custom-file">
                      <input
                        type="file"
                        className="custom-file-input"
                        id="fileUpload"
                        name="fileUpload"
                        accept="application/*"
                        multiple
                        onChange={handleFileChange}
                      />
                      <label className="custom-file-label" htmlFor="fileUpload">
                        Choose files
                      </label>
                    </div>
                  </div>
                  <small className="form-text text-muted">
                    Supported formats: PDF, DOC, DOCX, etc. Max size: 5MB.
                  </small>

                  {/* Document Table Section */}
                  <div className="card card-olive card-outline">
                    <div className="card-header ">
                      <h3 className="card-title">Uploaded Documents</h3>
                    </div>
                    <div className="card-body table-responsive">
                      <table className="table table-bordered table-striped">
                        <tbody>
                          {moreAttachmentsToUpload.map((attachment, index) => (
                            <tr key={index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <button
                                    className="btn btn-danger btn-sm mr-2"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleRemoveAttachment(index);
                                    }}
                                  >
                                    <i className="fas fa-trash-alt"></i>
                                  </button>
                                  <div>{attachment.name}</div>
                                </div>
                              </td>
                              {attachment.type.startsWith("image/") && (
                                <td>
                                  <img
                                    src={URL.createObjectURL(attachment)}
                                    alt={attachment.name}
                                    style={{ width: "100px", height: "auto" }}
                                  />
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button type="submit" className="btn btn-success">
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateTicket;
