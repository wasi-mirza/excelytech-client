import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-hot-toast"; // Ensure this import is correct
import { useAuth } from "../../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../shared/utils/endPointNames.js";
import { Typeahead } from "react-bootstrap-typeahead";

const NewUser = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const timeZones = [
    "Newfoundland Time (UTC -03:30)",
    "Atlantic Time (UTC -04:00)",
    "Eastern Time (UTC -05:00)",
    "Central Time (UTC -06:00)",
    "Mountain Time (UTC -07:00)",
    "Pacific Time (UTC -08:00)",
    "Yukon Time (UTC -07:00 - No DST)",
  ];

  const companyTypes = ["Pvt Ltd", "LLC", "Partnership", "Sole Proprietorship"];

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoadingAdmins(true);
      try {
        const response = await axios.get(`${BASE_URL}/user/admin`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        setAdmins(
          response.data.map((admin) => ({
            id: admin._id,
            name: admin.name,
          }))
        );
        console.log("Admins", response.data);
      } catch (error) {
        toast.error("Failed to load admin data.");
      } finally {
        setLoadingAdmins(false);
      }
    };

    fetchAdmins();
  }, [auth?.token]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number should be 10 digits")
      .required("Phone number is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
    businessDetails: Yup.object({
      clientName: Yup.string().required("Client name is required"),
      companyType: Yup.string().required("Company type is required"),
      taxId: Yup.string().required("Tax ID is required"),
      // accountManagers: Yup.string().required("Account Manager is required"),
      employeeSize: Yup.string().required("Employee size is required"),
      ownerPhone: Yup.string().required("Owner phone is required"),
      ownerEmail: Yup.string()
        .email("Invalid email")
        .required("Owner email is required"),
    }),
    timeZone: Yup.string().required("Time zone is required"),
    address: Yup.object({
      street1: Yup.string().required("Street address is required"),
      street2: Yup.string().required("Street address is required"),

      zipCode: Yup.string().required("ZIP Code is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      country: Yup.string().required("country is required"),
    }),
    allowLogin: Yup.boolean(),
    activeAccount: Yup.boolean(),
    bannedAccount: Yup.boolean(),
    userAgreementUrl: Yup.string().required("User Agreement is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      userType: "lead",
      email: "",
      password: "",
      role: "client",
      businessDetails: {
        clientName: "",
        companyName: "",
        companyType: "",
        taxId: "",
        employeeSize: "",
        ownerPhone: "",
        ownerEmail: "",
      },
      timeZone: "UTC",
      accountManagers: "",
      preferredContactMethod: "email",
      paymentStatus: "noPaymentYet",
      address: {
        street1: "",
        street2: "",
        zipCode: "",
        city: "",
        state: "",
        country: "",
      },
      allowLogin: true,
      activeAccount: true,
      bannedAccount: false,
      userAgreementUrl: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log("clicked on submit", values);

      try {
        let userAgreementUrl = null;

        // Step 1: Upload the file to /upload/productImage
        if (values.userAgreementUrl) {
          const fileData = new FormData();
          fileData.append("doc", values.userAgreementUrl);
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

          userAgreementUrl = uploadResponse.data.fileUrl; // Assume fileUrl is returned by the API
        }

        // Step 2: Submit the main form with the uploaded file URL
        const formValues = { ...values, userAgreementUrl };
        console.log("Formvalues", formValues);

        const res = await axios.post(`${BASE_URL}/user/register`, formValues, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        console.log("New User", res);

        const createPasswordResponse = await axios.post(
          `${BASE_URL}/password/create`,
          {
            clientId: res.data.user._id, // Send clientId
            password: res.data.user.password, // Send password
          },
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        if (createPasswordResponse.status === 201) {
          // setPassword(createPasswordResponse.data.password);
          console.log("Password Created Successfully");
        }
        if (
          res.status == 200 ||
          (res.status == 201 && createPasswordResponse.status === 201)
        ) {
          toast.success("User created successfully");
          navigate("/admin-dashboard/allusers");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error creating user");
      }
    },
  });
  // console.log("Arr ad", admins);

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="text-dark">Create Client Account</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="#">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  Create Client Account
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <form onSubmit={formik.handleSubmit}>
          <div className="card p-2">
            <div className="row">
              {/* Business Details Card */}
              <div className="col-md-6">
                <div className="card mb-6 card-outline card-olive">
                  <div className="card-header ">
                    <h5 className="card-title">Business Information</h5>
                  </div>
                  <div className="card-body">
                    {[
                      "clientName",
                      "companyName",
                      "companyType", // create dropdown
                      "taxId",
                      "employeeSize", // create dropdown
                      "ownerPhone",
                      "ownerEmail",
                      // add business owner Name,
                    ].map((field, index) => (
                      <div className="form-group" key={index}>
                        <label>
                          {field
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </label>
                        {field === "companyType" ? (
                          <select
                            name={`businessDetails.${field}`}
                            value={formik.values.businessDetails[field]}
                            onChange={formik.handleChange}
                            className="form-control"
                          >
                            <option value="" disabled>
                              Select Company Type
                            </option>
                            <option value="Pvt Ltd">Pvt Ltd</option>
                            <option value="LLC">LLC</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Sole Proprietorship">
                              Sole Proprietorship
                            </option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            name={`businessDetails.${field}`}
                            value={formik.values.businessDetails[field]}
                            onChange={formik.handleChange}
                            className="form-control"
                          />
                        )}
                        {formik.touched.businessDetails?.[field] &&
                          formik.errors.businessDetails?.[field] && (
                            <div className="text-danger">
                              {formik.errors.businessDetails[field]}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Auth Details Card */}
              <div className="col-md-6">
                <div className="card mb-3 card-outline card-olive">
                  <div className="card-header ">
                    <h5 className="card-title">Account Owner</h5>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        className="form-control"
                      />
                      {formik.touched.name && formik.errors.name && (
                        <div className="text-danger">{formik.errors.name}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        className="form-control"
                      />
                      {formik.touched.phone && formik.errors.phone && (
                        <div className="text-danger">{formik.errors.phone}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        className="form-control"
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className="text-danger">{formik.errors.email}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="text"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        className="form-control"
                      />

                      {formik.touched.password && formik.errors.password && (
                        <div className="text-danger">
                          {formik.errors.password}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary "
                      onClick={() => {
                        const generateRandomPassword = () => {
                          const charset =
                            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
                          return Array.from({ length: 12 }, () =>
                            charset.charAt(
                              Math.floor(Math.random() * charset.length)
                            )
                          ).join("");
                        };

                        const randomPassword = generateRandomPassword();
                        formik.setFieldValue("password", randomPassword);
                        toast.success("Password generated and applied!");
                      }}
                    >
                      Generate New Password
                    </button>
                    <br />
                    <br />
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="allowLogin"
                        name="allowLogin"
                        checked={formik.values.allowLogin}
                        onChange={() =>
                          formik.setFieldValue(
                            "allowLogin",
                            !formik.values.allowLogin
                          )
                        }
                        className="form-check-input"
                      />
                      <label className="form-check-label" htmlFor="allowLogin">
                        Allow Login
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="activeAccount"
                        name="activeAccount"
                        checked={formik.values.activeAccount}
                        onChange={() =>
                          formik.setFieldValue(
                            "activeAccount",
                            !formik.values.activeAccount
                          )
                        }
                        className="form-check-input"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="activeAccount"
                      >
                        Active Account
                      </label>
                    </div>
                    <br />
                    <div className="form-group">
                      <label htmlFor="userAgreementUrl">User Agreement</label>
                      <div className="custom-file">
                        <input
                          type="file"
                          className="custom-file-input"
                          id="userAgreementUrl"
                          name="userAgreementUrl"
                          onChange={(event) => {
                            formik.setFieldValue(
                              "userAgreementUrl",
                              event.currentTarget.files[0]
                            );
                          }}
                          accept=".pdf,.doc,.docx"
                        />
                        <label
                          className="custom-file-label"
                          htmlFor="userAgreementUrl"
                        >
                          Choose file
                        </label>
                      </div>
                      <small className="form-text text-muted">
                        Supported formats: PDF, DOC, DOCX
                      </small>
                      {formik.touched.userAgreementUrl &&
                        formik.errors.userAgreementUrl && (
                          <span className="text-danger d-block mt-2">
                            {formik.errors.userAgreementUrl}
                          </span>
                        )}
                    </div>
                    {/* <div className="form-check">
                    <input
                      type="checkbox"
                      name="bannedAccount"
                      checked={formik.values.bannedAccount}
                      onChange={() =>
                        formik.setFieldValue(
                          "bannedAccount",
                          !formik.values.bannedAccount
                        )
                      }
                      className="form-check-input"
                    />
                    <label className="form-check-label">Banned Account</label>
                  </div> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="row">
              <div className="col-md-6">
                <div className="card mb-3 card-outline card-olive">
                  <div className="card-header ">
                    <h5 className="card-title">Address</h5>
                  </div>
                  <div className="card-body">
                    .
                    <div class="mb-3">
                      <label for="" class="form-label">
                        Timezone
                      </label>
                      <select
                        className="form-control"
                        onChange={(item) =>
                          formik.setFieldValue("timeZone", item.target.value)
                        }
                      >
                        {timeZones.map((item) => (
                          <option value={item} key={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                    {[
                      "street1",
                      "street2",
                      "zipCode",
                      "city",
                      "state",
                      "country",
                    ].map((field, index) => (
                      <div className="form-group" key={index}>
                        <label>
                          {field
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </label>
                        <input
                          type="text"
                          name={`address.${field}`}
                          value={formik.values.address[field]}
                          onChange={formik.handleChange}
                          className="form-control"
                        />
                        {formik.touched.address?.[field] &&
                          formik.errors.address?.[field] && (
                            <div className="text-danger">
                              {formik.errors.address[field]}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Miscellaneous */}
              <div className="col-md-6">
                <div className="card mb-3 card-outline card-olive">
                  <div className="card-header ">
                    <h5 className="card-title">Account Management</h5>
                  </div>
                  <div className="card-body ">
                    <div className="form-group">
                      <label>Account Manager</label>
                      <Typeahead
                        id="account-manager"
                        options={admins}
                        labelKey="name"
                        placeholder="Select an Account Manager"
                        isLoading={loadingAdmins}
                        onChange={(selected) => {
                          formik.setFieldValue(
                            "accountManagers",
                            selected[0]?.id || ""
                          );
                        }}
                        // selected={
                        //   admins.find((admin) => admin.id === formik.values.accountManagers)
                        //     ? [admins.find((admin) => admin.id === formik.values.accountManagers)]
                        //     : []
                        // } // Dynamically pre-select based on formik values
                      />
                      {formik.touched.accountManagers &&
                        formik.errors.accountManagers && (
                          <div className="text-danger">
                            {formik.errors.accountManagers}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <div className="row justify-content-center">
                <button
                  onClick={() => console.log("error", formik.errors)}
                  type="submit"
                  className="btn btn-success"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default NewUser;
