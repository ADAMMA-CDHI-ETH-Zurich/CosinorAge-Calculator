import React, { useState, useEffect, useRef, useCallback } from "react";
import { metricDescriptions } from "../../constants/metricDescriptions";
import {
  formatTime,
  interpolateColor,
  cleanFeatureName,
} from "../../utils/formatUtils";
import { getFirstDate, getDateForIndex } from "../../utils/dateUtils";
import HorizontalScale from "../common/HorizontalScale";
import SectionInfoButton from "../common/SectionInfoButton";
import { CLColors } from "../../plotTheme";
import {
  Box,
  Container,
  Typography,
  Paper,
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
import RefreshIcon from "@mui/icons-material/Refresh";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningIcon from "@mui/icons-material/Warning";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorIcon from "@mui/icons-material/Error";
import BarChartIcon from "@mui/icons-material/BarChart";
import SGSBinaryZippedExample from "../../assets/SGS_Binary_Zipped_Example.png";
import SGSCSVExample from "../../assets/SGS_CSV_Example.png";
import config from "../../config";
import InfoIcon from "@mui/icons-material/Info";
import {
  fetchTimezones,
  filterTimezonesByContinent,
  searchTimezones,
} from "../../utils/timezoneUtils";

// Single Individual Lab Sub Tab Component
const SingleIndividualLabSubTab = ({
  data,
  setData,
  dataSource,
  setDataSource,
  predictedAge,
  setPredictedAge,
  chronologicalAge,
  setChronologicalAge,
  gender,
  setGender,
  error,
  setError,
  success,
  setSuccess,
  processing,
  setProcessing,
  processingTime,
  setProcessingTime,
  timerInterval,
  setTimerInterval,
  dragActive,
  setDragActive,
  uploadProgress,
  setUploadProgress,
  fileInputRef,
  preprocessDialogOpen,
  setPreprocessDialogOpen,
  preprocessParams,
  setPreprocessParams,
  featureParams,
  setFeatureParams,
  gettingStartedOpen,
  setGettingStartedOpen,
  fileType,
  setFileType,
  dataType,
  setDataType,
  dataUnit,
  setDataUnit,
  timestampFormat,
  setTimestampFormat,
  isGeneric,
  setIsGeneric,
  genericDataType,
  setGenericDataType,
  genericTimeFormat,
  setGenericTimeFormat,
  genericTimeColumn,
  setGenericTimeColumn,
  genericDataColumns,
  setGenericDataColumns,
  csvColumns,
  setCsvColumns,
  csvPreview,
  setCsvPreview,
  showColumnSelection,
  setShowColumnSelection,
  selectedTimeColumn,
  setSelectedTimeColumn,
  selectedDataColumns,
  setSelectedDataColumns,
  columnSelectionComplete,
  setColumnSelectionComplete,
  timezone,
  setTimezone,
  timezoneContinent,
  setTimezoneContinent,
  timezoneCity,
  setTimezoneCity,
  handleReset,
}) => {
  // Timezone state
  const [timezones, setTimezones] = useState({});
  const [timezoneSearchResults, setTimezoneSearchResults] = useState([]);
  const [timezoneSearchOpen, setTimezoneSearchOpen] = useState(false);

  // Load timezones on component mount
  useEffect(() => {
    const loadTimezones = async () => {
      try {
        const timezoneData = await fetchTimezones();
        setTimezones(timezoneData.timezones);
      } catch (error) {
        console.error("Failed to load timezones:", error);
      }
    };
    loadTimezones();
  }, []);

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

          // More flexible accelerometer column selection
          const accelColumns = [];
          const targetColumns = ["x", "y", "z"];

          // First try exact matches (case-insensitive)
          for (const target of targetColumns) {
            const exactMatch = result.columns.find(
              (col) => col.toLowerCase() === target.toLowerCase()
            );
            if (exactMatch) {
              accelColumns.push(exactMatch);
            }
          }

          // If we don't have all 3, try partial matches
          if (accelColumns.length < 3) {
            for (const target of targetColumns) {
              if (
                !accelColumns.some(
                  (col) => col.toLowerCase() === target.toLowerCase()
                )
              ) {
                const partialMatch = result.columns.find((col) =>
                  col.toLowerCase().includes(target.toLowerCase())
                );
                if (partialMatch && !accelColumns.includes(partialMatch)) {
                  accelColumns.push(partialMatch);
                }
              }
            }
          }

          // If still don't have 3 columns, use first 3 non-time columns
          if (accelColumns.length < 3) {
            const nonTimeColumns = result.columns.filter(
              (col) =>
                !col.toLowerCase().includes("time") &&
                !col.toLowerCase().includes("timestamp")
            );
            accelColumns.push(
              ...nonTimeColumns.slice(0, 3 - accelColumns.length)
            );
          }

          console.log("Selected accelerometer columns:", accelColumns);
          setSelectedDataColumns(accelColumns);
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

      console.log("Sending timezone to backend:", timezone);
      console.log("Timezone value:", timezone);
      console.log("Timezone type:", typeof timezone);

      console.log("=== Final Request Body ===");
      console.log("time_format:", requestBody.time_format);
      console.log("data_unit:", requestBody.data_unit);
      console.log("data_type:", requestBody.data_type);
      console.log("time_zone:", requestBody.time_zone);

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
      console.log("Sending timezone in process request:", timezone);

      // Prepare the process request body
      const processRequestBody = {
        preprocess_args: preprocessParams,
        features_args: featureParams,
        time_zone: timezone,
      };

      // Add column information if column selection is complete
      if (columnSelectionComplete) {
        if (fileType === "csv") {
          processRequestBody.time_column = selectedTimeColumn;
          processRequestBody.data_columns = selectedDataColumns;
        } else {
          processRequestBody.time_column = genericTimeColumn;
          processRequestBody.data_columns = genericDataColumns;
        }

        // Add data type and format information
        let data_type;
        if (dataType === "alternative_count") {
          data_type = "alternative_count";
        } else if (dataType === "accelerometer" && dataUnit) {
          data_type = `accelerometer-${dataUnit}`;
        } else if (dataType === "enmo" && dataUnit) {
          data_type = `enmo-${dataUnit}`;
        } else if (dataType) {
          data_type = dataType;
        } else {
          data_type = "unknown";
        }

        processRequestBody.data_type = data_type;
        processRequestBody.time_format =
          fileType === "csv" ? timestampFormat : genericTimeFormat;
        processRequestBody.data_unit = dataUnit;
      }

      console.log("Process request body:", processRequestBody);

      const processResponse = await fetch(
        config.getApiUrl(`process/${data.file_id}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(processRequestBody),
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

  // Timezone handling functions
  const handleTimezoneContinentChange = (continent) => {
    setTimezoneContinent(continent);
    setTimezoneCity("");
    setTimezone("UTC"); // Reset to UTC when continent changes
  };

  const handleTimezoneCityChange = (city) => {
    setTimezoneCity(city);
    setTimezone(city);
    console.log("Timezone selected:", city);
  };

  const handleTimezoneSearch = (searchTerm) => {
    if (searchTerm.length < 2) {
      setTimezoneSearchResults([]);
      setTimezoneSearchOpen(false);
      return;
    }

    const results = searchTimezones(timezones, searchTerm);
    setTimezoneSearchResults(results);
    setTimezoneSearchOpen(true);
  };

  return (
    <>
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          {/* Getting Started Button - only show when no file is uploaded */}
          {!data?.file_id && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setGettingStartedOpen(true)}
              startIcon={<InfoIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              Getting Started
            </Button>
          )}
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "stretch", // changed from 'center' to 'stretch'
            width: "100%", // ensure full width
            maxWidth: "none", // remove any maxWidth restriction
            border: dragActive ? "2px dashed #0034f0" : "none",
            background: dragActive ? "rgba(33,150,243,0.05)" : undefined,
            position: "relative",
          }}
          onDragEnter={
            dataSource && (dataSource !== "other" || dataType)
              ? handleDrag
              : undefined
          }
          onDragOver={
            dataSource && (dataSource !== "other" || dataType)
              ? handleDrag
              : undefined
          }
          onDragLeave={
            dataSource && (dataSource !== "other" || dataType)
              ? handleDrag
              : undefined
          }
          onDrop={
            dataSource && (dataSource !== "other" || dataType)
              ? handleDrop
              : undefined
          }
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ textAlign: "left", width: "100%" }}
          >
            Data Upload
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select your data source and format, then upload your accelerometer
            data file. The system will guide you through the configuration
            process.
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="data-source-label">Data Source</InputLabel>
                <Select
                  labelId="data-source-label"
                  value={dataSource}
                  label="Data Source"
                  onChange={(e) => {
                    setDataSource(e.target.value);
                    setFileType("");
                    setDataType("");
                  }}
                  sx={{ minWidth: 120 }}
                  disabled={!!data?.file_id}
                >
                  <MenuItem value="samsung_galaxy">
                    Samsung Galaxy Smartwatch
                  </MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                <FormHelperText>
                  Choose the device type that generated your data
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="file-type-label">File Type</InputLabel>
                <Select
                  labelId="file-type-label"
                  value={fileType}
                  label="File Type"
                  onChange={(e) => setFileType(e.target.value)}
                  sx={{ minWidth: 120 }}
                  disabled={
                    !!data?.file_id || dataSource === "other" || !dataSource
                  }
                >
                  <MenuItem value="binary">Binary (Zipped)</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                </Select>
                <FormHelperText>
                  Select the format of your data file
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth disabled={dataSource !== "other"}>
                <InputLabel id="data-type-label">Data Type</InputLabel>
                <Select
                  labelId="data-type-label"
                  value={dataType}
                  label="Data Type"
                  onChange={(e) => setDataType(e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="accelerometer">Accelerometer</MenuItem>
                  <MenuItem value="enmo">ENMO</MenuItem>
                  <MenuItem value="alternative_count">
                    Alternative Count
                  </MenuItem>
                  {dataSource !== "other" && (
                    <>
                      <MenuItem value="raw">Raw</MenuItem>
                    </>
                  )}
                </Select>
                <FormHelperText>
                  Choose the type of movement data
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>

          {/* Wearable Fitness Devices Banner - appears at the very top when "other" is selected */}
          {dataSource === "other" && (
            <Box
              sx={{
                mt: 0,
                mb: 0,
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "success.main",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <InfoIcon sx={{ color: "success.main" }} />
                <Typography
                  variant="h6"
                  sx={{
                    color: "success.main",
                    fontWeight: 600,
                  }}
                >
                  Wearable Fitness Devices
                </Typography>
              </Box>
              <Typography variant="body2" paragraph sx={{ mb: -1 }}>
                This option is designed for data exported from any kinds of
                wearable fitness devices, such as Apple Watch or Garmin.
              </Typography>
            </Box>
          )}

          {((dataSource && fileType && dataType) ||
            (dataSource === "other" && fileType === "csv" && dataType)) && (
            <>
              {/* Helpful information box */}
              <Box
                sx={{
                  mt: 2,
                  mb: 3,
                  p: 2,
                  bgcolor: "#0034f0",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "#0034f0",
                }}
              >
                <Typography variant="body2" sx={{ color: "white" }}>
                  <strong>Ready to upload!</strong> Your data format has been
                  configured. You can now drag and drop your file or click the
                  upload button below. The system will automatically process
                  your data according to the selected format.
                </Typography>
              </Box>

              {/* Data Format Requirements for binary */}
              {fileType === "binary" && dataSource === "samsung_galaxy" && (
                <Box
                  sx={{
                    mt: 0,
                    mb: 0,
                    p: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "primary.light",
                    maxWidth: 1200,
                    mx: "auto",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: "primary.main",
                      fontWeight: 600,
                    }}
                  >
                    Data Format Requirements
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ mb: -1 }}>
                    The uploaded ZIP file is expected to follow a specific
                    structure: it should contain a single top-level parent
                    directory, within which there are subdirectories organized
                    by day. These daily subdirectories must contain binary
                    files. This layout corresponds to the default export format
                    (see example below).
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      width: "50%",
                      mx: "auto",
                      mt: 2,
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                    }}
                  >
                    <img
                      src={SGSBinaryZippedExample}
                      alt="Samsung Galaxy Smartwatch Binary Zipped Data Structure Example"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Data Format Requirements for CSV format */}
              {fileType === "csv" && dataSource === "samsung_galaxy" && (
                <Box
                  sx={{
                    mt: 0,
                    mb: 0,
                    p: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "primary.light",
                    maxWidth: 1200,
                    mx: "auto",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: "primary.main",
                      fontWeight: 600,
                    }}
                  >
                    Data Format Requirements
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ mb: -1 }}>
                    {dataType === "accelerometer" && (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: `The uploaded CSV file must contain raw accelerometer data collected from a smartwatch. It should include exactly four columns: <strong>'timestamp'</strong>, <strong>'x'</strong>, <strong>'y'</strong>, and <strong>'z'</strong>. The x, y, and z columns represent acceleration values along the three axes in ${dataUnit} units. The timestamp column should be in ${
                            timestampFormat === "unix-ms"
                              ? "Unix milliseconds"
                              : timestampFormat === "unix-s"
                              ? "Unix seconds"
                              : "datetime"
                          } format.`,
                        }}
                      />
                    )}
                    {dataType === "enmo" && (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: `The uploaded CSV file must contain ENMO (Euclidean Norm Minus One) data collected from a smartwatch.`,
                        }}
                      />
                    )}
                    {dataType === "alternative_counts" && (
                      <span
                        dangerouslySetInnerHTML={{
                          __html:
                            "The uploaded CSV file must contain alternative count data collected from a smartwatch. It should include exactly two columns: <strong>'timestamp'</strong> and <strong>'count'</strong>. Count values should represent activity counts or step counts over the specified time intervals.",
                        }}
                      />
                    )}
                    {!dataType && (
                      <span
                        dangerouslySetInnerHTML={{
                          __html:
                            "The uploaded CSV file must contain time series data collected from a smartwatch. It should include exactly two columns: <strong>'timestamp'</strong> and <strong>'data'</strong>. Please select a data type above to see specific requirements.",
                        }}
                      />
                    )}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 2,
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                    }}
                  >
                    <img
                      src={SGSCSVExample}
                      alt="Samsung Galaxy Smartwatch CSV ENMO Data Structure Example"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Disclaimers for Other data source */}
              {dataSource === "other" && (
                <>
                  {/* Validation Notice in Red Box */}
                  <Box
                    sx={{
                      mt: 0,
                      mb: 0,
                      p: 3,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "error.main",
                      maxWidth: 1200,
                      mx: "auto",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <WarningIcon sx={{ color: "error.main" }} />
                      <Typography
                        variant="h6"
                        sx={{
                          color: "error.main",
                          fontWeight: 600,
                        }}
                      >
                        Validation Notice
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph sx={{ mb: -1 }}>
                      The data preprocessing and biological age estimation
                      pipeline has been validated using data (raw accelerometer
                      and/or ENMO data) from the UK Biobank, NHANES, and Samsung
                      Galaxy Watch. Results from other devices may vary in
                      accuracy.
                    </Typography>
                  </Box>

                  {/* Data Format Requirements in Blue Box */}
                  {dataType && (
                    <Box
                      sx={{
                        mt: 0,
                        mb: 0,
                        p: 3,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "primary.main",
                        maxWidth: 1200,
                        mx: "auto",
                      }}
                    >
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          color: "primary.main",
                          fontWeight: 600,
                        }}
                      >
                        Data Format Requirements
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ mb: -1 }}>
                        {dataSource === "other" ? (
                          dataType === "accelerometer" ? (
                            <span>
                              The uploaded CSV file must contain raw accelerometer data collected from a smartwatch or wearable device. It should include a column containing timestamps and three data columns representing acceleration values along the x, y, and z axes in {dataUnit} units.
                            </span>
                          ) : dataType === "enmo" ? (
                            <span>
                              The uploaded CSV file must contain ENMO (Euclidean Norm Minus One) data collected from a smartwatch or wearable device. It should include a column containing timestamps and a data column with ENMO values.
                            </span>
                          ) : dataType === "alternative_count" ? (
                            <span>
                              The uploaded CSV file must contain alternative count data collected from a smartwatch or wearable device. It should include a column containing timestamps and a data column with count values representing activity counts or step counts over the specified time intervals.
                            </span>
                          ) : (
                            <span>
                              The uploaded CSV file must contain time series data collected from a smartwatch or wearable device. Please ensure your file is formatted as time series data with appropriate timestamp and measurement columns.
                            </span>
                          )
                        ) : dataType === "accelerometer" ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: `The uploaded CSV file must contain raw accelerometer data collected from a smartwatch. It should include exactly four columns: <strong>'timestamp'</strong>, <strong>'x'</strong>, <strong>'y'</strong>, and <strong>'z'</strong>. The x, y, and z columns represent acceleration values along the three axes in ${dataUnit} units. The timestamp column should be in ${
                                timestampFormat === "unix-ms"
                                  ? "Unix milliseconds"
                                  : timestampFormat === "unix-s"
                                  ? "Unix seconds"
                                  : "datetime"
                              } format.`,
                            }}
                          />
                        ) : dataType === "enmo" ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: `The uploaded CSV file must contain ENMO (Euclidean Norm Minus One) data collected from a smartwatch.`,
                            }}
                          />
                        ) : (
                          <span
                            dangerouslySetInnerHTML={{
                              __html:
                                "The uploaded CSV file must contain time series data collected from a smartwatch. It should include exactly two columns: <strong>'timestamp'</strong> and <strong>'data'</strong>. Please select a data type above to see specific requirements.",
                            }}
                          />
                        )}
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              {/* File Upload Drop Zone - now appears after Data Format Requirements */}
              <Box
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  mx: "auto",
                  border: "2px dashed",
                  borderColor: dragActive ? "primary.main" : "grey.300",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  bgcolor: dragActive ? "primary.50" : "background.paper",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  position: "relative",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "primary.50",
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={fileType === "binary" ? ".zip" : ".csv"}
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  disabled={!dataSource || !fileType}
                />
                <UploadIcon sx={{ fontSize: 48, color: "grey.500", mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Drop file here or click to select
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {fileType === "binary"
                    ? "Upload a zipped binary file"
                    : "Upload a CSV file"}
                </Typography>
                {dragActive && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0034f0",
                      fontSize: 24,
                      pointerEvents: "none",
                      background: "rgba(255,255,255,0.5)",
                    }}
                  >
                    Drop file to upload
                  </Box>
                )}
              </Box>
            </>
          )}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Box sx={{ width: "100%", mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 1 }}
              >
                Uploading: {Math.round(uploadProgress)}%
              </Typography>
            </Box>
          )}
          {data?.file_id && (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#0034f0",
              }}
            >
              <CheckCircleIcon fontSize="small" />
              Successfully uploaded: {data.filename}
            </Typography>
          )}
          {dragActive && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0034f0",
                fontSize: 24,
                pointerEvents: "none",
                background: "rgba(255,255,255,0.5)",
              }}
            >
              Drop file to upload
            </Box>
          )}
          {data?.file_id && (
            <Grid item xs={12}>
              {/* CSV Column Configuration Section - Only for CSV files */}
              {showColumnSelection && fileType === "csv" && (
                <>
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{ textAlign: "left", width: "100%" }}
                  >
                    Please select the appropriate column names from your CSV
                    file for the {dataType} data type.
                  </Typography>

                  {/* CSV Preview Section */}
                  {fileType === "csv" && csvPreview.length > 0 && (
                    <Box
                      sx={{
                        mb: 3,
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "grey.300",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          color: "primary.main",
                        }}
                      >
                        CSV Preview (First 2 rows including header):
                      </Typography>
                      <Box
                        sx={{
                          overflowX: "auto",
                          maxWidth: "100%",
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "0.875rem",
                            fontFamily: "monospace",
                          }}
                        >
                          <thead>
                            <tr>
                              {csvColumns.map((column, index) => (
                                <th
                                  key={index}
                                  style={{
                                    border: "1px solid #ccc",
                                    padding: "8px",
                                    backgroundColor: "#f5f5f5",
                                    fontWeight: 600,
                                    textAlign: "left",
                                  }}
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {csvPreview.slice(0, 2).map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {csvColumns.map((column, colIndex) => (
                                  <td
                                    key={colIndex}
                                    style={{
                                      border: "1px solid #ccc",
                                      padding: "8px",
                                      backgroundColor:
                                        rowIndex % 2 === 0
                                          ? "#ffffff"
                                          : "#fafafa",
                                    }}
                                  >
                                    {row[column] !== undefined
                                      ? String(row[column]).substring(0, 50)
                                      : ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Note: Values are truncated to 50 characters for display.
                        Use this preview to identify the correct column names.
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              {/* Binary File Configuration Section - Only for binary files */}
              {showColumnSelection && fileType === "binary" && (
                <>
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{ textAlign: "left", width: "100%" }}
                  >
                    Please configure the data format settings for your binary
                    file.
                  </Typography>
                </>
              )}

              {/* Unified Grid for Column Selection and Processing Parameters */}
              <Grid item xs={12}>
                {/* Data Configuration - For CSV files and binary files that need configuration */}
                {showColumnSelection && (
                  <>
                    {/* Data Configuration */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Data Configuration
                      </Typography>
                      <Grid container spacing={2}>
                        {/* Timestamp Format Selection */}
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Timestamp Format</InputLabel>
                            <Select
                              value={timestampFormat || ""}
                              onChange={(e) => {
                                setTimestampFormat(e.target.value);
                              }}
                              label="Timestamp Format"
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 300,
                                    zIndex: 9999,
                                  },
                                },
                                container: document.body,
                              }}
                            >
                              <MenuItem value="unix-ms">
                                Unix - milliseconds
                              </MenuItem>
                              <MenuItem value="unix-s">Unix - seconds</MenuItem>
                              <MenuItem value="datetime">Datetime</MenuItem>
                            </Select>
                            <FormHelperText>
                              Select the format of your timestamp column
                            </FormHelperText>
                          </FormControl>
                        </Grid>
                        {/* Data Unit Selection */}
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Data Unit</InputLabel>
                            {/* Accelerometer Data Unit */}
                            {dataType === "accelerometer" && (
                              <Select
                                value={dataUnit || ""}
                                onChange={(e) => {
                                  setDataUnit(e.target.value);
                                }}
                                label="Data Unit"
                                displayEmpty
                                disabled={!timestampFormat}
                              >
                                <MenuItem value="g">g</MenuItem>
                                <MenuItem value="mg">mg</MenuItem>
                                <MenuItem value="m/s^2">m/s²</MenuItem>
                              </Select>
                            )}
                            {/* ENMO Data Unit */}
                            {dataType === "enmo" && (
                              <Select
                                value={dataUnit || ""}
                                onChange={(e) => {
                                  setDataUnit(e.target.value);
                                }}
                                label="Data Unit"
                                displayEmpty
                                disabled={!timestampFormat}
                              >
                                <MenuItem value="g">g</MenuItem>
                                <MenuItem value="mg">mg</MenuItem>
                              </Select>
                            )}
                            {/* Alternative Count Data Unit */}
                            {dataType === "alternative_count" && (
                              <Select
                                value={dataUnit || ""}
                                onChange={(e) => {
                                  setDataUnit(e.target.value);
                                }}
                                label="Data Unit"
                                displayEmpty
                                disabled={!timestampFormat}
                              >
                                <MenuItem value="">No unit required</MenuItem>
                              </Select>
                            )}
                            {/* Default Data Unit */}
                            {![
                              "accelerometer",
                              "enmo",
                              "alternative_count",
                            ].includes(dataType) && (
                              <Select
                                value={dataUnit || ""}
                                onChange={(e) => {
                                  setDataUnit(e.target.value);
                                }}
                                label="Data Unit"
                                displayEmpty
                                disabled={!timestampFormat}
                              >
                                <MenuItem value="">No unit required</MenuItem>
                              </Select>
                            )}
                            <FormHelperText>
                              {timestampFormat
                                ? "Select the unit of your data values"
                                : "Please select timestamp format first"}
                            </FormHelperText>
                          </FormControl>
                        </Grid>
                      </Grid>

                      {/* Timezone Configuration - Second Row - Only show for unix formats */}
                      {(timestampFormat === "unix-s" ||
                        timestampFormat === "unix-ms") && (
                        <Box
                          sx={{
                            border: "2px dashed #0034f0",
                            bgcolor: "#0034f0" + "10",
                            borderRadius: 2,
                            p: 2,
                            mt: 2,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, color: "#0034f0" }}
                          >
                            Timezone (Optional for Unix timestamps)
                          </Typography>
                          <Grid container spacing={2}>
                            {/* Continent Selection */}
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth>
                                <InputLabel>Timezone Continent</InputLabel>
                                <Select
                                  value={timezoneContinent}
                                  onChange={(e) =>
                                    handleTimezoneContinentChange(
                                      e.target.value
                                    )
                                  }
                                  label="Timezone Continent"
                                  disabled={!dataUnit}
                                >
                                  <MenuItem value="">Select Continent</MenuItem>
                                  {Object.keys(timezones)
                                    .filter((continent) => {
                                      const validContinents = [
                                        "Africa",
                                        "Antarctica",
                                        "Arctic",
                                        "Asia",
                                        "Atlantic",
                                        "Europe",
                                        "America",
                                        "Australia",
                                        "Pacific",
                                      ];
                                      return (
                                        validContinents.includes(continent) &&
                                        timezones[continent] &&
                                        timezones[continent].length > 0
                                      );
                                    })
                                    .map((continent) => (
                                      <MenuItem
                                        key={continent}
                                        value={continent}
                                      >
                                        {continent}
                                      </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>
                                  {dataUnit
                                    ? "Select the continent for your timezone (required for Unix timestamps)"
                                    : "Please select data unit first"}
                                </FormHelperText>
                              </FormControl>
                            </Grid>
                            {/* City Selection */}
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth>
                                <InputLabel>Timezone City</InputLabel>
                                <Select
                                  value={timezoneCity}
                                  onChange={(e) =>
                                    handleTimezoneCityChange(e.target.value)
                                  }
                                  label="Timezone City"
                                  disabled={!timezoneContinent}
                                >
                                  <MenuItem value="">Select City</MenuItem>
                                  {timezoneContinent &&
                                    timezones[timezoneContinent]
                                      ?.map((tz) => {
                                        const parts = tz.split("/");
                                        // Only show timezones with exactly 2 parts (continent/city)
                                        if (parts.length === 2) {
                                          const city = parts[1];
                                          return (
                                            <MenuItem key={tz} value={tz}>
                                              {city.replace(/_/g, " ")}
                                            </MenuItem>
                                          );
                                        }
                                        return null;
                                      })
                                      .filter(Boolean)}
                                </Select>
                                <FormHelperText>
                                  Select the city for your timezone (required
                                  for Unix timestamps, default: UTC)
                                </FormHelperText>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                {/* Column Selection - Only show after Data Configuration is complete and only for CSV files */}
                {timestampFormat &&
                  dataUnit &&
                  (timestampFormat === "datetime" ||
                    (timestampFormat !== "datetime" && timezone)) &&
                  fileType === "csv" && (
                    <>
                      {/* Column Selection */}
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Column Selection
                        </Typography>
                        <Grid container spacing={2}>
                          {/* Time Column Selection */}
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Timestamp Column</InputLabel>
                              <Select
                                value={selectedTimeColumn || ""}
                                onChange={(e) =>
                                  setSelectedTimeColumn(e.target.value)
                                }
                                label="Timestamp Column"
                                MenuProps={{
                                  PaperProps: {
                                    style: {
                                      maxHeight: 300,
                                      zIndex: 9999,
                                    },
                                  },
                                  container: document.body,
                                }}
                              >
                                {csvColumns.map((column) => (
                                  <MenuItem key={column} value={column}>
                                    {column}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText>
                                Select the column containing timestamp data
                              </FormHelperText>
                            </FormControl>
                          </Grid>
                          {/* Data Columns Selection */}
                          <Grid item xs={12} md={6}>
                            {dataType === "accelerometer" ? (
                              <Box>
                                <Grid container spacing={2}>
                                  {["x", "y", "z"].map((axis, index) => (
                                    <Grid item xs={12} sm={4} key={axis}>
                                      <FormControl fullWidth>
                                        <InputLabel>
                                          {axis.toUpperCase()} Column
                                        </InputLabel>
                                        <Select
                                          value={
                                            selectedDataColumns[index] || ""
                                          }
                                          onChange={(e) => {
                                            const newColumns = [
                                              ...selectedDataColumns,
                                            ];
                                            newColumns[index] = e.target.value;
                                            // Remove any empty values and duplicates
                                            const filteredColumns =
                                              newColumns.filter(
                                                (col, idx) =>
                                                  col &&
                                                  col !== "" &&
                                                  newColumns.indexOf(col) ===
                                                    idx
                                              );
                                            setSelectedDataColumns(
                                              filteredColumns
                                            );
                                          }}
                                          label={`${axis.toUpperCase()} Column`}
                                          MenuProps={{
                                            PaperProps: {
                                              style: {
                                                maxHeight: 300,
                                                zIndex: 9999,
                                              },
                                            },
                                            container: document.body,
                                          }}
                                        >
                                          <MenuItem value="">
                                            <em>None</em>
                                          </MenuItem>
                                          {csvColumns.map((column) => (
                                            <MenuItem
                                              key={column}
                                              value={column}
                                            >
                                              {column}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            ) : dataType === "enmo" ? (
                              <FormControl fullWidth>
                                <InputLabel>ENMO Column</InputLabel>
                                <Select
                                  value={selectedDataColumns[0] || ""}
                                  onChange={(e) =>
                                    setSelectedDataColumns([e.target.value])
                                  }
                                  label="ENMO Column"
                                  MenuProps={{
                                    PaperProps: {
                                      style: {
                                        maxHeight: 300,
                                        zIndex: 9999,
                                      },
                                    },
                                    container: document.body,
                                  }}
                                >
                                  {csvColumns.map((column) => (
                                    <MenuItem key={column} value={column}>
                                      {column}
                                    </MenuItem>
                                  ))}
                                </Select>
                                <FormHelperText>
                                  Select the column containing ENMO data
                                </FormHelperText>
                              </FormControl>
                            ) : dataType === "alternative_count" ? (
                              <FormControl fullWidth>
                                <InputLabel>Counts Column</InputLabel>
                                <Select
                                  value={selectedDataColumns[0] || ""}
                                  onChange={(e) =>
                                    setSelectedDataColumns([e.target.value])
                                  }
                                  label="Counts Column"
                                  MenuProps={{
                                    PaperProps: {
                                      style: {
                                        maxHeight: 300,
                                        zIndex: 9999,
                                      },
                                    },
                                    container: document.body,
                                  }}
                                >
                                  {csvColumns.map((column) => (
                                    <MenuItem key={column} value={column}>
                                      {column}
                                    </MenuItem>
                                  ))}
                                </Select>
                                <FormHelperText>
                                  Select the column containing activity counts
                                </FormHelperText>
                              </FormControl>
                            ) : null}
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  )}

                {/* Binary File Configuration Complete Button - Only for binary files */}
                {timestampFormat &&
                  dataUnit &&
                  timezone &&
                  fileType === "binary" &&
                  !columnSelectionComplete && (
                    <Box sx={{ mt: 3, textAlign: "center" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleColumnSelection}
                        sx={{ px: 4, py: 1.5 }}
                      >
                        Complete Configuration
                      </Button>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Click to confirm your data format settings
                      </Typography>
                    </Box>
                  )}

                {/* Processing Parameters - Only show after configuration is complete */}
                {(data?.file_id &&
                  dataSource === "samsung_galaxy" &&
                  fileType &&
                  dataType) ||
                (data?.file_id &&
                  dataSource === "other" &&
                  timestampFormat &&
                  dataUnit &&
                  columnSelectionComplete) ? (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Parameter Selection
                    </Typography>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Advanced Settings
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={3}>
                          {/* Preprocessing Parameters */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                              Preprocessing Parameters
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Auto-calibration SD Criterion"
                                  type="text"
                                  value={preprocessParams.autocalib_sd_criter}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "."
                                    );
                                    if (
                                      /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                        value
                                      ) ||
                                      value === "" ||
                                      value === "."
                                    ) {
                                      handlePreprocessParamChange(
                                        "autocalib_sd_criter",
                                        value
                                      );
                                    }
                                  }}
                                  inputProps={{
                                    inputMode: "decimal",
                                    lang: "en-US",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Auto-calibration Sphere Criterion"
                                  type="text"
                                  value={preprocessParams.autocalib_sphere_crit}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "."
                                    );
                                    if (
                                      /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                        value
                                      ) ||
                                      value === "" ||
                                      value === "."
                                    ) {
                                      handlePreprocessParamChange(
                                        "autocalib_sphere_crit",
                                        value
                                      );
                                    }
                                  }}
                                  inputProps={{
                                    inputMode: "decimal",
                                    lang: "en-US",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                  <InputLabel>Filter Type</InputLabel>
                                  <Select
                                    value={preprocessParams.filter_type}
                                    label="Filter Type"
                                    onChange={(e) =>
                                      handlePreprocessParamChange(
                                        "filter_type",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <MenuItem value="lowpass">Lowpass</MenuItem>
                                    <MenuItem value="highpass">
                                      Highpass
                                    </MenuItem>
                                    <MenuItem value="bandpass">
                                      Bandpass
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Filter Cutoff"
                                  type="text"
                                  value={preprocessParams.filter_cutoff}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "."
                                    );
                                    if (
                                      /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                        value
                                      ) ||
                                      value === "" ||
                                      value === "."
                                    ) {
                                      handlePreprocessParamChange(
                                        "filter_cutoff",
                                        value
                                      );
                                    }
                                  }}
                                  inputProps={{
                                    inputMode: "decimal",
                                    lang: "en-US",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Wear SD Criterion"
                                  type="text"
                                  value={preprocessParams.wear_sd_crit}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "."
                                    );
                                    if (
                                      /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                        value
                                      ) ||
                                      value === "" ||
                                      value === "."
                                    ) {
                                      handlePreprocessParamChange(
                                        "wear_sd_crit",
                                        value
                                      );
                                    }
                                  }}
                                  inputProps={{
                                    inputMode: "decimal",
                                    lang: "en-US",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Wear Range Criterion"
                                  type="text"
                                  value={preprocessParams.wear_range_crit}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "."
                                    );
                                    if (
                                      /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                        value
                                      ) ||
                                      value === "" ||
                                      value === "."
                                    ) {
                                      handlePreprocessParamChange(
                                        "wear_range_crit",
                                        value
                                      );
                                    }
                                  }}
                                  inputProps={{
                                    inputMode: "decimal",
                                    lang: "en-US",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Wear Window Length"
                                  type="text"
                                  value={preprocessParams.wear_window_length}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "."
                                    );
                                    if (
                                      /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                        value
                                      ) ||
                                      value === "" ||
                                      value === "."
                                    ) {
                                      handlePreprocessParamChange(
                                        "wear_window_length",
                                        value
                                      );
                                    }
                                  }}
                                  inputProps={{
                                    inputMode: "decimal",
                                    lang: "en-US",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Wear Window Skip"
                                  type="text"
                                  value={preprocessParams.wear_window_skip}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "."
                                    );
                                    if (
                                      /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                        value
                                      ) ||
                                      value === "" ||
                                      value === "."
                                    ) {
                                      handlePreprocessParamChange(
                                        "wear_window_skip",
                                        value
                                      );
                                    }
                                  }}
                                  inputProps={{
                                    inputMode: "numeric",
                                    lang: "en-US",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={12}>
                                <Typography gutterBottom>
                                  Required Daily Coverage
                                </Typography>
                                <Slider
                                  value={
                                    typeof preprocessParams.required_daily_coverage ===
                                    "number"
                                      ? preprocessParams.required_daily_coverage
                                      : 0.5
                                  }
                                  min={0}
                                  max={1}
                                  step={0.01}
                                  onChange={(e, newValue) =>
                                    handlePreprocessParamChange(
                                      "required_daily_coverage",
                                      newValue
                                    )
                                  }
                                  valueLabelDisplay="auto"
                                />
                                <TextField
                                  fullWidth
                                  label="Required Daily Coverage (0-1)"
                                  type="text"
                                  value={
                                    preprocessParams.required_daily_coverage
                                  }
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "."
                                    );
                                    if (
                                      /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                        value
                                      ) ||
                                      value === "" ||
                                      value === "."
                                    ) {
                                      handlePreprocessParamChange(
                                        "required_daily_coverage",
                                        value
                                      );
                                    }
                                  }}
                                  inputProps={{
                                    inputMode: "decimal",
                                    lang: "en-US",
                                  }}
                                  sx={{ mt: 2 }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Minimum fraction of valid data required per
                                  day (0 = 0%, 1 = 100%). Default: 0.5
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          {/* Feature Parameters */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                              Feature Parameters
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <FormControl fullWidth>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={featureParams.sleep_rescore}
                                        onChange={(e) =>
                                          handleFeatureParamChange(
                                            "sleep_rescore",
                                            e.target.checked
                                          )
                                        }
                                      />
                                    }
                                    label="Sleep Rescore"
                                  />
                                </FormControl>
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Sleep CK SF"
                                  type="text"
                                  value={featureParams.sleep_ck_sf}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "."
                                    );
                                    if (
                                      /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                        value
                                      ) ||
                                      value === "" ||
                                      value === "."
                                    ) {
                                      handleFeatureParamChange(
                                        "sleep_ck_sf",
                                        value
                                      );
                                    }
                                  }}
                                  inputProps={{
                                    inputMode: "decimal",
                                    lang: "en-US",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  fullWidth
                                  label="PA Cutpoint Sedentary-Light"
                                  type="text"
                                  value={featureParams.pa_cutpoint_sl}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "."
                                    );
                                    if (
                                      /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                        value
                                      ) ||
                                      value === "" ||
                                      value === "."
                                    ) {
                                      handleFeatureParamChange(
                                        "pa_cutpoint_sl",
                                        value
                                      );
                                    }
                                  }}
                                  inputProps={{
                                    inputMode: "decimal",
                                    lang: "en-US",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  fullWidth
                                  label="PA Cutpoint Light-Moderate"
                                  type="text"
                                  value={featureParams.pa_cutpoint_lm}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "."
                                    );
                                    if (
                                      /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                        value
                                      ) ||
                                      value === "" ||
                                      value === "."
                                    ) {
                                      handleFeatureParamChange(
                                        "pa_cutpoint_lm",
                                        value
                                      );
                                    }
                                  }}
                                  inputProps={{
                                    inputMode: "decimal",
                                    lang: "en-US",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  fullWidth
                                  label="PA Cutpoint Moderate-Vigorous"
                                  type="text"
                                  value={featureParams.pa_cutpoint_mv}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "."
                                    );
                                    if (
                                      /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                        value
                                      ) ||
                                      value === "" ||
                                      value === "."
                                    ) {
                                      handleFeatureParamChange(
                                        "pa_cutpoint_mv",
                                        value
                                      );
                                    }
                                  }}
                                  inputProps={{
                                    inputMode: "decimal",
                                    lang: "en-US",
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                ) : null}

                {/* Process and Reset Buttons - Only show when parameters are shown */}
                {((data?.file_id &&
                  dataSource === "samsung_galaxy" &&
                  fileType &&
                  dataType) ||
                  (data?.file_id &&
                    dataSource === "other" &&
                    timestampFormat &&
                    dataUnit &&
                    columnSelectionComplete)) && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        mt: 3,
                        display: "flex",
                        gap: 2,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleProcessData}
                        disabled={processing}
                        startIcon={
                          processing ? (
                            <CircularProgress size={20} />
                          ) : (
                            <PlayArrowIcon />
                          )
                        }
                        sx={{ px: 4, py: 1.5 }}
                      >
                        {processing
                          ? `Processing... (${formatTime(processingTime)})`
                          : "Process Data"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleReset}
                        disabled={processing}
                        startIcon={<RefreshIcon />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          color: "#0034f0",
                          borderColor: "#0034f0",
                          "&:hover": {
                            borderColor: "#0034f0",
                            backgroundColor: "rgba(0, 52, 240, 0.04)",
                          },
                        }}
                      >
                        Reset All
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
        </Paper>
      </Grid>

      {/* Processing Complete Summary */}
      {data?.data && (
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              bgcolor: "#d1d8ff",
              border: "1px solid #0034f0",
            }}
          >
            {/* Processing Summary */}
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#0034f0" }}>
                Processing Complete
              </Typography>

              {/* Processing Summary */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: "#0034f0" }}
                >
                  Data was successfully preprocessed.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: "#0034f0" }}
                >
                  Features were successfully computed.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      )}

      {/* Results Display */}
      {data?.data && (
        <>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Raw Data Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Data Frequency
                  </Typography>
                  <Typography variant="body1">
                    {data.metadata?.raw_data_frequency || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Time
                  </Typography>
                  <Typography variant="body1">
                    {data.metadata?.raw_start_datetime || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    End Time
                  </Typography>
                  <Typography variant="body1">
                    {data.metadata?.raw_end_datetime || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Data Type
                  </Typography>
                  <Typography variant="body1">
                    {data.metadata?.raw_data_type || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Data Unit
                  </Typography>
                  <Typography variant="body1">
                    {data.metadata?.raw_data_unit || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Number of Data Points
                  </Typography>
                  <Typography variant="body1">
                    {data.metadata?.raw_n_datapoints || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Follow-up Time
                  </Typography>
                  <Typography variant="body1">
                    {data.metadata?.raw_start_datetime &&
                    data.metadata?.raw_end_datetime
                      ? (() => {
                          const diff =
                            new Date(data.metadata.raw_end_datetime) -
                            new Date(data.metadata.raw_start_datetime);
                          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                          const hours = Math.floor(
                            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                          );
                          const minutes = Math.floor(
                            (diff % (1000 * 60 * 60)) / (1000 * 60)
                          );
                          return `${days} ${
                            days === 1 ? "day" : "days"
                          } ${hours} ${
                            hours === 1 ? "hour" : "hours"
                          } ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
                        })()
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cohort Size
                  </Typography>
                  <Typography variant="body1">1 individual</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* CosinorAge Prediction */}
          {data?.features && (
            <>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    CosinorAge Prediction
                  </Typography>
                  <Alert
                    sx={{
                      mb: 3,
                      backgroundColor: "#d1d8ff",
                      border: "1px solid #0034f0",
                      "& .MuiAlert-icon": {
                        color: "#0034f0",
                      },
                      "& .MuiAlert-message": {
                        color: "#0034f0",
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#0034f0" }}>
                      <strong>Manual Input Required:</strong> To predict your
                      biological age, you need to manually enter your
                      chronological age and select your gender below. The
                      prediction is based on your activity patterns and
                      circadian rhythms compared to population data.
                    </Typography>
                  </Alert>

                  {/* Age and Gender Input */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Chronological Age"
                        type="number"
                        value={chronologicalAge}
                        onChange={(e) => setChronologicalAge(e.target.value)}
                        inputProps={{ min: 0, max: 120 }}
                        helperText="Required: Enter your chronological age for biological age prediction"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": {
                              borderColor: "#0034f0",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#0034f0",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Gender</InputLabel>
                        <Select
                          value={gender}
                          label="Gender"
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="invariant">Invariant</MenuItem>
                        </Select>
                        <FormHelperText>
                          Required: Select your gender for accurate biological
                          age prediction
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Age Prediction Results */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ textAlign: "center", p: 2 }}>
                        <Typography
                          variant="h4"
                          color="primary.main"
                          gutterBottom
                        >
                          {predictedAge
                            ? `${predictedAge.toFixed(1)} years`
                            : "-"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Predicted Biological Age
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ textAlign: "center", p: 2 }}>
                        <Typography
                          variant="h4"
                          sx={{ color: "#0034f0" }}
                          gutterBottom
                        >
                          {chronologicalAge ? `${chronologicalAge} years` : "-"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Chronological Age
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handlePredictAge}
                      disabled={!data?.features || !chronologicalAge}
                      sx={{
                        minWidth: 120,
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "white",
                        },
                      }}
                    >
                      Predict Age
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Plots */}
              {(() => {
                return (
                  data?.data && (
                    <Grid item xs={12}>
                      {/* Check if data contains x, y, z columns */}
                      {(() => {
                        const hasXYZColumns =
                          data.data[0] &&
                          "x" in data.data[0] &&
                          "y" in data.data[0] &&
                          "z" in data.data[0];

                        if (hasXYZColumns) {
                          return (
                            <>
                              {/* X, Y, Z Accelerometer Data Plot */}
                              <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                  Raw Accelerometer Data (X, Y, Z axes)
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                  <LineChart
                                    data={data.data}
                                    margin={{
                                      top: 20,
                                      right: 30,
                                      left: 30,
                                      bottom: 20,
                                    }}
                                  >
                                    <XAxis
                                      dataKey="TIMESTAMP"
                                      label={{
                                        value: "Time",
                                        position: "insideBottom",
                                        offset: -5,
                                      }}
                                      tickFormatter={(timestamp) => {
                                        const date = new Date(timestamp);
                                        return date.toLocaleDateString();
                                      }}
                                      interval={0}
                                      tick={(props) => {
                                        const { x, y, payload } = props;
                                        const date = new Date(payload.value);
                                        const isStartOfDay =
                                          date.getHours() === 0 &&
                                          date.getMinutes() === 0;
                                        return isStartOfDay ? (
                                          <g transform={`translate(${x},${y})`}>
                                            <text
                                              x={0}
                                              y={0}
                                              dy={16}
                                              textAnchor="middle"
                                              fill="#666"
                                            >
                                              {date.toLocaleDateString()}
                                            </text>
                                          </g>
                                        ) : null;
                                      }}
                                    />
                                    <YAxis
                                      label={{
                                        value: "Acceleration (g)",
                                        angle: -90,
                                        position: "insideLeft",
                                      }}
                                    />
                                    <RechartsTooltip
                                      content={({ active, payload, label }) => {
                                        if (
                                          active &&
                                          payload &&
                                          payload.length
                                        ) {
                                          return (
                                            <div
                                              style={{
                                                backgroundColor: "white",
                                                padding: "10px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                              }}
                                            >
                                              <p
                                                style={{
                                                  margin: "0 0 5px 0",
                                                }}
                                              >
                                                {new Date(
                                                  label
                                                ).toLocaleString()}
                                              </p>
                                              {payload.map((entry, index) => (
                                                <p
                                                  key={index}
                                                  style={{
                                                    margin: "0",
                                                    color: entry.color,
                                                  }}
                                                >
                                                  {`${
                                                    entry.name
                                                  }: ${entry.value.toFixed(
                                                    4
                                                  )} g`}
                                                </p>
                                              ))}
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                    <Legend />
                                    <Line
                                      type="monotone"
                                      dataKey="x"
                                      stroke={CLColors.error}
                                      dot={false}
                                      name="X-axis"
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="y"
                                      stroke={CLColors.success}
                                      dot={false}
                                      name="Y-axis"
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="z"
                                      stroke={CLColors.secondary}
                                      dot={false}
                                      name="Z-axis"
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </Paper>
                            </>
                          );
                        }
                        return null;
                      })()}

                      {/* ENMO Data Plot */}
                      <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          ENMO time series
                          {(() => {
                            // Check if wear data exists and has meaningful values (not all -1)
                            const hasWearData = data.data.some(
                              (point) =>
                                point.wear !== undefined && point.wear !== -1
                            );
                            return hasWearData
                              ? " (incl. wear/non-wear segments)"
                              : "";
                          })()}
                        </Typography>
                        {/* Custom legend for wear/non-wear - only show if wear data is available */}
                        {(() => {
                          // Check if wear data exists and has meaningful values (not all -1)
                          const hasWearData = data.data.some(
                            (point) =>
                              point.wear !== undefined && point.wear !== -1
                          );
                          return hasWearData;
                        })() && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                              ml: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                bgcolor: CLColors.success,
                                opacity: 0.3,
                                border: `1px solid ${CLColors.success}`,
                                mr: 1,
                              }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mr: 2 }}
                            >
                              wear
                            </Typography>
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                bgcolor: CLColors.error,
                                opacity: 0.3,
                                border: `1px solid ${CLColors.error}`,
                                mr: 1,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              non-wear
                            </Typography>
                          </Box>
                        )}
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart
                            data={data.data}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 30,
                              bottom: 20,
                            }}
                          >
                            <XAxis
                              dataKey="TIMESTAMP"
                              label={{
                                value: "Time",
                                position: "insideBottom",
                                offset: -5,
                              }}
                              tickFormatter={(timestamp) => {
                                const date = new Date(timestamp);
                                return date.toLocaleDateString();
                              }}
                              interval={0}
                              tick={(props) => {
                                const { x, y, payload } = props;
                                const date = new Date(payload.value);
                                const isStartOfDay =
                                  date.getHours() === 0 &&
                                  date.getMinutes() === 0;
                                return isStartOfDay ? (
                                  <g transform={`translate(${x},${y})`}>
                                    <text
                                      x={0}
                                      y={0}
                                      dy={16}
                                      textAnchor="middle"
                                      fill="#666"
                                    >
                                      {date.toLocaleDateString()}
                                    </text>
                                  </g>
                                ) : null;
                              }}
                            />
                            <YAxis
                              label={{
                                value: "ENMO (mg)",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <RechartsTooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div
                                      style={{
                                        backgroundColor: "white",
                                        padding: "10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      <p
                                        style={{
                                          margin: "0 0 5px 0",
                                        }}
                                      >
                                        {new Date(label).toLocaleString()}
                                      </p>
                                      {payload.map((entry, index) => {
                                        <p
                                          key={index}
                                          style={{
                                            margin: "0",
                                            color: entry.color,
                                          }}
                                        >
                                          {`${
                                            entry.name
                                          }: ${entry.value.toFixed(2)} mg`}
                                        </p>;
                                      })}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="ENMO"
                              stroke="#0034f0"
                              dot={false}
                            />
                            {/* Shaded background for wear/non-wear segments */}
                            {(() => {
                              const areas = [];
                              let currentWear = data.data[0]?.wear;
                              let segStart = data.data[0]?.TIMESTAMP;
                              // Log timestamps
                              console.log(
                                "Min Timestamp:",
                                data.data[0]?.TIMESTAMP
                              );
                              console.log(
                                "M10 Start:",
                                data.features.nonparam.m10_start
                              );
                              console.log(
                                "L5 Start:",
                                data.features.nonparam.l5_start
                              );
                              for (let i = 1; i <= data.data.length; i++) {
                                const point = data.data[i];
                                if (
                                  i === data.data.length ||
                                  point?.wear !== currentWear
                                ) {
                                  const segEnd = data.data[i - 1]?.TIMESTAMP;
                                  // Only add shaded area if wear is not -1
                                  if (currentWear !== -1) {
                                    const color = interpolateColor(currentWear);
                                    areas.push(
                                      <ReferenceArea
                                        key={`wear-seg-${segStart}`}
                                        x1={segStart}
                                        x2={segEnd}
                                        fill={color}
                                        fillOpacity={0.3}
                                        stroke={color}
                                        strokeOpacity={0.5}
                                        label={null}
                                      />
                                    );
                                  }
                                  if (i < data.data.length) {
                                    currentWear = point.wear;
                                    segStart = point.TIMESTAMP;
                                  }
                                }
                              }
                              return areas;
                            })()}
                          </LineChart>
                        </ResponsiveContainer>
                      </Paper>
                    </Grid>
                  )
                );
              })()}

              {/* Cosinor Features */}
              {data?.features && data.features.cosinor && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Cosinor Features
                      </Typography>
                      <SectionInfoButton section="cosinor" />
                    </Box>
                    <Grid container spacing={2} direction="row" wrap="nowrap">
                      {Object.entries(data.features.cosinor).map(
                        ([key, value]) => (
                          <Grid item xs key={key} zeroMinWidth>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                noWrap
                              >
                                {key
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Typography>
                              <SectionInfoButton metric={key} />
                            </Box>
                            <Typography variant="body1" noWrap>
                              {typeof value === "number"
                                ? key === "acrophase_time"
                                  ? (() => {
                                      const minutes = value;
                                      const hours = Math.floor(minutes / 60);
                                      const mins = Math.round(minutes % 60);
                                      return `${hours
                                        .toString()
                                        .padStart(2, "0")}:${mins
                                        .toString()
                                        .padStart(2, "0")}`;
                                    })()
                                  : value.toFixed(4)
                                : value}
                              {key === "mesor" || key === "amplitude"
                                ? " mg"
                                : key === "acrophase"
                                ? " radians"
                                : ""}
                            </Typography>
                          </Grid>
                        )
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {/* Non-parametric Features */}
              {data?.features && data.features.nonparam && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Non-parametric Features
                      </Typography>
                      <SectionInfoButton section="nonparam" />
                    </Box>
                    <Grid container spacing={2}>
                      {Object.entries(data.features.nonparam)
                        .sort(([keyA], [keyB]) => {
                          // Define the desired order
                          const order = {
                            is: 1,
                            iv: 2,
                            m10: 3,
                            ra: 4,
                          };
                          const orderA = order[keyA.toLowerCase()] || 5;
                          const orderB = order[keyB.toLowerCase()] || 5;
                          return orderA - orderB;
                        })
                        .map(([key, value]) =>
                          ["l5", "m10_start", "l5_start"].includes(
                            key.toLowerCase()
                          ) ? null : (
                            <Grid item xs={12} key={key}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                >
                                  {key === "RA"
                                    ? "Relative Amplitude (RA)"
                                    : key === "M10" || key === "L5"
                                    ? "L5 & M10"
                                    : key === "IV"
                                    ? "Intradaily Variability (IV)"
                                    : key === "IS"
                                    ? "Interdaily Stability (IS)"
                                    : key
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase()
                                        )}
                                </Typography>
                                <SectionInfoButton metric={key} />
                              </Box>
                              {/* IS and IV as horizontal scale */}
                              {["is", "iv"].includes(key.toLowerCase()) &&
                              typeof value === "number" ? (
                                <HorizontalScale
                                  value={value}
                                  min={key.toLowerCase() === "is" ? 0 : 0}
                                  max={key.toLowerCase() === "is" ? 1 : 2}
                                  color="#0034f0"
                                />
                              ) : key.toLowerCase() === "ra" &&
                                Array.isArray(value) ? (
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: 200,
                                    mt: 2,
                                  }}
                                >
                                  <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                  >
                                    <BarChart
                                      data={value.map((v, index) => ({
                                        day: getDateForIndex("RA", index, data),
                                        RA: v,
                                      }))}
                                      margin={{
                                        top: 20,
                                        right: 30,
                                        left: 30,
                                        bottom: 20,
                                      }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="day" />
                                      <YAxis
                                        label={{
                                          value: "RA",
                                          angle: -90,
                                          position: "insideLeft",
                                        }}
                                      />
                                      <RechartsTooltip
                                        content={({
                                          active,
                                          payload,
                                          label,
                                        }) => {
                                          if (
                                            active &&
                                            payload &&
                                            payload.length
                                          ) {
                                            return (
                                              <div
                                                style={{
                                                  backgroundColor: "white",
                                                  padding: "10px",
                                                  border: "1px solid #ccc",
                                                  borderRadius: "4px",
                                                }}
                                              >
                                                <p
                                                  style={{
                                                    margin: "0 0 5px 0",
                                                  }}
                                                >
                                                  {label}
                                                </p>
                                                {payload.map((entry, index) => {
                                                  let value = entry.value;
                                                  let unit = "";
                                                  if (entry.name === "TST") {
                                                    value =
                                                      Math.round(value).toFixed(
                                                        0
                                                      );
                                                    unit = " minutes";
                                                  } else if (
                                                    entry.name === "WASO" ||
                                                    entry.name === "SOL"
                                                  ) {
                                                    value = value.toFixed(0);
                                                    unit = " minutes";
                                                  } else if (
                                                    entry.name === "PTA"
                                                  ) {
                                                    value = value.toFixed(1);
                                                    unit = "%";
                                                  } else if (
                                                    entry.name === "M10" ||
                                                    entry.name === "L5"
                                                  ) {
                                                    value = value.toFixed(2);
                                                    unit = " mg";
                                                  } else if (
                                                    [
                                                      "sedentary",
                                                      "light",
                                                      "moderate",
                                                      "vigorous",
                                                    ].includes(entry.name)
                                                  ) {
                                                    value = value.toFixed(0);
                                                    unit = " minutes";
                                                  }
                                                  return (
                                                    <p
                                                      key={index}
                                                      style={{
                                                        margin: "0",
                                                        color: entry.color,
                                                      }}
                                                    >
                                                      {`${entry.name}: ${value}${unit}`}
                                                    </p>
                                                  );
                                                })}
                                              </div>
                                            );
                                          }
                                          return null;
                                        }}
                                      />
                                      <Bar
                                        dataKey="RA"
                                        fill="#0034f0"
                                        name="RA"
                                      />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </Box>
                              ) : key === "M10" &&
                                data.features.nonparam.M10 &&
                                data.features.nonparam.L5 ? (
                                <>
                                  <Box
                                    sx={{
                                      width: "100%",
                                      height: 300,
                                      mt: 2,
                                    }}
                                  >
                                    <ResponsiveContainer
                                      width="100%"
                                      height="100%"
                                    >
                                      <BarChart
                                        data={data.features.nonparam.M10.map(
                                          (m10, index) => ({
                                            day: getDateForIndex(
                                              "M10",
                                              index,
                                              data
                                            ),
                                            M10: m10,
                                            L5: data.features.nonparam.L5[
                                              index
                                            ],
                                          })
                                        )}
                                        margin={{
                                          top: 20,
                                          right: 30,
                                          left: 30,
                                          bottom: 20,
                                        }}
                                      >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis
                                          label={{
                                            value: "ENMO (mg)",
                                            angle: -90,
                                            position: "insideLeft",
                                          }}
                                        />
                                        <RechartsTooltip
                                          content={({
                                            active,
                                            payload,
                                            label,
                                          }) => {
                                            if (
                                              active &&
                                              payload &&
                                              payload.length
                                            ) {
                                              return (
                                                <div
                                                  style={{
                                                    backgroundColor: "white",
                                                    padding: "10px",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "4px",
                                                  }}
                                                >
                                                  <p
                                                    style={{
                                                      margin: "0 0 5px 0",
                                                    }}
                                                  >
                                                    {label}
                                                  </p>
                                                  {payload.map(
                                                    (entry, index) => {
                                                      let value = entry.value;
                                                      let unit = "";
                                                      if (
                                                        entry.name === "TST"
                                                      ) {
                                                        value =
                                                          Math.round(
                                                            value
                                                          ).toFixed(0);
                                                        unit = " minutes";
                                                      } else if (
                                                        entry.name === "WASO" ||
                                                        entry.name === "SOL"
                                                      ) {
                                                        value =
                                                          value.toFixed(0);
                                                        unit = " minutes";
                                                      } else if (
                                                        entry.name === "PTA"
                                                      ) {
                                                        value =
                                                          value.toFixed(1);
                                                        unit = "%";
                                                      } else if (
                                                        entry.name === "M10" ||
                                                        entry.name === "L5"
                                                      ) {
                                                        value =
                                                          value.toFixed(2);
                                                        unit = " mg";
                                                      } else if (
                                                        [
                                                          "sedentary",
                                                          "light",
                                                          "moderate",
                                                          "vigorous",
                                                        ].includes(entry.name)
                                                      ) {
                                                        value =
                                                          value.toFixed(0);
                                                        unit = " minutes";
                                                      }
                                                      return (
                                                        <p
                                                          key={index}
                                                          style={{
                                                            margin: "0",
                                                            color: entry.color,
                                                          }}
                                                        >
                                                          {`${entry.name}: ${value}${unit}`}
                                                        </p>
                                                      );
                                                    }
                                                  )}
                                                </div>
                                              );
                                            }
                                            return null;
                                          }}
                                        />
                                        <Legend />
                                        <Bar
                                          dataKey="M10"
                                          fill="#0034f0"
                                          name="M10"
                                        />
                                        <Bar
                                          dataKey="L5"
                                          fill="#7aa7ff"
                                          name="L5"
                                        />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </Box>
                                </>
                              ) : key === "TST" ||
                                key === "WASO" ||
                                key === "SOL" ||
                                key === "PTA" ? (
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: 300,
                                    mt: 2,
                                  }}
                                >
                                  <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                  >
                                    <BarChart
                                      data={value.map((v, index) => ({
                                        day: getDateForIndex(key, index, data),
                                        [key]: v,
                                      }))}
                                      margin={{
                                        top: 20,
                                        right: 30,
                                        left: 30,
                                        bottom: 20,
                                      }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="day" />
                                      <YAxis
                                        label={{
                                          value:
                                            key === "PTA"
                                              ? "Percentage (%)"
                                              : key === "NWB"
                                              ? "Number of Bouts"
                                              : "Minutes",
                                          angle: -90,
                                          position: "insideLeft",
                                        }}
                                      />
                                      <RechartsTooltip
                                        content={({
                                          active,
                                          payload,
                                          label,
                                        }) => {
                                          if (
                                            active &&
                                            payload &&
                                            payload.length
                                          ) {
                                            return (
                                              <div
                                                style={{
                                                  backgroundColor: "white",
                                                  padding: "10px",
                                                  border: "1px solid #ccc",
                                                  borderRadius: "4px",
                                                }}
                                              >
                                                <p
                                                  style={{
                                                    margin: "0 0 5px 0",
                                                  }}
                                                >
                                                  {label}
                                                </p>
                                                {payload.map((entry, index) => {
                                                  let value = entry.value;
                                                  let unit = "";
                                                  if (entry.name === "TST") {
                                                    value =
                                                      Math.round(value).toFixed(
                                                        0
                                                      );
                                                    unit = " minutes";
                                                  } else if (
                                                    entry.name === "WASO" ||
                                                    entry.name === "SOL"
                                                  ) {
                                                    value = value.toFixed(0);
                                                    unit = " minutes";
                                                  } else if (
                                                    entry.name === "PTA"
                                                  ) {
                                                    value = value.toFixed(1);
                                                    unit = "%";
                                                  } else if (
                                                    entry.name === "NWB"
                                                  ) {
                                                    value = value.toFixed(0);
                                                    unit = " bouts";
                                                  }
                                                  return (
                                                    <p
                                                      key={index}
                                                      style={{
                                                        margin: "0",
                                                        color: entry.color,
                                                      }}
                                                    >
                                                      {`${entry.name}: ${value}${unit}`}
                                                    </p>
                                                  );
                                                })}
                                              </div>
                                            );
                                          }
                                          return null;
                                        }}
                                      />
                                      <Legend />
                                      <Bar
                                        dataKey={key}
                                        fill="#0034f0"
                                        name={key}
                                      />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </Box>
                              ) : (
                                <Typography variant="body1">
                                  {Array.isArray(value)
                                    ? value.join(", ")
                                    : value}
                                </Typography>
                              )}
                            </Grid>
                          )
                        )}
                    </Grid>
                    {/* Daily ENMO Time Series with M10 and L5 Periods */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Daily ENMO Time Series with M10 and L5 Periods (incl.
                        multiday Cosinor Fits)
                      </Typography>
                      <Grid container spacing={3}>
                        {Array.from(
                          new Set(
                            data.data.map((item) => {
                              const date = new Date(item.TIMESTAMP);
                              return date.toLocaleDateString("en-CA");
                            })
                          )
                        ).map((dayStr, dayIndex) => {
                          const dayData = data.data.filter((item) => {
                            const date = new Date(item.TIMESTAMP);
                            return date.toLocaleDateString("en-CA") === dayStr;
                          });
                          if (dayData.length === 0) return null;
                          const m10Start =
                            data.features.nonparam.M10_start?.[dayIndex];
                          const l5Start =
                            data.features.nonparam.L5_start?.[dayIndex];
                          if (!m10Start || !l5Start) return null;
                          // Add a 'timestampNum' property for numeric x-axis and align cosinor_fitted
                          const dayDataWithNum = dayData.map((item) => {
                            const globalIndex = data.data.findIndex(
                              (d) => d.TIMESTAMP === item.TIMESTAMP
                            );
                            const globalData =
                              globalIndex !== -1
                                ? data.data[globalIndex]
                                : null;
                            return {
                              ...item,
                              timestampNum: new Date(item.TIMESTAMP).getTime(),
                              cosinor_fitted: globalData
                                ? globalData.cosinor_fitted
                                : null,
                            };
                          });
                          const dayDataWithNumSorted = [...dayDataWithNum].sort(
                            (a, b) => a.timestampNum - b.timestampNum
                          );
                          // Check if m10StartDate and l5StartDate are valid
                          const m10StartDate =
                            m10Start && m10Start.includes("T")
                              ? new Date(m10Start)
                              : new Date(`${dayStr}T${m10Start}`);
                          const l5StartDate =
                            l5Start && l5Start.includes("T")
                              ? new Date(l5Start)
                              : new Date(`${dayStr}T${l5Start}`);
                          return (
                            <Grid item xs={12} key={dayStr}>
                              <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography
                                  variant="subtitle1"
                                  gutterBottom
                                  align="center"
                                >
                                  {dayStr}
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart
                                    data={dayDataWithNumSorted}
                                    margin={{
                                      top: 20,
                                      right: 30,
                                      left: 30,
                                      bottom: 20,
                                    }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="timestampNum"
                                      type="number"
                                      domain={["dataMin", "dataMax"]}
                                      tickFormatter={(timestampNum) => {
                                        const date = new Date(timestampNum);
                                        return date.toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        });
                                      }}
                                    />
                                    <YAxis
                                      yAxisId="left"
                                      label={{
                                        value: "ENMO (mg)",
                                        angle: -90,
                                        position: "insideLeft",
                                      }}
                                    />
                                    <YAxis
                                      yAxisId="right"
                                      orientation="right"
                                      label={{
                                        value: "Cosinor Fit (mg)",
                                        angle: 90,
                                        position: "insideRight",
                                      }}
                                    />
                                    <RechartsTooltip
                                      content={({ active, payload, label }) => {
                                        if (
                                          active &&
                                          payload &&
                                          payload.length
                                        ) {
                                          return (
                                            <div
                                              style={{
                                                backgroundColor: "white",
                                                padding: "10px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                              }}
                                            >
                                              <p
                                                style={{
                                                  margin: "0 0 5px 0",
                                                }}
                                              >
                                                {new Date(
                                                  label
                                                ).toLocaleString()}
                                              </p>
                                              {payload.map((entry, index) => {
                                                let value = entry.value;
                                                let unit = "";
                                                if (entry.name === "TST") {
                                                  value =
                                                    Math.round(value).toFixed(
                                                      0
                                                    );
                                                  unit = " minutes";
                                                } else if (
                                                  entry.name === "WASO" ||
                                                  entry.name === "SOL"
                                                ) {
                                                  value = value.toFixed(0);
                                                  unit = " minutes";
                                                } else if (
                                                  entry.name === "PTA"
                                                ) {
                                                  value = value.toFixed(1);
                                                  unit = "%";
                                                } else if (
                                                  entry.name === "M10" ||
                                                  entry.name === "L5"
                                                ) {
                                                  value = value.toFixed(2);
                                                  unit = " mg";
                                                } else if (
                                                  [
                                                    "sedentary",
                                                    "light",
                                                    "moderate",
                                                    "vigorous",
                                                  ].includes(entry.name)
                                                ) {
                                                  value = value.toFixed(0);
                                                  unit = " minutes";
                                                }
                                                return (
                                                  <p
                                                    key={index}
                                                    style={{
                                                      margin: "0",
                                                      color: entry.color,
                                                    }}
                                                  >
                                                    {`${entry.name}: ${value}${unit}`}
                                                  </p>
                                                );
                                              })}
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                    <Legend />
                                    <Line
                                      type="monotone"
                                      dataKey="ENMO"
                                      stroke="#0034f0"
                                      dot={false}
                                      isAnimationActive={false}
                                      yAxisId="left"
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="cosinor_fitted"
                                      stroke={CLColors.error}
                                      dot={false}
                                      isAnimationActive={false}
                                      name="Cosinor Fit"
                                      yAxisId="left"
                                    />
                                    {/* M10 Period Band */}
                                    <ReferenceArea
                                      x1={m10StartDate.getTime()}
                                      x2={(() => {
                                        const x2Value = new Date(
                                          m10StartDate.getTime() +
                                            10 * 60 * 60 * 1000
                                        );
                                        if (
                                          x2Value.getHours() === 0 &&
                                          x2Value.getMinutes() === 0
                                        ) {
                                          return x2Value.getTime() - 60000;
                                        }
                                        return x2Value.getTime();
                                      })()}
                                      fill="#0034f0"
                                      fillOpacity={0.1}
                                      label="M10"
                                      yAxisId="left"
                                    />
                                    {/* L5 Period Band */}
                                    <ReferenceArea
                                      x1={l5StartDate.getTime()}
                                      x2={(() => {
                                        const x2Value = new Date(
                                          l5StartDate.getTime() +
                                            5 * 60 * 60 * 1000
                                        );
                                        if (
                                          x2Value.getHours() === 0 &&
                                          x2Value.getMinutes() === 0
                                        ) {
                                          return x2Value.getTime() - 60000;
                                        }
                                        return x2Value.getTime();
                                      })()}
                                      fill="#7aa7ff"
                                      fillOpacity={0.1}
                                      label="L5"
                                      yAxisId="left"
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Physical Activity Features */}
              {data?.features && data.features.physical_activity && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Physical Activity Features
                      </Typography>
                      <SectionInfoButton section="physical_activity" />
                    </Box>
                    {/* Stacked Bar Chart for Activity Levels */}
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={(() => {
                              const days = Array.from(
                                new Set(
                                  data.data.map((item) => {
                                    const date = new Date(item.TIMESTAMP);
                                    return date.toLocaleDateString("en-CA");
                                  })
                                )
                              );
                              return days.map((dayStr, dayIndex) => {
                                const sedentary =
                                  data.features.physical_activity.sedentary?.[
                                    dayIndex
                                  ] || 0;
                                const light =
                                  data.features.physical_activity.light?.[
                                    dayIndex
                                  ] || 0;
                                const moderate =
                                  data.features.physical_activity.moderate?.[
                                    dayIndex
                                  ] || 0;
                                const vigorous =
                                  data.features.physical_activity.vigorous?.[
                                    dayIndex
                                  ] || 0;
                                return {
                                  day: dayStr,
                                  sedentary,
                                  light,
                                  moderate,
                                  vigorous,
                                };
                              });
                            })()}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 30,
                              bottom: 20,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis
                              label={{
                                value: "Minutes",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <RechartsTooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div
                                      style={{
                                        backgroundColor: "white",
                                        padding: "10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      <p
                                        style={{
                                          margin: "0 0 5px 0",
                                        }}
                                      >
                                        {label}
                                      </p>
                                      {payload
                                        .slice()
                                        .reverse()
                                        .map((entry, index) => {
                                          let value = entry.value;
                                          let unit = "";
                                          if (entry.name === "TST") {
                                            value =
                                              Math.round(value).toFixed(0);
                                            unit = " minutes";
                                          } else if (
                                            entry.name === "WASO" ||
                                            entry.name === "SOL"
                                          ) {
                                            value = value.toFixed(0);
                                            unit = " minutes";
                                          } else if (entry.name === "PTA") {
                                            value = value.toFixed(1);
                                            unit = "%";
                                          } else if (
                                            entry.name === "M10" ||
                                            entry.name === "L5"
                                          ) {
                                            value = value.toFixed(2);
                                            unit = " mg";
                                          } else if (
                                            [
                                              "sedentary",
                                              "light",
                                              "moderate",
                                              "vigorous",
                                            ].includes(entry.name)
                                          ) {
                                            value = value.toFixed(0);
                                            unit = " minutes";
                                          }
                                          return (
                                            <p
                                              key={index}
                                              style={{
                                                margin: "0",
                                                color: entry.color,
                                              }}
                                            >
                                              {`${entry.name}: ${value}${unit}`}
                                            </p>
                                          );
                                        })}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend
                              content={({ payload }) => (
                                <ul
                                  style={{
                                    listStyle: "none",
                                    padding: 0,
                                    margin: 0,
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "20px",
                                  }}
                                >
                                  {payload
                                    ?.slice()
                                    .reverse()
                                    .map((entry, index) => (
                                      <li
                                        key={`item-${index}`}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: "14px",
                                            height: "14px",
                                            backgroundColor: entry.color,
                                            marginRight: "8px",
                                          }}
                                        />
                                        <span style={{ color: "#666" }}>
                                          {entry.value}
                                        </span>
                                      </li>
                                    ))}
                                </ul>
                              )}
                            />
                            <Bar
                              dataKey="sedentary"
                              stackId="a"
                              fill="#d1d8ff"
                              name="Sedentary"
                            />
                            <Bar
                              dataKey="light"
                              stackId="a"
                              fill="#bdcbff"
                              name="Light"
                            />
                            <Bar
                              dataKey="moderate"
                              stackId="a"
                              fill="#577bff"
                              name="Moderate"
                            />
                            <Bar
                              dataKey="vigorous"
                              stackId="a"
                              fill="#0034f0"
                              name="Vigorous"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Sleep Features */}
              {data?.features && data.features.sleep && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Sleep Features
                      </Typography>
                      <SectionInfoButton section="sleep" />
                    </Box>
                    <Grid container spacing={2}>
                      {Object.entries(data.features.sleep)
                        .filter(([key]) => key.toLowerCase() !== "sri_flag") // Filter out SRI_flag but keep SRI
                        .sort(([keyA], [keyB]) => {
                          // Define the desired order - SRI first, then others
                          const order = {
                            sri: 1,
                            tst: 2,
                            waso: 3,
                            sol: 4,
                            pta: 5,
                            nwb: 6,
                          };
                          const orderA = order[keyA.toLowerCase()] || 7;
                          const orderB = order[keyB.toLowerCase()] || 7;
                          return orderA - orderB;
                        })
                        .map(([key, value]) => (
                          <Grid item xs={12} key={key}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                {key === "TST"
                                  ? "Total Sleep Time (TST)"
                                  : key === "WASO"
                                  ? "Wake After Sleep Onset (WASO)"
                                  : key === "SOL"
                                  ? "Sleep Onset Latency (SOL)"
                                  : key === "PTA"
                                  ? "Percent Time Asleep (PTA)"
                                  : key === "NWB"
                                  ? "Number of Wake Bouts (NWB)"
                                  : key === "SRI"
                                  ? "Sleep Regularity Index (SRI)"
                                  : key
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Typography>
                              <SectionInfoButton metric={key} />
                            </Box>
                            {/* SRI as horizontal scale */}
                            {key.toLowerCase() === "sri" &&
                            typeof value === "number" ? (
                              <HorizontalScale
                                value={value}
                                min={-100}
                                max={100}
                                color="#0034f0"
                              />
                            ) : Array.isArray(value) ? (
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 300,
                                  mt: 2,
                                }}
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={value.map((v, index) => ({
                                      day: getDateForIndex(key, index, data),
                                      [key]: v,
                                    }))}
                                    margin={{
                                      top: 20,
                                      right: 30,
                                      left: 30,
                                      bottom: 20,
                                    }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis
                                      label={{
                                        value:
                                          key === "PTA"
                                            ? "Percentage (%)"
                                            : key === "NWB"
                                            ? "Number of Bouts"
                                            : "Minutes",
                                        angle: -90,
                                        position: "insideLeft",
                                      }}
                                    />
                                    <RechartsTooltip
                                      content={({ active, payload, label }) => {
                                        if (
                                          active &&
                                          payload &&
                                          payload.length
                                        ) {
                                          return (
                                            <div
                                              style={{
                                                backgroundColor: "white",
                                                padding: "10px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                              }}
                                            >
                                              <p
                                                style={{
                                                  margin: "0 0 5px 0",
                                                }}
                                              >
                                                {label}
                                              </p>
                                              {payload.map((entry, index) => {
                                                let value = entry.value;
                                                let unit = "";
                                                if (entry.name === "TST") {
                                                  value =
                                                    Math.round(value).toFixed(
                                                      0
                                                    );
                                                  unit = " minutes";
                                                } else if (
                                                  entry.name === "WASO" ||
                                                  entry.name === "SOL"
                                                ) {
                                                  value = value.toFixed(0);
                                                  unit = " minutes";
                                                } else if (
                                                  entry.name === "PTA"
                                                ) {
                                                  value = value.toFixed(1);
                                                  unit = "%";
                                                } else if (
                                                  entry.name === "NWB"
                                                ) {
                                                  value = value.toFixed(0);
                                                  unit = " bouts";
                                                }
                                                return (
                                                  <p
                                                    key={index}
                                                    style={{
                                                      margin: "0",
                                                      color: entry.color,
                                                    }}
                                                  >
                                                    {`${entry.name}: ${value}${unit}`}
                                                  </p>
                                                );
                                              })}
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                    <Legend />
                                    <Bar
                                      dataKey={key}
                                      fill="#0034f0"
                                      name={key}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </Box>
                            ) : (
                              <Typography variant="body1">
                                {typeof value === "number"
                                  ? key === "PTA"
                                    ? `${value.toFixed(1)}%`
                                    : key === "NWB"
                                    ? `${value.toFixed(0)} bouts`
                                    : `${value.toFixed(0)} minutes`
                                  : value}
                              </Typography>
                            )}
                          </Grid>
                        ))}
                    </Grid>

                    {/* Daily ENMO Time Series with Sleep Bands */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Daily ENMO Time Series with Sleep Periods
                      </Typography>
                      {/* Custom legend for sleep periods */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                          ml: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 18,
                            height: 18,
                            bgcolor: "#bdcbff",
                            opacity: 0.9,
                            border: "1px solid #bdcbff",
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Sleep Period
                        </Typography>
                      </Box>
                      <Grid container spacing={3}>
                        {Array.from(
                          new Set(
                            data.data.map((item) => {
                              const date = new Date(item.TIMESTAMP);
                              return date.toLocaleDateString("en-CA");
                            })
                          )
                        ).map((dayStr, dayIndex) => {
                          const dayData = data.data.filter((item) => {
                            const date = new Date(item.TIMESTAMP);
                            return date.toLocaleDateString("en-CA") === dayStr;
                          });
                          if (dayData.length === 0) return null;
                          // Add a 'timestampNum' property for numeric x-axis
                          const dayDataWithNum = dayData.map((item) => ({
                            ...item,
                            timestampNum: new Date(item.TIMESTAMP).getTime(),
                          }));
                          const dayDataWithNumSorted = [...dayDataWithNum].sort(
                            (a, b) => a.timestampNum - b.timestampNum
                          );
                          // Find sleep=1 intervals
                          const sleepBands = [];
                          let bandStart = null;
                          for (
                            let i = 0;
                            i < dayDataWithNumSorted.length;
                            i++
                          ) {
                            if (
                              dayDataWithNumSorted[i].sleep === 1 &&
                              bandStart === null
                            ) {
                              bandStart = dayDataWithNumSorted[i].timestampNum;
                            }
                            if (
                              (dayDataWithNumSorted[i].sleep !== 1 ||
                                i === dayDataWithNumSorted.length - 1) &&
                              bandStart !== null
                            ) {
                              const bandEnd =
                                dayDataWithNumSorted[i - 1].timestampNum;
                              sleepBands.push({
                                start: bandStart,
                                end: bandEnd,
                              });
                              bandStart = null;
                            }
                          }
                          return (
                            <Grid item xs={12} key={dayStr}>
                              <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography
                                  variant="subtitle1"
                                  gutterBottom
                                  align="center"
                                >
                                  {dayStr}
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart
                                    data={dayDataWithNumSorted}
                                    margin={{
                                      top: 20,
                                      right: 30,
                                      left: 30,
                                      bottom: 20,
                                    }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="timestampNum"
                                      type="number"
                                      domain={["dataMin", "dataMax"]}
                                      tickFormatter={(timestampNum) => {
                                        const date = new Date(timestampNum);
                                        return date.toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        });
                                      }}
                                    />
                                    <YAxis
                                      yAxisId="left"
                                      label={{
                                        value: "ENMO (mg)",
                                        angle: -90,
                                        position: "insideLeft",
                                      }}
                                    />
                                    <RechartsTooltip
                                      content={({ active, payload, label }) => {
                                        if (
                                          active &&
                                          payload &&
                                          payload.length
                                        ) {
                                          return (
                                            <div
                                              style={{
                                                backgroundColor: "white",
                                                padding: "10px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                              }}
                                            >
                                              <p
                                                style={{
                                                  margin: "0 0 5px 0",
                                                }}
                                              >
                                                {new Date(
                                                  label
                                                ).toLocaleString()}
                                              </p>
                                              {payload.map((entry, index) => {
                                                let value = entry.value;
                                                let unit = "";
                                                if (entry.name === "TST") {
                                                  value =
                                                    Math.round(value).toFixed(
                                                      0
                                                    );
                                                  unit = " minutes";
                                                } else if (
                                                  entry.name === "WASO" ||
                                                  entry.name === "SOL"
                                                ) {
                                                  value = value.toFixed(0);
                                                  unit = " minutes";
                                                } else if (
                                                  entry.name === "PTA"
                                                ) {
                                                  value = value.toFixed(1);
                                                  unit = "%";
                                                }
                                                return (
                                                  <p
                                                    key={index}
                                                    style={{
                                                      margin: "0",
                                                      color: entry.color,
                                                    }}
                                                  >
                                                    {`${entry.name}: ${value}${unit}`}
                                                  </p>
                                                );
                                              })}
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                    <Legend />
                                    <Line
                                      type="monotone"
                                      dataKey="ENMO"
                                      stroke="#0034f0"
                                      dot={false}
                                      isAnimationActive={false}
                                      yAxisId="left"
                                    />
                                    {/* Blue bands for sleep=1 */}
                                    {sleepBands.map((band, idx) => (
                                      <ReferenceArea
                                        key={`sleep-band-${idx}`}
                                        x1={band.start}
                                        x2={band.end}
                                        fill="#bdcbff"
                                        fillOpacity={0.15}
                                        yAxisId="left"
                                      />
                                    ))}
                                  </LineChart>
                                </ResponsiveContainer>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </>
          )}
        </>
      )}

      {/* Error Banner - Display at bottom */}
      {error && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            p: 2,
          }}
        >
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{
              maxWidth: "100%",
              mx: "auto",
              boxShadow: "0px -4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {error}
            </Typography>
          </Alert>
        </Box>
      )}
    </>
  );
};

export default SingleIndividualLabSubTab;
