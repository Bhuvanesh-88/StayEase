import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Property } from "../../types/models";
import { formatCurrency } from "../../utils/formatters";
import { DEFAULT_PROPERTY_IMAGE } from "../../utils/constants";

interface Props {
  property: Property;
}

export default function PropertyCard({ property }: Props) {
  const navigate = useNavigate();

  // Handle image - use first uploaded image or default placeholder
  let image = DEFAULT_PROPERTY_IMAGE;
  
  if (property.images && property.images.length > 0) {
    const firstImage = property.images[0];
    if (firstImage.imageData) {
      image = firstImage.imageData.startsWith('data:') 
        ? firstImage.imageData 
        : `data:${firstImage.fileType || 'image/jpeg'};base64,${firstImage.imageData}`;
    }
  }

  const facilities = property.amenities 
    ? property.amenities.map((item) => item.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        boxShadow: "0 8px 24px rgba(0, 166, 153, 0.08)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 14px 30px rgba(0, 166, 153, 0.12)",
        },
      }}
    >
      <Box
        sx={{
          height: 220,
          backgroundImage: `url(${image})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          flexShrink: 0,
          backgroundColor: "#f0f0f0",
        }}
      />

      <CardContent
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              flex: 1,
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 54,
            }}
          >
            {property.title}
          </Typography>

          <Chip
            label={property.propertyType}
            color="primary"
            sx={{ 
              flexShrink: 0,
              backgroundColor: "#00A699",
              color: "#ffffff"
            }}
            size="small"
          />
        </Stack>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
            minHeight: 24,
          }}
        >
          {property.city}, {property.state}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 1.5,
            color: "text.secondary",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 44,
          }}
        >
          {property.description}
        </Typography>

        <Box sx={{ mt: 2, minHeight: 36 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {facilities.map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  borderColor: "#00A699",
                  color: "#00A699"
                }}
              />
            ))}
          </Stack>
        </Box>

        <Typography
          variant="h6"
          sx={{
            mt: 2,
            color: "#00A699",
            fontWeight: 700,
          }}
        >
          {formatCurrency(property.monthlyRent)} / month
        </Typography>

        <Box sx={{ mt: "auto", pt: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate(`/properties/${property.propertyId}`)}
            sx={{
              borderRadius: 3,
              minHeight: 44,
              backgroundColor: "#00A699",
              "&:hover": { backgroundColor: "#008875" },
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}