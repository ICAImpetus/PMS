import React from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Button, useTheme } from '@mui/material';
import { FieldArray } from 'formik';
import { Add, Remove } from '@mui/icons-material';

// const ProcedureListForm = React.memo(({ values, handleChange,removeProcedure }) => {
//     return (
//         <Box mb={4} p={2} border={1} borderRadius={2}>
//             <Typography variant="h6" gutterBottom>Procedure List</Typography>

//             {/* <FieldArray name="procedureList">
//                 {({ push, remove }) => ( */}
//                     <Box>
//                         {values.procedureList.map((procedure, index) => (
//                             <Box key={index} mb={3} p={2} border={1} borderRadius={2}>
//                                 <Typography variant="h6" gutterBottom>Procedure {index + 1}</Typography>

//                                 {/* Name */}
//                                 <Box mb={2}>
//                                     <TextField

//                                         label="Name"
//                                         name={`procedureList[${index}].name`}
//                                         value={procedure.name}
//                                         onChange={handleChange}
//                                         fullWidth
//                                     />
//                                 </Box>

//                                 {/* Description */}
//                                 <Box mb={2}>
//                                     <TextField

//                                         label="Description"
//                                         name={`procedureList[${index}].description`}
//                                         value={procedure.description}
//                                         onChange={handleChange}
//                                         fullWidth
//                                     />
//                                 </Box>

//                                 {/* Category */}
//                                 <Box mb={2}>
//                                     <FormControl fullWidth>
//                                         <InputLabel>Category</InputLabel>
//                                         <Select
//                                             label="Category"
//                                             name={`procedureList[${index}].category`}
//                                             value={procedure.category}
//                                             onChange={handleChange}
//                                             >
//                                             <MenuItem value="General">General</MenuItem>
//                                             <MenuItem value="Special">Special</MenuItem>
//                                         </Select>
//                                     </FormControl>
//                                 </Box>

//                                 {/* Doctor Name */}
//                                 <FieldArray name={`procedureList[${index}].doctorName`}>
//                                     {({ push: pushDoctor, remove: removeDoctor }) => (
//                                         <Box mb={2}>
//                                             <Typography variant="subtitle1">Doctor Names</Typography>
//                                             {procedure.doctorName.map((doctor, doctorIndex) => (
//                                                 <Box key={doctorIndex} mb={1} display="flex" alignItems="center">
//                                                     <TextField

//                                                         label={`Doctor Name ${doctorIndex + 1}`}
//                                                         name={`procedureList[${index}].doctorName[${doctorIndex}]`}
//                                                         value={doctor}
//                                                         onChange={handleChange}
//                                                                         fullWidth
//                                                         sx={{ mr: 1 }}
//                                                     />
//                                                     <IconButton onClick={() => removeDoctor(doctorIndex)}>
//                                                         <Remove />
//                                                     </IconButton>
//                                                 </Box>
//                                             ))}
//                                             <Button
//                                                 onClick={() => pushDoctor('')}
//                                                 startIcon={<Add />}
//                                                 variant="outlined"
//                                                 color="primary"
//                                             >
//                                                 Add Doctor
//                                             </Button>
//                                         </Box>
//                                     )}
//                                 </FieldArray>

//                                 {/* Empanelment Type */}
//                                 <FieldArray name={`procedureList[${index}].empanelmentType`}>
//                                     {({ push: pushEmpanelment, remove: removeEmpanelment }) => (
//                                         <Box mb={2}>
//                                             <Typography variant="subtitle1">Empanelment Types</Typography>
//                                             {procedure.empanelmentType.map((type, typeIndex) => (
//                                                 <Box key={typeIndex} mb={1} display="flex" alignItems="center">
//                                                     <TextField

//                                                         label={`Empanelment Type ${typeIndex + 1}`}
//                                                         name={`procedureList[${index}].empanelmentType[${typeIndex}]`}
//                                                         value={type}
//                                                         onChange={handleChange}
//                                                                         fullWidth
//                                                         sx={{ mr: 1 }}
//                                                     />
//                                                     <IconButton onClick={() =>  (typeIndex)}>
//                                                         <Remove />
//                                                     </IconButton>
//                                                 </Box>
//                                             ))}
//                                             <Button
//                                                 onClick={() => pushEmpanelment('')}
//                                                 startIcon={<Add />}
//                                                 variant="outlined"
//                                                 color="primary"
//                                             >
//                                                 Add Empanelment Type
//                                             </Button>
//                                         </Box>
//                                     )}
//                                 </FieldArray>

//                                 {/* Rates Charges */}
//                                 <Box mb={2}>
//                                     <TextField

//                                         label="Rates/Charges"
//                                         name={`procedureList[${index}].ratesCharges`}
//                                         value={procedure.ratesCharges}
//                                         onChange={handleChange}
//                                         fullWidth
//                                     />
//                                 </Box>

//                                 {/* Coordinator Name */}
//                                 <FieldArray name={`procedureList[${index}].coordinatorName`}>
//                                     {({ push: pushCoordinator, remove: removeCoordinator }) => (
//                                         <Box mb={2}>
//                                             <Typography variant="subtitle1">Coordinator Names</Typography>
//                                             {procedure.coordinatorName.map((coordinator, coordinatorIndex) => (
//                                                 <Box key={coordinatorIndex} mb={1} display="flex" alignItems="center">
//                                                     <TextField

//                                                         label={`Coordinator Name ${coordinatorIndex + 1}`}
//                                                         name={`procedureList[${index}].coordinatorName[${coordinatorIndex}]`}
//                                                         value={coordinator}
//                                                         onChange={handleChange}
//                                                                         fullWidth
//                                                         sx={{ mr: 1 }}
//                                                     />
//                                                     <IconButton onClick={() => removeCoordinator(coordinatorIndex)}>
//                                                         <Remove />
//                                                     </IconButton>
//                                                 </Box>
//                                             ))}
//                                             <Button
//                                                 onClick={() => pushCoordinator('')}
//                                                 startIcon={<Add />}
//                                                 variant="outlined"
//                                                 color="primary"
//                                             >
//                                                 Add Coordinator
//                                             </Button>
//                                         </Box>
//                                     )}
//                                 </FieldArray>

//                                 {/* Remove Procedure Button */}
//                                 <Button
//                                     // onClick={() => remove(index)}
//                                     onClick={removeProcedure}
//                                     variant="outlined"
//                                     color="error"
//                                 >
//                                     Remove Procedure
//                                 </Button>
//                             </Box>
//                         ))}
//                         {/* <Button
//                             onClick={() => push({
//                                 name: '',
//                                 description: '',
//                                 category: '',
//                                 doctorName: [''],
//                                 empanelmentType: [''],
//                                 ratesCharges: '',
//                                 coordinatorName: ['']
//                             })}
//                             startIcon={<Add />}
//                             variant="contained"
//                             color="primary"
//                         >
//                             Add Procedure
//                         </Button> */}
//                     </Box>
//                 {/* )} */}
//             {/* </FieldArray> */}
//         </Box>
//     );
// });

// export default ProcedureListForm;


const ProcedureListForm = React.memo(({ procedure, index, handleChange, removeProcedure }) => {
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
        <Box mb={4} p={2} border={1} borderRadius={2} >
            <Typography variant="h6" gutterBottom>Procedure {index + 1}</Typography>

            {/* Name */}
            <Box mb={2}>
                <TextField
                    variant='filled'
                    label="Name"
                    name={`procedureList[${index}].name`}
                    value={procedure.name}
                    onChange={handleChange}
                    fullWidth
                    sx={textFieldStyleObj}
                />
            </Box>

            {/* Description */}
            <Box mb={2}>
                <TextField
                    label="Description"
                    variant='filled'
                    name={`procedureList[${index}].description`}
                    value={procedure.description}
                    onChange={handleChange}
                    fullWidth
                    sx={textFieldStyleObj}
                />
            </Box>

            {/* Category */}
            {/* <Box mb={2}>
                <FormControl fullWidth sx={FormControlStyleObj}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        label="Category"
                        name={`procedureList[${index}].category`}
                        value={procedure.category}
                        onChange={handleChange}
                    >
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="Special">Special</MenuItem>
                    </Select>
                </FormControl>
            </Box> */}
            <Box mb={2}>
                <TextField
                    fullWidth
                    variant="filled"
                    select
                    label="Category"
                    name={`procedureList[${index}].category`}
                    value={procedure.category}
                    onChange={handleChange}
                >
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Special">Special</MenuItem>
                </TextField>
            </Box>

            {/* Doctor Names */}
            <FieldArray name={`procedureList[${index}].doctorName`}>
                {({ push, remove }) => (
                    <Box mb={2}>
                        <Typography variant="subtitle1">Doctor Names</Typography>
                        {procedure.doctorName.map((doctor, doctorIndex) => (
                            <Box key={doctorIndex} mb={1} display="flex" alignItems="center">
                                <TextField
                                    variant='filled'
                                    label={`Doctor Name ${doctorIndex + 1}`}
                                    name={`procedureList[${index}].doctorName[${doctorIndex}]`}
                                    value={doctor}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={textFieldStyleObj}
                                />
                                <IconButton onClick={() => remove(doctorIndex)}>
                                    <Remove />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            onClick={() => push('')}
                            startIcon={<Add />}
                            variant="outlined"
                            color="secondary"
                        >
                            Add Doctor
                        </Button>
                    </Box>
                )}
            </FieldArray>

            {/* Empanelment Types */}
            <FieldArray name={`procedureList[${index}].empanelmentType`}>
                {({ push, remove }) => (
                    <Box mb={2}>
                        <Typography variant="subtitle1">Empanelment Types</Typography>
                        {procedure.empanelmentType.map((type, typeIndex) => (
                            <Box key={typeIndex} mb={1} display="flex" alignItems="center">
                                <TextField
                                    variant='filled'
                                    label={`Empanelment Type ${typeIndex + 1}`}
                                    name={`procedureList[${index}].empanelmentType[${typeIndex}]`}
                                    value={type}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={textFieldStyleObj}
                                />
                                <IconButton onClick={() => remove(typeIndex)}>
                                    <Remove />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            onClick={() => push('')}
                            startIcon={<Add />}
                            variant="outlined"
                            color="secondary"
                        >
                            Add Empanelment Type
                        </Button>
                    </Box>
                )}
            </FieldArray>

            {/* Rates/Charges */}
            <Box mb={2}>
                <TextField
                    variant='filled'
                    label="Rates/Charges"
                    name={`procedureList[${index}].ratesCharges`}
                    value={procedure.ratesCharges}
                    onChange={handleChange}
                    fullWidth
                    sx={textFieldStyleObj}
                />
            </Box>

            {/* Coordinator Names */}
            <FieldArray name={`procedureList[${index}].coordinatorName`}>
                {({ push, remove }) => (
                    <Box mb={2}>
                        <Typography variant="subtitle1">Coordinator Names</Typography>
                        {procedure.coordinatorName.map((coordinator, coordinatorIndex) => (
                            <Box key={coordinatorIndex} mb={1} display="flex" alignItems="center">
                                <TextField
                                    variant='filled'
                                    label={`Coordinator Name ${coordinatorIndex + 1}`}
                                    name={`procedureList[${index}].coordinatorName[${coordinatorIndex}]`}
                                    value={coordinator}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={textFieldStyleObj}
                                />
                                <IconButton onClick={() => remove(coordinatorIndex)}>
                                    <Remove />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            onClick={() => push('')}
                            startIcon={<Add />}
                            variant="outlined"
                            color="secondary"
                        >
                            Add Coordinator
                        </Button>
                    </Box>
                )}
            </FieldArray>

            {/* Remove Procedure Button */}
            <Button
                onClick={removeProcedure}
                variant="outlined"
                color="error"
            >
                Remove Procedure
            </Button>
        </Box>
    );
});

export default ProcedureListForm;