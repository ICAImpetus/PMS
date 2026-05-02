import React from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';

const DayCareDetailsForm = React.memo(({ values, handleChange }) => {
    const { dayCareDetails } = values;
    const theme = useTheme();

    const textFieldStyleObj = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#fff' : 'black', // Border color
            },
            '&:hover fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#379777' : '#379777', // Border color on hover
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Border color on focus
                borderWidth: 2, // Optional: make the border thicker on focus
            },
        },
        '& .MuiInputLabel-root': {
            color: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Label color
        },
        '& .MuiFormHelperText-root': {
            color: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Helper text color
        },
    };

    const FormControlStyleObj = {
        '& .MuiInputLabel-root': {
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
        },
        '& .MuiSelect-root': {
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'dark' ? 'lightgreen' : 'black',
        },
        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
            borderWidth: 2,
        },
    };

    return (
        <Box mb={4} p={2} border={1} borderRadius={2}>
            <Typography variant="h6" gutterBottom>Day Care Details</Typography>

            {/* Number of Beds */}
            <Box mb={2}>
                <TextField
                    variant='filled'
                    label="Number of Beds"
                    name="dayCareDetails.noOfBeds"
                    value={dayCareDetails.noOfBeds || ''}
                    onChange={handleChange}
                    fullWidth
                />
            </Box>

            {/* Charges */}
            <Box mb={2}>
                <TextField
                    variant='filled'
                    label="Charges"
                    name="dayCareDetails.charges"
                    value={dayCareDetails.charges || ''}
                    onChange={handleChange}
                    fullWidth
                />
            </Box>

            {/* Location */}
            <Box mb={2}>
                <TextField
                    variant='filled'
                    label="Location"
                    name="dayCareDetails.location"
                    value={dayCareDetails.location || ''}
                    onChange={handleChange}
                    fullWidth
                />
            </Box>

            {/* Category */}
            <Box mb={2}>
                {/* <FormControl fullWidth sx={FormControlStyleObj}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        label="Category"
                        name="dayCareDetails.category"
                        value={dayCareDetails.category || ''}
                        onChange={handleChange}
                    >
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="Private">Private</MenuItem>
                        <MenuItem value="VIP">VIP</MenuItem>
                    </Select>
                </FormControl> */}
                <FormControl fullWidth sx={FormControlStyleObj}>
                    {/* <InputLabel>Category</InputLabel> */}
                    <Typography>Category</Typography>
                    <Select
                        label="Category"
                        name="dayCareDetails.category"
                        value={dayCareDetails.category || ''}
                        onChange={handleChange}
                        variant="filled"
                    >
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="Private">Private</MenuItem>
                        <MenuItem value="VIP">VIP</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Service Type */}
            <Box mb={2}>
                <TextField
                    variant='filled'
                    label="Service Type"
                    name="dayCareDetails.serviceType"
                    value={dayCareDetails.serviceType || ''}
                    onChange={handleChange}
                    fullWidth
                />
            </Box>
        </Box>
    );
});

export default DayCareDetailsForm;
