import { Box } from "@mui/material";
import { DEFAULT_PROPERTY_IMAGE } from "../../utils/constants";

interface PropertyImageDto {
  imageId: number;
  fileName: string;
  fileType: string;
  imageData: string; // Base64 encoded
}

type PropertyGalleryProps = {
  images?: PropertyImageDto[];
};

export default function PropertyGallery({
  images = [],
}: PropertyGalleryProps) {
  // Convert base64 images to data URLs, fallback to default placeholder
  const imageUrls = images && images.length > 0 
    ? images.map((img) => {
        if (img.imageData.startsWith('data:')) {
          return img.imageData;
        }
        const mimeType = img.fileType || 'image/jpeg';
        return `data:${mimeType};base64,${img.imageData}`;
      })
    : [DEFAULT_PROPERTY_IMAGE];

  const mainImage = imageUrls[0];
  const sideImages = imageUrls.slice(1, 3);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "2fr 1fr",
        },
        gap: 2,
      }}
    >
      <Box
        sx={{
          height: { xs: 260, md: 420 },
          borderRadius: 4,
          overflow: "hidden",
          backgroundImage: `url(${mainImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#f0f0f0",
        }}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            md: "1fr",
          },
          gap: 2,
        }}
      >
        {sideImages.map((img, index) => (
          <Box
            key={`side-image-${index}`}
            sx={{
              height: { xs: 120, md: 202 },
              borderRadius: 4,
              overflow: "hidden",
              backgroundImage: `url(${img})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundColor: "#f0f0f0",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}