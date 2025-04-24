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
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { ROUTES } from "../../../shared/utils/routes";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import PageHeader from "../../../shared/components/PageHeader";
import DataTable, { Column } from "../../../shared/components/DataTable";

interface User {
  _id: string;
  email: string;
  timeZone: string;
  activeAccount: boolean;
  businessDetails: {
    clientName: string;
    companyName: string;
    companyType: string;
  };
  address: {
    street1: string;
    state: string;
    country: string;
  };
}

const Users = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const columns: Column<User>[] = [
    {
      id: 'businessDetails',
      label: 'Client Name',
      sortable: true,
      minWidth: 200,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="primary" fontSize="small" />
          <Typography variant="body2">{value.clientName}</Typography>
        </Box>
      ),
    },
    {
      id: 'businessDetails',
      label: 'Company',
      sortable: true,
      minWidth: 200,
      format: (value) => (
        <Typography variant="body2">
          {value.companyName} {value.companyType}
        </Typography>
      ),
    },
    {
      id: 'address',
      label: 'Location',
      sortable: true,
      minWidth: 200,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon color="secondary" fontSize="small" />
          <Typography variant="body2">
            {value.street1}, {value.state}, {value.country}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'timeZone',
      label: 'Time Zone',
      sortable: true,
      minWidth: 150,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimeIcon color="info" fontSize="small" />
          <Typography variant="body2">{value}</Typography>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true,
      minWidth: 200,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon color="info" fontSize="small" />
          <Typography variant="body2">{value}</Typography>
        </Box>
      ),
    },
    {
      id: 'activeAccount',
      label: 'Status',
      sortable: true,
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value ? "Active" : "Inactive"}
          size="small"
          sx={{
            bgcolor: value
              ? alpha(theme.palette.success.main, 0.1)
              : alpha(theme.palette.error.main, 0.1),
            color: value
              ? theme.palette.success.main
              : theme.palette.error.main,
            fontWeight: 500,
          }}
        />
      ),
    },
  ];

  const getUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/user/users?page=${currentPage + 1}&limit=${rowsPerPage}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      getUsers();
    }
  }, [auth, currentPage, searchQuery, rowsPerPage]);

  const handleViewUser = (data: User) => {
    navigate(ROUTES.ADMIN.VIEW_USER(data._id));
  };

  const handleUpdateUser = (data: User) => {
    navigate(ROUTES.ADMIN.UPDATE_USER(data._id));
  };

  const handleDeleteUser = async (id: string) => {
    try {
      if (window.confirm("Are you sure you want to delete this user?")) {
        await axios.delete(`${BASE_URL}/user/${id}`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        getUsers();
        toast.success("User deleted successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    }
  };

  const handleSort = (columnId: keyof User, direction: 'asc' | 'desc') => {
    // Implement sorting logic here if needed
    console.log('Sorting by:', columnId, direction);
  };

  const renderActions = (row: User) => (
    <>
      <IconButton
        size="small"
        onClick={() => handleViewUser(row)}
        sx={{ color: theme.palette.primary.main }}
      >
        <VisibilityIcon />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => handleUpdateUser(row)}
        sx={{ color: theme.palette.info.main }}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => handleDeleteUser(row._id)}
        sx={{ color: theme.palette.error.main }}
      >
        <DeleteIcon />
      </IconButton>
    </>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Clients"
        searchPlaceholder="Search accounts"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        addButtonText="Add Client"
        onAddClick={() => navigate(ROUTES.ADMIN.NEW_USER)}
      />

      <Box>
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No matching users found"
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

export default Users;
