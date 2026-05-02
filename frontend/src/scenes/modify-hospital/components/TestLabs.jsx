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

        case "ADD_TEST_LAB":
            return [
                ...state,
                {
                    location: "",
                    testCode: "",
                    testName: "",
                    serviceGroup: "",
                    serviceCharge: "",
                    floor: "",
                    description: "",
                    precaution: "",
                    categoryApplicability: [""],
                    tatReport: "",
                    source: "",
                    remarks: "",
                },
            ];

        case "REMOVE_TEST_LAB":
            return state.filter((_, index) => index !== action.index);

        case "ADD_CATEGORY":
            return state.map((item, index) =>
                index === action.index
                    ? { ...item, categoryApplicability: [...item.categoryApplicability, ""] }
                    : item
            );

        case "REMOVE_CATEGORY":
            return state.map((item, index) =>
                index === action.index
                    ? { ...item, categoryApplicability: item.categoryApplicability.filter((_, i) => i !== action.categoryIndex) }
                    : item
            );

        case "SET_CATEGORY":
            return state.map((item, index) =>
                index === action.index
                    ? {
                        ...item,
                        categoryApplicability: item.categoryApplicability.map((category, i) =>
                            i === action.categoryIndex ? action.value : category
                        ),
                    }
                    : item
            );

        default:
            return state;
    }
};

const TestLabDialog = ({ open, onClose, onSave, initialValues, colors }) => {
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
                <DialogTitle>Test Lab Details</DialogTitle>
                <DialogContent>
                    {state.map((testLab, index) => (
                        <Box key={index} p={2} mb={2} border={1} borderRadius={2}>
                            <Grid container spacing={2}>
                                {/* First Row - Three Fields */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Location"
                                        value={testLab.location}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "location", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Test Code"
                                        value={testLab.testCode}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "testCode", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Test Name"
                                        value={testLab.testName}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "testName", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                {/* Second Row - Three Fields */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Service Group"
                                        value={testLab.serviceGroup}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "serviceGroup", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Service Charge"
                                        value={testLab.serviceCharge}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "serviceCharge", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Floor"
                                        value={testLab.floor}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "floor", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                {/* Third Row - Three Fields */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Description"
                                        value={testLab.description}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "description", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Precaution"
                                        value={testLab.precaution}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "precaution", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="TAT Report"
                                        value={testLab.tatReport}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "tatReport", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                {/* Fourth Row - Source & Remarks */}
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Source"
                                        value={testLab.source}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "source", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        label="Remarks"
                                        value={testLab.remarks}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index, field: "remarks", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                {/* Category Applicability - Separate Section */}
                                <Grid item xs={12}>
                                    <Box display="flex" alignItems="center">
                                        <strong>Category Applicability:</strong>
                                        <Button
                                            startIcon={<Add />}
                                            onClick={() => dispatch({ type: "ADD_CATEGORY", index })}
                                            sx={{ ml: 2 }}
                                        >
                                            Add Category
                                        </Button>
                                    </Box>
                                </Grid>

                                {testLab.categoryApplicability.map((category, categoryIndex) => (
                                    <Grid key={categoryIndex} item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="standard"
                                            label={`Category ${categoryIndex + 1}`}
                                            value={category}
                                            onChange={(e) =>
                                                dispatch({ type: "SET_CATEGORY", index, categoryIndex, value: e.target.value })
                                            }
                                        />
                                        <IconButton
                                            onClick={() => dispatch({ type: "REMOVE_CATEGORY", index, categoryIndex })}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Remove Test Lab Button */}
                            <Button startIcon={<Delete />} color="error" onClick={() => dispatch({ type: "REMOVE_TEST_LAB", index })}>
                                Remove Test Lab
                            </Button>
                        </Box>
                    ))}

                    {/* Add New Test Lab */}
                    <Button startIcon={<Add />} onClick={() => dispatch({ type: "ADD_TEST_LAB" })}>
                        Add Test Lab
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

export default TestLabDialog;
