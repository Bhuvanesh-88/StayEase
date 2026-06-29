import { useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Property } from "../../types/models";
import { uploadPropertyImage, deletePropertyImage } from "../../api/propertyApi";

interface Props {
  property: Property;
  onImagesUpdated: (property: Property) => void;
}

export default function PropertyImageUploader({ property, onImagesUpdated }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const file = files[0];
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select a valid image file.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB.");
      }

      const updatedProperty = await uploadPropertyImage(property.propertyId, file);
      onImagesUpdated(updatedProperty);
      setSuccess("Image uploaded successfully!");
      event.target.value = "";
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (index: number) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const updatedProperty = await deletePropertyImage(property.propertyId, index);
      onImagesUpdated(updatedProperty);
      setSuccess("Image deleted successfully!");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mt: 4, p: 3, border: "1px solid #ececec", borderRadius: 4, bgcolor: "#fafafa" }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Property Images
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

      <Stack spacing={2}>
        <Box
          sx={{
            border: "2px dashed #d1d5db",
            borderRadius: 3,
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.3s",
            "&:hover": { borderColor: "#00A699" },
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: "none" }}
            id={`image-input-${property.propertyId}`}
          />

          <label
            htmlFor={`image-input-${property.propertyId}`}
            style={{ cursor: "pointer", display: "block" }}
          >
            <CloudUploadIcon sx={{ fontSize: 40, color: "#00A699", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Click to upload property image
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Max file size: 5MB. Supported formats: JPG, PNG, WebP
            </Typography>
          </label>

          {uploading && <CircularProgress sx={{ mt: 2 }} size={24} />}
        </Box>

        {property.images && property.images.length > 0 ? (
          <Box>
            <Typography variant="body2" fontWeight={600} mb={1.5}>
              Current Images ({property.images.length})
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 1.5,
              }}
            >
              {property.images.map((image, index) => {
                // Handle both base64 and URL formats
                const imageSrc = image.imageData.startsWith('data:') 
                  ? image.imageData 
                  : `data:image/jpeg;base64,${image.imageData}`;

                return (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      aspectRatio: "1 / 1",
                      backgroundColor: "#f3f4f6",
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt={`Property ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteImage(index)}
                      disabled={uploading}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(255,255,255,0.9)",
                        "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                      }}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary" variant="body2" textAlign="center">
            No images uploaded yet. Add images to showcase your property.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}