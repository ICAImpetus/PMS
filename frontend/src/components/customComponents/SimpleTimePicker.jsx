import React from "react";
import {
  MenuItem,
  Box,
  FormControl,
  InputLabel,
  Select,
  Typography,
  TextField,
} from "@mui/material";

const SimpleTimePicker = ({
  label,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
}) => {
  // Generate hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  // Generate minutes (00, 15, 30, 45)
  const minutes = ["00", "15", "30", "45"];

  // AM/PM options
  const periods = ["AM", "PM"];

  const getCurrentHour = () => {
    if (!value) return "12";
    return value.split(":")[0];
  };

  const getCurrentMinute = () => {
    if (!value) return "00";
    return value.split(":")[1].split(" ")[0];
  };

  const getCurrentPeriod = () => {
    if (!value) return "AM";
    return value.split(" ")[1];
  };

  const handleHourChange = (event) => {
    const newHour = event.target.value;
    const currentMinute = getCurrentMinute();
    const currentPeriod = getCurrentPeriod();
    const newTime = `${newHour}:${currentMinute} ${currentPeriod}`;
    onChange(newTime);
  };

  const handleMinuteChange = (event) => {
    const newMinute = event.target.value;
    const currentHour = getCurrentHour();
    const currentPeriod = getCurrentPeriod();
    const newTime = `${currentHour}:${newMinute} ${currentPeriod}`;
    onChange(newTime);
  };

  const handlePeriodChange = (event) => {
    const newPeriod = event.target.value;
    const currentHour = getCurrentHour();
    const currentMinute = getCurrentMinute();
    const newTime = `${currentHour}:${currentMinute} ${newPeriod}`;
    onChange(newTime);
  };

  return (
    <TextField
      fullWidth
      label={label}
      value={value || ""}
      onChange={() => {}} // Dummy onChange
      error={!!error}
      helperText={helperText}
      disabled={disabled}
      required
      variant="outlined"
      size="medium"
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
        },
        "& .MuiInputBase-input": {
          height: "auto",
        },
      }}
      InputProps={{
        inputComponent: () => (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              p: 1,
              width: "100%",
              minHeight: "56px", // Match standard TextField height
            }}
          >
            <FormControl variant="standard" sx={{ minWidth: 70, flex: 1 }}>
              <Select
                value={getCurrentHour()}
                onChange={handleHourChange}
                disabled={disabled}
                disableUnderline
                sx={{
                  "& .MuiSelect-select": {
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    backgroundColor: "transparent",
                  },
                }}
              >
                {hours.map((hour) => (
                  <MenuItem key={hour} value={hour.toString()}>
                    {hour}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="body1" sx={{ mx: 0.5 }}>
              :
            </Typography>

            <FormControl variant="standard" sx={{ minWidth: 70, flex: 1 }}>
              <Select
                value={getCurrentMinute()}
                onChange={handleMinuteChange}
                disabled={disabled}
                disableUnderline
                sx={{
                  "& .MuiSelect-select": {
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    backgroundColor: "transparent",
                  },
                }}
              >
                {minutes.map((minute) => (
                  <MenuItem key={minute} value={minute}>
                    {minute}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="standard" sx={{ minWidth: 70, flex: 1 }}>
              <Select
                value={getCurrentPeriod()}
                onChange={handlePeriodChange}
                disabled={disabled}
                disableUnderline
                sx={{
                  "& .MuiSelect-select": {
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    backgroundColor: "transparent",
                  },
                }}
              >
                {periods.map((period) => (
                  <MenuItem key={period} value={period}>
                    {period}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ),
      }}
    />
  );
  
};

export default SimpleTimePicker;
