import React, { useReducer,useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Grid, IconButton, MenuItem,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

// Reducer function to manage form state
const reducer = (state, action) => {
    switch (action.type) {
        case "SET_INITIAL_VALUES":
            return action.payload; // Set state to initial values when they change
        case "SET_FIELD":
            return state.map((item, index) =>
                index === action.index
                    ? { ...item, [action.field]: action.value }
                    : item
            );

        case "ADD_EMPANELLMENT":
            return [
                ...state,
                {
                    policyName: "",
                    coveringAreasOfSpeciality: [""],
                    doctorsAvailable: [""],
                    additionalRemarks: "",
                    typeOfCoverage: "",
                },
            ];

        case "REMOVE_EMPANELLMENT":
            return state.filter((_, index) => index !== action.index);

        case "ADD_SPECIALITY":
            return state.map((item, index) =>
                index === action.index
                    ? {
                        ...item,
                        coveringAreasOfSpeciality: [...item.coveringAreasOfSpeciality, ""],
                    }
                    : item
            );

        case "REMOVE_SPECIALITY":
            return state.map((item, index) =>
                index === action.index
                    ? {
                        ...item,
                        coveringAreasOfSpeciality: item.coveringAreasOfSpeciality.filter(
                            (_, i) => i !== action.specialityIndex
                        ),
                    }
                    : item
            );

        case "SET_SPECIALITY":
            return state.map((item, index) =>
                index === action.index
                    ? {
                        ...item,
                        coveringAreasOfSpeciality: item.coveringAreasOfSpeciality.map(
                            (speciality, i) =>
                                i === action.specialityIndex ? action.value : speciality
                        ),
                    }
                    : item
            );

        case "ADD_DOCTOR":
            return state.map((item, index) =>
                index === action.index
                    ? { ...item, doctorsAvailable: [...item.doctorsAvailable, ""] }
                    : item
            );

        case "REMOVE_DOCTOR":
            return state.map((item, index) =>
                index === action.index
                    ? {
                        ...item,
                        doctorsAvailable: item.doctorsAvailable.filter(
                            (_, i) => i !== action.doctorIndex
                        ),
                    }
                    : item
            );

        case "SET_DOCTOR":
            return state.map((item, index) =>
                index === action.index
                    ? {
                        ...item,
                        doctorsAvailable: item.doctorsAvailable.map((doctor, i) =>
                            i === action.doctorIndex ? action.value : doctor
                        ),
                    }
                    : item
            );

        default:
            return state;
    }
};


const EmpanelmentListForm = ({ open, onClose, onSave, initialValues, colors }) => {
    const [state, dispatch] = useReducer(reducer, initialValues);
    useEffect(() => {
        dispatch({ type: "SET_INITIAL_VALUES", payload: initialValues });
    }, [initialValues]);
    
    const handleSave = () => {
        onSave(state);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth >
            <Box sx={{ backgroundColor: colors.primary[900], p: 2, borderRadius: 1 }}>
                <DialogTitle>Empanelment List</DialogTitle>
                <DialogContent>
                    {state.map((empanelment, index) => (
                        <Box key={index} p={2} mb={2} border={1} borderRadius={2}>
                            <Grid container spacing={2}>
                                {/* First Row - Three Fields */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Policy Name"
                                        value={empanelment.policyName}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "policyName", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Type of Coverage"
                                        value={empanelment.typeOfCoverage}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "typeOfCoverage", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Additional Remarks"
                                        value={empanelment.additionalRemarks}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "additionalRemarks", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                {/* Specialties - Separate Row */}
                                <Grid item xs={12}>
                                    <Box display="flex" alignItems="center">
                                        <strong>Specialties:</strong>
                                        <Button
                                            startIcon={<Add />}
                                            onClick={() => dispatch({ type: "ADD_SPECIALITY", index })}
                                            sx={{ ml: 2 }}
                                        >
                                            Add Speciality
                                        </Button>
                                    </Box>
                                </Grid>

                                {empanelment.coveringAreasOfSpeciality.map((speciality, specialityIndex) => (
                                    <Grid key={specialityIndex} item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="standard"
                                            label={`Speciality ${specialityIndex + 1}`}
                                            value={speciality}
                                            onChange={(e) =>
                                                dispatch({
                                                    type: "SET_SPECIALITY",
                                                    index,
                                                    specialityIndex,
                                                    value: e.target.value,
                                                })
                                            }
                                        />
                                        <IconButton
                                            onClick={() => dispatch({ type: "REMOVE_SPECIALITY", index, specialityIndex })}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Grid>
                                ))}

                                {/* Doctors - Separate Row */}
                                <Grid item xs={12}>
                                    <Box display="flex" alignItems="center">
                                        <strong>Doctors Available:</strong>
                                        <Button
                                            startIcon={<Add />}
                                            onClick={() => dispatch({ type: "ADD_DOCTOR", index })}
                                            sx={{ ml: 2 }}
                                        >
                                            Add Doctor
                                        </Button>
                                    </Box>
                                </Grid>

                                {empanelment.doctorsAvailable.map((doctor, doctorIndex) => (
                                    <Grid key={doctorIndex} item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="standard"
                                            label={`Doctor ${doctorIndex + 1}`}
                                            value={doctor}
                                            onChange={(e) =>
                                                dispatch({
                                                    type: "SET_DOCTOR",
                                                    index,
                                                    doctorIndex,
                                                    value: e.target.value,
                                                })
                                            }
                                        />
                                        <IconButton
                                            onClick={() => dispatch({ type: "REMOVE_DOCTOR", index, doctorIndex })}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Remove Empanelment Button */}
                            <Button
                                startIcon={<Delete />}
                                color="error"
                                onClick={() => dispatch({ type: "REMOVE_EMPANELLMENT", index })}
                            >
                                Remove Empanelment
                            </Button>
                        </Box>
                    ))}

                    {/* Add New Empanelment */}
                    <Button
                        startIcon={<Add />}
                        onClick={() => dispatch({ type: "ADD_EMPANELLMENT" })}
                    >
                        Add Empanelment
                    </Button>
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

export default EmpanelmentListForm;
