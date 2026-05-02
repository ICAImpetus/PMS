import React, { useReducer, useEffect } from "react";
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
                index === action.index
                    ? { ...item, [action.field]: action.value }
                    : item
            );

        case "ADD_PROCEDURE":
            return [
                ...state,
                {
                    name: "",
                    description: "",
                    category: "",
                    doctorName: [""],
                    empanelmentType: [""],
                    ratesCharges: "",
                    coordinatorName: [""],
                },
            ];

        case "REMOVE_PROCEDURE":
            return state.filter((_, index) => index !== action.index);

        case "ADD_ARRAY_ITEM":
            return state.map((item, index) =>
                index === action.index
                    ? { ...item, [action.field]: [...item[action.field], ""] }
                    : item
            );

        case "REMOVE_ARRAY_ITEM":
            return state.map((item, index) =>
                index === action.index
                    ? { ...item, [action.field]: item[action.field].filter((_, i) => i !== action.itemIndex) }
                    : item
            );

        case "SET_ARRAY_ITEM":
            return state.map((item, index) =>
                index === action.index
                    ? {
                        ...item,
                        [action.field]: item[action.field].map((value, i) =>
                            i === action.itemIndex ? action.value : value
                        ),
                    }
                    : item
            );

        default:
            return state;
    }
};

const ProcedureListDialog = ({ open, onClose, onSave, initialValues, colors }) => {
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
                <DialogTitle>Procedure List</DialogTitle>
                <DialogContent>
                    {state.map((procedure, index) => (
                        <Box key={index} p={2} mb={2} border={1} borderRadius={2}>
                            <Grid container spacing={2}>
                                {/* First Row - Three Fields */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Procedure Name"
                                        value={procedure.name}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "name", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Description"
                                        value={procedure.description}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "description", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Category"
                                        value={procedure.category}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "category", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                {/* Doctor Name - Separate Row */}
                                <Grid item xs={12}>
                                    <Box display="flex" alignItems="center">
                                        <strong>Doctor Names:</strong>
                                        <Button
                                            startIcon={<Add />}
                                            onClick={() => dispatch({ type: "ADD_ARRAY_ITEM", index, field: "doctorName" })}
                                            sx={{ ml: 2 }}
                                        >
                                            Add Doctor
                                        </Button>
                                    </Box>
                                </Grid>

                                {procedure.doctorName.map((doctor, docIndex) => (
                                    <Grid key={docIndex} item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="standard"
                                            label="Doctor Name"
                                            value={doctor}
                                            onChange={(e) =>
                                                dispatch({
                                                    type: "SET_ARRAY_ITEM",
                                                    index,
                                                    field: "doctorName",
                                                    itemIndex: docIndex,
                                                    value: e.target.value,
                                                })
                                            }
                                        />
                                        <IconButton
                                            onClick={() =>
                                                dispatch({ type: "REMOVE_ARRAY_ITEM", index, field: "doctorName", itemIndex: docIndex })
                                            }
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Grid>
                                ))}

                                {/* Empanelment Type - Separate Row */}
                                <Grid item xs={12}>
                                    <Box display="flex" alignItems="center">
                                        <strong>Empanelment Type:</strong>
                                        <Button
                                            startIcon={<Add />}
                                            onClick={() => dispatch({ type: "ADD_ARRAY_ITEM", index, field: "empanelmentType" })}
                                            sx={{ ml: 2 }}
                                        >
                                            Add Type
                                        </Button>
                                    </Box>
                                </Grid>

                                {procedure.empanelmentType.map((type, typeIndex) => (
                                    <Grid key={typeIndex} item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="standard"
                                            label="Empanelment Type"
                                            value={type}
                                            onChange={(e) =>
                                                dispatch({
                                                    type: "SET_ARRAY_ITEM",
                                                    index,
                                                    field: "empanelmentType",
                                                    itemIndex: typeIndex,
                                                    value: e.target.value,
                                                })
                                            }
                                        />
                                        <IconButton
                                            onClick={() =>
                                                dispatch({ type: "REMOVE_ARRAY_ITEM", index, field: "empanelmentType", itemIndex: typeIndex })
                                            }
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Grid>
                                ))}

                                {/* Third Row - Rates & Coordinator */}
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Rates/Charges"
                                        value={procedure.ratesCharges}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "ratesCharges", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                {/* Coordinator Name - Separate Row */}
                                <Grid item xs={12}>
                                    <Box display="flex" alignItems="center">
                                        <strong>Coordinator Name:</strong>
                                        <Button
                                            startIcon={<Add />}
                                            onClick={() => dispatch({ type: "ADD_ARRAY_ITEM", index, field: "coordinatorName" })}
                                            sx={{ ml: 2 }}
                                        >
                                            Add Coordinator
                                        </Button>
                                    </Box>
                                </Grid>

                                {procedure.coordinatorName.map((coordinator, coordIndex) => (
                                    <Grid key={coordIndex} item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="standard"
                                            label="Coordinator Name"
                                            value={coordinator}
                                            onChange={(e) =>
                                                dispatch({
                                                    type: "SET_ARRAY_ITEM",
                                                    index,
                                                    field: "coordinatorName",
                                                    itemIndex: coordIndex,
                                                    value: e.target.value,
                                                })
                                            }
                                        />
                                        <IconButton
                                            onClick={() =>
                                                dispatch({ type: "REMOVE_ARRAY_ITEM", index, field: "coordinatorName", itemIndex: coordIndex })
                                            }
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Remove Procedure Button */}
                            <Button startIcon={<Delete />} color="error" onClick={() => dispatch({ type: "REMOVE_PROCEDURE", index })}>
                                Remove Procedure
                            </Button>
                        </Box>
                    ))}

                    {/* Add New Procedure */}
                    <Button startIcon={<Add />} onClick={() => dispatch({ type: "ADD_PROCEDURE" })}>
                        Add Procedure
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

export default ProcedureListDialog;
