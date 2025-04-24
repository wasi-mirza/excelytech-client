import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  Sort as SortIcon,
  MonetizationOn as MonetizationOnIcon,
} from "@mui/icons-material";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import { useAuth } from "../../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "../../../shared/components/PageHeader";
import InfoCard from "../../../shared/components/InfoCard";
import DataTable, { Column } from "../../../shared/components/DataTable";

const ProposalDetails = () => {
  const { id } = useParams();
  const [auth] = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [proposal, setProposal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const handleUpdateStatus = async (status: string) => {
    try {
      const response = await fetch(`${BASE_URL}/proposal/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data) {
        toast.success(`Status Updated to ${status}`);
        fetchProposal();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const fetchProposal = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/proposal/${id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      setProposal(response.data);
      setUpdateStatus(response.data.status);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching proposal:", error);
      toast.error(error as string || "Error fetching proposal");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchProposal();
    }
  }, [auth]);

  const productColumns: Column<any>[] = [
    {
      id: 'product',
      label: 'Product',
      format: (value) => (
        <Typography variant="subtitle2">
          {value?.productId?.name || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      align: 'right',
      format: (value) => value?.quantity || 0,
    },
    {
      id: 'discount',
      label: 'Discount',
      align: 'right',
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
          <Typography>{value?.discount || 0}</Typography>
          <Chip
            label={value?.discountType || 'N/A'}
            size="small"
            color="info"
            variant="outlined"
          />
        </Box>
      ),
    },
    {
      id: 'total',
      label: 'Total',
      align: 'right',
      format: (value) => `${proposal?.grandTotalCurrency || ''}${value?.total || 0}`,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <InfoCard
          title="Loading..."
          items={[]}
          headerColor={theme.palette.primary.light}
        />
      </Box>
    );
  }

  if (!proposal) {
    return (
      <Box sx={{ p: 3 }}>
        <InfoCard
          title="Proposal Not Found"
          items={[]}
          headerColor={theme.palette.error.light}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Proposal Details"
        showBackButton
        backUrl="/admin-dashboard/proposals"
      />

      <Grid container spacing={3}>
        {/* Proposal Information */}
        <Grid item xs={12}>
          <InfoCard
            title="Proposal Information"
            items={[]}
            headerColor={theme.palette.primary.light}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Basic Details
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon color="primary" />
                      <Typography>
                        <strong>Title:</strong> {proposal.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MonetizationOnIcon color="primary" />
                      <Typography>
                        <strong>Sent To:</strong> {proposal.emailTo}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SortIcon color="primary" />
                      <Typography>
                        <strong>Sent On:</strong>{" "}
                        {new Date(proposal.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Proposal Status
                  </Typography>
                  {proposal.status === "Accepted" ? (
                    <Chip
                      label="Accepted"
                      color="success"
                      sx={{ fontSize: '1rem', py: 1 }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={updateStatus || ""}
                          label="Status"
                          onChange={(e) => setUpdateStatus(e.target.value)}
                        >
                          <MenuItem value="Sent">Sent</MenuItem>
                          <MenuItem value="Accepted">Accepted</MenuItem>
                          <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsStatusModalOpen(true)}
                      >
                        Update Status
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </InfoCard>
        </Grid>

        {/* Proposal Content */}
        <Grid item xs={12}>
          <InfoCard
            title="Proposal Content"
            items={[]}
            headerColor={theme.palette.primary.light}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                '& img': { maxWidth: '100%' },
              }}
              dangerouslySetInnerHTML={{ __html: proposal.content }}
            />
          </InfoCard>
        </Grid>

        {/* Products */}
        <Grid item xs={12}>
          <InfoCard
            title="Products"
            items={[]}
            headerColor={theme.palette.primary.light}
          >
            <DataTable
              columns={productColumns}
              data={proposal?.products || []}
              emptyMessage="No products found"
            />
          </InfoCard>
        </Grid>

        {/* Total Summary */}
        <Grid item xs={12}>
          <InfoCard
            title="Total Summary"
            items={[
              {
                label: "Product Total",
                value: `${proposal.grandTotalCurrency}${proposal.productTotal}`,
              },
              {
                label: "Discount on Grand Total",
                value: `${proposal.grandTotalCurrency}${proposal.discountOnGrandTotal}`,
              },
              {
                label: "Grand Total",
                value: `${proposal.grandTotalCurrency}${proposal.grandTotal}`,
              },
              {
                label: "Final Amount",
                value: `${proposal.grandTotalCurrency}${proposal.finalAmount}`,
              },
            ]}
            headerColor={theme.palette.primary.light}
          />
        </Grid>

        {/* Attachments */}
        <Grid item xs={12}>
          <InfoCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFileIcon />
                Attachments
                <Chip
                  label={proposal.attachments.length}
                  color="warning"
                  size="small"
                />
              </Box>
            }
            items={[]}
            headerColor={theme.palette.primary.light}
          >
            {proposal.attachments.length > 0 ? (
              <Box sx={{ display: 'grid', gap: 1 }}>
                {proposal.attachments.map((attachment: any, index: number) => (
                  <Button
                    key={index}
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    href={attachment.path.replace("/api", "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    {attachment.filename}
                  </Button>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No attachments.</Typography>
            )}
          </InfoCard>
        </Grid>
      </Grid>

      {/* Status Update Confirmation Modal */}
      <Dialog
        open={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Status Update</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change the status to{" "}
            <strong>{updateStatus}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsStatusModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleUpdateStatus(updateStatus || "");
              setIsStatusModalOpen(false);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProposalDetails;
