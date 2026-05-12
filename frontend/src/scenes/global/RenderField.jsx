import React from 'react';
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    FormControl,
    FormLabel,
    FormControlLabel,
    Radio,
    RadioGroup,
    Checkbox,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
// import RatingWithLabels from './RatingWithLabels'; // Assuming this is a custom component
import RatingWithLabels from '../outboundForm/RatingWithLabels';

export const renderFieldInFormGeneration = (field, index, handleChange, readonly = false) => {

    //   console.log(formData); // Debugging
    //   const fieldValue = formData[field.name] || ''; // Use field.name dynamically
    // const fieldValue = field.name || ''; // Use field.name dynamically
    const fieldValue = ''; // Use field.name dynamically



    const renderQuestion = field.question ? (
        <Typography variant="subtitle1" marginTop={3}>
            {field.question}
        </Typography>
    ) : null;

    switch (field.type) {
        case 'text':
            return (
                <Box key={`${field.name}-${index}`}>
                    {renderQuestion}
                    <TextField
                        label={field.label}
                        value={fieldValue}
                        onChange={!readonly ? (e) => handleChange(field.name, e.target.value) : undefined}
                        fullWidth
                        margin="normal"
                        InputProps={{ readOnly: readonly }}
                    />
                </Box>
            );

        case 'select':
            return (
                <Box key={`${field.name}-${index}`}>
                    {renderQuestion}
                    <TextField
                        select
                        label={field.label}
                        value={fieldValue}
                        onChange={!readonly ? (e) => handleChange(field.name, e.target.value) : undefined}
                        fullWidth
                        margin="normal"
                    // InputProps={{ readOnly: readonly }}
                    >
                        {field.options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            );

        case 'multiple-options':
            return (
                <Box key={`${field.name}-${index}`}>
                    {renderQuestion}
                    <FormControl component="fieldset" margin="normal" fullWidth>
                        {/* <FormLabel component="legend">{field.label}</FormLabel> */}
                        <RadioGroup
                            name={field.name}
                            value={fieldValue}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        >
                            {field.options?.map((option) => (
                                <FormControlLabel
                                    key={option.value}
                                    value={option.value}
                                    control={<Radio />}
                                    label={option.label}
                                    disabled={readonly}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </Box>
            );

        case 'rating':
            return (
                <Box key={`${field.name}-${index}`}>
                    {renderQuestion}
                    <RatingWithLabels
                        name={field.name}
                        value={fieldValue}
                        onChange={(event, newValue) => handleChange(field.name, newValue)}
                        readOnly={readonly}
                    />
                </Box>
            );

        case 'checkbox':
            return (
                <Box key={`${field.name}-${index}`}>
                    {renderQuestion}
                    <FormControl component="fieldset" margin="normal" fullWidth>
                        {/* <FormLabel component="legend">{field.label}</FormLabel> */}
                        {field.options?.map((option) => (
                            <FormControlLabel
                                key={option.value}
                                control={
                                    <Checkbox
                                        checked={field.name?.includes(option.value) || false}
                                        onChange={
                                            (e) => {
                                                const updatedValue = field.name || [];
                                                if (e.target.checked) {
                                                    handleChange(field.name, [...updatedValue, option.value]);
                                                } else {
                                                    handleChange(field.name, updatedValue.filter((val) => val !== option.value));
                                                }
                                            }

                                        }
                                        disabled={readonly}
                                    />
                                }
                                label={option.label}
                            />
                        ))}
                    </FormControl>
                </Box>
            );

        case 'date':
            return (
                <>
                    {renderQuestion}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label={field.label}
                            value={fieldValue ? dayjs(fieldValue) : null}
                            onChange={
                                (date) => {
                                    if (date) {
                                        const formattedDate = dayjs(date).format('YYYY-MM-DD');
                                        handleChange(field.name, formattedDate);
                                    } else {
                                        handleChange(field.name, null);
                                    }
                                }

                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="normal" InputProps={{ readOnly: readonly }} />
                            )}
                        />
                    </LocalizationProvider>
                </>
            );

        case 'time':
            return (
                <>
                    {renderQuestion}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                            label={field.label}
                            value={fieldValue ? dayjs(fieldValue, 'HH:mm') : null}
                            onChange={
                                (time) => {
                                    if (time && dayjs(time).isValid()) {
                                        const formattedTime = dayjs(time).format('HH:mm');
                                        handleChange(field.name, formattedTime);
                                    } else {
                                        handleChange(field.name, null);
                                    }
                                }

                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="normal" InputProps={{ readOnly: readonly }} />
                            )}
                        />
                    </LocalizationProvider>
                </>
            );

        default:
            console.warn(`Unknown field type: ${field.type}`);
            return null;
    }
};
