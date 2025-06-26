import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Link,
  Breadcrumbs,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import config from './config';

function EnhancedDocumentationTab() {
  const [activeTab, setActiveTab] = useState('dataloaders');
  const [documentationType, setDocumentationType] = useState('lab'); // 'api' or 'lab'
  const [documentation, setDocumentation] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocumentation = async (module) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(config.getApiUrl(`docs/${module}`));
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to fetch ${module} documentation`);
        }
        const data = await response.json();
        setDocumentation(prev => ({
          ...prev,
          [module]: data.content
        }));
      } catch (err) {
        console.error('Documentation fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentation(activeTab);
  }, [activeTab]);

  // Handle [source] link styling after content is rendered
  useEffect(() => {
    if (documentation[activeTab]) {
      // Wait for DOM to be updated
      setTimeout(() => {
        const container = document.querySelector('[data-documentation-content]');
        if (container) {
          const sourceLinks = container.querySelectorAll('a');
          console.log(`Found ${sourceLinks.length} total links in documentation`);
          
          sourceLinks.forEach((link, index) => {
            const linkText = link.textContent;
            const linkHref = link.getAttribute('href');
            
            console.log(`Link ${index}: "${linkText}" -> ${linkHref}`);
            
            if (linkText.includes('[source]')) {
              console.log(`Processing source link: "${linkText}" -> ${linkHref}`);
              
              // Apply styling
              link.style.float = 'right';
              link.style.fontSize = '0.8em';
              link.style.color = '#6c757d';
              link.style.textDecoration = 'none';
              link.style.marginLeft = '1rem';
              link.style.cursor = 'pointer';
              
              // Ensure the link opens in new tab if it has a valid href
              if (linkHref && typeof linkHref === 'string' && !linkHref.startsWith('#') && !linkHref.startsWith('javascript:')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                console.log(`Source link will open: ${linkHref}`);
              } else if (!linkHref || (typeof linkHref === 'string' && (linkHref.startsWith('#') || linkHref.startsWith('javascript:')))) {
                console.warn(`Source link has invalid href: ${linkHref}`);
                // Make it a placeholder link for now
                link.href = '#';
                link.onclick = (e) => {
                  e.preventDefault();
                  alert('Source link not available. This would typically link to the GitHub source code.');
                };
              }
            }
          });
        }
      }, 100);
    }
  }, [documentation, activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDocumentationTypeChange = (event, newValue) => {
    setDocumentationType(newValue);
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Documentation Type Selection */}
        <Box sx={{ mb: 3 }}> 
          <Tabs
            value={documentationType}
            onChange={handleDocumentationTypeChange}
            sx={{
              width: '100%',
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                width: '50%', // 50% width each
                maxWidth: '50%',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
              }
            }}
          >
            <Tab label="Lab Documentation" value="lab" />
            <Tab label="API Documentation" value="api" />
          </Tabs>
        </Box>

        {/* API Documentation Content */}
        {documentationType === 'api' && (
          <>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                mb: 3,
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                }
              }}
            >
              <Tab label="Data Handlers" value="dataloaders" />
              <Tab label="Features" value="features" />
              <Tab label="Biological Ages" value="bioages" />
            </Tabs>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : (
              <Box 
                sx={{
                  '& .section': {
                    mb: 4,
                  },
                  '& h1': {
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 2,
                  },
                  '& h2': {
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    mt: 4,
                    mb: 2,
                  },
                  '& h3': {
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    mt: 3,
                    mb: 2,
                  },
                  '& h4': {
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    mt: 2,
                    mb: 1,
                  },
                  '& p': {
                    mb: 2,
                    lineHeight: 1.6,
                  },
                  '& ul, & ol': {
                    pl: 3,
                    mb: 2,
                  },
                  '& li': {
                    mb: 1,
                  },
                  '& strong': {
                    fontWeight: 600,
                    color: 'text.primary',
                  },
                  '& code': {
                    backgroundColor: 'grey.100',
                    padding: '2px 4px',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    color: '#d63384',
                  },
                  '& .highlight': {
                    backgroundColor: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: 1,
                    mb: 2,
                    overflowX: 'auto',
                    border: '1px solid #e9ecef',
                  },
                  '& .highlight pre': {
                    margin: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    lineHeight: 1.4,
                  },
                  '& .highlight .hll': { backgroundColor: '#ffffcc' },
                  '& .highlight .c': { color: '#999988', fontStyle: 'italic' }, // Comment
                  '& .highlight .err': { color: '#a61717', backgroundColor: '#e3d2d2' }, // Error
                  '& .highlight .k': { color: '#000000', fontWeight: 'bold' }, // Keyword
                  '& .highlight .o': { color: '#000000', fontWeight: 'bold' }, // Operator
                  '& .highlight .ch': { color: '#999988', fontStyle: 'italic' }, // Comment.Hashbang
                  '& .highlight .cm': { color: '#999988', fontStyle: 'italic' }, // Comment.Multiline
                  '& .highlight .cp': { color: '#999999', fontWeight: 'bold', fontStyle: 'italic' }, // Comment.Preproc
                  '& .highlight .cpf': { color: '#999988', fontStyle: 'italic' }, // Comment.PreprocFile
                  '& .highlight .c1': { color: '#999988', fontStyle: 'italic' }, // Comment.Single
                  '& .highlight .cs': { color: '#999999', fontWeight: 'bold', fontStyle: 'italic' }, // Comment.Special
                  '& .highlight .gd': { color: '#000000', backgroundColor: '#ffdddd' }, // Generic.Deleted
                  '& .highlight .ge': { color: '#000000', fontStyle: 'italic' }, // Generic.Emph
                  '& .highlight .gr': { color: '#aa0000' }, // Generic.Error
                  '& .highlight .gh': { color: '#999999' }, // Generic.Heading
                  '& .highlight .gi': { color: '#000000', backgroundColor: '#ddffdd' }, // Generic.Inserted
                  '& .highlight .go': { color: '#888888' }, // Generic.Output
                  '& .highlight .gp': { color: '#555555' }, // Generic.Prompt
                  '& .highlight .gs': { fontWeight: 'bold' }, // Generic.Strong
                  '& .highlight .gu': { color: '#aaaaaa' }, // Generic.Subheading
                  '& .highlight .gt': { color: '#aa0000' }, // Generic.Traceback
                  '& .highlight .kc': { color: '#000000', fontWeight: 'bold' }, // Keyword.Constant
                  '& .highlight .kd': { color: '#000000', fontWeight: 'bold' }, // Keyword.Declaration
                  '& .highlight .kn': { color: '#000000', fontWeight: 'bold' }, // Keyword.Namespace
                  '& .highlight .kp': { color: '#000000', fontWeight: 'bold' }, // Keyword.Pseudo
                  '& .highlight .kr': { color: '#000000', fontWeight: 'bold' }, // Keyword.Reserved
                  '& .highlight .kt': { color: '#445588', fontWeight: 'bold' }, // Keyword.Type
                  '& .highlight .m': { color: '#009999' }, // Literal.Number
                  '& .highlight .s': { color: '#d01040' }, // Literal.String
                  '& .highlight .na': { color: '#008080' }, // Name.Attribute
                  '& .highlight .nb': { color: '#0086B3' }, // Name.Builtin
                  '& .highlight .nc': { color: '#445588', fontWeight: 'bold' }, // Name.Class
                  '& .highlight .no': { color: '#008080' }, // Name.Constant
                  '& .highlight .nd': { color: '#3c5d5d', fontWeight: 'bold' }, // Name.Decorator
                  '& .highlight .ni': { color: '#800080' }, // Name.Entity
                  '& .highlight .ne': { color: '#990000', fontWeight: 'bold' }, // Name.Exception
                  '& .highlight .nf': { color: '#990000', fontWeight: 'bold' }, // Name.Function
                  '& .highlight .nl': { color: '#990000', fontWeight: 'bold' }, // Name.Label
                  '& .highlight .nn': { color: '#555555' }, // Name.Namespace
                  '& .highlight .nt': { color: '#000080' }, // Name.Tag
                  '& .highlight .nv': { color: '#008080' }, // Name.Variable
                  '& .highlight .ow': { color: '#000000', fontWeight: 'bold' }, // Operator.Word
                  '& .highlight .w': { color: '#bbbbbb' }, // Text.Whitespace
                  '& .highlight .mb': { color: '#009999' }, // Literal.Number.Bin
                  '& .highlight .mf': { color: '#009999' }, // Literal.Number.Float
                  '& .highlight .mh': { color: '#009999' }, // Literal.Number.Hex
                  '& .highlight .mi': { color: '#009999' }, // Literal.Number.Integer
                  '& .highlight .mo': { color: '#009999' }, // Literal.Number.Oct
                  '& .highlight .sa': { color: '#d01040' }, // Literal.String.Affix
                  '& .highlight .sb': { color: '#d01040' }, // Literal.String.Backtick
                  '& .highlight .sc': { color: '#d01040' }, // Literal.String.Char
                  '& .highlight .dl': { color: '#d01040' }, // Literal.String.Delimiter
                  '& .highlight .sd': { color: '#d01040' }, // Literal.String.Doc
                  '& .highlight .s2': { color: '#d01040' }, // Literal.String.Double
                  '& .highlight .se': { color: '#d01040' }, // Literal.String.Escape
                  '& .highlight .sh': { color: '#d01040' }, // Literal.String.Heredoc
                  '& .highlight .si': { color: '#d01040' }, // Literal.String.Interpol
                  '& .highlight .sx': { color: '#d01040' }, // Literal.String.Other
                  '& .highlight .sr': { color: '#009926' }, // Literal.String.Regex
                  '& .highlight .s1': { color: '#d01040' }, // Literal.String.Single
                  '& .highlight .ss': { color: '#990073' }, // Literal.String.Symbol
                  '& .highlight .bp': { color: '#999999' }, // Name.Builtin.Pseudo
                  '& .highlight .fm': { color: '#990000', fontWeight: 'bold' }, // Name.Function.Magic
                  '& .highlight .vc': { color: '#008080' }, // Name.Variable.Class
                  '& .highlight .vg': { color: '#008080' }, // Name.Variable.Global
                  '& .highlight .vi': { color: '#008080' }, // Name.Variable.Instance
                  '& .highlight .vm': { color: '#008080' }, // Name.Variable.Magic
                  '& .highlight .il': { color: '#009999' }, // Literal.Number.Integer.Long
                  '& dl': {
                    mb: 2,
                  },
                  '& dt': {
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 1,
                  },
                  '& dd': {
                    ml: 2,
                    mb: 2,
                  },
                  '& .definition-list': {
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    padding: '1rem',
                    backgroundColor: '#fafafa',
                    mb: 2,
                  },
                  '& .definition-list dt': {
                    fontWeight: 700,
                    color: 'primary.main',
                    borderBottom: '1px solid #e0e0e0',
                    paddingBottom: '0.5rem',
                    marginBottom: '0.5rem',
                  },
                  '& .definition-list dd': {
                    marginLeft: 0,
                    paddingLeft: '1rem',
                    borderLeft: '3px solid #e0e0e0',
                  },
                  '& .code-inline': {
                    backgroundColor: 'grey.100',
                    padding: '2px 4px',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    color: '#d63384',
                  },
                  '& table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    mb: 2,
                  },
                  '& th, & td': {
                    border: '1px solid #ddd',
                    padding: '0.5rem',
                    textAlign: 'left',
                  },
                  '& th': {
                    backgroundColor: 'grey.50',
                    fontWeight: 600,
                  },
                  '& .table': {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: 1,
                    overflow: 'hidden',
                    '& th': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 600,
                    },
                    '& tr:nth-of-type(even)': {
                      backgroundColor: '#f8f9fa',
                    },
                    '& tr:hover': {
                      backgroundColor: '#f0f0f0',
                    }
                  },
                  '& .section': {
                    marginBottom: '2rem',
                    padding: '1rem',
                    backgroundColor: '#ffffff',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    '& h2': {
                      borderBottom: '2px solid primary.main',
                      paddingBottom: '0.5rem',
                      marginBottom: '1rem',
                    },
                    '& h3': {
                      color: 'primary.main',
                      borderLeft: '4px solid primary.main',
                      paddingLeft: '1rem',
                    }
                  },
                  '& .admonition': {
                    margin: '1em 0',
                    padding: '1em',
                    borderLeft: '4px solid',
                    backgroundColor: '#f8f9fa',
                    '&.note': {
                      borderColor: '#007bff',
                      '& .admonition-title': {
                        color: '#007bff'
                      }
                    },
                    '&.warning': {
                      borderColor: '#ffc107',
                      '& .admonition-title': {
                        color: '#856404'
                      }
                    },
                    '&.important': {
                      borderColor: '#dc3545',
                      '& .admonition-title': {
                        color: '#dc3545'
                      }
                    }
                  },
                  '& .admonition-title': {
                    marginTop: 0,
                    marginBottom: '0.5em',
                    fontWeight: 600
                  },
                  '& .code-inline': {
                    backgroundColor: 'grey.100',
                    padding: '2px 4px',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    color: '#d63384',
                  },
                  '& .definition-list': {
                    mb: 2,
                  },
                  '& .table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    mb: 2,
                  },
                  '& .section': {
                    mb: 4,
                  }
                }}
                data-documentation-content
                dangerouslySetInnerHTML={{ 
                  __html: documentation[activeTab] || '<p>No documentation available for this module.</p>' 
                }}
              />
            )}
          </>
        )}

        {/* Lab Documentation Content */}
        {documentationType === 'lab' && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
              Lab Documentation
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome to the Lab Documentation section. This area provides comprehensive guides and tutorials for using the CosinorLab interactive interface.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Getting Started
            </Typography>
            <Typography variant="body1" paragraph>
              The Lab interface allows you to upload, process, and analyze accelerometer data through an intuitive web interface. Follow these steps to get started:
            </Typography>
            
            <ol style={{ paddingLeft: '2rem', marginBottom: '2rem' }}>
              <li style={{ marginBottom: '1rem' }}>
                <Typography variant="body1">
                  <strong>Upload Data:</strong> Select your data source (Samsung Galaxy Smartwatch) and file type (Binary ZIP or CSV), then upload your accelerometer data file.
                </Typography>
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <Typography variant="body1">
                  <strong>Configure Parameters:</strong> Adjust preprocessing and feature extraction parameters according to your needs, or use the default settings.
                </Typography>
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <Typography variant="body1">
                  <strong>Process Data:</strong> Click "Process Data" to extract features and generate visualizations.
                </Typography>
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <Typography variant="body1">
                  <strong>View Results:</strong> Explore the generated features, visualizations, and optionally predict biological age.
                </Typography>
              </li>
            </ol>

            <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Supported Data Formats
            </Typography>
            <Typography variant="body1" paragraph>
              Currently, the Lab supports Samsung Galaxy Smartwatch accelerometer data in the following formats:
            </Typography>
            <ul style={{ paddingLeft: '2rem', marginBottom: '2rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Typography variant="body1">
                  <strong>Binary ZIP:</strong> Raw accelerometer data files from Samsung Galaxy Watch devices
                </Typography>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Typography variant="body1">
                  <strong>CSV:</strong> Processed accelerometer data in CSV format
                </Typography>
              </li>
            </ul>

            <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Features and Visualizations
            </Typography>
            <Typography variant="body1" paragraph>
              The Lab provides comprehensive analysis including:
            </Typography>
            <ul style={{ paddingLeft: '2rem', marginBottom: '2rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Typography variant="body1">
                  <strong>Cosinor Analysis:</strong> Circadian rhythm analysis with mesor, amplitude, and acrophase calculations
                </Typography>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Typography variant="body1">
                  <strong>Non-parametric Features:</strong> Interdaily stability, intradaily variability, and relative amplitude metrics
                </Typography>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Typography variant="body1">
                  <strong>Physical Activity Analysis:</strong> Sedentary, light, moderate, and vigorous activity classification
                </Typography>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Typography variant="body1">
                  <strong>Sleep Analysis:</strong> Sleep onset, duration, and quality metrics
                </Typography>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Typography variant="body1">
                  <strong>Biological Age Prediction:</strong> Age prediction based on activity patterns
                </Typography>
              </li>
            </ul>

            <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Troubleshooting
            </Typography>
            <Typography variant="body1" paragraph>
              If you encounter issues:
            </Typography>
            <ul style={{ paddingLeft: '2rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Typography variant="body1">
                  Ensure your file is in the correct format and not corrupted
                </Typography>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Typography variant="body1">
                  Check that the server is running and accessible
                </Typography>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Typography variant="body1">
                  Verify that your data contains sufficient valid time periods
                </Typography>
              </li>
            </ul>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default EnhancedDocumentationTab; 