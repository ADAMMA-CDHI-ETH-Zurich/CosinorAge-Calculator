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
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShowChartIcon from "@mui/icons-material/ShowChart";

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
              Advanced Analysis of Accelerometer Data
            </Typography>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "visible",
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
                      Biological Age Prediction
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Estimate your biological age based on activity patterns.
                      Our advanced algorithms analyze your movement data to
                      provide insights into your physiological age and health
                      status.
                    </Typography>
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
                      Accelerometer Data Analysis
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Process and analyze raw accelerometer data with advanced
                      algorithms. Extract meaningful insights from your movement
                      patterns using state-of-the-art preprocessing and feature
                      extraction techniques.
                    </Typography>
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
                      Feature Visualization
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Explore your data through interactive visualizations. View
                      circadian rhythms, activity patterns, and sleep metrics
                      with our comprehensive suite of visualization tools.
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
          <Box
            sx={{
              mb: 2,
              mt: 2,
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: 1,
              width: "100%",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: "primary.main", fontWeight: 700 }}
            >
              Getting Started using Lab
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Use the interactive Lab to upload, process, and visualize your
              accelerometer data directly in the browser.
            </Typography>
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
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderRadius: 2,
                  boxShadow: 3,
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease-in-out",
                  },
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
          <Box
            sx={{
              mb: 2,
              mt: 2,
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: 1,
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Typography
                variant="h4"
                gutterBottom
                sx={{ color: "primary.main", fontWeight: 700 }}
              >
                Getting Started using API
              </Typography>
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

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Prerequisites
            </Typography>
            <ul
              style={{
                textAlign: "left",
                marginLeft: "1.5em",
                color: "#4A5B7A",
              }}
            >
              <li>Python &gt;= 3.10</li>
              <li>pip (Python package installer)</li>
              <li>git</li>
            </ul>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Installation Steps
            </Typography>

            <ol
              style={{
                textAlign: "left",
                marginLeft: "1.5em",
                color: "#4A5B7A",
              }}
            >
              <li>
                <strong>Clone the Repository</strong>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "6px",
                    marginTop: "8px",
                    overflowX: "auto",
                  }}
                >
                  {`git clone https://github.com/yourusername/cosinorage.git
cd cosinorage`}
                </pre>
              </li>
              <li>
                <strong>Set Up Virtual Environment</strong>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "6px",
                    marginTop: "8px",
                    overflowX: "auto",
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
              <li>
                <strong>Install Dependencies</strong>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "6px",
                    marginTop: "8px",
                    overflowX: "auto",
                  }}
                >
                  {`# Upgrade pip
pip install --upgrade pip

# Install required packages
pip install -r requirements.txt`}
                </pre>
              </li>
              <li>
                <strong>Install the Package</strong>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "6px",
                    marginTop: "8px",
                    overflowX: "auto",
                  }}
                >
                  {`# Install in development mode
pip install -e .`}
                </pre>
              </li>
            </ol>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default HomeTab;
