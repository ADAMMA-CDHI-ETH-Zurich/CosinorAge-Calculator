import React, { useState, useEffect } from 'react';
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
  InputLabel
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, BarChart, Bar, ReferenceLine } from 'recharts';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

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
  cosinor: {
    title: 'Cosinor Analysis',
    description: 'Cosinor analysis fits a cosine curve to the time series to estimate circadian rhythm parameters.\n\nMesor: Midline Estimating Statistic Of Rhythm (mean value, mg)\nAmplitude: Half the difference between peak and trough (mg)\nAcrophase: Time of peak (radians, minutes)'
  },
  nonparam: {
    title: 'Non-Parametric Analysis',
    description: 'Non-parametric metrics describe rhythm regularity and fragmentation.\n\nIS: Interdaily Stability (0-1, higher = more stable)\nIV: Intradaily Variability (0-2, higher = more fragmented)\nRA: Relative Amplitude (0-1, higher = more robust)\nSRI: Sleep Regularity Index (0-1, higher = more regular)'
  },
  activity: {
    title: 'Physical Activity Metrics',
    description: 'Summarizes time spent in different activity levels per day.\n\nSedentary, Light, Moderate, Vigorous: Minutes per day in each category.'
  },
  sleep: {
    title: 'Sleep Metrics',
    description: 'Sleep metrics per day.\n\nTST: Total Sleep Time (hours)\nWASO: Wake After Sleep Onset (minutes)\nPTA: Percent Time Asleep (%)\nNWB: Number of Wake Bouts\nSOL: Sleep Onset Latency (minutes)\nSRI: Sleep Regularity Index (0-1)'
  }
};

function SectionInfoButton({ section }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <IconButton size="small" onClick={() => setOpen(true)} aria-label={`Info about ${metricDescriptions[section].title}`}> 
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{metricDescriptions[section].title}</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ whiteSpace: 'pre-line' }}>
            {metricDescriptions[section].description}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
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
  const theme = useTheme();

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
  const clearState = () => {
    localStorage.removeItem('appData');
    localStorage.removeItem('dataSource');
    setData(null);
    setDataSource('');
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
            {!data?.file_id && (
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
                    mx: 'auto'
                  }}
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
                      >
                        Upload File
                        <input
                          type="file"
                          hidden
                          accept=".zip"
                          onChange={handleFileUpload}
                        />
                      </Button>
                    </>
                  )}
                </Paper>
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
                      GalaxyWatch Data Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Data Source
                        </Typography>
                        <Typography variant="body1">{data.filename || 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
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

            {(() => {
              if (data?.data) {
                console.log('[ENMO Plot Debug] Unique wear values:', Array.from(new Set(data.data.map(d => d.wear))));
              }
              return data?.data && (
                <Grid item xs={12}>
                  <Card style={{ marginTop: '20px', padding: '20px' }}>
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
                        <Tooltip 
                          labelFormatter={(timestamp) => {
                            const date = new Date(timestamp);
                            return date.toLocaleDateString();
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
                        {/* Custom legend for wear/non-wear shading */}
                        <g>
                          <rect x={30} y={2} width={18} height={18} fill="#4caf50" fillOpacity={0.3} stroke="#4caf50" strokeOpacity={0.5} />
                          <text x={55} y={16} fontSize={14} fill="#333">wear</text>
                          <rect x={110} y={2} width={18} height={18} fill="#ff5252" fillOpacity={0.3} stroke="#ff5252" strokeOpacity={0.5} />
                          <text x={135} y={16} fontSize={14} fill="#333">non-wear</text>
                        </g>
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>
              );
            })()}

            {data?.features && (
              <Grid item xs={12}>
                <Card style={{ marginTop: '20px', padding: '20px' }}>
                  <Typography variant="h6" gutterBottom>
                    Extracted Features
                  </Typography>
                  <Grid container spacing={3} direction="column">
                    {/* Cosinor Features */}
                    {data.features.cosinor && (
                      <Grid item xs={12}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Cosinor Analysis
                            </Typography>
                            <SectionInfoButton section="cosinor" />
                          </Box>
                          <Grid container spacing={2} direction="row" wrap="nowrap">
                            {Object.entries(data.features.cosinor).map(([key, value]) => (
                              <Grid item xs key={key} zeroMinWidth>
                                <Typography variant="subtitle2" color="text.secondary" noWrap>
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Typography>
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

                    {/* Nonparametric Features */}
                    {data.features.nonparam && (
                      <Grid item xs={12}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Non-Parametric Analysis
                            </Typography>
                            <SectionInfoButton section="nonparam" />
                          </Box>
                          <Grid container spacing={2}>
                            {console.log('Nonparametric feature keys:', Object.keys(data.features.nonparam))}
                            {Object.entries(data.features.nonparam).map(([key, value]) => (
                              ['l5', 'm10_start', 'l5_start'].includes(key.toLowerCase()) ? null : (
                                <Grid item xs={12} key={key}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Typography>
                                  {Array.isArray(value) ? (
                                    <>
                                      {key === 'M10' && data.features.nonparam.M10 && data.features.nonparam.L5 ? (
                                        <>
                                          <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                              <BarChart
                                                data={data.features.nonparam.M10.map((m10, index) => ({
                                                  day: `Day ${index + 1}`,
                                                  M10: m10,
                                                  L5: data.features.nonparam.L5[index]
                                                }))}
                                                margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                              >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="day" />
                                                <YAxis label={{ value: 'ENMO (mg)', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="M10" fill="#8884d8" name="M10" />
                                                <Bar dataKey="L5" fill="#82ca9d" name="L5" />
                                              </BarChart>
                                            </ResponsiveContainer>
                                          </Box>
                                          {/* Daily ENMO Time Series with M10 and L5 Periods */}
                                          <Box sx={{ mt: 4 }}>
                                            <Typography variant="h6" gutterBottom>
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
                                                // Add two random reference lines at 10:00 AM and 6:00 PM
                                                const randomTime1 = new Date(`${dayStr}T10:00:00`).getTime();
                                                const randomTime2 = new Date(`${dayStr}T18:00:00`).getTime();
                                                // Reference line at 5:00 AM
                                                const fiveAM = new Date(`${dayStr}T05:00:00`).getTime();
                                                // Add a 'timestampNum' property for numeric x-axis
                                                const dayDataWithNum = dayData.map(item => ({ ...item, timestampNum: new Date(item.TIMESTAMP).getTime() }));
                                                // Sort by timestampNum
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
                                                      <Typography variant="subtitle1" gutterBottom>
                                                        {new Date(dayStr).toLocaleDateString()}
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
                                                          <YAxis label={{ value: 'ENMO (mg)', angle: -90, position: 'insideLeft' }} />
                                                          <Tooltip
                                                            labelFormatter={(timestampNum) => {
                                                              const date = new Date(timestampNum);
                                                              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                            }}
                                                          />
                                                          <Legend />
                                                          <Line
                                                            type="monotone"
                                                            dataKey="ENMO"
                                                            stroke="#8884d8"
                                                            dot={false}
                                                            isAnimationActive={false}
                                                          />
                                                          {/* M10 Period Band */}
                                                          <ReferenceArea
                                                            x1={m10StartDate.getTime()}
                                                            x2={new Date(m10StartDate.getTime() + 10 * 60 * 60 * 1000).getTime()}
                                                            fill="#8884d8"
                                                            fillOpacity={0.1}
                                                            label="M10"
                                                          />
                                                          {/* L5 Period Band */}
                                                          <ReferenceArea
                                                            x1={l5StartDate.getTime()}
                                                            x2={new Date(l5StartDate.getTime() + 5 * 60 * 60 * 1000).getTime()}
                                                            fill="#82ca9d"
                                                            fillOpacity={0.1}
                                                            label="L5"
                                                          />
                                                          {m10StartValid && (
                                                            <ReferenceLine
                                                              x={m10StartDate.getTime()}
                                                              stroke="#8884d8"
                                                              strokeDasharray="3 3"
                                                              label={{ value: 'M10 Start', position: 'top', fill: '#8884d8', fontSize: 12 }}
                                                            />
                                                          )}
                                                          {l5StartValid && (
                                                            <ReferenceLine
                                                              x={l5StartDate.getTime()}
                                                              stroke="#82ca9d"
                                                              strokeDasharray="3 3"
                                                              label={{ value: 'L5 Start', position: 'top', fill: '#82ca9d', fontSize: 12 }}
                                                            />
                                                          )}
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
                                                day: `Day ${index + 1}`,
                                                [key]: v
                                              }))}
                                              margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                            >
                                              <CartesianGrid strokeDasharray="3 3" />
                                              <XAxis dataKey="day" />
                                              <YAxis label={{ value: key.toUpperCase(), angle: -90, position: 'insideLeft' }} />
                                              <Tooltip />
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
                                                day: `Day ${index + 1}`,
                                                RA: v
                                              }))}
                                              margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                            >
                                              <CartesianGrid strokeDasharray="3 3" />
                                              <XAxis dataKey="day" />
                                              <YAxis label={{ value: 'RA', angle: -90, position: 'insideLeft' }} />
                                              <Tooltip />
                                              <Bar dataKey="RA" fill="#0088fe" name="RA" />
                                            </BarChart>
                                          </ResponsiveContainer>
                                        </Box>
                                      ) : (
                                        value.map((val, index) => (
                                          <Typography key={index} variant="body2" sx={{ pl: 2 }}>
                                            Day {index + 1}: {typeof val === 'number' ? val.toFixed(4) : val}
                                          </Typography>
                                        ))
                                      )}
                                    </>
                                  ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                      <Typography variant="body1">
                                        {typeof value === 'number' ? value.toFixed(4) : value}
                                      </Typography>
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
                                              <Tooltip />
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
                                              <Tooltip />
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
                                              <Tooltip />
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

                    {/* Physical Activity Features */}
                    {data.features.physical_activity && (
                      <Grid item xs={12}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Physical Activity Metrics
                            </Typography>
                            <SectionInfoButton section="activity" />
                          </Box>
                          <Grid container spacing={2}>
                            {/* Only show the stacked bar chart for per-day metrics, not the per-day values */}
                            <Grid item xs={12}>
                              <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={data.features.physical_activity.sedentary.map((_, index) => ({
                                      day: `Day ${index + 1}`,
                                      sedentary: data.features.physical_activity.sedentary[index],
                                      light: data.features.physical_activity.light[index],
                                      moderate: data.features.physical_activity.moderate[index],
                                      vigorous: data.features.physical_activity.vigorous[index]
                                    }))}
                                    margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
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

                    {/* Sleep Features */}
                    {data.features.sleep && (
                      <Grid item xs={12}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Sleep Metrics
                            </Typography>
                            <SectionInfoButton section="sleep" />
                          </Box>
                          <Grid container spacing={2}>
                            {Object.entries(data.features.sleep).map(([key, value]) => (
                              <Grid item xs={12} key={key}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Typography>
                                {Array.isArray(value) ? (
                                  <>
                                    {/* Only show chart for TST, WASO, PTA, NWB, SOL, not the per-day values */}
                                    {['TST', 'WASO', 'PTA', 'NWB', 'SOL'].includes(key) ? (
                                      <Box sx={{ width: '100%', height: 200, mt: 2 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                          <BarChart
                                            data={value.map((v, index) => ({
                                              day: `Day ${index + 1}`,
                                              [key]: key === 'PTA' ? v : key === 'TST' ? v / 60 : v
                                            }))}
                                            margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                          >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis label={{ value: key === 'TST' ? 'Hours' : key === 'PTA' ? 'Percent' : 'Minutes', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
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
                                          Day {index + 1}: {typeof val === 'number' ? val.toFixed(4) : val}
                                        </Typography>
                                      ))
                                    )}
                                  </>
                                ) : (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body1">
                                      {typeof value === 'number' ? value.toFixed(4) : value}
                                    </Typography>
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
                                            <Tooltip />
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
                  </Grid>
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