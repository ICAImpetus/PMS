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
  Typography,
  Switch,
  FormControlLabel,
  CircularProgress,
  Popover,
  Tooltip
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"
import Header from "../../../components/Header";
import { tokens } from "../../../theme";
import MultiSelectDropdown from "../../superAdmin/userManagement/components/MultiSelectDropdown";
import { useApi } from "../../../api/useApi";
import { commonRoutes } from "../../../api/apiService";
import toast from "react-hot-toast";

// Validation Schema
const validationSchema = Yup.object({
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

  type: Yup.string().required("User Type is required"),

  // hospitalName: Yup.array().when("type", {
  //   is: (type) => type === "supermanager" || type === "teamleader",
  //   then: (schema) => schema.min(1, "At least one hospital is required"),
  //   otherwise: (schema) => schema.notRequired(),
  // }),

  selectedBranch: Yup.array().when("type", {
    is: (type) => type === "teamleader" || type === "executive",
    then: (schema) => schema.min(1, "At least one branch is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  canDelete: Yup.boolean().default(false),
});

const UserFormAdmin = ({
  initialState = null,
  onClose,
  allUsers = [],
  refetchUsers,
  hospitalId,
  anyFieldDisabled = false
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showPassword, setShowPassword] = useState(false);
  const [teamLeaders, seteamLeaders] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [open, setOpen] = useState(false);

  const isUpdateComp = !!initialState;
  console.log("isUpdateComp", initialState);

  const initialValues = useMemo(() => ({
    name: initialState?.name ?? "",
    email: initialState?.email ?? "",
    username: initialState?.username ?? "",
    password: "",

    type: isUpdateComp
      ? (initialState?.type ?? "")
      : "",

    selectedBranch: Array.isArray(initialState?.branches)
      ? initialState.branches
      : (initialState?.branches ? [initialState.branches] : []),

    canDelete: initialState?.canDelete ?? false,
  }), [initialState, isUpdateComp]);
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
  } = useApi(commonRoutes.getAllHospital);

  const {
    request: assignData,
    loading: assignLoading,
    error: assignError,
  } = useApi(commonRoutes.assignData);




  const handleSubmitForm = async (values, formikHelpers) => {
    try {

      let valuesToSubmit = { ...values };
      valuesToSubmit.hospitalName = [hospitalId]

      valuesToSubmit.selectedBranch = valuesToSubmit?.selectedBranch?.map(
        (item) => item?._id
      ) || [];
      // console.log("selectedBranch are :", valuesToSubmit);

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
          formikHelpers?.resetForm();
          onClose();

        }

      }


    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error saving user");
    } finally {
      // setSubmitting(false); // End loading state

    }
  };
  // const teamLeaders = [
  //   { id: 1, name: "Rahul" },
  //   { id: 2, name: "Amit" },
  //   { id: 3, name: "Vikas" },
  // ];

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    console.log("user", allUsers);
    console.log("leaderHospital", initialState);

    const leader = initialState
    if (!leader?._id || !Array.isArray(allUsers)) {
      toast.error("Invalid data");
      return;
    }


    const leaderHospital = leader?.hospitals?.[0]?.hospitalId || leader?.hospitals?.[0]?._id;
    console.log("leaderHospital", leaderHospital);


    if (!leaderHospital) {
      toast.error("Leader hospital missing");
      return;
    }

    const leaders = (allUsers || []).filter((u) => {
      const hospitalId = u?.hospitals?.[0]?.hospitalId || u?.hospitals?.[0]?._id;

      const isTeamLeader =
        typeof u?.type === "string" &&
        u.type.toLowerCase() === "teamleader";

      const notSameuser = leader?._id !== u?._id

      return notSameuser && isTeamLeader && hospitalId === leaderHospital;
    });

    seteamLeaders(leaders);

    setAnchorEl(event?.currentTarget || null);
    setOpen(true);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
    seteamLeaders([])
  };
  const handleAssign = async (leader) => {
    try {
      const fromId = initialState?._id;
      const toId = leader?._id;

      //  validation
      if (!fromId || !toId) {
        toast.error("Invalid user data");
        return;
      }

      const res = await assignData(fromId, toId);
      if (res?.success) {
        setAllUsers((prev) =>
          prev.map((user) => {
            if (user._id === res?.data?.toUser?._id) {
              return res.data.toUser;
            }

            return user;
          })
        );
        toast.success("User Profile Is Updated");
        handleClose();
      }

      // else {
      //   toast.error(res?.error?.message || "Assignment failed");
      //   handleClose();
      // }

    } catch (error) {
      console.error("Assign error:", error);
      toast.error("Something went wrong ");
      handleClose();
    }
  };
  useEffect(() => {
    const error =
      assignError ||
      hosApiError ||
      branchError ||
      userError;

    if (error) {
      // toast.error(error);
      toast.error(error);
    }
  }, [assignError, hosApiError, branchError, userError]);

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      context={{ isUpdateComp }}
      onSubmit={async (values, formikHelpers) => {
        await handleSubmitForm(values, formikHelpers);
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
        // useEffect(() => {
        //   if (!hospitals.length || !allUsers.length || !values.type) {
        //     setParentUserOptions([]);
        //     return;
        //   }

        //   const hasOverlap = (arr1, arr2) => arr1.some(item => arr2.includes(item));

        //   const getUserHospitals = (user) => {
        //     if (Array.isArray(user.hospitalName)) return user.hospitalName;
        //     if (Array.isArray(user.hospitalNames)) return user.hospitalNames;
        //     if (typeof user.hospitalName === 'string') return [user.hospitalName];
        //     if (typeof user.hospitalNames === 'string') return [user.hospitalNames];
        //     return [];
        //   };

        //   let options = [];
        //   if (values.type === 'teamleader') {
        //     options = allUsers.filter(user => {
        //       if (user.type !== 'supermanager') return false;
        //       const userHosp = getUserHospitals(user);
        //       return hasOverlap(userHosp, hospitals);
        //     });
        //   } else if (values.type === 'executive') {
        //     options = allUsers.filter(user => {
        //       if (user.type !== 'teamleader') return false;
        //       const userHosp = getUserHospitals(user);
        //       return hasOverlap(userHosp, hospitals);
        //     });
        //   }
        //   setParentUserOptions(options.map(user => user.username));
        // }, [hospitals, values.type, allUsers]);

        useEffect(() => {
          const fetchBranches = async () => {
            // If not teamleader or executive → clear branches
            if (values.type !== "teamleader" && values.type !== "executive") {
              setBranchOptions([]);
              setFieldValue("selectedBranch", []);
              return;
            }

            try {

              console.log("Calling API with IDs:", hospitalId);

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

        const customHandleChange = (event) => {
          const { name, value } = event.target;
          if (name === "name" && value) {
            try {
              const branchObject = JSON.parse(value);
              handleChange({ target: { name: "name", value: branchObject } });
            } catch (error) {
              handleChange(event);
            }
          } else {
            handleChange(event);
          }
        };


        useEffect(() => {
          if (initialState && isUpdateComp) {
            const formattedBranches = initialState.branches?.map(branch => ({
              _id: branch.branchId,
              name: branch.name
            })) || [];

            setFieldValue("selectedBranch", formattedBranches);
          }
        }, [initialState]);


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
                subtitle={
                  isUpdateComp ? "Updating User" : "Managing User creation"
                }
              />

              {/* migrate data */}

              {isUpdateComp && values.type?.toLowerCase() === "teamleader" && (
                <>
                  <Box display="flex" justifyContent="flex-end">
                    <Button variant="outlined" onClick={handleClick}>
                      Migrate to &gt;
                    </Button>
                  </Box>

                  <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        width: 250,
                        backgroundColor: "#fff", // white background
                        borderRadius: 2,
                        boxShadow: 3,
                      }}
                    >
                      <Typography variant="h5" mb={1}>
                        Assign to
                      </Typography>

                      {(!teamLeaders || teamLeaders.length === 0) && (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            textAlign: "center",
                            color: "gray",
                            cursor: "default",
                          }}
                        >
                          No Team Leader Found
                        </Box>
                      )}
                      {teamLeaders.length > 0 &&
                        teamLeaders.map((leader) => (
                          <Box
                            key={leader._id}
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              cursor: assignLoading ? "not-allowed" : "pointer",
                              opacity: assignLoading ? 0.5 : 1,
                              pointerEvents: assignLoading ? "none" : "auto",
                              "&:hover": {
                                backgroundColor: assignLoading ? "transparent" : "#f5f5f5",
                              },
                            }}
                            onClick={() => !assignLoading && handleAssign(leader)}
                          >
                            {assignLoading ? <CircularProgress size={20} /> : leader.name}
                          </Box>
                        ))}
                    </Box>
                  </Popover>
                </>

              )}

              {/* Can Delete Toggle - Only for admin updates - Top Right */}


              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {" "}
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
                  />{" "}
                </Grid>
                <Grid item xs={12}>
                  {" "}
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
                  />{" "}
                </Grid>
                <Grid item xs={12} sm={isUpdateComp ? 12 : 6}>
                  {" "}
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
                  />{" "}
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
                <Grid item xs={12} sm={12}>
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
                    <Tooltip title={anyFieldDisabled ? "Super Managers Already Created " : ""}>
                      <span>
                        <MenuItem value="supermanager" disabled={anyFieldDisabled}>
                          Super Manager
                        </MenuItem>
                      </span>
                    </Tooltip>
                    {isUpdateComp && values.type === "supermanager" && (
                      <MenuItem value="supermanager">
                        Super Manager
                      </MenuItem>
                    )}

                    <MenuItem value="teamleader">Team Leader</MenuItem>
                    {/* {values?.type && values?.type === "executive" && ( */}
                    <MenuItem value="executive">Executive</MenuItem>
                    {/* )} */}
                  </TextField>
                </Grid>
                {(values.type === "teamleader" ||
                  values.type === "executive") && (
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
                  )}
                {/* ── INFO: Assigned Super Managers for selected hospitals (shown when type = supermanager) ── */}
                {/* {values.type === "supermanager" && hospitals.length > 0 && (() => {
                  const assignedSMs = allUsers.filter((u) => {
                    if (u.type !== "supermanager") return false;
                    const userHosp = Array.isArray(u.hospitalNames)
                      ? u.hospitalNames
                      : Array.isArray(u.hospitalName)
                        ? u.hospitalName
                        : typeof u.hospitalName === "string"
                          ? [u.hospitalName]
                          : [];
                    return userHosp.some((h) => hospitals.includes(h));
                  });
                  return assignedSMs.length > 0 ? (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 1.5,
                          border: `1px solid ${colors.blueAccent?.[700] || "#1565c0"}`,
                          borderRadius: 1,
                          backgroundColor: colors.blueAccent?.[900] || "rgba(21,101,192,0.08)",
                        }}
                      >
                        <Box sx={{ fontSize: "0.75rem", color: colors.grey?.[300] || "#aaa", mb: 0.5 }}>
                          Super Managers already assigned to selected hospital(s):
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {assignedSMs.map((u) => (
                            <Box
                              key={u.username}
                              sx={{
                                display: "inline-block",
                                px: 1.2,
                                py: 0.3,
                                borderRadius: 2,
                                backgroundColor: colors.blueAccent?.[700] || "#1565c0",
                                color: "#fff",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                              }}
                            >
                              {u.name || u.username}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  ) : null;
                })()} */}

                {/* {values.type === "executive" && hospitals.length === 1 && (
                  <Grid item xs={12}>
                    <TextField
                      variant="standard"
                      select
                      label="Select Branch"
                      name="name"
                      value={values.name ? JSON.stringify(values.name) : ""}
                      onChange={customHandleChange}
                      onBlur={handleBlur}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      fullWidth
                    >
                      <MenuItem value="">
                        {branches.length === 0 ? "No branches found" : "Select Branch"}
                      </MenuItem>
                      {branches.map((branch, index) => (
                        <MenuItem key={index} value={JSON.stringify(branch)}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )} */}

                {/* ---
                  THE TYPO FIX IS HERE: xs={1S} is now xs={12}
                  --- */}
                {/* {(values.type === 'teamleader' || values.type === 'executive') && (
                  <Grid item xs={12}>
                    <MultiSelectDropdown
                      options={parentUserOptions}
                      selectedOptions={selectedParentUsers}
                      setSelectedOptions={setSelectedParentUsers}
                      label={parentUserOptions.length > 0 ? "Select Parent User(s)" : (hospitals.length > 0 ? "No parent users found" : "Please select hospital(s) first")}
                      disabled={parentUserOptions.length === 0}
                    />
                    {touched.parentUsers && errors.parentUsers && (
                      <div style={{ color: '#f44336', fontSize: '0.75rem', marginTop: '3px', marginLeft: '14px' }}>
                        {errors.parentUsers}
                      </div>
                    )}
                  </Grid>
                )} */}

                <Grid item xs={12}>
                  {isUpdateComp ? (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={userUpdateLoading}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {userUpdateLoading ? <CircularProgress /> : "Update User"}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={userLoading}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {userLoading ? <CircularProgress /> : "Create User"}
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

export default UserFormAdmin;
