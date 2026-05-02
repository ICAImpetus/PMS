import React, { useReducer, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Grid, TextField,
    IconButton, Typography, Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import { Close, Delete, Add, ExpandMore } from "@mui/icons-material";

const departmentsReducer = (state, action) => {
    switch (action.type) {
        case "SET_INITIAL_DATA":
            return action.payload;
        case "ADD_DEPARTMENT":
            return [...state, { name: "", doctors: [] }];
        case "REMOVE_DEPARTMENT":
            return state.filter((_, index) => index !== action.payload);
        case "UPDATE_DEPARTMENT":
            return state.map((dept, index) =>
                index === action.payload.index
                    ? { ...dept, [action.payload.field]: action.payload.value }
                    : dept
            );
        case "ADD_DOCTOR":
            return state.map((dept, index) =>
                index === action.payload
                    ? {
                        ...dept,
                        doctors: [
                            ...dept.doctors,
                            {
                                name: "",
                                opdNo: "",
                                specialties: [""],
                                timings: { morning: "", evening: "" },
                                opdDays: "",
                                experience: "",
                                contactNumber: "",
                                extensionNumber: "",
                                paName: "",
                                paContactNumber: "",
                                consultationCharges: "",
                                videoConsultation: { enabled: false, timeSlot: "", charges: "", days: "" },
                                teleMedicine: "",
                                empanelmentList: [""],
                                additionalInfo: "",
                                descriptionOfServices: "",
                                isEnabled: true
                            }
                        ]
                    }
                    : dept
            );
        case "REMOVE_DOCTOR":
            return state.map((dept, deptIndex) =>
                deptIndex === action.payload.deptIndex
                    ? { ...dept, doctors: dept.doctors.filter((_, docIndex) => docIndex !== action.payload.docIndex) }
                    : dept
            );
        // case "UPDATE_DOCTOR":
        //     return state.map((dept, deptIndex) =>
        //         deptIndex === action.payload.deptIndex
        //             ? {
        //                 ...dept,
        //                 doctors: dept.doctors.map((doc, docIndex) =>
        //                     docIndex === action.payload.docIndex
        //                         ? { ...doc, [action.payload.field]: action.payload.value }
        //                         : doc
        //                 )
        //             }
        //             : dept
        //     );
        case "UPDATE_DOCTOR":
            return state.map((dept, deptIndex) =>
                deptIndex === action.payload.deptIndex
                    ? {
                        ...dept,
                        doctors: dept.doctors.map((doc, docIndex) =>
                            docIndex === action.payload.docIndex
                                ? action.payload.nestedField
                                    ? {
                                        ...doc,
                                        [action.payload.field]: {
                                            ...doc[action.payload.field],
                                            [action.payload.nestedField]: action.payload.value
                                        }
                                    }
                                    : { ...doc, [action.payload.field]: action.payload.value }
                                : doc
                        )
                    }
                    : dept
            );

        case "TOGGLE_VIDEO_CONSULTATION":
            return state.map((dept, deptIndex) =>
                deptIndex === action.payload.deptIndex
                    ? {
                        ...dept,
                        doctors: dept.doctors.map((doc, docIndex) =>
                            docIndex === action.payload.docIndex
                                ? {
                                    ...doc,
                                    videoConsultation: {
                                        ...doc.videoConsultation,
                                        enabled: !doc.videoConsultation.enabled
                                    }
                                }
                                : doc
                        )
                    }
                    : dept
            );
        default:
            return state;
    }
};

const DepartmentDialog = ({ open, onClose, onSave, initialValues, colors }) => {
    const [departments, dispatch] = useReducer(departmentsReducer, initialValues || []);
    // console.log('colors', colors);

    useEffect(() => {
        if (initialValues) {
            dispatch({ type: "SET_INITIAL_DATA", payload: initialValues });
        }
    }, [initialValues]);

    const handleSave = () => {
        onSave(departments);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
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
            <Box sx={{ backgroundColor: colors.primary[900], p: 2, borderRadius: 2 }}>
                <DialogTitle>
                    Manage Departments
                    <IconButton onClick={onClose} sx={{ position: "absolute", right: 16, top: 16 }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {departments.map((dept, deptIndex) => (
                        <Accordion key={deptIndex} sx={{backgroundColor:colors.primary[900]}}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="h6">{dept.name || "New Department"}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box key={deptIndex} p={2} mb={2} border="1px solid #ccc" borderRadius={2}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={10}>
                                            <TextField
                                                label="Department Name"
                                                variant="standard"
                                                value={dept.name}
                                                onChange={(e) =>
                                                    dispatch({
                                                        type: "UPDATE_DEPARTMENT",
                                                        payload: { index: deptIndex, field: "name", value: e.target.value }
                                                    })
                                                }
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={2} display="flex" alignItems="center">
                                            <IconButton onClick={() => dispatch({ type: "REMOVE_DEPARTMENT", payload: deptIndex })}>
                                                <Delete color="error" />
                                            </IconButton>
                                            <Typography variant="body2" color="error" sx={{ ml: 1 }}>
                                                Remove Department
                                            </Typography>
                                        </Grid>

                                    </Grid>

                                    <Typography variant="h6" gutterBottom marginTop={2}>Doctors</Typography>
                                    {dept.doctors.map((doctor, docIndex) => (
                                        <Box key={docIndex} p={2} /*border="1px solid #ddd"*/ borderRadius={2} mb={1}>
                                            <Grid container spacing={2}>
                                                {[
                                                    { label: "Doctor Name", field: "name" },
                                                    { label: "OPD Number", field: "opdNo" },
                                                    { label: "Experience", field: "experience" },
                                                    { label: "Contact Number", field: "contactNumber" },
                                                    { label: "Extension Number", field: "extensionNumber" },
                                                    { label: "PA Name", field: "paName" },
                                                    { label: "PA Contact Number", field: "paContactNumber" },
                                                    { label: "Consultation Charges", field: "consultationCharges" },
                                                    { label: "Telemedicine", field: "teleMedicine" },
                                                    { label: "Additional Info", field: "additionalInfo" },
                                                    { label: "Service Description", field: "descriptionOfServices" }
                                                ].map(({ label, field }) => (
                                                    <Grid item xs={12} sm={6} md={4} lg={3} key={field}>
                                                        <TextField
                                                            label={label}
                                                            value={doctor[field] || ""}
                                                            variant="standard"
                                                            onChange={(e) =>
                                                                dispatch({
                                                                    type: "UPDATE_DOCTOR",
                                                                    payload: {
                                                                        deptIndex,
                                                                        docIndex,
                                                                        field,
                                                                        value: e.target.value
                                                                    }
                                                                })
                                                            }
                                                            fullWidth
                                                        />
                                                    </Grid>
                                                ))}

                                                <Grid item xs={12} sm={6} md={4} lg={3}>
                                                    <TextField
                                                        label="Morning Timings"
                                                        variant="standard"
                                                        value={doctor.timings.morning || ""}
                                                        onChange={(e) =>
                                                            dispatch({
                                                                type: "UPDATE_DOCTOR",
                                                                payload: {
                                                                    deptIndex,
                                                                    docIndex,
                                                                    field: "timings",
                                                                    value: { ...doctor.timings, morning: e.target.value }
                                                                }
                                                            })
                                                        }
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4} lg={3}>
                                                    <TextField
                                                        label="Evening Timings"
                                                        variant="standard"
                                                        value={doctor.timings.evening || ""}
                                                        onChange={(e) =>
                                                            dispatch({
                                                                type: "UPDATE_DOCTOR",
                                                                payload: {
                                                                    deptIndex,
                                                                    docIndex,
                                                                    field: "timings",
                                                                    value: { ...doctor.timings, evening: e.target.value }
                                                                }
                                                            })
                                                        }
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={6} md={4} lg={3}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={doctor.videoConsultation.enabled}
                                                                onChange={() =>
                                                                    dispatch({
                                                                        type: "TOGGLE_VIDEO_CONSULTATION",
                                                                        payload: { deptIndex, docIndex }
                                                                    })
                                                                }
                                                            />
                                                        }
                                                        label="Enable Video Consultation"
                                                    />
                                                </Grid>
                                                {doctor.videoConsultation.enabled && (
                                                    <>
                                                        <Grid item xs={12} sm={6} md={4} lg={3}>
                                                            <TextField
                                                                label="Time Slot"
                                                                variant="standard"
                                                                value={doctor.videoConsultation.timeSlot}
                                                                onChange={(e) => dispatch({
                                                                    type: "UPDATE_DOCTOR",
                                                                    payload: {
                                                                        deptIndex,
                                                                        docIndex,
                                                                        field: "videoConsultation",
                                                                        nestedField: "timeSlot",
                                                                        value: e.target.value
                                                                    }
                                                                })}
                                                                fullWidth
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6} md={4} lg={3}>
                                                            <TextField
                                                                label="Charges"
                                                                variant="standard"
                                                                value={doctor.videoConsultation.charges}
                                                                onChange={(e) => dispatch({
                                                                    type: "UPDATE_DOCTOR",
                                                                    payload: {
                                                                        deptIndex,
                                                                        docIndex,
                                                                        field: "videoConsultation",
                                                                        nestedField: "charges",
                                                                        value: e.target.value
                                                                    }
                                                                })}
                                                                fullWidth
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6} md={4} lg={3}>
                                                            <TextField
                                                                label="Days"
                                                                variant="standard"
                                                                value={doctor.videoConsultation.days}
                                                                onChange={(e) => dispatch({
                                                                    type: "UPDATE_DOCTOR",
                                                                    payload: {
                                                                        deptIndex,
                                                                        docIndex,
                                                                        field: "videoConsultation",
                                                                        nestedField: "days",
                                                                        value: e.target.value
                                                                    }
                                                                })}
                                                                fullWidth
                                                            />
                                                        </Grid>
                                                    </>
                                                )}

                                            </Grid>
                                            <Grid item xs={2} display="flex" alignItems="center" sx={{ mt: 1 }}>
                                                <IconButton onClick={() => dispatch({ type: "REMOVE_DOCTOR", payload: { deptIndex, docIndex } })}>
                                                    <Delete color="error" />
                                                </IconButton>
                                                <Typography variant="body2" color="error" sx={{ ml: 1 }}>
                                                    Remove Doctor
                                                </Typography>
                                            </Grid>

                                        </Box>
                                    ))}
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={() => dispatch({ type: "ADD_DOCTOR", payload: deptIndex })}
                                    >
                                        Add Doctor
                                    </Button>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                    <Button variant="contained" sx={{ mt: 1 }} startIcon={<Add />} onClick={() => dispatch({ type: "ADD_DEPARTMENT" })}>
                        Add Department
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="error">Cancel</Button>
                    <Button onClick={handleSave} color="primary">Save</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};


export default DepartmentDialog;
