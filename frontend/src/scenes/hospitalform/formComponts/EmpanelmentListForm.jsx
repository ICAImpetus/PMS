import React from 'react';
import { Box, Button, Typography, TextField, Grid, useTheme } from '@mui/material';
import { FieldArray } from 'formik';

const EmpanelmentListForm = React.memo(({ empanelment, index, handleChange, removeEmpanelment }) => {
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
    }
    return (
        // <Box mb={4} p={2} border={1} borderRadius={2}>
        //     <Typography variant="h6" gutterBottom>Empanelment List {index + 1}</Typography>

        //     {/* Policy Name */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Policy Name"
        //             name={`empanelmentList[${index}].policyName`}
        //             value={empanelment.policyName}
        //             onChange={handleChange}
        //             fullWidth
        //         />
        //     </Box>

        //     {/* Covering Areas of Specialty */}
        //     <FieldArray name={`empanelmentList[${index}].coveringAreasOfSpeciality`}>
        //         {({ push, remove }) => (
        //             <Box mb={2}>
        //                 {empanelment.coveringAreasOfSpeciality.map((specialty, specIndex) => (
        //                     <Box key={specIndex} mb={2}>
        //                         <TextField
        //                             variant='filled'
        //                             label={`Specialty ${specIndex + 1}`}
        //                             name={`empanelmentList[${index}].coveringAreasOfSpeciality[${specIndex}]`}
        //                             value={specialty}
        //                             onChange={handleChange}
        //                             fullWidth
        //                             sx={{ mb: 1 }}
        //                         />
        //                         <Button onClick={() => remove(specIndex)} variant="outlined" color="secondary">
        //                             Remove
        //                         </Button>
        //                     </Box>
        //                 ))}
        //                 <Button onClick={() => push('')} variant="outlined" color="secondary">
        //                     Add Specialty
        //                 </Button>
        //             </Box>
        //         )}
        //     </FieldArray>

        //     {/* Doctors Available */}
        //     <FieldArray name={`empanelmentList[${index}].doctorsAvailable`}>
        //         {({ push, remove }) => (
        //             <Box mb={2}>
        //                 <Typography variant="h6" gutterBottom>Doctors Available</Typography>
        //                 {empanelment.doctorsAvailable.map((doctor, docIndex) => (
        //                     <Box key={docIndex} mb={2}>


        //                         <TextField
        //                             variant='filled'
        //                             label={`Doctor ${docIndex + 1}`}
        //                             name={`empanelmentList[${index}].doctorsAvailable[${docIndex}].name`}
        //                             value={doctor.name}
        //                             onChange={handleChange}
        //                             fullWidth
        //                             sx={{ mb: 1 }}
        //                         />
        //                         <TextField
        //                             variant='filled'
        //                             label="Time"
        //                             name={`empanelmentList[${index}].doctorsAvailable[${docIndex}].time`}
        //                             value={doctor.time}
        //                             onChange={handleChange}
        //                             fullWidth
        //                         />
        //                         <Button onClick={() => remove(docIndex)} variant="outlined" color="secondary" sx={{ mt: 2 }}>
        //                             Remove
        //                         </Button>
        //                     </Box>
        //                 ))}
        //                 <Button onClick={() => push({ name: '', time: '' })} variant="outlined" color="secondary">
        //                     Add Doctor
        //                 </Button>
        //             </Box>
        //         )}
        //     </FieldArray>

        //     {/* Additional Remarks */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Additional Remarks"
        //             name={`empanelmentList[${index}].additionalRemarks`}
        //             value={empanelment.additionalRemarks}
        //             onChange={handleChange}
        //             fullWidth
        //         />
        //     </Box>

        //     {/* Type of Coverage */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Type of Coverage"
        //             name={`empanelmentList[${index}].typeOfCoverage`}
        //             value={empanelment.typeOfCoverage}
        //             onChange={handleChange}
        //             fullWidth
        //         />
        //     </Box>

        //     {/* Remove Empanelment Button */}
        //     <Box>
        //         <Button onClick={removeEmpanelment} variant="outlined" color="secondary">
        //             Remove Empanelment
        //         </Button>
        //     </Box>
        // </Box>

        <Box mb={4} p={2} border={1} borderRadius={2}>
            <Typography variant="h6" gutterBottom>Empanelment List {index + 1}</Typography>

            <Grid container spacing={2}>
                {/* Policy Name */}
                <Grid item xs={12}>
                    <TextField
                        variant='filled'
                        label="Policy Name"
                        name={`empanelmentList[${index}].policyName`}
                        value={empanelment.policyName}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Covering Areas of Specialty */}
                <Grid item xs={12}>
                    <FieldArray name={`empanelmentList[${index}].coveringAreasOfSpeciality`}>
                        {({ push, remove }) => (
                            <Box>
                                <Grid container spacing={2}>
                                    {empanelment.coveringAreasOfSpeciality.map((specialty, specIndex) => (
                                        <Grid item xs={12} sm={6} md={4} key={specIndex}>
                                            <TextField
                                                variant='filled'
                                                label={`Specialty ${specIndex + 1}`}
                                                name={`empanelmentList[${index}].coveringAreasOfSpeciality[${specIndex}]`}
                                                value={specialty}
                                                onChange={handleChange}
                                                fullWidth
                                                sx={{ mb: 1 }}
                                            />
                                            <Button
                                                onClick={() => remove(specIndex)}
                                                variant="outlined"
                                                color="secondary"
                                            >
                                                Remove
                                            </Button>
                                        </Grid>
                                    ))}
                                    <Grid item xs={12}>
                                        <Button
                                            onClick={() => push('')}
                                            variant="outlined"
                                            color="secondary"
                                        >
                                            Add Specialty
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </FieldArray>
                </Grid>

                {/* Doctors Available */}
                <Grid item xs={12}>
                    <FieldArray name={`empanelmentList[${index}].doctorsAvailable`}>
                        {({ push, remove }) => (
                            <Box>
                                <Typography variant="h6" gutterBottom>Doctors Available</Typography>
                                <Grid container spacing={2}>
                                    {empanelment.doctorsAvailable.map((doctor, docIndex) => (
                                        <Grid item xs={12} key={docIndex}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        variant='filled'
                                                        label={`Doctor ${docIndex + 1}`}
                                                        name={`empanelmentList[${index}].doctorsAvailable[${docIndex}].name`}
                                                        value={doctor.name}
                                                        onChange={handleChange}
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        variant='filled'
                                                        label="Time"
                                                        name={`empanelmentList[${index}].doctorsAvailable[${docIndex}].time`}
                                                        value={doctor.time}
                                                        onChange={handleChange}
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Button
                                                        onClick={() => remove(docIndex)}
                                                        variant="outlined"
                                                        color="secondary"
                                                        sx={{ mt: 2 }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    ))}
                                    <Grid item xs={12}>
                                        <Button
                                            onClick={() => push({ name: '', time: '' })}
                                            variant="outlined"
                                            color="secondary"
                                        >
                                            Add Doctor
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </FieldArray>
                </Grid>

                {/* Additional Remarks */}
                <Grid item xs={12}>
                    <TextField
                        variant='filled'
                        label="Additional Remarks"
                        name={`empanelmentList[${index}].additionalRemarks`}
                        value={empanelment.additionalRemarks}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Type of Coverage */}
                <Grid item xs={12}>
                    <TextField
                        variant='filled'
                        label="Type of Coverage"
                        name={`empanelmentList[${index}].typeOfCoverage`}
                        value={empanelment.typeOfCoverage}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                {/* Remove Empanelment Button */}
                <Grid item xs={12}>
                    <Button
                        onClick={removeEmpanelment}
                        variant="outlined"
                        color="secondary"
                    >
                        Remove Empanelment
                    </Button>
                </Grid>
            </Grid>
        </Box>

    )
});

export default EmpanelmentListForm;
