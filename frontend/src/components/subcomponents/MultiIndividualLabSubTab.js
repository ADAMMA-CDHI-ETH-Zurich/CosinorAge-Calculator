import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
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
  LinearProgress,
  FormControlLabel,
  Switch,
  Slider,
  DialogActions,
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
  FormHelperText,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from "recharts";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import UploadIcon from "@mui/icons-material/Upload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningIcon from "@mui/icons-material/Warning";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorIcon from "@mui/icons-material/Error";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import config from "../../config";
import { CLColors } from "../../plotTheme";

// Helper to clean and format feature names for display
const cleanFeatureName = (featureName) => {
  // Special cases for cosinorage features
  if (featureName === "cosinorage" || featureName === "cosinor_cosinorage") {
    return "Cosinorage";
  }
  if (featureName === "cosinorage_advance") {
    return "Cosinorage\nAdvance";
  }

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
  // Special case for acrophase time
  if (
    cleanedName.toLowerCase().includes("acrophase") &&
    cleanedName.toLowerCase().includes("time")
  ) {
    return "Acrophase\nTime";
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

// Multi Individual Tab Component
const MultiIndividualTab = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [bulkData, setBulkData] = useState(null);
  const [bulkError, setBulkError] = useState(null);
  const [bulkSuccess, setBulkSuccess] = useState(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProcessingTime, setBulkProcessingTime] = useState(0);
  const [bulkTimerInterval, setBulkTimerInterval] = useState(null);
  const [bulkDragActive, setBulkDragActive] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
  const bulkFileInputRef = useRef(null);
  const [bulkDataType, setBulkDataType] = useState("");
  const [bulkDataUnit, setBulkDataUnit] = useState("");
  const [bulkTimestampFormat, setBulkTimestampFormat] = useState("");
  const [bulkTimeColumn, setBulkTimeColumn] = useState("");
  const [bulkDataColumns, setBulkDataColumns] = useState([]);
  const [bulkXColumn, setBulkXColumn] = useState("");
  const [bulkYColumn, setBulkYColumn] = useState("");
  const [bulkZColumn, setBulkZColumn] = useState("");
  const [bulkColumnNames, setBulkColumnNames] = useState([]);
  const [bulkColumnSelectionComplete, setBulkColumnSelectionComplete] =
    useState(false);
  const [
    bulkColumnSelectionManuallyCompleted,
    setBulkColumnSelectionManuallyCompleted,
  ] = useState(false);
  const [columnValidationResult, setColumnValidationResult] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showFailedFilesDialog, setShowFailedFilesDialog] = useState(false);
  const [showProcessingFailuresDialog, setShowProcessingFailuresDialog] =
    useState(false);
  const [showUploadedFilesDialog, setShowUploadedFilesDialog] = useState(false);
  const [showFeatureDistributionsDialog, setShowFeatureDistributionsDialog] =
    useState(false);
  const [showEnmoTimeseriesDialog, setShowEnmoTimeseriesDialog] =
    useState(false);
  const [showCosinorageDialog, setShowCosinorageDialog] = useState(false);
  const [bulkPreprocessParams, setBulkPreprocessParams] = useState({
    autocalib_sd_criter: 0.00013,
    autocalib_sphere_crit: 0.02,
    filter_type: "lowpass",
    filter_cutoff: 2,
    wear_sd_criter: 0.00013,
    wear_range_crit: 0.00067,
    wear_window_length: 45,
    wear_window_skip: 7,
    required_daily_coverage: 0.5,
  });
  const [bulkFeatureParams, setBulkFeatureParams] = useState({
    sleep_rescore: true,
    sleep_ck_sf: 0.0025,
    pa_cutpoint_sl: 15,
    pa_cutpoint_lm: 35,
    pa_cutpoint_mv: 70,
  });

  // Cosinorage parameters for each file
  const [bulkCosinorAgeInputs, setBulkCosinorAgeInputs] = useState([]);
  const [enableCosinorage, setEnableCosinorage] = useState(false);

  const startBulkTimer = () => {
    setBulkProcessingTime(0);
    const interval = setInterval(() => {
      setBulkProcessingTime((prev) => prev + 1);
    }, 1000);
    setBulkTimerInterval(interval);
  };

  const stopBulkTimer = () => {
    if (bulkTimerInterval) {
      clearInterval(bulkTimerInterval);
      setBulkTimerInterval(null);
    }
  };

  const fetchBulkColumnNames = async (fileId) => {
    try {
      const response = await fetch(config.getApiUrl(`get_columns/${fileId}`));
      if (!response.ok) {
        throw new Error("Failed to fetch column names");
      }
      const columnNames = await response.json();
      setBulkColumnNames(columnNames);

      // Set default column selections
      setDefaultColumnSelections(columnNames);
    } catch (err) {
      setBulkError(err.message);
    }
  };

  const setDefaultColumnSelections = (columnNames) => {
    // Set default time column
    const commonTimeColumns = ["timestamp", "time", "datetime", "date", "t"];
    let defaultTimeColumn = "";
    for (const col of commonTimeColumns) {
      if (columnNames.includes(col)) {
        defaultTimeColumn = col;
        break;
      }
    }
    if (!defaultTimeColumn && columnNames.length > 0) {
      defaultTimeColumn = columnNames[0];
    }
    setBulkTimeColumn(defaultTimeColumn);

    // Set default data columns based on data type
    if (bulkDataType === "accelerometer") {
      // Look for X, Y, Z columns
      const accelColumns = { x: "", y: "", z: "" };
      for (const col of columnNames) {
        const lowerCol = col.toLowerCase();
        if (lowerCol.includes("x") && col !== defaultTimeColumn) {
          accelColumns.x = col;
        } else if (lowerCol.includes("y") && col !== defaultTimeColumn) {
          accelColumns.y = col;
        } else if (lowerCol.includes("z") && col !== defaultTimeColumn) {
          accelColumns.z = col;
        }
      }

      // If we found X, Y, Z columns, use them
      if (accelColumns.x && accelColumns.y && accelColumns.z) {
        setBulkXColumn(accelColumns.x);
        setBulkYColumn(accelColumns.y);
        setBulkZColumn(accelColumns.z);
      } else {
        // Otherwise, use first 3 non-time columns
        const nonTimeColumns = columnNames.filter(
          (col) => col !== defaultTimeColumn
        );
        if (nonTimeColumns.length >= 3) {
          setBulkXColumn(nonTimeColumns[0]);
          setBulkYColumn(nonTimeColumns[1]);
          setBulkZColumn(nonTimeColumns[2]);
        }
      }

      // Update column selection completion status
      const nonTimeColumns = columnNames.filter(
        (col) => col !== defaultTimeColumn
      );
      setBulkColumnSelectionComplete(
        defaultTimeColumn !== "" &&
          (accelColumns.x ||
            (nonTimeColumns.length > 0 ? nonTimeColumns[0] : "")) &&
          (accelColumns.y ||
            (nonTimeColumns.length > 1 ? nonTimeColumns[1] : "")) &&
          (accelColumns.z ||
            (nonTimeColumns.length > 2 ? nonTimeColumns[2] : ""))
      );
    } else if (bulkDataType === "enmo") {
      // For ENMO data, look for ENMO column
      let defaultDataColumns = [];
      for (const col of columnNames) {
        if (col.toLowerCase().includes("enmo") && col !== defaultTimeColumn) {
          defaultDataColumns = [col];
          break;
        }
      }
      if (defaultDataColumns.length === 0) {
        const nonTimeColumns = columnNames.filter(
          (col) => col !== defaultTimeColumn
        );
        if (nonTimeColumns.length > 0) {
          defaultDataColumns = [nonTimeColumns[0]];
        }
      }

      setBulkDataColumns(defaultDataColumns);
      setBulkColumnSelectionComplete(
        defaultTimeColumn !== "" && defaultDataColumns.length > 0
      );
    } else if (bulkDataType) {
      // For other data types, use all non-time columns
      const defaultDataColumns = columnNames.filter(
        (col) => col !== defaultTimeColumn
      );
      setBulkDataColumns(defaultDataColumns);
      setBulkColumnSelectionComplete(
        defaultTimeColumn !== "" && defaultDataColumns.length > 0
      );
    } else {
      // If no data type is set yet, set basic defaults
      const nonTimeColumns = columnNames.filter(
        (col) => col !== defaultTimeColumn
      );
      if (nonTimeColumns.length > 0) {
        setBulkDataColumns([nonTimeColumns[0]]);
        setBulkColumnSelectionComplete(
          defaultTimeColumn !== "" && nonTimeColumns.length > 0
        );
      }
    }
  };

  const fetchFilePreview = async (fileId) => {
    try {
      const response = await fetch(config.getApiUrl(`preview/${fileId}`));
      if (!response.ok) {
        throw new Error("Failed to fetch file preview");
      }
      const previewData = await response.json();
      setFilePreview(previewData);
    } catch (err) {
      setBulkError(err.message);
    }
  };

  const validateBulkColumns = async (fileIds = null) => {
    const filesToValidate =
      fileIds || uploadedFiles.map((file) => file.file_id);

    if (filesToValidate.length < 2) {
      return {
        valid: true,
        message: "Only one file uploaded, no validation needed",
      };
    }

    try {
      const response = await fetch(config.getApiUrl("validate_bulk_columns"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filesToValidate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to validate columns");
      }

      return await response.json();
    } catch (err) {
      throw new Error(`Column validation failed: ${err.message}`);
    }
  };

  const handleBulkFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setBulkError(null);
    setBulkSuccess(null);
    setBulkUploadProgress(0);
    setColumnValidationResult(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setBulkUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          setUploadedFiles(result.files);
          setBulkUploadProgress(100);

          // Update cosinorage inputs for the uploaded files
          updateBulkCosinorAgeInputs(result.files);

          // Fetch column names from the first file to get column options
          if (result.files.length > 0) {
            fetchBulkColumnNames(result.files[0].file_id);
          }

          // Immediately validate column structure if multiple files
          if (result.files.length > 1) {
            try {
              console.log("Validating columns after upload...");
              const fileIds = result.files.map((file) => file.file_id);
              console.log("File IDs to validate:", fileIds);
              const validationResult = await validateBulkColumns(fileIds);
              console.log("Upload validation result:", validationResult);

              setColumnValidationResult(validationResult);

              if (!validationResult.valid) {
                setBulkError(
                  `Column validation failed: ${validationResult.message}. Files must have identical column structures.`
                );
                setBulkSuccess(null);
                // Clear uploaded files when validation fails
                setUploadedFiles([]);
                setBulkColumnNames([]);
                setBulkTimeColumn("");
                setBulkDataColumns([]);
                setBulkXColumn("");
                setBulkYColumn("");
                setBulkZColumn("");
                setBulkColumnSelectionComplete(false);
                setBulkColumnSelectionManuallyCompleted(false);
                setColumnValidationResult(null);
                setFilePreview(null);
              } else {
                // Fetch preview of the first file
                if (result.files.length > 0) {
                  fetchFilePreview(result.files[0].file_id);
                }
              }
            } catch (validationErr) {
              setBulkError(validationErr.message);
              setBulkSuccess(null);
              setColumnValidationResult({
                valid: false,
                message: validationErr.message,
              });
              // Clear uploaded files when validation fails
              setUploadedFiles([]);
              setBulkColumnNames([]);
              setBulkTimeColumn("");
              setBulkDataColumns([]);
              setBulkXColumn("");
              setBulkYColumn("");
              setBulkZColumn("");
              setBulkColumnSelectionComplete(false);
              setBulkColumnSelectionManuallyCompleted(false);
              setColumnValidationResult(null);
              setFilePreview(null);
            }
          } else {
            setColumnValidationResult({
              valid: true,
              message: "Single file uploaded, no validation needed",
            });
            // Fetch preview of the first file for single file uploads
            if (result.files.length > 0) {
              fetchFilePreview(result.files[0].file_id);
            }
          }
        } else {
          const errorData = JSON.parse(xhr.responseText);
          throw new Error(errorData.detail || "Failed to upload files");
        }
      });

      xhr.addEventListener("error", () => {
        throw new Error("Network error occurred during upload");
      });

      xhr.open("POST", config.getApiUrl("bulk_upload"));
      xhr.send(formData);
    } catch (err) {
      setBulkError(err.message);
      setBulkUploadProgress(0);
    }
  };

  const handleBulkProcessData = async () => {
    if (uploadedFiles.length === 0) {
      setBulkError("No files uploaded");
      return;
    }

    if (!bulkDataType || !bulkDataUnit || !bulkTimestampFormat) {
      setBulkError("Please select data type, data unit, and timestamp format");
      return;
    }

    if (!bulkColumnSelectionComplete) {
      setBulkError("Please complete column selection before processing data");
      return;
    }

    setBulkProcessing(true);
    setBulkError(null);
    setBulkSuccess(null);
    startBulkTimer();

    try {
      // First validate that all files have the same column structure
      console.log("Validating columns before processing...");
      const validationResult = await validateBulkColumns();
      console.log("Validation result:", validationResult);

      if (!validationResult.valid) {
        throw new Error(
          `Column validation failed: ${validationResult.message}. Files must have identical column structures.`
        );
      }

      const fileConfigs = uploadedFiles.map((file) => ({
        file_id: file.file_id,
        data_type: bulkDataType,
        data_unit: bulkDataUnit,
        timestamp_format: bulkTimestampFormat,
        time_column: bulkTimeColumn,
        data_columns:
          bulkDataType === "accelerometer"
            ? [bulkXColumn, bulkYColumn, bulkZColumn]
            : bulkDataColumns,
      }));

      // Prepare cosinorage inputs for the API (only if enabled)
      if (enableCosinorage) {
        const validation = getCosinorageValidationStatus();

        if (!validation.isValid) {
          throw new Error(
            `Cosinorage is enabled but age and gender are not properly set for ${validation.missingCount} file(s). Please set valid age and gender for all files or disable CosinorAge.`
          );
        }
      }

      // Note: cosinor_age_inputs should be used by the backend only for successfully processed files
      // The backend should match the age inputs with the successful handlers in the same order

      const processResponse = await fetch(config.getApiUrl("bulk_process"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: fileConfigs,
          preprocess_args: bulkPreprocessParams,
          features_args: bulkFeatureParams,
          enable_cosinorage: enableCosinorage,
          cosinor_age_inputs: enableCosinorage
            ? bulkCosinorAgeInputs.map((input) => ({
                gender: input.gender,
                age: parseFloat(input.age),
              }))
            : [],
        }),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.detail || "Failed to process data");
      }

      const processResult = await processResponse.json();
      setBulkData(processResult);

      // Create a more informative success message
      const actualSuccessfulCount =
        processResult.individual_results?.length || 0;
      const totalCount = processResult.total_files || uploadedFiles.length;
      const handlerFailures = processResult.failed_files?.length || 0;
      const processingFailures = processResult.failed_handlers?.length || 0;
      const totalFailures = handlerFailures + processingFailures;

      if (totalFailures > 0) {
        if (handlerFailures > 0 && processingFailures > 0) {
          setBulkSuccess(
            `Successfully processed ${actualSuccessfulCount} out of ${totalCount} files. ${handlerFailures} files failed during loading, ${processingFailures} files failed during processing.`
          );
        } else if (handlerFailures > 0) {
          setBulkSuccess(
            `Successfully processed ${actualSuccessfulCount} out of ${totalCount} files. ${handlerFailures} files failed during loading.`
          );
        } else {
          setBulkSuccess(
            `Successfully processed ${actualSuccessfulCount} out of ${totalCount} files. ${processingFailures} files failed during processing.`
          );
        }
      } else {
        setBulkSuccess(
          `Successfully processed all ${actualSuccessfulCount} files!`
        );
      }
    } catch (err) {
      setBulkError(err.message);
    } finally {
      setBulkProcessing(false);
      stopBulkTimer();
    }
  };

  const handleBulkPreprocessParamChange = (param, value) => {
    let processedValue = value;
    const numericParams = [
      "autocalib_sd_criter",
      "autocalib_sphere_crit",
      "filter_cutoff",
      "wear_sd_criter",
      "wear_range_crit",
      "wear_window_length",
      "wear_window_skip",
      "required_daily_coverage",
    ];

    if (
      numericParams.includes(param) &&
      value !== "" &&
      value !== null &&
      value !== undefined
    ) {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
        processedValue = value;
      }
    }

    setBulkPreprocessParams((prev) => ({
      ...prev,
      [param]: processedValue,
    }));
  };

  const handleBulkFeatureParamChange = (param, value) => {
    let processedValue = value;
    const numericParams = [
      "sleep_ck_sf",
      "pa_cutpoint_sl",
      "pa_cutpoint_lm",
      "pa_cutpoint_mv",
    ];
    const booleanParams = ["sleep_rescore"];

    if (
      numericParams.includes(param) &&
      value !== "" &&
      value !== null &&
      value !== undefined
    ) {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
        processedValue = value;
      }
    } else if (booleanParams.includes(param)) {
      processedValue = value;
    }

    setBulkFeatureParams((prev) => ({
      ...prev,
      [param]: processedValue,
    }));
  };

  const updateBulkCosinorAgeInputs = (files) => {
    const newInputs = files.map((file) => ({
      file_id: file.file_id,
      filename: file.filename,
      age: "50",
      gender: "unknown",
    }));
    setBulkCosinorAgeInputs(newInputs);
  };

  const handleBulkCosinorAgeInputChange = (fileId, field, value) => {
    setBulkCosinorAgeInputs((prev) =>
      prev.map((input) =>
        input.file_id === fileId ? { ...input, [field]: value } : input
      )
    );
  };

  const getCosinorageValidationStatus = () => {
    if (!enableCosinorage) return { isValid: true, missingCount: 0 };

    const missingInputs = bulkCosinorAgeInputs.filter(
      (input) => !input.age || input.age === "" || input.gender === ""
    );

    return {
      isValid: missingInputs.length === 0,
      missingCount: missingInputs.length,
      totalCount: bulkCosinorAgeInputs.length,
    };
  };

  const handleBulkDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setBulkDragActive(true);
    } else if (e.type === "dragleave") {
      setBulkDragActive(false);
    }
  };

  const handleBulkDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBulkDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBulkFileUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleBulkReset = async () => {
    try {
      // Clear all uploaded files and directories from the server
      await fetch(config.getApiUrl("clear_all_state"), {
        method: "POST",
      });
    } catch (error) {
      console.warn("Failed to clear server state:", error);
    }

    // Clear frontend state
    setUploadedFiles([]);
    setBulkData(null);
    setBulkError(null);
    setBulkSuccess(null);
    setBulkProcessing(false);
    setBulkProcessingTime(0);
    setBulkDragActive(false);
    setBulkUploadProgress(0);
    setBulkDataType("");
    setBulkDataUnit("");
    setBulkTimestampFormat("");
    setBulkTimeColumn("");
    setBulkDataColumns([]);
    setBulkXColumn("");
    setBulkYColumn("");
    setBulkZColumn("");
    setBulkColumnNames([]);
    setBulkColumnSelectionComplete(false);
    setBulkColumnSelectionManuallyCompleted(false);
    setColumnValidationResult(null);
    setFilePreview(null);
    setShowFailedFilesDialog(false);
    setShowProcessingFailuresDialog(false);
    setShowUploadedFilesDialog(false);
    setShowCosinorageDialog(false);
    setBulkCosinorAgeInputs([]);
    setEnableCosinorage(false);

    // Reset parameters to defaults
    setBulkPreprocessParams({
      autocalib_sd_criter: 0.00013,
      autocalib_sphere_crit: 0.02,
      filter_type: "lowpass",
      filter_cutoff: 2,
      wear_sd_criter: 0.00013,
      wear_range_crit: 0.00067,
      wear_window_length: 45,
      wear_window_skip: 7,
      required_daily_coverage: 0.5,
    });
    setBulkFeatureParams({
      sleep_rescore: true,
      sleep_ck_sf: 0.0025,
      pa_cutpoint_sl: 15,
      pa_cutpoint_lm: 35,
      pa_cutpoint_mv: 70,
    });

    // Clear file input
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* File Upload Section */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upload Multiple CSV Files
          </Typography>

          {/* File Upload Area */}
          <Box
            onDragEnter={handleBulkDrag}
            onDragLeave={handleBulkDrag}
            onDragOver={handleBulkDrag}
            onDrop={handleBulkDrop}
            sx={{
              width: "300%",
              maxWidth: "100%",
              mx: "auto",
              border: "2px dashed",
              borderColor: bulkDragActive ? "primary.main" : "grey.300",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              bgcolor: bulkDragActive ? "primary.50" : "background.paper",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              position: "relative",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "primary.50",
              },
            }}
            onClick={() => bulkFileInputRef.current?.click()}
          >
            <input
              ref={bulkFileInputRef}
              type="file"
              multiple
              accept=".csv"
              onChange={handleBulkFileUpload}
              style={{ display: "none" }}
            />
            <UploadIcon sx={{ fontSize: 48, color: "grey.500", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drop CSV files here or click to select
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select multiple CSV files for bulk processing
            </Typography>
          </Box>

          {/* Upload Progress */}
          {bulkUploadProgress > 0 && bulkUploadProgress < 100 && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={bulkUploadProgress}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Uploading... {Math.round(bulkUploadProgress)}%
              </Typography>
            </Box>
          )}

          {/* Uploaded Files Banner */}
          {uploadedFiles.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  bgcolor: "rgba(0, 52, 240, 0.08)",
                  borderRadius: 1,
                  border: "1px solid rgba(0, 52, 240, 0.2)",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, color: "#0034f0" }}
                >
                  Successfully uploaded {uploadedFiles.length} files
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowUploadedFilesDialog(true)}
                  sx={{
                    color: "#0034f0",
                    borderColor: "#0034f0",
                    "&:hover": {
                      borderColor: "#0034f0",
                      bgcolor: "rgba(0, 52, 240, 0.1)",
                    },
                  }}
                >
                  View Files
                </Button>
              </Box>
            </Box>
          )}

          {/* Column Validation Banner */}
          {columnValidationResult && columnValidationResult.valid && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "rgba(0, 52, 240, 0.08)",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  color: "#0034f0",
                }}
              >
                <CheckCircleIcon fontSize="small" sx={{ color: "#0034f0" }} />
                All files have the same column structure
              </Typography>
            </Box>
          )}

          {/* File Preview */}
          {filePreview && (
            <Box
              sx={{
                mt: 3,
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
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                CSV Preview (First 2 rows including header):
              </Typography>
              <Box sx={{ overflowX: "auto", maxWidth: "100%" }}>
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
                      {filePreview.preview[0] &&
                        Object.keys(filePreview.preview[0]).map(
                          (column, index) => (
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
                          )
                        )}
                    </tr>
                  </thead>
                  <tbody>
                    {filePreview.preview.slice(0, 2).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.keys(filePreview.preview[0] || {}).map(
                          (column, colIndex) => (
                            <td
                              key={colIndex}
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                backgroundColor:
                                  rowIndex % 2 === 0 ? "#ffffff" : "#fafafa",
                              }}
                            >
                              {row[column] !== undefined
                                ? String(row[column]).substring(0, 50)
                                : ""}
                            </td>
                          )
                        )}
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
                Note: Values are truncated to 50 characters for display. Use
                this preview to identify the correct column names.
              </Typography>
            </Box>
          )}

          {/* Data Configuration */}
          {columnValidationResult && columnValidationResult.valid && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Data Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Data Type</InputLabel>
                    <Select
                      value={bulkDataType}
                      label="Data Type"
                      onChange={(e) => {
                        setBulkDataType(e.target.value);
                        // Reset column selections when data type changes
                        setBulkDataColumns([]);
                        setBulkXColumn("");
                        setBulkYColumn("");
                        setBulkZColumn("");
                        setBulkColumnSelectionComplete(false);
                        setBulkColumnSelectionManuallyCompleted(false);
                        // Reset data unit if switching to ENMO and current unit is m/s²
                        if (
                          e.target.value === "enmo" &&
                          bulkDataUnit === "m/s²"
                        ) {
                          setBulkDataUnit("");
                        }
                        // Update default column selections when data type changes
                        if (bulkColumnNames.length > 0) {
                          setDefaultColumnSelections(bulkColumnNames);
                        }
                      }}
                    >
                      <MenuItem value="enmo">ENMO</MenuItem>
                      <MenuItem value="accelerometer">Accelerometer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Data Unit</InputLabel>
                    <Select
                      value={bulkDataUnit}
                      label="Data Unit"
                      disabled={!bulkDataType}
                      onChange={(e) => {
                        setBulkDataUnit(e.target.value);
                        // Update default column selections when data unit changes
                        if (bulkColumnNames.length > 0) {
                          setDefaultColumnSelections(bulkColumnNames);
                        }
                      }}
                    >
                      {!bulkDataType && (
                        <MenuItem value="" disabled>
                          Select Data Unit
                        </MenuItem>
                      )}
                      {bulkDataType === "accelerometer" && (
                        <MenuItem value="mg">mg</MenuItem>
                      )}
                      {bulkDataType === "accelerometer" && (
                        <MenuItem value="g">g</MenuItem>
                      )}
                      {bulkDataType === "accelerometer" && (
                        <MenuItem value="m/s²">m/s²</MenuItem>
                      )}
                      {bulkDataType === "enmo" && (
                        <MenuItem value="mg">mg</MenuItem>
                      )}
                      {bulkDataType === "enmo" && (
                        <MenuItem value="g">g</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Timestamp Format</InputLabel>
                    <Select
                      value={bulkTimestampFormat}
                      label="Timestamp Format"
                      disabled={!bulkDataType || !bulkDataUnit}
                      onChange={(e) => {
                        setBulkTimestampFormat(e.target.value);
                        // Update default column selections when timestamp format changes
                        if (bulkColumnNames.length > 0) {
                          setDefaultColumnSelections(bulkColumnNames);
                        }
                      }}
                    >
                      <MenuItem value="datetime">Datetime</MenuItem>
                      <MenuItem value="unix-s">Unix - seconds</MenuItem>
                      <MenuItem value="unix-ms">Unix - milliseconds</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Column Selection */}
          {bulkColumnNames.length > 0 &&
            bulkDataType &&
            bulkDataUnit &&
            bulkTimestampFormat &&
            !bulkColumnSelectionManuallyCompleted && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Column Selection
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Timestamp Column</InputLabel>
                      <Select
                        value={bulkTimeColumn}
                        label="Timestamp Column"
                        onChange={(e) => {
                          setBulkTimeColumn(e.target.value);
                          if (bulkDataType === "accelerometer") {
                            const isComplete =
                              bulkXColumn !== "" &&
                              bulkYColumn !== "" &&
                              bulkZColumn !== "";
                            setBulkColumnSelectionComplete(isComplete);
                            setBulkColumnSelectionManuallyCompleted(isComplete);
                          } else {
                            const isComplete = bulkDataColumns.length > 0;
                            setBulkColumnSelectionComplete(isComplete);
                            setBulkColumnSelectionManuallyCompleted(isComplete);
                          }
                        }}
                      >
                        {bulkColumnNames.map((column) => (
                          <MenuItem key={column} value={column}>
                            {column}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {bulkDataType === "accelerometer" ? (
                    <>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                          <InputLabel>X Column</InputLabel>
                          <Select
                            value={bulkXColumn}
                            label="X Column"
                            onChange={(e) => {
                              setBulkXColumn(e.target.value);
                              const isComplete =
                                bulkTimeColumn !== "" &&
                                bulkYColumn !== "" &&
                                bulkZColumn !== "";
                              setBulkColumnSelectionComplete(isComplete);
                              setBulkColumnSelectionManuallyCompleted(
                                isComplete
                              );
                            }}
                          >
                            {bulkColumnNames.map((column) => (
                              <MenuItem key={column} value={column}>
                                {column}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                          <InputLabel>Y Column</InputLabel>
                          <Select
                            value={bulkYColumn}
                            label="Y Column"
                            onChange={(e) => {
                              setBulkYColumn(e.target.value);
                              const isComplete =
                                bulkTimeColumn !== "" &&
                                bulkXColumn !== "" &&
                                bulkZColumn !== "";
                              setBulkColumnSelectionComplete(isComplete);
                              setBulkColumnSelectionManuallyCompleted(
                                isComplete
                              );
                            }}
                          >
                            {bulkColumnNames.map((column) => (
                              <MenuItem key={column} value={column}>
                                {column}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                          <InputLabel>Z Column</InputLabel>
                          <Select
                            value={bulkZColumn}
                            label="Z Column"
                            onChange={(e) => {
                              setBulkZColumn(e.target.value);
                              const isComplete =
                                bulkTimeColumn !== "" &&
                                bulkXColumn !== "" &&
                                bulkYColumn !== "";
                              setBulkColumnSelectionComplete(isComplete);
                              setBulkColumnSelectionManuallyCompleted(
                                isComplete
                              );
                            }}
                          >
                            {bulkColumnNames.map((column) => (
                              <MenuItem key={column} value={column}>
                                {column}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Data Columns</InputLabel>
                        <Select
                          multiple
                          value={bulkDataColumns}
                          label="Data Columns"
                          onChange={(e) => {
                            setBulkDataColumns(e.target.value);
                            const isComplete =
                              bulkTimeColumn !== "" &&
                              e.target.value.length > 0;
                            setBulkColumnSelectionComplete(isComplete);
                            setBulkColumnSelectionManuallyCompleted(isComplete);
                          }}
                          renderValue={(selected) => selected.join(", ")}
                        >
                          {bulkColumnNames.map((column) => (
                            <MenuItem key={column} value={column}>
                              {column}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

          {/* Processing Parameters */}
          {uploadedFiles.length > 0 &&
            (bulkColumnSelectionManuallyCompleted ||
              (bulkColumnNames.length > 0 &&
                bulkDataType &&
                bulkDataUnit &&
                bulkTimestampFormat &&
                bulkColumnSelectionComplete)) && (
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
                              value={bulkPreprocessParams.autocalib_sd_criter}
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, ".");
                                if (
                                  /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                    value
                                  ) ||
                                  value === "" ||
                                  value === "."
                                ) {
                                  handleBulkPreprocessParamChange(
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
                              value={bulkPreprocessParams.autocalib_sphere_crit}
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, ".");
                                if (
                                  /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                    value
                                  ) ||
                                  value === "" ||
                                  value === "."
                                ) {
                                  handleBulkPreprocessParamChange(
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
                                value={bulkPreprocessParams.filter_type}
                                label="Filter Type"
                                onChange={(e) =>
                                  handleBulkPreprocessParamChange(
                                    "filter_type",
                                    e.target.value
                                  )
                                }
                              >
                                <MenuItem value="lowpass">Lowpass</MenuItem>
                                <MenuItem value="highpass">Highpass</MenuItem>
                                <MenuItem value="bandpass">Bandpass</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Filter Cutoff"
                              type="text"
                              value={bulkPreprocessParams.filter_cutoff}
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, ".");
                                if (
                                  /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                    value
                                  ) ||
                                  value === "" ||
                                  value === "."
                                ) {
                                  handleBulkPreprocessParamChange(
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
                              value={bulkPreprocessParams.wear_sd_crit}
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, ".");
                                if (
                                  /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                    value
                                  ) ||
                                  value === "" ||
                                  value === "."
                                ) {
                                  handleBulkPreprocessParamChange(
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
                              value={bulkPreprocessParams.wear_range_crit}
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, ".");
                                if (
                                  /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                    value
                                  ) ||
                                  value === "" ||
                                  value === "."
                                ) {
                                  handleBulkPreprocessParamChange(
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
                              value={bulkPreprocessParams.wear_window_length}
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, ".");
                                if (
                                  /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                    value
                                  ) ||
                                  value === "" ||
                                  value === "."
                                ) {
                                  handleBulkPreprocessParamChange(
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
                              value={bulkPreprocessParams.wear_window_skip}
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, ".");
                                if (
                                  /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                    value
                                  ) ||
                                  value === "" ||
                                  value === "."
                                ) {
                                  handleBulkPreprocessParamChange(
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
                                typeof bulkPreprocessParams.required_daily_coverage ===
                                "number"
                                  ? bulkPreprocessParams.required_daily_coverage
                                  : 0.5
                              }
                              min={0}
                              max={1}
                              step={0.01}
                              onChange={(e, newValue) =>
                                handleBulkPreprocessParamChange(
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
                                bulkPreprocessParams.required_daily_coverage
                              }
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, ".");
                                if (
                                  /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                    value
                                  ) ||
                                  value === "" ||
                                  value === "."
                                ) {
                                  handleBulkPreprocessParamChange(
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
                              Minimum fraction of valid data required per day (0
                              = 0%, 1 = 100%). Default: 0.5
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
                                    checked={bulkFeatureParams.sleep_rescore}
                                    onChange={(e) =>
                                      handleBulkFeatureParamChange(
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
                              value={bulkFeatureParams.sleep_ck_sf}
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, ".");
                                if (
                                  /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                    value
                                  ) ||
                                  value === "" ||
                                  value === "."
                                ) {
                                  handleBulkFeatureParamChange(
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
                              value={bulkFeatureParams.pa_cutpoint_sl}
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, ".");
                                if (
                                  /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                    value
                                  ) ||
                                  value === "" ||
                                  value === "."
                                ) {
                                  handleBulkFeatureParamChange(
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
                              value={bulkFeatureParams.pa_cutpoint_lm}
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, ".");
                                if (
                                  /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                    value
                                  ) ||
                                  value === "" ||
                                  value === "."
                                ) {
                                  handleBulkFeatureParamChange(
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
                              value={bulkFeatureParams.pa_cutpoint_mv}
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, ".");
                                if (
                                  /^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(
                                    value
                                  ) ||
                                  value === "" ||
                                  value === "."
                                ) {
                                  handleBulkFeatureParamChange(
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
            )}

          {/* Cosinorage Parameter Selection */}
          {uploadedFiles.length > 0 &&
            (bulkColumnSelectionManuallyCompleted ||
              (bulkColumnNames.length > 0 &&
                bulkDataType &&
                bulkDataUnit &&
                bulkTimestampFormat &&
                bulkColumnSelectionComplete)) && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  CosinorAge Prediction
                </Typography>

                {/* Enable/Disable Switch and Settings Button */}
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enableCosinorage}
                          onChange={(e) =>
                            setEnableCosinorage(e.target.checked)
                          }
                        />
                      }
                      label="Enable cosinorage age prediction"
                    />
                    {enableCosinorage && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowCosinorageDialog(true)}
                        startIcon={<CheckCircleIcon />}
                      >
                        Set Age & Gender
                      </Button>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 4 }}
                  >
                    Enable to predict biological age using cosinor analysis.
                    Requires chronological age and gender for each file.
                  </Typography>

                  {/* Status indicator */}
                  {enableCosinorage && (
                    <Box sx={{ mt: 1, ml: 4 }}>
                      {(() => {
                        const validation = getCosinorageValidationStatus();
                        if (!validation.isValid) {
                          return (
                            <Alert severity="warning" sx={{ py: 0.5 }}>
                              <Typography variant="body2">
                                {validation.missingCount} out of{" "}
                                {validation.totalCount} files need age and
                                gender set
                              </Typography>
                            </Alert>
                          );
                        } else if (validation.totalCount > 0) {
                          return (
                            <Alert
                              sx={{
                                py: 0.5,
                                bgcolor: "rgba(0, 52, 240, 0.08)",
                                border: "1px solid rgba(0, 52, 240, 0.2)",
                                "& .MuiAlert-icon": {
                                  color: "#0034f0",
                                },
                                "& .MuiAlert-message": {
                                  color: "#0034f0",
                                },
                              }}
                            >
                              <Typography variant="body2">
                                All {validation.totalCount} files have age and
                                gender set
                              </Typography>
                            </Alert>
                          );
                        }
                        return null;
                      })()}
                    </Box>
                  )}
                </Box>
              </Box>
            )}

          {/* Process and Reset Buttons */}
          {uploadedFiles.length > 0 &&
            (bulkColumnSelectionManuallyCompleted ||
              (bulkColumnNames.length > 0 &&
                bulkDataType &&
                bulkDataUnit &&
                bulkTimestampFormat &&
                bulkColumnSelectionComplete)) && (
              <Box
                sx={{
                  mt: 3,
                  textAlign: "center",
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBulkProcessData}
                  disabled={
                    bulkProcessing ||
                    !bulkDataType ||
                    !bulkDataUnit ||
                    !bulkTimestampFormat ||
                    !bulkColumnSelectionComplete ||
                    (enableCosinorage &&
                      !getCosinorageValidationStatus().isValid)
                  }
                  startIcon={
                    bulkProcessing ? (
                      <CircularProgress size={20} />
                    ) : (
                      <PlayArrowIcon />
                    )
                  }
                  sx={{ px: 4, py: 1.5 }}
                >
                  {bulkProcessing
                    ? `Processing... (${bulkProcessingTime}s)`
                    : "Process All Files"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleBulkReset}
                  disabled={bulkProcessing}
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
            )}
        </Paper>
      </Grid>

      {/* Processing Complete Summary */}
      {bulkData && (
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: "#d1d8ff", border: "1px solid #0034f0" }}>
            {/* Processing Summary */}
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#0034f0" }}>
                Processing Complete
              </Typography>

              {/* Processing Summary */}
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: "#0034f0" }}
                >
                  Successfully processed:{" "}
                  {bulkData.individual_results?.length || 0} files
                </Typography>

                {bulkData.failed_files && bulkData.failed_files.length > 0 && (
                  <Typography variant="body2" sx={{ color: "#0034f0" }}>
                    Handler creation failed: {bulkData.failed_files.length}{" "}
                    files
                  </Typography>
                )}

                {bulkData.failed_handlers &&
                  bulkData.failed_handlers.length > 0 && (
                    <Typography variant="body2" sx={{ color: "#0034f0" }}>
                      Processing failed: {bulkData.failed_handlers.length} files
                    </Typography>
                  )}

                <Divider sx={{ my: 1 }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#0034f0" }}
                >
                  Total: {bulkData.total_files || uploadedFiles.length} files
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {/* Failed Files Button */}
                {bulkData.failed_files && bulkData.failed_files.length > 0 && (
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<WarningIcon />}
                    onClick={() => setShowFailedFilesDialog(true)}
                    size="small"
                  >
                    Handler Failures ({bulkData.failed_files.length})
                  </Button>
                )}

                {/* Processing Failures Button */}
                {bulkData.failed_handlers &&
                  bulkData.failed_handlers.length > 0 && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<ErrorIcon />}
                      onClick={() => setShowProcessingFailuresDialog(true)}
                      size="small"
                    >
                      Processing Failures ({bulkData.failed_handlers.length})
                    </Button>
                  )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      )}

      {/* Results Section */}
      {bulkData && (
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribution Statistics
            </Typography>

            {/* Summary Statistics */}
            {bulkData.summary_dataframe &&
              bulkData.summary_dataframe.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle1">Feature Summary</Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<BarChartIcon />}
                        onClick={() => setShowFeatureDistributionsDialog(true)}
                        size="small"
                        sx={{
                          color: "#0034f0",
                          borderColor: "#0034f0",
                          "&:hover": {
                            borderColor: "#0034f0",
                            backgroundColor: "rgba(0, 52, 240, 0.04)",
                          },
                        }}
                      >
                        Feature Distributions
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ShowChartIcon />}
                        onClick={() => setShowEnmoTimeseriesDialog(true)}
                        size="small"
                        sx={{
                          color: "#0034f0",
                          borderColor: "#0034f0",
                          "&:hover": {
                            borderColor: "#0034f0",
                            backgroundColor: "rgba(0, 52, 240, 0.04)",
                          },
                        }}
                      >
                        ENMO Timeseries
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ overflowX: "auto" }}>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Feature</TableCell>
                            <TableCell>Count</TableCell>
                            <TableCell>Mean</TableCell>
                            <TableCell>Std</TableCell>
                            <TableCell>Min</TableCell>
                            <TableCell>Max</TableCell>
                            <TableCell>Median</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bulkData.summary_dataframe.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {cleanFeatureName(row.feature)}
                              </TableCell>
                              <TableCell>{row.count}</TableCell>
                              <TableCell>{row.mean?.toFixed(4)}</TableCell>
                              <TableCell>{row.std?.toFixed(4)}</TableCell>
                              <TableCell>{row.min?.toFixed(4)}</TableCell>
                              <TableCell>{row.max?.toFixed(4)}</TableCell>
                              <TableCell>{row.median?.toFixed(4)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              )}

            {/* Correlation Matrix Heatmap */}
            {bulkData.correlation_matrix &&
              Object.keys(bulkData.correlation_matrix).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Feature Correlation Matrix
                  </Typography>

                  {/* Heatmap Grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: `auto repeat(${
                        Object.keys(bulkData.correlation_matrix).length
                      }, 1fr)`,
                      gap: 1,
                      maxWidth: "100%",
                      overflow: "hidden",
                    }}
                  >
                    {/* Header row with feature names */}
                    <Box
                      sx={{
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                        color: "text.secondary",
                      }}
                    >
                      Features
                    </Box>
                    {Object.keys(bulkData.correlation_matrix).map((feature) => (
                      <Box
                        key={feature}
                        sx={{
                          height: 40,
                          display: "flex",
                          alignItems: "flex-end", // bottom align
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "0.7rem",
                          color: "text.secondary",
                          textAlign: "center",
                          overflow: "visible",
                          px: 1,
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          transform: "rotate(180deg)",
                          minHeight: "120px",
                          pb: 8,
                          alignSelf: "flex-end",
                          justifyContent: "flex-start",
                        }}
                      >
                        {cleanFeatureName(feature)}
                      </Box>
                    ))}

                    {/* Data rows */}
                    {Object.keys(bulkData.correlation_matrix).map(
                      (rowFeature, rowIndex) => (
                        <React.Fragment key={rowFeature}>
                          {/* Row label */}
                          <Box
                            sx={{
                              height: 30,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              fontWeight: "bold",
                              fontSize: "0.7rem",
                              color: "text.secondary",
                              pr: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cleanFeatureName(rowFeature)}
                          </Box>

                          {/* Correlation cells */}
                          {Object.keys(bulkData.correlation_matrix).map(
                            (colFeature, colIndex) => {
                              const value =
                                bulkData.correlation_matrix[colFeature][
                                  rowFeature
                                ];
                              const numValue =
                                typeof value === "number" ? value : 0;

                              // Skip diagonal (self-correlation) and lower triangle
                              if (
                                rowIndex === colIndex ||
                                rowIndex > colIndex
                              ) {
                                return (
                                  <Box
                                    key={colFeature}
                                    sx={{
                                      height: 30,
                                      backgroundColor: "#f0f0f0",
                                      border: "1px solid #e0e0e0",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "0.6rem",
                                      color: "#999",
                                    }}
                                  >
                                    {rowIndex === colIndex ? "-" : ""}
                                  </Box>
                                );
                              }

                              // Continuous color scale from red to CL blue
                              const getColor = (value) => {
                                // Clamp value between -1 and 1
                                const clampedValue = Math.max(
                                  -1,
                                  Math.min(1, value)
                                );

                                if (clampedValue >= 0) {
                                  // White to CL blue (#0034f0) for positive correlations
                                  const intensity = clampedValue;
                                  const r = Math.round(
                                    255 - intensity * (255 - 0)
                                  );
                                  const g = Math.round(
                                    255 - intensity * (255 - 52)
                                  );
                                  const b = Math.round(
                                    255 - intensity * (255 - 240)
                                  );
                                  return `rgb(${r}, ${g}, ${b})`;
                                } else {
                                  // Reddish to white for negative correlations
                                  const intensity = Math.abs(clampedValue);
                                  const r = Math.round(
                                    255 - intensity * (255 - 220)
                                  );
                                  const g = Math.round(
                                    255 - intensity * (255 - 53)
                                  );
                                  const b = Math.round(
                                    255 - intensity * (255 - 69)
                                  );
                                  return `rgb(${r}, ${g}, ${b})`;
                                }
                              };

                              const bgColor = getColor(numValue);

                              return (
                                <Tooltip
                                  key={colFeature}
                                  title={`${cleanFeatureName(
                                    rowFeature
                                  )} vs ${cleanFeatureName(colFeature)}: ${
                                    typeof value === "number"
                                      ? value.toFixed(3)
                                      : "N/A"
                                  }`}
                                  arrow
                                  placement="top"
                                >
                                  <Box
                                    sx={{
                                      height: 30,
                                      backgroundColor: bgColor,
                                      border: "1px solid #e0e0e0",
                                      cursor: "pointer",
                                      transition: "all 0.2s ease-in-out",
                                      "&:hover": {
                                        transform: "scale(1.05)",
                                        zIndex: 1,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                      },
                                    }}
                                  />
                                </Tooltip>
                              );
                            }
                          )}
                        </React.Fragment>
                      )
                    )}
                  </Box>

                  {/* Legend */}
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Correlation Scale
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: "50%",
                          height: 20,
                          background:
                            "linear-gradient(to right, #dc3545, rgb(255, 255, 255), #0034f0)",
                          borderRadius: 1,
                          border: "1px solid #ccc",
                          position: "relative",
                        }}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "50%",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.6rem" }}
                        >
                          -1.0
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.6rem" }}
                        >
                          0.0
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.6rem" }}
                        >
                          1.0
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

            {/* Individual Results */}
            {bulkData.individual_results &&
              bulkData.individual_results.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Individual Results ({bulkData.individual_results.length}{" "}
                    files)
                  </Typography>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>View Individual File Results</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {bulkData.individual_results.map((result, index) => (
                          <Grid item xs={12} key={index}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  {result.filename}
                                </Typography>
                                {result.features && (
                                  <Grid container spacing={2}>
                                    {Object.entries(result.features).map(
                                      ([category, features]) => (
                                        <Grid
                                          item
                                          xs={12}
                                          md={6}
                                          key={category}
                                        >
                                          <Typography
                                            variant="subtitle2"
                                            gutterBottom
                                          >
                                            {category
                                              .replace(/_/g, " ")
                                              .toUpperCase()}
                                          </Typography>
                                          <Box sx={{ pl: 2 }}>
                                            {Object.entries(features).map(
                                              ([key, value]) => (
                                                <Typography
                                                  key={key}
                                                  variant="body2"
                                                >
                                                  {key}:{" "}
                                                  {Array.isArray(value)
                                                    ? value.join(", ")
                                                    : typeof value === "number"
                                                    ? value.toFixed(4)
                                                    : String(value)}
                                                </Typography>
                                              )
                                            )}
                                          </Box>
                                        </Grid>
                                      )
                                    )}
                                  </Grid>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )}
          </Paper>
        </Grid>
      )}

      {/* Error and Success Messages */}
      {bulkError && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setBulkError(null)}>
            {bulkError}
          </Alert>
        </Grid>
      )}

      {/* Failed Files Dialog */}
      <Dialog
        open={showFailedFilesDialog}
        onClose={() => setShowFailedFilesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon color="warning" />
            Failed Files ({bulkData?.failed_files?.length || 0})
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The following files could not be processed due to insufficient data
            or other issues:
          </Typography>
          <List>
            {bulkData?.failed_files?.map((failedFile, index) => (
              <ListItem
                key={index}
                sx={{
                  border: "1px solid",
                  borderColor: "error.light",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  <ErrorIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={failedFile.filename}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="error">
                        Error: {failedFile.error}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        File ID: {failedFile.file_id}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowFailedFilesDialog(false)}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Processing Failures Dialog */}
      <Dialog
        open={showProcessingFailuresDialog}
        onClose={() => setShowProcessingFailuresDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ErrorIcon color="error" />
            Processing Failures ({bulkData?.failed_handlers?.length || 0})
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The following files passed initial validation but failed during
            feature extraction:
          </Typography>
          <List>
            {bulkData?.failed_handlers?.map((failedHandler, index) => (
              <ListItem
                key={index}
                sx={{
                  border: "1px solid",
                  borderColor: "error.light",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  <ErrorIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={`File ${failedHandler[0] + 1}`}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="error">
                        Error: {failedHandler[1]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Processing step failed during feature extraction
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowProcessingFailuresDialog(false)}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Uploaded Files Dialog */}
      <Dialog
        open={showUploadedFilesDialog}
        onClose={() => setShowUploadedFilesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon color="success" />
            Uploaded Files ({uploadedFiles.length})
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The following files were successfully uploaded:
          </Typography>
          <List>
            {uploadedFiles.map((file, index) => (
              <ListItem
                key={index}
                sx={{
                  border: "1px solid",
                  borderColor: "success.light",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "#0034f0" }} />
                </ListItemIcon>
                <ListItemText
                  primary={file.filename}
                  secondary={`File ID: ${file.file_id}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowUploadedFilesDialog(false)}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feature Distributions Dialog */}
      <Dialog
        open={showFeatureDistributionsDialog}
        onClose={() => setShowFeatureDistributionsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BarChartIcon sx={{ color: "#0034f0" }} />
            Feature Distributions
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Distribution plots for each feature across all processed files:
          </Typography>
          <Alert
            sx={{
              mb: 2,
              bgcolor: "rgba(0, 52, 240, 0.08)",
              border: "1px solid rgba(0, 52, 240, 0.2)",
              "& .MuiAlert-icon": {
                color: "#0034f0",
              },
              "& .MuiAlert-message": {
                color: "#0034f0",
              },
            }}
          >
            <Typography variant="body2">
              Note: Some metrics are calculated on a daily level, which is why
              the sample size (n) may be greater than the number of uploaded
              files.
            </Typography>
          </Alert>

          {bulkData &&
            bulkData.individual_results &&
            bulkData.individual_results.length > 0 && (
              <Box>
                {/* Extract all features from individual results */}
                {(() => {
                  const allFeatures = {};
                  const rejectedFeatures = {};

                  // Safety check for bulkData
                  if (
                    !bulkData ||
                    !bulkData.individual_results ||
                    !Array.isArray(bulkData.individual_results)
                  ) {
                    console.warn(
                      "No valid bulk data available for feature extraction"
                    );
                    return null;
                  }

                  // Helper function to flatten nested objects and extract numeric values
                  const flattenAndExtractNumbers = (obj, prefix = "") => {
                    const result = [];
                    if (
                      typeof obj === "number" &&
                      !isNaN(obj) &&
                      isFinite(obj)
                    ) {
                      result.push(obj);
                    } else if (
                      obj &&
                      typeof obj === "object" &&
                      !Array.isArray(obj)
                    ) {
                      Object.entries(obj).forEach(([key, value]) => {
                        const newPrefix = prefix ? `${prefix}_${key}` : key;
                        result.push(
                          ...flattenAndExtractNumbers(value, newPrefix)
                        );
                      });
                    } else if (Array.isArray(obj)) {
                      obj.forEach((item, index) => {
                        const newPrefix = prefix
                          ? `${prefix}_${index}`
                          : `${index}`;
                        result.push(
                          ...flattenAndExtractNumbers(item, newPrefix)
                        );
                      });
                    }
                    return result;
                  };

                  // Collect all features from individual results
                  bulkData.individual_results.forEach((result) => {
                    if (result.features) {
                      Object.entries(result.features).forEach(
                        ([category, features]) => {
                          Object.entries(features).forEach(
                            ([featureName, value]) => {
                              if (
                                typeof value === "number" &&
                                !isNaN(value) &&
                                isFinite(value)
                              ) {
                                // Simple numeric value
                                if (!allFeatures[featureName]) {
                                  allFeatures[featureName] = [];
                                }
                                allFeatures[featureName].push(value);
                              } else if (value && typeof value === "object") {
                                // Nested object - flatten and extract numbers
                                const flattenedNumbers =
                                  flattenAndExtractNumbers(value, featureName);
                                if (flattenedNumbers.length > 0) {
                                  // Add all numeric values to the original feature name
                                  if (!allFeatures[featureName]) {
                                    allFeatures[featureName] = [];
                                  }
                                  allFeatures[featureName].push(
                                    ...flattenedNumbers
                                  );
                                } else {
                                  // No numeric values found in nested object
                                  if (!rejectedFeatures[featureName]) {
                                    rejectedFeatures[featureName] = [];
                                  }
                                  rejectedFeatures[featureName].push(value);
                                }
                              } else {
                                // Track rejected features for debugging
                                if (!rejectedFeatures[featureName]) {
                                  rejectedFeatures[featureName] = [];
                                }
                                rejectedFeatures[featureName].push(value);
                              }
                            }
                          );
                        }
                      );
                    }
                  });

                  // Debug information
                  console.log("Available features:", Object.keys(allFeatures));
                  console.log(
                    "Rejected features:",
                    Object.keys(rejectedFeatures)
                  );
                  console.log(
                    "Summary dataframe features:",
                    bulkData.summary_dataframe
                      ? bulkData.summary_dataframe.map((row) => row.feature)
                      : []
                  );

                  // Print detailed information about rejected features
                  Object.entries(rejectedFeatures).forEach(
                    ([featureName, values]) => {
                      console.log(
                        `Feature "${featureName}" rejected values:`,
                        values
                      );
                      console.log(
                        `Feature "${featureName}" value types:`,
                        values.map((v) => typeof v)
                      );
                    }
                  );

                  // Debug: Check for specific missing features
                  const missingFeatures = [
                    "TST",
                    "WASO",
                    "PTA",
                    "NWB",
                    "SOL",
                    "SRI",
                  ];
                  missingFeatures.forEach((feature) => {
                    const found = Object.keys(allFeatures).find(
                      (f) =>
                        f.toLowerCase().includes(feature.toLowerCase()) ||
                        f
                          .toLowerCase()
                          .includes(feature.toLowerCase().replace(/_/g, ""))
                    );
                    console.log(
                      `Looking for ${feature}:`,
                      found ? `Found as "${found}"` : "NOT FOUND"
                    );
                  });

                  // Create histogram and density curve data for each feature
                  const createHistogramAndDensityData = (
                    values,
                    featureName
                  ) => {
                    // Add comprehensive null checks
                    if (
                      !values ||
                      !Array.isArray(values) ||
                      values.length === 0
                    ) {
                      console.warn(
                        `createHistogramAndDensityData: Invalid values for feature ${featureName}`,
                        values
                      );
                      return { histogram: [], density: [], combined: [] };
                    }

                    // Filter out invalid values
                    const validValues = values.filter(
                      (v) => typeof v === "number" && !isNaN(v) && isFinite(v)
                    );

                    if (validValues.length === 0) {
                      console.warn(
                        `createHistogramAndDensityData: No valid numeric values for feature ${featureName}`
                      );
                      return { histogram: [], density: [], combined: [] };
                    }

                    const min = Math.min(...validValues);
                    const max = Math.max(...validValues);
                    const range = max - min;

                    // Handle case where all values are the same (range = 0)
                    if (range === 0) {
                      console.warn(
                        `createHistogramAndDensityData: All values are identical for feature ${featureName}, creating single bin`
                      );
                      const singleValue = validValues[0];
                      return {
                        histogram: [
                          {
                            range: `${singleValue.toFixed(
                              3
                            )}-${singleValue.toFixed(3)}`,
                            count: validValues.length,
                            feature: featureName,
                          },
                        ],
                        density: [
                          {
                            x: singleValue,
                            density: 1.0,
                            feature: featureName,
                          },
                        ],
                        combined: [
                          {
                            range: `${singleValue.toFixed(
                              3
                            )}-${singleValue.toFixed(3)}`,
                            count: validValues.length,
                            density: 1.0,
                            feature: featureName,
                          },
                        ],
                      };
                    }

                    // Create histogram data with equal-width buckets
                    const binCount = Math.min(
                      20,
                      Math.max(5, Math.floor(Math.sqrt(validValues.length)))
                    );
                    const binSize = range / binCount;

                    // Initialize bins with equal-width ranges
                    const bins = [];
                    for (let i = 0; i < binCount; i++) {
                      const binStart = min + i * binSize;
                      const binEnd = min + (i + 1) * binSize;
                      bins.push({
                        range: `${binStart
                          .toFixed(3)
                          .replace(/\.?0+$/, "")}-${binEnd
                          .toFixed(3)
                          .replace(/\.?0+$/, "")}`,
                        count: 0,
                        start: binStart,
                        end: binEnd,
                      });
                    }

                    // Assign values to bins
                    validValues.forEach((value) => {
                      const binIndex = Math.min(
                        Math.floor((value - min) / binSize),
                        binCount - 1
                      );
                      if (bins[binIndex]) {
                        bins[binIndex].count++;
                      }
                    });

                    const histogramData = bins
                      .map((bin) => {
                        if (!bin) {
                          console.warn(
                            "Encountered undefined bin in histogram data"
                          );
                          return null;
                        }
                        return {
                          range: bin.range,
                          count: bin.count || 0,
                          feature: featureName,
                        };
                      })
                      .filter((bin) => bin !== null);

                    // Create density curve data using kernel density estimation
                    const numPoints = 100;
                    const bandwidth = range / Math.pow(validValues.length, 0.2); // Silverman's rule of thumb

                    const densityData = [];
                    for (let i = 0; i <= numPoints; i++) {
                      const x = min + (i / numPoints) * range;
                      let density = 0;

                      // Calculate kernel density estimate
                      validValues.forEach((value) => {
                        const u = (x - value) / bandwidth;
                        // Gaussian kernel
                        density +=
                          Math.exp(-0.5 * u * u) /
                          (bandwidth * Math.sqrt(2 * Math.PI));
                      });

                      density = density / validValues.length;

                      // Debug for acrophase
                      if (
                        featureName.toLowerCase().includes("acrophase") &&
                        i < 10
                      ) {
                        console.log(`Acrophase density at x=${x}: ${density}`);
                      }

                      if (
                        typeof density === "number" &&
                        !isNaN(density) &&
                        isFinite(density)
                      ) {
                        densityData.push({
                          x: x,
                          density: density,
                          feature: featureName,
                        });
                      }
                    }

                    // Create combined data for overlay
                    const combinedData = histogramData
                      .map((histItem) => {
                        if (!histItem || !histItem.range) {
                          console.warn(
                            "Encountered invalid histogram item in combined data mapping"
                          );
                          return null;
                        }

                        // Fix parsing for negative ranges like "-6.075--5.073"
                        let rangeParts;
                        if (
                          histItem.range.startsWith("-") &&
                          histItem.range.includes("--")
                        ) {
                          // Handle negative ranges with double minus
                          const parts = histItem.range.split("--");
                          rangeParts = [parts[0], "-" + parts[1]];
                        } else {
                          rangeParts = histItem.range.split("-");
                        }

                        // Safety check for range parsing
                        if (!rangeParts || rangeParts.length !== 2) {
                          console.warn(
                            `Invalid range format: ${histItem.range}`
                          );
                          return null;
                        }

                        const start = parseFloat(rangeParts[0]);
                        const end = parseFloat(rangeParts[1]);

                        if (isNaN(start) || isNaN(end)) {
                          console.warn(
                            `Invalid numeric values in range: ${histItem.range}`
                          );
                          return null;
                        }

                        const midPoint = (start + end) / 2;

                        // Find the closest density point to this histogram bin midpoint
                        let closestDensity = 0;
                        let minDistance = Infinity;

                        densityData.forEach((d) => {
                          const distance = Math.abs(d.x - midPoint);
                          if (distance < minDistance) {
                            minDistance = distance;
                            closestDensity = d.density;
                          }
                        });

                        // Debug for acrophase
                        if (
                          featureName.toLowerCase().includes("acrophase") &&
                          histItem.range.includes("-")
                        ) {
                          console.log(
                            `Acrophase bin: ${histItem.range}, parsed: [${rangeParts[0]}, ${rangeParts[1]}], midpoint: ${midPoint}, closest density: ${closestDensity}, minDistance: ${minDistance}`
                          );
                          if (closestDensity === 0) {
                            console.log(
                              `WARNING: Zero density found for acrophase bin ${histItem.range}`
                            );
                          }
                        }

                        return {
                          ...histItem,
                          density: closestDensity,
                        };
                      })
                      .filter((item) => item !== null);

                    return {
                      histogram: histogramData,
                      density: densityData,
                      combined: combinedData,
                    };
                  };

                  // Use the exact order from the summary dataframe
                  const summaryFeatureOrder = bulkData.summary_dataframe
                    ? bulkData.summary_dataframe.map((row) => row.feature)
                    : [];

                  // Get all available features
                  const availableFeatures = allFeatures
                    ? Object.keys(allFeatures)
                    : [];

                  // Helper function to find matching feature without prefix
                  const findMatchingFeature = (summaryFeature) => {
                    // Remove common prefixes and try to match
                    const prefixes = [
                      "cosinor_",
                      "nonparam_",
                      "physical_activity_",
                    ];
                    let baseFeature = summaryFeature;

                    for (const prefix of prefixes) {
                      if (summaryFeature.startsWith(prefix)) {
                        baseFeature = summaryFeature.substring(prefix.length);
                        break;
                      }
                    }

                    // Try to find exact match first, then base feature match
                    if (availableFeatures.includes(summaryFeature)) {
                      return summaryFeature;
                    } else if (availableFeatures.includes(baseFeature)) {
                      return baseFeature;
                    }

                    // Try case-insensitive matching
                    const exactMatch = availableFeatures.find(
                      (f) => f.toLowerCase() === summaryFeature.toLowerCase()
                    );
                    if (exactMatch) {
                      return exactMatch;
                    }

                    // Try partial matching for common sleep metrics
                    const partialMatch = availableFeatures.find(
                      (f) =>
                        f
                          .toLowerCase()
                          .includes(summaryFeature.toLowerCase()) ||
                        summaryFeature.toLowerCase().includes(f.toLowerCase())
                    );
                    if (partialMatch) {
                      return partialMatch;
                    }

                    return null;
                  };

                  // Map summary features to available features
                  let finalFeatureOrder = summaryFeatureOrder
                    .map((summaryFeature) =>
                      findMatchingFeature(summaryFeature)
                    )
                    .filter((feature) => feature !== null);

                  // If no features matched from summary, use all available features
                  if (finalFeatureOrder.length === 0) {
                    console.log(
                      "No features matched from summary, using all available features"
                    );
                    finalFeatureOrder = availableFeatures;
                  }

                  // Final safety check
                  if (!finalFeatureOrder || finalFeatureOrder.length === 0) {
                    console.warn("No features available for display");
                    return (
                      <Typography>No features available for display</Typography>
                    );
                  }

                  console.log("Final feature order:", finalFeatureOrder);
                  console.log("Features with data:", availableFeatures);
                  console.log("Features in summary:", summaryFeatureOrder);
                  console.log("All features data:", allFeatures);

                  return (
                    <>
                      <Grid container spacing={3}>
                        {finalFeatureOrder.map((featureName) => {
                          const values = allFeatures[featureName];

                          // Add null checks to prevent errors
                          if (
                            !values ||
                            !Array.isArray(values) ||
                            values.length === 0
                          ) {
                            console.warn(
                              `No valid data for feature: ${featureName}`
                            );
                            return null;
                          }

                          const {
                            histogram: histogramData,
                            density: densityData,
                            combined: combinedData,
                          } = createHistogramAndDensityData(
                            values,
                            featureName
                          );

                          if (!histogramData || histogramData.length === 0)
                            return null;

                          return (
                            <Grid item xs={12} md={6} key={featureName}>
                              <Card variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                  {cleanFeatureName(featureName)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 2 }}
                                >
                                  n = {values.length} | Mean ={" "}
                                  {values.length > 0
                                    ? (
                                        values.reduce((a, b) => a + b, 0) /
                                        values.length
                                      ).toFixed(4)
                                    : "N/A"}{" "}
                                  | Std ={" "}
                                  {values.length > 0
                                    ? Math.sqrt(
                                        values.reduce(
                                          (sq, n) =>
                                            sq +
                                            Math.pow(
                                              n -
                                                values.reduce(
                                                  (a, b) => a + b,
                                                  0
                                                ) /
                                                  values.length,
                                              2
                                            ),
                                          0
                                        ) / values.length
                                      ).toFixed(4)
                                    : "N/A"}
                                </Typography>
                                <Box sx={{ width: "100%", height: 200 }}>
                                  <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                  >
                                    <ComposedChart
                                      data={combinedData}
                                      margin={{
                                        top: 20,
                                        right: 50,
                                        left: 80,
                                        bottom: 40,
                                      }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis
                                        dataKey="range"
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                        fontSize={10}
                                      />
                                      <YAxis
                                        yAxisId="left"
                                        orientation="left"
                                        label={{
                                          value: "Density",
                                          angle: -90,
                                          position: "insideLeft",
                                          offset: -10,
                                          style: { textAnchor: "middle" },
                                        }}
                                      />
                                      <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        label={{
                                          value: "Frequency",
                                          angle: 90,
                                          position: "insideRight",
                                          offset: 5,
                                          style: { textAnchor: "middle" },
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
                                                  Range: {label}
                                                </p>
                                                <p style={{ margin: "0" }}>
                                                  Count: {payload[0].value}
                                                </p>
                                                {payload[1] && (
                                                  <p style={{ margin: "0" }}>
                                                    Density:{" "}
                                                    {payload[1].value.toFixed(
                                                      6
                                                    )}
                                                  </p>
                                                )}
                                              </div>
                                            );
                                          }
                                          return null;
                                        }}
                                      />
                                      <Bar
                                        yAxisId="right"
                                        dataKey="count"
                                        fill="#0034f0"
                                        fillOpacity={0.7}
                                      />
                                      <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="density"
                                        stroke="#0034f0"
                                        strokeWidth={2}
                                        dot={false}
                                        connectNulls={false}
                                      />
                                    </ComposedChart>
                                  </ResponsiveContainer>
                                </Box>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </>
                  );
                })()}
              </Box>
            )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowFeatureDistributionsDialog(false)}
            sx={{
              color: "#0034f0",
              borderColor: "#0034f0",
              "&:hover": {
                borderColor: "#0034f0",
                backgroundColor: "rgba(0, 52, 240, 0.04)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ENMO Timeseries Dialog */}
      <Dialog
        open={showEnmoTimeseriesDialog}
        onClose={() => setShowEnmoTimeseriesDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShowChartIcon sx={{ color: "#0034f0" }} />
            ENMO Timeseries
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ENMO timeseries of{" "}
            {bulkData && bulkData.individual_results
              ? bulkData.individual_results.filter(
                  (result) =>
                    result.enmo_timeseries &&
                    Array.isArray(result.enmo_timeseries) &&
                    result.enmo_timeseries.length > 0
                ).length
              : 0}{" "}
            processed files shown below:
          </Typography>

          {bulkData &&
            bulkData.individual_results &&
            bulkData.individual_results.length > 0 && (
              <Box>
                <Grid container spacing={3}>
                  {bulkData.individual_results.map((result, index) => {
                    // Access ENMO data from the backend response
                    const enmoData = result.enmo_timeseries;

                    if (
                      !enmoData ||
                      !Array.isArray(enmoData) ||
                      enmoData.length === 0
                    ) {
                      return null;
                    }

                    // Prepare data for plotting with timestamps
                    const plotData = enmoData.map((item, i) => ({
                      timestamp: new Date(item.timestamp).getTime(),
                      enmo: item.enmo,
                      timeLabel:
                        new Date(item.timestamp).toLocaleDateString() +
                        " " +
                        new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                    }));

                    return (
                      <Grid item xs={12} md={6} key={index}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {result.filename || `File ${index + 1}`}
                          </Typography>

                          <Box sx={{ width: "100%", height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={plotData}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 40,
                                  bottom: 40,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="timestamp"
                                  type="number"
                                  domain={["dataMin", "dataMax"]}
                                  tickFormatter={(timestamp) => {
                                    const date = new Date(timestamp);
                                    return date.toLocaleDateString();
                                  }}
                                  ticks={(() => {
                                    // Get unique dates for tick positions
                                    const uniqueDates = [
                                      ...new Set(
                                        plotData.map((item) => {
                                          const date = new Date(item.timestamp);
                                          return new Date(
                                            date.getFullYear(),
                                            date.getMonth(),
                                            date.getDate()
                                          ).getTime();
                                        })
                                      ),
                                    ];
                                    return uniqueDates.sort((a, b) => a - b);
                                  })()}
                                  angle={-45}
                                  textAnchor="end"
                                  height={80}
                                />
                                <YAxis
                                  label={{
                                    value: "mg",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: 20,
                                  }}
                                />
                                <RechartsTooltip
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      const date = new Date(label);
                                      return (
                                        <div
                                          style={{
                                            backgroundColor: "white",
                                            padding: "10px",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          <p style={{ margin: "0 0 5px 0" }}>
                                            Time: {date.toLocaleString()}
                                          </p>
                                          <p style={{ margin: "0" }}>
                                            ENMO: {payload[0].value?.toFixed(4)}{" "}
                                            mg
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="enmo"
                                  stroke="#0034f0"
                                  strokeWidth={1}
                                  dot={false}
                                  connectNulls={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {bulkData.individual_results.every((result) => {
                  // Check for ENMO data in the backend response
                  const enmoData = result.enmo_timeseries;
                  return (
                    !enmoData ||
                    !Array.isArray(enmoData) ||
                    enmoData.length === 0
                  );
                }) && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      No ENMO timeseries data found in the processed files. This
                      may occur if the data was not processed with ENMO
                      calculation enabled.
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowEnmoTimeseriesDialog(false)}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cosinorage Age & Gender Dialog */}
      <Dialog
        open={showCosinorageDialog}
        onClose={() => setShowCosinorageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ color: "#0034f0" }} />
            Set Age and Gender for Cosinorage
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set chronological age and gender for each file to enable CosinorAge
            age prediction:
          </Typography>

          {/* Validation message */}
          {(() => {
            const validation = getCosinorageValidationStatus();
            if (!validation.isValid) {
              return (
                <Alert
                  sx={{
                    mb: 2,
                    bgcolor: "rgba(255, 152, 0, 0.08)",
                    border: "1px solid rgba(255, 152, 0, 0.2)",
                    "& .MuiAlert-icon": {
                      color: "#ff9800",
                    },
                    "& .MuiAlert-message": {
                      color: "#ff9800",
                    },
                  }}
                >
                  <Typography variant="body2">
                    Please set age and gender for {validation.missingCount} out
                    of {validation.totalCount} file(s) to enable CosinorAge
                    processing.
                  </Typography>
                </Alert>
              );
            } else if (validation.totalCount > 0) {
              return (
                <Alert
                  sx={{
                    mb: 2,
                    bgcolor: "rgba(0, 52, 240, 0.08)",
                    border: "1px solid rgba(0, 52, 240, 0.2)",
                    "& .MuiAlert-icon": {
                      color: "#0034f0",
                    },
                    "& .MuiAlert-message": {
                      color: "#0034f0",
                    },
                  }}
                >
                  <Typography variant="body2">
                    All {validation.totalCount} files have age and gender set.
                    Ready for CosinorAge processing.
                  </Typography>
                </Alert>
              );
            }
            return null;
          })()}

          <Grid container spacing={2}>
            {bulkCosinorAgeInputs.map((input, index) => (
              <Grid item xs={12} key={input.file_id}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderColor:
                      !input.age || input.age === "" || input.gender === ""
                        ? "#ff9800"
                        : "#0034f0",
                    bgcolor: "white",
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {input.filename}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Chronological Age"
                        type="number"
                        value={input.age}
                        onChange={(e) =>
                          handleBulkCosinorAgeInputChange(
                            input.file_id,
                            "age",
                            e.target.value
                          )
                        }
                        inputProps={{ min: 0, max: 120 }}
                        helperText="Enter chronological age

"
                        error={!input.age || input.age === ""}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={input.gender === ""}>
                        <InputLabel>Gender</InputLabel>
                        <Select
                          value={input.gender}
                          label="Gender"
                          onChange={(e) =>
                            handleBulkCosinorAgeInputChange(
                              input.file_id,
                              "gender",
                              e.target.value
                            )
                          }
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="unknown">Unknown</MenuItem>
                        </Select>
                        <FormHelperText>
                          Select gender for age prediction
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowCosinorageDialog(false)}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export { MultiIndividualTab };
