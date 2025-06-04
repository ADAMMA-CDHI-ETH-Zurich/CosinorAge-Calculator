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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, BarChart, Bar } from 'recharts';
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

            {data?.data && (
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
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            )}

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
                          <Typography variant="subtitle1" gutterBottom>
                            Cosinor Analysis
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(data.features.cosinor).map(([key, value]) => (
                              <Grid item xs={6} key={key}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Typography>
                                <Typography variant="body1">
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
                          <Typography variant="subtitle1" gutterBottom>
                            Non-Parametric Analysis
                          </Typography>
                          <Grid container spacing={2}>
                            {console.log('Nonparametric feature keys:', Object.keys(data.features.nonparam))}
                            {Object.entries(data.features.nonparam).map(([key, value]) => (
                              key.toLowerCase() === 'l5' ? null : (
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
                                                const m10StartDate = new Date(`${dayStr}T${m10Start}`);
                                                const l5StartDate = new Date(`${dayStr}T${l5Start}`);
                                                return (
                                                  <Grid item xs={12} key={dayStr}>
                                                    <Card variant="outlined" sx={{ p: 2 }}>
                                                      <Typography variant="subtitle1" gutterBottom>
                                                        {new Date(dayStr).toLocaleDateString()}
                                                      </Typography>
                                                      <ResponsiveContainer width="100%" height={300}>
                                                        <LineChart
                                                          data={dayData}
                                                          margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                                                        >
                                                          <CartesianGrid strokeDasharray="3 3" />
                                                          <XAxis
                                                            dataKey="TIMESTAMP"
                                                            tickFormatter={(timestamp) => {
                                                              const date = new Date(timestamp);
                                                              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                            }}
                                                          />
                                                          <YAxis label={{ value: 'ENMO (mg)', angle: -90, position: 'insideLeft' }} />
                                                          <Tooltip
                                                            labelFormatter={(timestamp) => {
                                                              const date = new Date(timestamp);
                                                              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                            }}
                                                          />
                                                          <Legend />
                                                          <Line
                                                            type="monotone"
                                                            dataKey="ENMO"
                                                            stroke="#8884d8"
                                                            dot={false}
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
                                      ) : key.toLowerCase() === 'm10_start' || key.toLowerCase() === 'l5_start' ? (
                                        value.map((val, index) => (
                                          <Typography key={index} variant="body2" sx={{ pl: 2 }}>
                                            Day {index + 1}: {typeof val === 'number' ? val.toFixed(4) : val}
                                          </Typography>
                                        ))
                                      ) : key.toLowerCase() === 'ra' && Array.isArray(value) ? (
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
                          <Typography variant="subtitle1" gutterBottom>
                            Physical Activity Metrics
                          </Typography>
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
                          <Typography variant="subtitle1" gutterBottom>
                            Sleep Metrics
                          </Typography>
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