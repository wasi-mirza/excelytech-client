import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
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
} from "reactstrap";
import { BASE_URL } from "../../utils/endPointNames";

function NewProposalTemplate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  const [titleValid, setTitleValid] = useState(null);
  const [descriptionValid, setDescriptionValid] = useState(null);
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

    if (title.trim() === "") {
      setTitleValid(false);
      valid = false;
    } else {
      setTitleValid(true);
    }

    if (description.trim() === "") {
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

    try {
      await axios.post(
        `${BASE_URL}/proposalTemplate/new`,
        { title, description, status },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      toast.success("Template Added Successfully");
      navigate(-1);
    } catch (error) {
      toast.error("Failed to add template");
      console.error(error);
    }
  };

  return (
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

export default NewProposalTemplate;
