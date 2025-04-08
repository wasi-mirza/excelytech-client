import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  Button,
  ListGroup,
  ListGroupItem,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Form,
} from "reactstrap";
import {
  FaFileAlt,
  FaPaperclip,
  FaEdit,
  FaBox,
  FaSortAmountDown,
  FaDollarSign,
} from "react-icons/fa";
import { BASE_URL } from "../../utils/endPointNames";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProposalDetails = () => {
  const { id } = useParams();
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState(null);

  const [isFirstModalOpen, setFirstModalOpen] = useState(false);

  const toggleFirstModal = () => setFirstModalOpen(!isFirstModalOpen);

  const handleUpdateStatusVar = () => {
    toggleFirstModal(true);
  };

  const handleConfirmUpdate = async () => {
    await handleUpdateStatus(updateStatus);
  };

  const handleUpdateStatus = async (status) => {
    // const subscriptionOn = status === "Accepted" ? true : false;
    // console.log("subscriptionOn", subscriptionOn, status);

    try {
      const response = await fetch(`${BASE_URL}/proposal/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify({
          status: status,
          // subscriptionOn: subscriptionOn,
        }),
      });

      const data = await response.json();
      console.log("data", data.status);
      fetchProposal();
      if (data) {
        toast.success(`Staus Updated to ${status}`);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Fetch proposal data
  const fetchProposal = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/proposal/${id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      setProposal(response.data);
      setUpdateStatus(response.data.status);
      console.log("status", response.data.subscriptionOn);
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

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-12">
              <h1 className="text-dark">Proposal</h1>
            </div>
          </div>
        </div>
      </section>
      <div className="content ">
        <div className="row p-3">
          <div className="card w-100 card-olive card-outline">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="card-title">Proposal Information</h3>
                {/* <Button color="warning">
                  <FaEdit /> Edit Proposal
                </Button> */}
              </div>
            </div>{" "}
            <CardBody>
              <div className="card">
                <div className="card-header d-flex justify-content-between ">
                  <h5 className="card-title">Proposal Details</h5>
                  {/* <p className="d-flex align-items-center">
                    Subscription Created ? :
                    {proposal.subscriptionOn ? (
                      <span className="text-success"> Yes</span>
                    ) : (
                      <span className="text-danger"> No</span>
                    )}
                  </p> */}
                </div>

                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <p>
                      <strong>Title:</strong> {proposal.title}
                    </p>
                    <p>
                      <strong>Sent On:</strong>{" "}
                      {new Date(proposal.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <p>
                    <strong>Sent To:</strong> {proposal.emailTo}
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Proposal Status</h5>
                </div>
                <div className="card-body">
                  {proposal.status === "Accepted" ? (
                    <>
                      {" "}
                      <p className="badge badge-success text-md">Accepted</p>
                      {/* <p>This proposal is ready for creating subscription</p> */}
                    </>
                  ) : (
                    <div className="d-flex justify-content-evenly align-items-center">
                      <select
                        className="form-control"
                        id="status"
                        name="status"
                        value={updateStatus}
                        style={{ width: "auto" }}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                      >
                        <option value="Sent">Sent</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>{" "}
                      <Button
                        color="success"
                        className="ml-2"
                        onClick={handleUpdateStatusVar}
                      >
                        Update Status
                      </Button>{" "}
                    </div>
                  )}
                </div>
              </div>

              <div className="card card-olive card-outline">
                <div className="card-header">
                  <h5 className="card-title">Proposal Content</h5>
                </div>
                <div className="card-body">
                  <p
                    dangerouslySetInnerHTML={{
                      __html: `${proposal.content}`,
                    }}
                  />
                </div>
              </div>

              <Table className="table table-hover table-striped text-center">
                <thead className="bg-gradient-dark text-white">
                  <tr>
                    <th>
                      <FaBox className="mr-2" /> Product
                    </th>
                    <th>
                      <FaSortAmountDown className="mr-2" /> Quantity
                    </th>
                    <th>Discount</th>
                    <th>Total</th>
                    {/* <th>Currency</th> */}
                  </tr>
                </thead>
                <tbody>
                  {proposal.products.map((product, index) => (
                    <tr key={index} className="align-middle">
                      <td className="font-weight-bold text-dark">
                        {product.productId.name}
                      </td>
                      <td>{product.quantity}</td>
                      <td>
                        {product.discount}{" "}
                        <span className="badge badge-info">
                          {product.discountType}
                        </span>
                      </td>
                      <td>
                        {proposal.grandTotalCurrency}
                        {product.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <br />
              <Card className="card card-olive card-outline">
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <h6 className="card-title mb-0">Total Summary</h6>
                </CardHeader>
                <CardBody>
                  <p className="mb-2">
                    <strong>Product Total:</strong>
                    <span className="float-right">
                      {proposal.grandTotalCurrency}
                      {proposal.productTotal}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong>Discount on Grand Total:</strong>
                    <span className="float-right">
                      {proposal.grandTotalCurrency}
                      {proposal.discountOnGrandTotal}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong>Grand Total:</strong>
                    <span className="float-right">
                      {proposal.grandTotalCurrency}
                      {proposal.grandTotal}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong>Final Amount:</strong>
                    <span className="float-right">
                      {proposal.grandTotalCurrency}
                      {proposal.finalAmount}
                    </span>
                  </p>
                </CardBody>
              </Card>

              <Card className="card card-olive card-outline">
                <CardHeader className="d-flex justify-content-start align-items-center">
                  <h6 className="card-title mb-0 mr-2">
                    <FaPaperclip className="mr-2" /> Attachments
                  </h6>
                  <Badge color="warning">{proposal.attachments.length}</Badge>
                </CardHeader>
                <CardBody>
                  {proposal.attachments.length > 0 ? (
                    <ListGroup>
                      {proposal.attachments.map((attachment, index) => (
                        <ListGroupItem
                          key={index}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <a
                            href={attachment.path.replace("/api", "")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-info"
                          >
                            <FaFileAlt className="mr-2" /> {attachment.filename}
                          </a>
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="text-muted">No attachments.</p>
                  )}
                </CardBody>
              </Card>
            </CardBody>
          </div>
        </div>
      </div>
      <StatusConfirmationModal
        isOpen={isFirstModalOpen}
        toggle={toggleFirstModal}
        proposalStatus={updateStatus}
        onConfirm={handleConfirmUpdate}
      />
    </div>
  );
};
const StatusConfirmationModal = ({
  isOpen,
  toggle,
  proposalStatus,
  onConfirm,
  // products,
  // grandTotalCurrency,
  // finalAmount,
  // proposalId,
  // customer,
  // handleSubscriptionData,
}) => {
  // const [formData, setFormData] = useState({
  //   customer: customer,
  //   proposalId: proposalId,
  //   isActive: true,
  //   products: products,
  //   subscriptionStatus: "processing",
  //   totalAmountCurrency: grandTotalCurrency,
  //   finalAmount: finalAmount,
  //   // subscriptionDate: new Date(),
  //   subscriptionDurationInMonths: 1,
  // });

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({ ...formData, [name]: value });
  // };

  return proposalStatus === "Accepted" ? (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="md"
      backdrop="static"
      keyboard={false}
    >
      <div className="modal-header">
        <h5 className="modal-title">Confirm Status Update</h5>
        <Button close onClick={toggle} />
      </div>

      <div className="modal-body">
        <p>
          Are you sure you want to change the status to{" "}
          <strong>{proposalStatus}</strong>
          {/* <br /> And <strong>Create Subscription</strong> with below products
          with <strong> Final Amount : </strong>
          <span>
            {grandTotalCurrency} {finalAmount}
          </span>{" "}
          ? */}
        </p>
        {/* <Table className="table text-center">
          <thead className="bg-gradient-primary text-white">
            <tr>
              <th>
                <FaBox className="mr-2" /> Product
              </th>
              <th>
                <FaSortAmountDown className="mr-2" /> Quantity
              </th>
              <th>Discount</th>
              <th>Total</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="align-middle">
                <td className="font-weight-bold text-dark">
                  {product.productId.name}
                </td>
                <td>{product.quantity}</td>
                <td>
                  {product.discount}{" "}
                  <span className="badge badge-info">
                    {product.discountType}
                  </span>
                </td>
                <td>{product.total.toFixed(2)}</td>
                <td>{product.currency}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <br />
        <Form>
          <p>
            <Label className="mr-2" for="subscriptionDate">
              Subscription Starts from Date :{" "}
            </Label>
            {new Date().toLocaleDateString()}
          </p>
          <FormGroup className="d-flex justify-content-between align-items-center">
            <Label for="subscriptionDurationInMonths">
              Subscription Duration (Months)
            </Label>
            <Input
              type="number"
              name="subscriptionDurationInMonths"
              id="subscriptionDurationInMonths"
              value={formData.subscriptionDurationInMonths}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
        </Form> */}
      </div>
      <div className="modal-footer">
        <Button color="secondary" onClick={toggle}>
          No
        </Button>
        <Button
          color="primary"
          onClick={() => {
            onConfirm();
            // handleSubscriptionData(formData, , toggle);
            toggle();
          }}
        >
          Yes
        </Button>
      </div>
    </Modal>
  ) : (
    <Modal isOpen={isOpen} toggle={toggle} backdrop="static" keyboard={false}>
      <div className="modal-header">
        <h5 className="modal-title">Confirm Status Update</h5>
        <Button close onClick={toggle} />
      </div>

      <div className="modal-body">
        <p>
          Are you sure you want to change the status to{" "}
          <strong>{proposalStatus}</strong>?
        </p>
      </div>
      <div className="modal-footer">
        <Button color="secondary" onClick={toggle}>
          No
        </Button>
        <Button
          color="primary"
          onClick={() => {
            onConfirm();
            toggle();
          }}
        >
          Yes
        </Button>
      </div>
    </Modal>
  );
};

export default ProposalDetails;
