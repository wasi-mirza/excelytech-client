import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../shared/utils/endPointNames";

function UpdateOrder() {
  const [auth] = useAuth();
  const { id } = useParams();
  const [orderUpdate, setOrderUpdate] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.token && id) {
      axios
        .get(`${BASE_URL}/order/${id}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then((res) => setOrderUpdate(res.data))
        .catch((error) => console.error("Error fetching order:", error));
    }
  }, [auth, id]);

  const handleChange = (index: any, field: any, value: any) => {
    const updatedProducts = [...orderUpdate.products];
    updatedProducts[index][field] = value;
    setOrderUpdate({ ...orderUpdate, products: updatedProducts });
  };

  const handleSave = () => {
    if (auth?.token && id) {
      axios
        .patch(`${BASE_URL}/order/${id}`, orderUpdate, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then(() => {
          toast.success("Order updated successfully");
          navigate(-1); // Redirect to the orders page or desired page after update
        })
        .catch((error) => {
          console.error("Error updating order:", error);
          toast.error("Failed to update order. Please try again.");
        });
    }
  };

  return (
    <div className="content-wrapper">
      <h1 className="mb-4">Update Order Details</h1>
      {orderUpdate ? (
        <div>
          {orderUpdate.products.map((product: any, index: any) => (
            <div className="card card-olive mb-3" key={index}>
              <div className="card-header">
                <h3 className="card-title">Product {index + 1}</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label>Product Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={product.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>SKU:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={product.sku}
                    onChange={(e) => handleChange(index, "sku", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Sale Price:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={product.salePrice}
                    onChange={(e) =>
                      handleChange(index, "salePrice", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={product.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Total:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={product.total}
                    onChange={(e) =>
                      handleChange(index, "total", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Purchase Type:</label>
                  <select
                    className="form-control"
                    value={product.purchaseType}
                    onChange={(e) =>
                      handleChange(index, "purchaseType", e.target.value)
                    }
                  >
                    <option value="one-time">One-Time</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          <div className="form-group">
            <button onClick={handleSave} className="btn btn-success">
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <p>Loading Update details...</p>
      )}
    </div>
  );
}

export default UpdateOrder;
