import { useState, useRef } from "react";
import config from "../config";

export const useFileUpload = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (
    event,
    dataSource,
    fileType,
    dataType,
    timestampFormat,
    genericTimeFormat,
    genericTimeColumn,
    genericDataColumns
  ) => {
    console.log("handleFileUpload called", event);
    console.log("Current dataSource:", dataSource);
    const file = event.target.files[0];
    if (!file) return;

    // File size limit: 2GB
    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes
    if (file.size > MAX_SIZE) {
      setError("File is too large. Maximum allowed size is 2GB.");
      setUploadProgress(0);
      return;
    }

    setError(null);
    setSuccess(null);
    setData(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    // Set data_source based on dataSource for backend compatibility
    formData.append(
      "data_source",
      dataSource === "other"
        ? "other"
        : fileType === "binary"
        ? "samsung_galaxy_binary"
        : "samsung_galaxy_csv"
    );

    console.log("=== Upload Debug ===");
    console.log("dataSource:", dataSource);
    console.log("fileType:", fileType);
    console.log("dataType:", dataType);
    console.log("timestampFormat:", timestampFormat);

    // Add parameters for other data source
    if (dataSource === "other") {
      // For CSV files, we'll handle data_type in the column selection step
      if (fileType === "csv") {
        // Don't set data_type here - it will be set in handleColumnSelection
        formData.append("time_format", timestampFormat || "unix-ms"); // Default timestamp format
        console.log("Added time_format (CSV):", timestampFormat || "unix-ms");
      } else {
        // For other cases, use generic parameters
        // Don't set data_type here - it will be set in handleColumnSelection
        formData.append("time_format", genericTimeFormat);
        console.log("Added time_format (non-CSV):", genericTimeFormat);
      }
      formData.append("time_column", genericTimeColumn);
      formData.append("data_columns", genericDataColumns);
      console.log("Added time_column:", genericTimeColumn);
      console.log("Added data_columns:", genericDataColumns);
    }

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          setData(result);
          setUploadProgress(100);
          setSuccess(
            'File uploaded successfully. Click "Process Data" to continue.'
          );
        } else {
          const errorData = JSON.parse(xhr.responseText);
          throw new Error(errorData.detail || "Failed to upload file");
        }
      });

      xhr.addEventListener("error", () => {
        throw new Error("Network error occurred during upload");
      });

      xhr.open("POST", config.getApiUrl("upload"));
      xhr.send(formData);
    } catch (err) {
      setError(err.message);
      setUploadProgress(0);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e, dataSource, fileType, dataType) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dataSource || !fileType) return; // Only allow drag if both dataSource and fileType are selected
    if (dataSource === "other" && !dataType) return; // Also require dataType for 'other' data source
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e, dataSource, fileType, dataType) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dataSource || !fileType) return; // Only allow drop if both dataSource and fileType are selected
    if (dataSource === "other" && !dataType) return; // Also require dataType for 'other' data source
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(
        { target: { files: e.dataTransfer.files } },
        dataSource,
        fileType,
        dataType
      );
    }
  };

  return {
    data,
    setData,
    error,
    setError,
    success,
    setSuccess,
    uploadProgress,
    setUploadProgress,
    dragActive,
    setDragActive,
    fileInputRef,
    handleFileUpload,
    handleDrag,
    handleDrop,
  };
};
