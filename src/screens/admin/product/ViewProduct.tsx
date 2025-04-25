import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import toast from "react-hot-toast";
import { logUserActivity } from "../../../shared/api/endpoints/user";
import { getProductById } from "../../../shared/api/endpoints/product";
import { Product } from "../../../shared/api/types/product.types";
import PageHeader from "../../../shared/components/PageHeader";
import InfoCard from "../../../shared/components/InfoCard";
import {
  Box,
  Grid,
  Button,
  Typography,
  Chip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as AttachMoneyIcon,
  LocalOffer as LocalOfferIcon,
  Tag as TagIcon,
} from "@mui/icons-material";

function ViewProduct() {
  const [product, setProduct] = useState<Product>();
  const [auth] = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  let newUrl = BASE_URL?.replace("/api", "");

  const handleEdit = () => {
    navigate(`/admin-dashboard/updateproduct/${id}`, { replace: true });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/product/${id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      toast.success("Product Deleted Successfully");
      navigate("/admin-dashboard/products");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete the product. Please try again.");
    }
  };

  const getProduct = async () => {
    try {
      const res = await getProductById(id);
      setProduct(res.data);
      if (res.status === 200 || res.status === 201) {
        await logUserActivity({
          userId: auth?.user?._id,
          activityType: "VIEW_PAGE",
          description: "View product page"
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      getProduct();
    }
  }, [auth]);

  if (!product) {
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

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Product Details"
        showBackButton
        backUrl="/admin-dashboard/products"
        rightContent={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit Product
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete Product
            </Button>
          </Box>
        }
      />

      <Grid container spacing={3}>
        {/* Product Image and Overview */}
        <Grid item xs={12} lg={7}>
          <InfoCard
            title={product.name}
            items={[]}
            headerColor={theme.palette.primary.light}
            rightContent={
              <Chip
                label={product.status}
                color={product.status === "Active" ? "success" : "default"}
                sx={{ ml: 2 }}
              />
            }
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img
                onError={(e: any) =>
                  (e.target.src = `${newUrl}/uploads/placeholder.png`)
                }
                src={`${newUrl}${product.imageUrl}`}
                alt="product"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: 300,
                  borderRadius: theme.shape.borderRadius,
                }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Description
              </Typography>
              <Typography variant="body2">{product.description}</Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {product.tags?.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    icon={<TagIcon />}
                  />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {product.keywords?.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </InfoCard>
        </Grid>

        {/* Product Pricing and Additional Information */}
        <Grid item xs={12} lg={5}>
          <Grid container spacing={3}>
            {/* Pricing Information */}
            <Grid item xs={12}>
              <InfoCard
                title="Pricing Information"
                items={[
                  {
                    label: "SKU",
                    value: product.sku,
                  },
                  {
                    label: "Cost",
                    value: `${product.currency} ${product.cost}`,
                  },
                  {
                    label: "Tax",
                    value: `${product.currency} ${product.tax}`,
                  },
                  {
                    label: "Total Cost",
                    value: `${product.currency} ${product.totalCost}`,
                  },
                ]}
                headerColor={theme.palette.primary.light}
              />
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <InfoCard
                title="Additional Information"
                items={[
                  {
                    label: "Category",
                    value: product.category,
                  },
                  {
                    label: "Purchase Type",
                    value: product.purchaseType,
                  },
                  ...(product.purchaseType === "subscription"
                    ? [
                        {
                          label: "Duration",
                          value: `${product.duration} months`,
                        },
                      ]
                    : []),
                  {
                    label: "Created On",
                    value: moment(product.createdAt).format("MMMM DD, YYYY"),
                  },
                ]}
                headerColor={theme.palette.primary.light}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this product? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setIsDeleteDialogOpen(false);
              handleDelete();
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ViewProduct;
