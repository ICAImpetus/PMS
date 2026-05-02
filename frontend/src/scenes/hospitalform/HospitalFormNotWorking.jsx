import React, { useState } from 'react';
import { Formik, FieldArray, Form } from 'formik';
import { TextField, Button, Box, Typography, IconButton } from '@mui/material';
import AddBox from '@mui/icons-material/AddBox';
import CancelIcon from '@mui/icons-material/Cancel';
import * as Yup from 'yup';

import BranchForm from './formComponts/BranchForm';
import DepartmentForm from './formComponts/DepartmentForm';
import EmpanelmentListForm from './formComponts/EmpanelmentListForm';
import TestLabForm from './formComponts/TestLabForm';
import CodeAnnouncementForm from './formComponts/CodeAnnouncementForm';
import IPDDetailsForm from './formComponts/IPDDetailsForm';
import DayCareDetailsForm from './formComponts/DayCareDetailsForm';
import ProcedureListForm from './formComponts/ProcedureListForm';
import DepartmentInchargeForm from './formComponts/DepartmentInchargeForm';
import { validationSchema } from './validationSchema';
import { initialValues } from './formData';


// const validationSchema = Yup.object({
//     name: Yup.string().required('Hospital name is required'),
//     contactNumbers: Yup.array().of(Yup.string().required('Contact number is required')),
//     // Add other validation schemas for your fields as needed
// });


const HospitalForm = () => {
    const [step, setStep] = useState(0);

    const steps = [
        'Hospital Details',
        'Contact Numbers',
        'Branches',
        'Departments',
        'Empanelment List',
        'Test Labs',
        'Code Announcements',
        'IPD Details',
        'Day Care Details',
        'Procedure List',
        'Department Incharge',
    ];

    const handleSubmit = (values) => {
        console.log('Submitted Values:', values);  // Check this line for form values
        alert('Form submitted!');
    };

    const handleNext = (formik) => {
        formik.setTouched({
            ...formik.touched,
        });
        if (step < steps.length - 1) {
            setStep(step + 1);
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {formik => (
                <Form onSubmit={formik.handleSubmit}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {/* Hospital Creation Formsss */}
                        </Typography>

                        {/* Render the current step */}
                        {step === 0 && (
                            <Box mb={3}>
                                <TextField
                                    label="Hospital Name"
                                    variant="filled"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    fullWidth
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                />
                            </Box>
                        )}

                        {step === 1 && (
                            <FieldArray name="contactNumbers">
                                {({ push, remove }) => (
                                    <Box mb={3}>
                                        {formik.values.contactNumbers.map((_, index) => (
                                            <Box key={index} mb={2} display='flex' justifyContent='space-between'>
                                                <TextField
                                                    label={`Contact Number ${index + 1}`}
                                                    variant="filled"
                                                    name={`contactNumbers[${index}]`}
                                                    value={formik.values.contactNumbers[index]}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    fullWidth
                                                />
                                                <IconButton onClick={() => remove(index)} variant='outlined' sx={{ mt: 1, mr: 1 }}>
                                                    <CancelIcon />
                                                </IconButton>
                                            </Box>
                                        ))}
                                        <Button onClick={() => push('')} color='secondary' startIcon={<AddBox />} variant='outlined'>
                                            Add Contact Number
                                        </Button>
                                    </Box>
                                )}
                            </FieldArray>
                        )}

                        {step === 2 && (
                            <FieldArray name="branches">
                                {({ push, remove }) => (
                                    <Box mb={3}>
                                        {formik.values.branches.map((branch, index) => (
                                            <Box key={index} mb={3}>
                                                <BranchForm
                                                    branch={branch}
                                                    index={index}
                                                    handleChange={formik.handleChange}
                                                    handleBlur={formik.handleBlur}
                                                    removeBranch={() => remove(index)}
                                                />
                                            </Box>
                                        ))}
                                        <Button
                                            onClick={() => push({
                                                name: '',
                                                location: '',
                                                contactNumbers: [''],
                                                code: '',
                                                beds: ''
                                            })}
                                            variant="contained"
                                            color="primary"
                                        >
                                            Add Branch
                                        </Button>
                                    </Box>
                                )}
                            </FieldArray>
                        )}

                        {step === 3 && (
                            <FieldArray name="departments">
                                {({ push, remove }) => (
                                    <Box mb={3}>
                                        {formik.values.departments.map((department, index) => (
                                            <Box key={index} mb={3}>
                                                <DepartmentForm
                                                    department={department}
                                                    index={index}
                                                    handleChange={formik.handleChange}
                                                    handleBlur={formik.handleBlur}
                                                    removeDepartment={() => remove(index)}
                                                />
                                            </Box>
                                        ))}
                                        <Button
                                            onClick={() => push({
                                                name: '',
                                                doctors: [{
                                                    name: '',
                                                    opdNo: '',
                                                    specialties: [''],
                                                    timings: {
                                                        morning: '',
                                                        evening: ''
                                                    },
                                                    opdDays: '',
                                                    experience: '',
                                                    contactNumber: '',
                                                    extensionNumber: '',
                                                    paName: '',
                                                    paContactNumber: '',
                                                    consultationCharges: '',
                                                    videoConsultation: {
                                                        enabled: false,
                                                        timeSlot: '',
                                                        charges: '',
                                                        days: ''
                                                    },
                                                    teleMedicine: '',
                                                    empanelmentList: [''],
                                                    additionalInfo: '',
                                                    descriptionOfServices: '',
                                                    isEnabled: true
                                                }]
                                            })}
                                            variant="contained"
                                            color="primary"
                                        >
                                            Add Department
                                        </Button>
                                    </Box>
                                )}
                            </FieldArray>
                        )}

                        {step === 4 && (
                            <FieldArray name="empanelmentList">
                                {({ push, remove }) => (
                                    <Box mb={3}>
                                        {formik.values.empanelmentList.map((empanelment, index) => (
                                            <Box key={index} mb={3}>
                                                <EmpanelmentListForm
                                                    empanelment={empanelment}
                                                    index={index}
                                                    handleChange={formik.handleChange}
                                                    handleBlur={formik.handleBlur}
                                                    removeEmpanelment={() => remove(index)}
                                                />
                                            </Box>
                                        ))}
                                        <Button
                                            onClick={() => push({
                                                policyName: '',
                                                coveringAreasOfSpeciality: [''],
                                                doctorsAvailable: [{ name: '', time: '' }],
                                                additionalRemarks: '',
                                                typeOfCoverage: ''
                                            })}
                                            variant="contained"
                                            color="primary"
                                        >
                                            Add Empanelment
                                        </Button>
                                    </Box>
                                )}
                            </FieldArray>
                        )}

                        {step === 5 && (
                            <FieldArray name="testLabs">
                                {({ push, remove }) => (
                                    <Box mb={3}>
                                        {formik.values.testLabs.map((testLab, index) => (
                                            <Box key={index} mb={3}>
                                                <TestLabForm
                                                    testLab={testLab}
                                                    index={index}
                                                    handleChange={formik.handleChange}
                                                    handleBlur={formik.handleBlur}
                                                    removeTestLab={() => remove(index)}
                                                />
                                            </Box>
                                        ))}
                                        <Button
                                            onClick={() => push({
                                                location: '',
                                                testCode: '',
                                                testName: '',
                                                serviceGroup: '',
                                                serviceCharge: '',
                                                floor: '',
                                                description: '',
                                                precaution: '',
                                                categoryApplicability: [''],
                                                tatReport: '',
                                                source: '',
                                                remarks: ''
                                            })}
                                            variant="contained"
                                            color="primary"
                                        >
                                            Add Test Lab
                                        </Button>
                                    </Box>
                                )}
                            </FieldArray>
                        )}

                        {step === 6 && (
                            <FieldArray name="codeAnnouncements">
                                {({ push, remove }) => (
                                    <Box mb={3}>
                                        {formik.values.codeAnnouncements.map((codeAnnouncement, index) => (
                                            <Box key={index} mb={3}>
                                                <CodeAnnouncementForm
                                                    codeAnnouncement={codeAnnouncement}
                                                    index={index}
                                                    handleChange={formik.handleChange}
                                                    handleBlur={formik.handleBlur}
                                                    removeCodeAnnouncement={() => remove(index)}
                                                />
                                            </Box>
                                        ))}
                                        <Button
                                            onClick={() => push({
                                                name: '',
                                                color: '',
                                                description: '',
                                                concernedPerson: '',
                                                staff: [{ name: '', shift: '', contactNo: '' }],
                                                shortCode: '',
                                                timeAvailability: '',
                                                enabled: false
                                            })}
                                            variant="contained"
                                            color="primary"
                                        >
                                            Add Code Announcement
                                        </Button>
                                    </Box>
                                )}
                            </FieldArray>
                        )}

                        {step === 7 && (
                            <Box mb={3}>
                                <IPDDetailsForm
                                    values={formik.values}
                                    handleChange={formik.handleChange}
                                    handleBlur={formik.handleBlur}
                                />
                            </Box>
                        )}

                        {step === 8 && (
                            <Box mb={3}>
                                <DayCareDetailsForm
                                    values={formik.values}
                                    handleChange={formik.handleChange}
                                    handleBlur={formik.handleBlur}
                                />
                            </Box>
                        )}

                        {step === 9 && (
                            <Box mb={3}>
                                <ProcedureListForm
                                    values={formik.values}
                                    handleChange={formik.handleChange}
                                    handleBlur={formik.handleBlur}
                                />
                            </Box>
                        )}

                        {step === 10 && (
                            <Box mb={3}>
                                <DepartmentInchargeForm
                                    values={formik.values}
                                    handleChange={formik.handleChange}
                                    handleBlur={formik.handleBlur}
                                />
                            </Box>
                        )}

                        {/* Navigation Buttons */}
                        <Box display="flex" justifyContent="space-between" mt={3}>
                            <Button onClick={handlePrev} disabled={step === 0} variant="contained">
                                Previous
                            </Button>
                            {step === steps.length - 1 ? (
                                <Button type="submit" variant="contained" color="primary">
                                    Submit
                                </Button>
                            ) : (
                                <Button onClick={() => handleNext(formik)} variant="contained" color="primary">
                                    Next
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Form>
            )}
        </Formik>
    );
};


export default HospitalForm;
