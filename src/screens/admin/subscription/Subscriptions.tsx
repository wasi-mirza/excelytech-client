import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
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
} from "@mui/icons-material";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import { ROUTES } from "../../../shared/utils/routes";
import PageHeader from "../../../shared/components/PageHeader";
import DataTable, { Column } from "../../../shared/components/DataTable";

interface Subscription {
  _id: string;
  subscriptionId: string;
  customer: {
    businessDetails: {
      clientName: string;
    };
  };
  products: Array<{
    productId: {
      name: string;
    };
  }>;
  subscriptionDurationInMonths: number;
  createdAt: string;
  subscriptionStatus: string;
  grandTotalCurrency: string;
  finalAmount: number;
}

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [auth] = useAuth();
  const theme = useTheme();

  const columns: Column<Subscription>[] = [
    {
      id: 'subscriptionId',
      label: 'Subscription ID',
      sortable: true,
      minWidth: 150,
    },
    {
      id: 'customer',
      label: 'Account',
      sortable: true,
      minWidth: 200,
      format: (value) => value?.businessDetails?.clientName || 'N/A',
    },
    {
      id: 'products',
      label: 'Products',
      sortable: true,
      minWidth: 250,
      format: (value) => (
        <Box>
          <Typography variant="body2">
            {value && value.length > 0
              ? value.map((product: any, index: number) => (
                  <span key={index}>
                    {product.productId?.name || "Unnamed Product"}
                    {index < value.length - 1 && ", "}
                  </span>
                ))
              : "No products"}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'subscriptionDurationInMonths',
      label: 'Duration',
      sortable: true,
      minWidth: 100,
      format: (value) => `${value} Months`,
    },
    {
      id: 'createdAt',
      label: 'Created On',
      sortable: true,
      minWidth: 150,
      format: (value) =>
        new Date(value).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour12: true,
        }),
    },
    {
      id: 'subscriptionStatus',
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
                : value === "active"
                ? alpha(theme.palette.success.main, 0.1)
                : value === "inactive"
                ? alpha(theme.palette.grey[500], 0.1)
                : alpha(theme.palette.error.main, 0.1),
            color:
              value === "Sent"
                ? theme.palette.warning.main
                : value === "active"
                ? theme.palette.success.main
                : value === "inactive"
                ? theme.palette.grey[500]
                : theme.palette.error.main,
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      id: 'finalAmount',
      label: 'Amount',
      sortable: true,
      minWidth: 120,
      align: 'right',
      // format: (value: number, row: Subscription) => `${row.grandTotalCurrency} ${value}`,
    },
  ];

  const getSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/subscription/allSubscriptions?page=${currentPage + 1}&limit=${rowsPerPage}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      setSubscriptions(res.data.data);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      getSubscriptions();
    }
  }, [auth, searchQuery, currentPage, rowsPerPage]);

  const handleAddSubscription = () => {
    navigate(ROUTES.ADMIN.NEW_SUBSCRIPTION);
  };

  const handleViewSubscription = (data: Subscription) => {
    navigate(ROUTES.ADMIN.VIEW_SUBSCRIPTION(data._id));
  };

  const handleSort = (columnId: keyof Subscription, direction: 'asc' | 'desc') => {
    // Implement sorting logic here if needed
    console.log('Sorting by:', columnId, direction);
  };

  const renderActions = (row: Subscription) => (
    <>
      <IconButton
        size="small"
        onClick={() => handleViewSubscription(row)}
        sx={{ color: theme.palette.primary.main }}
      >
        <VisibilityIcon />
      </IconButton>
      {/* <IconButton
        size="small"
        onClick={() => navigate(ROUTES.ADMIN.UPDATE_SUBSCRIPTION(row._id))}
        sx={{ color: theme.palette.info.main }}
      >
        <EditIcon />
      </IconButton> */}
      <IconButton
        size="small"
        onClick={() => {
          // Implement delete functionality
          console.log('Delete subscription:', row._id);
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
        title="Subscriptions"
        searchPlaceholder="Search by Id, Duration, Status"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        addButtonText="Add Subscription"
        onAddClick={handleAddSubscription}
      />

      <Box>
        <DataTable
          columns={columns}
          data={subscriptions}
          loading={loading}
          emptyMessage="No matching subscriptions found"
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

export default Subscriptions;
