import { TextField, MenuItem, Button, Box, Rating, Typography, useTheme, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Checkbox } from '@mui/material';
import { styled } from "@mui/system";
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Custom styled Rating component with spacing between stars
const SpacedRating = styled(Rating)({
    '& .MuiRating-icon': {
        margin: '0 10px', // Adjust the margin to control spacing
    },
});


export const renderField = (field, index, handleChange, formData) => {
    console.log('Rendering field:', field); // Debugging to log field
    console.log(formData); // Debugging
    const fieldValue = formData[field.name] || ""; // Use field.name dynamically
    console.log('Field value:', fieldValue);

    // If the field has a 'question' property, show it as a Typography above the field
    const renderQuestion = field.question ? (
        <Typography variant="subtitle1" marginTop={3}>{field.question}</Typography>
    ) : null;

    switch (field.type) {
        case 'text':
            return (
                <Box key={`${field.name}-${index}`}  >
                    {renderQuestion}
                    <TextField
                        label={field.label}
                        required={field.required}
                        value={fieldValue}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </Box>
            );

        case 'select':
            return (
                <Box key={`${field.name}-${index}`}  >
                    {renderQuestion}
                    <TextField
                        key={`${field.name}-${index}`}
                        select
                        label={field.label}
                        required={field.required}
                        value={fieldValue}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        fullWidth
                        margin="normal"
                    >
                        {field.options?.map((option) => (
                            <MenuItem key={option.name} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            );

        case 'multiple-options': // Radio buttons case
            return (
                <Box key={`${field.name}-${index}`}  >
                    {renderQuestion}
                    <FormControl component="fieldset" margin="normal" fullWidth>
                        <FormLabel component="legend">{field.label}</FormLabel>
                        <RadioGroup
                            aria-label={field.label}
                            name={field.name}
                            value={fieldValue}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        >
                            {field.options?.map((option) => (
                                <FormControlLabel
                                    key={option.value}
                                    value={option.value}
                                    control={<Radio required={field.required} />}
                                    label={option.label}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </Box>
            );

        case "rating":
            return (
                <Box key={`${field.name}-${index}`}  >
                    {renderQuestion}
                    <SpacedRating
                        name={field.name}
                        value={fieldValue}
                        onChange={(event, newValue) => handleChange(field.name, newValue)}
                        required={field.required}
                    />
                </Box>
            );

        case 'checkbox': // Checkbox case
            return (
                <Box key={`${field.name}-${index}`}  >
                    {renderQuestion}
                    <FormControl component="fieldset" margin="normal" fullWidth>
                        <FormLabel component="legend">{field.label}</FormLabel>
                        {field.options?.map((option) => (
                            <FormControlLabel
                                key={option.value}
                                control={
                                    <Checkbox
                                        checked={formData[field.name]?.includes(option.value) || false}
                                        onChange={(e) => {
                                            const updatedValue = formData[field.name] || [];
                                            if (e.target.checked) {
                                                handleChange(field.name, [...updatedValue, option.value]);
                                            } else {
                                                handleChange(field.name, updatedValue.filter(val => val !== option.value));
                                            }
                                        }}
                                    />
                                }
                                label={option.label}
                            />
                        ))}
                    </FormControl>
                </Box>
            );

        case 'date': // Date picker case
            return (
                // <Box key={`${field.name}-${index}`}  > //*==> comented out because size of date picker and time picker becomes fixed when wrapped in Box
                <>
                    {renderQuestion}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label={field.label}
                            value={fieldValue ? dayjs(fieldValue) : null} // Ensure proper parsing
                            onChange={(date) => {
                                if (date) {
                                    const formattedDate = dayjs(date).format('YYYY-MM-DD'); // Desired format
                                    handleChange(field.name, formattedDate);
                                } else {
                                    handleChange(field.name, null);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField {...params} fullWidth required={field.required} margin="normal" />
                            )}
                        />
                    </LocalizationProvider>
                {/* </Box> */}
                </>
            );

        case 'time': // Time picker case
            return (
                // <Box key={`${field.name}-${index}`}  >
                <>
                    {renderQuestion}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                            label={field.label}
                            value={fieldValue ? dayjs(fieldValue, 'HH:mm') : null} // Parse the value with a format
                            onChange={(time) => {
                                if (time && dayjs(time).isValid()) {
                                    // Format and update the time
                                    const formattedTime = dayjs(time).format('HH:mm');
                                    handleChange(field.name, formattedTime);
                                } else {
                                    // Handle invalid or null time
                                    handleChange(field.name, null);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    required={field.required}
                                    margin="normal"
                                    error={!!params.error} // Highlight errors in the input
                                    helperText={params.error ? "Invalid time" : ""} // Show helper text for invalid input
                                />
                            )}
                        />
                    </LocalizationProvider>
                {/* </Box> */}
                </>
            );

        default:
            console.warn(`Unknown field type: ${field.type}`); // Warning for unknown field type
            return null;
    }
};