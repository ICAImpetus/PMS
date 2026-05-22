import React, { useState, useEffect, useMemo, useContext } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  IconButton,
  InputAdornment,
  useTheme,
  Grid,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Header from "../../../components/Header";
import { toast } from "react-hot-toast";
import { tokens } from "../../../theme";
import MultiSelectDropdown from "../../superAdmin/userManagement/components/MultiSelectDropdown";
import { HospitalContext } from "../../../contexts/HospitalContexts";
import { commonRoutes } from "../../../api/apiService";
import { useApi } from "../../../api/useApi";
import { getValidationSchema } from "../.././Schemas/validation";

const UserFormSupermanager = ({ initialState = null, onClose, allUsers = [], refetchUsers, hospitalId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showPassword, setShowPassword] = useState(false);
  const initialHospitals = useMemo(() => {
    if (Array.isArray(initialState?.hospitalName)) {
      return initialState.hospitalName;
    }
    if (typeof initialState?.hospitalName === 'string') {
      return [initialState.hospitalName];
    }
    return initialState?.hospitalNames || [];
  }, [initialState]);

  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedParentUsers, setSelectedParentUsers] = useState(initialState?.parentUsers || []);

  const isUpdateComp = initialState ? true : false;

  const initialValues = initialState
    ? {
      ...initialState,
      hospitalName: Array.isArray(initialState?.hospitals)
        ? initialState.hospitals
        : initialState.hospitals
          ? [initialState.hospitals]
          : [],
      selectedBranch: Array.isArray(initialState.branches)
        ? initialState?.branches
        : initialState?.branches
          ? Array.isArray(initialState.branches)
            ? initialState?.branches
            : [initialState?.branches]
          : [],
    }
    : {
      name: "",
      email: "",
      username: "",
      password: "",
      type: "",
      hospitalName: [],
      selectedBranch: [],
      totalLoginTime: 0,
      dailyAccumulatedTime: 0,
    };



  const {
    request: getBranches,
    loading: branchLoading,
    error: branchError,
  } = useApi(commonRoutes.getSelectedBranches);

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

  const { selectedHostpital } = useContext(HospitalContext);


  useEffect(() => {
    const fetchBranches = async () => {
      try {
        // //  ALWAYS convert to pure ID array
        // console.log("Selected Hospital in useEffect:", selectedHostpital);
        if (!selectedHostpital) return;

        const response = await getBranches(selectedHostpital);

        setBranchOptions(response?.data || []);

      } catch (error) {
        console.error("Branch fetch error:", error);
      }
    };

    fetchBranches();

  }, [selectedHostpital]);
  const handleSubmitForm = async (values) => {
    try {

      // setSubmitting(true); // Start loading state



      let valuesToSubmit = { ...values };
      valuesToSubmit.hospitalName = [selectedHostpital]

      valuesToSubmit.selectedBranch = valuesToSubmit?.selectedBranch?.map(
        (item) => isUpdateComp ? item?.branchId : item?._id
      ) || [];

      if (isUpdateComp) {
        const response = await updateUser(initialState?._id, valuesToSubmit);
        if (response?.success) {
          if (refetchUsers) await refetchUsers()
          toast.success("Profile Updated");
          onClose();
        }

      } else {
        const data = await addUser(valuesToSubmit);
        if (data?.success) {
          if (refetchUsers) await refetchUsers()
          toast.success("New User Added")
          onClose();

        }

      }



    } catch (error) {
      console.error("Submit error:", error);
      // toast.error("Error saving user");
    }
  };
  useEffect(() => {
    const error = userError || userUpdate
    if (error) {
      toast.error(error || "Internal Server Error")
    }
  }, [userError, userUpdate])
  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      validationSchema={getValidationSchema(
        isUpdateComp
      )}
      validateOnChange={false}
      validateOnBlur={true}
      // validate={(values) => {
      //   const errors = {};
      //   if (hospitals.length === 0) {
      //     errors.hospitalName = "At least one hospital is required";
      //   }
      //   return errors;
      // }}
      onSubmit={async (values, { resetForm }) => {
        console.log("Form values on submit:", values);
        await handleSubmitForm(values);
        if (!isUpdateComp) {
          resetForm();
        }
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => {

        const customHandleChange = (event) => {
          const { name, value } = event.target;
          if (name === "name" && value) {
            try {
              const branchObject = JSON.parse(value);
              handleChange({ target: { name: "name", value: branchObject } });
            } catch (error) { handleChange(event); }
          } else {
            handleChange(event);
          }
        };


        return (
          <Form>
            <Box
              sx={{
                maxWidth: 600,
                bgcolor: colors.primary[800],
                p: 4,
                borderRadius: 2,
                boxShadow: 3,
                minHeight: "auto",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <Header
                title={isUpdateComp ? "UPDATE USER" : "CREATE USER"}
                subtitle={isUpdateComp ? "Updating User" : "Managing User creation"}
              />



              <Grid container spacing={2}>

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

                {/* ---
                  FIX: Added disabled={isUpdateComp}
                  --- */}
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
                    disabled={isUpdateComp}
                  />
                </Grid>

                {/* ---
                  FIX: Added disabled={isUpdateComp}
                  --- */}
                <Grid item xs={12} sm={isUpdateComp ? 12 : 6}>
                  <TextField
                    variant="standard"
                    label="Username"
                    name="username"
                    type="text"
                    value={values.username}
                    autoComplete="new-username"
                    onChange={customHandleChange}
                    onBlur={handleBlur}
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                    fullWidth
                    disabled={isUpdateComp}
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

                <Grid item xs={12} sm={12} >
                  <TextField
                    variant="standard"
                    select
                    label="User Type"
                    name="type"
                    value={values.type}
                    onChange={customHandleChange}
                    onBlur={handleBlur}
                    error={touched.type && Boolean(errors.type)}
                    helperText={touched.type && errors.type}
                    fullWidth
                    disabled={isUpdateComp}
                  >
                    <MenuItem value="">Select User Type</MenuItem>
                    <MenuItem value="teamleader">Team Leader</MenuItem>
                    <MenuItem value="executive">Executive</MenuItem>
                  </TextField>
                </Grid>
                {/* 
                <Grid item xs={12}>
                  <MultiSelectDropdown
                    options={hospitals}
                    selectedOptions={values.hospitalName}
                    setSelectedOptions={(val) =>
                      setFieldValue("hospitalName", val)
                    }
                    role={values.type}
                    label="Select Hospital(s)"
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
                </Grid> */}
                <Grid item xs={12}>
                  <MultiSelectDropdown
                    options={branchOptions}
                    selectedOptions={values.selectedBranch}
                    setSelectedOptions={(val) =>
                      setFieldValue("selectedBranch", val)
                    }
                    label="Select Branch(s)"
                    role={values.type}
                    currentId={initialState?._id}
                  // isSingleSelect={values.type === "executive" ? true : false}
                  />

                  {touched.selectedBranch && errors.selectedBranch && (
                    <div
                      style={{
                        color: "#f44336",
                        fontSize: "0.75rem",
                        marginTop: "3px",
                        marginLeft: "14px",
                      }}
                    >
                      {errors.selectedBranch}
                    </div>
                  )}
                </Grid>


                <Grid item xs={12}>
                  {isUpdateComp ? (
                    <Button type="submit" disabled={userUpdateLoading} variant="contained" color="primary" fullWidth sx={{ mt: 2 }} >
                      {userUpdateLoading ? <CircularProgress size={22} /> : "Update User"}
                    </Button>
                  ) : (
                    <Button disabled={userLoading} type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} >
                      {userLoading ? <CircularProgress size={22} /> : "Create User"}
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};

export default UserFormSupermanager;