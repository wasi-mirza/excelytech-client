import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { CardFooter, Modal } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  FormFeedback,
  Input,
  Label,
  Table,
  CardTitle,
} from "reactstrap";
import { savePdfToServer } from "./saveProposalPdfToServer";
import { getPublicIp } from "../../../shared/utils/commonUtils";

interface User {
  _id: string;
  email: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  currency: string;
  totalCost: number;
  tax: number;
  imageUrl: string;
}

interface ProposalProduct {
  productId: string;
  currency: string;
  name: string;
  category: string;
  oldCost: number;
  newUpdatedCost: number;
  discountType: "Fixed" | "Percentage";
  quantity: number;
  discount: number;
  newTotalCost: number;
  newTax: number;
  newTotalCostWithTax: number;
}

interface ProposalTemplate {
  _id: string;
  title: string;
  description: string;
}

interface ProposalData {
  recipient: string | null;
  emailTo: string | null;
  title: string;
  content: string;
  products: ProposalProduct[];
  grandTotalCurrency: string;
  productTotal: number;
  grandTotal: number;
  discountOnGrandTotal: number;
  finalAmount: number;
  attachments: Array<{filename: string; path: string}>;
  status: string;
}

interface FormErrors {
  emailTo?: string;
  title?: string;
  content?: string;
  products?: string;
}

const NewProposal = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showProductModal, setShowProductModal] = useState(false);
  const [recipientId, setReceipientId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const createUser = async () => {
    const email = proposalData.emailTo;
    const userName = email?.split("@")[0] || "";

    const userData = {
      // Basic user information
      name: userName,
      phone: "N/A",
      username: userName,
      email: email,
      password: "123456", // Should be hashed in production

      // Business Details
      businessDetails: {
        clientName: "N/A",
        companyType: "N/A",
        taxId: "N/A",
        employeeSize: "N/A",
        ownerPhone: "N/A",
        ownerEmail: "N/A",
      },

      // Contact and preferences
      timeZone: "N/A",
      preferredContactMethod: "email", // "email", "phone", or "both"

      // Account status
      allowLogin: true,
      activeAccount: true,
      bannedAccount: false,

      // Address details
      address: {
        street1: "N/A",
        street2: "N/A",
        zipCode: "N/A",
        city: "N/A",
        state: "N/A",
        country: "N/A",
      },
    };

    try {
      const res = await axios.post(`${BASE_URL}/user/register`, userData);
      if (res.data) {
        setReceipientId(res.data._id);
        return true;
      }
      toast.success(" created Successfully");
      navigate("/admin-dashboard/allusers");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error creating user");
      console.error(error);
      return false;
    }
  };

  const handleEmailTo = (input: string) => {
    setProposalData((prevData) => ({
      ...prevData,
      recipient: null,
      emailTo: input,
    }));
  };

  const handleSelectecUserChange = (selectedUser: User | null) => {
    setSelectedUser(selectedUser);

    if (selectedUser) {
      const recipient = selectedUser._id;
      const emailTo = selectedUser.email;

      setProposalData((prevData) => ({
        ...prevData,
        recipient: recipient,
        emailTo: emailTo,
      }));
    } else {
      // Reset the values if no user is selected
      setProposalData((prevData) => ({
        ...prevData,
        recipient: null,
        emailTo: null,
      }));
    }
  };

  const [proposalTemplates, setProposalTemplates] = useState<ProposalTemplate[]>([]);
  const [showModal, setShowModal] = useState(false);
  // Product data and pagination
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const [moreAttachmentsToUpload, setMoreAttachmentsToUpload] = useState<File[]>([]);
  const [proposalData, setProposalData] = useState<ProposalData>({
    recipient: "",
    emailTo: "",
    title: "",
    content: "",
    products: [],
    grandTotalCurrency: "CAD",
    productTotal: 0,
    grandTotal: 0,
    discountOnGrandTotal: 0,
    finalAmount: 0,
    attachments: [],
    status: "",
  });

  const [productTotal, setProductTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [discountOnGrandTotal, setDiscountOnGrandTotal] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});

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
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMoreAttachmentsToUpload(Array.from(event.target.files));
    }
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
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      response.data.files.forEach((file: {filename: string; url: string}) => {
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

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setProposalData((prevData) => ({
      ...prevData,
      grandTotalCurrency: newCurrency,
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

  const handleCheckboxChange = (productId: string) => {
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

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

  const handleTemplateSelect = (templateContent: string) => {
    setProposalData((prevData) => ({
      ...prevData,
      content: templateContent,
    }));
    // Clear the error for the 'content' field, if any
    if (errors.content) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        content: "",
      }));
    }
    setShowModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProposalData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for the field as the user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleEditorChange = (newContent: string) => {
    setProposalData((prevData) => ({
      ...prevData,
      content: newContent,
    }));
  };

  // Validation function
  const validateForm = () => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email
    if (!proposalData.emailTo) {
      newErrors.emailTo = "Email is required.";
    } else if (!emailRegex.test(proposalData.emailTo)) {
      newErrors.emailTo = "Invalid email format.";
    }

    // Validate title
    if (!proposalData.title.trim()) {
      newErrors.title = "Title is required.";
    }

    // Validate content
    if (!proposalData.content.trim()) {
      newErrors.content = "Content is required.";
    }

    //products
    if (proposalData.products.length === 0) {
      newErrors.products = "Select at least one product.";
    }

    setErrors(newErrors);
    console.log("newErrors", newErrors);

    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const calculateTotal = (quantity: number, totalCost: number, discount: number, discountType: string) => {
    quantity = parseFloat(quantity.toString()) || 0;
    totalCost = parseFloat(totalCost.toString()) || 0;
    discount = parseFloat(discount.toString()) || 0;

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

    proposalData.products.forEach((product) => {
      newTotalCostWithTax += product.newTotalCostWithTax || 0;
      discount += product.discount || 0;
    });

    const finalAmount = newTotalCostWithTax - discount;

    setProductTotal(newTotalCostWithTax);
    setGrandTotal(newTotalCostWithTax);
    setDiscountOnGrandTotal(discount);
    setFinalAmount(finalAmount);

    setProposalData((prevData) => ({
      ...prevData,
      productTotal: newTotalCostWithTax,
      grandTotal: newTotalCostWithTax,
      discountOnGrandTotal: discount,
      finalAmount: finalAmount,
    }));
  };

  const handleProductChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const updatedProducts = proposalData.products.map((product, i) =>
      i === index ? { ...product, [name]: value } : product
    );

    const quantity = parseFloat(updatedProducts[index].quantity.toString()) || 1;
    const discount = parseFloat(updatedProducts[index].discount.toString()) || 0;
    const newUpdatedCost = parseFloat(updatedProducts[index].newUpdatedCost.toString()) || 0;
    const discountType = updatedProducts[index].discountType;

    updatedProducts[index].newTotalCost = calculateTotal(
      quantity,
      newUpdatedCost,
      discount,
      discountType
    );

    //totalWithTax Starts
    const taxRate = parseFloat(updatedProducts[index].newTax.toString()) || 0;
    const totalTax = (updatedProducts[index].newTotalCost * taxRate) / 100;
    updatedProducts[index].newTotalCostWithTax =
      updatedProducts[index].newTotalCost + totalTax;
    console.log("updatedProducts", updatedProducts);
    setProposalData((prevData) => ({ ...prevData, products: updatedProducts }));
  };

  const removeProduct = (index: number) => {
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

  const sendProposal = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run validation
    if (!validateForm()) {
      console.log("Validation failed.");
      return;
    }

    console.log("ProposalData", proposalData);
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
        const response = await axios.post(
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
        if (response.status === 201) {
          const res = axios.post(
            `${BASE_URL}/useractivity/`,
            {
              userId: auth?.user?._id,
              activityType: "CREATE",
              description: "Create Proposal",
              ipAddress: ip,
              userAgent: browserInfo,
            },
            {
              headers: {
                Authorization: `Bearer ${auth?.token}`,
              },
            }
          );
          console.log("create proposal", res);
          toast.success("Proposal sent successfully!");
          navigate("/admin-dashboard/proposals");
        } else {
          throw new Error("Failed to send proposal");
        }
      } catch (error) {
        console.error("Error sending proposal:", error);
        toast.error("An error occurred while sending the proposal.");
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
      <section className="content-header">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between my-3">
            <div className="col-md-4">
              <h1 className="text-left font-weight-bold">New Proposal</h1>
            </div>
          </div>
        </div>
      </section>
      <div className="container-fluid">
        <Card className="card card-olive card-outline">
          {/* <CardHeader className="  text-center">
            <h5 className="mb-0">New Proposal</h5>
          </CardHeader> */}
          <CardBody>
            {/* <h5 className="card-header  "></h5> */}
            <Form>
              <FormGroup>
                <Label>Email To</Label>
                <Typeahead
                  id="user-selector"
                  options={users}
                  labelKey="email" // Adjust based on your user object, e.g., 'email' or 'name'
                  onChange={(selected) => {
                    handleSelectecUserChange(selected[0] as any);

                    // Clear the emailTo error if a user is selected
                    if (errors.emailTo && selected.length > 0) {
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        emailTo: "",
                      }));
                    }
                  }}
                  onInputChange={(input) => {
                    handleEmailTo(input);
                    // Clear the emailTo error if user starts typing
                    if (errors.emailTo) {
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        emailTo: "",
                      }));
                    }
                  }}
                  selected={selectedUser ? [selectedUser] : []}
                  placeholder="Choose a user"
                />
                {errors.emailTo && (
                  <span className="text-danger">{errors.emailTo}</span>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Title</Label>
                <Input
                  type="text"
                  name="title"
                  value={proposalData.title}
                  onChange={handleInputChange}
                  required
                  className={`form-control ${errors.title ? "is-invalid" : ""}`}
                />
                {errors.title && (
                  <div className="invalid-feedback">{errors.title}</div>
                )}
              </FormGroup>
              {/* Proposal Template Selection */}
              {/* <div className="col-12 col-md-8"> */}
              <Card className="shadow-sm w-100 card-olive card-outline">
                <CardHeader className="  text-center">
                  <h5 className="mb-0">Proposal Content Editor</h5>
                </CardHeader>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Label>Content</Label>
                    <Button onClick={() => setShowModal(true)}>
                      Select Proposal Template
                    </Button>
                  </div>

                  <FormGroup>
                    <JoditEditor
                      ref={editor}
                      config={editorConfig}
                      value={proposalData.content}
                      onBlur={(newContent) => {
                        handleEditorChange(newContent);
                        // Optionally clear errors dynamically as the user types
                        if (errors.content && newContent.trim()) {
                          setErrors((prevErrors) => ({
                            ...prevErrors,
                            content: "",
                          }));
                        }
                      }}
                    />
                    {errors.content && (
                      <div className="text-danger mt-2">{errors.content}</div>
                    )}
                  </FormGroup>
                </CardBody>
              </Card>
              {/* </div> */}
              {/* {/* <div className="d-flex flex-wrap justify-content-evenly align-items-start gap-4 mt-4 mb-4"> */}
              {/* Currency Selector Card */}
              <div className="col-12 col-md-5">
                <Card className="shadow-sm card-olive card-outline">
                  <CardHeader className="text-center  ">
                    <h3 className="card-title mb-0">Choose Currency</h3>
                  </CardHeader>
                  <CardBody className="d-flex justify-content-center">
                    <Input
                      type="select"
                      name="currency"
                      value={proposalData.grandTotalCurrency}
                      onChange={handleCurrencyChange as any}
                      className="form-control w-50"
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
              {/* Proposal Options Card
                <div className="col-12 col-md-6">
                  <Card className="shadow-sm">
                    <CardHeader className="text-center  ">
                      <h5 className="card-title mb-0">Add Payment Link</h5>
                    </CardHeader>
                    <CardBody>
                      <div>
                        

                        {/* Display the generated link 
                        {addPaymentLinkChecked && paymentLink && (
                          <div className="mt-3">
                            <p>
                              Payment Link:{" "}
                              <a
                                href={paymentLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {paymentLink}
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div> */}
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
                  <div className="card-header ">
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
              {errors.products && (
                <div className="text-danger mt-2">{errors.products}</div>
              )}
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
                                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = BASE_URL ? 
                                        BASE_URL.replace("/api", "") + "/uploads/placeholder.png" :
                                        "/uploads/placeholder.png";
                                    }}
                                    className="img-fluid img-cover rounded"
                                    src={
                                      BASE_URL?.replace("/api", "") +
                                      product.imageUrl
                                    }
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
                            <td colSpan={4} className="text-center">
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
                          productId: product?._id,
                          currency: product?.currency,
                          name: product?.name,
                          category: product?.category,
                          oldCost: product?.totalCost,
                          newUpdatedCost: product?.totalCost,
                          discountType: "Fixed",
                          quantity: 1,
                          discount: 0,
                          newTotalCost: product?.totalCost,
                          newTax: product?.tax,
                          newTotalCostWithTax: product?.totalCost,
                        };
                      });

                      setProposalData((prevData: any) => ({
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
                        <th>Cost</th>
                        <th>Quantity</th>
                        <th>Discount</th>
                        <th>TotalCost</th>
                        <th>Tax</th>
                        <th>TotalCost With Tax</th>
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
                            {" "}
                            <div className="d-flex align-items-center gap-2 ">
                              {proposalData.grandTotalCurrency}
                              <Input
                                type="number"
                                name="newUpdatedCost"
                                value={product.newUpdatedCost}
                                onChange={(e) => handleProductChange(index, e)}
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
                              onChange={(e) => handleProductChange(index, e)}
                              min="1"
                              className="form-control"
                            />
                          </td>
                          <td>
                            {/* <div className="d-flex align-items-center gap-2"> */}
                            <div>
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
                            <div className="d-flex align-items-center gap-2 ">
                              <p className="mr-1">
                                {proposalData.grandTotalCurrency}
                              </p>
                              <p> {product.newTotalCost}</p>
                            </div>
                          </td>

                          <td>
                            {" "}
                            <div className="d-flex align-items-center gap-2 ">
                              {proposalData.grandTotalCurrency}
                              <Input
                                type="number"
                                name="newTax"
                                value={product.newTax}
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
                              <p> {product.newTotalCostWithTax}</p>
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
                    {proposalData.products.map((product: any, index: any) => (
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
                          {proposalData.grandTotalCurrency + " " + productTotal}
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Grand Total:</span>
                        <span>
                          {proposalData.grandTotalCurrency + " " + grandTotal}
                        </span>
                      </li>
                      {/* <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Discount on Grand Total:</span>
                        <span className="text-danger">
                          {proposalData.grandTotalCurrency + " "+discountOnGrandTotal}
                        </span>
                      </li> */}
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <strong>Final Amount:</strong>
                        <strong>
                          {proposalData.grandTotalCurrency + " " + finalAmount}
                        </strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Form>
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            <Button color="warning" onClick={sendProposal} type="submit">
              Send Proposal
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton className="bg-dark">
          <Modal.Title className="">Select a Proposal Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-unstyled">
            {proposalTemplates.map((template) => (
              <li key={template._id} className="mb-2">
                <button
                  className="btn btn-secondary btn-block text-left"
                  onClick={() => handleTemplateSelect(template.description)}
                >
                  <i className="fas fa-file-alt mr-2"></i>
                  {template.title}
                </button>
              </li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-dark" onClick={() => setShowModal(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NewProposal;
