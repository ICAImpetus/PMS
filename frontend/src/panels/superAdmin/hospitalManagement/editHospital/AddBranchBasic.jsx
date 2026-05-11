import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  IconButton,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { initialBranchState } from "../../../../scenes/hospitalform/formData";
import { IndianStatesWithDistricts } from "../hospitalForm/components/State";
import { sendDataApiFuncNew } from "../../../../utils/services";
import { toast, Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import { commonRoutes } from "../../../../api/apiService";
import { useApi } from "../../../../api/useApi";

// Custom Material-UI theme for a modern look
const theme = createTheme({
  palette: {
    primary: {
      main: "#4CAF50",
      light: "#81C784",
      dark: "#388E3C",
    },
    secondary: {
      main: "#FFC107",
      light: "#FFD54F",
      dark: "#FFB300",
    },
    background: {
      default: "#E8F5E9",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#212121",
      secondary: "#616161",
    },
    error: {
      main: "#f44336",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h4: {
      fontWeight: 700,
      fontSize: "2rem",
      color: "#212121",
      "@media (max-width:600px)": {
        fontSize: "1.5rem",
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.1rem",
      color: "#424242",
    },
    body1: {
      fontSize: "0.95rem",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: "0.95rem",
          margin: 0,
          "& .MuiOutlinedInput-root": {
            borderRadius: 6,
            minHeight: 36,
            fontSize: "0.95rem",
            padding: 0,
            height: 40,
            alignItems: "center",
            transition:
              "border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
            "& input": {
              padding: "9px 10px 9px 10px",
              height: "20px",
              fontSize: "0.95rem",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            },
            "& fieldset": {
              borderColor: "#E0E0E0",
            },
            "&:hover fieldset": {
              borderColor: theme.palette.primary.light,
            },
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main,
              borderWidth: "2px",
              boxShadow: `0 0 0 1.5px ${theme.palette.primary.main}33`,
            },
            "&.Mui-focused": {
              backgroundColor: "rgba(76, 175, 80, 0.01)",
            },
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          fontSize: "0.85rem",
          top: "-1px",
          transform: "translate(14px, 13px) scale(1)",
          display: "flex",
          alignItems: "center",
          height: "18px",
          transition: "all 0.2s cubic-bezier(.4,0,.2,1) 0ms",
          "&.Mui-focused": {
            color: theme.palette.primary.main,
          },
          "&.MuiInputLabel-shrink": {
            fontSize: "0.80rem",
            top: "-6px",
            transform: "translate(14px, 0px) scale(0.95)",
            background: "white",
            padding: "0 2px",
            zIndex: 1,
            maxWidth: "calc(100% - 8px)",
            lineHeight: 1.2,
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
          fontSize: "1rem",
          padding: "8px 18px",
          minHeight: 36,
          transition: "all 0.2s ease",
          boxShadow: "none",
          "&:hover": {
            transform: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          },
        },
        containedPrimary: ({ theme }) => ({
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          boxShadow: `0 2px 8px ${theme.palette.primary.main}22`,
          color: "white",
          "&:hover": {
            boxShadow: `0 4px 12px ${theme.palette.primary.main}33`,
          },
        }),
        outlinedPrimary: ({ theme }) => ({
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: theme.palette.primary.main + "0D",
            borderColor: theme.palette.primary.dark,
          },
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.06)",
          },
        },
      },
    },
  },
});

const AddBranchBasic = ({

  setHospitalBranches,
  handleClose,
  hospitalId,
  initialData,
  isEdit = false,
}) => {

  const [formData, setFormData] = useState(initialData || initialBranchState);
  const [errors, setErrors] = useState({});
  const [cities, setCities] = useState([]);
  const formRef = useRef(null);

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && isEdit) {
      setFormData(initialData);
    }
  }, [initialData, isEdit]);

  useEffect(() => {
    if (formData.state) {
      setCities(IndianStatesWithDistricts[formData.state] || []);
    } else {
      setCities([]);
    }
  }, [formData.state]);

  const getFieldError = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Branch Name is required.";
        break;
      case "location":
        if (!value.trim()) error = "Location is required.";
        break;
      case "state":
        if (!value.trim()) error = "State is required.";
        break;
      case "city":
        if (!value.trim()) error = "City is required.";
        break;
      // case "contact":
      //   if (!value.trim()) error = "Contact is required.";
      //   break;
      case "code":
        if (!value.trim()) error = "Branch Code is required.";
        // else if (!/^[A-Z0-9]{3,10}$/.test(value))
        //   error = "Code must be 3-10 alphanumeric characters (uppercase).";
        break;
      case "beds":
        if (!value || value <= 0) {
          error = "Number of Beds must be a positive number.";
        } else if (!/^[0-9]{1,4}$/.test(value)) {
          error = "Number of Beds must be 10000 or less.";
        }
        break;
      case "email":
        if (!value.trim()) error = "Email is required.";
        else if (!/\S+@\S+\.\S/.test(value)) error = "Invalid email format.";
        break;
      default:
        break;
    }
    return error;
  };

  const validateField = (name, value) => {
    const error = getFieldError(name, value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    return error;
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Check all fields except contactNumbers and establishedDate using getFieldError
    const fieldsToValidate = [
      "name",
      "location",
      "state",
      "city",
      "code",
      "beds",
      "email",
      "contact",
    ];
    fieldsToValidate.forEach((key) => {
      const error = getFieldError(key, formData[key] || "");
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    formData.contactNumbers.forEach((contact, index) => {
      if (!contact.trim()) {
        newErrors[`contactNumbers[${index}]`] =
          "Contact number cannot be empty.";
        isValid = false;
      } else if (!/^\d{10,15}$/.test(contact)) {
        newErrors[`contactNumbers[${index}]`] =
          "Invalid contact number (10-15 digits).";
        isValid = false;
      }
    });

    if (
      formData.establishedDate &&
      dayjs(formData.establishedDate).isAfter(dayjs())
    ) {
      newErrors.establishedDate = "Established Date cannot be in the future.";
      isValid = false;
    }

    setErrors(newErrors); // Corrected variable name from updatedErrors
    return isValid;
  };

  const isFormValid = () => {
    // Required fields check
    const requiredFields = [
      "name",
      "location",
      "state",
      "city",
      "code",
      "beds",
      "email",
      "contact",
    ];
    const hasRequired = requiredFields.every((field) =>
      formData[field]?.toString().trim(),
    );

    const contactValid =
      formData.contactNumbers.length > 0 &&
      formData.contactNumbers.every((c) => c.trim() && /^\d{10,15}$/.test(c));

    return (
      hasRequired && contactValid && Object.values(errors).every((e) => !e)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleContactNumberChange = (index, value) => {
    const newContactNumbers = [...formData.contactNumbers];
    newContactNumbers[index] = value;
    setFormData((prevData) => ({
      ...prevData,
      contactNumbers: newContactNumbers,
    }));

    const contactError = !value.trim()
      ? "Contact number cannot be empty."
      : !/^\d{10,15}$/.test(value)
        ? "Invalid contact number (10-15 digits)."
        : "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [`contactNumbers[${index}]`]: contactError,
    }));
  };

  // Add a new contact number field
  const addContactNumber = () => {
    setFormData((prevData) => ({
      ...prevData,
      contactNumbers: [...prevData.contactNumbers, ""],
    }));
    setErrors((prevErrors) => {
      const newIndex = formData.contactNumbers.length;
      return { ...prevErrors, [`contactNumbers[${newIndex}]`]: "" };
    });
  };

  // Remove a contact number field and reindex errors
  const removeContactNumber = (index) => {
    setFormData((prevData) => {
      const newContactNumbers = prevData.contactNumbers.filter((_, i) => i !== index);
      return {
        ...prevData,
        contactNumbers: newContactNumbers.length > 0 ? newContactNumbers : []
      };
    });
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      // Reindex errors for contactNumbers
      const newErrors = {};
      Object.keys(updatedErrors).forEach((key) => {
        const match = key.match(/^contactNumbers\[(\d+)\]$/);
        if (match) {
          const idx = parseInt(match[1], 10);
          if (idx < index) {
            newErrors[key] = updatedErrors[key];
          } else if (idx > index) {
            newErrors[`contactNumbers[${idx - 1}]`] = updatedErrors[key];
          }
          // else (idx === index) skip (deleted)
        } else {
          newErrors[key] = updatedErrors[key];
        }
      });
      return newErrors;
    });
  };

  const {
    request: addBranch,
    loading: addBranchLoading,
    error: addBranchError,
  } = useApi(commonRoutes.addBranch);

  const {
    request: updateBranchApi,
    loading: updateBranchLoading,
    error: updateBranchError,
  } = useApi(commonRoutes.updateBranch);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hospitalId) {
      toast.error(
        `Error: Hospital ID is missing. Cannot ${isEdit ? "update" : "add"} branch.`,
      );
      console.error(
        "Missing Hospital ID. Check if it's passed correctly via props or context.",
      );
      return;
    }

    if (validateForm()) {
      console.log("Submitting Branch Data:", formData);
      try {
        // Use different API endpoints for create vs update
        let response;
        if (isEdit) {
          console.log("Updating branch:", formData);

          response = await updateBranchApi(hospitalId, formData._id, formData);
          if (response?.success) {
            console.log("response branch:", response);
            // setHospitalBranches((prev) =>
            //   prev.map((branch) =>
            //     branch._id === formData._id ? response?.data : formData
            //   )
            // );
            setHospitalBranches((prev) =>
              prev.map((branch) =>
                branch._id === formData._id ? response?.data : branch
              )
            );
            toast.success("Branch Update Successfull")
            if (handleClose) handleClose();
          }


        } else {
          response = await addBranch(hospitalId, formData);
          if (response?.success) {
            setHospitalBranches((prev) => [...prev, response?.data]);
            toast.success("Branch Added Successfull")
            if (handleClose) handleClose();
          }

        }

      } catch (error) {
        console.error("API Error:", error);

        toast.error(
          error?.response?.data?.message || "Something went wrong"
        );
      }
    } else {
      console.log("Validation Errors:", errors);
      toast.error("Please fix the errors in the form.");
    }
  };
  useEffect(() => {
    const error = addBranchError || updateBranchError
    if (error) {
      toast.error(error || "internal Server Error")
    }
  }, [addBranchError, updateBranchError])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            zIndex: 999999,
          },
        }}
      /> */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        ref={formRef}
        sx={{
          bgcolor: "white",
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          width: "100%",
          maxWidth: "620px",
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1.5, md: 2.5 },
          mx: "auto",
          my: { xs: 1, md: 2 },
          border: "1px solid #e0e0e0",
          maxHeight: "90vh", // Ensure it's scrollable if it gets too long
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ textAlign: "center" }}
        >
          {isEdit ? "Edit Branch" : "Add New Hospital Branch"}
        </Typography>

        <TextField
          label="Branch Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => validateField("name", formData.name)}
          fullWidth
          variant="outlined"
          size="medium"
          error={!!errors.name}
          helperText={errors.name}
        />

        <TextField
          label="Location (Area/Sector)"
          name="location"
          value={formData.location}
          onChange={handleChange}
          onBlur={() => validateField("location", formData.location)}
          fullWidth
          variant="outlined"
          size="medium"
          error={!!errors.location}
          helperText={errors.location}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 2 }}
        >
          <Autocomplete
            options={Object.keys(IndianStatesWithDistricts)}
            data-testid="state-autocomplete"
            value={formData.state || null}
            onChange={(event, newValue) => {
              const syntheticEvent = {
                target: { name: "state", value: newValue || "" },
              };
              handleChange(syntheticEvent);
              // Reset city when state changes
              setFormData((prev) => ({ ...prev, city: "" }));
            }}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="State"
                name="state"
                error={!!errors.state}
                helperText={errors.state}
              />
            )}
          />
          <Autocomplete
            options={cities}
            value={formData.city || null}
            data-testid="city-autocomplete"
            onChange={(event, newValue) => {
              const syntheticEvent = {
                target: { name: "city", value: newValue || "" },
              };
              handleChange(syntheticEvent);
            }}
            fullWidth
            disabled={!formData.state}
            renderInput={(params) => (
              <TextField
                {...params}
                label="City"
                name="city"
                error={!!errors.city}
                helperText={errors.city}
              />
            )}
          />
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 2 }}
        >
          <TextField
            label="Branch Code"
            name="code"
            value={formData.code || formData?.code || ""}
            onChange={handleChange}
            onBlur={() => validateField("code", formData.code)}
            fullWidth
            variant="outlined"
            size="medium"
            error={!!errors.code}
            helperText={errors.code}
          />
          <TextField
            label="Number of Beds"
            name="beds"
            type="number"

            value={formData.beds}
            onChange={handleChange}
            onBlur={() => validateField("beds", formData.beds)}
            fullWidth
            variant="outlined"
            size="medium"
            error={!!errors.beds}
            helperText={errors.beds}
            inputProps={{ min: 1, max: 9999 }}
          />
        </Stack>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 2 }}
        >
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => validateField("email", formData.email)}
            fullWidth
            variant="outlined"
            size="medium"
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            label="Contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            onBlur={() => validateField("contact", formData.contact)}
            fullWidth
            variant="outlined"
            size="medium"
            error={!!errors.contact}
            helperText={errors.contact}
          />

        </Stack>
        <Stack spacing={1.2}>
          {formData.contactNumbers.map((contact, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <TextField
                label={`Contact Number ${index + 1}`}
                value={contact}
                onChange={(e) => handleContactNumberChange(index, e.target.value)}
                onBlur={(e) => handleContactNumberChange(index, e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                error={!!errors[`contactNumbers[${index}]`]}
                helperText={errors[`contactNumbers[${index}]`]}
                sx={{ minWidth: 0 }}
              />
              <IconButton
                onClick={() => removeContactNumber(index)}
                color="error"
                sx={{ borderRadius: 10 }}
                aria-label={`Remove contact number ${index + 1}`}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="outlined"
            onClick={addContactNumber}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 8,
              py: 0.5,
              fontSize: "0.97rem",
              minHeight: 32,
              mt: 0.5,
              alignSelf: "flex-start",
              "&:hover": {
                bgcolor: "primary.light",
                color: "white",
              },
            }}
          >
            Add Another Contact
          </Button>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="space-between"
        // sx={{}}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            color="primary"
            sx={{ py: 0.7, fontSize: "1rem", fontWeight: 500, minWidth: 100 }}
            disabled={addBranchLoading || updateBranchLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            data-testid="submit-branch-button"
            variant="contained"
            color="primary"
            disabled={addBranchLoading || updateBranchLoading}
            startIcon={(addBranchLoading || updateBranchLoading) && <CircularProgress size={20} color="inherit" />}
            // Button is now enabled to allow showing errors on click
            sx={{ py: 0.7, fontSize: "1rem", fontWeight: 500, minWidth: 100 }}
          >
            {(addBranchLoading || updateBranchLoading) ? "Saving..." : isEdit ? "Update" : "Submit"}
          </Button>
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

export default AddBranchBasic;
