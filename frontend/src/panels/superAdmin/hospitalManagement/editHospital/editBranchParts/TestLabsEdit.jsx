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
  Checkbox,
  useTheme,
  Card,
  CardContent,
  Stack,
  ListItemText,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ScienceIcon from "@mui/icons-material/Science";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import { tokens } from "../../../../../theme";

/**
 * AddTestLabModal Component
 *
 * This component serves as a modal for both adding new test lab details and
 * editing existing test lab details. It dynamically adjusts its title and
 * initial form state based on the 'testLabData' prop.
 *
 * Props:
 * - open: Boolean to control the visibility of the modal.
 * - onClose: Function to call when the modal is requested to be closed.
 * - onSave: Function to call when the "Save" button is clicked.
 * - testLabData: Optional. Pre-fill data for editing.
 * - loading: Boolean to show loader.
 */
const AddTestLabModal = ({
  open,
  onClose,
  onSave,
  testLabData = null,
  departmentOptions,
  loading = false,
  globalSuggestion
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State to manage the form data for the new/edited test lab
  const [currentTestLab, setCurrentTestLab] = useState({
    location: "",
    testCode: "",
    testName: "",
    testType: "", // Generic or Package
    packageTests: "", // For Package type - comma separated
    department: "", // New field for department
    serviceGroup: "",
    serviceCharge: null,
    floor: "",
    description: "",
    precaution: "",
    categoryApplicability: [], // Array to hold multiple categories
    tatReport: "",
    serviceTime: "", // New field for service time
    source: "", // In/Out
    remarks: "",
  });

  // State for lab test list (for future suggestions)
  const [labTestList, setLabTestList] = useState([]);

  // State for validation errors
  const [errors, setErrors] = useState({});

  const normalizeServiceGroup = (value) => {
    if (!value && value !== 0) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "object") {
      if (value._id) return value._id;
      if (value.value) return value.value;
      if (value.label) return value.label;
      if (value.name) return value.name;
    }
    return "";
  };

  // State for source remarks
  const [sourceRemarks, setSourceRemarks] = useState({
    inhouse: "",
    outsourcing: "",
  });

  // Define available options for multi-selects and single selects
  const availableCategories = useMemo(
    () => ["TPA", "Cash", "Insurance", "Government", "Corporate"],
    [],
  );

  const sourceOptions = useMemo(() => ["Inhouse", "Outsourcing"], []);

  const testTypeOptions = useMemo(() => ["Generic", "Package"], []);

  // Memoized list of categories to display in the dropdown (excluding selected ones)
  const categoriesForDropdown = useMemo(() => {
    if (!open) return [];
    const currentSelectedCategories = new Set(
      currentTestLab.categoryApplicability,
    );
    return availableCategories.filter(
      (category) => !currentSelectedCategories.has(category),
    );
  }, [open, availableCategories, currentTestLab.categoryApplicability]);

  // Effect to reset form and errors when modal opens/closes or testLabData changes
  useEffect(() => {
    if (open) {
      if (testLabData) {
        // If testLabData is provided (for editing), initialize with its values
        setCurrentTestLab({
          ...testLabData,
          location: testLabData.location || "",
          testCode: testLabData.testCode || "",
          testName: testLabData.testName || "",
          testType: testLabData.testType || "",
          packageTests: testLabData.packageTests || "",
          department: testLabData.department || "",
          serviceGroup: testLabData.serviceGroup || {},
          serviceCharge: testLabData.serviceCharge || "",
          floor: testLabData.floor || "",
          description: testLabData.description || "",
          precaution: testLabData.precaution || "",
          categoryApplicability: testLabData.categoryApplicability || [],
          tatReport: testLabData.tatReport || "",
          serviceTime: testLabData.serviceTime || "",
          source: testLabData.source || "",
          remarks: testLabData.remarks || "",
        });
      } else {
        // Otherwise (for adding new), reset to empty initial state
        setCurrentTestLab({
          location: "",
          testCode: "",
          testName: "",
          testType: "",
          packageTests: "",
          department: "",
          serviceGroup: "",
          serviceCharge: '',
          floor: "",
          description: "",
          precaution: "",
          categoryApplicability: [],
          tatReport: "",
          serviceTime: "",
          source: "",
          remarks: "",
        });
      }
      setErrors({}); // Always clear errors on modal open
      setSourceRemarks({ inhouse: "", outsourcing: "" }); // Reset source remarks
    }
  }, [open, testLabData]);

  // Handle changes for standard text fields and single selects
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentTestLab((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Instant validation for serviceCharge field
    if (name === "serviceCharge") {
      if (!/^[0-9]*$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          serviceCharge: "Service Charge must be digits only.",
        }));
      } else if (!value.trim()) {
        setErrors((prev) => ({
          ...prev,
          serviceCharge: "Service Charge is required.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, serviceCharge: "" }));
      }
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle changes for multi-select (e.g., categoryApplicability)
  const handleMultiSelectChange = (field, event) => {
    const {
      target: { value },
    } = event;

    // 'value' will be an array of selected strings
    const newValues = typeof value === "string" ? value.split(",") : value;

    setCurrentTestLab((prev) => ({
      ...prev,
      [field]: newValues,
    }));

    // Clear error for this field if user selects a value
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle source remarks changes
  const handleSourceRemarksChange = (sourceType, value) => {
    setSourceRemarks((prev) => ({
      ...prev,
      [sourceType]: value,
    }));
  };

  // Handle adding source remarks to the main form
  const handleAddSourceRemarks = (sourceType) => {
    const remarks = sourceRemarks[sourceType];
    if (remarks.trim()) {
      const prefix = sourceType === "inhouse" ? "Inhouse: " : "Outsourcing: ";
      setCurrentTestLab((prev) => ({
        ...prev,
        remarks: prev.remarks
          ? `${prev.remarks}\n${prefix}${remarks}`
          : `${prefix}${remarks}`,
      }));
      setSourceRemarks((prev) => ({
        ...prev,
        [sourceType]: "",
      }));
    }
  };

  // Handle deleting a chip (removing an item from a multi-select array)
  const handleDeleteChip = (field, chipToDeleteValue) => {
    setCurrentTestLab((prev) => {
      const newArray = prev[field].filter((item) => item !== chipToDeleteValue);
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  // Handle adding package tests to lab test list
  const handleAddPackageTests = () => {
    if (currentTestLab.packageTests.trim()) {
      const tests = currentTestLab.packageTests
        .split(",")
        .map((test) => test.trim())
        .filter((test) => test.length > 0);

      // Add to lab test list (avoiding duplicates)
      setLabTestList((prev) => {
        const existingTests = new Set(prev);
        const newTests = tests.filter((test) => !existingTests.has(test));
        return [...prev, ...newTests];
      });
    }
  };

  // --- Validation Logic ---
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    // safe helpers
    const safeTrim = (val) => String(val ?? "").trim();

    if (!safeTrim(currentTestLab.testName)) {
      tempErrors.testName = "Test Name is required.";
      isValid = false;
    }

    if (!safeTrim(currentTestLab.testCode)) {
      tempErrors.testCode = "Test Code is required.";
      isValid = false;
    }

    if (!safeTrim(currentTestLab.location)) {
      tempErrors.location = "Location is required.";
      isValid = false;
    }

    //  serviceCharge fixed (number + string safe)
    const charge = safeTrim(currentTestLab.serviceCharge);

    if (!charge) {
      tempErrors.serviceCharge = "Service Charge is required.";
      isValid = false;
    } else if (!/^[0-9]+$/.test(charge)) {
      tempErrors.serviceCharge = "Service Charge must be digits only.";
      isValid = false;
    }

    if (!safeTrim(currentTestLab.source)) {
      tempErrors.source = "Source (Inhouse/Outsourcing) is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateForm()) {
      const cleanedPackageTests = Array.isArray(currentTestLab.packageTests)
        ? currentTestLab.packageTests.filter(
          (id) => id && id.toString().trim() !== ""
        )
        : [];

      const testLabToSave = {
        ...currentTestLab,
        serviceGroup: normalizeServiceGroup(currentTestLab.serviceGroup),

        //  string fix
        categoryApplicability:
          currentTestLab.categoryApplicability?.[0] ||
          currentTestLab.categoryApplicability ||
          "",

        //  objectId array fix
        packageTests: cleanedPackageTests,

        id: testLabData?.id || `testlab-${Date.now()}`,
      };

      onSave(testLabToSave);
    } else {
      console.log("Form validation failed.", errors);
    }
  };
  const serviceGroup = globalSuggestion?.filter(
    (item) => item?.type === "serviceGroup"
  ) || [];

  console.log("Current Test Lab State:", serviceGroup);

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
          <ScienceIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {testLabData ? "Edit Test Lab" : "Add New Test Lab"}
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
            {/* Basic Test Information Card */}
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
                  <ScienceIcon
                    sx={{ color: colors.blueAccent[500], fontSize: 24 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.primary[500],
                    }}
                  >
                    Test Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Type of Test */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category of Test</InputLabel>
                      <Select
                        value={currentTestLab.testType}
                        onChange={handleChange}
                        name="testType"
                        label="Category of Test"
                      >
                        <MenuItem value="">
                          <em>Select Type</em>
                        </MenuItem>
                        {testTypeOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Department */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={currentTestLab.department}
                        onChange={handleChange}
                        name="department"
                        label="Department"
                      >
                        <MenuItem value="">
                          <em>Select Department</em>
                        </MenuItem>
                        {departmentOptions.map((option) => (
                          <MenuItem key={option} value={option?._id}>
                            {option?.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Test Name */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Test Name"
                      name="testName"
                      value={currentTestLab.testName}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      placeholder="Enter test name"
                      error={!!errors.testName}
                      helperText={errors.testName}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>

                  {currentTestLab.testType === "Package" && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Package Tests"
                        name="packageTests"
                        value={currentTestLab.packageTests}
                        onChange={handleChange}
                        variant="outlined"
                        size="medium"
                        placeholder="Enter multiple test names separated by commas"
                        multiline
                        rows={2}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddPackageTests}
                        sx={{ mt: 1 }}
                      >
                        Add to Lab Test List
                      </Button>
                    </Grid>
                  )}

                  {/* Test Code */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Test Code"
                      name="testCode"
                      value={currentTestLab.testCode}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      error={!!errors.testCode}
                      helperText={errors.testCode}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>


                  {/* Service Group */}
                  <Grid item xs={12} sm={6}>
                    {/* <TextField
                      fullWidth
                      label="Service Group"
                      name="serviceGroup"
                      value={currentTestLab.serviceGroup}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    /> */}
                    {/* <TextField
                      fullWidth
                      select
                      label="Service Group"
                      name="serviceGroup"
                      value={currentTestLab.serviceGroup || ""}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    >
                      <MenuItem value="">Select Service Group</MenuItem>
                      {SERVICE_GROUPS.map((group) => (
                        <MenuItem key={group} value={group}>
                          {group}
                        </MenuItem>
                      ))}
                    </TextField> */}
                    <Autocomplete
                      fullWidth
                      freeSolo
                      options={
                        serviceGroup?.map((item) => ({
                          ...item,
                          label: item.value,
                        })) || []
                      }

                      value={
                        serviceGroup?.find(
                          (item) => item.value === currentTestLab.serviceGroup
                        ) || null
                      }

                      getOptionLabel={(option) =>
                        typeof option === "string" ? option : option?.value || ""
                      }

                      onInputChange={(event, newInputValue) => {
                        setCurrentTestLab((prev) => ({
                          ...prev,
                          serviceGroup: normalizeServiceGroup(newInputValue),
                        }));
                      }}

                      onChange={(event, newValue) => {
                        setCurrentTestLab((prev) => ({
                          ...prev,
                          serviceGroup: normalizeServiceGroup(newValue),
                        }));
                      }}

                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Service Group"
                          placeholder="Select or type"
                        />
                      )}
                    />
                  </Grid>
                  {/* Service Charge */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Service Charge"
                      name="serviceCharge"
                      value={currentTestLab?.serviceCharge}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      error={!!errors.serviceCharge}
                      helperText={errors.serviceCharge}
                      placeholder="₹ Amount"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  {/* TAT Report */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="TAT Report"
                      name="tatReport"
                      value={currentTestLab.tatReport}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      placeholder="e.g., 24 hours"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  {/* Service Time */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Service Time"
                      name="serviceTime"
                      value={currentTestLab.serviceTime}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      placeholder="e.g., 30 minutes"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  {/* Test Type - Existing field (now hidden when Generic/Package is selected) */}
                  {(!currentTestLab.testType ||
                    currentTestLab.testType === "") && (
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Test Type (Legacy)</InputLabel>
                          <Select
                            value={currentTestLab.testType}
                            onChange={handleChange}
                            name="testType"
                            label="Test Type (Legacy)"
                          >
                            <MenuItem value="">
                              <em>None</em>
                            </MenuItem>
                            <MenuItem value="IPD">IPD</MenuItem>
                            <MenuItem value="OPD">OPD</MenuItem>
                            <MenuItem value="IPD & OPD">IPD & OPD</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                  {/* Category Applicability (Multi-select) */}
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      size="medium"
                      variant="outlined"
                      error={!!errors.categoryApplicability}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    >
                      <InputLabel id="select-categories-label">
                        Category Applicability
                      </InputLabel>
                      <Select
                        labelId="select-categories-label"
                        id="select-categories"
                        multiple
                        value={currentTestLab.categoryApplicability}
                        onChange={(e) =>
                          handleMultiSelectChange("categoryApplicability", e)
                        }
                        input={
                          <OutlinedInput
                            id="select-multiple-categories-chip"
                            label="Category Applicability"
                          />
                        }
                        renderValue={(selectedCategories) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {selectedCategories.map((value) => (
                              <Chip
                                key={value}
                                label={value}
                                onDelete={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChip(
                                    "categoryApplicability",
                                    value,
                                  );
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
                        {availableCategories.map((category) => (
                          <MenuItem
                            key={category}
                            value={category}
                            sx={{
                              "&:hover": {
                                backgroundColor: colors.primary[50],
                              },
                            }}
                          >
                            <Checkbox
                              checked={
                                currentTestLab.categoryApplicability.indexOf(
                                  category,
                                ) > -1
                              }
                            />
                            <ListItemText primary={category} />
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.categoryApplicability && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.5 }}
                        >
                          {errors.categoryApplicability}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Location & Facility Details Card */}
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
                  <LocationOnIcon
                    sx={{ color: colors.greenAccent[500], fontSize: 24 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.primary[500],
                    }}
                  >
                    Location & Facility Details
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Location */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={currentTestLab.location}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      required
                      error={!!errors.location}
                      helperText={errors.location}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  {/* Floor */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Floor"
                      name="floor"
                      value={currentTestLab.floor}
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
                  {/* Source (In/Out) */}
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      size="medium"
                      variant="outlined"
                      required
                      error={!!errors.source}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    >
                      <InputLabel id="select-source-label">Source</InputLabel>
                      <Select
                        labelId="select-source-label"
                        id="select-source"
                        name="source"
                        value={currentTestLab.source}
                        onChange={handleChange}
                        label="Source"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {sourceOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.source && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.5 }}
                        >
                          {errors.source}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>


                  {currentTestLab.source === "Outsourcing" && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          border: `1px solid ${colors.primary[300]}`,
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 2, fontWeight: 600 }}
                        >
                          Outsourcing Remarks
                        </Typography>
                        <Grid container spacing={2} alignItems="flex-end">
                          <Grid item xs={10}>
                            <TextField
                              fullWidth
                              label="Enter outsourcing remarks..."
                              value={sourceRemarks.outsourcing}
                              onChange={(e) =>
                                handleSourceRemarksChange(
                                  "outsourcing",
                                  e.target.value,
                                )
                              }
                              variant="outlined"
                              size="small"
                              multiline
                              rows={2}
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <Button
                              variant="contained"
                              onClick={() =>
                                handleAddSourceRemarks("outsourcing")
                              }
                              disabled={!sourceRemarks.outsourcing.trim()}
                              sx={{ height: "100%" }}
                            >
                              Add
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Additional Information Card */}
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
                    sx={{ color: colors.primary[500], fontSize: 24 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.primary[500],
                    }}
                  >
                    Additional Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={currentTestLab.description}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      multiline
                      rows={3}
                      placeholder="Test description and details..."
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  {/* Precaution */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Precaution"
                      name="precaution"
                      value={currentTestLab.precaution}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      multiline
                      rows={2}
                      placeholder="Safety precautions and preparation instructions..."
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  {/* Remarks */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Remarks"
                      name="remarks"
                      value={currentTestLab.remarks}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      multiline
                      rows={2}
                      placeholder="Additional remarks or notes..."
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
            : testLabData
              ? "Update Test Lab"
              : "Add Test Lab"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTestLabModal;
