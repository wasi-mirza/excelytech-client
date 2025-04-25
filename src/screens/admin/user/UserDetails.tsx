import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import moment from "moment";
import toast from "react-hot-toast";
import ReusableDialog from "../../../shared/components/DialogComponent";
import PageHeader from "../../../shared/components/PageHeader";
import InfoCard from "../../../shared/components/InfoCard";
import {
  Box,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Upload as UploadIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import axios from "axios";

function View() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [viewInfo, setViewInfo] = useState<any>(null);
  const [auth] = useAuth();
  const { id } = useParams();
  const [notes, setNotes] = useState<any>([]);
  const [noteContent, setNoteContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [userAgreementUrl, setUserAgreementUrl] = useState<any>(null);
  const [resetEmail] = useState("");
  const [isDeleteUserDialog, setDeleteUserDialog] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const notesPerPage = 4;

  // Function to fetch user details
  const viewpage = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/${id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      if (res.status === 200 || res.status === 201) setViewInfo(res.data);
      // console.log("viewInfo", res.data);
      setNotes(res.data.notes || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserAgreement = async () => {
    try {
      let AgreementUrl = null;

      // Step 1: Upload the file to /upload/productImage
      if (userAgreementUrl != null || userAgreementUrl.length !== 0) {
        console.log("Agreemwnt url", userAgreementUrl);
        const fileData = new FormData();
        fileData.append("doc", userAgreementUrl);
        console.log("fileData", fileData);

        const uploadResponse = await axios.post(
          `${BASE_URL}/upload/doc`,
          fileData,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("userAgreementUrl", uploadResponse);

        AgreementUrl = uploadResponse.data.fileUrl; // Assume fileUrl is returned by the API
      }
      const updatedUser = {
        ...viewInfo,
        userAgreementUrl: AgreementUrl || "",
      };
      console.log("update userrr", updatedUser);

      const res = await axios.patch(`${BASE_URL}/user/${id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      if (res.status == 200 || res.status == 201) {
        toast.success("User agreement Uploaded");
        setIsAgreementOpen(false);
        viewpage();
        console.log("ViewInfo", viewInfo);
      }
    } catch (err) {
      console.log("Error", err);
    }
  };

  // Function to handle adding new note
  const handleAddNote = async (e: any) => {
    e.preventDefault();

    try {
      const newNote = {
        content: noteContent,
        noteMadeBy: auth?.user._id,
        createdAt: new Date().toISOString(),
      };

      const updatedUser = {
        ...viewInfo,
        notes: [newNote, ...(viewInfo?.notes || [])],
      };

      const res = await axios.patch(`${BASE_URL}/user/${id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });

      const sortedNotes = res.data.notes.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setViewInfo(res.data);
      setNotes(sortedNotes); // Update local notes array with sorted notes
      setNoteContent(""); // Clear the textarea
      setCurrentPage(1); // Reset to the first page
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };
  useEffect(() => {
    if (auth?.token) {
      viewpage();
    }
  }, [auth]);

  // Get notes for current page
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = notes.slice(indexOfFirstNote, indexOfLastNote);

  // Pagination handlers
  const totalPages = Math.ceil(notes.length / notesPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handleDelete = async (data: any) => {
    try {
      const res = await axios.delete(`${BASE_URL}/user/${data._id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      if (res.status === 200) {
        toast.success("Deleted Successfully");
      } else {
        toast.error("Deleted Failed");
      }
    } catch (error) {
      toast.error("Unable to delete");
      // console.log(error);
    }
  };
  const handleUpdateForm = (id: any) => {
    console.log("Data", id);

    navigate(`/admin-dashboard/update/${id}`);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setUserAgreementUrl(file);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="User Details"
        showBackButton
        backUrl="/admin-dashboard/allusers"
        rightContent={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => handleUpdateForm(viewInfo?._id)}
              sx={{ color: theme.palette.primary.main }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => setDeleteUserDialog(true)}
              sx={{ color: theme.palette.error.main }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        }
      />

      <Grid container spacing={3}>
        {/* Account Owner Card */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Account Owner"
            items={[
              { label: "Name", value: viewInfo?.name },
              { label: "Email", value: viewInfo?.email },
              { label: "Phone", value: viewInfo?.phone },
              { label: "User Type", value: viewInfo?.userType },
              { label: "Account Manager", value: viewInfo?.accountManagers?.name || "Not Assigned" },
              {
                label: "User Agreement",
                value: viewInfo?.userAgreementUrl ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<VisibilityIcon />}
                      onClick={() => setShowModal(true)}
                      size="small"
                    >
                      View
                    </Button>
                    <Button
                      startIcon={<UploadIcon />}
                      onClick={() => setIsAgreementOpen(true)}
                      size="small"
                      variant="outlined"
                    >
                      Upload New
                    </Button>
                  </Box>
                ) : (
                  "Not available"
                ),
              },
            ]}
          />
        </Grid>

        {/* Address Card */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Address"
            items={[
              { label: "Time Zone", value: viewInfo?.timeZone },
              { label: "Street 1", value: viewInfo?.address?.street1 },
              { label: "Street 2", value: viewInfo?.address?.street2 },
              { label: "City", value: viewInfo?.address?.city },
              { label: "State", value: viewInfo?.address?.state },
              { label: "Zip Code", value: viewInfo?.address?.zipCode },
            ]}
          />
        </Grid>

        {/* Business Information Card */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Business Information"
            items={[
              { label: "Client Name", value: viewInfo?.businessDetails?.clientName },
              { label: "Company Name", value: viewInfo?.businessDetails?.companyName },
              { label: "Company Type", value: viewInfo?.businessDetails?.companyType },
              { label: "Tax ID", value: viewInfo?.businessDetails?.taxId },
              { label: "Employee Size", value: viewInfo?.businessDetails?.employeeSize },
              { label: "Owner Phone", value: viewInfo?.businessDetails?.ownerPhone },
              { label: "Owner Email", value: viewInfo?.businessDetails?.ownerEmail },
            ]}
          />
        </Grid>

        {/* Account Status Card */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Account Status"
            items={[
              { label: "Account Manager", value: viewInfo?.accountManagers?.name || "Not Assigned" },
              { label: "Allow Login", value: viewInfo?.allowLogin },
              { label: "Account Active", value: viewInfo?.activeAccount },
              { label: "First-Time Login", value: viewInfo?.isFirstTimeLogin },
              { label: "Password Reset Completed", value: viewInfo?.isFirstPasswordResetDone },
              { label: "Agreement Accepted", value: viewInfo?.agreementAccepted },
            ]}
            rightContent={
              <Button
                variant="contained"
                color="warning"
                onClick={() => setIsModalOpen(true)}
                sx={{ mt: 2 }}
              >
                Reset Password
              </Button>
            }
          />
        </Grid>

        {/* Notes Section */}
        <Grid item xs={12}>
          <InfoCard
            title="Notes"
            items={[]}
            headerColor={theme.palette.primary.light}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {currentNotes.map((note: any, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        boxShadow: theme.shadows[1],
                      }}
                    >
                      <Typography variant="body2">{note.content}</Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'block', textAlign: 'right' }}
                      >
                        {moment(note.createdAt).format("HH:mm - DD, MMMM YYYY")}
                      </Typography>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="outlined"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                    </Button>
                    <Typography variant="body2">
                      Page {currentPage} of {Math.ceil(notes.length / notesPerPage)}
                    </Typography>
                    <Button
                      variant="outlined"
                        onClick={handleNextPage}
                      disabled={currentPage === Math.ceil(notes.length / notesPerPage)}
                      >
                        Next
                    </Button>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <form onSubmit={handleAddNote}>
                    <TextField
                      fullWidth
                      multiline
                            rows={5}
                      label="Add New Note"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            required
                      sx={{ mb: 2 }}
                    />
                    <Button type="submit" variant="contained" color="success">
                          Add Note
                    </Button>
                      </form>
                </Box>
              </Grid>
            </Grid>
          </InfoCard>
        </Grid>
      </Grid>

      {/* Keep the existing modals but update their styling to use MUI */}
      <ReusableDialog
        isOpen={isDeleteUserDialog}
        toggle={() => setDeleteUserDialog(false)}
        message="Are you sure you want to delete this user?"
        onConfirm={() => handleDelete(viewInfo)}
        onCancel={() => setDeleteUserDialog(false)}
      />

      <Dialog
        open={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload New User Agreement Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              id="userAgreement"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="userAgreement">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
              >
                Choose File
              </Button>
            </label>
            {userAgreementUrl && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected File: {userAgreementUrl.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAgreementOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUserAgreement}
            disabled={!userAgreementUrl}
            variant="contained"
            color="primary"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {showModal && (
        <AgreementModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          userAgreementUrl={viewInfo?.userAgreementUrl}
        />
      )}

      {isModalOpen && (
        <PasswordResetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          resetEmail={viewInfo?.email}
          auth={auth}
        />
      )}
    </Box>
  );
}

export default View;

function AgreementModal({ isOpen, onClose, userAgreementUrl }: {
  isOpen: boolean,
  onClose: () => void,
  userAgreementUrl: string
}) {
  if (!isOpen) return null;
  const newUrl = BASE_URL?.replace("/api", "");
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>Agreement</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {userAgreementUrl ? (
          <iframe
            src={`${newUrl}${userAgreementUrl}`}
            width="100%"
            height="100%"
            title="Agreement Document"
            style={{ border: 'none', display: 'block' }}
          />
        ) : (
          <Typography sx={{ p: 2 }}>No agreement available.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PasswordResetModal({ isOpen, onClose, auth, resetEmail }: {
  isOpen: boolean,
  onClose: () => void,
  auth: any,
  resetEmail: string
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  if (!isOpen) return null;

  const validatePassword = () => {
    const isValid = newPassword === confirmPassword;
    setIsPasswordValid(isValid);
  };

  const handleResetPassword = async () => {
    try {
      if (!resetEmail || !newPassword) {
        toast.error("Please provide both email and new password.");
        return;
      }
      const response = await axios.post(
        `${BASE_URL}/user/resetpasswordbyemail`,
        { email: resetEmail, newPassword },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message || "Password reset successful.");
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Email: {resetEmail}
          </Typography>
          <TextField
            fullWidth
            label="New Password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={validatePassword}
                  required
            error={!isPasswordValid && confirmPassword.length > 0}
            helperText={
              !isPasswordValid && confirmPassword.length > 0
                ? "Passwords do not match"
                : ""
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
              onClick={handleResetPassword}
          variant="contained"
          color="primary"
          disabled={!isPasswordValid}
            >
              Reset Password
        </Button>
      </DialogActions>
    </Dialog>
  );
}
