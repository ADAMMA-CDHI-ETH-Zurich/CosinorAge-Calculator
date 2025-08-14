import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  CssBaseline,
  ThemeProvider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  DialogActions,
  Fade,
  Slide,
  useScrollTrigger,
  Fab,
  Zoom,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ScienceIcon from "@mui/icons-material/Science";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import InfoIcon from "@mui/icons-material/Info";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import logo from "./assets/eth_logo.png";
import harvardLogo from "./assets/harvard_logo.png";
import singleDemoVideo from "./assets/CL_Single_Demo.mp4";
import multiDemoVideo from "./assets/CL_Multi_Demo.mp4";
import HomeTab from "./components/HomeTab";
import DocumentationTab from "./components/DocumentationTab";
import LabTab from "./components/LabTab";
import AboutTab from "./components/AboutTab";
import ParallaxBackground from "./components/ParallaxBackground";
import ModernLoadingSpinner from "./components/ModernLoadingSpinner";
import config from "./config";
import { appTheme } from "./theme";
import { useTimer } from "./hooks/useTimer";
import { useFileUpload } from "./hooks/useFileUpload";

// Scroll to top component
function ScrollTop(props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-anchor',
    );

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

// Enhanced AppBar component
function EnhancedAppBar({ currentTab, handleTabChange }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: 'primary.main',
        backdropFilter: 'blur(10px)',
        backgroundColor: scrollY > 50 ? 'rgba(26, 26, 26, 0.9)' : 'rgba(26, 26, 26, 0.95)',
        transition: 'all 0.3s ease-in-out',
        boxShadow: scrollY > 50 
          ? '0 4px 20px rgba(0,0,0,0.15)' 
          : '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1200,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Horizontal scrolling progress bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))',
          transform: `scaleX(${Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1)})`,
          transformOrigin: 'left',
          transition: 'transform 0.1s ease-out',
          zIndex: 1201,
          boxShadow: '0 1px 3px rgba(255,255,255,0.2)',
        }}
      />
      
      <Toolbar sx={{ minHeight: '64px !important', py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Fade in timeout={800}>
            <Typography
              variant="h4"
              component="div"
              sx={{
                flexGrow: 0,
                fontWeight: 700,
                letterSpacing: 0.5,
                pl: 0,
                ml: 0,
                color: "white",
                lineHeight: 1.1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 0.9,
                }
              }}
            >
              CosinorAge Calculator
            </Typography>
          </Fade>
          
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              bgcolor: 'transparent',
              borderBottom: 'none',
              minHeight: 48,
              "& .MuiTabs-indicator": {
                backgroundColor: "white",
                height: 2,
                borderRadius: '1px',
              },
              "& .MuiTabs-flexContainer": {
                justifyContent: "flex-start",
                gap: 1,
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.9rem",
                minWidth: 100,
                padding: "8px 16px",
                color: "rgba(255,255,255,0.7)",
                minHeight: 48,
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                position: 'relative',
                "&.Mui-selected": {
                  color: "white",
                  fontWeight: 600,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  "& .MuiSvgIcon-root": {
                    color: "white",
                  }
                },
                "&:hover": {
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.08)",
                },
                "& .MuiSvgIcon-root": {
                  color: "currentColor",
                  transition: 'all 0.2s ease',
                  marginRight: '6px',
                  fontSize: '1.1rem',
                },
              },
            }}
          >
            <Tab
              label="Home"
              icon={<HomeIcon sx={{ fontSize: "1.3rem" }} />}
              iconPosition="start"
            />
            <Tab
              label="Documentation"
              icon={<MenuBookIcon sx={{ fontSize: "1.3rem" }} />}
              iconPosition="start"
            />
            <Tab
              label="Calculator"
              icon={<ScienceIcon sx={{ fontSize: "1.3rem" }} />}
              iconPosition="start"
            />
            <Tab
              label="About"
              icon={<InfoIcon sx={{ fontSize: "1.3rem" }} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        <Fade in timeout={1000}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <a
              href="https://ethz.ch"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <img
                src={logo}
                alt="ETH Logo"
                style={{
                  height: "28px",
                  filter: "brightness(0) invert(1)",
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                }}
              />
            </a>
            <a
              href="https://www.harvard.edu"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <img
                  src={harvardLogo}
                  alt="Harvard Logo"
                  style={{
                    height: "32px",
                    backgroundColor: "transparent",
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                  }}
                />
                <img
                  src={harvardLogo}
                  alt="Harvard Logo Text"
                  style={{
                    height: "32px",
                    filter: "brightness(0) invert(1)",
                    backgroundColor: "transparent",
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    clipPath: 'polygon(27% 0%, 100% 0%, 100% 100%, 27% 100%)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                  }}
                />
              </Box>
            </a>
          </Box>
        </Fade>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  // Use custom hooks for timer and file upload functionality
  const {
    processingTime,
    setProcessingTime,
    timerInterval,
    setTimerInterval,
    startTimer,
    stopTimer,
  } = useTimer();

  const {
    data,
    setData,
    error,
    setError,
    success,
    setSuccess,
    uploadProgress,
    setUploadProgress,
    dragActive,
    setDragActive,
    fileInputRef,
    handleFileUpload,
    handleDrag,
    handleDrop,
  } = useFileUpload();

  const [dataSource, setDataSource] = useState("");
  const [predictedAge, setPredictedAge] = useState(null);
  const [chronologicalAge, setChronologicalAge] = useState("");
  const [gender, setGender] = useState("invariant");
  const [processing, setProcessing] = useState(false);
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
  const [currentTab, setCurrentTab] = useState(() => {
    const savedTab = localStorage.getItem("currentTab");
    return savedTab ? parseInt(savedTab, 10) : 0;
  });

  const [gettingStartedOpen, setGettingStartedOpen] = useState(false);
  const [currentLabSubTab, setCurrentLabSubTab] = useState("single");
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

  // Timezone state
  const [timezone, setTimezone] = useState("UTC");
  const [timezoneContinent, setTimezoneContinent] = useState("");
  const [timezoneCity, setTimezoneCity] = useState("");
  const videoRef = useRef(null);

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

  // Note: Removed localStorage.clear() to preserve tab state persistence

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
        ((timestampFormat === "datetime") || (timestampFormat !== "datetime" && timezone)) &&
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
    timezone,
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

  // Clean up timer on component unmount and when processing state changes
  useEffect(() => {
    if (!processing && timerInterval) {
      stopTimer();
    }
  }, [processing, timerInterval, stopTimer]);

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

      if (timestampFormat !== "datetime" && !timezone) {
        throw new Error("Please select a timezone for Unix timestamp formats");
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

      // Only include timezone for unix formats
      if (timestampFormat !== "datetime") {
        requestBody.time_zone = timezone;
      }

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

  const handleFileUploadWithParams = async (event) => {
    // Call the hook's handleFileUpload with all required parameters
    await handleFileUpload(
      event,
      dataSource,
      fileType,
      dataType,
      timestampFormat,
      genericTimeFormat,
      genericTimeColumn,
      genericDataColumns
    );

    // After successful upload, handle column selection if needed
    if (data?.file_id) {
      if (
        (dataSource === "other" && fileType === "csv") ||
        (dataSource === "samsung_galaxy" && fileType === "csv" && dataType === "alternative_count") ||
        (dataSource === "other" && fileType !== "csv") ||
        (dataSource === "samsung_galaxy" && fileType === "binary")
      ) {
        fetchColumnNames(data.file_id);
      }
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
      (dataSource === "samsung_galaxy" && fileType === "csv" && dataType === "alternative_count" && !columnSelectionComplete) ||
      (dataSource === "samsung_galaxy" && fileType === "binary" && !columnSelectionComplete)
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

  // Drag and drop handlers with parameters
  const handleDragWithParams = (e) => {
    handleDrag(e, dataSource, fileType, dataType);
  };

  const handleDropWithParams = (e) => {
    handleDrop(e, dataSource, fileType, dataType);
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

  // Save currentTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("currentTab", currentTab.toString());
  }, [currentTab]);

  const handleReset = async () => {
    try {
      // Clear all uploaded files and directories from the server
      await fetch(config.getApiUrl("clear_all_state"), {
        method: "POST",
      });
    } catch (error) {
      console.warn("Failed to clear server state:", error);
    }

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
    // Reset timezone state
    setTimezone("UTC");
    setTimezoneContinent("");
    setTimezoneCity("");
  };

  // Scroll to top when changing tabs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

  // Auto-play video when getting started dialog opens
  useEffect(() => {
    if (gettingStartedOpen && videoRef.current) {
      // Small delay to ensure video is loaded
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(error => {
            console.log('Auto-play prevented by browser:', error);
          });
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [gettingStartedOpen, currentLabSubTab]);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <ParallaxBackground>
        <Box
          sx={{ flexGrow: 1, minHeight: "100vh" }}
        >
          <EnhancedAppBar currentTab={currentTab} handleTabChange={handleTabChange} />

          {/* Back to top anchor */}
          <Box id="back-to-top-anchor" />
          
          <Container maxWidth="lg" sx={{ mt: 20, mb: 4 }}>
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
                setCurrentLabSubTab={setCurrentLabSubTab}
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
                timezone={timezone}
                setTimezone={setTimezone}
                timezoneContinent={timezoneContinent}
                setTimezoneContinent={setTimezoneContinent}
                timezoneCity={timezoneCity}
                setTimezoneCity={setTimezoneCity}
                handleFileUpload={handleFileUploadWithParams}
                handleDrag={handleDragWithParams}
                handleDrop={handleDropWithParams}
                handleReset={handleReset}
              />
            )}

            {currentTab === 3 && <AboutTab />}
          </Container>
        </Box>
      </ParallaxBackground>

      {/* Getting Started Dialog */}
      <Dialog
        open={gettingStartedOpen}
        onClose={() => setGettingStartedOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Getting Started with CosinorAge Calculator - {currentLabSubTab === "single" ? "Single Individual" : "Multi Individual"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Welcome to CosinorAge Calculator! To help you explore the {currentLabSubTab === "single" ? "single individual" : "multi-individual"} interface, we've
            provided a sample file containing mock accelerometer data.
          </Typography>

          {currentLabSubTab === "single" ? (
            <>
              <Typography variant="body1" paragraph>
                This is an example file containing mock accelerometer data which can
                be used to explore the single individual analysis interface. For uploading this file, you should
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
                  Recommended Settings for Single Individual Analysis:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Data Source: <strong>Other</strong>
                  <br />• File Type: <strong>CSV</strong>
                  <br />• Data Type: <strong>Accelerometer</strong>
                  <br />• Timestamp Format: <strong>Unix - seconds</strong>
                  <br />• Data Unit: <strong>mg</strong>
                  <br />• Timezone: <strong>Pacific/Auckland</strong>
                  <br />• Time Column: <strong>timestamp</strong>
                  <br />• Data Columns: <strong>x,y,z</strong>
                  <br />
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" align="center">
                After downloading, you can upload this file to explore the
                single individual analysis interface and see how the analysis works.
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1" paragraph>
                This is a ZIP file containing multiple minute-level accelerometer data files that can
                be used to explore the multi-individual analysis interface. The ZIP contains multiple CSV files
                with the same structure, perfect for bulk processing.
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
                  Recommended Settings for Multi-Individual Analysis:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Data Type: <strong>Accelerometer</strong>
                  <br />• Data Unit: <strong>mg</strong>
                  <br />• Timestamp Format: <strong>Unix - seconds</strong>
                  <br />• Timezone: <strong>Pacific/Auckland</strong>
                  <br />• Time Column: <strong>timestamp</strong>
                  <br />• X Column: <strong>x</strong>
                  <br />• Y Column: <strong>y</strong>
                  <br />• Z Column: <strong>z</strong>
                  <br />
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" align="center">
                After downloading, extract the ZIP file and upload all the CSV files to explore the
                multi-individual analysis interface and see how bulk processing works.
              </Typography>
            </>
          )}

          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const link = document.createElement("a");
                const endpoint = currentLabSubTab === "single" ? "download/sample" : "download/sample-multi";
                const filename = currentLabSubTab === "single" ? "sample_data_single.csv" : "sample_data_multi.zip";
                link.href = config.getApiUrl(endpoint);
                link.download = filename;
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
                mt: 2,
              }}
            >
              {currentLabSubTab === "single" ? "Download Sample CSV File" : "Download Sample Multi-Individual ZIP"}
            </Button>
          </Box>

          {/* Demo Video Section */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              Demo Video
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Watch this demo to see how to use the {currentLabSubTab === "single" ? "single individual" : "multi-individual"} analysis interface.
            </Typography>
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center",
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <video
                ref={videoRef}
                controls
                autoPlay
                muted
                loop
                width="100%"
                style={{ maxWidth: "600px" }}
                preload="metadata"
                playsInline
              >
                <source 
                  src={currentLabSubTab === "single" ? singleDemoVideo : multiDemoVideo} 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </Box>
          </Box>

          {/* Multi-individual specific note and resample notebook */}
          {currentLabSubTab === "multi" && (
            <>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                <strong>Note:</strong> It is helpful to resample data to minute level prior to uploading, 
                as the amount of data that needs to be uploaded and processed on the server might be too large. 
                You can download a Python notebook below to help you resample your data locally.
              </Typography>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = config.getApiUrl("download/resample-notebook");
                    link.download = "resample_to_minute_level.ipynb";
                    link.target = "_blank";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontSize: "0.9rem",
                  }}
                >
                  Download Resample Notebook
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGettingStartedOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

             <ScrollTop>
         <Fab 
           color="primary" 
           size="small" 
           aria-label="scroll back to top"
           sx={{
             backgroundColor: 'rgba(255,255,255,0.9)',
             color: '#1A1A1A',
             boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
             transition: 'all 0.2s ease',
             '&:hover': {
               backgroundColor: 'rgba(255,255,255,1)',
               transform: 'translateY(-1px)',
               boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
             }
           }}
         >
           <KeyboardArrowUpIcon />
         </Fab>
       </ScrollTop>
    </ThemeProvider>
  );
}

export default App;
