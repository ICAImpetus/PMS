import React from 'react';
import { Box, Button, Typography, TextField, MenuItem, useTheme, Grid } from '@mui/material';
import { FieldArray } from 'formik';

const TestLabForm = ({ testLab, index, handleChange, removeTestLab }) => {
    // const theme = useTheme();

    // const textFieldStyleObj = {
    //     '& .MuiOutlinedInput-root': {
    //         '& fieldset': {
    //             borderColor: theme.palette.mode === 'dark' ? '#fff' : 'black', // Border color
    //         },
    //         '&:hover fieldset': {
    //             borderColor: theme.palette.mode === 'dark' ? '#379777' : '#379777', // Border color on hover
    //         },
    //         '&.Mui-focused fieldset': {
    //             borderColor: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Border color on focus
    //             borderWidth: 2, // Optional: make the border thicker on focus
    //         },
    //     },
    //     '& .MuiInputLabel-root': {
    //         color: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Label color
    //     },
    //     '& .MuiFormHelperText-root': {
    //         color: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Helper text color
    //     },
    // }

    return (
        // <Box mb={4} p={2} border={1} borderRadius={2} >
        //     <Typography variant="h6" gutterBottom>Test Lab {index + 1}</Typography>

        //     {/* Location */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Location"
        //             name={`testLabs[${index}].location`}
        //             value={testLab.location}
        //             onChange={handleChange}
        //             fullWidth
        //             // sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Test Code */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Test Code"
        //             name={`testLabs[${index}].testCode`}
        //             value={testLab.testCode}
        //             onChange={handleChange}
        //             fullWidth
        //             // sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Test Name */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Test Name"
        //             name={`testLabs[${index}].testName`}
        //             value={testLab.testName}
        //             onChange={handleChange}
        //             fullWidth
        //             // sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Service Group */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Service Group"
        //             name={`testLabs[${index}].serviceGroup`}
        //             value={testLab.serviceGroup}
        //             onChange={handleChange}
        //             fullWidth
        //             // sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Service Charge OPD Plus Additionals */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Service Charge OPD Plus Additionals"
        //             name={`testLabs[${index}].serviceCharge`}
        //             value={testLab.serviceCharge}
        //             onChange={handleChange}
        //             fullWidth
        //             // sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Floor */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Floor"
        //             name={`testLabs[${index}].floor`}
        //             value={testLab.floor}
        //             onChange={handleChange}
        //             fullWidth
        //             // sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Description */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Description"
        //             name={`testLabs[${index}].description`}
        //             value={testLab.description}
        //             onChange={handleChange}
        //             fullWidth
        //             // sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Precaution */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Precaution"
        //             name={`testLabs[${index}].precaution`}
        //             value={testLab.precaution}
        //             onChange={handleChange}
        //             fullWidth
        //             // sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Category Applicability */}
        //     <FieldArray name={`testLabs[${index}].categoryApplicability`}>
        //         {({ push, remove }) => (
        //             <Box mb={2}>
        //                 {testLab.categoryApplicability.map((category, catIndex) => (
        //                     <Box key={catIndex} mb={2}>
        //                         <TextField
        //                             variant='filled'
        //                             select
        //                             label={`Category Applicability ${catIndex + 1}`}
        //                             name={`testLabs[${index}].categoryApplicability[${catIndex}]`}
        //                             value={category}
        //                             onChange={handleChange}
        //                             fullWidth
        //                             // sx={textFieldStyleObj}
        //                         >
        //                             <MenuItem value="TPA">TPA</MenuItem>
        //                             <MenuItem value="Cash">Cash</MenuItem>
        //                             <MenuItem value="RGHS">RGHS</MenuItem>
        //                         </TextField>
        //                         <Button onClick={() => remove(catIndex)} variant="outlined" color="secondary" sx={{ mt: 2 }}>
        //                             Remove
        //                         </Button>
        //                     </Box>
        //                 ))}
        //                 <Button onClick={() => push('')} variant="contained" color="primary">
        //                     Add Category
        //                 </Button>
        //             </Box>
        //         )}
        //     </FieldArray>

        //     {/* TAT Report */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="TAT Report"
        //             name={`testLabs[${index}].tatReport`}
        //             value={testLab.tatReport}
        //             onChange={handleChange}
        //             fullWidth
        //             // sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Source */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Source"
        //             name={`testLabs[${index}].source`}
        //             value={testLab.source}
        //             onChange={handleChange}
        //             fullWidth
        //             // sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Remarks */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Remarks"
        //             name={`testLabs[${index}].remarks`}
        //             value={testLab.remarks}
        //             onChange={handleChange}
        //             fullWidth
        //             // sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Remove Test Lab Button */}
        //     <Box>
        //         <Button onClick={removeTestLab} variant="outlined" color="secondary">
        //             Remove Test Lab
        //         </Button>
        //     </Box>
        // </Box>

        <Box mb={4} p={2} border={1} borderRadius={2}>
            <Typography variant="h6" gutterBottom>
                Test Lab {index + 1}
            </Typography>

            <Grid container spacing={2} mb={2}>
                {/* Location */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        variant="filled"
                        label="Location"
                        name={`testLabs[${index}].location`}
                        value={testLab.location}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Test Code */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        variant="filled"
                        label="Test Code"
                        name={`testLabs[${index}].testCode`}
                        value={testLab.testCode}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Test Name */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        variant="filled"
                        label="Test Name"
                        name={`testLabs[${index}].testName`}
                        value={testLab.testName}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Service Group */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        variant="filled"
                        label="Service Group"
                        name={`testLabs[${index}].serviceGroup`}
                        value={testLab.serviceGroup}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Service Charge OPD Plus Additionals */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        variant="filled"
                        label="Service Charge OPD Plus Additionals"
                        name={`testLabs[${index}].serviceCharge`}
                        value={testLab.serviceCharge}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Floor */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        variant="filled"
                        label="Floor"
                        name={`testLabs[${index}].floor`}
                        value={testLab.floor}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Description */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        variant="filled"
                        label="Description"
                        name={`testLabs[${index}].description`}
                        value={testLab.description}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Precaution */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        variant="filled"
                        label="Precaution"
                        name={`testLabs[${index}].precaution`}
                        value={testLab.precaution}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Category Applicability */}
                <Grid item xs={12}>
                    <FieldArray name={`testLabs[${index}].categoryApplicability`}>
                        {({ push, remove }) => (
                            <Grid container spacing={2}>
                                {testLab.categoryApplicability.map((category, catIndex) => (
                                    <Grid item xs={12} sm={6} key={catIndex}>
                                        <TextField
                                            variant="filled"
                                            select
                                            label={`Category Applicability ${catIndex + 1}`}
                                            name={`testLabs[${index}].categoryApplicability[${catIndex}]`}
                                            value={category}
                                            onChange={handleChange}
                                            fullWidth
                                            
                                        >
                                            <MenuItem value="TPA">TPA</MenuItem>
                                            <MenuItem value="Cash">Cash</MenuItem>
                                            <MenuItem value="RGHS">RGHS</MenuItem>
                                        </TextField>
                                        <Button onClick={() => remove(catIndex)} variant="outlined" color="secondary" sx={{ mt: 2 }}>
                                            Remove
                                        </Button>
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <Button onClick={() => push('')} variant="outlined" color="secondary">
                                        Add Category
                                    </Button>
                                </Grid>
                            </Grid>
                        )}
                    </FieldArray>
                </Grid>

                {/* TAT Report */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        variant="filled"
                        label="TAT Report"
                        name={`testLabs[${index}].tatReport`}
                        value={testLab.tatReport}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Source */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        variant="filled"
                        label="Source"
                        name={`testLabs[${index}].source`}
                        value={testLab.source}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Remarks */}
                <Grid item xs={12}>
                    <TextField
                        variant="filled"
                        label="Remarks"
                        name={`testLabs[${index}].remarks`}
                        value={testLab.remarks}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Remove Test Lab Button */}
                <Grid item xs={12}>
                    <Button onClick={removeTestLab} variant="outlined" color="secondary">
                        Remove Test Lab
                    </Button>
                </Grid>
            </Grid>
        </Box>



    )
};

export default TestLabForm;
