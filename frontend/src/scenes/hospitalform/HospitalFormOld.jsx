import React from 'react';
import { Box, Button, Typography, TextField, IconButton } from '@mui/material';
import { Formik, Form, FieldArray, FastField } from 'formik';
import BranchForm from './formComponts/BranchForm';
import DepartmentForm from './formComponts/DepartmentForm';
import EmpanelmentListForm from './formComponts/EmpanelmentListForm';
import TestLabForm from './formComponts/TestLabForm';
import CodeAnnouncementForm from './formComponts/CodeAnnouncementForm';
import IPDDetailsForm from './formComponts/IPDDetailsForm';
import DayCareDetailsForm from './formComponts/DayCareDetailsForm';
import ProcedureListForm from './formComponts/ProcedureListForm';
import DepartmentInchargeForm from './formComponts/DepartmentInchargeForm';
import { AddBox, AddReactionRounded } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { tokens } from '../../theme';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import { initialValues } from './formData'
// Import other child components similarly

const HospitalForm = () => {

    const handleSubmit = (values) => {
        console.log(values);
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur={false}
        >
            {({ values, handleChange, handleBlur }) => (
                <Form>
                    <Box>
                        {/* <Typography variant="h4" gutterBottom>Hospital Creation Formsss</Typography> */}

                        {/* Hospital Name */}
                        <Box mb={3}>
                            <TextField
                                label="Hospital Name"
                                variant="filled"
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Box>

                        {/* Contact Numbers */}
                        <FieldArray name="contactNumbers">
                            {({ push, remove }) => (
                                <Box mb={3}>
                                    {values.contactNumbers.map((_, index) => (
                                        <Box key={index} mb={2} display='flex' justifyContent='space-between'>
                                            <TextField
                                                label={`Contact Number ${index + 1}`}
                                                variant="filled"
                                                name={`contactNumbers[${index}]`}
                                                value={values.contactNumbers[index]}
                                                onChange={handleChange}
                                                fullWidth
                                            />
                                            <IconButton onClick={() => remove(index)} variant='outlined' sx={{ mt: 1, mr: 1 }}>
                                                <CancelIcon />
                                            </IconButton>
                                            {/* <Button onClick={() => remove(index)} color='secondary' variant='contained' sx={{mt:2,ml:2}}>Remove</Button> */}
                                            {/* <Box display="flex" justifyContent="flex-end"> */}
                                            {/* <Button onClick={() => remove(index)} color='error' startIcon={<DeleteIcon />} variant='outlined' sx={{ mt: 1, mr: 1 }}>
                                                    Remove
                                                </Button> */}
                                            {/* <IconButton onClick={() => remove(index)} color='error'  variant='outlined' sx={{ mt: 1, mr: 1 }}>
                                                {<CancelIcon />}
                                                </IconButton>
                                            </Box> */}
                                        </Box>
                                    ))}
                                    {/* <Box display='flex' justifyContent='flex-end'> */}
                                    <Button onClick={() => push('')} color='secondary' startIcon={<AddBox />} variant='outlined'>Add Contact Number</Button>
                                    {/* </Box> */}

                                </Box>
                            )}
                        </FieldArray>

                        {/* Branches */}
                        <FieldArray name="branches">
                            {({ push, remove }) => (
                                <Box mb={3}>
                                    {values.branches.map((branch, index) => (
                                        <Box key={index} mb={3}>
                                            <BranchForm
                                                textFieldStyle
                                                branch={branch}
                                                index={index}
                                                handleChange={handleChange}
                                                removeBranch={() => remove(index)}
                                            />
                                        </Box>
                                    ))}
                                    <Button onClick={() => push({
                                        name: '',
                                        location: '',
                                        contactNumbers: [''],
                                        code: '',
                                        beds: ''
                                    })}>Add Branch</Button>
                                </Box>
                            )}
                        </FieldArray>

                        {/* Departments */}
                        <FieldArray name="departments">
                            {({ push, remove }) => (
                                <Box mb={3}>
                                    {values.departments.map((department, index) => (
                                        <Box key={index} mb={3}>
                                            <DepartmentForm
                                                department={department}
                                                index={index}
                                                handleChange={handleChange}
                                                removeDepartment={() => remove(index)}
                                            />
                                        </Box>
                                    ))}
                                    <Button onClick={() => push({
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
                                    })}>Add Department</Button>
                                </Box>
                            )}
                        </FieldArray>

                        {/* Additional sections like Empanelment, Test Lab, etc. */}
                        {/* Empanelment List Section */}
                        <FieldArray name="empanelmentList">
                            {({ push, remove }) => (
                                <Box mb={3}>
                                    <Typography variant="h5" gutterBottom>Empanelment List</Typography>
                                    {values.empanelmentList.map((empanelment, index) => (
                                        <Box key={index} mb={3}>
                                            <EmpanelmentListForm
                                                empanelment={empanelment}
                                                index={index}
                                                handleChange={handleChange}
                                                removeEmpanelment={() => remove(index)}
                                            />
                                        </Box>
                                    ))}
                                    <Button onClick={() => push({
                                        policyName: '',
                                        coveringAreasOfSpeciality: [''],
                                        doctorsAvailable: [{ name: '', time: '' }],
                                        additionalRemarks: '',
                                        typeOfCoverage: ''
                                    })} variant="contained" color="primary">
                                        Add Empanelment
                                    </Button>
                                </Box>
                            )}
                        </FieldArray>

                        {/* Test Labs Section */}
                        <FieldArray name="testLabs">
                            {({ push, remove }) => (
                                <Box mb={3}>
                                    <Typography variant="h5" gutterBottom>Test Labs</Typography>
                                    {values.testLabs.map((testLab, index) => (
                                        <Box key={index} mb={3}>
                                            <TestLabForm
                                                testLab={testLab}
                                                index={index}
                                                handleChange={handleChange}
                                                removeTestLab={() => remove(index)}
                                            />
                                        </Box>
                                    ))}
                                    <Button onClick={() => push({
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
                                    })} variant="contained" color="primary">
                                        Add Test Lab
                                    </Button>
                                </Box>
                            )}
                        </FieldArray>

                        {/* Code Announcements Section */}
                        <FieldArray name="codeAnnouncements">
                            {({ push, remove }) => (
                                <Box mb={3}>
                                    <Typography variant="h5" gutterBottom>Code Announcements</Typography>
                                    {values.codeAnnouncements.map((codeAnnouncement, index) => (
                                        <Box key={index} mb={3}>
                                            <CodeAnnouncementForm
                                                codeAnnouncement={codeAnnouncement}
                                                index={index}
                                                handleChange={handleChange}
                                                removeCodeAnnouncement={() => remove(index)}
                                            />
                                        </Box>
                                    ))}
                                    <Button onClick={() => push({
                                        name: '',
                                        color: '',
                                        description: '',
                                        concernedPerson: '',
                                        staff: [{ name: '', shift: '', contactNo: '' }],
                                        shortCode: '',
                                        timeAvailability: '',
                                        enabled: false
                                    })} variant="contained" color="primary">
                                        Add Code Announcement
                                    </Button>
                                </Box>
                            )}
                        </FieldArray>

                        {/* IPD Details Section */}
                        <IPDDetailsForm values={values} handleChange={handleChange} handleBlur={handleBlur} />

                        {/* Day Care Details Section */}
                        <DayCareDetailsForm values={values} handleChange={handleChange} handleBlur={handleBlur} />

                        {/* Procedure List Section */}
                        <ProcedureListForm values={values} handleChange={handleChange} handleBlur={handleBlur} />

                        {/* Department Incharge Section */}
                        <DepartmentInchargeForm values={values} handleChange={handleChange} handleBlur={handleBlur} />

                        <Button type="submit" variant="contained" color="primary">
                            Submit
                        </Button>
                    </Box>
                </Form>
            )}
        </Formik>
    );
};

export default HospitalForm;
