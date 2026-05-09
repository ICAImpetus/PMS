import React, { useState, useEffect, useContext } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "./Forms.css";
import DoctorDropdown from "./DoctorDropdown";
import { useApi } from "../api/useApi";
import { commonRoutes } from "../api/apiService";
import toast from "react-hot-toast";
import {
  CircularProgress, Box,
  TextField,
  Autocomplete
} from "@mui/material";
import DoctorProfileCard from "./DoctorCard";
import HospitalContext from "../contexts/HospitalContexts";
import { CATEGORY, IndianStatesWithDistricts } from "../panels/superAdmin/hospitalManagement/hospitalForm/components/State";


const getCurrentDateTime = () => {
  const now = new Date();

  // local timezone ke according datetime-local format
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
};

const getDayName = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleDateString("en-US", { weekday: "long" });
};
const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
const minDate = today.toISOString().slice(0, 16);

const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
nextWeek.setMinutes(nextWeek.getMinutes() - nextWeek.getTimezoneOffset());
const maxDate = nextWeek.toISOString().slice(0, 16);


function Forms() {
  const [branchData, setBranchData] = useState(null);
  const [dynamicDepartments, setDynamicDepartments] = useState([]);
  const [dynamicDoctors, setDynamicDoctors] = useState([]);
  const [filteredDoctors, setfilteredDoctors] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const initialPatientDetails = {
    patientName: "",
    patientMobile: "",
    alternateMobile: "",
    patientAge: "",
    gender: "",
    status: "",
    location: "",
    category: "",
  };

  const initialFormData = {
    callerType: "",
    referenceFrom: "",
    refDoctorName: "",
    refHospitalName: "",
    refHospitalLocation: "",
    diagnosisOrTestName: "",
    patientDetails: initialPatientDetails,
    bookSlot: null,
    missedConnectionStatus: "",
    attendantDetails: {
      attendantName: "",
      attendantMobile: ""
    },
    informativeTopic: "",
    informativeDetailsShared: "",
    feedbackType: "",
    noFeedbackRemarks: "",
    notConnectedRemarks: "",
    opdNumber: "",
    marketingCampaignName: "",
    marketingDetailsShared: "",
    remarks: "",
    callBack: "",
    callDropReason: "",
    connected: "",
    disconnectionReason: "",
    surgeryName: "",
    healthPackageName: "",
    healthSchemeName: "",
    reportName: "",
    issue: "",
    ambulanceLocation: "",
    ambulanceShared: "",
    govertHealthSchemeName: "",
    nonGovtHealthSchemeName: "",
    dateTime: getCurrentDateTime(),
    followupType: "",
    status: "",
    detailsShared: "",
    slotDuration: "",
    appointmentSlot: null,
    patientArrivalTime: getCurrentDateTime(),
    useForFollowup: false
  };

  const initialFormState = {
    formType: "inbound",
    purpose: "",
    doctor: null,
    department: null,
    branchId: null,
    hospitalId: null,
    callStatus: "",
    formData: initialFormData
  };

  const [form, setForm] = useState(initialFormState);
  const { request: getSingleBranch, error: getSingleBranchError, loading: getSingleBranchLoading } = useApi(commonRoutes.getBranchById)
  const { request: saveFilledForm, error: saveFilledFormError, loading: saveFilledFormLoading } = useApi(commonRoutes.saveFilledForm)

  const {
    loading,
    selectedBranch,
    setSelectedBranch,
    selectedHostpital,
    branches,
    errors,
  } = useContext(HospitalContext);

  useEffect(() => {
    const fetchBranchAndDetails = async () => {
      if (selectedHostpital) {
        const branchDetails = await getSingleBranch(selectedBranch, selectedHostpital);
        handleChange("branchId", selectedBranch);
        handleChange("hospitalId", selectedHostpital);
        setBranchData(branchDetails.data?.branch);
        setDynamicDepartments(branchDetails?.data?.departments || []);
        setDynamicDoctors(branchDetails?.data?.doctors || []);
      }
    };
    if (selectedHostpital && selectedBranch) {
      fetchBranchAndDetails();
    }
  }, [selectedHostpital, selectedBranch]);

  const resetForm = () => {
    setSelectedDoctor(null);
    setForm({
      ...initialFormState,
      branchId: form.branchId, // Preserve IDs
      hospitalId: form.hospitalId,
      formData: {
        ...initialFormData,
        dateTime: getCurrentDateTime() // Refresh time on reset
      }
    });
  };
  const handleChange = (path, value) => {
    setForm((prev) => {
      const updated = structuredClone(prev); // deep clone (safe)

      const keys = path.split(".");
      let current = updated;

      for (let i = 0; i < keys?.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys?.length - 1]] = value;

      return updated;
    });
  };

  const handleDepartmentChange = async (depId) => {
    console.log("Selected Department ID:", depId);

    handleChange("doctor", null);
    setSelectedDoctor(null);
    // 1. Validation: If no ID (user selected "Select" option)
    if (!depId) {
      setfilteredDoctors(dynamicDoctors || []); // Clear the dropdown
      return;
    }

    try {
      // 2. Primary Source: Use doctors already populated in the department object
      const selectedDep = dynamicDepartments.find(
        (dept) => String(dept?._id || dept) === String(depId),
      );

      if (
        selectedDep &&
        Array.isArray(selectedDep.doctors) &&
        selectedDep.doctors?.length > 0
      ) {
        console.log("Using doctors from populated department:", selectedDep.doctors);
        setSelectedDay(getDayName(form?.formData.dateTime) || null)
        console.log("fille", selectedDep);

        setfilteredDoctors(selectedDep.doctors);
        return;
      }

      // 3. Fallback: Filter from global dynamicDoctors (Branch-wide list)
      console.log("Falling back to global doctor filter. Total branch doctors:", dynamicDoctors?.length);
      const updatedDoc = dynamicDoctors.filter((doc) => {
        const docDepId =
          typeof doc?.department === "object" && doc?.department !== null
            ? doc.department._id || doc.department
            : doc?.department;
        return String(docDepId) === String(depId);
      });

      console.log("Filtered doctors for dep (fallback):", depId, updatedDoc);

      // 4. Error Handling: What if no doctors match?
      if (updatedDoc?.length === 0) {
        console.warn("No doctors found for department:", depId);
        // alert("No doctors are currently available for this department.");
        setfilteredDoctors([]);
      } else {
        setfilteredDoctors(updatedDoc);
      }
    } catch (error) {
      console.error("Filtering Error:", error);
      alert("Something went wrong while selecting the department.");
    }
  };

  const handleDoctorSelect = (doctor) => {

    if (!doctor) {
      handleChange("doctor", null);
      setSelectedDoctor(null);
      return;
    }

    console.log("doctor", doctor);


    // doctor set - save ID for form submission
    handleChange("doctor", doctor?._id);
    // set full object for UI card - immediate reflection
    setSelectedDoctor(doctor);

    console.log("apt", doctor);

    const depId = doctor?.department?._id || doctor?.department;

    if (depId) {
      // department set
      handleChange("department", depId);
    }
  };



  const submitForm = async (e) => {
    e.preventDefault();
    if (!selectedHostpital) {
      toast.error("No Hospital Is Found")
    }
    if (!selectedBranch) {
      toast.error("No Branch Is Found")
    }
    const res = await saveFilledForm(selectedHostpital, selectedBranch, form);
    if (res.success) {
      resetForm();
      toast.success("Form submitted successfully!");
    }

  }


  useEffect(() => {
    if (dynamicDoctors?.length > 0) {
      setfilteredDoctors(dynamicDoctors);
    }
  }, [dynamicDoctors])
  useEffect(() => {
    if (!form?.formData.dateTime) return;

    const day = getDayName(form?.formData.dateTime);
    setSelectedDay(day);

    // doctor list re-render karne ke liye
    setfilteredDoctors((prev) => [...prev]);

    handleChange("doctor", null);

  }, [form?.formData.dateTime]);

  useEffect(() => {
    const error = getSingleBranchError || saveFilledFormError;
    if (error) {
      console.error("API Error:", error);
      toast.error(error || "Something went wrong. Please try again.");
    }
  }, [getSingleBranchError, saveFilledFormError]);

  const isRequired = form.callStatus !== "Call-Drop";


  useEffect(() => {
    handleChange("doctor", null)
    // handleChange("purpose", "")
    setSelectedDoctor(null)
  }, [form.department, form.purpose, form.formType, selectedBranch])
  useEffect(() => {
    handleChange("department", null)

  }, [form.purpose])
  // console.log("form", form);

  // console.log("isres", isRequired);

  const allLocations = Object.entries(IndianStatesWithDistricts)
    .flatMap(([state, districts]) =>
      districts.map((district) => ({
        label: `${district}, ${state}`,
        district,
        state,
      }))
    );

  // console.log("allLocations", allLocations)


  const renderInboundPurposeDetails = () => {
    switch (form.formType === "inbound" && form.purpose) {
      case "Appointment":
        return (
          <div className="sub-section">
            <h3>Appointment Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>

                <select
                  className="select-field"
                  value={form?.department || ""}
                  onChange={(e) => {
                    const depId = e.target.value;

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);


                  }}
                  required
                >
                  <option value="">Select</option>


                  {dynamicDepartments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="required">
                  Appointment Date
                </label>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={
                      form.formData.dateTime
                        ? dayjs(form.formData.dateTime)
                        : null
                    }
                    onChange={(newValue) => {
                      handleChange(
                        "formData.dateTime",
                        newValue
                          ? dayjs(newValue).format("YYYY-MM-DD")
                          : ""
                      );
                    }}
                    minDate={dayjs()}
                    maxDate={dayjs().add(7, "day")}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        className: "input-field",
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

            </div >
            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="required">Doctor Name</label>

                <DoctorDropdown
                  doctors={filteredDoctors || []}
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  label="Select Doctor"
                  selectedDay={selectedDay}
                  required
                />
              </div>
            </div>

            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} />}

            {/* Slot Duration Selector */}
            <div className="input-row">
              <div className="input-group">
                <label className="required">Appointment Slot Selection</label>

              </div>

            </div>

            {/* Available Slots Display - Button Style for Easy Selection */}
            {selectedDoctor && selectedDoctor?.slots?.length > 0 && (
              <div className="">
                <div className="input-group">
                  <label className="required">Select Appointment Slot</label>

                  <div
                    style={{
                      width: "100%",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: "8px",
                      padding: "10px 0",
                      // backgroundColor: "royalblue"
                    }}
                  >
                    {selectedDoctor?.slots.map((slot, index) => {
                      const startHour = Number(slot.start.split(":")[0]);

                      const session =
                        startHour < 12 ? "Morning" : "Evening";

                      const formatTime = (time) => {
                        const [hour, minute] = time.split(":");
                        const h = Number(hour);

                        const ampm = h >= 12 ? "PM" : "AM";
                        const formattedHour = h % 12 || 12;

                        return `${formattedHour}:${minute} ${ampm}`;
                      };

                      const isSelected =
                        form.formData.appointmentSlot &&
                        form.formData.appointmentSlot?.start === slot.start;

                      console.log("slot", slot);


                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            const bookSlot = {
                              start: slot?.start,
                              end: slot?.end,
                              isBooked: true,
                              _id: slot?._id

                            }
                            handleChange("formData.appointmentSlot", bookSlot);
                          }}
                          style={{
                            padding: "10px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            backgroundColor: isSelected
                              ? "#1976d2"
                              : "#f5f5f5",
                            color: isSelected ? "white" : "#333",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: isSelected ? "bold" : "normal",
                            transition: "all 0.2s ease",
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              opacity: 0.8,
                              marginBottom: "4px",
                            }}
                          >
                            {session}
                          </div>

                          <div>
                            {formatTime(slot.start)} -{" "}
                            {formatTime(slot.end)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {/* Patient Arrival Time for No Slots - Separate Date and Time */}
            {form.formData.slotDuration === "no-slots" && (
              <div className="input-row">
                <Box>
                  <label className="required">
                    Patient Arrival Date & Time
                  </label>

                  <TextField
                    type="datetime-local"
                    fullWidth
                    size="small"
                    sx={{ mt: 1 }}
                    value={form.formData.patientArrivalTime}
                    onChange={(e) =>
                      handleChange(
                        "formData.patientArrivalTime",
                        e.target.value
                      )
                    }
                    inputProps={{
                      min: minDate?.slice(0, 16),
                      max: maxDate?.slice(0, 16),
                    }}
                  />
                </Box>
              </div>
            )}

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Patients</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="3"
                />
              </div>
            </div>



          </div >
        );

      case "General Query":
        return (
          <div className="sub-section">
            <h3>General Query Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>

                <select
                  className="select-field"
                  value={form?.department}
                  onChange={(e) =>
                    handleChange("department", e.target.value)
                  }
                  required
                >
                  <option value="">Select</option>

                  {dynamicDepartments?.map((dept) => (
                    <option key={dept._id} value={dept?._id}>
                      {dept?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="required">Doctor Name</label>

                <DoctorDropdown
                  doctors={filteredDoctors || []}
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  label="Select Doctor"
                  // selectedDay={selectedDay}
                  required
                />
              </div>


            </div>

            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} />}

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="3"
                />
              </div>
            </div>
          </div>
        );

      case "Surgery":
        return (
          <div className="sub-section">
            <h3>Surgery Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Surgery Name</label>

                <input
                  type="text"
                  className="input-field"
                  value={form.formData.surgeryName}
                  onChange={(e) =>
                    handleChange("formData.surgeryName", e.target.value)
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label className="required">Department</label>

                <select
                  className="select-field"
                  value={form?.department || ""}
                  onChange={(e) => {
                    const depId = e.target.value;

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);


                  }}
                  required
                >
                  <option value="">Select</option>

                  {dynamicDepartments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="required">Doctor Name</label>

                <DoctorDropdown
                  doctors={filteredDoctors || []}
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  label="Select Doctor"
                // selectedDay={selectedDay}
                />
              </div>
            </div>
            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} />}

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="3"
                />
              </div>
            </div>
          </div>
        );

      // ... CONTINUES IN NEXT PART

      case "Health Checkup":
        return (
          <div className="sub-section">
            <h3>Health Checkup Details</h3>


            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>

                <select
                  className="select-field"
                  value={form?.department || ""}
                  onChange={(e) => {
                    const depId = e.target.value;

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);


                  }}
                  required
                >
                  <option value="">Select</option>

                  {dynamicDepartments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="required">Doctor Name</label>

                <DoctorDropdown
                  doctors={filteredDoctors || []}
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  label="Select Doctor"
                // selectedDay={selectedDay}
                />
              </div>


              <div className="input-group">
                <label className="required">Health Package Name</label>

                <input
                  type="text"
                  className="input-field"
                  value={form.formData.healthPackageName}
                  onChange={(e) =>
                    handleChange(
                      "formData.healthPackageName",

                      e.target.value,
                    )
                  }
                  required
                />
              </div>
            </div>
            {selectedDoctor && <DoctorProfileCard doctor={selectedDoctor} />}

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      case "Emergency Query":
        return (
          <div className="sub-section">
            <h3>Emergency Query Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>

                <select
                  className="select-field"
                  value={form?.department || ""}
                  onChange={(e) => {
                    const depId = e.target.value;

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);


                  }}
                  required
                >
                  <option value="">Select</option>

                  {dynamicDepartments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="required">Doctor Name</label>

                <DoctorDropdown
                  doctors={filteredDoctors || []}
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  label="Select Doctor"
                // selectedDay={selectedDay}
                />
              </div>

            </div>
            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} />}
            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Issue</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.issue}
                  onChange={(e) =>
                    handleChange("formData.issue", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      // case "Call Drop":
      //   return (
      //     <div className="sub-section">
      //       <h3>Call Drop Details</h3>

      //       <div className="input-row">
      //         <div className="input-group">
      //           <label className="required">Call Back Made?</label>

      //           <div className="callback-buttons">
      //             <button
      //               type="button"
      //               className={`callback-btn ${form.formData.callBack === "Yes" ? "active" : ""}`}
      //               onClick={() => handleChange("formData.callBack", "Yes")}
      //             >
      //               Yes
      //             </button>

      //             <button
      //               type="button"
      //               className={`callback-btn ${form.formData.callBack === "No" ? "active" : ""}`}
      //               onClick={() => handleChange("formData.callBack", "No")}
      //             >
      //               No
      //             </button>
      //           </div>
      //         </div>

      //         <div className="input-group">
      //           <label className="required">Connected?</label>

      //           <div className="connected-buttons">
      //             <button
      //               type="button"
      //               className={`connected-btn ${form.formData.connected === "Yes" ? "active" : ""}`}
      //               onClick={() => handleChange("formData.connected", "Yes")}
      //             >
      //               Yes
      //             </button>

      //             <button
      //               type="button"
      //               className={`connected-btn ${form.formData.connected === "No" ? "active" : ""}`}
      //               onClick={() => handleChange("formData.connected", "No")}
      //             >
      //               No
      //             </button>
      //           </div>
      //         </div>

      //         <div className="input-group">
      //           <label>Disconnection Reason</label>

      //           <input
      //             type="text"
      //             className="input-field"
      //             value={form.formData.disconnectionReason}
      //             onChange={(e) =>
      //               handleChange("formData.disconnectionReason", e.target.value)
      //             }


      //           />
      //         </div>
      //       </div>

      //       <div className="input-row">
      //         <div className="input-group textarea-field-container">
      //           <label className="required">Remarks</label>

      //           <textarea
      //             className="textarea-field"
      //             value={form.formData.remarks}
      //             onChange={(e) =>
      //               handleChange("formData.remarks", e.target.value)
      //             }
      //             required
      //             rows="2"
      //           />
      //         </div>
      //       </div>
      //     </div>
      //   );

      case "Marketing Campaign":
        return (
          <div className="sub-section">
            <h3>Marketing Campaign Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Campaign Name</label>

                <input
                  type="text"
                  className="input-field"
                  value={form.formData.marketingCampaignName}
                  onChange={(e) =>
                    handleChange("formData.marketingCampaignName", e.target.value)

                  }
                  required
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      case "Complaints":
        return (
          <div className="sub-section">
            <h3>Complaints Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>

                <select
                  className="select-field"
                  value={form?.department || ""}
                  onChange={(e) => {
                    const depId = e.target.value;

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);


                  }}
                  required
                >
                  <option value="">Select</option>

                  {dynamicDepartments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="required">Doctor Name</label>

                <DoctorDropdown
                  doctors={filteredDoctors || []}
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  label="Select Doctor"
                // selectedDay={selectedDay}
                />
              </div>
            </div>
            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} />}

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      case "OPD Timings":
        return (
          <div className="sub-section">
            <h3>OPD Timings Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>

                <select
                  className="select-field"
                  value={form?.department || ""}
                  onChange={(e) => {
                    const depId = e.target.value;

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);


                  }}
                  required
                >
                  <option value="">Select</option>

                  {dynamicDepartments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="required">Doctor Name</label>

                <DoctorDropdown
                  doctors={filteredDoctors || []}
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  label="Select Doctor"
                // selectedDay={selectedDay}
                />
              </div>

            </div>
            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} />}

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      case "Diagnose or Test Price":
        return (
          <div className="sub-section">
            <h3>Diagnose or Test Price Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>

                <select
                  className="select-field"
                  value={form?.department || ""}
                  onChange={(e) => {
                    const depId = e.target.value;

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);


                  }}
                  required
                >
                  <option value="">Select</option>

                  {dynamicDepartments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="required">Diagnose/Test Name</label>

                <input
                  type="text"
                  className="input-field"
                  value={form.formData.diagnosisOrTestName}
                  onChange={(e) =>
                    handleChange(
                      "formData.diagnosisOrTestName",

                      e.target.value,
                    )
                  }
                  required
                />
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="required">Doctor Name</label>

                <DoctorDropdown
                  doctors={filteredDoctors || []}
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  label="Select Doctor"
                // selectedDay={selectedDay}
                />
              </div>

            </div>
            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} />}

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      case "Reports":
        return (
          <div className="sub-section">
            <h3>Reports Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Report Name</label>

                <input
                  type="text"
                  className="input-field"
                  value={form.formData.reportName}
                  onChange={(e) =>
                    handleChange("formData.reportName", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      case "Government Health Schemes":
        return (
          <div className="sub-section">
            <h3>Government Health Schemes Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>

                <select
                  className="select-field"
                  value={form?.department || ""}
                  onChange={(e) => {
                    const depId = e.target.value;

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);


                  }}
                  required
                >
                  <option value="">Select</option>

                  {dynamicDepartments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="required">Health Scheme Name</label>

                <input
                  type="text"
                  className="input-field"
                  value={form.formData.govertHealthSchemeName}
                  onChange={(e) =>
                    handleChange("formData.govertHealthSchemeName", e.target.value)

                  }
                  required
                />
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="required">Doctor Name</label>

                <DoctorDropdown
                  doctors={filteredDoctors || []}
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  label="Select Doctor"
                // selectedDay={selectedDay}
                />
              </div>
            </div>

            {selectedDoctor && <DoctorProfileCard doctor={selectedDoctor} />}

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div >
        );

      case "Non-Government Schemes":
        return (
          <div className="sub-section">
            <h3>Non-Government Health Schemes Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>

                <select
                  className="select-field"
                  value={form?.department || ""}
                  onChange={(e) => {
                    const depId = e.target.value;

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);


                  }}
                  required
                >
                  <option value="">Select</option>

                  {dynamicDepartments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="required">Doctor Name</label>

                <DoctorDropdown
                  doctors={filteredDoctors || []}
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  label="Select Doctor"
                // selectedDay={selectedDay}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Health Scheme Name</label>

                <input
                  type="text"
                  className="input-field"
                  value={form.formData.nonGovtHealthSchemeName}
                  onChange={(e) =>
                    handleChange("formData.nonGovtHealthSchemeName", e.target.value)

                  }
                  required
                />
              </div>
            </div>
            {selectedDoctor && <DoctorProfileCard doctor={selectedDoctor} />}

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      case "Ambulance":
        return (
          <div className="sub-section">
            <h3>Ambulance Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Location</label>

                <input
                  type="text"
                  className="input-field"
                  value={form.formData.ambulanceLocation}
                  onChange={(e) =>
                    handleChange("formData.ambulanceLocation", e.target.value)
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label className="required">Number Shared?</label>

                <div className="ambulance-buttons">
                  <button
                    type="button"
                    className={`ambulance-btn ${form.formData.ambulanceShared === "Yes" ? "active" : ""}`}
                    onClick={() =>
                      handleChange("formData.ambulanceShared", "Yes")
                    }
                  >
                    Yes
                  </button>

                  <button
                    type="button"
                    className={`ambulance-btn ${form.formData.ambulanceShared === "No" ? "active" : ""}`}
                    onClick={() =>
                      handleChange("formData.ambulanceShared", "No")
                    }
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.formData.useForFollowup}
                    onChange={(e) =>
                      handleChange("formData.useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      case "Junk":
        return (
          <div className="sub-section">
            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Junk Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      case "Job Related":
        return (
          <div className="sub-section">
            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Job Related Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderOutboundPurposeDetails = () => {
    switch (form.formType === "outbound" && form.purpose) {
      case "Appointment":
        return (
          <div className="sub-section">
            <h3>Appointment/Reschedule</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>

                <select
                  className="select-field"
                  value={form?.department || ""}
                  onChange={(e) => {
                    const depId = e.target.value;

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);


                  }}
                  required
                >
                  <option value="">Select</option>

                  {dynamicDepartments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="required">Date & Time</label>

                <input
                  type="datetime-local"
                  className="input-field"
                  value={form.formData.dateTime}
                  onChange={(e) =>
                    handleChange("formData.dateTime", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="required">Doctor Name</label>

                <DoctorDropdown
                  doctors={filteredDoctors || []}
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  label="Select Doctor"
                // selectedDay={selectedDay}
                />
              </div>
            </div>

            {selectedDoctor && <DoctorProfileCard doctor={selectedDoctor} />}
            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange(
                      "formData.remarks",
                      e.target.value,
                    )
                  }
                  required
                  rows="3"
                />
              </div>
            </div>
          </div>
        );

      case "Followup":
        return (
          <div className="sub-section">
            <h3>Follow Up Call</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Type</label>

                <select
                  className="select-field"
                  value={form.formData.followupType}
                  onChange={(e) =>
                    handleChange("formData.followupType", e.target.value)
                  }
                  required
                >
                  <option value="">Select</option>

                  <option value="Appointment">Appointment</option>

                  <option value="OPD Timing">OPD Timing</option>

                  <option value="Diagnose and Test">Diagnose and Test</option>

                  <option value="Ambulance">Ambulance</option>

                  <option value="Emergency">Emergency</option>

                  <option value="Health Checkup">Health Checkup</option>

                  <option value="Surgery">Surgery</option>
                </select>
              </div>

              <div className="input-group">
                <label className="required">Status</label>

                <select
                  className="select-field"
                  value={form.formData.followupStatus}
                  onChange={(e) =>
                    handleChange("formData.followupStatus", e.target.value)
                  }
                  required
                >
                  <option value="">Select</option>

                  <option value="Visited">Visited</option>

                  <option value="Not Visited">Not Visited</option>

                  <option value="Yet to Visit">Yet to Visit</option>
                </select>
              </div>

              <div className="input-group">
                <label className="required">Department</label>

                <select
                  className="select-field"
                  value={form?.department || ""}
                  onChange={(e) => {
                    const depId = e.target.value;

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);


                  }}
                  required
                >
                  <option value="">Select</option>

                  {dynamicDepartments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="required">Doctor Name</label>
                <DoctorDropdown
                  doctors={filteredDoctors || []}
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  label="Select Doctor"
                // selectedDay={selectedDay}
                />
              </div>


            </div>
            {selectedDoctor && <DoctorProfileCard doctor={selectedDoctor} />}
            <div className="input-group textarea-field-container">
              <label className="required">Remarks</label>

              <textarea
                className="textarea-field"
                value={form.formData.remarks}
                onChange={(e) =>
                  handleChange("formData.remarks", e.target.value)
                }
                required
                rows="2"
              />
            </div>
          </div>
        );

      case "Informative":
        return (
          <div className="sub-section">
            <h3>Informative</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Topic</label>

                <input
                  type="text"
                  className="input-field"
                  value={form.formData.informativeTopic}
                  onChange={(e) =>
                    handleChange("formData.informativeTopic", e.target.value)

                  }
                  required
                />
              </div>

              <div className="input-group">
                <label className="required">Details Shared</label>

                <select
                  className="select-field"
                  value={form.formData.informativeDetailsShared}
                  onChange={(e) =>
                    handleChange("formData.informativeDetailsShared", e.target.value)

                  }
                  required
                >
                  <option value="">Select</option>

                  <option value="Yes">Yes</option>

                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange("formData.remarks", e.target.value)

                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      case "Marketing":
        return (
          <div className="sub-section">
            <h3>Marketing Campaign</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Campaign Name</label>

                <input
                  type="text"
                  className="input-field"
                  value={form.formData.marketingCampaignName}
                  onChange={(e) =>
                    handleChange("formData.marketingCampaignName", e.target.value)

                  }
                  required
                />
              </div>

              <div className="input-group">
                <label className="required">Details Shared</label>

                <select
                  className="select-field"
                  value={form.formData.marketingDetailsShared}
                  onChange={(e) =>
                    handleChange("formData.marketingDetailsShared", e.target.value)

                  }
                  required
                >
                  <option value="">Select</option>

                  <option value="Yes">Yes</option>

                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group textarea-field-container">
                <label className="required">Remarks</label>

                <textarea
                  className="textarea-field"
                  value={form.formData.remarks}
                  onChange={(e) =>
                    handleChange(
                      "formData.remarks",
                      e.target.value
                    )
                  }
                  required
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      case "Feedback":
        return (
          <div className="sub-section">
            <h3>Feedback</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Feedback Type</label>

                <select
                  className="select-field"
                  value={form.formData.feedbackType}
                  onChange={(e) =>
                    handleChange("formData.feedbackType", e.target.value)
                  }
                  required
                >
                  <option value="">Select</option>

                  <option value="ipd">IPD Feedback</option>

                  <option value="opd">OPD Feedback</option>

                  <option value="noFeedback">No Feedback</option>

                  <option value="notConnected">Not Connected</option>
                </select>
              </div>
            </div>

            {form.formData.feedbackType === "ipd" && (
              <div className="feedback-questions">
                <div className="input-row">
                  <div className="input-group">
                    <label className="required">IPD Number</label>

                    <input
                      type="text"
                      className="input-field"
                      value={form.formData.ipdNumber}
                      onChange={(e) =>
                        handleChange("formData.ipdNumber", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* Rendering 10 Questions Grid */}

                <div
                  className="input-row"
                  style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
                >
                  {[
                    "Question 1: Are you happy with the treatment provided in the hospital? *",
                    "Question 2: Did the Doctor Explain about your problem / disease ? *",
                    "Question 3: Did the nursing staff gave solution to your problem ? *",
                    "Question 4: Are you happy with the hygiene and cleanliness maintained in the wards ? *",
                    "Question 5: Did you receive blood reports / ultrasound / X- Ray reports on time ? *",
                    "Question 6: Was the admission / discharge process smooth ? *",
                    "Question 7: Was the pharmacy available 24 x 7 ? *",
                    "Question 8: Did the dietitian visit you and provide food on time? *"
                  ].map((questionText, index) => {
                    const qNum = index + 1;
                    return (
                      <div key={qNum} className="input-group">
                        <label className="required">{questionText}</label>

                        <div className="rating-buttons">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              className={`rating-btn ${form.formData[`ipdQ${qNum}`] === num.toString() ? "active" : ""}`}
                              onClick={() =>
                                handleChange(
                                  `formData.ipdQ${qNum}`,
                                  num.toString(),
                                )
                              }
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="input-row">
                  <div className="input-group textarea-field-container">
                    <label className="required">Remarks</label>

                    <textarea
                      className="textarea-field"
                      value={form.formData.remarks}
                      onChange={(e) =>
                        handleChange("formData.remarks", e.target.value)
                      }
                      required
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            )}

            {form.formData.feedbackType === "opd" && (
              <div className="feedback-questions">
                <div className="input-row">
                  <div className="input-group">
                    <label className="required">OPD Number</label>

                    <input
                      type="text"
                      className="input-field"
                      value={form.formData.opdNumber}
                      onChange={(e) =>
                        handleChange("formData.opdNumber", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div
                  className="input-row"
                  style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
                >
                  {[
                    "Question 1: Are OPD timings convenient for you ? *",
                    "Question 2: Did you find parking facility comfortably in the hospital? *",
                    "Question 3: Have you faced problems in finding the concerned department? *",
                    "Question 4: Did you find waiting area clean / sufficient ? *",
                    "Question 5: Did you wait for long before consultation? *",
                    "Question 6: Did you wait for long before your tests? *",
                    "Question 7: Was the Doctor focused about your treatment and your problem? *",
                    "Question 8: Did you receive reports on time? *",
                    "Question 9: Doctor explained about your treatment and responded to all your questions? *",
                    "Question 10: Are you happy with the treatment / services provided in the Hospital? *"
                  ].map((questionText, index) => {
                    const qNum = index + 1;
                    return (
                      <div key={qNum} className="input-group">
                        <label className="required">{questionText}</label>

                        <div className="rating-buttons">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              className={`rating-btn ${form.formData[`opdQ${qNum}`] === num.toString() ? "active" : ""}`}
                              onClick={() =>
                                handleChange(
                                  `formData.opdQ${qNum}`,

                                  num.toString(),
                                )
                              }
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="input-row">
                  <div className="input-group textarea-field-container">
                    <label className="required">Remarks</label>

                    <textarea
                      className="textarea-field"
                      value={form.formData.remarks}
                      onChange={(e) =>
                        handleChange("formData.remarks", e.target.value)
                      }
                      required
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            )}

            {(form.formData.feedbackType === "noFeedback" ||
              form.formData.feedbackType === "notConnected") && (
                <div className="input-row">
                  <div className="input-group textarea-field-container">
                    <label className="required">Remarks</label>

                    <textarea
                      className="textarea-field"
                      value={
                        form.formData.feedbackType === "noFeedback"
                          ? form.formData.noFeedbackRemarks
                          : form.formData.notConnectedRemarks
                      }
                      onChange={(e) =>
                        handleChange(
                          form.formData.feedbackType === "noFeedback"
                            ? "formData.noFeedbackRemarks"
                            : "formData.notConnectedRemarks",

                          e.target.value,
                        )
                      }
                      required
                      rows="3"
                    />
                  </div>
                </div>
              )}
          </div>
        );

      case "Missed":
        return (
          <div className="sub-section">
            <h3>Missed Calls</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Connection Status</label>

                <select
                  className="select-field"
                  value={form.formData.missedConnectionStatus}
                  onChange={(e) =>
                    handleChange(
                      "formData.missedConnectionStatus",
                      e.target.value

                    )
                  }
                  required
                >
                  <option value="">Select</option>

                  <option value="Connected">Connected</option>

                  <option value="Not Connected">Not Connected</option>
                </select>
              </div>
            </div>

            {form.formData.missedConnectionStatus === "Connected" && (
              <>
                <div className="input-row" data-section="missed-call-details">
                  <div className="input-group">
                    <label className="required">Patient Name</label>

                    <input
                      type="text"
                      className="input-field"
                      value={form.formData.patientDetails.patientName}
                      onChange={(e) =>
                        handleChange(
                          "formData.patientDetails.patientName",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="required">Mobile Number</label>

                    <input
                      type="text"
                      className="input-field"
                      value={form.formData.patientDetails.mobileNumber}
                      onChange={(e) =>
                        handleChange(
                          "formData.patientDetails.mobileNumber",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Alt Mobile</label>

                    <input
                      type="text"
                      className="input-field"
                      value={form.formData.patientDetails.alternateMobile}
                      onChange={(e) =>
                        handleChange(
                          "formData.patientDetails.alternateMobile",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label className="required">Age</label>

                    <input
                      type="number"
                      className="input-field"
                      value={form.formData.patientDetails.patientAge}
                      maxLength={100}
                      min={0}
                      onChange={(e) =>
                        handleChange(
                          "formData.patientDetails.patientAge",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group textarea-field-container">
                    <label className="required">Remarks</label>

                    <textarea
                      className="textarea-field"
                      value={form.formData.remarks}
                      onChange={(e) =>
                        handleChange(
                          "formData.remarks",
                          e.target.value,
                        )
                      }
                      required
                      rows="3"
                    />
                  </div>
                </div>
              </>
            )}

            {form.formData.missedConnectionStatus === "Not Connected" && (
              <div className="input-row">
                <div className="input-group textarea-field-container">
                  <label className="required">Remarks</label>


                  <textarea
                    className="textarea-field"
                    value={form.formData.remarks}
                    onChange={(e) =>
                      handleChange(
                        "formData.remarks",
                        e.target.value,
                      )
                    }
                    required
                    rows="3"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case "Justdial":

      case "Practo":

      case "Whatsapp":

      case "Facebook":
        // Generic logic for platforms to save space while keeping functionality

        const platform = form.purpose

        return (
          <div className="sub-section">
            <h3>
              {platform.charAt(0).toUpperCase() + platform.slice(1)} Details
            </h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Lead?</label>

                <select
                  className="select-field"
                  value={form.formData[`${platform}Lead`]}
                  onChange={(e) =>
                    handleChange(`${platform}Lead`, e.target.value)
                  }
                  required
                  Caller Details >
                  <option value="">Select</option>
                  Caller Details
                  <option value="Yes">Yes</option>

                  <option value="No">No</option>
                </select>
              </div>
            </div>

            {form.formData[`${platform}Lead`] === "Yes" && (
              // <>
              //   <div className="input-row">
              //     <div className="input-group">
              //       <label className="required">Patient Name</label>

              //       <input
              //         type="text"
              //         className="input-field"
              //         value={form.formData.patientDetails.patientName}
              //         onChange={(e) =>
              //           handleChange(
              //             `formData.patientDetails.patientName`,

              //             e.target.value,
              //           )
              //         }
              //         required
              //       />
              //     </div>

              //     <div className="input-group">
              //       <label className="required">Mobile</label>

              //       <input
              //         type="text"
              //         className="input-field"
              //         value={outboundFormData[`${platform}PatientMobile`]}
              //         onChange={(e) =>
              //           handleOutboundInputChange(
              //             `${platform}PatientMobile`,

              //             e.target.value,
              //           )
              //         }
              //         required
              //       />
              //     </div>

              //     <div className="input-group">
              //       <label>Alt Mobile</label>

              //       <input
              //         type="text"
              //         className="input-field"
              //         value={outboundFormData[`${platform}AltMobile`]}
              //         onChange={(e) =>
              //           handleOutboundInputChange(
              //             `${platform}AltMobile`,

              //             e.target.value,
              //           )
              //         }
              //       />
              //     </div>
              //   </div>

              //   <div className="input-row">
              //     <div className="input-group">
              //       <label className="required">Age</label>

              //       <input
              //         type="number"
              //         className="input-field"
              //         value={outboundFormData[`${platform}PatientAge`]}
              //         onChange={(e) =>
              //           handleOutboundInputChange(
              //             `${platform}PatientAge`,

              //             e.target.value,
              //           )
              //         }
              //         required
              //       />
              //     </div>

              //     <div className="input-group">
              //       <label className="required">Location</label>

              //       <input
              //         type="text"
              //         className="input-field"
              //         value={outboundFormData[`${platform}Location`]}
              //         onChange={(e) =>
              //           handleOutboundInputChange(
              //             `${platform}Location`,

              //             e.target.value,
              //           )
              //         }
              //         required
              //       />
              //     </div>

              //     <div className="input-group">
              //       <label className="required">Gender</label>

              //       <select
              //         className="select-field"
              //         value={outboundFormData[`${platform}Gender`]}
              //         onChange={(e) =>
              //           handleOutboundInputChange(
              //             `${platform}Gender`,

              //             e.target.value,
              //           )
              //         }
              //         required
              //       >
              //         <option value="">Select</option>

              //         <option value="Male">Male</option>

              //         <option value="Female">Female</option>

              //         <option value="NA">NA</option>
              //       </select>
              //     </div>
              //   </div>

              //   <div className="input-row">
              //     <div className="input-group">
              //       <label className="required">Status</label>

              //       <select
              //         className="select-field"
              //         value={outboundFormData[`${platform}Status`]}
              //         onChange={(e) =>
              //           handleOutboundInputChange(
              //             `${platform}Status`,

              //             e.target.value,
              //           )
              //         }
              //         required
              //       >
              //         <option value="">Select</option>

              //         <option value="Old">Old</option>

              //         <option value="New">New</option>

              //         <option value="Non-Patient">Non-Patient</option>
              //       </select>
              //     </div>

              //     <div className="input-group">
              //       <label className="required">Category</label>

              //       <select
              //         className="select-field"
              //         value={outboundFormData[`${platform}Category`]}
              //         onChange={(e) =>
              //           handleOutboundInputChange(
              //             `${platform}Category`,

              //             e.target.value,
              //           )
              //         }
              //         required
              //       >
              //         <option value="">Select</option>

              //         <option value="Cash">Cash</option>

              //         <option value="Govt. Health Scheme">
              //           Govt. Health Scheme
              //         </option>

              //         <option value="Non-Govt. Health Scheme">
              //           Non-Govt. Health Scheme
              //         </option>

              //         <option value="NA">NA</option>
              //       </select>
              //     </div>
              //   </div>

              //   <div className="input-row">
              //     <div className="input-group textarea-field-container">
              //       <label className="required">Remarks</label>

              //       <textarea
              //         className="textarea-field"
              //         value={outboundFormData[`${platform}Remarks`]}
              //         onChange={(e) =>
              //           handleOutboundInputChange(
              //             `${platform}Remarks`,

              //             e.target.value,
              //           )
              //         }
              //         required
              //         rows="3"
              //       />
              //     </div>
              //   </div>
              // </>

              <>
                <div className="input-row" data-section="missed-call-details">
                  <div className="input-group">
                    <label className="required">Patient Name</label>

                    <input
                      type="text"
                      className="input-field"
                      value={form.formData.patientDetails.patientName}
                      onChange={(e) =>
                        handleChange(
                          "formData.patientDetails.patientName",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="required">Mobile Number</label>

                    <input
                      type="text"
                      className="input-field"
                      value={form.formData.patientDetails.mobileNumber}
                      onChange={(e) =>
                        handleChange(
                          "formData.patientDetails.mobileNumber",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Alt Mobile</label>

                    <input
                      type="text"
                      className="input-field"
                      value={form.formData.patientDetails.alternateMobile}
                      onChange={(e) =>
                        handleChange(
                          "formData.patientDetails.alternateMobile",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label className="required">Age</label>

                    <input
                      type="number"
                      className="input-field"
                      value={form.formData.patientDetails.patientAge}
                      onChange={(e) =>
                        handleChange(
                          "formData.patientDetails.patientAge",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="required">Gender</label>

                  <select
                    className="select-field"
                    value={form.formData.patientDetails.gender}
                    onChange={(e) =>
                      handleChange(
                        'formData.patientDetails.gender',
                        e.target.value,
                      )
                    }
                    required
                  >
                    <option value="">Select</option>

                    <option value="Male">Male</option>

                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>

                    <option value="NA">NA</option>
                  </select>
                </div>
                <div className="input-row">
                  <div className="input-group textarea-field-container">
                    <label className="required">Remarks</label>

                    <textarea
                      className="textarea-field"
                      value={form.formData.remarks}
                      onChange={(e) =>
                        handleChange(
                          "formData.remarks",
                          e.target.value,
                        )
                      }
                      required
                      rows="3"
                    />
                  </div>
                </div>
              </>

            )}

            {form.formData[`${platform}Lead`] === "No" && (
              <div className="input-row">
                <div className="input-group textarea-field-container">
                  <label className="required">Remarks</label>


                  <textarea
                    className="textarea-field"
                    value={form.formData.remarks}
                    onChange={(e) =>
                      handleChange(
                        "formData.remarks",
                        e.target.value,
                      )
                    }
                    required
                    rows="3"
                  />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // =============================================

  // 5. MAIN RENDER STRUCTURES

  // =============================================

  const renderInboundForm = () => (
    <form onSubmit={submitForm} className="all-sections-container">
      <div className="section">
        <h3>Primary Classification</h3>

        <div className="input-row">
          <div className="input-group">
            <label className={isRequired ? "required" : ""}>Caller Type</label>

            <div className="caller-type-buttons">
              <button
                type="button"
                className={`caller-btn ${form.formData.callerType === "Patient" ? "active" : ""}`}
                onClick={() =>
                  handleChange("formData.callerType", "Patient")
                }
              >
                Patient
              </button>

              <button
                type="button"
                className={`caller-btn ${form.formData.callerType === "Attendant" ? "active" : ""}`}
                onClick={() =>
                  handleChange("formData.callerType", "Attendant")
                }
              >
                Attendant
              </button>
            </div>
          </div>

          {(form.formData.callerType === "Patient" ||
            form.formData.callerType === "Attendant")
            && (
              <div className="input-group">
                <label className={isRequired ? "required" : ""}>Reference From</label>

                <select
                  className="select-field"
                  value={form.formData.referenceFrom}
                  onChange={(e) =>
                    handleChange("formData.referenceFrom", e.target.value)
                  }
                  required={isRequired}
                >
                  <option value="">Select</option>

                  <option value="Doctor">Doctor</option>

                  <option value="Friends And Family">Friends And Family</option>

                  <option value="Marketing Campaign">Marketing Campaign</option>

                  <option value="News Paper">News Paper</option>

                  <option value="Radio">Radio</option>

                  <option value="Existing Patient">Existing Patient</option>

                  <option value="Google">Google</option>

                  <option value="Govt. Hospital">Govt. Hospital</option>

                  <option value="Website">Website</option>

                  <option value="Social Media">Social Media</option>

                  <option value="Health Camp">Health Camp</option>

                  <option value="Lives Nearby">Lives Nearby</option>

                  <option value="NA">NA</option>
                </select>
              </div>
            )}
        </div>

        {form.formData.referenceFrom === "Doctor" && (
          <div className="input-row">
            <div className="input-group">
              <label className="required">Doctor Name</label>

              <input
                type="text"
                className="input-field"
                value={form.formData.refDoctorName}
                onChange={(e) =>
                  handleChange("formData.refDoctorName", e.target.value)
                }
                required
              />
            </div>
            <div className="input-group">
              <label className="required">Hospital Name</label>

              <input
                type="text"
                className="input-field"
                value={form.formData.refHospitalName}
                onChange={(e) =>
                  handleChange("formData.refHospitalName", e.target.value)
                }
                required
              />
            </div>
            <div className="input-group">
              <label className="required">Hospital Location </label>

              <input
                type="text"
                className="input-field"
                value={form.formData.hospitalLocation}
                onChange={(e) =>
                  handleChange("formData.hospitalLocation", e.target.value)
                }
                required
              />
            </div>
          </div>
        )}
      </div>

      {form.formData.callerType === "Attendant" && (
        <div className="input-row" data-section="attendant-details">
          <div className="input-group">
            <label className="required">Attendant Name</label>

            <input
              type="text"
              className="input-field"
              value={form.formData.attendantDetails.attendantName}
              onChange={(e) =>
                handleChange("formData.attendantDetails.attendantName", e.target.value)
              }
              required
            />
          </div>

          <div className="input-group">
            <label>Attendant Mobile</label>

            <input
              type="tel"
              className="input-field"
              value={form.formData.attendantDetails.attendantMobile}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
                handleChange("formData.attendantDetails.attendantMobile", digits);
              }}
              // required
              pattern="[0-9]{10,12}"
              maxLength="12"
              minLength="10"
              title="Enter exactly 10 digit mobile number"
              placeholder="10-12 digit number"
            />
          </div>
        </div>
      )}

      {(form.formData.callerType === "Patient" ||
        form.formData.callerType === "Attendant") && (
          <div className="section">
            <h3>Patient Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className={isRequired ? "required" : ""} >Patient Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.formData.patientDetails.patientName}
                  onChange={(e) =>
                    handleChange("formData.patientDetails.patientName", e.target.value)
                  }
                  required={isRequired}
                />
              </div>

              <div className="input-group">
                <label className="required">Mobile Number</label>
                <input
                  type="tel"
                  className="input-field"
                  value={form.formData.patientDetails.patientMobile}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 12);

                    handleChange(
                      "formData.patientDetails.patientMobile",
                      digits
                    );
                  }}
                  required
                  pattern="[0-9]{10,12}"
                  maxLength="12"
                  minLength="10"
                  title="Enter 10 to 12 digit mobile number"
                  placeholder="10-12 digit number"
                />
              </div>

              <div className="input-group">
                <label>Alternate Mobile</label>
                <input
                  type="tel"
                  className="input-field"
                  value={form.formData.patientDetails.alternateMobile}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
                    handleChange("formData.patientDetails.alternateMobile", digits);
                  }}
                  pattern="[0-9]{10,12}"
                  maxLength="12"
                  minLength="10"
                  title="Enter exactly 10-12 digit mobile number"
                  placeholder="10-12 digit number"
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label >Age</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.formData.patientDetails.patientAge}
                  inputMode="numeric"
                  placeholder="Enter Age"
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");

                    // only 3 digits
                    value = value.slice(0, 3);

                    // max age 110
                    if (value && Number(value) > 110) {
                      value = "110";
                    }

                    handleChange(
                      "formData.patientDetails.patientAge",
                      value
                    );
                  }}
                />
              </div>

              <div className="input-group">
                <label>Location</label>
                {/* <input
                  type="text"
                  className="input-field"
                  value={form.formData.patientDetails.location}
                  onChange={(e) =>
                    handleChange("formData.patientDetails.location", e.target.value)
                  }
                /> */}
                <Autocomplete
                  sx={{
                    width: 300,
                    // fontSize: '12px',
                    "& .MuiOutlinedInput-root": {
                      height: 33,
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius)",
                      backgroundColor: "#fff",
                      fontSize: '12px',

                      "& fieldset": {
                        border: "none",
                      },
                    },

                    "& .MuiInputBase-input": {
                      fontSize: '12px',
                      padding: "0 14px",
                    },
                  }}
                  options={allLocations}
                  value={
                    allLocations.find(
                      (loc) =>
                        loc.label === form.formData.patientDetails.location
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    handleChange(
                      "formData.patientDetails.location",
                      newValue?.label || ""
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      // label="Location"
                      className="input-field"
                    />
                  )}
                />
              </div>

              <div className="input-group">
                <label className={isRequired ? "required" : ""}  >Gender</label>
                <div className="gender-buttons">
                  <button
                    type="button"
                    className={`gender-btn ${form.formData.patientDetails.gender === "Male" ? "active" : ""}`}
                    onClick={() => handleChange("formData.patientDetails.gender", "Male")}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${form.formData.patientDetails.gender === "Female" ? "active" : ""}`}
                    onClick={() => handleChange("formData.patientDetails.gender", "Female")}
                  >
                    Female
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${form.formData.patientDetails.gender === "Transgender" ? "active" : ""}`}
                    onClick={() => handleChange("formData.patientDetails.gender", "Transgender")}
                  >
                    Transgender
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${form.formData.patientDetails.gender === "Others" ? "active" : ""}`}
                    onClick={() => handleChange("formData.patientDetails.gender", "Others")}
                  >
                    Others
                  </button>
                </div>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label className={isRequired ? "required" : ""}>Status</label>
                <div className="gender-buttons">
                  <button
                    type="button"
                    className={`gender-btn ${form.formData.patientDetails.status === "New" ? "active" : ""}`}
                    onClick={() => handleChange("formData.patientDetails.status", "New")}
                  >
                    New
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${form.formData.patientDetails.status === "Old" ? "active" : ""}`}
                    onClick={() => handleChange("formData.patientDetails.status", "Old")}
                  >
                    Old
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${form.formData.patientDetails.status === "Non-Patient" ? "active" : ""}`}
                    onClick={() =>
                      handleChange("formData.patientDetails.status", "Non-Patient")
                    }
                  >
                    Non-Patient
                  </button>
                </div>
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label className={isRequired ? "required" : ""}>Category</label>
                <Autocomplete
                  sx={{
                    width: 300,

                    "& .MuiOutlinedInput-root": {
                      height: 33,
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius)",
                      backgroundColor: "#fff",
                      fontSize: "12px",

                      "& fieldset": {
                        border: "none",
                      },
                    },

                    "& .MuiInputBase-input": {
                      fontSize: "12px",
                      padding: "0 14px",
                    },
                  }}
                  options={CATEGORY}
                  getOptionLabel={(option) => option.label}
                  value={
                    CATEGORY.find(
                      (item) =>
                        item.key ===
                        form.formData.patientDetails.category
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    handleChange(
                      "formData.patientDetails.category",
                      newValue?.key || ""
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Category"
                      className="input-field"
                    />
                  )}
                />
              </div>
              <div className="input-group">
                <label className="required">Call Status</label>
                <div className="connected-buttons">
                  <button
                    type="button"
                    className={`connected-btn ${form.callStatus === "Connected" ? "active" : ""}`}
                    onClick={() => handleChange("callStatus", "Connected")}
                  >
                    Connected
                  </button>
                  <button
                    type="button"
                    className={`connected-btn ${form?.callStatus === "Call-Drop" ? "active" : ""}`}
                    onClick={() => {
                      handleChange("callStatus", "Call-Drop")

                    }}
                  >
                    Call Drop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {form.callStatus === "Connected" && (
        <div className="section" data-section="call-purpose">
          <h3>Call Purpose</h3>

          <div className="input-row">
            <div className="input-group">
              <label className="required">Purpose Of Call</label>

              <select
                className="select-field"
                value={form.purpose}
                onChange={(e) => {
                  handleChange("purpose", e.target.value);

                  // Auto-scroll to purpose details when POC is selected

                  if (e.target.value) {
                    // Auto-scroll removed as per user request for less jumping
                  }
                }}
                required
              >
                <option value="">Select</option>

                <option value="Appointment">Appointment</option>
                <option value="General Query">General Query</option>

                <option value="Surgery">Surgery</option>

                <option value="Health Checkup">Health Checkup</option>

                <option value="Emergency Query">Emergency Query</option>

                {/* <option value="Call Drop">Call Drop</option> */}

                <option value="Marketing Campaign">Marketing Campaign</option>

                <option value="Complaints">Complaints</option>

                <option value="OPD Timings">OPD Timings</option>

                <option value="Diagnose or Test Price">
                  Diagnose or Test Price
                </option>

                <option value="Reports">Reports</option>

                <option value="Government Health Schemes">
                  Government Health Schemes
                </option>

                <option value="Non-Government Schemes">
                  Non-Government Schemes
                </option>

                <option value="Ambulance">Ambulance</option>

                <option value="Junk">Junk</option>

                <option value="Job Related">Job Related</option>
              </select>
            </div>
          </div>

          {form.formType === "inbound" && form.purpose && (
            <div className="purpose-details" data-section="purpose-details">
              {renderInboundPurposeDetails()}
            </div>
          )}
        </div>
      )}

      {form.callStatus === "Call-Drop" && (
        <div className="sub-section">
          <h3>Call Drop Details</h3>

          <div className="input-row">
            <div className="input-group">
              <label className="required">Call Back Made?</label>

              <div className="callback-buttons">
                <button
                  type="button"
                  className={`callback-btn ${form.formData.callBack === "Yes" ? "active" : ""}`}
                  onClick={() => handleChange("formData.callBack", "Yes")}
                >
                  Yes
                </button>

                <button
                  type="button"
                  className={`callback-btn ${form.formData.callBack === "No" ? "active" : ""}`}
                  onClick={() => handleChange("formData.callBack", "No")}
                >
                  No
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="required">Connected?</label>

              <div className="connected-buttons">
                <button
                  type="button"
                  className={`connected-btn ${form.formData.connected === "Yes" ? "active" : ""}`}
                  onClick={() => handleChange("formData.connected", "Yes")}
                >
                  Yes
                </button>

                <button
                  type="button"
                  className={`connected-btn ${form.formData.connected === "No" ? "active" : ""}`}
                  onClick={() => handleChange("formData.connected", "No")}
                >
                  No
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Disconnection Reason</label>

              <input
                type="text"
                className="input-field"
                value={form.formData.disconnectionReason}
                onChange={(e) =>
                  handleChange("formData.disconnectionReason", e.target.value)
                }


              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group textarea-field-container">
              <label className="required">Remarks</label>

              <textarea
                className="textarea-field"
                value={form.formData.remarks}
                onChange={(e) =>
                  handleChange("formData.remarks", e.target.value)
                }
                required
                rows="2"
              />
            </div>
          </div>
        </div>
      )}

      <div className="button-group">
        <button
          disabled={saveFilledFormLoading}
          type="button"
          className="btn btn-clear"
          onClick={resetForm}
        >
          Clear Form
        </button>

        <button type="submit" disabled={saveFilledFormLoading} className="btn btn-submit">
          {saveFilledFormLoading ? <CircularProgress size={20} color="inherit" /> : "Submit"}
        </button>
      </div>
    </form>
  );

  const renderOutboundForm = () => (
    <form onSubmit={submitForm} className="all-sections-container">
      <div className="section">
        <h3>Caller Details</h3>

        <div className="input-row">
          <div className="input-group">
            <label className="required">Patient Name</label>

            <input
              type="text"
              className="input-field"
              value={form.formData.patientDetails.patientName}
              onChange={(e) =>
                handleChange("formData.patientDetails.patientName", e.target.value)
              }
              required
            />
          </div>

          <div className="input-group">
            <label className="required">Mobile Number</label>

            <input
              type="tel"
              className="input-field"
              value={form.formData.patientDetails.patientMobile}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
                handleChange("formData.patientDetails.patientMobile", digits);
              }}
              required
              pattern="[0-9]{10,12}"
              maxLength="12"
              minLength="10"
              title="Enter exactly 10-12 digit mobile number"
              placeholder="10-12 digit number"
            />
          </div>

          <div className="input-group">
            <label className="required">Purpose</label>

            <select
              className="select-field"
              value={form.purpose}
              onChange={(e) =>
                handleChange("purpose", e.target.value)
              }
              required
            >
              <option value="">-- Select --</option>

              <option value="Appointment">
                Appointment/Reschedule Appointment
              </option>

              <option value="Followup">Follow Up Call</option>

              <option value="Informative">Informative</option>

              <option value="Marketing">Marketing Campaign</option>

              <option value="Feedback">Feedback</option>

              <option value="Missed">Missed Calls</option>

              <option value="Justdial">JustDial</option>

              <option value="Practo">Practo</option>

              <option value="Whatsapp">Whatsapp</option>

              <option value="Facebook">Facebook</option>
            </select>
          </div>
        </div>
      </div>

      {form.formType === "outbound" && form.purpose && (
        <div className="purpose-details" data-section="purpose-details">
          {renderOutboundPurposeDetails()}
        </div>
      )}

      <div className="button-group">
        <button
          disabled={saveFilledFormLoading}
          type="button"
          className="btn btn-clear"
          onClick={resetForm}
        >
          Clear Form
        </button>

        <button type="submit" disabled={saveFilledFormLoading} className="btn btn-submit">
          {saveFilledFormLoading ? <CircularProgress size={20} color="inherit" /> : "Submit"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="executive-form-app">
      {getSingleBranchLoading && (
        <div className="loading-overlay-simple">
          <p>Loading Forms...</p>
        </div>
      )}

      <div className="form-header">

        {/* LEFT */}
        <div className="header-top">
          <h1>
            {form?.formType === "inbound" ? "Inbound" : "Outbound"} Call Log Form
          </h1>

          {branchData && (
            <div className="branch-display-badge">
              <span className="hospital-label">
                {branchData.hospital?.name}
              </span>
              <span className="branch-label">{branchData.name}</span>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="form-toggle-container">

          <select
            className="global-date-range"
            value={selectedBranch || ""}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            {branches?.length === 0 ? (
              <option disabled>No Branches Assigned</option>
            ) : (
              branches.map((option) => (
                <option key={option._id} value={option._id}>
                  {option.name}
                </option>
              ))
            )}
          </select>

          <button
            className={`toggle-btn ${form?.formType === "inbound" ? "active" : ""}`}
            onClick={() => handleChange("formType", "inbound")}
          >
            Inbound
          </button>

          <button
            className={`toggle-btn ${form?.formType === "outbound" ? "active" : ""}`}
            onClick={() => handleChange("formType", "outbound")}
          >
            Outbound
          </button>

        </div>
      </div>
      <div className="form-container">
        {form?.formType === "inbound" ? renderInboundForm() : renderOutboundForm()}
      </div>
    </div>
  );
}

export default Forms;
