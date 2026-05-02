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
  useTheme,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Autocomplete,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import ScheduleIcon from "@mui/icons-material/Schedule";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import { tokens } from "../../../../../theme";

// Define static options for time slots and service types outside the component
const staticAvailableTimeSlots = [
  "Morning (9 AM - 1 PM)",
  "Afternoon (1 PM - 5 PM)",
  "Evening (5 PM - 9 PM)",
  "Full Day (9 AM - 5 PM)",
  "Night (9 PM - 9 AM)",
];

const staticAvailableServiceTypes = [
  "OPD",
  "IPD",
  "Emergency",
  "Discharge",
  "Lab Services",
  "Pharmacy Services",
  "Consultation",
  "Admission",
];


const AddDepartmentInchargeModal = ({
  open,
  onClose,
  onSave,
  inchargeData = null,
  availableDepartments = [],
  loading = false,
  globalSuggestion
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  // State to manage the form data for the new/edited incharge
  const [currentIncharge, setCurrentIncharge] = useState({
    name: "",
    extensionNo: "",
    contactNo: "",
    department: "",
    timeSlot: { from: null, to: null },
    serviceType: "",
  });

  const [suggestions, setSuggestions] = useState({
    treatableAreas: [],
    surgeries: [],
  });

  // State for validation errors
  const [errors, setErrors] = useState({});

  // Effect to reset form and errors when modal opens/closes or inchargeData changes
  useEffect(() => {
    if (open) {
      if (inchargeData) {
        // If inchargeData is provided (for editing), initialize with its values
        setCurrentIncharge({
          ...inchargeData,
          name: inchargeData.name || "",
          extensionNo: inchargeData.extensionNo || "",
          contactNo: inchargeData.contactNo || "",
          department: inchargeData.department || "",
          timeSlot: {
            from: inchargeData.timeSlot?.from ? dayjs(inchargeData.timeSlot.from, "HH:mm") : null,
            to: inchargeData.timeSlot?.to ? dayjs(inchargeData.timeSlot.to, "HH:mm") : null,
          },
          serviceType: inchargeData.serviceType || "",
          _id: inchargeData._id || null, // Keep the ID for updates
        });
      } else {
        // Otherwise (for adding new), reset to empty initial state
        setCurrentIncharge({
          name: "",
          extensionNo: "",
          contactNo: "",
          department: "",
          timeSlot: { from: null, to: null },
          serviceType: "",
        });
      }
      setErrors({}); // Always clear errors on modal open
    }
  }, [open, inchargeData]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch("/data/suggestions.json");
        let staticData = { treatableAreas: [], surgeries: [], service_types: [], floor_department: [] };
        if (response.ok) {
          staticData = await response.json();
        }

        // Load from localStorage
        const stored = JSON.parse(
          localStorage.getItem("added_suggestions") ||
          '{"treatableAreas": [], "surgeries": [], "service_types": [], "floor_department": []}',
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
          serviceTypes: mergeUnique(staticData.service_types, stored.service_types),
          floorDepartments: mergeUnique(staticData.floor_department, stored.floor_department),
        });
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    };
    if (open) {
      fetchSuggestions();
    }
  }, [open]);

  // Handle changes for standard text fields and single selects
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contactNo") {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setCurrentIncharge((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      if (numericValue.length > 0 && numericValue.length !== 10) {
        setErrors((prev) => ({
          ...prev,
          contactNo: "Contact Number must be exactly 10 digits.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, contactNo: "" }));
      }
    } else {
      setCurrentIncharge((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  // --- Validation Logic ---
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!currentIncharge.name.trim()) {
      tempErrors.name = "Incharge Name is required.";
      isValid = false;
    }
    if (!currentIncharge.contactNo.trim()) {
      tempErrors.contactNo = "Contact Number is required.";
      isValid = false;
    } else if (!/^\d{10}$/.test(currentIncharge.contactNo.trim())) {
      tempErrors.contactNo = "Contact Number must be 10 digits.";
      isValid = false;
    }
    if (!currentIncharge.timeSlot.from) {
      tempErrors.timeSlot = "From time is required.";
      isValid = false;
    }
    if (!currentIncharge.timeSlot.to) {
      tempErrors.timeSlot = "To time is required.";
      isValid = false;
    }
    // serviceType is optional based on current structure but can be made required if needed.
    // if (!currentIncharge.serviceType.trim()) {
    //   tempErrors.serviceType = 'Service Type is required.';
    //   isValid = false;
    // }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateForm()) {

      // 👉 Service Type ko suggestions me add karna
      const stored = JSON.parse(
        localStorage.getItem("added_suggestions") ||
        '{"treatableAreas": [], "surgeries": [], "service_types": [], "floor_department": []}',
      );

      const newServiceType = currentIncharge.serviceType;
      const newDepartment = currentIncharge.department;

      if (newServiceType) {
        stored.service_types = [
          ...new Set([...(stored.service_types || []), newServiceType])
        ];

        localStorage.setItem("added_suggestions", JSON.stringify(stored));
      }

      if (newDepartment) {
        stored.floor_department = [
          ...new Set([...(stored.floor_department || []), newDepartment])
        ];
        localStorage.setItem("added_suggestions", JSON.stringify(stored));
      }


      const inchargeToSave = {
        ...currentIncharge,
        timeSlot: {
          from: currentIncharge.timeSlot.from
            ? currentIncharge.timeSlot.from.format("HH:mm")
            : "",
          to: currentIncharge.timeSlot.to
            ? currentIncharge.timeSlot.to.format("HH:mm")
            : "",
        }
      };

      onSave(inchargeToSave);

    } else {
      console.log("Form validation failed.", errors);
    }
  };

  const department = globalSuggestion?.filter(
    (item) => item?.type === "department"
  ) || [];
  const serviceType = globalSuggestion?.filter(
    (item) => item?.type === "serviceType"
  ) || [];
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            {inchargeData
              ? "Edit Department Incharge"
              : "Add New Department Incharge"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
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

      <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              {/* Basic Information Card */}
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
                    <PersonIcon
                      sx={{ color: colors.blueAccent[500], fontSize: 24 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary[500],
                      }}
                    >
                      Basic Information
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Incharge Name"
                        name="name"
                        value={currentIncharge.name}
                        onChange={handleChange}
                        variant="outlined"
                        size="medium"
                        required
                        error={!!errors.name}
                        helperText={errors.name}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Contact No."
                        name="contactNo"
                        value={currentIncharge.contactNo}
                        onChange={handleChange}
                        onBlur={() => {
                          const contact = currentIncharge.contactNo.trim();
                          if (!contact) {
                            setErrors((prev) => ({
                              ...prev,
                              contactNo: "Contact Number is required.",
                            }));
                          } else if (!/^\d{10}$/.test(contact)) {
                            setErrors((prev) => ({
                              ...prev,
                              contactNo:
                                "Contact Number must be exactly 10 digits.",
                            }));
                          } else {
                            setErrors((prev) => ({ ...prev, contactNo: "" }));
                          }
                        }}
                        variant="outlined"
                        size="medium"
                        required
                        error={!!errors.contactNo}
                        helperText={errors.contactNo}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Extension No."
                        name="extensionNo"
                        value={currentIncharge.extensionNo}
                        onChange={handleChange}
                        variant="outlined"
                        size="medium"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Department & Service Information Card */}
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
                      sx={{
                        fontWeight: 600,
                        color: colors.primary[500],
                      }}
                    >
                      Department & Service Information
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        fullWidth
                        freeSolo
                        options={
                          department?.map((item) => ({
                            ...item,
                            label: item.value,
                          })) || []
                        }

                        value={currentIncharge.department || null}

                        getOptionLabel={(option) =>
                          typeof option === "string" ? option : option?.value || ""
                        }

                        onInputChange={(event, newInputValue) => {
                          setCurrentIncharge((prev) => ({
                            ...prev,
                            department: {
                              ...prev.department,
                              value: newInputValue,
                            },
                          }));
                        }}

                        onChange={(event, newValue) => {
                          setCurrentIncharge((prev) => ({
                            ...prev,
                            department: newValue,
                          }));
                        }}

                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Department Name"
                            placeholder="Select or type"
                          />
                        )}
                      />

                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        fullWidth
                        freeSolo
                        options={
                          serviceType?.map((item) => ({
                            ...item,
                            label: item.value,
                          })) || []
                        }

                        value={currentIncharge.serviceType || null}

                        getOptionLabel={(option) =>
                          typeof option === "string" ? option : option?.value || ""
                        }

                        onInputChange={(event, newInputValue) => {
                          setCurrentIncharge((prev) => ({
                            ...prev,
                            serviceType: {
                              ...prev.serviceType,
                              value: newInputValue,
                            },
                          }));
                        }}

                        onChange={(event, newValue) => {
                          setCurrentIncharge((prev) => ({
                            ...prev,
                            serviceType: newValue,
                          }));
                        }}

                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Service Type"
                            placeholder="Select or type"
                          />
                        )}
                      />

                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Schedule Information Card */}
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
                    <ScheduleIcon
                      sx={{ color: colors.blueAccent[500], fontSize: 24 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary[500],
                      }}
                    >
                      Schedule Information
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TimePicker
                        label="From"
                        value={currentIncharge.timeSlot.from}
                        onChange={(newValue) =>
                          setCurrentIncharge((prev) => ({
                            ...prev,
                            timeSlot: { ...prev.timeSlot, from: newValue },
                          }))
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: "outlined",
                            size: "medium",
                            error: !!errors.timeSlot,
                            helperText: errors.timeSlot,
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TimePicker
                        label="To"
                        value={currentIncharge.timeSlot.to}
                        onChange={(newValue) =>
                          setCurrentIncharge((prev) => ({
                            ...prev,
                            timeSlot: { ...prev.timeSlot, to: newValue },
                          }))
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: "outlined",
                            size: "medium",
                            error: !!errors.timeSlot,
                            helperText: errors.timeSlot,
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </DialogContent>
      </LocalizationProvider>

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
            py: 1.5,
            fontSize: "1rem",
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
            py: 1.5,
            fontSize: "1rem",
            background: `linear-gradient(135deg, ${colors.greenAccent[500]} 0%, ${colors.greenAccent[600]} 100%)`,
            "&:hover": {
              background: `linear-gradient(135deg, ${colors.greenAccent[600]} 0%, ${colors.greenAccent[700]} 100%)`,
              transform: "translateY(-1px)",
              boxShadow: `0 6px 20px ${colors.greenAccent[300]}40`,
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          {loading ? "Saving..." : inchargeData ? "Update Incharge" : "Add Incharge"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDepartmentInchargeModal;
