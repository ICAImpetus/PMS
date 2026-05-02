import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Radio,
    RadioGroup,
    Checkbox,
} from "@mui/material";
import React, { useState } from "react";
// import { doctorNameArray as doctorNamesArray } from "../../../data/outBoundFormData";

const Section5 = ({ dispatch, data }) => {
    const [localData, setLocalData] = useState(data || {});
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        setLocalData({ ...localData, [e.target.name]: e.target.value });
    };

    const validateFields = () => {
        const newErrors = {};
        if (!localData.feedbackOpd) {
            newErrors.feedbackOpd = "Feedback-OPD is required";
        }
        if (!localData.opdNumber) {
            newErrors.opdNumber = "OPD Number is required";
        }
        if (!localData.doctorName) {
            newErrors.doctorName = "Doctor Name is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateFields()) {
            dispatch({
                type: "UPDATE_SECTION_DATA",
                payload: { sectionIndex: 4, data: localData }, // Update for Section 5
            });
            dispatch({ type: "NEXT_SECTION" });
        }
    };

    return (
        <Box
            sx={{
                width: "100%", // Ensure it takes up the available width
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    maxWidth: "700px", // Explicitly set maxWidth
                    width: "100%", // Ensures it takes full available width up to maxWidth
                    margin: "0 auto",
                }}
            >
                {/* Feedback-OPD TextField */}
                <TextField
                    name="feedbackOpd"
                    label="Feedback-OPD"
                    value={localData.feedbackOpd || ""}
                    onChange={handleInputChange}
                    error={!!errors.feedbackOpd}
                    helperText={errors.feedbackOpd}
                    fullWidth
                    required
                />

                {/* OPD Number */}
                <TextField
                    name="opdNumber"
                    label="OPD Number"
                    value={localData.opdNumber || ""}
                    onChange={handleInputChange}
                    error={!!errors.opdNumber}
                    helperText={errors.opdNumber}
                    fullWidth
                    required
                />

                {/* Doctor Name Dropdown Select */}
                <FormControl fullWidth>
                    <InputLabel id="doctor-name-label">Doctor Name</InputLabel>
                    <Select
                        labelId="doctor-name-label"
                        label="Doctor Name"
                        name="doctorName"
                        value={localData.doctorName || ""}
                        onChange={handleInputChange}
                    >
                        {doctorNamesArray.map((name) => (
                            <MenuItem key={name} value={name}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Question 1: OPD Timings */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 1: Are OPD timings convenient for you ? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="opdTimingSatisfaction"
                        value={localData.opdTimingSatisfaction || ""}
                        onChange={handleInputChange}
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <FormControlLabel
                                key={value}
                                value={value.toString()}
                                control={<Radio />}
                                label={value}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

                {/* Question 2: Parking Facility */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 2: Did you find parking facility comfortably in the hospital? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="parkingFacilities"
                        value={localData.parkingFacilities || ""}
                        onChange={handleInputChange}
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <FormControlLabel
                                key={value}
                                value={value.toString()}
                                control={<Radio />}
                                label={value}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

                {/* Question 3: Finding Department */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 3: Have you faced problems in finding the concerned department? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="problemFacedFindingDepartments"
                        value={localData.problemFacedFindingDepartments || ""}
                        onChange={handleInputChange}
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <FormControlLabel
                                key={value}
                                value={value.toString()}
                                control={<Radio />}
                                label={value}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

                {/* Question 4: Waiting Area Cleanliness */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 4: Did you find waiting area clean / sufficient ? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="waitingAreaCleaninessAndSufficiency"
                        value={localData.waitingAreaCleaninessAndSufficiency || ""}
                        onChange={handleInputChange}
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <FormControlLabel
                                key={value}
                                value={value.toString()}
                                control={<Radio />}
                                label={value}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

                {/* Question 5: Wait for Consultation */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 5: Did you wait for long before consultation? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="waitLongBeforeConsultation"
                        value={localData.waitLongBeforeConsultation || ""}
                        onChange={handleInputChange}
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <FormControlLabel
                                key={value}
                                value={value.toString()}
                                control={<Radio />}
                                label={value}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

                {/* Question 6: Wait for Tests */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 6: Did you wait for long before your tests? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="waitingTimeBeforeTests"
                        value={localData.waitingTimeBeforeTests || ""}
                        onChange={handleInputChange}
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <FormControlLabel
                                key={value}
                                value={value.toString()}
                                control={<Radio />}
                                label={value}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

                {/* Question 7: Doctor Focus */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 7: Was the Doctor focused about your treatment and your problem? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="doctorFocusSatisfaction"
                        value={localData.doctorFocusSatisfaction || ""}
                        onChange={handleInputChange}
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <FormControlLabel
                                key={value}
                                value={value.toString()}
                                control={<Radio />}
                                label={value}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

                {/* Question 8: Reports on Time */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 8: Did you receive reports on time? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="reportsOnTimeSatisfaction"
                        value={localData.reportsOnTimeSatisfaction || ""}
                        onChange={handleInputChange}
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <FormControlLabel
                                key={value}
                                value={value.toString()}
                                control={<Radio />}
                                label={value}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

                {/* Question 9: Doctor Explanation and Query Response */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 9: Doctor explained about your treatment and responded to all your questions? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="doctorExplanationSatisfaction"
                        value={localData.doctorExplanationSatisfaction || ""}
                        onChange={handleInputChange}
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <FormControlLabel
                                key={value}
                                value={value.toString()}
                                control={<Radio />}
                                label={value}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

                {/* Question 10: Overall Hospital Satisfaction */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 10: Are you happy with the treatment / services provided in the Hospital? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="overallHospitalSatisfaction"
                        value={localData.overallHospitalSatisfaction || ""}
                        onChange={handleInputChange}
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <FormControlLabel
                                key={value}
                                value={value.toString()}
                                control={<Radio />}
                                label={value}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

                {/* Remarks TextField */}
                <TextField
                    name="remarks"
                    label="Remarks"
                    value={localData.remarks || ""}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    fullWidth
                />

                {/* Next Button */}
                <Button variant="contained" onClick={handleNext}>
                    Next
                </Button>
            </Box>
        </Box>
    );
};


export default Section5
