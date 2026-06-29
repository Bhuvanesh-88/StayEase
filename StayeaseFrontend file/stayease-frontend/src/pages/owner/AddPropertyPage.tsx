// pages/owner/AddPropertyPage.tsx
import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MainLayout from "../../components/layout/MainLayout";
import {
  createProperty,
  uploadPropertyImage,
  type CreatePropertyPayload,
} from "../../api/propertyApi";
import { getAuthUser } from "../../utils/authStorage";
import { AMENITIES_BY_TYPE } from "../../types/models";

type PropertyTypeOption = "PG" | "HOSTEL" | "APARTMENT";
type FormErrors = Partial<Record<keyof Omit<CreatePropertyPayload, 'amenities'>, string>> & { amenities?: string };

export default function AddPropertyPage() {
  const authUser = getAuthUser();

  const initialFormState: CreatePropertyPayload = useMemo(
    () => ({
      ownerId: authUser?.userId ?? 0,
      title: "",
      description: "",
      propertyType: "PG",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
      monthlyRent: 0,
      amenities: [],
    }),
    [authUser]
  );

  const [form, setForm] = useState<CreatePropertyPayload>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const propertyType = form.propertyType as PropertyTypeOption;
  const availableAmenities = AMENITIES_BY_TYPE[propertyType];

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "monthlyRent" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePropertyTypeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      propertyType: e.target.value as PropertyTypeOption,
      amenities: [], // Reset amenities when type changes
    }));
    setErrors((prev) => ({ ...prev, propertyType: "" }));
  };

  const handleAmenityChange = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      return true;
    });

    if (validFiles.length !== files.length) {
      setErrorMessage("Some files were skipped. Only image files under 5MB are allowed.");
      setSuccessMessage("");
      setSnackbarOpen(true);
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    if (!form.addressLine.trim()) newErrors.addressLine = "Address is required.";
    if (!form.city.trim()) newErrors.city = "City is required.";
    if (!form.state.trim()) newErrors.state = "State is required.";

    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required.";
    else if (!/^\d{6}$/.test(form.pincode.trim())) {
      newErrors.pincode = "Pincode must be 6 digits.";
    }

    if (!form.monthlyRent || form.monthlyRent <= 0) {
      newErrors.monthlyRent = "Monthly rent must be greater than 0.";
    }

    if (!form.amenities || form.amenities.length === 0) {
      newErrors.amenities = "Please select at least one amenity.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm(initialFormState);
    setErrors({});
    setSelectedImages([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage("Please fix the validation errors.");
      setSuccessMessage("");
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const createdProperty = await createProperty({
        ownerId: form.ownerId,
        title: form.title.trim(),
        description: form.description.trim(),
        propertyType: form.propertyType,
        addressLine: form.addressLine.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        monthlyRent: Number(form.monthlyRent),
        amenities: form.amenities,
      });

      if (selectedImages.length > 0) {
        setUploadingImages(true);

        for (const image of selectedImages) {
          await uploadPropertyImage(createdProperty.propertyId, image);
        }

        setUploadingImages(false);
      }

      setSuccessMessage(
        selectedImages.length > 0
          ? "Property added successfully with images!"
          : "Property added successfully!"
      );
      setSnackbarOpen(true);
      resetForm();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to add property."
      );
      setSuccessMessage("");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <MainLayout>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(to right, #f0fffe, #fff)",
          py: 6,
        }}
      >
        <Container maxWidth="md">
          <Card sx={{ borderRadius: 4, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #00A699, #008875)",
                color: "#fff",
                px: 4,
                py: 4,
              }}
            >
              <Typography variant="h4" fontWeight={700}>
                Add New Property
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.92 }}>
                Enter property details and upload images before saving.
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {!authUser && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  Logged in owner not found. Please login again.
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2.5,
                  }}
                >
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField
                      label="Property Title"
                      name="title"
                      value={form.title}
                      onChange={handleTextChange}
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title}
                    />
                  </Box>

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField
                      label="Description"
                      name="description"
                      value={form.description}
                      onChange={handleTextChange}
                      multiline
                      rows={4}
                      fullWidth
                      error={!!errors.description}
                      helperText={errors.description}
                    />
                  </Box>

                  <TextField
                    select
                    label="Property Type"
                    name="propertyType"
                    value={form.propertyType}
                    onChange={handlePropertyTypeChange}
                    fullWidth
                  >
                    <MenuItem value="PG">PG</MenuItem>
                    <MenuItem value="HOSTEL">Hostel</MenuItem>
                    <MenuItem value="APARTMENT">Apartment</MenuItem>
                  </TextField>

                  <TextField
                    label="Monthly Rent"
                    name="monthlyRent"
                    type="number"
                    value={form.monthlyRent}
                    onChange={handleTextChange}
                    fullWidth
                    error={!!errors.monthlyRent}
                    helperText={errors.monthlyRent}
                  />

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField
                      label="Address Line"
                      name="addressLine"
                      value={form.addressLine}
                      onChange={handleTextChange}
                      fullWidth
                      error={!!errors.addressLine}
                      helperText={errors.addressLine}
                    />
                  </Box>

                  <TextField
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleTextChange}
                    fullWidth
                    error={!!errors.city}
                    helperText={errors.city}
                  />

                  <TextField
                    label="State"
                    name="state"
                    value={form.state}
                    onChange={handleTextChange}
                    fullWidth
                    error={!!errors.state}
                    helperText={errors.state}
                  />

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField
                      label="Pincode"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleTextChange}
                      fullWidth
                      error={!!errors.pincode}
                      helperText={errors.pincode}
                    />
                  </Box>

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      Amenities
                    </Typography>
                    {errors.amenities && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {errors.amenities}
                      </Alert>
                    )}
                    <FormGroup
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 1,
                      }}
                    >
                      {availableAmenities.map((amenity) => (
                        <FormControlLabel
                          key={amenity}
                          control={
                            <Checkbox
                              checked={form.amenities.includes(amenity)}
                              onChange={() => handleAmenityChange(amenity)}
                            />
                          }
                          label={amenity}
                        />
                      ))}
                    </FormGroup>
                  </Box>

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Typography variant="h6" fontWeight={700} mb={1.5}>
                      Property Images
                    </Typography>

                    <Box
                      sx={{
                        border: "2px dashed #d1d5db",
                        borderRadius: 3,
                        p: 3,
                        textAlign: "center",
                        bgcolor: "#fafafa",
                      }}
                    >
                      <input
                        id="property-images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelection}
                        style={{ display: "none" }}
                      />

                      <label htmlFor="property-images" style={{ cursor: "pointer" }}>
                        <CloudUploadIcon sx={{ fontSize: 42, color: "#00A699", mb: 1 }} />
                        <Typography fontWeight={600}>
                          Click to select property images
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          You can choose multiple images. JPG, PNG, WebP only, max 5MB each.
                        </Typography>
                      </label>
                    </Box>

                    {selectedImages.length > 0 && (
                      <Stack spacing={1.2} sx={{ mt: 2 }}>
                        {selectedImages.map((file, index) => (
                          <Box
                            key={`${file.name}-${index}`}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              p: 1.5,
                              border: "1px solid #e5e7eb",
                              borderRadius: 2,
                              bgcolor: "#fff",
                            }}
                          >
                            <Box sx={{ overflow: "hidden" }}>
                              <Typography fontWeight={600} noWrap>
                                {file.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            </Box>

                            <IconButton
                              color="error"
                              onClick={() => removeSelectedImage(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Box>

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !authUser}
                        sx={{
                          borderRadius: 2,
                          bgcolor: "#00A699",
                          "&:hover": { bgcolor: "#008875" },
                        }}
                      >
                        {loading
                          ? uploadingImages
                            ? "Saving & Uploading Images..."
                            : "Saving..."
                          : "Save Property"}
                      </Button>

                      <Button
                        type="button"
                        variant="outlined"
                        onClick={resetForm}
                        sx={{ borderRadius: 2 }}
                      >
                        Reset
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert
              severity={errorMessage ? "error" : "success"}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {errorMessage || successMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </MainLayout>
  );
}