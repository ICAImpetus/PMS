import React, { useCallback, useContext, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  useTheme,
  Modal,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  CircularProgress, //  Imported for loading spinner
} from "@mui/material";
import {
  Formik,
  Form,
  FieldArray,
  FastField,
  useFormik,
  useFormikContext,
} from "formik";
import { useEffect } from "react";
import {
  initialValues,
  initialValuesWithBranchParent,
} from "../../../../scenes/hospitalform/formData";
import CancelIcon from "@mui/icons-material/Cancel";
import AddBox from "@mui/icons-material/AddBox";
import { sendDataApiFunc } from "../../../../utils/services";
import { Toaster, toast } from "react-hot-toast";
import { tokens } from "../../../../theme";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import * as Yup from "yup";
// import { validateObject } from "./validateFunc"; //  Removed manual validation
import ManagementDetailsAccordion from "./components/ManagementDetailAccordian";
import HospitalBasicDetailAccrodian from "./components/HospitalDetailsAccordian";
import AccountDetailAccordian from "./components/AccoundDetailSection";
import BranchesDetail from "./components/BranchesDetail";
import Header from "../../../../components/HeaderNew";
import { commonRoutes, superAdminRoutes } from "../../../../api/apiService";
import { useApi } from "../../../../api/useApi";
import HospitalContext from "../../../../contexts/HospitalContexts";

//  STRICT YUP VALIDATION SCHEMA (for Create)
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Hospital Name is required"),
  corporateAddress: Yup.string().required("Corporate Address is required"),
  hospitalCode: Yup.string().required("Hospital Code is required"),
  state: Yup.string().required("State is required"),
  city: Yup.string().required("City is required"),

  // Branch Validation
  branches: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Branch Name is required"),
      location: Yup.string().required("Location is required"),
      state: Yup.string().required("State is required"),
      city: Yup.string().required("City is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      code: Yup.string().required("Branch Code is required"),
      beds: Yup.number()
        .typeError("Beds must be a number")
        .positive("Must be positive")
        .max(10000, "Max 1000 beds allowed")
        .integer("Must be a whole number")
        .nullable(),
      contactNumbers: Yup.array()
        .of(
          Yup.string()
            .matches(/^\d{10}$/, "Must be exactly 10 digits")
            .required("Contact is required"),
        )
        .min(1, "At least one contact number is required"),
    }),
  ),

  // Management Validation
  managementDetails: Yup.array().of(
    Yup.object().shape({
      memberType: Yup.string(),
      name: Yup.string(),
      phoneNumber: Yup.string().test(
        "is-valid-phone",
        "Must be exactly 10 digits",
        (value) => !value || /^\d{10}$/.test(value),
      ),
      hospitalDesignation: Yup.string(),
      eaName: Yup.string(),
      eaContactNumber: Yup.string().test(
        "is-valid-phone",
        "Must be exactly 10 digits",
        (value) => !value || /^\d{10}$/.test(value),
      ),
      alignmentOfLocation: Yup.string(),
    }),
  ),
});

const buildFormData = (values) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    //  Handle file
    if (key === "hospitallogo") {
      if (value instanceof File) {
        formData.append("image", value);
      }
      return;
    }

    //  Skip preview
    if (key === "hospitallogoPreview") return;

    //  Object / Array
    if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    //  Normal field
    formData.append(key, value ?? "");
  });

  return formData;
};

//  LOOSE VALIDATION SCHEMA (for Edit - only name required)
const editValidationSchema = Yup.object().shape({
  name: Yup.string().required("Hospital Name is required"),
});

const AddHospitalData1 = ({
  initialState = null,
  refetchHospital,
  handleClose = null,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);


  const { request: handleAddHospital, loading: hospitalLoading, error: hospitalError } = useApi(
    superAdminRoutes.addHospital,
  );

  const { request: updateHospitalApi, loading: updateHospitalLoading, error: updateHospitalError } = useApi(
    superAdminRoutes.updateHospital,
  );



  const handleFormSubmit = async (values) => {
    console.log("form values:", values);

    const formData = buildFormData(values);
    console.log("formData", formData);


    const hospitalId = values._id || values.ID || values.id;
    const isEditing = Boolean(hospitalId);

    try {
      let response;

      if (isEditing) {
        //  UPDATE
        response = await updateHospitalApi(hospitalId, formData);
      } else {
        //  CREATE
        response = await handleAddHospital(formData);


      }
      if (!response?.success) {
        toast.error(response?.message || "Operation failed");
        return
      }

      //  Update UI state
      if (refetchHospital) {
        refetchHospital()
      }

      //  Success
      toast.success(
        response?.message ||
        (isEditing
          ? "Hospital updated successfully"
          : "Hospital added successfully")
      );

      handleClose?.();

    } catch (error) {
      console.error("Submit failed:", error);
      toast.error(error.message || "Something went wrong");
    }
  };
  useEffect(() => {
    const error = hospitalError || null;
    if (error) toast.error(error || "Internal Server Error")
  })
  return (
    <Box
      sx={{
        maxWidth: "900px",
        height: "100vh",
        margin: "auto",
        backgroundColor: colors.primary[900],
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Formik
        initialValues={
          initialState ? initialState : initialValuesWithBranchParent
        }
        enableReinitialize={true}
        // validationSchema={isEditMode ? editValidationSchema : validationSchema}
        onSubmit={handleFormSubmit}
        validateOnChange={false}
        validateOnBlur={true}
      >
        {({
          values,
          handleChange,
          handleBlur,
          errors,
          touched,
          submitForm,
          isValid,
          dirty,
          isSubmitting, //  Tracks API call status
          setFieldValue
        }) => (
          <Form
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {/* Scrollable Content */}
            <Box
              sx={{
                padding: "20px",
                overflowY: "auto",
                flex: 1,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <Typography variant="h4" gutterBottom textAlign={"center"}>
                {initialState?._id || initialState?.ID || initialState?.id
                  ? `Edit Hospital Basic Details`
                  : `Hospital Creation Form`}
              </Typography>

              {/* Components */}
              <HospitalBasicDetailAccrodian
                isUpdated={(initialState?._id || initialState?.ID || initialState?.id) ? true : false}
                values={values}
                setFieldValue={setFieldValue}
                handleChange={handleChange}
                handleBlur={handleBlur}
                touched={touched}
                errors={errors}
                colors={colors}
              />

              <AccountDetailAccordian
                values={values}
                handleChange={handleChange}
                colors={colors}
              />

              {/* IVR Section /}
              {/* <Accordion sx={{ backgroundColor: colors.primary[900] }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">IVR & Dialer Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FieldArray name="ivrDetails">
                    {({ push, remove }) => (
                      <Grid container spacing={2}>
                        {values.ivrDetails?.map((ivr, index) => (
                          <Grid container item xs={12} spacing={2} key={index}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                label="IVR Number"
                                name={`ivrDetails[${index}].ivrNumber`}
                                value={ivr.ivrNumber}
                                onChange={handleChange}
                                fullWidth
                                variant="standard"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Box>
                                <input
                                  accept=".wav,.mp3,.mp4"
                                  style={{ display: "none" }}
                                  id={`ivr-file-${index}`}
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      handleChange({
                                        target: {
                                          name: `ivrDetails[${index}].ivrConfig`,
                                          value: file.name,
                                        },
                                      });
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`ivr-file-${index}`}
                                  style={{ width: "100%", display: "block" }}
                                >
                                  <Button
                                    variant="contained"
                                    component="span"
                                    fullWidth
                                    sx={{
                                      textTransform: "none",
                                      backgroundColor: "#1976d2",
                                      color: "white",
                                    }}
                                  >
                                    {ivr.ivrConfig || "📁 Choose File"}
                                  </Button>
                                </label>
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Button
                                onClick={() => remove(index)}
                                color="secondary"
                                variant="outlined"
                                startIcon={<CancelIcon />}
                              >
                                Remove IVR
                              </Button>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            onClick={() =>
                              push({ ivrNumber: "", ivrConfig: "" })
                            }
                            color="secondary"
                            startIcon={<AddBox />}
                            variant="outlined"
                          >
                            Add Ivr
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                  </FieldArray>
                </AccordionDetails>
              </Accordion> */}

              <Accordion
                sx={{ backgroundColor: colors.primary[900] }}
                data-testid="managementdetailstest"
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Management Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FieldArray name="managementDetails">
                    {({ push, remove }) => (
                      <ManagementDetailsAccordion
                        values={values}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        touched={touched}
                        errors={errors}
                        push={push}
                        remove={remove}
                      />
                    )}
                  </FieldArray>
                </AccordionDetails>
              </Accordion>

              {!initialState && values?.itsBranch === false && (
                <Accordion
                  data-testid="branchdetailstest"
                  sx={{ backgroundColor: colors.primary[900] }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Branch Details</Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <FieldArray name="branches">
                      {({ push, remove }) => (
                        <Grid container spacing={2}>
                          <BranchesDetail
                            values={values}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            touched={touched}
                            errors={errors}
                            push={push}
                            remove={remove}
                          />

                          <Grid item xs={12}>
                            <Button
                              onClick={() =>
                                push({
                                  ...initialValues.branches[0],
                                  departments: [...initialValues.departments],
                                  empanelmentList: [...initialValues.empanelmentList],
                                  testLabs: [...initialValues.testLabs],
                                  codeAnnouncements: [...initialValues.codeAnnouncements],
                                  ipdDetails: { ...initialValues.ipdDetails },
                                  dayCareDetails: { ...initialValues.dayCareDetails },
                                  procedureList: [...initialValues.procedureList],
                                  departmentIncharge: [...initialValues.departmentIncharge],
                                })
                              }
                              color="secondary"
                              startIcon={<AddBox />}
                              variant="outlined"
                            >
                              Add Branch
                            </Button>
                          </Grid>
                        </Grid>
                      )}
                    </FieldArray>
                  </AccordionDetails>
                </Accordion>
              )}
              {/* {(initialState  && !values?.itsBranch) ? null : (
                <Accordion
                  data-testid="branchdetailstest"
                  sx={{ backgroundColor: colors.primary[900] }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Branch Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FieldArray name="branches">
                      {({ push, remove }) => (
                        <Grid container spacing={2}>
                          <BranchesDetail
                            values={values}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            touched={touched}
                            errors={errors}
                            push={push}
                            remove={remove}
                          />
                          <Grid item xs={12}>
                            <Button
                              onClick={() =>
                                push({
                                  ...initialValues.branches[0],
                                  departments: [...initialValues.departments],
                                  empanelmentList: [
                                    ...initialValues.empanelmentList,
                                  ],
                                  testLabs: [...initialValues.testLabs],
                                  codeAnnouncements: [
                                    ...initialValues.codeAnnouncements,
                                  ],
                                  ipdDetails: { ...initialValues.ipdDetails },
                                  dayCareDetails: {
                                    ...initialValues.dayCareDetails,
                                  },
                                  procedureList: [
                                    ...initialValues.procedureList,
                                  ],
                                  departmentIncharge: [
                                    ...initialValues.departmentIncharge,
                                  ],
                                })
                              }
                              color="secondary"
                              startIcon={<AddBox />}
                              variant="outlined"
                            >
                              Add Branch
                            </Button>
                          </Grid>
                        </Grid>
                      )}
                    </FieldArray>
                  </AccordionDetails>
                </Accordion>
              )} */}
            </Box>

            {/*  Footer with Loading Button */}
            <Box
              sx={{
                padding: "16px 20px",
                borderTop: `1px solid ${colors.grey[700]}`,
                backgroundColor: colors.primary[800],
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Button
                onClick={submitForm}
                data-testid="hospitalsubmitbtntest"
                variant="outlined"
                color="secondary"
                //  Enabled to allow showing validation errors on click
                disabled={isSubmitting}
                sx={{
                  minWidth: "140px",
                  height: "40px",
                  ":hover": {
                    borderColor: "green",
                    backgroundColor: "#379777",
                    color: "black",
                  },
                  ":disabled": {
                    borderColor: "gray",
                    color: "gray",
                    cursor: "not-allowed",
                  },
                }}
              >
                {/*  Spinner Logic */}
                {(updateHospitalLoading || hospitalLoading) ? (
                  <CircularProgress size={24} color="inherit" />
                ) : initialState?._id ||
                  initialState?.ID ||
                  initialState?.id ? (
                  "Update Hospital"
                ) : (
                  "Submit"
                )}
              </Button>

              {handleClose && (
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  color="error"
                  disabled={hospitalLoading || updateHospitalLoading}
                  sx={{
                    ":hover": {
                      borderColor: "red",
                      backgroundColor: "#f44336",
                      color: "black",
                    },
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default AddHospitalData1;
