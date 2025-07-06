import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  IconButton,
  LinearProgress,
  FormControlLabel,
  Switch,
  Slider,
  Tabs,
  Tab,
  DialogActions,
  FormHelperText,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  BarChart,
  Bar,
  Area,
  AreaChart,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import UploadIcon from "@mui/icons-material/Upload";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import ScienceIcon from "@mui/icons-material/Science";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import InfoIcon from "@mui/icons-material/Info";
import RefreshIcon from "@mui/icons-material/Refresh";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningIcon from "@mui/icons-material/Warning";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorIcon from "@mui/icons-material/Error";
import BarChartIcon from "@mui/icons-material/BarChart";
import logo from "./assets/logo.png";
import HomeTab from "./components/HomeTab";
import DocumentationTab from "./components/DocumentationTab";
import LabTab from "./components/LabTab";
import AboutTab from "./components/AboutTab";
import SGSBinaryZippedExample from "./assets/SGS_Binary_Zipped_Example.png";
import SGSCSVExample from "./assets/SGS_CSV_Example.png";
import config from "./config";

// Create a modern theme
const appTheme = createTheme({
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

// Descriptions for each section
const metricDescriptions = {
  // Cosinor
  mesor: {
    title: "Mesor",
    description:
      "The mean value of the fitted cosine curve, representing the average activity level over 24 hours (in mg).",
  },
  amplitude: {
    title: "Amplitude",
    description:
      "Half the difference between the peak and trough of the fitted cosine curve, indicating the strength of the rhythm (in mg).",
  },
  acrophase: {
    title: "Acrophase",
    description:
      "The timing of the peak of the fitted cosine curve, expressed in radians or minutes, indicating when the highest activity occurs.",
  },
  acrophase_time: {
    title: "Acrophase Time",
    description:
      "The time of day (in HH:MM format) when the peak of the fitted cosine curve occurs.",
  },
  // Nonparametric
  is: {
    title: "Interdaily Stability (IS)",
    description:
      "A measure of the consistency of activity patterns between days. Ranges from 0 (random) to 1 (perfectly stable). Higher values indicate more regular daily rhythms.",
  },
  iv: {
    title: "Intradaily Variability (IV)",
    description:
      "A measure of fragmentation of activity within a day. It is greater than 0 - values close to 0 reflect a smooth pattern whereas greater values indicate more transitions between rest and activity. Values below 2 are considered as being acceptable.",
  },
  ra: {
    title: "Relative Amplitude (RA)",
    description:
      "The difference between the most active 10 hours (M10) and least active 5 hours (L5), normalized by their sum. Ranges from 0 to 1. Higher values indicate a more robust rhythm.",
  },
  sri: {
    title: "Sleep Regularity Index (SRI)",
    description:
      "A measure of the consistency of sleep/wake patterns across days. Ranges from -100 (irregular) to 100 (perfectly regular).",
  },
  m10: {
    title: "L5 & M10",
    description:
      "L5 represents the mean activity during the 5 least active consecutive hours of the day (in mg), and M10 represents the mean activity during the 10 most active consecutive hours; together, these metrics describe the least and most active periods within a 24-hour cycle.",
  },
  l5: {
    title: "L5 & M10",
    description:
      "L5 represents the mean activity during the 5 least active consecutive hours of the day (in mg), and M10 represents the mean activity during the 10 most active consecutive hours; together, these metrics describe the least and most active periods within a 24-hour cycle.",
  },
  m10_start: {
    title: "M10 Start",
    description:
      "The start time of the 10 most active consecutive hours of the day.",
  },
  l5_start: {
    title: "L5 Start",
    description:
      "The start time of the 5 least active consecutive hours of the day.",
  },
  // Physical Activity
  sedentary: {
    title: "Sedentary",
    description:
      "Total minutes per day spent in sedentary activity (<1.5 METs).",
  },
  light: {
    title: "Light",
    description: "Total minutes per day spent in light activity (1.5–3 METs).",
  },
  moderate: {
    title: "Moderate",
    description: "Total minutes per day spent in moderate activity (3–6 METs).",
  },
  vigorous: {
    title: "Vigorous",
    description: "Total minutes per day spent in vigorous activity (>6 METs).",
  },
  // Sleep
  tst: {
    title: "Total Sleep Time (TST)",
    description: "Total minutes of sleep obtained per night.",
  },
  waso: {
    title: "Wake After Sleep Onset (WASO)",
    description: "Total minutes spent awake after initially falling asleep.",
  },
  pta: {
    title: "Percent Time Asleep (PTA)",
    description: "Percentage of the sleep period spent asleep.",
  },
  nwb: {
    title: "Number of Wake Bouts (NWB)",
    description: "Number of times the person woke up during the sleep period.",
  },
  sol: {
    title: "Sleep Onset Latency (SOL)",
    description: "Minutes it took to fall asleep after going to bed.",
  },
};

function SectionInfoButton({ metric }) {
  const [open, setOpen] = React.useState(false);
  if (!metric) return null;
  const desc = metricDescriptions[metric.toLowerCase()];
  if (!desc) return null;
  return (
    <>
      <IconButton
        size="small"
        onClick={() => setOpen(true)}
        aria-label={`Info about ${desc.title}`}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{desc.title}</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ whiteSpace: "pre-line" }}>
            {desc.description}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
}

// HorizontalScale component for IS and IV
function HorizontalScale({ value, min, max, color = "#1976d2", label }) {
  // Clamp value to [min, max]
  const clamped = Math.max(min, Math.min(max, value));
  const percent = ((clamped - min) / (max - min)) * 100;
  return (
    <Box sx={{ width: "100%", mt: 2, mb: 2 }}>
      {label && (
        <Typography variant="subtitle2" align="center" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <Box sx={{ position: "relative", height: 48, width: "100%" }}>
        {/* Value above marker */}
        <Box
          sx={{
            position: "absolute",
            left: `calc(${percent}% - 20px)`,
            top: 0,
            width: 40,
            textAlign: "center",
            zIndex: 3,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {clamped.toFixed(2)}
          </Typography>
        </Box>
        {/* Horizontal line */}
        <Box
          sx={{
            position: "absolute",
            top: 32,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: "#ccc",
            borderRadius: 2,
          }}
        />
        {/* Marker */}
        <Box
          sx={{
            position: "absolute",
            top: 24,
            left: `calc(${percent}% - 10px)`,
            width: 20,
            height: 20,
            bgcolor: color,
            borderRadius: "50%",
            border: "2px solid #fff",
            boxShadow: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        />
        {/* Min label */}
        <Typography
          variant="caption"
          sx={{ position: "absolute", left: 0, top: 40 }}
        >
          {min}
        </Typography>
        {/* Max label */}
        <Typography
          variant="caption"
          sx={{ position: "absolute", right: 0, top: 40 }}
        >
          {max}
        </Typography>
      </Box>
    </Box>
  );
}

// Helper function to get the first date in YYYY-MM-DD from data.data
function getFirstDate(data) {
  if (data.data && data.data.length > 0 && data.data[0].TIMESTAMP) {
    const d = new Date(data.data[0].TIMESTAMP);
    // Use the local date string as base, then parse back to Date to avoid timezone issues
    const dateStr = d.toLocaleDateString("en-CA");
    return new Date(dateStr);
  }
  return null;
}

function getDateForIndex(key, index, data) {
  if (
    key === "M10" &&
    data.features.nonparam.M10_start &&
    data.features.nonparam.M10_start[index]
  ) {
    return data.features.nonparam.M10_start[index].split("T")[0];
  }
  if (
    key === "L5" &&
    data.features.nonparam.L5_start &&
    data.features.nonparam.L5_start[index]
  ) {
    return data.features.nonparam.L5_start[index].split("T")[0];
  }
  // For sleep features and RA, generate sequential dates if possible
  if (["TST", "WASO", "PTA", "NWB", "SOL", "RA"].includes(key.toUpperCase())) {
    const firstDate = getFirstDate(data);
    if (firstDate) {
      const d = new Date(firstDate);
      d.setDate(d.getDate() + index);
      return d.toLocaleDateString("en-CA");
    }
  }
  if (data.data && data.data[index] && data.data[index].TIMESTAMP) {
    return new Date(data.data[index].TIMESTAMP).toLocaleDateString("en-CA");
  }
  return `Day ${index + 1}`;
}

// Helper to clean and format feature names for display
const cleanFeatureName = (featureName) => {
  // Remove category prefixes from feature names
  const prefixes = ["sleep_", "cosinor_", "physical_activity_", "nonparam_"];
  let cleanedName = featureName;
  for (const prefix of prefixes) {
    if (cleanedName.startsWith(prefix)) {
      cleanedName = cleanedName.substring(prefix.length);
      break;
    }
  }
  // Replace underscores with spaces
  cleanedName = cleanedName.replace(/_/g, " ");
  // Special case for MESOR - keep it in all caps
  if (cleanedName.toLowerCase() === "mesor") {
    return "MESOR";
  }
  // Preserve original capitalization, only apply title case to all-lowercase words
  return cleanedName
    .split(" ")
    .map((word) => {
      if (word.toLowerCase() === "mesor") {
        return "MESOR";
      }
      // If the word is all lowercase, capitalize it
      if (word === word.toLowerCase()) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      // Otherwise, keep the original capitalization
      return word;
    })
    .join(" ");
};

function App() {
  const [data, setData] = useState(null);
  const [dataSource, setDataSource] = useState("");
  const [predictedAge, setPredictedAge] = useState(null);
  const [chronologicalAge, setChronologicalAge] = useState("");
  const [gender, setGender] = useState("invariant");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [preprocessDialogOpen, setPreprocessDialogOpen] = useState(false);
  const [preprocessParams, setPreprocessParams] = useState({
    autocalib_sd_criter: 0.00013,
    autocalib_sphere_crit: 0.02,
    filter_type: "lowpass",
    filter_cutoff: 2,
    wear_sd_crit: 0.00013,
    wear_range_crit: 0.00067,
    wear_window_length: 45,
    wear_window_skip: 7,
    required_daily_coverage: 0.5,
  });
  const [featureParams, setFeatureParams] = useState({
    sleep_rescore: true,
    sleep_ck_sf: 0.0025,
    pa_cutpoint_sl: 15,
    pa_cutpoint_lm: 35,
    pa_cutpoint_mv: 70,
  });
  const [currentTab, setCurrentTab] = useState(0);

  const [gettingStartedOpen, setGettingStartedOpen] = useState(false);
  // Add state for fileType
  const [fileType, setFileType] = useState("");
  // Add state for dataType
  const [dataType, setDataType] = useState("");
  // Add state for data unit selection
  const [dataUnit, setDataUnit] = useState("");
  // Add state for timestamp format selection
  const [timestampFormat, setTimestampFormat] = useState("");
  const [isGeneric, setIsGeneric] = useState(false);
  const [genericDataType, setGenericDataType] = useState("accelerometer-g");
  const [genericTimeFormat, setGenericTimeFormat] = useState("unix-ms");
  const [genericTimeColumn, setGenericTimeColumn] = useState("timestamp");
  const [genericDataColumns, setGenericDataColumns] = useState("x,y,z");

  // Column selection state
  const [csvColumns, setCsvColumns] = useState([]);
  const [csvPreview, setCsvPreview] = useState([]);
  const [showColumnSelection, setShowColumnSelection] = useState(false);
  const [selectedTimeColumn, setSelectedTimeColumn] = useState("");
  const [selectedDataColumns, setSelectedDataColumns] = useState([]);
  const [columnSelectionComplete, setColumnSelectionComplete] = useState(false);

  // Update dataType when fileType changes
  useEffect(() => {
    if (fileType === "binary") {
      setDataType("accelerometer");
    } else if (fileType === "csv") {
      // Only auto-set dataType if not 'other' data source
      if (dataSource !== "other") {
        setDataType("enmo");
      }
    } else {
      setDataType("");
    }
  }, [fileType, dataSource]);

  // Update fileType and dataType when dataSource changes
  useEffect(() => {
    if (dataSource === "other") {
      setFileType("csv");
      // Don't auto-set dataType for 'other' - let user choose
      setDataType("");
    } else if (dataSource === "") {
      setFileType("");
      setDataType("");
    }

    // Reset column selection state when data source changes
    setShowColumnSelection(false);
    setColumnSelectionComplete(false);
    setSelectedTimeColumn("");
    setSelectedDataColumns([]);
    setCsvColumns([]);
    setCsvPreview([]);
  }, [dataSource]);



  // Clear all state on mount
  useEffect(() => {
    // Always clear localStorage on page reload to start fresh
    localStorage.clear();
  }, []);

  // Log when component re-renders
  useEffect(() => {
    console.log("App component re-rendered at:", new Date().toISOString());
    console.log("Current dataUnit state:", dataUnit);
    console.log("Current dataType state:", dataType);
    console.log("Current timestampFormat state:", timestampFormat);
  });

  // Log when dataType changes
  useEffect(() => {
    console.log("dataType changed to:", dataType);
    console.log("dataUnit state when dataType changes:", dataUnit);
  }, [dataType, dataUnit]);

  // Check if column selection is complete
  useEffect(() => {
    if (showColumnSelection && data?.file_id) {
      const isComplete =
        ((fileType === "csv" &&
          selectedTimeColumn &&
          selectedDataColumns.length > 0) ||
          fileType !== "csv") &&
        timestampFormat &&
        (dataType === "alternative_count" ||
          dataUnit ||
          dataType.includes("-"));

      if (isComplete && !columnSelectionComplete) {
        setColumnSelectionComplete(true);
        // Automatically trigger column selection
        setTimeout(() => handleColumnSelection(), 100);
      }
    }
  }, [
    showColumnSelection,
    data?.file_id,
    fileType,
    selectedTimeColumn,
    selectedDataColumns,
    timestampFormat,
    dataType,
    dataUnit,
    columnSelectionComplete,
  ]);

  // Prevent unnecessary re-renders on initial load
  useEffect(() => {
    if (data?.features && !localStorage.getItem("featuresLoaded")) {
      localStorage.setItem("featuresLoaded", "true");
      // Instead of reloading, just update the state
      //setData(prev => ({ ...prev }));
    }
  }, [data?.features]);

  // Function to start the timer
  const startTimer = () => {
    // Clear any existing timer first
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setProcessingTime(0);
    const interval = setInterval(() => {
      setProcessingTime((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  // Function to stop the timer
  const stopTimer = useCallback(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [timerInterval]);

  // Clean up timer on component unmount and when processing state changes
  useEffect(() => {
    if (!processing && timerInterval) {
      stopTimer();
    }
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [processing, timerInterval, stopTimer]);

  // Format time in MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const fetchColumnNames = async (fileId) => {
    try {
      // For CSV files, fetch column names and preview
      if (fileType === "csv") {
        const response = await fetch(config.getApiUrl(`columns/${fileId}`));
        if (!response.ok) {
          throw new Error("Failed to fetch column names");
        }
        const result = await response.json();
        setCsvColumns(result.columns);

        // Fetch CSV preview data
        try {
          const previewResponse = await fetch(
            config.getApiUrl(`preview/${fileId}`)
          );
          if (previewResponse.ok) {
            const previewResult = await previewResponse.json();
            setCsvPreview(previewResult.preview || []);
          } else {
            console.warn(
              "Failed to fetch CSV preview, continuing without preview"
            );
            setCsvPreview([]);
          }
        } catch (err) {
          console.warn("Error fetching CSV preview:", err);
          setCsvPreview([]);
        }

        // Set default selections based on data type
        if (dataType === "accelerometer") {
          setSelectedTimeColumn(
            result.columns.find(
              (col) =>
                col.toLowerCase().includes("time") ||
                col.toLowerCase().includes("timestamp")
            ) || result.columns[0]
          );
          setSelectedDataColumns(
            ["x", "y", "z"].filter((col) => result.columns.includes(col))
          );
        } else if (dataType === "enmo") {
          setSelectedTimeColumn(
            result.columns.find(
              (col) =>
                col.toLowerCase().includes("time") ||
                col.toLowerCase().includes("timestamp")
            ) || result.columns[0]
          );
          setSelectedDataColumns([
            result.columns.find((col) => col.toLowerCase().includes("enmo")) ||
              result.columns[1],
          ]);
        } else if (dataType === "alternative_count") {
          setSelectedTimeColumn(
            result.columns.find(
              (col) =>
                col.toLowerCase().includes("time") ||
                col.toLowerCase().includes("timestamp")
            ) || result.columns[0]
          );
          setSelectedDataColumns([
            result.columns.find((col) => col.toLowerCase().includes("count")) ||
              result.columns[1],
          ]);
        }
      } else {
        // For non-CSV files, just set empty arrays
        setCsvColumns([]);
        setCsvPreview([]);
      }

      console.log("=== Opening Column Selection Dialog ===");
      console.log("fileType:", fileType);
      console.log("dataType:", dataType);
      console.log("dataUnit:", dataUnit);
      console.log("timestampFormat:", timestampFormat);
      console.log("csvColumns:", csvColumns);
      console.log("csvPreview length:", csvPreview.length);

      // Reset dataUnit to empty string when opening dialog
      setDataUnit("");
      setShowColumnSelection(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleColumnSelection = async () => {
    try {
      // Validate required parameters
      if (!timestampFormat) {
        throw new Error("Please select a timestamp format");
      }

      if (dataType !== "alternative_count" && !dataUnit) {
        throw new Error("Please select a data unit");
      }

      if (
        fileType === "csv" &&
        (!selectedTimeColumn || selectedDataColumns.length === 0)
      ) {
        throw new Error("Please select time and data columns");
      }

      // Log current state
      console.log("=== Column Selection Debug ===");
      console.log("dataType:", dataType);
      console.log("dataUnit:", dataUnit);
      console.log("timestampFormat:", timestampFormat);
      console.log("selectedTimeColumn:", selectedTimeColumn);
      console.log("selectedDataColumns:", selectedDataColumns);
      console.log("fileType:", fileType);
      console.log("genericTimeFormat:", genericTimeFormat);

      // Construct data_type from dataType and dataUnit
      let data_type;

      if (dataType === "alternative_count") {
        data_type = "alternative_count";
      } else if (dataType === "accelerometer" && dataUnit) {
        data_type = `accelerometer-${dataUnit}`;
      } else if (dataType === "enmo" && dataUnit) {
        data_type = `enmo-${dataUnit}`;
      } else if (dataType) {
        // Fallback to just dataType if no unit is selected
        data_type = dataType;
      } else {
        // If dataType is null/undefined, set a default
        data_type = "unknown";
      }

      console.log("Using data_type:", data_type);

      // For non-CSV files, use generic parameters; for CSV files, use selected columns
      const requestBody = {
        time_format: fileType === "csv" ? timestampFormat : genericTimeFormat,
        data_unit: dataUnit,
        data_type: data_type,
      };

      console.log("=== Final Request Body ===");
      console.log("time_format:", requestBody.time_format);
      console.log("data_unit:", requestBody.data_unit);
      console.log("data_type:", requestBody.data_type);

      if (fileType === "csv") {
        requestBody.time_column = selectedTimeColumn;
        requestBody.data_columns = selectedDataColumns;
      } else {
        requestBody.time_column = genericTimeColumn;
        requestBody.data_columns = genericDataColumns;
      }

      console.log("Request body being sent to backend:", requestBody);

      const response = await fetch(
        config.getApiUrl(`update_columns/${data.file_id}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to update column selections"
        );
      }

      setColumnSelectionComplete(true);
      setSuccess(
        'Column selections updated successfully. Click "Process Data" to continue.'
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileUpload = async (event) => {
    console.log("handleFileUpload called", event);
    console.log("Current dataSource:", dataSource);
    const file = event.target.files[0];
    if (!file) return;

    // File size limit: 2GB
    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes
    if (file.size > MAX_SIZE) {
      setError("File is too large. Maximum allowed size is 2GB.");
      setUploadProgress(0);
      return;
    }

    setError(null);
    setSuccess(null);
    setData(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    // Set data_source based on dataSource for backend compatibility
    formData.append(
      "data_source",
      dataSource === "other"
        ? "other"
        : fileType === "binary"
        ? "samsung_galaxy_binary"
        : "samsung_galaxy_csv"
    );

    console.log("=== Upload Debug ===");
    console.log("dataSource:", dataSource);
    console.log("fileType:", fileType);
    console.log("dataType:", dataType);
    console.log("dataUnit:", dataUnit);
    console.log("timestampFormat:", timestampFormat);

    // Add parameters for other data source
    if (dataSource === "other") {
      // For CSV files, we'll handle data_type in the column selection step
      if (fileType === "csv") {
        // Don't set data_type here - it will be set in handleColumnSelection
        formData.append("time_format", timestampFormat || "unix-ms"); // Default timestamp format
        console.log("Added time_format (CSV):", timestampFormat || "unix-ms");
      } else {
        // For other cases, use generic parameters
        // Don't set data_type here - it will be set in handleColumnSelection
        formData.append("time_format", genericTimeFormat);
        console.log("Added time_format (non-CSV):", genericTimeFormat);
      }
      formData.append("time_column", genericTimeColumn);
      formData.append("data_columns", genericDataColumns);
      console.log("Added time_column:", genericTimeColumn);
      console.log("Added data_columns:", genericDataColumns);
    }

    // For Samsung Galaxy CSV with alternative_counts, we'll handle data_type in the column selection step
    // Don't set data_type here - it will be set in handleColumnSelection

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          setData(result);
          setUploadProgress(100);

          // For all cases where data_type needs to be computed from dataType + dataUnit, fetch column names
          if (
            (dataSource === "other" && fileType === "csv") ||
            (dataSource === "samsung_galaxy_csv" &&
              dataType === "alternative_count") ||
            (dataSource === "other" && fileType !== "csv")
          ) {
            fetchColumnNames(result.file_id);
          } else {
            setSuccess(
              'File uploaded successfully. Click "Process Data" to continue.'
            );
          }
        } else {
          const errorData = JSON.parse(xhr.responseText);
          throw new Error(errorData.detail || "Failed to upload file");
        }
      });

      xhr.addEventListener("error", () => {
        throw new Error("Network error occurred during upload");
      });

      xhr.open("POST", config.getApiUrl("upload"));
      xhr.send(formData);
    } catch (err) {
      setError(err.message);
      setUploadProgress(0);
    }
  };

  const handleProcessData = async () => {
    if (!data?.file_id) {
      setError("No file uploaded");
      return;
    }

    // For all cases where data_type needs to be computed from dataType + dataUnit, ensure column selection is complete
    if (
      (dataSource === "other" && !columnSelectionComplete) ||
      (dataSource === "samsung_galaxy_csv" &&
        dataType === "alternative_count" &&
        !columnSelectionComplete)
    ) {
      setError("Please complete column selection before processing data");
      return;
    }

    // If data is already processed, don't process again
    if (data.data && data.features) {
      setSuccess("Data is already processed.");
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);
    startTimer(); // Start the timer

    try {
      // First extract the files
      const extractResponse = await fetch(
        config.getApiUrl(`extract/${data.file_id}`),
        {
          method: "POST",
        }
      );

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.detail || "Failed to extract files");
      }

      const extractResult = await extractResponse.json();

      // Then process the data with parameters
      const processResponse = await fetch(
        config.getApiUrl(`process/${data.file_id}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            preprocess_args: preprocessParams,
            features_args: featureParams,
          }),
        }
      );

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.detail || "Failed to process data");
      }

      const processResult = await processResponse.json();

      // Debug logging
      console.log("Processed data:", processResult);
      console.log("Non-parametric features:", processResult.features?.nonparam);

      // Update state with both extract and process results
      setData((prev) => ({
        ...prev,
        ...extractResult,
        ...processResult,
        data: processResult.data,
        features: processResult.features,
        extracted: true,
        processed: true, // Add a flag to indicate processing is complete
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
      stopTimer(); // Stop the timer
    }
  };

  // Helper to interpolate between red and green
  function interpolateColor(wear) {
    // Linear interpolation between #ff5252 and #4caf50
    const r0 = 255,
      g0 = 82,
      b0 = 82; // red
    const r1 = 76,
      g1 = 175,
      b1 = 80; // green
    const r = Math.round(r0 + (r1 - r0) * wear);
    const g = Math.round(g0 + (g1 - g0) * wear);
    const b = Math.round(b0 + (b1 - b0) * wear);
    return `rgb(${r},${g},${b})`;
  }

  const handlePredictAge = async () => {
    if (!data?.file_id || !chronologicalAge) {
      setError("Please enter chronological age and ensure data is processed");
      return;
    }

    try {
      const response = await fetch(
        config.getApiUrl(`predict_age/${data.file_id}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chronological_age: parseFloat(chronologicalAge),
            gender: gender,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to predict age");
      }

      const result = await response.json();
      setPredictedAge(result.predicted_age);
    } catch (err) {
      setError(err.message);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dataSource || !fileType) return; // Only allow drag if both dataSource and fileType are selected
    if (dataSource === "other" && !dataType) return; // Also require dataType for 'other' data source
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dataSource || !fileType) return; // Only allow drop if both dataSource and fileType are selected
    if (dataSource === "other" && !dataType) return; // Also require dataType for 'other' data source
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  // Add handler for parameter changes
  const handlePreprocessParamChange = (param, value) => {
    // Convert numeric parameters to numbers, keep strings for non-numeric parameters
    let processedValue = value;

    // List of numeric parameters
    const numericParams = [
      "autocalib_sd_criter",
      "autocalib_sphere_crit",
      "filter_cutoff",
      "wear_sd_crit",
      "wear_range_crit",
      "wear_window_length",
      "wear_window_skip",
      "required_daily_coverage",
    ];

    // Convert to number if it's a numeric parameter and the value is not empty
    if (
      numericParams.includes(param) &&
      value !== "" &&
      value !== null &&
      value !== undefined
    ) {
      processedValue = parseFloat(value);
      // If conversion fails, keep the original value
      if (isNaN(processedValue)) {
        processedValue = value;
      }
    }

    setPreprocessParams((prev) => ({
      ...prev,
      [param]: processedValue,
    }));
  };

  const handleFeatureParamChange = (param, value) => {
    // Convert numeric parameters to numbers, keep booleans for boolean parameters
    let processedValue = value;

    // List of numeric parameters
    const numericParams = [
      "sleep_ck_sf",
      "pa_cutpoint_sl",
      "pa_cutpoint_lm",
      "pa_cutpoint_mv",
    ];

    // List of boolean parameters
    const booleanParams = ["sleep_rescore"];

    // Convert to number if it's a numeric parameter and the value is not empty
    if (
      numericParams.includes(param) &&
      value !== "" &&
      value !== null &&
      value !== undefined
    ) {
      processedValue = parseFloat(value);
      // If conversion fails, keep the original value
      if (isNaN(processedValue)) {
        processedValue = value;
      }
    }
    // Keep boolean values as is for boolean parameters
    else if (booleanParams.includes(param)) {
      processedValue = value; // This should already be a boolean from the Switch component
    }

    setFeatureParams((prev) => ({
      ...prev,
      [param]: processedValue,
    }));
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };



  const handleReset = () => {
    setData(null);
    setDataSource("");
    setFileType("");
    setDataType("");
    setDataUnit("");
    setTimestampFormat("");
    setError(null);
    setSuccess(null);
    setProcessing(false);
    setProcessingTime(0);
    setChronologicalAge("");
    setGender("invariant");
    setPredictedAge(null);
    setPreprocessParams({
      autocalib_sd_criter: 0.00013,
      autocalib_sphere_crit: 0.02,
      filter_type: "lowpass",
      filter_cutoff: 2,
      wear_sd_crit: 0.00013,
      wear_range_crit: 0.00067,
      wear_window_length: 45,
      wear_window_skip: 7,
      required_daily_coverage: 0.5,
    });
    setFeatureParams({
      sleep_rescore: true,
      sleep_ck_sf: 0.0025,
      pa_cutpoint_sl: 15,
      pa_cutpoint_lm: 35,
      pa_cutpoint_mv: 70,
    });
    // Reset column selection state
    setShowColumnSelection(false);
    setColumnSelectionComplete(false);
    setSelectedTimeColumn("");
    setSelectedDataColumns([]);
    setCsvColumns([]);
    setCsvPreview([]);
  };

  // Scroll to top when changing tabs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);



  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box
        sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}
      >
        <AppBar position="static" sx={{ bgcolor: "primary.main" }}>
          <Toolbar>
            <Typography
              variant="h4"
              component="div"
              sx={{
                flexGrow: 0,
                fontWeight: 800,
                letterSpacing: 1,
                pl: 0,
                ml: 0,
                color: "white",
                lineHeight: 1.1,
              }}
            >
              CosinorLab
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img
                src={logo}
                alt="Logo"
                style={{
                  height: "40px",
                  marginLeft: "16px",
                  filter: "brightness(0) invert(1)", // This makes the logo white
                }}
              />
            </Box>
          </Toolbar>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              bgcolor: "primary.main",
              borderBottom: 1,
              borderColor: "primary.dark",
              maxWidth: 600,
              mx: "auto",
              minHeight: 48,
              "& .MuiTabs-indicator": {
                backgroundColor: "white",
                height: 2,
              },
              "& .MuiTabs-flexContainer": {
                justifyContent: "center",
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.9rem",
                minWidth: 100,
                padding: "8px 12px",
                color: "white",
                minHeight: 48,
                "&.Mui-selected": {
                  color: "white",
                  fontWeight: 600,
                },
                "&:hover": {
                  color: "white",
                  backgroundColor: "primary.dark",
                },
                "& .MuiSvgIcon-root": {
                  color: "white",
                },
              },
            }}
          >
            <Tab
              label="Home"
              icon={<HomeIcon sx={{ fontSize: "1.2rem" }} />}
              iconPosition="start"
            />
            <Tab
              label="Documentation"
              icon={<MenuBookIcon sx={{ fontSize: "1.2rem" }} />}
              iconPosition="start"
            />
            <Tab
              label="Lab"
              icon={<ScienceIcon sx={{ fontSize: "1.2rem" }} />}
              iconPosition="start"
            />
            <Tab
              label="About"
              icon={<InfoIcon sx={{ fontSize: "1.2rem" }} />}
              iconPosition="start"
            />
          </Tabs>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {currentTab === 0 && <HomeTab setCurrentTab={setCurrentTab} />}
          {currentTab === 1 && <DocumentationTab />}
          {currentTab === 2 && (
            <LabTab
              data={data}
              setData={setData}
              dataSource={dataSource}
              setDataSource={setDataSource}
              predictedAge={predictedAge}
              setPredictedAge={setPredictedAge}
              chronologicalAge={chronologicalAge}
              setChronologicalAge={setChronologicalAge}
              gender={gender}
              setGender={setGender}
              error={error}
              setError={setError}
              success={success}
              setSuccess={setSuccess}
              processing={processing}
              setProcessing={setProcessing}
              processingTime={processingTime}
              setProcessingTime={setProcessingTime}
              timerInterval={timerInterval}
              setTimerInterval={setTimerInterval}
              dragActive={dragActive}
              setDragActive={setDragActive}
              uploadProgress={uploadProgress}
              setUploadProgress={setUploadProgress}
              fileInputRef={fileInputRef}
              preprocessDialogOpen={preprocessDialogOpen}
              setPreprocessDialogOpen={setPreprocessDialogOpen}
              preprocessParams={preprocessParams}
              setPreprocessParams={setPreprocessParams}
              featureParams={featureParams}
              setFeatureParams={setFeatureParams}
              gettingStartedOpen={gettingStartedOpen}
              setGettingStartedOpen={setGettingStartedOpen}
              fileType={fileType}
              setFileType={setFileType}
              dataType={dataType}
              setDataType={setDataType}
              dataUnit={dataUnit}
              setDataUnit={setDataUnit}
              timestampFormat={timestampFormat}
              setTimestampFormat={setTimestampFormat}
              isGeneric={isGeneric}
              setIsGeneric={setIsGeneric}
              genericDataType={genericDataType}
              setGenericDataType={setGenericDataType}
              genericTimeFormat={genericTimeFormat}
              setGenericTimeFormat={setGenericTimeFormat}
              genericTimeColumn={genericTimeColumn}
              setGenericTimeColumn={setGenericTimeColumn}
              genericDataColumns={genericDataColumns}
              setGenericDataColumns={setGenericDataColumns}
              csvColumns={csvColumns}
              setCsvColumns={setCsvColumns}
              csvPreview={csvPreview}
              setCsvPreview={setCsvPreview}
              showColumnSelection={showColumnSelection}
              setShowColumnSelection={setShowColumnSelection}
              selectedTimeColumn={selectedTimeColumn}
              setSelectedTimeColumn={setSelectedTimeColumn}
              selectedDataColumns={selectedDataColumns}
              setSelectedDataColumns={setSelectedDataColumns}
              columnSelectionComplete={columnSelectionComplete}
              setColumnSelectionComplete={setColumnSelectionComplete}
              handleReset={handleReset}
            />
          )}

          {currentTab === 3 && <AboutTab />}
        </Container>
      </Box>

      {/* Getting Started Dialog */}
      <Dialog
        open={gettingStartedOpen}
        onClose={() => setGettingStartedOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Getting Started with CosinorLab</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Welcome to CosinorLab! To help you explore the interface, we've
            provided a sample file containing mock accelerometer data.
          </Typography>

          <Typography variant="body1" paragraph>
            This is an example file containing mock accelerometer data which can
            be used to explore the UI. For uploading this file, you should
            select:
          </Typography>

          <Box
            sx={{
              bgcolor: "grey.50",
              p: 2,
              borderRadius: 1,
              mb: 3,
              border: "1px solid",
              borderColor: "grey.300",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Recommended Settings:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Data Source: <strong>Other</strong>
              <br />• File Type: <strong>CSV</strong>
              <br />• Data Type: <strong>Accelerometer</strong>
              <br />• Timestamp Format: <strong>Unix - milliseconds</strong>
              <br />• Data Unit: <strong>g</strong>
              <br />• Time Column: <strong>timestamp</strong>
              <br />• Data Columns: <strong>x,y,z</strong>
              <br />
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const link = document.createElement("a");
                link.href = config.getApiUrl("download/sample");
                link.download = "sample_data2.csv";
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                mb: 2,
              }}
            >
              Download Sample CSV File
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center">
            After downloading, you can upload this file to explore the
            CosinorLab interface and see how the analysis works.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGettingStartedOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default App;