import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import JoditEditor from "jodit-react";
import { BASE_URL } from "../../../utils/endPointNames.js";
import { toast } from "react-hot-toast";

function ViewEmailTemplate() {
  const [viewTemplate, setViewTemplate] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Loading state
  const [auth] = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const editor = useRef(null);

  // ✅ Fetch template from API
  const getProposalTemplate = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/email/email-template/${id}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setViewTemplate(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch template.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Update - Redirect to edit page
  const handleUpdate = () => {
    navigate(`/admin-dashboard/update-email-template/${id}`);
  };

  // ✅ Handle Delete - Delete template with confirmation
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;

    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/email/email-template/${id}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      toast.success("Template deleted successfully!");
      navigate("/email-templates"); // Redirect after deletion
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete template.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      getProposalTemplate();
    }
  }, [auth]);

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between my-3">
            {/* Title Section */}
            <div className="col-md-4 col-sm-12 mb-2">
              <h1 className="text-left mb-0">Email Template</h1>
            </div>

            {/* Buttons Section - Right Aligned */}
            <div className="col-md-8 col-sm-12 d-flex justify-content-end align-items-center">
              {/* ✅ Update & Delete Buttons */}
              {!loading && viewTemplate && (
                <>
                  <button
                    className="btn btn-sm btn-primary mr-2"
                    onClick={handleUpdate}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={handleDelete}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="content">
        <div className="row p-3 w-100 m-0">
          <div className="card card-olive w-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title">
                {loading ? "Loading..." : viewTemplate?.title}
              </h3>
            </div>

            <div className="card-body">
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "200px" }}
                >
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : viewTemplate ? (
                <div className="form-group">
                  <p
                    className="card-text"
                    dangerouslySetInnerHTML={{
                      __html: viewTemplate.description,
                    }}
                  />
                </div>
              ) : (
                <p className="text-danger">Template not found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewEmailTemplate;
