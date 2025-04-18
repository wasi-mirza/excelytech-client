import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/utils/routes";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import { getPublicIp } from "../../../shared/utils/commonUtils";

function Products() {
  const [products, setProducts] = useState([]);
  const [auth] = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productsPerPage] = useState(32);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const navigate = useNavigate();
  let newUrl = BASE_URL.replace("/api", "");
  const [ip, setIp] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");

  useEffect(() => {
    getPublicIp()
      .then((ip) => setIp(ip))
      .catch((error) => console.error("Error fetching IP:", error));

    // Get Browser Information
    const getBrowserInfo = () => {
      setBrowserInfo(navigator.userAgent);
    };

    getBrowserInfo();
  }, []);

  const getProduct = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/product/getProducts?page=${currentPage}&limit=${productsPerPage}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
      setTotalProducts(res.data.total);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      getProduct();
    }
  }, [auth, currentPage, searchQuery]);

  const handleView = (data) => {
    navigate(`${ROUTES.ADMIN.VIEW_PRODUCT(data._id)}`);
  };

  const handleAddProduct = () => {
    navigate(ROUTES.ADMIN.NEW_PRODUCT);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalProducts / productsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStatusDotClass = (status) => {
    if (status === "Active") return "bg-success";
    if (status === "Inactive") return "bg-danger";
    if (status === "Retired") return "bg-warning";
    return "";
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between my-3">
            <div className="col-md-4">
              <h1 className="text-left font-weight-bold">Product Catalog</h1>
            </div>
            <div className="col-md-8 d-flex justify-content-end">
              <div className="form-group mb-0 flex-grow-1 mr-3">
                <div className="input-group input-group-md">
                  <input
                    type="search"
                    className="form-control form-control-md"
                    placeholder="Search by Product Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search Products"
                  />
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-secondary btn-md"
                      type="button"
                    >
                      <i className="fa fa-search" />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddProduct}
                className="btn btn-success ml-2"
              >
                <i className="fas fa-plus mr-1"></i> Add Product
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="content container-fluid">
        <div className="card p-2">
          <div className="row">
            {products.length > 0 ? (
              products.map((prod) => (
                <div className="col-md-3 mb-4" key={prod._id}>
                  <div
                    className="card shadow-sm h-100"
                    onClick={() => handleView(prod)}
                  >
                    <img
                      onError={(e) =>
                        (e.target.src = `${newUrl}/uploads/placeholder.png`)
                      }
                      src={`${newUrl}${prod.imageUrl}`}
                      className="card-img-top mt-3"
                      alt={prod.name}
                      style={{ height: "180px", objectFit: "contain" }}
                    />

                    <div className="card-body">
                      <div className="card-header text-truncate ">
                        <h6 className="mb-0">{prod.name}</h6>
                      </div>
                      <div className="d-flex justify-content-between mb-3 mt-3">
                        <div>
                          <p className="mb-0">{prod.sku}</p>
                        </div>
                        <div>
                          <p className="mb-0">
                            <span className="text-muted">{prod.currency}:</span>{" "}
                            {prod.cost}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between">
                        <div>
                          <p className="mb-1 text-muted">Category:</p>
                          <p className="mb-0">{prod.category}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-muted">Status:</p>
                          <span
                            className={`status-dot ${getStatusDotClass(
                              prod.status
                            )}`}
                            style={{
                              display: "inline-block",
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              marginRight: "5px",
                            }}
                          ></span>
                          <p className="mb-0 d-inline">{prod.status}</p>
                        </div>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <div>
                          <p className="mb-1 text-muted">Active Subs:</p>
                          <p className="mb-0">{prod.activeSubs}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-muted">Revenue Gen ($):</p>
                          <p className="mb-0">{prod.revenueGen}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <p className="text-center">No products found</p>
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="card-footer">
              <div className="d-flex justify-content-center mt-4">
                <button
                  className="btn btn-outline-primary mr-2"
                  disabled={currentPage === 1}
                  onClick={handlePreviousPage}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`btn mr-2 ${
                      currentPage === index + 1 ? "btn-success" : "btn-light"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  className="btn btn-outline-primary"
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;
