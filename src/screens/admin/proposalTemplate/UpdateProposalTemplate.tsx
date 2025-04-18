import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import JoditEditor from "jodit-react";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../shared/utils/endPointNames";

function UpdateEmailTemplate() {
  const [proposalTemplete, setProposalTemplete] = useState(null);
  const [templete, setTemplete] = useState({
    title: "",
    description: "",
    status: "",
    createdAt: "",
    updatedAt: "",
  });

  const editor = useRef(null);
  const navigate = useNavigate();
  const [auth] = useAuth();
  const { id } = useParams();

  // Fetch the proposal template from the API
  const getProposalTemplete = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/proposalTemplate/templates/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      setProposalTemplete(res.data);
    } catch (error) {
      console.error("Error fetching proposal template:", error);
    }
  };

  // Fetch the proposal template data once on component mount
  useEffect(() => {
    getProposalTemplete();
  }, [id, auth?.token]);

  // Update `templete` state when `proposalTemplete` changes
  useEffect(() => {
    if (proposalTemplete) {
      setTemplete({
        title: proposalTemplete.title || "",
        description: proposalTemplete.description || "",
        status: proposalTemplete.status || "",
        createdAt: proposalTemplete.createdAt || "",
        updatedAt: proposalTemplete.updatedAt || "",
      });
    }
  }, [proposalTemplete]);

  const handleUpdate = async () => {
    try {
      await axios.patch(
        `${BASE_URL}/proposalTemplate/templates/${proposalTemplete?._id}`,
        {
          title: templete.title,
          description: templete.description,
          status: templete.status,
          createdAt: templete.createdAt,
          updatedAt: templete.updatedAt,
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      navigate(-1);
      toast.success("Templete Updated Successfully");
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemplete((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (newContent) => {
    setTemplete((prevForm) => ({
      ...prevForm,
      description: newContent,
    }));
  };

  const editorConfig = {
    height: 500,
    readonly: false,
    toolbarSticky: false,
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "ul",
      "ol",
      "font",
      "fontsize",
      "paragraph",
      "image",
      "link",
      "align",
      "undo",
      "redo",
    ],
    showXPathInStatusbar: false,
    spellcheck: false,
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-12">
              <h1 className="text-dark">Update Proposal Template</h1>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="row">
          <div className="col-12">
            <div className="card card-olive">
              <div className="card-header">
                <h3 className="card-title">Template Information</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={templete.title}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <JoditEditor
                    ref={editor}
                    config={editorConfig}
                    value={templete.description}
                    onBlur={(newContent) => handleDescriptionChange(newContent)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12 d-flex justify-content-center">
            <div className="card card-footer col-12 col-md-4 m-2">
              <button
                className="btn btn-success btn-block"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default UpdateEmailTemplate;
