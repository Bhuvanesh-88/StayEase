import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import EmptyState from "../../components/common/EmptyState";
import PropertyCardSkeleton from "../../components/common/PropertyCardSkeleton";
import PropertyCard from "../../components/property/PropertyCard";
import type { Property } from "../../types/models";
import { getAllProperties } from "../../api/propertyApi";

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [maxRent, setMaxRent] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await getAllProperties();
        setProperties(data);
        setFilteredProperties(data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleFilter = () => {
    let updated = [...properties];

    if (city.trim()) {
      updated = updated.filter((p) =>
        p.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (propertyType) {
      updated = updated.filter((p) => p.propertyType === propertyType);
    }

    if (maxRent) {
      updated = updated.filter((p) => p.monthlyRent <= Number(maxRent));
    }

    setFilteredProperties(updated);
  };

  const handleReset = () => {
    setCity("");
    setPropertyType("");
    setMaxRent("");
    setFilteredProperties(properties);
  };

  return (
    <MainLayout>
      <Box sx={{ background: "linear-gradient(180deg, #f0fffe 0%, #ffffff 100%)", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight={800} sx={{ color: "#111827" }}>
            Find your perfect stay
          </Typography>

          <Box sx={{ mt: 4, p: 3, borderRadius: 6, bgcolor: "#fff", border: "1px solid #e5e7eb" }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <TextField 
                label="City" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                fullWidth 
              />

              <TextField
                select
                label="Property Type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                fullWidth
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="PG">PG</MenuItem>
                <MenuItem value="HOSTEL">Hostel</MenuItem>
                <MenuItem value="APARTMENT">Apartment</MenuItem>
              </TextField>

              <TextField
                label="Max Rent (₹)"
                type="number"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                fullWidth
              />

              <Button 
                variant="contained" 
                onClick={handleFilter} 
                sx={{ 
                  minHeight: 56, 
                  px: 5, 
                  borderRadius: 999, 
                  bgcolor: "#00A699",
                  "&:hover": { bgcolor: "#008875" }
                }}
              >
                Search
              </Button>

              <Button 
                variant="outlined" 
                onClick={handleReset} 
                sx={{ 
                  minHeight: 56, 
                  px: 4, 
                  borderRadius: 999,
                  borderColor: "#00A699",
                  color: "#00A699",
                  "&:hover": {
                    borderColor: "#008875",
                    color: "#008875",
                  }
                }}
              >
                Reset
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          Explore stays
        </Typography>

        {loading ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" }, gap: 3 }}>
            {Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </Box>
        ) : filteredProperties.length === 0 ? (
          <EmptyState
            title="No properties found"
            description="Try changing your filters to discover more listings."
            actionLabel="Reset Filters"
            onAction={handleReset}
          />
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" }, gap: 3 }}>
            {filteredProperties.map((property) => (
              <PropertyCard key={property.propertyId} property={property} />
            ))}
          </Box>
        )}
      </Container>
    </MainLayout>
  );
}