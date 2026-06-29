
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../../context/SnackbarContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectPath = (location.state as any)?.from?.pathname || "/";

  const { showMessage } = useSnackbar();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(""); // Reset state so the old error goes away
  setLoading(true);

  try {
    const user = await login({ email, password });

    // Handle deep linking/redirects
    if (redirectPath && redirectPath !== "/" && redirectPath !== "/login") {
      navigate(redirectPath, { replace: true });
      return;
    }

    // Default navigation
    if (user.role === "OWNER") navigate("/owner/dashboard");
    else navigate("/");
    
  } catch (err: any) {
    // This sets the text that appears in your <Alert> component
    showMessage(err.message, "error");
  } finally {
    setLoading(false);
  }
};

  return (
    <MainLayout>
      <Box
        sx={{
          minHeight: "calc(100vh - 140px)",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #f0fffe 0%, #ffffff 100%)",
          py: 6,
        }}
      >
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 5, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #00A699, #008875)",
                color: "#fff",
                px: 4,
                py: 4,
              }}
            >
              <Typography variant="h4" fontWeight={800}>
                Welcome back
              </Typography>
              <Typography sx={{ mt: 1, opacity: 0.95 }}>
                Login to continue exploring and booking properties.
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <Stack spacing={2.2}>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      borderRadius: 999,
                      bgcolor: "#00A699",
                      "&:hover": { bgcolor: "#008875" },
                    }}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Don&apos;t have an account?{" "}
                    <Typography
                      component={RouterLink}
                      to="/register"
                      sx={{
                        color: "#00A699",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Register
                    </Typography>
                  </Typography>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </MainLayout>
  );
}