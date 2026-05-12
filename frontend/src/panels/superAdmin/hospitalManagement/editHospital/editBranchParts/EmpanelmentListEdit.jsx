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
  Checkbox,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PolicyIcon from "@mui/icons-material/Policy";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import GroupIcon from "@mui/icons-material/Group";
import DescriptionIcon from "@mui/icons-material/Description";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { tokens } from "../../../../../theme";
import toast from "react-hot-toast";
import MultiSelectDropdown from "../../../userManagement/components/MultiSelectDropdown";

/**
 * AddEmpanelmentListModal Component
 *
 * A modal for adding or editing Empanelment Policy details.
 * Features multi-select for specialties and doctors, with enhanced UI styling.
 */
const AddEmpanelmentListModal = ({
  open,
  onClose,
  onSave,
  empanelmentData = null,
  availableSpecialties = [],
  availableDoctors = [],
  availableDepartments = [], // New prop for dynamic departments
  loading = false,
  globalSuggestion
}) => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // --- State ---
  const [currentEmpanelment, setCurrentEmpanelment] = useState({
    policyName: "",
    coverageOptions: [],
    additionalRemarks: "",
    typeOfCoverage: "",
  });

  const [suggestions, setSuggestions] = useState({
    treatableAreas: [],
    surgeries: [],
  });

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch("/data/suggestions.json");
        let staticData = { treatableAreas: [], surgeries: [] };
        if (response.ok) {
          staticData = await response.json();
        }

        // Load from localStorage
        const stored = JSON.parse(
          localStorage.getItem("added_suggestions") ||
          '{"treatableAreas": [], "surgeries": []}',
        );

        // Merge and deduplicate (case-insensitive)
        const mergeUnique = (staticArr, storedArr) => {
          const combined = [...(staticArr || []), ...(storedArr || [])];
          const unique = [];
          const seen = new Set();
          combined.forEach((item) => {
            if (item && !seen.has(item.toLowerCase().trim())) {
              seen.add(item.toLowerCase().trim());
              unique.push(item.trim());
            }
          });
          return unique;
        };

        setSuggestions({
          treatableAreas: mergeUnique(
            staticData.treatableAreas,
            stored.treatableAreas,
          ),
          surgeries: mergeUnique(staticData.surgeries, stored.surgeries),
        });
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    };
    if (open) {
      fetchSuggestions();
    }
  }, [open]);

  // State for coverage areas fields
  const [doctorsForSelectedDepartment, setDoctorsForSelectedDepartment] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null); // Single department selection
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedTreatableAreas, setSelectedTreatableAreas] = useState([]);

  // Separate states for single selection
  const [selectedService, setSelectedService] = useState([]);


  const [errors, setErrors] = useState({});
  // Filter available specialties for dropdown (exclude already selected)
  const specialtiesForDropdown = useMemo(() => {
    if (!open) return [];
    const currentSelected = new Set(
      currentEmpanelment.coveringAreasOfSpeciality,
    );
    return availableSpecialties.filter((s) => !currentSelected.has(s));
  }, [
    open,
    availableSpecialties,
    currentEmpanelment.coveringAreasOfSpeciality,
  ]);

  // Filter available doctors for dropdown (exclude already selected)
  // --- Effects ---

  useEffect(() => {
    if (open) {
      if (empanelmentData) {
        // Edit Mode
        setCurrentEmpanelment({
          ...empanelmentData,
          policyName: empanelmentData.policyName || "",
          coverageOptions: empanelmentData.coverageOptions || [],
          additionalRemarks: empanelmentData.additionalRemarks || "",
          typeOfCoverage: empanelmentData.typeOfCoverage || "",
        });
      } else {
        // Add Mode
        setCurrentEmpanelment({
          policyName: "",
          coverageOptions: [],
          additionalRemarks: "",
          typeOfCoverage: "",
        });
      }
      setErrors({});
      // Reset single selection states
      setSelectedService([]);
      // setSelectedDoctor(null);
      setSelectedDepartment(null);
      setSelectedTreatableAreas([]);
    }
  }, [open, empanelmentData]);

  // --- Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmpanelment((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle multi-select changes (Select all/some logic handled by MUI automatically via array)
  const handleMultiSelectChange = (field, event) => {
    const {
      target: { value },
    } = event;
    // On autofill we get a stringified value.
    const newValues = typeof value === "string" ? value.split(",") : value;

    setCurrentEmpanelment((prev) => ({
      ...prev,
      [field]: newValues,
    }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Handle removing a specific chip
  const handleDeleteChip = (field, chipToDeleteValue) => (event) => {
    event.stopPropagation(); // Prevent select dropdown from opening
    setCurrentEmpanelment((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== chipToDeleteValue),
    }));
  };

  useEffect(() => {
    if (!selectedDepartment) {
      setDoctorsForSelectedDepartment(availableDoctors);
    } else {


      const filteredDoctors = availableDoctors.filter(
        (doc) => doc.department?._id === selectedDepartment
      );

      setDoctorsForSelectedDepartment(filteredDoctors);

    }
  }, [selectedDepartment, availableDoctors]);

  // Handle treatable area selection
  const handleTreatableAreaSelection = (area) => {
    setSelectedTreatableAreas((prev) => {
      const isSelected = prev.some((a) => a.id === area.id);
      if (isSelected) {
        return prev.filter((a) => a.id !== area.id);
      } else {
        return [...prev, area];
      }
    });
  };

  // Handle service selection
  const handleServiceSelection = (service) => {
    setSelectedService((prev) => {
      const isSelected = prev.some((s) => s.id === service.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleAddCoverage = () => {
    const doctor = availableDoctors.find(d => d._id === selectedDoctorId);
    const department = availableDepartments.find(d => d._id === selectedDepartment);

    const newCoverage = {
      doctor: {
        name: doctor?.name,
        _id: doctor?._id
      },
      service: selectedService,
      department: {
        name: department?.name || selectedDepartment?.departmentName,
        _id: department?._id || selectedDepartment?.id,
      },
      treatableAreas: [...selectedTreatableAreas],
    };

    setCurrentEmpanelment((prev) => ({
      ...prev,
      coverageOptions: [...prev.coverageOptions, newCoverage],
    }));
    setSelectedDepartment(null);
    setSelectedService([])
    setSelectedDoctorId(null);
    setSelectedTreatableAreas([]);
  };

  // Remove coverage option
  const handleRemoveCoverage = (coverageId) => {
    setCurrentEmpanelment((prev) => ({
      ...prev,
      coverageOptions: prev.coverageOptions.filter((c, i) => i !== coverageId),
    }));
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!currentEmpanelment.policyName.trim()) {
      tempErrors.policyName = "Policy Name is required.";
      isValid = false;
    }
    if (!currentEmpanelment.typeOfCoverage) {
      tempErrors.typeOfCoverage = "Type of Coverage is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...currentEmpanelment,
      });
    }
    setCurrentEmpanelment({
      policyName: "",
      coverageOptions: [],
      additionalRemarks: "",
      typeOfCoverage: "",
    });


  };

  const typeOfCoverageOptions = [
    "Cashless",
    "Reimbursement",
    "Government Rates",
    "Corporate Tie-up",
    "Other",
  ];

  const services = [
    { _id: "IPD", name: "IPD" },
    { _id: "OPD", name: "OPD" },
    { _id: "IPD_OPD", name: "IPD & OPD" },
  ];
  // --- Render ---
  const speciality = globalSuggestion?.filter(
    (item) => item?.type === "speciality"
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
          <PolicyIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {empanelmentData
              ? "Edit Empanelment Policy"
              : "Add New Empanelment Policy"}
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
            {/* Card 1: Basic Information */}
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
                  <PolicyIcon
                    sx={{ color: colors.blueAccent[500], fontSize: 24 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: colors.primary[500] }}
                  >
                    Policy Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Policy Name"
                      name="policyName"
                      value={currentEmpanelment.policyName}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      error={!!errors.policyName}
                      helperText={errors.policyName}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl
                      fullWidth
                      required
                      error={!!errors.typeOfCoverage}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    >
                      <InputLabel>Type of Coverage</InputLabel>
                      <Select
                        label="Type of Coverage"
                        name="typeOfCoverage"
                        value={currentEmpanelment.typeOfCoverage}
                        onChange={handleChange}
                      >
                        {typeOfCoverageOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.typeOfCoverage && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.5 }}
                        >
                          {errors.typeOfCoverage}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {currentEmpanelment.typeOfCoverage === "Other" && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Remarks"
                        name="remarks"
                        value={currentEmpanelment.remarks || ""}
                        onChange={handleChange}
                        variant="outlined"
                        multiline
                        rows={3}
                        placeholder="Enter details for other type of coverage..."
                        error={!!errors.remarks}
                        helperText={errors.remarks}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Card 2: Coverage Areas */}
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
                    Coverage Areas
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Types of Services Field */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Types of Services</InputLabel>
                      <Select
                        label="Types of Services"
                        multiple
                        value={selectedService}
                        onChange={(e) => {
                          setSelectedService(e.target.value);
                        }}
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {selected.map((value) => (
                              <Chip
                                key={value}
                                label={
                                  services.find((s) => s._id === value)?.name ||
                                  value
                                }
                                size="small"
                                sx={{
                                  bgcolor: colors.blueAccent[100],
                                  color: colors.blueAccent[800],
                                }}
                              />
                            ))}
                          </Box>
                        )}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      >
                        {services.map((service) => (
                          <MenuItem key={service._id} value={service._id}>
                            {service.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Departments Field */}


                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Department</InputLabel>
                      <Select
                        value={selectedDepartment}
                        onChange={(e) => {
                          const deptId = e.target.value;

                          setSelectedDepartment(deptId);
                          setSelectedDoctorId(""); // reset doctor
                        }}
                        label="Select Department"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>

                        {availableDepartments.map((department) => (
                          <MenuItem key={department._id} value={department._id}>
                            {department.name || department.departmentName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Doctor</InputLabel>
                      <Select
                        value={selectedDoctorId}
                        onChange={(e) => {
                          const doctorId = e.target.value;

                          setSelectedDoctorId(doctorId);

                          const doctor = availableDoctors.find(
                            (d) => d._id === doctorId
                          );

                          if (!selectedDepartment && doctor?.department) {
                            setSelectedDepartment(doctor.department?._id);
                          }
                        }}
                        label="Select Doctor"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>

                        {doctorsForSelectedDepartment.map((doctor) => (
                          <MenuItem key={doctor._id} value={doctor._id}>
                            {doctor.name} {doctor.opdNo ? `(${doctor.opdNo})` : ""}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Treatable Areas Field */}
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      multiple
                      fullWidth
                      size="small"
                      options={
                        speciality?.map((item) => ({
                          label: item.value,
                          value: item._id,
                        })) || []
                      }
                      value={selectedTreatableAreas || []}
                      freeSolo
                      getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label
                      }
                      onChange={(event, newValue) => {
                        setSelectedTreatableAreas(newValue);

                        if (errors.treatableAreas) {
                          setErrors((prev) => ({
                            ...prev,
                            treatableAreas: "",
                          }));
                        }
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={typeof option === "string" ? option : option.label}
                            {...getTagProps({ index })}
                            key={index}
                            size="small"
                            sx={{
                              backgroundColor: colors.greenAccent[500],
                              color: "white",
                            }}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Treatable Areas"
                          placeholder="Select or type and press Enter"
                          error={
                            !!errors.treatableAreas &&
                            (selectedTreatableAreas || []).length === 0
                          }
                        />
                      )}
                    />
                  </Grid>

                  {/* Add Coverage Button */}
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handleAddCoverage}
                      disabled={!selectedDoctorId}
                      startIcon={<AddCircleOutlineIcon />}
                      sx={{
                        mb: 2,
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        py: 1.2,
                        background: `linear-gradient(135deg, ${colors.blueAccent[500]} 0%, ${colors.blueAccent[600]} 100%)`,
                        "&:hover": {
                          background: `linear-gradient(135deg, ${colors.blueAccent[600]} 0%, ${colors.blueAccent[700]} 100%)`,
                          transform: "translateY(-2px)",
                          boxShadow: `0 8px 25px ${colors.blueAccent[300]}40`,
                        },
                        "&:disabled": {
                          background: `${colors.grey[300]}`,
                          color: `${colors.grey[500]}`,
                          transform: "none",
                          boxShadow: "none",
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: `0 4px 15px ${colors.blueAccent[300]}30`,
                      }}
                    >
                      Add Coverage Option
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {(currentEmpanelment?.coverageOptions || []).length > 0 && (
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  background:
                    theme.palette.mode === "dark"
                      ? colors.primary[800]
                      : "white",
                  border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
                  mt: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <MedicalServicesIcon
                      sx={{ color: colors.blueAccent[500], fontSize: 24 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: colors.primary[500] }}
                    >
                      Coverage Areas Added
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {/* {console.log("Coverage Options:", currentEmpanelment?.coverageOptions)} */}

                    {currentEmpanelment?.coverageOptions.map(
                      (coverage, index) => (
                        <Grid item xs={12} key={coverage.id}>
                          <Box
                            sx={{
                              p: 2,
                              border: `1px solid ${colors.grey[300]}`,
                              borderRadius: 2,
                              bgcolor: colors.grey[50],
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600 }}
                              >
                                Coverage {index + 1}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveCoverage(index)}
                                color="error"
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Services:</strong>{" "}
                              {coverage?.service?.join(",") || "No services"}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Doctors:</strong> {coverage?.doctor?.name}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Departments:</strong>{" "}
                              {coverage.department?.name}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Treatable Areas:</strong>{" "}
                              {coverage?.treatableAreas
                                ?.map((a) => (typeof a === "string" ? a : a.label || a.value))
                                .join(", ") || "No areas"}
                            </Typography>
                          </Box>
                        </Grid>
                      ),
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}
            {/* Card 4: Additional Information */}
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
                  <DescriptionIcon
                    sx={{ color: colors.blueAccent[500], fontSize: 24 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: colors.primary[500] }}
                  >
                    Additional Information
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Additional Remarks"
                  name="additionalRemarks"
                  value={currentEmpanelment.additionalRemarks}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </DialogContent>

      {/* Actions */}
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
            : empanelmentData
              ? "Update Policy"
              : "Add Policy"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEmpanelmentListModal;