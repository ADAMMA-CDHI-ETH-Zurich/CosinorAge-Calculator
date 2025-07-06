import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import SingleIndividualLabSubTab from "./subcomponents/SingleIndividualLabSubTab";
import { MultiIndividualTab } from "./subcomponents/MultiIndividualLabSubTab";

const LabTab = ({
  data,
  setData,
  dataSource,
  setDataSource,
  predictedAge,
  setPredictedAge,
  chronologicalAge,
  setChronologicalAge,
  gender,
  setGender,
  error,
  setError,
  success,
  setSuccess,
  processing,
  setProcessing,
  processingTime,
  setProcessingTime,
  timerInterval,
  setTimerInterval,
  dragActive,
  setDragActive,
  uploadProgress,
  setUploadProgress,
  fileInputRef,
  preprocessDialogOpen,
  setPreprocessDialogOpen,
  preprocessParams,
  setPreprocessParams,
  featureParams,
  setFeatureParams,
  gettingStartedOpen,
  setGettingStartedOpen,
  fileType,
  setFileType,
  dataType,
  setDataType,
  dataUnit,
  setDataUnit,
  timestampFormat,
  setTimestampFormat,
  isGeneric,
  setIsGeneric,
  genericDataType,
  setGenericDataType,
  genericTimeFormat,
  setGenericTimeFormat,
  genericTimeColumn,
  setGenericTimeColumn,
  genericDataColumns,
  setGenericDataColumns,
  csvColumns,
  setCsvColumns,
  csvPreview,
  setCsvPreview,
  showColumnSelection,
  setShowColumnSelection,
  selectedTimeColumn,
  setSelectedTimeColumn,
  selectedDataColumns,
  setSelectedDataColumns,
  columnSelectionComplete,
  setColumnSelectionComplete,
  handleReset,
}) => {
  const [labSubTab, setLabSubTab] = useState(() => {
    const savedSubTab = localStorage.getItem("labSubTab");
    return savedSubTab || "single";
  });

  const handleLabSubTabChange = (event, newValue) => {
    setLabSubTab(newValue);
  };

  // Save labSubTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("labSubTab", labSubTab);
  }, [labSubTab]);

  return (
    <>
      {/* Lab Subtabs */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              mb: 3,
            }}
          >
            <Tabs
              value={labSubTab}
              onChange={handleLabSubTabChange}
              sx={{
                "& .MuiTabs-flexContainer": {
                  justifyContent: "center",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  width: "50%", // 50% width each
                  maxWidth: "50%",
                  flex: 1,
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "primary.main",
                  height: 3,
                },
              }}
            >
              <Tab label="Single Individual" value="single" />
              <Tab label="Multi Individual" value="multi" />
            </Tabs>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Single Individual Tab Content */}
        {labSubTab === "single" && (
          <SingleIndividualLabSubTab
            data={data}
            setData={setData}
            dataSource={dataSource}
            setDataSource={setDataSource}
            predictedAge={predictedAge}
            setPredictedAge={setPredictedAge}
            chronologicalAge={chronologicalAge}
            setChronologicalAge={setChronologicalAge}
            gender={gender}
            setGender={setGender}
            error={error}
            setError={setError}
            success={success}
            setSuccess={setSuccess}
            processing={processing}
            setProcessing={setProcessing}
            processingTime={processingTime}
            setProcessingTime={setProcessingTime}
            timerInterval={timerInterval}
            setTimerInterval={setTimerInterval}
            dragActive={dragActive}
            setDragActive={setDragActive}
            uploadProgress={uploadProgress}
            setUploadProgress={setUploadProgress}
            fileInputRef={fileInputRef}
            preprocessDialogOpen={preprocessDialogOpen}
            setPreprocessDialogOpen={setPreprocessDialogOpen}
            preprocessParams={preprocessParams}
            setPreprocessParams={setPreprocessParams}
            featureParams={featureParams}
            setFeatureParams={setFeatureParams}
            gettingStartedOpen={gettingStartedOpen}
            setGettingStartedOpen={setGettingStartedOpen}
            fileType={fileType}
            setFileType={setFileType}
            dataType={dataType}
            setDataType={setDataType}
            dataUnit={dataUnit}
            setDataUnit={setDataUnit}
            timestampFormat={timestampFormat}
            setTimestampFormat={setTimestampFormat}
            isGeneric={isGeneric}
            setIsGeneric={setIsGeneric}
            genericDataType={genericDataType}
            setGenericDataType={setGenericDataType}
            genericTimeFormat={genericTimeFormat}
            setGenericTimeFormat={setGenericTimeFormat}
            genericTimeColumn={genericTimeColumn}
            setGenericTimeColumn={setGenericTimeColumn}
            genericDataColumns={genericDataColumns}
            setGenericDataColumns={setGenericDataColumns}
            csvColumns={csvColumns}
            setCsvColumns={setCsvColumns}
            csvPreview={csvPreview}
            setCsvPreview={setCsvPreview}
            showColumnSelection={showColumnSelection}
            setShowColumnSelection={setShowColumnSelection}
            selectedTimeColumn={selectedTimeColumn}
            setSelectedTimeColumn={setSelectedTimeColumn}
            selectedDataColumns={selectedDataColumns}
            setSelectedDataColumns={setSelectedDataColumns}
            columnSelectionComplete={columnSelectionComplete}
            setColumnSelectionComplete={setColumnSelectionComplete}
            handleReset={handleReset}
          />
        )}

        {/* Multi Individual Tab Content */}
        {labSubTab === "multi" && <MultiIndividualTab />}
      </Grid>
    </>
  );
};

export default LabTab; 