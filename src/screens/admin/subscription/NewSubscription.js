import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { CardFooter, Modal } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BASE_URL } from "../../utils/endPointNames.js";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  Input,
  Table,
  Label,
  FormGroup,
} from "reactstrap";

const NewSubscription = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showProductModal, setShowProductModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const calculateSubscriptionEndDate = (
    subscriptionStartDate,
    subscriptionDurationInMonths
  ) => {
    const startDate = new Date(subscriptionStartDate);
    startDate.setMonth(startDate.getMonth() + subscriptionDurationInMonths);
    return startDate;
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const endDate = new Date(
      calculateSubscriptionEndDate(
        subscriptionData.subscriptionStartDate,
        subscriptionData.subscriptionDurationInMonths
      )
    );
    console.log("endDate", endDate);

    setSubscriptionData({ ...subscriptionData, [name]: value });
  };

  const handleSelectecUserChange = (selectedUser) => {
    setSelectedUser(selectedUser);

    if (selectedUser) {
      const customer = selectedUser._id;
      const emailTo = selectedUser.email;
      const ownerEmail = selectedUser.businessDetails.ownerEmail;

      setSubscriptionData((prevData) => ({
        ...prevData,
        customer: customer,
        emailTo: emailTo,
        ownerEmail: ownerEmail,
      }));
    } else {
      // Reset the values if no user is selected
      setSubscriptionData((prevData) => ({
        ...prevData,
        customer: null,
        emailTo: null,
        ownerEmail: null,
      }));
    }
  };

  // Product data and pagination
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const [subscriptionData, setSubscriptionData] = useState({
    customer: "",
    emailTo: "",
    ownerEmail: "",
    sendWelcomeMsg: false,
    products: [],
    paymentHistory: [],
    isSubscriptionPaymentActive: true,
    subscriptionStatus: "processing",
    productTotal: 0,
    grandTotal: 0,
    discountType: "Fixed",
    discountOnGrandTotal: 0,
    grandTotalCurrency: "CAD",
    finalAmount: 0,
    subscriptionStartDate: new Date(),
    subscriptionEndDate: new Date(
      new Date().setMonth(new Date().getMonth() + 12)
    ),
    subscriptionDurationInMonths: 12,
  });

  const [productTotal, setProductTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [discountOnGrandTotal, setDiscountOnGrandTotal] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [errors, setErrors] = useState({});

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setSubscriptionData((prevData) => ({
      ...prevData,
      grandTotalCurrency: newCurrency,
    }));
  };
  const handleWelcomeSendMsg = (sendMsg) => {
    setSubscriptionData((prevData) => ({
      ...prevData,
      sendWelcomeMsg: sendMsg,
    }));
  };
  // Open and close modal
  const handleShowProductModal = () => {
    setShowProductModal(true);
    // Clear the emailTo error if user starts typing
    if (errors.products) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        products: "",
      }));
    }
  };
  const handleCloseProductModal = () => setShowProductModal(false);

  const handleCheckboxChange = (productId) => {
    setSelectedProducts((prevSelected) => {
      const newSelected = new Set(prevSelected);
      newSelected.has(productId)
        ? newSelected.delete(productId)
        : newSelected.add(productId);
      return newSelected;
    });
  };

  const getProduct = async () => {
    if (!auth?.token) return;
    try {
      const res = await axios.get(
        `${BASE_URL}/product/getProducts?page=${currentPage}&limit=${productsPerPage}&search=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setProducts(Array.isArray(res.data.products) ? res.data.products : []);
      setTotalProducts(res.data.total || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalProducts / productsPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };
  //fetching proposalsSentToSelectedCustomer
  const [proposalsSentToSelectedCustomer, setProposalsSentToSelectedCustomer] =
    useState([]);

  const fetchProposalsSentToSelectedClient = async (id) => {
    if (!auth?.token) return;
    try {
      const response = await axios.get(
        `${BASE_URL}/proposal/getAllProposalsById/${id}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setProposalsSentToSelectedCustomer(response.data);
      console.log("setProposalsSentToSelectedCustomer", response.data.data);
    } catch (error) {
      console.error(
        "Error fetching setProposalsSentToSelectedCustomer:",
        error
      );
    }
  };

  const fetchUsers = async () => {
    if (!auth?.token) return;
    try {
      const response = await axios.get(`${BASE_URL}/user/clients`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setUsers(response.data);
      // console.log("users", response.data.data);
    } catch (error) {
      console.error("Error fetching Users:", error);
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Validate email
    if (!subscriptionData.customer) {
      newErrors.customer = "Client is required.";
    }

    //products
    if (subscriptionData.products.length === 0) {
      newErrors.products = "Select at least one product.";
    }

    setErrors(newErrors);
    console.log("newErrors", newErrors);

    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const calculateTotal = (quantity, totalCost, discount, discountType) => {
    quantity = parseFloat(quantity) || 0;
    totalCost = parseFloat(totalCost) || 0;
    discount = parseFloat(discount) || 0;

    let total = quantity * totalCost;

    if (total > 0) {
      if (discountType === "Fixed") {
        total -= discount * quantity;
      } else if (discountType === "Percentage") {
        total -= total * (discount / 100);
      }
    }

    return Math.max(0, total);
  };
  const calculateGrandTotals = () => {
    let newTotalCostWithTax = 0;
    let discount = 0;

    subscriptionData.products.forEach((product) => {
      newTotalCostWithTax += product.newTotalCostWithTax || 0;
      discount += product.discount || 0;
    });

    const finalAmount = newTotalCostWithTax - discount;

    setProductTotal(newTotalCostWithTax);
    setGrandTotal(newTotalCostWithTax);
    setDiscountOnGrandTotal(discount);
    setFinalAmount(finalAmount);

    setSubscriptionData((prevData) => ({
      ...prevData,
      productTotal: newTotalCostWithTax,
      grandTotal: newTotalCostWithTax,
      discountOnGrandTotal: discount,
      finalAmount: finalAmount,
    }));
  };
  const handleProductChange = (index, event) => {
    const { name, value } = event.target;
    const updatedProducts = subscriptionData.products.map((product, i) =>
      i === index ? { ...product, [name]: value } : product
    );

    const quantity = parseFloat(updatedProducts[index].quantity) || 1;
    const discount = parseFloat(updatedProducts[index].discount) || 0;
    const newUpdatedCost =
      parseFloat(updatedProducts[index].newUpdatedCost) || 0;
    const discountType = updatedProducts[index].discountType;

    updatedProducts[index].newTotalCost = calculateTotal(
      quantity,
      newUpdatedCost,
      discount,
      discountType
    );

    //totalWithTax Starts
    const taxRate = parseFloat(updatedProducts[index].newTax) || 0;
    const totalTax = (updatedProducts[index].newTotalCost * taxRate) / 100;
    updatedProducts[index].newTotalCostWithTax =
      updatedProducts[index].newTotalCost + parseFloat(totalTax) || 0;
    console.log("updatedProducts", updatedProducts);
    setSubscriptionData((prevData) => ({
      ...prevData,
      products: updatedProducts,
    }));
  };

  const removeProduct = (index) => {
    setSubscriptionData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  // const [sendWelcomeMsg, setSendWelcomeMsg] = useState(false);

  const sendProposal = async (e) => {
    e.preventDefault();

    // Run validation
    if (!validateForm()) {
      console.log("Validation failed.");

      return;
    }
    console.log("ProposalData", subscriptionData);

    try {
      const response = await axios.post(
        `${BASE_URL}/subscription/new`,
        {
          subscriptionData,
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      if (response.status === 201) {
        toast.success("Subscription created !");
        navigate(-1);
      } else {
        throw new Error("Failed to send Subscription");
      }
    } catch (error) {
      console.error("Error sending Subscription:", error);
      toast.error("An error occurred while sending the Subscription.");
    }
    // }
  };

  useEffect(() => {
    fetchUsers();

    getProduct();
  }, [auth, currentPage, searchQuery]);

  useEffect(() => {
    calculateGrandTotals();
  }, [subscriptionData.products]);
  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between my-3">
            <div className="col-md-4">
              <h1 className="text-left font-weight-bold">New Subscription</h1>
            </div>
          </div>
        </div>
      </section>
      <div className="container-fluid">
        <Card className="card card-olive">
          <CardBody>
            <Form>
              <div className="d-flex flex-wrap justify-content-evenly align-items-start gap-4 mb-4">
                {/* Currency Selector Card */}
                <div className="col-12 col-md-7">
                  <Card className="shadow-sm">
                    <CardHeader className="text-center ">
                      <h3 className="card-title mb-0">Select Account</h3>
                    </CardHeader>
                    <CardBody>
                      <Typeahead
                        id="user-selector"
                        options={users}
                        labelKey="email" // Adjust based on your user object, e.g., 'email' or 'name'
                        onChange={(selected) => {
                          handleSelectecUserChange(selected[0] || null);

                          if (errors.customer && selected.length > 0) {
                            setErrors((prevErrors) => ({
                              ...prevErrors,
                              customer: "",
                            }));
                          }
                        }}
                        selected={selectedUser ? [selectedUser] : []}
                        placeholder="Choose a client"
                        className="w-100" // Ensures the Typeahead takes all available space
                      />
                      {errors.customer && (
                        <span className="text-danger">{errors.customer}</span>
                      )}
                    </CardBody>
                  </Card>
                </div>

                <div className="col-12 col-md-5">
                  <Card className="shadow-sm">
                    <CardHeader className="text-center  ">
                      <h3 className="card-title mb-0">Choose Currency</h3>
                    </CardHeader>
                    <CardBody>
                      <Input
                        type="select"
                        name="currency"
                        value={subscriptionData.grandTotalCurrency}
                        onChange={handleCurrencyChange}
                        className="form-control w-100"
                      >
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="USD">USD - United States Dollar</option>
                        {/* <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                       
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="CNY">CNY - Chinese Yuan</option>
                        <option value="SGD">SGD - Singapore Dollar</option>
                        <option value="AED">AED - UAE Dirham</option> */}
                      </Input>
                    </CardBody>
                  </Card>
                </div>
              </div>

              <Card className="shadow-sm mb-4">
                <CardHeader className="d-flex justify-content-between align-items-center ">
                  <h5 className="card-title mb-0">Select Products</h5>
                  <div className="ml-auto">
                    {" "}
                    {/* Add this wrapper */}
                    <Button color="warning" onClick={handleShowProductModal}>
                      Add Product(s)
                    </Button>
                  </div>
                </CardHeader>

                <CardBody>
                  {errors.products && (
                    <div className="text-danger mt-2">{errors.products}</div>
                  )}

                  {subscriptionData.products.length > 0 ? (
                    <>
                      {/* Desktop Table Layout */}
                      <div className="table-responsive d-none d-md-block">
                        <Table bordered hover>
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Cost</th>
                              <th>Quantity</th>
                              <th>Discount</th>
                              <th>Total Cost</th>
                              <th>Tax</th>
                              <th>Total Cost With Tax</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {subscriptionData.products.map((product, index) => (
                              <tr key={index}>
                                <td>
                                  <strong>{product.name}</strong>
                                  <br />
                                  <span>{product.category}</span>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    {subscriptionData.grandTotalCurrency}
                                    <Input
                                      type="number"
                                      name="newUpdatedCost"
                                      value={product.newUpdatedCost}
                                      onChange={(e) =>
                                        handleProductChange(index, e)
                                      }
                                      min="1"
                                      className="form-control ml-1"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <Input
                                    type="number"
                                    name="quantity"
                                    value={product.quantity}
                                    onChange={(e) =>
                                      handleProductChange(index, e)
                                    }
                                    min="1"
                                    className="form-control"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control me-2"
                                    name="discount"
                                    value={product.discount}
                                    onChange={(e) =>
                                      handleProductChange(index, e)
                                    }
                                    min="0"
                                    placeholder="Discount"
                                  />
                                  <select
                                    className="form-control"
                                    name="discountType"
                                    value={product.discountType}
                                    onChange={(e) =>
                                      handleProductChange(index, e)
                                    }
                                  >
                                    <option value="Fixed">Fixed</option>
                                    <option value="Percentage">
                                      Percentage
                                    </option>
                                  </select>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <p>{subscriptionData.grandTotalCurrency}</p>
                                    <p>{product.newTotalCost}</p>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    {subscriptionData.grandTotalCurrency}
                                    <Input
                                      type="number"
                                      name="newTax"
                                      value={product.newTax}
                                      onChange={(e) =>
                                        handleProductChange(index, e)
                                      }
                                      min="1"
                                      className="form-control ml-1"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <p>{subscriptionData.grandTotalCurrency}</p>
                                    <p>{product.newTotalCostWithTax}</p>
                                  </div>
                                </td>
                                <td>
                                  <Button
                                    color="danger"
                                    onClick={() => removeProduct(index)}
                                    className="btn btn-danger btn-sm"
                                  >
                                    <i className="fas fa-trash-alt"></i>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>

                      {/* Responsive Card Layout for Small Devices */}
                      <div className="d-md-none">
                        {subscriptionData.products.map((product, index) => (
                          <div key={index} className="card mb-3">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center">
                                <h5 className="card-title mb-0">
                                  {product.name}
                                </h5>
                                <Button
                                  color="danger"
                                  onClick={() => removeProduct(index)}
                                  className="btn btn-danger btn-sm"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </Button>
                              </div>

                              <p className="card-text">
                                <strong>Category:</strong> {product.category}
                              </p>
                              <div className="mb-2">
                                <strong>Quantity:</strong>
                                <Input
                                  type="number"
                                  name="quantity"
                                  value={product.quantity}
                                  onChange={(e) =>
                                    handleProductChange(index, e)
                                  }
                                  min="1"
                                  className="form-control"
                                />
                              </div>
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <div>
                                  <strong>Discount:</strong>
                                  <input
                                    type="number"
                                    className="form-control"
                                    name="discount"
                                    value={product.discount}
                                    onChange={(e) =>
                                      handleProductChange(index, e)
                                    }
                                    min="0"
                                    placeholder="Discount"
                                  />
                                </div>
                                <div>
                                  <strong>Type:</strong>
                                  <select
                                    className="form-control"
                                    name="discountType"
                                    value={product.discountType}
                                    onChange={(e) =>
                                      handleProductChange(index, e)
                                    }
                                  >
                                    <option value="Fixed">Fixed</option>
                                    <option value="Percentage">
                                      Percentage
                                    </option>
                                  </select>
                                </div>
                              </div>
                              <td className="inline-flex">
                                {subscriptionData.grandTotalCurrency}
                                <Input
                                  type="number"
                                  name="price"
                                  value={product.price}
                                  onChange={(e) =>
                                    handleProductChange(index, e)
                                  }
                                  min="1"
                                  className="form-control input-width"
                                />
                              </td>

                              <p>
                                <strong>Total:</strong> {product.total}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p>No products selected.</p>
                  )}
                </CardBody>
              </Card>
              <div className="d-flex flex-wrap justify-content-evenly align-items-start gap-4 mt-4 mb-4">
                <div className="col-12 col-md-3 ">
                  <p>
                    <Label className="mr-2" for="subscriptionStartDate">
                      Subscription Starts from Date:
                    </Label>
                    <input
                      type="date"
                      id="subscriptionStartDate"
                      className="form-control"
                      // value={selectedDate}
                      // onChange={(e) => setSelectedDate(e.target.value)}
                      style={{ width: "auto", marginLeft: 10 }}
                    />
                  </p>
                </div>

                <div className="col-12 col-md-3">
                  <FormGroup>
                    <Label for="subscriptionDurationInMonths">
                      Subscription Duration (Months)
                    </Label>
                    <Input
                      type="number"
                      name="subscriptionDurationInMonths"
                      id="subscriptionDurationInMonths"
                      value={subscriptionData.subscriptionDurationInMonths}
                      onChange={handleInputChange}
                      required
                      style={{ width: "auto", marginLeft: 10 }}
                    />
                  </FormGroup>
                </div>
              </div>
              {/* Display Totals */}
              <div>
                <h5 className="text-left m-3">Totals</h5>

                <div className="card">
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Product Total:</span>
                        <span>
                          {subscriptionData.grandTotalCurrency +
                            " " +
                            productTotal}
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Grand Total:</span>
                        <span>
                          {subscriptionData.grandTotalCurrency +
                            " " +
                            grandTotal}
                        </span>
                      </li>
                      {/* <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Discount on Grand Total:</span>
                        <span className="text-danger">
                          {subscriptionData.grandTotalCurrency}{" +" " +
                          {discountOnGrandTotal}
                        </span>
                      </li> */}
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <strong>Final Amount:</strong>
                        <strong>
                          {subscriptionData.grandTotalCurrency +
                            " " +
                            finalAmount}
                        </strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Form>
          </CardBody>
          <CardFooter className="d-flex justify-content-end align-items-center">
            <div className="form-check mr-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="sendWelcomeMsg"
                onChange={(e) => handleWelcomeSendMsg(e.target.checked)} // Update state or handle action
              />
              <label className="form-check-label" htmlFor="sendWelcomeMsg">
                Send Welcome Msg
              </label>
            </div>

            <Button color="warning" onClick={sendProposal} type="submit">
              Save Subscription
            </Button>
          </CardFooter>
        </Card>
      </div>
      {/* Product Modal COde */}
      <Modal show={showProductModal} onHide={handleCloseProductModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Search Bar */}
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <div className="input-group-append">
              <Button variant="outline-secondary" onClick={getProduct}>
                <i className="fa fa-search" />
              </Button>
            </div>
          </div>

          {/* Scrollable Product List */}
          <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
            <table className="table table-bordered table-hover">
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#f8f9fa",
                  zIndex: 1,
                }}
              >
                <tr>
                  <th>Select</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr
                      key={product._id}
                      onClick={() => handleCheckboxChange(product._id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product._id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange(product._id);
                            }}
                            style={{ marginRight: "10px" }}
                          />
                          <img
                            onError={(e) =>
                              (e.target.src =
                                BASE_URL.replace("/api", "") +
                                "/uploads/placeholder.png")
                            }
                            className="img-fluid img-cover rounded"
                            src={
                              BASE_URL.replace("/api", "") + product.imageUrl
                            }
                            alt="product image"
                            height={50}
                            width={50}
                          />
                        </div>
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.currency + " " + product.totalCost}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="d-flex justify-content-between mt-3">
            <Button
              variant="outline-secondary"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="align-self-center">Page {currentPage}</span>
            <Button
              variant="outline-secondary"
              onClick={handleNextPage}
              disabled={
                currentPage >= Math.ceil(totalProducts / productsPerPage)
              }
            >
              Next
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseProductModal}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const selectedProductArray = Array.from(selectedProducts).map(
                (productId) => {
                  const product = products.find((p) => p._id === productId);
                  return {
                    productId: product._id,
                    currency: product.currency,
                    name: product.name,
                    category: product.category,
                    oldCost: product.totalCost,
                    newUpdatedCost: product.totalCost,
                    discountType: "Fixed",
                    quantity: 1,
                    discount: 0,
                    newTotalCost: product.totalCost,
                    newTax: product.tax,
                    newTotalCostWithTax: product.totalCost,
                  };
                }
              );

              setSubscriptionData((prevData) => ({
                ...prevData,
                products: [...prevData.products, ...selectedProductArray],
              }));

              // console.log("Selected Products:", selectedProductArray);
              selectedProducts.clear();
              handleCloseProductModal();
            }}
            disabled={selectedProducts.size === 0}
          >
            Confirm Selection
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NewSubscription;
