import React from "react";
import { Box, Typography, Alert, Chip, Divider, Grid } from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import UploadIcon from "@mui/icons-material/Upload";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import PsychologyIcon from "@mui/icons-material/Psychology";

function LabDocumentationSubTab() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <ScienceIcon sx={{ fontSize: 32, color: "primary.main", mr: 2 }} />
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: "primary.main", mb: 0 }}
        >
          Lab Documentation
        </Typography>
      </Box>

      <Typography
        variant="body1"
        paragraph
        sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
      >
        Welcome to the Lab Documentation section. This comprehensive guide
        provides detailed information about using the CosinorLab interactive
        interface for analyzing accelerometer data and extracting meaningful
        health insights.
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Quick Start:</strong> If you're new to CosinorLab, we
          recommend starting with the "Getting Started" section below. For
          experienced users, you can jump directly to the specific sections that
          interest you.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      <Typography
        variant="h6"
        gutterBottom
        sx={{ mt: 4, mb: 2, color: "primary.main" }}
      >
        Getting Started
      </Typography>
      <Typography
        variant="body1"
        paragraph
        sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
      >
        The Lab interface provides an intuitive web-based platform for
        uploading, processing, and analyzing accelerometer data. Our
        step-by-step workflow ensures that even users new to circadian rhythm
        analysis can achieve meaningful results.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "primary.main", mb: 2 }}
        >
          Step-by-Step Workflow
        </Typography>
        <ol style={{ paddingLeft: "2rem", marginBottom: "2rem" }}>
          <li style={{ marginBottom: "1.5rem" }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              <UploadIcon
                sx={{ fontSize: 20, mr: 1, verticalAlign: "middle" }}
              />
              Upload Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              Select your data source (Samsung Galaxy Smartwatch or generic CSV)
              and file type (Binary ZIP or CSV), then upload your accelerometer
              data file. The system will automatically detect the format and
              guide you through any necessary configuration.
            </Typography>
          </li>
          <li style={{ marginBottom: "1.5rem" }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              <TimelineIcon
                sx={{ fontSize: 20, mr: 1, verticalAlign: "middle" }}
              />
              Configure Parameters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              Adjust preprocessing and feature extraction parameters according
              to your research needs, or use our recommended default settings
              that work well for most applications. Advanced users can fine-tune
              these parameters for optimal results.
            </Typography>
          </li>
          <li style={{ marginBottom: "1.5rem" }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              <ShowChartIcon
                sx={{ fontSize: 20, mr: 1, verticalAlign: "middle" }}
              />
              Process Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              Click "Process Data" to extract features and generate
              visualizations. The system will show real-time progress and
              provide detailed feedback on each processing step.
            </Typography>
          </li>
          <li style={{ marginBottom: "1.5rem" }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              <PsychologyIcon
                sx={{ fontSize: 20, mr: 1, verticalAlign: "middle" }}
              />
              View Results
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              Explore the generated features, visualizations, and optionally
              predict biological age. All results are presented with clear
              explanations and can be exported for further analysis.
            </Typography>
          </li>
        </ol>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography
        variant="h6"
        gutterBottom
        sx={{ mt: 4, mb: 2, color: "primary.main" }}
      >
        Supported Data Formats
      </Typography>
      <Typography
        variant="body1"
        paragraph
        sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
      >
        CosinorLab supports multiple data formats to accommodate different
        research needs and device types. Our flexible input system ensures
        compatibility with various accelerometer data sources.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "primary.light",
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "primary.main" }}
              >
                Samsung Galaxy Smartwatch
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Native support for Samsung Galaxy Watch devices with optimized
                processing for their specific data format.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label="Binary ZIP"
                  color="primary"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Raw accelerometer data files (.zip) from Samsung Galaxy Watch
                  devices
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label="CSV Export"
                  color="primary"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  ENMO data exported from Samsung Health app in CSV format
                </Typography>
              </Box>
              <Box>
                <Chip
                  label="Auto-detection"
                  color="primary"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Automatic format detection and column mapping
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.300",
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "primary.main" }}
              >
                Generic CSV Formats
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Support for standard accelerometer data formats with flexible
                column mapping and preprocessing options.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label="CSV Files"
                  color="primary"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Standard CSV format with customizable column selection
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label="Data Types"
                  color="primary"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Accelerometer (X, Y, Z), ENMO, and activity count data
                </Typography>
              </Box>
              <Box>
                <Chip
                  label="Units"
                  color="primary"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Support for mg, g, and m/s² units with automatic conversion
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography
        variant="h6"
        gutterBottom
        sx={{ mt: 4, mb: 2, color: "primary.main" }}
      >
        Troubleshooting
      </Typography>
      <Typography
        variant="body1"
        paragraph
        sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
      >
        While CosinorLab is designed to be user-friendly, you may occasionally
        encounter issues. This section provides solutions to common problems and
        guidance for optimal results.
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Before Processing:</strong> Always ensure your data meets the
          format requirements and contains sufficient data points for reliable
          analysis (typically 3+ days of continuous data).
        </Typography>
      </Alert>

      <ul style={{ paddingLeft: "2rem" }}>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            File Format Issues
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ensure your file is in the correct format and not corrupted. For CSV
            files, verify that the timestamp format is supported (ISO format
            recommended) and that required columns (timestamp, x, y, z for
            accelerometer data) are present.
          </Typography>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Data Quality Problems
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check that your data contains the required columns and that
            timestamp values are in a consistent format. Large gaps in data may
            affect analysis quality.
          </Typography>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Processing Time
          </Typography>
          <Typography variant="body2" color="text.secondary">
            For large files, processing may take several minutes - please be
            patient. The system shows real-time progress and will notify you
            when processing is complete.
          </Typography>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Processing Failures
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If processing fails, try adjusting the preprocessing parameters or
            check the error messages for guidance. Common issues include
            insufficient data points or incompatible data formats.
          </Typography>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Browser Compatibility
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
            with JavaScript enabled. Some features may not work properly in
            older browsers.
          </Typography>
        </li>
      </ul>

      <Divider sx={{ my: 4 }} />

      <Typography
        variant="h6"
        gutterBottom
        sx={{ mt: 4, mb: 2, color: "primary.main" }}
      >
        Advanced Features
      </Typography>
      <Typography
        variant="body1"
        paragraph
        sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
      >
        For experienced users and researchers, CosinorLab offers advanced
        functionality that enables sophisticated analysis and customization of
        the processing pipeline.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.300",
              height: "100%",
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Chip
                label="Bulk Processing"
                color="primary"
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Process multiple files simultaneously for batch analysis
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Chip
                label="Parameter Tuning"
                color="primary"
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Fine-tune preprocessing and feature extraction parameters for
                optimal results
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.300",
              height: "100%",
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Chip
                label="Custom Analysis"
                color="primary"
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Configure analysis parameters to match your specific research
                requirements
              </Typography>
            </Box>
            <Box>
              <Chip
                label="API Access"
                color="primary"
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Programmatic access for integration into research workflows
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography
        variant="h6"
        gutterBottom
        sx={{ mt: 4, mb: 2, color: "primary.main" }}
      >
        Best Practices
      </Typography>
      <Typography
        variant="body1"
        paragraph
        sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
      >
        Following these best practices will help you achieve the most reliable
        and meaningful results from your accelerometer data analysis.
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Data Quality:</strong> High-quality, continuous data with
          minimal gaps provides the most reliable analysis results. Aim for at
          least 3-7 days of continuous data for robust circadian rhythm
          analysis.
        </Typography>
      </Alert>

      <ul style={{ paddingLeft: "2rem" }}>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Data Collection
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use high-quality, continuous data with minimal gaps. Ensure your
            device is properly calibrated and worn consistently throughout the
            data collection period.
          </Typography>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Duration Requirements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Collect data over multiple days (3-7 days minimum) for more reliable
            circadian rhythm analysis. Longer periods provide better estimates
            of individual patterns.
          </Typography>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Data Preprocessing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and clean your data before processing to remove artifacts or
            invalid measurements. The system provides tools to identify and
            handle common data quality issues.
          </Typography>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Parameter Selection
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start with default parameters and adjust based on your specific
            research needs. Document any parameter changes for reproducibility
            in your research.
          </Typography>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Result Interpretation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consider the context of your data when interpreting results. Factors
            like age, health status, and lifestyle can influence circadian
            patterns and activity levels.
          </Typography>
        </li>
      </ul>

      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Need Help?</strong> If you encounter issues not covered in
          this documentation, please refer to our API documentation or contact
          the development team. We're committed to helping you achieve the best
          possible results.
        </Typography>
      </Alert>
    </Box>
  );
}

export default LabDocumentationSubTab;
