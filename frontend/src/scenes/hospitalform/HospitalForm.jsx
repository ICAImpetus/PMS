import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  useTheme,
  Modal,
  CircularProgress,
} from "@mui/material";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import BranchForm from "./formComponts/BranchForm";
import DepartmentForm from "./formComponts/DepartmentForm";
import EmpanelmentListForm from "./formComponts/EmpanelmentListForm";
import TestLabForm from "./formComponts/TestLabForm";
import CodeAnnouncementForm from "./formComponts/CodeAnnouncementForm";
import IPDDetailsForm from "./formComponts/IPDDetailsForm";
import DayCareDetailsForm from "./formComponts/DayCareDetailsForm";
import ProcedureListForm from "./formComponts/ProcedureListForm";
import DepartmentInchargeForm from "./formComponts/DepartmentInchargeForm";
import { AddBox } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import { initialValues } from "./formData";
import ModalComponent from "./ModalComponent";
import axios from "axios"; // Import axios
import { validateObject } from "../../panels/superAdmin/hospitalManagement/hospitalForm/validateFunc";

// Simplified validation schema for debugging
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Hospital name is required")
    .min(2, "Hospital name must be at least 2 characters"),

  contactNumbers: Yup.array()
    .of(
      Yup.string()
        .required("Contact number is required")
        .matches(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
    )
    .min(1, "At least one contact number is required"),

  branches: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .required("Branch name is required")
          .min(2, "Branch name must be at least 2 characters"),

        location: Yup.string()
          .required("Branch location is required")
          .min(2, "Branch location must be at least 2 characters"),

        contactNumbers: Yup.array()
          .of(
            Yup.string()
              .required("Contact number is required")
              .matches(
                /^[6-9]\d{9}$/,
                "Please enter a valid 10-digit mobile number",
              ),
          )
          .min(1, "At least one contact number is required"),
      }),
    )
    .min(1, "At least one branch is required"),
});

const HospitalForm = () => {
  const [step, setStep] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const theme = useTheme();

  const textFieldStyleObj = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: theme.palette.mode === "dark" ? "#fff" : "black",
      },
      "&:hover fieldset": {
        borderColor: theme.palette.mode === "dark" ? "#379777" : "#379777",
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.mode === "dark" ? "#EEEEEE" : "black",
        borderWidth: 2,
      },
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.mode === "dark" ? "#EEEEEE" : "black",
    },
    "& .MuiFormHelperText-root": {
      color: theme.palette.mode === "dark" ? "#EEEEEE" : "black",
    },
  };

  const steps = [
    "Hospital Details",
    "Contact Numbers",
    "Branches",
    "Departments",
    "Empanelment List",
    "Test Labs",
    "Code Announcements",
    "IPD Details",
    "Day Care Details",
    "Procedure List",
    "Department Incharge",
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // --- UPDATED SUBMIT HANDLER ---
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);

      // 1. Get Token (Ensure key matches what you use in login)
      const token = localStorage.getItem("jwtToken");

      // 2. Make API Call (Replace with your actual backend URL)
      const response = await axios.post(
        "http://localhost:5000/api/hospitals/add",
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        alert("Hospital Data Saved Successfully!");
        setIsPreviewOpen(false);
        // Optional: redirect or reset form here
      } else {
        alert("Failed to save data: " + response.data.message);
      }
    } catch (error) {
      console.error("Error saving hospital:", error);
      alert("Error connecting to server. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleEdit = () => {
    setIsPreviewOpen(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={true}
      validateOnBlur={true}
      onSubmit={handleSubmit} // Connected the updated submit handler
    >
      {({
        values,
        handleChange,
        submitForm,
        isSubmitting,
        isValid,
        errors,
        touched,
      }) => {

        // Use the validateObject function for cleaner validation
        const requiredFields = {
          name: values.name,
          "contactNumbers[0]": values.contactNumbers?.[0],
          "branches[0].name": values.branches?.[0]?.name,
          "branches[0].location": values.branches?.[0]?.location,
          "branches[0].contactNumbers[0]":
            values.branches?.[0]?.contactNumbers?.[0],
        };

        const manualIsValid = validateObject(requiredFields);
        return (
          <Form>
            <Box>
              <Typography variant="h4" gutterBottom>
                Hospital Creation Formsss
              </Typography>

              {/* Render the current step */}
              {step === 0 && (
                <Box mb={3}>
                  <TextField
                    label="Hospital Name"
                    variant="filled"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleChange}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    fullWidth
                    sx={textFieldStyleObj}
                  />
                </Box>
              )}

              {step === 1 && (
                <FieldArray name="contactNumbers">
                  {({ push, remove }) => (
                    <Box mb={3}>
                      {values.contactNumbers.map((_, index) => (
                        <Box
                          key={index}
                          mb={2}
                          display="flex"
                          justifyContent="space-between"
                        >
                          <TextField
                            label={`Contact Number ${index + 1}`}
                            variant="filled"
                            name={`contactNumbers[${index}]`}
                            value={values.contactNumbers[index]}
                            onChange={handleChange}
                            onBlur={handleChange}
                            error={
                              touched.contactNumbers?.[index] &&
                              Boolean(errors.contactNumbers?.[index])
                            }
                            helperText={
                              touched.contactNumbers?.[index] &&
                              errors.contactNumbers?.[index]
                            }
                            fullWidth
                            sx={textFieldStyleObj}
                          />
                          <IconButton
                            onClick={() => remove(index)}
                            variant="outlined"
                            sx={{ mt: 1, mr: 1 }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        onClick={() => push("")}
                        color="secondary"
                        startIcon={<AddBox />}
                        variant="outlined"
                      >
                        Add Contact Number
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              )}

              {step === 2 && (
                <FieldArray name="branches">
                  {({ push, remove }) => (
                    <Box mb={3}>
                      {values.branches.map((branch, index) => (
                        <Box key={index} mb={3}>
                          <BranchForm
                            branch={branch}
                            index={index}
                            handleChange={handleChange}
                            removeBranch={() => remove(index)}
                          />
                        </Box>
                      ))}
                      <Button
                        onClick={() =>
                          push({
                            name: "",
                            location: "",
                            contact: "",
                            contactNumbers: [""],
                            code: "",
                            beds: "",
                            departments: [], // Added default empty departments array
                          })
                        }
                        color="secondary"
                        variant="outlined"
                      >
                        Add Branch
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              )}

              {step === 3 && (
                <FieldArray name="departments">
                  {({ push, remove }) => (
                    <Box mb={3}>
                      {values.departments.map((department, index) => (
                        <Box key={index} mb={3}>
                          <DepartmentForm
                            department={department}
                            index={index}
                            handleChange={handleChange}
                            removeDepartment={() => remove(index)}
                          />
                        </Box>
                      ))}
                      <Button
                        onClick={() =>
                          push({
                            name: "",
                            doctors: [
                              {
                                name: "",
                                opdNo: "",
                                specialties: [""],
                                timings: { morning: "", evening: "" },
                                opdDays: "",
                                experience: "",
                                contactNumber: "",
                                extensionNumber: "",
                                paName: "",
                                paContactNumber: "",
                                consultationCharges: "",
                                videoConsultation: {
                                  enabled: false,
                                  timeSlot: "",
                                  charges: "",
                                  days: "",
                                },
                                teleMedicine: "",
                                empanelmentList: [""],
                                additionalInfo: "",
                                descriptionOfServices: "",
                                isEnabled: true,
                              },
                            ],
                          })
                        }
                        color="secondary"
                        variant="outlined"
                      >
                        Add Department
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              )}

              {/* Steps 4 through 10 remain unchanged (omitted for brevity, assume they are exactly as your previous code) */}
              {step === 4 && (
                <FieldArray name="empanelmentList">
                  {({ push, remove }) => (
                    <Box mb={3}>
                      {values.empanelmentList.map((empanelment, index) => (
                        <Box key={index} mb={3}>
                          <EmpanelmentListForm
                            empanelment={empanelment}
                            index={index}
                            handleChange={handleChange}
                            removeEmpanelment={() => remove(index)}
                          />
                        </Box>
                      ))}
                      <Button
                        onClick={() =>
                          push({
                            policyName: "",
                            coveringAreasOfSpeciality: [""],
                            doctorsAvailable: [{ name: "", time: "" }],
                            additionalRemarks: "",
                            typeOfCoverage: "",
                          })
                        }
                        variant="outlined"
                        color="secondary"
                      >
                        Add Empanelment
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              )}

              {step === 5 && (
                <FieldArray name="testLabs">
                  {({ push, remove }) => (
                    <Box mb={3}>
                      {values.testLabs.map((testLab, index) => (
                        <Box key={index} mb={3}>
                          <TestLabForm
                            testLab={testLab}
                            index={index}
                            handleChange={handleChange}
                            removeTestLab={() => remove(index)}
                          />
                        </Box>
                      ))}
                      <Button
                        onClick={() =>
                          push({
                            location: "",
                            testCode: "",
                            testName: "",
                            serviceGroup: "",
                            serviceCharge: "",
                            floor: "",
                            description: "",
                            precaution: "",
                            categoryApplicability: [""],
                            tatReport: "",
                            source: "",
                            remarks: "",
                          })
                        }
                        variant="outlined"
                        color="secondary"
                      >
                        Add Test Lab
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              )}

              {step === 6 && (
                <FieldArray name="codeAnnouncements">
                  {({ push, remove }) => (
                    <Box mb={3}>
                      {values.codeAnnouncements.map(
                        (codeAnnouncement, index) => (
                          <Box key={index} mb={3}>
                            <CodeAnnouncementForm
                              codeAnnouncement={codeAnnouncement}
                              index={index}
                              handleChange={handleChange}
                              removeCodeAnnouncement={() => remove(index)}
                            />
                          </Box>
                        ),
                      )}
                      <Button
                        onClick={() =>
                          push({
                            name: "",
                            color: "",
                            description: "",
                            concernedPerson: "",
                            staff: [{ name: "", shift: "", contactNo: "" }],
                            shortCode: "",
                            timeAvailability: "",
                            enabled: false,
                          })
                        }
                        variant="outlined"
                        color="secondary"
                      >
                        Add Code Announcement
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              )}

              {step === 7 && (
                <Box mb={3}>
                  <IPDDetailsForm values={values} handleChange={handleChange} />
                </Box>
              )}

              {step === 8 && (
                <Box mb={3}>
                  <DayCareDetailsForm
                    values={values}
                    handleChange={handleChange}
                  />
                </Box>
              )}

              {step === 9 && (
                <FieldArray name="procedureList">
                  {({ push, remove }) => (
                    <Box mb={3}>
                      {values.procedureList.map((procedure, index) => (
                        <Box key={index} mb={3}>
                          <ProcedureListForm
                            procedure={procedure}
                            index={index}
                            handleChange={handleChange}
                            removeProcedure={() => remove(index)}
                          />
                        </Box>
                      ))}
                      <Button
                        onClick={() =>
                          push({
                            name: "",
                            description: "",
                            category: "",
                            doctorName: [""],
                            empanelmentType: [""],
                            ratesCharges: "",
                            coordinatorName: [""],
                          })
                        }
                        variant="outlined"
                        color="secondary"
                      >
                        Add Procedure
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              )}

              {step === 10 && (
                <FieldArray name="departmentIncharge">
                  {({ push, remove }) => (
                    <Box mb={3}>
                      {values.departmentIncharge.map((incharge, index) => (
                        <Box key={index} mb={3}>
                          <DepartmentInchargeForm
                            incharge={incharge}
                            index={index}
                            handleChange={handleChange}
                            removeIncharge={() => remove(index)}
                          />
                        </Box>
                      ))}
                      <Button
                        onClick={() =>
                          push({
                            name: "",
                            extensionNo: "",
                            contactNo: "",
                            departmentName: "",
                            timeSlot: "",
                            serviceType: "",
                          })
                        }
                        variant="outlined"
                        color="secondary"
                      >
                        Add Incharge
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              )}

              {/* Navigation Buttons */}
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                  onClick={handlePrev}
                  disabled={step === 0}
                  variant="outlined"
                  color="secondary"
                  sx={{
                    ":hover": {
                      borderColor: "green",
                      backgroundColor: "#379777",
                      color: "black",
                    },
                  }}
                >
                  Previous
                </Button>
                {step === steps.length - 1 ? (
                  <Button
                    onClick={handlePreview}
                    variant="contained"
                    color="secondary"
                  >
                    Preview
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    variant="outlined"
                    color="secondary"
                    sx={{
                      ":hover": {
                        borderColor: "green",
                        backgroundColor: "#379777",
                        color: "black",
                      },
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>

              {/* Preview Modal */}
              <Modal
                open={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
              >
                <Box sx={modalStyle}>
                  {" "}
                  {/* Applied style directly here if needed or wrap ModalComponent */}
                  <ModalComponent
                    values={values}
                    handleEdit={handleEdit}
                    handleSubmit={submitForm} // Trigger Formik submission
                    isSubmitting={isSubmitting} // Pass loading state
                    isValid={manualIsValid} // Use only manual validation
                  />
                </Box>
              </Modal>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};

// Modal styling (Adjust width/height as needed for your ModalComponent)
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default HospitalForm;
