import React from 'react';
import { Box, Button, Typography, TextField, useTheme } from '@mui/material';
import { FieldArray, FastField } from 'formik';
import DoctorForm from './DoctorForm'; // Import the DoctorForm component

//  Ensure setFieldValue is destructured from props
const DepartmentForm = React.memo(({ department, index, handleChange, removeDepartment, setFieldValue }) => {
    const theme = useTheme();

    const textFieldStyleObj = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#fff' : 'black',
            },
            '&:hover fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#379777' : '#379777',
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black',
                borderWidth: 2,
            },
        },
        '& .MuiInputLabel-root': {
            color: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black',
        },
        '& .MuiFormHelperText-root': {
            color: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black',
        },
    };

    return (
        <Box mb={4} p={2} border={1} borderRadius={2}>
            <Typography variant="h6" gutterBottom>Department {index + 1}</Typography>

            {/* Department Name */}
            <Box mb={2}>
                <FastField name={`departments[${index}].name`}>
                    {({ field }) => (
                        <TextField
                            label="Department Name"
                            variant="filled"
                            {...field}
                            fullWidth
                            sx={textFieldStyleObj}
                        />
                    )}
                </FastField>
            </Box>

            {/* Doctors */}
            <FieldArray name={`departments[${index}].doctors`}>
                {({ push, remove }) => (
                    <Box mb={2}>
                        {department.doctors.map((doctor, docIndex) => (
                            <Box key={docIndex} mb={3}>
                                <DoctorForm
                                    doctor={doctor}
                                    departmentIndex={index}
                                    doctorIndex={docIndex}
                                    branchIndex={0} // Defaulting to 0 if not multi-branch here
                                    handleChange={handleChange}
                                    setFieldValue={setFieldValue} //  Passing setFieldValue down
                                    removeDoctor={() => remove(docIndex)}
                                />
                            </Box>
                        ))}
                        <Button
                            onClick={() => push({
                                name: '',
                                opdNo: '',
                                specialties: [''],
                                timings: { morning: '', evening: '' },
                                opdDays: '',
                                experience: '',
                                contactNumber: '',
                                extensionNumber: '',
                                paName: '',
                                paContactNumber: '',
                                consultationCharges: '',
                                videoConsultation: { enabled: false, timeSlot: '', charges: '', days: '' },
                                teleMedicine: '', // Will be 'Yes' or 'No'
                                whatsappNumber: '',
                                empanelmentList: [''],
                                additionalInfo: '',
                                descriptionOfServices: '',
                                isEnabled: true,
                            })}
                            variant="outlined" color="secondary">
                            Add Doctor
                        </Button>
                    </Box>
                )}
            </FieldArray>

            {/* Remove Department Button */}
            <Box>
                <Button onClick={removeDepartment} variant="outlined" color="secondary">
                    Remove Department
                </Button>
            </Box>
        </Box>
    );
});

export default DepartmentForm;