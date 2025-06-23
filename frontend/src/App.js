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
  Chip,
  Link,
  DialogActions
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceArea, BarChart, Bar } from 'recharts';
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
import logo from './assets/logo.png';
import EnhancedDocumentationTab from './EnhancedDocumentationTab';
import SGSBinaryZippedExample from './assets/SGS_Binary_Zipped_Example.png';

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
    description: 'A measure of the consistency of sleep/wake patterns across days. Ranges from 0 (irregular) to 1 (perfectly regular).'
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
  const [currentTab, setCurrentTab] = useState(0);
  const [serverStatus, setServerStatus] = useState('Server Connected');
  const [gettingStartedOpen, setGettingStartedOpen] = useState(false);
  // Add state for fileType
  const [fileType, setFileType] = useState('');
  // Add state for dataType
  const [dataType, setDataType] = useState('');

  // Update dataType when fileType changes
  useEffect(() => {
    if (fileType === 'binary') {
      setDataType('accelerometer');
    } else if (fileType === 'csv') {
      setDataType('enmo');
    } else {
      setDataType('');
    }
  }, [fileType]);

  // Update fileType and dataType when dataSource changes
  useEffect(() => {
    if (dataSource === 'other') {
      setFileType('csv');
      setDataType('raw');
    } else if (dataSource === '') {
      setFileType('');
      setDataType('');
    }
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
  }, [data, dataSource, predictedAge, chronologicalAge, gender]);

  // Clear all state on mount
  useEffect(() => {
    // Only clear if explicitly requested
    const shouldClear = localStorage.getItem('shouldClear');
    if (shouldClear === 'true') {
      localStorage.clear();
      localStorage.setItem('shouldClear', 'false');
    }
  }, []);

  // Check server status periodically
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        if (!response.ok) {
          setServerStatus('Server Disconnected');
        } else {
          setServerStatus('Server Connected');
        }
      } catch (error) {
        setServerStatus('Server Disconnected');
      }
    };

    checkServerStatus(); // Check immediately on mount

    const interval = setInterval(checkServerStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Log when component re-renders
  useEffect(() => {
    console.log('App component re-rendered at:', new Date().toISOString());
  });

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
    // Set data_source based on fileType for backend compatibility
    formData.append('data_source', fileType === 'binary' ? 'samsung_galaxy_binary' : 'samsung_galaxy_csv');

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
          setSuccess('File uploaded successfully. Click "Process Data" to continue.');
          setUploadProgress(100);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          throw new Error(errorData.detail || 'Failed to upload file');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Network error occurred during upload');
      });

      xhr.open('POST', 'http://localhost:8000/upload');
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
      const extractResponse = await fetch(`http://localhost:8000/extract/${data.file_id}`, {
        method: 'POST',
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.detail || 'Failed to extract files');
      }

      const extractResult = await extractResponse.json();
      
      // Then process the data with parameters
      const processResponse = await fetch(`http://localhost:8000/process/${data.file_id}`, {
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
      const response = await fetch(`http://localhost:8000/predict_age/${data.file_id}`, {
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
    if (!dataSource) return; // Only allow drag if dataSource is selected
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dataSource) return; // Only allow drop if dataSource is selected
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  // Add handler for parameter changes
  const handlePreprocessParamChange = (param, value) => {
    setPreprocessParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleFeatureParamChange = (param, value) => {
    setFeatureParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleReset = () => {
    setData(null);
    setDataSource('');
    setFileType('');
    setDataType('');
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
    setServerStatus('Server Connected');
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
              <Chip
                label={serverStatus}
                color={serverStatus === 'Server Connected' ? 'success' : 'error'}
                size="small"
                sx={{ 
                  '& .MuiChip-label': { 
                    px: 1,
                    fontSize: '0.75rem'
                  }
                }}
              />
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
                    <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 700 }}>
                      Getting Started using API
                    </Typography>

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
            <Grid container spacing={3}>
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
                    maxWidth: 600,
                    mx: 'auto',
                    border: dragActive ? '2px dashed #2196f3' : 'none',
                    background: dragActive ? 'rgba(33,150,243,0.05)' : undefined,
                    position: 'relative',
                  }}
                  onDragEnter={dataSource ? handleDrag : undefined}
                  onDragOver={dataSource ? handleDrag : undefined}
                  onDragLeave={dataSource ? handleDrag : undefined}
                  onDrop={dataSource ? handleDrop : undefined}
                >
                  <Typography variant="h6" gutterBottom>
                    Select Data & File Format
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <FormControl fullWidth>
                        <InputLabel id="data-source-label">Data Source</InputLabel>
                        <Select
                          labelId="data-source-label"
                          value={dataSource}
                          label="Data Source"
                          onChange={(e) => setDataSource(e.target.value)}
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
                      <FormControl fullWidth disabled>
                        <InputLabel id="data-type-label">Data Type</InputLabel>
                        <Select
                          labelId="data-type-label"
                          value={dataType}
                          label="Data Type"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="accelerometer">Accelerometer</MenuItem>
                          <MenuItem value="enmo">ENMO</MenuItem>
                          <MenuItem value="raw">Raw</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  {dataSource && (
                    <>
                      {/* File Upload Button - moved above disclaimers */}
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadIcon />}
                        sx={{ 
                          minWidth: 200,
                          py: 1,
                          px: 3,
                          borderRadius: 2,
                          position: 'relative'
                        }}
                        disabled={!!data?.file_id || dataSource === 'other'}
                        onClick={() => { console.log('Upload File button pressed'); }}
                      >
                        Upload File
                        {dataSource === 'other' && (
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
                        )}
                        <input
                          type="file"
                          hidden
                          accept={fileType === 'binary' ? '.zip' : '.csv'}
                          onChange={handleFileUpload}
                          ref={fileInputRef}
                        />
                      </Button>

                      {/* Explanation for Binary Zipped format */}
                      {fileType === 'binary' && (
                        <Box sx={{ 
                          mt: 2, 
                          mb: 3, 
                          p: 3, 
                          bgcolor: 'background.paper', 
                          borderRadius: 2, 
                          border: '1px solid',
                          borderColor: 'primary.light',
                          maxWidth: 600,
                          mx: 'auto'
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Data Format Requirements
                          </Typography>
                          <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                            The uploaded ZIP file is expected to follow a specific structure: it should contain a single top-level parent directory, within which there are subdirectories organized by day. These daily subdirectories must contain binary files. This layout corresponds to the default export format (see example below).
                          </Typography>
                          <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                            Each binary file is expected to contain raw accelerometer data in a 4-column format: <strong>'unix_timestamp_in_ms'</strong>, <strong>'acceleration_x'</strong>, <strong>'acceleration_y'</strong>, and <strong>'acceleration_z'</strong>.
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            mt: 2,
                            p: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 1
                          }}>
                            <img 
                              src={SGSBinaryZippedExample} 
                              alt="Samsung Galaxy Smartwatch Binary Zipped Data Structure Example" 
                              style={{ 
                                maxWidth: '100%', 
                                height: 'auto',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }} 
                            />
                          </Box>
                        </Box>
                      )}

                      {/* Explanation for CSV format */}
                      {fileType === 'csv' && dataSource === 'samsung_galaxy' && (
                        <Box sx={{ 
                          mt: 2, 
                          mb: 3, 
                          p: 3, 
                          bgcolor: 'background.paper', 
                          borderRadius: 2, 
                          border: '1px solid',
                          borderColor: 'primary.light',
                          maxWidth: 600,
                          mx: 'auto'
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Data Format Requirements
                          </Typography>
                          <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                            The uploaded CSV file is expected to contain ENMO data in milligravitational (mg) units. It must include exactly two columns: <strong>'time'</strong> and <strong>'enmo_mg'</strong>.
                          </Typography>
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
                            maxWidth: 600,
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
                          <Box sx={{ 
                            mt: 2, 
                            mb: 3, 
                            p: 3, 
                            bgcolor: 'background.paper', 
                            borderRadius: 2, 
                            border: '1px solid',
                            borderColor: 'primary.main',
                            maxWidth: 600,
                            mx: 'auto'
                          }}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                              Data Format Requirements
                            </Typography>
                            <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                              The uploaded CSV file must contain raw, 1-dimensional time series data (e.g., ENMO) collected from a smartwatch. It should include exactly two columns: <strong>'timestamp'</strong> and <strong>'data'</strong>.
                            </Typography>
                          </Box>
                        </>
                      )}
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
                  {data && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, width: '100%' }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleReset}
                        startIcon={<RefreshIcon />}
                        sx={{ 
                          minWidth: 120,
                          '&:hover': {
                            backgroundColor: 'error.main',
                            color: 'white'
                          }
                        }}
                      >
                        Reset All
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {data?.file_id && !data.data && (
                <Grid item xs={12}>
                  <Card sx={{ p: 3, mb: 3 }}>
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
                                if (/^\d*\.?\d*$/.test(value) || value === "") {
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
                                if (/^\d*\.?\d*$/.test(value) || value === "") {
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
                                if (/^\d*\.?\d*$/.test(value) || value === "") {
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
                                if (/^\d*\.?\d*$/.test(value) || value === "") {
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
                                if (/^\d*\.?\d*$/.test(value) || value === "") {
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
                                if (/^\d*\.?\d*$/.test(value) || value === "") {
                                  handlePreprocessParamChange('wear_window_length', value);
                                }
                              }}
                              inputProps={{ 
                                inputMode: "numeric",
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
                                if (/^\d*\.?\d*$/.test(value) || value === "") {
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
                              onChange={(e, newValue) => setPreprocessParams(prev => ({ ...prev, required_daily_coverage: newValue }))}
                              valueLabelDisplay="auto"
                            />
                            <TextField
                              fullWidth
                              label="Required Daily Coverage (0-1)"
                              type="text"
                              value={preprocessParams.required_daily_coverage}
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, '.');
                                if (/^\d*\.?\d*$/.test(value) || value === "") {
                                  setPreprocessParams(prev => ({ ...prev, required_daily_coverage: value }));
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
                                if (/^\d*\.?\d*$/.test(value) || value === "") {
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
                                if (/^\d*\.?\d*$/.test(value) || value === "") {
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
                                if (/^\d*\.?\d*$/.test(value) || value === "") {
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
                                if (/^\d*\.?\d*$/.test(value) || value === "") {
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
                  </Card>
                </Grid>
              )}

              {error && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
                    <Typography color="error">{error}</Typography>
                  </Paper>
                </Grid>
              )}

              {data?.file_id && !data.data && (
                <Grid item xs={12}>
                  <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Cosinor Age Prediction
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Chronological Age"
                          type="number"
                          value={chronologicalAge}
                          onChange={(e) => setChronologicalAge(e.target.value)}
                          InputProps={{ inputProps: { min: 0, max: 120 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
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
                        </FormControl>
                      </Grid>
                      {data?.data && (
                        <Grid item xs={12} sm={4}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handlePredictAge}
                            disabled={!chronologicalAge || !data}
                            sx={{ height: '100%', width: '100%' }}
                          >
                            Recalculate Age
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </Card>
                </Grid>
              )}
              {data?.file_id && !data.data && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                      onClick={async () => {
                        await handleProcessData();
                        // After processing, if successful, call age prediction
                        if (data?.file_id && chronologicalAge) {
                          try {
                            const response = await fetch(`http://localhost:8000/predict_age/${data.file_id}`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                chronological_age: parseFloat(chronologicalAge),
                                gender: gender
                              })
                            });
                            if (response.ok) {
                              const result = await response.json();
                              setPredictedAge(result.predicted_age);
                            }
                          } catch (err) {
                            setError('Failed to predict Cosinor Age');
                          }
                        }
                      }}
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : 'Process Data'}
                    </Button>
                    {processing && (
                      <Typography variant="body2" color="text.secondary">
                        Processing time: {formatTime(processingTime)}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )}

              {success && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                    <Typography color="success">{success}</Typography>
                  </Paper>
                </Grid>
              )}

              {data?.data && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
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
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {data?.data && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <React.Fragment>
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(76, 175, 80, 0.08)', px: 2, py: 1, borderRadius: 2, cursor: 'pointer' }}
                        onClick={() => setPreprocessDialogOpen(true)}
                        tabIndex={0}
                        role="button"
                        aria-label="Show preprocessing explanation"
                      >
                        <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
                        Data was successfully preprocessed.
                      </Typography>
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(76, 175, 80, 0.08)', px: 2, py: 1, borderRadius: 2 }}
                      >
                        <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
                        Features were successfully computed.
                      </Typography>
                      <Dialog open={preprocessDialogOpen} onClose={() => setPreprocessDialogOpen(false)}>
                        <DialogTitle>Preprocessing Steps</DialogTitle>
                        <DialogContent>
                          <DialogContentText style={{ whiteSpace: 'pre-line' }}>
                            The preprocessing of your data includes:
                            {'\n'}• Resampling to minute-level time grid
                            {'\n'}• Selection of the longest consecutive valid timeframe
                            {'\n'}• Calibration of raw accelerometer data
                          </DialogContentText>
                        </DialogContent>
                      </Dialog>
                    </React.Fragment>
                  </Box>
                </Grid>
              )}

              {/* Cosinor Age Prediction input section moved here */}
              {data?.data && (
                <Grid item xs={12}>
                  <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Cosinor Age Prediction
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Chronological Age"
                          type="number"
                          value={chronologicalAge}
                          onChange={(e) => setChronologicalAge(e.target.value)}
                          InputProps={{ inputProps: { min: 0, max: 120 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
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
                        </FormControl>
                      </Grid>
                      {data?.data && (
                        <Grid item xs={12} sm={4}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handlePredictAge}
                            disabled={!chronologicalAge || !data}
                            sx={{ height: '100%', width: '100%' }}
                          >
                            Recalculate Age
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                    {/* Cosinor Age Prediction Results */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h5" color="primary" gutterBottom>
                        Predicted Cosinor Age: {predictedAge !== null ? predictedAge.toFixed(2) + ' years' : 'N/A'}
                      </Typography>
                      {predictedAge !== null && chronologicalAge && (
                        <Typography variant="body2" color="text.secondary">
                          Difference from Chronological Age: {(predictedAge - parseFloat(chronologicalAge)).toFixed(2)} years
                        </Typography>
                      )}
                    </Box>
                  </Card>
                </Grid>
              )}

              {(() => {
                return data?.data && (
                  <Grid item xs={12}>
                    <Card style={{ marginTop: '20px', padding: '20px' }}>
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
                                    {payload.map((entry, index) => (
                                      <p key={index} style={{ margin: '0', color: entry.color }}>
                                        {`${entry.name}: ${entry.value.toFixed(2)} mg`}
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
                    </Card>
                  </Grid>
                );
              })()}

              {data?.features && data.features.cosinor && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
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
                  </Card>
                </Grid>
              )}
              {data?.features && data.features.nonparam && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
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
                              <Card variant="outlined" sx={{ p: 2 }}>
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
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Card>
                </Grid>
              )}

              {data?.features && data.features.physical_activity && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Physical Activity Features
                      </Typography>
                      <SectionInfoButton section="activity" />
                    </Box>
                    <Grid container spacing={2}>
                      {/* Only show the stacked bar chart for per-day metrics, not the per-day values */}
                      <Grid item xs={12}>
                        <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={(() => {
                                // Extract unique days from data.data
                                const uniqueDays = Array.from(new Set(data.data.map(item => {
                                  const date = new Date(item.TIMESTAMP);
                                  return date.toLocaleDateString('en-CA');
                                })));
                                return uniqueDays.map((dayStr, index) => ({
                                  day: dayStr,
                                  sedentary: data.features.physical_activity.sedentary[index],
                                  light: data.features.physical_activity.light[index],
                                  moderate: data.features.physical_activity.moderate[index],
                                  vigorous: data.features.physical_activity.vigorous[index],
                                }));
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
                              <Bar dataKey="sedentary" stackId="a" fill="#8884d8" name="Sedentary" />
                              <Bar dataKey="light" stackId="a" fill="#82ca9d" name="Light" />
                              <Bar dataKey="moderate" stackId="a" fill="#ffc658" name="Moderate" />
                              <Bar dataKey="vigorous" stackId="a" fill="#ff8042" name="Vigorous" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              )}

              {data?.features && data.features.nonparam && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Sleep Features
                      </Typography>
                      <SectionInfoButton section="sleep" />
                    </Box>
                    {/* Debug logging */}
                    {console.log('Non-parametric features:', data.features.nonparam)}
                    {/* Sleep Metrics Bar Charts */}
                    <Grid container spacing={3}>
                      {['TST', 'WASO', 'PTA', 'NWB', 'SOL', 'SRI'].map((metric) => {
                        // Try to get the value from sleep, then nonparam
                        const value = (data.features.sleep && data.features.sleep[metric]) || (data.features.nonparam && data.features.nonparam[metric]);
                        if (!value || !Array.isArray(value)) return null;
                        return (
                          <Grid item xs={12} key={metric}>
                            <Card variant="outlined" sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1">
                                  {metricDescriptions[metric.toLowerCase()]?.title || metric}
                                </Typography>
                                <SectionInfoButton metric={metric} />
                              </Box>
                              <Box sx={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={value.map((v, index) => ({
                                      day: getDateForIndex(metric, index, data),
                                      [metric]: v
                                    }))}
                                    margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis label={{
                                      value:
                                        metric === 'PTA' ? 'Percentage (%)' :
                                        metric === 'NWB' ? 'Number of Bouts' :
                                        metric === 'SRI' ? 'Index' :
                                        'Minutes',
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
                                                } else if (entry.name === 'SRI') {
                                                  value = value.toFixed(2);
                                                  unit = '';
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
                                    <Bar dataKey={metric} fill="#8884d8" name={metric} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </Box>
                            </Card>
                          </Grid>
                        );
                      })}
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
                              <Card variant="outlined" sx={{ p: 2 }}>
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
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Card>
                </Grid>
              )}
            </Grid>
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
                      This project was developed by Jinjoo Shim (Harvard University, formerly at ETH Zurich) and Jacob Hunecke (ETH Zurich) as part of ADAMMA's commitment to creating open-source tools for health innovation.
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Learn more about ADAMMA at: <Link href="https://adamma.ethz.ch/" target="_blank" rel="noopener noreferrer">adamma.ethz.ch</Link>
                    </Typography>
                  </Box>

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

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      Contact
                    </Typography>
                    <Typography variant="body1" paragraph>
                      For support or inquiries, please contact us at: <Link href="mailto:jinjooshim@hsph.harvard.edu">jinjooshim@hsph.harvard.edu</Link> or <Link href="mailto:jhunecke@student.ethz.ch">jhunecke@student.ethz.ch</Link>
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {currentTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 4 }}>
                  <Typography variant="h4" gutterBottom>
                    About CosinorLab
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Advanced Analysis of Accelerometer Data
                  </Typography>
                  
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      Our Mission
                    </Typography>
                    <Typography variant="body1" paragraph>
                      CosinorLab is dedicated to advancing the analysis of accelerometer data through sophisticated cosinor analysis techniques. Our platform enables researchers and healthcare professionals to gain deeper insights into activity patterns and biological rhythms.
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      Key Features
                    </Typography>
                    <ul>
                      <li><Typography variant="body1">Advanced cosinor analysis of accelerometer data</Typography></li>
                      <li><Typography variant="body1">Interactive visualization of activity patterns</Typography></li>
                      <li><Typography variant="body1">Biological age prediction based on activity rhythms</Typography></li>
                      <li><Typography variant="body1">Comprehensive data processing and analysis tools</Typography></li>
                    </ul>
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      Contact
                    </Typography>
                    <Typography variant="body1" paragraph>
                      For questions, feedback, or support, please contact us at:
                    </Typography>
                    <Typography variant="body1">
                      Email: support@cosinorlab.com
                    </Typography>
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
              • Data Type: <strong>Accelerometer</strong>
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/sample_data2.csv';
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