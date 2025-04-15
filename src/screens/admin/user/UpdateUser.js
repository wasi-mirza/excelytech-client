import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import { toast } from "react-hot-toast";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Typeahead } from "react-bootstrap-typeahead"; // Import Typeahead
import { BASE_URL } from "../../../utils/endPointNames.js";

function UpdateUserForm() {
  const [userInfo, setUserInfo] = useState({
    password: "",
    name: "",
    phone: "",
    userType: "",
    businessDetails: {
      clientName: "",
      companyName: "",
      companyType: "",
      taxId: "",
      employeeSize: "",
      ownerPhone: "",
      ownerEmail: "",
    },
    timeZone: "",
    preferredContactMethod: "",
    notes: "",
    paymentStatus: "",
    allowLogin: true,
    activeAccount: true,
    bannedAccount: false,
    accountManagers: "",
    address: {
      street1: "",
      street2: "",
      city: "",
      state: "",
      zipCode: "",
    },
    purchaseHistory: "",
    subscription: "",
  });
  const timeZones = [
    "Newfoundland Time (UTC -03:30)",
    "Atlantic Time (UTC -04:00)",
    "Eastern Time (UTC -05:00)",
    "Central Time (UTC -06:00)",
    "Mountain Time (UTC -07:00)",
    "Pacific Time (UTC -08:00)",
    "Yukon Time (UTC -07:00 - No DST)",
  ];
  const [accountManagers, setAccountManagers] = useState([]); // State for account managers
  const [previewAM, setPreviewAM] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for fetching data
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
        setUserInfo(res.data);

        if (res.data.accountManagers) {
          console.log("Enter");

          setPreviewAM({
            id: res.data.accountManagers._id,
            name: res.data.accountManagers.name,
          });
        }
        console.log("Cli", res.data);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    // console.log("prev",previewAM)

    const fetchAccountManagers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/admin`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        setAccountManagers(
          res.data.map((admin) => ({
            id: admin._id,
            name: admin.name,
          }))
        );
        console.log("Adminnn", res.data, accountManagers);

        setLoading(false); // Set loading to false after fetching data
      } catch (error) {
        console.error("Error fetching account managers", error);
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchUserInfo();
      fetchAccountManagers();
    }
  }, [auth, id]);

  // Validation schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string().required("Full name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    userType: Yup.string().required("User type is required"),
    businessDetails: Yup.object({
      clientName: Yup.string().required("Client name is required"),
      companyName: Yup.string().required("Company name is required"),
      companyType: Yup.string().required("Company type is required"),
      taxId: Yup.string().required("Tax ID is required"),
      employeeSize: Yup.string().required("Employee size is required"),
      ownerPhone: Yup.string().required("Owner phone is required"),
      ownerEmail: Yup.string()
        .email("Invalid email format")
        .required("Owner email is required"),
    }),
    timeZone: Yup.string().required("Time Zone is required"),
    address: Yup.object({
      street1: Yup.string().required("Street 1 is required"),
      street2: Yup.string().required("Street 2 is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      zipCode: Yup.string().required("Zip code is required"),
    }),
  });

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const res = await axios.patch(`${BASE_URL}/user/${id}`, values, {
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

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="text-dark">Update Client Account</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="#">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  Update Client Account
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <Formik
          initialValues={userInfo}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize // Important to allow form values to update
        >
          {({ setFieldValue, values, handleChange, errors, touched }) => (
            <Form>
              <div className="card p-2">
                <div className="row">
                  {/* Business Details */}
                  <div className="col-md-6">
                    <div className="card mb-6 card-outline card-olive">
                      <div className="card-header ">
                        <h5 className="card-title">Business Information</h5>
                      </div>
                      <div className="card-body">
                        {[
                          "clientName",
                          "companyName",
                          "companyType",
                          "taxId",
                          "employeeSize",
                          "ownerPhone",
                          "ownerEmail",
                        ].map((field, index) => (
                          <div className="form-group" key={index}>
                            <label>
                              {field.charAt(0).toUpperCase() + field.slice(1)}
                            </label>
                            <Field
                              type="text"
                              name={`businessDetails.${field}`}
                              className="form-control"
                            />
                            <ErrorMessage
                              name={`businessDetails.${field}`}
                              component="div"
                              className="text-danger"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Basic Information */}
                  <div className="col-md-6">
                    <div className="card mb-3 card-outline card-olive">
                      <div className="card-header ">
                        <h5 className="card-title">Account Owner</h5>
                      </div>
                      <div className="card-body">
                        <div className="form-group">
                          <label>Full Name</label>
                          <Field
                            type="text"
                            name="name"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="name"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                        <div className="form-group">
                          <label>Email</label>
                          <Field
                            type="email"
                            name="email"
                            readOnly // Correct camelCase for the attribute
                            className="form-control"
                          />
                          <ErrorMessage
                            name="email"
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

                        <div className="form-group">
                          <label>User Type</label>
                          <Field
                            as="select"
                            name="userType"
                            className="form-control"
                          >
                            <option value="">Select User Type</option>{" "}
                            {/* Default placeholder */}
                            <option value="lead">Lead</option>
                            <option value="prospect">Prospect</option>
                            <option value="opportunity">Opportunity</option>
                            <option value="customer">Customer</option>
                          </Field>
                          <ErrorMessage
                            name="userType"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                        <div className="form-group">
                          {["allowLogin", "activeAccount"].map(
                            (field, index) => (
                              <div className="px-2 form-group" key={index}>
                                <Field
                                  type="checkbox"
                                  name={field}
                                  id={field} // Added id attribute
                                  className="form-check-input"
                                />
                                <label htmlFor={field}>
                                  {field.charAt(0).toUpperCase() +
                                    field.slice(1)}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Address Information */}
                  <div className="col-md-6">
                    <div className="card mb-3 card-outline card-olive">
                      <div className="card-header ">
                        <h5 className="card-title">Address</h5>
                      </div>
                      <div className="card-body">
                        <div className="form-group">
                          <label>Time Zone</label>
                          <Field
                            as="select"
                            name="timeZone"
                            className="form-control"
                            value={values.timeZone || ""} // Ensure the value is set from Formik's values
                          >
                            <option value="">Select Time Zone</option>{" "}
                            {/* Default placeholder */}
                            {timeZones.map((item) => (
                              <option value={item} key={item}>
                                {item}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="timeZone"
                            component="div"
                            className="text-danger"
                          />

                          <ErrorMessage
                            name="userType"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                        {/* <div className="form-group">
                        <label htmlFor="timeZone">Time Zone</label>
                        <Field
                          name="timeZone"
                          className="form-control"
                          value={userInfo.timeZone || ""} // Ensure there's a default value in case timeZone is undefined or null
                          onChange={(e) =>
                            setUserInfo({
                              ...userInfo,
                              timeZone: e.target.value,
                            })
                          } // Update state on change
                          id="timeZone"
                        >
                          <option value="">Select Time Zone</option>{" "}
                          {/* Default placeholder 
                          {timeZones.map((item) => (
                            <option value={item} key={item}>
                              {item}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="timeZone"
                          component="div"
                          className="text-danger"
                        />
                      </div> */}

                        {["street1", "street2", "city", "state", "zipCode"].map(
                          (field, index) => (
                            <div className="form-group" key={index}>
                              <label>
                                {field.charAt(0).toUpperCase() + field.slice(1)}
                              </label>
                              <Field
                                type="text"
                                name={`address.${field}`}
                                className="form-control"
                              />
                              <ErrorMessage
                                name={`address.${field}`}
                                component="div"
                                className="text-danger"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="col-md-6">
                    <div className="card mb-3 card-outline card-olive">
                      <div className="card-header ">
                        <h5 className="card-title">Account Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="form-group">
                          <label>Select Account Manager</label>
                          <Typeahead
                            id="account-manager"
                            options={accountManagers} // Use accountManagers fetched from the API
                            labelKey="name" // Assuming the label is 'name'
                            placeholder="Select an Account Manager"
                            isLoading={loading}
                            onChange={(selected) => {
                              setFieldValue(
                                "accountManagers",
                                selected[0]?.id || "" // Save the ID of the selected account manager
                              );
                            }}
                            selected={
                              accountManagers.find(
                                (admin) => admin.id === values.accountManagers
                              )
                                ? [
                                    accountManagers.find(
                                      (admin) =>
                                        admin.id === values.accountManagers
                                    ),
                                  ]
                                : previewAM?.id
                                ? [
                                    {
                                      id: previewAM.id,
                                      name: previewAM.name,
                                    },
                                  ]
                                : []
                            }
                          />
                          <ErrorMessage
                            name="accountManagers"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="row justify-content-center">
                    <button type="submit" className="btn btn-success mt-3">
                      Update User
                    </button>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </div>
  );
}

export default UpdateUserForm;
