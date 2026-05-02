import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
// import { callStatus as callStatusArray } from "../../../data/outBoundFormData";

const Section2 = ({ dispatch, data }) => {
  const [localData, setLocalData] = useState(data || {});
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setLocalData({ ...localData, [e.target.name]: e.target.value });
  };

  const validateFields = () => {
    const newErrors = {};
    if (!localData.patientName) {
      newErrors.patientName = "Patient Name is required";
    }
    if (!localData.contactNumber) {
      newErrors.contactNumber = "Contact Number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateFields()) {
      dispatch({
        type: "UPDATE_SECTION_DATA",
        payload: { sectionIndex: 1, data: localData }, // Update for Section 2
      });
      dispatch({ type: "NEXT_SECTION" });
    }
  };

  return (
    <Box
      sx={{
        width: "100%", // Ensure it takes up the available width
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          // maxWidth: 600,
          maxWidth: "700px", // Explicitly set maxWidth
          width: "100%", // Ensures it takes full available width up to maxWidth
          margin: "0 auto",
        }}
      >
        {/* Caller Detail (optional) */}
        <TextField
          name="callerDetail"
          label="Caller Detail (Optional)"
          value={localData.callerDetail || ""}
          onChange={handleInputChange}
          fullWidth
        />

        {/* Patient Name (required) */}
        <TextField
          name="patientName"
          label="Patient Name"
          value={localData.patientName || ""}
          onChange={handleInputChange}
          error={!!errors.patientName}
          helperText={errors.patientName}
          fullWidth
          required
        />

        {/* Contact Number (required) */}
        <TextField
          name="contactNumber"
          label="Contact Number"
          value={localData.contactNumber || ""}
          onChange={handleInputChange}
          error={!!errors.contactNumber}
          helperText={errors.contactNumber}
          fullWidth
          required
        />

        {/* Dropdown Select */}
        <FormControl fullWidth>
          <InputLabel id="call-status-label">Call Status</InputLabel>
          <Select
            // labelId="call-status-label"
            label="Call Status"
            name="callStatus"
            value={localData.callStatus || ""}
            onChange={handleInputChange}
          >
            {callStatusArray.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Next Button */}
        <Button variant="contained" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default Section2;
