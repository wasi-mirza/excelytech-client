import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import toast from "react-hot-toast";
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label,
  FormFeedback,
  Container,
  Row,
  Col,
  Spinner,
} from "reactstrap";
import { BASE_URL } from "../../../shared/utils/endPointNames";

function NewEmailTemplate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [titleValid, setTitleValid] = useState(null);
  const [descriptionValid, setDescriptionValid] = useState(null);
  const [loading, setLoading] = useState(false); // Track submission progress
  const editor = useRef(null);
  const [auth] = useAuth();
  const navigate = useNavigate();

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

  const validateFields = () => {
    let valid = true;

    if (title === "") {
      setTitleValid(false);
      valid = false;
    } else {
      setTitleValid(true);
    }

    if (description === "") {
      setDescriptionValid(false);
      valid = false;
    } else {
      setDescriptionValid(true);
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    setLoading(true); // Start loading

    try {
      await axios.post(
        `${BASE_URL}/email/new`,
        { title, description, status },
        {
          headers: { Authorization: `Bearer ${auth?.token}` },
        }
      );
      toast.success("Template Added Successfully");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add template");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    // <div className="content-wrapper">
    //   <section className="content-header">
    //     <Container fluid>
    //       <Row className="mb-2">
    //         <Col xs="12" sm="6">
    //           <h1 className="text-dark">Add Proposal Template</h1>
    //         </Col>
    //       </Row>
    //     </Container>
    //   </section>

    //   <section className="content">
    //     <Container>
    //       <Row>
    //         <Col md="12">
    //           <Card>
    //             <div className="card-header">
    //               <h3 className="card-title">New Template</h3>
    //             </div>
    //             <CardBody>
    //               <Form onSubmit={handleSubmit}>
    //                 <FormGroup>
    //                   <Label htmlFor="title">Title</Label>
    //                   <Input
    //                     type="text"
    //                     value={title}
    //                     onChange={(e) => setTitle(e.target.value)}
    //                     id="title"
    //                     className="form-control"
    //                     invalid={titleValid === false}
    //                     valid={titleValid === true}
    //                   />
    //                   <FormFeedback>Title is required</FormFeedback>
    //                 </FormGroup>

    //                 <FormGroup>
    //                   <Label htmlFor="inputDescription">Description</Label>
    //                   <JoditEditor
    //                     ref={editor}
    //                     config={editorConfig}
    //                     value={description}
    //                     onBlur={(newContent) => setDescription(newContent)}
    //                   />
    //                   {descriptionValid === false && (
    //                     <FormFeedback className="d-block">
    //                       Description is required
    //                     </FormFeedback>
    //                   )}
    //                 </FormGroup>

    //                 <Button
    //                   type="submit"
    //                   color="success"
    //                   className="btn-block d-flex align-items-center justify-content-center"
    //                   disabled={loading}
    //                 >
    //                   {loading ? (
    //                     <>
    //                       <Spinner size="sm" className="me-2" />
    //                       Creating...
    //                     </>
    //                   ) : (
    //                     "Submit"
    //                   )}
    //                 </Button>
    //               </Form>
    //             </CardBody>
    //           </Card>
    //         </Col>
    //       </Row>
    //     </Container>
    //   </section>
    // </div>
    <div className="content-wrapper">
      {/* Page Header */}
      <section className="content-header">
        <Container fluid>
          <Row className="mb-3">
            <Col xs="12">
              <h2 className="text-dark">Add Proposal Template</h2>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Main Content */}
      <section className="content">
        <Container>
          <Row className="justify-content-center">
            <Col md="10">
              <Card>
                {/* Form Section */}
                <CardBody>
                  <Form onSubmit={handleSubmit}>
                    <FormGroup className="mb-3">
                      <div className="d-flex align-items-end justify-content-between">
                        <Label htmlFor="title" className=" my-2">
                          Title
                        </Label>
                        <Button
                          type="submit"
                          color="success"
                          className="px-4 py-2 my-2"
                        >
                          Submit
                        </Button>
                      </div>

                      <Input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        id="title"
                        className={`form-control ${
                          titleValid === false ? "is-invalid" : ""
                        }`}
                        required
                      />
                      {titleValid === false && (
                        <FormFeedback>Title is required</FormFeedback>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="description">Description</Label>
                      <JoditEditor
                        ref={editor}
                        config={editorConfig}
                        value={description}
                        onBlur={(newContent) => setDescription(newContent)}
                      />
                      {descriptionValid === false && (
                        <div className="text-danger mt-2">
                          Description is required
                        </div>
                      )}
                    </FormGroup>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}

export default NewEmailTemplate;
