import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ScienceIcon from "@mui/icons-material/Science";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CodeIcon from "@mui/icons-material/Code";
import demoVideo from "../assets/demo_video.mp4";
import pythonLogo from "../assets/python_logo.svg";

const HomeTab = ({ setCurrentTab }) => {
  return (
    <>
              <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 6, 
                textAlign: "center",
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '24px',
                position: 'relative',
                overflow: 'hidden',

              }}
            >
              <Typography
                variant="h2"
                gutterBottom
                sx={{ 
                  fontWeight: 700, 
                  color: "primary.main",
                  background: 'linear-gradient(135deg, #1A1A1A 0%, #0066CC 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                Welcome to CosinorAge Calculator
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                gutterBottom
                sx={{ 
                  mb: 4,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                Novel Aging Biomarker & Comprehensive Accelerometer Analysis
              </Typography>

            {/* New introduction section emphasizing CosinorAge */}
            <Box sx={{ mb: 4, textAlign: "left", maxWidth: "100%", mx: "auto" }}>
              <Typography
                variant="body1"
                paragraph
                sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
              >
                CosinorAge Calculator is a research platform that introduces{" "}
                <strong>CosinorAge</strong> - a novel aging biomarker calculated
                from accelerometer data. While CosinorAge is our main feature,
                we also provide comprehensive analysis of sleep patterns,
                physical activity levels, and circadian rhythms through
                sophisticated algorithms.
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
              >
                <strong>CosinorAge</strong> provides researchers and healthcare
                professionals with a non-invasive, objective measure of
                biological aging based on daily activity patterns. This validated biomarker (<a href="https://www.nature.com/articles/s41746-024-01111-x" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>see publication</a>) can be computed through the available Python package (<a href="https://github.com/ADAMMA-CDHI-ETH-Zurich/CosinorAge" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>see GitHub</a>) and through this plug-and-play web interface for instant calculations.
              </Typography>
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "primary.light",
                  border: "1px solid",
                  borderColor: "primary.main",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 0,
                    height: 0,
                    borderStyle: "solid",
                    borderWidth: "0 20px 20px 0",
                    borderColor: "transparent #2D2D2D transparent transparent"
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ 
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                    color: "primary.contrastText",
                    fontWeight: 500,
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      border: "2px solid currentColor",
                      borderRadius: "2px",
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "2px",
                        left: "2px",
                        right: "2px",
                        height: "1px",
                        backgroundColor: "currentColor"
                      },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: "6px",
                        left: "2px",
                        right: "2px",
                        height: "1px",
                        backgroundColor: "currentColor"
                      }
                    }}
                  />
                  Scientific Publication
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ 
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                    color: "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                    gap: 2
                  }}
                >
                  <span>
                    "Circadian rhythm analysis using wearable-based accelerometry as a digital biomarker of aging and healthspan" by Jinjoo Shim, Elgar Fleisch & Filipe Barata, published in Nature Digital Medicine (June 2024).
                  </span>
                  <a
                    href="https://www.nature.com/articles/s41746-024-01111-x"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      backgroundColor: "white",
                      color: "black",
                      textDecoration: "none",
                      borderRadius: "3px",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      border: "1px solid rgba(0, 0, 0, 0.2)",
                      transition: "all 0.2s ease",
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f5f5f5";
                      e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "white";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    Access
                    <span style={{ fontSize: "0.7rem" }}>→</span>
                  </a>
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "visible",
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.02)",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                      "& .icon-container": {
                        transform: "translateX(-50%) scale(1.1)",
                        boxShadow: "0 8px 25px rgba(0, 102, 204, 0.3)",
                      },
                    },
                  }}
                >
                  <Box
                    className="icon-container"
                    sx={{
                      position: "absolute",
                      top: -35,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      background: 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A0A0A0 100%)',
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                      "&::before": {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F0F0F0, #D0D0D0, #B0B0B0, #F0F0F0)',
                        backgroundSize: '200% 200%',
                        animation: 'gradientRotate 3s ease-in-out infinite',
                        zIndex: -1,
                      },
                      '@keyframes gradientRotate': {
                        '0%, 100%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                      },
                    }}
                  >
                    <AccessTimeIcon sx={{ fontSize: 35, color: "#2C3E50" }} />
                  </Box>
                  <CardContent
                    sx={{
                      pt: 6,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <Typography variant="h5" gutterBottom>
                      CosinorAge: Novel Aging Biomarker
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      Our <strong>CosinorAge</strong> algorithm analyzes
                      circadian rhythm patterns to predict biological age from
                      accelerometer data.
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, flex: 1 }}
                    >
                      Provides objective, non-invasive insights into biological
                      aging through sophisticated cosinor analysis.
                    </Typography>
                    <Chip
                      label="Novel Biomarker"
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "visible",
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.02)",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                      "& .icon-container": {
                        transform: "translateX(-50%) scale(1.1)",
                        boxShadow: "0 8px 25px rgba(123, 31, 162, 0.3)",
                      },
                    },
                  }}
                >
                  <Box
                    className="icon-container"
                    sx={{
                      position: "absolute",
                      top: -35,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      background: 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A0A0A0 100%)',
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                      "&::before": {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F0F0F0, #D0D0D0, #B0B0B0, #F0F0F0)',
                        backgroundSize: '200% 200%',
                        animation: 'gradientRotate 3s ease-in-out infinite',
                        zIndex: -1,
                      },
                      '@keyframes gradientRotate': {
                        '0%, 100%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                      },
                    }}
                  >
                    <ScienceIcon sx={{ fontSize: 35, color: "#2C3E50" }} />
                  </Box>
                  <CardContent
                    sx={{
                      pt: 6,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <Typography variant="h5" gutterBottom>
                      Advanced Data Processing
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      Transform raw accelerometer data into meaningful health
                      metrics using state-of-the-art preprocessing techniques.
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, flex: 1 }}
                    >
                      Handles data cleaning, noise reduction, and feature
                      calculation for sleep, activity, and circadian rhythm
                      analysis.
                    </Typography>
                    <Chip
                      label="Research-Grade Processing"
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "visible",
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.02)",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                      "& .icon-container": {
                        transform: "translateX(-50%) scale(1.1)",
                        boxShadow: "0 8px 25px rgba(0, 150, 136, 0.3)",
                      },
                    },
                  }}
                >
                  <Box
                    className="icon-container"
                    sx={{
                      position: "absolute",
                      top: -35,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      background: 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A0A0A0 100%)',
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                      "&::before": {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F0F0F0, #D0D0D0, #B0B0B0, #F0F0F0)',
                        backgroundSize: '200% 200%',
                        animation: 'gradientRotate 3s ease-in-out infinite',
                        zIndex: -1,
                      },
                      '@keyframes gradientRotate': {
                        '0%, 100%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                      },
                    }}
                  >
                    <ShowChartIcon sx={{ fontSize: 35, color: "#2C3E50" }} />
                  </Box>
                  <CardContent
                    sx={{
                      pt: 6,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <Typography variant="h5" gutterBottom>
                      Interactive Visualizations
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      Explore your data through interactive visualizations that
                      reveal patterns in circadian rhythms, activity levels, and
                      aging biomarkers.
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, flex: 1 }}
                    >
                      From cosinor analysis plots to sleep charts, our
                      visualizations help you understand health patterns and
                      biological aging trajectories.
                    </Typography>
                    <Chip
                      label="Biomarker Insights"
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Enhanced Getting Started using Lab section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ mb: 2, mt: 2, p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <ScienceIcon
                sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
              />
              <Box>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ color: "primary.main", fontWeight: 700 }}
                >
                  Interactive Analysis
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Turn your smartwatch data into insight — process, analyze, and
                  predict your CosinorAge biomarker.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => setCurrentTab(2)}
                sx={{
                  mt: 2,
                  px: 6,
                  py: 2,
                  fontSize: "1.2rem",
                  borderRadius: 3,
                  boxShadow: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease-in-out",
                  },
                }}
              >
                Launch Calculator
              </Button>
            </Box>

            {/* Demo Video */}
            <Box
              sx={{
                mt: 4,
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <video
                controls
                autoPlay
                muted
                loop
                width="100%"
                maxWidth="800px"
                style={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  border: "3px solid #666666",
                }}
              >
                <source src={demoVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Enhanced Getting Started Section for API */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ mb: 2, mt: 2 }}>
            <Accordion
              sx={{
                width: "100%",
                "&:before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  p: 4,
                  "& .MuiAccordionSummary-content": {
                    margin: 0,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CodeIcon
                      sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
                    />
                    <Box>
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{ color: "primary.main", fontWeight: 700 }}
                      >
                        CosinorAge Python Package
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Integrate CosinorAge aging biomarker analysis into your
                        research workflows and applications
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <a
                      href="https://github.com/ADAMMA-CDHI-ETH-Zurich/CosinorAge"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <img
                        src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"
                        alt="GitHub Badge"
                        style={{ height: 28, borderRadius: "16px" }}
                      />
                    </a>
                    <a
                      href="https://cosinorage-deployed.readthedocs.io/en/latest/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <img
                        src="https://img.shields.io/badge/Read%20the%20Docs-8CA1AF?style=for-the-badge&logo=readthedocs&logoColor=white"
                        alt="Read the Docs Badge"
                        style={{ height: 28, borderRadius: "16px" }}
                      />
                    </a>
                    <Box sx={{ position: "relative" }}>
                      <div style={{ display: "inline-block" }}>
                        <img
                          src="https://img.shields.io/badge/PyPI-3775A9?style=for-the-badge&logo=pypi&logoColor=white"
                          alt="PyPI Badge"
                          style={{ height: 28, borderRadius: "16px" }}
                        />
                      </div>
                      <Box
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          bgcolor: "warning.main",
                          color: "white",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                          transform: "rotate(15deg)",
                          zIndex: 1,
                        }}
                      >
                        WIP
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 4, pb: 4 }}>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
                >
                  For researchers and developers who need programmatic access to
                  our aging biomarker analysis tools, CosinorAge Calculator provides a
                  comprehensive Python API. This allows you to integrate our
                  CosinorAge aging biomarker calculation, circadian rhythm
                  analysis, and activity classification into your own research
                  pipelines and applications.
                </Typography>

                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ mt: 4, mb: 2, color: "primary.main" }}
                >
                  Prerequisites
                </Typography>
                <ul
                  style={{
                    textAlign: "left",
                    marginLeft: "1.5em",
                    color: "#4A5B7A",
                    marginBottom: "2rem",
                  }}
                >
                  <li>Python &gt;= 3.10</li>
                  <li>pip (Python package installer)</li>
                  <li>git</li>
                </ul>

                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ mt: 4, mb: 2, color: "primary.main" }}
                >
                  Installation Steps
                </Typography>

                <ol
                  style={{
                    textAlign: "left",
                    marginLeft: "1.5em",
                    color: "#4A5B7A",
                  }}
                >
                  <li style={{ marginBottom: "1.5rem" }}>
                    <strong>Clone the Repository</strong>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, mb: 1 }}
                    >
                      Get the latest version of the codebase from our GitHub
                      repository.
                    </Typography>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        padding: "10px",
                        borderRadius: "6px",
                        marginTop: "8px",
                        overflowX: "auto",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      {`git clone https://github.com/yourusername/cosinorage.git
cd cosinorage`}
                    </pre>
                  </li>
                  <li style={{ marginBottom: "1.5rem" }}>
                    <strong>Set Up Virtual Environment</strong>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, mb: 1 }}
                    >
                      Create an isolated Python environment to avoid dependency
                      conflicts.
                    </Typography>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        padding: "10px",
                        borderRadius: "6px",
                        marginTop: "8px",
                        overflowX: "auto",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      {`# Create a new virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
source venv/bin/activate`}
                    </pre>
                  </li>
                  <li style={{ marginBottom: "1.5rem" }}>
                    <strong>Install Dependencies</strong>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, mb: 1 }}
                    >
                      Install all required packages and their dependencies.
                    </Typography>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        padding: "10px",
                        borderRadius: "6px",
                        marginTop: "8px",
                        overflowX: "auto",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      {`# Upgrade pip
pip install --upgrade pip

# Install required packages
pip install -r requirements.txt`}
                    </pre>
                  </li>
                  <li style={{ marginBottom: "1.5rem" }}>
                    <strong>Install the Package</strong>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, mb: 1 }}
                    >
                      Install the package in development mode for easy updates
                      and modifications.
                    </Typography>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        padding: "10px",
                        borderRadius: "6px",
                        marginTop: "8px",
                        overflowX: "auto",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      {`# Install in development mode
pip install -e .`}
                    </pre>
                  </li>
                </ol>

                <Alert
                  sx={{
                    mt: 3,
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
                    <strong>Ready to Start:</strong> Once installation is
                    complete, you can begin using the API to analyze
                    accelerometer data programmatically. Check our documentation
                    for detailed usage examples.
                  </Typography>
                </Alert>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default HomeTab;
