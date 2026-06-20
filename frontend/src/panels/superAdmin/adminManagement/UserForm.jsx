import React, { useState, useEffect, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  InputAdornment,
  useTheme,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Visibility, VisibilityOff, Delete } from "@mui/icons-material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Header from "../../../components/Header";
import { getDataFunc, sendDataApiFunc } from "../../../utils/services";
import { Toaster, toast } from "react-hot-toast";
import { tokens } from "../../../theme";
// Assuming this component is in this location
import { UserContextHook } from "../../../contexts/UserContexts";
import { normalizeUserType } from "../../../utils/normalizeUserType";
import { useApi } from "../../../api/useApi";
import { commonRoutes, superAdminRoutes } from "../../../api/apiService";
import MultiSelectDropdown from "../userManagement/components/MultiSelectDropdown";
import { getValidationSchema } from "../.././Schemas/validation";

const UserForm = ({
  initialState = null,
  onClose,
  hospitalId,
  allUsers = [],
  refetchAdmins,
  isInline = false,
}) => {
  const { currentUser } = UserContextHook();


  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showPassword, setShowPassword] = useState(false);
  // ... (rest of your state)

  const isUpdateComp = !!initialState;

  const initialValues = useMemo(() => ({
    name: initialState?.name ?? "",
    email: initialState?.email ?? "",
    username: initialState?.username ?? "",
    password: "",
    type: initialState?.type ?? "admin",
    hospitalName: Array.isArray(initialState?.hospitals)
      ? initialState.hospitals
      : (initialState?.hospitals ? [initialState.hospitals] : []),
    selectedBranch: Array.isArray(initialState?.branches)
      ? initialState.branches
      : (initialState?.branches ? [initialState.branches] : []),

    canDelete: initialState?.canDelete ?? false,
  }), [initialState, isUpdateComp, hospitalId]);


  // const {
  //   request: checkUserNameApi,
  //   loading: checkUserNameApiLoading,
  //   error: checkUserNameApiError,
  // } = useApi(commonRoutes.checkUserName);



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

  const handleDeleteUser = async () => {
    if (!initialState?._id) {
      toast.error("User ID not found");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      try {
        const response = await sendDataApiFunc(
          `deleteUser/${initialState._id}`,
          {},
          "delete",
        );
        if (response.success) {
          toast.success("User deleted successfully");
          if (onClose) onClose();
        } else {
          toast.error(response.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("Delete user error:", error);
        toast.error("Error deleting user");
      }
    }
  };

  const handleSubmitForm = async (values, { setSubmitting }) => {
    try {

      setSubmitting(true); // Start loading state



      let valuesToSubmit = { ...values };
      valuesToSubmit.hospitalName = valuesToSubmit?.hospitalName?.map(
        (item) => item?._id
      ) || [];

      valuesToSubmit.selectedBranch = valuesToSubmit?.selectedBranch?.map(
        (item) => isUpdateComp ? item?.branchId : item?._id
      ) || [];


      console.log("errors", isUpdateComp, valuesToSubmit);

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
      // toast.error("Error saving user");
    } finally {
      // setSubmitting(false); // End loading state

    }
  };
  const [hospitalNames, setHospitalNames] = useState([]);
  useEffect(() => {
    // if (initialState) return;
    const fetchHospitals = async () => {
      const response = await allHospital();
      setHospitalNames(response?.data);
    };
    fetchHospitals();
  }, []);

  // Fetch branches whenever selected hospitals change
  // Note: We'll trigger this inside the Formik context to access values.hospitalName
  useEffect(() => {
    const error = hosApiError || branchError || userError || userUpdate || null;
    if (error) {
      toast.error(error);
    }
  }, [userError, userUpdate, hosApiError, branchError]);

  return (
    <Box m="20px">
      <Header
        title={isUpdateComp ? "UPDATE USER" : "CREATE USER"}
        subtitle={isUpdateComp ? "Updating User" : "Managing User creation"}
      />

      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={getValidationSchema(
          isUpdateComp
        )}
        validateOnChange={false}
        validateOnBlur={true}
        onSubmit={async (values, { resetForm, setSubmitting }) => {

          console.log("submit values", values);
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
          setFieldError,
        }) => {
          const customHandleChange = (event) => {
            const { name, value } = event.target;
            handleChange(event);
            if (
              name === "type" &&
              ["admin", "supermanager", "teamLeader", "executive"].includes(
                value,
              )
            ) {
              setFieldTouched("hospitalName", true);
              setFieldTouched("selectedAdmin", true);
            }
          };

          useEffect(() => {
            if (initialState && isUpdateComp) {
              const formatedHospitals = initialState.hospitals?.map(hos => ({
                _id: hos.hospitalId,
                name: hos.name
              })) || [];

              setFieldValue("hospitalName", formatedHospitals);
            }
          }, [initialState]);
          return (
            <Form>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: isInline ? "100%" : 700,
                  margin: isInline ? "0" : "auto",
                  bgcolor: isInline ? "transparent" : colors.primary[800],
                  p: isInline ? "0" : 4,
                  borderRadius: isInline ? "0" : 2,
                  boxShadow: isInline ? "none" : 3,
                  minHeight: "auto",
                  maxHeight: isInline ? "none" : "90vh",
                  overflowY: isInline ? "visible" : "auto",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.canDelete || false}
                        onChange={(e) =>
                          setFieldValue("canDelete", e.target.checked)
                        }
                        color="success"
                        size="small"
                      />
                    }
                    label={
                      <Typography
                        sx={{ color: colors.grey[100], fontSize: "0.9rem" }}
                      >
                        Can Delete
                      </Typography>
                    }
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: colors.grey[400] }}
                  >
                    {values.canDelete
                      ? "Can delete users"
                      : "Cannot delete users"}
                  </Typography>
                </Box>


                <Grid container spacing={3}>
                  {/* All your form fields (Name, Email, etc.) are unchanged */}

                  <Grid item xs={12}>
                    <TextField
                      variant="standard"
                      label="Full Name"
                      name="name"
                      value={values.name}
                      onChange={customHandleChange}
                      onBlur={handleBlur}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="standard"
                      label="Email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={customHandleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={isUpdateComp ? 12 : 6}>
                    <TextField
                      variant="standard"
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
                    />
                  </Grid>
                  {!isUpdateComp && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        variant="standard"
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={values.password}
                        autoComplete="new-password"
                        onChange={customHandleChange}
                        onBlur={handleBlur}
                        error={
                          touched.password &&
                          Boolean(errors.password)
                        }
                        helperText={
                          touched.password &&
                          errors.password
                        }
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
                                    mr: 1,
                                    color: "text.secondary",
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>

                              <IconButton
                                onClick={() =>
                                  setShowPassword(!showPassword)
                                }
                                edge="end"
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>

                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField
                      variant="standard"
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
                    >
                      <MenuItem value="admin">Admin</MenuItem>

                    </TextField>
                  </Grid>

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
                    />
                    {touched.hospitalName && errors.hospitalName && (
                      <div
                        style={{
                          color: "#f44336",
                          fontSize: "0.75rem",
                          marginTop: "3px",
                          marginLeft: "14px",
                        }}
                      >
                        {errors.hospitalName}
                      </div>
                    )}
                  </Grid>
                  {/* 
              
                  {/* Can Delete Toggle - Only for admin updates */}
                  {/* Submit and Cancel Buttons */}
                  <Grid item xs={12} container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      {isUpdateComp && isUpdateComp === true ? (
                        <Button
                          disabled={userUpdateLoading}
                          type="submit"
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{
                            mt: 2,
                            "&:hover": { backgroundColor: colors.primary[700] },
                          }}
                        >
                          {userUpdateLoading ? "updating...." : `Updating User`}
                        </Button>
                      ) : (
                        <Button
                          disabled={userLoading}
                          data-testid="createuserbtn"
                          type="submit"
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{
                            mt: 2,
                            "&:hover": { backgroundColor: colors.primary[700] },
                          }}
                        >
                          {userLoading ? "Saving...." : `Create User`}
                        </Button>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default UserForm;
