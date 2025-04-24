import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Box,
  Container,
  Typography,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import PageHeader from "../../../shared/components/PageHeader";
import DataTable, { Column } from "../../../shared/components/DataTable";
import { ROUTES } from "../../../shared/utils/routes";

interface ProposalTemplate {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

const ProposalTemplate = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const columns: Column<ProposalTemplate>[] = [
    {
      id: 'title',
      label: 'Title',
      sortable: true,
      minWidth: 200,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{value}</Typography>
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      sortable: true,
      minWidth: 300,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        </Box>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created At',
      sortable: true,
      minWidth: 180,
      format: (value) => (
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
      ),
    },
  ];

  const getTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/proposalTemplate/templates?page=${currentPage + 1}&limit=${rowsPerPage}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      setTemplates(res.data.templates);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      getTemplates();
    }
  }, [auth, currentPage, searchQuery, rowsPerPage]);

  const handleViewTemplate = (data: ProposalTemplate) => {
    navigate(`/admin-dashboard/viewproposaltemplete/${data._id}`);
  };

  const handleUpdateTemplate = (data: ProposalTemplate) => {
    navigate(`/admin-dashboard/updateproposaltemplete/${data._id}`);
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await axios.delete(`${BASE_URL}/proposalTemplate/templates/${id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      getTemplates();
      toast.success("Template deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete template");
    }
  };

  const handleSort = (columnId: keyof ProposalTemplate, direction: 'asc' | 'desc') => {
    // Implement sorting logic here if needed
    console.log('Sorting by:', columnId, direction);
  };

  const renderActions = (row: ProposalTemplate) => (
    <>
      <IconButton
        size="small"
        onClick={() => handleViewTemplate(row)}
        sx={{ color: theme.palette.primary.main }}
      >
        <VisibilityIcon />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => handleUpdateTemplate(row)}
        sx={{ color: theme.palette.info.main }}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => handleDeleteTemplate(row._id)}
        sx={{ color: theme.palette.error.main }}
      >
        <DeleteIcon />
      </IconButton>
    </>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Proposal Templates"
        searchPlaceholder="Search by title"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        addButtonText="Add Proposal Template"
        onAddClick={() => navigate(ROUTES.ADMIN.NEW_PROPOSAL_TEMPLATE)}
      />

      <Box>
        <DataTable
          columns={columns}
          data={templates}
          loading={loading}
          emptyMessage="No matching templates found"
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

export default ProposalTemplate;
