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
import { useEffect } from 'react';
import { callPurpose, departments } from '../options';
import { styled } from '@mui/system';
import { useState } from 'react';
import { postDatatoServer } from '../../../utils/services';
import { Toaster, toast } from 'react-hot-toast'
const ScrollableForm = styled(Box)({
    width: '100%',
    height: 'calc(90vh - 100px)', // Adjust height as needed based on your layout
    overflowY: 'auto',
    padding: '20px',
});


const FormFoundInDb = ({
    setIsFound,
    formData,
    // setFormData,
    // handleBlur,
    // handleChange,
    // errors,
    // handleSubmit,
    submitted,
    setSubmitted
}) => {
    const [errors, setErrors] = useState({})
    const [formDataHere, setFormDataHere] = useState(formData);


    function removeIdAndTimestamp(obj) {
        // Destructure obj to exclude keys 'key1' and 'key2'
        const { _id, timeStamp,id,key, ...newObj } = obj;

        // Perform operations on newObj
        console.log('New Object:', newObj);

        // Return or use newObj as needed
        return newObj;
    }

    // Update formDataHere when formData prop changes (initially and if it changes later)
    useEffect(() => {
        setFormDataHere(formData);
    }, [formData]); // Only update when formData prop changes

    const handleHomePage = () => {
        if (Object.keys(formDataHere).length > 0) {
            Object.entries(formDataHere).map(([key, value]) => formDataHere[key] = "");
            // setStep(1)
            setSubmitted(false)
            setIsFound(false)


        }
    }


    const handleBlur = (e) => {
        const { name, value } = e.target;
        // setTouched({ ...touched, [name]: true });

        // Validate the input value
        // const errorMsg = validate(name, value);
        // setErrors({ ...errors, [name]: errorMsg });
    };


    const handleChange = (e) => {
        const { name, value } = e.target
        console.log('name and value event', name, value);
        // setFormDataHere({ ...formDataHere, [name]: value })
        setFormDataHere({ ...formDataHere, [name]: value });
    }

    const handleSubmit = (formData) => {
        console.log(formData);
        if (formData) {
            // removing id and timeStamp keys to update this in database in the backend
            const newFormData = removeIdAndTimestamp(formData);
            postDatatoServer({
                end_point: 'addCustomer',
                body: newFormData,
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

    // console.log('formData call purpose', formDataHere.callPurpose);

    const handleSubmitUpdated = () => {
        // Create a copy of formData and add/update the isUpdated property
        const updatedFormData = {
            ...formDataHere,
            isUpdated: true
        };
        console.log('handleSubmit is :', handleSubmit);
        // Call handleSubmit with the updated formData
        handleSubmit(updatedFormData);
    };

    return (
        <>
            <h2>FormFoundInDb</h2>

            {!submitted && (<ScrollableForm>
                <Typography variant="h6">
                    {formDataHere.userType === 'patient' ? 'Patient Information' : 'Patient and Attendant Information'}
                </Typography>
                {formDataHere.userType === 'attendant' && (
                    <TextField
                        fullWidth
                        // multiline
                        rows={2}
                        variant="filled"
                        label="Attendant Name"
                        name="attendantName"
                        value={formDataHere.attendantName}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                )}
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            // multiline
                            rows={2}
                            variant="filled"
                            label="Patient Name"
                            name="patientName"
                            value={formDataHere.patientName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!errors.patientName}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            // multiline
                            rows={2}
                            variant="filled"
                            label="Gender"
                            name="patientGender"
                            value={formDataHere.patientGender}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!errors.patientGender}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            // multiline
                            rows={2}
                            variant="filled"
                            label="Age"
                            name="patientAge"
                            value={formDataHere.patientAge}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!errors.patientAge}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            // multiline
                            rows={2}
                            variant="filled"
                            label="Contact No"
                            name="contactNo"
                            value={formDataHere.contactNo}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            error={!!errors.contactNo}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            // multiline
                            rows={3}
                            variant="filled"
                            label="Address"
                            name="address"
                            value={formDataHere.address}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            error={!!errors.address}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>

                        <TextField
                            fullWidth
                            // multiline
                            rows={3}
                            variant="filled"
                            label="Type of Illness"
                            name="illnessType"
                            value={formDataHere.illnessType}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            error={!!errors.illnessType}
                            sx={{ mb: 2 }}
                            helperText="Separate multiple illness types with commas"
                        />
                    </Grid>
                </Grid>


                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            // multiline
                            rows={3}
                            variant="filled"
                            label="Payment Type"
                            name="patientCategory"
                            value={formDataHere.patientCategory}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!errors.patientCategory}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            // multiline
                            rows={3}
                            variant="filled"
                            label="Action Taken"
                            name="actionTaken"
                            value={formDataHere.actionTaken}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!errors.actionTaken}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        {/* <TextField
                            fullWidth
                            // multiline
                            rows={3}
                            variant="filled"
                            label="Purpose of call"
                            name="callPurpose"
                            value={formDataHere.callPurpose}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!errors.callPurpose}
                            sx={{ mb: 2 }}
                        /> */}
                        <FormControl fullWidth variant="filled" sx={{ mb: 2 }}>
                            <InputLabel>Purpose of Calling</InputLabel>
                            <Select
                                name="callPurpose"
                                value={formDataHere.callPurpose}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!errors.callPurpose}
                            >
                                <MenuItem value="">Select</MenuItem>
                                {callPurpose.map((purpose, index) => (
                                    <MenuItem key={index} value={purpose.purpose}>
                                        {purpose.purpose}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                    </Grid>
                    <Grid item xs={12} md={6}>
                        {/* <TextField
                            fullWidth
                            // multiline
                            rows={3}
                            variant="filled"
                            label="Department"
                            name="department"
                            value={formDataHere.department}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!errors.department}
                            sx={{ mb: 2 }}
                        /> */}
                        <FormControl fullWidth variant="filled" sx={{ mb: 2 }}>
                            <InputLabel>Department</InputLabel>
                            <Select
                                name="department"
                                value={formDataHere.department}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!errors.department}
                            >
                                <MenuItem value="">Select</MenuItem>
                                {departments.map((department, index) => (
                                    <MenuItem key={index} value={department.department}>
                                        {department.department}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>


                <TextField
                    fullWidth
                    // multiline
                    rows={3}
                    variant="filled"
                    label="Type of Query"
                    name="queyType"
                    value={formDataHere.queyType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.queyType}
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    // multiline
                    rows={3}
                    variant="filled"
                    label="Remarks"
                    name="remarks"
                    value={formDataHere.remarks}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.remarks}
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    // multiline
                    rows={3}
                    variant="filled"
                    label="Ratings"
                    name="ratings"
                    value={formDataHere.ratings}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.ratings}
                    sx={{ mb: 2 }}
                />



                {/* Additional fields can be added similarly */}

                <Button
                    variant="contained"
                    color='secondary'
                    // onClick={() => setIsFound(false)}
                    onClick={handleHomePage}
                    sx={{ m: 1 }}
                // disabled={}
                >
                    Home
                </Button>

                <Button
                    variant="contained"
                    color='secondary'
                    // onClick={() => setIsFound(false)}
                    onClick={handleSubmitUpdated}
                    sx={{ m: 1 }}
                // disabled={}
                >
                    Submit
                </Button>
            </ScrollableForm>)}

            {submitted && (
                <Box>
                    <h3>Form Uploaded Succesfully</h3>
                    <Button
                        variant="contained"
                        color='secondary'
                        onClick={handleHomePage}
                        sx={{ m: 2 }}
                    >
                        Go To Home
                    </Button>
                </Box>

            )}



        </>
    )
}

export default FormFoundInDb