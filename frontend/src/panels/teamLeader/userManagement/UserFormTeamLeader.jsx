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
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Header from "../../../components/Header";
import { getDataFunc, sendDataApiFunc } from "../../../utils/services";
import { Toaster, toast } from "react-hot-toast";
import { tokens } from "../../../theme";
import { UserContextHook } from "../../../contexts/UserContexts";
import { commonRoutes } from "../../../api/apiService";
import { useApi } from "../../../api/useApi";
import MultiSelectDropdown from "../../superAdmin/userManagement/components/MultiSelectDropdown";

// ---
// 1. VALIDATION SCHEMA FIXED
//    A Team Leader can only create an 'executive'
//    and assigns a single 'hospitalName' (string)
// ---
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().when("$isUpdateComp", {
    is: false,
    then: (schema) =>
      schema
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  type: Yup.string().oneOf(["executive"]).required("User Type is required"),
  // hospitalName: Yup.string().required("Hospital is required"),
});

const UserFormTeamLeader = ({ initialState = null, hospitalId, onClose, setUserData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { currentUser } = UserContextHook();
  const [showPassword, setShowPassword] = useState(false);
  const [branchOptions, setBranchOptions] = useState([]);
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
      type: "executive",
      hospitalName: [],
      selectedBranch: [],
      totalLoginTime: 0,
      dailyAccumulatedTime: 0,
    };



  const {
    request: getBranches,
    loading: branchLoading,
    error: branchError,
  } = useApi(commonRoutes.branchesByRole);

  const {
    request: addUser,
    loading: userLoading,
    error: userError,
  } = useApi(commonRoutes.addUsers);
  const {
    request: updateUser,
    loading: userUpdateLoading,
    error: userUpdateError,
  } = useApi(commonRoutes.updateUser);

  useEffect(() => {
    const fetchBranches = async () => {
      try {



        const response = await getBranches(hospitalId);

        setBranchOptions(response?.data);

      } catch (error) {
        console.error("Branch fetch error:", error);
      }
    };

    fetchBranches();

  }, []);

  const handleSubmitForm = async (values) => {
    try {
      // console.log("values are :", values);
      let valuesToSubmit = { ...values };
      valuesToSubmit.hospitalName = [hospitalId]

      valuesToSubmit.selectedBranch = valuesToSubmit?.selectedBranch?.map(
        (item) => item?._id
      ) || [];
      // console.log("selectedBranch are :", valuesToSubmit);

      if (isUpdateComp) {
        const response = await updateUser(initialState?._id, valuesToSubmit);
        if (response?.success) {
          setUserData((prev) =>
            prev.map((user) => (user._id === initialState._id ? response?.data : user)),
          );
          toast.success("Profile Updated");
          onClose();
        }
        else {
          toast.error("Error updating user");
        }

      } else {
        const data = await addUser(valuesToSubmit);
        if (data?.success) {
          setUserData((prev) => [...prev, data?.data])

          console.log("valuesToSubmit", valuesToSubmit);

          toast.success("New User Added")
          onClose();
        }

        else {
          toast.error("Error Adding user");
        }
      }



    } catch (error) {
      console.error("Submit error:", error);
      // toast.error("Error saving user");
    } finally {
      // setSubmitting(false); // End loading state

    }
  };

  useEffect(() => {

    const error = branchError || userError || userUpdateError

    if (error) {
      toast.error(error)
    }

  }, [branchError, userError, userUpdateError])

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      validationSchema={validationSchema}
      validationContext={{ isUpdateComp }}
      validateOnChange={false}
      validateOnBlur={true}
      validate={(values) => {
        const errors = {};
        // Note: Branch validation is not included in schema, add if needed
        return errors;
      }}
      onSubmit={async (values, { resetForm }) => {
        await handleSubmitForm(values);
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
        setFieldValue,
      }) => {
        // Custom handler to fetch branches when hospital changes
        const customHandleChange = (event) => {
          const { name, value } = event.target;

          if (name === "name" && value) {
            try {
              const branchObject = JSON.parse(value);
              handleChange({
                target: { name: "name", value: branchObject },
              });
            } catch (error) {
              handleChange(event);
            }
          } else {
            handleChange(event);
          }

        };

        // Sync matchedBranch from state back to Formik

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
                title={isUpdateComp ? "UPDATE EXECUTIVE" : "CREATE EXECUTIVE"}
                subtitle={
                  isUpdateComp
                    ? "Updating Executive"
                    : "Creating a new Executive"
                }
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
                    autoComplete="new-username"
                    onChange={customHandleChange}
                    onBlur={handleBlur}
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                    fullWidth
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
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
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

                {/* ---
                  4. JSX/UI FIXED
                     - User Type is locked to 'executive'
                     - Hospital is a single-select dropdown
                --- */}
                <Grid item xs={12}>
                  <TextField
                    variant="standard"
                    label="User Type"
                    name="type"
                    value="executive" // Hardcoded
                    fullWidth
                    disabled // User cannot change this
                  />
                </Grid>
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
                  // isSingleSelect={values.type === "executive"} //clean
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
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      <Grid item xs={12}>
                        {isUpdateComp ? (
                          <Button
                            disabled={userUpdateLoading}
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2 }}
                          >
                            {userUpdateLoading ? <CircularProgress /> : "Update User"}
                          </Button>
                        ) :
                          (
                            <Button
                              disabled={userLoading}
                              type="submit"
                              variant="contained"
                              color="primary"
                              fullWidth
                              sx={{ mt: 2 }}
                            >
                              {userLoading ? <CircularProgress /> : " Create User"}
                            </Button>
                          )}
                      </Grid>
                    </Button>
                  ) : (
                    <Button

                      disabled={userLoading}
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {userLoading ? <CircularProgress /> : " Create User"}
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

export default UserFormTeamLeader;
