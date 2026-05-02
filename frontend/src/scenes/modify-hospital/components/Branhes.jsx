import React from 'react';
import { Box, Button, Typography, TextField, IconButton, useTheme, colors } from '@mui/material';
import { FieldArray, FastField } from 'formik';
import DeleteIcon from '@mui/icons-material/Delete';
import { AddBox, AddReactionRounded } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import { tokens } from '../../../theme';

const BranchForm = React.memo(({ branch, index, handleChange, removeBranch, onExit, onSubmit }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
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
    }

    return (
        <>
            <Box mb={4} p={2} border={1} borderColor={colors.greenAccent[500]} borderRadius={2}>
                <Typography variant="h4" gutterBottom color={'secondary'}>Branch {index + 1}</Typography>

                {/* Branch Name */}
                <Box mb={2}>
                    <FastField name={`branches[${index}].name`}>
                        {({ field }) => (
                            <TextField
                                label="Branch Name"
                                variant="outlined"
                                {...field}
                                fullWidth
                                sx={textFieldStyleObj}
                            />
                        )}
                    </FastField>
                </Box>

                {/* Location */}
                <Box mb={2}>
                    <FastField name={`branches[${index}].location`}>
                        {({ field }) => (
                            <TextField
                                label="Location"
                                variant="outlined"
                                {...field}
                                fullWidth
                                sx={textFieldStyleObj}
                            />
                        )}
                    </FastField>
                </Box>

                {/* Contact Numbers */}
                <FieldArray name={`branches[${index}].contactNumbers`}>
                    {({ push, remove }) => (
                        <Box mb={2}>
                            {branch.contactNumbers.map((_, contactIndex) => (
                                <Box key={contactIndex} mb={2} display="flex" justifyContent="space-between">
                                    <FastField name={`branches[${index}].contactNumbers[${contactIndex}]`}>
                                        {({ field }) => (
                                            <TextField
                                                label={`Contact Number ${contactIndex + 1}`}
                                                variant="outlined"
                                                {...field}
                                                fullWidth
                                                sx={textFieldStyleObj}
                                            />
                                        )}
                                    </FastField>

                                    <IconButton onClick={() => remove(contactIndex)} variant="outlined">
                                        <CancelIcon />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button onClick={() => push('')} variant="outlined" color="secondary" startIcon={<AddBox />}>
                                Add Contact Number
                            </Button>
                        </Box>
                    )}
                </FieldArray>

                {/* Code */}
                <Box mb={2}>
                    <FastField name={`branches[${index}].code`}>
                        {({ field }) => (
                            <TextField
                                label="Code"
                                variant="outlined"
                                {...field}
                                fullWidth
                                sx={textFieldStyleObj}
                            />
                        )}
                    </FastField>
                </Box>

                {/* Number of Beds */}
                <Box mb={2}>
                    <FastField name={`branches[${index}].beds`}>
                        {({ field }) => (
                            <TextField
                                label="Number of Beds"
                                variant="outlined"
                                {...field}
                                fullWidth
                                sx={textFieldStyleObj}
                            />
                        )}
                    </FastField>
                </Box>

                {/* Remove Branch Button */}
                <Box>
                    <Button onClick={removeBranch} variant="outlined" color="secondary">
                        Remove Branch
                    </Button>
                </Box>
            </Box>

        </>
    );
});

export default BranchForm;