import { useEffect, useState } from "react";
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
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { ROUTES } from "../../../shared/utils/routes";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import PageHeader from "../../../shared/components/PageHeader";
import DataTable, { Column } from "../../../shared/components/DataTable";

interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: {
    name: string;
  } | null;
  createdAt: string;
}

const Tickets = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const columns: Column<Ticket>[] = [
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
      minWidth: 250,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ 
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'priority',
      label: 'Priority',
      sortable: true,
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor:
              value === "High"
                ? alpha(theme.palette.error.main, 0.1)
                : value === "Medium"
                ? alpha(theme.palette.warning.main, 0.1)
                : alpha(theme.palette.success.main, 0.1),
            color:
              value === "High"
                ? theme.palette.error.main
                : value === "Medium"
                ? theme.palette.warning.main
                : theme.palette.success.main,
            fontWeight: 500,
          }}
        />
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
              value === "Closed"
                ? alpha(theme.palette.success.main, 0.1)
                : value === "In Progress"
                ? alpha(theme.palette.warning.main, 0.1)
                : value === "Open"
                ? alpha(theme.palette.error.main, 0.1)
                : alpha(theme.palette.grey[500], 0.1),
            color:
              value === "Closed"
                ? theme.palette.success.main
                : value === "In Progress"
                ? theme.palette.warning.main
                : value === "Open"
                ? theme.palette.error.main
                : theme.palette.grey[500],
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      id: 'assignedTo',
      label: 'Assigned To',
      sortable: true,
      minWidth: 150,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="info" fontSize="small" />
          <Typography variant="body2">
            {value?.name || "Unassigned"}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created At',
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
  ];

  const getTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/ticket/tickets?page=${currentPage + 1}&limit=${rowsPerPage}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      setTickets(res.data.tickets);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      getTickets();
    }
  }, [auth, currentPage, searchQuery, rowsPerPage]);

  const handleViewTicket = (data: Ticket) => {
    navigate(`${ROUTES.ADMIN.TICKETS}/${data._id}`);
  };

  const handleSort = (columnId: keyof Ticket, direction: 'asc' | 'desc') => {
    // Implement sorting logic here if needed
    console.log('Sorting by:', columnId, direction);
  };

  const renderActions = (row: Ticket) => (
    <IconButton
      size="small"
      onClick={() => handleViewTicket(row)}
      sx={{ color: theme.palette.primary.main }}
    >
      <VisibilityIcon />
    </IconButton>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Tickets"
        searchPlaceholder="Search by title, description, or status"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Box>
        <DataTable
          columns={columns}
          data={tickets}
          loading={loading}
          emptyMessage="No matching tickets found"
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

export default Tickets;
