import { createTheme } from "@mui/material";

// Create a CL-inspired professional theme with modern enhancements
export const appTheme = createTheme({
  palette: {
    primary: {
      main: "#1A1A1A", // Deep black/navy like CL
      light: "#2D2D2D",
      dark: "#000000",
    },
    secondary: {
      main: "#0066CC", // CL blue accent
      light: "#3385D6",
      dark: "#004499",
    },
    background: {
      default: "#FAFAFA", // Slightly off-white for better contrast
      paper: "#FFFFFF",
    },
    success: {
      main: "#2E7D32", // Professional green
      light: "#4CAF50",
      dark: "#1B5E20",
    },
    error: {
      main: "#D32F2F", // Professional red
      light: "#EF5350",
      dark: "#C62828",
    },
    text: {
      primary: "#1A1A1A", // Deep black for primary text
      secondary: "#666666", // Medium gray for secondary text
    },
    grey: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#EEEEEE",
      300: "#E0E0E0",
      400: "#BDBDBD",
      500: "#9E9E9E",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: "#1A1A1A",
      fontSize: "2.5rem",
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 600,
      color: "#1A1A1A",
      fontSize: "2rem",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 600,
      color: "#1A1A1A",
      fontSize: "1.75rem",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 600,
      color: "#1A1A1A",
      fontSize: "1.5rem",
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontWeight: 600,
      color: "#1A1A1A",
      fontSize: "1.25rem",
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 600,
      color: "#1A1A1A",
      fontSize: "1.125rem",
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
    },
    subtitle1: {
      fontWeight: 500,
      color: "#666666",
      fontSize: "1rem",
      lineHeight: 1.5,
      letterSpacing: "0.01em",
    },
    subtitle2: {
      fontWeight: 500,
      color: "#666666",
      fontSize: "0.875rem",
      lineHeight: 1.5,
      letterSpacing: "0.01em",
    },
    body1: {
      fontWeight: 400,
      color: "#1A1A1A",
      fontSize: "1rem",
      lineHeight: 1.6,
      letterSpacing: "0.01em",
    },
    body2: {
      fontWeight: 400,
      color: "#666666",
      fontSize: "0.875rem",
      lineHeight: 1.6,
      letterSpacing: "0.01em",
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      fontSize: "0.875rem",
      letterSpacing: "0.02em",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Modern scrollbar styling
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '4px',
          '&:hover': {
            background: '#a8a8a8',
          },
        },
        // Smooth scrolling
        html: {
          scrollBehavior: 'smooth',
        },
        // Modern selection styling
        '::selection': {
          backgroundColor: 'rgba(0, 102, 204, 0.2)',
          color: '#1A1A1A',
        },
        '::-moz-selection': {
          backgroundColor: 'rgba(0, 102, 204, 0.2)',
          color: '#1A1A1A',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // More modern rounded corners
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.12)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // More modern rounded corners
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.12)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.16)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // More modern rounded corners
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "10px 20px",
          minHeight: "44px",
          letterSpacing: "0.02em",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            transition: "left 0.5s",
          },
          "&:hover::before": {
            left: "100%",
          },
        },
        contained: {
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2), 0 3px 8px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(26, 26, 26, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)",
          borderRadius: 0,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "& fieldset": {
              borderColor: "#E0E0E0",
              borderWidth: "1.5px",
            },
            "&:hover fieldset": {
              borderColor: "#BDBDBD",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0066CC",
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#E0E0E0",
          opacity: 0.6,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#0066CC",
          textDecoration: "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            textDecoration: "underline",
            color: "#004499",
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8, // More modern border radius
  },
  shadows: [
    "none",
    "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.12)",
    "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.12)",
    "0 6px 30px rgba(0, 0, 0, 0.12), 0 3px 12px rgba(0, 0, 0, 0.16)",
    "0 8px 40px rgba(0, 0, 0, 0.16), 0 4px 16px rgba(0, 0, 0, 0.20)",
    "0 10px 50px rgba(0, 0, 0, 0.20), 0 5px 20px rgba(0, 0, 0, 0.24)",
    "0 12px 60px rgba(0, 0, 0, 0.24), 0 6px 24px rgba(0, 0, 0, 0.28)",
    "0 14px 70px rgba(0, 0, 0, 0.28), 0 7px 28px rgba(0, 0, 0, 0.32)",
    "0 16px 80px rgba(0, 0, 0, 0.32), 0 8px 32px rgba(0, 0, 0, 0.36)",
    "0 18px 90px rgba(0, 0, 0, 0.36), 0 9px 36px rgba(0, 0, 0, 0.40)",
    "0 20px 100px rgba(0, 0, 0, 0.40), 0 10px 40px rgba(0, 0, 0, 0.44)",
    "0 22px 110px rgba(0, 0, 0, 0.44), 0 11px 44px rgba(0, 0, 0, 0.48)",
    "0 24px 120px rgba(0, 0, 0, 0.48), 0 12px 48px rgba(0, 0, 0, 0.52)",
    "0 26px 130px rgba(0, 0, 0, 0.52), 0 13px 52px rgba(0, 0, 0, 0.56)",
    "0 28px 140px rgba(0, 0, 0, 0.56), 0 14px 56px rgba(0, 0, 0, 0.60)",
    "0 30px 150px rgba(0, 0, 0, 0.60), 0 15px 60px rgba(0, 0, 0, 0.64)",
    "0 32px 160px rgba(0, 0, 0, 0.64), 0 16px 64px rgba(0, 0, 0, 0.68)",
    "0 34px 170px rgba(0, 0, 0, 0.68), 0 17px 68px rgba(0, 0, 0, 0.72)",
    "0 36px 180px rgba(0, 0, 0, 0.72), 0 18px 72px rgba(0, 0, 0, 0.76)",
    "0 38px 190px rgba(0, 0, 0, 0.76), 0 19px 76px rgba(0, 0, 0, 0.80)",
    "0 40px 200px rgba(0, 0, 0, 0.80), 0 20px 80px rgba(0, 0, 0, 0.84)",
    "0 42px 210px rgba(0, 0, 0, 0.84), 0 21px 84px rgba(0, 0, 0, 0.88)",
    "0 44px 220px rgba(0, 0, 0, 0.88), 0 22px 88px rgba(0, 0, 0, 0.92)",
    "0 46px 230px rgba(0, 0, 0, 0.92), 0 23px 92px rgba(0, 0, 0, 0.96)",
    "0 48px 240px rgba(0, 0, 0, 0.96), 0 24px 96px rgba(0, 0, 0, 1.00)",
  ],
});
