import * as Yup from "yup";
export const productValidationSchema = Yup.object({
  sku: Yup.string().required("SKU is required"),
  name: Yup.string().required("Product Name is required"),
  description: Yup.string().required("Description is required"),
  cost: Yup.number()
    .required("Cost is required")
    .min(0, "Cost must be greater than or equal to 0"),
  tax: Yup.number()
    .required("Tax is required")
    .min(0, "Tax must be greater than or equal to 0"),
  totalCost: Yup.number().required("Total Cost is required"),
  productManager: Yup.string().required("Product Manager is required"),
  category: Yup.string().required("Category is required"),
  purchaseType: Yup.string().required("Purchase Type is required"),
  currency: Yup.string().required("Currency is required"),
  status: Yup.string().required("Status is required"),
  tags: Yup.array().of(Yup.string().required("Each tag is required")),
  keywords: Yup.array().of(Yup.string().required("Each keyword is required")),
});
