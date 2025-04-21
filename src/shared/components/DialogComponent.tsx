import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

interface DialogComponentProps {
  isOpen: boolean;
  toggle: () => void;
  message?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ReusableDialog: React.FC<DialogComponentProps> = ({
  isOpen,
  toggle,
  message = "Are you sure?",
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirmation</ModalHeader>
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onConfirm}>
          Yes
        </Button>
        <Button color="secondary" onClick={onCancel || toggle}>
          No
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReusableDialog; 