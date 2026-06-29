// pages/owner/ManageBookingsPage.tsx
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import { getOwnerBookings, updateBookingStatus, confirmBookingCancellation, rejectBookingCancellation } from "../../api/bookingApi";
import type { Booking, BookingStatus } from "../../types/models";
import { getAuthUser } from "../../utils/authStorage";

const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case "CONFIRMED":
      return "success";
    case "REJECTED":
      return "error";
    case "PENDING":
      return "warning";
    case "CANCELLED":
    default:
      return "default";
  }
};

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const user = getAuthUser();
      if (!user) {
        setError("Owner not logged in. Please login again.");
        return;
      }

      const data = await getOwnerBookings(user.userId);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load owner bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAction = async (bookingId: number, status: BookingStatus) => {
    try {
      setActionLoadingId(bookingId);
      setError("");
      setSuccess("");

      await updateBookingStatus(bookingId, status);

      setBookings((prev) =>
        prev.map((booking) =>
          booking.bookingId === bookingId
            ? {
                ...booking,
                status,
                confirmedOn:
                  status === "CONFIRMED" ? new Date().toISOString() : booking.confirmedOn,
              }
            : booking
        )
      );

      setSuccess(
        status === "CONFIRMED"
          ? "Booking confirmed successfully."
          : "Booking rejected successfully."
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update booking status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmCancellation = async (bookingId: number) => {
    try {
      setActionLoadingId(bookingId);
      await confirmBookingCancellation(bookingId);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.bookingId === bookingId
            ? { ...booking, status: "CANCELLED" as BookingStatus }
            : booking
        )
      );
      setSuccess("Cancellation confirmed. Booking cancelled.");
      setCancelDialogOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to confirm cancellation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectCancellation = async (bookingId: number) => {
    try {
      setActionLoadingId(bookingId);
      await rejectBookingCancellation(bookingId);
      await loadBookings();
      setSuccess("Cancellation request rejected.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reject cancellation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const hasCancellationRequest = (booking: Booking) => {
    return !!booking.cancellationRequestedAt;
  };

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const cancellationRequests = bookings.filter((b) => hasCancellationRequest(b));
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Manage Bookings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ minHeight: 300, display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={4}>
            {/* Pending Bookings */}
            {pendingBookings.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Pending Booking Requests ({pendingBookings.length})
                </Typography>
                <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f3f4f6" }}>
                        <TableCell><strong>Booking ID</strong></TableCell>
                        <TableCell><strong>Dates</strong></TableCell>
                        <TableCell><strong>Rent</strong></TableCell>
                        <TableCell><strong>Notes</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingBookings.map((booking) => {
                        const isProcessing = actionLoadingId === booking.bookingId;
                        return (
                          <TableRow key={booking.bookingId} hover>
                            <TableCell>{booking.bookingId}</TableCell>
                            <TableCell>{booking.startDate} to {booking.endDate}</TableCell>
                            <TableCell>₹{booking.totalAmount}</TableCell>
                            <TableCell>{booking.notes || "-"}</TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="success"
                                  disabled={isProcessing}
                                  onClick={() => handleAction(booking.bookingId, "CONFIRMED")}
                                  sx={{ borderRadius: 1 }}
                                >
                                  {isProcessing ? "..." : "Confirm"}
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  disabled={isProcessing}
                                  onClick={() => handleAction(booking.bookingId, "REJECTED")}
                                  sx={{ borderRadius: 1 }}
                                >
                                  Reject
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {/* Cancellation Requests */}
            {cancellationRequests.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: "#F59E0B" }}>
                  Cancellation Requests ({cancellationRequests.length})
                </Typography>
                <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#FFF7ED" }}>
                        <TableCell><strong>Booking ID</strong></TableCell>
                        <TableCell><strong>Dates</strong></TableCell>
                        <TableCell><strong>Reason</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cancellationRequests.map((booking) => {
                        const isProcessing = actionLoadingId === booking.bookingId;
                        return (
                          <TableRow key={booking.bookingId} hover>
                            <TableCell>{booking.bookingId}</TableCell>
                            <TableCell>{booking.startDate} to {booking.endDate}</TableCell>
                            <TableCell sx={{ maxWidth: 200, whiteSpace: "normal" }}>
                              {booking.cancellationReason}
                            </TableCell>
                            <TableCell>
                              <Chip label={booking.status} color={getStatusColor(booking.status) as any} size="small" />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="success"
                                  disabled={isProcessing}
                                  onClick={() => handleConfirmCancellation(booking.bookingId)}
                                  sx={{ borderRadius: 1 }}
                                >
                                  {isProcessing ? "..." : "Approve"}
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  disabled={isProcessing}
                                  onClick={() => handleRejectCancellation(booking.bookingId)}
                                  sx={{ borderRadius: 1 }}
                                >
                                  Deny
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {/* Confirmed Bookings */}
            {confirmedBookings.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: "#00A699" }}>
                  Confirmed Bookings ({confirmedBookings.length})
                </Typography>
                <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#ECFDF5" }}>
                        <TableCell><strong>Booking ID</strong></TableCell>
                        <TableCell><strong>Dates</strong></TableCell>
                        <TableCell><strong>Total</strong></TableCell>
                        <TableCell><strong>Confirmed On</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {confirmedBookings.map((booking) => (
                        <TableRow key={booking.bookingId} hover>
                          <TableCell>{booking.bookingId}</TableCell>
                          <TableCell>{booking.startDate} to {booking.endDate}</TableCell>
                          <TableCell>₹{booking.totalAmount}</TableCell>
                          <TableCell>{booking.confirmedOn ? new Date(booking.confirmedOn).toLocaleDateString() : "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {bookings.length === 0 && (
              <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                <Typography color="text.secondary">No bookings yet.</Typography>
              </Paper>
            )}
          </Stack>
        )}
      </Container>
    </MainLayout>
  );
}