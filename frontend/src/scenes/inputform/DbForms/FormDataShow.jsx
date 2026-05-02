// import React from 'react';
// // import Typography from '@mui/material/Typography';
// import { Box, Typography, Button } from "@mui/material";

// const DisplayFormData = ({ formData, setShowData,setFormObj }) => {
//     const handleClick = () => {
//         setShowData(false)
//         setFormObj(null)
//     }

//     return (
//         <div style={{ maxWidth: 400, margin: '0 auto' }}>
//             <Typography variant="h4" gutterBottom>
//                 Customer Data
//             </Typography>
//             <Typography><strong>Reference From:</strong> {formData.reference}</Typography>
//             <Typography><strong>Patient Name:</strong> {formData.patientName}</Typography>
//             <Typography><strong>Phone:</strong> {formData.contactNo}</Typography>
//             <Typography><strong>Address:</strong> {formData.address}</Typography>
//             <Typography><strong>Contact Date:</strong> {formData.createdDate}</Typography>
//             <Typography><strong>Gender:</strong> {formData.patientGender}</Typography>
//             <Typography><strong>Age:</strong> {formData.patientAge}</Typography>
//             <Typography><strong>Purpose Of Call:</strong> {formData.callPurpose}</Typography>
//             <Typography><strong>Department:</strong> {formData.department}</Typography>
//             <Typography><strong>Type Of Illness:</strong> {formData.illnessType}</Typography>
//             <Typography><strong>Payment Category:</strong> {formData.patientCategory}</Typography>
//             <Typography><strong>Action Taken:</strong> {formData.actionTaken}</Typography>
//             <Typography><strong>Remarks:</strong> {formData.remarks}</Typography>
//             <Typography><strong>Ratings:</strong> {formData.ratings}</Typography>


//             {/* Add more fields as needed */}
//             <Button
//                 type="submit"
//                 color="secondary"
//                 variant="contained"
//                 onClick={handleClick}
//                 sx={{mt:'4px'}}
//             >
//                 Go Back
//             </Button>
//         </div>
//     );
// };

// export default DisplayFormData;

import React from 'react';
import { Typography, Button, Box } from "@mui/material";
import { styled } from '@mui/system';
const DisplayFormData = ({ formData, setShowData, setFormObj }) => {
    const handleClick = () => {
        setShowData(false);
        setFormObj(null);
    }

    const StyledTypography = styled(Typography)(({ theme }) => ({
        '& strong': {
            // color: theme.palette.secondary.main, // Change color as needed
            color: "#4cceac",
            // color:"rgb(16 185 129)"
        },
    }));

    return (
        <Box
            maxWidth={500}
            m="0 auto"
            p={3}
            boxShadow={3}
            borderRadius={8}
            bgcolor='#3e4396'
            position="relative"
        >
            <StyledTypography variant="h3" gutterBottom>
                Customer Data
            </StyledTypography>
            <StyledTypography><strong>Reference From:</strong> {formData.reference}</StyledTypography>
            <StyledTypography><strong>Patient Name:</strong> {formData.patientName}</StyledTypography>
            <StyledTypography><strong>Phone:</strong> {formData.contactNo}</StyledTypography>
            <StyledTypography><strong>Address:</strong> {formData.address}</StyledTypography>
            <StyledTypography><strong>Contact Date:</strong> {formData.createdDate}</StyledTypography>
            <StyledTypography><strong>Gender:</strong> {formData.patientGender}</StyledTypography>
            <StyledTypography><strong>Age:</strong> {formData.patientAge}</StyledTypography>
            <StyledTypography><strong>Purpose Of Call:</strong> {formData.callPurpose}</StyledTypography>
            <StyledTypography><strong>Department:</strong> {formData.department}</StyledTypography>
            <StyledTypography><strong>Type Of Illness:</strong> {formData.illnessType}</StyledTypography>
            <StyledTypography><strong>Payment Category:</strong> {formData.patientCategory}</StyledTypography>
            <StyledTypography><strong>Action Taken:</strong> {formData.actionTaken}</StyledTypography>
            <StyledTypography><strong>Remarks:</strong> {formData.remarks}</StyledTypography>
            <StyledTypography><strong>Ratings:</strong> {formData.ratings}</StyledTypography>

            {/* Button to go back */}
            <Box
                position="absolute"
                bottom={0}
                right={0}
                p={2}
                bgcolor="transparent"
            >
                <Button
                    type="submit"
                    color="secondary"
                    variant="contained"
                    onClick={handleClick}
                    sx={{ minWidth: '100px' }}
                >
                    Go Back
                </Button>
            </Box>
        </Box>
    );
};

export default DisplayFormData;
