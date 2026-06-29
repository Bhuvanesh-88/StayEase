// components/owner/OwnerRoomManager.tsx
import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Property, Room, RoomType } from "../../types/models";
import {
  createRoom,
  deleteRoom,
  getRoomsByPropertyId,
  updateRoom,
} from "../../api/roomApi";

type Props = {
  property: Property;
  onRoomsUpdated?: () => void;
};

type RoomForm = {
  propertyId: number;
  roomType: RoomType;
  rent: number;
  totalCount: number;
  availableCount: number;
  description: string;
};

const defaultForm = (propertyId: number): RoomForm => ({
  propertyId,
  roomType: "SINGLE",
  rent: 0,
  totalCount: 1,
  availableCount: 1,
  description: "",
});

export default function OwnerRoomManager({ property, onRoomsUpdated }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<RoomForm>(
    defaultForm(property.propertyId)
  );
  const [editForm, setEditForm] = useState<RoomForm>(
    defaultForm(property.propertyId)
  );
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

  const totalAvailable = useMemo(() => {
    return rooms.reduce((sum, room) => sum + (room.availableCount || 0), 0);
  }, [rooms]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Loading rooms for property:", property.propertyId);
      const data = await getRoomsByPropertyId(property.propertyId);
      console.log("Loaded rooms:", data);
      setRooms(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error loading rooms:", err);
      setError(err?.response?.data?.message || "Failed to load rooms.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCreateForm(defaultForm(property.propertyId));
    setEditForm(defaultForm(property.propertyId));
    loadRooms();
  }, [property.propertyId]);

  const handleCreateChange = (name: keyof RoomForm, value: string | number) => {
    setCreateForm((prev) => {
      const updated = { ...prev };
      if (
        name === "rent" ||
        name === "totalCount" ||
        name === "availableCount"
      ) {
        updated[name] = Number(value);
      } else {
       (updated as any)[name] = value; 
      }
      return updated;
    });
  };

  const handleEditChange = (name: keyof RoomForm, value: string | number) => {
    setEditForm((prev) => {
      const updated = { ...prev };
      if (
        name === "rent" ||
        name === "totalCount" ||
        name === "availableCount"
      ) {
        updated[name] = Number(value);
      } else {
        (updated as any)[name] = value;
      }
      return updated;
    });
  };

  const validateForm = (form: RoomForm) => {
    if (!form.roomType) return "Room type is required.";
    if (!form.rent || form.rent <= 0) return "Rent must be greater than 0.";
    if (!form.totalCount || form.totalCount < 1)
      return "Total count must be at least 1.";
    return "";
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
    setCreateForm(defaultForm(property.propertyId));
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setEditingRoomId(null);
    setEditForm(defaultForm(property.propertyId));
  };

  const handleCreateRoom = async () => {
    const validation = validateForm(createForm);
    if (validation) {
      setError(validation);
      return;
    }
    try {
      setError("");
      console.log("Creating room with data:", createForm);
      await createRoom({
        propertyId: createForm.propertyId,
        roomType: createForm.roomType,
        rent: createForm.rent,
        totalCount: createForm.totalCount,
        availableCount: createForm.totalCount,
        description: createForm.description,
      });
      setSuccess("Room added successfully.");
      handleCloseCreate();
      await loadRooms();
      onRoomsUpdated?.();
    } catch (err: any) {
      console.error("Error creating room:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create room."
      );
    }
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoomId(room.roomId);
    setEditForm({
      propertyId: room.propertyId,
      roomType: room.roomType,
      rent: room.rent,
      totalCount: room.totalCount,
      availableCount: room.availableCount,
      description: room.description || "",
    });
    setOpenEdit(true);
  };

  const handleUpdateRoom = async () => {
    if (editingRoomId === null) return;
    const validation = validateForm(editForm);
    if (validation) {
      setError(validation);
      return;
    }
    try {
      setError("");
      console.log("Updating room:", editingRoomId, editForm);
      await updateRoom(editingRoomId, editForm);
      setSuccess("Room updated successfully.");
      handleCloseEdit();
      await loadRooms();
      onRoomsUpdated?.();
    } catch (err: any) {
      console.error("Error updating room:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update room."
      );
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this room?"
    );
    if (!confirmed) return;
    try {
      setError("");
      await deleteRoom(roomId);
      setSuccess("Room deleted successfully.");
      await loadRooms();
      onRoomsUpdated?.();
    } catch (err: any) {
      console.error("Error deleting room:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete room."
      );
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Room Management
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Add and manage room types for tenants to book.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <Chip label={`Total Rooms: ${rooms.length}`} />
          <Chip color="success" label={`Available: ${totalAvailable}`} />
          <Button
            variant="contained"
            onClick={() => setOpenCreate(true)}
            sx={{
              borderRadius: 2,
              bgcolor: "#00A699",
              "&:hover": { bgcolor: "#008875" },
            }}
          >
            + Add Room
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">Loading rooms...</Typography>
        </Box>
      ) : rooms.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" fontWeight={700}>
              No rooms added yet.
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Click "Add Room" to create your first room type.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={room.roomId}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid #ececec",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {room.roomType}
                      </Typography>
                      <Chip
                        size="small"
                        color={room.availableCount > 0 ? "success" : "default"}
                        label={
                          room.availableCount > 0 ? "Bookable" : "Full"
                        }
                      />
                    </Box>

                    <Box
                      sx={{
                        bgcolor: "#f5f5f5",
                        p: 2,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Daily Rent: <strong>₹{room.rent}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Total Rooms: <strong>{room.totalCount}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Available Now: <strong style={{ color: "#00A699" }}>
                          {room.availableCount}
                        </strong>
                      </Typography>
                    </Box>

                    {room.description && (
                      <Typography variant="body2">
                        {room.description}
                      </Typography>
                    )}

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        onClick={() => handleOpenEdit(room)}
                        sx={{
                          borderRadius: 2,
                          bgcolor: "#00A699",
                          "&:hover": { bgcolor: "#008875" },
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        size="small"
                        onClick={() => handleDeleteRoom(room.roomId)}
                        sx={{ borderRadius: 2 }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Room Dialog */}
      <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={700}>Add New Room</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              select
              label="Room Type"
              value={createForm.roomType}
              onChange={(e) => handleCreateChange("roomType", e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="SINGLE">Single</MenuItem>
              <MenuItem value="DOUBLE">Double</MenuItem>
              <MenuItem value="TRIPLE">Triple</MenuItem>
              <MenuItem value="DORM">Dorm</MenuItem>
            </TextField>

            <TextField
              label="Rent per Day (₹)"
              type="number"
              value={createForm.rent}
              onChange={(e) => handleCreateChange("rent", e.target.value)}
              fullWidth
              size="small"
              inputProps={{ min: "0", step: "100" }}
            />

            <TextField
              label="Total Number of Rooms"
              type="number"
              value={createForm.totalCount}
              onChange={(e) => handleCreateChange("totalCount", e.target.value)}
              fullWidth
              size="small"
              inputProps={{ min: "1" }}
            />

            <TextField
              label="Description (Optional)"
              multiline
              rows={2}
              value={createForm.description}
              onChange={(e) => handleCreateChange("description", e.target.value)}
              fullWidth
              size="small"
              placeholder="E.g., Spacious room with AC and WiFi"
            />

            <Alert severity="info" icon={false}>
              <Typography variant="body2">
                <strong>Note:</strong> Available rooms will automatically be set equal to the total count when created.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateRoom}
            sx={{
              borderRadius: 2,
              bgcolor: "#00A699",
              "&:hover": { bgcolor: "#008875" },
            }}
          >
            Create Room
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={700}>Edit Room</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              select
              label="Room Type"
              value={editForm.roomType}
              onChange={(e) => handleEditChange("roomType", e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="SINGLE">Single</MenuItem>
              <MenuItem value="DOUBLE">Double</MenuItem>
              <MenuItem value="TRIPLE">Triple</MenuItem>
              <MenuItem value="DORM">Dorm</MenuItem>
            </TextField>

            <TextField
              label="Rent per Day (₹)"
              type="number"
              value={editForm.rent}
              onChange={(e) => handleEditChange("rent", e.target.value)}
              fullWidth
              size="small"
              inputProps={{ min: "0", step: "100" }}
            />

            <TextField
              label="Total Number of Rooms"
              type="number"
              value={editForm.totalCount}
              onChange={(e) => handleEditChange("totalCount", e.target.value)}
              fullWidth
              size="small"
              inputProps={{ min: "1" }}
            />

            <TextField
              label="Currently Available"
              type="number"
              value={editForm.availableCount}
              onChange={(e) => handleEditChange("availableCount", e.target.value)}
              fullWidth
              size="small"
              inputProps={{ min: "0" }}
              helperText="Update this if availability has changed due to bookings"
            />

            <TextField
              label="Description (Optional)"
              multiline
              rows={2}
              value={editForm.description}
              onChange={(e) => handleEditChange("description", e.target.value)}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateRoom}
            sx={{
              borderRadius: 2,
              bgcolor: "#00A699",
              "&:hover": { bgcolor: "#008875" },
            }}
          >
            Update Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}