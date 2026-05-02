import React from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Button } from '@mui/material';
import { FieldArray } from 'formik';
import { Add, Remove } from '@mui/icons-material';
import { useTheme } from '@mui/material';

// const DepartmentInchargeForm = React.memo(({ index,textFieldStyleObj, values, handleChange }) => {
//     const theme = useTheme();
//     const FormControlStyleObj = {
//         '& .MuiInputLabel-root': {
//             color: theme.palette.mode === 'dark' ? 'white' : 'black', // Label color
//         },
//         '& .MuiSelect-root': {
//             color: theme.palette.mode === 'dark' ? 'white' : 'black', // Text color inside Select
//         },
//         '& .MuiOutlinedInput-notchedOutline': {
//             borderColor: theme.palette.mode === 'dark' ? 'white' : 'black', // Border color
//         },
//         '&:hover .MuiOutlinedInput-notchedOutline': {
//             borderColor: theme.palette.mode === 'dark' ? 'lightgreen' : 'black', // Border color on hover
//         },
//         '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
//             borderColor: theme.palette.mode === 'dark' ? 'white' : 'black', // Border color on focus
//             borderWidth: 2, // Optional: make the border thicker on focus
//         },
//     };

//     return (
//         <Box mb={4} p={2} border={1} borderRadius={2} borderColor='#868dfb'>
//             <Typography variant="h6" gutterBottom>Department Incharge {index + 1}</Typography>

//             <FieldArray name="departmentIncharge">
//                 {({ push, remove }) => (
//                     <Box>
//                         {values.departmentIncharge.map((incharge, index) => (
//                             <Box key={index} mb={3} p={2} border={1} borderRadius={2}>
//                                 <Typography variant="h6" gutterBottom>Incharge {index + 1}</Typography>

//                                 {/* Name */}
//                                 <Box mb={2}>
//                                     <TextField
//                                         label="Name"
//                                         name={`departmentIncharge[${index}].name`}
//                                         value={incharge.name}
//                                         onChange={handleChange}
//                                         fullWidth
//                                         sx={textFieldStyleObj}
//                                     />
//                                 </Box>

//                                 {/* Extension Number */}
//                                 <Box mb={2}>
//                                     <TextField
//                                         label="Extension Number"
//                                         name={`departmentIncharge[${index}].extensionNo`}
//                                         value={incharge.extensionNo}
//                                         onChange={handleChange}
//                                         fullWidth
//                                         sx={textFieldStyleObj}
//                                     />
//                                 </Box>

//                                 {/* Contact Number */}
//                                 <Box mb={2}>
//                                     <TextField
//                                         label="Contact Number"
//                                         name={`departmentIncharge[${index}].contactNo`}
//                                         value={incharge.contactNo}
//                                         onChange={handleChange}
//                                         fullWidth
//                                         sx={textFieldStyleObj}
//                                     />
//                                 </Box>

//                                 {/* Department Name */}
//                                 <Box mb={2}>
//                                     <TextField
//                                         label="Department Name"
//                                         name={`departmentIncharge[${index}].departmentName`}
//                                         value={incharge.departmentName}
//                                         onChange={handleChange}
//                                         fullWidth
//                                         sx={textFieldStyle}
//                                     />
//                                 </Box>

//                                 {/* Time Slot */}
//                                 <Box mb={2}>
//                                     <FormControl fullWidth sx={FormControlStyleObj}>
//                                         <InputLabel>Time Slot</InputLabel>
//                                         <Select
//                                             label="Time Slot"
//                                             name={`departmentIncharge[${index}].timeSlot`}
//                                             value={incharge.timeSlot}
//                                             onChange={handleChange}
//                                         >
//                                             <MenuItem value="Morning">Morning</MenuItem>
//                                             <MenuItem value="Afternoon">Afternoon</MenuItem>
//                                             <MenuItem value="Evening">Evening</MenuItem>
//                                             <MenuItem value="Night">Night</MenuItem>
//                                         </Select>
//                                     </FormControl>
//                                 </Box>

//                                 {/* Service Type */}
//                                 <Box mb={2}>
//                                     <FormControl fullWidth sx={FormControlStyleObj}>
//                                         <InputLabel>Service Type</InputLabel>
//                                         <Select
//                                             label="Service Type"
//                                             name={`departmentIncharge[${index}].serviceType`}
//                                             value={incharge.serviceType}
//                                             onChange={handleChange}
//                                         >
//                                             <MenuItem value="General">General</MenuItem>
//                                             <MenuItem value="Specialized">Specialized</MenuItem>
//                                         </Select>
//                                     </FormControl>
//                                 </Box>

//                                 {/* Remove Department Incharge Button */}
//                                 <Button
//                                     onClick={() => remove(index)}
//                                     variant="outlined"
//                                     color="error"
//                                 >
//                                     Remove Incharge
//                                 </Button>
//                             </Box>
//                         ))}
//                         <Button
//                             onClick={() => {
//                                 console.log("Adding new incharge"); // Debugging: See if this gets called multiple times
//                                 push({
//                                     name: '',
//                                     extensionNo: '',
//                                     contactNo: '',
//                                     departmentName: '',
//                                     timeSlot: '',
//                                     serviceType: ''
//                                 });
//                             }}
//                             startIcon={<Add />}
//                             variant="contained"
//                             color="secondary"
//                         >
//                             Add Department Incharge
//                         </Button>

//                     </Box>
//                 )}
//             </FieldArray>
//         </Box>
//     );
// });

const DepartmentInchargeForm = React.memo(({ incharge, index, handleChange, removeIncharge }) => {
    const theme = useTheme();
    const textFieldStyleObj = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#fff' : 'black', // Border color
            },
            '&:hover fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#379777' : '#379777', // Border color on hover
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Border color on focus
                borderWidth: 2, // Optional: make the border thicker on focus
            },
        },
        '& .MuiInputLabel-root': {
            color: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Label color
        },
        '& .MuiFormHelperText-root': {
            color: theme.palette.mode === 'dark' ? '#EEEEEE' : 'black', // Helper text color
        },
    };

    const FormControlStyleObj = {
        '& .MuiInputLabel-root': {
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
        },
        '& .MuiSelect-root': {
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'dark' ? 'lightgreen' : 'black',
        },
        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
            borderWidth: 2,
        },
    };

    return (
        <Box mb={4} p={2} border={1} borderRadius={2}>
            <Typography variant="h6" gutterBottom>Incharge {index + 1}</Typography>

            {/* Name */}
            <Box mb={2}>
                <TextField
                    label="Name"
                    variant='filled'
                    name={`departmentIncharge[${index}].name`}
                    value={incharge.name}
                    onChange={handleChange}
                    fullWidth
                    sx={textFieldStyleObj}
                />
            </Box>

            {/* Extension Number */}
            <Box mb={2}>
                <TextField
                    label="Extension Number"
                    variant='filled'
                    name={`departmentIncharge[${index}].extensionNo`}
                    value={incharge.extensionNo}
                    onChange={handleChange}
                    fullWidth
                    sx={textFieldStyleObj}
                />
            </Box>

            {/* Contact Number */}
            <Box mb={2}>
                <TextField
                    label="Contact Number"
                    variant='filled'
                    name={`departmentIncharge[${index}].contactNo`}
                    value={incharge.contactNo}
                    onChange={handleChange}
                    fullWidth
                    sx={textFieldStyleObj}
                />
            </Box>

            {/* Department Name */}
            <Box mb={2}>
                <TextField
                    label="Department Name"
                    variant='filled'
                    name={`departmentIncharge[${index}].departmentName`}
                    value={incharge.departmentName}
                    onChange={handleChange}
                    fullWidth
                    sx={textFieldStyleObj}
                />
            </Box>

            {/* Time Slot */}
            {/* <Box mb={2}>
                <FormControl fullWidth sx={FormControlStyleObj}>
                    <InputLabel>Time Slot</InputLabel>
                    <Select
                        label="Time Slot"
                        name={`departmentIncharge[${index}].timeSlot`}
                        value={incharge.timeSlot}
                        onChange={handleChange}
                    >
                        <MenuItem value="Morning">Morning</MenuItem>
                        <MenuItem value="Afternoon">Afternoon</MenuItem>
                        <MenuItem value="Evening">Evening</MenuItem>
                        <MenuItem value="Night">Night</MenuItem>
                    </Select>
                </FormControl>
            </Box> */}

            {/* Service Type */}
            {/* <Box mb={2}>
                <FormControl fullWidth sx={FormControlStyleObj}>
                    <InputLabel>Service Type</InputLabel>
                    <Select
                        label="Service Type"
                        name={`departmentIncharge[${index}].serviceType`}
                        value={incharge.serviceType}
                        onChange={handleChange}
                    >
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="Specialized">Specialized</MenuItem>
                    </Select>
                </FormControl>
            </Box> */}

            {/* Time Slot */}
            <Box mb={2}>
                {/* <Typography>Time Slot</Typography> */}
                <TextField
                    fullWidth
                    variant="filled"
                    select
                    label="Time Slot"
                    name={`departmentIncharge[${index}].timeSlot`}
                    value={incharge.timeSlot}
                    onChange={handleChange}
                >
                    <MenuItem value="Morning">Morning</MenuItem>
                    <MenuItem value="Afternoon">Afternoon</MenuItem>
                    <MenuItem value="Evening">Evening</MenuItem>
                    <MenuItem value="Night">Night</MenuItem>
                </TextField>
            </Box>

            {/* Service Type */}
            <Box mb={2}>
            {/* <Typography>Service Type</Typography> */}
                <TextField
                    fullWidth
                    variant="filled"
                    select
                    label="Service Type"
                    name={`departmentIncharge[${index}].serviceType`}
                    value={incharge.serviceType}
                    onChange={handleChange}
                >
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Specialized">Specialized</MenuItem>
                </TextField>
            </Box>

            {/* Remove Department Incharge Button */}
            <Button
                onClick={removeIncharge}
                variant="outlined"
                color="error"
            >
                Remove Incharge
            </Button>
        </Box>
    );
});


export default DepartmentInchargeForm;
