import { createTheme } from "@mui/material";

// Create a modern theme
export const appTheme = createTheme({
  palette: {
    primary: {
      main: "#2E3B55", // Deep navy blue
      light: "#4A5B7A",
      dark: "#1A2238",
    },
    secondary: {
      main: "#E76F51", // Coral orange
      light: "#F4A261",
      dark: "#C65D3E",
    },
    background: {
      default: "#F8F9FA", // Light gray background
      paper: "#FFFFFF",
    },
    success: {
      main: "#2A9D8F", // Teal green
      light: "#4CAF9F",
      dark: "#1E7A6F",
    },
    error: {
      main: "#E63946", // Bright red
      light: "#FF4D5A",
      dark: "#C62A36",
    },
    text: {
      primary: "#2E3B55", // Deep navy blue
      secondary: "#6C757D", // Medium gray
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: "#2E3B55",
    },
    h6: {
      fontWeight: 600,
      color: "#2E3B55",
    },
    subtitle1: {
      fontWeight: 500,
      color: "#4A5B7A",
    },
    subtitle2: {
      fontWeight: 500,
      color: "#6C757D",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
        contained: {
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#2E3B55",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          borderRadius: 0, // Remove rounded corners
        },
      },
    },
  },
});
