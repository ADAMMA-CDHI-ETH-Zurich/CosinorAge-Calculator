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
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ScienceIcon from "@mui/icons-material/Science";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PsychologyIcon from "@mui/icons-material/Psychology";

const HomeTab = ({ setCurrentTab }) => {
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography
              variant="h3"
              gutterBottom
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              Welcome to CosinorLab
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 4 }}
            >
              Novel Aging Biomarker & Comprehensive Accelerometer Analysis
            </Typography>

            {/* New introduction section emphasizing cosinorage */}
            <Box sx={{ mb: 4, textAlign: "left", maxWidth: 800, mx: "auto" }}>
              <Typography
                variant="body1"
                paragraph
                sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
              >
                CosinorLab is a research platform that introduces{" "}
                <strong>Cosinorage</strong> - a novel aging biomarker calculated
                from accelerometer data. While cosinorage is our main feature,
                we also provide comprehensive analysis of sleep patterns,
                physical activity levels, and circadian rhythms through
                sophisticated algorithms.
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
              >
                <strong>Cosinorage</strong> provides researchers and healthcare
                professionals with a non-invasive, objective measure of
                biological aging based on daily activity patterns. This
                innovative biomarker works alongside our other analysis tools to
                offer a complete picture of health and activity patterns.
              </Typography>
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
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      bgcolor: "primary.light",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AccessTimeIcon sx={{ fontSize: 30, color: "white" }} />
                  </Box>
                  <CardContent sx={{ pt: 6, textAlign: "center" }}>
                    <Typography variant="h5" gutterBottom>
                      Cosinorage: Novel Aging Biomarker
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      Our <strong>Cosinorage</strong> algorithm analyzes
                      circadian rhythm patterns from accelerometer data to
                      predict biological age - a novel approach to aging
                      assessment.
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      This innovative biomarker provides objective, non-invasive
                      insights into biological aging through sophisticated
                      cosinor analysis of daily activity patterns.
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
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      bgcolor: "primary.light",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TimelineIcon sx={{ fontSize: 30, color: "white" }} />
                  </Box>
                  <CardContent sx={{ pt: 6, textAlign: "center" }}>
                    <Typography variant="h5" gutterBottom>
                      Advanced Data Processing
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      Transform raw accelerometer data into meaningful health
                      metrics using state-of-the-art preprocessing and feature
                      extraction techniques for comprehensive analysis.
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Our pipeline handles data cleaning, noise reduction, and
                      feature calculation for sleep, activity, and circadian
                      rhythm analysis, ensuring reliable and reproducible
                      results.
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
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      bgcolor: "primary.light",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ShowChartIcon sx={{ fontSize: 30, color: "white" }} />
                  </Box>
                  <CardContent sx={{ pt: 6, textAlign: "center" }}>
                    <Typography variant="h5" gutterBottom>
                      Interactive Visualizations
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      Explore your data through comprehensive, interactive
                      visualizations that reveal patterns in circadian rhythms,
                      activity levels, sleep patterns, and aging biomarkers.
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      From cosinor analysis plots to sleep and activity charts,
                      our visualizations help you understand comprehensive
                      health patterns and biological aging trajectories.
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
          <Box
            sx={{
              mb: 2,
              mt: 2,
              p: 4,
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: 2,
              width: "100%",
              border: "1px solid",
              borderColor: "primary.light",
            }}
          >
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
                  Interactive Lab Analysis
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Upload, process, and analyze your accelerometer data to
                  calculate Cosinorage aging biomarkers
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "primary.main" }}
                >
                  What You Can Do:
                </Typography>
                <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <Typography variant="body1">
                      <strong>Calculate Cosinorage:</strong> Generate novel
                      aging biomarkers from accelerometer data
                    </Typography>
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <Typography variant="body1">
                      <strong>Upload Data:</strong> Support for Samsung Galaxy
                      Smartwatch and generic CSV formats
                    </Typography>
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <Typography variant="body1">
                      <strong>Process Data:</strong> Advanced preprocessing with
                      customizable parameters
                    </Typography>
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <Typography variant="body1">
                      <strong>Analyze Results:</strong> Comprehensive circadian
                      rhythm and aging biomarker analysis
                    </Typography>
                  </li>
                </ul>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "primary.main" }}
                >
                  Key Features:
                </Typography>
                <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <Typography variant="body1">
                      <strong>Cosinorage Biomarker:</strong> Novel aging
                      assessment from circadian patterns
                    </Typography>
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <Typography variant="body1">
                      <strong>Real-time Processing:</strong> See results as
                      they're calculated
                    </Typography>
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <Typography variant="body1">
                      <strong>Interactive Charts:</strong> Explore your data
                      with zoom and hover features
                    </Typography>
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <Typography variant="body1">
                      <strong>Batch Processing:</strong> Analyze multiple
                      individuals simultaneously
                    </Typography>
                  </li>
                </ul>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Getting Started:</strong> Click the button below to
                access the interactive Lab. You can upload sample data to
                explore the Cosinorage aging biomarker features, or use your own
                accelerometer data for analysis.
              </Typography>
            </Alert>

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
                Launch Interactive Lab
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Enhanced Getting Started Section for API */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              mb: 2,
              mt: 2,
              p: 4,
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: 2,
              width: "100%",
              border: "1px solid",
              borderColor: "grey.300",
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
                <HealthAndSafetyIcon
                  sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
                />
                <Box>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ color: "primary.main", fontWeight: 700 }}
                  >
                    Programmatic Access
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Integrate Cosinorage aging biomarker analysis into your
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

            <Typography
              variant="body1"
              paragraph
              sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
            >
              For researchers and developers who need programmatic access to our
              aging biomarker analysis tools, CosinorLab provides a
              comprehensive Python API. This allows you to integrate our
              Cosinorage aging biomarker calculation, circadian rhythm analysis,
              and activity classification into your own research pipelines and
              applications.
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
                  Install the package in development mode for easy updates and
                  modifications.
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

            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Ready to Start:</strong> Once installation is complete,
                you can begin using the API to analyze accelerometer data
                programmatically. Check our documentation for detailed usage
                examples.
              </Typography>
            </Alert>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default HomeTab;
