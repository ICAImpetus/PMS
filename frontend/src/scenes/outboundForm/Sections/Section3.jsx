import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,   
} from "@mui/material";
import React, { useState } from "react";
// import { callPurposeArray } from "../../../data/outBoundFormData";



const Section3 = ({ dispatch, data }) => {
    const [localData, setLocalData] = useState(data || {});
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        setLocalData({ ...localData, [e.target.name]: e.target.value });
    };

    const validateFields = () => {
        const newErrors = {};
        if (!localData.description) {
            newErrors.description = "Description of Purpose of Call is required";
        }
        if (!localData.callPurpose) {
            newErrors.callPurpose = "Call Purpose is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateFields()) {
            
            console.log(localData)
            dispatch({
                type: "UPDATE_SECTION_DATA",
                payload: { sectionIndex: 2, data: localData }, // Update for Section 3
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
                {/* Description of Purpose of Call (required) */}
                <TextField
                    name="description"
                    label="Description of Purpose of Call"
                    value={localData.description || ""}
                    onChange={handleInputChange}
                    error={!!errors.description}
                    helperText={errors.description}
                    fullWidth
                    required
                />

                {/* Call Purpose Dropdown (required) */}
                <FormControl fullWidth>
                    <InputLabel id="call-purpose-label">Call Purpose</InputLabel>
                    <Select
                        labelId="call-purpose-label"
                        label="Call Purpose"
                        name="callPurpose"
                        value={localData.callPurpose || ""}
                        onChange={handleInputChange}
                    >
                        {callPurposeArray.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Next Button */}
                <Button variant="contained" onClick={handleNext}>
                    Next
                </Button>
            </Box>
        </Box>
    );
};

export default Section3;
