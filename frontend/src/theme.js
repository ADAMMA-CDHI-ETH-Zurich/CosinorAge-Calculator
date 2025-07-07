import { createTheme } from "@mui/material";

// Create a CL-inspired professional theme
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
      default: "#FFFFFF", // Clean white background
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
    },
    h2: {
      fontWeight: 600,
      color: "#1A1A1A",
      fontSize: "2rem",
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      color: "#1A1A1A",
      fontSize: "1.75rem",
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      color: "#1A1A1A",
      fontSize: "1.5rem",
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      color: "#1A1A1A",
      fontSize: "1.25rem",
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      color: "#1A1A1A",
      fontSize: "1.125rem",
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 500,
      color: "#666666",
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      color: "#666666",
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    body1: {
      fontWeight: 400,
      color: "#1A1A1A",
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      color: "#666666",
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      fontSize: "0.875rem",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4, // Subtle rounded corners like CL
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
          border: "1px solid #E0E0E0",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4, // Subtle rounded corners
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "8px 16px",
          minHeight: "40px",
        },
        contained: {
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
          "&:hover": {
            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
          },
        },
        outlined: {
          borderWidth: "1px",
          "&:hover": {
            borderWidth: "1px",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A1A1A",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
          borderRadius: 0,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 4,
            "& fieldset": {
              borderColor: "#E0E0E0",
            },
            "&:hover fieldset": {
              borderColor: "#BDBDBD",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0066CC",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#E0E0E0",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#0066CC",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 4, // Consistent subtle border radius
  },
  shadows: [
    "none",
    "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
    "0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)",
    "0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)",
    "0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)",
    "0 24px 48px rgba(0, 0, 0, 0.35), 0 20px 14px rgba(0, 0, 0, 0.22)",
    "0 29px 58px rgba(0, 0, 0, 0.40), 0 25px 16px rgba(0, 0, 0, 0.22)",
    "0 34px 68px rgba(0, 0, 0, 0.45), 0 30px 18px rgba(0, 0, 0, 0.22)",
    "0 39px 78px rgba(0, 0, 0, 0.50), 0 35px 20px rgba(0, 0, 0, 0.22)",
    "0 44px 88px rgba(0, 0, 0, 0.55), 0 40px 22px rgba(0, 0, 0, 0.22)",
    "0 49px 98px rgba(0, 0, 0, 0.60), 0 45px 24px rgba(0, 0, 0, 0.22)",
    "0 54px 108px rgba(0, 0, 0, 0.65), 0 50px 26px rgba(0, 0, 0, 0.22)",
    "0 59px 118px rgba(0, 0, 0, 0.70), 0 55px 28px rgba(0, 0, 0, 0.22)",
    "0 64px 128px rgba(0, 0, 0, 0.75), 0 60px 30px rgba(0, 0, 0, 0.22)",
    "0 69px 138px rgba(0, 0, 0, 0.80), 0 65px 32px rgba(0, 0, 0, 0.22)",
    "0 74px 148px rgba(0, 0, 0, 0.85), 0 70px 34px rgba(0, 0, 0, 0.22)",
    "0 79px 158px rgba(0, 0, 0, 0.90), 0 75px 36px rgba(0, 0, 0, 0.22)",
    "0 84px 168px rgba(0, 0, 0, 0.95), 0 80px 38px rgba(0, 0, 0, 0.22)",
    "0 89px 178px rgba(0, 0, 0, 1.00), 0 85px 40px rgba(0, 0, 0, 0.22)",
    "0 94px 188px rgba(0, 0, 0, 1.00), 0 90px 42px rgba(0, 0, 0, 0.22)",
    "0 99px 198px rgba(0, 0, 0, 1.00), 0 95px 44px rgba(0, 0, 0, 0.22)",
    "0 104px 208px rgba(0, 0, 0, 1.00), 0 100px 46px rgba(0, 0, 0, 0.22)",
    "0 109px 218px rgba(0, 0, 0, 1.00), 0 105px 48px rgba(0, 0, 0, 0.22)",
    "0 114px 228px rgba(0, 0, 0, 1.00), 0 110px 50px rgba(0, 0, 0, 0.22)",
    "0 119px 238px rgba(0, 0, 0, 1.00), 0 115px 52px rgba(0, 0, 0, 0.22)",
    "0 124px 248px rgba(0, 0, 0, 1.00), 0 120px 54px rgba(0, 0, 0, 0.22)",
  ],
});
