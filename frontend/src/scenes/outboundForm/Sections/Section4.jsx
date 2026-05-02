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
// import { doctorNameArray } from "../../../data/outBoundFormData";
// import { remarkOptions as checkboxOptions } from "../../../data/outBoundFormData";


const Section4 = ({ dispatch, data }) => {
    const [localData, setLocalData] = useState(data || {});
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        setLocalData({ ...localData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e) => {
        const value = e.target.value;
        const remarkOptions = localData.remarkOptions || [];
    
        if (e.target.checked) {
          // Add the value if checked
          setLocalData({ ...localData, remarkOptions: [...remarkOptions, value] });
        } else {
          // Remove the value if unchecked
          setLocalData({
            ...localData,
            remarkOptions: remarkOptions.filter((option) => option !== value),
          });
        }
      };

    const validateFields = () => {
        const newErrors = {};
        if (!localData.feedbackIPD) {
            newErrors.feedbackIPD = "Feedback-IPD is required";
        }
        if (!localData.ipdNumber) {
            newErrors.ipdNumber = "IPD Number is required";
        }
        if (!localData.doctorName) {
            newErrors.doctorName = "Doctor Name is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateFields()) {
            console.log(localData)
            dispatch({
                type: "UPDATE_SECTION_DATA",
                payload: { sectionIndex: 3, data: localData }, // Update for Section 4
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
                {/* Feedback-IPD (required) */}
                <TextField
                    name="feedbackIPD"
                    label="Feedback-IPD"
                    value={localData.feedbackIPD || ""}
                    onChange={handleInputChange}
                    error={!!errors.feedbackIPD}
                    helperText={errors.feedbackIPD}
                    fullWidth
                    required
                />

                {/* IPD Number (required) */}
                <TextField
                    name="ipdNumber"
                    label="IPD Number"
                    value={localData.ipdNumber || ""}
                    onChange={handleInputChange}
                    error={!!errors.ipdNumber}
                    helperText={errors.ipdNumber}
                    fullWidth
                    required
                />

                {/* Doctor Name Dropdown (required) */}
                <FormControl fullWidth>
                    <InputLabel id="doctor-name-label">Doctor Name</InputLabel>
                    <Select
                        labelId="doctor-name-label"
                        label="Doctor Name"
                        name="doctorName"
                        value={localData.doctorName || ""}
                        onChange={handleInputChange}
                    >
                        {doctorNameArray.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Question 1: Treatment Satisfaction */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 1: Are you happy with the treatment provided in the hospital? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="treatmentSatisfaction"
                        value={localData.treatmentSatisfaction || ""}
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

                {/* Question 2: Doctor Explanation */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 2: Did the Doctor Explain about your problem / disease ? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="doctorExplanation"
                        value={localData.doctorExplanation || ""}
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

                {/* Question 3: Nursing Staff Solution */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 3: Did the nursing staff gave solution to your problem ? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="nursingStaffSolution"
                        value={localData.nursingStaffSolution || ""}
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

                {/* Question 4: Hygiene and Cleanliness */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 4: Are you happy with the hygiene and cleanliness maintained in the wards ? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="hygieneSatisfaction"
                        value={localData.hygieneSatisfaction || ""}
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

                {/* Question 5: Ward Services Increase */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 5: Do you want, the services given in the ward should be increased ? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="wardServicesIncrease"
                        value={localData.wardServicesIncrease || ""}
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

                {/* Question 6: Reception Services */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 6: Are you happy with the services / information provided at the reception ? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="receptionSatisfaction"
                        value={localData.receptionSatisfaction || ""}
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

                {/* Question 7: Lab/X-Ray Services */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 7: Are you happy with the services of lab / X-Ray / Sonography / CT-Scan ? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="labServicesSatisfaction"
                        value={localData.labServicesSatisfaction || ""}
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

                {/* Question 8: TPA/Bhamashah Team */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">
                        Question 8: Are you happy with the services and behavior of TPA / Bhamashah Team ? *
                    </FormLabel>
                    <RadioGroup
                        row
                        name="tpaTeamSatisfaction"
                        value={localData.tpaTeamSatisfaction || ""}
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

                {/* Checkboxes */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">Select applicable feedback topics:</FormLabel>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {checkboxOptions.map((option, index) => (
                            <FormControlLabel
                                key={index}
                                control={
                                    <Checkbox
                                        value={option}
                                        checked={(localData.remarkOptions || []).includes(option)}
                                        onChange={handleCheckboxChange}
                                    />
                                }
                                label={option}
                            />
                        ))}
                    </Box>
                </FormControl>

                {/* Next Button */}
                <Button variant="contained" onClick={handleNext}>
                    Next
                </Button>
            </Box>
        </Box>
    );
};


export default Section4
