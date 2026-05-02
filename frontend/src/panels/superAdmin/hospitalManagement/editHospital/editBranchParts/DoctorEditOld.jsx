import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Chip, // For displaying array items as chips
  IconButton, // For delete icon on chips
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // For chip delete icon
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // For add item button

// Imports for Time Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs'; // Import dayjs for date/time manipulation

const AddDoctorModal = ({ open, onClose, onSave }) => {
  // Initial state for a new doctor, without descriptionOfServices
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    opdNo: '',
    specialties: [],
    timings: { morning: null, evening: null }, // Changed to null for TimePicker initial state
    opdDays: '',
    experience: '',
    contactNumber: '',
    extensionNumber: '',
    paName: '',
    paContactNumber: '',
    consultationCharges: '',
    videoConsultation: { enabled: false, timeSlot: '', charges: '', days: '' },
    teleMedicine: '',
    empanelmentList: [],
    additionalInfo: '',
    isEnabled: true,
  });

  // State for validation errors
  const [errors, setErrors] = useState({});

  // States for temporary input for array fields
  const [currentSpecialtyInput, setCurrentSpecialtyInput] = useState('');
  const [currentEmpanelmentInput, setCurrentEmpanelmentInput] = useState('');

  // Reset form and errors when modal opens/closes
  useEffect(() => {
    if (open) {
      setNewDoctor({
        name: '',
        opdNo: '',
        specialties: [],
        timings: { morning: null, evening: null }, // Reset to null for TimePicker
        opdDays: '',
        experience: '',
        contactNumber: '',
        extensionNumber: '',
        paName: '',
        paContactNumber: '',
        consultationCharges: '',
        videoConsultation: { enabled: false, timeSlot: '', charges: '', days: '' },
        teleMedicine: '',
        empanelmentList: [],
        additionalInfo: '',
        isEnabled: true,
      });
      setErrors({});
      setCurrentSpecialtyInput('');
      setCurrentEmpanelmentInput('');
    }
  }, [open]);

  // Handle changes for standard text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field if user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle changes for nested timings object (TimePicker specific)
  const handleTimingsChange = (newValue, name) => {
    setNewDoctor((prev) => ({
      ...prev,
      timings: {
        ...prev.timings,
        [name]: newValue, // newValue will be a Dayjs object or null
      },
    }));
    // Clear error for this field if user selects a value
    if (errors[`timings.${name}`]) {
      setErrors((prev) => ({ ...prev, [`timings.${name}`]: '' }));
    }
  };

  // Handle changes for nested video consultation object
  const handleVideoConsultationChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNewDoctor((prev) => ({
      ...prev,
      videoConsultation: {
        ...prev.videoConsultation,
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
    // Clear error for this field if user starts typing
    if (errors[`videoConsultation.${name}`]) {
      setErrors((prev) => ({ ...prev, [`videoConsultation.${name}`]: '' }));
    }
  };

  // --- Array (Chip) Input Handlers ---
  const handleAddChip = (field, input, setInput) => {
    if (input.trim() && !newDoctor[field].includes(input.trim())) {
      setNewDoctor((prev) => ({
        ...prev,
        [field]: [...prev[field], input.trim()],
      }));
      setInput(''); // Clear input field
      // Clear error for this field if an item is added
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    }
  };

  const handleDeleteChip = (field, chipToDelete) => {
    setNewDoctor((prev) => ({
      ...prev,
      [field]: prev[field].filter((chip) => chip !== chipToDelete),
    }));
  };

  // --- Validation Logic ---
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    // Required fields
    const requiredFields = [
      'name', 'opdNo', 'opdDays', 'experience', 'contactNumber',
      'consultationCharges', 'teleMedicine', 'additionalInfo'
    ];
    requiredFields.forEach(field => {
      if (!newDoctor[field].trim()) {
        tempErrors[field] = 'This field is required.';
        isValid = false;
      }
    });

    // Nested required fields for timings (check if Dayjs object is valid)
    if (!newDoctor.timings.morning || !dayjs(newDoctor.timings.morning).isValid()) {
      tempErrors['timings.morning'] = 'Morning timing is required.';
      isValid = false;
    }
    // Evening timing is optional, so no validation here

    // Array fields validation (at least one item)
    if (newDoctor.specialties.length === 0) {
      tempErrors.specialties = 'At least one specialty is required.';
      isValid = false;
    }
    if (newDoctor.empanelmentList.length === 0) {
      tempErrors.empanelmentList = 'At least one empanelment type is required.';
      isValid = false;
    }

    // Video consultation fields if enabled
    if (newDoctor.videoConsultation.enabled) {
      if (!newDoctor.videoConsultation.timeSlot.trim()) {
        tempErrors['videoConsultation.timeSlot'] = 'Time slot is required when enabled.';
        isValid = false;
      }
      if (!newDoctor.videoConsultation.charges.trim()) {
        tempErrors['videoConsultation.charges'] = 'Charges are required when enabled.';
        isValid = false;
      }
      if (!newDoctor.videoConsultation.days.trim()) {
        tempErrors['videoConsultation.days'] = 'Days are required when enabled.';
        isValid = false;
      }
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateForm()) {
      // Format Dayjs objects to string before saving
      const doctorToSave = {
        ...newDoctor,
        id: `doc-${Date.now()}`, // Generate a simple ID
        timings: {
          morning: newDoctor.timings.morning ? dayjs(newDoctor.timings.morning).format('HH:mm') : '',
          evening: newDoctor.timings.evening ? dayjs(newDoctor.timings.evening).format('HH:mm') : '',
        },
      };
      onSave(doctorToSave);
      onClose(); // Close modal after saving
    } else {
      console.log('Form validation failed.', errors);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Add New Doctor
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}> {/* Increased spacing for better look */}
            {/* Doctor Basic Info */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">Basic Information</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Doctor Name"
                name="name"
                value={newDoctor.name}
                onChange={handleChange}
                variant="outlined" // Consistent variant
                size="small"
                required // Mark as required
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="OPD No."
                name="opdNo"
                value={newDoctor.opdNo}
                onChange={handleChange}
                variant="outlined"
                size="small"
                required
                error={!!errors.opdNo}
                helperText={errors.opdNo}
              />
            </Grid>

            {/* Specialties Input */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Specialties</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  label="Add Specialty"
                  variant="outlined"
                  size="small"
                  value={currentSpecialtyInput}
                  onChange={(e) => setCurrentSpecialtyInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevent form submission
                      handleAddChip('specialties', currentSpecialtyInput, setCurrentSpecialtyInput);
                    }
                  }}
                  error={!!errors.specialties && newDoctor.specialties.length === 0}
                  helperText={newDoctor.specialties.length === 0 && errors.specialties ? errors.specialties : ''}
                />
                <Button
                  variant="contained"
                  onClick={() => handleAddChip('specialties', currentSpecialtyInput, setCurrentSpecialtyInput)}
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{ textTransform: 'none', borderRadius: '20px' }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {newDoctor.specialties.map((specialty, index) => (
                  <Chip
                    key={index}
                    label={specialty}
                    onDelete={() => handleDeleteChip('specialties', specialty)}
                    deleteIcon={<CloseIcon />}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Timings & OPD Days */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">Availability</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Morning Timings"
                value={newDoctor.timings.morning}
                onChange={(newValue) => handleTimingsChange(newValue, 'morning')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    size: "small",
                    required: true,
                    error: !!errors['timings.morning'],
                    helperText: errors['timings.morning'],
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Evening Timings"
                value={newDoctor.timings.evening}
                onChange={(newValue) => handleTimingsChange(newValue, 'evening')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    size: "small",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="OPD Days"
                name="opdDays"
                value={newDoctor.opdDays}
                onChange={handleChange}
                variant="outlined"
                size="small"
                required
                error={!!errors.opdDays}
                helperText={errors.opdDays}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Experience"
                name="experience"
                value={newDoctor.experience}
                onChange={handleChange}
                variant="outlined"
                size="small"
                required
                error={!!errors.experience}
                helperText={errors.experience}
              />
            </Grid>

            {/* Contact & Charges */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">Contact & Charges</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={newDoctor.contactNumber}
                onChange={handleChange}
                variant="outlined"
                size="small"
                required
                error={!!errors.contactNumber}
                helperText={errors.contactNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Extension Number"
                name="extensionNumber"
                value={newDoctor.extensionNumber}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PA Name"
                name="paName"
                value={newDoctor.paName}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PA Contact Number"
                name="paContactNumber"
                value={newDoctor.paContactNumber}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consultation Charges"
                name="consultationCharges"
                value={newDoctor.consultationCharges}
                onChange={handleChange}
                variant="outlined"
                size="small"
                required
                error={!!errors.consultationCharges}
                helperText={errors.consultationCharges}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tele-Medicine"
                name="teleMedicine"
                value={newDoctor.teleMedicine}
                onChange={handleChange}
                variant="outlined"
                size="small"
                required
                error={!!errors.teleMedicine}
                helperText={errors.teleMedicine}
              />
            </Grid>

            {/* Empanelment List Input */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Empanelment List</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  label="Add Empanelment Type"
                  variant="outlined"
                  size="small"
                  value={currentEmpanelmentInput}
                  onChange={(e) => setCurrentEmpanelmentInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevent form submission
                      handleAddChip('empanelmentList', currentEmpanelmentInput, setCurrentEmpanelmentInput);
                    }
                  }}
                  error={!!errors.empanelmentList && newDoctor.empanelmentList.length === 0}
                  helperText={newDoctor.empanelmentList.length === 0 && errors.empanelmentList ? errors.empanelmentList : ''}
                />
                <Button
                  variant="contained"
                  onClick={() => handleAddChip('empanelmentList', currentEmpanelmentInput, setCurrentEmpanelmentInput)}
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{ textTransform: 'none', borderRadius: '20px' }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {newDoctor.empanelmentList.map((empanelment, index) => (
                  <Chip
                    key={index}
                    label={empanelment}
                    onDelete={() => handleDeleteChip('empanelmentList', empanelment)}
                    deleteIcon={<CloseIcon />}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Additional Info */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Info"
                name="additionalInfo"
                value={newDoctor.additionalInfo}
                onChange={handleChange}
                variant="outlined"
                size="small"
                multiline
                rows={2}
                required
                error={!!errors.additionalInfo}
                helperText={errors.additionalInfo}
              />
            </Grid>

            {/* Video Consultation Section */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: '8px', bgcolor: 'grey.50' }}>
                <Typography variant="subtitle1" gutterBottom color="primary">Video Consultation</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newDoctor.videoConsultation.enabled}
                      onChange={handleVideoConsultationChange}
                      name="enabled"
                    />
                  }
                  label="Enabled"
                />
                {newDoctor.videoConsultation.enabled && (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Time Slot"
                        name="timeSlot"
                        value={newDoctor.videoConsultation.timeSlot}
                        onChange={handleVideoConsultationChange}
                        variant="outlined"
                        size="small"
                        required
                        error={!!errors['videoConsultation.timeSlot']}
                        helperText={errors['videoConsultation.timeSlot']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Charges"
                        name="charges"
                        value={newDoctor.videoConsultation.charges}
                        onChange={handleVideoConsultationChange}
                        variant="outlined"
                        size="small"
                        required
                        error={!!errors['videoConsultation.charges']}
                        helperText={errors['videoConsultation.charges']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Days"
                        name="days"
                        value={newDoctor.videoConsultation.days}
                        onChange={handleVideoConsultationChange}
                        variant="outlined"
                        size="small"
                        required
                        error={!!errors['videoConsultation.days']}
                        helperText={errors['videoConsultation.days']}
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Grid>

            {/* Is Enabled Switch */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newDoctor.isEnabled}
                    onChange={(e) => setNewDoctor((prev) => ({ ...prev, isEnabled: e.target.checked }))}
                    name="isEnabled"
                  />
                }
                label="Doctor Enabled"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="secondary" variant="outlined" sx={{ borderRadius: '20px', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained" sx={{ borderRadius: '20px', textTransform: 'none' }}>
            Save Doctor
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddDoctorModal;
