import React, { useEffect, useState } from "react";
import {
  // FaEnvelope,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaList,
} from "react-icons/fa";

function ProposalInfo() {
  const [proposaldata] = useState(null);
  const [formdata, setFormData] = useState({ products: [] });

  useEffect(() => {
    if (proposaldata) {
      setFormData({
        content: proposaldata.content || "N/A",
        createdAt: proposaldata.createdAt
          ? new Date(proposaldata.createdAt).toLocaleDateString()
          : "N/A",
        discountOnGrandTotal: proposaldata.discountOnGrandTotal || "N/A",
        discountType: proposaldata.discountType || "N/A",
        emailTo: proposaldata.emailTo || "N/A",
        finalAmount: proposaldata.finalAmount || "N/A",
        grandTotal: proposaldata.grandTotal || "N/A",
        grandTotalCurrency: proposaldata.grandTotalCurrency || "",
        productTotal: proposaldata.productTotal || "N/A",
        title: proposaldata.title || "N/A",
        products: proposaldata.products || [],
      });
    }
  }, [proposaldata]);

  return (
    <div className="content-wrapper">
      <div className="container my-5">
        <div className="card shadow-lg border-0 bg-light">
          <div className="card-header bg-primary text-white text-center">
            <h2 className="mb-0">Proposal Information</h2>
          </div>
          <div className="card-body">
            <h3 className="card-title text-dark mb-3">
              <strong>Title:</strong> {formdata.title || "N/A"}
            </h3>
            <p className="card-text mb-4 display-6">
              <strong>Content:</strong> {formdata.content || "N/A"}
            </p>
            <div className="mb-4">
              <p>
                <FaCalendarAlt className="me-2 text-secondary display-5" />
                <strong className="">Date:</strong>{" "}
                {formdata.createdAt || "N/A"}
              </p>

              <p>
                <FaMoneyBillWave className="me-2 text-secondary display-5 " />
                <strong>Grand Total:</strong>{" "}
                {`${formdata.grandTotalCurrency} ${
                  formdata.grandTotal || "N/A"
                }`}
              </p>
              <p>
                <FaMoneyBillWave className="me-2 text-secondary display-5" />
                <strong>Final Amount:</strong>{" "}
                {`${formdata.grandTotalCurrency} ${
                  formdata.finalAmount || "N/A"
                }`}
              </p>
            </div>

            <h4 className="text-secondary">
              <FaList className="me-2" />
              Products
            </h4>
            <ul className="list-group list-group-flush mt-3">
              {formdata.products.length > 0 ? (
                formdata.products.map((product) => (
                  <li
                    key={product._id}
                    className="list-group-item p-4 border rounded mb-2 bg-white shadow-sm"
                  >
                    <div className="d-flex justify-content-between">
                      <span>
                        <strong>Product Name:</strong> {product._id || "N/A"}
                      </span>
                      <span>
                        <strong>Quantity:</strong> {product.quantity || "N/A"}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <span>
                        <strong>Discount:</strong> {product.discount || "N/A"}
                      </span>
                      <span>
                        <strong>Total:</strong>{" "}
                        {`${formdata.grandTotalCurrency} ${
                          product.total || "N/A"
                        }`}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <span>
                        <strong>Discount Type:</strong>{" "}
                        {product.discountType || "N/A"}
                      </span>
                      <span>
                        <strong>Currency:</strong> {product.currency || "N/A"}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="list-group-item text-center text-muted">
                  No products available.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProposalInfo;
