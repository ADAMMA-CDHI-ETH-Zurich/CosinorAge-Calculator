import React from "react";
import { Box, Typography } from "@mui/material";

// HorizontalScale component for IS and IV
function HorizontalScale({ value, min, max, color = "#1976d2", label }) {
  // Clamp value to [min, max]
  const clamped = Math.max(min, Math.min(max, value));
  const percent = ((clamped - min) / (max - min)) * 100;
  
  return (
    <Box sx={{ width: "100%", mt: 2, mb: 2 }}>
      {label && (
        <Typography variant="subtitle2" align="center" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <Box sx={{ position: "relative", height: 48, width: "100%" }}>
        {/* Value above marker */}
        <Box
          sx={{
            position: "absolute",
            left: `calc(${percent}% - 20px)`,
            top: 0,
            width: 40,
            textAlign: "center",
            zIndex: 3,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {clamped.toFixed(2)}
          </Typography>
        </Box>
        {/* Horizontal line */}
        <Box
          sx={{
            position: "absolute",
            top: 32,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: "#ccc",
            borderRadius: 2,
          }}
        />
        {/* Marker */}
        <Box
          sx={{
            position: "absolute",
            top: 24,
            left: `calc(${percent}% - 10px)`,
            width: 20,
            height: 20,
            bgcolor: color,
            borderRadius: "50%",
            border: "2px solid #fff",
            boxShadow: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        />
        {/* Min label */}
        <Typography
          variant="caption"
          sx={{ position: "absolute", left: 0, top: 40 }}
        >
          {min}
        </Typography>
        {/* Max label */}
        <Typography
          variant="caption"
          sx={{ position: "absolute", right: 0, top: 40 }}
        >
          {max}
        </Typography>
      </Box>
    </Box>
  );
}

export default HorizontalScale; 