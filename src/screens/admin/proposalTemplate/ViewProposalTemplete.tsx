import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import JoditEditor from "jodit-react";
import { BASE_URL } from "../../../shared/utils/endPointNames";

function ViewProposalTemplate() {
  const [viewTemplate, setViewTemplate] = useState<any>(null);
  const [auth] = useAuth();
  const { id } = useParams();
  const editor = useRef<any>(null);
  // Fetch templates from the API
  const getProposalTemplete = async () => {
    // setLoader(true); // Show loader while fetching
    try {
      const res = await axios.get(
        `${BASE_URL}/proposalTemplate/templates/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      setViewTemplate(res.data);
    } catch (error) {
      console.error(error);
      // setLoader(false);
    }
  };

  // Fetch data on component mount and when search or page changes
  useEffect(() => {
    if (auth?.token) {
      getProposalTemplete();
    }
  }, [auth]);

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-12">
              <h1 className="text-dark">Proposal Template</h1>
            </div>
          </div>
        </div>
      </section>

      <div className="content">
        <div className="row p-3">
          <div className="card card-olive">
            <div className="card-header">
              <h3 className="card-title">Proposal Template Information</h3>
            </div>

            <div className="card-body">
              {viewTemplate ? (
                <>
                  <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <div className="form-control" style={{ minHeight: "40px" }}>
                      {viewTemplate.title || "No title available"}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <JoditEditor
                      ref={editor}
                      value={
                        viewTemplate.description || "No description available"
                      }
                      // config={}
                      // onBlur={(newContent) => handleDescriptionChange(newContent)} // Update description on blur (or use onChange if preferred)
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <div className="form-control" style={{ minHeight: "40px" }}>
                      {viewTemplate.status || "No status available"}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="createdAt">Created At</label>
                    <div className="form-control" style={{ minHeight: "40px" }}>
                      {viewTemplate.createdAt ||
                        "No created at information available"}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="updatedAt">Updated At</label>
                    <div className="form-control" style={{ minHeight: "40px" }}>
                      {viewTemplate.updatedAt ||
                        "No updated at information available"}
                    </div>
                  </div>
                </>
              ) : (
                <p>Loading template details...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewProposalTemplate;
