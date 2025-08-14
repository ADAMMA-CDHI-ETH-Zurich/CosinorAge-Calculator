import React from "react";
import { Box, Typography, Paper, Grid, Divider, Chip } from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import SchoolIcon from "@mui/icons-material/School";
import PsychologyIcon from "@mui/icons-material/Psychology";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

const AboutTab = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <ScienceIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                About CosinorAge Calculator
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Pioneering CosinorAge & Comprehensive Accelerometer Analysis at
                ADAMMA, ETH Zurich
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="body1"
              paragraph
              sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
            >
              CosinorAge Calculator is a research platform developed at ADAMMA (Core for AI
              & Digital Biomarker Research) at ETH Zurich. Our mission is to
              advance health monitoring by pioneering{" "}
              <strong>CosinorAge</strong> - a novel aging biomarker calculated
              from accelerometer data, while also providing comprehensive
              analysis of sleep, physical activity, and circadian rhythms.
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
            >
              <strong>CosinorAge</strong> provides researchers and healthcare
              professionals with a non-invasive, objective measure of biological
              aging based on daily activity patterns. This innovative biomarker
              works alongside our other analysis tools to provide a complete
              picture of health and activity patterns.
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
            >
              This project was developed by Dr. Jinjoo Shim (Harvard University,
              formerly at ETH Zurich) and Jacob Leo Oskar Hunecke (ETH Zurich)
              as part of ADAMMA's commitment to creating open-source tools for
              health innovation and advancing the field of digital biomarkers.
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
            >
              Learn more about ADAMMA at:
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "center",
                mb: 2,
              }}
            >
              <a
                href="https://adamma.ethz.ch/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <img
                  src="https://img.shields.io/badge/Website-rgb(237,30,121)?style=for-the-badge&logo=google-chrome&logoColor=white"
                  alt="Website Badge"
                  style={{ height: 28, borderRadius: "16px" }}
                />
              </a>
              <a
                href="https://github.com/ADAMMA-CDHI-ETH-Zurich"
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
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Team Members Section */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <SchoolIcon sx={{ fontSize: 32, color: "primary.main", mr: 2 }} />
              <Typography variant="h5" gutterBottom>
                Meet the Team
              </Typography>
            </Box>
            <Typography
              variant="body1"
              paragraph
              sx={{ fontSize: "1.1rem", lineHeight: 1.6, mb: 3 }}
            >
              Our interdisciplinary team combines expertise in digital health,
              machine learning, and biomedical engineering to create innovative
              solutions for health monitoring and research.
            </Typography>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    p: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 1,
                    height: 360,
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                  }}
                >
                  <img
                    src="https://im.ethz.ch/people/efleisch/_jcr_content/par/twocolumn/par_left/fullwidthimage/image.imageformat.1286.1368744170.jpg"
                    alt="Prof. Dr. Elgar Fleisch"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      objectFit: "cover",
                      objectPosition: "center 30%",
                      marginBottom: 16,
                      border: "3px solid",
                      borderColor: "primary.main",
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
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      justifyContent: "center",
                      maxWidth: "100%",
                    }}
                  >
                    <a
                      href="https://im.ethz.ch/people/efleisch.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "rgb(237, 30, 121)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "rgb(200, 25, 100)",
                          },
                        }}
                      >
                        W
                      </Box>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/elgar-fleisch-0bb72461/?originalSubdomain=ch"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#0077B5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "#005885",
                          },
                        }}
                      >
                        L
                      </Box>
                    </a>
                    <a
                      href="mailto:efleisch@ethz.ch"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#D44638",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "#B33A2E",
                          },
                        }}
                      >
                        M
                      </Box>
                    </a>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    p: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 1,
                    height: 360,
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                  }}
                >
                  <img
                    src="https://adamma.ethz.ch/images/filipe.jpg"
                    alt="Dr. Filipe Barata"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: 16,
                      border: "3px solid",
                      borderColor: "primary.main",
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
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      justifyContent: "center",
                      maxWidth: "100%",
                    }}
                  >
                    <a
                      href="https://adamma.ethz.ch/members/filipe-barata.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "rgb(237, 30, 121)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "rgb(200, 25, 100)",
                          },
                        }}
                      >
                        W
                      </Box>
                    </a>
                    <a
                      href="https://github.com/pipo3000"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#100000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "#333333",
                          },
                        }}
                      >
                        G
                      </Box>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/filipe-barata/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#0077B5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "#005885",
                          },
                        }}
                      >
                        L
                      </Box>
                    </a>
                    <a
                      href="mailto:fbarata@ethz.ch"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#D44638",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "#B33A2E",
                          },
                        }}
                      >
                        M
                      </Box>
                    </a>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    p: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 1,
                    height: 360,
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                  }}
                >
                  <img
                    src="https://jinjooshim.com/authors/admin/avatar_hu1948641559463300168.png"
                    alt="Dr. Jinjoo Shim"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: 16,
                      border: "3px solid",
                      borderColor: "primary.main",
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
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      justifyContent: "center",
                      maxWidth: "100%",
                    }}
                  >
                    <a
                      href="https://adamma.ethz.ch/members/jinjoo-shim"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "rgb(237, 30, 121)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "rgb(200, 25, 100)",
                          },
                        }}
                      >
                        W
                      </Box>
                    </a>
                    <a
                      href="https://github.com/jinjoo-shim"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#100000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "#333333",
                          },
                        }}
                      >
                        G
                      </Box>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/jinjooshim/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#0077B5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "#005885",
                          },
                        }}
                      >
                        L
                      </Box>
                    </a>
                    <a
                      href="mailto:jinjooshim@hsph.harvard.edu"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#D44638",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "#B33A2E",
                          },
                        }}
                      >
                        M
                      </Box>
                    </a>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    p: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 1,
                    height: 360,
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                  }}
                >
                  <img
                    src="https://adamma.ethz.ch/images/jacob.png"
                    alt="Jacob Leo Oskar Hunecke"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: 16,
                      border: "3px solid",
                      borderColor: "primary.main",
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
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      justifyContent: "center",
                      maxWidth: "100%",
                    }}
                  >
                    <a
                      href="https://adamma.ethz.ch/members/jacob-hunecke.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "rgb(237, 30, 121)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "rgb(200, 25, 100)",
                          },
                        }}
                      >
                        W
                      </Box>
                    </a>
                    <a
                      href="https://github.com/jlohunecke"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#100000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "#333333",
                          },
                        }}
                      >
                        G
                      </Box>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/jlohunecke/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#0077B5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "#005885",
                          },
                        }}
                      >
                        L
                      </Box>
                    </a>
                    <a
                      href="mailto:jhunecke@student.ethz.ch"
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#D44638",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px",
                          "&:hover": {
                            bgcolor: "#B33A2E",
                          },
                        }}
                      >
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
  );
};

export default AboutTab;
