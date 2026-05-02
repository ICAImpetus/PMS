import React from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Grid, Select, MenuItem, Button, useTheme } from '@mui/material';

const IPDDetailsForm = React.memo(({ values, handleChange }) => {
    const theme = useTheme();

    const textFieldStyleObj = {
        // '& .MuiFilledInput-root': {
        //     backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5', // Default background color
        //     '&.Mui-focused': {
        //         backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5', // Keep background color the same on focus
        //         '&::before': {
        //             borderBottomColor: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Change bottom border color on focus
        //             borderWidth: 2, // Optional: make the border thicker on focus
        //         },
        //     },
        // },
        // '& .MuiInputLabel-root': {
        //     color: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Label color
        // },
        // '& .MuiFormHelperText-root': {
        //     color: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Helper text color
        // },
        '& .MuiSelect-root': {
            '&.Mui-focused .MuiFilledInput-root::before': {
                borderBottomColor: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Bottom border color on focus for Select component
                borderWidth: 2, // Optional: make the border thicker on focus for Select component
            },
        },
    };


    const FormControlStyleObj = {
        '& .MuiInputLabel-root': {
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
        },
        '& .MuiSelect-root': {
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
            },
            '&:hover fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
                borderWidth: 2,
            },
        },
        '& .MuiSelect-icon': {
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
        },
        '& .MuiMenu-paper': {
            backgroundColor: theme.palette.mode === 'dark' ? '#333' : 'white',
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
        },
        '& .MuiMenuItem-root': {
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
        },
    };




    const { ipdDetails } = values;

    return (
       

        <Box mb={4} p={2} border={1} borderRadius={2}>
            <Typography variant="h6" gutterBottom>IPD Details</Typography>

            <Grid container spacing={2}>
                {/* Number of Beds */}
                <Grid item xs={12} md={6}>
                    <TextField
                        variant='filled'
                        label="Number of Beds"
                        name="ipdDetails.noOfBeds"
                        value={ipdDetails.noOfBeds || ''}
                        onChange={handleChange}
                        fullWidth
                        sx={textFieldStyleObj}
                    />
                </Grid>

                {/* Charges */}
                <Grid item xs={12} md={6}>
                    <TextField
                        variant='filled'
                        label="Charges"
                        name="ipdDetails.charges"
                        value={ipdDetails.charges || ''}
                        onChange={handleChange}
                        fullWidth
                        sx={textFieldStyleObj}
                    />
                </Grid>

                {/* Location */}
                <Grid item xs={12} md={6}>
                    <TextField
                        variant='filled'
                        label="Location"
                        name="ipdDetails.location"
                        value={ipdDetails.location || ''}
                        onChange={handleChange}
                        fullWidth
                        sx={textFieldStyleObj}
                    />
                </Grid>

                {/* Category */}
                {/* <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={FormControlStyleObj}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            label="Category"
                            name="ipdDetails.category"
                            value={ipdDetails.category || ''}
                            onChange={handleChange}
                            sx={FormControlStyleObj}
                        >
                            <MenuItem value="General">General</MenuItem>
                            <MenuItem value="Private">Private</MenuItem>
                            <MenuItem value="VIP">VIP</MenuItem>
                        </Select>
                    </FormControl>
                </Grid> */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        variant="filled"
                        select
                        label="Category"
                        name="ipdDetails.category"
                        value={ipdDetails.category || ''}
                        onChange={handleChange}
                    >
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="Private">Private</MenuItem>
                        <MenuItem value="VIP">VIP</MenuItem>
                    </TextField>
                </Grid>

                {/* Service Type */}
                <Grid item xs={12} md={6}>
                    <TextField
                        variant='filled'
                        label="Service Type"
                        name="ipdDetails.serviceType"
                        value={ipdDetails.serviceType || ''}
                        onChange={handleChange}
                        fullWidth
                        sx={textFieldStyleObj}
                    />
                </Grid>
            </Grid>
        </Box>

    );
});

export default IPDDetailsForm;

