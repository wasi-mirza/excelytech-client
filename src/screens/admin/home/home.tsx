import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getOpenTicketsByPriority,
  getMonthlyRevenue,
  getSubscriptionStats,
} from "../../../shared/api/endpoints/home";
import {
  OpenTicketsByPriority,
  SubscriptionStats,
} from "../../../shared/api/types/home.types";
import {
  Box,
  Grid,
  Typography,
  Container,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import StatCard from "../../../shared/components/DashboardCardComponent";
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  ConfirmationNumber as TicketIcon,
} from "@mui/icons-material";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageHeader from "../../../shared/components/PageHeader";

interface SubscriptionDataItem {
  name: string;
  value: number;
}

interface TicketDataItem {
  name: string;
  value: number;
}

interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

interface TopClientData {
  name: string;
  revenue: number;
}

function AdminHome() {
  const [auth] = useAuth();
  const theme = useTheme();
  const [subscriptionStats, setSubscriptionStats] =
    useState<SubscriptionStats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null);
  const [ticketsByPriority, setTicketsByPriority] =
    useState<OpenTicketsByPriority | null>(null);

  // Mock data for monthly revenue trend
  const monthlyRevenueData: MonthlyRevenueData[] = [
    { month: "Jan", revenue: 15000 },
    { month: "Feb", revenue: 18000 },
    { month: "Mar", revenue: 22000 },
    { month: "Apr", revenue: 25000 },
    { month: "May", revenue: 28000 },
    { month: "Jun", revenue: 30000 },
    { month: "Jul", revenue: 32000 },
    { month: "Aug", revenue: 34000 },
    { month: "Sep", revenue: 36000 },
    { month: "Oct", revenue: 38000 },
    { month: "Nov", revenue: 40000 },
    { month: "Dec", revenue: 42000 },
  ];

  const fetchOpenTicketsByPriority = async () => {
    try {
      const response = await getOpenTicketsByPriority();
      if (response.status === 200) {
        setTicketsByPriority(response.data);
      }
    } catch (error) {
      console.error("Error fetching open tickets by priority:", error);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      const response = await getMonthlyRevenue({
        year,
        month,
      });

      console.log(response);
      if (response.status === 200 || response.status === 201) {
        setMonthlyRevenue(response?.data?.monthlyRevenue);
      } else {
        console.warn("Unexpected status for monthly revenue:", response.status);
        setMonthlyRevenue(null);
      }
    } catch (activeError) {
      console.error("Error fetching monthly revenue:", activeError);
      setMonthlyRevenue(null);
    }
  };

  const fetchsubscriptionStats = async () => {
    try {
      const response = await getSubscriptionStats();

      if (response.status === 200 || response.status === 201) {
        setSubscriptionStats(response.data);
      } else {
        console.warn(
          "Unexpected status for active subscriptions:",
          response.status
        );
        setSubscriptionStats(null);
      }
    } catch (activeError) {
      console.error("Error fetching active subscriptions:", activeError);
      setSubscriptionStats(null);
    }
  };

  useEffect(() => {
    fetchsubscriptionStats();
    fetchMonthlyRevenue();
    fetchOpenTicketsByPriority();
  }, [auth]);

  const subscriptionData: SubscriptionDataItem[] = subscriptionStats
    ? [
        { name: "Active", value: subscriptionStats.active },
        { name: "Expired", value: subscriptionStats.expired },
        { name: "Processing", value: subscriptionStats.processing },
        { name: "Inactive", value: subscriptionStats.inactive },
        { name: "Cancelled", value: subscriptionStats.cancelled },
      ]
    : [];
  
  console.log("subscriptionData",subscriptionData);

  const ticketData: TicketDataItem[] = ticketsByPriority?.openTicketsByPriority.map((ticket) => ({
    name: ticket._id,
    value: ticket.count,
  })) || [];

  const pieChartOptions: ApexOptions = {
    chart: {
      type: "donut",
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    labels: subscriptionData.map((item) => item.name),
    colors: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF0000"],
    legend: {
      position: "bottom",
      fontSize: "14px",
      markers: {
        size: 12,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "22px",
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: "16px",
              fontWeight: 400,
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "16px",
              fontWeight: 600,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
  };

  const barChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      animations: {
        enabled: true,
        speed: 800,
      },
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: "55%",
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ticketData.map((item) => item.name),
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Number of Tickets",
      },
    },
    fill: {
      opacity: 1,
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.25,
        gradientToColors: undefined,
        inverseColors: false,
        opacityFrom: 0.85,
        opacityTo: 0.85,
        stops: [0, 100],
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " tickets";
        },
      },
    },
  };

  const monthlyRevenueChartOptions: ApexOptions = {
    chart: {
      type: "area",
      animations: {
        enabled: true,
        speed: 800,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: monthlyRevenueData.map((item) => item.month),
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Revenue ($)",
      },
      labels: {
        formatter: (value) => `$${value.toLocaleString()}`,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toLocaleString()}`,
      },
    },
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader 
      title="Dashboard" />

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Subscriptions"
            value={subscriptionStats?.active || 0}
            icon={<PeopleIcon />}
            bgColor={alpha(theme.palette.success.main, 0.1)}
            iconColor={theme.palette.success.main}
            sx={{
              height: 180,
              width: '100%',
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={`$${monthlyRevenue?.toLocaleString() || 0}`}
            icon={<TrendingUpIcon />}
            bgColor={alpha(theme.palette.info.main, 0.1)}
            iconColor={theme.palette.info.main}
            sx={{
              height: 180,
              width: '100%',
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Top Clients"
            value="5"
            icon={<StarIcon />}
            bgColor={alpha(theme.palette.warning.main, 0.1)}
            iconColor={theme.palette.warning.main}
            sx={{
              height: 180,
              width: '100%',
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open Tickets"
            value={ticketsByPriority?.totalOpenTickets || 0}
            icon={<TicketIcon />}
            bgColor={alpha(theme.palette.error.main, 0.1)}
            iconColor={theme.palette.error.main}
            sx={{
              height: 180,
              width: '100%',
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Monthly Revenue Trend */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Monthly Revenue Trend
            </Typography>
            <Box sx={{ height: 400 }}>
              <ReactApexChart
                options={monthlyRevenueChartOptions}
                series={[
                  {
                    name: "Revenue",
                    data: monthlyRevenueData.map((item) => item.revenue),
                  },
                ]}
                type="area"
                height="100%"
              />
            </Box>
          </Paper>
        </Grid>


        {/* Subscription Distribution */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Subscription Distribution
            </Typography>
            <Box sx={{ height: 400 }}>
              <ReactApexChart
                options={pieChartOptions}
                series={subscriptionData.map((item) => item.value)}
                type="donut"
                height="100%"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Tickets by Priority */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Tickets by Priority
            </Typography>
            <Box sx={{ height: 400 }}>
              <ReactApexChart
                options={barChartOptions}
                series={[
                  {
                    name: "Tickets",
                    data: ticketData.map((item) => item.value),
                  },
                ]}
                type="bar"
                height="100%"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Subscription Details */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Subscription Management
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Active vs. Expired Subscriptions
                  </Typography>
                  <Typography>
                    Active: {subscriptionStats?.active || 0}, Expired:{" "}
                    {subscriptionStats?.expired || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Processing vs. Inactive Subscriptions
                  </Typography>
                  <Typography>
                    Processing: {subscriptionStats?.processing || 0}, Inactive:{" "}
                    {subscriptionStats?.inactive || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Cancelled Subscriptions
                  </Typography>
                  <Typography>{subscriptionStats?.cancelled || 0}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminHome;
