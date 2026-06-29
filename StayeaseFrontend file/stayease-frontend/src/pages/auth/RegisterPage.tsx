import {
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../../context/SnackbarContext";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "TENANT" as "TENANT" | "OWNER",
  });

  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const user = await register(form);
      showMessage("Registration successful! Welcome to StayEase.", "success");
      navigate(user.role === "OWNER" ? "/owner/dashboard" : "/");
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed.";
      showMessage(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ borderRadius: 5, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" mb={1} fontWeight={800}>
              Create your account
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Register as a tenant or property owner.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField name="name" label="Full Name" value={form.name} onChange={handleChange} required />
                <TextField name="email" label="Email" type="email" value={form.email} onChange={handleChange} required />
                <TextField name="phone" label="Phone" value={form.phone} onChange={handleChange} required />
                <TextField name="password" label="Password" type="password" value={form.password} onChange={handleChange} required />
                <TextField select name="role" label="Register As" value={form.role} onChange={handleChange} required>
                  <MenuItem value="TENANT">Tenant</MenuItem>
                  <MenuItem value="OWNER">Owner</MenuItem>
                </TextField>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  sx={{
                    borderRadius: 999,
                    bgcolor: "#00A699",
                    "&:hover": { bgcolor: "#008875" },
                  }}
                >
                  {submitting ? "Creating..." : "Register"}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </MainLayout>
  );
}