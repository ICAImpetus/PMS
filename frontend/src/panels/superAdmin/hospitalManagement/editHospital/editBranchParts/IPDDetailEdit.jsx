import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HotelIcon from '@mui/icons-material/Hotel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { tokens } from '../../../../../theme';

/**
 * AddIpdDetailsModal Component
 *
 * This component serves as a modal for both adding new IPD details and
 * editing existing IPD details. It dynamically adjusts its title and
 * initial form state based on the 'ipdData' prop.
 *
 * Props:
 * - open: Boolean to control the visibility of the modal.
 * - onClose: Function to call when the modal is requested to be closed.
 * - onSave: Function to call when the "Save" button is clicked. It receives
 * the complete IPD details object (new or updated) as an argument.
 * - ipdData: Optional. If provided, the modal will pre-fill the form
 * with this IPD data for editing. If null, it will
 * present an empty form for adding new IPD details.
 */
const AddIpdDetailsModal = ({ open, onClose, onSave, ipdData = null, departments, loading = false, globalSuggestion }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State to manage the form data for the new/edited IPD details
  const [currentIpdDetails, setCurrentIpdDetails] = useState({
    noOfBeds: '',
    charges: '',
    location: '',
    category: '',
    serviceType: '',
    department: '',

  });

  // State for validation errors
  const [errors, setErrors] = useState({});

  // Define static options for service type dropdown
  const serviceTypeOptions = useMemo(() => [
    'General', 'Special'
  ], []);

  // Effect to reset form and errors when modal opens/closes or ipdData changes
  useEffect(() => {
    if (open) {
      if (ipdData) {
        // If ipdData is provided (for editing), initialize with its values
        setCurrentIpdDetails({
          ...ipdData,
          noOfBeds: ipdData.noOfBeds || '',
          charges: ipdData.charges || '',
          location: ipdData.location || '',
          category:
            (typeof ipdData.category === 'object' && ipdData.category?.value)
              ? ipdData.category.value
              : ipdData.category || '',
          serviceType: ipdData.serviceType || '',
          department: ipdData.department || '',
        });
      } else {
        // Otherwise (for adding new), reset to empty initial state
        setCurrentIpdDetails({
          noOfBeds: '',
          charges: '',
          location: '',
          category: '',
          serviceType: '',
          department: '',
        });
      }
      setErrors({}); // Always clear errors on modal open
    }
  }, [open, ipdData]);

  // Handle changes for standard text fields and single selects
  const handleChange = (e) => {
    const { name, value } = e.target;

    setCurrentIpdDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Instant validation for charges field
    if (name === "charges") {
      if (!/^[0-9]*$/.test(value)) {
        setErrors((prev) => ({ ...prev, charges: "Charges must be digits only." }));
      } else if (!value.trim()) {
        setErrors((prev) => ({ ...prev, charges: "Charges are required." }));
      } else {
        setErrors((prev) => ({ ...prev, charges: "" }));
      }
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // --- Validation Logic ---
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    const beds = String(currentIpdDetails?.noOfBeds ?? "").trim();
    const charges = String(currentIpdDetails?.charges ?? "").trim();
    const location = String(currentIpdDetails?.location ?? "").trim();
    const category = String(currentIpdDetails?.category ?? "").trim();
    const serviceType = String(currentIpdDetails?.serviceType ?? "").trim();

    //  Beds
    if (!beds) {
      tempErrors.noOfBeds = "Number of Beds is required.";
      isValid = false;
    } else if (!/^[0-9]+$/.test(beds) || parseInt(beds) <= 0) {
      tempErrors.noOfBeds = "Must be a positive number.";
    } else if (!/^[0-9]+$/.test(beds) || parseInt(beds) <= 0) {
      tempErrors.noOfBeds = "Must be a positive number.";
      isValid = false;
    }

    //  Charges
    if (!charges) {
      tempErrors.charges = "Charges are required.";
      isValid = false;
    } else if (!/^[0-9]+$/.test(charges)) {
      tempErrors.charges = "Charges must be digits only.";
    } else if (!/^[0-9]+$/.test(charges)) {
      tempErrors.charges = "Charges must be digits only.";
      isValid = false;
    }

    //  Location
    if (!location) {
      tempErrors.location = "Location is required.";
      isValid = false;
    }

    //  Category
    if (!category) {
      tempErrors.category = "Category is required.";
      isValid = false;
    }

    //  Service Type
    if (!serviceType) {
      tempErrors.serviceType = "Service Type is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(currentIpdDetails); // Call the onSave prop with the prepared data
      // onClose() will typically be called by the parent after onSave is handled
    } else {
      console.log('Form validation failed.', errors);
    }
  };

  const bedCategory = globalSuggestion?.filter(
    (item) => item?.type === "bedCategory"
  ) || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
          <HotelIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {ipdData ? 'Edit IPD Details' : 'Add IPD Details'}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
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

            {/* Basic IPD Information Card */}
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
                  <HotelIcon sx={{ color: colors.blueAccent[500], fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.primary[500]
                    }}
                  >
                    Bed & Facility Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* No. of Beds */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="No. of Beds"
                      name="noOfBeds"
                      value={currentIpdDetails.noOfBeds}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      error={!!errors.noOfBeds}
                      helperText={errors.noOfBeds}
                      type="number"
                      inputProps={{ min: "0" }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  {/* Charges */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Charges"
                      name="charges"
                      value={currentIpdDetails.charges}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      error={!!errors.charges}
                      helperText={errors.charges}
                      placeholder="₹ Amount per day"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  {/* Location */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={currentIpdDetails.location}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      error={!!errors.location}
                      helperText={errors.location}
                      placeholder="Ward location or floor details"
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

            {/* Category & Service Information Card */}
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
                  <MedicalServicesIcon sx={{ color: colors.greenAccent[500], fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.primary[500]
                    }}
                  >
                    Service Classification
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Category */}
                  <Grid item xs={12} sm={6}>
                    {/* <TextField
                      fullWidth
                      label="Category"
                      name="category"
                      value={currentIpdDetails.category}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      error={!!errors.category}
                      helperText={errors.category}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    /> */}
                    <Autocomplete
                      fullWidth
                      freeSolo
                      options={
                        bedCategory?.map((item) => ({
                          ...item,
                          label: item.value,
                        })) || []
                      }

                      value={currentIpdDetails.category || ''}

                      getOptionLabel={(option) =>
                        typeof option === "string"
                          ? option
                          : option?.value || option?.label || ""
                      }

                      onInputChange={(event, newInputValue) => {
                        setCurrentIpdDetails((prev) => ({
                          ...prev,
                          category: newInputValue,
                        }));
                      }}

                      onChange={(event, newValue) => {
                        setCurrentIpdDetails((prev) => ({
                          ...prev,
                          category:
                            typeof newValue === "object" && newValue !== null
                              ? newValue.value || newValue.label || ""
                              : newValue || "",
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
                  {/* Service Type */}
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      size="medium"
                      variant="outlined"
                      required
                      error={!!errors.serviceType}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    >
                      <InputLabel id="select-service-type-label">Service Type</InputLabel>
                      <Select
                        labelId="select-service-type-label"
                        id="select-service-type"
                        name="serviceType"
                        value={currentIpdDetails.serviceType}
                        onChange={handleChange}
                        label="Service Type"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {serviceTypeOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.serviceType && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.serviceType}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  {/* Department */}
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      size="medium"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    >
                      <InputLabel id="select-dept-label-ipd">Department</InputLabel>
                      <Select
                        labelId="select-dept-label-ipd"
                        id="select-dept-ipd"
                        name="department"
                        value={currentIpdDetails.department}
                        onChange={handleChange}
                        label="Department"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>

                        {departments.map((dept, idx) => {

                          return (
                            <MenuItem key={dept?._id || idx} value={dept?._id}>
                              {dept?.name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
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

          {loading
            ? "Saving..."
            : ipdData
              ? "Update IPD Details"
              : "Add IPD Details"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddIpdDetailsModal;
