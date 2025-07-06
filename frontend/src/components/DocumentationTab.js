import React, { useState, useEffect } from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";
import APIDocumentationSubTab from "./subcomponents/APIDocumentationSubTab";
import LabDocumentationSubTab from "./subcomponents/LabDocumentationSubTab";

function EnhancedDocumentationTab() {
  const [documentationType, setDocumentationType] = useState(() => {
    const savedType = localStorage.getItem("documentationType");
    return savedType || "lab";
  });

  // Save documentationType to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("documentationType", documentationType);
  }, [documentationType]);

  const handleDocumentationTypeChange = (event, newValue) => {
    setDocumentationType(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Documentation Type Selection */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={documentationType}
            onChange={handleDocumentationTypeChange}
            sx={{
              width: "100%",
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1rem",
                width: "50%", // 50% width each
                maxWidth: "50%",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "primary.main",
                height: 3,
              },
            }}
          >
            <Tab label="Lab Documentation" value="lab" />
            <Tab label="API Documentation" value="api" />
          </Tabs>
        </Box>

        {/* Lab Documentation Content */}
        {documentationType === "lab" && <LabDocumentationSubTab />}

        {/* API Documentation Content */}
        {documentationType === "api" && <APIDocumentationSubTab />}
      </Paper>
    </Box>
  );
}

export default EnhancedDocumentationTab;
