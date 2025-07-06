import React, { useState } from "react";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { metricDescriptions } from "../../constants/metricDescriptions";

function SectionInfoButton({ metric }) {
  const [open, setOpen] = useState(false);
  
  if (!metric) return null;
  
  const desc = metricDescriptions[metric.toLowerCase()];
  if (!desc) return null;
  
  return (
    <>
      <IconButton
        size="small"
        onClick={() => setOpen(true)}
        aria-label={`Info about ${desc.title}`}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{desc.title}</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ whiteSpace: "pre-line" }}>
            {desc.description}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SectionInfoButton; 