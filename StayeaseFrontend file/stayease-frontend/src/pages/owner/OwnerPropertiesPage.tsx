import { Box, Button, Collapse, Container, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";
import LoadingScreen from "../../components/common/LoadingScreen";
import MainLayout from "../../components/layout/MainLayout";
import OwnerRoomManager from "../../components/owner/OwnerRoomManager";
import OwnerPropertyCard from "../../components/property/OwnerPropertyCard";
import { useAuth } from "../../context/AuthContext";
import { getPropertiesByOwnerId } from "../../api/propertyApi";
import type { Property } from "../../types/models";

export default function OwnerPropertiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPropertyId, setOpenPropertyId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        if (!user) return;
        const data = await getPropertiesByOwnerId(user.userId);
        setProperties(data);
      } catch (error) {
        console.error("Failed to load owner properties", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  const toggleRooms = (propertyId: number) => {
    setOpenPropertyId((prev) => (prev === propertyId ? null : propertyId));
  };

  const handleDeleted = (propertyId: number) => {
    setProperties((prev) => prev.filter((p) => p.propertyId !== propertyId));
    if (openPropertyId === propertyId) setOpenPropertyId(null);
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={4}
        >
          <Box>
            <Typography variant="h4" fontWeight={800}>
              My Properties
            </Typography>
            <Typography color="text.secondary">
              Manage listings, images, rooms, edit details, and live availability.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate("/owner/add-property")}
            sx={{
              borderRadius: 999,
              bgcolor: "#00A699",
              "&:hover": { bgcolor: "#008875" },
            }}
          >
            Add Property
          </Button>
        </Stack>

        {loading ? (
          <LoadingScreen />
        ) : properties.length === 0 ? (
          <EmptyState
            title="No properties yet"
            description="Create your first listing to start receiving booking requests."
            actionLabel="Add Property"
            onAction={() => navigate("/owner/add-property")}
          />
        ) : (
          <Stack spacing={4}>
            {properties.map((property) => (
              <Box
                key={property.propertyId}
                sx={{
                  p: 2,
                  borderRadius: 5,
                  border: "1px solid #ececec",
                  bgcolor: "#fff",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                }}
              >
                <OwnerPropertyCard property={property} onDeleted={handleDeleted} />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => toggleRooms(property.propertyId)}
                    sx={{
                      borderRadius: 999,
                      bgcolor: "#00A699",
                      "&:hover": { bgcolor: "#008875" },
                    }}
                  >
                    {openPropertyId === property.propertyId ? "Hide Rooms" : "Manage Rooms"}
                  </Button>
                </Stack>
                <Collapse in={openPropertyId === property.propertyId}>
                  <OwnerRoomManager property={property} />
                </Collapse>
              </Box>
            ))}
          </Stack>
        )}
      </Container>
    </MainLayout>
  );
}