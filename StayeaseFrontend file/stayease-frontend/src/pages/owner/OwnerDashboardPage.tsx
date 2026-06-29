// pages/owner/OwnerDashboardPage.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import { getBookingDashboard, getPropertyDashboard } from "../../api/dashboardApi";
import { getAuthUser } from "../../utils/authStorage";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

export default function OwnerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [propertyCount, setPropertyCount] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    rejectedBookings: 0,
    cancelledBookings: 0,
    cancellationRequests: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      console.log("Attempting to load dashboard..."); // DEBUG LOG
       const user = getAuthUser();
    console.log("Current User:", user); // DEBUG LOG
    if (!user) {
      console.warn("No user found, aborting API call");
      return;
    }
      try {
        setLoading(true);
        const user = getAuthUser();
        if (!user) return;

        const [propertyStats, bookings] = await Promise.all([
          getPropertyDashboard(user.userId),
          getBookingDashboard(user.userId),
        ]);

        setPropertyCount(propertyStats.totalProperties);
        setTotalRooms(propertyStats.totalRooms);
        setAvailableRooms(propertyStats.availableRooms);
        setBookingStats({
          totalBookings: bookings.totalBookings,
          pendingBookings: bookings.pendingBookings,
          confirmedBookings: bookings.confirmedBookings,
          rejectedBookings: bookings.rejectedBookings,
          cancelledBookings: bookings.cancelledBookings,
          cancellationRequests: bookings.cancellationRequests || 0,
        });
      } catch (error) {
        console.error("Failed to load dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const chartData = [
    { name: "Confirmed", value: bookingStats.confirmedBookings, color: "#00A699" },
    { name: "Pending", value: bookingStats.pendingBookings, color: "#FFA500" },
    { name: "Rejected", value: bookingStats.rejectedBookings, color: "#FF6B6B" },
    { name: "Cancelled", value: bookingStats.cancelledBookings, color: "#808080" },
  ].filter((item) => item.value > 0);

  const statCards = [
    { label: "My Properties", value: propertyCount, color: "#00A699" },
    { label: "Total Rooms", value: totalRooms, color: "#0084D4" },
    { label: "Available Rooms", value: availableRooms, color: "#10B981" },
    { label: "Cancellation Requests", value: bookingStats.cancellationRequests, color: "#F59E0B" },
  ];

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h4" fontWeight={800} mb={4}>
          Owner Dashboard
        </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} mb={4}>
          {statCards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" fontWeight={600}>
                    {card.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{ mt: 1, color: card.color }}
                  >
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Booking Statistics Section */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Booking Status Distribution
                </Typography>
                {chartData.length > 0 ? (
                  <Box sx={{ height: 300, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name} (${value})`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} bookings`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    No booking data available yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Summary Stats */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,0.07)", height: "100%" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={3}>
                  Booking Summary
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    {
                      label: "Total Bookings",
                      value: bookingStats.totalBookings,
                      color: "#1F2937",
                    },
                    {
                      label: "Confirmed",
                      value: bookingStats.confirmedBookings,
                      color: "#00A699",
                    },
                    {
                      label: "Pending",
                      value: bookingStats.pendingBookings,
                      color: "#FFA500",
                    },
                    {
                      label: "Rejected",
                      value: bookingStats.rejectedBookings,
                      color: "#FF6B6B",
                    },
                    {
                      label: "Cancelled",
                      value: bookingStats.cancelledBookings,
                      color: "#808080",
                    },
                  ].map((stat) => (
                    <Box
                      key={stat.label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        pb: 1.5,
                        borderBottom: "1px solid #E5E7EB",
                      }}
                    >
                      <Typography color="text.secondary">{stat.label}</Typography>
                      <Typography fontWeight={700} sx={{ color: stat.color, fontSize: "1.2rem" }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
}