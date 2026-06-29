import Grid from "@mui/material/Grid";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import PropertyGallery from "../../components/property/PropertyGallery";
import { getPropertyById } from "../../api/propertyApi";
import { createBooking } from "../../api/bookingApi";
import { getAuthUser } from "../../utils/authStorage";
import { formatCurrency } from "../../utils/formatters";
import type { PropertyDetails } from "../../types/models";
import WifiIcon from "@mui/icons-material/Wifi";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import PoolIcon from "@mui/icons-material/Pool";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import SecurityIcon from "@mui/icons-material/Security";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import KitchenIcon from "@mui/icons-material/Kitchen";
import BalconyIcon from "@mui/icons-material/Balcony";
import YardIcon from "@mui/icons-material/Yard";
import GroupsIcon from "@mui/icons-material/Groups";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import FoundationIcon from "@mui/icons-material/Foundation";
import DryCleaningIcon from "@mui/icons-material/DryCleaning";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import TvIcon from "@mui/icons-material/Tv";
import LockIcon from "@mui/icons-material/Lock";
import EventIcon from "@mui/icons-material/Event";


const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "WiFi": <WifiIcon />,
  "AC": <AcUnitIcon />,
  "Parking": <LocalParkingIcon />,
  "Pool": <PoolIcon />,
  "Power Backup": <BatteryChargingFullIcon />,
  "Security": <SecurityIcon />,
  "24/7 Security": <SecurityIcon />,
  "Gym": <FitnessCenterIcon />,
  "Kitchen": <KitchenIcon />,
  "Kitchen Facility": <KitchenIcon />,
  "Balcony": <BalconyIcon />,
  "Garden": <YardIcon />,
  "Community Hall": <GroupsIcon />,
  "Water Tank": <WaterDropIcon />,
  "Water Purifier": <WaterDropIcon />,
  "Furnished": <FoundationIcon />,
  "Laundry": <DryCleaningIcon />,
  "Meals Included": <FastfoodIcon />,
  "TV": <TvIcon />,
  "Lockers": <LockIcon />,
  "Events": <EventIcon />,
};

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState<PropertyDetails | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [dailyRate, setDailyRate] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [totalBill, setTotalBill] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError("Property ID is missing");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getPropertyById(Number(id));
        setDetails(data);
        setError("");
      } catch (err: any) {
        console.error("Error fetching property:", err);
        setError(err?.response?.data?.message || "Failed to fetch property details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const availableRooms = useMemo(
    () => details?.rooms?.filter((room) => room.availableCount > 0) ?? [],
    [details]
  );

  useEffect(() => {
    if (!startDate || !endDate || !selectedRoomId) {
      setDailyRate(0);
      setNumberOfDays(0);
      setTotalBill(0);
      return;
    }

    const room = details?.rooms?.find((r) => r.roomId === selectedRoomId);
    if (!room) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (days > 0) {
      setDailyRate(room.rent);
      setNumberOfDays(days);
      setTotalBill(room.rent * days);
    } else {
      setDailyRate(0);
      setNumberOfDays(0);
      setTotalBill(0);
    }
  }, [startDate, endDate, selectedRoomId, details]);

  const askLogin = () => {
    navigate("/login", { state: { from: { pathname: `/properties/${id}` } } });
  };

  const handleOpenBooking = () => {
    const user = getAuthUser();

    if (!user) {
      setError("Please login first to book this property.");
      askLogin();
      return;
    }

    if (user.role !== "TENANT") {
      setError("Only tenants can create bookings.");
      return;
    }

    setError("");
    setOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!details) return;

    const user = getAuthUser();
    if (!user) {
      setError("Please login first.");
      askLogin();
      return;
    }

    if (user.role !== "TENANT") {
      setError("Only tenants can create bookings.");
      return;
    }

    if (!selectedRoomId) {
      setError("Please select a room.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select start and end dates.");
      return;
    }

    try {
      await createBooking({
        roomId: Number(selectedRoomId),
        tenantId: user.userId,
        ownerId: details.property.ownerId,
        startDate,
        endDate,
        notes,
      });

      setOpen(false);
      setSelectedRoomId("");
      setStartDate("");
      setEndDate("");
      setNotes("");
      setError("");
      alert("Booking request sent successfully!");
      navigate("/tenant/bookings");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send booking request.");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Container sx={{ py: 8 }}>
          <Typography textAlign="center">Loading property details...</Typography>
        </Container>
      </MainLayout>
    );
  }

  if (!details) {
    return (
      <MainLayout>
        <Container sx={{ py: 8 }}>
          <Alert severity="error">{error || "Property not found"}</Alert>
        </Container>
      </MainLayout>
    );
  }

  const { property, rooms } = details;

  return (
    <MainLayout>
      <Container sx={{ py: 5 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ mb: 5 }}>
          <PropertyGallery images={property.images || []} />
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box>
                    <Typography variant="h4" fontWeight={800}>
                      {property.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      {property.city}, {property.state}
                    </Typography>
                  </Box>
                </Stack>

                <Typography sx={{ mt: 2 }}>{property.description}</Typography>
              </Box>

              <Divider />

              <Box sx={{ mb: 4 }}>
  <Typography variant="h6" fontWeight={700} mb={2.5}>
    Facilities & Amenities
  </Typography>
  
  {/* Standard Grid2 container */}
  <Grid container spacing={3}>
    {property?.amenities && property.amenities.length > 0 ? (
      property.amenities.map((amenity: string) => (
        /* Note: No 'item' prop here. 'size' replaces 'xs' and 'sm' */
        <Grid size={{ xs: 6, sm: 4 }} key={amenity}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box 
              sx={{ 
                display: 'flex', 
                p: 1, 
                borderRadius: 2, 
                bgcolor: 'rgba(0, 166, 153, 0.08)', 
                color: 'primary.main' 
              }}
            >
              {AMENITY_ICONS[amenity] || <WifiIcon />}
            </Box>
            <Typography variant="body2" fontWeight={500}>
              {amenity}
            </Typography>
          </Stack>
        </Grid>
      ))
    ) : (
      <Typography color="text.secondary" sx={{ ml: 2 }}>
        No facilities listed
      </Typography>
    )}
  </Grid>
</Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  Available Rooms
                </Typography>
                <Stack spacing={1.5}>
                  {rooms && rooms.length > 0 ? (
                    rooms.map((room) => (
                      <Card key={room.roomId} sx={{ borderRadius: 3, border: "1px solid #e5e7eb" }}>
                        <CardContent>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Box>
                              <Typography fontWeight={700}>{room.roomType}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {room.description || "Comfortable room option"}
                              </Typography>
                            </Box>
                            <Box textAlign={{ xs: "left", sm: "right" }}>
                              <Typography fontWeight={800}>{formatCurrency(room.rent)} / day</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {room.availableCount} available
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography color="text.secondary">No rooms available</Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ borderRadius: 4, border: "1px solid #ececec", position: "sticky", top: 90 }}>
              <CardContent>
                <Typography variant="h5" fontWeight={800} sx={{ color: "#00A699" }}>
                  {formatCurrency(property.monthlyRent)}
                  <Typography component="span" color="text.secondary" sx={{ fontWeight: 400 }}>
                    {" "} / month starting
                  </Typography>
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 1.2 }}>
                  Explore freely. Booking requires tenant login.
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    borderRadius: 999,
                    minHeight: 46,
                    bgcolor: "#00A699",
                    "&:hover": { bgcolor: "#008875" },
                  }}
                  onClick={handleOpenBooking}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Book Property</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Select Room Type</InputLabel>
                <Select
                  value={selectedRoomId}
                  label="Select Room Type"
                  onChange={(e) => {
                    setSelectedRoomId(Number(e.target.value));
                    setError("");
                  }}
                >
                  {availableRooms.map((room) => (
                    <MenuItem key={room.roomId} value={room.roomId}>
                      {room.roomType} - {formatCurrency(room.rent)}/day - {room.availableCount} available
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Check-in Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
              />

              <TextField
                label="Check-out Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                inputProps={{ min: startDate }}
              />

              <TextField
                label="Notes or Special Requests"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                placeholder="E.g., Early check-in needed"
              />

              {numberOfDays > 0 && dailyRate > 0 && (
                <Card sx={{ bgcolor: "#f8fafc", border: "1px solid #e5e7eb" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      Billing Summary
                    </Typography>
                    <Stack spacing={0.5}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>Daily rent:</Typography>
                        <Typography fontWeight={600}>{formatCurrency(dailyRate)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>Days:</Typography>
                        <Typography fontWeight={600}>{numberOfDays}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography fontWeight={700}>Total:</Typography>
                        <Typography fontWeight={800} sx={{ color: "#00A699", fontSize: "1.1rem" }}>
                          {formatCurrency(totalBill)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleBookingSubmit}
              sx={{ bgcolor: "#00A699", "&:hover": { bgcolor: "#008875" } }}
            >
              Send Booking Request
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}