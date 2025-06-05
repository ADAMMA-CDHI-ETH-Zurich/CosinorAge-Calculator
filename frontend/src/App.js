import React, { useState, useEffect, useRef } from 'react';
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
  useTheme,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceArea, BarChart, Bar } from 'recharts';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import { styled } from '@mui/material/styles';
import UploadIcon from '@mui/icons-material/Upload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Create a modern theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const DirectoryTree = ({ data, onSelect }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (path) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderTree = (node, path = '') => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    
    if (node.type === 'file') {
      return (
        <ListItem
          key={currentPath}
          sx={{ pl: path.split('/').length * 2 }}
        >
          <ListItemIcon>
            <InsertDriveFileIcon />
          </ListItemIcon>
          <ListItemText primary={node.name} />
        </ListItem>
      );
    }

    return (
      <React.Fragment key={currentPath}>
        <ListItem
          sx={{ pl: path.split('/').length * 2 }}
        >
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary={node.name} />
          <IconButton onClick={() => toggleExpand(currentPath)}>
            {expanded[currentPath] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </ListItem>
        <Collapse in={expanded[currentPath]} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children.map(child => renderTree(child, currentPath))}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  return (
    <List>
      {renderTree(data)}
    </List>
  );
};

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
    description: 'The time of day (in minutes) when the peak of the fitted cosine curve occurs.'
  },
  // Nonparametric
  is: {
    title: 'Interdaily Stability (IS)',
    description: 'A measure of the consistency of activity patterns between days. Ranges from 0 (random) to 1 (perfectly stable). Higher values indicate more regular daily rhythms.'
  },
  iv: {
    title: 'Intradaily Variability (IV)',
    description: 'A measure of fragmentation of activity within a day. It is greater than 0 - values close to 0 reflect a smooth pattern whereas greater values indicate more transitions between rest and activity. Vlaues below 2 are considered as being acceptable.'
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
    description: 'Total hours of sleep obtained per night.'
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
  // For IV, add a red marker at value 2
  const showRedMarker = label === 'Intradaily Variability (IV)';
  const markerLinePercent = showRedMarker ? ((2 - min) / (max - min)) * 100 : null;
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
        {/* Red marker line for IV at value 2 */}
        {showRedMarker && (
          <Box sx={{
            position: 'absolute',
            top: 16,
            left: `calc(${markerLinePercent}% - 2px)`,
            width: 4,
            height: 32,
            bgcolor: 'red',
            zIndex: 3,
            borderRadius: 1,
          }} />
        )}
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
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [directoryTree, setDirectoryTree] = useState(null);
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('appData');
    return savedData ? JSON.parse(savedData) : null;
  });
  const [extracting, setExtracting] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [dataSource, setDataSource] = useState(() => {
    return localStorage.getItem('dataSource') || '';
  });
  const [chronologicalAge, setChronologicalAge] = useState('');
  const [gender, setGender] = useState('invariant');
  const [predictedAge, setPredictedAge] = useState(null);
  const theme = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [preprocessDialogOpen, setPreprocessDialogOpen] = useState(false);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (data) {
      localStorage.setItem('appData', JSON.stringify(data));
    }
  }, [data]);

  // Save dataSource to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dataSource', dataSource);
  }, [dataSource]);

  // Clear localStorage when file is removed
  const clearState = async () => {
    try {
      // Clear frontend state
      localStorage.removeItem('appData');
      localStorage.removeItem('dataSource');
      setData(null);
      setDataSource('');
      setPredictedAge(null);
      setChronologicalAge('');
      setGender('invariant');
      setError(null);
      setSuccess(null);
      setDirectoryTree(null);
      setSelectedDirectory(null);
      setProcessing(false);
      setProcessingTime(0);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      // Clear backend state if we have a file_id
      if (data?.file_id) {
        const response = await fetch(`http://localhost:8000/clear_state/${data.file_id}`, {
          method: 'POST',
        });
        if (!response.ok) {
          console.error('Failed to clear backend state');
        }
      }
    } catch (error) {
      console.error('Error clearing state:', error);
    }
  };

  // Function to start the timer
  const startTimer = () => {
    setProcessingTime(0);
    const interval = setInterval(() => {
      setProcessingTime(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  // Function to stop the timer
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // Format time in MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload file');
      }

      const result = await response.json();
      setData(result);
      setSuccess('File uploaded successfully. Click "Process Data" to continue.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProcessData = async () => {
    if (!data?.file_id) {
      setError('No file uploaded');
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
      
      // Then process the data
      const processResponse = await fetch(`http://localhost:8000/process/${data.file_id}`, {
        method: 'POST',
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.detail || 'Failed to process data');
      }

      const processResult = await processResponse.json();
      setData(prev => ({ 
        ...prev, 
        ...extractResult,
        ...processResult,
        data: processResult.data,
        extracted: true
      }));
      setSuccess('Data processed successfully. Plot is now available.');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
      stopTimer(); // Stop the timer
    }
  };

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

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
      setSuccess('Age prediction completed successfully');
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              GalaxyWatch Data Analyzer
            </Typography>
            {data && (
              <Button 
                color="inherit" 
                onClick={clearState}
                sx={{ ml: 2 }}
              >
                Reset
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
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
                  Select Data Source
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="data-source-label">Data Source</InputLabel>
                  <Select
                    labelId="data-source-label"
                    value={dataSource}
                    label="Data Source"
                    onChange={(e) => setDataSource(e.target.value)}
                    sx={{ minWidth: 300 }}
                    disabled={!!data?.file_id}
                  >
                    <MenuItem value="samsung_galaxy">Samsung Galaxy Smartwatch - Binary (Zipped)</MenuItem>
                  </Select>
                </FormControl>
                {dataSource && (
                  <>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                      Upload your ZIP file containing the Samsung Galaxy Smartwatch data
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<UploadIcon />}
                      sx={{ 
                        minWidth: 200,
                        py: 1,
                        px: 3,
                        borderRadius: 2
                      }}
                      disabled={!!data?.file_id}
                      tabIndex={-1}
                    >
                      Upload File
                      <input
                        type="file"
                        hidden
                        accept=".zip"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                      />
                    </Button>
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
                  </>
                )}
              </Paper>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
                  <Typography color="error">{error}</Typography>
                </Paper>
              </Grid>
            )}

            {data?.file_id && !data.data && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                    onClick={handleProcessData}
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
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
            {/* Disclaimer below Raw Data Information */}
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

            {(() => {
              if (data?.data) {
                console.log('[ENMO Plot Debug] Unique wear values:', Array.from(new Set(data.data.map(d => d.wear))));
              }
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
                          active={true}
                          cursor={{ stroke: '#ccc', strokeWidth: 1 }}
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
                          for (let i = 1; i <= data.data.length; i++) {
                            const point = data.data[i];
                            if (i === data.data.length || point?.wear !== currentWear) {
                              const segEnd = data.data[i - 1]?.TIMESTAMP;
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
                          {typeof value === 'number' ? value.toFixed(4) : value}
                          {key === 'mesor' || key === 'amplitude' ? ' mg' : 
                            key === 'acrophase' ? ' radians' :
                            key === 'acrophase_time' ? ' minutes' : ''}
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
                    {console.log('Nonparametric feature keys:', Object.keys(data.features.nonparam))}
                    {Object.entries(data.features.nonparam).map(([key, value]) => (
                      ['l5', 'm10_start', 'l5_start'].includes(key.toLowerCase()) ? null : (
                        <Grid item xs={12} key={key}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              {key === 'M10' ? 'L5 & M10' : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Typography>
                            <SectionInfoButton metric={key} />
                          </Box>
                          {/* IS and IV as horizontal scale */}
                          {(['is', 'iv'].includes(key.toLowerCase()) && typeof value === 'number') ? (
                            <HorizontalScale
                              value={value}
                              min={key.toLowerCase() === 'is' ? 0 : 0}
                              max={key.toLowerCase() === 'is' ? 1 : 3}
                              color={key.toLowerCase() === 'is' ? '#1976d2' : '#388e3c'}
                              label={key.toLowerCase() === 'is' ? 'IS Value' : 'Intradaily Variability (IV)'}
                            />
                          ) : Array.isArray(value) ? (
                            <>
                              {key === 'M10' && data.features.nonparam.M10 && data.features.nonparam.L5 ? (
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
                                          active={true}
                                          cursor={{ stroke: '#ccc', strokeWidth: 1 }}
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
                                                      value = value.toFixed(1);
                                                      unit = ' hours';
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
                                  {/* Daily ENMO Time Series with M10 and L5 Periods */}
                                  <Box sx={{ mt: 4 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Daily ENMO Time Series with M10 and L5 Periods
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
                                        const m10StartDate = m10Start && m10Start.includes('T')
                                          ? new Date(m10Start)
                                          : new Date(`${dayStr}T${m10Start}`);
                                        const l5StartDate = l5Start && l5Start.includes('T')
                                          ? new Date(l5Start)
                                          : new Date(`${dayStr}T${l5Start}`);
                                        // Add a 'timestampNum' property for numeric x-axis and align cosinor_fitted
                                        const dayDataWithNum = dayData.map(item => {
                                          const globalIndex = data.data.findIndex(d => d.TIMESTAMP === item.TIMESTAMP);
                                          const globalData = globalIndex !== -1 ? data.data[globalIndex] : null;
                                          if (dayIndex === 0) {
                                            console.log('[Debug] Global data point:', globalData);
                                            console.log('[Debug] Cosinor fitted value:', globalData ? globalData.cosinor_fitted : null);
                                          }
                                          return {
                                            ...item,
                                            timestampNum: new Date(item.TIMESTAMP).getTime(),
                                            cosinor_fitted: globalData ? globalData.cosinor_fitted : null
                                          };
                                        });
                                        const dayDataWithNumSorted = [...dayDataWithNum].sort((a, b) => a.timestampNum - b.timestampNum);
                                        // Check if m10StartDate and l5StartDate are valid
                                        const m10StartValid = m10StartDate instanceof Date && !isNaN(m10StartDate);
                                        const l5StartValid = l5StartDate instanceof Date && !isNaN(l5StartDate);
                                        console.log('[ENMO Plot Debug] Day:', dayStr, 'M10 Start:', m10Start, 'M10 Date:', m10StartDate, 'M10 ms:', m10StartDate.getTime());
                                        console.log('[ENMO Plot Debug] Day:', dayStr, 'L5 Start:', l5Start, 'L5 Date:', l5StartDate, 'L5 ms:', l5StartDate.getTime());
                                        if (dayIndex === 0) {
                                          console.log('[ENMO Plot Debug] dayDataWithNumSorted:', dayDataWithNumSorted);
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
                                                  <YAxis 
                                                    yAxisId="right"
                                                    orientation="right"
                                                    label={{ value: 'Cosinor Fit (mg)', angle: 90, position: 'insideRight' }} 
                                                  />                                                          <RechartsTooltip
                                                    active={true}
                                                    cursor={{ stroke: '#ccc', strokeWidth: 1 }}
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
                                                                value = value.toFixed(1);
                                                                unit = ' hours';
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
                                                    x2={new Date(m10StartDate.getTime() + 10 * 60 * 60 * 1000).getTime()}
                                                    fill="#8884d8"
                                                    fillOpacity={0.1}
                                                    label="M10"
                                                    yAxisId="left"
                                                  />
                                                  {/* L5 Period Band */}
                                                  <ReferenceArea
                                                    x1={l5StartDate.getTime()}
                                                    x2={new Date(l5StartDate.getTime() + 5 * 60 * 60 * 1000).getTime()}
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
                                </>
                              ) : (['is', 'iv'].includes(key.toLowerCase())) ? (
                                <Box sx={{ width: '100%', height: 200, mt: 2 }}>
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
                                      <YAxis label={{ value: key.toUpperCase(), angle: -90, position: 'insideLeft' }} />
                                      <RechartsTooltip 
                                        active={true}
                                        cursor={{ stroke: '#ccc', strokeWidth: 1 }}
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
                                                    value = value.toFixed(1);
                                                    unit = ' hours';
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
                                      <Bar dataKey={key} fill={key.toLowerCase() === 'is' ? '#8884d8' : '#ffc658'} name={key.toUpperCase()} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </Box>
                              ) : key.toLowerCase() === 'm10_start' || key.toLowerCase() === 'l5_start' ? null
                              : key.toLowerCase() === 'ra' && Array.isArray(value) ? (
                                (() => { console.log('RA key:', key, 'RA value:', value); return null; })() ||
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
                                        active={true}
                                        cursor={{ stroke: '#ccc', strokeWidth: 1 }}
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
                                                    value = value.toFixed(1);
                                                    unit = ' hours';
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
                              ) : (
                                value.map((val, index) => (
                                  <Typography key={index} variant="body2" sx={{ pl: 2 }}>
                                    {getDateForIndex(key, index, data)}: {typeof val === 'number' ? val.toFixed(4) : val}
                                  </Typography>
                                ))
                              )}
                            </>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {/* Add bar chart for SRI, IS, IV, RA if present as a summary value */}
                              {key.toLowerCase() === 'sri' && (
                                <Box sx={{ width: 120, height: 60 }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      data={[{ name: key, value: value }]}
                                      layout="horizontal"
                                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                                    >
                                      <XAxis type="category" dataKey="name" hide />
                                      <YAxis type="number" domain={[0, 1]} hide />
                                      <RechartsTooltip 
                                        active={true}
                                        cursor={{ stroke: '#ccc', strokeWidth: 1 }}
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
                                                    value = value.toFixed(1);
                                                    unit = ' hours';
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
                                      <Bar dataKey="value" fill="#82ca9d" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </Box>
                              )}
                              {key.toLowerCase() === 'is' && (
                                <Box sx={{ width: 60, height: 120 }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      data={[{ name: key, value: value }]}
                                      layout="vertical"
                                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                                    >
                                      <XAxis type="number" domain={[0, 1]} hide />
                                      <YAxis type="category" dataKey="name" hide />
                                      <RechartsTooltip 
                                        active={true}
                                        cursor={{ stroke: '#ccc', strokeWidth: 1 }}
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
                                                    value = value.toFixed(1);
                                                    unit = ' hours';
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
                                      <Bar dataKey="value" fill="#8884d8" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </Box>
                              )}
                              {key.toLowerCase() === 'iv' && (
                                <Box sx={{ width: 60, height: 120 }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      data={[{ name: key, value: value }]}
                                      layout="vertical"
                                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                                    >
                                      <XAxis type="number" domain={[0, 2]} hide />
                                      <YAxis type="category" dataKey="name" hide />
                                      <RechartsTooltip 
                                        active={true}
                                        cursor={{ stroke: '#ccc', strokeWidth: 1 }}
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
                                                    value = value.toFixed(1);
                                                    unit = ' hours';
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
                                      <Bar dataKey="value" fill="#ffc658" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Grid>
                      )
                    ))}
                  </Grid>
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
                              active={true}
                              cursor={{ stroke: '#ccc', strokeWidth: 1 }}
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
                                          value = value.toFixed(1);
                                          unit = ' hours';
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

            {data?.features && data.features.sleep && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Sleep Features
                    </Typography>
                    <SectionInfoButton section="sleep" />
                  </Box>
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
                                    active={true}
                                    cursor={{ stroke: '#ccc', strokeWidth: 1 }}
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
                                                value = value.toFixed(1);
                                                unit = ' hours';
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
                  <Grid container spacing={2}>
                    {Object.entries(data.features.sleep).map(([key, value]) => (
                      <Grid item xs={12} key={key}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                          <SectionInfoButton metric={key} />
                        </Box>
                        {/* SRI as horizontal scale */}
                        {key.toLowerCase() === 'sri' && typeof value === 'number' ? (
                          <HorizontalScale
                            value={value / 100}
                            min={0}
                            max={1}
                            color="#82ca9d"
                            label="Sleep Regularity Index (SRI)"
                          />
                        ) : Array.isArray(value) ? (
                          <>
                            {/* Only show chart for TST, WASO, PTA, NWB, SOL, not the per-day values */}
                            {['TST', 'WASO', 'PTA', 'NWB', 'SOL'].includes(key) ? (
                              <Box sx={{ width: '100%', height: 200, mt: 2 }}>
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
                                    <YAxis label={{ value: key === 'TST' ? 'Hours' : key === 'PTA' ? 'Percent' : 'Minutes', angle: -90, position: 'insideLeft' }} />
                                    <RechartsTooltip 
                                      active={true}
                                      cursor={{ stroke: '#ccc', strokeWidth: 1 }}
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
                                                  value = value.toFixed(1);
                                                  unit = ' hours';
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
                                    <Bar dataKey={key} fill={
                                      key === 'TST' ? '#8884d8' :
                                      key === 'WASO' ? '#82ca9d' :
                                      key === 'PTA' ? '#ffc658' :
                                      key === 'NWB' ? '#ff8042' :
                                      '#0088fe'
                                    } name={key} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </Box>
                            ) : (
                              value.map((val, index) => (
                                <Typography key={index} variant="body2" sx={{ pl: 2 }}>
                                  {getDateForIndex(key, index, data)}: {typeof val === 'number' ? val.toFixed(4) : val}
                                </Typography>
                              ))
                            )}
                          </>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* Add bar chart for SRI if present as a summary value in sleep metrics */}
                            {key.toLowerCase() === 'sri' && (
                              <Box sx={{ width: 120, height: 60 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={[{ name: key, value: value }]}
                                    layout="horizontal"
                                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                                  >
                                    <XAxis type="category" dataKey="name" hide />
                                    <YAxis type="number" domain={[0, 1]} hide />
                                    <RechartsTooltip 
                                      active={true}
                                      cursor={{ stroke: '#ccc', strokeWidth: 1 }}
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
                                                  value = value.toFixed(1);
                                                  unit = ' hours';
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
                                    <Bar dataKey="value" fill="#82ca9d" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </Card>
              </Grid>
            )}

            {data?.data && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
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
                      <Grid item xs={12} sm={4}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handlePredictAge}
                          disabled={!chronologicalAge || !data?.data}
                          fullWidth
                        >
                          Predict Age
                        </Button>
                      </Grid>
                      {predictedAge !== null && (
                        <Grid item xs={12}>
                          <Typography variant="h6" color="primary" gutterBottom>
                            Predicted Cosinor Age: {predictedAge.toFixed(2)} years
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Difference from Chronological Age: {(predictedAge - parseFloat(chronologicalAge)).toFixed(2)} years
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 