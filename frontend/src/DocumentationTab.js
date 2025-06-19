import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  MenuBook as MenuBookIcon,
  Science as ScienceIcon,
  PlayArrow as PlayArrowIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';

const DocumentationTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('overview');
  const [expandedAccordion, setExpandedAccordion] = useState('panel1');

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const documentationSections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <MenuBookIcon />,
      description: 'Introduction to CosinorLab and its capabilities',
      content: `
        CosinorLab is an advanced platform for analyzing accelerometer data using sophisticated cosinor analysis techniques. 
        Our platform enables researchers and healthcare professionals to gain deeper insights into activity patterns and biological rhythms.
        
        Key Features:
        • Advanced cosinor analysis of accelerometer data
        • Interactive visualization of activity patterns
        • Biological age prediction based on activity rhythms
        • Comprehensive data processing and analysis tools
      `
    },
    {
      id: 'installation',
      title: 'Installation',
      icon: <ScienceIcon />,
      description: 'How to install and set up CosinorLab',
      content: `
        Prerequisites:
        • Python >= 3.10
        • pip (Python package installer)
        • git
        
        Installation Steps:
        1. Clone the Repository
           git clone https://github.com/yourusername/cosinorage.git
           cd cosinorage
        
        2. Set Up Virtual Environment
           python -m venv venv
           source venv/bin/activate  # On Windows: venv\\Scripts\\activate
        
        3. Install Dependencies
           pip install --upgrade pip
           pip install -r requirements.txt
        
        4. Install the Package
           pip install -e .
      `
    },
    {
      id: 'usage',
      title: 'Usage Guide',
      icon: <PlayArrowIcon />,
      description: 'How to use the platform effectively',
      content: `
        Getting Started:
        1. Upload your accelerometer data file (ZIP or CSV format)
        2. Select appropriate data source and file type
        3. Configure preprocessing parameters if needed
        4. Process your data to extract features
        5. View results and visualizations
        6. Optionally predict biological age
        
        Data Formats Supported:
        • Samsung Galaxy Smartwatch binary data (ZIP)
        • CSV files with accelerometer data
        • Various sampling frequencies supported
      `
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: <CodeIcon />,
      description: 'Technical API documentation',
      content: `
        REST API Endpoints:
        
        POST /upload
        Upload accelerometer data file
        
        POST /extract/{file_id}
        Extract data from uploaded file
        
        POST /process/{file_id}
        Process extracted data with parameters
        
        POST /predict_age/{file_id}
        Predict biological age from processed data
        
        GET /health
        Check server status
        
        Parameters:
        • preprocess_args: Preprocessing configuration
        • features_args: Feature extraction settings
        • chronological_age: User's chronological age
        • gender: User's gender (male/female/invariant)
      `
    },
    {
      id: 'examples',
      title: 'Examples',
      icon: <ShowChartIcon />,
      description: 'Sample workflows and use cases',
      content: `
        Example Workflows:
        
        1. Basic Analysis:
           - Upload Samsung Galaxy data
           - Use default parameters
           - View cosinor features and visualizations
        
        2. Custom Analysis:
           - Adjust preprocessing parameters
           - Modify feature extraction settings
           - Compare different configurations
        
        3. Age Prediction:
           - Process data with standard parameters
           - Enter chronological age and gender
           - View predicted biological age
        
        4. Research Analysis:
           - Export processed data
           - Use API for batch processing
           - Integrate with existing workflows
      `
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: <HelpIcon />,
      description: 'Frequently asked questions',
      content: `
        Frequently Asked Questions:
        
        Q: What file formats are supported?
        A: We support Samsung Galaxy Smartwatch binary data (ZIP) and CSV files.
        
        Q: How long does processing take?
        A: Processing time depends on data size, typically 1-5 minutes for standard datasets.
        
        Q: What do the cosinor features mean?
        A: Mesor (mean activity), Amplitude (rhythm strength), Acrophase (peak timing).
        
        Q: How accurate is biological age prediction?
        A: Predictions are based on validated models but should be used as research tools.
        
        Q: Can I export my results?
        A: Yes, processed data and features can be exported for further analysis.
      `
    }
  ];

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSection = documentationSections.find(section => section.id === selectedSection);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 4, minHeight: '80vh' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 700 }}>
                Documentation
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Complete guide to using CosinorLab and understanding your results
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="primary"
              href="https://cosinorage-deployed.readthedocs.io/en/latest/cosinorage.html"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon />}
            >
              Full Docs
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Sidebar Navigation */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: 'fit-content' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Navigation
                  </Typography>
                  
                  {/* Search */}
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  {/* Navigation List */}
                  <List dense>
                    {filteredSections.map((section) => (
                      <ListItem
                        key={section.id}
                        button
                        selected={selectedSection === section.id}
                        onClick={() => setSelectedSection(section.id)}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                            '&:hover': {
                              backgroundColor: 'primary.main',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: 'inherit' }}>
                          {section.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={section.title}
                          secondary={section.description}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedSection('installation')}
                      >
                        Setup Guide
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedSection('usage')}
                      >
                        Get Started
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedSection('api')}
                      >
                        API Docs
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedSection('faq')}
                      >
                        FAQ
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Main Content */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  {/* Breadcrumbs */}
                  <Breadcrumbs sx={{ mb: 2 }}>
                    <Link color="inherit" href="#" onClick={() => setSelectedSection('overview')}>
                      Documentation
                    </Link>
                    <Typography color="text.primary">{currentSection?.title}</Typography>
                  </Breadcrumbs>

                  {/* Section Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ mr: 2, color: 'primary.main' }}>
                      {currentSection?.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        {currentSection?.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentSection?.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box sx={{ 
                    '& pre': { 
                      backgroundColor: '#f5f5f5', 
                      padding: 2, 
                      borderRadius: 1, 
                      overflowX: 'auto',
                      fontSize: '0.875rem'
                    },
                    '& ul, & ol': {
                      pl: 2
                    },
                    '& li': {
                      mb: 0.5
                    }
                  }}>
                    <Typography 
                      variant="body1" 
                      component="div"
                      sx={{ whiteSpace: 'pre-line' }}
                    >
                      {currentSection?.content}
                    </Typography>
                  </Box>

                  {/* Related Sections */}
                  <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" gutterBottom>
                      Related Topics
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {documentationSections
                        .filter(section => section.id !== selectedSection)
                        .slice(0, 3)
                        .map((section) => (
                          <Chip
                            key={section.id}
                            label={section.title}
                            size="small"
                            clickable
                            onClick={() => setSelectedSection(section.id)}
                            icon={section.icon}
                          />
                        ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DocumentationTab; 