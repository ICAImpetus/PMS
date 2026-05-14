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
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  MenuItem,
  DialogActions,
  Button,

} from "@mui/material";
import DoctorProfileCard from "./DoctorCard";
import HospitalContext from "../contexts/HospitalContexts";
import { CATEGORY, INBOUND_PURPOSE_OPTIONS, getCurrentDateTime, IndianStatesWithDistricts, initialFormState, OUTBOUND_PURPOSE_OPTIONS, REFERENCE_OPTIONS } from "../panels/superAdmin/hospitalManagement/hospitalForm/components/State";
import { useMemo } from "react";

const getPatientArrivalDateTime = (
  appointmentSlot,
  selectedDate
) => {

  if (!appointmentSlot || !selectedDate) {
    return null;
  }

  // Extract only date
  const onlyDate =
    selectedDate.split("T")[0];

  const fullDateTime =
    `${onlyDate}T${appointmentSlot.start}:00`;

  return new Date(fullDateTime);
};

const getRemainingTime = (
  selectedDate,
  patientArrivalTime
) => {

  if (!selectedDate || !patientArrivalTime) {
    return "";
  }

  const onlyDate =
    selectedDate.split("T")[0];

  const arrivalDateTime = new Date(
    `${onlyDate}T${patientArrivalTime}:00`
  );

  const diff =
    arrivalDateTime.getTime() - Date.now();

  if (diff <= 0) {
    return "Patient Arrived";
  }

  const totalMinutes = Math.floor(
    diff / (1000 * 60)
  );

  const days = Math.floor(
    totalMinutes / (60 * 24)
  );

  const hours = Math.floor(
    (totalMinutes % (60 * 24)) / 60
  );

  const minutes =
    totalMinutes % 60;

  if (days > 0) {
    return `${days} Day ${hours} Hr left`;
  }

  if (hours > 0) {
    return `${hours} Hr ${minutes} Min left`;
  }

  return `${minutes} Min left`;
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
  const [bookedSlotIds, setBookedSlotIds] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [liveTime, setLiveTime] = useState("");
  const [bookedSlotModal, setBookedSlotModal] = useState({ open: false, slot: null, });
  const [bookedSlotAction, setBookedSlotAction] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [form, setForm] = useState(initialFormState);
  const { request: getSingleBranch, error: getSingleBranchError, loading: getSingleBranchLoading } = useApi(commonRoutes.getBranchById)
  const { request: saveFilledForm, error: saveFilledFormError, loading: saveFilledFormLoading } = useApi(commonRoutes.saveFilledForm)
  const {
    request: getBookedSlotsApi,
    error: getBookedSlotsError,
    loading: getBookedSlotsLoading,
  } = useApi(
    commonRoutes.getBookedSlotsApi
  );

  const {
    request: updateFormApi,
    error: updateFormApiError,
    loading: updateFormApiLoading,
  } = useApi(
    commonRoutes.updateFormApi
  );
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

  const fetchBookedSlots = async () => {
    try {
      if (
        !selectedDoctor?._id ||
        !form.formData.dateTime
      ) {
        setBookedSlotIds([]);
        return;
      }
      const data = {
        doctorId: selectedDoctor._id,
        date: form.formData.dateTime,
      }
      const response =
        await getBookedSlotsApi(selectedHostpital, selectedBranch, data);

      setBookedSlotIds(
        response?.data || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBookedSlots();
  }, [
    selectedDoctor?._id,
    form.formData.dateTime,
  ]);

  const bookedSlotsSet = useMemo(() => {
    return new Set(
      bookedSlotIds.map(String)
    );
  }, [bookedSlotIds]);

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
        setSelectedDay(getDayName(form?.formData.dateTime) || null)


        setfilteredDoctors(selectedDep.doctors);
        return;
      }

      const updatedDoc = dynamicDoctors.filter((doc) => {
        const docDepId =
          typeof doc?.department === "object" && doc?.department !== null
            ? doc.department._id || doc.department
            : doc?.department;
        return String(docDepId) === String(depId);
      });

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

    // doctor set - save ID for form submission
    handleChange("doctor", doctor?._id);
    // set full object for UI card - immediate reflection
    setSelectedDoctor(doctor);

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


  useEffect(() => {

    const slotStart =
      form.formData.appointmentSlot?.start;

    if (
      form.formData.dateTime &&
      slotStart &&
      form.formData.patientArrivalTime !== slotStart
    ) {

      handleChange(
        "formData.patientArrivalTime",
        slotStart
      );
    }

  }, [
    form.formData.dateTime,
    form.formData.appointmentSlot?.start
  ]);
  useEffect(() => {

    const updateLiveTime = () => {

      const time =
        getRemainingTime(
          form.formData.dateTime,
          form.formData.patientArrivalTime
        );

      setLiveTime(time);
    };

    updateLiveTime();

    const interval = setInterval(
      updateLiveTime,
      60000
    );

    return () => clearInterval(interval);

  }, [
    form.formData.dateTime,
    form.formData.patientArrivalTime
  ]);


  const allLocations = Object.entries(IndianStatesWithDistricts)
    .flatMap(([state, districts]) =>
      districts.map((district) => ({
        label: `${district}, ${state}`,
        district,
        state,
      }))
    );

  const isPastSlot = (slotStart, selectedDate) => {

    if (!slotStart || !selectedDate) {
      return false;
    }

    // Extract only date part
    const onlyDate =
      selectedDate.split("T")[0];

    const slotDateTime = new Date(
      `${onlyDate}T${slotStart}:00`
    );

    return slotDateTime < new Date();
  };

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
            {/* <div className="input-row">
              <div className="input-group">
                <label className="required">Appointment Slot Selection</label>

              </div>

            </div> */}

            {/* Available Slots Display - Button Style for Easy Selection */}
            {
              selectedDoctor &&
              selectedDoctor?.slots?.length > 0 && (
                <div>

                  <div className="input-group">

                    <label className="required">
                      Select Appointment Slot
                    </label>

                    <div
                      style={{
                        width: "100%",
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(140px, 1fr))",
                        gap: "8px",
                        padding: "10px 0",
                      }}
                    >

                      {selectedDoctor.slots.map(
                        (slot, index) => {

                          const startHour = Number(
                            slot.start.split(":")[0]
                          );

                          const session =
                            startHour < 12
                              ? "Morning"
                              : "Evening";

                          const formatTime = (time) => {

                            const [hour, minute] =
                              time.split(":");

                            const h = Number(hour);

                            const ampm =
                              h >= 12 ? "PM" : "AM";

                            const formattedHour =
                              h % 12 || 12;

                            return `${formattedHour}:${minute} ${ampm}`;
                          };

                          const isSelected =
                            String(
                              form.formData
                                .appointmentSlot?.slotId
                            ) === String(slot._id);

                          const isBooked =
                            bookedSlotsSet.has(
                              String(slot._id)
                            );

                          // NEW
                          const isPast =
                            isPastSlot(
                              slot.start,
                              form.formData.dateTime
                            );

                          const isDisabled = isPast;

                          return (
                            <button
                              key={index}
                              type="button"
                              disabled={isDisabled}

                              onClick={() => {

                                if (isBooked) {

                                  setBookedSlotModal({
                                    open: true,
                                    slot,
                                  });

                                  return;
                                }

                                if (isPast) {
                                  return;
                                }

                                handleChange(
                                  "formData.appointmentSlot",
                                  {
                                    slotId: slot._id,

                                    start: slot.start,

                                    end: slot.end,

                                    date:
                                      form.formData
                                        .dateTime,
                                  }
                                );
                              }}

                              style={{
                                padding: "10px 12px",

                                cursor:
                                  isDisabled
                                    ? "not-allowed"
                                    : "pointer",

                                border:
                                  "1px solid #ddd",

                                borderRadius: "6px",

                                backgroundColor:
                                  isPast
                                    ? "#ececec"
                                    : isBooked
                                      ? "#a0afbc"
                                      : isSelected
                                        ? "#1976d2"
                                        : "#f5f5f5",

                                color:
                                  isSelected
                                    ? "white"
                                    : isBooked
                                      ? "#d32f2f"
                                      : isPast
                                        ? "#888"
                                        : "#333",

                                fontSize: "13px",

                                fontWeight:
                                  isSelected
                                    ? "bold"
                                    : "normal",

                                opacity:
                                  isDisabled ? 0.7 : 1,

                                transition:
                                  "all 0.2s ease",

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

                              {isBooked && (
                                <div
                                  style={{
                                    marginTop: 4,
                                    fontSize: 11,
                                    color: "#d32f2f",
                                    fontWeight: 600,
                                  }}
                                >
                                  Booked
                                </div>
                              )}

                              {isPast && (
                                <div
                                  style={{
                                    marginTop: 4,
                                    fontSize: 11,
                                    color: "#888",
                                    fontWeight: 600,
                                  }}
                                >
                                  Expired
                                </div>
                              )}

                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                </div>
              )
            }
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

            <div className="input-group textarea-field-container">
              <label className="required">Patient Status</label>
              <div className="followup-container">
                {/* Follow-up Checkbox */}
                <div className="followup-card">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.formData.useForFollowup}
                      onChange={(e) =>
                        handleChange("formData.useForFollowup", e.target.checked)
                      }
                      className="checkbox-input"
                    />

                    <span>Useful for Making Follow-up Patients</span>
                  </label>
                </div>

                {/* Patient Arrival Time */}
                <div className="followup-card">

                  <label className="input-label">
                    Patient Arrival Time
                  </label>

                  <input
                    type="time"
                    value={form.formData.patientArrivalTime || ""}
                    onChange={(e) =>
                      handleChange(
                        "formData.patientArrivalTime",
                        e.target.value
                      )
                    }
                    className="time-input"
                  />

                  {
                    form.formData.appointmentSlot?.start && (
                      <small className="slot-time-helper">
                        Auto-filled from selected slot (
                        {form.formData.appointmentSlot.start}
                        )
                      </small>
                    )
                  }

                  {
                    liveTime && (
                      <div className="live-arrival-time">

                        <span className="live-time-label">
                          Patient will arrive in:
                        </span>

                        <span className="live-time-value">
                          {console.log("Patient will arrive in: ", liveTime)
                          }
                          {liveTime}
                        </span>

                      </div>
                    )
                  }

                </div>

              </div>
            </div>

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
                <label className={isRequired ? "required" : ""}>
                  Reference From
                </label>

                <Autocomplete
                  freeSolo
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      minHeight: 38,
                      border:
                        "1px solid var(--border-color)",
                      borderRadius: "var(--radius)",
                      backgroundColor: "#fff",
                      fontSize: "13px",

                      "& fieldset": {
                        border: "none",
                      },
                    },

                    "& .MuiInputBase-input": {
                      fontSize: "13px",
                      padding: "0 14px",
                    },
                  }}
                  options={REFERENCE_OPTIONS}
                  getOptionLabel={(option) =>
                    typeof option === "string"
                      ? option
                      : option.label
                  }
                  value={
                    REFERENCE_OPTIONS.find(
                      (item) =>
                        item.value ===
                        form.formData.referenceFrom
                    ) || form.formData.referenceFrom
                  }
                  onChange={(_, newValue) => {
                    handleChange(
                      "formData.referenceFrom",
                      typeof newValue === "string"
                        ? newValue
                        : newValue?.value || ""
                    );
                  }}
                  onInputChange={(_, newInputValue) => {
                    handleChange(
                      "formData.referenceFrom",
                      newInputValue
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search or select reference"
                    />
                  )}
                />
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
              <Autocomplete freeSolo
                sx={{
                  width: "100%", "& .MuiOutlinedInput-root":
                  {
                    minHeight: 38, border: "1px solid var(--border-color)",
                    borderRadius:
                      "var(--radius)",
                    backgroundColor: "#fff", fontSize: "13px", "& fieldset": { border: "none", },
                  },
                  "& .MuiInputBase-input": { fontSize: "13px", padding: "0 14px", },
                }}
                options={INBOUND_PURPOSE_OPTIONS}
                getOptionLabel={(option) => typeof option === "string" ?
                  option : option.label}
                value={INBOUND_PURPOSE_OPTIONS.find((item) => item.value === form.purpose) || form.purpose}
                onChange={(_, newValue) => { handleChange("purpose", typeof newValue === "string" ? newValue : newValue?.value || ""); }}
                onInputChange={(_, newInputValue) => { handleChange("purpose", newInputValue); }}
                renderInput={(params) =>
                  (<TextField {...params} placeholder="Search or type purpose" />)} />
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

      {form.callStatus === "Connected" && form.purpose !== "" && form.formType !== "outbound" && (
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
      )}


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

            <Autocomplete
              freeSolo
              sx={{
                width: "100%",

                "& .MuiOutlinedInput-root": {
                  minHeight: 38,
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius)",
                  backgroundColor: "#fff",
                  fontSize: "13px",

                  "& fieldset": {
                    border: "none",
                  },
                },

                "& .MuiInputBase-input": {
                  fontSize: "13px",
                  padding: "0 14px",
                },
              }}
              options={OUTBOUND_PURPOSE_OPTIONS}
              getOptionLabel={(option) =>
                typeof option === "string"
                  ? option
                  : option.label
              }
              value={
                OUTBOUND_PURPOSE_OPTIONS.find(
                  (item) => item.value === form.purpose
                ) || form.purpose
              }
              onChange={(_, newValue) => {
                handleChange(
                  "purpose",
                  typeof newValue === "string"
                    ? newValue
                    : newValue?.value || ""
                );
              }}
              onInputChange={(_, newInputValue) => {
                handleChange("purpose", newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search or select purpose"
                />
              )}
            />
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

      <Dialog
        open={bookedSlotModal.open}
        onClose={() => {
          setBookedSlotModal({ open: false, slot: null });
          setBookedSlotAction("");
          setCancelReason("");
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "#f7fbff",
            boxShadow: 8,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 700 }}>
          Appointment Slot Already Booked
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Typography color="error" fontWeight={600}>
              The selected appointment slot is already booked. Please choose a different slot, doctor, or department.
            </Typography>
            <Box>
              <Typography fontWeight={600}>
                Selected Slot
              </Typography>
              <Typography variant="body2">
                {bookedSlotModal.slot?.start} - {bookedSlotModal.slot?.end}
              </Typography>
            </Box>
            <TextField
              select
              label="Choose Action"
              value={bookedSlotAction}
              onChange={(e) => setBookedSlotAction(e.target.value)}
              fullWidth
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            >
              <MenuItem value="change">Change Department / Doctor</MenuItem>
              <MenuItem value="cancel">Cancel Appointment</MenuItem>
            </TextField>
            {bookedSlotAction === "change" && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Select a different department, doctor, or change the appointment date below to find an available slot.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="Department"
                    value={form?.department || ""}
                    onChange={async (e) => {
                      const depId = e.target.value;
                      handleDepartmentChange(depId);
                      handleChange("department", depId);
                    }}
                    fullWidth
                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {dynamicDepartments?.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Doctor"
                    value={selectedDoctor?._id || ""}
                    onChange={(e) => {
                      const docId = e.target.value;
                      const doc = filteredDoctors.find(d => d._id === docId);
                      handleDoctorSelect(doc);
                    }}
                    fullWidth
                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                    disabled={!form?.department}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {filteredDoctors?.map((doc) => (
                      <MenuItem key={doc._id} value={doc._id}>{doc.name}</MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <Box mt={2}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Change Appointment Date"
                      value={form.formData.dateTime ? dayjs(form.formData.dateTime) : null}
                      onChange={(newValue) => {
                        handleChange("formData.dateTime", newValue ? dayjs(newValue).format("YYYY-MM-DD") : "");
                      }}
                      minDate={dayjs()}
                      maxDate={dayjs().add(7, "day")}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          sx: { bgcolor: 'white', borderRadius: 1 },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </>
            )}
            {bookedSlotAction === "cancel" && (
              <TextField
                label="Cancellation Reason"
                multiline
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                fullWidth
                placeholder="Enter cancellation reason"
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setBookedSlotModal({ open: false, slot: null });
              setBookedSlotAction("");
              setCancelReason("");
            }}
            sx={{ fontWeight: 600 }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color={bookedSlotAction === "cancel" ? "error" : "primary"}
            disabled={
              !bookedSlotAction ||
              (bookedSlotAction === "cancel" && !cancelReason.trim())
            }
            onClick={async () => {
              if (bookedSlotAction === "cancel") {
                // TODO: Call cancel appointment API here
                toast.success("Appointment cancelled successfully.");
              }
              if (bookedSlotAction === "change") {
                toast("Please select a new department and doctor, then choose an available slot.");
              }
              setBookedSlotModal({ open: false, slot: null });
              setBookedSlotAction("");
              setCancelReason("");
            }}
            sx={{ fontWeight: 600 }}
          >
            {bookedSlotAction === "cancel" ? "Confirm Cancel" : "Continue"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Forms;
