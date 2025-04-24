import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Book as BookIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { ROUTES } from "../../../shared/utils/routes";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import PageHeader from "../../../shared/components/PageHeader";
import DataTable, { Column } from "../../../shared/components/DataTable";

interface Proposal {
  _id: string;
  emailTo: string;
  title: string;
  createdAt: string;
  status: string;
}

const Proposals = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProposals, setTotalProposals] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const columns: Column<Proposal>[] = [
    {
      id: 'emailTo',
      label: 'Sent To',
      sortable: true,
      minWidth: 200,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon color="primary" fontSize="small" />
          <Typography variant="body2">{value}</Typography>
        </Box>
      ),
    },
    {
      id: 'title',
      label: 'Title',
      sortable: true,
      minWidth: 250,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookIcon color="secondary" fontSize="small" />
          <Typography variant="body2">{value}</Typography>
        </Box>
      ),
    },
    {
      id: 'createdAt',
      label: 'Sent On',
      sortable: true,
      minWidth: 180,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon color="info" fontSize="small" />
          <Typography variant="body2">
            {new Date(value).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor:
              value === "Sent"
                ? alpha(theme.palette.warning.main, 0.1)
                : value === "Accepted"
                ? alpha(theme.palette.success.main, 0.1)
                : alpha(theme.palette.error.main, 0.1),
            color:
              value === "Sent"
                ? theme.palette.warning.main
                : value === "Accepted"
                ? theme.palette.success.main
                : theme.palette.error.main,
            fontWeight: 500,
          }}
        />
      ),
    },
  ];

  const getProposals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/proposal/proposals?page=${currentPage + 1}&limit=${rowsPerPage}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      setProposals(res.data.proposals);
      setTotalPages(res.data.totalPages);
      setTotalProposals(res.data.total);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      getProposals();
    }
  }, [auth, currentPage, searchQuery, rowsPerPage]);

  const handleAddProposal = () => {
    navigate(ROUTES.ADMIN.NEW_PROPOSAL);
  };

  const handleViewProposal = (data: Proposal) => {
    navigate(ROUTES.ADMIN.VIEW_PROPOSAL(data._id));
  };

  const handleSort = (columnId: keyof Proposal, direction: 'asc' | 'desc') => {
    // Implement sorting logic here if needed
    console.log('Sorting by:', columnId, direction);
  };

  const renderActions = (row: Proposal) => (
    <>
      <IconButton
        size="small"
        onClick={() => handleViewProposal(row)}
        sx={{ color: theme.palette.primary.main }}
      >
        <VisibilityIcon />
      </IconButton>
      {/* <IconButton
        size="small"
        onClick={() => navigate(ROUTES.ADMIN.UPDATE_PROPOSAL(row._id))}
        sx={{ color: theme.palette.info.main }}
      >
        <EditIcon />
      </IconButton> */}
      <IconButton
        size="small"
        onClick={() => {
          // Implement delete functionality
          console.log('Delete proposal:', row._id);
        }}
        sx={{ color: theme.palette.error.main }}
      >
        <DeleteIcon />
      </IconButton>
    </>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Proposals"
        searchPlaceholder="Search by email, title, or status"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        addButtonText="Add Proposal"
        onAddClick={handleAddProposal}
      />

      <Box>
        <DataTable
          columns={columns}
          data={proposals}
          loading={loading}
          emptyMessage="No matching proposals found"
          pagination={{
            total: totalPages,
            page: currentPage,
            rowsPerPage,
            onPageChange: setCurrentPage,
            onRowsPerPageChange: setRowsPerPage,
          }}
          onSort={handleSort}
          actions={renderActions}
        />
      </Box>
    </Container>
  );
};

export default Proposals;
