import React, { useState } from 'react'
import { Doctors } from './options';
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
    Grid,
    Badge
} from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import BasicDatePicker from '../../components/DatePicker';
import BasicTimePicker from '../../components/TimePicker';
import DynamicTable from './DbForms/FormPreview';
import { styled } from '@mui/system';

const ScrollableForm = styled(Box)({
    width: '100%',
    height: 'calc(90vh - 100px)', // Adjust height as needed based on your layout
    overflowY: 'auto',
    padding: '20px',
});


const BorderedTypography = styled(Box)(({ theme }) => ({
    border: `1px solid #3e4396`, // Example border style
    padding: theme.spacing(2),
    marginBottom: "1rem",
    borderRadius: theme.shape.borderRadius, // Optional: Adds rounded corners
}));


function FormAfterCallPurpose({ callPurpose, formData, setFormData, initialFormData, prevStep, handleChange, submitted, handleSubmit, setStep, setSubmitted }) {
    const [isPreview, setIsPreview] = useState(false);
    const handlePreview = () => {
        setIsPreview(true)
    }
    const handleHomePage = () => {
        setFormData(initialFormData);
        setStep(1);
        setSubmitted(false);
    }

    return (

        <>
            {!isPreview && !submitted && (<Box component="form" noValidate autoComplete="off">
                {callPurpose === "Surgery" && (
                    // <Box>
                    <ScrollableForm>
                        <FormControl component="fieldset">
                            {/* <FormLabel component="legend" sx={{fontWeight:800,fontSize:"1.2rem"}}>Surgey Query</FormLabel> */}
                            <Typography
                                variant='h5'
                                sx={{ fontWeight: 800 }}
                            >Surgey Query</Typography>
                            <RadioGroup name="surgeryQuery" value={formData.surgeryQuery} onChange={handleChange}>
                                <FormControlLabel value="surgery price" control={<Radio color='secondary' />} label="Surgery Price" />
                                <FormControlLabel value="doctor's availibility for surgery" control={<Radio color='secondary' />} label="Doctor's Availibility for Surgery" />
                                <FormControlLabel value="suggested call back" control={<Radio color='secondary' />} label="Suggested Call back" />
                                <FormControlLabel value="Others" control={<Radio color='secondary' />} label="Others" />
                            </RadioGroup>
                        </FormControl>
                        <Typography
                            variant='h5'
                            sx={{ mt: "8px", fontWeight: 800 }}
                        >Remarks</Typography>
                        {/* <InputLabel>Got Reference From</InputLabel> */}
                        <TextField
                            fullWidth
                            variant="filled"
                            type="text"
                            label="Remarks"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            sx={{ mb: 2 }}
                        />
                        <Typography variant='h6'>Ratings From The Patient(Surgery)</Typography>
                        {/* <FormLabel component="legend">Ratings From The Patient(Surgery)</FormLabel> */}
                        <RadioGroup name="ratings" value={formData.ratings} onChange={handleChange}>
                            <FormControlLabel value="1" control={<Radio color='secondary' />} label="1" />
                            <FormControlLabel value="2" control={<Radio color='secondary' />} label="2" />
                            <FormControlLabel value="3" control={<Radio color='secondary' />} label="3" />
                            <FormControlLabel value="4" control={<Radio color='secondary' />} label="4" />
                            <FormControlLabel value="5" control={<Radio color='secondary' />} label="5" />
                        </RadioGroup>
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
                            onClick={handlePreview}
                            color='secondary'
                            disabled={
                                !formData.surgeryQuery ||
                                !formData.remarks ||
                                !formData.ratings
                            }
                        >
                            Preview
                        </Button>
                    </ScrollableForm>
                    // {/* </Box> */}
                )}


                {(callPurpose === "Appointment"
                    || callPurpose === "Rescheduling of Apppointment"
                    || callPurpose === "Health Checkup"
                ) && (
                        // <Box>
                        <ScrollableForm>
                            <Box p="4px">
                                <BorderedTypography>
                                    <Typography variant="h5">
                                        {callPurpose}
                                    </Typography>
                                </BorderedTypography>
                                <FormControl fullWidth variant="filled" sx={{ mb: 2 }}>
                                    <InputLabel>Doctors</InputLabel>
                                    <Select name="doctorName" value={formData.doctorName} onChange={handleChange}>
                                        <MenuItem value="">Select</MenuItem>
                                        {Doctors.map(doctor => (
                                            <MenuItem key={doctor.key} value={doctor.doctorName}>
                                                {doctor.doctorName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box p="4px">
                                <Typography variant='h5'>Type of Illness(Appointment)</Typography>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="your answer"
                                    // placeholder='your answer'
                                    name="typeOfIllness"
                                    value={formData.typeOfIllness}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                />
                            </Box>
                            <Box p="4px">
                                <Typography variant='h5'>Appointment Date</Typography>
                                <BasicDatePicker
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            </Box>
                            <Box p="4px">
                                <Typography variant='h5'>Appointment Time</Typography>
                                <BasicTimePicker
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            </Box>
                            <Box p="8px">
                                <Typography variant='h5'>Ratings From The Patient(Surgery)</Typography>
                                {/* <RadioGroup name="ratings" value={formData.ratings} onChange={handleChange}>
                            <FormControlLabel value="1" control={<Radio color='secondary'/>} label="1" />
                            <FormControlLabel value="2" control={<Radio color='secondary'/>} label="2" />
                            <FormControlLabel value="3" control={<Radio color='secondary'/>} label="3" />
                            <FormControlLabel value="4" control={<Radio color='secondary'/>} label="4" />
                        </RadioGroup> */}
                                <Grid container spacing={6} alignItems="center">
                                    <Grid item xs={12} sm={6}>
                                        <RadioGroup row name="ratings" value={formData.ratings} onChange={handleChange}>
                                            <FormControlLabel value="1" control={<Radio color='secondary' />} label="1" sx={{ mr: 4 }} />
                                            <FormControlLabel value="2" control={<Radio color='secondary' />} label="2" sx={{ mr: 4 }} />
                                            <FormControlLabel value="3" control={<Radio color='secondary' />} label="3" sx={{ mr: 4 }} />
                                            <FormControlLabel value="4" control={<Radio color='secondary' />} label="4" sx={{ mr: 4 }} />
                                            <FormControlLabel value="5" control={<Radio color='secondary' />} label="5" sx={{ mr: 4 }} />
                                        </RadioGroup>
                                    </Grid>
                                </Grid>
                            </Box>
                            <Button
                                variant="contained"
                                color='secondary'
                                onClick={prevStep}
                                sx={{ m: 2 }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color='secondary'
                                onClick={handlePreview}
                                disabled={
                                    !formData.doctorName ||
                                    !formData.typeOfIllness ||
                                    !formData.ratings ||
                                    !formData.AppointmentDate ||
                                    !formData.AppointmentTime
                                }
                            >
                                Preview
                            </Button>
                        </ScrollableForm>
                        // {/* </Box> */}
                    )}


                {(callPurpose === "Internal to Internal Transer"
                    || callPurpose === "Internal to External Transfer"
                    || callPurpose === "External to Internal Transfer"
                    || callPurpose === "External to Internal Transfer"
                    || callPurpose === "External to External Transfer"
                    || callPurpose === "IPD Transfers"
                ) && (
                        <Box>
                            <Box p="4px">
                                <Typography variant='h5'>Transfer From</Typography>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="your answer"
                                    // placeholder='your answer'
                                    name="transferFrom"
                                    value={formData.transferFrom}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                />
                            </Box>
                            <Box p="4px">
                                <Typography variant='h5'>Transfer To</Typography>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="your answer"
                                    // placeholder='your answer'
                                    name="transferTo"
                                    value={formData.transferTo}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                />
                            </Box>
                            <Box p="4px">
                                <Typography variant='h5'>Transfer Purpose</Typography>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="your answer"
                                    // placeholder='your answer'
                                    name="transferPurpose"
                                    value={formData.transferPurpose}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                />
                            </Box>
                            <Box p="4px">
                                <Typography variant='h5'>Remarks</Typography>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="your answer"
                                    // placeholder='your answer'
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                />
                            </Box>
                            {/* <Box p="4px">
                            <Typography variant='h5'>Remarks(Covid Query)</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="your answer"
                                // placeholder='your answer'
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box> */}
                            <Button
                                variant="contained"
                                color='secondary'
                                onClick={prevStep}
                                sx={{ m: 2 }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color='secondary'
                                onClick={handlePreview}
                                disabled={
                                    !formData.remarks ||
                                    !formData.transferPurpose ||
                                    !formData.transferFrom ||
                                    !formData.transferTo
                                }
                            >
                                Preview
                            </Button>
                        </Box>

                    )}

                {callPurpose === "Covid Query" && (
                    // <Box>
                    <ScrollableForm>
                        <Box p="4px" mb="4px">
                            <Box pb="4px" mb="4px">
                                <BorderedTypography>
                                    <Typography variant="h4">
                                        Covid Query
                                    </Typography>
                                </BorderedTypography>
                            </Box>

                            <FormControl component="fieldset">
                                <Typography variant='h5'>Type of Query(Covid Query)</Typography>
                                <RadioGroup name="queyType" value={formData.queyType} onChange={handleChange}>
                                    <FormControlLabel value="vaccination" control={<Radio color='secondary' />} label="Vaccination" />
                                    <FormControlLabel value="Covid Bed/ICU Enquiry" control={<Radio color='secondary' />} label="Covid Bed/ICU Enquiry" />
                                    <FormControlLabel value="general enquiry" control={<Radio color='secondary' />} label="General Enquiry" />
                                    {/* <FormControlLabel value="Others" control={<Radio color='secondary'/>} label="Others" /> */}
                                </RadioGroup>
                            </FormControl>

                        </Box>
                        <Box p="4px">
                            <FormControl component="fieldset">
                                <Typography variant='h5'>Action Taken(Covid Query)</Typography>
                                <RadioGroup name="actionTaken" value={formData.actionTaken} onChange={handleChange}>
                                    <FormControlLabel value="informationGiven" control={<Radio color='secondary' />} label="Information Given" />
                                    <FormControlLabel value="other" control={<Radio color='secondary' />} label="Other" />
                                    {/* <FormControlLabel value="general enquiry" control={<Radio color='secondary'/>} label="General Enquiry" /> */}
                                    {/* <FormControlLabel value="Others" control={<Radio color='secondary'/>} label="Others" /> */}
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Box p="4px">
                            <Typography variant='h5'>Remarks(Covid Query)</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="your answer"
                                // placeholder='your answer'
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                        <Box p="8px">
                            <Typography variant='h5'>Ratings From The Patient(Covid Query)</Typography>
                            <Grid container spacing={6} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <RadioGroup row name="ratings" value={formData.ratings} onChange={handleChange}>
                                        <FormControlLabel value="1" control={<Radio color='secondary' />} label="1" sx={{ mr: 4 }} />
                                        <FormControlLabel value="2" control={<Radio color='secondary' />} label="2" sx={{ mr: 4 }} />
                                        <FormControlLabel value="3" control={<Radio color='secondary' />} label="3" sx={{ mr: 4 }} />
                                        <FormControlLabel value="4" control={<Radio color='secondary' />} label="4" sx={{ mr: 4 }} />
                                        <FormControlLabel value="5" control={<Radio color='secondary' />} label="5" sx={{ mr: 4 }} />
                                    </RadioGroup>
                                </Grid>
                            </Grid>
                        </Box>

                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={prevStep}
                            sx={{ m: 2 }}>
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={handlePreview}
                            disabled={
                                !formData.queyType ||
                                !formData.actionTaken ||
                                !formData.remarks ||
                                !formData.ratings
                            }
                        >
                            Preview
                        </Button>
                    </ScrollableForm>
                    // {/* </Box> */}
                )}

                {callPurpose === "Genral Query" && (
                    // <Box>
                    <ScrollableForm>

                        <Box p="4px" mb="4px">
                            {/* <Box pb="4px" mb="4px"> */}
                            <BorderedTypography>
                                <Typography variant="h4">
                                    Genral Query
                                </Typography>
                            </BorderedTypography>
                            {/* </Box> */}

                            <FormControl component="fieldset">
                                <Typography variant='h5' sx={{ fontWeight: 600, m: 1 }}>Type of Query(Genral Query)</Typography>
                                <RadioGroup name="queyType" value={formData.queyType} onChange={handleChange}>
                                    <FormControlLabel value="OPD Timings" control={<Radio color='secondary' />} label="OPD Timings" />
                                    <FormControlLabel value="Doctor's Availability Shared" control={<Radio color='secondary' />} label="Doctor's Availability Shared" />
                                    <FormControlLabel value="Government Health Scheme Information needed" control={<Radio color='secondary' />} label="Government Health Scheme Information needed" />
                                    <FormControlLabel value="Non-government Health Scheme Information needed" control={<Radio color='secondary' />} label="Non-government Health Scheme Information needed" />
                                    <FormControlLabel value="Ambulance Number" control={<Radio color='secondary' />} label="Ambulance Number" />
                                    <FormControlLabel value="Hospital Location(Address)" control={<Radio color='secondary' />} label="Hospital Location(Address)" />
                                    <FormControlLabel value="Others" control={<Radio color='secondary' />} label="Others" />
                                    {/* <FormControlLabel value="Others" control={<Radio color='secondary'/>} label="Others" /> */}
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Box p="4px">
                            <FormControl component="fieldset">
                                <Typography variant='h5'>Action Taken(Genral Query)</Typography>
                                <RadioGroup name="actionTaken" value={formData.actionTaken} onChange={handleChange}>
                                    <FormControlLabel value="informationGiven" control={<Radio color='secondary' />} label="Information Given" />
                                    <FormControlLabel value="other" control={<Radio color='secondary' />} label="Other" />
                                    {/* <FormControlLabel value="general enquiry" control={<Radio color='secondary'/>} label="General Enquiry" /> */}
                                    {/* <FormControlLabel value="Others" control={<Radio color='secondary'/>} label="Others" /> */}
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Box p="4px">
                            <Typography variant='h5'>Remarks(Covid Query)</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="your answer"
                                // placeholder='your answer'
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                        <Box p="8px">
                            <Typography variant='h5'>Ratings From The Patient(Genral Query)</Typography>
                            <RadioGroup name="ratings" value={formData.ratings} onChange={handleChange}>
                                <FormControlLabel value="1" control={<Radio color='secondary' />} label="1" sx={{ mr: 4 }} />
                                <FormControlLabel value="2" control={<Radio color='secondary' />} label="2" sx={{ mr: 4 }} />
                                <FormControlLabel value="3" control={<Radio color='secondary' />} label="3" sx={{ mr: 4 }} />
                                <FormControlLabel value="4" control={<Radio color='secondary' />} label="4" sx={{ mr: 4 }} />
                                <FormControlLabel value="5" control={<Radio color='secondary' />} label="5" sx={{ mr: 4 }} />
                            </RadioGroup>
                        </Box>

                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={prevStep}
                            sx={{ m: 2 }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={handlePreview}
                            disabled={
                                !formData.queyType ||
                                !formData.actionTaken ||
                                !formData.remarks ||
                                !formData.ratings
                            }
                        >
                            Preview
                        </Button>
                    </ScrollableForm>
                    // {/* </Box> */}
                )}

                {callPurpose === "Emergency Query" && (
                    <Box>
                        <Box p="4px" mb="4px">
                            <Box pb="4px" mb="4px">
                                <Typography variant="h4">
                                    Emergency
                                </Typography>
                            </Box>
                            <FormControl component="fieldset">
                                <Typography variant='h5'>Type of Query(Emergency)</Typography>
                                <RadioGroup name="queyType" value={formData.queyType} onChange={handleChange}>
                                    <FormControlLabel value="Ambulance" control={<Radio color='secondary' />} label="Ambulance" />
                                    <FormControlLabel value="Call Transfer" control={<Radio color='secondary' />} label="Call Transfer" />
                                    <FormControlLabel value="Advised to come directly to emergency" control={<Radio color='secondary' />} label="Advised to come directly to emergency" />
                                    <FormControlLabel value="Others" control={<Radio color='secondary' />} label="Others" />
                                    {/* <FormControlLabel value="Others" control={<Radio color='secondary'/>} label="Others" /> */}
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Box p="4px">
                            <Typography variant='h5'>Remarks(Emergency)</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="your answer"
                                // placeholder='your answer'
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={prevStep}
                            sx={{ m: 2 }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={handlePreview}
                            disabled={
                                !formData.queyType ||
                                !formData.ratings
                            }
                        >
                            Preview
                        </Button>

                    </Box>
                )}

                {(callPurpose === "marketing Campaign"
                    || callPurpose === "Other"
                    || callPurpose === "Nursing"
                ) && (
                        <Box>
                            <Box p="4px" mb="4px">
                                <Typography variant="h4">
                                    {callPurpose}
                                </Typography>

                            </Box>
                            <Box p="4px">
                                <Typography variant='h5'>Remarks({callPurpose})</Typography>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="your answer"
                                    // placeholder='your answer'
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                />
                            </Box>
                            <Button
                                variant="contained"
                                color='secondary'
                                onClick={prevStep}
                                sx={{ m: 2 }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color='secondary'
                                onClick={handlePreview}
                                disabled={
                                    !formData.remarks
                                }
                            >
                                Preview
                            </Button>

                        </Box>
                    )}

                {(callPurpose === "Govt Health Schemes"
                    || callPurpose === "Not Govenment Scheme"
                ) && (
                        <Box>
                            <Box p="4px" mb="4px" bgcolor='black' color={"white"}>
                                <Typography variant="h4">
                                    TPA
                                </Typography>

                            </Box>
                            <Box p="4px">
                                <Typography variant='h5'>{callPurpose}</Typography>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="your answer"
                                    // placeholder='your answer'
                                    name="healthScheme"
                                    value={formData.healthScheme}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                />
                            </Box>
                            <Box p="4px">
                                <Typography variant='h5'>Remarks({callPurpose})</Typography>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="your answer"
                                    // placeholder='your answer'
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                />
                            </Box>
                            <Button
                                variant="contained"
                                color='secondary'
                                onClick={prevStep}
                                sx={{ m: 2 }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color='secondary'
                                onClick={handlePreview}
                            >
                                Preview
                            </Button>
                        </Box>
                    )}

                {(callPurpose === "OPD Timings") && (
                    <Box>
                        <Box p="4px">
                            <Typography variant="h5">
                                Doctor Name ({callPurpose})
                            </Typography>
                            <FormControl fullWidth variant="filled" sx={{ mb: 2 }}>
                                <InputLabel>Choose</InputLabel>
                                <Select name="doctorName" value={formData.doctorName} onChange={handleChange}>
                                    <MenuItem value="">Select</MenuItem>
                                    {Doctors.map(doctor => (
                                        <MenuItem key={doctor.key} value={doctor.doctorName}>
                                            {doctor.doctorName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box p="4px">
                            <Typography variant='h5'>Action Taken({callPurpose})</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="your answer"
                                // placeholder='your answer'
                                name="takenAction"
                                value={formData.takenAction}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                        <Box p="8px">
                            <Typography variant='h5'>Ratings From The Patient({callPurpose})</Typography>
                            <Grid container spacing={6} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <RadioGroup row name="ratings" value={formData.ratings} onChange={handleChange}>
                                        <FormControlLabel value="1" control={<Radio color='secondary' />} label="1" sx={{ mr: 4 }} />
                                        <FormControlLabel value="2" control={<Radio color='secondary' />} label="2" sx={{ mr: 4 }} />
                                        <FormControlLabel value="3" control={<Radio color='secondary' />} label="3" sx={{ mr: 4 }} />
                                        <FormControlLabel value="4" control={<Radio color='secondary' />} label="4" sx={{ mr: 4 }} />
                                        <FormControlLabel value="5" control={<Radio color='secondary' />} label="5" sx={{ mr: 4 }} />
                                    </RadioGroup>
                                </Grid>
                            </Grid>
                        </Box>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={prevStep}
                            sx={{ m: 2 }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={handlePreview}
                            disabled={
                                !formData.doctorName ||
                                !formData.ratings ||
                                !formData.takenAction
                            }
                        >
                            Preview
                        </Button>
                    </Box>
                )}

                {callPurpose === "Diagnose or Test Price" && (
                    <Box>
                        <Typography variant="h4" mb="8px">
                            {callPurpose}
                        </Typography>
                        <Box p="4px">
                            <Typography variant='h6'>Test Name</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="your answer"
                                // placeholder='your answer'
                                name="testName"
                                value={formData.testName}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                        <Box p="4px">
                            <Typography variant='h6'>Action Taken({callPurpose})</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="your answer"
                                // placeholder='your answer'
                                name="takenAction"
                                value={formData.takenAction}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                        <Box p="8px">
                            <Typography variant='h5'>Ratings From The Patient({callPurpose})</Typography>
                            <Grid container spacing={6} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <RadioGroup row name="ratings" value={formData.ratings} onChange={handleChange}>
                                        <FormControlLabel value="1" control={<Radio color='secondary' />} label="1" sx={{ mr: 4 }} />
                                        <FormControlLabel value="2" control={<Radio color='secondary' />} label="2" sx={{ mr: 4 }} />
                                        <FormControlLabel value="3" control={<Radio color='secondary' />} label="3" sx={{ mr: 4 }} />
                                        <FormControlLabel value="4" control={<Radio color='secondary' />} label="4" sx={{ mr: 4 }} />
                                        <FormControlLabel value="5" control={<Radio color='secondary' />} label="5" sx={{ mr: 4 }} />
                                    </RadioGroup>
                                </Grid>
                            </Grid>
                        </Box>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={prevStep}
                            sx={{ m: 2 }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={handlePreview}
                        >
                            Preview
                        </Button>
                    </Box>
                )}

                {callPurpose === "Complaints" && (
                    <Box>
                        <Typography variant="h4" mb="8px">
                            {callPurpose}
                        </Typography>
                        <Box p="4px">
                            <Typography variant='h6'>Complaint type</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="your answer"
                                // placeholder='your answer'
                                name="complaintType"
                                value={formData.complaintType}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                        <Box p="4px">
                            <Typography variant='h6'>Action Taken({callPurpose})</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="your answer"
                                // placeholder='your answer'
                                name="takenAction"
                                value={formData.takenAction}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                        <Box p="8px">
                            <Typography variant='h5'>Ratings From The Patient({callPurpose})</Typography>
                            <Grid container spacing={6} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <RadioGroup row name="ratings" value={formData.ratings} onChange={handleChange}>
                                        <FormControlLabel value="1" control={<Radio color='secondary' />} label="1" sx={{ mr: 4 }} />
                                        <FormControlLabel value="2" control={<Radio color='secondary' />} label="2" sx={{ mr: 4 }} />
                                        <FormControlLabel value="3" control={<Radio color='secondary' />} label="3" sx={{ mr: 4 }} />
                                        <FormControlLabel value="4" control={<Radio color='secondary' />} label="4" sx={{ mr: 4 }} />
                                        <FormControlLabel value="5" control={<Radio color='secondary' />} label="5" sx={{ mr: 4 }} />
                                    </RadioGroup>
                                </Grid>
                            </Grid>
                        </Box>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={prevStep}
                            sx={{ m: 2 }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={handlePreview}
                            disabled={
                                !formData.complaintType ||
                                !formData.ratings ||
                                !formData.takenAction
                            }
                        >
                            Preview
                        </Button>
                    </Box>
                )}

                {callPurpose === "Reports" && (
                    <Box>
                        <Typography variant='h4' mb="4px" p="4px">{callPurpose}</Typography>
                        <Box p="4px">
                            <Typography variant='h5'>Remarks({callPurpose})</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="your answer"
                                // placeholder='your answer'
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                        <Box p="4px">
                            <Typography variant='h5'>Patient's Email ID</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                type="email"
                                label="your answer"
                                // placeholder='your answer'
                                name="patientEmail"
                                value={formData.patientEmail}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                        <Box p="8px">
                            <Typography variant='h5'>Ratings From The Patient({callPurpose})</Typography>
                            <Grid container spacing={6} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <RadioGroup row name="ratings" value={formData.ratings} onChange={handleChange}>
                                        <FormControlLabel value="1" control={<Radio color='secondary' />} label="1" sx={{ mr: 4 }} />
                                        <FormControlLabel value="2" control={<Radio color='secondary' />} label="2" sx={{ mr: 4 }} />
                                        <FormControlLabel value="3" control={<Radio color='secondary' />} label="3" sx={{ mr: 4 }} />
                                        <FormControlLabel value="4" control={<Radio color='secondary' />} label="4" sx={{ mr: 4 }} />
                                        <FormControlLabel value="5" control={<Radio color='secondary' />} label="5" sx={{ mr: 4 }} />
                                    </RadioGroup>
                                </Grid>
                            </Grid>
                        </Box>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={prevStep}
                            sx={{ m: 2 }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={handlePreview}
                            disabled={
                                !formData.remarks ||
                                !formData.ratings ||
                                !formData.patientEmail
                            }
                        >
                            Preview
                        </Button>
                    </Box>
                )}

                {callPurpose === "billing" && (
                    <Box>
                        <Typography variant="h4" mb="8px" p="4px">
                            {callPurpose}
                        </Typography>
                        <Box p="4px">
                            <FormControl component="fieldset">
                                <Typography variant='h5'>Action Taken({callPurpose})</Typography>
                                <RadioGroup name="takenAction" value={formData.takenAction} onChange={handleChange}>
                                    <FormControlLabel value="Call Transferred" control={<Radio color='secondary' />} label="Call Transferred" />
                                    <FormControlLabel value="Information Given" control={<Radio color='secondary' />} label="Information Given" />
                                    <FormControlLabel value="Others" control={<Radio color='secondary' />} label="Others" />
                                    {/* <FormControlLabel value="Others" control={<Radio color='secondary'/>} label="Others" /> */}
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Box p="4px">
                            <Typography variant='h5'>Remarks({callPurpose})</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="your answer"
                                // placeholder='your answer'
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={prevStep}
                            sx={{ m: 2 }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={handlePreview}
                            disabled={
                                !formData.remarks ||
                                !formData.takenAction ||
                                !formData.ratings
                            }
                        >
                            Preview
                        </Button>
                    </Box>
                )}

                {(callPurpose === "Ambulance"
                    || callPurpose === "Call Drop"
                ) && (
                        <Box>
                            <Typography variant='h4' mb="4px" p="4px">Please Preview the Form</Typography>
                            <Button
                                variant="contained"
                                color='secondary'
                                onClick={prevStep}
                                sx={{ m: 2 }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color='secondary'
                                onClick={handlePreview}
                            >
                                Submit
                            </Button>
                        </Box>
                    )}

                {callPurpose === "Pharmacy" && (
                    <Box>
                        <Box p="4px" mb="4px">
                            <Box pb="4px" mb="8 px">
                                <Typography variant="h4">
                                    {callPurpose}
                                </Typography>
                            </Box>

                            <FormControl component="fieldset">
                                <Typography variant='h5'>Type of Query({callPurpose})</Typography>
                                <RadioGroup name="queyType" value={formData.queyType} onChange={handleChange}>
                                    <FormControlLabel value="Medicine inquiry" control={<Radio color='secondary' />} label="Medicine inquiry" />
                                    <FormControlLabel value="Prices" control={<Radio color='secondary' />} label="Prices" />
                                    <FormControlLabel value="Government Health Scheme" control={<Radio color='secondary' />} label="Government Health Scheme" />
                                    <FormControlLabel value="Non-government Health Scheme" control={<Radio color='secondary' />} label="Non-government Health Scheme" />
                                    <FormControlLabel value="Others" control={<Radio color='secondary' />} label="Others" />
                                    {/* <FormControlLabel value="Others" control={<Radio color='secondary'/>} label="Others" /> */}
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Typography variant='h6'>Remarks({callPurpose})</Typography>
                        {/* <InputLabel>Got Reference From</InputLabel> */}
                        <TextField
                            fullWidth
                            variant="filled"
                            type="text"
                            label="Remarks"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={prevStep}
                            sx={{ m: 2 }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color='secondary'
                            onClick={handlePreview}
                            disabled={
                                !formData.remarks ||
                                !formData.queyType
                                // !formData.ratings
                            }
                        >
                            Submit
                        </Button>
                    </Box>
                )}

            </Box>)}

            {isPreview && !submitted && (
                <DynamicTable
                    formData={formData}
                    prevStep={prevStep}
                    handleSubmit={()=>handleSubmit(formData)}
                />
            )}

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

export default FormAfterCallPurpose
