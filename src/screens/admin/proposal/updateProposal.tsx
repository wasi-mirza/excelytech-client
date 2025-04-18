import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { CardFooter, Modal } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import toast from "react-hot-toast";
import { BASE_URL } from "../../utils/endPointNames";
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  FormFeedback,
  Input,
  Label,
  Table,
} from "reactstrap";
import { savePdfToServer } from "./saveProposalPdfToServer.js";

const UpdateProposal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [auth] = useAuth();
  const [proposal, setProposal] = useState(null);
  const [proposalData, setProposalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showProductModal, setShowProductModal] = useState(false);
  // Fetch proposal data
  const fetchProposal = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/proposal/${id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      setProposal(response.data);
      setProposalData(response.data);
      console.log("status", updateStatus);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching proposal:", error);
      toast.error(error);
      setLoading(false);
    }
  };

  // Fetch data on component mount and when search or page changes
  useEffect(() => {
    if (auth?.token) {
      fetchProposal();
    }
  }, [auth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!proposal) {
    return <div>Proposal not found</div>;
  }

  // //   const [recipientId, setReceipientId] = useState(null);
  // //   const [users, setUsers] = useState([]);
  // //   const [selectedUser, setSelectedUser] = useState(null);

  // //   const createUser = async () => {
  // //     const email = proposalData.emailTo;
  // //     const userName = proposalData.emailTo.split("@")[0];

  // //     const userData = {
  // //       // Basic user information
  // //       name: userName,
  // //       phone: "N/A",
  // //       username: userName,
  // //       email: email,
  // //       password: "123456", // Should be hashed in production

  // //       // Business Details
  // //       businessDetails: {
  // //         clientName: "N/A",
  // //         companyType: "N/A",
  // //         taxId: "N/A",
  // //         employeeSize: "N/A",
  // //         ownerPhone: "N/A",
  // //         ownerEmail: "N/A",
  // //       },

  // //       // Contact and preferences
  // //       timeZone: "N/A",
  // //       preferredContactMethod: "email", // "email", "phone", or "both"

  // //       // Account status
  // //       allowLogin: true,
  // //       activeAccount: true,
  // //       bannedAccount: false,

  // //       // Address details
  // //       address: {
  // //         street1: "N/A",
  // //         street2: "N/A",
  // //         zipCode: "N/A",
  // //         city: "N/A",
  // //         state: "N/A",
  // //         country: "N/A",
  // //       },
  // //     };

  //     try {
  //       const res = await axios.post(
  //         "${BASE_URL}/user/register",
  //         userData
  //       );
  //       // console.log(res);
  //       if (res.data) {
  //         setReceipientId(res.data._id);
  //         return true;
  //       }
  //       toast.success(" created Successfully");
  //       navigate("/admin-dashboard/allusers");
  //     } catch (error) {
  //       toast.error(error.response.data.message);
  //       console.error(error);
  //       return false;
  //     }
  //   };
  //   const handleEmailTo = (input) => {
  //     setProposalData((prevData) => ({
  //       ...prevData,
  //       recipient: null,
  //       emailTo: input,
  //     }));
  //   };
  //   const handleSelectecUserChange = (selectedUser) => {
  //     setSelectedUser(selectedUser);

  //     if (selectedUser) {
  //       const recipient = selectedUser._id;
  //       const emailTo = selectedUser.email;

  //       setProposalData((prevData) => ({
  //         ...prevData,
  //         recipient: recipient,
  //         emailTo: emailTo,
  //       }));
  //     } else {
  //       // Reset the values if no user is selected
  //       setProposalData((prevData) => ({
  //         ...prevData,
  //         recipient: null,
  //         emailTo: null,
  //       }));
  //     }
  //   };

  const [proposalTemplates, setProposalTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  // Product data and pagination
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [moreAttachmentsToUpload, setMoreAttachmentsToUpload] = useState([]);
  const [productTotal, setProductTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [discountOnGrandTotal, setDiscountOnGrandTotal] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const editor = useRef(null);
  const editorConfig = {
    minHeight: 400,
    readonly: false,
    toolbarSticky: false,
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "ul",
      "ol",
      "font",
      "fontsize",
      "paragraph",
      "image",
      "link",
      "align",
      "undo",
      "redo",
    ],
    showXPathInStatusbar: false,
    spellcheck: false,
  };
  // multiple attachments
  const handleFileChange = (event) => {
    setMoreAttachmentsToUpload(Array.from(event.target.files));
  };
  const handleUploadFiles = async () => {
    const formData = new FormData();
    moreAttachmentsToUpload.forEach((file) => {
      formData.append("docs", file);
    });

    try {
      const response = await axios.post(`${BASE_URL}/upload/docs`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      response.data.files.map((file) => {
        const newAttachment = {
          filename: file.filename,
          path: `${BASE_URL}${file.url}`,
        };
        proposalData.attachments.push(newAttachment);
      });

      return true;
    } catch (error) {
      console.error("Error uploading files:", error);
      return false;
    }
  };

  // const handleDocumentNameChange = (index, newName) => {
  //   const updatedAttachments = [...moreAttachmentsToUpload];
  //   updatedAttachments[index].filename = newName; // Update the filename correctly
  //   setMoreAttachmentsToUpload(updatedAttachments); // Update the state

  // };
  // Function to handle currency change
  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setProposalData((prevData) => ({
      ...prevData,
      grandTotalCurrency: newCurrency,
    }));
  };
  // Open and close modal
  const handleShowProductModal = () => setShowProductModal(true);
  const handleCloseProductModal = () => setShowProductModal(false);
  const calculateGrandTotals = () => {
    let total = 0;
    let discount = 0;

    proposalData.products.forEach((product) => {
      total += product.total || 0;
      discount += product.discount || 0;
    });

    const finalAmount = total - discount;

    setProductTotal(total);
    setGrandTotal(total);
    setDiscountOnGrandTotal(discount);
    setFinalAmount(finalAmount);

    setProposalData((prevData) => ({
      ...prevData,
      productTotal: total,
      grandTotal: total,
      discountOnGrandTotal: discount,
      finalAmount: finalAmount,
    }));
  };

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

  const fetchProposalTemplates = async () => {
    if (!auth?.token) return;
    try {
      const res = await axios.get(`${BASE_URL}/proposalTemplate/templates`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setProposalTemplates(res.data.templates);
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
  };

  const handleTemplateSelect = (templateContent) => {
    setProposalData((prevData) => ({
      ...prevData,
      content: templateContent,
    }));
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProposalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (newContent) => {
    setProposalData((prevData) => ({
      ...prevData,
      content: newContent,
    }));
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

  const handleProductChange = (index, event) => {
    const { name, value } = event.target;
    const updatedProducts = proposalData.products.map((product, i) =>
      i === index ? { ...product, [name]: value } : product
    );

    const quantity = parseFloat(updatedProducts[index].quantity) || 1;
    const totalCost = parseFloat(updatedProducts[index].price) || 0;
    const discount = parseFloat(updatedProducts[index].discount) || 0;
    const discountType = updatedProducts[index].discountType;

    updatedProducts[index].total = calculateTotal(
      quantity,
      totalCost,
      discount,
      discountType
    );
    console.log("updatedProducts", updatedProducts);
    setProposalData((prevData) => ({ ...prevData, products: updatedProducts }));
  };

  const removeProduct = (index) => {
    setProposalData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };
  const handleSavePdf = async () => {
    try {
      const response = await savePdfToServer(proposalData, auth?.token);
      if (response) {
        const newAttachment = {
          filename: response.filename,
          path: `${BASE_URL}${response.attachmentUrl}`,
        };

        // Adding directly to `proposalData` to avoid waiting for state update in `sendProposal`
        proposalData.attachments.push(newAttachment);

        console.log("Attachment added:", newAttachment);
        return true;
      } else {
        console.error("Failed to save PDF on the server");
        return false;
      }
    } catch (error) {
      console.error("Error saving PDF:", error);
      return false;
    }
  };

  const sendProposal = async (e) => {
    e.preventDefault();

    // First, save the PDF (if needed) and check if it's successful
    const status = await handleSavePdf();
    if (!status) {
      console.log("Failed to save PDF.");
      return;
    }

    // Then upload the files and check if the upload was successful
    const uploadFilesDone = await handleUploadFiles();
    if (!uploadFilesDone) {
      console.log("File upload failed.");
      return;
    }

    if (status && uploadFilesDone) {
      try {
        if (proposalData.recipient === null) {
          // create user
          const res = await createUser();
          if (!res) {
            return;
          }
        }
        const res = await axios.post(
          `${BASE_URL}/proposal/new`,
          {
            proposalData,
          },
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );
        console.log(res);
        navigate(-1);
      } catch (error) {
        console.log("sendProposal", error);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProposalTemplates();
    getProduct();
  }, [auth, currentPage, searchQuery]);

  useEffect(() => {
    calculateGrandTotals();
  }, [proposalData.products]);
  return (
    <div className="content-wrapper">
      <div className="container-fluid">
        <Card className="card card-olive card-outline">
          <CardBody>
            <h5 className="card-header bg-primary text-white">New Proposal</h5>
            <Form>
              <FormGroup>
                <Label>Email To</Label>
                <Typeahead
                  id="user-selector"
                  options={users}
                  labelKey="email" // Adjust based on your user object, e.g., 'email' or 'name'
                  onChange={(selected) =>
                    handleSelectecUserChange(selected[0] || null)
                  }
                  onInputChange={(input) => handleEmailTo(input)}
                  selected={selectedUser ? [selectedUser] : []}
                  placeholder="Choose a user"
                />
              </FormGroup>
              <FormGroup>
                <Label>Title</Label>
                <Input
                  type="text"
                  name="title"
                  value={proposalData.title}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              {/* Proposal Template Selection */}
              <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
                <Label>Content</Label>
                <Button onClick={() => setShowModal(true)}>
                  Select Proposal Template
                </Button>
              </div>
              <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton className="bg-dark">
                  <Modal.Title className="text-white">
                    Select a Proposal Template
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <ul className="list-unstyled">
                    {proposalTemplates.map((template) => (
                      <li key={template._id} className="mb-2">
                        <button
                          className="btn btn-secondary btn-block text-left"
                          onClick={() =>
                            handleTemplateSelect(template.description)
                          }
                        >
                          <i className="fas fa-file-alt mr-2"></i>
                          {template.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </Modal.Body>
                <Modal.Footer>
                  <button
                    className="btn btn-dark"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </Modal.Footer>
              </Modal>

              <FormGroup>
                <JoditEditor
                  ref={editor}
                  config={editorConfig}
                  value={proposalData.content}
                  onBlur={(newContent) => handleEditorChange(newContent)}
                />
              </FormGroup>
              <div className="d-flex justify-content-start align-items-center mt-4 mb-4">
                <h5>Choose Currency</h5>
                <div className="col-3">
                  <Input
                    type="select"
                    name="currency"
                    value={proposalData.grandTotalCurrency}
                    onChange={handleCurrencyChange}
                    className="form-control"
                  >
                    <option value="$">$</option>
                    <option value="€">€</option>
                    <option value="Rs">₹</option>
                    <option value="£">£</option>
                  </Input>
                </div>
              </div>
              <div className="container-fluid">
                {/* File Upload Section */}

                <div className="input-group">
                  <div className="custom-file">
                    <input
                      type="file"
                      className="custom-file-input"
                      id="fileUpload"
                      name="fileUpload"
                      accept="application/*"
                      multiple
                      onChange={handleFileChange}
                    />
                    <label className="custom-file-label" htmlFor="fileUpload">
                      Choose files
                    </label>
                  </div>
                </div>
                <small className="form-text text-muted">
                  Supported formats: PDF, DOC, DOCX, etc. Max size: 5MB.
                </small>
                {/* Document Table Section */}
                <div className="card">
                  <div className="card-header bg-primary">
                    <h3 className="card-title">Uploaded Documents</h3>
                  </div>
                  <div className="card-body table-responsive">
                    <table className="table table-bordered table-striped">
                      <tbody>
                        {moreAttachmentsToUpload.map((attachment, index) => (
                          <tr key={index}>
                            <td>{attachment.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
                <h5>Selected Products</h5>
                <Button variant="primary" onClick={handleShowProductModal}>
                  Add Product(s)
                </Button>
              </div>

              {/* Product ModalCOde */}
              <Modal
                show={showProductModal}
                onHide={handleCloseProductModal}
                size="lg"
              >
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
                                        BASE_URL + "/uploads/placeholder.png")
                                    }
                                    className="img-fluid img-cover rounded"
                                    src={BASE_URL + product.imageUrl}
                                    alt="product image"
                                    height={50}
                                    width={50}
                                  />
                                </div>
                              </td>
                              <td>{product.name}</td>
                              <td>{product.category}</td>
                              <td>
                                {product.currency + " " + product.totalCost}
                              </td>
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
                    <span className="align-self-center">
                      Page {currentPage}
                    </span>
                    <Button
                      variant="outline-secondary"
                      onClick={handleNextPage}
                      disabled={
                        currentPage >=
                        Math.ceil(totalProducts / productsPerPage)
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
                      const selectedProductArray = Array.from(
                        selectedProducts
                      ).map((productId) => {
                        const product = products.find(
                          (p) => p._id === productId
                        );
                        return {
                          productId: product._id,
                          currency: product.currency,
                          name: product.name,
                          category: product.category,
                          price: product.totalCost,
                          total: product.totalCost,
                          discountType: product.discount,
                          quantity: 1,
                          discount: 0,
                        };
                      });

                      setProposalData((prevData) => ({
                        ...prevData,
                        products: [
                          ...prevData.products,
                          ...selectedProductArray,
                        ],
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

              {/* ENd of Product Modal Code */}
              {proposalData.products.length > 0 ? (
                <div className="table-responsive">
                  <Table bordered hover className="d-none d-md-table">
                    {" "}
                    {/* Hide on small devices */}
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Discount</th>
                        <th>Cost With Tax</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposalData.products.map((product, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <strong>{product.name}</strong>
                              <br />
                              <span>{product.category}</span>
                            </div>
                          </td>
                          <td>
                            <Input
                              type="number"
                              name="quantity"
                              value={product.quantity}
                              onChange={(e) => handleProductChange(index, e)}
                              min="1"
                              className="form-control"
                            />
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="number"
                                className="form-control me-2"
                                name="discount"
                                value={product.discount}
                                onChange={(e) => handleProductChange(index, e)}
                                min="0"
                                placeholder="Discount"
                              />
                              <select
                                className="form-control"
                                name="discountType"
                                value={product.discountType}
                                onChange={(e) => handleProductChange(index, e)}
                              >
                                <option value="Fixed">Fixed</option>
                                <option value="Percentage">Percentage</option>
                              </select>
                            </div>
                          </td>
                          <td>
                            {" "}
                            <div className="d-flex align-items-center gap-2 ">
                              {proposalData.grandTotalCurrency}
                              <Input
                                type="number"
                                name="price"
                                value={product.price}
                                onChange={(e) => handleProductChange(index, e)}
                                min="1"
                                className="form-control ml-1"
                              />
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-2 ">
                              <p className="mr-1">
                                {proposalData.grandTotalCurrency}
                              </p>
                              <p> {product.total}</p>
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

                  {/* Responsive Card Layout for Small Devices */}
                  <div className="d-md-none">
                    {proposalData.products.map((product, index) => (
                      <div key={index} className="card mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">{product.name}</h5>
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
                              onChange={(e) => handleProductChange(index, e)}
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
                                onChange={(e) => handleProductChange(index, e)}
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
                                onChange={(e) => handleProductChange(index, e)}
                              >
                                <option value="Fixed">Fixed</option>
                                <option value="Percentage">Percentage</option>
                              </select>
                            </div>
                          </div>
                          <td className="inline-flex">
                            {proposalData.grandTotalCurrency}
                            <Input
                              type="number"
                              name="price"
                              value={product.price}
                              onChange={(e) => handleProductChange(index, e)}
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
                </div>
              ) : (
                <p>No products selected.</p>
              )}

              {/* Display Totals */}
              <div>
                <h5 className="text-left m-3">Totals</h5>

                <div className="card">
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Product Total:</span>
                        <span>
                          {proposalData.grandTotalCurrency}
                          {productTotal}
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Grand Total:</span>
                        <span>
                          {proposalData.grandTotalCurrency}
                          {grandTotal}
                        </span>
                      </li>
                      {/* <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Discount on Grand Total:</span>
                        <span className="text-danger">
                          {proposalData.grandTotalCurrency}
                          {discountOnGrandTotal}
                        </span>
                      </li> */}
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <strong>Final Amount:</strong>
                        <strong>
                          {proposalData.grandTotalCurrency}
                          {finalAmount}
                        </strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Form>
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            <Button color="primary" onClick={sendProposal} type="submit">
              Send Proposal
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default UpdateProposal;
