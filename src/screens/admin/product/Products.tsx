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
import { ROUTES } from "../../../shared/utils/routes";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import { getProducts } from "../../../shared/api/endpoints/product";
import { Product } from "../../../shared/api/types/product.types";
import PageHeader from "../../../shared/components/PageHeader";
import DataTable, { Column } from "../../../shared/components/DataTable";

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [auth] = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  let newUrl = BASE_URL?.replace("/api", "");

  const columns: Column<Product>[] = [
    {
      id: 'name',
      label: 'Product Name',
      sortable: true,
      minWidth: 200,
    },
    {
      id: 'sku',
      label: 'SKU',
      sortable: true,
      minWidth: 120,
    },
    {
      id: 'category',
      label: 'Category',
      sortable: true,
      minWidth: 150,
    },
    {
      id: 'cost',
      label: 'Cost',
      sortable: true,
      minWidth: 100,
      align: 'right',
      format: (value) => `$${value}`,
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
            bgcolor: value === 'Active' 
              ? alpha(theme.palette.success.main, 0.1)
              : value === 'Inactive'
              ? alpha(theme.palette.error.main, 0.1)
              : alpha(theme.palette.warning.main, 0.1),
            color: value === 'Active'
              ? theme.palette.success.main
              : value === 'Inactive'
              ? theme.palette.error.main
              : theme.palette.warning.main,
            fontWeight: 500,
          }}
        />
      ),
    },
    // TODO: Add activeSubs and revenueGen columns
    // {
    //   id: 'activeSubs',
    //   label: 'Active Subs',
    //   sortable: true,
    //   minWidth: 100,
    //   align: 'right',
    // },
    // {
    //   id: 'revenueGen',
    //   label: 'Revenue',
    //   sortable: true,
    //   minWidth: 120,
    //   align: 'right',
    //   format: (value) => `$${value}`,
    // },
  ];

  const getProduct = async () => {
    setLoading(true);
    try {
      const res = await getProducts(currentPage + 1, rowsPerPage, searchQuery);
      setProducts(res?.products || []);
      setTotalPages(res?.totalPages || 0);
      setTotalProducts(res?.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      getProduct();
    }
  }, [auth, currentPage, rowsPerPage, searchQuery]);

  const handleView = (data: Product) => {
    navigate(`${ROUTES.ADMIN.VIEW_PRODUCT(data._id)}`);
  };

  const handleAddProduct = () => {
    navigate(ROUTES.ADMIN.NEW_PRODUCT);
  };

  const handleSort = (columnId: keyof Product, direction: 'asc' | 'desc') => {
    // Implement sorting logic here if needed
    console.log('Sorting by:', columnId, direction);
  };

  const renderActions = (row: Product) => (
    <>
      <IconButton
        size="small"
        onClick={() => handleView(row)}
        sx={{ color: theme.palette.primary.main }}
      >
        <VisibilityIcon />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => navigate(ROUTES.ADMIN.UPDATE_PRODUCT(row._id))}
        sx={{ color: theme.palette.info.main }}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => {
          // Implement delete functionality
          console.log('Delete product:', row._id);
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
        title="Product Catalog"
        searchPlaceholder="Search by Product Name"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        addButtonText="Add Product"
        onAddClick={handleAddProduct}
      />

      <Box>
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No products found"
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
}

export default Products;
