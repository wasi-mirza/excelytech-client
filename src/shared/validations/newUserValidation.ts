import * as Yup from "yup";

// New User Validation schema using Yup
export const newUserValidationSchema = Yup.object({
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

// Update User Validation schema using Yup
export const updateUserValidationSchema = Yup.object({
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
