import React from "react";
import { Box, Typography } from "@mui/material";

function LabDocumentationSubTab() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: "primary.main", mb: 3 }}
      >
        Lab Documentation
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome to the Lab Documentation section. This area provides
        comprehensive guides and tutorials for using the CosinorLab interactive
        interface.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Getting Started
      </Typography>
      <Typography variant="body1" paragraph>
        The Lab interface allows you to upload, process, and analyze
        accelerometer data through an intuitive web interface. Follow these
        steps to get started:
      </Typography>

      <ol style={{ paddingLeft: "2rem", marginBottom: "2rem" }}>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1">
            <strong>Upload Data:</strong> Select your data source (Samsung
            Galaxy Smartwatch) and file type (Binary ZIP or CSV), then upload
            your accelerometer data file.
          </Typography>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1">
            <strong>Configure Parameters:</strong> Adjust preprocessing and
            feature extraction parameters according to your needs, or use the
            default settings.
          </Typography>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1">
            <strong>Process Data:</strong> Click "Process Data" to extract
            features and generate visualizations.
          </Typography>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Typography variant="body1">
            <strong>View Results:</strong> Explore the generated features,
            visualizations, and optionally predict biological age.
          </Typography>
        </li>
      </ol>

      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Supported Data Formats
      </Typography>
      <Typography variant="body1" paragraph>
        Currently, the Lab supports Samsung Galaxy Smartwatch accelerometer data
        in the following formats:
      </Typography>
      <ul style={{ paddingLeft: "2rem", marginBottom: "2rem" }}>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            <strong>Binary ZIP:</strong> Raw accelerometer data files from
            Samsung Galaxy Watch devices
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
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
      <ul style={{ paddingLeft: "2rem", marginBottom: "2rem" }}>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            <strong>Cosinor Analysis:</strong> Circadian rhythm analysis with
            mesor, amplitude, and acrophase calculations
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            <strong>Non-parametric Features:</strong> Interdaily stability,
            intradaily variability, and relative amplitude metrics
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            <strong>Physical Activity Analysis:</strong> Sedentary, light,
            moderate, and vigorous activity classification
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            <strong>Sleep Analysis:</strong> Sleep onset, duration, and quality
            metrics
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            <strong>Biological Age Prediction:</strong> Age prediction based on
            activity patterns
          </Typography>
        </li>
      </ul>

      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Troubleshooting
      </Typography>
      <Typography variant="body1" paragraph>
        If you encounter issues:
      </Typography>
      <ul style={{ paddingLeft: "2rem" }}>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            Ensure your file is in the correct format and not corrupted
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            Check that your data contains the required columns (timestamp, x, y,
            z for accelerometer data)
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            Verify that your timestamp format is supported (ISO format
            recommended)
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            For large files, processing may take several minutes - please be
            patient
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            If processing fails, try adjusting the preprocessing parameters or
            check the error messages for guidance
          </Typography>
        </li>
      </ul>

      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Advanced Features
      </Typography>
      <Typography variant="body1" paragraph>
        The Lab also offers advanced functionality:
      </Typography>
      <ul style={{ paddingLeft: "2rem", marginBottom: "2rem" }}>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            <strong>Bulk Processing:</strong> Process multiple files
            simultaneously for batch analysis
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            <strong>Parameter Tuning:</strong> Fine-tune preprocessing and
            feature extraction parameters for optimal results
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            <strong>Data Export:</strong> Download processed features and
            results for further analysis
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            <strong>Visualization Options:</strong> Customize charts and graphs
            to focus on specific aspects of your data
          </Typography>
        </li>
      </ul>

      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Best Practices
      </Typography>
      <Typography variant="body1" paragraph>
        For optimal results:
      </Typography>
      <ul style={{ paddingLeft: "2rem" }}>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            Use high-quality, continuous data with minimal gaps
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            Ensure your device is properly calibrated and worn consistently
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            Collect data over multiple days for more reliable circadian rhythm
            analysis
          </Typography>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Typography variant="body1">
            Review and clean your data before processing to remove artifacts or
            invalid measurements
          </Typography>
        </li>
      </ul>
    </Box>
  );
}

export default LabDocumentationSubTab;
