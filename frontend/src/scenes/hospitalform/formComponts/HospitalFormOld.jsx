// HospitalForm.js
import React from 'react';
import { Formik, Form, FieldArray, Field } from 'formik';
import { Button, IconButton, useTheme, Grid, TextField, Typography } from '@mui/material';
import { initialHospitalData } from '../formData';
import { validationSchema } from '../validationSchema';
import BranchForm from './BranchForm';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import { tokens } from '../../../theme';

const HospitalForm = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (


        <Formik
            initialValues={initialHospitalData}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                console.log(values);
            }}
        >
            {({ values }) => (
                <Form>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h4">Hospital Form</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                name="name"
                                as={TextField}
                                variant="filled"
                                label="Hospital Name"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6">Contact Numbers</Typography>
                            <FieldArray
                                name="contactNumbers"
                                render={arrayHelpers => (
                                    <div>
                                        {values.contactNumbers.map((contact, index) => (
                                            <Grid container spacing={2} key={index}>
                                                <Grid item xs={10}>
                                                    <Field
                                                        name={`contactNumbers.${index}`}
                                                        as={TextField}
                                                        variant="filled"
                                                        label="Contact Number"
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    {/* <Button
                                                    type="button"
                                                    variant="contained"
                                                    onClick={() => arrayHelpers.remove(index)}
                                                    color='secondary'
                                                    sx={{borderRadius:'50%'}}
                                                >-</Button> */}
                                                    <IconButton
                                                        type="button"
                                                        onClick={() => arrayHelpers.remove(index)}
                                                        color="secondary"
                                                        sx={{
                                                            borderRadius: '50%', // Makes the button circular
                                                            padding: '10px', // Adds padding inside the button
                                                            '&:hover': {
                                                                // backgroundColor: 'blue', // Background color on hover
                                                                backgroundColor: colors.greenAccent[500],
                                                                color: 'rgb(17 24 39)'
                                                            },
                                                        }}
                                                    >
                                                        <RemoveIcon />
                                                    </IconButton>
                                                    {/* <Button type="button" onClick={() => arrayHelpers.insert(index + 1, '')}>+</Button> */}
                                                    <IconButton
                                                        type="button"
                                                        onClick={() => arrayHelpers.insert(index + 1, '')}
                                                        color="secondary"
                                                        sx={{
                                                            borderRadius: '50%', // Makes the button circular
                                                            padding: '10px', // Adds padding inside the button
                                                            '&:hover': {
                                                                // backgroundColor: 'blue', // Background color on hover
                                                                backgroundColor: colors.greenAccent[500],
                                                                color: 'rgb(17 24 39)'
                                                            },
                                                        }}
                                                    >
                                                        <AddOutlinedIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        ))}
                                    </div>
                                )}
                            />
                        </Grid>
                        <FieldArray
                            name="branches"
                            render={arrayHelpers => (
                                <div>
                                    {values.branches.map((branch, index) => (
                                        <BranchForm key={index} values={values} index={index} arrayHelpers={arrayHelpers} />
                                    ))}
                                    <Button type="button" onClick={() => arrayHelpers.push({
                                        name: "",
                                        location: "",
                                        contactNumbers: [""],
                                        code: "",
                                        numberOfBeds: 0,
                                        departments: [{
                                            doctorName: "",
                                            enabled: true,
                                            opdNumber: "",
                                            specialties: [""],
                                            opdTiming: { morning: "", evening: "" },
                                            opdDays: "",
                                            experience: "",
                                            contactNumber: "",
                                            extensionNumber: "",
                                            paName: "",
                                            paContactNumber: "",
                                            consultationCharges: 0,
                                            videoConsultation: { enabled: false, timeSlot: "", charges: 0, days: "" },
                                            teleMedicine: false,
                                            empanelmentList: ["Cash", "TPA", "RGHS", "CGHS"],
                                            additionalInfo: "",
                                            serviceDescription: "",
                                            availability: { enabled: true, leave: false, halfDay: false, fullDay: false }
                                        }]
                                    })}>Add Branch</Button>
                                </div>
                            )}
                        />
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary">Submit</Button>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
    )
};

export default HospitalForm;
