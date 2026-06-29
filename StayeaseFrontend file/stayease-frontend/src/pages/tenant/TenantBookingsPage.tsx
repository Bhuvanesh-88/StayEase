// pages/tenant/TenantBookingsPage.tsx
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import { getTenantBookings, updateBookingStatus, requestBookingCancellation } from "../../api/bookingApi";
import { getAuthUser } from "../../utils/authStorage";
import { formatCurrency, formatDate } from "../../utils/formatters";
import type { Booking, BookingStatus } from "../../types/models";

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

function BookingStatusChip({ status }: { status: BookingStatus }) {
  return <Chip label={status} color={getStatusColor(status) as any} size="small" />;
}

export default function TenantBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const user = getAuthUser();
        if (!user) return;
        const data = await getTenantBookings(user.userId);
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch tenant bookings", error);
        setError("Failed to fetch bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleOpenCancelDialog = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedBookingId(null);
    setCancelReason("");
  };

  const handleRequestCancellation = async () => {
    if (!selectedBookingId) return;
    if (!cancelReason.trim()) {
      setError("Please provide a reason for cancellation.");
      return;
    }

    try {
      setActionId(selectedBookingId);
      await requestBookingCancellation(selectedBookingId, cancelReason);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.bookingId === selectedBookingId
            ? {
                ...booking,
                cancellationRequestedAt: new Date().toISOString(),
                cancellationReason: cancelReason,
              }
            : booking
        )
      );
      setError("");
      handleCloseCancelDialog();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to request cancellation.");
    } finally {
      setActionId(null);
    }
  };

  const handleCancelDirect = async (bookingId: number) => {
    try {
      setActionId(bookingId);
      await updateBookingStatus(bookingId, "CANCELLED");
      setBookings((prev) =>
        prev.map((booking) =>
          booking.bookingId === bookingId ? { ...booking, status: "CANCELLED" } : booking
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setActionId(null);
    }
  };

  const canRequestCancellation = (booking: Booking) => {
    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") return false;
    if (booking.cancellationRequestedAt) return false;
    return true;
  };

  const hasCancellationRequest = (booking: Booking) => {
    return !!booking.cancellationRequestedAt;
  };

  if (loading) {
    return (
      <MainLayout>
        <Container sx={{ py: 5 }}>
          <Typography textAlign="center">Loading your bookings...</Typography>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container sx={{ py: 5 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800}>
            My Bookings
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Track, review, and manage your booking requests.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {bookings.length === 0 ? (
          <Card sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
            <Typography color="text.secondary" mb={1}>
              No bookings found.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start exploring properties and make your first booking.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {bookings.map((booking) => {
              const isPending = booking.status === "PENDING";
              const isConfirmed = booking.status === "CONFIRMED";
              const isProcessing = actionId === booking.bookingId;
              const canCancel = canRequestCancellation(booking);
              const hasPendingCancel = hasCancellationRequest(booking);

              return (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={booking.bookingId}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: "1px solid #e5e7eb",
                      height: "100%",
                      transition: "all 0.3s",
                      "&:hover": { boxShadow: "0 12px 24px rgba(0,0,0,0.08)" },
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Box>
                            <Typography variant="h6" fontWeight={700}>
                              Booking #{booking.bookingId}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Room ID {booking.roomId}
                            </Typography>
                          </Box>
                          <BookingStatusChip status={booking.status} />
                        </Box>

                        <Divider />

                        <Typography variant="body2">
                          <strong>Stay:</strong> {booking.startDate} to {booking.endDate}
                        </Typography>

                        <Typography variant="body2">
                          <strong>Notes:</strong> {booking.notes || "-"}
                        </Typography>

                        <Typography variant="body2">
                          <strong>Requested on:</strong> {formatDate(booking.requestedOn || "")}
                        </Typography>

                        {booking.confirmedOn && (
                          <Typography variant="body2">
                            <strong>Confirmed on:</strong> {formatDate(booking.confirmedOn)}
                          </Typography>
                        )}

                        {booking.dailyRent !== undefined && (
                          <Typography variant="body2">
                            <strong>Daily rent:</strong> {formatCurrency(booking.dailyRent)}
                          </Typography>
                        )}

                        {booking.numberOfDays !== undefined && (
                          <Typography variant="body2">
                            <strong>Days:</strong> {booking.numberOfDays}
                          </Typography>
                        )}

                        {booking.totalAmount !== undefined && (
                          <Typography variant="body2" fontWeight={800}>
                            <strong>Total:</strong> {formatCurrency(booking.totalAmount)}
                          </Typography>
                        )}

                        {hasPendingCancel && (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              Cancellation Requested
                            </Typography>
                            <Typography variant="caption">
                              {booking.cancellationReason}
                            </Typography>
                          </Alert>
                        )}

                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          {canCancel && (
                            <Button
                              variant="outlined"
                              color="error"
                              fullWidth
                              onClick={() => handleOpenCancelDialog(booking.bookingId)}
                              disabled={isProcessing}
                              sx={{ borderRadius: 2 }}
                            >
                              Request Cancellation
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Cancellation Request Dialog */}
        <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog} fullWidth maxWidth="sm">
          <DialogTitle>Request Booking Cancellation</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please provide a reason for your cancellation request. The property owner will review and confirm.
            </Typography>
            <TextField
              label="Cancellation Reason"
              multiline
              rows={4}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              fullWidth
              placeholder="E.g., Personal emergency, Change of plans, etc."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCancelDialog}>Keep Booking</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRequestCancellation}
              disabled={!cancelReason.trim() || actionId !== null}
            >
              {actionId ? "Requesting..." : "Request Cancellation"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}