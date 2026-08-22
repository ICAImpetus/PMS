import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "./Forms.css";
import DoctorDropdown from "./DoctorDropdown";
import { useApi } from "../api/useApi";
import { commonRoutes } from "../api/apiService";
import { toast } from "react-toastify";
import moment from "moment";
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
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Paper,
  List,
  ListItem,
  Divider,
  ListItemText,
  TableRow,
  TableCell,
  Link,
  Rating,
  ToggleButton, ToggleButtonGroup,
  Chip,
  Tooltip,
  IconButton
} from "@mui/material";
import DoctorProfileCard from "./DoctorCard";
import HospitalContext from "../contexts/HospitalContexts";
import {
  CATEGORY, INBOUND_PURPOSE_OPTIONS, getCurrentDateTime,
  IndianStatesWithDistricts, initialFormState, OUTBOUND_PURPOSE_OPTIONS,
  REFERENCE_OPTIONS, initialFormData,
  initialPatientDetails,
  REMARK_INBOUND_TEMPLATES
} from "../panels/superAdmin/hospitalManagement/hospitalForm/components/State";
import { FORMS_AVAILABLE_COLUMNS, getNestedValue, PatientCallHistory } from "../utils/exportUtils";
import { PatientHistoryTableBody } from "./customComponents/PatientHistoryTableBody";
import { useLocation, useNavigate } from "react-router-dom";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import CallMadeIcon from "@mui/icons-material/CallMade";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";


function FormTypeToggleGroup({
  editMode,
  form,
  resetForm,
  setPatient,
  setLatestVisits,
  handleChange,
}) {
  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      resetForm();
      setPatient(null);
      setLatestVisits([]);
      handleChange("formType", newType);
    }
  };

  return (
    <Box>
      <ToggleButtonGroup
        value={form?.formType || "inbound"}
        exclusive
        onChange={handleTypeChange}
        disabled={editMode}
        sx={{
          bgcolor: "#F8FAFC",
          p: "4px",
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          width: "100%",
          maxWidth: "320px",
          display: "flex",
          gap: "4px",
          "&.Mui-disabled": {
            opacity: 0.6,
            bgcolor: "#F1F5F9",
          },
          "& .MuiToggleButtonGroup-grouped": {
            border: "none !important",
            borderRadius: "12px !important",
            flex: 1,
            textTransform: "none",
            py: 1,
            px: 2,
            transition: "all 0.2s ease-in-out",
          },
        }}
      >
        <ToggleButton
          value="inbound"
          sx={{
            color: "#64748B",
            fontWeight: 700,
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: 1,
            "&.Mui-selected": {
              bgcolor: "#FFFFFF !important",
              color: "#0256E8 !important",
              fontWeight: 800,
              boxShadow: "0px 2px 6px rgba(2, 86, 232, 0.12)",
            },
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.5)",
            },
          }}
        >
          <CallReceivedIcon sx={{ fontSize: 16 }} />
          Inbound
        </ToggleButton>

        <ToggleButton
          value="outbound"
          sx={{
            color: "#64748B",
            fontWeight: 700,
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: 1,
            "&.Mui-selected": {
              bgcolor: "#FFFFFF !important",
              color: "#0256E8 !important",
              fontWeight: 800,
              boxShadow: "0px 2px 6px rgba(2, 86, 232, 0.12)",
            },
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.5)",
            },
          }}
        >
          <CallMadeIcon sx={{ fontSize: 16 }} />
          Outbound
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

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


const getSession = (timeString) => {
  if (!timeString) {
    return "Morning";
  }

  const [time, meridian] =
    timeString.split(" ");

  let hour = Number(
    time.split(":")[0]
  );

  // Convert to 24-hour
  if (
    meridian === "PM" &&
    hour !== 12
  ) {
    hour += 12;
  }

  if (
    meridian === "AM" &&
    hour === 12
  ) {
    hour = 0;
  }

  if (hour < 12) {
    return "Morning";
  }

  if (hour < 17) {
    return "Afternoon";
  }

  return "Evening";
};

const getSlotStyles = ({
  isPast,
  isBooked,
  isSelected,
}) => ({
  padding: "4px 8px",

  cursor:
    isPast ? "not-allowed" : "pointer",

  border: "1px solid #ddd",

  borderRadius: "4px",

  backgroundColor: isPast
    ? "#ececec"
    : isBooked
      ? "#a0afbc"
      : isSelected
        ? "#1976d2"
        : "#f5f5f5",

  color: isSelected
    ? "white"
    : isBooked
      ? "#d32f2f"
      : isPast
        ? "#888"
        : "#333",

  fontSize: "11px",

  fontWeight: isSelected
    ? "bold"
    : "normal",

  opacity: isPast ? 0.7 : 1,

  transition: "all 0.2s ease",

  textAlign: "left",
});


const getRemainingTime = (
  selectedDate,
  patientArrivalTime
) => {

  if (
    !selectedDate ||
    !patientArrivalTime
  ) {
    return "";
  }

  // Extract date only
  const onlyDate =
    selectedDate.split("T")[0];

  // Combine date + AM/PM time
  const arrivalDateTime = dayjs(
    `${onlyDate} ${patientArrivalTime}`,
    "YYYY-MM-DD hh:mm A",
    true
  );

  // Invalid datetime safety
  if (!arrivalDateTime.isValid()) {
    return "";
  }

  const now = dayjs();

  const diff =
    arrivalDateTime.diff(now);

  // Patient arrived
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

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
const minDate = today.toISOString().slice(0, 16);

const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
nextWeek.setMinutes(nextWeek.getMinutes() - nextWeek.getTimezoneOffset());
const maxDate = nextWeek.toISOString().slice(0, 16);


const AppointmentSlotsSelector = ({

  editFormId,
  doctorSlots = [],
  getSession,
  form,
  bookedSlotsSet = new Set(),
  isPastSlot,
  handleChange,
  setBookedSlotModal,
  selectedBranch,
  selectedHostpital,
  handleParentRefreshClick,
  selectedDoctor
}) => {
  if (!doctorSlots?.length || !selectedDoctor) return null;


  const {
    request: updateBookedSlotsApi,
    error: updateBookedSlotError,
    loading: updateBookedSlotsLoading,
  } = useApi(
    commonRoutes.updateBookedSlots
  );


  const handleRemoveBookedSlot = async (slotId) => {
    try {
      if (!editFormId) toast.error("Form Not Found! Please Select Doctor First")

      const res = await updateBookedSlotsApi(selectedHostpital, selectedBranch, editFormId, slotId)
      if (res?.success) toast.success("Slot update successfully")
      if (handleParentRefreshClick) handleParentRefreshClick()

    } catch (error) {
      // //console.log("error in ", error);

      toast.error("Error to update slot status ")
    }
  };
  // Selected slot ID safe extract
  const selectedSlotId = form?.formData?.appointmentSlot?.slotId
    ? String(form.formData.appointmentSlot.slotId)
    : "";

  return (
    <Box sx={{ my: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
      >
        Select Appointment Slot <span style={{ color: "red" }}>*</span>
      </Typography>

      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 1.5,
          py: 1,
        }}
      >
        {doctorSlots.map((slot) => {
          const currentSlotId = String(slot._id);
          const session = getSession ? getSession(slot.start) : "";
          const isSelected = selectedSlotId === currentSlotId;
          const isBooked = bookedSlotsSet.has(currentSlotId);

          const isPast = isPastSlot ? isPastSlot(slot.start, form?.formData?.dateTime) : false;

          const handleSlotClick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (isBooked) {
              if (setBookedSlotModal) {
                setBookedSlotModal({ open: true, slot });
              }
              return;
            }

            if (isPast) return;

            // Direct single click select without unselecting logic
            handleChange("formData.appointmentSlot", {
              slotId: slot._id,
              start: slot.start,
              end: slot.end,
              date: form?.formData?.dateTime,
            });
          };

          return (
            <Button
              key={slot._id}
              type="button"
              variant={isSelected ? "contained" : "outlined"}
              disabled={isPast}
              onClick={handleSlotClick}
              color={isBooked ? "error" : isSelected ? "primary" : "inherit"}
              sx={{
                flexDirection: "column",
                alignItems: "center",
                padding: "8px 6px",
                position: "relative",
                textTransform: "none",
                borderRadius: 2,
                borderColor: isBooked
                  ? "error.main"
                  : isSelected
                    ? "primary.main"
                    : "divider",
                backgroundColor: isBooked
                  ? "error.lighter"
                  : isSelected
                    ? "primary.main"
                    : isPast
                      ? "action.disabledBackground"
                      : "background.paper",
                // color: isSelected ? "#3437a3 !important" : "inherit",
                // "&:hover": {
                //   backgroundColor: isBooked
                //     ? "#3e35c0"
                //     : isSelected
                //       ? "primary.dark"
                //       : "#26639f",
                // },
              }}
            >
              {/* REMOVE BOOKED SLOT BUTTON */}
              {isBooked && editFormId && (
                <Tooltip title="Remove/Cancel Booking">
                  <IconButton
                    disabled={updateBookedSlotsLoading}
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();

                      handleRemoveBookedSlot(slot._id);

                    }}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      padding: "2px",
                      // backgroundColor: "rgba(255, 255, 255, 0.9)",
                      // zIndex: 2,
                      // "&:hover": {
                      // backgroundColor: "#fff",
                      // },
                    }}
                  >
                    {updateBookedSlotsLoading ? <CircularProgress size={22} /> : <DeleteOutlineIcon sx={{ fontSize: "16px" }} />}
                  </IconButton>
                </Tooltip>
              )
              }

              {/* SESSION */}
              < Typography
                variant="caption"
                sx={{
                  fontSize: "10px",
                  // color: isSelected ? "rgba(95, 118, 177, 0.8)" : "text.secondary",
                  lineHeight: 1,
                  mb: 0.5,
                  pointerEvents: "none",
                }}
              >
                {session}
              </Typography>

              {/* SLOT TIME */}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: "12px",
                  lineHeight: 1.2,
                  // color: isSelected ? "#329185" : "text.primary",
                  pointerEvents: "none",
                }}
              >
                {slot.start} - {slot.end}
              </Typography>

              {/* STATUS TAGS */}
              {
                isBooked && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "error.main",
                      pointerEvents: "none",
                    }}
                  >
                    Booked
                  </Typography>
                )
              }

              {
                isPast && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "text.disabled",
                      pointerEvents: "none",
                    }}
                  >
                    Expired
                  </Typography>
                )
              }
            </Button>
          );
        })}
      </Box >
    </Box >
  );
};


const RenderRemarksComponents = ({ dynamicDepartments = [], message = "Remarks", form, handleChange, docProfile }) => {
  const [open, setOpen] = useState(false);

  const handleInputChange = (event, newInputValue, reason) => {

    if (reason === "reset") return;

    handleChange("formData.remarks", newInputValue);

    if (newInputValue.endsWith("/")) {
      setOpen(true);
    } else if (!newInputValue.includes("/")) {
      setOpen(false);
    }
  };

  const departmentMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(dynamicDepartments)) {
      dynamicDepartments.forEach((dep) => {
        if (dep?._id) {
          map.set(dep._id, dep.name || dep.departmentName || "");
        }
      });
    }
    return map;
  }, [dynamicDepartments]);
  const replaceDynamicFields = (rawText) => {
    const data = form.formData || {};
    const formattedDateTime = data?.dateTime
      ? moment(data.dateTime).format("MMM DD, YYYY, h:mm A")
      : getCurrentDateTime();

    const departmentName = docProfile?.department
      ? departmentMap.get(docProfile.department) || ""
      : "";
    return rawText
      .replace(/\[DoctorName\]/gi, !form?.doctor ? "[Doctor Name]" : docProfile?.name || "[Doctor Name]")
      .replace(/\[Department\]/gi, !form?.department ? "[Department]" : departmentName || "[Department]")
      .replace(/\[SurgeryName\]/gi, data?.surgeryName || "[Surgery Name]")
      .replace(/\[CategoryName\]/gi, data?.patientDetails?.category || "[Category Name]")
      .replace(/\[TestName\]/gi, data?.reportName || "[Test Name]")
      .replace(/\[CampaignName\]/gi, data?.marketingCampaignName || "[Campaign Name]")
      .replace(/\[PackageName\]/gi, data?.healthPackageName || "[Package Name]")
      .replace(/\[DateAndTime\]|\[Date\/Time\]/gi, formattedDateTime || "[Date & Time]");
  };
  const handleSelectTemplate = (event, selectedOption) => {
    if (selectedOption && typeof selectedOption === "object") {
      // Process placeholders using the template content
      const formattedContent = replaceDynamicFields(
        selectedOption.content,
        form,
        docProfile
      );

      // Override the remarks field completely with the new template content
      handleChange("formData.remarks", formattedContent);

      // Close the dropdown immediately
      setOpen(false);
    }
  };

  return (
    <Box sx={{ width: "100%", my: 2 }}>
      <Autocomplete
        componentsProps={{
          popper: {
            placement: "bottom-start",
            modifiers: [
              {
                name: "flip",
                enabled: false,
              },
            ],
          },
        }}
        open={open}
        onOpen={() => {
          if (form.formData.remarks?.includes("/")) setOpen(true);
        }}
        onClose={() => setOpen(false)}
        options={REMARK_INBOUND_TEMPLATES}

        // Ensures single selected value state
        value={null}
        multiple={false}

        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.name
        }
        filterOptions={(options, state) => {
          // Searches after the last '/' typed
          const query = state.inputValue.split("/").pop().toLowerCase();
          return options.filter(
            (opt) =>
              opt.name.toLowerCase().includes(query) ||
              opt.code.toLowerCase().includes(query) ||
              opt.category.toLowerCase().includes(query)
          );
        }}
        onChange={(event, newValue) => {
          // Trigger your selection handler when a single option is clicked
          if (newValue) {
            handleSelectTemplate(event, newValue);
            setOpen(false); // Close dropdown immediately upon single selection
          }
        }}
        onInputChange={handleInputChange}
        inputValue={form.formData.remarks || ""}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            key={option.code}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              py: 1,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                mb: 0.5,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {option.code}
              </Typography>
              <Chip
                label={option.category}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ fontSize: "10px", height: "20px" }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "text.primary", fontWeight: 500 }}
            >
              {option.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {option.content}
            </Typography>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={message}
            required
            multiline
            rows={3}
            placeholder="Type '/' to search and select template..."
            variant="outlined"
            fullWidth
          />
        )}
      />
    </Box>
  );
};
function Forms() {
  const location = useLocation()
  const navigate = useNavigate()
  // const editFormId = "6a842b093d54f07d0a6dc04b" || location.state?.formid || null
  const editFormId = location.state?.formid || null
  const [editMode, setEditMode] = useState(Boolean(editFormId))
  const [form, setForm] = useState(initialFormState);
  const [patientLatest, setPatientLatest] = useState(initialFormState);
  const [branchData, setBranchData] = useState(null);
  const [dynamicDepartments, setDynamicDepartments] = useState([]);
  const [dynamicDoctors, setDynamicDoctors] = useState([]);
  const [filteredDoctors, setfilteredDoctors] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [bookedSlotIds, setBookedSlotIds] = useState([]);
  const [latestVisits, setLatestVisits] = useState([]);
  const [latestCallHistory, setLatestCallHistory] = useState([]);
  const [patientProfile, setPatient] = useState(null);
  const [selctedPatientId, setSelectedPatientId] = useState(null);
  const [patientList, setPatientList] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLatestVisitsPanel, setShowLatestVisitsPanel] = useState(true);
  const [latestVisitsModalOpen, setLatestVisitsModalOpen] = useState(false);
  const [latestVisitSearch, setLatestVisitSearch] = useState("");
  const [latestVisitFilter, setLatestVisitFilter] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorSlots, setDoctorSlots] = useState([])
  const [liveTime, setLiveTime] = useState("");
  const [bookedSlotModal, setBookedSlotModal] = useState({ open: false, slot: null, });
  const doctorDepartmentChangeFromSelect = useRef(false);
  const [bookedSlotAction, setBookedSlotAction] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState(null);
  const [docProfile, setDocProfile] = useState(null);

  const { request: getSingleBranch, error: getSingleBranchError, loading: getSingleBranchLoading } = useApi(commonRoutes.getBranchByIdForForms)
  const { request: saveFilledForm, error: saveFilledFormError, loading: saveFilledFormLoading } = useApi(commonRoutes.saveFilledForm)
  // const { request: updateform, error: updateFormError, loading: updateFormApiLoading } = useApi(commonRoutes.updateFilledForm)
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
    commonRoutes.updateFilledForm
  );

  const {
    request: getSinglePatientApi,
    error: getSinglePatientError,
    loading: getSinglePatientLoading,
  } = useApi(
    commonRoutes.getPatientByMobile
  );

  const {
    request: getSinglePatientCallHistoryApi,
    error: getSinglePatientCallHistoryError,
    loading: patientCallHistoryApiLoading,
  } = useApi(
    commonRoutes.getPatientCallHistoryByMobile
  );

  const {
    request: getRegisteredPatientsByNumberApi,
    error: getRegisteredPatientsByNumberError,
    loading: getRegisteredPatientsByNumberLoading,
  } = useApi(
    commonRoutes.getRegisteredPatientsByNumber
  );

  const {
    request: getFormByIdApi,
    error: getFormByIdError,
    loading: getFormByIdLoading,
  } = useApi(
    commonRoutes.getFormById
  );
  const {
    loading,
    selectedBranch,
    setSelectedBranch,
    selectedHostpital,
    branches,
    errors,
    role
  } = useContext(HospitalContext);

  useEffect(() => {
    if (!editFormId) return

    // 2. Mark the internal function as async
    const fetchFormDetails = async () => {
      // setLoading(true)
      try {
        // 3. Use editFormId instead of formId
        const res = await getFormByIdApi(selectedHostpital, selectedBranch, editFormId)

        if (res.success || res.sucess) {
          const fetchedData = res?.data;
          setSelectedBranch(fetchedData?.branchId)
          setSelectedDoctor(fetchedData?.doctor)
          // //console.log("selected", fetchedData?.doctor);
          const branchId = selectedBranch
          if (fetchedData?.branchId) setSelectedBranch(fetchedData?.branchId || branchId)

          setForm(() => ({
            formType: fetchedData?.formType || initialFormState.formType,
            purpose: fetchedData?.purpose || "",
            doctor: fetchedData?.doctor?._id || null,
            department: fetchedData?.department || null,
            branchId: fetchedData?.branchId || null,
            hospitalId: fetchedData?.hospitalId || selectedHostpital || null,
            callStatus: fetchedData?.callStatus ?? "",
            useForFollowup: fetchedData?.useForFollowup ?? false,
            formData: {
              ...initialFormData,
              ...fetchedData?.formData,
              // If patientDetails comes back as an ID string from API, 
              // retain initialPatientDetails structure or handle as object
              patientDetails: typeof fetchedData?.formData?.patientDetails === 'object' && fetchedData?.formData?.patientDetails !== null
                ? fetchedData.formData.patientDetails
                : { ...initialPatientDetails, _id: fetchedData?.formData?.patientDetails || "" },
              attendantDetails: {
                ...initialFormData.attendantDetails,
                ...fetchedData?.formData?.attendantDetails
              },
              feedback: {
                ...initialFormData.feedback,
                ...fetchedData?.formData?.feedback
              }
            }
          }));
        }

      } catch (error) {
        console.error('Error fetching form details:', error)
      }
    }

    fetchFormDetails()
  }, [editFormId, editMode, selectedHostpital, selectedBranch])

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

  const fetchPatient = async (patientId) => {

    try {

      const number =
        form.formData.patientDetails.patientMobile;

      if (
        !number ||
        (number.length !== 10 &&
          number.length !== 12)
      ) {
        return;
      }



      if (!patientId) {
        toast.error("No patient selected. Please select a patient from the dropdown.");
        return;
      }

      const res = await getSinglePatientApi(
        selectedHostpital,
        selectedBranch,
        number,
        patientId
      );
      const patient = res?.data;
      setPatient(patient);
      setLatestVisits(res?.latestVisits || [])
      if (res?.success) {
        setForm((prev) => ({
          ...prev,

          formData: {
            ...prev.formData,

            patientDetails: {
              ...prev.formData.patientDetails,

              patientName:
                patient?.patientName || "",

              patientAge:
                patient?.patientAge || "",

              gender:
                patient?.gender || "",

              alternateMobile:
                patient?.alternateMobile || "",

              location:
                patient?.location || "",

              category:
                patient?.category || "",
            },
          },
        }));

        toast.success("Patient details auto-filled based on mobile number.");
        setIsDropdownOpen(false);
        setPatientList([]);
        return;
      }
      else {
        toast.error(" No patient details found.");
        // setForm((prev) => ({
        //   ...prev,

        //   formData: {
        //     ...prev.formData,

        //     patientDetails: {
        //       ...prev.formData.patientDetails,

        //       patientName: "",

        //       patientAge: "",

        //       gender: "",

        //       alternateMobile: "",

        //       location: "",

        //       category: "",
        //     },
        //   },
        // }));

        return
      }

    } catch (error) {

      console.error(
        "Fetch Patient Error:",
        error
      );
    }
  };

  const fetchPatientCallHistory = async () => {

    try {

      const number =
        form.formData.patientDetails.patientMobile;

      if (
        !number ||
        (number.length !== 10 &&
          number.length !== 12)
      ) {
        return;
      }
      const res = await getSinglePatientCallHistoryApi(
        selectedHostpital,
        selectedBranch,
        number
      );

      if (res?.success) {
        setLatestCallHistory(res?.data || [])
        return;
      }
    } catch (error) {

      console.error(
        "Fetch Patient Call History Error:",
        error
      );
    }
  };

  useEffect(() => {
    const fetchRegisteredPatients = async () => {
      try {
        const number = form.formData.patientDetails.patientMobile;

        if (!number || (number.length !== 10 && number.length !== 12)) {
          setPatientList([]);
          setIsDropdownOpen(false);
          return;
        }

        const res = await getRegisteredPatientsByNumberApi(
          selectedHostpital,
          selectedBranch,
          number
        );

        const patients = res?.data || [];

        if (res?.success && patients.length > 0) {
          if (patients.length === 1) {

            await fetchPatient(patients[0]?._id);
            setPatientList([]);
            setIsDropdownOpen(false);
            // toast.success("Patient details auto-filled.");
          } else {
            // Multiple patients found -> Store in list state and open dropdownpatient
            setPatientList(patients);
            setIsDropdownOpen(true);
            toast.info("Multiple patients found. Please select a patient.");
          }
        } else {
          setPatientList([]);
          setIsDropdownOpen(false);
          // toast.error("No patient details found.");
        }
      } catch (error) {
        console.error("Fetch Patient Error:", error);
        // toast.error("Failed to fetch patient details.");
      }
    };

    if (!editMode) fetchRegisteredPatients();

  }, [
    form.formData.patientDetails.patientMobile,
    selectedHostpital,
    selectedBranch,
  ]);

  const handleGetPatientCallHistory = async () => {

    await fetchPatientCallHistory();

  }

  // Patient Select Handler
  const handleSelectPatient = async (patientId) => {
    try {

      await fetchPatient(patientId);

      // toast.success("Patient selected successfully.");
    } catch (error) {
      console.error("Select Patient Error:", error);
    }
  };

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
      console.error("Error to fetch Bookes Slots");
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
        setSelectedDay(form?.formData.dateTime || null)

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

    // //console.log("selectedDoctor", doctor);

    if (!doctor) {
      handleChange("doctor", null);
      setSelectedDoctor(null);
      return;
    }

    // doctor set - save ID for form submission
    handleChange("doctor", doctor?._id);
    // set full object for UI card - immediate reflection
    // //console.log("doctor", doctor);

    setSelectedDoctor(doctor);

    const depId = doctor?.department?._id || doctor?.department;

    if (depId) {
      // department set
      doctorDepartmentChangeFromSelect.current = true;
      handleChange("department", depId);
    }
  };



  const submitForm = async (e) => {
    e.preventDefault();
    if (!selectedHostpital) {
      toast.error("No Hospital Is Found");
      return;
    }
    if (!selectedBranch) {
      toast.error("No Branch Is Found");
      return;
    }
    try {
      if (editMode) {
        const updatedForm = {
          ...form,
          branchId: selectedBranch,
          formData: {
            ...form?.formData,
            patientDetails: {
              ...form?.formData?.patientDetails,
              branchId: selectedBranch,
            }
          }
        };
        const res = await updateFormApi(selectedHostpital, selectedBranch, editFormId, updatedForm);

        if (res?.success) {
          resetForm();
          toast.success("Form update successfully!");
        } else {
          toast.error(res?.message || "Failed to update form. Please try again.");
        }
      }
      else {
        const res = await saveFilledForm(selectedHostpital, selectedBranch, form);
        if (res?.success) {
          resetForm();
          toast.success("Form submitted successfully!");
        } else {
          toast.error(res?.message || "Failed to submit form. Please try again.");
        }
      }

    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An error occurred while submitting the form.");
    }
  }



  useEffect(() => {
    if (dynamicDoctors?.length > 0) {
      setfilteredDoctors(dynamicDoctors);
    }
  }, [dynamicDoctors])
  useEffect(() => {
    if (!form?.formData.dateTime) return;

    const day = form?.formData.dateTime
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
    if (editMode) return
    if (doctorDepartmentChangeFromSelect.current) {
      doctorDepartmentChangeFromSelect.current = false;
      return;
    }

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
      // //console.log("patientArrivalTime", form.formData.patientArrivalTime);

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


  const isPastSlot = (
    slotStart,
    selectedDate
  ) => {

    if (!slotStart || !selectedDate) {
      return false;
    }

    // Get only date
    const onlyDate =
      selectedDate.split("T")[0];

    // Combine date + AM/PM time
    const slotDateTime = dayjs(
      `${onlyDate} ${slotStart}`,
      "YYYY-MM-DD hh:mm A",
      true
    );

    // Invalid date safety
    if (!slotDateTime.isValid()) {
      return false;
    }

    return slotDateTime.isBefore(dayjs());
  };

  const filteredLatestVisits = useMemo(() => {
    if (!Array.isArray(latestCallHistory) || latestCallHistory.length === 0) {
      return [];
    }

    const normalizedSearch = latestVisitSearch.trim().toLowerCase();
    return latestCallHistory.filter((visit) => {
      const purpose = String(visit?.purpose || "").toLowerCase();
      const type = String(visit?.formType || "").toLowerCase();

      const matchesPurpose =
        normalizedSearch === "" || purpose.includes(normalizedSearch);
      const matchesType =
        latestVisitFilter === "all" || type === latestVisitFilter;

      return matchesPurpose && matchesType;
    });
  }, [latestCallHistory, latestVisitSearch, latestVisitFilter]);

  const renderLatestPatientComponents = () => {
    const canShowLatestVisits =
      form?.formData?.patientDetails?.patientMobile !== "" &&
      !getSinglePatientLoading &&
      latestVisits?.length > 0;

    if (!canShowLatestVisits) {
      return null;
    }

    if (!showLatestVisitsPanel) {
      return (
        <div className="collapsed-view">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowLatestVisitsPanel(true)}
          >
            Show Latest Calls
          </button>
        </div>
      );
    }

    return (
      <div className="latest-patient-container">
        <div className="patient-latest-visit-heading">
          <h4>Latest Call</h4>
          <div className="latest-visit-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                handleGetPatientCallHistory()
                setLatestVisitsModalOpen(true)

              }}
            >
              View More
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowLatestVisitsPanel(false)}
            >
              ×
            </button>
          </div>
        </div>

        <div
          className="latest-patient-panel"
          style={{
            maxHeight: showLatestVisitsPanel ? "900px" : "0px",
            overflow: "hidden",
            opacity: showLatestVisitsPanel ? 1 : 0,
            transition: "max-height 0.35s ease, opacity 0.25s ease",
          }}
        >
          <table className="patient-details-table">
            <thead>
              <tr>
                <th>Form Type</th>
                <th>Purpose</th>
                <th>Doctor</th>
                <th>Department</th>
              </tr>
            </thead>

            <tbody>
              {latestVisits?.map((lv, index) => (
                <tr key={lv?._id || index}>
                  <td>{lv?.formType || "-"}</td>
                  <td>{lv?.purpose || "-"}</td>
                  <td>{lv?.doctor?.name || "-"}</td>
                  <td>{lv?.department?.name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
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

                <Autocomplete
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      minHeight: 28,
                      height: 28,
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
                  options={[
                    { _id: "", name: "Select Department" },
                    ...(dynamicDepartments || []),
                  ]}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  value={
                    dynamicDepartments?.find(
                      (dept) => dept._id === form?.department
                    ) || { _id: "", name: "Select Department" }
                  }
                  onChange={(_, newValue) => {
                    const depId = newValue?._id || "";

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Department"
                      required
                    />
                  )}
                />
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
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            height: 28,
                            minHeight: 28,
                            border: "1px solid var(--border-color)",
                            borderRadius: "var(--radius)",
                            backgroundColor: "#fff",
                            fontSize: "12px",
                          },

                          "& .MuiInputBase-input": {
                            fontSize: "12px",
                            padding: "0 14px",
                          },
                        }
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

            </div >

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


            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} setDoctorSlots={setDoctorSlots} setDocProfile={setDocProfile} />}

            {/* Slot Duration Selector */}
            {/* <div className="input-row">
              <div className="input-group">
                <label className="required">Appointment Slot Selection</label>

              </div>

            </div> */}


            <AppointmentSlotsSelector
              editFormId={editFormId}
              doctorSlots={doctorSlots}
              getSession={getSession}
              form={form}
              bookedSlotsSet={bookedSlotsSet}
              isPastSlot={isPastSlot}
              handleChange={handleChange}
              setBookedSlotModal={setBookedSlotModal}
              selectedBranch={selectedBranch}
              selectedHostpital={selectedHostpital}
              handleParentRefreshClick={fetchBookedSlots}
              selectedDoctor={selectedDoctor}
            />


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

            <Box sx={{ width: "100%", my: 2 }}>
              {/* Required Header Label */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  "&::after": {
                    content: '" *"',
                    color: "error.main",
                  },
                }}
              >
                Patient Disease
              </Typography>

              <Grid container spacing={2}>
                {/* Type of Disease Card (Optional Field) */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "none",
                      transform: "none",
                      "&:hover": {
                        transform: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <TextField
                        fullWidth
                        label="Type of Disease"
                        placeholder="e.g. Diabetes, Hypertension"
                        size="small"
                        value={form.formData.typeOfDisease || ""}
                        onChange={(e) =>
                          handleChange("formData.typeOfDisease", e.target.value)
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ width: "100%", my: 2 }}>
              {/* Required Header Label */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  "&::after": {
                    content: '" *"',
                    color: "error.main",
                  },
                }}
              >
                Patient Status
              </Typography>

              <Grid container spacing={2}>
                {/* Follow-up Checkbox Card */}
                <Grid item xs={12} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "none",
                      transform: "none",
                      "&:hover": {
                        transform: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                        py: 1.5,
                        "&:last-child": { pb: 1.5 },
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(form.useForFollowup)}
                            onChange={(e) =>
                              handleChange("useForFollowup", e.target.checked)
                            }
                            color="primary"
                          />
                        }
                        label="Useful for Making Follow-up Patients"
                        componentsProps={{
                          typography: { variant: "body2", fontWeight: 500 },
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Patient Arrival Time Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "none",
                      transform: "none",
                      "&:hover": {
                        transform: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <TextField
                        fullWidth
                        required
                        type="time"
                        label="Patient Arrival Time"
                        size="small"
                        disabled={Boolean(form.formData.appointmentSlot?.start)}
                        value={
                          form.formData.patientArrivalTime
                            ? dayjs(
                              form.formData.patientArrivalTime,
                              "hh:mm A"
                            ).format("HH:mm")
                            : ""
                        }
                        onChange={(e) => {
                          const formattedTime = dayjs(
                            e.target.value,
                            "HH:mm"
                          ).format("hh:mm A");
                          handleChange(
                            "formData.patientArrivalTime",
                            formattedTime
                          );
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                      {form.formData.appointmentSlot?.start && (
                        <FormHelperText sx={{ mt: 0.5 }}>
                          Auto-filled from selected slot (
                          {form.formData.appointmentSlot.start})
                        </FormHelperText>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />

            {/* <div className="input-group textarea-field-container">
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

            </div> */}



          </div >
        );

      case "General Query":
        return (
          <div className="sub-section">
            <h3>General Query Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="">Department</label>

                <Autocomplete
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      minHeight: 28,
                      height: 28,
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
                  options={[
                    { _id: "", name: "Select Department" },
                    ...(dynamicDepartments || []),
                  ]}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  value={
                    dynamicDepartments?.find(
                      (dept) => dept._id === form?.department
                    ) || { _id: "", name: "Select Department" }
                  }
                  onChange={(_, newValue) => {
                    const depId = newValue?._id || "";

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Department"

                    />
                  )} />
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="">Doctor Name</label>

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

            <Box sx={{ width: "100%", my: 2 }}>
              {/* Required Header Label */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  "&::after": {
                    content: '" *"',
                    color: "error.main",
                  },
                }}
              >
                Patient Disease
              </Typography>

              <Grid container spacing={2}>
                {/* Type of Disease Card (Optional Field) */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "none",
                      transform: "none",
                      "&:hover": {
                        transform: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <TextField
                        fullWidth
                        label="Type of Disease"
                        placeholder="e.g. Diabetes, Hypertension"
                        size="small"
                        value={form.formData.typeOfDisease || ""}
                        onChange={(e) =>
                          handleChange("formData.typeOfDisease", e.target.value)
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.useForFollowup}
                    onChange={(e) =>
                      handleChange("useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />
            {/* <div className="input-row">
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
            </div> */}
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


                <Autocomplete
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      minHeight: 28,
                      height: 28,
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
                  options={[
                    { _id: "", name: "Select Department" },
                    ...(dynamicDepartments || []),
                  ]}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  value={
                    dynamicDepartments?.find(
                      (dept) => dept._id === form?.department
                    ) || { _id: "", name: "Select Department" }
                  }
                  onChange={(_, newValue) => {
                    const depId = newValue?._id || "";

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Department"
                      required
                    />
                  )} />
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

            <Box sx={{ width: "100%", my: 2 }}>
              {/* Required Header Label */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  "&::after": {
                    content: '" *"',
                    color: "error.main",
                  },
                }}
              >
                Patient Disease
              </Typography>

              <Grid container spacing={2}>
                {/* Type of Disease Card (Optional Field) */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "none",
                      transform: "none",
                      "&:hover": {
                        transform: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <TextField
                        fullWidth
                        label="Type of Disease"
                        placeholder="e.g. Diabetes, Hypertension"
                        size="small"
                        value={form.formData.typeOfDisease || ""}
                        onChange={(e) =>
                          handleChange("formData.typeOfDisease", e.target.value)
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.useForFollowup}
                    onChange={(e) =>
                      handleChange("useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>
            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />
            {/* <div className="input-row">
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
            </div> */}
          </div>
        );

      // ... CONTINUES IN NEXT PART

      case "Health Checkup":
        return (
          <div className="sub-section">
            <h3>Health Checkup Details</h3>


            <div className="input-row">
              <div className="input-group">
                <label className="">Department</label>

                <Autocomplete
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      minHeight: 28,
                      height: 28,
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
                  options={[
                    { _id: "", name: "Select Department" },
                    ...(dynamicDepartments || []),
                  ]}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  value={
                    dynamicDepartments?.find(
                      (dept) => dept._id === form?.department
                    ) || { _id: "", name: "Select Department" }
                  }
                  onChange={(_, newValue) => {
                    const depId = newValue?._id || "";

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Department"

                    />
                  )} />
              </div>
            </div>

            <div className="input-row full-width-row">
              <div className="input-group">
                <label className="">Doctor Name</label>

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
            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} />}

            <Box sx={{ width: "100%", my: 2 }}>
              {/* Required Header Label */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  "&::after": {
                    content: '" *"',
                    color: "error.main",
                  },
                }}
              >
                Patient Disease
              </Typography>

              <Grid container spacing={2}>
                {/* Type of Disease Card (Optional Field) */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "none",
                      transform: "none",
                      "&:hover": {
                        transform: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <TextField
                        fullWidth
                        label="Type of Disease"
                        placeholder="e.g. Diabetes, Hypertension"
                        size="small"
                        value={form.formData.typeOfDisease || ""}
                        onChange={(e) =>
                          handleChange("formData.typeOfDisease", e.target.value)
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.useForFollowup}
                    onChange={(e) =>
                      handleChange("useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>
            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />

            {/* <div className="input-row">
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
            </div> */}
          </div>
        );

      case "Emergency Query":
        return (
          <div className="sub-section">
            <h3>Emergency Query Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="">Department</label>

                <Autocomplete
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      minHeight: 28,
                      height: 28,
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
                  options={[
                    { _id: "", name: "Select Department" },
                    ...(dynamicDepartments || []),
                  ]}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  value={
                    dynamicDepartments?.find(
                      (dept) => dept._id === form?.department
                    ) || { _id: "", name: "Select Department" }
                  }
                  onChange={(_, newValue) => {
                    const depId = newValue?._id || "";

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Department"

                    />
                  )} />

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

            <Box sx={{ width: "100%", my: 2 }}>
              {/* Required Header Label */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  "&::after": {
                    content: '" *"',
                    color: "error.main",
                  },
                }}
              >
                Patient Disease
              </Typography>

              <Grid container spacing={2}>
                {/* Type of Disease Card (Optional Field) */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "none",
                      transform: "none",
                      "&:hover": {
                        transform: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <TextField
                        fullWidth
                        label="Type of Disease"
                        placeholder="e.g. Diabetes, Hypertension"
                        size="small"
                        value={form.formData.typeOfDisease || ""}
                        onChange={(e) =>
                          handleChange("formData.typeOfDisease", e.target.value)
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.useForFollowup}
                    onChange={(e) =>
                      handleChange("useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />
            {/* <div className="input-row">
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
            </div> */}
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
                    checked={form.useForFollowup}
                    onChange={(e) =>
                      handleChange("useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>
            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />

            {/* <div className="input-row">
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
            </div> */}
          </div>
        );

      case "Complaints":
        return (
          <div className="sub-section">
            <h3>Complaints Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="">Department</label>

                <Autocomplete
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      minHeight: 28,
                      height: 28,
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
                  options={[
                    { _id: "", name: "Select Department" },
                    ...(dynamicDepartments || []),
                  ]}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  value={
                    dynamicDepartments?.find(
                      (dept) => dept._id === form?.department
                    ) || { _id: "", name: "Select Department" }
                  }
                  onChange={(_, newValue) => {
                    const depId = newValue?._id || "";

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Department"
                      required
                    />
                  )} />
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
            <Box sx={{ width: "100%", my: 2 }}>
              {/* Required Header Label */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  "&::after": {
                    content: '" *"',
                    color: "error.main",
                  },
                }}
              >
                Patient Disease
              </Typography>

              <Grid container spacing={2}>
                {/* Type of Disease Card (Optional Field) */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "none",
                      transform: "none",
                      "&:hover": {
                        transform: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <TextField
                        fullWidth
                        label="Type of Disease"
                        placeholder="e.g. Diabetes, Hypertension"
                        size="small"
                        value={form.formData.typeOfDisease || ""}
                        onChange={(e) =>
                          handleChange("formData.typeOfDisease", e.target.value)
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.useForFollowup}
                    onChange={(e) =>
                      handleChange("useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>
            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />
            {/* <div className="input-row">
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
            </div> */}
          </div>
        );

      case "OPD Timings":
        return (
          <div className="sub-section">
            <h3>OPD Timings Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>
                <Autocomplete
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      minHeight: 28,
                      height: 28,
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
                  options={[
                    { _id: "", name: "Select Department" },
                    ...(dynamicDepartments || []),
                  ]}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  value={
                    dynamicDepartments?.find(
                      (dept) => dept._id === form?.department
                    ) || { _id: "", name: "Select Department" }
                  }
                  onChange={(_, newValue) => {
                    const depId = newValue?._id || "";

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Department"
                      required
                    />
                  )} />
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

            <Box sx={{ width: "100%", my: 2 }}>
              {/* Required Header Label */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  "&::after": {
                    content: '" *"',
                    color: "error.main",
                  },
                }}
              >
                Patient Disease
              </Typography>

              <Grid container spacing={2}>
                {/* Type of Disease Card (Optional Field) */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "none",
                      transform: "none",
                      "&:hover": {
                        transform: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <TextField
                        fullWidth
                        label="Type of Disease"
                        placeholder="e.g. Diabetes, Hypertension"
                        size="small"
                        value={form.formData.typeOfDisease || ""}
                        onChange={(e) =>
                          handleChange("formData.typeOfDisease", e.target.value)
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.useForFollowup}
                    onChange={(e) =>
                      handleChange("useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>
            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />
            {/* <div className="input-row">
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
            </div> */}
          </div>
        );

      case "Diagnose or Test Price":
        return (
          <div className="sub-section">
            <h3>Diagnose or Test Price Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>

                <Autocomplete
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      minHeight: 28,
                      height: 28,
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
                  options={[
                    { _id: "", name: "Select Department" },
                    ...(dynamicDepartments || []),
                  ]}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  value={
                    dynamicDepartments?.find(
                      (dept) => dept._id === form?.department
                    ) || { _id: "", name: "Select Department" }
                  }
                  onChange={(_, newValue) => {
                    const depId = newValue?._id || "";

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Department"
                      required
                    />
                  )} />
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

            <Box sx={{ width: "100%", my: 2 }}>
              {/* Required Header Label */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  "&::after": {
                    content: '" *"',
                    color: "error.main",
                  },
                }}
              >
                Patient Disease
              </Typography>

              <Grid container spacing={2}>
                {/* Type of Disease Card (Optional Field) */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "none",
                      transform: "none",
                      "&:hover": {
                        transform: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <TextField
                        fullWidth
                        label="Type of Disease"
                        placeholder="e.g. Diabetes, Hypertension"
                        size="small"
                        value={form.formData.typeOfDisease || ""}
                        onChange={(e) =>
                          handleChange("formData.typeOfDisease", e.target.value)
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.useForFollowup}
                    onChange={(e) =>
                      handleChange("useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />
            {/* <div className="input-row">
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
            </div> */}
          </div>
        );

      case "Test_Reports":
        return (
          <div className="sub-section">
            <h3>Test Reports Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Test Report Name</label>

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
                    checked={form.useForFollowup}
                    onChange={(e) =>
                      handleChange("useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>
            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />
            {/* <div className="input-row">
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
            </div> */}
          </div>
        );

      case "Government Health Schemes":
        return (
          <div className="sub-section">
            <h3>Government Health Schemes Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>
                <Autocomplete
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      minHeight: 28,
                      height: 28,
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
                  options={[
                    { _id: "", name: "Select Department" },
                    ...(dynamicDepartments || []),
                  ]}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  value={
                    dynamicDepartments?.find(
                      (dept) => dept._id === form?.department
                    ) || { _id: "", name: "Select Department" }
                  }
                  onChange={(_, newValue) => {
                    const depId = newValue?._id || "";

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Department"
                      required
                    />
                  )} />
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

            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} />}

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.useForFollowup}
                    onChange={(e) =>
                      handleChange("useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />
            {/* <div className="input-row">
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
            </div> */}
          </div >
        );

      case "Non-Government Schemes":
        return (
          <div className="sub-section">
            <h3>Non-Government Health Schemes Details</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Department</label>

                <Autocomplete
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      minHeight: 28,
                      height: 28,
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
                  options={[
                    { _id: "", name: "Select Department" },
                    ...(dynamicDepartments || []),
                  ]}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  value={
                    dynamicDepartments?.find(
                      (dept) => dept._id === form?.department
                    ) || { _id: "", name: "Select Department" }
                  }
                  onChange={(_, newValue) => {
                    const depId = newValue?._id || "";

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Department"
                      required
                    />
                  )} />
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
            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} />}

            <div className="input-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={form.useForFollowup}
                    onChange={(e) =>
                      handleChange("useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>

            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />
            {/* <div className="input-row">
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
            </div> */}
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
                    checked={form.useForFollowup}
                    onChange={(e) =>
                      handleChange("useForFollowup", e.target.checked)
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Useful for Making Follow-up Forms</span>
                </label>
              </div>
            </div>
            <RenderRemarksComponents dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />

            {/* <div className="input-row">
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
            </div> */}
          </div>
        );

      case "Junk":
        return (
          <div className="sub-section">
            <RenderRemarksComponents message={"Junk Remarks"} dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />
            {/* <RenderRemarksComponents message={"Junk Remarks"} form={form} handleChange={handleChange} docProfile={docProfile} /> */}
            {/* <div className="input-row">
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
            </div> */}
          </div>
        );

      case "Job Related":
        return (
          <div className="sub-section">
            <RenderRemarksComponents message={"Job Related Remarks"} dynamicDepartments={dynamicDepartments} form={form} handleChange={handleChange} docProfile={{ "name": selectedDoctor?.name, "department": selectedDoctor?.department }} />
            {/* <RenderRemarksComponents message={"Job Related Remarks"} form={form} handleChange={handleChange} docProfile={docProfile} /> */}
            {/* <div className="input-row">
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
            </div> */}
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

                <Autocomplete
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      minHeight: 28,
                      height: 28,
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
                  options={dynamicDepartments || []}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  value={
                    dynamicDepartments?.find(
                      (dept) => dept._id === form?.department
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    const depId = newValue?._id || "";

                    // doctor clear
                    handleChange("doctor", null);

                    // department set
                    handleDepartmentChange(depId);
                    handleChange("department", depId);
                  }}
                  renderInput={(params) => (
                    <>
                      <TextField
                        {...params}
                        placeholder="Select Department"
                      />
                      {/* Hidden native input to enforce HTML5 browser 'required' validation */}
                      <input
                        type="text"
                        value={form?.department || ""}
                        required
                        style={{
                          opacity: 0,
                          position: "absolute",
                          pointerEvents: "none",
                          height: 0,
                          width: 0,
                        }}
                      />
                    </>
                  )}
                />
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
            <div className="input-group">
              <label className="required">Doctor Name</label>

              <DoctorDropdown
                doctors={filteredDoctors || []}
                value={selectedDoctor}
                onChange={handleDoctorSelect}
                label="Select Doctor"
                required={true}
              // selectedDay={selectedDay}
              />
            </div>

            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} />}
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
                  required={true}
                // selectedDay={selectedDay}
                />
              </div>


            </div>
            {selectedDoctor && <DoctorProfileCard hosId={selectedHostpital} doctor={selectedDoctor} />}
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
                  value={form.formData.feedback?.feedbackType || ""}
                  onChange={(e) =>
                    handleChange("formData.feedback.feedbackType", e.target.value)
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

            {form.formData.feedback?.feedbackType === "ipd" && (
              <div className="feedback-questions">
                <div className="input-row">
                  <div className="input-group">
                    <label className="required">IPD Number</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.formData.feedback?.ipdNumber || ""}
                      onChange={(e) =>
                        handleChange("formData.feedback.ipdNumber", e.target.value)
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
                    "Are you happy with the treatment provided in the hospital? *",
                    "Did the Doctor Explain about your problem / disease ? *",
                    "Did the nursing staff gave solution to your problem ? *",
                    "Are you happy with the hygiene and cleanliness maintained in the wards ? *",
                    "Did you receive blood reports / ultrasound / X- Ray reports on time ? *",
                    "Was the admission / discharge process smooth ? *",
                    "Was the pharmacy available 24 x 7 ? *",
                    "Did the dietitian visit you and provide food on time? *"
                  ].map((questionText, index) => {
                    const qNum = index + 1;
                    const currentQuestions = form.formData.feedback?.questions || [];
                    const existingQ = currentQuestions.find((q) => q.questionId === `ipdQ${qNum}`);

                    return (
                      <div key={qNum} className="input-group">
                        <label className="required">{questionText}</label>

                        <div className="rating-buttons">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              className={`rating-btn ${existingQ?.rating === num ? "active" : ""}`}
                              onClick={() => {
                                const updatedQuestions = [...currentQuestions];
                                const qIndex = updatedQuestions.findIndex((q) => q.questionId === `ipdQ${qNum}`);

                                const newQuestionObj = {
                                  questionId: `ipdQ${qNum}`,
                                  questionText: questionText,
                                  rating: num,
                                };

                                if (qIndex > -1) {
                                  updatedQuestions[qIndex] = newQuestionObj;
                                } else {
                                  updatedQuestions.push(newQuestionObj);
                                }

                                handleChange("formData.feedback.questions", updatedQuestions);
                              }}
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
                      value={form.formData.remarks || ""}
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

            {form.formData.feedback?.feedbackType === "opd" && (
              <div className="feedback-questions">
                <div className="input-row">
                  <div className="input-group">
                    <label className="">OPD Number</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.formData.feedback?.opdNumber || ""}
                      onChange={(e) =>
                        handleChange("formData.feedback.opdNumber", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div
                  className="input-row"
                  style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
                >
                  {[
                    "Are OPD timings convenient for you ? *",
                    "Did you find parking facility comfortably in the hospital? *",
                    "Have you faced problems in finding the concerned department? *",
                    "Did you find waiting area clean / sufficient ? *",
                    "Did you wait for long before consultation? *",
                    "Did you wait for long before your tests? *",
                    "Was the Doctor focused about your treatment and your problem? *",
                    "Did you receive reports on time? *",
                    "Doctor explained about your treatment and responded to all your Questions",
                    "Are you happy with the treatment / services provided in the Hospital? *"
                  ].map((questionText, index) => {
                    const qNum = index + 1;
                    const currentQuestions = form.formData.feedback?.questions || [];
                    const existingQ = currentQuestions.find((q) => q.questionId === `opdQ${qNum}`);

                    return (
                      <div key={qNum} className="input-group">
                        <label className="required">{questionText}</label>

                        <div className="rating-buttons">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              className={`rating-btn ${existingQ?.rating === num ? "active" : ""}`}
                              onClick={() => {
                                const updatedQuestions = [...currentQuestions];
                                const qIndex = updatedQuestions.findIndex((q) => q.questionId === `opdQ${qNum}`);

                                const newQuestionObj = {
                                  questionId: `opdQ${qNum}`,
                                  questionText: questionText,
                                  rating: num,
                                };

                                if (qIndex > -1) {
                                  updatedQuestions[qIndex] = newQuestionObj;
                                } else {
                                  updatedQuestions.push(newQuestionObj);
                                }

                                handleChange("formData.feedback.questions", updatedQuestions);
                              }}
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
                      value={form.formData.remarks || ""}
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

            {(form.formData.feedback?.feedbackType === "noFeedback" ||
              form.formData.feedback?.feedbackType === "notConnected") && (
                <div className="input-row">
                  <div className="input-group textarea-field-container">
                    <label className="required">Remarks</label>
                    <textarea
                      className="textarea-field"
                      value={form.formData.remarks || ""}
                      onChange={(e) => {
                        handleChange("callStatus", "Not-Conected");
                        handleChange("formData.remarks", e.target.value);
                      }}
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
        return renderRemarksComponents();

      case "Practo":
        return renderRemarksComponents();

      case "Whatsapp":
        return renderRemarksComponents();


      case "Facebook":
        return renderRemarksComponents();

      default:
        return null;
    }
  };

  const renderInboundForm = () => (
    <form onSubmit={submitForm} className="all-sections-container">

      <div className="patient-classification-section">
        <div style={{ flex: 1 }}>
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
              {/* 
              {//console.log("Reference From", isRequired)} */}
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
                        maxWidth: "100%",
                        // fontSize: '12px',
                        "& .MuiOutlinedInput-root": {
                          height: 28,
                          minHeight: 28,
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
                          required={isRequired}
                          {...params}
                          placeholder="Search or select reference"
                        />
                      )}
                    />
                  </div>


                  // <div className="input-group">
                  //   <label className={isRequired ? "required" : ""}>
                  //     Reference From
                  //   </label>

                  //   <Autocomplete
                  //     freeSolo

                  //     sx={{
                  //       width: "100%",

                  //       "& .MuiOutlinedInput-root": {
                  //         minHeight: 38,
                  //         border:
                  //           "1px solid var(--border-color)",
                  //         borderRadius: "var(--radius)",
                  //         backgroundColor: "#fff",
                  //         fontSize: "13px",

                  //         "& fieldset": {
                  //           border: "none",
                  //         },
                  //       },

                  //       "& .MuiInputBase-input": {
                  //         fontSize: "13px",
                  //         padding: "0 14px",
                  //       },
                  //     }}
                  //     options={REFERENCE_OPTIONS}
                  //     getOptionLabel={(option) =>
                  //       typeof option === "string"
                  //         ? option
                  //         : option.label
                  //     }
                  //     value={
                  //       REFERENCE_OPTIONS.find(
                  //         (item) =>
                  //           item.value ===
                  //           form.formData.referenceFrom
                  //       ) || form.formData.referenceFrom
                  //     }
                  //     onChange={(_, newValue) => {
                  //       handleChange(
                  //         "formData.referenceFrom",
                  //         typeof newValue === "string"
                  //           ? newValue
                  //           : newValue?.value || ""
                  //       );
                  //     }}
                  //     onInputChange={(_, newInputValue) => {
                  //       handleChange(
                  //         "formData.referenceFrom",
                  //         newInputValue
                  //       );
                  //     }}
                  //     renderInput={(params) => (
                  //       <TextField
                  //         required={isRequired}
                  //         {...params}
                  //         placeholder="Search or select reference"
                  //       />
                  //     )}
                  //   />
                  // </div>
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
                    {patientList?.length > 0 && (
                      <Box sx={{ position: "relative", width: "100%" }}>

                        {/* Multiple Patients Dropdown List using MUI */}
                        {isDropdownOpen && patientList.length > 1 && (
                          <Paper
                            elevation={4}
                            sx={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              zIndex: 10,
                              mt: 1,
                              maxHeight: 240,
                              overflowY: "auto",
                              borderRadius: 1,
                            }}
                          >
                            {/* Header */}
                            <Box
                              sx={{
                                p: 1.5,
                                backgroundColor: "grey.100",
                                borderBottom: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                Select Patient ({patientList.length} found):
                              </Typography>
                            </Box>


                            {/* Patient List */}
                            <List disablePadding>
                              {patientList.map((patient, index) => (
                                <React.Fragment key={patient?._id || index}>
                                  <ListItem
                                    sx={{
                                      cursor: "pointer",
                                      transition: "background-color 0.2s",
                                      "&:hover": {
                                        backgroundColor: "action.hover",
                                      },
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      py: 1.5,
                                      px: 2,
                                    }}
                                  >
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                          {patient.patientName || "Unknown Name"}
                                        </Typography>
                                      }

                                      secondary={
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                          Age: {patient.patientAge || "N/A"} | Gender: {patient.gender || "N/A"}
                                        </Typography>
                                      }
                                    />
                                    <Button
                                      variant="contained"
                                      size="small"
                                      sx={{ textTransform: "none", ml: 2 }}
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevents double click trigger if parent handles click
                                        // //console.log("Selected Patient ID:", patient?._id);

                                        handleSelectPatient(patient?._id)
                                      }}
                                    >
                                      Select
                                    </Button>
                                  </ListItem>
                                  {index < patientList.length - 1 && <Divider />}
                                </React.Fragment>
                              ))}
                            </List>
                          </Paper>
                        )}
                      </Box>
                    )}
                  </div>
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
                        let value = e.target.value;

                        // Allow digits and one decimal point
                        value = value.replace(/[^0-9.]/g, "");

                        // Allow only one decimal point
                        const parts = value.split(".");
                        if (parts.length > 2) {
                          value = parts[0] + "." + parts.slice(1).join("");
                        }

                        // Limit total length if needed
                        value = value.slice(0, 5); // e.g. 99.99

                        // Validation
                        if (value !== "" && parseFloat(value) < 0) {
                          value = "";
                        }
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
                          height: 28,
                          minHeight: 28,
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
                  <div className="input-group">
                    <label className={isRequired ? "required" : ""}>Category</label>
                    <Autocomplete
                      sx={{
                        width: 300,

                        "& .MuiOutlinedInput-root": {
                          height: 28,
                          minHeight: 28,
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
                        className={`connected-btn ${form.callStatus === "connected" ? "active" : ""}`}
                        onClick={() => handleChange("callStatus", "connected")}
                      >
                        Connected
                      </button>
                      <button
                        type="button"
                        className={`connected-btn ${form?.callStatus === "call-drop" ? "active" : ""}`}
                        onClick={() => {
                          handleChange("callStatus", "call-drop")

                        }}
                      >
                        Call Drop
                      </button>
                    </div>
                  </div>
                </div>
                <div className="input-row">

                </div>
              </div>
            )}
        </div>
        {/* 
        {form.formData.patientDetails.patientMobile !== "" && latestVisits.length > 0 && (
          <div className="section" data-section="patient-latest-details">
            <div className="patient-latest-visit-heading">
              <h3>Latest Visit</h3>
              <button type="button">View More</button>
            </div>


            <table className="patient-details-table">
              <thead>
                <tr>
                  <th>Form Type</th>
                  <th>Purpose</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Remarks</th>
                  <th>Submitted Date</th>
                </tr>
              </thead>

              <tbody>
                {latestVisits && latestVisits.length > 0 ? (
                  latestVisits.map((lv, index) => (
                    <tr key={lv?._id || index}>
                      <td>{lv?.formType || "-"}</td>
                      <td>{lv?.purpose || "-"}</td>
                      <td>{lv?.doctor || "-"}</td>
                      <td>{lv?.department || "-"}</td>
                      <td>{lv?.remarks || "-"}</td>
                      <td>
                        {lv?.createdAt
                          ? moment(lv.createdAt).format("DD MMM YYYY, hh:mm A")
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-latest-visit">
                      No latest visit data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
      
          </div>
        )} */}

        {renderLatestPatientComponents()}

      </div >

      {
        form.callStatus === "connected" && (
          <div className="section" data-section="call-purpose">
            <h3>Call Purpose</h3>

            <div className="input-row">
              <div className="input-group">
                <label className="required">Purpose Of Call</label>
                <Autocomplete

                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      minHeight: 28,
                      height: 28,
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius)",
                      backgroundColor: "#fff",
                      fontSize: "13px",
                      "& fieldset": { border: "none" },
                    },
                    "& .MuiInputBase-input": { fontSize: "13px", padding: "0 14px" },
                  }}
                  options={INBOUND_PURPOSE_OPTIONS}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.label || ""
                  }

                  value={
                    INBOUND_PURPOSE_OPTIONS.find((item) => item.value === form.purpose) || null
                  }

                  isOptionEqualToValue={(option, value) => option.value === value.value}

                  onChange={(_, newValue) => {
                    handleChange("purpose", newValue ? newValue.value : "");
                  }}

                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search and select purpose"
                      required
                    />
                  )}
                />
              </div>
            </div>

            {form.formType === "inbound" && form.purpose && (
              <div className="purpose-details" data-section="purpose-details">
                {renderInboundPurposeDetails()}
              </div>
            )}
          </div>
        )
      }

      {
        form.callStatus === "call-drop" && (
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
        )
      }

      {
        (form.callStatus === "connected" && form.purpose !== "" || (form.callStatus === "call-drop")) && form.formType !== "outbound" && (
          <div className="button-group">
            <Button
              disabled={editMode ? updateFormApiLoading : saveFilledFormLoading}
              type="button"
              variant="outlined"
              onClick={() => {
                if (editMode) {
                  navigate("/");
                } else {
                  resetForm();
                }
              }}
              sx={{
                borderRadius: "12px",
                borderColor: "#CBD5E1",
                color: "#475569",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "13px",
                px: 3,
                py: 1,
                "&:hover": {
                  borderColor: "#94A3B8",
                  backgroundColor: "#F8FAFC",
                },
              }}
            >
              {editMode ? "Cancel" : "Clear Form"}
            </Button>

            <Button
              type="submit"
              disabled={editMode ? updateFormApiLoading : saveFilledFormLoading}
              variant="contained"
              sx={{
                borderRadius: "12px",
                backgroundColor: "#0256E8",
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 800,
                fontSize: "13px",
                px: 3.5,
                py: 1,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#0143B8",
                  boxShadow: "none",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#CBD5E1",
                  color: "#94A3B8",
                },
              }}
            >
              {editMode ? (
                updateFormApiLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Update Form"
                )
              ) : saveFilledFormLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        )
      }


    </form >
  );

  const renderOutboundForm = () => (
    <form onSubmit={submitForm} className="all-sections-container">
      <div className="patient-classification-section">
        {renderLatestPatientComponents()}
        <div className="section">
          <h3>Caller Details</h3>

          <div className="input-row">
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
              {patientList?.length > 0 && (
                <Box sx={{ position: "relative", width: "100%" }}>

                  {/* Multiple Patients Dropdown List using MUI */}
                  {isDropdownOpen && patientList.length > 1 && (
                    <Paper
                      elevation={4}
                      sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        mt: 1,
                        maxHeight: 240,
                        overflowY: "auto",
                        borderRadius: 1,
                      }}
                    >
                      {/* Header */}
                      <Box
                        sx={{
                          p: 1.5,
                          backgroundColor: "grey.100",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                          Select Patient ({patientList.length} found):
                        </Typography>
                      </Box>

                      {/* Patient List */}
                      <List disablePadding>
                        {patientList.map((patient, index) => (
                          <React.Fragment key={patient?._id || index}>
                            <ListItem
                              sx={{
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                                "&:hover": {
                                  backgroundColor: "action.hover",
                                },
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                py: 1.5,
                                px: 2,
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                    {patient.patientName || "Unknown Name"}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    Age: {patient.patientAge || "N/A"} | Gender: {patient.gender || "N/A"}
                                  </Typography>
                                }
                              />
                              <Button
                                variant="contained"
                                size="small"
                                sx={{ textTransform: "none", ml: 2 }}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevents double click trigger if parent handles click
                                  // //console.log("Selected Patient ID:", patient?._id);

                                  handleSelectPatient(patient?._id)
                                }}
                              >
                                Select
                              </Button>
                            </ListItem>
                            {index < patientList.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Box>
              )}
            </div>
            <div className="input-group">
              <label className="">Patient Name</label>

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
              <label className="required">Purpose</label>

              <Autocomplete
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
                  typeof option === "string" ? option : option.label || ""
                }

                value={
                  OUTBOUND_PURPOSE_OPTIONS.find(
                    (item) => item.value === form.purpose
                  ) || null
                }

                isOptionEqualToValue={(option, value) => option.value === value.value}

                onChange={(_, newValue) => {
                  handleChange("purpose", newValue ? newValue.value : "");
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

      </div>


      {form.formType === "outbound" && form.purpose && (
        <div className="purpose-details" data-section="purpose-details">
          {renderOutboundPurposeDetails()}
        </div>
      )}


      {form.formType === "outbound" && form.purpose && (
        <div className="button-group">
          <button
            disabled={saveFilledFormLoading}
            type="button"
            className="btn btn-clear"
            onClick={resetForm}
          >
            Clear Form
          </button>

          <button type="submit" disabled={saveFilledFormLoading || !form.purpose} className="btn btn-submit">
            {saveFilledFormLoading ? <CircularProgress size={20} color="inherit" /> : "Submit"}
          </button>

          <Button
            disabled={saveFilledFormLoading}
            type="button"
            variant="outlined"
            onClick={() => {
              if (editMode) {
                navigate("/", { replace: true });
              } else {
                resetForm();
              }
            }}
            sx={{
              borderRadius: "12px",
              borderColor: "#CBD5E1",
              color: "#475569",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "13px",
              px: 3,
              py: 1,
              "&:hover": {
                borderColor: "#94A3B8",
                backgroundColor: "#F8FAFC",
              },
            }}
          >
            {editMode ? "Cancel" : "Clear Form"}
          </Button>

          <Button
            type="submit"
            disabled={editMode ? updateFormApiLoading : (saveFilledFormLoading || !form.purpose)}
            variant="contained"
            sx={{
              borderRadius: "12px",
              backgroundColor: "#0256E8",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 800,
              fontSize: "13px",
              px: 3.5,
              py: 1,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#0143B8",
                boxShadow: "none",
              },
              "&.Mui-disabled": {
                backgroundColor: "#CBD5E1",
                color: "#94A3B8",
              },
            }}
          >
            {editMode ? (
              updateFormApiLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Update Form"
              )
            ) : saveFilledFormLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      )}


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
          <FormTypeToggleGroup
            editMode={editMode}
            form={form}
            resetForm={resetForm}
            setPatient={setPatient}
            setLatestVisits={setLatestVisits}
            handleChange={handleChange}
          />
          {/* <button
            disabled={editMode}
            className={`toggle-btn  ${form?.formType === "inbound" ? "active" : ""}`}
            onClick={() => {

              resetForm();
              setPatient(null)
              setLatestVisits([]);
              handleChange("formType", "inbound")
            }}
          >
            Inbound
          </button>

          <button
            disabled={editMode}
            className={`toggle-btn ${form?.formType === "outbound" ? "active" : ""}`}
            onClick={() => {
              resetForm();
              setPatient(null)
              setLatestVisits([]);
              handleChange("formType", "outbound")
            }}
          >
            Outbound
          </button> */}
        </div>
      </div>
      <div className="form-container">
        {form?.formType === "inbound" ? renderInboundForm() : renderOutboundForm()}
      </div>

      <Dialog
        open={latestVisitsModalOpen}
        onClose={() => setLatestVisitsModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: "800px",
            // minWidth: "1000px",
            borderRadius: 3,
            background: "#f7fbff",
            boxShadow: 8,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 700 }}>
          Latest Call History
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setLatestVisitsModalOpen(false)} sx={{ fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              <TextField
                label="Search by Purpose"
                value={latestVisitSearch}
                onChange={(e) => setLatestVisitSearch(e.target.value)}
                fullWidth
                size="small"
              />
              <Stack direction="row" spacing={1}>
                {['all', 'inbound', 'outbound'].map((option) => (
                  <Button
                    key={option}
                    variant={latestVisitFilter === option ? 'contained' : 'outlined'}
                    onClick={() => setLatestVisitFilter(option)}
                    sx={{ textTransform: 'none' }}
                  >
                    {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </Button>
                ))}
              </Stack>
            </Stack>

            <Box sx={{ overflowX: 'auto' }}>
              <table className="patient-details-table" style={{ minWidth: 900 }}>
                <thead>
                  <tr>
                    {role && role === "teamleader" && (
                      <th key="action">Actions</th>
                    )}
                    {FORMS_AVAILABLE_COLUMNS.map(col => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <PatientHistoryTableBody
                  columns={FORMS_AVAILABLE_COLUMNS}
                  filteredLatestVisits={filteredLatestVisits}
                  patientProfile={patientProfile}
                  isLoading={patientCallHistoryApiLoading}
                  showAction={Boolean(role && role === "teamleader")}
                />
              </table>
            </Box>
          </Stack>
        </DialogContent>

      </Dialog>

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
