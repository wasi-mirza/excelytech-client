import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Typeahead } from "react-bootstrap-typeahead";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import "react-bootstrap-typeahead/css/Typeahead.css";
import toast from "react-hot-toast";
import {
  FormGroup,
  Label,
} from "reactstrap";
import { CategoryResponse } from "../../../shared/api/types/category.types";
import { useUserService } from "../../../shared/services/useUserService";
import { User } from "../../../shared/api/types/user.types";
import { getProductById, uploadProductImage, updateProduct } from "../../../shared/api/endpoints/product";
import { Product, UpdateProductInput } from "../../../shared/api/types/product.types";
import { getAllCategories } from "../../../shared/api/endpoints/category";
import { logUserActivity } from "../../../shared/api/endpoints/user";

function UpdateProduct() {
  const { getUsers, loading: loadingUsers, error: errorUsers } = useUserService();

  const [product, setProduct] = useState<Product>();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const { id } = useParams();
  let newUrl = BASE_URL?.replace("/api", "");

  const fetchUsers = async () => {
    if (!auth?.token) return;
    try {
      const response = await getUsers();
      console.log("Users ----", response.data);

      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching Users:", error);
    }
  };

  const getProduct = async () => {
    try {
      const res = await getProductById(id);
      console.log("product single by id---", res);

      setProduct(res?.data);
      setPreview(newUrl + res?.data.imageUrl || null); // Set initial preview to existing image URL
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Failed to load product data.");
    }
  };

  useEffect(() => {
    if (auth?.token) getProduct();
    fetchUsers();
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories(1, 1000);
        setCategories(response.categories);
        console.log("res cat", response.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [auth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement; // Destructure the event target properties
    const updatedValue = type === "checkbox" ? checked : value; // If it's a checkbox, use 'checked' otherwise use 'value'

    if (name === "cost" || name === "tax") {
      // Check if the field changed is "cost" or "tax"
      const cost =
        name === "cost"
          ? updatedValue || 0
          : product?.cost || 0; // If the field is 'cost', update it with 'updatedValue', else use current cost
      const taxPercentage =
        name === "tax"
          ? updatedValue || 0
          : product?.tax || 0; // If the field is 'tax', update it with 'updatedValue', else use current tax

      // Calculate the totalCost using the formula (cost * (1 + taxPercentage / 100))
      const updatedProduct = {
        ...product,
        [name]: updatedValue,
        totalCost: Number((Number(cost) * (1 + Number(taxPercentage) / 100)).toFixed(2)),
      } as Product;

      // console.log(`Cost is ${cost}, tax is ${taxPercentage}`); // Log the cost and tax values

      // console.log("totalCost:", updatedProduct.totalCost); // Log the recalculated total cost

      setProduct(updatedProduct); // Update the product state
    } else {
      // For other fields, update only the specific field in the product state
      setProduct({
        ...product,
        [name]: updatedValue,
      } as Product);
    }
  };

  const handleSelectecUserChange = (selectedUser: any) => {
    setSelectedUser(selectedUser);
    if (selectedUser) {
      const userid = selectedUser._id;
      setProduct((prevData: any) => ({
        ...prevData,
        productManager: userid,
      }));
    } else {
      setProduct((prevData: any) => ({
        ...prevData,
        productManager: null,
      }));
    }
  };

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      // Set imageUrl to the existing product image URL initially
      let imageUrl = product?.imageUrl;
      if (file !== null) {
        const uploadData = new FormData();
        uploadData.append("image", file);

        const uploadResponse = await uploadProductImage(uploadData);

        imageUrl = uploadResponse.data.fileUrl;
        toast.success("Image uploaded successfully");
      }

      // Update imageUrl with new uploaded URL

      // Prepare the updated product data, including the correct imageUrl
      const updatedProductData = { ...product, imageUrl };

      const updateResponse = await updateProduct(updatedProductData as UpdateProductInput);
      if (updateResponse.status == 200 || updateResponse.status == 201) {
        await logUserActivity({
          userId: auth?.user?._id,
          activityType: "UPDATE",
          description: "Updated product",
        });
      }
      toast.success("Product updated successfully");
      navigate(-1);
    } catch (error) {
      console.error("Error updating product:", error);
      setError("Failed to update product. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <h1 className="text-dark">Update Product</h1>
      </section>

      <section className="content">
        <form
          onSubmit={handleSubmit}
          className="card card-outline card-olive p-2"
        >
          <div className="card-header">
            <h3 className="card-title">Update Product</h3>
          </div>
          <div className="card-body">
            <div className="row">
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
                        readOnly
                        value={product?.sku}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="name">Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={product?.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        value={product?.description}
                        onChange={handleChange}
                        rows={3}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="currency">Currency</label>
                      <select
                        className="form-control"
                        id="currency"
                        name="currency"
                        value={product?.currency}
                        onChange={handleChange}
                        required
                      >
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="USD">USD - United States Dollar</option>
                        {/* <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CNY">CNY - Chinese Yuan</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="AED">AED - UAE Dirham</option> */}
                        {/* Add other currencies as needed */}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header ">Manager & Category</div>
                  <div className="card-body">
                    <FormGroup>
                      <Label>Product Manager</Label>
                      <Typeahead
                        id="user-selector"
                        options={users}
                        labelKey="username" // Adjust based on your user object, e.g., 'email' or 'name'
                        onChange={(selected: any) => {
                          console.log("selected", selected[0]);

                          handleSelectecUserChange((prev: any) => ({
                            ...prev,
                            productManager: selected[0]?.username || "",
                          }));
                        }}
                        //  onInputChange={(input) => handleEmailTo(input)}
                        selected={
                          product?.productManager
                            ? [product?.productManager]
                            : selectedUser[0]
                        }
                        placeholder="Choose a product manager"
                      />
                    </FormGroup>
                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <Typeahead
                        id="category"
                        options={categories} // Options should be an array of objects with 'name' key
                        labelKey="name" // Adjust this to match the key used for category names in your API response
                        onChange={(selected: any) => {
                          setProduct((prevData: any) => ({
                            ...prevData,
                            category: selected[0]?.name || "",
                          }));
                        }}
                        selected={
                          product?.category ? [{ name: product?.category }] : []
                        } // Ensure the selected value is always in the correct format
                        placeholder="Choose a category"
                        maxResults={10} // Limits results shown before scrolling
                        paginate // Enables pagination for scrolling
                        minLength={0} // Allows the dropdown to show categories even when no text is entered
                        clearButton // Adds a clear button to reset selection
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                        value={product?.cost}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="tax">Tax</label>
                      <input
                        type="number"
                        className="form-control"
                        id="tax"
                        name="tax"
                        value={product?.tax}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="totalCost">Total Cost</label>
                      <input
                        type="number"
                        className="form-control"
                        id="totalCost"
                        name="totalCost"
                        value={
                          product?.totalCost ||
                          (product?.cost || 0) * (1 + (product?.tax || 0) / 100)
                        }
                        readOnly
                      />
                    </div>
                  </div>
                </div>

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
                            className="img-thumbnail"
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
          </div>
          <div className="form-group mt-4 text-center card-footer">
            <button type="submit" className="btn btn-success btn-center">
              Update Product
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default UpdateProduct;
