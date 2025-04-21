import * as Yup from "yup";
  // User Profile Validation schema for editable fields
  export const profileValidationSchema = Yup.object({
    name: Yup.string().required("Full name is required"),
    phone: Yup.string().required("Phone number is required"),
    address: Yup.object({
      street1: Yup.string().required("Street 1 is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      zipCode: Yup.string().required("Zip code is required"),
    }),
  });

  // User Profile Validation schema for password change
  export const passwordValidationSchema = Yup.object({
    oldPassword: Yup.string().required("Old password is required"),
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
  });