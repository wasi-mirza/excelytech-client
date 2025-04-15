import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-hot-toast";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { BASE_URL } from "../../utils/endPointNames.js";
import { Modal, Button } from "react-bootstrap"; // Import Bootstrap Modal
import { BsThreeDotsVertical } from "react-icons/bs";

function EditUserProfile() {
  const [userInfo, setUserInfo] = useState({
    name: "",
    phone: "",
    address: {
      street1: "",
      street2: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });
  const [showModal, setShowModal] = useState(false); // Modal state
  const [auth] = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/${id}`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        setUserInfo(res.data); // Load full user details
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    if (auth?.token) {
      fetchUserInfo();
    }
  }, [auth, id]);

  // Validation schema for editable fields
  const validationSchema = Yup.object({
    name: Yup.string().required("Full name is required"),
    phone: Yup.string().required("Phone number is required"),
    address: Yup.object({
      street1: Yup.string().required("Street 1 is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      zipCode: Yup.string().required("Zip code is required"),
    }),
  });

  // Validation schema for password change
  const passwordSchema = Yup.object({
    oldPassword: Yup.string().required("Old password is required"),
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
  });

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const updatedUser = {
        ...userInfo,
        ...values,
        address: { ...userInfo.address, ...values.address },
      };
      console.log("update add",updatedUser);
      

      const res = await axios.patch(`${BASE_URL}/user/${id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });

      toast.success("User updated successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error updating user", error);
      toast.error("Failed to update user.");
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (values, { resetForm }) => {
    console.log("pass",values);
    
    try {
      await axios.patch(
        `${BASE_URL}/user/reset-password/${id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      toast.success("Password updated successfully!");
      setShowModal(false);
      resetForm(); // Reset form fields in modal
    } catch (error) {
      console.error("Error updating password", error);
      toast.error("Failed to update password.");
    }
  };

  return (
    <div className="content-wrapper">
    <section className="content-header d-flex align-items-center justify-content-between">
      <h1>Update User Information</h1>
      <div>
        <button
          className="btn btn-link p-0"
          onClick={() => setShowModal(true)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "1.5rem",
            color: "#333",
          }}
        >
          <BsThreeDotsVertical />
        </button>
      </div>
    </section>

    <section className="content">
      <Formik
        initialValues={{
          name: userInfo.name,
          phone: userInfo.phone,
          address: {
            street1: userInfo.address.street1,
            street2: userInfo.address.street2,
            city: userInfo.address.city,
            state: userInfo.address.state,
            zipCode: userInfo.address.zipCode,
            country: userInfo.address.country,
          },
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values }) => (
          <Form>
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header bg-primary">
                    Basic Information
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label>Full Name</label>
                      <Field
                        type="text"
                        name="name"
                        className="form-control"
                        required
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <Field
                        type="text"
                        name="phone"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card">
                  <div className="card-header bg-secondary">
                    Address Information
                  </div>
                  <div className="card-body">
                    {[
                      "street1",
                      "street2",
                      "city",
                      "state",
                      "zipCode",
                      "country",
                    ].map((field, index) => (
                      <div className="form-group" key={index}>
                        <label>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        <Field
                          type="text"
                          name={`address.${field}`}
                          className="form-control"
                          required
                        />
                        <ErrorMessage
                          name={`address.${field}`}
                          component="div"
                          className="text-danger"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-success mt-3">
              Update User
            </button>
          </Form>
        )}
      </Formik>
    </section>

    {/* Password Change Modal */}
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{ oldPassword: "", newPassword: "" }}
        validationSchema={passwordSchema}
        onSubmit={handlePasswordUpdate}
      >
        {({ isSubmitting }) => (
          <Form>
            <Modal.Body>
              <div className="form-group">
                <label>Old Password</label>
                <Field
                  type="password"
                  name="oldPassword"
                  className="form-control"
                />
                <ErrorMessage
                  name="oldPassword"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <Field
                  type="password"
                  name="newPassword"
                  className="form-control"
                />
                <ErrorMessage
                  name="newPassword"
                  component="div"
                  className="text-danger"
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                Update Password
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  </div>
  );
}

export default EditUserProfile;
