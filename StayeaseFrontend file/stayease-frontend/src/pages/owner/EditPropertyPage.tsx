// pages/owner/EditPropertyPage.tsx
import { useEffect, useMemo, useState } from "react";
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
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import PropertyImageUploader from "../../components/property/PropertyImageUploader";
import { getPropertyById, updateProperty, type UpdatePropertyPayload } from "../../api/propertyApi";
import { getAuthUser } from "../../utils/authStorage";
import type { Property, PropertyType } from "../../types/models";
import { AMENITIES_BY_TYPE } from "../../types/models";

type PropertyTypeOption = "PG" | "HOSTEL" | "APARTMENT";
type FormErrors = Partial<Record<keyof Omit<UpdatePropertyPayload, 'amenities'>, string>> & { amenities?: string };

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = getAuthUser();

  const initialFormState: UpdatePropertyPayload = useMemo(
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

  const [form, setForm] = useState<UpdatePropertyPayload>(initialFormState);
  const [property, setProperty] = useState<Property | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const propertyType = form.propertyType as PropertyTypeOption;
  const availableAmenities = AMENITIES_BY_TYPE[propertyType];

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (!id) return;
        const data = await getPropertyById(Number(id));
        const prop = data.property;
        setProperty(prop);
        setForm({
          ownerId: prop.ownerId,
          title: prop.title,
          description: prop.description,
          propertyType: prop.propertyType as PropertyTypeOption,
          addressLine: prop.addressLine,
          city: prop.city,
          state: prop.state,
          pincode: prop.pincode,
          monthlyRent: prop.monthlyRent,
          amenities: prop.amenities || [],
        });
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.message || "Failed to load property details.");
        setSnackbarOpen(true);
      } finally {
        setPageLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

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
      amenities: [],
    }));
  };

  const handleAmenityChange = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    if (!form.addressLine.trim()) newErrors.addressLine = "Address is required.";
    if (!form.city.trim()) newErrors.city = "City is required.";
    if (!form.state.trim()) newErrors.state = "State is required.";
    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required.";
    else if (!/^\d{6}$/.test(form.pincode.trim())) newErrors.pincode = "Pincode must be 6 digits.";
    if (!form.monthlyRent || form.monthlyRent <= 0) newErrors.monthlyRent = "Monthly rent must be greater than 0.";
    if (!form.amenities || form.amenities.length === 0) newErrors.amenities = "Please select at least one amenity.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    if (!validateForm()) {
      setErrorMessage("Please fix the validation errors before submitting.");
      setSuccessMessage("");
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updateProperty(Number(id), {
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

      setSuccessMessage("Property updated successfully.");
      setSnackbarOpen(true);
      setTimeout(() => navigate("/owner/properties"), 900);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Failed to update property.");
      setSuccessMessage("");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleImagesUpdated = (updatedProperty: Property) => {
    setProperty(updatedProperty);
  };

  if (pageLoading) {
    return (
      <MainLayout>
        <Container sx={{ py: 8 }}>
          <Typography textAlign="center">Loading property details...</Typography>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ minHeight: "100vh", background: "linear-gradient(to right, #fff7f7, #fff)", py: 6 }}>
        <Container maxWidth="md">
          <Card sx={{ borderRadius: 4, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #0f766e, #0f766e)",
                color: "#fff",
                px: 4,
                py: 4,
              }}
            >
              <Typography variant="h4" fontWeight={700}>
                Edit Property
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField label="Property Title" name="title" value={form.title} onChange={handleTextChange} fullWidth error={!!errors.title} helperText={errors.title} />
                  </Box>

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField label="Description" name="description" value={form.description} onChange={handleTextChange} multiline rows={4} fullWidth error={!!errors.description} helperText={errors.description} />
                  </Box>

                  <TextField select label="Property Type" name="propertyType" value={form.propertyType} onChange={handlePropertyTypeChange} fullWidth>
                    <MenuItem value="PG">PG</MenuItem>
                    <MenuItem value="HOSTEL">Hostel</MenuItem>
                    <MenuItem value="APARTMENT">Apartment</MenuItem>
                  </TextField>

                  <TextField label="Monthly Rent" name="monthlyRent" type="number" value={form.monthlyRent} onChange={handleTextChange} error={!!errors.monthlyRent} helperText={errors.monthlyRent} fullWidth />

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField label="Address Line" name="addressLine" value={form.addressLine} onChange={handleTextChange} error={!!errors.addressLine} helperText={errors.addressLine} fullWidth />
                  </Box>

                  <TextField label="City" name="city" value={form.city} onChange={handleTextChange} error={!!errors.city} helperText={errors.city} fullWidth />
                  <TextField label="State" name="state" value={form.state} onChange={handleTextChange} error={!!errors.state} helperText={errors.state} fullWidth />

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField label="Pincode" name="pincode" value={form.pincode} onChange={handleTextChange} error={!!errors.pincode} helperText={errors.pincode} fullWidth />
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
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                          borderRadius: 2,
                          bgcolor: "#0f766e",
                          "&:hover": { bgcolor: "#0f766e" },
                        }}
                      >
                        {loading ? "Updating..." : "Update Property"}
                      </Button>
                      <Button type="button" variant="outlined" sx={{ borderRadius: 2 }} onClick={() => navigate("/owner/properties")}>
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              </form>

              {property && authUser?.userId === property.ownerId && (
                <PropertyImageUploader property={property} onImagesUpdated={handleImagesUpdated} />
              )}
            </CardContent>
          </Card>

          <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity={errorMessage ? "error" : "success"} variant="filled" sx={{ width: "100%" }}>
              {errorMessage || successMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </MainLayout>
  );
}