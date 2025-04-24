import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { getAllCategories, updateCategory, addCategory, deleteCategory } from "../../../shared/api/endpoints/category";
import { CategoryResponse } from "../../../shared/api/types/category.types";
import PageHeader from "../../../shared/components/PageHeader";
import DataTable, { Column } from "../../../shared/components/DataTable";

function Category() {
  const [auth] = useAuth();
  const [categoryNameList, setCategoryNameList] = useState<CategoryResponse[]>([]);
  const [isCategoryLoading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [updateCategoryState, setUpdateCategory] = useState({ name: "", categoryId: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortField, setSortField] = useState<keyof CategoryResponse>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const theme = useTheme();

  // Modal states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);

  const columns: Column<CategoryResponse>[] = [
    {
      id: 'name',
      label: 'Category Name',
      sortable: true,
    },
  ];

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categories = await getAllCategories(currentPage + 1, rowsPerPage, searchQuery);
      setLoading(false);
      setCategoryNameList(categories?.categories || []);
      setTotalPages(categories?.total || 0);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    const categoryExists = categoryNameList.some(
      (category) => category.name.toLowerCase() === newCategory.toLowerCase()
    );

    if (categoryExists) {
      setErrorMessage("Category already exists");
      return;
    }

    try {
      await addCategory({ name: newCategory });
      toast.success("Category Added");
      setNewCategory("");
      setErrorMessage("");
      setOpenAddModal(false);
      fetchCategories();
    } catch (error) {
      toast.error("Unable to Add");
      console.error("Error adding category:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateCategory({ name: updateCategoryState.name, categoryId: updateCategoryState.categoryId });
      toast.success("Categories Updated");
      setOpenEditModal(false);
      fetchCategories();
    } catch (error) {
      toast.error("Unable to update");
      console.error("Error updating category:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory(selectedCategory._id);
      toast.success("Category Deleted");
      setOpenDeleteModal(false);
      fetchCategories();
    } catch (error) {
      toast.error("Unable to Delete");
      console.error("Error deleting category:", error);
    }
  };

  const handleSort = (columnId: keyof CategoryResponse, direction: 'asc' | 'desc') => {
    setSortField(columnId);
    setSortDirection(direction);
    // Implement sorting logic here if needed
  };

  const renderActions = (row: CategoryResponse) => (
    <>
      <IconButton
        size="small"
        onClick={() => {
          setUpdateCategory({ categoryId: row._id, name: row.name });
          setOpenEditModal(true);
        }}
        sx={{ color: theme.palette.info.main }}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => {
          setSelectedCategory(row);
          setOpenDeleteModal(true);
        }}
        sx={{ color: theme.palette.error.main }}
      >
        <DeleteIcon />
      </IconButton>
    </>
  );

  useEffect(() => {
    if (auth?.token) {
      fetchCategories();
    }
  }, [auth, currentPage, rowsPerPage, searchQuery]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Categories"
        searchPlaceholder="Search categories..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        addButtonText="Add Category"
        onAddClick={() => setOpenAddModal(true)}
      />

      {/* Main Content */}
      <Box>
        <DataTable
          columns={columns}
          data={categoryNameList}
          loading={isCategoryLoading}
          emptyMessage="No categories found"
          // pagination={{
          //   total: totalPages,
          //   page: currentPage,
          //   rowsPerPage,
          //   onPageChange: setCurrentPage,
          //   onRowsPerPageChange: setRowsPerPage,
          // }}
          onSort={handleSort}
          actions={renderActions}
        />
      </Box>

      {/* Add Category Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            error={!!errorMessage}
            helperText={errorMessage}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button onClick={handleAddCategory} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Category Name"
            value={updateCategoryState.name}
            onChange={(e) => setUpdateCategory({ ...updateCategoryState, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "{selectedCategory?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Category;
