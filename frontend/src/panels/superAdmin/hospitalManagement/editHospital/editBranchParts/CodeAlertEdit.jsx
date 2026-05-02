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
  Switch,
  Card,
  CardContent,
  Stack,
  useTheme,
  CircularProgress,
  FormLabel,
  FormHelperText,
} from "@mui/material";
// ... (rest of imports remain same)
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import CampaignIcon from "@mui/icons-material/Campaign";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PeopleIcon from "@mui/icons-material/People";
import SimpleTimePicker from "../../../../../components/customComponents/SimpleTimePicker";
import { tokens } from "../../../../../theme";

/**
 * AddCodeAnnouncementModal Component
 *
 * This component serves as a modal for both adding new code announcement details and
 * editing existing code announcement details.
 *
 * Props:
 * - open: Boolean to control the visibility of the modal.
 * - onClose: Function to call when the modal is requested to be closed.
 * - onSave: Function to call when the "Save" button is clicked.
 * - announcementData: Optional. Pre-fill data for editing.
 * - loading: Boolean to show loader.
 */
const AddCodeAnnouncementModal = ({
  open,
  onClose,
  onSave,
  announcementData = null,
  loading = false,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State to manage the form data for the new/edited announcement
  const [currentAnnouncement, setCurrentAnnouncement] = useState({
    name: "",
    color: "#000000",
    description: "",
    concernedPerson: "",
    staff: [],
    shortCode: "",
    timeAvailability: "",
    enabled: false,
  });

  // State for validation errors
  const [errors, setErrors] = useState({});

  // Define static options for dropdowns
  const timeAvailabilityOptions = useMemo(
    () => ["24/7", "Mon-Fri, 9-5", "Weekends, 10-4", "Custom"],
    [],
  );

  const staffShiftOptions = useMemo(() => ["Morning", "Evening", "Night"], []);

  // Effect to reset form and errors when modal opens/closes or announcementData changes
  useEffect(() => {
    if (open) {
      if (announcementData) {
        // If announcementData is provided (for editing), initialize with its values
        // normalize staff objects: backend returns {staffId,...} but update API
        // expects items to have an `id` field so that it can map to staffId again
        const normalizedStaff = (announcementData.staff || []).map((s) => ({
          id: s.id || s.staffId || Date.now(),
          name: s.name || "",
          shift: s.shift || "",
          contactNo: s.contactNo || "",
        }));
        setCurrentAnnouncement({
          ...announcementData,
          name: announcementData.name || "",
          color: announcementData.color || "#000000",
          description: announcementData.description || "",
          concernedPerson: announcementData.concernedPerson || "",
          staff: normalizedStaff,
          shortCode: announcementData.shortCode || "",
          timeAvailability: announcementData.timeAvailability || "",
          enabled: announcementData.enabled || false, // Ensure boolean default
        });
      } else {
        // Otherwise (for adding new), reset to empty initial state
        setCurrentAnnouncement({
          name: "",
          color: "#000000",
          description: "",
          concernedPerson: "",
          staff: [],
          shortCode: "",
          timeAvailability: "",
          enabled: false,
        });
      }
      setErrors({}); // Always clear errors on modal open
    }
  }, [open, announcementData]);

  // Handle changes for standard text fields and single selects
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentAnnouncement((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field if user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle adding a new staff member
  const handleAddStaff = () => {
    setCurrentAnnouncement((prev) => ({
      ...prev,
      staff: [
        ...prev.staff,
        { id: Date.now(), name: "", shift: "", contactNo: "" }, // Add a unique ID for React keys
      ],
    }));
  };

  // Handle changes for individual staff member fields
  const handleStaffChange = (index, e) => {
    const { name, value } = e.target;
    setCurrentAnnouncement((prev) => {
      const newStaff = [...prev.staff];
      let finalValue = value;
      if (name === "contactNo") {
        finalValue = value.replace(/\D/g, "").slice(0, 10);
      }
      newStaff[index] = { ...newStaff[index], [name]: finalValue };
      return {
        ...prev,
        staff: newStaff,
      };
    });
  };

  // Handle deleting a staff member
  const handleDeleteStaff = (index) => {
    setCurrentAnnouncement((prev) => {
      const newStaff = prev.staff.filter((_, i) => i !== index);
      return {
        ...prev,
        staff: newStaff,
      };
    });
  };

  // --- Validation Logic ---
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!currentAnnouncement.name.trim()) {
      tempErrors.name = "Name is required.";
      isValid = false;
    }
    if (!currentAnnouncement.shortCode.trim()) {
      tempErrors.shortCode = "Short Code is required.";
      isValid = false;
    }
    if (!currentAnnouncement.color.trim()) {
      tempErrors.color = "Color is required.";
      isValid = false;
    }
    if (!currentAnnouncement.timeAvailability.trim()) {
      tempErrors.timeAvailability = "Time Availability is required.";
      isValid = false;
    }

    // Validate each staff member
    currentAnnouncement.staff.forEach((staffMember, index) => {
      if (!staffMember.name.trim()) {
        tempErrors[`staff[${index}].name`] = "Staff Name is required.";
        isValid = false;
      }
      if (!staffMember.shift.trim()) {
        tempErrors[`staff[${index}].shift`] = "Shift is required.";
        isValid = false;
      }
      if (!staffMember.contactNo.trim()) {
        tempErrors[`staff[${index}].contactNo`] = "Contact No. is required.";
        isValid = false;
      } else if (!/^\d{10}$/.test(staffMember.contactNo.trim())) {
        tempErrors[`staff[${index}].contactNo`] =
          "Contact No. must be 10 digits.";
        isValid = false;
      }
    });

    setErrors(tempErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateForm()) {
      // ensure outgoing staff items include id property for server mapping
      const dataToSend = {
        ...currentAnnouncement,
        staff: currentAnnouncement.staff.map((s) => ({
          id: s.id || s.staffId || Date.now(),
          name: s.name,
          shift: s.shift,
          contactNo: s.contactNo,
        })),
      };
      onSave(dataToSend);
      // Call the onSave prop with the prepared data
    } else {
      console.log("Form validation failed.", errors);
    }
  };

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
          <CampaignIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {announcementData
              ? "Edit Code Announcement"
              : "Add New Code Announcement"}
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
                  <CampaignIcon
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
                  {/* Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Announcement Name"
                      name="name"
                      value={currentAnnouncement.name}
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
                  {/* Short Code */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Short Code"
                      name="shortCode"
                      value={currentAnnouncement.shortCode}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      error={!!errors.shortCode}
                      helperText={errors.shortCode}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  {/* Color */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Color (Hex or Name)"
                      name="color"
                      value={currentAnnouncement.color}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      error={!!errors.color}
                      helperText={errors.color}
                      type="color"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  {/* Time Availability */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.timeAvailability}>
                      <FormLabel sx={{ mb: 1, fontWeight: 500 }}>
                        Time Availability *
                      </FormLabel>

                      <SimpleTimePicker
                        value={currentAnnouncement.timeAvailability}
                        onChange={(newValue) =>
                          setCurrentAnnouncement((prev) => ({
                            ...prev,
                            timeAvailability: newValue,
                          }))
                        }
                      />

                      <FormHelperText>
                        {errors.timeAvailability || "Select time in AM/PM format"}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                  {/* Concerned Person */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Raised By"
                      name="concernedPerson"
                      value={currentAnnouncement.concernedPerson}
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
                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={currentAnnouncement.description}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      multiline
                      rows={3}
                      placeholder="Detailed announcement description..."
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  {/* Enabled Switch */}
                  {/* <Grid item xs={12}>
                    <Card
                      sx={{
                        background:
                          theme.palette.mode === "dark"
                            ? colors.primary[900]
                            : colors.primary[800],
                        border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[600] : colors.grey[300]}`,
                        borderRadius: 2,
                      }}
                    >
                      <CardContent
                        sx={{ py: 2, px: 3, "&:last-child": { pb: 2 } }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <ScheduleIcon
                              sx={{
                                color: colors.greenAccent[500],
                                fontSize: 20,
                              }}
                            />
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              Enable Announcement
                            </Typography>
                          </Box>
                          <Switch
                            checked={currentAnnouncement.enabled}
                            onChange={handleChange}
                            name="enabled"
                            color="primary"
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: colors.greenAccent[500],
                                "&:hover": {
                                  backgroundColor: `${colors.greenAccent[500]}20`,
                                },
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                backgroundColor: colors.greenAccent[500],
                              },
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid> */}
                </Grid>
              </CardContent>
            </Card>

            {/* Staff Members Card */}
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
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <PeopleIcon
                      sx={{ color: colors.orangeAccent[500], fontSize: 24 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary[500],
                      }}
                    >
                      Staff Members
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddStaff}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      background: `linear-gradient(135deg, ${colors.greenAccent[500]} 0%, ${colors.greenAccent[600]} 100%)`,
                      "&:hover": {
                        background: `linear-gradient(135deg, ${colors.greenAccent[600]} 0%, ${colors.greenAccent[700]} 100%)`,
                        transform: "translateY(-1px)",
                        boxShadow: `0 4px 12px ${colors.greenAccent[300]}40`,
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    Add Staff
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  {currentAnnouncement.staff.length === 0 && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 4,
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? colors.primary[900]
                              : colors.grey[100],
                          borderRadius: 2,
                          border: `2px dashed ${theme.palette.mode === "dark" ? colors.primary[600] : colors.grey[300]}`,
                        }}
                      >
                        <PeopleIcon
                          sx={{
                            fontSize: 48,
                            color: colors.grey[500],
                            mb: 2,
                          }}
                        />
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          No staff members added yet.
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Click "Add Staff" to assign team members to this
                          announcement.
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {currentAnnouncement.staff.map((staffMember, index) => (
                    <Grid item xs={12} key={staffMember.id || index}>
                      <Card
                        elevation={2}
                        sx={{
                          borderRadius: 2,
                          background:
                            theme.palette.mode === "dark"
                              ? colors.primary[900]
                              : colors.grey[50],
                          border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[600] : colors.grey[300]}`,
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow:
                              theme.palette.mode === "dark"
                                ? "0 8px 25px -8px rgba(0, 0, 0, 0.4)"
                                : "0 8px 25px -8px rgba(0, 0, 0, 0.1)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                color: colors.primary[500],
                              }}
                            >
                              Staff Member #{index + 1}
                            </Typography>
                            <IconButton
                              onClick={() => handleDeleteStaff(index)}
                              size="small"
                              sx={{
                                color: colors.redAccent[500],
                                "&:hover": {
                                  backgroundColor: `${colors.redAccent[500]}20`,
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Staff Name"
                                name="name"
                                value={staffMember.name}
                                onChange={(e) => handleStaffChange(index, e)}
                                variant="outlined"
                                size="medium"
                                required
                                error={!!errors[`staff[${index}].name`]}
                                helperText={errors[`staff[${index}].name`]}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <FormControl
                                fullWidth
                                size="medium"
                                variant="outlined"
                                required
                                error={!!errors[`staff[${index}].shift`]}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                  },
                                }}
                              >
                                <InputLabel>Shift</InputLabel>
                                <Select
                                  name="shift"
                                  value={staffMember.shift}
                                  onChange={(e) => handleStaffChange(index, e)}
                                  label="Shift"
                                >
                                  <MenuItem value="">
                                    <em>None</em>
                                  </MenuItem>
                                  {staffShiftOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                      {option}
                                    </MenuItem>
                                  ))}
                                </Select>
                                {errors[`staff[${index}].shift`] && (
                                  <Typography
                                    variant="caption"
                                    color="error"
                                    sx={{ mt: 0.5, ml: 1.5 }}
                                  >
                                    {errors[`staff[${index}].shift`]}
                                  </Typography>
                                )}
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Contact No."
                                name="contactNo"
                                value={staffMember.contactNo}
                                onChange={(e) => handleStaffChange(index, e)}
                                variant="outlined"
                                size="medium"
                                required
                                error={!!errors[`staff[${index}].contactNo`]}
                                helperText={errors[`staff[${index}].contactNo`]}
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
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </DialogContent>

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
          {loading
            ? "Saving..."
            : announcementData
              ? "Update Announcement"
              : "Add Announcement"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCodeAnnouncementModal;
