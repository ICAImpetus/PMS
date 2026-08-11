import React, { useState, useEffect, useMemo } from "react";
import { Formik, Form } from "formik";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  IconButton,
  InputAdornment,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
  Paper,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  InfoOutlined as InfoOutlinedIcon,
  PersonOutline as PersonOutlineIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

// Imports from your project structure
import Header from "../../../components/Header";
import { sendDataApiFunc } from "../../../utils/services";
import { UserContextHook } from "../../../contexts/UserContexts";
import { useApi } from "../../../api/useApi";
import { commonRoutes, superAdminRoutes } from "../../../api/apiService";
import MultiSelectDropdown from "../userManagement/components/MultiSelectDropdown";
import { getValidationSchema } from "../../Schemas/validation";

const roles = {
  "superadmin": ["admin", "supermanager", "teamleader", "executive"],
  "admin": ["supermanager", "teamleader", "executive"],
  "supermanager": ["teamleader", "executive"],
  "teamleader": ["executive"],
}
const UserForm = ({
  initialState = null,
  onClose,
  hospitalId,
  allUsers = [],
  refetchUsers,
  isInline = false,
  isSuperManager = false,
  role = ''
}) => {
  const { currentUser } = UserContextHook();
  const [showPassword, setShowPassword] = useState(false);
  const [branchOptions, setBranchOptions] = useState([]);

  const isUpdateComp = !!initialState;

  const initialValues = useMemo(
    () => ({
      name: initialState?.name ?? "",
      email: initialState?.email ?? "",
      username: initialState?.username ?? "",
      password: "",
      type: initialState?.type ?? "admin",
      hospitalName: Array.isArray(initialState?.hospitals)
        ? initialState.hospitals
        : initialState?.hospitals
          ? [initialState.hospitals]
          : [],
      selectedBranch: Array.isArray(initialState?.branches)
        ? initialState.branches
        : initialState?.branches
          ? [initialState.branches]
          : [],

      canDelete: initialState?.canDelete ?? false,
    }),
    [initialState, isUpdateComp, hospitalId]
  );

  const {
    request: addUser,
    loading: userLoading,
    error: userError,
  } = useApi(commonRoutes.addUsers);

  const {
    request: updateUser,
    loading: userUpdateLoading,
    error: userUpdate,
  } = useApi(commonRoutes.updateUser);

  const {
    request: getBranches,
    loading: branchLoading,
    error: branchError,
  } = useApi(commonRoutes.getSelectedBranches);


  const {
    request: allHospital,
    loading: hosApiLoading,
    error: hosApiError,
  } = useApi(superAdminRoutes.getAllHospital);



  const handleSubmitForm = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);

      let valuesToSubmit = { ...values };
      valuesToSubmit.hospitalName =
        valuesToSubmit?.hospitalName?.map((item) => item?._id) || [];

      valuesToSubmit.selectedBranch =
        valuesToSubmit?.selectedBranch?.map((item) =>
          isUpdateComp ? item?.branchId : item?._id
        ) || [];

      let didClose = false;

      if (isUpdateComp) {
        const response = await updateUser(initialState?._id, valuesToSubmit);
        if (response?.success) {
          if (refetchAdmins) await refetchAdmins();
          toast.success("Profile Updated");
          didClose = true;
        } else {
          toast.error(response?.message || "Failed to update user");
        }
      } else {
        const data = await addUser(valuesToSubmit);
        if (data?.success) {
          if (refetchAdmins) await refetchAdmins();
          toast.success("New User Added");
          didClose = true;
        } else {
          toast.error(data?.message || "Failed to create user");
        }
      }

      if (didClose && onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const [hospitalNames, setHospitalNames] = useState([]);
  useEffect(() => {
    const fetchHospitals = async () => {
      const response = await allHospital();
      setHospitalNames(response?.data || []);
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    const error = hosApiError || branchError || userError || userUpdate || null;
    if (error) {
      toast.error(error);
    }
  }, [userError, userUpdate, hosApiError, branchError]);

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: isInline ? "100%" : 720,
        margin: isInline ? "0" : "auto",
        bgcolor: "#FFFFFF",
        p: isInline ? 1 : 4,
        borderRadius: isInline ? "0" : "20px",
        border: isInline ? "none" : "1px solid #E2E8F0",
        boxShadow: isInline ? "none" : "0px 20px 25px -5px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* HEADER SECTION */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              bgcolor: "#EFF6FF",
              color: "#0256E8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PersonOutlineIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              {isUpdateComp ? "Update User" : "Create New User"}
            </Typography>
            <Typography variant="caption" color="#64748B" fontWeight={500}>
              {isUpdateComp
                ? "Modify user profile and assigned hospital rights."
                : "Add a new user credential into the platform."}
            </Typography>
          </Box>
        </Box>

        {onClose && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#94A3B8",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              "&:hover": { bgcolor: "#EFF6FF", color: "#0256E8" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mb: 3, borderColor: "#F1F5F9" }} />

      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={getValidationSchema(isUpdateComp)}
        validateOnChange={false}
        validateOnBlur={true}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          await handleSubmitForm(values, { setSubmitting });
          if (!isUpdateComp) {
            resetForm();
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldTouched,
          setFieldValue,
        }) => {
          const customHandleChange = (event) => {
            const { name, value } = event.target;
            handleChange(event);
            if (
              name === "type" &&
              ["admin", "supermanager", "teamLeader", "executive"].includes(
                value
              )
            ) {
              setFieldTouched("hospitalName", true);
              setFieldTouched("selectedAdmin", true);
            }
          };

          useEffect(() => {
            if (initialState && isUpdateComp) {
              const formatedHospitals =
                initialState.hospitals?.map((hos) => ({
                  _id: hos.hospitalId,
                  name: hos.name,
                })) || [];

              setFieldValue("hospitalName", formatedHospitals);
            }
          }, [initialState]);

          useEffect(() => {
            const fetchBranches = async () => {
              // If not teamleader or executive → clear branches
              if (values.type !== "teamleader" && values.type !== "executive") {
                setBranchOptions([]);
                setFieldValue("selectedBranch", []);
                return;
              }

              try {
                const response = await getBranches(hospitalId);

                setBranchOptions(response?.data || []);
              } catch (error) {
                console.error("Branch fetch error:", error);
              }
            };

            if (hospitalId) {
              fetchBranches();
            }

          }, [hospitalId, values.type]);

          return (
            <Form>
              {/* PERMISSION BAR */}
              {/* <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: "#F8FAFC",
                  p: 2,
                  borderRadius: "14px",
                  border: "1px solid #E2E8F0",
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                    Deletion Privileges
                  </Typography>
                  <Typography variant="caption" color="#64748B">
                    {values.canDelete
                      ? "User is authorized to delete system records."
                      : "User is restricted from deleting system records."}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.canDelete || false}
                      onChange={(e) =>
                        setFieldValue("canDelete", e.target.checked)
                      }
                      size="small"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#10B981",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#10B981",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      color="#334155"
                    >
                      Can Delete
                    </Typography>
                  }
                />
              </Box> */}

              <Grid container spacing={2.5}>
                {/* Full Name */}
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    size="small"
                    label="Full Name"
                    name="name"
                    value={values.name}
                    onChange={customHandleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        backgroundColor: "#F8FAFC",
                        fontSize: "13px",
                        "& fieldset": { borderColor: "#E2E8F0" },
                        "&:hover fieldset": { borderColor: "#CBD5E1" },
                        "&.Mui-focused fieldset": { borderColor: "#0256E8" },
                      },
                      "& .MuiInputLabel-root": { fontSize: "13px", color: "#64748B" },
                    }}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    size="small"
                    label="Email Address"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={customHandleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        backgroundColor: "#F8FAFC",
                        fontSize: "13px",
                        "& fieldset": { borderColor: "#E2E8F0" },
                        "&:hover fieldset": { borderColor: "#CBD5E1" },
                        "&.Mui-focused fieldset": { borderColor: "#0256E8" },
                      },
                      "& .MuiInputLabel-root": { fontSize: "13px", color: "#64748B" },
                    }}
                  />
                </Grid>

                {/* Username */}
                <Grid item xs={12} sm={isUpdateComp ? 12 : 6}>
                  <TextField
                    variant="outlined"
                    size="small"
                    label="Username"
                    name="username"
                    type="text"
                    value={values.username}
                    onChange={customHandleChange}
                    onBlur={handleBlur}
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                    fullWidth
                    autoComplete={isUpdateComp ? undefined : "new-username"}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        backgroundColor: "#F8FAFC",
                        fontSize: "13px",
                        "& fieldset": { borderColor: "#E2E8F0" },
                        "&:hover fieldset": { borderColor: "#CBD5E1" },
                        "&.Mui-focused fieldset": { borderColor: "#0256E8" },
                      },
                      "& .MuiInputLabel-root": { fontSize: "13px", color: "#64748B" },
                    }}
                  />
                </Grid>

                {/* Password (Only on Create) */}
                {!isUpdateComp && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="outlined"
                      size="small"
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      autoComplete="new-password"
                      onChange={customHandleChange}
                      onBlur={handleBlur}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip
                              title="Password must contain uppercase, lowercase, number and special character"
                              arrow
                            >
                              <InfoOutlinedIcon
                                fontSize="small"
                                sx={{
                                  mr: 0.5,
                                  color: "#94A3B8",
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>

                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                              sx={{ color: "#94A3B8" }}
                            >
                              {showPassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          backgroundColor: "#F8FAFC",
                          fontSize: "13px",
                          "& fieldset": { borderColor: "#E2E8F0" },
                          "&:hover fieldset": { borderColor: "#CBD5E1" },
                          "&.Mui-focused fieldset": { borderColor: "#0256E8" },
                        },
                        "& .MuiInputLabel-root": { fontSize: "13px", color: "#64748B" },
                      }}
                    />
                  </Grid>
                )}

                {/* User Type */}
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    size="small"
                    select
                    label="User Type"
                    name="type"
                    data-testid="type"
                    value={values.type}
                    onChange={customHandleChange}
                    onBlur={handleBlur}
                    error={touched.type && Boolean(errors.type)}
                    helperText={touched.type && errors.type}
                    fullWidth
                    disabled={isUpdateComp}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        backgroundColor: "#F8FAFC",
                        fontSize: "13px",
                        "& fieldset": { borderColor: "#E2E8F0" },
                        "&:hover fieldset": { borderColor: "#CBD5E1" },
                        "&.Mui-focused fieldset": { borderColor: "#0256E8" },
                      },
                      "& .MuiInputLabel-root": { fontSize: "13px", color: "#64748B" },
                    }}
                  >
                    {roles[role] && roles[role].length > 0 ? (
                      roles[role].map((item) => (
                        <MenuItem key={item} value={item}>
                          {/* Capitalizes the first letter for display (e.g. "teamleader" -> "Teamleader") */}
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        No roles found
                      </MenuItem>
                    )}
                  </TextField>
                </Grid>

                {/* MultiSelect Hospitals */}
                <Grid item xs={12}>
                  <MultiSelectDropdown
                    options={hospitalNames}
                    selectedOptions={values.hospitalName}
                    setSelectedOptions={(val) => {
                      setFieldValue("hospitalName", val);
                    }}
                    label="Select Hospital(s)"
                    role={values.type}
                    currentId={initialState?._id}
                    error={touched.hospitalName && Boolean(errors.hospitalName)}
                    helperText={touched.hospitalName && errors.hospitalName}
                  />
                </Grid>

                {/* MultiSelect Branches for Team Leaders and Executives */}
                {(values.type === "teamleader" || values.type === "executive") && (
                  <Grid item xs={12}>
                    <MultiSelectDropdown
                      options={branchOptions}
                      selectedOptions={values.selectedBranch}
                      setSelectedOptions={(val) => setFieldValue("selectedBranch", val)}
                      label="Select Branch(s)"
                      role={values.type}
                      currentId={initialState?._id}
                      isSingleSelect={values.type === "executive"}
                      error={touched.selectedBranch && Boolean(errors.selectedBranch)}
                      helperText={touched.selectedBranch && errors.selectedBranch}
                    />
                  </Grid>
                )}


                {/* Submit & Cancel Buttons */}
                <Grid item xs={12} pt={2}>
                  <Box display="flex" justifyContent="flex-end" gap={1.5}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={onClose}
                      sx={{
                        borderRadius: "12px",
                        borderColor: "#CBD5E1",
                        color: "#475569",
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "12px",
                        px: 3,
                        py: 1,
                        "&:hover": { borderColor: "#94A3B8", bgcolor: "#F8FAFC" },
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      disabled={userLoading || userUpdateLoading}
                      data-testid="createuserbtn"
                      type="submit"
                      variant="contained"
                      sx={{
                        borderRadius: "12px",
                        bgcolor: "#0256E8",
                        color: "#FFFFFF",
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: "12px",
                        px: 3.5,
                        py: 1,
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#0143B8", boxShadow: "none" },
                      }}
                    >
                      {isUpdateComp
                        ? userUpdateLoading
                          ? "Updating..."
                          : "Update User"
                        : userLoading
                          ? "Saving..."
                          : "Create User"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </Paper>
  );
};

export default UserForm;