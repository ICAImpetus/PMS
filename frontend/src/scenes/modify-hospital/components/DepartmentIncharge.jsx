import React, { useReducer,useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    IconButton,
    Box,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

// Reducer function to manage form state
const reducer = (state, action) => {
    switch (action.type) {
        case "SET_INITIAL_VALUES":
            return action.payload; // Set state to initial values when they change
        case "SET_FIELD":
            return state.map((item, index) =>
                index === action.index ? { ...item, [action.field]: action.value } : item
            );

        case "ADD_INCHARGE":
            return [
                ...state,
                {
                    name: "",
                    extensionNo: "",
                    contactNo: "",
                    departmentName: "",
                    timeSlot: "",
                    serviceType: "",
                },
            ];

        case "REMOVE_INCHARGE":
            return state.filter((_, index) => index !== action.index);

        default:
            return state;
    }
};

const DepartmentInchargeForm = ({ open, onClose, onSave, initialValues, colors }) => {
    const [state, dispatch] = useReducer(reducer, initialValues);
    useEffect(() => {
            dispatch({ type: "SET_INITIAL_VALUES", payload: initialValues });
        }, [initialValues]);
    const handleSave = () => {
        onSave(state);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <Box sx={{ backgroundColor: colors.primary[900], p: 2, borderRadius: 1 }}>
                <DialogTitle>Department Incharge</DialogTitle>
                <DialogContent>
                    {state.map((incharge, index) => (
                        <Box key={index} p={2} mb={2} border={1} borderRadius={2}>
                            <Grid container spacing={2}>
                                {/* First Row - Three Fields */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Name"
                                        value={incharge.name}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "name", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Extension No"
                                        value={incharge.extensionNo}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "extensionNo", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Contact No"
                                        value={incharge.contactNo}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "contactNo", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                {/* Second Row - Three Fields */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Department Name"
                                        value={incharge.departmentName}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "departmentName", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Time Slot"
                                        value={incharge.timeSlot}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "timeSlot", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Service Type"
                                        value={incharge.serviceType}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "serviceType", value: e.target.value })
                                        }
                                    />
                                </Grid>
                            </Grid>

                            {/* Remove Incharge Button */}
                            <Button startIcon={<Delete />} color="error" onClick={() => dispatch({ type: "REMOVE_INCHARGE", index })} sx={{ mt: 1 }}>
                                Remove Incharge
                            </Button>
                        </Box>
                    ))}

                    {/* Add New Incharge */}
                    <Button startIcon={<Add />} onClick={() => dispatch({ type: "ADD_INCHARGE" })}>
                        Add Incharge
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

export default DepartmentInchargeForm;
