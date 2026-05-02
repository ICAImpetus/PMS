import React from "react";
import { Box, TextField, Button, Radio, RadioGroup, FormControl, FormControlLabel, FormLabel } from "@mui/material";
// import { relationshipManagers as relationshipManagerOptions } from "../../data/outBoundFormData";

const Section1 = ({ dispatch, data }) => {
  const [localData, setLocalData] = React.useState(data || {});

  const handleInputChange = (e) => {
    setLocalData({ ...localData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    dispatch({
      type: "UPDATE_SECTION_DATA",
      payload: { sectionIndex: 0, data: localData },
    });
    dispatch({ type: "NEXT_SECTION" });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400, }}>
      {/* Name field */}
      {/* <TextField
        name="name"
        label="Name"
        value={localData.name || ""}
        onChange={handleInputChange}
        fullWidth
      /> */}

      {/* Relationship Manager field */}
      <FormControl>
        <FormLabel>Relationship Manager</FormLabel>
        <RadioGroup
          row // Ensures options are in one line
          name="relationshipManager"
          value={localData.relationshipManager || ""}
          onChange={handleInputChange}
        >
          {relationshipManagerOptions.map((option) => (
            <FormControlLabel
              key={option}
              value={option}
              control={<Radio />}
              label={option}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Next button */}
      <Button variant="contained" onClick={handleNext}>
        Next
      </Button>
    </Box>
  );
};

export default Section1;
