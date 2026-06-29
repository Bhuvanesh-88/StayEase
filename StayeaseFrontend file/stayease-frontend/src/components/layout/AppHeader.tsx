import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const primaryBtnSx = {
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 700,
};

const filledBtnSx = {
  ...primaryBtnSx,
  bgcolor: "#00A699",
  "&:hover": { bgcolor: "#008875" },
};

const outlinedBtnSx = {
  ...primaryBtnSx,
  color: "#00A699",
  borderColor: "#00A699",
  "&:hover": {
    borderColor: "#008875",
    bgcolor: "rgba(0, 166, 153, 0.06)",
  },
};

export default function AppHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setAnchorEl(null);

  const go = (path: string) => {
    if (location.pathname !== path) navigate(path);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "white",
        color: "#111827",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", minHeight: 72 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.2, cursor: "pointer" }}
            onClick={() => go("/")}
          >
            <HomeWorkIcon sx={{ color: "#00A699", fontSize: 32 }} />
            <Typography variant="h6" fontWeight={800} sx={{ color: "#00A699" }}>
              StayEase
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Button sx={outlinedBtnSx} onClick={() => go("/")}>
              Explore
            </Button>

            {isAuthenticated && user?.role === "TENANT" && (
              <Button sx={outlinedBtnSx} onClick={() => go("/tenant/bookings")}>
                My Bookings
              </Button>
            )}

            {isAuthenticated && user?.role === "OWNER" && (
              <>
                <Button sx={outlinedBtnSx} onClick={() => go("/owner/dashboard")}>
                  Dashboard
                </Button>
                <Button sx={outlinedBtnSx} onClick={() => go("/owner/properties")}>
                  My Properties
                </Button>
                <Button sx={outlinedBtnSx} onClick={() => go("/owner/bookings")}>
                  Booking Requests
                </Button>
              </>
            )}

            {!isAuthenticated ? (
              <>
                <Button sx={outlinedBtnSx} onClick={() => go("/login")}>
                  Login
                </Button>
                <Button variant="contained" sx={filledBtnSx} onClick={() => go("/register")}>
                  Register
                </Button>
              </>
            ) : (
              <>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <Avatar sx={{ bgcolor: "#00A699" }}>
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
                  <MenuItem disabled>{user?.name}</MenuItem>
                  <MenuItem disabled>{user?.role}</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}