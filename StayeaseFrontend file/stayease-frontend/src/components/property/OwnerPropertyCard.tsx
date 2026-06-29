// components/property/OwnerPropertyCard.tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import BedRoundedIcon from "@mui/icons-material/BedRounded";
import { useNavigate } from "react-router-dom";
import { deleteProperty } from "../../api/propertyApi";
import { getRoomsByPropertyId } from "../../api/roomApi";
import type { Property, Room } from "../../types/models";
import { formatCurrency } from "../../utils/formatters";
import { DEFAULT_PROPERTY_IMAGE } from "../../utils/constants";
import { useEffect, useMemo, useState } from "react";

interface Props {
  property: Property;
  onDeleted: (propertyId: number) => void;
}

export default function OwnerPropertyCard({ property, onDeleted }: Props) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setRoomsLoading(true);
        const data = await getRoomsByPropertyId(property.propertyId);
        setRooms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        setRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    };
    loadRooms();
  }, [property.propertyId]);

  const totalRooms = useMemo(
    () => rooms.reduce((sum, room) => sum + room.totalCount, 0),
    [rooms]
  );

  const availableRooms = useMemo(
    () => rooms.reduce((sum, room) => sum + room.availableCount, 0),
    [rooms]
  );

  let image = DEFAULT_PROPERTY_IMAGE;
  if (property.images && property.images.length > 0) {
    const firstImage = property.images[0];
    if (firstImage.imageData) {
      image = firstImage.imageData.startsWith("data:")
        ? firstImage.imageData
        : `data:${firstImage.fileType || "image/jpeg"};base64,${
            firstImage.imageData
          }`;
    }
  }

  const availabilityLabel =
    availableRooms > 0 ? `Available ${availableRooms}` : "Fully booked";
  const availabilityColor = availableRooms > 0 ? "success" : "default";

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteProperty(property.propertyId);
      onDeleted(property.propertyId);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete property", error);
      alert("Failed to delete property.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #ececec",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            height: 200,
            background: `url(${image}) center/cover`,
            position: "relative",
            backgroundColor: "#f0f0f0",
            flexShrink: 0,
          }}
        >
          <Chip
            label={property.propertyType}
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              bgcolor: "rgba(255,255,255,0.95)",
              fontWeight: 700,
            }}
          />
        </Box>

        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
              {property.title}
            </Typography>
            <Chip
              label={availabilityLabel}
              color={availabilityColor as any}
              size="small"
            />
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {property.city}, {property.state}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 42,
              flex: 1,
            }}
          >
            {property.description}
          </Typography>

          {/* Room Status */}
          {!roomsLoading && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.8 }}>
              <BedRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                {totalRooms} Total · {availableRooms} Available
              </Typography>
            </Stack>
          )}

          <Typography variant="h6" fontWeight={800} sx={{ mt: 2 }}>
            {formatCurrency(property.monthlyRent)}
            <Typography component="span" variant="body2" color="text.secondary">
              {" "}
              / month
            </Typography>
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: "auto", pt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<VisibilityRoundedIcon />}
              sx={{ borderRadius: 2 }}
              onClick={() => navigate(`/properties/${property.propertyId}`)}
            >
              View
            </Button>

            <Button
              fullWidth
              variant="contained"
              startIcon={<EditRoundedIcon />}
              sx={{
                borderRadius: 2,
                bgcolor: "#00A699",
                "&:hover": { bgcolor: "#008875" },
              }}
              onClick={() =>
                navigate(`/owner/edit-property/${property.propertyId}`)
              }
            >
              Edit
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineRoundedIcon />}
              sx={{ borderRadius: 2 }}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle fontWeight={700}>Delete property</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{property.title}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}