import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Divider
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceArea, BarChart, Bar, Area, AreaChart, ComposedChart, PieChart, Pie, Cell } from 'recharts';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UploadIcon from '@mui/icons-material/Upload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import ScienceIcon from '@mui/icons-material/Science';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorIcon from '@mui/icons-material/Error';
import BarChartIcon from '@mui/icons-material/BarChart';
import logo from './assets/logo.png';
import EnhancedDocumentationTab from './EnhancedDocumentationTab';
import SGSBinaryZippedExample from './assets/SGS_Binary_Zipped_Example.png';
import SGSCSVExample from './assets/SGS_CSV_Example.png';
import config from './config';

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
  const [bulkDataType, setBulkDataType] = useState('');
  const [bulkDataUnit, setBulkDataUnit] = useState('');
  const [bulkTimestampFormat, setBulkTimestampFormat] = useState('');
  const [bulkTimeColumn, setBulkTimeColumn] = useState('');
  const [bulkDataColumns, setBulkDataColumns] = useState([]);
  const [bulkXColumn, setBulkXColumn] = useState('');
  const [bulkYColumn, setBulkYColumn] = useState('');
  const [bulkZColumn, setBulkZColumn] = useState('');
  const [bulkColumnNames, setBulkColumnNames] = useState([]);
  const [bulkColumnSelectionComplete, setBulkColumnSelectionComplete] = useState(false);
  const [bulkColumnSelectionManuallyCompleted, setBulkColumnSelectionManuallyCompleted] = useState(false);
  const [columnValidationResult, setColumnValidationResult] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showFailedFilesDialog, setShowFailedFilesDialog] = useState(false);
  const [showProcessingFailuresDialog, setShowProcessingFailuresDialog] = useState(false);
  const [showUploadedFilesDialog, setShowUploadedFilesDialog] = useState(false);
  const [showFeatureDistributionsDialog, setShowFeatureDistributionsDialog] = useState(false);
  const [showEnmoTimeseriesDialog, setShowEnmoTimeseriesDialog] = useState(false);
  const [bulkPreprocessParams, setBulkPreprocessParams] = useState({
    autocalib_sd_criter: 0.00013,
    autocalib_sphere_crit: 0.02,
    filter_type: 'lowpass',
    filter_cutoff: 2,
    wear_sd_criter: 0.00013,
    wear_range_crit: 0.00067,
    wear_window_length: 45,
    wear_window_skip: 7,
    required_daily_coverage: 0.5
  });
  const [bulkFeatureParams, setBulkFeatureParams] = useState({
    sleep_rescore: true,
    sleep_ck_sf: 0.0025,
    pa_cutpoint_sl: 15,
    pa_cutpoint_lm: 35,
    pa_cutpoint_mv: 70
  });

  const startBulkTimer = () => {
    setBulkProcessingTime(0);
    const interval = setInterval(() => {
      setBulkProcessingTime(prev => prev + 1);
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
        throw new Error('Failed to fetch column names');
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
    const commonTimeColumns = ['timestamp', 'time', 'datetime', 'date', 't'];
    let defaultTimeColumn = '';
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
    if (bulkDataType === 'accelerometer') {
      // Look for X, Y, Z columns
      const accelColumns = { x: '', y: '', z: '' };
      for (const col of columnNames) {
        const lowerCol = col.toLowerCase();
        if (lowerCol.includes('x') && col !== defaultTimeColumn) {
          accelColumns.x = col;
        } else if (lowerCol.includes('y') && col !== defaultTimeColumn) {
          accelColumns.y = col;
        } else if (lowerCol.includes('z') && col !== defaultTimeColumn) {
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
        const nonTimeColumns = columnNames.filter(col => col !== defaultTimeColumn);
        if (nonTimeColumns.length >= 3) {
          setBulkXColumn(nonTimeColumns[0]);
          setBulkYColumn(nonTimeColumns[1]);
          setBulkZColumn(nonTimeColumns[2]);
        }
      }
      
      // Update column selection completion status
      const nonTimeColumns = columnNames.filter(col => col !== defaultTimeColumn);
      setBulkColumnSelectionComplete(defaultTimeColumn !== '' && 
        (accelColumns.x || (nonTimeColumns.length > 0 ? nonTimeColumns[0] : '')) && 
        (accelColumns.y || (nonTimeColumns.length > 1 ? nonTimeColumns[1] : '')) && 
        (accelColumns.z || (nonTimeColumns.length > 2 ? nonTimeColumns[2] : '')));
        
    } else if (bulkDataType === 'enmo') {
      // For ENMO data, look for ENMO column
      let defaultDataColumns = [];
      for (const col of columnNames) {
        if (col.toLowerCase().includes('enmo') && col !== defaultTimeColumn) {
          defaultDataColumns = [col];
          break;
        }
      }
      if (defaultDataColumns.length === 0) {
        const nonTimeColumns = columnNames.filter(col => col !== defaultTimeColumn);
        if (nonTimeColumns.length > 0) {
          defaultDataColumns = [nonTimeColumns[0]];
        }
      }
      
      setBulkDataColumns(defaultDataColumns);
      setBulkColumnSelectionComplete(defaultTimeColumn !== '' && defaultDataColumns.length > 0);
      
    } else if (bulkDataType) {
      // For other data types, use all non-time columns
      const defaultDataColumns = columnNames.filter(col => col !== defaultTimeColumn);
      setBulkDataColumns(defaultDataColumns);
      setBulkColumnSelectionComplete(defaultTimeColumn !== '' && defaultDataColumns.length > 0);
      
    } else {
      // If no data type is set yet, set basic defaults
      const nonTimeColumns = columnNames.filter(col => col !== defaultTimeColumn);
      if (nonTimeColumns.length > 0) {
        setBulkDataColumns([nonTimeColumns[0]]);
        setBulkColumnSelectionComplete(defaultTimeColumn !== '' && nonTimeColumns.length > 0);
      }
    }
  };

  const fetchFilePreview = async (fileId) => {
    try {
      const response = await fetch(config.getApiUrl(`preview/${fileId}`));
      if (!response.ok) {
        throw new Error('Failed to fetch file preview');
      }
      const previewData = await response.json();
      setFilePreview(previewData);
    } catch (err) {
      setBulkError(err.message);
    }
  };

  const validateBulkColumns = async (fileIds = null) => {
    const filesToValidate = fileIds || uploadedFiles.map(file => file.file_id);
    
    if (filesToValidate.length < 2) {
      return { valid: true, message: "Only one file uploaded, no validation needed" };
    }

    try {
      const response = await fetch(config.getApiUrl('validate_bulk_columns'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filesToValidate)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to validate columns');
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
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setBulkUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          setUploadedFiles(result.files);
          setBulkUploadProgress(100);
          
          // Fetch column names from the first file to get column options
          if (result.files.length > 0) {
            fetchBulkColumnNames(result.files[0].file_id);
          }
          
          // Immediately validate column structure if multiple files
          if (result.files.length > 1) {
            try {
              console.log('Validating columns after upload...');
              const fileIds = result.files.map(file => file.file_id);
              console.log('File IDs to validate:', fileIds);
              const validationResult = await validateBulkColumns(fileIds);
              console.log('Upload validation result:', validationResult);
              
              setColumnValidationResult(validationResult);
              
              if (!validationResult.valid) {
                setBulkError(`Column validation failed: ${validationResult.message}. Files must have identical column structures.`);
                setBulkSuccess(null);
                // Clear uploaded files when validation fails
                setUploadedFiles([]);
                setBulkColumnNames([]);
                setBulkTimeColumn('');
                setBulkDataColumns([]);
                setBulkXColumn('');
                setBulkYColumn('');
                setBulkZColumn('');
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
              setColumnValidationResult({ valid: false, message: validationErr.message });
              // Clear uploaded files when validation fails
              setUploadedFiles([]);
              setBulkColumnNames([]);
              setBulkTimeColumn('');
              setBulkDataColumns([]);
              setBulkXColumn('');
              setBulkYColumn('');
              setBulkZColumn('');
              setBulkColumnSelectionComplete(false);
              setBulkColumnSelectionManuallyCompleted(false);
              setColumnValidationResult(null);
              setFilePreview(null);
            }
          } else {
            setColumnValidationResult({ valid: true, message: "Single file uploaded, no validation needed" });
            // Fetch preview of the first file for single file uploads
            if (result.files.length > 0) {
              fetchFilePreview(result.files[0].file_id);
            }
          }
        } else {
          const errorData = JSON.parse(xhr.responseText);
          throw new Error(errorData.detail || 'Failed to upload files');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Network error occurred during upload');
      });

      xhr.open('POST', config.getApiUrl('bulk_upload'));
      xhr.send(formData);
    } catch (err) {
      setBulkError(err.message);
      setBulkUploadProgress(0);
    }
  };

  const handleBulkProcessData = async () => {
    if (uploadedFiles.length === 0) {
      setBulkError('No files uploaded');
      return;
    }

    if (!bulkDataType || !bulkDataUnit || !bulkTimestampFormat) {
      setBulkError('Please select data type, data unit, and timestamp format');
      return;
    }

    if (!bulkColumnSelectionComplete) {
      setBulkError('Please complete column selection before processing data');
      return;
    }

    setBulkProcessing(true);
    setBulkError(null);
    setBulkSuccess(null);
    startBulkTimer();

    try {
      // First validate that all files have the same column structure
      console.log('Validating columns before processing...');
      const validationResult = await validateBulkColumns();
      console.log('Validation result:', validationResult);
      
      if (!validationResult.valid) {
        throw new Error(`Column validation failed: ${validationResult.message}. Files must have identical column structures.`);
      }

      const fileConfigs = uploadedFiles.map(file => ({
        file_id: file.file_id,
        data_type: bulkDataType,
        data_unit: bulkDataUnit,
        timestamp_format: bulkTimestampFormat,
        time_column: bulkTimeColumn,
        data_columns: bulkDataType === 'accelerometer' ? [bulkXColumn, bulkYColumn, bulkZColumn] : bulkDataColumns
      }));

      const processResponse = await fetch(config.getApiUrl('bulk_process'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: fileConfigs,
          preprocess_args: bulkPreprocessParams,
          features_args: bulkFeatureParams
        }),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.detail || 'Failed to process data');
      }

      const processResult = await processResponse.json();
      setBulkData(processResult);
      
      // Create a more informative success message
      const actualSuccessfulCount = processResult.individual_results?.length || 0;
      const totalCount = processResult.total_files || uploadedFiles.length;
      const handlerFailures = processResult.failed_files?.length || 0;
      const processingFailures = processResult.failed_handlers?.length || 0;
      const totalFailures = handlerFailures + processingFailures;
      
      if (totalFailures > 0) {
        if (handlerFailures > 0 && processingFailures > 0) {
          setBulkSuccess(`Successfully processed ${actualSuccessfulCount} out of ${totalCount} files. ${handlerFailures} files failed during loading, ${processingFailures} files failed during processing.`);
        } else if (handlerFailures > 0) {
          setBulkSuccess(`Successfully processed ${actualSuccessfulCount} out of ${totalCount} files. ${handlerFailures} files failed during loading.`);
        } else {
          setBulkSuccess(`Successfully processed ${actualSuccessfulCount} out of ${totalCount} files. ${processingFailures} files failed during processing.`);
        }
      } else {
        setBulkSuccess(`Successfully processed all ${actualSuccessfulCount} files!`);
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
      'autocalib_sd_criter', 'autocalib_sphere_crit', 'filter_cutoff',
      'wear_sd_criter', 'wear_range_crit', 'wear_window_length',
      'wear_window_skip', 'required_daily_coverage'
    ];
    
    if (numericParams.includes(param) && value !== '' && value !== null && value !== undefined) {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
        processedValue = value;
      }
    }
    
    setBulkPreprocessParams(prev => ({
      ...prev,
      [param]: processedValue
    }));
  };

  const handleBulkFeatureParamChange = (param, value) => {
    let processedValue = value;
    const numericParams = ['sleep_ck_sf', 'pa_cutpoint_sl', 'pa_cutpoint_lm', 'pa_cutpoint_mv'];
    const booleanParams = ['sleep_rescore'];
    
    if (numericParams.includes(param) && value !== '' && value !== null && value !== undefined) {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
        processedValue = value;
      }
    } else if (booleanParams.includes(param)) {
      processedValue = value;
    }
    
    setBulkFeatureParams(prev => ({
      ...prev,
      [param]: processedValue
    }));
  };

  const handleBulkDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setBulkDragActive(true);
    } else if (e.type === 'dragleave') {
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
      await fetch(config.getApiUrl('clear_all_state'), {
        method: 'POST'
      });
    } catch (error) {
      console.warn('Failed to clear server state:', error);
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
    setBulkDataType('');
    setBulkDataUnit('');
    setBulkTimestampFormat('');
    setBulkTimeColumn('');
    setBulkDataColumns([]);
    setBulkXColumn('');
    setBulkYColumn('');
    setBulkZColumn('');
    setBulkColumnNames([]);
    setBulkColumnSelectionComplete(false);
    setBulkColumnSelectionManuallyCompleted(false);
    setColumnValidationResult(null);
    setFilePreview(null);
    setShowFailedFilesDialog(false);
    setShowProcessingFailuresDialog(false);
    setShowUploadedFilesDialog(false);
    
    // Reset parameters to defaults
    setBulkPreprocessParams({
      autocalib_sd_criter: 0.00013,
      autocalib_sphere_crit: 0.02,
      filter_type: 'lowpass',
      filter_cutoff: 2,
      wear_sd_criter: 0.00013,
      wear_range_crit: 0.00067,
      wear_window_length: 45,
      wear_window_skip: 7,
      required_daily_coverage: 0.5
    });
    setBulkFeatureParams({
      sleep_rescore: true,
      sleep_ck_sf: 0.0025,
      pa_cutpoint_sl: 15,
      pa_cutpoint_lm: 35,
      pa_cutpoint_mv: 70
    });
    
    // Clear file input
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = '';
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
              width: '300%',
              maxWidth: '100%',
              mx: 'auto',
              border: '2px dashed',
              borderColor: bulkDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: bulkDragActive ? 'primary.50' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              position: 'relative',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50'
              }
            }}
            onClick={() => bulkFileInputRef.current?.click()}
          >
            <input
              ref={bulkFileInputRef}
              type="file"
              multiple
              accept=".csv"
              onChange={handleBulkFileUpload}
              style={{ display: 'none' }}
            />
            <UploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
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
              <LinearProgress variant="determinate" value={bulkUploadProgress} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Uploading... {Math.round(bulkUploadProgress)}%
              </Typography>
            </Box>
          )}

          {/* Uploaded Files Banner */}
          {uploadedFiles.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2, 
                bgcolor: 'rgba(76, 175, 80, 0.08)', 
                borderRadius: 1,
                color: 'success.main'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'success.main' }}>
                  Successfully uploaded {uploadedFiles.length} files
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowUploadedFilesDialog(true)}
                  sx={{ 
                    color: 'success.main', 
                    borderColor: 'success.main',
                    '&:hover': {
                      borderColor: 'success.main',
                      bgcolor: 'rgba(76, 175, 80, 0.1)'
                    }
                  }}
                >
                  View Files
                </Button>
              </Box>
            </Box>
          )}

          {/* Column Validation Banner */}
          {columnValidationResult && columnValidationResult.valid && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Typography
                variant="body2"
                color="success.main"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(76, 175, 80, 0.08)', px: 2, py: 1, borderRadius: 2 }}
              >
                <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
                All files have the same column structure
              </Typography>
            </Box>
          )}

          {/* File Preview */}
          {filePreview && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                CSV Preview (First 2 rows including header):
              </Typography>
              <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  fontSize: '0.875rem',
                  fontFamily: 'monospace'
                }}>
                  <thead>
                    <tr>
                      {filePreview.preview[0] && Object.keys(filePreview.preview[0]).map((column, index) => (
                        <th key={index} style={{ 
                          border: '1px solid #ccc', 
                          padding: '8px', 
                          backgroundColor: '#f5f5f5',
                          fontWeight: 600,
                          textAlign: 'left'
                        }}>
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filePreview.preview.slice(0, 2).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.keys(filePreview.preview[0] || {}).map((column, colIndex) => (
                          <td key={colIndex} style={{ 
                            border: '1px solid #ccc', 
                            padding: '8px',
                            backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#fafafa'
                          }}>
                            {row[column] !== undefined ? String(row[column]).substring(0, 50) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Note: Values are truncated to 50 characters for display. Use this preview to identify the correct column names.
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
                        setBulkXColumn('');
                        setBulkYColumn('');
                        setBulkZColumn('');
                        setBulkColumnSelectionComplete(false);
                        setBulkColumnSelectionManuallyCompleted(false);
                        // Reset data unit if switching to ENMO and current unit is m/s²
                        if (e.target.value === 'enmo' && bulkDataUnit === 'm/s²') {
                          setBulkDataUnit('');
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
                      {bulkDataType === 'accelerometer' && (
                        <MenuItem value="mg">mg</MenuItem>
                      )}
                      {bulkDataType === 'accelerometer' && (
                        <MenuItem value="g">g</MenuItem>
                      )}
                      {bulkDataType === 'accelerometer' && (
                        <MenuItem value="m/s²">m/s²</MenuItem>
                      )}
                      {bulkDataType === 'enmo' && (
                        <MenuItem value="mg">mg</MenuItem>
                      )}
                      {bulkDataType === 'enmo' && (
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
          {bulkColumnNames.length > 0 && bulkDataType && bulkDataUnit && bulkTimestampFormat && !bulkColumnSelectionManuallyCompleted && (
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
                        if (bulkDataType === 'accelerometer') {
                          const isComplete = bulkXColumn !== '' && bulkYColumn !== '' && bulkZColumn !== '';
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
                {bulkDataType === 'accelerometer' ? (
                  <>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>X Column</InputLabel>
                        <Select
                          value={bulkXColumn}
                          label="X Column"
                          onChange={(e) => {
                            setBulkXColumn(e.target.value);
                            const isComplete = bulkTimeColumn !== '' && bulkYColumn !== '' && bulkZColumn !== '';
                            setBulkColumnSelectionComplete(isComplete);
                            setBulkColumnSelectionManuallyCompleted(isComplete);
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
                            const isComplete = bulkTimeColumn !== '' && bulkXColumn !== '' && bulkZColumn !== '';
                            setBulkColumnSelectionComplete(isComplete);
                            setBulkColumnSelectionManuallyCompleted(isComplete);
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
                            const isComplete = bulkTimeColumn !== '' && bulkXColumn !== '' && bulkYColumn !== '';
                            setBulkColumnSelectionComplete(isComplete);
                            setBulkColumnSelectionManuallyCompleted(isComplete);
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
                          const isComplete = bulkTimeColumn !== '' && e.target.value.length > 0;
                          setBulkColumnSelectionComplete(isComplete);
                          setBulkColumnSelectionManuallyCompleted(isComplete);
                        }}
                        renderValue={(selected) => selected.join(', ')}
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
          {uploadedFiles.length > 0 && (bulkColumnSelectionManuallyCompleted || (bulkColumnNames.length > 0 && bulkDataType && bulkDataUnit && bulkTimestampFormat && bulkColumnSelectionComplete)) && (
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
                              let value = e.target.value.replace(/,/g, '.');
                              // Allow any positive numeric value with arbitrary precision
                              if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                handleBulkPreprocessParamChange('autocalib_sd_criter', value);
                              }
                            }}
                            inputProps={{ 
                              inputMode: "decimal",
                              lang: "en-US"
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
                              let value = e.target.value.replace(/,/g, '.');
                              // Allow any positive numeric value with arbitrary precision
                              if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                handleBulkPreprocessParamChange('autocalib_sphere_crit', value);
                              }
                            }}
                            inputProps={{ 
                              inputMode: "decimal",
                              lang: "en-US"
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Filter Type</InputLabel>
                            <Select
                              value={bulkPreprocessParams.filter_type}
                              label="Filter Type"
                              onChange={(e) => handleBulkPreprocessParamChange('filter_type', e.target.value)}
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
                              let value = e.target.value.replace(/,/g, '.');
                              // Allow any positive numeric value with arbitrary precision
                              if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                handleBulkPreprocessParamChange('filter_cutoff', value);
                              }
                            }}
                            inputProps={{ 
                              inputMode: "decimal",
                              lang: "en-US"
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
                              let value = e.target.value.replace(/,/g, '.');
                              // Allow any positive numeric value with arbitrary precision
                              if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                handleBulkPreprocessParamChange('wear_sd_crit', value);
                              }
                            }}
                            inputProps={{ 
                              inputMode: "decimal",
                              lang: "en-US"
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
                              let value = e.target.value.replace(/,/g, '.');
                              // Allow any positive numeric value with arbitrary precision
                              if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                handleBulkPreprocessParamChange('wear_range_crit', value);
                              }
                            }}
                            inputProps={{ 
                              inputMode: "decimal",
                              lang: "en-US"
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
                              let value = e.target.value.replace(/,/g, '.');
                              // Allow any positive numeric value with arbitrary precision
                              if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                handleBulkPreprocessParamChange('wear_window_length', value);
                              }
                            }}
                            inputProps={{ 
                              inputMode: "decimal",
                              lang: "en-US"
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
                              let value = e.target.value.replace(/,/g, '.');
                              // Allow any positive numeric value with arbitrary precision
                              if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                handleBulkPreprocessParamChange('wear_window_skip', value);
                              }
                            }}
                            inputProps={{ 
                              inputMode: "numeric",
                              lang: "en-US"
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                          <Typography gutterBottom>
                            Required Daily Coverage
                          </Typography>
                          <Slider
                            value={typeof bulkPreprocessParams.required_daily_coverage === 'number' ? bulkPreprocessParams.required_daily_coverage : 0.5}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(e, newValue) => handleBulkPreprocessParamChange('required_daily_coverage', newValue)}
                            valueLabelDisplay="auto"
                          />
                          <TextField
                            fullWidth
                            label="Required Daily Coverage (0-1)"
                            type="text"
                            value={bulkPreprocessParams.required_daily_coverage}
                            onChange={(e) => {
                              let value = e.target.value.replace(/,/g, '.');
                              // Allow any positive numeric value with arbitrary precision
                              if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                handleBulkPreprocessParamChange('required_daily_coverage', value);
                              }
                            }}
                            inputProps={{
                              inputMode: "decimal",
                              lang: "en-US"
                            }}
                            sx={{ mt: 2 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Minimum fraction of valid data required per day (0 = 0%, 1 = 100%). Default: 0.5
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
                                  onChange={(e) => handleBulkFeatureParamChange('sleep_rescore', e.target.checked)}
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
                              let value = e.target.value.replace(/,/g, '.');
                              // Allow any positive numeric value with arbitrary precision
                              if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                handleBulkFeatureParamChange('sleep_ck_sf', value);
                              }
                            }}
                            inputProps={{ 
                              inputMode: "decimal",
                              lang: "en-US"
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
                              let value = e.target.value.replace(/,/g, '.');
                              // Allow any positive numeric value with arbitrary precision
                              if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                handleBulkFeatureParamChange('pa_cutpoint_sl', value);
                              }
                            }}
                            inputProps={{ 
                              inputMode: "decimal",
                              lang: "en-US"
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
                              let value = e.target.value.replace(/,/g, '.');
                              // Allow any positive numeric value with arbitrary precision
                              if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                handleBulkFeatureParamChange('pa_cutpoint_lm', value);
                              }
                            }}
                            inputProps={{ 
                              inputMode: "decimal",
                              lang: "en-US"
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
                              let value = e.target.value.replace(/,/g, '.');
                              // Allow any positive numeric value with arbitrary precision
                              if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                handleBulkFeatureParamChange('pa_cutpoint_mv', value);
                              }
                            }}
                            inputProps={{ 
                              inputMode: "decimal",
                              lang: "en-US"
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

          {/* Process and Reset Buttons */}
          {uploadedFiles.length > 0 && (bulkColumnSelectionManuallyCompleted || (bulkColumnNames.length > 0 && bulkDataType && bulkDataUnit && bulkTimestampFormat && bulkColumnSelectionComplete)) && (
            <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleBulkProcessData}
                disabled={bulkProcessing || !bulkDataType || !bulkDataUnit || !bulkTimestampFormat || !bulkColumnSelectionComplete}
                startIcon={bulkProcessing ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                sx={{ px: 4, py: 1.5 }}
              >
                {bulkProcessing ? `Processing... (${bulkProcessingTime}s)` : 'Process All Files'}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleBulkReset}
                disabled={bulkProcessing}
                startIcon={<RefreshIcon />}
                sx={{ px: 4, py: 1.5 }}
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
          <Paper sx={{ p: 3, bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
            {/* Processing Summary */}
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="success.dark">
                Processing Complete
              </Typography>
              
              {/* Processing Summary */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Typography variant="body1" color="success.main" sx={{ fontWeight: 500 }}>
                  Successfully processed: {bulkData.individual_results?.length || 0} files
                </Typography>
                
                {bulkData.failed_files && bulkData.failed_files.length > 0 && (
                  <Typography variant="body2" color="warning.dark">
                    Handler creation failed: {bulkData.failed_files.length} files
                  </Typography>
                )}
                
                {bulkData.failed_handlers && bulkData.failed_handlers.length > 0 && (
                  <Typography variant="body2" color="error.dark">
                    Processing failed: {bulkData.failed_handlers.length} files
                  </Typography>
                )}
                
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="success.dark" sx={{ fontWeight: 600 }}>
                  Total: {bulkData.total_files || uploadedFiles.length} files
                </Typography>
              </Box>
              
              {/* Action Buttons */}
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                {bulkData.failed_handlers && bulkData.failed_handlers.length > 0 && (
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
            {bulkData.summary_dataframe && bulkData.summary_dataframe.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Feature Summary
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<BarChartIcon />}
                      onClick={() => setShowFeatureDistributionsDialog(true)}
                      size="small"
                    >
                      Feature Distributions
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<ShowChartIcon />}
                      onClick={() => setShowEnmoTimeseriesDialog(true)}
                      size="small"
                    >
                      ENMO Timeseries
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ overflowX: 'auto' }}>
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
                            <TableCell>{cleanFeatureName(row.feature)}</TableCell>
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
            {bulkData.correlation_matrix && Object.keys(bulkData.correlation_matrix).length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Feature Correlation Matrix
                </Typography>
                
                {/* Heatmap Grid */}
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: `auto repeat(${Object.keys(bulkData.correlation_matrix).length}, 1fr)`,
                  gap: 1,
                  maxWidth: '100%',
                  overflow: 'hidden'
                }}>
                  {/* Header row with feature names */}
                  <Box sx={{ 
                    height: 40, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    color: 'text.secondary'
                  }}>
                    Features
                  </Box>
                  {Object.keys(bulkData.correlation_matrix).map((feature) => (
                    <Box
                      key={feature}
                      sx={{
                        height: 40,
                        display: 'flex',
                        alignItems: 'flex-end', // bottom align
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        textAlign: 'center',
                        overflow: 'visible',
                        px: 1,
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)',
                        minHeight: '120px',
                        pb: 8,
                        alignSelf: 'flex-end',
                        justifyContent: 'flex-start'
                      }}
                    >
                      {cleanFeatureName(feature)}
                    </Box>
                  ))}
                  
                  {/* Data rows */}
                  {Object.keys(bulkData.correlation_matrix).map((rowFeature, rowIndex) => (
                    <React.Fragment key={rowFeature}>
                      {/* Row label */}
                      <Box
                        sx={{
                          height: 30,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          color: 'text.secondary',
                          pr: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {cleanFeatureName(rowFeature)}
                      </Box>
                      
                      {/* Correlation cells */}
                      {Object.keys(bulkData.correlation_matrix).map((colFeature, colIndex) => {
                        const value = bulkData.correlation_matrix[colFeature][rowFeature];
                        const numValue = typeof value === 'number' ? value : 0;
                        
                        // Skip diagonal (self-correlation) and lower triangle
                        if (rowIndex === colIndex || rowIndex > colIndex) {
                          return (
                            <Box
                              key={colFeature}
                              sx={{
                                height: 30,
                                backgroundColor: '#f0f0f0',
                                border: '1px solid #e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.6rem',
                                color: '#999'
                              }}
                            >
                              {rowIndex === colIndex ? '-' : ''}
                            </Box>
                          );
                        }
                        
                        // Continuous color scale from blue (1) to red (-1)
                        const getColor = (value) => {
                          // Clamp value between -1 and 1
                          const clampedValue = Math.max(-1, Math.min(1, value));
                          
                          if (clampedValue >= 0) {
                            // Blue to white for positive correlations
                            const intensity = Math.floor(255 * clampedValue);
                            return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
                          } else {
                            // White to red for negative correlations
                            const intensity = Math.floor(255 * Math.abs(clampedValue));
                            return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
                          }
                        };
                        
                        const bgColor = getColor(numValue);
                        
                        return (
                          <Tooltip
                            key={colFeature}
                            title={`${cleanFeatureName(rowFeature)} vs ${cleanFeatureName(colFeature)}: ${typeof value === 'number' ? value.toFixed(3) : 'N/A'}`}
                            arrow
                            placement="top"
                          >
                            <Box
                              sx={{
                                height: 30,
                                backgroundColor: bgColor,
                                border: '1px solid #e0e0e0',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  zIndex: 1,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                }
                              }}
                            />
                          </Tooltip>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </Box>
                
                                      {/* Legend */}
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Correlation Scale</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: '50%',
                              height: 20,
                              background: 'linear-gradient(to right, rgb(255, 0, 0), rgb(255, 255, 255), rgb(0, 0, 255))',
                              borderRadius: 1,
                              border: '1px solid #ccc',
                              position: 'relative'
                            }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%' }}>
                            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>-1.0</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>0.0</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>1.0</Typography>
                          </Box>
                        </Box>
                      </Box>
              </Box>
            )}

            {/* Individual Results */}
            {bulkData.individual_results && bulkData.individual_results.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Individual Results ({bulkData.individual_results.length} files)
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
                                  {Object.entries(result.features).map(([category, features]) => (
                                    <Grid item xs={12} md={6} key={category}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        {category.replace(/_/g, ' ').toUpperCase()}
                                      </Typography>
                                      <Box sx={{ pl: 2 }}>
                                        {Object.entries(features).map(([key, value]) => (
                                          <Typography key={key} variant="body2">
                                            {key}: {Array.isArray(value) ? value.join(', ') : (typeof value === 'number' ? value.toFixed(4) : String(value))}
                                          </Typography>
                                        ))}
                                      </Box>
                                    </Grid>
                                  ))}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            Failed Files ({bulkData?.failed_files?.length || 0})
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The following files could not be processed due to insufficient data or other issues:
          </Typography>
          <List>
            {bulkData?.failed_files?.map((failedFile, index) => (
              <ListItem key={index} sx={{ border: '1px solid', borderColor: 'error.light', borderRadius: 1, mb: 1 }}>
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
          <Button onClick={() => setShowFailedFilesDialog(false)} color="primary">
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorIcon color="error" />
            Processing Failures ({bulkData?.failed_handlers?.length || 0})
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The following files passed initial validation but failed during feature extraction:
          </Typography>
          <List>
            {bulkData?.failed_handlers?.map((failedHandler, index) => (
              <ListItem key={index} sx={{ border: '1px solid', borderColor: 'error.light', borderRadius: 1, mb: 1 }}>
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
          <Button onClick={() => setShowProcessingFailuresDialog(false)} color="primary">
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              <ListItem key={index} sx={{ border: '1px solid', borderColor: 'success.light', borderRadius: 1, mb: 1 }}>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
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
          <Button onClick={() => setShowUploadedFilesDialog(false)} color="primary">
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChartIcon color="primary" />
            Feature Distributions
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Distribution plots for each feature across all processed files:
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Note: Some metrics are calculated on a daily level, which is why the sample size (n) may be greater than the number of uploaded files.
            </Typography>
          </Alert>
          
          {bulkData && bulkData.individual_results && bulkData.individual_results.length > 0 && (
            <Box>
              {/* Extract all features from individual results */}
                              {(() => {
                  const allFeatures = {};
                  const rejectedFeatures = {};
                  
                  // Helper function to flatten nested objects and extract numeric values
                  const flattenAndExtractNumbers = (obj, prefix = '') => {
                    const result = [];
                    if (typeof obj === 'number' && !isNaN(obj) && isFinite(obj)) {
                      result.push(obj);
                    } else if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                      Object.entries(obj).forEach(([key, value]) => {
                        const newPrefix = prefix ? `${prefix}_${key}` : key;
                        result.push(...flattenAndExtractNumbers(value, newPrefix));
                      });
                    } else if (Array.isArray(obj)) {
                      obj.forEach((item, index) => {
                        const newPrefix = prefix ? `${prefix}_${index}` : `${index}`;
                        result.push(...flattenAndExtractNumbers(item, newPrefix));
                      });
                    }
                    return result;
                  };
                
                // Collect all features from individual results
                bulkData.individual_results.forEach(result => {
                  if (result.features) {
                    Object.entries(result.features).forEach(([category, features]) => {
                                              Object.entries(features).forEach(([featureName, value]) => {
                          if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
                            // Simple numeric value
                            if (!allFeatures[featureName]) {
                              allFeatures[featureName] = [];
                            }
                            allFeatures[featureName].push(value);
                          } else if (value && typeof value === 'object') {
                            // Nested object - flatten and extract numbers
                            const flattenedNumbers = flattenAndExtractNumbers(value, featureName);
                            if (flattenedNumbers.length > 0) {
                              // Add all numeric values to the original feature name
                              if (!allFeatures[featureName]) {
                                allFeatures[featureName] = [];
                              }
                              allFeatures[featureName].push(...flattenedNumbers);
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
                        });
                    });
                  }
                });
                
                // Debug information
                console.log('Available features:', Object.keys(allFeatures));
                console.log('Rejected features:', Object.keys(rejectedFeatures));
                console.log('Summary dataframe features:', bulkData.summary_dataframe ? bulkData.summary_dataframe.map(row => row.feature) : []);
                
                // Print detailed information about rejected features
                Object.entries(rejectedFeatures).forEach(([featureName, values]) => {
                  console.log(`Feature "${featureName}" rejected values:`, values);
                  console.log(`Feature "${featureName}" value types:`, values.map(v => typeof v));
                });
                
                // Debug: Check for specific missing features
                const missingFeatures = ['TST', 'WASO', 'PTA', 'NWB', 'SOL', 'SRI'];
                missingFeatures.forEach(feature => {
                  const found = Object.keys(allFeatures).find(f => 
                    f.toLowerCase().includes(feature.toLowerCase()) || 
                    f.toLowerCase().includes(feature.toLowerCase().replace(/_/g, ''))
                  );
                  console.log(`Looking for ${feature}:`, found ? `Found as "${found}"` : 'NOT FOUND');
                });

                // Create histogram and density curve data for each feature
                const createHistogramAndDensityData = (values, featureName) => {
                  if (values.length === 0) return { histogram: [], density: [] };
                  
                  const min = Math.min(...values);
                  const max = Math.max(...values);
                  const range = max - min;
                  
                  // Create histogram data with equal-width buckets
                  const binCount = Math.min(20, Math.max(5, Math.floor(Math.sqrt(values.length))));
                  const binSize = range / binCount;
                  
                  // Initialize bins with equal-width ranges
                  const bins = [];
                  for (let i = 0; i < binCount; i++) {
                    const binStart = min + i * binSize;
                    const binEnd = min + (i + 1) * binSize;
                    bins.push({
                      range: `${binStart.toFixed(3).replace(/\.?0+$/, '')}-${binEnd.toFixed(3).replace(/\.?0+$/, '')}`,
                      count: 0,
                      start: binStart,
                      end: binEnd
                    });
                  }
                  
                  // Assign values to bins
                  values.forEach(value => {
                    const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
                    bins[binIndex].count++;
                  });
                  
                  const histogramData = bins.map(bin => ({
                    range: bin.range,
                    count: bin.count,
                    feature: featureName
                  }));
                  
                  // Create density curve data using kernel density estimation
                  const numPoints = 100;
                  const bandwidth = range / (Math.pow(values.length, 0.2)); // Silverman's rule of thumb
                  
                  const densityData = [];
                  for (let i = 0; i <= numPoints; i++) {
                    const x = min + (i / numPoints) * range;
                    let density = 0;
                    
                    // Calculate kernel density estimate
                    values.forEach(value => {
                      const u = (x - value) / bandwidth;
                      // Gaussian kernel
                      density += Math.exp(-0.5 * u * u) / (bandwidth * Math.sqrt(2 * Math.PI));
                    });
                    
                    density = density / values.length;
                    
                    // Debug for acrophase
                    if (featureName.toLowerCase().includes('acrophase') && i < 10) {
                      console.log(`Acrophase density at x=${x}: ${density}`);
                    }
                    
                    densityData.push({
                      x: x,
                      density: density,
                      feature: featureName
                    });
                  }
                  
                  // Create combined data for overlay
                  const combinedData = histogramData.map(histItem => {
                    // Fix parsing for negative ranges like "-6.075--5.073"
                    let rangeParts;
                    if (histItem.range.startsWith('-') && histItem.range.includes('--')) {
                      // Handle negative ranges with double minus
                      const parts = histItem.range.split('--');
                      rangeParts = [parts[0], '-' + parts[1]];
                    } else {
                      rangeParts = histItem.range.split('-');
                    }
                    
                    const midPoint = (parseFloat(rangeParts[0]) + parseFloat(rangeParts[1])) / 2;
                    
                    // Find the closest density point to this histogram bin midpoint
                    let closestDensity = 0;
                    let minDistance = Infinity;
                    
                    densityData.forEach(d => {
                      const distance = Math.abs(d.x - midPoint);
                      if (distance < minDistance) {
                        minDistance = distance;
                        closestDensity = d.density;
                      }
                    });
                    
                    // Debug for acrophase
                    if (featureName.toLowerCase().includes('acrophase') && histItem.range.includes('-')) {
                      console.log(`Acrophase bin: ${histItem.range}, parsed: [${rangeParts[0]}, ${rangeParts[1]}], midpoint: ${midPoint}, closest density: ${closestDensity}, minDistance: ${minDistance}`);
                      if (closestDensity === 0) {
                        console.log(`WARNING: Zero density found for acrophase bin ${histItem.range}`);
                      }
                    }
                    
                    return {
                      ...histItem,
                      density: closestDensity
                    };
                  });
                  
                  return { histogram: histogramData, density: densityData, combined: combinedData };
                };

                                // Use the exact order from the summary dataframe
                const summaryFeatureOrder = bulkData.summary_dataframe ? 
                  bulkData.summary_dataframe.map(row => row.feature) : [];
                
                // Get all available features
                const availableFeatures = Object.keys(allFeatures);
                
                // Helper function to find matching feature without prefix
                const findMatchingFeature = (summaryFeature) => {
                  // Remove common prefixes and try to match
                  const prefixes = ['cosinor_', 'nonparam_', 'physical_activity_'];
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
                  const exactMatch = availableFeatures.find(f => f.toLowerCase() === summaryFeature.toLowerCase());
                  if (exactMatch) {
                    return exactMatch;
                  }
                  
                  // Try partial matching for common sleep metrics
                  const partialMatch = availableFeatures.find(f => 
                    f.toLowerCase().includes(summaryFeature.toLowerCase()) ||
                    summaryFeature.toLowerCase().includes(f.toLowerCase())
                  );
                  if (partialMatch) {
                    return partialMatch;
                  }
                  
                  return null;
                };
                
                // Map summary features to available features
                let finalFeatureOrder = summaryFeatureOrder
                  .map(summaryFeature => findMatchingFeature(summaryFeature))
                  .filter(feature => feature !== null);
                
                // If no features matched from summary, use all available features
                if (finalFeatureOrder.length === 0) {
                  console.log('No features matched from summary, using all available features');
                  finalFeatureOrder = availableFeatures;
                }
                
                console.log('Final feature order:', finalFeatureOrder);
                console.log('Features with data:', availableFeatures);
                console.log('Features in summary:', summaryFeatureOrder);
                console.log('All features data:', allFeatures);
                
                return (
                  <>
                    <Grid container spacing={3}>
                    {finalFeatureOrder.map((featureName) => {
                    const values = allFeatures[featureName];
                    const { histogram: histogramData, density: densityData, combined: combinedData } = createHistogramAndDensityData(values, featureName);
                    
                    if (histogramData.length === 0) return null;
                    
                    return (
                      <Grid item xs={12} md={6} key={featureName}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {cleanFeatureName(featureName)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            n = {values.length} | Mean = {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(4)} | Std = {Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - values.reduce((a, b) => a + b, 0) / values.length, 2), 0) / values.length).toFixed(4)}
                          </Typography>
                          <Box sx={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={combinedData} margin={{ top: 20, right: 50, left: 80, bottom: 40 }}>
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
                                    value: 'Density', 
                                    angle: -90, 
                                    position: 'insideLeft', 
                                    offset: -10,
                                    style: { textAnchor: 'middle' }
                                  }} 
                                />
                                <YAxis 
                                  yAxisId="right"
                                  orientation="right"
                                  label={{ 
                                    value: 'Frequency', 
                                    angle: 90, 
                                    position: 'insideRight', 
                                    offset: 5,
                                    style: { textAnchor: 'middle' }
                                  }} 
                                />
                                <RechartsTooltip 
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div style={{ 
                                          backgroundColor: 'white', 
                                          padding: '10px', 
                                          border: '1px solid #ccc',
                                          borderRadius: '4px'
                                        }}>
                                          <p style={{ margin: '0 0 5px 0' }}>Range: {label}</p>
                                          <p style={{ margin: '0' }}>Count: {payload[0].value}</p>
                                          {payload[1] && <p style={{ margin: '0' }}>Density: {payload[1].value.toFixed(6)}</p>}
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar yAxisId="right" dataKey="count" fill="#8884d8" fillOpacity={0.7} />
                                <Line 
                                  yAxisId="left"
                                  type="monotone" 
                                  dataKey="density" 
                                  stroke="#ff7300" 
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
          <Button onClick={() => setShowFeatureDistributionsDialog(false)} color="primary">
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShowChartIcon color="secondary" />
            ENMO Timeseries
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ENMO timeseries of {bulkData && bulkData.individual_results ? bulkData.individual_results.filter(result => result.enmo_timeseries && Array.isArray(result.enmo_timeseries) && result.enmo_timeseries.length > 0).length : 0} processed files shown below:
          </Typography>
          
          {bulkData && bulkData.individual_results && bulkData.individual_results.length > 0 && (
            <Box>
              <Grid container spacing={3}>
                {bulkData.individual_results.map((result, index) => {
                  // Access ENMO data from the backend response
                  const enmoData = result.enmo_timeseries;
                  
                  if (!enmoData || !Array.isArray(enmoData) || enmoData.length === 0) {
                    return null;
                  }

                  // Prepare data for plotting with timestamps
                  const plotData = enmoData.map((item, i) => ({
                    timestamp: new Date(item.timestamp).getTime(),
                    enmo: item.enmo,
                    timeLabel: new Date(item.timestamp).toLocaleDateString() + ' ' + new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }));

                  return (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {result.filename || `File ${index + 1}`}
                        </Typography>

                        <Box sx={{ width: '100%', height: 200 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={plotData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="timestamp" 
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={(timestamp) => {
                                  const date = new Date(timestamp);
                                  return date.toLocaleDateString();
                                }}
                                ticks={(() => {
                                  // Get unique dates for tick positions
                                  const uniqueDates = [...new Set(plotData.map(item => {
                                    const date = new Date(item.timestamp);
                                    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                                  }))];
                                  return uniqueDates.sort((a, b) => a - b);
                                })()}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis 
                                label={{ 
                                  value: 'mg', 
                                  angle: -90, 
                                  position: 'insideLeft',
                                  offset: 20
                                }} 
                              />
                              <RechartsTooltip 
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    const date = new Date(label);
                                    return (
                                      <div style={{ 
                                        backgroundColor: 'white', 
                                        padding: '10px', 
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                      }}>
                                        <p style={{ margin: '0 0 5px 0' }}>Time: {date.toLocaleString()}</p>
                                        <p style={{ margin: '0' }}>ENMO: {payload[0].value?.toFixed(4)} mg</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="enmo" 
                                stroke="#8884d8" 
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
              
              {bulkData.individual_results.every(result => {
                // Check for ENMO data in the backend response
                const enmoData = result.enmo_timeseries;
                return !enmoData || !Array.isArray(enmoData) || enmoData.length === 0;
              }) && (
                <Alert severity="info">
                  <Typography variant="body2">
                    No ENMO timeseries data found in the processed files. This may occur if the data was not processed with ENMO calculation enabled.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEnmoTimeseriesDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Create a modern theme
const appTheme = createTheme({
  palette: {
    primary: {
      main: '#2E3B55', // Deep navy blue
      light: '#4A5B7A',
      dark: '#1A2238',
    },
    secondary: {
      main: '#E76F51', // Coral orange
      light: '#F4A261',
      dark: '#C65D3E',
    },
    background: {
      default: '#F8F9FA', // Light gray background
      paper: '#FFFFFF',
    },
    success: {
      main: '#2A9D8F', // Teal green
      light: '#4CAF9F',
      dark: '#1E7A6F',
    },
    error: {
      main: '#E63946', // Bright red
      light: '#FF4D5A',
      dark: '#C62A36',
    },
    text: {
      primary: '#2E3B55', // Deep navy blue
      secondary: '#6C757D', // Medium gray
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#2E3B55',
    },
    h6: {
      fontWeight: 600,
      color: '#2E3B55',
    },
    subtitle1: {
      fontWeight: 500,
      color: '#4A5B7A',
    },
    subtitle2: {
      fontWeight: 500,
      color: '#6C757D',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2E3B55',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
    title: 'Mesor',
    description: 'The mean value of the fitted cosine curve, representing the average activity level over 24 hours (in mg).'
  },
  amplitude: {
    title: 'Amplitude',
    description: 'Half the difference between the peak and trough of the fitted cosine curve, indicating the strength of the rhythm (in mg).'
  },
  acrophase: {
    title: 'Acrophase',
    description: 'The timing of the peak of the fitted cosine curve, expressed in radians or minutes, indicating when the highest activity occurs.'
  },
  acrophase_time: {
    title: 'Acrophase Time',
    description: 'The time of day (in HH:MM format) when the peak of the fitted cosine curve occurs.'
  },
  // Nonparametric
  is: {
    title: 'Interdaily Stability (IS)',
    description: 'A measure of the consistency of activity patterns between days. Ranges from 0 (random) to 1 (perfectly stable). Higher values indicate more regular daily rhythms.'
  },
  iv: {
    title: 'Intradaily Variability (IV)',
    description: 'A measure of fragmentation of activity within a day. It is greater than 0 - values close to 0 reflect a smooth pattern whereas greater values indicate more transitions between rest and activity. Values below 2 are considered as being acceptable.'
  },
  ra: {
    title: 'Relative Amplitude (RA)',
    description: 'The difference between the most active 10 hours (M10) and least active 5 hours (L5), normalized by their sum. Ranges from 0 to 1. Higher values indicate a more robust rhythm.'
  },
  sri: {
    title: 'Sleep Regularity Index (SRI)',
    description: 'A measure of the consistency of sleep/wake patterns across days. Ranges from -100 (irregular) to 100 (perfectly regular).'
  },
  m10: {
    title: 'L5 & M10',
    description: 'L5 represents the mean activity during the 5 least active consecutive hours of the day (in mg), and M10 represents the mean activity during the 10 most active consecutive hours; together, these metrics describe the least and most active periods within a 24-hour cycle.'
  },
  l5: {
    title: 'L5 & M10',
    description: 'L5 represents the mean activity during the 5 least active consecutive hours of the day (in mg), and M10 represents the mean activity during the 10 most active consecutive hours; together, these metrics describe the least and most active periods within a 24-hour cycle.'
  },
  m10_start: {
    title: 'M10 Start',
    description: 'The start time of the 10 most active consecutive hours of the day.'
  },
  l5_start: {
    title: 'L5 Start',
    description: 'The start time of the 5 least active consecutive hours of the day.'
  },
  // Physical Activity
  sedentary: {
    title: 'Sedentary',
    description: 'Total minutes per day spent in sedentary activity (<1.5 METs).'
  },
  light: {
    title: 'Light',
    description: 'Total minutes per day spent in light activity (1.5–3 METs).'
  },
  moderate: {
    title: 'Moderate',
    description: 'Total minutes per day spent in moderate activity (3–6 METs).'
  },
  vigorous: {
    title: 'Vigorous',
    description: 'Total minutes per day spent in vigorous activity (>6 METs).'
  },
  // Sleep
  tst: {
    title: 'Total Sleep Time (TST)',
    description: 'Total minutes of sleep obtained per night.'
  },
  waso: {
    title: 'Wake After Sleep Onset (WASO)',
    description: 'Total minutes spent awake after initially falling asleep.'
  },
  pta: {
    title: 'Percent Time Asleep (PTA)',
    description: 'Percentage of the sleep period spent asleep.'
  },
  nwb: {
    title: 'Number of Wake Bouts (NWB)',
    description: 'Number of times the person woke up during the sleep period.'
  },
  sol: {
    title: 'Sleep Onset Latency (SOL)',
    description: 'Minutes it took to fall asleep after going to bed.'
  }
};

function SectionInfoButton({ metric }) {
  const [open, setOpen] = React.useState(false);
  if (!metric) return null;
  const desc = metricDescriptions[metric.toLowerCase()];
  if (!desc) return null;
  return (
    <>
      <IconButton size="small" onClick={() => setOpen(true)} aria-label={`Info about ${desc.title}`}> 
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{desc.title}</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ whiteSpace: 'pre-line' }}>
            {desc.description}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
}

// HorizontalScale component for IS and IV
function HorizontalScale({ value, min, max, color = '#1976d2', label }) {
  // Clamp value to [min, max]
  const clamped = Math.max(min, Math.min(max, value));
  const percent = ((clamped - min) / (max - min)) * 100;
  return (
    <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
      {label && (
        <Typography variant="subtitle2" align="center" sx={{ mb: 1 }}>{label}</Typography>
      )}
      <Box sx={{ position: 'relative', height: 48, width: '100%' }}>
        {/* Value above marker */}
        <Box sx={{
          position: 'absolute',
          left: `calc(${percent}% - 20px)`,
          top: 0,
          width: 40,
          textAlign: 'center',
          zIndex: 3,
        }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{clamped.toFixed(2)}</Typography>
        </Box>
        {/* Horizontal line */}
        <Box sx={{ position: 'absolute', top: 32, left: 0, right: 0, height: 4, bgcolor: '#ccc', borderRadius: 2 }} />
        {/* Marker */}
        <Box
          sx={{
            position: 'absolute',
            top: 24,
            left: `calc(${percent}% - 10px)`,
            width: 20,
            height: 20,
            bgcolor: color,
            borderRadius: '50%',
            border: '2px solid #fff',
            boxShadow: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        />
        {/* Min label */}
        <Typography variant="caption" sx={{ position: 'absolute', left: 0, top: 40 }}>{min}</Typography>
        {/* Max label */}
        <Typography variant="caption" sx={{ position: 'absolute', right: 0, top: 40 }}>{max}</Typography>
      </Box>
    </Box>
  );
}

// Helper function to get the first date in YYYY-MM-DD from data.data
function getFirstDate(data) {
  if (data.data && data.data.length > 0 && data.data[0].TIMESTAMP) {
    const d = new Date(data.data[0].TIMESTAMP);
    // Use the local date string as base, then parse back to Date to avoid timezone issues
    const dateStr = d.toLocaleDateString('en-CA');
    return new Date(dateStr);
  }
  return null;
}

function getDateForIndex(key, index, data) {
  if (key === 'M10' && data.features.nonparam.M10_start && data.features.nonparam.M10_start[index]) {
    return data.features.nonparam.M10_start[index].split('T')[0];
  }
  if (key === 'L5' && data.features.nonparam.L5_start && data.features.nonparam.L5_start[index]) {
    return data.features.nonparam.L5_start[index].split('T')[0];
  }
  // For sleep features and RA, generate sequential dates if possible
  if ([
    'TST', 'WASO', 'PTA', 'NWB', 'SOL', 'RA'
  ].includes(key.toUpperCase())) {
    const firstDate = getFirstDate(data);
    if (firstDate) {
      const d = new Date(firstDate);
      d.setDate(d.getDate() + index);
      return d.toLocaleDateString('en-CA');
    }
  }
  if (data.data && data.data[index] && data.data[index].TIMESTAMP) {
    return new Date(data.data[index].TIMESTAMP).toLocaleDateString('en-CA');
  }
  return `Day ${index + 1}`;
}

// Helper to clean and format feature names for display
const cleanFeatureName = (featureName) => {
  // Remove category prefixes from feature names
  const prefixes = ['sleep_', 'cosinor_', 'physical_activity_', 'nonparam_'];
  let cleanedName = featureName;
  for (const prefix of prefixes) {
    if (cleanedName.startsWith(prefix)) {
      cleanedName = cleanedName.substring(prefix.length);
      break;
    }
  }
  // Replace underscores with spaces
  cleanedName = cleanedName.replace(/_/g, ' ');
  // Special case for MESOR - keep it in all caps
  if (cleanedName.toLowerCase() === 'mesor') {
    return 'MESOR';
  }
  // Preserve original capitalization, only apply title case to all-lowercase words
  return cleanedName.split(' ').map(word => {
    if (word.toLowerCase() === 'mesor') {
      return 'MESOR';
    }
    // If the word is all lowercase, capitalize it
    if (word === word.toLowerCase()) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    // Otherwise, keep the original capitalization
    return word;
  }).join(' ');
};

function App() {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('cosinorData');
    return savedData ? JSON.parse(savedData) : null;
  });
  const [dataSource, setDataSource] = useState(() => localStorage.getItem('dataSource') || '');
  const [predictedAge, setPredictedAge] = useState(() => {
    const savedAge = localStorage.getItem('predictedAge');
    return savedAge ? parseFloat(savedAge) : null;
  });
  const [chronologicalAge, setChronologicalAge] = useState(() => localStorage.getItem('chronologicalAge') || '');
  const [gender, setGender] = useState(() => localStorage.getItem('gender') || 'invariant');
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
    filter_type: 'lowpass',
    filter_cutoff: 2,
    wear_sd_crit: 0.00013,
    wear_range_crit: 0.00067,
    wear_window_length: 45,
    wear_window_skip: 7,
    required_daily_coverage: 0.5
  });
  const [featureParams, setFeatureParams] = useState({
    sleep_rescore: true,
    sleep_ck_sf: 0.0025,
    pa_cutpoint_sl: 15,
    pa_cutpoint_lm: 35,
    pa_cutpoint_mv: 70
  });
  const [currentTab, setCurrentTab] = useState(() => {
    const savedTab = localStorage.getItem('currentTab');
    return savedTab !== null ? parseInt(savedTab) : 0;
  });
  const [labSubTab, setLabSubTab] = useState(() => {
    const savedSubTab = localStorage.getItem('labSubTab');
    return savedSubTab || 'single';
  });
  const [gettingStartedOpen, setGettingStartedOpen] = useState(false);
  // Add state for fileType
  const [fileType, setFileType] = useState('');
  // Add state for dataType
  const [dataType, setDataType] = useState('');
  // Add state for data unit selection
  const [dataUnit, setDataUnit] = useState('');
  // Add state for timestamp format selection
  const [timestampFormat, setTimestampFormat] = useState('');
  const [isGeneric, setIsGeneric] = useState(false);
  const [genericDataType, setGenericDataType] = useState('accelerometer-g');
  const [genericTimeFormat, setGenericTimeFormat] = useState('unix-ms');
  const [genericTimeColumn, setGenericTimeColumn] = useState('timestamp');
  const [genericDataColumns, setGenericDataColumns] = useState('x,y,z');
  
  // Column selection state
  const [csvColumns, setCsvColumns] = useState([]);
  const [csvPreview, setCsvPreview] = useState([]);
  const [showColumnSelection, setShowColumnSelection] = useState(false);
  const [selectedTimeColumn, setSelectedTimeColumn] = useState('');
  const [selectedDataColumns, setSelectedDataColumns] = useState([]);
  const [columnSelectionComplete, setColumnSelectionComplete] = useState(false);

  // Update dataType when fileType changes
  useEffect(() => {
    if (fileType === 'binary') {
      setDataType('accelerometer');
    } else if (fileType === 'csv') {
      // Only auto-set dataType if not 'other' data source
      if (dataSource !== 'other') {
        setDataType('enmo');
      }

    } else {
      setDataType('');
    }
  }, [fileType, dataSource]);

  // Update fileType and dataType when dataSource changes
  useEffect(() => {
    if (dataSource === 'other') {
      setFileType('csv');
      // Don't auto-set dataType for 'other' - let user choose
      setDataType('');
    } else if (dataSource === '') {
      setFileType('');
      setDataType('');
    }
    
    // Reset column selection state when data source changes
    setShowColumnSelection(false);
    setColumnSelectionComplete(false);
    setSelectedTimeColumn('');
    setSelectedDataColumns([]);
    setCsvColumns([]);
    setCsvPreview([]);
  }, [dataSource]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (data) {
      localStorage.setItem('cosinorData', JSON.stringify(data));
    }
    localStorage.setItem('dataSource', dataSource);
    if (predictedAge !== null) {
      localStorage.setItem('predictedAge', predictedAge.toString());
    }
    localStorage.setItem('chronologicalAge', chronologicalAge);
    localStorage.setItem('gender', gender);
    localStorage.setItem('currentTab', currentTab.toString());
    localStorage.setItem('labSubTab', labSubTab);
  }, [data, dataSource, predictedAge, chronologicalAge, gender, currentTab, labSubTab]);

  // Clear all state on mount
  useEffect(() => {
    // Only clear if explicitly requested
    const shouldClear = localStorage.getItem('shouldClear');
    if (shouldClear === 'true') {
      localStorage.clear();
      localStorage.setItem('shouldClear', 'false');
    }
  }, []);

  // Log when component re-renders
  useEffect(() => {
    console.log('App component re-rendered at:', new Date().toISOString());
    console.log('Current dataUnit state:', dataUnit);
    console.log('Current dataType state:', dataType);
    console.log('Current timestampFormat state:', timestampFormat);
  });

  // Log when dataType changes
  useEffect(() => {
    console.log('dataType changed to:', dataType);
    console.log('dataUnit state when dataType changes:', dataUnit);
  }, [dataType, dataUnit]);

  // Check if column selection is complete
  useEffect(() => {
    if (showColumnSelection && data?.file_id) {
      const isComplete = (
        (fileType === 'csv' && selectedTimeColumn && selectedDataColumns.length > 0) ||
        (fileType !== 'csv')
      ) && timestampFormat && 
      (dataType === 'alternative_count' || dataUnit || dataType.includes('-'));
      
      if (isComplete && !columnSelectionComplete) {
        setColumnSelectionComplete(true);
        // Automatically trigger column selection
        setTimeout(() => handleColumnSelection(), 100);
      }
    }
  }, [showColumnSelection, data?.file_id, fileType, selectedTimeColumn, selectedDataColumns, timestampFormat, dataType, dataUnit, columnSelectionComplete]);



  // Prevent unnecessary re-renders on initial load
  useEffect(() => {
    if (data?.features && !localStorage.getItem('featuresLoaded')) {
      localStorage.setItem('featuresLoaded', 'true');
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
      setProcessingTime(prev => prev + 1);
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchColumnNames = async (fileId) => {
    try {
      // For CSV files, fetch column names and preview
      if (fileType === 'csv') {
        const response = await fetch(config.getApiUrl(`columns/${fileId}`));
        if (!response.ok) {
          throw new Error('Failed to fetch column names');
        }
        const result = await response.json();
        setCsvColumns(result.columns);
        
        // Fetch CSV preview data
        try {
          const previewResponse = await fetch(config.getApiUrl(`preview/${fileId}`));
          if (previewResponse.ok) {
            const previewResult = await previewResponse.json();
            setCsvPreview(previewResult.preview || []);
          } else {
            console.warn('Failed to fetch CSV preview, continuing without preview');
            setCsvPreview([]);
          }
        } catch (err) {
          console.warn('Error fetching CSV preview:', err);
          setCsvPreview([]);
        }
        
        // Set default selections based on data type
        if (dataType === 'accelerometer') {
          setSelectedTimeColumn(result.columns.find(col => col.toLowerCase().includes('time') || col.toLowerCase().includes('timestamp')) || result.columns[0]);
          setSelectedDataColumns(['x', 'y', 'z'].filter(col => result.columns.includes(col)));
        } else if (dataType === 'enmo') {
          setSelectedTimeColumn(result.columns.find(col => col.toLowerCase().includes('time') || col.toLowerCase().includes('timestamp')) || result.columns[0]);
          setSelectedDataColumns([result.columns.find(col => col.toLowerCase().includes('enmo')) || result.columns[1]]);
        } else if (dataType === 'alternative_count') {
          setSelectedTimeColumn(result.columns.find(col => col.toLowerCase().includes('time') || col.toLowerCase().includes('timestamp')) || result.columns[0]);
          setSelectedDataColumns([result.columns.find(col => col.toLowerCase().includes('count')) || result.columns[1]]);
        }
      } else {
        // For non-CSV files, just set empty arrays
        setCsvColumns([]);
        setCsvPreview([]);
      }
      
      console.log('=== Opening Column Selection Dialog ===');
      console.log('fileType:', fileType);
      console.log('dataType:', dataType);
      console.log('dataUnit:', dataUnit);
      console.log('timestampFormat:', timestampFormat);
      console.log('csvColumns:', csvColumns);
      console.log('csvPreview length:', csvPreview.length);
      
      // Reset dataUnit to empty string when opening dialog
      setDataUnit('');
      setShowColumnSelection(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleColumnSelection = async () => {
    try {
      // Validate required parameters
      if (!timestampFormat) {
        throw new Error('Please select a timestamp format');
      }
      
      if (dataType !== 'alternative_count' && !dataUnit) {
        throw new Error('Please select a data unit');
      }
      
      if (fileType === 'csv' && (!selectedTimeColumn || selectedDataColumns.length === 0)) {
        throw new Error('Please select time and data columns');
      }
      
      // Log current state
      console.log('=== Column Selection Debug ===');
      console.log('dataType:', dataType);
      console.log('dataUnit:', dataUnit);
      console.log('timestampFormat:', timestampFormat);
      console.log('selectedTimeColumn:', selectedTimeColumn);
      console.log('selectedDataColumns:', selectedDataColumns);
      console.log('fileType:', fileType);
      console.log('genericTimeFormat:', genericTimeFormat);
      
      // Construct data_type from dataType and dataUnit
      let data_type;
      
      if (dataType === 'alternative_count') {
        data_type = 'alternative_count';
      } else if (dataType === 'accelerometer' && dataUnit) {
        data_type = `accelerometer-${dataUnit}`;
      } else if (dataType === 'enmo' && dataUnit) {
        data_type = `enmo-${dataUnit}`;
      } else if (dataType) {
        // Fallback to just dataType if no unit is selected
        data_type = dataType;
      } else {
        // If dataType is null/undefined, set a default
        data_type = 'unknown';
      }
      
      console.log('Using data_type:', data_type);

      // For non-CSV files, use generic parameters; for CSV files, use selected columns
      const requestBody = {
        time_format: fileType === 'csv' ? timestampFormat : genericTimeFormat,
        data_unit: dataUnit,
        data_type: data_type
      };

      console.log('=== Final Request Body ===');
      console.log('time_format:', requestBody.time_format);
      console.log('data_unit:', requestBody.data_unit);
      console.log('data_type:', requestBody.data_type);

      if (fileType === 'csv') {
        requestBody.time_column = selectedTimeColumn;
        requestBody.data_columns = selectedDataColumns;
      } else {
        requestBody.time_column = genericTimeColumn;
        requestBody.data_columns = genericDataColumns;
      }

      console.log('Request body being sent to backend:', requestBody);
      
      const response = await fetch(config.getApiUrl(`update_columns/${data.file_id}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update column selections');
      }

      setColumnSelectionComplete(true);
      setSuccess('Column selections updated successfully. Click "Process Data" to continue.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileUpload = async (event) => {
    console.log('handleFileUpload called', event);
    console.log('Current dataSource:', dataSource);
    const file = event.target.files[0];
    if (!file) return;

    // File size limit: 2GB
    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes
    if (file.size > MAX_SIZE) {
      setError('File is too large. Maximum allowed size is 2GB.');
      setUploadProgress(0);
      return;
    }

    setError(null);
    setSuccess(null);
    setData(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    // Set data_source based on dataSource for backend compatibility
    formData.append('data_source', dataSource === 'other' ? 'other' : (fileType === 'binary' ? 'samsung_galaxy_binary' : 'samsung_galaxy_csv'));
    
    console.log('=== Upload Debug ===');
    console.log('dataSource:', dataSource);
    console.log('fileType:', fileType);
    console.log('dataType:', dataType);
    console.log('dataUnit:', dataUnit);
    console.log('timestampFormat:', timestampFormat);
    
    // Add parameters for other data source
    if (dataSource === 'other') {
      // For CSV files, we'll handle data_type in the column selection step
      if (fileType === 'csv') {
        // Don't set data_type here - it will be set in handleColumnSelection
        formData.append('time_format', timestampFormat || 'unix-ms'); // Default timestamp format
        console.log('Added time_format (CSV):', timestampFormat || 'unix-ms');
      } else {
        // For other cases, use generic parameters
        // Don't set data_type here - it will be set in handleColumnSelection
        formData.append('time_format', genericTimeFormat);
        console.log('Added time_format (non-CSV):', genericTimeFormat);
      }
      formData.append('time_column', genericTimeColumn);
      formData.append('data_columns', genericDataColumns);
      console.log('Added time_column:', genericTimeColumn);
      console.log('Added data_columns:', genericDataColumns);
    }
    
    // For Samsung Galaxy CSV with alternative_counts, we'll handle data_type in the column selection step
    // Don't set data_type here - it will be set in handleColumnSelection

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          setData(result);
          setUploadProgress(100);
          
          // For all cases where data_type needs to be computed from dataType + dataUnit, fetch column names
          if ((dataSource === 'other' && fileType === 'csv') || 
              (dataSource === 'samsung_galaxy_csv' && dataType === 'alternative_count') ||
              (dataSource === 'other' && fileType !== 'csv')) {
            fetchColumnNames(result.file_id);
          } else {
            setSuccess('File uploaded successfully. Click "Process Data" to continue.');
          }
        } else {
          const errorData = JSON.parse(xhr.responseText);
          throw new Error(errorData.detail || 'Failed to upload file');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Network error occurred during upload');
      });

      xhr.open('POST', config.getApiUrl('upload'));
      xhr.send(formData);
    } catch (err) {
      setError(err.message);
      setUploadProgress(0);
    }
  };

  const handleProcessData = async () => {
    if (!data?.file_id) {
      setError('No file uploaded');
      return;
    }

    // For all cases where data_type needs to be computed from dataType + dataUnit, ensure column selection is complete
    if ((dataSource === 'other' && !columnSelectionComplete) || 
        (dataSource === 'samsung_galaxy_csv' && dataType === 'alternative_count' && !columnSelectionComplete)) {
      setError('Please complete column selection before processing data');
      return;
    }

    // If data is already processed, don't process again
    if (data.data && data.features) {
      setSuccess('Data is already processed.');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);
    startTimer(); // Start the timer

    try {
      // First extract the files
      const extractResponse = await fetch(config.getApiUrl(`extract/${data.file_id}`), {
        method: 'POST',
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.detail || 'Failed to extract files');
      }

      const extractResult = await extractResponse.json();
      
      // Then process the data with parameters
      const processResponse = await fetch(config.getApiUrl(`process/${data.file_id}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preprocess_args: preprocessParams,
          features_args: featureParams
        }),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.detail || 'Failed to process data');
      }

      const processResult = await processResponse.json();
      
      // Debug logging
      console.log('Processed data:', processResult);
      console.log('Non-parametric features:', processResult.features?.nonparam);
      
      // Update state with both extract and process results
      setData(prev => ({ 
        ...prev, 
        ...extractResult,
        ...processResult,
        data: processResult.data,
        features: processResult.features,
        extracted: true,
        processed: true  // Add a flag to indicate processing is complete
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
    const r0 = 255, g0 = 82, b0 = 82; // red
    const r1 = 76, g1 = 175, b1 = 80; // green
    const r = Math.round(r0 + (r1 - r0) * wear);
    const g = Math.round(g0 + (g1 - g0) * wear);
    const b = Math.round(b0 + (b1 - b0) * wear);
    return `rgb(${r},${g},${b})`;
  }

  const handlePredictAge = async () => {
    if (!data?.file_id || !chronologicalAge) {
      setError('Please enter chronological age and ensure data is processed');
      return;
    }

    try {
      const response = await fetch(config.getApiUrl(`predict_age/${data.file_id}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chronological_age: parseFloat(chronologicalAge),
          gender: gender
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to predict age');
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
    if (dataSource === 'other' && !dataType) return; // Also require dataType for 'other' data source
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dataSource || !fileType) return; // Only allow drop if both dataSource and fileType are selected
    if (dataSource === 'other' && !dataType) return; // Also require dataType for 'other' data source
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
      'autocalib_sd_criter',
      'autocalib_sphere_crit', 
      'filter_cutoff',
      'wear_sd_crit',
      'wear_range_crit',
      'wear_window_length',
      'wear_window_skip',
      'required_daily_coverage'
    ];
    
    // Convert to number if it's a numeric parameter and the value is not empty
    if (numericParams.includes(param) && value !== '' && value !== null && value !== undefined) {
      processedValue = parseFloat(value);
      // If conversion fails, keep the original value
      if (isNaN(processedValue)) {
        processedValue = value;
      }
    }
    
    setPreprocessParams(prev => ({
      ...prev,
      [param]: processedValue
    }));
  };

  const handleFeatureParamChange = (param, value) => {
    // Convert numeric parameters to numbers, keep booleans for boolean parameters
    let processedValue = value;
    
    // List of numeric parameters
    const numericParams = [
      'sleep_ck_sf',
      'pa_cutpoint_sl',
      'pa_cutpoint_lm',
      'pa_cutpoint_mv'
    ];
    
    // List of boolean parameters
    const booleanParams = [
      'sleep_rescore'
    ];
    
    // Convert to number if it's a numeric parameter and the value is not empty
    if (numericParams.includes(param) && value !== '' && value !== null && value !== undefined) {
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
    
    setFeatureParams(prev => ({
      ...prev,
      [param]: processedValue
    }));
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleLabSubTabChange = (event, newValue) => {
    setLabSubTab(newValue);
  };

  const handleReset = () => {
    setData(null);
    setDataSource('');
    setFileType('');
    setDataType('');
    setDataUnit('');
    setTimestampFormat('');
    setError(null);
    setSuccess(null);
    setProcessing(false);
    setProcessingTime(0);
    setChronologicalAge('');
    setGender('invariant');
    setPredictedAge(null);
    setPreprocessParams({
      autocalib_sd_criter: 0.00013,
      autocalib_sphere_crit: 0.02,
      filter_type: 'lowpass',
      filter_cutoff: 2,
      wear_sd_crit: 0.00013,
      wear_range_crit: 0.00067,
      wear_window_length: 45,
      wear_window_skip: 7,
      required_daily_coverage: 0.5
    });
    setFeatureParams({
      sleep_rescore: true,
      sleep_ck_sf: 0.0025,
      pa_cutpoint_sl: 15,
      pa_cutpoint_lm: 35,
      pa_cutpoint_mv: 70
    });
    // Reset column selection state
    setShowColumnSelection(false);
    setColumnSelectionComplete(false);
    setSelectedTimeColumn('');
    setSelectedDataColumns([]);
    setCsvColumns([]);
    setCsvPreview([]);
  };

  // Scroll to top when changing tabs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

  // Reset all when Lab tab is accessed
  useEffect(() => {
    if (currentTab === 2) {
      handleReset();
    }
  }, [currentTab]);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
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
                color: 'white',
                lineHeight: 1.1
              }}
            >
              CosinorLab
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img 
                src={logo} 
                alt="Logo" 
                style={{ 
                  height: '40px', 
                  marginLeft: '16px',
                  filter: 'brightness(0) invert(1)' // This makes the logo white
                }} 
              />
            </Box>
          </Toolbar>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{ 
              bgcolor: 'primary.main',
              borderBottom: 1,
              borderColor: 'primary.dark',
              maxWidth: 600,
              mx: 'auto',
              minHeight: 48,
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
                height: 2,
              },
              '& .MuiTabs-flexContainer': {
                justifyContent: 'center',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                minWidth: 100,
                padding: '8px 12px',
                color: 'white',
                minHeight: 48,
                '&.Mui-selected': {
                  color: 'white',
                  fontWeight: 600,
                },
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'primary.dark',
                },
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <Tab 
              label="Home" 
              icon={<HomeIcon sx={{ fontSize: '1.2rem' }} />} 
              iconPosition="start"
            />
            <Tab 
              label="Documentation" 
              icon={<MenuBookIcon sx={{ fontSize: '1.2rem' }} />} 
              iconPosition="start"
            />
            <Tab 
              label="Lab" 
              icon={<ScienceIcon sx={{ fontSize: '1.2rem' }} />} 
              iconPosition="start"
            />
            <Tab 
              label="About" 
              icon={<InfoIcon sx={{ fontSize: '1.2rem' }} />} 
              iconPosition="start"
            />
          </Tabs>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {currentTab === 0 && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Welcome to CosinorLab
                    </Typography>
                    <Typography variant="h5" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
                      Advanced Analysis of Accelerometer Data
                    </Typography>
                    <Grid container spacing={4} sx={{ mt: 2 }}>
                      <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
                          <Box sx={{ 
                            position: 'absolute', 
                            top: -20, 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <AccessTimeIcon sx={{ fontSize: 30, color: 'white' }} />
                          </Box>
                          <CardContent sx={{ pt: 6, textAlign: 'center' }}>
                            <Typography variant="h5" gutterBottom>
                              Biological Age Prediction
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              Estimate your biological age based on activity patterns. Our advanced 
                              algorithms analyze your movement data to provide insights into your 
                              physiological age and health status.
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
                          <Box sx={{ 
                            position: 'absolute', 
                            top: -20, 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <TimelineIcon sx={{ fontSize: 30, color: 'white' }} />
                          </Box>
                          <CardContent sx={{ pt: 6, textAlign: 'center' }}>
                            <Typography variant="h5" gutterBottom>
                              Accelerometer Data Analysis
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              Process and analyze raw accelerometer data with advanced algorithms. 
                              Extract meaningful insights from your movement patterns using state-of-the-art 
                              preprocessing and feature extraction techniques.
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
                          <Box sx={{ 
                            position: 'absolute', 
                            top: -20, 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <ShowChartIcon sx={{ fontSize: 30, color: 'white' }} />
                          </Box>
                          <CardContent sx={{ pt: 6, textAlign: 'center' }}>
                            <Typography variant="h5" gutterBottom>
                              Feature Visualization
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              Explore your data through interactive visualizations. View circadian rhythms, 
                              activity patterns, and sleep metrics with our comprehensive suite of 
                              visualization tools.
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>

              {/* Getting Started using Lab section with Go to Lab button */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2, mt: 2, p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, width: '100%' }}>
                    <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 700 }}>
                      Getting Started using Lab
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      Use the interactive Lab to upload, process, and visualize your accelerometer data directly in the browser.
                    </Typography>
                    <Box sx={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => setCurrentTab(2)}
                        sx={{ 
                          mt: 2,
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          borderRadius: 2,
                          boxShadow: 3,
                          '&:hover': {
                            boxShadow: 6,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      >
                        Go to Lab
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Getting Started Section in its own outer Grid container */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2, mt: 2, p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 700 }}>
                        Getting Started using API
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <a 
                          href="https://github.com/ADAMMA-CDHI-ETH-Zurich/CosinorAge" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <img 
                            src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" 
                            alt="GitHub Badge"
                            style={{ height: 28, borderRadius: '16px' }}
                          />
                        </a>
                        <a 
                          href="https://cosinorage-deployed.readthedocs.io/en/latest/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <img 
                            src="https://img.shields.io/badge/Read%20the%20Docs-8CA1AF?style=for-the-badge&logo=readthedocs&logoColor=white" 
                            alt="Read the Docs Badge"
                            style={{ height: 28, borderRadius: '16px' }}
                          />
                        </a>
                        <Box sx={{ position: 'relative' }}>
                          <div style={{ display: 'inline-block' }}>
                            <img 
                              src="https://img.shields.io/badge/PyPI-3775A9?style=for-the-badge&logo=pypi&logoColor=white" 
                              alt="PyPI Badge"
                              style={{ height: 28, borderRadius: '16px' }}
                            />
                          </div>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: 'warning.main',
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              transform: 'rotate(15deg)',
                              zIndex: 1
                            }}
                          >
                            WIP
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Prerequisites
                    </Typography>
                    <ul style={{ textAlign: 'left', marginLeft: '1.5em', color: '#4A5B7A' }}>
                      <li>Python &gt;= 3.10</li>
                      <li>pip (Python package installer)</li>
                      <li>git</li>
                    </ul>

                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                      Installation Steps
                    </Typography>

                    <ol style={{ textAlign: 'left', marginLeft: '1.5em', color: '#4A5B7A' }}>
                      <li>
                        <strong>Clone the Repository</strong>
                        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px', marginTop: '8px', overflowX: 'auto' }}>
{`git clone https://github.com/yourusername/cosinorage.git
cd cosinorage`}
                        </pre>
                      </li>
                      <li>
                        <strong>Set Up Virtual Environment</strong>
                        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px', marginTop: '8px', overflowX: 'auto' }}>
{`# Create a new virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
source venv/bin/activate`}
                        </pre>
                      </li>
                      <li>
                        <strong>Install Dependencies</strong>
                        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px', marginTop: '8px', overflowX: 'auto' }}>
{`# Upgrade pip
pip install --upgrade pip

# Install required packages
pip install -r requirements.txt`}
                        </pre>
                      </li>
                      <li>
                        <strong>Install the Package</strong>
                        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px', marginTop: '8px', overflowX: 'auto' }}>
{`# Install in development mode
pip install -e .`}
                        </pre>
                      </li>
                    </ol>
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
          
          {currentTab === 1 && <EnhancedDocumentationTab />}

          {currentTab === 2 && (
            <>
              {/* Lab Subtabs */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider', 
                    mb: 3
                  }}>
                    <Tabs
                      value={labSubTab}
                      onChange={handleLabSubTabChange}
                      sx={{
                        '& .MuiTabs-flexContainer': {
                          justifyContent: 'center',
                        },
                        '& .MuiTab-root': {
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 500,
                          width: '50%', // 50% width each
                          maxWidth: '50%',
                          flex: 1,
                        },
                        '& .MuiTabs-indicator': {
                          backgroundColor: 'primary.main',
                          height: 3,
                        }
                      }}
                    >
                      <Tab label="Single Individual" value="single" />
                      <Tab label="Multi Individual" value="multi" />
                    </Tabs>
                  </Box>
                </Grid>
              </Grid>



              <Grid container spacing={3}>
                {/* Single Individual Tab Content */}
                {labSubTab === 'single' && (
                  <>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
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
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              textTransform: 'none',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              '&:hover': {
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
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
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          alignItems: 'center',
                          border: dragActive ? '2px dashed #2196f3' : 'none',
                          background: dragActive ? 'rgba(33,150,243,0.05)' : undefined,
                          position: 'relative',
                        }}
                        onDragEnter={(dataSource && (dataSource !== 'other' || dataType)) ? handleDrag : undefined}
                        onDragOver={(dataSource && (dataSource !== 'other' || dataType)) ? handleDrag : undefined}
                        onDragLeave={(dataSource && (dataSource !== 'other' || dataType)) ? handleDrag : undefined}
                        onDrop={(dataSource && (dataSource !== 'other' || dataType)) ? handleDrop : undefined}
                      >
                        <Typography variant="h6" gutterBottom sx={{ textAlign: 'left', width: '100%' }}>
                          Data Upload
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
                                  setFileType('');
                                  setDataType('');
                                }}
                                sx={{ minWidth: 120 }}
                                disabled={!!data?.file_id}
                              >
                                <MenuItem value="samsung_galaxy">Samsung Galaxy Smartwatch</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                              </Select>
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
                                disabled={!!data?.file_id || dataSource === 'other' || !dataSource}
                              >
                                <MenuItem value="binary">Binary (Zipped)</MenuItem>
                                <MenuItem value="csv">CSV</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={4}>
                            <FormControl fullWidth disabled={dataSource !== 'other'}>
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
                                <MenuItem value="alternative_count">Alternative Count</MenuItem>
                                {dataSource !== 'other' && (
                                  <>
                                    <MenuItem value="raw">Raw</MenuItem>
                                  </>
                                )}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                        

                        
                        {((dataSource && fileType && dataType) || (dataSource === 'other' && fileType === 'csv' && dataType)) && (
                          <>
                            {/* Data Format Requirements for binary */}
                            {fileType === 'binary' && dataSource === 'samsung_galaxy' && (
                               <Box sx={{ 
                                 mt: 2, 
                                 mb: 3, 
                                 p: 3, 
                                 bgcolor: 'background.paper', 
                                 borderRadius: 2, 
                                 border: '1px solid',
                                 borderColor: 'primary.light',
                                 maxWidth: 1200,
                                 mx: 'auto'
                               }}>
                                 <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                                   Data Format Requirements
                                 </Typography>
                                 <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                                   The uploaded ZIP file is expected to follow a specific structure: it should contain a single top-level parent directory, within which there are subdirectories organized by day. These daily subdirectories must contain binary files. This layout corresponds to the default export format (see example below).
                                 </Typography>
                                 <Box sx={{ display: 'flex', justifyContent: 'center', width: '50%', mx: 'auto', mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                   <img 
                                     src={SGSBinaryZippedExample} 
                                     alt="Samsung Galaxy Smartwatch Binary Zipped Data Structure Example" 
                                     style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
                                   />
                                 </Box>
                               </Box>
                             )}

                            {/* Data Format Requirements for CSV format */}
                            {fileType === 'csv' && dataSource === 'samsung_galaxy' && (
                              <Box sx={{ 
                                mt: 2, 
                                mb: 3, 
                                p: 3, 
                                bgcolor: 'background.paper', 
                                borderRadius: 2, 
                                border: '1px solid',
                                borderColor: 'primary.light',
                                maxWidth: 1200,
                                mx: 'auto'
                              }}>
                                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                                  Data Format Requirements
                                </Typography>
                                <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                                  {dataType === 'accelerometer' && (
                                    <span dangerouslySetInnerHTML={{
                                      __html: "The uploaded CSV file must contain raw accelerometer data collected from a smartwatch. It should include exactly four columns: <strong>'timestamp'</strong>, <strong>'x'</strong>, <strong>'y'</strong>, and <strong>'z'</strong>. The x, y, and z columns represent acceleration values along the three axes in g-force units (typically ranging from -2g to +2g)."
                                    }} />
                                  )}
                                  {dataType === 'enmo' && (
                                    <span dangerouslySetInnerHTML={{
                                      __html: "The uploaded CSV file must contain ENMO (Euclidean Norm Minus One) data collected from a smartwatch. It should include exactly two columns: <strong>'timestamp'</strong> and <strong>'enmo'</strong>. ENMO values should be in milligravitational (mg) units, representing the magnitude of acceleration minus 1g."
                                    }} />
                                  )}
                                  {dataType === 'alternative_counts' && (
                                    <span dangerouslySetInnerHTML={{
                                      __html: "The uploaded CSV file must contain alternative count data collected from a smartwatch. It should include exactly two columns: <strong>'timestamp'</strong> and <strong>'count'</strong>. Count values should represent activity counts or step counts over the specified time intervals."
                                    }} />
                                  )}
                                  {!dataType && (
                                    <span dangerouslySetInnerHTML={{
                                      __html: "The uploaded CSV file must contain time series data collected from a smartwatch. It should include exactly two columns: <strong>'timestamp'</strong> and <strong>'data'</strong>. Please select a data type above to see specific requirements."
                                    }} />
                                  )}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                  <img 
                                    src={SGSCSVExample} 
                                    alt="Samsung Galaxy Smartwatch CSV ENMO Data Structure Example" 
                                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
                                  />
                                </Box>
                              </Box>
                            )}

                            {/* Disclaimers for Other data source */}
                            {dataSource === 'other' && (
                              <>
                                {/* Validation Notice in Red Box */}
                                <Box sx={{ 
                                  mt: 2, 
                                  mb: 3, 
                                  p: 3, 
                                  bgcolor: 'background.paper', 
                                  borderRadius: 2, 
                                  border: '1px solid',
                                  borderColor: 'error.main',
                                  maxWidth: 1200,
                                  mx: 'auto'
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <WarningIcon sx={{ color: 'error.main' }} />
                                    <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600 }}>
                                      Validation Notice
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                                    The data preprocessing and biological age estimation pipeline has been validated using data (raw accelerometer and/or ENMO data) from the UK Biobank, NHANES, and Samsung Galaxy Watch. Results from other devices may vary in accuracy.
                                  </Typography>
                                </Box>

                                {/* Data Format Requirements in Blue Box */}
                                {dataType !== 'alternative_count' && (
                                  <Box sx={{ 
                                    mt: 2, 
                                    mb: 3, 
                                    p: 3, 
                                    bgcolor: 'background.paper', 
                                    borderRadius: 2, 
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    maxWidth: 1200,
                                    mx: 'auto'
                                  }}>
                                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                                      Data Format Requirements
                                    </Typography>
                                    <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                                      {dataType === 'accelerometer' && (
                                        <span dangerouslySetInnerHTML={{
                                          __html: `The uploaded CSV file must contain raw accelerometer data collected from a smartwatch. It should include exactly four columns: <strong>'timestamp'</strong>, <strong>'x'</strong>, <strong>'y'</strong>, and <strong>'z'</strong>. The x, y, and z columns represent acceleration values along the three axes in ${dataUnit} units. The timestamp column should be in ${timestampFormat === 'unix-ms' ? 'Unix milliseconds' : timestampFormat === 'unix-s' ? 'Unix seconds' : 'datetime'} format.`
                                        }} />
                                      )}
                                      {dataType === 'enmo' && (
                                        <span dangerouslySetInnerHTML={{
                                          __html: `The uploaded CSV file must contain ENMO (Euclidean Norm Minus One) data collected from a smartwatch. It should include exactly two columns: <strong>'timestamp'</strong> and <strong>'enmo'</strong>. ENMO values should be in ${dataUnit} units, representing the magnitude of acceleration minus 1g. The timestamp column should be in ${timestampFormat === 'unix-ms' ? 'Unix milliseconds' : timestampFormat === 'unix-s' ? 'Unix seconds' : 'datetime'} format.`
                                        }} />
                                      )}

                                      {!dataType && (
                                        <span dangerouslySetInnerHTML={{
                                          __html: "The uploaded CSV file must contain time series data collected from a smartwatch. It should include exactly two columns: <strong>'timestamp'</strong> and <strong>'data'</strong>. Please select a data type above to see specific requirements."
                                        }} />
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
                                width: '100%',
                                maxWidth: '100%',
                                mx: 'auto',
                                border: '2px dashed',
                                borderColor: dragActive ? 'primary.main' : 'grey.300',
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                bgcolor: dragActive ? 'primary.50' : 'background.paper',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                position: 'relative',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  bgcolor: 'primary.50'
                                }
                              }}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept={fileType === 'binary' ? '.zip' : '.csv'}
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                                disabled={!dataSource || !fileType}
                              />
                              <UploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
                              <Typography variant="h6" gutterBottom>
                                Drop file here or click to select
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {fileType === 'binary' ? 'Upload a zipped binary file' : 'Upload a CSV file'}
                              </Typography>
                              {dragActive && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#2196f3',
                                    fontSize: 24,
                                    pointerEvents: 'none',
                                    background: 'rgba(255,255,255,0.5)'
                                  }}
                                >
                                  Drop file to upload
                                </Box>
                              )}
                            </Box>
                          </>
                        )}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <Box sx={{ width: '100%', mt: 2 }}>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                              Uploading: {Math.round(uploadProgress)}%
                            </Typography>
                          </Box>
                        )}
                        {data?.file_id && (
                          <Typography 
                            variant="body2" 
                            color="success.main" 
                            sx={{ 
                              mt: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <CheckCircleIcon fontSize="small" />
                            Successfully uploaded: {data.filename}
                          </Typography>
                        )}
                        {dragActive && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 10,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#2196f3',
                              fontSize: 24,
                              pointerEvents: 'none',
                              background: 'rgba(255,255,255,0.5)'
                            }}
                          >
                            Drop file to upload
                          </Box>
                        )}
                                            {data?.file_id && (
                      <Grid item xs={12}>
                          {/* CSV Column Configuration Section */}
                          {showColumnSelection && fileType === 'csv' && (
                            <>
                              <Typography variant="body1" paragraph sx={{ textAlign: 'left', width: '100%' }}>
                                Please select the appropriate column names from your CSV file for the {dataType} data type.
                              </Typography>
                              
                              {/* CSV Preview Section */}
                              {fileType === 'csv' && csvPreview.length > 0 && (
                                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    CSV Preview (First 2 rows including header):
                                  </Typography>
                                  <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                                    <table style={{ 
                                      width: '100%', 
                                      borderCollapse: 'collapse', 
                                      fontSize: '0.875rem',
                                      fontFamily: 'monospace'
                                    }}>
                                      <thead>
                                        <tr>
                                          {csvColumns.map((column, index) => (
                                            <th key={index} style={{ 
                                              border: '1px solid #ccc', 
                                              padding: '8px', 
                                              backgroundColor: '#f5f5f5',
                                              fontWeight: 600,
                                              textAlign: 'left'
                                            }}>
                                              {column}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {csvPreview.slice(0, 2).map((row, rowIndex) => (
                                          <tr key={rowIndex}>
                                            {csvColumns.map((column, colIndex) => (
                                              <td key={colIndex} style={{ 
                                                border: '1px solid #ccc', 
                                                padding: '8px',
                                                backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#fafafa'
                                              }}>
                                                {row[column] !== undefined ? String(row[column]).substring(0, 50) : ''}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Note: Values are truncated to 50 characters for display. Use this preview to identify the correct column names.
                                  </Typography>
                                </Box>
                              )}
                            </>
                          )}

                          {/* Unified Grid for Column Selection and Processing Parameters */}
                          <Grid container spacing={3}>
                            {/* CSV Column Selection - Only for CSV files */}
                            {showColumnSelection && fileType === 'csv' && (
                              <>
                                {/* Data Configuration Header */}
                                <Grid item xs={12}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    Data Configuration
                                  </Typography>
                                </Grid>
                                
                                {/* Timestamp Format Selection */}
                                <Grid item xs={12} md={6}>
                                  <FormControl fullWidth>
                                    <InputLabel>Timestamp Format</InputLabel>
                                    <Select
                                      value={timestampFormat || ''}
                                      onChange={(e) => {
                                        console.log('=== Timestamp Format Selection Debug ===');
                                        console.log('Previous timestampFormat:', timestampFormat);
                                        console.log('New timestampFormat value:', e.target.value);
                                        setTimestampFormat(e.target.value);
                                      }}
                                      label="Timestamp Format"
                                      MenuProps={{
                                        PaperProps: {
                                          style: {
                                            maxHeight: 300,
                                            zIndex: 9999
                                          }
                                        },
                                        container: document.body
                                      }}
                                    >
                                      <MenuItem value="unix-ms">Unix - milliseconds</MenuItem>
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
                                    {(dataType === 'accelerometer') && (
                                      <Select
                                        value={dataUnit || ''}
                                        onChange={(e) => {
                                          console.log('=== Data Unit Selection Debug ===');
                                          console.log('Previous dataUnit:', dataUnit);
                                          console.log('New dataUnit value:', e.target.value);
                                          console.log('Setting dataUnit to:', e.target.value);
                                          setDataUnit(e.target.value);
                                        }}
                                        label="Data Unit"
                                        displayEmpty
                                      >
                                        <MenuItem value="g">g</MenuItem>
                                        <MenuItem value="mg">mg</MenuItem>
                                        <MenuItem value="m/s^2">m/s²</MenuItem>
                                      </Select>
                                    )}
                                    
                                    {/* ENMO Data Unit */}
                                    {(dataType === 'enmo') && (
                                      <Select
                                        value={dataUnit || ''}
                                        onChange={(e) => {
                                          console.log('=== Data Unit Selection Debug ===');
                                          console.log('Previous dataUnit:', dataUnit);
                                          console.log('New dataUnit value:', e.target.value);
                                          console.log('Setting dataUnit to:', e.target.value);
                                          setDataUnit(e.target.value);
                                        }}
                                        label="Data Unit"
                                        displayEmpty
                                      >
                                        <MenuItem value="g">g</MenuItem>
                                        <MenuItem value="mg">mg</MenuItem>
                                      </Select>
                                    )}
                                    
                                    {/* Alternative Count Data Unit */}
                                    {dataType === 'alternative_count' && (
                                      <Select
                                        value={dataUnit || ''}
                                        onChange={(e) => {
                                          console.log('=== Data Unit Selection Debug ===');
                                          console.log('Previous dataUnit:', dataUnit);
                                          console.log('New dataUnit value:', e.target.value);
                                          console.log('Setting dataUnit to:', e.target.value);
                                          setDataUnit(e.target.value);
                                        }}
                                        label="Data Unit"
                                        displayEmpty
                                      >
                                        <MenuItem value="">No unit required</MenuItem>
                                      </Select>
                                    )}
                                    
                                    {/* Default Data Unit */}
                                    {!['accelerometer', 'enmo', 'alternative_count'].includes(dataType) && (
                                      <Select
                                        value={dataUnit || ''}
                                        onChange={(e) => {
                                          console.log('=== Data Unit Selection Debug ===');
                                          console.log('Previous dataUnit:', dataUnit);
                                          console.log('New dataUnit value:', e.target.value);
                                          console.log('Setting dataUnit to:', e.target.value);
                                          setDataUnit(e.target.value);
                                        }}
                                        label="Data Unit"
                                        displayEmpty
                                      >
                                        <MenuItem value="">No unit required</MenuItem>
                                      </Select>
                                    )}
                                    
                                    <FormHelperText>
                                      Select the unit of your data values
                                    </FormHelperText>
                                  </FormControl>
                                </Grid>

                                {/* Column Selection - Only show after Data Configuration is complete */}
                                {timestampFormat && dataUnit && (
                                  <>
                                    {/* Column Selection Header */}
                                    <Grid item xs={12}>
                                      <Typography variant="subtitle1" gutterBottom>
                                        Column Selection
                                      </Typography>
                                    </Grid>
                                    
                                    {/* Time Column Selection */}
                                    <Grid item xs={12} md={6}>
                                      <FormControl fullWidth>
                                        <InputLabel>Timestamp Column</InputLabel>
                                        <Select
                                          value={selectedTimeColumn || ''}
                                          onChange={(e) => setSelectedTimeColumn(e.target.value)}
                                          label="Timestamp Column"
                                          MenuProps={{
                                            PaperProps: {
                                              style: {
                                                maxHeight: 300,
                                                zIndex: 9999
                                              }
                                            },
                                            container: document.body
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
                                      {dataType === 'accelerometer' ? (
                                        <Box>
                                          <Typography variant="subtitle2" gutterBottom>
                                            Accelerometer Columns (X, Y, Z)
                                          </Typography>
                                          {['x', 'y', 'z'].map((axis) => (
                                            <FormControl key={axis} fullWidth sx={{ mb: 2 }}>
                                              <InputLabel>{axis.toUpperCase()} Column</InputLabel>
                                              <Select
                                                value={selectedDataColumns.find(col => col.toLowerCase().includes(axis)) || ''}
                                                onChange={(e) => {
                                                  const newColumns = selectedDataColumns.filter(col => !col.toLowerCase().includes(axis));
                                                  if (e.target.value) {
                                                    newColumns.push(e.target.value);
                                                  }
                                                  setSelectedDataColumns(newColumns);
                                                }}
                                                label={`${axis.toUpperCase()} Column`}
                                                MenuProps={{
                                                  PaperProps: {
                                                    style: {
                                                      maxHeight: 300,
                                                      zIndex: 9999
                                                    }
                                                  },
                                                  container: document.body
                                                }}
                                              >
                                                <MenuItem value="">
                                                  <em>None</em>
                                                </MenuItem>
                                                {csvColumns.map((column) => (
                                                  <MenuItem key={column} value={column}>
                                                    {column}
                                                  </MenuItem>
                                                ))}
                                              </Select>
                                            </FormControl>
                                          ))}
                                        </Box>
                                      ) : dataType === 'enmo' ? (
                                        <FormControl fullWidth>
                                          <InputLabel>ENMO Column</InputLabel>
                                          <Select
                                            value={selectedDataColumns[0] || ''}
                                            onChange={(e) => setSelectedDataColumns([e.target.value])}
                                            label="ENMO Column"
                                            MenuProps={{
                                              PaperProps: {
                                                style: {
                                                  maxHeight: 300,
                                                  zIndex: 9999
                                                }
                                              },
                                              container: document.body
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
                                      ) : dataType === 'alternative_count' ? (
                                        <FormControl fullWidth>
                                          <InputLabel>Counts Column</InputLabel>
                                          <Select
                                            value={selectedDataColumns[0] || ''}
                                            onChange={(e) => setSelectedDataColumns([e.target.value])}
                                            label="Counts Column"
                                            MenuProps={{
                                              PaperProps: {
                                                style: {
                                                  maxHeight: 300,
                                                  zIndex: 9999
                                                }
                                              },
                                              container: document.body
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
                                  </>
                                )}
                              </>
                            )}

                                                        {/* Processing Parameters - Only show after timestamp format and data unit are selected */}
                            {data?.file_id && timestampFormat && dataUnit && (
                              <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                  Processing Parameters
                                </Typography>
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
                                            let value = e.target.value.replace(/,/g, '.');
                                            // Allow any positive numeric value with arbitrary precision
                                            if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                              handlePreprocessParamChange('autocalib_sd_criter', value);
                                            }
                                          }}
                                          inputProps={{ 
                                            inputMode: "decimal",
                                            lang: "en-US"
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
                                            let value = e.target.value.replace(/,/g, '.');
                                            // Allow any positive numeric value with arbitrary precision
                                            if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                              handlePreprocessParamChange('autocalib_sphere_crit', value);
                                            }
                                          }}
                                          inputProps={{ 
                                            inputMode: "decimal",
                                            lang: "en-US"
                                          }}
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                          <InputLabel>Filter Type</InputLabel>
                                          <Select
                                            value={preprocessParams.filter_type}
                                            label="Filter Type"
                                            onChange={(e) => handlePreprocessParamChange('filter_type', e.target.value)}
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
                                          value={preprocessParams.filter_cutoff}
                                          onChange={(e) => {
                                            let value = e.target.value.replace(/,/g, '.');
                                            // Allow any positive numeric value with arbitrary precision
                                            if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                              handlePreprocessParamChange('filter_cutoff', value);
                                            }
                                          }}
                                          inputProps={{ 
                                            inputMode: "decimal",
                                            lang: "en-US"
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
                                            let value = e.target.value.replace(/,/g, '.');
                                            // Allow any positive numeric value with arbitrary precision
                                            if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                              handlePreprocessParamChange('wear_sd_crit', value);
                                            }
                                          }}
                                          inputProps={{ 
                                            inputMode: "decimal",
                                            lang: "en-US"
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
                                            let value = e.target.value.replace(/,/g, '.');
                                            // Allow any positive numeric value with arbitrary precision
                                            if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                              handlePreprocessParamChange('wear_range_crit', value);
                                            }
                                          }}
                                          inputProps={{ 
                                            inputMode: "decimal",
                                            lang: "en-US"
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
                                            let value = e.target.value.replace(/,/g, '.');
                                            // Allow any positive numeric value with arbitrary precision
                                            if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                              handlePreprocessParamChange('wear_window_length', value);
                                            }
                                          }}
                                          inputProps={{ 
                                            inputMode: "decimal",
                                            lang: "en-US"
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
                                            let value = e.target.value.replace(/,/g, '.');
                                            // Allow any positive numeric value with arbitrary precision
                                            if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                              handlePreprocessParamChange('wear_window_skip', value);
                                            }
                                          }}
                                          inputProps={{ 
                                            inputMode: "numeric",
                                            lang: "en-US"
                                          }}
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={12}>
                                        <Typography gutterBottom>
                                          Required Daily Coverage
                                        </Typography>
                                        <Slider
                                          value={typeof preprocessParams.required_daily_coverage === 'number' ? preprocessParams.required_daily_coverage : 0.5}
                                          min={0}
                                          max={1}
                                          step={0.01}
                                          onChange={(e, newValue) => handlePreprocessParamChange('required_daily_coverage', newValue)}
                                          valueLabelDisplay="auto"
                                        />
                                        <TextField
                                          fullWidth
                                          label="Required Daily Coverage (0-1)"
                                          type="text"
                                          value={preprocessParams.required_daily_coverage}
                                          onChange={(e) => {
                                            let value = e.target.value.replace(/,/g, '.');
                                            // Allow any positive numeric value with arbitrary precision
                                            if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                              handlePreprocessParamChange('required_daily_coverage', value);
                                            }
                                          }}
                                          inputProps={{
                                            inputMode: "decimal",
                                            lang: "en-US"
                                          }}
                                          sx={{ mt: 2 }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                          Minimum fraction of valid data required per day (0 = 0%, 1 = 100%). Default: 0.5
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
                                                onChange={(e) => handleFeatureParamChange('sleep_rescore', e.target.checked)}
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
                                            let value = e.target.value.replace(/,/g, '.');
                                            // Allow any positive numeric value with arbitrary precision
                                            if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                              handleFeatureParamChange('sleep_ck_sf', value);
                                            }
                                          }}
                                          inputProps={{ 
                                            inputMode: "decimal",
                                            lang: "en-US"
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
                                            let value = e.target.value.replace(/,/g, '.');
                                            // Allow any positive numeric value with arbitrary precision
                                            if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                              handleFeatureParamChange('pa_cutpoint_sl', value);
                                            }
                                          }}
                                          inputProps={{ 
                                            inputMode: "decimal",
                                            lang: "en-US"
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
                                            let value = e.target.value.replace(/,/g, '.');
                                            // Allow any positive numeric value with arbitrary precision
                                            if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                              handleFeatureParamChange('pa_cutpoint_lm', value);
                                            }
                                          }}
                                          inputProps={{ 
                                            inputMode: "decimal",
                                            lang: "en-US"
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
                                            let value = e.target.value.replace(/,/g, '.');
                                            // Allow any positive numeric value with arbitrary precision
                                            if (/^(\d*\.?\d*|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value) || value === "" || value === ".") {
                                              handleFeatureParamChange('pa_cutpoint_mv', value);
                                            }
                                          }}
                                          inputProps={{ 
                                            inputMode: "decimal",
                                            lang: "en-US"
                                          }}
                                        />
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            )}

                            {/* Process and Reset Buttons - Only show when parameters are shown */}
                            {data?.file_id && timestampFormat && dataUnit && (
                              <Grid item xs={12}>
                                <Box sx={{ 
                                  mt: 3, 
                                  display: 'flex', 
                                  gap: 2, 
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleProcessData}
                                    disabled={processing}
                                    startIcon={processing ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                                    sx={{ px: 4, py: 1.5 }}
                                  >
                                    {processing ? `Processing... (${formatTime(processingTime)})` : 'Process Data'}
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleReset}
                                    disabled={processing}
                                    startIcon={<RefreshIcon />}
                                    sx={{ px: 4, py: 1.5 }}
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
                        <Paper sx={{ p: 3, bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                          {/* Processing Summary */}
                          <Box sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom color="success.dark">
                              Processing Complete
                            </Typography>
                            
                            {/* Processing Summary */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                              <Typography variant="body1" color="success.main" sx={{ fontWeight: 500 }}>
                                Data was successfully preprocessed.
                              </Typography>
                              <Typography variant="body1" color="success.main" sx={{ fontWeight: 500 }}>
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
                                 <Typography variant="body1">{data.metadata?.raw_data_frequency || 'N/A'}</Typography>
                               </Grid>
                               <Grid item xs={12} sm={4}>
                                 <Typography variant="subtitle2" color="text.secondary">
                                   Start Time
                                 </Typography>
                                 <Typography variant="body1">{data.metadata?.raw_start_datetime || 'N/A'}</Typography>
                               </Grid>
                               <Grid item xs={12} sm={4}>
                                 <Typography variant="subtitle2" color="text.secondary">
                                   End Time
                                 </Typography>
                                 <Typography variant="body1">{data.metadata?.raw_end_datetime || 'N/A'}</Typography>
                               </Grid>
                               <Grid item xs={12} sm={4}>
                                 <Typography variant="subtitle2" color="text.secondary">
                                   Data Type
                                 </Typography>
                                 <Typography variant="body1">{data.metadata?.raw_data_type || 'N/A'}</Typography>
                               </Grid>
                               <Grid item xs={12} sm={4}>
                                 <Typography variant="subtitle2" color="text.secondary">
                                   Data Unit
                                 </Typography>
                                 <Typography variant="body1">{data.metadata?.raw_data_unit || 'N/A'}</Typography>
                               </Grid>
                               <Grid item xs={12} sm={4}>
                                 <Typography variant="subtitle2" color="text.secondary">
                                   Number of Data Points
                                 </Typography>
                                 <Typography variant="body1">{data.metadata?.raw_n_datapoints || 'N/A'}</Typography>
                               </Grid>
                               <Grid item xs={12} sm={4}>
                                 <Typography variant="subtitle2" color="text.secondary">
                                   Follow-up Time
                                 </Typography>
                                 <Typography variant="body1">
                                   {data.metadata?.raw_start_datetime && data.metadata?.raw_end_datetime ? 
                                     (() => {
                                       const diff = new Date(data.metadata.raw_end_datetime) - new Date(data.metadata.raw_start_datetime);
                                       const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                       const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                       const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                       return `${days} ${days === 1 ? 'day' : 'days'} ${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
                                     })() : 
                                     'N/A'}
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

                         {/* Cosinor Age Prediction */}
                         {data?.features && (
                           <>
                             <Grid item xs={12}>
                               <Paper sx={{ p: 3, mb: 3 }}>
                                 <Typography variant="h6" gutterBottom>
                                   Cosinor Age Prediction
                                 </Typography>
                                 
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
                                       helperText="Enter your chronological age"
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
                                       <FormHelperText>Select your gender for age prediction</FormHelperText>
                                     </FormControl>
                                   </Grid>
                                 </Grid>

                                 {/* Age Prediction Results */}
                                 <Grid container spacing={3}>
                                   <Grid item xs={12} md={6}>
                                     <Box sx={{ textAlign: 'center', p: 2 }}>
                                       <Typography variant="h4" color="primary.main" gutterBottom>
                                         {predictedAge ? `${predictedAge.toFixed(1)} years` : 'N/A'}
                                       </Typography>
                                       <Typography variant="body2" color="text.secondary">
                                         Predicted Biological Age
                                       </Typography>
                                     </Box>
                                   </Grid>
                                   <Grid item xs={12} md={6}>
                                     <Box sx={{ textAlign: 'center', p: 2 }}>
                                       <Typography variant="h4" color="secondary.main" gutterBottom>
                                         {chronologicalAge ? `${chronologicalAge} years` : 'N/A'}
                                       </Typography>
                                       <Typography variant="body2" color="text.secondary">
                                         Chronological Age
                                       </Typography>
                                     </Box>
                                   </Grid>
                                 </Grid>
                                 <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                   <Button
                                     variant="outlined"
                                     color="primary"
                                     onClick={handlePredictAge}
                                     disabled={!data?.features || !chronologicalAge}
                                     sx={{ 
                                       minWidth: 120,
                                       '&:hover': {
                                         backgroundColor: 'primary.main',
                                         color: 'white'
                                       }
                                     }}
                                   >
                                     Predict Age
                                   </Button>
                                 </Box>
                               </Paper>
                             </Grid>

                             
                             {/* Plots */}
                             {(() => {
                               return data?.data && (
                                 <Grid item xs={12}>
                                   {/* Check if data contains x, y, z columns */}
                                   {(() => {
                                     const hasXYZColumns = data.data[0] && 
                                       'x' in data.data[0] && 
                                       'y' in data.data[0] && 
                                       'z' in data.data[0];
                                     
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
                                                 margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                               >
                                                 <XAxis 
                                                   dataKey="TIMESTAMP" 
                                                   label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                                                   tickFormatter={(timestamp) => {
                                                     const date = new Date(timestamp);
                                                     return date.toLocaleDateString();
                                                   }}
                                                   interval={0}
                                                   tick={(props) => {
                                                     const { x, y, payload } = props;
                                                     const date = new Date(payload.value);
                                                     const isStartOfDay = date.getHours() === 0 && date.getMinutes() === 0;
                                                     return isStartOfDay ? (
                                                       <g transform={`translate(${x},${y})`}>
                                                         <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
                                                           {date.toLocaleDateString()}
                                                         </text>
                                                       </g>
                                                     ) : null;
                                                   }}
                                                 />
                                                 <YAxis 
                                                   label={{ value: 'Acceleration (g)', angle: -90, position: 'insideLeft' }}
                                                 />
                                                 <RechartsTooltip 
                                                   content={({ active, payload, label }) => {
                                                     if (active && payload && payload.length) {
                                                       return (
                                                         <div style={{ 
                                                           backgroundColor: 'white', 
                                                           padding: '10px', 
                                                           border: '1px solid #ccc',
                                                           borderRadius: '4px'
                                                         }}>
                                                           <p style={{ margin: '0 0 5px 0' }}>{new Date(label).toLocaleString()}</p>
                                                           {payload.map((entry, index) => (
                                                             <p key={index} style={{ margin: '0', color: entry.color }}>
                                                               {`${entry.name}: ${entry.value.toFixed(4)} g`}
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
                                                   stroke="#ff0000" 
                                                   dot={false}
                                                   name="X-axis"
                                                 />
                                                 <Line 
                                                   type="monotone" 
                                                   dataKey="y" 
                                                   stroke="#00ff00" 
                                                   dot={false}
                                                   name="Y-axis"
                                                 />
                                                 <Line 
                                                   type="monotone" 
                                                   dataKey="z" 
                                                   stroke="#0000ff" 
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
                                       ENMO time series (incl. wear/non-wear segments)
                                     </Typography>
                                     {/* Custom legend for wear/non-wear */}
                                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ml: 1 }}>
                                       <Box sx={{ width: 18, height: 18, bgcolor: '#4caf50', opacity: 0.3, border: '1px solid #4caf50', mr: 1 }} />
                                       <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>wear</Typography>
                                       <Box sx={{ width: 18, height: 18, bgcolor: '#ff5252', opacity: 0.3, border: '1px solid #ff5252', mr: 1 }} />
                                       <Typography variant="body2" color="text.secondary">non-wear</Typography>
                                     </Box>
                                     <ResponsiveContainer width="100%" height={400}>
                                       <LineChart 
                                         data={data.data}
                                         margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                       >
                                         <XAxis 
                                           dataKey="TIMESTAMP" 
                                           label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                                           tickFormatter={(timestamp) => {
                                             const date = new Date(timestamp);
                                             return date.toLocaleDateString();
                                           }}
                                           interval={0}
                                           tick={(props) => {
                                             const { x, y, payload } = props;
                                             const date = new Date(payload.value);
                                             const isStartOfDay = date.getHours() === 0 && date.getMinutes() === 0;
                                             return isStartOfDay ? (
                                               <g transform={`translate(${x},${y})`}>
                                                 <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
                                                   {date.toLocaleDateString()}
                                                 </text>
                                               </g>
                                             ) : null;
                                           }}
                                         />
                                         <YAxis 
                                           label={{ value: 'ENMO (mg)', angle: -90, position: 'insideLeft' }}
                                         />
                                         <RechartsTooltip 
                                           content={({ active, payload, label }) => {
                                             if (active && payload && payload.length) {
                                               return (
                                                 <div style={{ 
                                                   backgroundColor: 'white', 
                                                   padding: '10px', 
                                                   border: '1px solid #ccc',
                                                   borderRadius: '4px'
                                                 }}>
                                                   <p style={{ margin: '0 0 5px 0' }}>{new Date(label).toLocaleString()}</p>
                                                   {payload.map((entry, index) => {
                                                     <p key={index} style={{ margin: '0', color: entry.color }}>
                                                       {`${entry.name}: ${entry.value.toFixed(2)} mg`}
                                                     </p>
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
                                           stroke="#8884d8" 
                                           dot={false}
                                         />
                                         {/* Shaded background for wear/non-wear segments */}
                                         {(() => {
                                           const areas = [];
                                           let currentWear = data.data[0]?.wear;
                                           let segStart = data.data[0]?.TIMESTAMP;
                                           // Log timestamps
                                           console.log('Min Timestamp:', data.data[0]?.TIMESTAMP);
                                           console.log('M10 Start:', data.features.nonparam.m10_start);
                                           console.log('L5 Start:', data.features.nonparam.l5_start);
                                           for (let i = 1; i <= data.data.length; i++) {
                                             const point = data.data[i];
                                             if (i === data.data.length || point?.wear !== currentWear) {
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
                               );
                             })(                             )}

                             {/* Cosinor Features */}
                             {data?.features && data.features.cosinor && (
                               <Grid item xs={12}>
                                 <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                     <Typography variant="h6" gutterBottom>
                                       Cosinor Features
                                     </Typography>
                                     <SectionInfoButton section="cosinor" />
                                   </Box>
                                   <Grid container spacing={2} direction="row" wrap="nowrap">
                                     {Object.entries(data.features.cosinor).map(([key, value]) => (
                                       <Grid item xs key={key} zeroMinWidth>
                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                           <Typography variant="subtitle2" color="text.secondary" noWrap>
                                             {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                           </Typography>
                                           <SectionInfoButton metric={key} />
                                         </Box>
                                         <Typography variant="body1" noWrap>
                                           {typeof value === 'number' ? 
                                             key === 'acrophase_time' ? (() => {
                                               const minutes = value;
                                               const hours = Math.floor(minutes / 60);
                                               const mins = Math.round(minutes % 60);
                                               return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                                             })() : value.toFixed(4) : value}
                                           {key === 'mesor' || key === 'amplitude' ? ' mg' : 
                                             key === 'acrophase' ? ' radians' : ''}
                                         </Typography>
                                       </Grid>
                                     ))}
                                   </Grid>
                                 </Paper>
                               </Grid>
                             )}

                             {/* Non-parametric Features */}
                             {data?.features && data.features.nonparam && (
                               <Grid item xs={12}>
                                 <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                           'is': 1,
                                           'iv': 2,
                                           'm10': 3,
                                           'ra': 4
                                         };
                                         const orderA = order[keyA.toLowerCase()] || 5;
                                         const orderB = order[keyB.toLowerCase()] || 5;
                                         return orderA - orderB;
                                       })
                                       .map(([key, value]) => (
                                       ['l5', 'm10_start', 'l5_start'].includes(key.toLowerCase()) ? null : (
                                         <Grid item xs={12} key={key}>
                                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                             <Typography variant="subtitle2" color="text.secondary">
                                               {key === 'RA' ? 'Relative Amplitude (RA)' : 
                                                key === 'M10' || key === 'L5' ? 'L5 & M10' : 
                                                key === 'IV' ? 'Intradaily Variability (IV)' :
                                                key === 'IS' ? 'Interdaily Stability (IS)' :
                                                key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                             </Typography>
                                             <SectionInfoButton metric={key} />
                                           </Box>
                                           {/* IS and IV as horizontal scale */}
                                           {(['is', 'iv'].includes(key.toLowerCase()) && typeof value === 'number') ? (
                                             <HorizontalScale
                                               value={value}
                                               min={key.toLowerCase() === 'is' ? 0 : 0}
                                               max={key.toLowerCase() === 'is' ? 1 : 2}
                                               color={key.toLowerCase() === 'is' ? '#1976d2' : '#388e3c'}
                                             />
                                           ) : key.toLowerCase() === 'ra' && Array.isArray(value) ? (
                                             <Box sx={{ width: '100%', height: 200, mt: 2 }}>
                                               <ResponsiveContainer width="100%" height="100%">
                                                 <BarChart
                                                   data={value.map((v, index) => ({
                                                     day: getDateForIndex('RA', index, data),
                                                     RA: v
                                                   }))}
                                                   margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                                 >
                                                   <CartesianGrid strokeDasharray="3 3" />
                                                   <XAxis dataKey="day" />
                                                   <YAxis label={{ value: 'RA', angle: -90, position: 'insideLeft' }} />
                                                   <RechartsTooltip 
                                                     content={({ active, payload, label }) => {
                                                       if (active && payload && payload.length) {
                                                         return (
                                                           <div style={{ 
                                                             backgroundColor: 'white', 
                                                             padding: '10px', 
                                                             border: '1px solid #ccc',
                                                             borderRadius: '4px'
                                                           }}>
                                                             <p style={{ margin: '0 0 5px 0' }}>{label}</p>
                                                             {payload.map((entry, index) => {
                                                               let value = entry.value;
                                                               let unit = '';
                                                               if (entry.name === 'TST') {
                                                                 value = Math.round(value).toFixed(0);
                                                                 unit = ' minutes';
                                                               } else if (entry.name === 'WASO' || entry.name === 'SOL') {
                                                                 value = value.toFixed(0);
                                                                 unit = ' minutes';
                                                               } else if (entry.name === 'PTA') {
                                                                 value = value.toFixed(1);
                                                                 unit = '%';
                                                               } else if (entry.name === 'M10' || entry.name === 'L5') {
                                                                 value = value.toFixed(2);
                                                                 unit = ' mg';
                                                               } else if (['sedentary', 'light', 'moderate', 'vigorous'].includes(entry.name)) {
                                                                 value = value.toFixed(0);
                                                                 unit = ' minutes';
                                                               }
                                                               return (
                                                                 <p key={index} style={{ margin: '0', color: entry.color }}>
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
                                                   <Bar dataKey="RA" fill="#0088fe" name="RA" />
                                                 </BarChart>
                                               </ResponsiveContainer>
                                             </Box>
                                           ) : key === 'M10' && data.features.nonparam.M10 && data.features.nonparam.L5 ? (
                                             <>
                                               <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                                                 <ResponsiveContainer width="100%" height="100%">
                                                   <BarChart
                                                     data={data.features.nonparam.M10.map((m10, index) => ({
                                                       day: getDateForIndex('M10', index, data),
                                                       M10: m10,
                                                       L5: data.features.nonparam.L5[index]
                                                     }))}
                                                     margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                                   >
                                                     <CartesianGrid strokeDasharray="3 3" />
                                                     <XAxis dataKey="day" />
                                                     <YAxis label={{ value: 'ENMO (mg)', angle: -90, position: 'insideLeft' }} />
                                                     <RechartsTooltip 
                                                       content={({ active, payload, label }) => {
                                                         if (active && payload && payload.length) {
                                                           return (
                                                             <div style={{ 
                                                               backgroundColor: 'white', 
                                                               padding: '10px', 
                                                               border: '1px solid #ccc',
                                                               borderRadius: '4px'
                                                             }}>
                                                               <p style={{ margin: '0 0 5px 0' }}>{label}</p>
                                                               {payload.map((entry, index) => {
                                                                 let value = entry.value;
                                                                 let unit = '';
                                                                 if (entry.name === 'TST') {
                                                                   value = Math.round(value).toFixed(0);
                                                                   unit = ' minutes';
                                                                 } else if (entry.name === 'WASO' || entry.name === 'SOL') {
                                                                   value = value.toFixed(0);
                                                                   unit = ' minutes';
                                                                 } else if (entry.name === 'PTA') {
                                                                   value = value.toFixed(1);
                                                                   unit = '%';
                                                                 } else if (entry.name === 'M10' || entry.name === 'L5') {
                                                                   value = value.toFixed(2);
                                                                   unit = ' mg';
                                                                 } else if (['sedentary', 'light', 'moderate', 'vigorous'].includes(entry.name)) {
                                                                   value = value.toFixed(0);
                                                                   unit = ' minutes';
                                                                 }
                                                                 return (
                                                                   <p key={index} style={{ margin: '0', color: entry.color }}>
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
                                                     <Bar dataKey="M10" fill="#8884d8" name="M10" />
                                                     <Bar dataKey="L5" fill="#82ca9d" name="L5" />
                                                   </BarChart>
                                                 </ResponsiveContainer>
                                               </Box>
                                             </>
                                           ) : key === 'TST' || key === 'WASO' || key === 'SOL' || key === 'PTA' ? (
                                             <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                                               <ResponsiveContainer width="100%" height="100%">
                                                 <BarChart
                                                   data={value.map((v, index) => ({
                                                     day: getDateForIndex(key, index, data),
                                                     [key]: v
                                                   }))}
                                                   margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                                 >
                                                   <CartesianGrid strokeDasharray="3 3" />
                                                   <XAxis dataKey="day" />
                                                   <YAxis label={{ 
                                                     value: key === 'PTA' ? 'Percentage (%)' : key === 'NWB' ? 'Number of Bouts' : 'Minutes', 
                                                     angle: -90, 
                                                     position: 'insideLeft' 
                                                   }} />
                                                   <RechartsTooltip 
                                                     content={({ active, payload, label }) => {
                                                       if (active && payload && payload.length) {
                                                         return (
                                                           <div style={{ 
                                                             backgroundColor: 'white', 
                                                             padding: '10px', 
                                                             border: '1px solid #ccc',
                                                             borderRadius: '4px'
                                                           }}>
                                                             <p style={{ margin: '0 0 5px 0' }}>{label}</p>
                                                             {payload.map((entry, index) => {
                                                               let value = entry.value;
                                                               let unit = '';
                                                               if (entry.name === 'TST') {
                                                                 value = Math.round(value).toFixed(0);
                                                                 unit = ' minutes';
                                                               } else if (entry.name === 'WASO' || entry.name === 'SOL') {
                                                                 value = value.toFixed(0);
                                                                 unit = ' minutes';
                                                               } else if (entry.name === 'PTA') {
                                                                 value = value.toFixed(1);
                                                                 unit = '%';
                                                               } else if (entry.name === 'NWB') {
                                                                 value = value.toFixed(0);
                                                                 unit = ' bouts';
                                                               }
                                                               return (
                                                                 <p key={index} style={{ margin: '0', color: entry.color }}>
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
                                                   <Bar dataKey={key} fill="#8884d8" name={key} />
                                                 </BarChart>
                                               </ResponsiveContainer>
                                             </Box>
                                           ) : (
                                             <Typography variant="body1">
                                               {Array.isArray(value) ? value.join(', ') : value}
                                             </Typography>
                                           )}
                                         </Grid>
                                       )
                                     ))}
                                   </Grid>
                                   {/* Daily ENMO Time Series with M10 and L5 Periods */}
                                   <Box sx={{ mt: 4 }}>
                                     <Typography variant="subtitle2" gutterBottom>
                                       Daily ENMO Time Series with M10 and L5 Periods (incl. multiday Cosinor Fits)
                                     </Typography>
                                     <Grid container spacing={3}>
                                       {Array.from(new Set(data.data.map(item => {
                                         const date = new Date(item.TIMESTAMP);
                                         return date.toLocaleDateString('en-CA');
                                       }))).map((dayStr, dayIndex) => {
                                         const dayData = data.data.filter(item => {
                                           const date = new Date(item.TIMESTAMP);
                                           return date.toLocaleDateString('en-CA') === dayStr;
                                         });
                                         if (dayData.length === 0) return null;
                                         const m10Start = data.features.nonparam.M10_start?.[dayIndex];
                                         const l5Start = data.features.nonparam.L5_start?.[dayIndex];
                                         if (!m10Start || !l5Start) return null;
                                         // Add a 'timestampNum' property for numeric x-axis and align cosinor_fitted
                                         const dayDataWithNum = dayData.map(item => {
                                           const globalIndex = data.data.findIndex(d => d.TIMESTAMP === item.TIMESTAMP);
                                           const globalData = globalIndex !== -1 ? data.data[globalIndex] : null;
                                           return {
                                             ...item,
                                             timestampNum: new Date(item.TIMESTAMP).getTime(),
                                             cosinor_fitted: globalData ? globalData.cosinor_fitted : null
                                           };
                                         });
                                         const dayDataWithNumSorted = [...dayDataWithNum].sort((a, b) => a.timestampNum - b.timestampNum);
                                         // Check if m10StartDate and l5StartDate are valid
                                         const m10StartDate = m10Start && m10Start.includes('T')
                                           ? new Date(m10Start)
                                           : new Date(`${dayStr}T${m10Start}`);
                                         const l5StartDate = l5Start && l5Start.includes('T')
                                           ? new Date(l5Start)
                                           : new Date(`${dayStr}T${l5Start}`);
                                         return (
                                           <Grid item xs={12} key={dayStr}>
                                             <Paper sx={{ p: 3, mb: 3 }}>
                                               <Typography variant="subtitle1" gutterBottom align="center">
                                                 {dayStr}
                                               </Typography>
                                               <ResponsiveContainer width="100%" height={300}>
                                                 <LineChart
                                                   data={dayDataWithNumSorted}
                                                   margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                                 >
                                                   <CartesianGrid strokeDasharray="3 3" />
                                                   <XAxis
                                                     dataKey="timestampNum"
                                                     type="number"
                                                     domain={['dataMin', 'dataMax']}
                                                     tickFormatter={(timestampNum) => {
                                                       const date = new Date(timestampNum);
                                                       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                     }}
                                                   />
                                                   <YAxis 
                                                     yAxisId="left"
                                                     label={{ value: 'ENMO (mg)', angle: -90, position: 'insideLeft' }} 
                                                   />
                                                   <YAxis 
                                                     yAxisId="right"
                                                     orientation="right"
                                                     label={{ value: 'Cosinor Fit (mg)', angle: 90, position: 'insideRight' }} 
                                                   />
                                                   <RechartsTooltip
                                                     content={({ active, payload, label }) => {
                                                       if (active && payload && payload.length) {
                                                         return (
                                                           <div style={{ 
                                                             backgroundColor: 'white',
                                                             padding: '10px', 
                                                             border: '1px solid #ccc',
                                                             borderRadius: '4px'
                                                           }}>
                                                             <p style={{ margin: '0 0 5px 0' }}>{new Date(label).toLocaleString()}</p>
                                                             {payload.map((entry, index) => {
                                                               let value = entry.value;
                                                               let unit = '';
                                                               if (entry.name === 'TST') {
                                                                 value = Math.round(value).toFixed(0);
                                                                 unit = ' minutes';
                                                               } else if (entry.name === 'WASO' || entry.name === 'SOL') {
                                                                 value = value.toFixed(0);
                                                                 unit = ' minutes';
                                                               } else if (entry.name === 'PTA') {
                                                                 value = value.toFixed(1);
                                                                 unit = '%';
                                                               } else if (entry.name === 'M10' || entry.name === 'L5') {
                                                                 value = value.toFixed(2);
                                                                 unit = ' mg';
                                                               } else if (['sedentary', 'light', 'moderate', 'vigorous'].includes(entry.name)) {
                                                                 value = value.toFixed(0);
                                                                 unit = ' minutes';
                                                               }
                                                               return (
                                                                 <p key={index} style={{ margin: '0', color: entry.color }}>
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
                                                     stroke="#8884d8"
                                                     dot={false}
                                                     isAnimationActive={false}
                                                     yAxisId="left"
                                                   />
                                                   <Line
                                                     type="monotone"
                                                     dataKey="cosinor_fitted"
                                                     stroke="#ff0000"
                                                     dot={false}
                                                     isAnimationActive={false}
                                                     name="Cosinor Fit"
                                                     yAxisId="left"
                                                   />
                                                   {/* M10 Period Band */}
                                                   <ReferenceArea
                                                     x1={m10StartDate.getTime()}
                                                     x2={(() => {
                                                       const x2Value = new Date(m10StartDate.getTime() + 10 * 60 * 60 * 1000);
                                                       if (x2Value.getHours() === 0 && x2Value.getMinutes() === 0) {
                                                         return x2Value.getTime() - 60000;
                                                       }
                                                       return x2Value.getTime();
                                                     })()}
                                                     fill="#8884d8"
                                                     fillOpacity={0.1}
                                                     label="M10"
                                                     yAxisId="left"
                                                   />
                                                   {/* L5 Period Band */}
                                                   <ReferenceArea
                                                     x1={l5StartDate.getTime()}
                                                     x2={(() => {
                                                       const x2Value = new Date(l5StartDate.getTime() + 5 * 60 * 60 * 1000);
                                                       if (x2Value.getHours() === 0 && x2Value.getMinutes() === 0) {
                                                         return x2Value.getTime() - 60000;
                                                       }
                                                       return x2Value.getTime();
                                                     })()}
                                                     fill="#82ca9d"
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
                                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                     <Typography variant="h6" gutterBottom>
                                       Physical Activity Features
                                     </Typography>
                                     <SectionInfoButton section="physical_activity" />
                                   </Box>
                                   {/* Stacked Bar Chart for Activity Levels */}
                                   <Box sx={{ mt: 2 }}>
                                     <Box sx={{ width: '100%', height: 300 }}>
                                       <ResponsiveContainer width="100%" height="100%">
                                         <BarChart
                                           data={(() => {
                                             const days = Array.from(new Set(data.data.map(item => {
                                               const date = new Date(item.TIMESTAMP);
                                               return date.toLocaleDateString('en-CA');
                                             })));
                                             return days.map((dayStr, dayIndex) => {
                                               const sedentary = data.features.physical_activity.sedentary?.[dayIndex] || 0;
                                               const light = data.features.physical_activity.light?.[dayIndex] || 0;
                                               const moderate = data.features.physical_activity.moderate?.[dayIndex] || 0;
                                               const vigorous = data.features.physical_activity.vigorous?.[dayIndex] || 0;
                                               return {
                                                 day: dayStr,
                                                 sedentary,
                                                 light,
                                                 moderate,
                                                 vigorous
                                               };
                                             });
                                           })()}
                                           margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                         >
                                           <CartesianGrid strokeDasharray="3 3" />
                                           <XAxis dataKey="day" />
                                           <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                                           <RechartsTooltip 
                                             content={({ active, payload, label }) => {
                                               if (active && payload && payload.length) {
                                                 return (
                                                   <div style={{ 
                                                     backgroundColor: 'white', 
                                                     padding: '10px', 
                                                     border: '1px solid #ccc',
                                                     borderRadius: '4px'
                                                   }}>
                                                     <p style={{ margin: '0 0 5px 0' }}>{label}</p>
                                                     {payload.map((entry, index) => {
                                                       let value = entry.value;
                                                       let unit = '';
                                                       if (entry.name === 'TST') {
                                                         value = Math.round(value).toFixed(0);
                                                         unit = ' minutes';
                                                       } else if (entry.name === 'WASO' || entry.name === 'SOL') {
                                                         value = value.toFixed(0);
                                                         unit = ' minutes';
                                                       } else if (entry.name === 'PTA') {
                                                         value = value.toFixed(1);
                                                         unit = '%';
                                                       } else if (entry.name === 'M10' || entry.name === 'L5') {
                                                         value = value.toFixed(2);
                                                         unit = ' mg';
                                                       } else if (['sedentary', 'light', 'moderate', 'vigorous'].includes(entry.name)) {
                                                         value = value.toFixed(0);
                                                         unit = ' minutes';
                                                       }
                                                       return (
                                                         <p key={index} style={{ margin: '0', color: entry.color }}>
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
                                           <Bar dataKey="sedentary" stackId="a" fill="#ff6b6b" name="Sedentary" />
                                           <Bar dataKey="light" stackId="a" fill="#4ecdc4" name="Light" />
                                           <Bar dataKey="moderate" stackId="a" fill="#45b7d1" name="Moderate" />
                                           <Bar dataKey="vigorous" stackId="a" fill="#96ceb4" name="Vigorous" />
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
                                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                     <Typography variant="h6" gutterBottom>
                                       Sleep Features
                                     </Typography>
                                     <SectionInfoButton section="sleep" />
                                   </Box>
                                   <Grid container spacing={2}>
                                     {Object.entries(data.features.sleep)
                                       .filter(([key]) => key.toLowerCase() !== 'sri_flag') // Filter out SRI_flag but keep SRI
                                       .sort(([keyA], [keyB]) => {
                                         // Define the desired order - SRI first, then others
                                         const order = {
                                           'sri': 1,
                                           'tst': 2,
                                           'waso': 3,
                                           'sol': 4,
                                           'pta': 5,
                                           'nwb': 6
                                         };
                                         const orderA = order[keyA.toLowerCase()] || 7;
                                         const orderB = order[keyB.toLowerCase()] || 7;
                                         return orderA - orderB;
                                       })
                                       .map(([key, value]) => (
                                       <Grid item xs={12} key={key}>
                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                           <Typography variant="subtitle2" color="text.secondary">
                                             {key === 'TST' ? 'Total Sleep Time (TST)' :
                                              key === 'WASO' ? 'Wake After Sleep Onset (WASO)' :
                                              key === 'SOL' ? 'Sleep Onset Latency (SOL)' :
                                              key === 'PTA' ? 'Percent Time Asleep (PTA)' :
                                              key === 'NWB' ? 'Number of Wake Bouts (NWB)' :
                                              key === 'SRI' ? 'Sleep Regularity Index (SRI)' :
                                              key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                           </Typography>
                                           <SectionInfoButton metric={key} />
                                         </Box>
                                         {/* SRI as horizontal scale */}
                                         {key.toLowerCase() === 'sri' && typeof value === 'number' ? (
                                           <HorizontalScale
                                             value={value}
                                             min={-100}
                                             max={100}
                                             color="#9c27b0"
                                           />
                                         ) : Array.isArray(value) ? (
                                           <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                                             <ResponsiveContainer width="100%" height="100%">
                                               <BarChart
                                                 data={value.map((v, index) => ({
                                                   day: getDateForIndex(key, index, data),
                                                   [key]: v
                                                 }))}
                                                 margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                               >
                                                 <CartesianGrid strokeDasharray="3 3" />
                                                 <XAxis dataKey="day" />
                                                 <YAxis label={{ 
                                                   value: key === 'PTA' ? 'Percentage (%)' : key === 'NWB' ? 'Number of Bouts' : 'Minutes', 
                                                   angle: -90, 
                                                   position: 'insideLeft' 
                                                 }} />
                                                 <RechartsTooltip 
                                                   content={({ active, payload, label }) => {
                                                     if (active && payload && payload.length) {
                                                       return (
                                                         <div style={{ 
                                                           backgroundColor: 'white', 
                                                           padding: '10px', 
                                                           border: '1px solid #ccc',
                                                           borderRadius: '4px'
                                                         }}>
                                                           <p style={{ margin: '0 0 5px 0' }}>{label}</p>
                                                           {payload.map((entry, index) => {
                                                             let value = entry.value;
                                                             let unit = '';
                                                             if (entry.name === 'TST') {
                                                               value = Math.round(value).toFixed(0);
                                                               unit = ' minutes';
                                                             } else if (entry.name === 'WASO' || entry.name === 'SOL') {
                                                               value = value.toFixed(0);
                                                               unit = ' minutes';
                                                             } else if (entry.name === 'PTA') {
                                                               value = value.toFixed(1);
                                                               unit = '%';
                                                             } else if (entry.name === 'NWB') {
                                                               value = value.toFixed(0);
                                                               unit = ' bouts';
                                                             }
                                                             return (
                                                               <p key={index} style={{ margin: '0', color: entry.color }}>
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
                                                 <Bar dataKey={key} fill="#8884d8" name={key} />
                                               </BarChart>
                                             </ResponsiveContainer>
                                           </Box>
                                         ) : (
                                           <Typography variant="body1">
                                             {typeof value === 'number' ? 
                                               key === 'PTA' ? `${value.toFixed(1)}%` :
                                               key === 'NWB' ? `${value.toFixed(0)} bouts` :
                                               `${value.toFixed(0)} minutes` : value}
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
                                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ml: 1 }}>
                                       <Box sx={{ width: 18, height: 18, bgcolor: '#2196f3', opacity: 0.15, border: '1px solid #2196f3', mr: 1 }} />
                                       <Typography variant="body2" color="text.secondary">Sleep Period</Typography>
                                     </Box>
                                     <Grid container spacing={3}>
                                       {Array.from(new Set(data.data.map(item => {
                                         const date = new Date(item.TIMESTAMP);
                                         return date.toLocaleDateString('en-CA');
                                       }))).map((dayStr, dayIndex) => {
                                         const dayData = data.data.filter(item => {
                                           const date = new Date(item.TIMESTAMP);
                                           return date.toLocaleDateString('en-CA') === dayStr;
                                         });
                                         if (dayData.length === 0) return null;
                                         // Add a 'timestampNum' property for numeric x-axis
                                         const dayDataWithNum = dayData.map(item => ({
                                           ...item,
                                           timestampNum: new Date(item.TIMESTAMP).getTime(),
                                         }));
                                         const dayDataWithNumSorted = [...dayDataWithNum].sort((a, b) => a.timestampNum - b.timestampNum);
                                         // Find sleep=1 intervals
                                         const sleepBands = [];
                                         let bandStart = null;
                                         for (let i = 0; i < dayDataWithNumSorted.length; i++) {
                                           if (dayDataWithNumSorted[i].sleep === 1 && bandStart === null) {
                                             bandStart = dayDataWithNumSorted[i].timestampNum;
                                           }
                                           if ((dayDataWithNumSorted[i].sleep !== 1 || i === dayDataWithNumSorted.length - 1) && bandStart !== null) {
                                             const bandEnd = dayDataWithNumSorted[i - 1].timestampNum;
                                             sleepBands.push({ start: bandStart, end: bandEnd });
                                             bandStart = null;
                                           }
                                         }
                                         return (
                                           <Grid item xs={12} key={dayStr}>
                                             <Paper sx={{ p: 3, mb: 3 }}>
                                               <Typography variant="subtitle1" gutterBottom align="center">
                                                 {dayStr}
                                               </Typography>
                                               <ResponsiveContainer width="100%" height={300}>
                                                 <LineChart
                                                   data={dayDataWithNumSorted}
                                                   margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                                 >
                                                   <CartesianGrid strokeDasharray="3 3" />
                                                   <XAxis
                                                     dataKey="timestampNum"
                                                     type="number"
                                                     domain={['dataMin', 'dataMax']}
                                                     tickFormatter={(timestampNum) => {
                                                       const date = new Date(timestampNum);
                                                       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                     }}
                                                   />
                                                   <YAxis
                                                     yAxisId="left"
                                                     label={{ value: 'ENMO (mg)', angle: -90, position: 'insideLeft' }}
                                                   />
                                                   <RechartsTooltip
                                                     content={({ active, payload, label }) => {
                                                       if (active && payload && payload.length) {
                                                         return (
                                                           <div style={{ 
                                                             backgroundColor: 'white', 
                                                             padding: '10px', 
                                                             border: '1px solid #ccc',
                                                             borderRadius: '4px'
                                                           }}>
                                                             <p style={{ margin: '0 0 5px 0' }}>{new Date(label).toLocaleString()}</p>
                                                             {payload.map((entry, index) => {
                                                               let value = entry.value;
                                                               let unit = '';
                                                               if (entry.name === 'TST') {
                                                                 value = Math.round(value).toFixed(0);
                                                                 unit = ' minutes';
                                                               } else if (entry.name === 'WASO' || entry.name === 'SOL') {
                                                                 value = value.toFixed(0);
                                                                 unit = ' minutes';
                                                               } else if (entry.name === 'PTA') {
                                                                 value = value.toFixed(1);
                                                                 unit = '%';
                                                               }
                                                               return (
                                                                 <p key={index} style={{ margin: '0', color: entry.color }}>
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
                                                     stroke="#8884d8"
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
                                                       fill="#2196f3"
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
                  </>
                )}

                {/* Multi Individual Tab Content */}
                {labSubTab === 'multi' && (
                  <MultiIndividualTab />
                )}
              </Grid>
            </>
          )}

          {currentTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 4 }}>
                  <Typography variant="h4" gutterBottom>
                    About CosinorLab
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    A Project by ADAMMA
                  </Typography>
                  
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="body1" paragraph>
                      CosinorLab is a research initiative developed at ADAMMA (Core for AI & Digital Biomarker Research) at ETH Zurich. Our mission is to advance health monitoring by pioneering innovative analysis of accelerometer data — including the prediction of biological age.
                    </Typography>
                    <Typography variant="body1" paragraph>
                      This project was developed by Dr. Jinjoo Shim (Harvard University, formerly at ETH Zurich) and Jacob Leo Oskar Hunecke (ETH Zurich) as part of ADAMMA's commitment to creating open-source tools for health innovation.
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Learn more about ADAMMA at: 
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      justifyContent: 'center',
                      mb: 2
                    }}>
                      <a 
                        href="https://adamma.ethz.ch/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        <img 
                          src="https://img.shields.io/badge/Website-rgb(237,30,121)?style=for-the-badge&logo=google-chrome&logoColor=white" 
                          alt="Website Badge"
                          style={{ height: 28, borderRadius: '16px' }}
                        />
                      </a>
                      <a 
                        href="https://github.com/ADAMMA-CDHI-ETH-Zurich" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        <img 
                          src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" 
                          alt="GitHub Badge"
                          style={{ height: 28, borderRadius: '16px' }}
                        />
                      </a>
                    </Box>
                  </Box>

                  {/* Team Members Section - removed, kept only the one at the end */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      Our Mission
                    </Typography>
                    <Typography variant="body1" paragraph>
                      At CosinorLab, we're dedicated to advancing the field of digital health through:
                    </Typography>
                    <ul>
                      <li>
                        <Typography variant="body1">
                          <strong>Advanced Analysis:</strong> Providing sophisticated tools for analyzing accelerometer data
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body1">
                          <strong>Open Source:</strong> Making our tools freely available to the research community
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body1">
                          <strong>User-Friendly Interface:</strong> Making complex analysis accessible to researchers and healthcare professionals
                        </Typography>
                      </li>
                    </ul>
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      Key Features
                    </Typography>
                    <ul>
                      <li>
                        <Typography variant="body1">
                          Biological age prediction based on activity patterns
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body1">
                          Advanced cosinor analysis for circadian rhythm assessment
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body1">
                          Interactive visualization of activity patterns
                        </Typography>
                      </li>
                    </ul>
                  </Box>

                  {/* Team Members Section - moved to end */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      Meet the Team
                    </Typography>
                    <Grid container spacing={4} sx={{ mt: 2 }}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          textAlign: 'center',
                          p: 3,
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                          boxShadow: 1,
                          height: 360
                        }}>
                          <img 
                            src="https://im.ethz.ch/people/efleisch/_jcr_content/par/twocolumn/par_left/fullwidthimage/image.imageformat.1286.1368744170.jpg" 
                            alt="Prof. Dr. Elgar Fleisch" 
                            style={{ 
                              width: 120, 
                              height: 120, 
                              borderRadius: '50%',
                              objectFit: 'cover',
                              objectPosition: 'center 30%',
                              marginBottom: 16,
                              border: '3px solid',
                              borderColor: 'primary.main'
                            }} 
                          />
                          <Typography variant="h6" gutterBottom>
                            Prof. Dr. Elgar Fleisch
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Chair of Information Management
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ETH Zurich
                          </Typography>
                          <Box sx={{ 
                            mt: 1, 
                            display: 'flex', 
                            gap: 1, 
                            flexWrap: 'wrap', 
                            justifyContent: 'center',
                            maxWidth: '100%'
                          }}>
                            <a 
                              href="https://im.ethz.ch/people/efleisch.html" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: 'rgb(237, 30, 121)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: 'rgb(200, 25, 100)'
                                }
                              }}>
                                W
                              </Box>
                            </a>
                            <a 
                              href="https://www.linkedin.com/in/elgar-fleisch-0bb72461/?originalSubdomain=ch" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#0077B5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: '#005885'
                                }
                              }}>
                                L
                              </Box>
                            </a>
                            <a 
                              href="mailto:efleisch@ethz.ch" 
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#D44638',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: '#B33A2E'
                                }
                              }}>
                                M
                              </Box>
                            </a>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          textAlign: 'center',
                          p: 3,
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                          boxShadow: 1,
                          height: 360
                        }}>
                          <img 
                            src="https://adamma.ethz.ch/images/filipe.jpg" 
                            alt="Dr. Filipe Barata" 
                            style={{ 
                              width: 120, 
                              height: 120, 
                              borderRadius: '50%',
                              objectFit: 'cover',
                              marginBottom: 16,
                              border: '3px solid',
                              borderColor: 'primary.main'
                            }} 
                          />
                          <Typography variant="h6" gutterBottom>
                            Dr. Filipe Barata
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            ADAMMA Group Leader
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ETH Zurich
                          </Typography>
                          <Box sx={{ 
                            mt: 1, 
                            display: 'flex', 
                            gap: 1, 
                            flexWrap: 'wrap', 
                            justifyContent: 'center',
                            maxWidth: '100%'
                          }}>
                            <a 
                              href="https://adamma.ethz.ch/members/filipe-barata.html" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: 'rgb(237, 30, 121)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: 'rgb(200, 25, 100)'
                                }
                              }}>
                                W
                              </Box>
                            </a>
                            <a 
                              href="https://github.com/pipo3000" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#100000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: '#333333'
                                }
                              }}>
                                G
                              </Box>
                            </a>
                            <a 
                              href="https://www.linkedin.com/in/filipe-barata/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#0077B5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: '#005885'
                                }
                              }}>
                                L
                              </Box>
                            </a>
                            <a 
                              href="mailto:fbarata@ethz.ch" 
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#D44638',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: '#B33A2E'
                                }
                              }}>
                                M
                              </Box>
                            </a>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          textAlign: 'center',
                          p: 3,
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                          boxShadow: 1,
                          height: 360
                        }}>
                          <img 
                            src="https://jinjooshim.com/authors/admin/avatar_hu1948641559463300168.png" 
                            alt="Dr. Jinjoo Shim" 
                            style={{ 
                              width: 120, 
                              height: 120, 
                              borderRadius: '50%',
                              objectFit: 'cover',
                              marginBottom: 16,
                              border: '3px solid',
                              borderColor: 'primary.main'
                            }} 
                          />
                          <Typography variant="h6" gutterBottom>
                            Dr. Jinjoo Shim
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Postdoctoral Fellow
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Harvard University (Formerly at ETH Zurich)
                          </Typography>
                          <Box sx={{ 
                            mt: 1, 
                            display: 'flex', 
                            gap: 1, 
                            flexWrap: 'wrap', 
                            justifyContent: 'center',
                            maxWidth: '100%'
                          }}>
                            <a 
                              href="https://adamma.ethz.ch/members/jinjoo-shim" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: 'rgb(237, 30, 121)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: 'rgb(200, 25, 100)'
                                }
                              }}>
                                W
                              </Box>
                            </a>
                            <a 
                              href="https://github.com/jinjoo-shim" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#100000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: '#333333'
                                }
                              }}>
                                G
                              </Box>
                            </a>
                            <a 
                              href="https://www.linkedin.com/in/jinjooshim/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#0077B5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: '#005885'
                                }
                              }}>
                                L
                              </Box>
                            </a>
                            <a 
                              href="mailto:jinjooshim@hsph.harvard.edu" 
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#D44638',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: '#B33A2E'
                                }
                              }}>
                                M
                              </Box>
                            </a>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          textAlign: 'center',
                          p: 3,
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                          boxShadow: 1,
                          height: 360
                        }}>
                          <img 
                            src="https://adamma.ethz.ch/images/jacob.png" 
                            alt="Jacob Leo Oskar Hunecke" 
                            style={{ 
                              width: 120, 
                              height: 120, 
                              borderRadius: '50%',
                              objectFit: 'cover',
                              marginBottom: 16,
                              border: '3px solid',
                              borderColor: 'primary.main'
                            }} 
                          />
                          <Typography variant="h6" gutterBottom>
                            Jacob Leo Oskar Hunecke
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Master's Student
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ETH Zurich
                          </Typography>
                          <Box sx={{ 
                            mt: 1, 
                            display: 'flex', 
                            gap: 1, 
                            flexWrap: 'wrap', 
                            justifyContent: 'center',
                            maxWidth: '100%'
                          }}>
                            <a 
                              href="https://adamma.ethz.ch/members/jacob-hunecke.html" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: 'rgb(237, 30, 121)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: 'rgb(200, 25, 100)'
                                }
                              }}>
                                W
                              </Box>
                            </a>
                            <a 
                              href="https://github.com/jlohunecke" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#100000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: '#333333'
                                }
                              }}>
                                G
                              </Box>
                            </a>
                            <a 
                              href="https://www.linkedin.com/in/jlohunecke/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#0077B5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: '#005885'
                                }
                              }}>
                                L
                              </Box>
                            </a>
                            <a 
                              href="mailto:jhunecke@student.ethz.ch" 
                              style={{ textDecoration: 'none' }}
                            >
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#D44638',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                '&:hover': {
                                  bgcolor: '#B33A2E'
                                }
                              }}>
                                M
                              </Box>
                            </a>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>



      {/* Getting Started Dialog */}
      <Dialog 
        open={gettingStartedOpen} 
        onClose={() => setGettingStartedOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Getting Started with CosinorLab
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Welcome to CosinorLab! To help you explore the interface, we've provided a sample file containing mock accelerometer data.
          </Typography>
          
          <Typography variant="body1" paragraph>
            This is an example file containing mock accelerometer data which can be used to explore the UI. For uploading this file, you should select:
          </Typography>
          
          <Box sx={{ 
            bgcolor: 'grey.50', 
            p: 2, 
            borderRadius: 1, 
            mb: 3,
            border: '1px solid',
            borderColor: 'grey.300'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Recommended Settings:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Data Source: <strong>Other</strong><br/>
              • File Type: <strong>CSV</strong><br/>
              • Data Type: <strong>Accelerometer</strong><br/>
              • Timestamp Format: <strong>Unix - milliseconds</strong><br/>
              • Data Unit: <strong>g</strong><br/>
              • Time Column: <strong>timestamp</strong><br/>
              • Data Columns: <strong>x,y,z</strong><br/>
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const link = document.createElement('a');
                link.href = config.getApiUrl('download/sample');
                link.download = 'sample_data2.csv';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              sx={{ 
                borderRadius: 2,
                px: 4,
                py: 1.5,
                mb: 2
              }}
            >
              Download Sample CSV File
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center">
            After downloading, you can upload this file to explore the CosinorLab interface and see how the analysis works.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGettingStartedOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default App; 