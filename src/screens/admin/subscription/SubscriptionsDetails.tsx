import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../../../shared/utils/endPointNames";
import PageHeader from "../../../shared/components/PageHeader";
import InfoCard from "../../../shared/components/InfoCard";
import DataTable, { Column } from "../../../shared/components/DataTable";
import {
  Box,
  Grid,
  Typography,
  Chip,
  useTheme,
} from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";

function SubscriptionDetails() {
  const [auth] = useAuth();
  const { id } = useParams();
  const theme = useTheme();
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  useEffect(() => {
    if (auth?.token && id) {
      axios
        .get(`${BASE_URL}/subscription/getSubscriptionById/${id}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then((res) => {
          setSubscriptionInfo(res.data);
        })
        .catch((error) => console.error("Error fetching subscription:", error));
    }
  }, [auth, id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "sent":
        return "warning";
      case "active":
        return "success";
      case "inactive":
        return "default";
      default:
        return "error";
    }
  };

  const productColumns: Column<any>[] = [
    {
      id: 'product',
      label: 'Product',
      format: (value) => (
        <Box>
          <Typography variant="subtitle2">{value?.productId?.sku || 'N/A'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {value?.productId?.name || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'originalCost',
      label: 'Original Cost',
      align: 'right',
      format: (value) => `${subscriptionInfo?.grandTotalCurrency || ''} ${value?.productId?.cost || 0}`,
    },
    {
      id: 'modifiedCost',
      label: 'Modified Cost',
      align: 'right',
      format: (value) => `${subscriptionInfo?.grandTotalCurrency || ''} ${value?.newTotalCost || 0}`,
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
      format: (value) => `${value?.discount || 0} ${value?.discountType || 'N/A'}`,
    },
    {
      id: 'tax',
      label: 'Tax',
      align: 'right',
      format: (value) => `${value?.newTax || 0}%`,
    },
    {
      id: 'totalCost',
      label: 'Total Cost With Tax',
      align: 'right',
      format: (value) => `${subscriptionInfo?.grandTotalCurrency || ''} ${value?.newTotalCostWithTax || 0}`,
    },
  ];

  const paymentColumns: Column<any>[] = [
    {
      id: 'amount',
      label: 'Amount',
      format: (value) => `${value?.currency || ''} ${value?.amount || 0}`,
    },
    {
      id: 'createdAt',
      label: 'Payment Date',
      format: (value) => value ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour12: true,
      }) : 'N/A',
    },
    {
      id: 'paymentMethod',
      label: 'Payment Method',
      format: (value) => value || 'N/A',
    },
    {
      id: 'status',
      label: 'Status',
      format: (value) => (
        <Chip
          label={value || 'N/A'}
          color={
            value === "completed"
              ? "success"
              : value === "pending"
              ? "warning"
              : "error"
          }
          size="small"
        />
      ),
    },
    {
      id: 'stripeSubscriptionId',
      label: 'Stripe Subscription ID',
      format: (value) => value || "N/A",
    },
    {
      id: 'stripePaymentIntentId',
      label: 'Stripe Payment Intent ID',
      format: (value) => value || "N/A",
    },
    {
      id: 'stripeCustomerId',
      label: 'Stripe Customer ID',
      format: (value) => value || "N/A",
    },
  ];

  if (!subscriptionInfo) {
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
        title="Subscription Details"
        showBackButton
        backUrl="/admin-dashboard/subscriptions"
      />

      <Grid container spacing={3}>
        {/* Subscription Information */}
        <Grid item xs={12}>
          <InfoCard
            title={`Subscription ID: ${subscriptionInfo.subscriptionId || "N/A"}`}
            items={[]}
            headerColor={theme.palette.primary.light}
            rightContent={
              <Chip
                label={subscriptionInfo.subscriptionStatus}
                color={getStatusColor(subscriptionInfo.subscriptionStatus)}
                sx={{ ml: 2 }}
              />
            }
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Account Owner
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountCircleIcon color="primary" />
                    <Typography>
                      {`${subscriptionInfo.customer?.name} (${subscriptionInfo.customer?.email})`}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Business Owner
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="primary" />
                    <Typography>
                      {`${subscriptionInfo.customer?.businessDetails.clientName} (${subscriptionInfo.customer?.businessDetails.ownerEmail})`}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoneyIcon color="primary" />
                    <Typography>
                      <strong>Total Amount:</strong>{" "}
                      {`${subscriptionInfo.grandTotalCurrency} ${subscriptionInfo.finalAmount}`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartIcon color="primary" />
                    <Typography>
                      <strong>Total Products:</strong> {subscriptionInfo.products.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" />
                    <Typography>
                      <strong>Duration:</strong> {subscriptionInfo.subscriptionDurationInMonths} Months
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </InfoCard>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12}>
          <InfoCard
            title="Product Details"
            items={[]}
            headerColor={theme.palette.primary.light}
          >
            <DataTable
              columns={productColumns}
              data={subscriptionInfo?.products || []}
              emptyMessage="No products found"
            />
          </InfoCard>
        </Grid>

        {/* Payment Details */}
        <Grid item xs={12}>
          <InfoCard
            title="Payment Details"
            items={[]}
            headerColor={theme.palette.primary.light}
          >
            <DataTable
              columns={paymentColumns}
              data={subscriptionInfo?.paymentHistory || []}
              emptyMessage="No payment details available"
            />
          </InfoCard>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SubscriptionDetails;
