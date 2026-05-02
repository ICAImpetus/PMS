import React, { useReducer, useState, useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
    IconButton,
    Checkbox,
    FormControlLabel,
    Box,
    Grid
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const initialState = [
    {
        name: "",
        color: "",
        description: "",
        concernedPerson: "",
        staff: [{ name: "", shift: "", contactNo: "" }],
        shortCode: "",
        timeAvailability: "",
        enabled: false
    }
];

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_INITIAL_VALUES":
            return action.payload; // Set state to initial values when they change
        case "ADD_CODE_ANNOUNCEMENT":
            return [...state, { ...initialState[0] }];
        case "REMOVE_CODE_ANNOUNCEMENT":
            return state.filter((_, index) => index !== action.index);
        case "SET_FIELD":
            return state.map((item, index) =>
                index === action.index ? { ...item, [action.field]: action.value } : item
            );
        case "ADD_STAFF":
            return state.map((item, index) =>
                index === action.index
                    ? { ...item, staff: [...item.staff, { name: "", shift: "", contactNo: "" }] }
                    : item
            );
        case "REMOVE_STAFF":
            return state.map((item, index) =>
                index === action.index
                    ? {
                        ...item,
                        staff: item.staff.filter((_, staffIndex) => staffIndex !== action.staffIndex)
                    }
                    : item
            );
        case "SET_STAFF_FIELD":
            return state.map((item, index) =>
                index === action.index
                    ? {
                        ...item,
                        staff: item.staff.map((staff, staffIndex) =>
                            staffIndex === action.staffIndex
                                ? { ...staff, [action.field]: action.value }
                                : staff
                        )
                    }
                    : item
            );
        // case "RESET":
        //     return initialState;
        default:
            return state;
    }
};

const CodeAnnouncementForm = ({ open, onClose, onSave, initialValues, colors }) => {
    console.log("CodeAnnouncementForm initial values are :", initialValues);
    const [state, dispatch] = useReducer(reducer, initialValues);
    useEffect(() => {
        dispatch({ type: "SET_INITIAL_VALUES", payload: initialValues });
    }, [initialValues]);

    const handleSave = () => {
        onSave(state);
        // dispatch({ type: "RESET" });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: "transparent", // Remove paper effect
                    boxShadow: "none",
                    borderRadius: 2,
                    scrollbarWidth: "thin", // For Firefox
                    scrollbarColor: "transparent transparent", // For Firefox
                    "&::-webkit-scrollbar": {
                        width: "6px"
                    },
                    "&::-webkit-scrollbar-track": {
                        background: "transparent"
                    },
                    "&::-webkit-scrollbar-thumb": {
                        // background: "rgba(255, 255, 255, 0.2)", // Lightly visible on hover
                        borderRadius: "10px"
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        // background: "rgba(255, 255, 255, 0.4)"
                    }
                }
            }}
        >
            <Box sx={{
                backgroundColor: colors.primary[900],
                p: 2,
                borderRadius: 2,
            }}>
                <DialogTitle>Code Announcements</DialogTitle>
                <DialogContent>
                    {state.map((announcement, index) => (
                        <Box key={index} p={2} mb={2} border={1} borderRadius={2}>
                            <Grid container spacing={2}>
                                {/* Name, Color, Description */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField fullWidth variant="standard" label="Name" value={announcement.name}
                                        onChange={(e) => dispatch({ type: "SET_FIELD", index, field: "name", value: e.target.value })} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField fullWidth variant="standard" label="Color" value={announcement.color}
                                        onChange={(e) => dispatch({ type: "SET_FIELD", index, field: "color", value: e.target.value })} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField fullWidth variant="standard" label="Description" value={announcement.description}
                                        onChange={(e) => dispatch({ type: "SET_FIELD", index, field: "description", value: e.target.value })} />
                                </Grid>

                                {/* Concerned Person, Short Code, Time Availability */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField fullWidth variant="standard" label="Concerned Person" value={announcement.concernedPerson}
                                        onChange={(e) => dispatch({ type: "SET_FIELD", index, field: "concernedPerson", value: e.target.value })} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField fullWidth variant="standard" label="Short Code" value={announcement.shortCode}
                                        onChange={(e) => dispatch({ type: "SET_FIELD", index, field: "shortCode", value: e.target.value })} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField fullWidth variant="standard" label="Time Availability" value={announcement.timeAvailability}
                                        onChange={(e) => dispatch({ type: "SET_FIELD", index, field: "timeAvailability", value: e.target.value })} />
                                </Grid>
                            </Grid>

                            {/* Staff Details */}
                            {announcement.staff.map((staff, staffIndex) => (
                                <Grid container spacing={2} key={staffIndex} alignItems="center" marginBottom={0.4} marginTop={0.4}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField fullWidth variant="standard" label="Staff Name" value={staff.name}
                                            onChange={(e) => dispatch({ type: "SET_STAFF_FIELD", index, staffIndex, field: "name", value: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField fullWidth variant="standard" label="Shift" value={staff.shift}
                                            onChange={(e) => dispatch({ type: "SET_STAFF_FIELD", index, staffIndex, field: "shift", value: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField fullWidth variant="standard" label="Contact No" value={staff.contactNo}
                                            onChange={(e) => dispatch({ type: "SET_STAFF_FIELD", index, staffIndex, field: "contactNo", value: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton onClick={() => dispatch({ type: "REMOVE_STAFF", index, staffIndex })}>
                                            <Delete />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            <Button sx={{ mt: 1, mb: 1 }} startIcon={<Add />} onClick={() => dispatch({ type: "ADD_STAFF", index })}>
                                Add Staff
                            </Button>

                            {/* Enabled Checkbox and Delete Button */}
                            <Grid container alignItems="center" justifyContent="space-between">
                                <Grid item>
                                    <FormControlLabel control={
                                        <Checkbox checked={announcement.enabled}
                                            onChange={(e) => dispatch({ type: "SET_FIELD", index, field: "enabled", value: e.target.checked })} />
                                    } label="Enabled" />
                                </Grid>
                                <Grid item>
                                    {/* <IconButton
                                        onClick={() => dispatch({ type: "REMOVE_CODE_ANNOUNCEMENT", index })}
                                        color="error"
                                        sx={{ borderRadius: 2, p: 1 }}
                                    >
                                        <Delete />
                                    </IconButton> */}
                                    <Button
                                        // variant="contained"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => dispatch({ type: "REMOVE_CODE_ANNOUNCEMENT", index })}
                                        sx={{ borderRadius: 2, p: 1 }}
                                    >
                                        Remove
                                    </Button>

                                </Grid>
                            </Grid>
                        </Box>
                    ))}

                    <Button startIcon={<Add />} onClick={() => dispatch({ type: "ADD_CODE_ANNOUNCEMENT" })}>
                        Add Code Announcement
                    </Button>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default CodeAnnouncementForm;
