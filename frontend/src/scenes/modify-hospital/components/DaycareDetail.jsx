import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    Box,
} from "@mui/material";

const DayCareDetailsForm = ({ open, onClose, onSave, initialValues, colors }) => {
    const [formData, setFormData] = useState(initialValues);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <Box sx={{ backgroundColor: colors.primary[900], p: 2, borderRadius: 1 }}>
                <DialogTitle>Day Care Details</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        {/* First Row - No of Beds & Charges */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                variant="standard"
                                label="No of Beds"
                                value={formData.noOfBeds}
                                onChange={(e) => handleChange("noOfBeds", e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                variant="standard"
                                label="Charges"
                                value={formData.charges}
                                onChange={(e) => handleChange("charges", e.target.value)}
                            />
                        </Grid>

                        {/* Second Row - Location */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="standard"
                                label="Location"
                                value={formData.location}
                                onChange={(e) => handleChange("location", e.target.value)}
                            />
                        </Grid>

                        {/* Third Row - Category & Service Type */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                variant="standard"
                                label="Category"
                                value={formData.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                variant="standard"
                                label="Service Type"
                                value={formData.serviceType}
                                onChange={(e) => handleChange("serviceType", e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default DayCareDetailsForm;
