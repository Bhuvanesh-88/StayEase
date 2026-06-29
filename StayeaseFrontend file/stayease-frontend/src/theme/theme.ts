import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00A699",
      light: "#1abc9c",
      dark: "#008875",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#00A699",
      light: "#1abc9c",
      dark: "#008875",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    success: {
      main: "#00A699",
    },
    warning: {
      main: "#d97706",
    },
    error: {
      main: "#dc2626",
    },
    text: {
      primary: "#111827",
      secondary: "#6b7280",
    },
  },
  shape: {
    borderRadius: 8, // Changed from 16 to 8 for consistent smaller radius
  },
  typography: {
    fontFamily: `"Poppins", "Roboto", "Arial", sans-serif`,
    h3: {
      fontWeight: 700,
      color: "#111827",
    },
    h4: {
      fontWeight: 700,
      color: "#111827",
    },
    h5: {
      fontWeight: 700,
      color: "#111827",
    },
    h6: {
      fontWeight: 600,
      color: "#111827",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 10px 30px rgba(0, 166, 153, 0.08)",
          border: "1px solid rgba(0, 166, 153, 0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 20px 40px rgba(0, 166, 153, 0.12)",
            transform: "translateY(-4px)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          paddingInline: 18,
          minHeight: 40,
          fontWeight: 600,
          transition: "all 0.3s ease",
        },
        contained: {
          backgroundColor: "#00A699",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#008875",
          },
        },
        outlined: {
          borderColor: "#00A699",
          color: "#00A699",
          "&:hover": {
            backgroundColor: "rgba(0, 166, 153, 0.08)",
            borderColor: "#008875",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        size: "medium",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 6,
            "&:hover fieldset": {
              borderColor: "#00A699",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#00A699",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        colorPrimary: {
          backgroundColor: "#00A699",
          color: "#ffffff",
        },
      },
    },
  },
});

export default theme;