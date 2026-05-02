import React, { useState } from 'react';
import { callPurpose, gotReferenceFrom, departments } from './options';
import FormAfterCallPurpose from './FormAfterCallPurpose';
import * as yup from "yup";
import { Formik } from 'formik';
import useMediaQuery from "@mui/material/useMediaQuery";
import { Toaster, toast } from 'react-hot-toast';
import DynamicTable from './DbForms/FormPreview';
import { postDatatoServer } from '../../utils/services';
import { useContacts } from '../../contexts/contact';
import FormFoundInDb from './DbForms/FormFoundInDb';
import FoundDbTable from './DbForms/FormFoundTable'


import {
    TextField,
    Button,
    Box,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Radio,
    RadioGroup,
    Select,
    MenuItem,
    InputLabel,
    Typography,
    Grid
} from '@mui/material';
import Header from '../../components/Header';
import { formatMeridiem } from '@mui/x-date-pickers/internals';
import { styled } from '@mui/system';
import { Summarize } from '@mui/icons-material';

const ScrollableForm = styled(Box)({
    width: '100%',
    height: 'calc(90vh - 100px)', // Adjust height as needed based on your layout
    overflowY: 'auto',
    padding: '20px',
});


const InboundForm = () => {
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isFound, setIsFound] = useState(false);
    // state varable for matching collections in db 
    const [matchingObjects, setMatchingObjects] = useState([]);
    const initialFormData = {
        userType: '',
        patientName: '',
        attendantName: '',
        patientGender: '',
        patientAge: '',
        contactNo: '',
        address: '',
        patientStatus: '',
        patientCategory: '',
        illnessType: '',
        reference: '',
        callPurpose: '',
        department: '',
        // Extra fields from FormAfterCallPurpose
        queyType: '', // Stick to original name used in FormAfterCallPurpose
        remarks: '',
        doctorsName: '',
        appointmentDate: '',
        appointmentTime: '',
        ratings: '',
        feedback: '',
        hospitalName: '',
        branchName: '',
        surgeryQuery: '',
    };
    const [formData, setFormData] = useState(initialFormData);
    const [submitted, setSubmitted] = useState(false);
    const { contacts } = useContacts();
    const keysToRemove = ['_id', 'timeStamp'];

    const updatedContacts = contacts.map(obj => {
        // Create a new object using object spread (...) syntax
        const newObj = { ...obj };

        // Remove keysToRemove from the new object
        keysToRemove.forEach(key => delete newObj[key]);

        return newObj; // Return the updated object
    });

    console.log(updatedContacts);

    console.log('contacts array in inbound form is :', contacts);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Validate the input value
        // const errorMsg = validate(name, value);
        // setErrors({ ...errors, [name]: errorMsg });
        if (touched[name]) {
            // Validate the input value
            const errorMsg = validate(name, value);
            setErrors({ ...errors, [name]: errorMsg });
        }

        // Check if the input name is "contactNo"
        if (name === "contactNo") {
            // Find the contact object in contactsArray where contactNo matches
            // const matchingContact = updatedContacts.find(contact => contact.contactNo === value);
            const matchingArrayInDb = contacts.filter(contact => contact.contactNo === value);

            // If a matching contact is found, update formData with its values
            // if (matchingContact) {
            if (matchingArrayInDb.length > 0) {
                // console.log('matchingCount is :', matchingContact);
                // setFormData(matchingContact)
                setMatchingObjects(matchingArrayInDb);
                setIsFound(true)
            } else {
                // Handle case where no matching contact is found
                console.log(`No contact found for contactNo: ${value}`);
            }
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });

        // Validate the input value
        const errorMsg = validate(name, value);
        setErrors({ ...errors, [name]: errorMsg });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = (formData) => {
        console.log(formData);
        if (formData) {
            postDatatoServer({
                end_point: 'addCustomer',
                body: formData,
                call_back: (res) => {
                    console.log('response is', res.response);
                    if (res?.status === 'success' && res?.response) {
                        toast.success('data uploaded successfully');
                        setSubmitted(true);
                    }
                },
                props: { header: true }
            })
        } else {
            return;
        }
        // Here you can handle form submission, e.g., send data to the server
    };

    const phoneRegExp =
        /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

    const validate = (name, value) => {
        let errorMsg = '';
        if (name === 'patientName' && !value) {
            errorMsg = 'Patient name is required';
            // toast.error('please enter patientName')
        }
        if (name === 'patientGender' && !value) {
            errorMsg = 'patientGender name is required';
        }
        if (name === 'patientAge' && !value) {
            errorMsg = 'patientAge is required';
        }
        if (name === 'address' && !value) {
            errorMsg = "address is required"
        }
        if (name === 'contactNo' && !value) {
            // errorMsg = "contactNo is required"
            errorMsg = 'Contact number is required';

        }

        if (name === 'contactNo' && !phoneRegExp.test(value)) {
            errorMsg = 'Contact nuberr is not correct'

        }

        if (name === 'contactNo' && value.length > 10) {
            errorMsg = 'please enter correct number'
            toast.error('please enter 10 digit number')
        }
        // if (name === 'contactNo' && typeof(value) === 'string') {
        //     errorMsg = "pleasse enter correct number"
        // }
        if (name === 'illnessType' && !value) {
            errorMsg = "illnessType is required"
        }
        if (name === 'reference' && !value) {
            errorMsg = "reference is required"
        }
        if (name === 'callPurpose' && !value) {
            errorMsg = "callPurpose is required"
        }
        if (name === 'department' && !value) {
            errorMsg = "department is required"
        }
        return errorMsg;
    };



    return (
        <Box
            m="10px"
            p="10px"
            borderRadius="4px"
        >
            <Header title="Patient Enquiry" subtitle="" />
            <Toaster position="top-right" reverseOrder={false} />
            {!isFound && (<Box component="form" noValidate autoComplete="off">
                {step === 1 && (
                    // <Box>
                    //     <FormControl component="fieldset">
                    //         <FormLabel component="legend">Select User Type</FormLabel>
                    //         <RadioGroup name="userType" value={formData.userType} onChange={handleChange}>
                    //             <FormControlLabel value="patient" control={<Radio />} label="Patient" />
                    //             <FormControlLabel value="attendant" control={<Radio />} label="Patient Attendant" />
                    //         </RadioGroup>
                    //     </FormControl>
                    //     <Button variant="contained" onClick={nextStep} disabled={!formData.userType} sx={{ mt: 2 }}>
                    //         Next
                    //     </Button>
                    // </Box>
                    <Box>
                        <FormControl component="fieldset">
                            {/* <FormLabel component="legend">Select User Type</FormLabel> */}
                            <RadioGroup name="userType" value={formData.userType} onChange={handleChange}>
                                <FormControlLabel value="patient" control={<Radio color='secondary' />} label="Patient" />
                                <FormControlLabel value="attendant" control={<Radio color='secondary' />} label="Patient Attendant" />
                            </RadioGroup>
                        </FormControl>
                        <Typography variant="h4" mb="4px" mt="4px">Contact No</Typography>
                        <TextField
                            fullWidth
                            variant="filled"
                            type="text"
                            label="contact number"
                            name="contactNo"
                            value={formData.contactNo}
                            onChange={handleChange}
                            sx={{ mb: 2 }}
                        />

                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color='secondary'
                                onClick={nextStep}
                                disabled={!formData.userType}
                            >
                                Next
                            </Button>
                        </Box>
                    </Box>
                )}

                {step === 2 && (
                    // <Box>
                    <ScrollableForm>
                        <Typography variant="h6">
                            {formData.userType === 'patient' ? 'Patient Information' : 'Patient and Attendant Information'}
                        </Typography>
                        {formData.userType === 'attendant' && (
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Attendant Name"
                                name="attendantName"
                                value={formData.attendantName}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        )}
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="Patient Name"
                                    name="patientName"
                                    value={formData.patientName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!errors.patientName}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="filled" sx={{ mb: 2 }}>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        name="patientGender"
                                        value={formData.patientGender}
                                        onChange={handleChange}
                                        error={!!errors.patientGender}
                                        onBlur={handleBlur}
                                    >
                                        <MenuItem value="">Select</MenuItem>
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="number"
                                    label="Age"
                                    name="patientAge"
                                    value={formData.patientAge}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!errors.patientAge}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="Contact No"
                                    name="contactNo"
                                    value={formData.contactNo}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    error={!!errors.contactNo}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            fullWidth
                            variant="filled"
                            type="text"
                            label="Address"
                            name="address"
                            value={formData.address}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            error={!!errors.address}
                            sx={{ mb: 2 }}
                        />


                        <FormControl component="fieldset" sx={{ p: 2, mr: 8 }}>
                            {/* <FormLabel component="legend">Patient Status</FormLabel> */}
                            <Typography variant="h4" mb="4px">Patient Status</Typography>
                            <RadioGroup name="patientStatus" value={formData.patientStatus} onChange={handleChange}>
                                <FormControlLabel value="old" control={<Radio color='secondary' />} label="Old" />
                                <FormControlLabel value="new" control={<Radio color='secondary' />} label="New" />
                                <FormControlLabel value="non-patient" control={<Radio color='secondary' />} label="Non-Patient" />
                            </RadioGroup>
                        </FormControl>
                        <FormControl component="fieldset" sx={{ p: 2 }}>
                            {/* <FormLabel component="legend">Patient Category</FormLabel> */}
                            <Typography variant="h4" mb="4px">Patient Category</Typography>
                            <RadioGroup name="patientCategory" value={formData.patientCategory} onChange={handleChange}>
                                <FormControlLabel value="cash" control={<Radio color='secondary' />} label="Cash" />
                                <FormControlLabel value="govt-schemes" control={<Radio color='secondary' />} label="Government Schemes" />
                                <FormControlLabel value="non-govt-schemes" control={<Radio color='secondary' />} label="Non-Government Schemes" />
                                <FormControlLabel value="others" control={<Radio color='secondary' />} label="Others" />
                            </RadioGroup>
                        </FormControl>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="Type of Illness"
                                    name="illnessType"
                                    value={formData.illnessType}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    error={!!errors.illnessType}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="filled" sx={{ mb: 2 }}>
                                    <InputLabel>Got Reference From</InputLabel>
                                    <Select
                                        name="reference"
                                        value={formData.reference}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!errors.reference}
                                    >
                                        {gotReferenceFrom.map(reference => (
                                            <MenuItem key={reference.key} value={reference.referenceFrom}>
                                                {reference.referenceFrom}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={prevStep}
                            sx={{ mr: 2 }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={nextStep}
                            color='secondary'
                            disabled={
                                !formData.reference ||
                                !formData.illnessType ||
                                !formData.patientCategory ||
                                !formData.patientStatus ||
                                !formData.patientName ||
                                !formData.address ||
                                !formData.contactNo
                            }
                        >
                            Next
                        </Button>
                        {/* </Box> */}
                    </ScrollableForm>
                )}

                {step === 3 && (
                    <Box>
                        <Typography variant="h4" mb="4px">Call Information</Typography>
                        <FormControl fullWidth variant="filled" sx={{ mb: 2 }}>
                            <InputLabel>Purpose of Calling</InputLabel>
                            <Select
                                name="callPurpose"
                                value={formData.callPurpose}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!errors.callPurpose}
                            >
                                <MenuItem value="">Select</MenuItem>
                                {callPurpose.map((purpose, index) => (
                                    <MenuItem key={purpose[index]} value={purpose.purpose}>
                                        {purpose.purpose}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth variant="filled" sx={{ mb: 2 }}>
                            <InputLabel>Department</InputLabel>
                            <Select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!errors.department}
                            >
                                <MenuItem value="">Select</MenuItem>
                                {departments.map((department, index) => (
                                    <MenuItem key={department[index]} value={department.department}>
                                        {department.department}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={prevStep}
                            sx={{ mr: 2 }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={nextStep}
                            disabled={
                                !formData.callPurpose ||
                                !formData.department
                            }
                        >
                            Next
                        </Button>
                    </Box>
                )}

                {/* {step === 4 && (
                    <Box>
                        <Typography variant="h6">Summary</Typography>
                        <Typography>Please review your information before submitting:</Typography>
                        <pre>{JSON.stringify(formData, null, 2)}</pre>
                        <Button variant="containerd" onClick={prevStep} sx={{ mr: 2 }}>
                            Back
                        </Button>
                        <Button variant="contained" onClick={()=>handleSubmit(formData)}>
                            Submit
                        </Button>
                    </Box>
                )} */}
                {step === 4 && formData.callPurpose && (
                    <FormAfterCallPurpose
                        callPurpose={formData.callPurpose}
                        formData={formData}
                        setFormData={setFormData}
                        initialFormData={initialFormData}
                        prevStep={prevStep}
                        handleChange={handleChange}
                        submitted={submitted}
                        handleSubmit={() => handleSubmit(formData)}
                        setStep={setStep}
                        setSubmitted={setSubmitted}
                    />
                )}

                {/* {step === 5 && (
                    <DynamicTable formData={formData} />
                )} */}
            </Box>)}

            {isFound && (
                // <FormFoundInDb
                //     setIsFound={setIsFound}
                //     formData={formData}
                //     handleBlur={handleBlur}
                //     handleChange={handleChange}
                //     errors={errors}
                //     handleSubmit={handleSubmit}
                //     submitted={submitted}
                //     setSubmitted={setSubmitted}
                // />
                <FoundDbTable
                    formData={formData}
                    setFormData={setFormData}
                    setIsFound={setIsFound}
                    matchingObjects={matchingObjects}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    errors={errors}
                    handleSubmit={handleSubmit}
                    submitted={submitted}
                    setSubmitted={setSubmitted}
                />
            )}
        </Box>
    );
};

export default InboundForm;
