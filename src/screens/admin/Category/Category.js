import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../utils/endPointNames.js";

function Category() {
  const [auth] = useAuth();
  const [categoryNameList, setCategoryNameList] = useState([]);
  const [isCategoryLoading, setLoading] = useState(true);
  const [value, setValue] = useState(""); // For modal input
  const [newCategory, setNewCategory] = useState(""); // For modal input
  const [selectedCategory, setSelectedCategory] = useState(null); // For viewing category
  const [updateCategory, setUpdateCategory] = useState({ name: "" }); // For updating category
  const [deleteCategoryId, setDeleteCategoryId] = useState(null); // For deleting category
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Number of items per page
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  //   console.log("ok categoryNameList", categoryNameList);
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/category/allCategory?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      console.log("gategaryData:", res.data);

      setLoading(false);
      setCategoryNameList(res.data.categories); // Adjust according to your response structure
      setTotalPages(res.data.totalPages); // Adjust according to your response structure
    } catch (error) {
      console.error("Error fetching categories:", error);
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
      await axios.post(
        `${BASE_URL}/category/new`,
        { name: newCategory },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      toast.success("Category Added");
      setNewCategory("");
      setErrorMessage("");
      fetchCategories(); // Refresh categories
      document.getElementById("closeModalButton").click(); // Close modal
    } catch (error) {
      toast.error("Unable to Add");
      console.error("Error adding category:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(
        `${BASE_URL}/category/${updateCategory.Updateid}`,
        { name: updateCategory.name },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      toast.success("Categories Updated");
      fetchCategories();
      document.getElementById("closeEditModalButton").click(); // Close modal
    } catch (error) {
      toast.error("Unable to update");
      console.error("Error updating category:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/category/${deleteCategoryId}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      toast.success("Category Deleted");
      fetchCategories();
      setDeleteCategoryId(null);
      document.getElementById("closeDeleteModalButton").click(); // Close modal
    } catch (error) {
      toast.error("Unable to Delete");
      console.error("Error deleting category:", error);
    }
  };

  const openAddCategoryModal = () => {
    setNewCategory("");
    setErrorMessage("");
  };

  const handleNextPage = () => {
    if (currentPage <= totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchCategories();
    }
  }, [auth, currentPage, searchQuery]);

  return (
    <>
      <div className="content-wrapper">
        {/* Header Section */}
        <section className="content-header">
          <div className="container-fluid">
            <div className="row align-items-center justify-content-between my-3">
              <div className="col-md-4 col-sm-12 mb-2">
                <h1 className="text-left">Categories</h1>
              </div>
              <div className="col-md-8 col-sm-12 d-flex flex-wrap align-items-center">
                {/* Search Input */}
                <div className="form-group mb-0 flex-grow-1 mr-2 my-2">
                  <div className="input-group input-group-md">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-control form-control-md"
                      placeholder="Search..."
                    />
                  </div>
                </div>
                {/* Add Category Button */}
                <button
                  className="btn btn-success"
                  data-toggle="modal"
                  data-target="#addCategoryModal"
                  onClick={openAddCategoryModal}
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="content">
          <div className="container-fluid">
            <div className="card p-2">
              <div className="row">
                {/* Display Categories in Cards */}
                {isCategoryLoading ? (
                  Array.from({ length: categoryNameList?.length }).map(
                    (_, index) => (
                      <div key={index} className="col-md-4 col-sm-6 mb-3">
                        <div className="card">
                          <div className="card-body text-center loading-shimmer">
                            Loading...
                          </div>
                        </div>
                      </div>
                    )
                  )
                ) : categoryNameList?.length > 0 ? (
                  categoryNameList.map((category) => (
                    <div key={category._id} className="col-md-4 col-sm-6 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            {/* Category Title */}
                            <h5 className="card-title mb-0">{category.name}</h5>
                            {/* Action Buttons */}
                            <div>
                              <button
                                className="btn btn-success btn-sm mx-1"
                                data-toggle="modal"
                                data-target="#viewCategoryModal"
                                onClick={() => setSelectedCategory(category)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-dark btn-sm mx-1"
                                data-toggle="modal"
                                data-target="#editCategoryModal"
                                onClick={() =>
                                  setUpdateCategory({
                                    Updateid: category._id,
                                    name: category.name,
                                  })
                                }
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-danger btn-sm mx-1"
                                data-toggle="modal"
                                data-target="#deleteCategoryModal"
                                onClick={() =>
                                  setDeleteCategoryId(category._id)
                                }
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center">
                    <p>No categories found.</p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="card-footer">
                  <div className="row justify-content-center">
                    <div className="col-auto">
                      <button
                        className="btn btn-outline-primary mr-2"
                        disabled={currentPage === 1}
                        onClick={handlePrevPage}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`btn ${
                            currentPage === index + 1
                              ? "btn-success"
                              : "btn-light"
                          } mx-1`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        className="btn btn-outline-primary ml-2"
                        disabled={currentPage === totalPages}
                        onClick={handleNextPage}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* View Category Modal */}
      <div
        className="modal fade"
        id="viewCategoryModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="viewCategoryModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="viewCategoryModalLabel">
                View Category
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {selectedCategory ? (
                <div>
                  <h5>Name: {selectedCategory.name}</h5>
                  {/* Add more details here if needed */}
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      <div
        className="modal fade"
        id="editCategoryModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="editCategoryModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editCategoryModalLabel">
                Edit Category
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control"
                value={updateCategory.name}
                onChange={(e) =>
                  setUpdateCategory({ ...updateCategory, name: e.target.value })
                }
                placeholder="Enter new category name"
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                id="closeEditModalButton"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleUpdate}
              >
                Update Category
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="addCategoryModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addCategoryModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addCategoryModalLabel">
                Add New Category
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="categoryName">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="categoryName"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                />
                {errorMessage && (
                  <small className="text-danger">{errorMessage}</small>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                id="closeModalButton"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleAddCategory}
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Category Modal */}
      <div
        className="modal fade"
        id="deleteCategoryModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteCategoryModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteCategoryModalLabel">
                Delete Category
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this category?
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                id="closeDeleteModalButton"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Category;
