import React, { useReducer, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  IconButton,
  FormControlLabel,
  Switch,
  Box,
  Grid,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const DepartmentForm = ({ open, onClose, onSave, initialValues, colors }) => {
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_INITIAL_VALUES":
        return action.payload; // Set state to initial values when they change
      case "SET_DEPARTMENT_FIELD":
        return state.map((dept, index) =>
          index === action.index ? { ...dept, [action.field]: action.value } : dept
        );
      case "ADD_DEPARTMENT":
        return [
          ...state,
          {
            name: "",
            doctors: [
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
                isEnabled: true,
              },
            ],
          },
        ];
      case "REMOVE_DEPARTMENT":
        return state.filter((_, index) => index !== action.index);
      case "SET_DOCTOR_FIELD":
        return state.map((dept, deptIndex) =>
          deptIndex === action.deptIndex
            ? {
              ...dept,
              doctors: dept.doctors.map((doc, docIndex) =>
                docIndex === action.docIndex ? { ...doc, [action.field]: action.value } : doc
              ),
            }
            : dept
        );
      case "ADD_DOCTOR":
        return state.map((dept, deptIndex) =>
          deptIndex === action.deptIndex
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
                  isEnabled: true,
                },
              ],
            }
            : dept
        );
      case "REMOVE_DOCTOR":
        return state.map((dept, deptIndex) =>
          deptIndex === action.deptIndex
            ? {
              ...dept,
              doctors: dept.doctors.filter((_, docIndex) => docIndex !== action.docIndex),
            }
            : dept
        );
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialValues || []);
  useEffect(() => {
    dispatch({ type: "SET_INITIAL_VALUES", payload: initialValues });
  }, [initialValues]);

  const handleSave = () => {
    onSave(state);
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
        <DialogTitle>Department Details</DialogTitle>
        <DialogContent sx={{ overflowY: "auto", maxHeight: "70vh" }}>
          {state.map((department, deptIndex) => (
            <Box key={deptIndex} sx={{ border: `1px solid ${colors.primary[500]}`, p: 2, mb: 2, borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={9}>
                  <TextField
                    variant="standard" fullWidth
                    label="Department Name"
                    value={department.name}
                    onChange={(e) =>
                      dispatch({ type: "SET_DEPARTMENT_FIELD", index: deptIndex, field: "name", value: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3} display="flex" justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => dispatch({ type: "REMOVE_DEPARTMENT", index: deptIndex })}
                    disabled={state.length === 1}
                    startIcon={<Delete />}
                  >
                    Remove
                  </Button>
                </Grid>
              </Grid>

              {department.doctors.map((doctor, docIndex) => (
                <Box key={docIndex} sx={{ p: 2, mt: 2, borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={9}>
                      <TextField
                        variant="standard" fullWidth
                        label="Doctor Name"
                        value={doctor.name}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_DOCTOR_FIELD",
                            deptIndex,
                            docIndex,
                            field: "name",
                            value: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={3} display="flex" justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => dispatch({ type: "REMOVE_DOCTOR", deptIndex, docIndex })}
                        disabled={department.doctors.length === 1}
                        startIcon={<Delete />}
                      >
                        Remove
                      </Button>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <TextField variant="standard" fullWidth label="OPD No." value={doctor.opdNo} onChange={(e) =>
                        dispatch({ type: "SET_DOCTOR_FIELD", deptIndex, docIndex, field: "opdNo", value: e.target.value })
                      } />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <TextField variant="standard" fullWidth label="Experience" value={doctor.experience} onChange={(e) =>
                        dispatch({ type: "SET_DOCTOR_FIELD", deptIndex, docIndex, field: "experience", value: e.target.value })
                      } />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <TextField variant="standard" fullWidth label="Contact Number" value={doctor.contactNumber} onChange={(e) =>
                        dispatch({ type: "SET_DOCTOR_FIELD", deptIndex, docIndex, field: "contactNumber", value: e.target.value })
                      } />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <TextField variant="standard" fullWidth label="Extension Number" value={doctor.extensionNumber} onChange={(e) =>
                        dispatch({ type: "SET_DOCTOR_FIELD", deptIndex, docIndex, field: "extensionNumber", value: e.target.value })
                      } />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <TextField variant="standard" fullWidth label="PA Name" value={doctor.paName} onChange={(e) =>
                        dispatch({ type: "SET_DOCTOR_FIELD", deptIndex, docIndex, field: "paName", value: e.target.value })
                      } />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <TextField variant="standard" fullWidth label="PA Contact Number" value={doctor.paContactNumber} onChange={(e) =>
                        dispatch({ type: "SET_DOCTOR_FIELD", deptIndex, docIndex, field: "paContactNumber", value: e.target.value })
                      } />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <TextField variant="standard" fullWidth label="Consultation Charges" value={doctor.consultationCharges} onChange={(e) =>
                        dispatch({ type: "SET_DOCTOR_FIELD", deptIndex, docIndex, field: "consultationCharges", value: e.target.value })
                      } />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <TextField variant="standard" fullWidth label="Telemedicine" value={doctor.teleMedicine} onChange={(e) =>
                        dispatch({ type: "SET_DOCTOR_FIELD", deptIndex, docIndex, field: "teleMedicine", value: e.target.value })
                      } />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={doctor.isEnabled} onChange={(e) =>
                          dispatch({ type: "SET_DOCTOR_FIELD", deptIndex, docIndex, field: "isEnabled", value: e.target.checked })
                        } />}
                        label="Is Enabled"
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Button
                startIcon={<Add />}
                onClick={() => dispatch({ type: "ADD_DOCTOR", deptIndex })}
                sx={{ mt: 1 }}
                variant="outlined"
              >
                Add Doctor
              </Button>
            </Box>
          ))}

          <Button
            startIcon={<Add />}
            onClick={() => dispatch({ type: "ADD_DEPARTMENT" })}
            sx={{ mt: 2 }}
            variant="contained"
          >
            Add Department
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

export default DepartmentForm;
