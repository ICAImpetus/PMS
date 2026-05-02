import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  useTheme,
  Card,
  CardContent,
  Stack,
  Checkbox,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import GroupIcon from "@mui/icons-material/Group";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { tokens } from "../../../../../theme";

// Helper to standardise doctor objects
const simplifyDoctorObject = (doctor) => {
  if (!doctor) return null;
  return {
    id: doctor._id || doctor.id, // Prefer _id (unique MongoDB ID) over id
    name: doctor.name || doctor.full_name,
    opdNo: doctor.opdNo || doctor.opd_no,
    specialties: doctor.specialties,
  };
};

const AddDepartmentModal = ({
  open,
  onClose,
  onSave,
  departmentData = null,
  availableDoctors = [],
  loading = false,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State to manage the form data
  const [currentDepartment, setCurrentDepartment] = useState({
    name: "",
    doctors: [],
  });

  // State for validation errors
  const [errors, setErrors] = useState({});

  // Reset form when modal opens or data changes
  useEffect(() => {
    if (open) {
      if (departmentData) {
        // Edit Mode
        setCurrentDepartment({
          ...departmentData,
          name: departmentData.name || "",
          doctors: departmentData.doctors
            ? departmentData.doctors.map(simplifyDoctorObject).filter(Boolean)
            : [],
        });
      } else {
        // Add Mode
        setCurrentDepartment({
          name: "",
          doctors: [],
        });
      }
      setErrors({});
    }
  }, [open, departmentData]);

  // Memoized list of doctors to display in dropdown (exclude those already selected)
  const doctorsForDropdown = useMemo(() => {
    if (!open) return [];

    const currentDepartmentDoctorIdentifiers = new Set(
      currentDepartment.doctors.map((d) => d.id || d._id),
    );

    return availableDoctors.filter(
      (doctor) =>
        !currentDepartmentDoctorIdentifiers.has(
          doctor._id || doctor.id,
        ),
    );
  }, [open, availableDoctors, currentDepartment.doctors]);

  // Handle Text Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentDepartment((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle Multi-Select Doctor Change
  const handleDoctorsChange = (event) => {
    const {
      target: { value },
    } = event;

    // Value comes in as an array of IDs due to MenuItem value={doctor.id || doctor._id || doctor.opdNo}
    const selectedDoctorIds =
      typeof value === "string" ? value.split(",") : value;

    // Map IDs back to full simplified objects
    const newDoctors = availableDoctors
      .filter((doctor) =>
        selectedDoctorIds.includes(doctor._id || doctor.id),
      )
      .map(simplifyDoctorObject);

    setCurrentDepartment((prev) => ({
      ...prev,
      doctors: newDoctors,
    }));

    if (errors.doctors) {
      setErrors((prev) => ({ ...prev, doctors: "" }));
    }
  };

  // Handle Removing a Doctor Chip
  const handleDeleteChip = (event, chipToDelete) => {
    event.stopPropagation(); // Prevent dropdown from opening

    setCurrentDepartment((prev) => {
      const newDoctors = prev.doctors.filter((doctorInDepartment) => {
        const id1 = doctorInDepartment.id || doctorInDepartment._id;
        const id2 = chipToDelete.id || chipToDelete._id;

        // Robust comparison: unique ID match first, Fallback to Name match
        if (id1 && id2) {
          return id1 !== id2;
        }
        return doctorInDepartment.name !== chipToDelete.name;
      });

      return { ...prev, doctors: newDoctors };
    });
  };

  // Validation Logic
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!currentDepartment.name.trim()) {
      tempErrors.name = "Department Name is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // Save Handler
  const handleSave = () => {
    if (validateForm()) {
      const departmentToSave = {
        ...currentDepartment,
        id: departmentData?.id || `dept-${Date.now()}`,
      };
      onSave(departmentToSave);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${colors.primary[800]} 0%, ${colors.primary[900]} 100%)`
              : `linear-gradient(135deg, ${colors.grey[50]} 0%, ${colors.primary[900]} 100%)`,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${colors.blueAccent[700]} 0%, ${colors.blueAccent[800]} 100%)`
              : `linear-gradient(135deg, ${colors.blueAccent[500]} 0%, ${colors.blueAccent[600]} 100%)`,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <BusinessIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {departmentData ? "Edit Department" : "Add New Department"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              transform: "scale(1.1)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          p: 0,
          backgroundColor:
            theme.palette.mode === "dark"
              ? colors.primary[900]
              : colors.grey[50],
        }}
      >
        <Box sx={{ p: 4 }}>
          <Stack spacing={4}>
            {/* Card 1: Basic Info */}
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background:
                  theme.palette.mode === "dark" ? colors.primary[800] : "white",
                border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <MedicalServicesIcon
                    sx={{ color: colors.blueAccent[500], fontSize: 24 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: colors.primary[500] }}
                  >
                    Department Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Department Name"
                      name="name"
                      value={currentDepartment.name}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      error={!!errors.name}
                      helperText={errors.name}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background:
                  theme.palette.mode === "dark" ? colors.primary[800] : "white",
                border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <MedicalServicesIcon
                    sx={{ color: colors.blueAccent[500], fontSize: 24 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: colors.primary[500] }}
                  >
                    Treatable Areas
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Treatable ares"
                      name="treatableAreas"
                      value={currentDepartment.treatableAreas}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      error={!!errors.treatableAreas}
                      helperText={errors.treatableAreas}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Surgeries"
                      name="surgeries"
                      value={currentDepartment.surgeries}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      error={!!errors.surgeries}
                      helperText={errors.surgeries}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card> */}


            {/* Card 2: Assign Doctors */}
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background:
                  theme.palette.mode === "dark" ? colors.primary[800] : "white",
                border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <GroupIcon
                    sx={{ color: colors.blueAccent[500], fontSize: 24 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: colors.primary[500] }}
                  >
                    Assign Doctors
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      error={!!errors.doctors}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    >
                      <InputLabel id="select-doctors-label">
                        Add Doctors to Department
                      </InputLabel>
                      <Select
                        labelId="select-doctors-label"
                        id="select-doctors"
                        multiple
                        value={currentDepartment.doctors.map((doc) => doc.id || doc._id)}
                        onChange={handleDoctorsChange}
                        input={
                          <OutlinedInput label="Add Doctors to Department" />
                        }
                        renderValue={(selectedIds) => {
                          const selectedCount = selectedIds.length;
                          return (
                            <Typography variant="body2" color="textSecondary">
                              {selectedCount === 0
                                ? "No doctors selected"
                                : `${selectedCount} doctor${selectedCount > 1 ? "s" : ""} selected`}
                            </Typography>
                          );
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                              width: 400,
                              borderRadius: 12,
                            },
                          },
                        }}
                      >
                        {doctorsForDropdown.map((doctor) => (
                          <MenuItem
                            key={doctor._id || doctor.id}
                            value={doctor._id || doctor.id}
                            sx={{
                              "&:hover": {
                                backgroundColor: colors.primary[50],
                              },
                            }}
                          >
                            <Checkbox
                              checked={currentDepartment.doctors.some(
                                (d) => {
                                  const dId = d.id || d._id;
                                  const doctorId = doctor._id || doctor.id;
                                  return dId && doctorId && dId === doctorId;
                                }
                              )}
                              sx={{
                                color: colors.primary[500],
                                "&.Mui-checked": { color: colors.primary[600] },
                              }}
                            />
                            <ListItemText
                              primary={doctor.name || doctor.full_name}
                              secondary={`OPD: ${doctor.opdNo || "N/A"} | Specialties: ${doctor.specialties?.map(item => item.value).join(", ") || "None"}`}
                              sx={{
                                "& .MuiListItemText-primary": {
                                  fontWeight: 500,
                                },
                                "& .MuiListItemText-secondary": {
                                  fontSize: "0.875rem",
                                  color: colors.grey[600],
                                },
                              }}
                            />
                          </MenuItem>
                        ))}
                        {doctorsForDropdown.length === 0 && (
                          <MenuItem disabled>
                            No more available doctors
                          </MenuItem>
                        )}
                      </Select>
                      {errors.doctors && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.5 }}
                        >
                          {errors.doctors}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Selected Chips Display */}
                  {currentDepartment.doctors.length > 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 2,
                            fontWeight: 600,
                            color: colors.primary[500],
                          }}
                        >
                          Selected Doctors ({currentDepartment.doctors.length})
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            p: 2,
                            backgroundColor: colors.primary[950],
                            borderRadius: 2,
                            border: `1px solid ${colors.primary[800]}`,
                          }}
                        >
                          {currentDepartment.doctors.map((doctor) => (
                            <Chip
                              key={doctor.id || doctor._id}
                              label={doctor.name}
                              onDelete={(event) =>
                                handleDeleteChip(event, doctor)
                              }
                              onMouseDown={(e) => e.stopPropagation()}
                              deleteIcon={<CloseIcon />}
                              sx={{
                                backgroundColor: colors.blueAccent[600],
                                color: "white",
                                "& .MuiChip-deleteIcon": {
                                  color: "white",
                                  "&:hover": { color: colors.redAccent[300] },
                                },
                                "&:hover": {
                                  backgroundColor: colors.blueAccent[700],
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions
        sx={{
          p: 3,
          background:
            theme.palette.mode === "dark"
              ? colors.primary[800]
              : colors.grey[50],
          borderTop: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
          gap: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            px: 4,
            borderColor: colors.grey[400],
            color:
              theme.palette.mode === "dark"
                ? colors.grey[100]
                : colors.grey[700],
            "&:hover": {
              borderColor: colors.redAccent[400],
              backgroundColor: colors.redAccent[50],
              color: colors.redAccent[700],
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            background: `linear-gradient(135deg, ${colors.greenAccent[500]} 0%, ${colors.greenAccent[600]} 100%)`,
            "&:hover": {
              background: `linear-gradient(135deg, ${colors.greenAccent[600]} 0%, ${colors.greenAccent[700]} 100%)`,
              transform: "translateY(-1px)",
              boxShadow: `0 6px 20px ${colors.greenAccent[300]}40`,
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          {loading
            ? "Saving..."
            : departmentData
              ? "Update Department"
              : "Add Department"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDepartmentModal;
