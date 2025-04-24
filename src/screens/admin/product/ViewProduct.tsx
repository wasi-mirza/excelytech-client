import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import toast from "react-hot-toast";
import { logUserActivity } from "../../../shared/api/endpoints/user";
import { getProductById } from "../../../shared/api/endpoints/product";
import { Product } from "../../../shared/api/types/product.types";

function ViewProduct() {
  const [product, setProduct] = useState<Product>();
  const [auth] = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  let newUrl = BASE_URL?.replace("/api", "");

  const handleEdit = () => {
    navigate(`/admin-dashboard/updateproduct/${id}`, { replace: true });
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}/product/${id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      // alert("Product deleted successfully");
      toast.success("Product Deleted Successfully");
      navigate("/admin-dashboard/products"); // Redirect to product list after deletion
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete the product. Please try again.");
    }
  };

  const getProduct = async () => {
    try {
      const res = await getProductById(id);
      setProduct(res.data);
      if (res.status == 200 || res.status == 201) {
        await logUserActivity({
          userId: auth?.user?._id,
          activityType: "VIEW_PAGE",
          description: "View product page"
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      getProduct();
    }
  }, [auth]);

  if (!product) {
    return (
      <div className="col-md-12 mt-1">
        <div className="card card-olive shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Loading...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <section className="content-header d-flex justify-content-between align-items-center">
        <h1>Product Details</h1>
        <div>
          <button className="btn btn-success mr-2" onClick={handleEdit}>
            Edit Product
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete Product
          </button>
        </div>
      </section>
      <section className="content">
        <div className="row">
          {/* Product Image and Overview */}
          <div className="col-lg-7 col-md-12 mt-1">
            <div className="card card-olive card-outline shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="card-title">{product.name}</h3>
                <span
                  className={`badge ${
                    product.status === "Active"
                      ? "badge-success"
                      : "badge-secondary"
                  }`}
                >
                  {product.status}
                </span>
              </div>
              <div className="card-body">
                <div className="text-center mb-3">
                  <img
                    onError={(e: any) =>
                      (e.target.src = `${newUrl}/uploads/placeholder.png`)
                    }
                    className="img-fluid img-cover rounded"
                    src={`${newUrl}${product.imageUrl}`}
                    alt="product"
                    height={200}
                    width={200}
                  />
                </div>
                <div className="mb-3">
                  <strong>Description:</strong>
                  <p>{product.description}</p>
                </div>
                <div className="mb-3">
                  <strong>Tags:</strong>
                  <p>{product.tags?.join(", ")}</p>
                </div>
                <div className="mb-3">
                  <strong>Keywords:</strong>
                  <p>{product.keywords?.join(", ")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Pricing and Additional Information */}
          <div className="col-lg-5 col-md-12 mt-1">
            {/* Pricing Information */}
            <div className="card card-olive card-outline shadow-sm mb-3">
              <div className="card-header">
                <h3 className="card-title">Pricing Information</h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <i className="fas fa-barcode mr-2"></i>
                  <strong className="mb-1 text-muted">SKU:</strong>{" "}
                  <span>{product.sku}</span>
                </div>
                <div className="mb-3">
                  <i className="fas fa-dollar-sign mr-2"></i>
                  <strong className="mb-1 text-muted">Cost:</strong>{" "}
                  <span>
                    {product.currency} {product.cost}
                  </span>
                </div>
                <div className="mb-3">
                  <i className="fas fa-percentage mr-2"></i>
                  <strong className="mb-1 text-muted">Tax:</strong>{" "}
                  <span>
                    {product.currency} {product.tax}
                  </span>
                </div>
                <div className="mb-3">
                  <i className="fas fa-money-bill-alt mr-2"></i>
                  <strong className="mb-1 text-muted">Total Cost:</strong>{" "}
                  <span>
                    {product.currency} {product.totalCost}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="card card-olive card-outline shadow-sm">
              <div className="card-header">
                <h3 className="card-title">Additional Information</h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <i className="fas fa-tags mr-2"></i>
                  <strong className="mb-1 text-muted">Category:</strong>{" "}
                  <span>{product.category}</span>
                </div>
                <div className="mb-3">
                  <i className="fas fa-shopping-cart mr-2"></i>
                  <strong className="mb-1 text-muted">
                    Purchase Type:
                  </strong>{" "}
                  <span>{product.purchaseType}</span>
                </div>
                {product.purchaseType === "subscription" && (
                  <div className="mb-3">
                    <i className="fas fa-calendar-alt mr-2"></i>
                    <strong className="mb-1 text-muted">Duration:</strong>{" "}
                    <span>{product.duration} months</span>
                  </div>
                )}
                <div className="mb-3">
                  <i className="fas fa-clock mr-2"></i>
                  <strong className="mb-1 text-muted">Created On:</strong>{" "}
                  <span>
                    {moment(product.createdAt).format("MMMM DD, YYYY")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ViewProduct;
