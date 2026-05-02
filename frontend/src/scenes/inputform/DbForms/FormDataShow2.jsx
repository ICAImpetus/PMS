import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Modal } from "@mui/material";
import { styled } from '@mui/system';
import IconButton from '@mui/material/IconButton';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { tokens } from "../../../theme";
import { useTheme } from '@mui/material';
import { array } from 'yup';

const StyledTypography = styled(Typography)(({ theme }) => ({
    '& strong': {
        color: "#4cceac", 
    },
}));

const DisplayFormData = ({ mainArray, formData, setShowData, setFormObj, open, handleClose }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [initialFormData, setInitialFormData] = useState(formData);
    const [key, setKey] = useState(formData.key);
    console.log('key just when the component is mounted :', key);

    // Log key value after state update
    useEffect(() => {
        console.log('Updated key:', key);
        if (key < mainArray.length) {
            setInitialFormData(mainArray[key]);
        }
    }, [key, mainArray]);



    const handleNext = () => {
        console.log('handleNextClick');
        console.log('key is:', key);

        if (key < mainArray.length - 1) {
            setKey(prevKey => prevKey + 1); // Functional update
        }
    }


    const handlePrev = () => {
        if (key > 0) {
            // setKey(key - 1)
            setKey(prevKey => prevKey - 1); // Functional update
            setInitialFormData(mainArray[key])
        }
    }
    const handleClick = () => {
        setShowData(false);
        setFormObj(null);
        handleClose(); // Close the modal
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    width: '90%', // Adjust width as needed
                    maxWidth: 600,
                    bgcolor: '#3e4396',
                    p: 3,
                    borderRadius: 8,
                    position: 'relative', // Ensure relative positioning
                }}
            >
                <StyledTypography variant="h3" gutterBottom>
                    Customer Data
                </StyledTypography>
                <StyledTypography><strong>Reference From:</strong> {initialFormData.reference}</StyledTypography>
                <StyledTypography><strong>Patient Name:</strong> {initialFormData.patientName}</StyledTypography>
                <StyledTypography><strong>Phone:</strong> {initialFormData.contactNo}</StyledTypography>
                <StyledTypography><strong>Address:</strong> {initialFormData.address}</StyledTypography>
                <StyledTypography><strong>Contact Date:</strong> {initialFormData.createdDate}</StyledTypography>
                <StyledTypography><strong>Gender:</strong> {initialFormData.patientGender}</StyledTypography>
                <StyledTypography><strong>Age:</strong> {initialFormData.patientAge}</StyledTypography>
                <StyledTypography><strong>Purpose Of Call:</strong> {initialFormData.callPurpose}</StyledTypography>
                <StyledTypography><strong>Department:</strong> {initialFormData.department}</StyledTypography>
                <StyledTypography><strong>Type Of Illness:</strong> {initialFormData.illnessType}</StyledTypography>
                <StyledTypography><strong>Payment Category:</strong> {initialFormData.patientCategory}</StyledTypography>
                <StyledTypography><strong>Action Taken:</strong> {initialFormData.actionTaken}</StyledTypography>
                <StyledTypography><strong>Remarks:</strong> {initialFormData.remarks}</StyledTypography>
                <StyledTypography><strong>Ratings:</strong> {initialFormData.ratings}</StyledTypography>

                {/* Button to go back */}
                <Box
                    sx={{
                        position: 'absolute',
                        // borderRadius: 8,
                        bottom: 2,
                        right: 3,
                        p: 2,
                    }}
                >
                    {/* <Button
                        type="button"
                        color="secondary"
                        variant="contained"
                        // onClick={handleClick}
                        handleClick={handlePrev}
                        sx={{ minWidth: '100px', borderRadius: 4, }}
                    >
                        Prev
                    </Button> */}
                    <IconButton
                        aria-label="toggle visibility"
                        onClick={handlePrev}
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
                        <ChevronLeft
                            sx={{
                                fontSize: '24px', // Icon size
                                // color: 'rgb(17 24 39)', // Icon color
                            }}
                        />
                    </IconButton>

                    <IconButton
                        aria-label="toggle visibility"
                        // onClick={handleClick}
                        onClick={handleNext}
                        sx={{
                            // backgroundColor: colors.blueAccent[700], // Background color of the button
                            borderRadius: '50%', // Makes the button circular
                            padding: '10px', // Adds padding inside the button
                            '&:hover': {
                                // backgroundColor: 'blue', // Background color on hover
                                backgroundColor: colors.greenAccent[500],
                                color: 'rgb(17 24 39)'
                            },
                        }}
                    >
                        <ChevronRight
                            sx={{
                                fontSize: '24px', // Icon size
                                // color: 'rgb(17 24 39)', // Icon color
                            }}
                        />
                    </IconButton>

                </Box>
            </Box>
        </Modal>
    );
};

export default DisplayFormData;
