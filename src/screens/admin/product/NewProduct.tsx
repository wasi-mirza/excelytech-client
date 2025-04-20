import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Typeahead } from "react-bootstrap-typeahead";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { getAllCategories } from "../../../shared/api/endpoints/category";
import { CategoryResponse } from "../../../shared/api/types/category.types";
import { User } from "../../../shared/api/types/user.types";
import { AddProductInput } from "../../../shared/api/types/product.types";
import { useUserService } from "../../../shared/services/useUserService";
import { uploadProductImage } from "../../../shared/api/endpoints/product";
import { addProduct } from "../../../shared/api/endpoints/product";
import { logUserActivity } from "../../../shared/api/endpoints/user";
import { productValidationSchema } from "../../../shared/validations/productValidation";

const NewProduct = () => {
  const { getUsers, loading, error } = useUserService();

  const navigate = useNavigate();
  const [auth] = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showDuration, setShowDuration] = useState(false);

  // Fetch users (for product manager selection)
  const fetchUsers = async () => {
    if (!auth?.token) return;
    try {
      const users = await getUsers();
      setUsers(users?.data)
    } catch (error) {
      console.error("Error fetching Users:", error);
    }
  };

  // Fetch categories (for category selection)
  const fetchCategories = async () => {
    try {
      const res = await getAllCategories(1, 1000);
      setCategories(res?.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Formik setup
  const formik = useFormik<AddProductInput>({
    initialValues: {
      sku: "",
      name: "",
      description: "",
      cost: 0,
      tax: 0,
      totalCost: 0,
      productManager: "",
      category: "",
      purchaseType: "one-time",
      currency: "CAD",
      status: "Active",
      tags: [], 
      keywords: [],
      activeSubscriptions: 0,
      revenueGenerated: 0,
      imageUrl: "",
    },
    validationSchema: productValidationSchema,
    onSubmit: async (values) => {
      let imageUrl = null;
      if (!file) {
        toast.error("Please select an image file.");
        return;
      }

      // Handle image upload
      const uploadData = new FormData();
      uploadData.append("image", file);

      try {
        const uploadResponse = await uploadProductImage(uploadData);
        if (uploadResponse.status === 200) {
          // Log user activity
          await logUserActivity({
            userId: auth?.user?._id,
            activityType: "UPLOAD",
            description: "upload product image",
          });

          imageUrl = uploadResponse.data.fileUrl;

          // Prepare product data with image URL
          const productData = {
            ...values,
            imageUrl,
            cost: parseFloat(values.cost.toString()),
            tax: parseFloat(values.tax.toString()),
            totalCost: parseFloat(values.totalCost.toString()),
          };

          // Send product data to backend
          const res = await addProduct(productData);
          if (res.data) {
            toast.success(res.data.message);
            navigate(-1);
          } else {
            toast.error("Failed to save product");
          }
        } else {
          toast.error("Failed to upload image");
        }
      } catch (error: any) {
        console.error("Error in product creation:", error);
        toast.error(error.response?.data?.message || "Error creating product");
      }
    },
  });

  // Fetch users and categories when component mounts
  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, [auth]);

  useEffect(() => {
    setShowDuration(formik.values.purchaseType === "subscription");
  }, [formik.values.purchaseType]);

  useEffect(() => {
    const totalCost = (
      formik.values.cost *
      (1 + formik.values.tax / 100)
    ).toFixed(2);

    formik.setFieldValue("totalCost", totalCost); // Keeps totalCost rounded to two decimals
  }, [formik.values.cost, formik.values.tax]);

  // Handle file change (image preview)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="text-dark">Add Product</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="content">
        <div className="card card-outline card-olive p-2">
          <form onSubmit={formik.handleSubmit}>
            <div className="row">
              {/* Product Details Card */}
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header ">Product Details</div>
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="sku">SKU</label>
                      <input
                        type="text"
                        className="form-control"
                        id="sku"
                        name="sku"
                        value={formik.values.sku}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter SKU"
                      />
                      {formik.touched.sku && formik.errors.sku && (
                        <small className="text-danger">
                          {formik.errors.sku}
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="name">Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter Product Name"
                      />
                      {formik.touched.name && formik.errors.name && (
                        <small className="text-danger">
                          {formik.errors.name}
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        rows={3}
                        placeholder="Enter Description"
                      />
                      {formik.touched.description &&
                        formik.errors.description && (
                          <small className="text-danger">
                            {formik.errors.description}
                          </small>
                        )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="currency">Currency</label>
                      <select
                        className="form-control"
                        id="currency"
                        name="currency"
                        value={formik.values.currency}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="USD">USD - United States Dollar</option>
                      </select>
                      {formik.touched.currency && formik.errors.currency && (
                        <small className="text-danger">
                          {formik.errors.currency}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Details Card */}
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header ">Pricing Details</div>
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="cost">Cost</label>
                      <input
                        type="number"
                        className="form-control"
                        id="cost"
                        name="cost"
                        value={formik.values.cost}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        min="0"
                        step="0.01"
                        placeholder="Enter Purchase Price"
                      />
                      {formik.touched.cost && formik.errors.cost && (
                        <small className="text-danger">
                          {formik.errors.cost}
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="tax">Tax</label>
                      <input
                        type="number"
                        className="form-control"
                        id="tax"
                        name="tax"
                        value={formik.values.tax}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        min="0"
                        step="0.01"
                        placeholder="Enter Tax"
                      />
                      {formik.touched.tax && formik.errors.tax && (
                        <small className="text-danger">
                          {formik.errors.tax}
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="totalCost">Total Cost</label>
                      <input
                        type="number"
                        className="form-control"
                        id="totalCost"
                        name="totalCost"
                        value={formik.values.totalCost}
                        disabled
                        placeholder="Total Cost"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="purchaseType">Purchase Type</label>
                      <select
                        className="form-control"
                        id="purchaseType"
                        name="purchaseType"
                        value={formik.values.purchaseType}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        <option value="one-time">One-Time</option>
                        <option value="subscription">Subscription</option>
                      </select>
                      {formik.touched.purchaseType &&
                        formik.errors.purchaseType && (
                          <small className="text-danger">
                            {formik.errors.purchaseType}
                          </small>
                        )}
                    </div>

                    {showDuration && (
                      <div className="form-group">
                        <label htmlFor="duration">Duration (in days)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="duration"
                          name="duration"
                          value={formik.values.duration}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          min="1"
                          placeholder="Enter duration in days"
                        />
                        {formik.touched.duration && formik.errors.duration && (
                          <small className="text-danger">
                            {formik.errors.duration}
                          </small>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              {/* Product Manager and Category Card */}
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header ">Manager & Category</div>
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="productManager">Product Manager</label>
                      <Typeahead
                        id="productManager"
                        options={users}
                        labelKey="name"
                        onChange={(selected) =>
                          formik.setFieldValue(
                            "productManager",
                            (selected[0] as User)?._id
                          )
                        }
                        placeholder="Choose a product manager"
                        className="w-100"
                      />
                      {formik.touched.productManager &&
                        formik.errors.productManager && (
                          <small className="text-danger">
                            {formik.errors.productManager}
                          </small>
                        )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <Typeahead
                        id="category"
                        options={categories}
                        labelKey="name"
                        onChange={(selected) =>
                          formik.setFieldValue("category", 
                            (selected[0] as CategoryResponse)?._id
                          )
                        }
                        placeholder="Choose a category"
                        className="w-100"
                      />
                      {formik.touched.category && formik.errors.category && (
                        <small className="text-danger">
                          {formik.errors.category}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Upload Card */}
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header ">Image Upload</div>
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="imageUpload" className="font-weight-bold">
                        Selected Image
                      </label>
                      {preview && (
                        <div className="form-group">
                          <img
                            src={preview}
                            alt="Selected Preview"
                            className="img-thumbnail mb-2"
                            width="100"
                          />
                        </div>
                      )}
                      <div className="input-group">
                        <div className="custom-file">
                          <input
                            type="file"
                            className="custom-file-input"
                            id="imageUpload"
                            name="imageUpload"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          <label
                            className="custom-file-label"
                            htmlFor="imageUpload"
                          >
                            Choose file
                          </label>
                        </div>
                      </div>
                      <small className="form-text text-muted">
                        Supported formats: JPG, PNG, GIF. Max size: 2MB.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}

            <div className="form-group mt-4 text-center card-footer ">
              <button type="submit" className="btn btn-success">
                Save Product
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default NewProduct;
