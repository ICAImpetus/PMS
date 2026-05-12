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
  ListItemText,
  CircularProgress,
  Autocomplete
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PersonIcon from "@mui/icons-material/Person";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CategoryIcon from "@mui/icons-material/Category";
import { tokens } from '../../../../../theme';


const staticEmpanelmentData = [
  { id: "EMP001", name: "Star Health Insurance" },
  { id: "EMP002", name: "HDFC Ergo" },
  { id: "EMP003", name: "Reliance General Insurance" },
  { id: "EMP004", name: "Ayushman Bharat (PMJAY)" },
  { id: "EMP005", name: "Tata AIG" },
  { id: "EMP006", name: "Central Government Health Scheme (CGHS)" },
  { id: "EMP007", name: "Cashless Corporate - Google" },
  { id: "EMP008", name: "Self-Pay / Cash" }
];

const AddProcedureModal = ({
  open,
  onClose,
  onSave,
  procedureData = null,
  departments,
  availableDoctors = [], // Array of doctor names (strings)
  availableEmpanelmentTypes = [],
  availableCoordinators = [],
  loading = false,
  globalSuggestion
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State to manage the form data for the new/edited procedure
  const [currentProcedure, setCurrentProcedure] = useState({
    name: "",
    description: "",
    category: "",
    department: "",
    doctorName: [], // Array of strings
    empanelmentType: [], // Array of strings
    duration: "",
    ratesCharges: "",
    coordinatorName: [], // Array of strings
  });

  // State for validation errors
  const [errors, setErrors] = useState({});
  const [doctors, setDoctors] = useState([]);

  const normalizeSuggestionValue = (value) => {
    if (!value && value !== 0) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "object") {
      if (typeof value.label === "string" && value.label.trim()) return value.label.trim();
      if (typeof value.value === "string" && value.value.trim()) return value.value.trim();
      if (typeof value.name === "string" && value.name.trim()) return value.name.trim();
    }
    return "";
  };

  const normalizeSuggestionArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item) => normalizeSuggestionValue(item))
      .filter((item) => item);
  };

  // Define available options for single select (Category)
  const categoryOptions = useMemo(
    () => ["Surgery", "Diagnostic", "Therapeutic", "Consultation", "Other"],
    []
  );

  // Memoized list of doctors to display in the dropdown (excluding selected ones)
  const doctorsForDropdown = useMemo(() => {
    if (!open) return [];
    const currentSelected = new Set(currentProcedure.doctorName);
    return doctors?.name?.filter((d) => !currentSelected.has(d));
  }, [open, doctors, currentProcedure.doctorName]);

  // Memoized list of empanelment types
  const empanelmentTypesForDropdown = useMemo(() => {
    if (!open) return [];
    const currentSelected = new Set(currentProcedure.empanelmentType);
    return staticEmpanelmentData.filter((t) => !currentSelected.has(t.name));
  }, [open, currentProcedure.empanelmentType]);

  // Memoized list of coordinators
  const coordinatorsForDropdown = useMemo(() => {
    if (!open) return [];
    const currentSelected = new Set(currentProcedure.coordinatorName);
    return availableCoordinators?.filter((c) => !currentSelected.has(c));
  }, [open, availableCoordinators, currentProcedure.coordinatorName]);

  // Effect to reset form and errors when modal opens/closes or procedureData changes
  useEffect(() => {
    if (open) {
      if (procedureData) {
        // If procedureData is provided (for editing), initialize with its values
        const doctorData =
          procedureData?.doctorIds?.map((doc) => ({
            id: doc?._id || doc?.id,
            name: doc?.name || doc?.fullName || doc?.value || "",
          })) || procedureData?.doctorName || [];

        setCurrentProcedure({
          ...procedureData,
          name: procedureData.name || "",
          department: procedureData.department || "",
          duration: procedureData.duration || "",
          description: procedureData.description || "",
          category:
            procedureData?.category?.value || procedureData?.category || "",
          doctorName: doctorData,
          empanelmentType: normalizeSuggestionArray(
            procedureData.empanelmentType || procedureData.empanelmentType || []
          ),
          ratesCharges: procedureData.ratesCharges || "",
          coordinatorName: procedureData.coordinatorName || [],
        });
      } else {
        // Otherwise (for adding new), reset to empty initial state
        setCurrentProcedure({
          name: "",
          description: "",
          department: "",
          duration: "",
          category: "",
          doctorName: [],
          empanelmentType: [],
          ratesCharges: "",
          coordinatorName: [],
        });
      }
      setErrors({}); // Always clear errors on modal open
    }
  }, [open, procedureData]);

  // Handle changes for standard text fields and single selects
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Department change logic
    if (name === "department") {

      // selected department find karo
      const selectedDepartment = departments.find(
        (dept) => dept._id === value
      );
      setDoctors(selectedDepartment?.doctors);
      // doctor selection reset karo
      setCurrentProcedure((prev) => ({
        ...prev,
        department: value,
        doctorName: [],
      }));

      return;
    }

    // Rates validation
    if (name === "ratesCharges") {
      if (!/^[0-9]*$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          ratesCharges: "Rates/Charges must be digits only.",
        }));
      } else if (!value.trim()) {
        setErrors((prev) => ({
          ...prev,
          ratesCharges: "Rates/Charges is required.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, ratesCharges: "" }));
      }
    }

    // Clear existing error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Normal field update
    setCurrentProcedure((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle changes for multi-selects
  const handleMultiSelectChange = (field, event) => {
    const {
      target: { value },
    } = event;

    const newValues =
      typeof value === "string" ? value.split(",") : value;

    setCurrentProcedure((prev) => ({
      ...prev,
      [field]: newValues,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle deleting a chip (removing an item from a multi-select array)
  const handleDeleteChip = (field, id) => {
    setCurrentProcedure((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item.id !== id),
    }));
  };

  // --- Validation Logic ---
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!currentProcedure.name.trim()) {
      tempErrors.name = "Procedure Name is required.";
      isValid = false;
    }
    if (!currentProcedure.category.trim()) {
      tempErrors.category = "Category is required.";
      isValid = false;
    }
    const rates = String(currentProcedure.ratesCharges || "");

    if (!rates.trim()) {
      tempErrors.ratesCharges = "Rates/Charges is required.";
      isValid = false;
    } else if (!/^[0-9]+$/.test(rates.trim())) {
      tempErrors.ratesCharges = "Rates/Charges must be digits only.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateForm()) {
      const procedureToSave = {
        ...currentProcedure,
        empanelmentType: normalizeSuggestionArray(currentProcedure.empanelmentType),
        category:
          normalizeSuggestionValue(currentProcedure.category) ||
          currentProcedure.category ||
          "",
        // Generate a new ID if adding, otherwise use existing ID for editing
        id: procedureData?.id || `proc-${Date.now()}`,
      };
      onSave(procedureToSave); // Call the onSave prop with the prepared data
    } else {
      console.log("Form validation failed.", errors);
    }
  };

  const procedureCategory = globalSuggestion?.filter(
    (item) => item?.type === "procedureCategory"
  ) || [];
  const empanelmentType = globalSuggestion?.filter(
    (item) => item?.type === "empanelmentType"
  ) || [];
  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: theme.palette.mode === "dark"
            ? `linear-gradient(135deg, ${colors.primary[800]} 0%, ${colors.primary[900]} 100%)`
            : `linear-gradient(135deg, ${colors.grey[50]} 0%, ${colors.primary[900]} 100%)`,
        }
      }}
    >
      <DialogTitle
        sx={{
          background: theme.palette.mode === "dark"
            ? `linear-gradient(135deg, ${colors.blueAccent[700]} 0%, ${colors.blueAccent[800]} 100%)`
            : `linear-gradient(135deg, ${colors.blueAccent[500]} 0%, ${colors.blueAccent[600]} 100%)`,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MedicalServicesIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {procedureData ? "Edit Procedure" : "Add New Procedure"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={loading}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          backgroundColor: theme.palette.mode === "dark" ? colors.primary[900] : colors.grey[50],
        }}
      >
        <Box sx={{ p: 4 }}>
          <Stack spacing={4}>

            {/* Basic Procedure Information Card */}
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: theme.palette.mode === "dark"
                  ? colors.primary[800]
                  : 'white',
                border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <MedicalServicesIcon sx={{ color: colors.blueAccent[500], fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.primary[500]
                    }}
                  >
                    Procedure/Surgery Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Procedure Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Procedure/Surgery Name"
                      name="name"
                      value={currentProcedure.name}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      error={!!errors.name}
                      helperText={errors.name}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  {/* Category */}
                  <Grid item xs={12} sm={6}>
                    {/* <FormControl
                      fullWidth
                      size="medium"
                      variant="outlined"
                      required
                      error={!!errors.category}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    >
                      <InputLabel id="select-category-label">Category</InputLabel>
                      <Select
                        labelId="select-category-label"
                        id="select-category"
                        name="category"
                        value={currentProcedure.category}
                        onChange={handleChange}
                        label="Category"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {categoryOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.category && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.category}
                        </Typography>
                      )}
                    </FormControl> */}
                    <Autocomplete
                      fullWidth
                      freeSolo
                      options={
                        procedureCategory?.map((item) => ({
                          label: item.value,
                          value: item._id,
                        })) || []
                      }
                      value={currentProcedure.category || ""}
                      inputValue={currentProcedure.category || ""}
                      getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label || option.value || ""
                      }
                      onInputChange={(event, newInputValue) => {
                        setCurrentProcedure((prev) => ({
                          ...prev,
                          category: newInputValue,
                        }));
                      }}
                      onChange={(event, newValue) => {
                        setCurrentProcedure((prev) => ({
                          ...prev,
                          category:
                            typeof newValue === "string"
                              ? newValue
                              : newValue?.label || "",
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Category"
                          placeholder="Select or type"
                        />
                      )}
                    />
                  </Grid>
                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={currentProcedure.description}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      multiline
                      rows={3}
                      placeholder="Detailed procedure/surgery description..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Medical Team Assignment Card */}
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: theme.palette.mode === "dark"
                  ? colors.primary[800]
                  : 'white',
                border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <PersonIcon sx={{ color: colors.greenAccent[500], fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.primary[500]
                    }}
                  >
                    Medical Team Assignment
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Doctor Name (Multi-select) */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Duration"
                      name="duration"
                      value={currentProcedure.duration}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      error={!!errors.duration}
                      helperText={errors.duration}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      size="medium"
                      variant="outlined"
                      required
                      error={!!errors.department}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    >
                      <InputLabel id="select-category-label">Department</InputLabel>
                      <Select
                        labelId="select-department-label"
                        id="select-department"
                        name="department"
                        value={currentProcedure?.department}
                        onChange={handleChange}
                        label="department"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {departments?.map((option) => (
                          <MenuItem key={option._id} value={option._id}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors?.department && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors?.department}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      size="medium"
                      variant="outlined"
                      error={!!errors.doctorName}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    >
                      <InputLabel id="select-doctor-name-label">Doctor(s)</InputLabel>
                      <Select
                        labelId="select-doctor-name-label"
                        id="select-doctor-name"
                        multiple
                        value={currentProcedure.doctorName}
                        onChange={(e) => handleMultiSelectChange("doctorName", e)}
                        input={
                          <OutlinedInput
                            id="select-multiple-doctors-chip"
                            label="Doctor(s)"
                          />
                        }
                        renderValue={(selected) => (
                          <Typography variant="body2" color="textSecondary">
                            {selected?.length === 0
                              ? "No doctors selected"
                              : selected?.map((doc) => doc?.name).join(", ")
                            }
                          </Typography>
                        )}
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
                        {doctors?.map((doctor) => (
                          <MenuItem
                            key={doctor._id}
                            value={{ id: doctor._id, name: doctor.name }}
                            disabled={currentProcedure.doctorName?.some(
                              (d) => d.id === doctor._id
                            )}
                          >
                            <ListItemText primary={doctor.name} />
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.doctorName && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.doctorName}
                        </Typography>
                      )}
                    </FormControl>

                    {/* Selected Doctors Display */}
                    {currentProcedure.doctorName.length > 0 && (
                      <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {currentProcedure.doctorName.map((doctor) => (
                          <Chip
                            key={doctor?.id || doctor?._id}
                            label={doctor?.name}
                            onDelete={() =>
                              handleDeleteChip("doctorName", doctor?.id || doctor?._id)
                            }
                            onMouseDown={(e) => e.stopPropagation()}
                            deleteIcon={<CloseIcon />}
                            sx={{
                              backgroundColor: colors.greenAccent[600],
                              color: "white",
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Grid>


                </Grid>
              </CardContent>
            </Card>

            {/* Billing & Empanelment Card */}
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: theme.palette.mode === "dark"
                  ? colors.primary[800]
                  : 'white',
                border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <AttachMoneyIcon sx={{ color: colors.orangeAccent[500], fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.primary[500]
                    }}
                  >
                    Billing & Empanelment
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Rates/Charges */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Rates/Charges"
                      name="ratesCharges"
                      value={currentProcedure.ratesCharges}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      error={!!errors.ratesCharges}
                      helperText={errors.ratesCharges}
                      placeholder="₹ Amount"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>

                  {/* Empanelment Type (Multi-select) */}
                  <Grid item xs={12} sm={6}>
                    {/* <FormControl
                      fullWidth
                      size="medium"
                      variant="outlined"
                      error={!!errors.empanelmentType}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    >
                      <InputLabel id="select-empanelment-type-label">
                        Empanelment Type
                      </InputLabel>
                      <Select
                        labelId="select-empanelment-type-label"
                        id="select-empanelment-type"
                        multiple
                        value={currentProcedure.empanelmentType}
                        onChange={(e) => handleMultiSelectChange("empanelmentType", e)}
                        input={
                          <OutlinedInput
                            id="select-multiple-empanelment-chip"
                            label="Empanelment Type"
                          />
                        }
                        renderValue={(selectedTypes) => (
                          <Typography variant="body2" color="textSecondary">
                            {selectedTypes.length === 0
                              ? "No empanelment types selected"
                              : `${selectedTypes.length} empanelment type${selectedTypes.length > 1 ? 's' : ''} selected`
                            }
                          </Typography>
                        )}
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
                        {empanelmentTypesForDropdown.map((type) => (
                          <MenuItem
                            key={type.id}
                            value={type.name}
                            sx={{
                              '&:hover': {
                                backgroundColor: colors.primary[50],
                              }
                            }}
                          >
                            <ListItemText primary={type.name} />
                          </MenuItem>
                        ))}

                      </Select>
                      {errors.empanelmentType && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.empanelmentType}
                        </Typography>
                      )}
                    </FormControl> */}
                    <Autocomplete
                      multiple
                      fullWidth
                      size="small"
                      options={
                        empanelmentType?.map((item) => ({
                          label: item.value,
                          value: item._id,
                        })) || []
                      }
                      value={currentProcedure.empanelmentType || currentProcedure.empanelmentType || []}
                      freeSolo
                      getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label
                      }
                      onChange={(event, newValue) => {
                        const normalized = normalizeSuggestionArray(newValue);
                        setCurrentProcedure((prev) => ({
                          ...prev,
                          empanelmentType: normalized,
                        }));
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const label = normalizeSuggestionValue(option);
                          return (
                            <Chip
                              variant="outlined"
                              label={label}
                              {...getTagProps({ index })}
                              key={index}
                              size="small"
                              sx={{
                                backgroundColor: colors.greenAccent[500],
                                color: "white",
                              }}
                            />
                          );
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Empanelment Type"
                          placeholder="Select or type and press Enter"
                        />
                      )}
                    />
                    {/* <Autocomplete
                      multiple
                      fullWidth
                      size="small"
                      freeSolo
                      options={
                        globalSuggestion?.empanelmentType?.map((item) => ({
                          label: item.value,
                          value: item._id,
                        })) || []
                      }
                      value={currentProcedure.empanelmentType || []}
                      getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label || option.value || ""
                      }
                      onChange={(event, newValue) => {
                        setCurrentProcedure((prev) => ({
                          ...prev,
                          empanelmentType: newValue,
                        }));

                        if (errors.empanelmentType) {
                          setErrors((prev) => ({
                            ...prev,
                            empanelmentType: "",
                          }));
                        }
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const label =
                            typeof option === "string"
                              ? option
                              : option.label || option.value;

                          return (
                            <Chip
                              variant="outlined"
                              label={label}
                              {...getTagProps({ index })}
                              key={index}
                              size="small"
                              sx={{
                                backgroundColor: colors.greenAccent[500],
                                color: "white",
                              }}
                            />
                          );
                        })
                      }

                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Empanelment Type"
                          placeholder="Select or type and press Enter"
                          error={
                            !!errors.empanelmentType &&
                            (currentProcedure.empanelmentType || []).length === 0
                          }
                        />
                      )}

                    /> */}

                    {/* Selected Empanelment Types Display */}
                    {currentProcedure.empanelmentType.length > 0 && (
                      <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {currentProcedure.empanelmentType.map((type, index) => (
                          <Chip
                            key={index}
                            label={typeof type === "string" ? type : type.label || type.value}
                            onDelete={() => {
                              setCurrentProcedure((prev) => ({
                                ...prev,
                                empanelmentType: prev.empanelmentType.filter((item) => item !== type),
                              }));
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            deleteIcon={<CloseIcon />}
                            sx={{
                              backgroundColor: colors.orangeAccent[600],
                              color: "white",
                              "& .MuiChip-deleteIcon": {
                                color: "white",
                                fontSize: "18px",
                                "&:hover": {
                                  color: colors.redAccent[300],
                                },
                              },
                              "&:hover": {
                                backgroundColor: colors.orangeAccent[700],
                              },
                            }}
                            variant="filled"
                          />
                        ))}
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

          </Stack>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          background: theme.palette.mode === "dark"
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
            textTransform: 'none',
            fontWeight: 500,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            borderColor: colors.grey[400],
            color: theme.palette.mode === "dark" ? colors.grey[100] : colors.grey[700],
            '&:hover': {
              borderColor: colors.redAccent[400],
              backgroundColor: colors.redAccent[50],
              color: colors.redAccent[700],
            }
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
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            background: `linear-gradient(135deg, ${colors.greenAccent[500]} 0%, ${colors.greenAccent[600]} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.greenAccent[600]} 0%, ${colors.greenAccent[700]} 100%)`,
              transform: 'translateY(-1px)',
              boxShadow: `0 6px 20px ${colors.greenAccent[300]}40`,
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {loading ? "Saving..." : (procedureData ? "Update Procedure/Surgery" : "Add Procedure/Surgery")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProcedureModal;