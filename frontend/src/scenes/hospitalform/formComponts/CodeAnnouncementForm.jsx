import React from 'react';
import { Box, Button, Typography, TextField, MenuItem, Switch, FormControlLabel, useTheme,Grid } from '@mui/material';
import { FieldArray } from 'formik';

const CodeAnnouncementForm = React.memo(({ codeAnnouncement, index, handleChange, removeCodeAnnouncement }) => {
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
    }
    return (
        // <Box mb={4} p={2} border={1} borderRadius={2} borderColor='#868dfb'>
        //     <Typography variant="h6" gutterBottom>Code Announcement {index + 1}</Typography>

        //     {/* Enable/Disable */}
        //     <Box mb={2}>
        //         <FormControlLabel
        //             control={
        //                 <Switch
        //                     checked={codeAnnouncement.enabled}
        //                     onChange={e => handleChange({ target: { name: `codeAnnouncements[${index}].enabled`, value: e.target.checked } })}
        //                     color='secondary'
        //                 />
        //             }
        //             label="Enabled"
        //         />
        //     </Box>

        //     {/* Name */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Name"
        //             name={`codeAnnouncements[${index}].name`}
        //             value={codeAnnouncement.name}
        //             onChange={handleChange}
        //             fullWidth
        //             sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Color */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Color"
        //             name={`codeAnnouncements[${index}].color`}
        //             value={codeAnnouncement.color}
        //             onChange={handleChange}
        //             fullWidth
        //             sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Description */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Description"
        //             name={`codeAnnouncements[${index}].description`}
        //             value={codeAnnouncement.description}
        //             onChange={handleChange}
        //             fullWidth
        //             sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Concerned Person */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Concerned Person"
        //             name={`codeAnnouncements[${index}].concernedPerson`}
        //             value={codeAnnouncement.concernedPerson}
        //             onChange={handleChange}
        //             fullWidth
        //             sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Staff Details */}
        //     <FieldArray name={`codeAnnouncements[${index}].staff`}>
        //         {({ push, remove }) => (
        //             <Box mb={2}>
        //                 {codeAnnouncement.staff.map((staff, staffIndex) => (
        //                     <Box key={staffIndex} mb={2}>
        //                         <TextField
        //                             variant='filled'
        //                             label={`Name of Staff ${staffIndex + 1}`}
        //                             name={`codeAnnouncements[${index}].staff[${staffIndex}].name`}
        //                             value={staff.name}
        //                             onChange={handleChange}
        //                             fullWidth
        //                             sx={textFieldStyleObj}
        //                         />
        //                         <TextField
        //                             variant='filled'
        //                             label="Shift (Morning, Evening, Night)"
        //                             name={`codeAnnouncements[${index}].staff[${staffIndex}].shift`}
        //                             value={staff.shift}
        //                             onChange={handleChange}
        //                             fullWidth
        //                             sx={textFieldStyleObj}
        //                         />
        //                         <TextField
        //                             variant='filled'
        //                             label="Contact No"
        //                             name={`codeAnnouncements[${index}].staff[${staffIndex}].contactNo`}
        //                             value={staff.contactNo}
        //                             onChange={handleChange}
        //                             fullWidth
        //                             sx={textFieldStyleObj}
        //                         />
        //                         <Button onClick={() => remove(staffIndex)} variant="outlined" color="secondary" sx={{ mt: 2 }}>
        //                             Remove Staff
        //                         </Button>
        //                     </Box>
        //                 ))}
        //                 <Button onClick={() => push({ name: '', shift: '', contactNo: '' })} variant="contained" color="primary">
        //                     Add Staff
        //                 </Button>
        //             </Box>
        //         )}
        //     </FieldArray>

        //     {/* Short Code */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Short Code"
        //             name={`codeAnnouncements[${index}].shortCode`}
        //             value={codeAnnouncement.shortCode}
        //             onChange={handleChange}
        //             fullWidth
        //             sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Time Availability */}
        //     <Box mb={2}>
        //         <TextField
        //             variant='filled'
        //             label="Time Availability"
        //             name={`codeAnnouncements[${index}].timeAvailability`}
        //             value={codeAnnouncement.timeAvailability}
        //             onChange={handleChange}
        //             fullWidth
        //             sx={textFieldStyleObj}
        //         />
        //     </Box>

        //     {/* Remove Code Announcement Button */}
        //     <Box>
        //         <Button onClick={removeCodeAnnouncement} variant="outlined" color="secondary">
        //             Remove Code Announcement
        //         </Button>
        //     </Box>
        // </Box>

        <Box mb={4} p={2} border={1} borderRadius={2}>
            <Typography variant="h6" gutterBottom>Code Announcement {index + 1}</Typography>

            <Grid container spacing={2}>
                {/* Enable/Disable */}
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={codeAnnouncement.enabled}
                                onChange={e => handleChange({ target: { name: `codeAnnouncements[${index}].enabled`, value: e.target.checked } })}
                                color='secondary'
                            />
                        }
                        label="Enabled"
                    />
                </Grid>

                {/* Name */}
                <Grid item xs={12} md={6}>
                    <TextField
                        variant='filled'
                        label="Name"
                        name={`codeAnnouncements[${index}].name`}
                        value={codeAnnouncement.name}
                        onChange={handleChange}
                        fullWidth
                        sx={textFieldStyleObj}
                    />
                </Grid>

                {/* Color */}
                <Grid item xs={12} md={6}>
                    <TextField
                        variant='filled'
                        label="Color"
                        name={`codeAnnouncements[${index}].color`}
                        value={codeAnnouncement.color}
                        onChange={handleChange}
                        fullWidth
                        sx={textFieldStyleObj}
                    />
                </Grid>

                {/* Description */}
                <Grid item xs={12} md={6}>
                    <TextField
                        variant='filled'
                        label="Description"
                        name={`codeAnnouncements[${index}].description`}
                        value={codeAnnouncement.description}
                        onChange={handleChange}
                        fullWidth
                        sx={textFieldStyleObj}
                    />
                </Grid>

                {/* Concerned Person */}
                <Grid item xs={12} md={6}>
                    <TextField
                        variant='filled'
                        label="Concerned Person"
                        name={`codeAnnouncements[${index}].concernedPerson`}
                        value={codeAnnouncement.concernedPerson}
                        onChange={handleChange}
                        fullWidth
                        sx={textFieldStyleObj}
                    />
                </Grid>

                {/* Short Code */}
                <Grid item xs={12} md={6}>
                    <TextField
                        variant='filled'
                        label="Short Code"
                        name={`codeAnnouncements[${index}].shortCode`}
                        value={codeAnnouncement.shortCode}
                        onChange={handleChange}
                        fullWidth
                        sx={textFieldStyleObj}
                    />
                </Grid>

                {/* Time Availability */}
                <Grid item xs={12} md={6}>
                    <TextField
                        variant='filled'
                        label="Time Availability"
                        name={`codeAnnouncements[${index}].timeAvailability`}
                        value={codeAnnouncement.timeAvailability}
                        onChange={handleChange}
                        fullWidth
                        sx={textFieldStyleObj}
                    />
                </Grid>

                {/* Staff Details */}
                <Grid item xs={12}>
                    <FieldArray name={`codeAnnouncements[${index}].staff`}>
                        {({ push, remove }) => (
                            <Box mb={2}>
                                {codeAnnouncement.staff.map((staff, staffIndex) => (
                                    <Grid container spacing={2} key={staffIndex} mb={2}>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                variant='filled'
                                                label={`Name of Staff ${staffIndex + 1}`}
                                                name={`codeAnnouncements[${index}].staff[${staffIndex}].name`}
                                                value={staff.name}
                                                onChange={handleChange}
                                                fullWidth
                                                sx={textFieldStyleObj}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                variant='filled'
                                                label="Shift (Morning, Evening, Night)"
                                                name={`codeAnnouncements[${index}].staff[${staffIndex}].shift`}
                                                value={staff.shift}
                                                onChange={handleChange}
                                                fullWidth
                                                sx={textFieldStyleObj}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                variant='filled'
                                                label="Contact No"
                                                name={`codeAnnouncements[${index}].staff[${staffIndex}].contactNo`}
                                                value={staff.contactNo}
                                                onChange={handleChange}
                                                fullWidth
                                                sx={textFieldStyleObj}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button onClick={() => remove(staffIndex)} variant="outlined" color="secondary">
                                                Remove Staff
                                            </Button>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Button onClick={() => push({ name: '', shift: '', contactNo: '' })} variant="outlined" color="secondary">
                                    Add Staff
                                </Button>
                            </Box>
                        )}
                    </FieldArray>
                </Grid>

                {/* Remove Code Announcement Button */}
                <Grid item xs={12}>
                    <Button onClick={removeCodeAnnouncement} variant="outlined" color="secondary">
                        Remove Code Announcement
                    </Button>
                </Grid>
            </Grid>
        </Box>

    )
});

export default CodeAnnouncementForm;
