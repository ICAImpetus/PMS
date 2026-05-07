import React, { useState, useEffect, useMemo } from "react";
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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Header from "../../../components/Header";
import { toast } from "react-hot-toast";
import { tokens } from "../../../theme";
import MultiSelectDropdown from "../../superAdmin/userManagement/components/MultiSelectDropdown";

import { commonRoutes } from "../../../api/apiService";
import { useApi } from "../../../api/useApi";

// Validation Schema
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().when('$isUpdateComp', {
    is: false,
    then: (schema) => schema.min(6, "Password must be at least 6 characters").required("Password is required"),
    otherwise: (schema) => schema.notRequired()
  }),
  type: Yup.string().oneOf(['teamleader', 'executive'], "Invalid user type").required("User Type is required"),
  // hospitalName: Yup.array()
  //   .of(
  //     Yup.object().shape({
  //       _id: Yup.string().required("Hospital id required"),
  //       name: Yup.string().required("Hospital name required"),
  //     })
  //   )
  //   .min(1, "At least one hospital is required")
  //   .required("Hospital is required"),
  selectedBranch: Yup.array().when("type", {
    then: (schema) =>
      schema.min(1, "At least one branch is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

});


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

  const [hospitals, setHospitals] = useState([]);
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
    request: allHospital,
    loading: hosApiLoading,
    error: hosApiError,
  } = useApi(commonRoutes.getAllHospital);

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



  useEffect(() => {
    setHospitals(initialHospitals);
    setSelectedParentUsers(initialState?.parentUsers || []);
  }, [initialHospitals, initialState]);


  useEffect(() => {
    const fetchHospitals = async () => {
      const response = await allHospital();
      // setHospitalNames(response?.data);
      setHospitals(response?.data);

    };
    fetchHospitals();
  }, []);

  const handleSubmitForm = async (values) => {
    try {
      console.log("values are :", values);
      // setSubmitting(true); // Start loading state



      let valuesToSubmit = { ...values };
      valuesToSubmit.hospitalName = [hospitalId]

      valuesToSubmit.selectedBranch = valuesToSubmit?.selectedBranch?.map(
        (item) => isUpdateComp ? item?.branchId : item?._id
      ) || [];
      console.log("selectedBranch are :", valuesToSubmit);

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
      validationSchema={validationSchema}
      validationContext={{ isUpdateComp }}
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

        useEffect(() => {
          const fetchBranches = async () => {
            try {
              //  ALWAYS convert to pure ID array
              if (!hospitalId) return;

              console.log("Calling API with IDs:", hospitalId);

              const response = await getBranches(hospitalId);

              setBranchOptions(response?.data || []);

            } catch (error) {
              console.error("Branch fetch error:", error);
            }
          };

          fetchBranches();

        }, [hospitalId]);

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
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? (<VisibilityOff />) : (<Visibility />)}
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