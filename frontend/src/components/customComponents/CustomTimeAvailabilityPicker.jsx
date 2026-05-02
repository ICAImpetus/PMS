import React from 'react';
import { TextField, MenuItem, Box, Typography, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const CustomTimeAvailabilityPicker = ({ 
  label, 
  value, 
  onChange, 
  error, 
  helperText, 
  disabled = false 
}) => {
  // Parse existing value to get time slots
  const parseTimeSlots = (timeString) => {
    if (!timeString || timeString === "24/7") return [{ type: "24/7", from: "", to: "" }];
    if (timeString === "Mon-Fri, 9-5") return [{ type: "weekdays", from: "9:00 AM", to: "5:00 PM" }];
    if (timeString === "Weekends, 10-4") return [{ type: "weekends", from: "10:00 AM", to: "4:00 PM" }];
    
    // Parse custom time slots
    const slots = [];
    if (timeString.includes("Custom:")) {
      const customPart = timeString.replace("Custom:", "").trim();
      const slotStrings = customPart.split(";").filter(s => s.trim());
      slotStrings.forEach(slotStr => {
        const [days, timeRange] = slotStr.split("-").map(s => s.trim());
        if (timeRange && timeRange.includes("to")) {
          const [from, to] = timeRange.split("to").map(t => t.trim());
          slots.push({ type: days || "custom", from, to });
        }
      });
    }
    return slots.length > 0 ? slots : [{ type: "custom", from: "", to: "" }];
  };

  const [timeSlots, setTimeSlots] = React.useState(parseTimeSlots(value));

  // Generate hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minutes (00, 15, 30, 45)
  const minutes = ['00', '15', '30', '45'];
  
  // AM/PM options
  const periods = ['AM', 'PM'];

  // Day type options
  const dayTypes = [
    { value: "24/7", label: "24/7" },
    { value: "weekdays", label: "Weekdays (Mon-Fri)" },
    { value: "weekends", label: "Weekends (Sat-Sun)" },
    { value: "custom", label: "Custom Days" }
  ];

  const updateTimeString = (newSlots) => {
    if (newSlots.length === 0) return "";
    
    // Check if it's a predefined option
    if (newSlots.length === 1) {
      const slot = newSlots[0];
      if (slot.type === "24/7") return "24/7";
      if (slot.type === "weekdays" && slot.from === "9:00 AM" && slot.to === "5:00 PM") return "Mon-Fri, 9-5";
      if (slot.type === "weekends" && slot.from === "10:00 AM" && slot.to === "4:00 PM") return "Weekends, 10-4";
    }
    
    // Build custom string
    const customSlots = newSlots.map(slot => {
      if (slot.type === "24/7") return "24/7";
      return `${slot.type} - ${slot.from} to ${slot.to}`;
    });
    
    return `Custom: ${customSlots.join("; ")}`;
  };

  const handleSlotChange = (index, field, newValue) => {
    const newSlots = [...timeSlots];
    newSlots[index] = { ...newSlots[index], [field]: newValue };
    setTimeSlots(newSlots);
    onChange(updateTimeString(newSlots));
  };

  const addTimeSlot = () => {
    const newSlots = [...timeSlots, { type: "custom", from: "", to: "" }];
    setTimeSlots(newSlots);
    onChange(updateTimeString(newSlots));
  };

  const removeTimeSlot = (index) => {
    const newSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(newSlots);
    onChange(updateTimeString(newSlots));
  };

  const TimeSlotRow = ({ slot, index }) => {
    const handleHourChange = (field) => (event) => {
      const newHour = event.target.value;
      const currentTime = slot[field] || "12:00 AM";
      const currentMinute = currentTime.split(':')[1].split(' ')[0];
      const currentPeriod = currentTime.split(' ')[1];
      const newTime = `${newHour}:${currentMinute} ${currentPeriod}`;
      handleSlotChange(index, field, newTime);
    };

    const handleMinuteChange = (field) => (event) => {
      const newMinute = event.target.value;
      const currentTime = slot[field] || "12:00 AM";
      const currentHour = currentTime.split(':')[0];
      const currentPeriod = currentTime.split(' ')[1];
      const newTime = `${currentHour}:${newMinute} ${currentPeriod}`;
      handleSlotChange(index, field, newTime);
    };

    const handlePeriodChange = (field) => (event) => {
      const newPeriod = event.target.value;
      const currentTime = slot[field] || "12:00 AM";
      const currentHour = currentTime.split(':')[0];
      const currentMinute = currentTime.split(':')[1].split(' ')[0];
      const newTime = `${currentHour}:${currentMinute} ${newPeriod}`;
      handleSlotChange(index, field, newTime);
    };

    const getCurrentHour = (field) => {
      const time = slot[field] || "12:00 AM";
      return time.split(':')[0];
    };

    const getCurrentMinute = (field) => {
      const time = slot[field] || "12:00 AM";
      return time.split(':')[1].split(' ')[0];
    };

    const getCurrentPeriod = (field) => {
      const time = slot[field] || "12:00 AM";
      return time.split(' ')[1];
    };

    return (
      <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <TextField
            select
            label="Type"
            value={slot.type}
            onChange={(e) => handleSlotChange(index, 'type', e.target.value)}
            disabled={disabled}
            size="small"
            sx={{ minWidth: 150 }}
          >
            {dayTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
          
          {slot.type !== "24/7" && (
            <>
              <TextField
                select
                label="From Hour"
                value={getCurrentHour('from')}
                onChange={handleHourChange('from')}
                disabled={disabled}
                size="small"
                sx={{ minWidth: 80 }}
              >
                {hours.map((hour) => (
                  <MenuItem key={hour} value={hour.toString()}>
                    {hour}
                  </MenuItem>
                ))}
              </TextField>

              <Typography variant="h6">:</Typography>

              <TextField
                select
                label="Min"
                value={getCurrentMinute('from')}
                onChange={handleMinuteChange('from')}
                disabled={disabled}
                size="small"
                sx={{ minWidth: 80 }}
              >
                {minutes.map((minute) => (
                  <MenuItem key={minute} value={minute}>
                    {minute}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="AM/PM"
                value={getCurrentPeriod('from')}
                onChange={handlePeriodChange('from')}
                disabled={disabled}
                size="small"
                sx={{ minWidth: 80 }}
              >
                {periods.map((period) => (
                  <MenuItem key={period} value={period}>
                    {period}
                  </MenuItem>
                ))}
              </TextField>

              <Typography variant="body2" sx={{ mx: 1 }}>to</Typography>

              <TextField
                select
                label="To Hour"
                value={getCurrentHour('to')}
                onChange={handleHourChange('to')}
                disabled={disabled}
                size="small"
                sx={{ minWidth: 80 }}
              >
                {hours.map((hour) => (
                  <MenuItem key={hour} value={hour.toString()}>
                    {hour}
                  </MenuItem>
                ))}
              </TextField>

              <Typography variant="h6">:</Typography>

              <TextField
                select
                label="Min"
                value={getCurrentMinute('to')}
                onChange={handleMinuteChange('to')}
                disabled={disabled}
                size="small"
                sx={{ minWidth: 80 }}
              >
                {minutes.map((minute) => (
                  <MenuItem key={minute} value={minute}>
                    {minute}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="AM/PM"
                value={getCurrentPeriod('to')}
                onChange={handlePeriodChange('to')}
                disabled={disabled}
                size="small"
                sx={{ minWidth: 80 }}
              >
                {periods.map((period) => (
                  <MenuItem key={period} value={period}>
                    {period}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}

          {timeSlots.length > 1 && (
            <IconButton
              onClick={() => removeTimeSlot(index)}
              disabled={disabled}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
        {label}
      </Typography>
      
      {timeSlots.map((slot, index) => (
        <TimeSlotRow key={index} slot={slot} index={index} />
      ))}
      
      <Button
        onClick={addTimeSlot}
        disabled={disabled}
        startIcon={<AddIcon />}
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
      >
        Add Time Slot
      </Button>
      
      {helperText && (
        <Typography variant="caption" color={error ? "error" : "text.secondary"} sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default CustomTimeAvailabilityPicker;
