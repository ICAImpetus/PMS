import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Chip,
  IconButton,
  useTheme,
  Card,
  CardContent,
  Stack,
  MenuItem,
  CircularProgress,
  Avatar,
  Autocomplete,
  Radio,
  RadioGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// Imports for Time Pickers
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import { tokens } from "../../../../../theme";
import { useApi } from "../../../../../api/useApi";
import { commonRoutes } from "../../../../../api/apiService";
// import { getDataFunc } from "../../../../../utils/services";
import { Toaster, toast } from "react-hot-toast";
import countryCodes from "./code.js";

// Predefined degree options
const predefinedDegrees = [
  "MBBS",
  "MD",
  "DO",
  "MS",
  "DNB",
  "DM",
  "MCh",
  "BDS",
  "MDS",
  "BAMS",
  "BHMS",
  "BUMS",
  "BSMS",
  "PharmD",
  "DVM",
  "DPT",
  "AuD",
  "DNP",
  "DPM",
  "OD",
  "PsyD",
  "PhD",
  "DSc",
  "DLitt",
  "EdD",
];

// Predefined sub-department options
const predefinedSubDepartments = [
  "Audiology & Speech Therapy",
  "Ayurvedic Medicine",
  "Biochemistry",
  "Cardiology",
  "Cardiothoracic Surgery (CTVS)",
  "Clinical Pharmacy",
  "Clinical Psychology",
  "Community Medicine",
  "Dental - Endodontics",
  "Dental - Oral & Maxillofacial Surgery",
  "Dental - Orthodontics",
  "Dental - Pedodontics",
  "Dental - Periodontics",
  "Dental - Prosthodontics",
  "Dermatology (Skin)",
  "Endocrinology",
  "ENT (Otolaryngology)",
  "Forensic Medicine",
  "Gastroenterology",
  "General Medicine",
  "General Surgery",
  "Hematology",
  "Homeopathic Medicine",
  "Internal Medicine",
  "Microbiology",
  "Naturopathy & Yoga",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Obstetrics & Gynaecology",
  "Oncology (Medical)",
  "Oncology (Surgical)",
  "Ophthalmology (Eye)",
  "Optometry",
  "Orthopaedics",
  "Paediatrics & Neonatology",
  "Pathology",
  "Pediatric Surgery",
  "Physiotherapy & Rehabilitation",
  "Plastic & Reconstructive Surgery",
  "Podiatry",
  "Psychiatry & Mental Health",
  "Public Health",
  "Pulmonology (Chest)",
  "Radiology (Imaging)",
  "Rheumatology",
  "Unani Medicine",
  "Urology",
];

/**
 * AddDoctorModal Component
 */
const AddDoctorModal = ({
  open,
  onClose,
  onSave,
  doctorData = null,
  loading = false,
  availableDepartments = [],
  branchId = null,
  hospitalId = null,
  onDepartmentsUpdate = null,
  globalSuggestion
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State to manage the form data
  const [currentDoctor, setCurrentDoctor] = useState({
    name: "",
    opdNo: "",
    specialties: [],
    // Updated timings structure for From/To slots
    timings: {
      morning: { from: null, to: null },
      evening: { from: null, to: null },
      custom: { from: null, to: null },
    },
    removeProfilePicture: false,
    opdDays: "",
    experience: "",
    countryCode: "+91",
    contactNumber: "",
    extensionNumber: "",
    paName: "",
    paContactNumber: "",
    consultationCharges: "",
    videoConsultation: {
      enabled: false,
      startTime: null,
      endTime: null,
      charges: "",
      days: "",
    },
    teleMedicine: "", // Dropdown: Yes/No
    additionalInfo: "",
    isEnabled: true,
    type: "",
    // New fields
    profilePicture: null,
    profilePreview: null,
    title: "Dr.",
    designation: "",
    department: null,
    degrees: [],
    customDegrees: [],
    subDepartment: "",
    departments: [],
    surgeries: [], // New surgeries field
    whatsappNumber: "",
    averagePatientTime: "10m",
    maxPatientsHandled: 1,
    floor: "",
    masters: "",
  });

  const [whatsappOption, setWhatsappOption] = useState("same"); // "same" or "custom"

  const [errors, setErrors] = useState({});
  const [currentSpecialtyInput, setCurrentSpecialtyInput] = useState("");
  const [currentSurgeryInput, setCurrentSurgeryInput] = useState("");
  // New state for degree management
  const [showCustomDegreeInput, setShowCustomDegreeInput] = useState(false);
  const [newCustomDegree, setNewCustomDegree] = useState("");
  // New state for department management
  const [departments, setDepartments] = useState(availableDepartments || []);
  const [newDepartment, setNewDepartment] = useState("");
  // New state for sub-department management
  const [subDepartments, setSubDepartments] = useState(
    predefinedSubDepartments,
  );
  const [newSubDepartment, setNewSubDepartment] = useState("");
  const [suggestions, setSuggestions] = useState({
    treatableAreas: [],
    surgeries: [],
  });

  const normalizeSuggestionValue = (value) => {
    if (!value && value !== 0) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "object" && value !== null) {
      if (typeof value.label === "string" && value.label.trim()) return value.label.trim();
      if (typeof value.value === "string" && value.value.trim()) return value.value.trim();
      if (typeof value.name === "string" && value.name.trim()) return value.name.trim();
    }
    return "";
  };

  const normalizeSuggestionArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item) => normalizeSuggestionValue(item))
      .filter((item) => item);
  };

  useEffect(() => {
    if (availableDepartments) {
      setDepartments(availableDepartments);
    }
  }, [availableDepartments]);

  useEffect(() => {
    if (open) {
      if (doctorData) {
        // Safe check for existing timing structure or initialize new
        const morningFrom =
          doctorData.timings?.morning?.from ||
          doctorData.timings?.morning?.start ||
          doctorData.timings?.morning; // Handle backward compatibility if it was a string
        const morningTo =
          doctorData.timings?.morning?.to ||
          doctorData.timings?.morning?.end ||
          null;

        const eveningFrom =
          doctorData.timings?.evening?.from ||
          doctorData.timings?.evening?.start ||
          doctorData.timings?.evening;
        const eveningTo =
          doctorData.timings?.evening?.to ||
          doctorData.timings?.evening?.end ||
          null;

        const customFrom =
          doctorData.timings?.custom?.from ||
          doctorData.timings?.custom?.start ||
          null;
        const customTo =
          doctorData.timings?.custom?.to ||
          doctorData.timings?.custom?.end ||
          null;

        setCurrentDoctor({

          ...doctorData,
          department: doctorData?.department?._id || doctorData?.department,
          profilePicture: doctorData?.profilePicture?.imagePath,
          // profilePreview: doctorData?.profilePicture?.imagePath,
          timings: {
            morning: {
              from: morningFrom ? dayjs(morningFrom, "HH:mm") : null,
              to: morningTo ? dayjs(morningTo, "HH:mm") : null,
            },
            evening: {
              from:
                eveningFrom && dayjs(eveningFrom, "HH:mm").isValid()
                  ? dayjs(eveningFrom, "HH:mm")
                  : null,
              to:
                eveningTo && dayjs(eveningTo, "HH:mm").isValid()
                  ? dayjs(eveningTo, "HH:mm")
                  : null,
            },
            custom: {
              from: customFrom ? dayjs(customFrom, "HH:mm") : null,
              to: customTo ? dayjs(customTo, "HH:mm") : null,
            },
          },
          specialties: normalizeSuggestionArray(doctorData.specialties || []),
          surgeries: normalizeSuggestionArray(doctorData.surgeries || []),
          videoConsultation: {
            enabled: doctorData.videoConsultation?.enabled || false,
            startTime: doctorData.videoConsultation?.timeSlot?.start
              ? dayjs(doctorData.videoConsultation.timeSlot.start, "HH:mm")
              : doctorData.videoConsultation?.startTime
                ? dayjs(doctorData.videoConsultation.startTime, "HH:mm")
                : null,
            endTime: doctorData.videoConsultation?.timeSlot?.end
              ? dayjs(doctorData.videoConsultation.timeSlot.end, "HH:mm")
              : doctorData.videoConsultation?.endTime
                ? dayjs(doctorData.videoConsultation.endTime, "HH:mm")
                : null,
            charges: doctorData.videoConsultation?.charges || "",
            days: Array.isArray(doctorData.videoConsultation?.days)
              ? doctorData.videoConsultation.days.join(", ")
              : doctorData.videoConsultation?.days || "",
          },
          isEnabled: doctorData.isEnabled ?? true,
          name: doctorData.name || "",
          opdNo: doctorData.opdNo || "",
          opdDays: Array.isArray(doctorData.opdDays)
            ? doctorData.opdDays.join(", ")
            : doctorData.opdDays || "",
          experience: doctorData.experience || "",
          countryCode: doctorData.countryCode || "+91",
          contactNumber: doctorData.contactNumber || "",
          extensionNumber: doctorData.extensionNumber || "",
          paName: doctorData.paName || "",
          paContactNumber: doctorData.paContactNumber || "",
          consultationCharges: doctorData.consultationCharges || "",
          teleMedicine: doctorData.teleMedicine || "",
          additionalInfo: doctorData.additionalInfo || "",
          type: doctorData.type || "",
          degrees: doctorData.degrees || [],
          customDegrees: doctorData.customDegrees || [],
          subDepartment: doctorData.subDepartment || "",
          whatsappNumber: doctorData.whatsappNumber || "",
          averagePatientTime: doctorData.averagePatientTime,
          maxPatientsHandled: doctorData.maxPatientsHandled,
        });
        setWhatsappOption(
          doctorData.whatsappNumber === doctorData.contactNumber
            ? "same"
            : "custom",
        );
      } else {
        // Reset for new doctor
        setCurrentDoctor({
          name: "",
          opdNo: "",
          specialties: [],
          timings: {
            morning: { from: null, to: null },
            evening: { from: null, to: null },
            custom: { from: null, to: null },
          },
          opdDays: "",
          experience: "",
          countryCode: "+91",
          contactNumber: "",
          extensionNumber: "",
          paName: "",
          paContactNumber: "",
          consultationCharges: "",
          videoConsultation: {
            enabled: false,
            startTime: null,
            endTime: null,
            charges: "",
            days: "",
          },
          teleMedicine: "",
          additionalInfo: "",
          isEnabled: true,
          type: "Dr.",
          designation: "",
          degrees: [],
          customDegrees: [],
          department: null,
          surgeries: [],
          whatsappNumber: "",
          averagePatientTime: "10m",
          maxPatientsHandled: 1,
          floor: "",
          masters: "",
          title: "",
        });
        setWhatsappOption("same");
      }
      setErrors({});
      setCurrentSpecialtyInput("");
      setCurrentSurgeryInput("");
      setNewDepartment("");
      setNewSubDepartment("");
    }
  }, [open, doctorData]);

  // Handle changes for standard text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "maxPatientsHandled" && value > 50) {
      toast.error("Max 50 Patients Allowed")
      return
    }
    setCurrentDoctor((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Strict Number Validation Handler
  const handleNumberChange = (e, maxLength) => {
    const { name, value } = e.target;
    let numericValue = value.replace(/[^0-9]/g, "");

    if (maxLength && numericValue.length > maxLength) {
      numericValue = numericValue.slice(0, maxLength);
    }

    setCurrentDoctor((prev) => {
      const updated = { ...prev, [name]: numericValue };
      // Sync WhatsApp if option is "same"
      if (name === "contactNumber" && whatsappOption === "same") {
        updated.whatsappNumber = numericValue;
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };


  //  Updated Timings Handler for From/To
  const handleTimingsChange = (newValue, period, type) => {
    if (!newValue) return;

    const timings = currentDoctor.timings;

    const mFrom = timings.morning.from;
    const mTo = timings.morning.to;

    const eFrom = timings.evening.from;
    const eTo = timings.evening.to;

    const cFrom = timings.custom.from;
    const cTo = timings.custom.to;

    // ---- MORNING RULES ----
    if (period === "morning") {
      if (type === "to" && mFrom) {
        const max = mFrom.add(6, "hour");

        if (newValue.isBefore(mFrom)) {
          toast.error("Morning end time cannot be before start");
          return;
        }

        if (newValue.isAfter(max)) {
          toast.error("Morning shift cannot exceed 6 hours");
          return;
        }
      }
    }

    // ---- EVENING RULES ----
    if (period === "evening") {
      if (type === "from" && mTo) {
        if (newValue.isBefore(mTo)) {
          toast.error("Evening shift must start after Morning shift");
          return;
        }
      }

      if (type === "to" && eFrom) {
        if (newValue.isBefore(eFrom)) {
          toast.error("Evening end must be after start");
          return;
        }
      }
    }

    // ---- CUSTOM RULES ----
    if (period === "custom") {
      if (type === "from") {
        if (
          (mFrom && mTo && newValue.isBetween(mFrom, mTo, null, "[)")) ||
          (eFrom && eTo && newValue.isBetween(eFrom, eTo, null, "[)"))
        ) {
          toast.error("Custom shift overlaps with existing shift");
          return;
        }
      }

      if (type === "to" && cFrom) {
        if (newValue.isBefore(cFrom)) {
          toast.error("Custom end must be after start");
          return;
        }

        if (
          (mFrom && mTo && newValue.isBetween(mFrom, mTo, null, "(]")) ||
          (eFrom && eTo && newValue.isBetween(eFrom, eTo, null, "(]"))
        ) {
          toast.error("Custom shift overlaps with existing shift");
          return;
        }
      }
    }

    // ---- SAVE VALUE ----
    setCurrentDoctor((prev) => ({
      ...prev,
      timings: {
        ...prev.timings,
        [period]: {
          ...prev.timings[period],
          [type]: newValue,
        },
      },
    }));

    const errorKey = `timings.${period}.${type}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const handleVideoConsultationChange = (e) => {
    const { name, value, checked, type } = e.target;
    setCurrentDoctor((prev) => ({
      ...prev,
      videoConsultation: {
        ...prev.videoConsultation,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
    if (errors[`videoConsultation.${name}`]) {
      setErrors((prev) => ({ ...prev, [`videoConsultation.${name}`]: "" }));
    }
  };

  // const handleAddChip = (field, input, setInput) => {
  //   if (input.trim() && !currentDoctor[field].includes(input.trim())) {
  //     setCurrentDoctor((prev) => ({
  //       ...prev,
  //       [field]: [...prev[field], input.trim()],
  //     }));
  //     setInput("");
  //     if (errors[field]) {
  //       setErrors((prev) => ({ ...prev, [field]: "" }));
  //     }
  //   }
  // };

  // const handleDeleteChip = (field, chipToDelete) => {
  //   setCurrentDoctor((prev) => ({
  //     ...prev,
  //     [field]: prev[field].filter((chip) => chip !== chipToDelete),
  //   }));
  // };

  const validateForm = () => {
    const tempErrors = {};

    // ── Required text / select fields ──────────────────────────────────────
    if (!currentDoctor.name?.trim())
      tempErrors.name = "Doctor name is required.";

    if (!currentDoctor.opdNo?.toString().trim())
      tempErrors.opdNo = "OPD number is required.";

    if (!currentDoctor.experience?.toString().trim())
      tempErrors.experience = "Experience is required.";

    if (!currentDoctor.title?.trim())
      tempErrors.title = "Title  is required.";

    if (!currentDoctor.masters?.trim())
      tempErrors.masters = "Masters (Surgeon / Physician) is required.";

    if (!currentDoctor.type?.trim())
      tempErrors.type = "Doctor type is required.";

    // if (!currentDoctor.department?.toString().trim())
    //   tempErrors.department = "Department is required.";

    if (!currentDoctor.teleMedicine?.trim())
      tempErrors.teleMedicine = "Tele-consultation selection is required.";

    if (!currentDoctor.consultationCharges?.toString().trim())
      tempErrors.consultationCharges = "Consultation charges are required.";

    // ── Contact number: must be exactly 10 digits ──────────────────────────
    if (!currentDoctor.contactNumber?.toString().trim()) {
      tempErrors.contactNumber = "Contact number is required.";
    } else if (currentDoctor.contactNumber.toString().trim().length !== 10) {
      tempErrors.contactNumber = "Contact number must be exactly 10 digits.";
    }

    // ── PA Contact: if provided must be exactly 10 digits ──────────────────
    if (
      currentDoctor.paContactNumber?.toString().trim() &&
      currentDoctor.paContactNumber.toString().trim().length !== 10
    ) {
      tempErrors.paContactNumber =
        "PA contact number must be exactly 10 digits.";
    }

    // ── WhatsApp Number: if provided must be exactly 10 digits ─────────────
    if (
      currentDoctor.whatsappNumber?.toString().trim() &&
      currentDoctor.whatsappNumber.toString().trim().length !== 10
    ) {
      tempErrors.whatsappNumber = "WhatsApp number must be exactly 10 digits.";
    }

    // ── Degrees: at least one standard or custom degree ─────────────────────
    const totalDegrees =
      (currentDoctor.degrees?.length || 0) +
      (currentDoctor.customDegrees?.length || 0);
    if (totalDegrees === 0)
      tempErrors.degrees = "At least one degree is required.";

    // ── Specialties / Treatable list ──────────────────────────────────────
    if (!currentDoctor.specialties || currentDoctor.specialties.length === 0)
      tempErrors.specialties = "At least one treatable condition is required.";

    // ── OPD Days ──────────────────────────────────────────────────────────
    const opdDaysVal = currentDoctor.opdDays || "";
    const selectedOpdDays = Array.isArray(opdDaysVal)
      ? opdDaysVal
      : opdDaysVal.split(", ").filter(Boolean);
    if (selectedOpdDays.length === 0)
      tempErrors.opdDays = "Please select at least one OPD day.";

    // ── Morning Shift (optional) ───────────────────────────────────────────
    const mFrom = currentDoctor.timings?.morning?.from;
    const mTo = currentDoctor.timings?.morning?.to;

    // Only validate morning shift if at least one time is provided
    if (mFrom || mTo) {
      if (!mFrom || !dayjs(mFrom).isValid())
        tempErrors["timings.morning.from"] =
          "Morning start time is required when end time is provided.";

      if (!mTo || !dayjs(mTo).isValid()) {
        tempErrors["timings.morning.to"] =
          "Morning end time is required when start time is provided.";
      } else if (
        mFrom &&
        dayjs(mFrom).isValid() &&
        dayjs(mTo).isBefore(dayjs(mFrom))
      ) {
        tempErrors["timings.morning.to"] =
          "Morning end time must be after start time.";
      }
    }

    // ── Video Consultation (when enabled) ─────────────────────────────────
    if (currentDoctor.videoConsultation?.enabled) {
      if (!currentDoctor.videoConsultation.startTime)
        tempErrors["videoConsultation.startTime"] =
          "Video start time is required.";

      if (!currentDoctor.videoConsultation.endTime) {
        tempErrors["videoConsultation.endTime"] = "Video end time is required.";
      } else if (
        currentDoctor.videoConsultation.startTime &&
        dayjs(currentDoctor.videoConsultation.endTime).isBefore(
          dayjs(currentDoctor.videoConsultation.startTime),
        )
      ) {
        tempErrors["videoConsultation.endTime"] =
          "Video end time must be after start time.";
      }

      if (!currentDoctor.videoConsultation.charges?.toString().trim())
        tempErrors["videoConsultation.charges"] =
          "Video consultation charges are required.";

      const vcDays = currentDoctor.videoConsultation.days || "";
      const selectedVcDays = Array.isArray(vcDays)
        ? vcDays
        : vcDays.split(", ").filter(Boolean);
      if (selectedVcDays.length === 0)
        tempErrors["videoConsultation.days"] =
          "Please select at least one available day.";
    }

    setErrors(tempErrors);
    const isValid = Object.keys(tempErrors).length === 0;

    if (!isValid) {
      setTimeout(() => {
        const firstErrorKey = Object.keys(tempErrors)[0];
        const element =
          document.getElementsByName(firstErrorKey)[0] ||
          document.getElementById(firstErrorKey) ||
          document.querySelector(`[name^="${firstErrorKey.split(".")[0]}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }, 100);
    }

    return isValid;
  };

  // const isFormValid = () => {
  //   const requiredFields = [
  //     "name",
  //     "opdNo",
  //     "experience",
  //     "contactNumber",
  //     "consultationCharges",
  //     "teleMedicine",
  //     "type",
  //     "title",
  //     "masters",
  //   ];
  //   const hasRequired = requiredFields.every((field) =>
  //     currentDoctor[field]?.toString().trim(),
  //   );
  //   // const hasDepartment = !!currentDoctor.department?.toString().trim();
  //   const hasDegrees =
  //     (currentDoctor.degrees?.length || 0) +
  //     (currentDoctor.customDegrees?.length || 0) >
  //     0;
  //   const hasSpecialties = currentDoctor.specialties?.length > 0;
  //   const hasOpdDays = (() => {
  //     const val = currentDoctor.opdDays || "";
  //     return Array.isArray(val)
  //       ? val.length > 0
  //       : val.split(", ").filter(Boolean).length > 0;
  //   })();
  //   // Morning shift is now optional - only validate if provided
  //   const morningValid =
  //     currentDoctor.timings?.morning?.from && currentDoctor.timings?.morning?.to;
  //   return hasRequired && hasDegrees && hasSpecialties && hasOpdDays && morningValid;
  // };

  const handleSave = () => {
    if (validateForm()) {
      //  Format nested timing objects to strings
      const doctorToSave = {
        ...currentDoctor,
        _id: doctorData?._id,
        specialties: normalizeSuggestionArray(currentDoctor.specialties),
        surgeries: normalizeSuggestionArray(currentDoctor.surgeries),
        timings: {
          morning: {
            from: currentDoctor.timings.morning.from
              ? currentDoctor.timings.morning.from.format("HH:mm")
              : "",
            to: currentDoctor.timings.morning.to
              ? currentDoctor.timings.morning.to.format("HH:mm")
              : "",
          },
          evening: {
            from: currentDoctor.timings.evening.from
              ? currentDoctor.timings.evening.from.format("HH:mm")
              : "",
            to: currentDoctor.timings.evening.to
              ? currentDoctor.timings.evening.to.format("HH:mm")
              : "",
          },
          custom: {
            from: currentDoctor.timings.custom.from
              ? currentDoctor.timings.custom.from.format("HH:mm")
              : "",
            to: currentDoctor.timings.custom.to
              ? currentDoctor.timings.custom.to.format("HH:mm")
              : "",
          },
        },
        videoConsultation: {
          ...currentDoctor.videoConsultation,
          startTime: currentDoctor.videoConsultation.startTime
            ? currentDoctor.videoConsultation.startTime.format("HH:mm")
            : null,
          endTime: currentDoctor.videoConsultation.endTime
            ? currentDoctor.videoConsultation.endTime.format("HH:mm")
            : null,
          timeSlot:
            currentDoctor.videoConsultation.enabled &&
              currentDoctor.videoConsultation.startTime &&
              currentDoctor.videoConsultation.endTime
              ? `${currentDoctor.videoConsultation.startTime.format("HH:mm")} - ${currentDoctor.videoConsultation.endTime.format("HH:mm")}`
              : "",
        },
      };

      // Save new suggestions to localStorage
      const stored = JSON.parse(
        localStorage.getItem("added_suggestions") ||
        '{"treatableAreas": [], "surgeries": []}',
      );
      const newSpecialties = currentDoctor.specialties || [];
      const newSurgeries = currentDoctor.surgeries || [];

      const updated = {
        treatableAreas: [
          ...new Set([...stored.treatableAreas, ...newSpecialties]),
        ],
        surgeries: [...new Set([...stored.surgeries, ...newSurgeries])],
      };
      localStorage.setItem("added_suggestions", JSON.stringify(updated));

      console.log("on sav", doctorToSave);


      onSave(doctorToSave);
    } else {
      const errorMessages = Object.values(errors).filter(Boolean);
      console.log(errorMessages);

      toast.error(
        errorMessages.length > 0
          ? `${errorMessages[0]}`
          : "Please fill in all required fields correctly.",
        { duration: 4000 },
      );
    }
  };
  const speciality = (globalSuggestion || []).filter(
    (item) => item?.type === "speciality"
  );
  const surgery = (globalSuggestion || [])?.filter(
    (item) => item?.type === "surgery"
  ) || [];
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4aed88",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ff6b6b",
              secondary: "#fff",
            },
          },
        }}
      />
      <Dialog
        open={open}
        onClose={!loading ? onClose : undefined}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(135deg, ${colors.primary[800]} 0%, ${colors.primary[900]} 100%)`
                : `linear-gradient(135deg, ${colors.grey[50]} 0%, ${colors.primary[900]} 100%)`,
          },
        }}
      >
        <DialogTitle
          sx={{
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(135deg, ${colors.blueAccent[700]} 0%, ${colors.blueAccent[800]} 100%)`
                : `linear-gradient(135deg, ${colors.blueAccent[500]} 0%, ${colors.blueAccent[600]} 100%)`,
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <MedicalServicesIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {doctorData ? "Edit Doctor Details" : "Add New Doctor"}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            disabled={loading}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            backgroundColor:
              theme.palette.mode === "dark"
                ? colors.primary[900]
                : colors.grey[50],
          }}
        >
          <Box sx={{ p: 4 }}>
            <Stack spacing={4}>
              {/* Basic Information Card */}
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  background:
                    theme.palette.mode === "dark"
                      ? colors.primary[800]
                      : "white",
                  border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <PersonIcon
                      sx={{ color: colors.blueAccent[500], fontSize: 24 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary[500],
                      }}
                    >
                      Basic Information
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {/* Profile Picture Upload */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Avatar
                          src={
                            currentDoctor.profilePreview ||
                            (typeof currentDoctor.profilePicture === "string"
                              ? currentDoctor.profilePicture
                              : "")
                          }
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: colors.blueAccent[500],
                          }}
                          alt="Profile Picture"
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            Profile Picture <Typography component="span" variant="caption" color="text.secondary">(Max 2MB)</Typography>
                          </Typography>
                          <Button
                            variant="outlined"
                            component="label"
                            startIcon={<AddPhotoAlternateIcon />}
                            sx={{ mr: 1 }}
                          >
                            Upload Picture
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];

                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    toast.error("Image size should be less than 2MB");
                                    e.target.value = null; // Clear input
                                    return;
                                  }

                                  setCurrentDoctor((prev) => ({
                                    ...prev,
                                    profilePicture: file, //actual file (for backend)
                                    profilePreview: URL.createObjectURL(file),
                                  }));
                                }
                              }}
                            />
                          </Button>
                          {currentDoctor.profilePicture && (
                            <Button
                              variant="text"
                              color="error"
                              onClick={() =>
                                setCurrentDoctor((prev) => ({
                                  ...prev,
                                  profilePicture: null,
                                  profilePreview: null,
                                  removeProfilePicture: true,
                                }))
                              }
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    {/* Degree Field */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Degree *
                      </Typography>

                      {/* Predefined Degrees Multi-Select */}
                      <Autocomplete
                        multiple
                        id="degree-autocomplete"
                        options={predefinedDegrees}
                        value={currentDoctor.degrees || []}
                        onChange={(event, newValue) => {
                          setCurrentDoctor((prev) => ({
                            ...prev,
                            degrees: newValue,
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label="Degrees"
                            placeholder="Select degrees"
                            error={!!errors.degrees}
                            helperText={errors.degrees}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              {...getTagProps({ index })}
                              key={option}
                              size="small"
                              sx={{
                                backgroundColor: colors.blueAccent[600],
                                color: "white",
                              }}
                            />
                          ))
                        }
                        sx={{ mb: 2 }}
                      />

                      {/* Custom Degrees List */}
                      {currentDoctor.customDegrees?.map(
                        (customDegree, index) => (
                          <Box
                            key={index}
                            mb={1}
                            display="flex"
                            alignItems="center"
                          >
                            <Chip
                              label={customDegree}
                              onDelete={() =>
                                setCurrentDoctor((prev) => ({
                                  ...prev,
                                  customDegrees: prev.customDegrees.filter(
                                    (_, i) => i !== index,
                                  ),
                                }))
                              }
                              deleteIcon={<DeleteIcon />}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        ),
                      )}

                      {/* Add Custom Degree */}
                      {showCustomDegreeInput ? (
                        <Box display="flex" gap={1} mb={2}>
                          <TextField
                            label="Custom Degree"
                            variant="outlined"
                            value={newCustomDegree}
                            onChange={(e) => setNewCustomDegree(e.target.value)}
                            sx={{ flex: 1 }}
                            size="small"
                            placeholder="Enter custom degree"
                          />
                          <Button
                            onClick={() => {
                              if (
                                newCustomDegree.trim() &&
                                !currentDoctor.customDegrees.includes(
                                  newCustomDegree.trim(),
                                )
                              ) {
                                setCurrentDoctor((prev) => ({
                                  ...prev,
                                  customDegrees: [
                                    ...prev.customDegrees,
                                    newCustomDegree.trim(),
                                  ],
                                }));
                                setNewCustomDegree("");
                                setShowCustomDegreeInput(false);
                              }
                            }}
                            variant="contained"
                            color="primary"
                            size="small"
                            disabled={!newCustomDegree.trim()}
                          >
                            Add
                          </Button>
                          <Button
                            onClick={() => {
                              setShowCustomDegreeInput(false);
                              setNewCustomDegree("");
                            }}
                            variant="text"
                            size="small"
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          onClick={() => setShowCustomDegreeInput(true)}
                          variant="outlined"
                          startIcon={<AddIcon />}
                          size="small"
                        >
                          + Add Custom Degree
                        </Button>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Specialization"
                        name="masters"
                        value={currentDoctor.masters}
                        onChange={handleChange}
                        variant="outlined"
                        required
                        error={!!errors.masters}
                        helperText={errors.masters}
                      >
                        <MenuItem value="Surgeon">Surgeon</MenuItem>
                        <MenuItem value="Physician">Physician</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Type"
                        name="type"
                        value={currentDoctor.type}
                        onChange={handleChange}
                        variant="outlined"
                        required
                        error={!!errors.type}
                        helperText={errors.type}
                      >
                        <MenuItem value="Full Time">Full Time</MenuItem>
                        <MenuItem value="Part Time">Part Time</MenuItem>
                        <MenuItem value="Visiting">Visiting</MenuItem>
                        <MenuItem value="On Call">On Call</MenuItem>
                      </TextField>
                    </Grid>

                    {/* Title and Department Fields */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        {/* <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={currentDoctor.title}
                            onChange={handleChange}
                            variant="outlined"
                            required
                            error={!!errors.title}
                            helperText={errors.title}
                          />
                        </Grid> */}
                        <Grid item xs={12} sm={6}>
                          <Autocomplete
                            freeSolo
                            options={(() => {
                              const unique = [];
                              const seen = new Set();
                              departments.forEach((dept) => {
                                const name = (
                                  typeof dept === "string"
                                    ? dept
                                    : dept?.name || ""
                                )
                                  .toLowerCase()
                                  .trim();
                                if (name && !seen.has(name)) {
                                  seen.add(name);
                                  unique.push(dept);
                                }
                              });
                              return unique;
                            })()}
                            value={
                              currentDoctor.department
                                ? departments.find((d) => {
                                  const deptId = typeof currentDoctor.department === "object" ? currentDoctor.department?._id : currentDoctor.department;
                                  return (deptId && d?._id === deptId) || (deptId && (typeof d === "string" ? d : d?.name) === deptId);
                                }) || null
                                : null
                            }
                            getOptionLabel={(option) =>
                              typeof option === "string"
                                ? option
                                : option?.name || ""
                            }

                            onChange={(event, newValue) => {
                              if (typeof newValue === "string") {
                                // user typed manually
                                setCurrentDoctor((prev) => ({
                                  ...prev,
                                  department: { _id: null, name: newValue },
                                }));
                              } else {
                                setCurrentDoctor((prev) => ({
                                  ...prev,
                                  department: newValue,
                                }));
                              }
                            }}

                            inputValue={newDepartment}
                            onInputChange={(event, newInputValue) => {
                              setNewDepartment(newInputValue);
                            }}

                            renderInput={(params) => (
                              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                <TextField
                                  {...params}
                                  fullWidth
                                  label="Department"
                                  variant="outlined"
                                  error={!!errors.department}
                                  helperText={errors.department}
                                  placeholder="Select or type to add"
                                />
                                <Button
                                  onClick={async () => {
                                    const deptName = newDepartment.trim();
                                    const exists = departments.some(
                                      (dept) =>
                                        (typeof dept === "string"
                                          ? dept
                                          : dept?.name || ""
                                        )
                                          .toLowerCase()
                                          .trim() === deptName.toLowerCase(),
                                    );

                                    if (deptName && !exists) {
                                      try {
                                        const response =
                                          await commonRoutes.addDep(hospitalId, branchId, {
                                            name: deptName,
                                          });

                                        // Check multiple possible success indicators
                                        const isSuccess =
                                          response?.success ||
                                          response?.data?.success ||
                                          response?.status === 200 ||
                                          response?.status === "success";
                                        console.log("Is success:", isSuccess);

                                        if (isSuccess) {
                                          // Extract data from different possible response structures
                                          const departmentData = response?.data?.data

                                          console.log(
                                            "Extracted department data:",
                                            departmentData,
                                          );

                                          const updatedDepartments = [
                                            departmentData,
                                            ...departments

                                          ];
                                          setDepartments(updatedDepartments);
                                          setCurrentDoctor((prev) => ({
                                            ...prev,
                                            department: departmentData,
                                          }));
                                          setNewDepartment(deptName);
                                          setErrors((prev) => ({
                                            ...prev,
                                            department: null,
                                          }));

                                          // Notify parent component about the new department
                                          if (onDepartmentsUpdate) {
                                            onDepartmentsUpdate(
                                              updatedDepartments,
                                            );
                                          }

                                          toast.success(
                                            `Department "${deptName}" added successfully!`,
                                          );
                                        } else {
                                          console.log(
                                            "Department API failed:",
                                            response,
                                          );
                                          toast.error(
                                            response?.message ||
                                            "Failed to add department",
                                          );
                                        }
                                      } catch (error) {
                                        console.error(
                                          "Error creating department:",
                                          error,
                                        );
                                        toast.error(
                                          error?.response?.data?.message || "Failed to add department. Please try again.",
                                        );
                                      }
                                    }
                                  }}
                                  variant="contained"
                                  color="secondary"
                                  size="small"
                                  disabled={
                                    !newDepartment.trim() ||
                                    departments.some(
                                      (dept) =>
                                        (typeof dept === "string"
                                          ? dept
                                          : dept?.name || ""
                                        )
                                          .toLowerCase()
                                          .trim() ===
                                        newDepartment.trim().toLowerCase(),
                                    )
                                  }

                                >
                                  Add
                                </Button>
                              </Box>
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Title"
                            name="title"
                            value={currentDoctor.title}
                            onChange={handleChange}
                            variant="outlined"
                            required
                            error={!!errors.title}
                            helperText={errors.title}
                          >
                            <MenuItem value="Dr.">Dr.</MenuItem>
                            <MenuItem value="Prof. Dr.">Prof. Dr.</MenuItem>
                            <MenuItem value="Assoc. Prof. Dr.">Assoc. Prof. Dr.</MenuItem>
                            <MenuItem value="Asst. Prof. Dr.">Asst. Prof. Dr.</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Designation"
                            name="designation"
                            value={currentDoctor.designation}
                            onChange={handleChange}
                          >
                            <MenuItem value="Consultant">Consultant</MenuItem>
                            <MenuItem value="Senior Consultant">Senior Consultant</MenuItem>
                            <MenuItem value="Junior Resident">Junior Resident</MenuItem>
                            <MenuItem value="Senior Resident">Senior Resident</MenuItem>
                            <MenuItem value="HOD">HOD</MenuItem>
                          </TextField>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Doctor Name"
                        name="name"
                        value={currentDoctor.name}
                        onChange={handleChange}
                        variant="outlined"
                        required
                        error={!!errors.name}
                        helperText={errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="OPD No."
                        name="opdNo"
                        value={currentDoctor.opdNo}
                        onChange={(e) => handleNumberChange(e, 10)}
                        variant="outlined"
                        required
                        error={!!errors.opdNo}
                        helperText={errors.opdNo}
                        inputProps={{ inputMode: "numeric" }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Experience (Years)"
                        name="experience"
                        value={currentDoctor.experience}
                        onChange={(e) => handleNumberChange(e, 2)}
                        variant="outlined"
                        required
                        error={!!errors.experience}
                        helperText={errors.experience}
                        inputProps={{ inputMode: "numeric" }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "flex-start",
                        }}
                      >
                        <Autocomplete
                          sx={{ width: "150px" }}
                          options={countryCodes}
                          getOptionLabel={(option) =>
                            typeof option === "string"
                              ? option
                              : `${option.name} (${option.dial_code})`
                          }
                          value={
                            countryCodes.find(
                              (c) => c.dial_code === currentDoctor.countryCode,
                            ) || null
                          }
                          onChange={(event, newValue) => {
                            if (newValue) {
                              setCurrentDoctor((prev) => ({
                                ...prev,
                                countryCode: newValue.dial_code,
                              }));
                            }
                          }}
                          disableClearable
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Code"
                              variant="outlined"
                              placeholder="+91"
                            />
                          )}
                        />
                        <TextField
                          fullWidth
                          label="Contact Number"
                          name="contactNumber"
                          value={currentDoctor.contactNumber}
                          onChange={(e) => handleNumberChange(e, 10)}
                          variant="outlined"
                          required
                          error={!!errors.contactNumber}
                          helperText={errors.contactNumber}
                          inputProps={{ inputMode: "numeric" }}
                          placeholder="10 Digits Max"
                        />
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.grey[300],
                            mb: 0.5,
                            display: "block",
                          }}
                        >
                          WhatsApp Number Option
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <FormControlLabel
                            control={
                              <Radio
                                checked={whatsappOption === "same"}
                                onChange={() => {
                                  setWhatsappOption("same");
                                  setCurrentDoctor((prev) => ({
                                    ...prev,
                                    whatsappNumber: prev.contactNumber,
                                  }));
                                }}
                                size="small"
                                sx={{
                                  color: colors.blueAccent[500],
                                  "&.Mui-checked": {
                                    color: colors.blueAccent[500],
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography variant="caption">
                                Same as Contact Number
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            control={
                              <Radio
                                checked={whatsappOption === "custom"}
                                onChange={() => {
                                  setWhatsappOption("custom");
                                }}
                                size="small"
                                sx={{
                                  color: colors.blueAccent[500],
                                  "&.Mui-checked": {
                                    color: colors.blueAccent[500],
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography variant="caption">
                                Add Different WhatsApp
                              </Typography>
                            }
                          />
                        </Stack>
                      </Box>
                      {whatsappOption === "custom" && (
                        <Box sx={{ mt: 1.5 }}>
                          <TextField
                            fullWidth
                            label="WhatsApp Number"
                            name="whatsappNumber"
                            value={currentDoctor.whatsappNumber}
                            onChange={(e) => handleNumberChange(e, 10)}
                            variant="outlined"
                            error={!!errors.whatsappNumber}
                            helperText={errors.whatsappNumber}
                            inputProps={{ inputMode: "numeric" }}
                            placeholder="Enter WhatsApp Number"
                            size="small"
                          />
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Specialties Card */}
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  background:
                    theme.palette.mode === "dark"
                      ? colors.primary[800]
                      : "white",
                  border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <MedicalServicesIcon
                      sx={{ color: colors.greenAccent[500], fontSize: 24 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary[500],
                      }}
                    >
                      Treatable List
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Typography
                      variant="caption"
                      color={
                        currentDoctor.specialties.length === 0 &&
                          errors.specialties
                          ? "error"
                          : "textSecondary"
                      }
                      sx={{ ml: 1 }}
                    >
                      Select from list or type and press Enter
                    </Typography>
                    <Stack spacing={0.5}>
                      <Autocomplete
                        multiple
                        fullWidth
                        size="small"
                        options={
                          speciality?.map((item) => ({
                            label: item.value,
                            value: item._id,
                          })) || []
                        }
                        getOptionLabel={(option) =>
                          typeof option === "string" ? option : option.label
                        }
                        value={currentDoctor.specialties || []}
                        freeSolo

                        onChange={(event, newValue) => {
                          let processedValues = [];

                          newValue.forEach((item) => {
                            if (typeof item === "string") {
                              // split by comma
                              const splitValues = item.split(",").map((val) => val.trim()).filter(Boolean);
                              processedValues.push(...splitValues);
                            } else {
                              processedValues.push(item);
                            }
                          });

                          setCurrentDoctor((prev) => ({
                            ...prev,
                            specialties: normalizeSuggestionArray(processedValues),
                          }));

                          if (errors.specialties) {
                            setErrors((prev) => ({ ...prev, specialties: "" }));
                          }
                        }}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={typeof option === "string" ? option : option.label || option.value}
                              {...getTagProps({ index })}
                              key={index}
                              size="small"
                              sx={{
                                backgroundColor: colors.greenAccent[500],
                                color: "white",
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Treatable List (Specialties)"
                            placeholder="Select or type and press Enter"
                            error={
                              !!errors.specialties &&
                              currentDoctor.specialties.length === 0
                            }
                          />
                        )}
                      />

                    </Stack>
                  </Stack>
                  <Box sx={{ height: "10px" }} />
                  <Stack spacing={2}>
                    <Stack spacing={0.5}>
                      <Autocomplete
                        multiple
                        fullWidth
                        size="small"
                        options={
                          surgery?.map((item) => ({
                            label: item.value,
                            value: item._id,
                          })) || []
                        }
                        value={currentDoctor.surgeries || []}
                        freeSolo
                        getOptionLabel={(option) =>
                          typeof option === "string" ? option : option.label
                        }

                        onChange={(event, newValue) => {
                          let processedValues = [];

                          newValue.forEach((item) => {
                            if (typeof item === "string") {
                              const splitValues = item
                                .split(",")
                                .map((val) => val.trim())
                                .filter(Boolean);

                              processedValues.push(...splitValues);
                            } else {
                              processedValues.push(item);
                            }
                          });

                          setCurrentDoctor((prev) => ({
                            ...prev,
                            surgeries: normalizeSuggestionArray(processedValues),
                          }));
                        }}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={typeof option === "string" ? option : option.label || option.value}
                              {...getTagProps({ index })}
                              key={index}
                              size="small"
                              sx={{
                                backgroundColor: colors.greenAccent[500],
                                color: "white",
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Surgery Name"
                            placeholder="Select or type and press Enter"
                          />
                        )}
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/*  Schedule & Availability Card - UPDATED WITH FROM/TO */}
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  background:
                    theme.palette.mode === "dark"
                      ? colors.primary[800]
                      : "white",
                  border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <ScheduleIcon
                      sx={{ color: colors.orangeAccent[500], fontSize: 24 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary[500],
                      }}
                    >
                      Schedule & Availability
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {/* Morning Row */}
                    <Grid item xs={12}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 600,
                          display: "block",
                          mb: 1,
                        }}
                      >
                        MORNING SHIFT
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TimePicker
                            label="From"
                            ampm
                            ampmInClock
                            views={["hours", "minutes"]}
                            value={currentDoctor.timings.morning.from}
                            referenceDate={dayjs().hour(5).minute(0)}
                            minTime={dayjs().hour(5).minute(0)}
                            maxTime={dayjs().hour(12).minute(0)}
                            minutesStep={5}
                            onChange={(newValue) =>
                              handleTimingsChange(newValue, "morning", "from")
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <TimePicker
                            label="To"
                            ampm
                            ampmInClock
                            views={["hours", "minutes"]}
                            value={currentDoctor.timings.morning.to}
                            minTime={currentDoctor.timings.morning.from || dayjs().hour(5).minute(0)}
                            maxTime={
                              currentDoctor.timings.morning.from
                                ? currentDoctor.timings.morning.from.add(6, "hour").minute(0)
                                : dayjs().hour(12).minute(0)
                            }
                            minutesStep={5}
                            onChange={(newValue) =>
                              handleTimingsChange(newValue, "morning", "to")
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Evening Row */}
                    <Grid item xs={12}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 600,
                          display: "block",
                          mb: 1,
                        }}
                      >
                        EVENING SHIFT (Optional)
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TimePicker
                            label="From"
                            ampm
                            ampmInClock
                            views={["hours", "minutes"]}
                            value={currentDoctor.timings.evening.from}
                            referenceDate={dayjs().hour(13)}
                            minTime={currentDoctor.timings.morning.to || dayjs().hour(12)}
                            maxTime={dayjs().hour(22)}
                            minutesStep={5}
                            onChange={(newValue) =>
                              handleTimingsChange(newValue, "evening", "from")
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <TimePicker
                            label="To"
                            ampm
                            ampmInClock
                            views={["hours", "minutes"]}
                            value={currentDoctor.timings.evening.to}
                            referenceDate={dayjs().hour(14)}
                            minTime={currentDoctor.timings.evening.from || dayjs().hour(12)}
                            maxTime={dayjs().hour(23)}
                            minutesStep={5}
                            onChange={(newValue) =>
                              handleTimingsChange(newValue, "evening", "to")
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Custom Row */}
                    <Grid item xs={12}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 600,
                          display: "block",
                          mb: 1,
                        }}
                      >
                        CUSTOM SHIFT (Optional)
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TimePicker
                            label="From"
                            ampm
                            ampmInClock
                            views={["hours", "minutes"]}
                            value={currentDoctor.timings.custom.from}
                            referenceDate={dayjs().hour(15)}
                            minutesStep={5}
                            onChange={(newValue) =>
                              handleTimingsChange(newValue, "custom", "from")
                            }
                            shouldDisableTime={(value, view) => {

                              const mFrom = currentDoctor.timings.morning.from;
                              const mTo = currentDoctor.timings.morning.to;

                              const eFrom = currentDoctor.timings.evening.from;
                              const eTo = currentDoctor.timings.evening.to;

                              if (view === "hours") {
                                const hourTime = dayjs().hour(value).minute(0);

                                if (mFrom && mTo && hourTime.isBetween(mFrom, mTo, null, "[)")) {
                                  return true;
                                }

                                if (eFrom && eTo && hourTime.isBetween(eFrom, eTo, null, "[)")) {
                                  return true;
                                }
                              }

                              if (view === "minutes") {
                                const selectedHour = currentDoctor.timings.custom.from?.hour();

                                if (selectedHour === undefined) return false;

                                const minuteTime = dayjs()
                                  .hour(selectedHour)
                                  .minute(value);

                                if (mFrom && mTo && minuteTime.isBetween(mFrom, mTo, null, "[)")) {
                                  return true;
                                }

                                if (eFrom && eTo && minuteTime.isBetween(eFrom, eTo, null, "[)")) {
                                  return true;
                                }
                              }

                              return false;
                            }}
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <TimePicker
                            label="To"
                            ampm
                            ampmInClock
                            views={["hours", "minutes"]}
                            value={currentDoctor.timings.custom.to}
                            referenceDate={dayjs().hour(16)}
                            minutesStep={5}
                            onChange={(newValue) =>
                              handleTimingsChange(newValue, "custom", "to")
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* OPD Days Selector (Updated to Multi-Select) */}
                    <Grid item xs={12} sm={12}>
                      <Box
                        sx={{
                          p: 2,
                          border: "1px solid",
                          borderColor: errors.opdDays
                            ? "error.main"
                            : theme.palette.divider,
                          borderRadius: 2,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(0,0,0,0.02)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            mb: 2,
                            display: "block",
                            fontWeight: 600,
                            color: colors.primary[500],
                          }}
                        >
                          OPD DAYS *
                        </Typography>

                        {(() => {
                          const currentVal = currentDoctor.opdDays || "";
                          const DAYS = [
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ];

                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: "wrap" }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  mb: 1.5,
                                  display: "block",
                                  color: "text.secondary",
                                  fontWeight: 500,
                                }}
                              >
                                Select Days:
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                useFlexGap
                              >
                                {DAYS.map((day) => {
                                  let selectedDays = Array.isArray(currentVal)
                                    ? currentVal
                                    : currentVal
                                      ? currentVal.split(", ").filter((d) => d)
                                      : [];
                                  const isSelected = selectedDays.includes(day);
                                  return (
                                    <Chip
                                      key={day}
                                      label={day.slice(0, 3)}
                                      onClick={() => {
                                        let updatedDays = [...selectedDays];
                                        if (isSelected) {
                                          updatedDays = updatedDays.filter(
                                            (d) => d !== day,
                                          );
                                        } else {
                                          updatedDays.push(day);
                                        }

                                        // Sort days based on original array order
                                        updatedDays.sort(
                                          (a, b) =>
                                            DAYS.indexOf(a) - DAYS.indexOf(b),
                                        );

                                        const newValue = updatedDays.join(", ");
                                        setCurrentDoctor((prev) => ({
                                          ...prev,
                                          opdDays: newValue,
                                        }));

                                        // Clear error when at least one day is selected
                                        if (updatedDays.length > 0) {
                                          setErrors((prev) => ({
                                            ...prev,
                                            opdDays: null,
                                          }));
                                        }
                                      }}
                                      color={
                                        isSelected ? "secondary" : "default"
                                      }
                                      variant={
                                        isSelected ? "filled" : "outlined"
                                      }
                                      size="small"
                                      sx={{ borderRadius: 1.5 }}
                                    />
                                  );
                                })}
                              </Stack>
                            </Box>
                          );
                        })()}

                        {currentDoctor.opdDays && (
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 2,
                              fontWeight: 600,
                              color: colors.blueAccent[500],
                            }}
                          >
                            Selected: {currentDoctor.opdDays}
                          </Typography>
                        )}
                        {errors.opdDays && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, display: "block" }}
                          >
                            {errors.opdDays}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Consultation Charges"
                        name="consultationCharges"
                        value={currentDoctor.consultationCharges}
                        onChange={handleChange}
                        required
                        error={!!errors.consultationCharges}
                        helperText={errors.consultationCharges}
                        placeholder="₹ Amount"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Floor"
                        name="floor"
                        value={currentDoctor.floor}
                        onChange={handleChange}
                        required
                        error={!!errors.floor}
                        helperText={errors.floor}
                        placeholder="Floor Number"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Max Patients Handled"
                        name="maxPatientsHandled"
                        value={currentDoctor.maxPatientsHandled}
                        onChange={handleChange}
                        required
                        type="number"
                        inputProps={{ min: 1, max: 20 }}
                        error={!!errors.maxPatientsHandled}
                        helperText={errors.maxPatientsHandled}
                        placeholder="Ex. 10, 15, 20"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Average Patient Time"
                        name="averagePatientTime"
                        value={currentDoctor.averagePatientTime}
                        onChange={handleChange}
                      >
                        <MenuItem value="10">10 Minutes</MenuItem>
                        <MenuItem value="15">15 Minutes</MenuItem>
                        <MenuItem value="30">30 Minutes</MenuItem>
                        <MenuItem value="45">45 Minutes</MenuItem>
                        <MenuItem value="60">60 Minutes</MenuItem>
                      </TextField>
                    </Grid>

                  </Grid>
                </CardContent>
              </Card>

              {/* Additional Details Card */}
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  background:
                    theme.palette.mode === "dark"
                      ? colors.primary[800]
                      : "white",
                  border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.primary[500],
                      mb: 3,
                    }}
                  >
                    Additional Details
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Extension Number"
                        name="extensionNumber"
                        value={currentDoctor.extensionNumber}
                        onChange={handleChange}
                        helperText="Optional"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="PA Name"
                        name="paName"
                        value={currentDoctor.paName}
                        onChange={handleChange}
                        helperText="Optional"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Tele Consultation"
                        name="teleMedicine"
                        value={currentDoctor.teleMedicine}
                        onChange={handleChange}
                        required
                        error={!!errors.teleMedicine}
                        helperText={errors.teleMedicine}
                      >
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="PA Contact Number"
                        name="paContactNumber"
                        value={currentDoctor.paContactNumber}
                        onChange={(e) => handleNumberChange(e, 10)}
                        error={!!errors.paContactNumber}
                        helperText={
                          errors.paContactNumber || "Optional – 10 digits"
                        }
                        inputProps={{ inputMode: "numeric" }}
                        placeholder="10 Digits"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Additional Information"
                        name="additionalInfo"
                        value={currentDoctor.additionalInfo}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        helperText="Optional"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Video Consultation Card */}
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  background:
                    theme.palette.mode === "dark"
                      ? colors.primary[800]
                      : "white",
                  border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <VideoCallIcon
                      sx={{ color: colors.blueAccent[500], fontSize: 24 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary[500],
                      }}
                    >
                      Video Consultation
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={currentDoctor.videoConsultation.enabled}
                          onChange={handleVideoConsultationChange}
                          name="enabled"
                        />
                      }
                      label="Enable Video Consultation"
                    />

                    {currentDoctor.videoConsultation.enabled && (
                      <Grid
                        container
                        spacing={3}
                        sx={{
                          p: 3,
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? colors.primary[700]
                              : colors.grey[50],
                          borderRadius: 2,
                        }}
                      >
                        {/* First Row: From Time and To Time */}
                        <Grid item xs={12} sm={6}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                              label="From Time"
                              value={currentDoctor.videoConsultation.startTime}
                              onChange={(newValue) => {
                                setCurrentDoctor((prev) => ({
                                  ...prev,
                                  videoConsultation: {
                                    ...prev.videoConsultation,
                                    startTime: newValue,
                                  },
                                }));
                                if (errors["videoConsultation.startTime"]) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    ["videoConsultation.startTime"]: "",
                                  }));
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  required
                                  error={
                                    !!errors["videoConsultation.startTime"]
                                  }
                                  helperText={
                                    errors["videoConsultation.startTime"]
                                  }
                                />
                              )}
                            />
                          </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                              label="To Time"
                              value={currentDoctor.videoConsultation.endTime}
                              onChange={(newValue) => {
                                setCurrentDoctor((prev) => ({
                                  ...prev,
                                  videoConsultation: {
                                    ...prev.videoConsultation,
                                    endTime: newValue,
                                  },
                                }));
                                if (errors["videoConsultation.endTime"]) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    ["videoConsultation.endTime"]: "",
                                  }));
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  required
                                  error={!!errors["videoConsultation.endTime"]}
                                  helperText={
                                    errors["videoConsultation.endTime"]
                                  }
                                />
                              )}
                            />
                          </LocalizationProvider>
                        </Grid>

                        {/* Second Row: Consultation Charges and Available Days */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Consultation Charges"
                            name="charges"
                            value={currentDoctor.videoConsultation.charges}
                            onChange={handleVideoConsultationChange}
                            required
                            error={!!errors["videoConsultation.charges"]}
                            helperText={errors["videoConsultation.charges"]}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="caption"
                            sx={{
                              mb: 1.5,
                              display: "block",
                              color: "text.secondary",
                              fontWeight: 500,
                            }}
                          >
                            Available Days *
                          </Typography>
                          {(() => {
                            const currentVal =
                              currentDoctor.videoConsultation.days || "";
                            const DAYS = [
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday",
                            ];

                            return (
                              <>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                  useFlexGap
                                >
                                  {DAYS.map((day) => {
                                    let selectedDays = Array.isArray(currentVal)
                                      ? currentVal
                                      : currentVal
                                        ? currentVal
                                          .split(", ")
                                          .filter((d) => d)
                                        : [];
                                    const isSelected =
                                      selectedDays.includes(day);
                                    return (
                                      <Chip
                                        key={day}
                                        label={day.slice(0, 3)}
                                        onClick={() => {
                                          if (isSelected) {
                                            selectedDays = selectedDays.filter(
                                              (d) => d !== day,
                                            );
                                          } else {
                                            selectedDays.push(day);
                                          }
                                          selectedDays.sort(
                                            (a, b) =>
                                              DAYS.indexOf(a) - DAYS.indexOf(b),
                                          );
                                          setCurrentDoctor((prev) => ({
                                            ...prev,
                                            videoConsultation: {
                                              ...prev.videoConsultation,
                                              days: selectedDays.join(", "),
                                            },
                                          }));
                                          if (
                                            errors["videoConsultation.days"]
                                          ) {
                                            setErrors((prev) => ({
                                              ...prev,
                                              ["videoConsultation.days"]: "",
                                            }));
                                          }
                                        }}
                                        color={
                                          isSelected ? "secondary" : "default"
                                        }
                                        variant={
                                          isSelected ? "filled" : "outlined"
                                        }
                                        size="small"
                                        sx={{ borderRadius: 1.5 }}
                                      />
                                    );
                                  })}
                                </Stack>
                                {currentDoctor.videoConsultation.days && (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      mt: 2,
                                      fontWeight: 600,
                                      color: colors.blueAccent[500],
                                    }}
                                  >
                                    Selected:{" "}
                                    {currentDoctor.videoConsultation.days}
                                  </Typography>
                                )}
                                {errors["videoConsultation.days"] && (
                                  <Typography
                                    variant="caption"
                                    color="error"
                                    sx={{ mt: 1, display: "block" }}
                                  >
                                    {errors["videoConsultation.days"]}
                                  </Typography>
                                )}
                              </>
                            );
                          })()}
                        </Grid>
                      </Grid>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            background:
              theme.palette.mode === "dark"
                ? colors.primary[800]
                : colors.grey[50],
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            size="large"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
            sx={{
              background: `linear-gradient(135deg, ${colors.greenAccent[500]} 0%, ${colors.greenAccent[600]} 100%)`,
            }}
          >
            {loading
              ? "Saving..."
              : doctorData
                ? "Update Doctor"
                : "Add Doctor"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
export default AddDoctorModal;
