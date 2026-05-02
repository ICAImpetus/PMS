import React, { useReducer, useState, useEffect } from "react";
import { Dialog, DialogActions, Box, DialogContent, Typography, DialogTitle, Button, TextField, IconButton, Grid } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const initialState = [
    {
        name: "",
        location: "",
        contactNumbers: [""],
        code: "",
        beds: ""
    }
];

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_INITIAL_VALUES":
            return action.payload; // Set state to initial values when they change
        case "SET_FIELD":
            return state.map((branch, index) =>
                index === action.index ? { ...branch, [action.field]: action.value } : branch
            );
        case "ADD_CONTACT":
            return state.map((branch, index) =>
                index === action.index
                    ? { ...branch, contactNumbers: [...branch.contactNumbers, ""] }
                    : branch
            );
        case "REMOVE_CONTACT":
            return state.map((branch, index) =>
                index === action.index
                    ? { ...branch, contactNumbers: branch.contactNumbers.filter((_, i) => i !== action.contactIndex) }
                    : branch
            );
        case "UPDATE_CONTACT":
            return state.map((branch, index) =>
                index === action.index
                    ? {
                        ...branch,
                        contactNumbers: branch.contactNumbers.map((num, i) =>
                            i === action.contactIndex ? action.value : num
                        )
                    }
                    : branch
            );
        case "ADD_BRANCH":
            return [...state, { name: "", location: "", contactNumbers: [""], code: "", beds: "" }];
        case "REMOVE_BRANCH":
            return state.length > 1 ? state.filter((_, index) => index !== action.index) : state;
        // case "RESET":
        //     return initialState;
        default:
            return state;
    }
};

const BranchForm = ({ open, onClose, onSave, initialValues, colors }) => {
    console.log('initialValues in branchNew.jsx comp', initialValues);
    const [state, dispatch] = useReducer(reducer, initialValues);
    console.log('state in branchNew.jsx comp', state);

    useEffect(() => {
        dispatch({ type: "SET_INITIAL_VALUES", payload: initialValues });
    }, [initialValues]);


    const handleSave = () => {
        onSave(state);
        // dispatch({ type: "RESET" });
        onClose();
    };
    console.log("initialvalue in branch Form is ", initialValues);
    console.log("state in branch form is ", state);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: "transparent",
                    overflow: "visible",
                    borderRadius: 2,
                },
            }}
            component="div"
        >
            <Box
                sx={{
                    backgroundColor: colors.primary[900],
                    p: 1,
                    borderRadius: 2,
                    maxHeight: "80vh", // Adjust as needed
                    overflowY: "auto", // Enables vertical scrolling
                    scrollbarWidth: "thin", // For Firefox
                    scrollbarColor: "transparent transparent", // For Firefox
                    "&::-webkit-scrollbar": {
                        width: "6px"
                    },
                    "&::-webkit-scrollbar-track": {
                        background: "transparent"
                    },
                    "&::-webkit-scrollbar-thumb": {
                        background: "rgba(255, 255, 255, 0.1)", // Lightly visible on hover
                        borderRadius: "10px"
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        background: "rgba(255, 255, 255, 0.3)"
                    }
                }}
            >
                <DialogTitle>Branch Details</DialogTitle>
                <DialogContent>
                    {state.map((branch, branchIndex) => (
                        <Box key={branchIndex} p={2} mb={2} border={1} borderRadius={2} position="relative">
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="h6" fontWeight="bold">
                                    Branch {branchIndex + 1}
                                </Typography>
                                {state.length > 1 && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => dispatch({ type: "REMOVE_BRANCH", index: branchIndex })}
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: "bold",
                                            px: 2,
                                            "&:hover": {
                                                backgroundColor: "rgba(255, 0, 0, 0.1)",
                                            },
                                        }}
                                    >
                                        Remove Branch
                                    </Button>
                                )}
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        variant="standard"
                                        label="Branch Name"
                                        value={branch.name}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index: branchIndex, field: "name", value: e.target.value })
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        variant="standard"
                                        label="Location"
                                        value={branch.location}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index: branchIndex, field: "location", value: e.target.value })
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        variant="standard"
                                        label="Code"
                                        value={branch.code}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index: branchIndex, field: "code", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        variant="standard"
                                        label="Beds"
                                        type="number"
                                        value={branch.beds}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", index: branchIndex, field: "beds", value: e.target.value })
                                        }
                                    />
                                </Grid>

                                {branch.contactNumbers.map((contact, contactIndex) => (
                                    <Grid item xs={12} sm={6} md={4} key={contactIndex}>
                                        <Box display="flex" alignItems="center">
                                            <TextField
                                                fullWidth
                                                margin="normal"
                                                variant="standard"
                                                label={`Contact ${contactIndex + 1}`}
                                                value={contact}
                                                onChange={(e) =>
                                                    dispatch({
                                                        type: "UPDATE_CONTACT",
                                                        index: branchIndex,
                                                        contactIndex,
                                                        value: e.target.value,
                                                    })
                                                }
                                            />
                                            <IconButton
                                                onClick={() =>
                                                    dispatch({ type: "REMOVE_CONTACT", index: branchIndex, contactIndex })
                                                }
                                                disabled={branch.contactNumbers.length === 1}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>

                            <Button startIcon={<Add />} onClick={() => dispatch({ type: "ADD_CONTACT", index: branchIndex })}>
                                Add Contact
                            </Button>
                        </Box>
                    ))}

                    <Button startIcon={<Add />} onClick={() => dispatch({ type: "ADD_BRANCH" })} className="mt-2">
                        Add Branch
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

export default BranchForm;
