import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Papa from "papaparse";
import {
  Box,
  Button,
  useTheme,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  Switch,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { tokens } from "../../../../theme";
import { UserContextHook } from "../../../../contexts/UserContexts";
import SectionLoader from "../../../../components/SectionLoader";
import { doctorValidation } from "../../../Schemas/doctor";
import { cleanCSVRows, handleDownloadTemplate, validateCSVRows } from "../../../Schemas/validation";

// Components
import Header from "../../../../components/HeaderNew";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import BedIcon from "@mui/icons-material/Bed";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

// Modals
import AddDoctorModal from "./editBranchParts/DoctorEdit";
import AddDepartmentModal from "./editBranchParts/DepartmentEdit";
import AddEmpanelmentListModal from "./editBranchParts/EmpanelmentListEdit";
import AddTestLabModal from "./editBranchParts/TestLabsEdit";
import AddProcedureModal from "./editBranchParts/ProcedureListEdit";
import AddCodeAnnouncementModal from "./editBranchParts/CodeAlertEdit";
import AddIpdDetailsModal from "./editBranchParts/IPDDetailEdit";
import AddDayCareDetailsModal from "./editBranchParts/DayCareDetail";
import AddDepartmentInchargeModal from "./editBranchParts/DepartmentIncharge";
import { useApi } from "../../../../api/useApi";
import { commonRoutes } from "../../../../api/apiService";
import DeleteConfirmationModal from "../../../../components/DeleteConfirmationModal";
import ProgressPopup, { SpecialtiesCell } from "./UploadLoading";
import DoctorAttendanceCalendar from "./DoctorAttendanceCalendar";
import { getRequiredHeaders, getDummyData } from "../../../Schemas/doctor";
import { toTitleCase } from "../../../../utils/normalizeUserType";

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

export const normalizeSuggestionArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => normalizeSuggestionValue(item))
    .filter((item) => item);
};

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const showUploadCSV = ["doctor"];
const normalizeValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

// Move TabHeader outside to prevent re-renders
const TabHeader = ({
  title,
  btnText,
  onAdd,
  type,
  filterByType,
  searchTerm,
  handleSearchChange,
  // setSearchTerm,
  uploadCSV = null,
  downloadTemplate = null,
  isShowAction,
  handleOpenModal,
  handleCSVFileChange = null,
  csvFileInputRef = null
}) => (
  <Box
    display="flex"
    flexDirection={{ xs: "column", sm: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", sm: "center" }}
    gap={2}
    mb={3}
  >
    <Typography variant="h5" fontWeight="600" color="#333">
      {title}
    </Typography>
    <Box sx={{
      display: "flex",
      alignItems: { xs: "stretch", sm: "center" },
      flexDirection: { xs: "column", sm: "row" },
      gap: 2,
      width: { xs: "100%", sm: "auto" }
    }}>
      {(type === "department" ||
        type === "doctor" ||
        type === "empanelment" ||
        type === "testLab" ||
        type === "ipd" ||
        type === "dayCare" ||
        type === "procedure" ||
        type === "incharge" ||
        type === "codeAlert") && (
          <TextField
            key={`${type}-search`}
            placeholder={`Search by ${type === "testLab"
              ? "test"
              : type === "ipd" || type === "dayCare"
                ? "category"
                : type === "procedure"
                  ? "procedure"
                  : type === "incharge"
                    ? "incharge"
                    : type === "codeAlert"
                      ? "code alert"
                      : type
              } name...`}
            value={searchTerm[type] || ""}
            onChange={(e) => handleSearchChange(type, e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "100%", sm: 250 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
              },
            }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />
        )}
      {isShowAction && (
        <>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal(type)}
            sx={{
              borderRadius: "20px",
              fontWeight: "bold",
              bgcolor: "#4CAF50",
              color: "white",
              textTransform: "none",
              width: { xs: "100%", sm: "auto" }
            }}
          >
            {btnText}
          </Button>
          {
            showUploadCSV.includes(type) && (
              <IconButton
                component="label"
                className="ff-btn export"
                sx={{
                  borderRadius: 2,
                  height: 36,
                  padding: "0 16px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  backgroundColor: "#2e7d32",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#1b5e20",
                  },
                }}
              >
                <input
                  ref={csvFileInputRef ? csvFileInputRef : null}
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={handleCSVFileChange ? handleCSVFileChange : null}
                />

                <CloudUploadIcon sx={{ fontSize: "1.1rem", mr: 0.5 }} />
                Upload CSV
              </IconButton>
            )
          }

          {/* Download template button */}
          {(showUploadCSV.includes(type)) && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                if (!downloadTemplate) return;
                // const format = window.prompt("Which format to download? (csv)", "csv");
                // if (!format) return;
                // if (format.trim().toLowerCase() !== "csv") {
                //   toast.error("Only CSV format is supported.");
                //   return;
                // }
                downloadTemplate(type, "csv");
              }}
              sx={{
                borderRadius: 2,
                height: 36,
                padding: "0 12px",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#2e7d32",
                borderColor: "#2e7d32",
                backgroundColor: "#fff",
                textTransform: "none",
              }}
            >
              Download Format
            </Button>
          )}


        </>
      )}

    </Box>


  </Box>
);


const BranchInfo = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { id } = useParams();
  const location = useLocation()
  const hosId = location?.state?.hospitalId
  const navigate = useNavigate();
  const { currentUser } = UserContextHook();
  const userRole = (currentUser?.userType || currentUser?.type || "").toLowerCase();
  const isSuperAdmin = userRole === "superadmin";
  const isAdmin = userRole === "admin";
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceType, setAttendanceType] = useState("");
  const [selectedDoctorData, setSelectedDoctorData] = useState(null);
  const [isShowAction, setIsShowAction] = React.useState(
    !["supermanager", "teamleader"].includes(userRole)
  );
  const canEdit = isSuperAdmin || isAdmin;
  const canDelete = isSuperAdmin || (isAdmin && currentUser?.canDelete);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [hospitalData, setHospitalData] = useState(null);
  const [currentBranch, setCurrentBranch] = useState(null);

  // Data Lists
  const [doctorsList, setDoctorsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [empanelmentList, setEmpanelmentList] = useState([]);
  const [testLabsList, setTestLabsList] = useState([]);
  const [ipdList, setIpdList] = useState([]);
  const [dayCareList, setDayCareList] = useState([]);
  const [proceduresList, setProceduresList] = useState([]);
  const [inchargeList, setInchargeList] = useState([]);
  const [codeAlertsList, setCodeAlertsList] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [modalOpen, setModalOpen] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadCSVModalOpen, setUploadCSVModalOpen] = useState(false);
  const [csvStatus, setCSVStatus] = useState("idle");
  const [csvProgress, setCSVProgress] = useState({ current: 0, total: 0 });
  const [csvProcessMessage, setCSVProcessMessage] = useState("");
  const [csvValidationErrors, setCSVValidationErrors] = useState([]);
  const [csvValidationSummary, setCSVValidationSummary] = useState({ totalRows: 0, successCount: 0, errorCount: 0 });
  const [csvRows, setCSVRows] = useState([]);
  const [csvParsedValidRows, setCSVParsedValidRows] = useState([]);
  const [csvParsedInvalidRows, setCSVParsedInvalidRows] = useState([]);
  const [csvParseError, setCSVParseError] = useState(null);
  const [csvActionResult, setCSVActionResult] = useState("");
  const [searchTerms, setSearchTerms] = useState({
    department: "",
    doctor: "",
    empanelment: "",
    testLab: "",
    ipd: "",
    dayCare: "",
    procedure: "",
    incharge: "",
    codeAlert: "",
  });
  const [globalSuggestion, setGlobalSuggestion] = useState([]);
  // const { request } = useApi(commonRoutes.getFilledForms);
  const formsColumnFilterRef = useRef(null);
  const csvFileInputRef = useRef(null);

  const {
    request: getSingleBranch,
    loading: branchLoading,
    error: branchError,
  } = useApi(commonRoutes.getBranchById);

  const {
    request: getSuggestions,
    loading: suggestionsLoading,
    error: suggestionsError,
  } = useApi(commonRoutes.getSuggestions);

  const {
    request: addDoctor,
    loading: addDoctorLoading,
    error: addDoctorError,
  } = useApi(commonRoutes.addDoctor);

  const {
    request: updateDoctorApi,
    loading: updateDoctorLoading,
    error: updateDoctorError,
  } = useApi(commonRoutes.updateDoctor);

  const {
    request: updateDoctorStatusApi,
    loading: updateDoctorStatusLoading,
    error: updateDoctorStatusError,
  } = useApi(commonRoutes.updateDoctorStatus);

  const {
    request: removeDoctorApi,
    loading: removeDoctorLoading,
    error: removeDoctorError,
  } = useApi(commonRoutes.removeDoc);

  const {
    request: addDepartmentApi,
    loading: addDepartmentLoading,
    error: addDepartmentError,
  } = useApi(commonRoutes.addDep);

  const {
    request: updateDepartmentApi,
    loading: updateDepartmentLoading,
    error: updateDepartmentError,
  } = useApi(commonRoutes.updateDep);

  const {
    request: removeDepartmentApi,
    loading: removeDepartmentLoading,
    error: removeDepartmentError,
  } = useApi(commonRoutes.removeDep);

  const {
    request: addempanelmentApi,
    loading: addempanelmentLoading,
    error: addempanelmentError,
  } = useApi(commonRoutes.addEmpanelment);

  const {
    request: updateempanelmentApi,
    loading: updateempanelmentLoading,
    error: updateempanelmentError,
  } = useApi(commonRoutes.updateEmpanelment);

  const {
    request: removeEmpanelmentApi,
    loading: removeEmpanelmentLoading,
    error: removeEmpanelmentError,
  } = useApi(commonRoutes.removeEmp);

  const {
    request: addLabtestApi,
    loading: addLabtestLoading,
    error: addLabtestError,
  } = useApi(commonRoutes.addLabtest);

  const {
    request: updateLabtestApi,
    loading: updateLabtestLoading,
    error: updateLabtestError,
  } = useApi(commonRoutes.updateLabTest);


  const {
    request: removeLabtestApi,
    loading: removeLabtestLoading,
    error: removeLabtestError,
  } = useApi(commonRoutes.removeLabtest);
  const {
    request: addIPDandDayCareApi,
    loading: addIPDandDayCareLoading,
    error: addIPDandDayCareError,
  } = useApi(commonRoutes.addIPDandDayCare);

  const {
    request: updateIPDandDayCareApi,
    loading: updateIPDandDayCareLoading,
    error: updateIPDandDayCareError,
  } = useApi(commonRoutes.updateIPDAndDayCare);

  const {
    request: removeIPDandDayCareApi,
    loading: removeIPDandDayCareLoading,
    error: removeIPDandDayCareError,
  } = useApi(commonRoutes.removeIPDandDayCare);

  const {
    request: addProcedureApi,
    loading: addProcedureLoading,
    error: addProcedureError,
  } = useApi(commonRoutes.addProcedure);

  const {
    request: updateProcedureApi,
    loading: updateProcedureLoading,
    error: updateProcedureError,
  } = useApi(commonRoutes.updateProcedure);

  const {
    request: removeProcedureApi,
    loading: removeProcedureLoading,
    error: removeProcedureError,
  } = useApi(commonRoutes.removeProcedure);


  const {
    request: addInchargeApi,
    loading: addInchargeLoading,
    error: addInchargeError,
  } = useApi(commonRoutes.addIncharge);

  const {
    request: updateInchargeApi,
    loading: updateInchargeLoading,
    error: updateInchargeError,
  } = useApi(commonRoutes.updateIncharge);

  const {
    request: removeInchargeApi,
    loading: removeInchargeLoading,
    error: removeInchargeError,
  } = useApi(commonRoutes.removeIncharge);

  const {
    request: addcodeAlertsApi,
    loading: addcodeAlertsLoading,
    error: addcodeAlertsError,
  } = useApi(commonRoutes.addCodeAnnouncement);

  const {
    request: updateCodeAlertsApi,
    loading: updateCodeAlertsLoading,
    error: updateCodeAlertsError,
  } = useApi(commonRoutes.updateCodeAnnouncement);
  const {
    request: removeCodeAlertsApi,
    loading: removeCodeAlertsLoading,
    error: removeCodeAlertsError,
  } = useApi(commonRoutes.removeCodeAnnouncement);

  const {
    request: uploadCSVApi,
    loading: uploadCSVLoading,
    error: uploadCSVError,
  } = useApi(commonRoutes.uploadBranchCSV);

  const fetchAllData = async () => {
    const res = await getSingleBranch(id, hosId);
    const branch = res?.data;
    // const suggestion = await getSuggestions();
    // console.log('suggestion', suggestion);
    setGlobalSuggestion(branch?.suggestion || {});
    setCurrentBranch(branch?.branch);
    setDoctorsList(res?.data?.doctors || []);
    setDepartmentsList(res?.data?.departments || []);
    setEmpanelmentList(res?.data?.empanelmentList || []);
    setTestLabsList(res?.data?.labtestList || []);
    setIpdList(res?.data?.ipdList || []);
    setDayCareList(res?.data?.dayCareList || []);
    setProceduresList(res?.data?.procedureList || []);
    setInchargeList(res?.data?.inchargeList || []);
    setCodeAlertsList(res?.data?.codeAlertsList || []);
  };
  useEffect(() => {
    fetchAllData();
  }, [id]);

  const validateUploadCSVRow = (row, rowNumber) => {
    const errors = [];

    const specialization = normalizeValue(row.specialization);
    const type = normalizeValue(row.type);
    const name = normalizeValue(row.name);
    const department = normalizeValue(row.department);
    const opdDays = normalizeValue(row.opdDays);
    const opdNo = normalizeValue(row.opdNo);
    const specialties = normalizeValue(row.specialties);
    const surgeries = normalizeValue(row.surgeries);
    const degrees = normalizeValue(row.degrees);
    const averagePatientTime = normalizeValue(row.averagePatientTime);
    const maxPatientsHandled = normalizeValue(row.maxPatientsHandled);
    const countryCode = normalizeValue(row.countryCode);
    const contactNumber = normalizeValue(row.contactNumber);
    const whatsappNumber = normalizeValue(row.whatsappNumber);
    const morningStart = normalizeValue(row.morningStart);
    const morningEnd = normalizeValue(row.morningEnd);
    const eveningStart = normalizeValue(row.eveningStart);
    const eveningEnd = normalizeValue(row.eveningEnd);
    const customStart = normalizeValue(row.customStart);
    const customEnd = normalizeValue(row.customEnd);
    const paName = normalizeValue(row.paName);
    const paContactNumber = normalizeValue(row.paContactNumber);
    const extensionNumber = normalizeValue(row.extensionNumber);
    const experience = normalizeValue(row.experience);
    const consultationCharges = normalizeValue(row.consultationCharges);
    const floor = normalizeValue(row.floor);
    const customDegrees = normalizeValue(row.customDegrees);
    const teleConsultation = normalizeValue(row.teleConsultation);
    const title = normalizeValue(row.title);
    const designation = normalizeValue(row.designation);
    const teleMedicine = normalizeValue(row.teleMedicine);
    const additionalInfo = normalizeValue(row.additionalInfo);
    const isEnabled = normalizeValue(row.isEnabled);
    const videoConsultationEnabled = normalizeValue(row.videoConsultationEnabled);
    const videoConsultationTimeSlot = normalizeValue(row.videoConsultationTimeSlot);
    const videoConsultationStartTime = normalizeValue(row.videoConsultationStartTime);
    const videoConsultationEndTime = normalizeValue(row.videoConsultationEndTime);
    const videoConsultationCharges = normalizeValue(row.videoConsultationCharges);
    const videoConsultationDays = normalizeValue(row.videoConsultationDays);

    // if (!specialization) {
    //   errors.push({
    //     rowNumber,
    //     columnName: "specialization",
    //     invalidValue: specialization,
    //     message: "Specialization is Required! Please select one of: surgeon, physician",
    //   });
    // }

    if (specialization && !["surgeon", "physician"].includes(specialization)) {
      errors.push({
        rowNumber,
        columnName: "specialization",
        invalidValue: specialization,
        message: "Invalid specialization! Please select one of: surgeon, physician",
      });
    }

    if (
      title &&
      !["dr", "profdr", "assocprofdr", "asstprofdr"].includes(title)
    ) {
      errors.push({
        rowNumber,
        columnName: "title",
        invalidValue: title,
        message:
          "Invalid doctor type! Please select one of: dr, profdr, assocprofdr, asstprofdr.",
      });
    }

    if (
      type &&
      !["fulltime", "parttime", "visiting", "oncall"].includes(type)
    ) {
      errors.push({
        rowNumber,
        columnName: "type",
        invalidValue: type,
        message:
          "Invalid doctor type! Please select one of: fulltime, parttime, visiting, oncall.",
      });
    }

    if (
      designation &&
      !["consultant", "seniorconsultant", "junioresident", "senioresident", "hod"].includes(designation)
    ) {
      errors.push({
        rowNumber,
        columnName: "designation",
        invalidValue: designation,
        message:
          "Invalid doctor designation! Please select one of: consultant, seniorconsultant, junioresident, senioresident,hod",
      });
    }
    if (!name) {
      errors.push({
        rowNumber,
        columnName: "name",
        invalidValue: name,
        message: "Doctor name is required",
      });
    }


    if (!department) {
      errors.push({
        rowNumber,
        columnName: "department",
        invalidValue: department,
        message: "Department is required",
      });
    }

    if (
      experience &&
      isNaN(Number(experience)) ||
      Number(experience) < 0 ||
      Number(experience) > 60
    ) {
      errors.push({
        rowNumber,
        columnName: "experience",
        invalidValue: experience,
        message:
          "Experience must be a number between 0 and 60.",
      });
    }

    // if (
    //   !consultationCharges ||
    //   isNaN(Number(consultationCharges)) ||
    //   Number(consultationCharges) < 0 ||
    //   Number(consultationCharges) > 5000
    // ) {
    //   errors.push({
    //     rowNumber,
    //     columnName: "consultationCharges",
    //     invalidValue: consultationCharges,
    //     message:
    //       "Consultation Charges is required and must be a number between 0 and 5000.",
    //   });
    // }

    if (opdDays?.trim() || videoConsultationDays?.trim()) {

      const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      const dayValue = opdDays || videoConsultationDays || "";

      const days = dayValue
        .split("|")
        .map((d) => d.trim())
        .filter(Boolean);

      console.log("dayValue", dayValue);
      console.log("days", days);
      console.log(Array.isArray(days)); // true


      const invalidDays = days.filter(
        (day) => !validDays.includes(day)
      );
      if (invalidDays.length) {
        errors.push({
          rowNumber,
          columnName: opdDays ? "opdDays" : "videoConsultationDays",
          invalidValue: opdDays || videoConsultationDays,
          message: `Invalid day(s): ${invalidDays.join(
            ", "
          )}. Please select only from: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.`,
        });
      }
    }

    if (averagePatientTime) {
      const time = Number(averagePatientTime);

      if (Number.isNaN(time) || time <= 0) {
        errors.push({
          rowNumber,
          columnName: "averagePatientTime",
          invalidValue: averagePatientTime,
          message: "Average patient time must be a positive number",
        });
      }
    }

    if (degrees && degrees.length > 200) {
      errors.push({
        rowNumber,
        columnName: "degrees",
        invalidValue: degrees,
        message: "Degrees value is too long",
      });
    }
    const isValidTime = (time) =>
      /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i.test(time);

    const checkValidTime = (value, columnName) => {
      if (value && !isValidTime(value)) {
        errors.push({
          rowNumber,
          columnName,
          invalidValue: value,
          message: "Invalid time format. Use hh:mm AM/PM (e.g. 10:00 AM, 1:00 PM)"
        });
      }
    };

    // Morning slot validation
    if (morningStart && !morningEnd) {
      errors.push({
        rowNumber,
        columnName: "morningEnd",
        invalidValue: morningEnd,
        message: "Morning end time is required when morning start time is provided.",
      });
    }

    if (morningEnd && !morningStart) {
      errors.push({
        rowNumber,
        columnName: "morningStart",
        invalidValue: morningStart,
        message: "Morning start time is required when morning end time is provided.",
      });
    }

    // Evening slot validation
    if (eveningStart && !eveningEnd) {
      errors.push({
        rowNumber,
        columnName: "eveningEnd",
        invalidValue: eveningEnd,
        message: "Evening end time is required when evening start time is provided.",
      });
    }

    if (eveningEnd && !eveningStart) {
      errors.push({
        rowNumber,
        columnName: "eveningStart",
        invalidValue: eveningStart,
        message: "Evening start time is required when evening end time is provided.",
      });
    }

    // Custom slot validation
    if (customStart && !customEnd) {
      errors.push({
        rowNumber,
        columnName: "customEnd",
        invalidValue: customEnd,
        message: "Custom end time is required when custom start time is provided.",
      });
    }

    if (customEnd && !customStart) {
      errors.push({
        rowNumber,
        columnName: "customStart",
        invalidValue: customStart,
        message: "Custom start time is required when custom end time is provided.",
      });
    }

    // Format validation
    checkValidTime(morningStart, "morningStart");
    checkValidTime(morningEnd, "morningEnd");
    checkValidTime(eveningStart, "eveningStart");
    checkValidTime(eveningEnd, "eveningEnd");
    checkValidTime(customStart, "customStart");
    checkValidTime(customEnd, "customEnd");
    return errors;
  };
  const processCSVRows = (rows, totalRows) => {
    return new Promise((resolve) => {
      const validRows = [];
      const invalidRows = [];
      const errorList = [];
      let processed = 0;
      const batchSize = 30;

      const processBatch = () => {
        const chunk = rows.slice(processed, processed + batchSize);
        chunk.forEach((row, index) => {
          const rowNumber = processed + index + 2;
          const rowErrors = validateUploadCSVRow(row, rowNumber);
          console.log("rowErrors", rowErrors);

          if (rowErrors.length > 0) {
            invalidRows.push(row);
            errorList.push(...rowErrors);
          } else {
            validRows.push(row);
          }
        });

        processed += chunk.length;
        setCSVProgress({ current: processed, total: totalRows });
        setCSVProcessMessage(
          processed < totalRows
            ? `Processing row ${processed} of ${totalRows}`
            : `Processing row ${totalRows} of ${totalRows}`
        );

        if (processed < totalRows) {
          window.requestAnimationFrame(processBatch);
        } else {
          setCSVRows(rows);
          setCSVParsedValidRows(validRows);
          setCSVParsedInvalidRows(invalidRows);
          setCSVValidationErrors(errorList);
          setCSVValidationSummary({
            totalRows,
            successCount: validRows.length,
            errorCount: invalidRows.length,
          });
          setCSVStatus("completed");
          setCSVProcessMessage("Validation complete");
          resolve();
        }
      };

      processBatch();
    });
  };

  const startCSVValidation = async (file) => {
    resetCSVState();
    setCSVStatus("processing");
    setCSVProcessMessage("Processing file...");

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
      const totalRows = Math.max(0, lines.length - 1);
      setCSVProgress({ current: 0, total: totalRows });

      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header?.trim() || "",
        error: (error) => {
          setCSVParseError(error.message || "CSV parse failed");
        },
      });

      if (parsed.errors?.length) {
        setCSVParseError(parsed.errors[0]?.message || "CSV parse failed");
        setCSVStatus("completed");
        return;
      }

      await processCSVRows(parsed.data, totalRows);
    } catch (error) {
      console.log("error ", error);

      setCSVParseError(error?.message || "Unable to read the file");
      setCSVStatus("completed");
      setCSVProcessMessage("Processing failed");
    }
  };


  const handleCSVFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log("file", file);

    setSelectedFile(file);
    setUploadCSVModalOpen(true);

    await startCSVValidation(file);
  };


  const handleOpenModal = useCallback((type, item = null) => {
    setSelectedItem(item);
    setModalOpen((prev) => ({ ...prev, [type]: true }));
  }, []);

  const handleCloseModal = (type) => {
    setSelectedItem(null);
    setModalOpen({ ...modalOpen, [type]: false });
  };
  const handleSave = async (type, newData) => {
    try {
      let saved = false;
      if (type === "doctor") {
        const docId = newData?._id;
        const formData = new FormData();

        Object.keys(newData).forEach((key) => {
          const value = newData[key];

          // Image Handling
          if (key === "profilePicture") {

            // New Image Upload
            if (value instanceof File) {
              formData.append("image", value);
            }
            return;
          }

          // Array or Object Fields (Only stringify non-File objects)
          const nestedFields = [
            "specialties",
            "surgeries",
            "degrees",
            "empanelmentList",
            "customDegrees",
            "videoConsultation",
            "timings"
          ];

          if (nestedFields.includes(key)) {
            // Ensure we don't accidentally stringify a File object if it was at a top level (though these keys are mostly arrays/objects)
            formData.append(key, JSON.stringify(value || (key === "timings" ? {} : [])));
            return;
          }

          // Department ObjectId (send only _id)
          // Department ObjectId (STRICT SAFE VERSION)
          if (key === "department") {
            if (value && typeof value === "object" && value._id) {
              formData.append("department", value._id);
            } else if (typeof value === "string" && value.trim() !== "") {
              // Only allow valid ObjectId string (24 length)
              if (value.length === 24) {
                formData.append("department", value);
              }
            }
            // Do NOT send anything else
            return;
          }

          // Skip internal fields
          if (["_id", "__v", "createdAt", "updatedAt"].includes(key)) {
            return;
          }

          // Normal fields
          // Normal fields (SAFE VERSION)
          if (value !== undefined && value !== null) {

            // If object (but not File)
            if (typeof value === "object" && !(value instanceof File)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }

          }
        });

        // =========================
        // UPDATE DOCTOR
        // =========================
        if (docId) {
          const res = await updateDoctorApi(hosId, docId, formData);

          if (res?.success) {
            setDoctorsList((prev) =>
              prev.map((d) =>
                d._id === docId || d.id === docId
                  ? { ...d, ...res.data }
                  : d
              )
            );
            saved = true;
          }
        }

        // =========================
        // ADD DOCTOR
        // =========================
        else {
          const res = await addDoctor(hosId, id, formData);

          if (res?.success) {
            setDoctorsList((prev) => [...prev, res.data]);
            saved = true;
          }
        }
      } else if (type === "department") {
        const depId = newData?._id;
        if (depId && typeof depId === "string" && !depId.startsWith("dep-")) {
          const res = await updateDepartmentApi(hosId, depId, newData);
          if (res?.success) {
            setDepartmentsList((prev) =>
              prev.map((d) =>
                d._id === depId || d.id === depId ? { ...d, ...newData } : d,
              ),
            );
            saved = true;
          }
        } else {
          const res = await addDepartmentApi(hosId, id, newData);
          if (res?.success) {
            setDepartmentsList((prev) => [...prev, res.data]);
            setDoctorsList((prev) =>
              prev.map((doctor) =>
                newData?.doctors.some((d) => d.id === doctor?._id)
                  ? { ...doctor, department: res?.data } : doctor
              )
            )
            saved = true;
          }
        }

      } else if (type === "empanelment") {
        const empId = newData?._id;
        if (empId) {
          const res = await updateempanelmentApi(hosId, empId, newData);
          if (res?.success) {
            setEmpanelmentList((prev) =>
              prev.map((d) =>
                d._id === empId || d.id === empId ? { ...d, ...newData } : d,
              ),
            );
            saved = true;
          }
        } else {
          const res = await addempanelmentApi(hosId, id, newData);
          if (res?.success) {
            setEmpanelmentList((prev) => [...prev, res.data]);
            saved = true;
          }
        }

      } else if (type === "testLab") {
        const labId = newData?._id;

        // UPDATE LAB TEST
        if (labId && typeof labId === "string" && !labId.startsWith("lab-")) {
          const res = await updateLabtestApi(hosId, labId, newData);

          if (res?.success) {
            setTestLabsList((prev) =>
              prev.map((d) =>
                d._id === labId || d.id === labId ? { ...d, ...res.data } : d
              )
            );
            saved = true;
          }
        }

        // ADD LAB TEST
        else {
          const res = await addLabtestApi(hosId, id, newData);


          if (res?.success) {
            setTestLabsList((prev) => [...prev, res.data]);
            saved = true;
          }
        }

      }
      else if (type === "ipd") {
        const ipdId = newData?._id;

        if (!ipdId) {
          //  ADD IPD
          const ipdId = newData?._id;

          if (!ipdId) {
            //  ADD IPD
            const res = await addIPDandDayCareApi(hosId, id, type, newData);
            if (res?.data) {
              setIpdList((prev) => [...prev, res.data]);
              saved = true;
            }
          } else {
            //  UPDATE IPD
            const res = await updateIPDandDayCareApi(hosId, ipdId, type, newData);
            if (res?.data) {
              setIpdList((prev) =>
                prev.map((item) => (item._id === ipdId ? res.data : item))
              );
              saved = true;
            }
          }
        } else {
          //  UPDATE IPD
          const res = await updateIPDandDayCareApi(hosId, ipdId, type, newData);
          if (res?.data) {
            setIpdList((prev) =>
              prev.map((item) => (item._id === ipdId ? res.data : item))
            );
            saved = true;
          }
        }

      } else if (type === "dayCare") {
        const dayCareId = newData?._id;

        if (!dayCareId) {
          //  ADD Day Care
          const dayCareId = newData?._id;

          if (!dayCareId) {
            //  ADD Day Care
            const res = await addIPDandDayCareApi(hosId, id, type, newData);
            if (res?.data) {
              setDayCareList((prev) => [...prev, res.data]);
              saved = true;
            }
          } else {
            //  UPDATE Day Care
            const res = await updateIPDandDayCareApi(hosId, dayCareId, type, newData);
            if (res?.data) {
              setDayCareList((prev) =>
                prev.map((item) => (item._id === dayCareId ? res.data : item))
              );
              saved = true;
            }
          }
        } else {
          //  UPDATE Day Care
          const res = await updateIPDandDayCareApi(hosId, dayCareId, type, newData);
          if (res?.data) {
            setDayCareList((prev) =>
              prev.map((item) => (item._id === dayCareId ? res.data : item))
            );
            saved = true;
          }
        }
      } else if (type === "procedure") {
        // alert("Procedure save triggered with data: " + JSON.stringify(newData));
        const procedureId = newData?._id;

        //  ADD PROCEDURE
        if (!procedureId) {
          const res = await addProcedureApi(hosId, id, newData);

          if (res?.data) {
            setProceduresList((prev) => [...prev, res.data]);
            saved = true;
          }
        }

        // UPDATE PROCEDURE
        else {
          const res = await updateProcedureApi(hosId, procedureId, type, newData);

          if (res?.data) {
            setProceduresList((prev) =>
              prev.map((item) =>
                item._id === procedureId || item.id === procedureId
                  ? res.data
                  : item
              )
            );
            saved = true;
          }
        }
      } else if (type === "incharge") {
        const inchargeId = newData?._id;

        //  ADD INCHARGE
        if (!inchargeId) {
          const res = await addInchargeApi(hosId, id, newData);

          if (res?.data) {
            setInchargeList((prev) => [...prev, res.data]);
            saved = true;
          }
        }

        //  UPDATE INCHARGE
        else {

          const res = await updateInchargeApi(hosId, inchargeId, newData);

          if (res?.data) {
            setInchargeList((prev) =>
              prev.map((item) =>
                item._id === inchargeId || item.id === inchargeId
                  ? res.data
                  : item
              )
            );
            saved = true;
          }
        }
      } else if (type === "codeAlert") {
        const codeId = newData?._id;


        if (!codeId) {
          const res = await addcodeAlertsApi(hosId, id, newData);

          if (res?.data) {
            setCodeAlertsList((prev) => [...prev, res.data]);
            saved = true;
          }
        }

        //  UPDATE CODE ALERT
        else {
          const res = await updateCodeAlertsApi(hosId, codeId, newData);

          if (res?.data) {
            setCodeAlertsList((prev) =>
              prev.map((item) =>
                item._id === codeId || item.id === codeId
                  ? res.data
                  : item
              )
            );
            saved = true;
          }
        }
      } else {

        saved = true;
      }

      if (saved) {

        await fetchAllData(); // Refresh all lists to sync cross-referenced data
        toast.success("Saved successfully!");
        handleCloseModal(type);
      }

    } catch (error) {
      console.error("handleSave error:", error);
      // Extract backend error message if available
      const backendMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;
    }
  };

  const handleRemove = async () => {
    try {
      const { type, id } = selectedItem || {};
      console.log("type", type);
      console.log("id", id);


      if (!type || !id) {
        toast.error("Invalid delete request");
        return;
      }

      let res;

      console.log("removeDoctorApi", id);

      switch (type) {
        case "doctor":
          res = await removeDoctorApi(hosId, id);
          if (res?.success) {
            setDoctorsList((prev) => prev.filter((item) => item._id !== id));
          }
          break;

        case "department":
          res = await removeDepartmentApi(hosId, id);
          if (res?.success) {
            setDepartmentsList((prev) =>
              prev.filter((item) => item._id !== id)
            );
          }
          break;

        case "empanelment":
          res = await removeEmpanelmentApi(hosId, id);
          if (res?.success) {
            setEmpanelmentList((prev) =>
              prev.filter((item) => item._id !== id)
            );
          }
          break;

        case "testLab":
          res = await removeLabtestApi(hosId, id);
          if (res?.success) {
            setTestLabsList((prev) =>
              prev.filter((item) => item._id !== id)
            );
          }
          break;

        case "ipd":
          res = await removeIPDandDayCareApi(hosId, id, "ipd");
          if (res?.success) {
            setIpdList((prev) => prev.filter((item) => item._id !== id));
          }
          break;

        case "dayCare":
          res = await removeIPDandDayCareApi(hosId, id, "dayCare");
          if (res?.success) {
            setDayCareList((prev) => prev.filter((item) => item._id !== id));
          }
          break;

        case "procedure":
          // console.log("Call", "this is model");

          res = await removeProcedureApi(hosId, id);
          if (res?.success) {
            setProceduresList((prev) =>
              prev.filter((item) => item._id !== id)
            );
          }
          break;

        case "incharge":
          res = await removeInchargeApi(hosId, id);
          if (res?.success) {
            setInchargeList((prev) =>
              prev.filter((item) => item._id !== id)
            );
          }
          break;

        case "codeAlert":
          res = await removeCodeAlertsApi(hosId, id);
          if (res?.success) {
            setCodeAlertsList((prev) =>
              prev.filter((item) => item._id !== id)
            );
          }
          break;

        default:
          toast.error("Unknown delete type");
          return;
      }

      if (res?.success) {
        toast.success(`${type} deleted successfully`);
      }
      setSelectedItem(null);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Delete error:", error);

    }
  };
  const openAttendanceModal = (type, doctor) => {
    setAttendanceType(type);
    setSelectedDoctorData(doctor);
    setAttendanceModalOpen(true);
  };

  const closeAttendanceModal = () => {
    setAttendanceModalOpen(false);
    setAttendanceType("");
    setSelectedDoctorData(null);
  };
  const handleDoctorStatusToggle = async (doctorId, currentStatus, unavailableDates = []) => {
    try {
      setSaving(true);


      // Update the doctor's status in the local state first for immediate UI feedback
      const res = await updateDoctorStatusApi(hosId, doctorId, currentStatus, unavailableDates)
      if (res?.success) {
        setDoctorsList((prev) =>
          prev.map((doctor) =>
            doctor._id === doctorId
              ? res?.data
              : doctor
          )
        );
        closeAttendanceModal()
        toast.success(
          `Doctor ${currentStatus ? "activated" : "deactivated"} successfully!`,
        );
        return
      }

      else {
        toast.error("Error in Change Doctor Status ! Please Try Again Later")
        return
      }


      // You might want to call an API here like:
      // await updateDoctorStatus(doctorId, !currentStatus);
    } catch (error) {
      console.error("Error updating doctor status:", error);
      toast.error("Failed to update doctor status");

    } finally {
      setSaving(false);
    }
  };

  const listMap = {
    department: departmentsList,
    doctor: doctorsList,
    empanelment: empanelmentList,
    testLab: testLabsList,
    ipd: ipdList,
    dayCare: dayCareList,
    procedure: proceduresList,
    incharge: inchargeList,
    codeAlert: codeAlertsList,
  };

  const filterByType = (type, searchTerm) => {
    const list = listMap[type] || [];

    if (!searchTerm) return list;

    const lowerSearch = searchTerm.toLowerCase();

    return list.filter((item) => {
      if (type === "empanelment") {
        return (
          item?.name?.toLowerCase().includes(lowerSearch) ||
          item?.policyName?.toLowerCase().includes(lowerSearch)
        );
      }
      if (type === "testLab") {
        return item?.testName?.toLowerCase().includes(lowerSearch);
      }
      if (type === "ipd" || type === "dayCare") {
        return item?.category?.toLowerCase().includes(lowerSearch);
      }
      // For doctors, departments, procedures, incharge, codeAlert
      return item?.name?.toLowerCase().includes(lowerSearch);
    });
  };

  const filteredDepartments = filterByType(
    "department",
    searchTerms.department,
  );

  const filteredDoctors = filterByType("doctor", searchTerms.doctor);

  const filteredEmpanelment = filterByType(
    "empanelment",
    searchTerms.empanelment,
  );

  const filteredIpd = filterByType("ipd", searchTerms.ipd);

  const filteredDayCare = filterByType("dayCare", searchTerms.dayCare);

  const filteredProcedures = filterByType("procedure", searchTerms.procedure);
  const filteredCodeAlerts = filterByType("codeAlert", searchTerms.codeAlert);
  const filteredTestLabs = filterByType("testLab", searchTerms.testLab);
  const filteredIncharge = filterByType("incharge", searchTerms.incharge);

  const handleSearchChange = (type, value) => {
    setSearchTerms((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Returns required headers for each CSV type (lowercase)


  const validateCSVHeaders = async (type, file) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (!lines.length) {
        toast.error("CSV file is empty");
        return false;
      }
      const headerLine = lines[0];
      const fileHeaders = headerLine.split(",").map((h) => h.replace(/^\s*"|"\s*$/g, "").trim().toLowerCase());
      const required = getRequiredHeaders(type).map((h) => h.toLowerCase());
      const missing = required.filter((h) => !fileHeaders.includes(h));
      if (missing.length) {
        toast.error(`Missing or mismatched headers: ${missing.join(", ")}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error("CSV validation error", err);
      toast.error("Failed to read CSV for validation");
      return false;
    }
  };


  const handleUploadCSV = async (type, file) => {
    console.log("handleUploadCSV", type, file);


    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: async (results) => {

        let validations = {};

        if (type === "doctor") {
          validations = doctorValidation;
        }

        const cleanedData = cleanCSVRows(results.data);

        const validation = validateCSVRows({
          rows: cleanedData,
          validations,
        });



        // Stop upload if invalid
        if (!validation.success) {
          toast.error(validation.message);
          return;
        }

        console.log("CSV parsed successfully, starting upload...", validation);

        // Continue upload
        const formdata = new FormData();
        formdata.append("csv", file);
        formdata.append("type", type);

        setOpen(true);
        setProgress(0);

        try {
          const res = await uploadCSVApi(
            hosId,
            id,
            formdata
          );

          if (res?.success) {
            toast.success(
              res?.message ||
              "CSV uploaded successfully!"
            );

            await fetchAllData();

          }
          setUploadCSVModalOpen(false)
        } catch (error) {

          console.error("CSV Upload Error:", error);

          const backendMsg =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Failed to upload CSV";

          toast.error(backendMsg);

        } finally {
          setUploadCSVModalOpen(false);
        }
      },

      error: () => {
        toast.error("Failed to parse CSV file");
      },
    });
  };

  const resetCSVState = () => {
    setCSVStatus("idle");
    setCSVProgress({ current: 0, total: 0 });
    setCSVProcessMessage("");
    setCSVValidationErrors([]);
    setCSVValidationSummary({ totalRows: 0, successCount: 0, errorCount: 0 });
    setCSVRows([]);
    setCSVParsedValidRows([]);
    setCSVParsedInvalidRows([]);
    setCSVParseError(null);
    setCSVActionResult("");
  };

  const handleReupload = () => {
    setSelectedFile(null);
    resetCSVState();
    if (csvFileInputRef.current) {
      csvFileInputRef.current.value = "";
      csvFileInputRef.current.click();
    }

  };

  const handleBrowseCSV = () => {
    if (csvFileInputRef.current) {
      csvFileInputRef.current.value = "";
      csvFileInputRef.current.click();
    }
    setMoreMenuAnchor(null);
  };


  const handleImportAction = async () => {

    if (!selectedFile) return

    // Continue upload
    const formdata = new FormData();
    formdata.append("csv", selectedFile);
    formdata.append("type", "doctor");

    try {
      const res = await uploadCSVApi(
        hosId,
        id,
        formdata
      );

      if (res?.success) {
        toast.success(
          res?.message ||
          "CSV uploaded successfully!"
        );


        await fetchAllData();
        setUploadCSVModalOpen(false)
      }

    } catch (error) {
      console.log("error");
      toast.error("Error To Upload Data! Try After Sometime ")

    }

  };



  React.useEffect(() => {

    if (selectedDoctorData) {

      setUnavailableDates(
        selectedDoctorData?.unavailableDates || []
      );
    }

  }, [selectedDoctorData]);

  React.useEffect(() => {
    const errors = [
      branchError,
      uploadCSVError,
      addDoctorError,
      updateDoctorError,
      removeDoctorError,
      addDepartmentError,
      addIPDandDayCareError,
      updateDepartmentError,
      addLabtestError,
      removeDepartmentError,
      removeCodeAlertsError,
      updateCodeAlertsError,
      addcodeAlertsError,
      removeInchargeError,
      updateInchargeError,
      addInchargeError,
      removeProcedureError,
      updateProcedureError,
      addProcedureError,
      addempanelmentError,
      removeIPDandDayCareError,
      removeLabtestError,
      removeEmpanelmentError,
      updateIPDandDayCareError,
      updateLabtestError,
      updateempanelmentError,
    ];

    const error = errors.find(Boolean);

    if (error) {
      console.log("error", error);
      toast.error(error || "Internal Server Error");
    }
  }, [
    uploadCSVError,
    branchError,
    addDoctorError,
    updateDoctorError,
    removeDoctorError,
    addDepartmentError,
    addIPDandDayCareError,
    updateDepartmentError,
    addLabtestError,
    removeDepartmentError,
    removeCodeAlertsError,
    updateCodeAlertsError,
    addcodeAlertsError,
    removeInchargeError,
    updateInchargeError,
    addInchargeError,
    removeProcedureError,
    updateProcedureError,
    addProcedureError,
    addempanelmentError,
    removeIPDandDayCareError,
    removeLabtestError,
    removeEmpanelmentError,
    updateIPDandDayCareError,
    updateLabtestError,
    updateempanelmentError,
  ]);

  const OverviewCard = ({ title, value, icon, color }) => (
    <Grid item xs={12} sm={6} md={3}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          height: "100%",
          border: "1px solid #eee", overflowX: "auto",
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Avatar
            sx={{ bgcolor: color, width: 64, height: 64, mb: 2, mx: "auto" }}
          >
            {icon}
          </Avatar>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            fontWeight="bold"
            sx={{ letterSpacing: 1, mb: 1 }}
          >
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="#333">
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  if (branchLoading)
    return <SectionLoader height="80vh" message="Loading branch details..." />;

  const isAnyFormOpen = Object.values(modalOpen).some(Boolean);

  return (
    <Box
      sx={{
        width: "100%",
        padding: isAnyFormOpen ? 0 : { xs: "10px", sm: "20px" },
        height: "calc(100vh - 100px)",
        overflowY: "auto",
        bgcolor: "#FAFAFA",
      }}
    >


      {!isAnyFormOpen && (
        <>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            gap={2}
            mb={2}
          >
            <Header title="Manage" subtitle="Branch Details" />
          </Box>
          <Divider sx={{ borderBottomWidth: 2, mb: 2 }} />

          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            mb={3}
            p={{ xs: 1.5, sm: 3 }}
            gap={{ xs: 2, sm: 0 }}
            sx={{
              borderRadius: 3,
              background: "linear-gradient(90deg, #FFAB40 0%, #FF9100 100%)",
              color: "white",
              boxShadow: "0 4px 12px rgba(255, 145, 0, 0.3)",
            }}
          >
            <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} alignItems="center" gap={{ xs: 2, sm: 0 }} sx={{ width: "100%" }}>
              <Box display="flex" alignItems="center">
                {/* BACK BUTTON: GOES TO BRANCH LIST */}
                <IconButton
                  onClick={() => navigate(-1)}
                  sx={{ mr: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Avatar
                  sx={{
                    bgcolor: "white",
                    color: "#FF9100",
                    mr: 2,
                    width: 48,
                    height: 48,
                  }}
                >
                  <AddBusinessIcon fontSize="medium" />
                </Avatar>
              </Box>
              <Box sx={{ overflow: "hidden", textAlign: { xs: "center", sm: "left" } }}>
                <Typography variant="h4" fontWeight="bold" >
                  {currentBranch?.name || hospitalData?.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Branch Management (ID: {currentBranch?.code})
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Tabs */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              mb: 3,
              overflow: "hidden",
              bgcolor: "transparent",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 48,
                "& .MuiTabs-indicator": { backgroundColor: "#FF6D00", height: 3 },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#666",
                  "&.Mui-selected": { color: "#FF9100" },
                  bgcolor: "#fff",
                  mr: 0.5,
                  borderRadius: "8px 8px 0 0",
                },
              }}
            >
              <Tab label="OVERVIEW" />
              <Tab label="DEPARTMENTS" />
              <Tab label="DOCTORS" />
              <Tab label="EMPANELMENT" />
              <Tab label="TEST LABS" />
              <Tab label="IPD" />
              <Tab label="DAY CARE" />
              <Tab label="PROCEDURES/SURGERIES" />
              <Tab label="IN-CHARGE" />
              <Tab label="CODE ALERTS" />
            </Tabs>
          </Paper>
        </>
      )}

      {/* Content Area */}
      <Paper elevation={0} sx={{ bgcolor: "transparent", minHeight: 400 }}>
        {/* 0. Overview */}
        <CustomTabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <OverviewCard
              title="TOTAL BEDS"
              value={currentBranch?.beds || 0}
              icon={<BedIcon fontSize="large" />}
              color="#2196F3"
            />
            <OverviewCard
              title="BED IN USE"
              value={0}
              icon={<MonitorHeartIcon fontSize="large" />}
              color="#F44336"
            />
            <OverviewCard
              title="DOCTORS"
              value={doctorsList.length}
              icon={<PersonIcon fontSize="large" />}
              color="#4CAF50"
            />
            <OverviewCard
              title="DEPARTMENTS"
              value={departmentsList.length}
              icon={<BusinessIcon fontSize="large" />}
              color="#FF9800"
            />
          </Grid>
        </CustomTabPanel>
        {/* 1. Departments */}
        <CustomTabPanel value={tabValue} index={1}>
          {isShowAction && (
            <TabHeader
              key={tabValue}
              // uploadCSV={handleUploadCSV}
              // downloadTemplate={handleDownloadTemplate}
              title="Departments"
              btnText="Add Department"
              type="department"
              handleSearchChange={handleSearchChange}
              searchTerm={searchTerms}
              // setSearchTerm={setDepartmentSearchTerm}
              isShowAction={isShowAction}
              handleOpenModal={handleOpenModal}
            />
          )}

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              boxShadow: "none",
              border: "1px solid #eee",
              overflowX: "auto"
            }}
          >
            <Table sx={{ tableLayout: "auto", minWidth: 600 }}>
              <TableHead sx={{ bgcolor: "#FFF3E0" }}>
                <TableRow>
                  <TableCell sx={{ color: "#EF6C00", fontWeight: "bold" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ color: "#EF6C00", fontWeight: "bold" }}>
                    Assigned Doctors
                  </TableCell>
                  {isShowAction && (
                    <TableCell
                      sx={{
                        color: "#EF6C00",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </TableCell>
                  )}

                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.doctors?.length || 0}
                          size="small"
                          sx={{
                            bgcolor: "#FFF3E0",
                            color: "#EF6C00",
                            fontWeight: "bold",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {canEdit && (
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenModal("department", row)}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        {canDelete && (
                          <IconButton
                            onClick={() => {
                              setSelectedItem({
                                type: "department",
                                id: row?._id,
                              });
                              setDeleteOpen(true);
                            }}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={isShowAction ? 3 : 2}
                      align="center"
                      sx={{ py: 3, color: "#888" }}
                    >
                      No departments added.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <AddDepartmentModal
            open={modalOpen.department || false}
            onClose={() => handleCloseModal("department")}
            onSave={(d) => handleSave("department", d)}
            departmentData={selectedItem}
            availableDoctors={doctorsList}
            loading={addDepartmentLoading || updateDepartmentLoading}
          />
        </CustomTabPanel>
        {/* 2. Doctors */}
        <CustomTabPanel value={tabValue} index={2}>
          {modalOpen.doctor ? (
            <AddDoctorModal
              globalSuggestion={globalSuggestion}
              open={modalOpen.doctor || false}
              onClose={() => handleCloseModal("doctor")}
              onSave={(d) => handleSave("doctor", d)}
              doctorData={selectedItem}
              loading={addDoctorLoading || updateDoctorLoading}
              availableDepartments={departmentsList}
              branchId={id}
              hospitalId={hosId}
              onDepartmentsUpdate={setDepartmentsList}
              isInline={true}
            />
          ) : (
            <>
              {isShowAction && (
                <TabHeader
                  key={tabValue}
                  handleCSVFileChange={handleCSVFileChange}
                  csvFileInputRef={csvFileInputRef}
                  uploadCSV={handleUploadCSV}
                  downloadTemplate={handleDownloadTemplate}
                  title="Doctors List"
                  btnText="Add Doctor"
                  type="doctor"
                  handleSearchChange={handleSearchChange}
                  searchTerm={searchTerms}
                  isShowAction={isShowAction}
                  handleOpenModal={handleOpenModal}
                />
              )}

              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: "none",
                  border: "1px solid #eee",
                  overflowX: "auto"
                }}
              >
                <Table sx={{ tableLayout: "auto", minWidth: 800 }}>
                  <TableHead sx={{ bgcolor: "#EEF2FF" }}>
                    <TableRow>
                      <TableCell sx={{ width: "20%", color: "#5C6BC0", fontWeight: "bold" }}>
                        Doctor Name
                      </TableCell>
                      <TableCell sx={{ color: "#5C6BC0", fontWeight: "bold" }}>
                        Treatable List
                      </TableCell>
                      <TableCell sx={{ color: "#5C6BC0", fontWeight: "bold" }}>
                        Surgeries
                      </TableCell>
                      <TableCell sx={{ color: "#5C6BC0", fontWeight: "bold" }}>
                        Contact
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#5C6BC0",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Status
                      </TableCell>

                      {isShowAction && (
                        <TableCell
                          sx={{
                            color: "#EF6C00",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          Actions
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDoctors.length > 0 ? (
                      filteredDoctors.map((row, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Avatar src={
                                row.profilePreview ||
                                (typeof row.profilePicture?.imagePath === "string"
                                  ? row.profilePicture?.imagePath
                                  : "")
                              } />
                              <span>
                                {toTitleCase(`${row?.title || ""} ${row?.name || ""}`)}
                              </span>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <SpecialtiesCell specialties={row?.specialties || []} />
                          </TableCell>
                          <TableCell>
                            <SpecialtiesCell specialties={row?.surgeries || []} />
                          </TableCell>

                          <TableCell>{row.contactNumber}</TableCell>
                          <TableCell align="center">
                            <Switch
                              checked={row.isEnabled !== false}
                              onChange={(e) =>
                                handleDoctorStatusToggle(
                                  row._id || row.id,
                                  !row?.isEnabled
                                )
                              }
                              color="success"
                              size="small"
                              disabled={saving}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <Box sx={{ display: "flex" }}>
                              <IconButton
                                color="primary"
                                onClick={() => openAttendanceModal("doctor", row)}
                                size="small"
                                title="Doctor Attendance"
                              >
                                <CalendarMonthIcon color="primary" />
                              </IconButton>

                              {canEdit && (
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenModal("doctor", row)}
                                  size="small"
                                  title="Edit Doctor"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              )}

                              {canDelete && (
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => {
                                    setSelectedItem({
                                      type: "doctor",
                                      id: row?._id,
                                    });

                                    setDeleteOpen(true);
                                  }}
                                  title="Delete Doctor"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          sx={{ py: 3, color: "#888" }}
                        >
                          No doctors found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CustomTabPanel>
        {/* 3. Empanelment */}
        <CustomTabPanel value={tabValue} index={3}>
          {modalOpen.empanelment ? (
            <AddEmpanelmentListModal
              globalSuggestion={globalSuggestion}
              open={modalOpen.empanelment || false}
              onClose={() => handleCloseModal("empanelment")}
              onSave={(d) => handleSave("empanelment", d)}
              empanelmentData={selectedItem}
              availableDoctors={doctorsList}
              availableDepartments={departmentsList}
              loading={addempanelmentLoading || updateempanelmentLoading}
              isInline={true}
            />
          ) : (
            <>
              {isShowAction && (
                <TabHeader
                  key={tabValue}
                  // uploadCSV={handleUploadCSV}
                  // downloadTemplate={handleDownloadTemplate}
                  title="Empanelment"
                  btnText="Add Policy"
                  type="empanelment"
                  handleSearchChange={handleSearchChange}
                  searchTerm={searchTerms}
                  isShowAction={isShowAction}
                  handleOpenModal={handleOpenModal}
                />
              )}

              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: "none",
                  border: "1px solid #eee", overflowX: "auto",
                }}
              >
                <Table sx={{ tableLayout: "auto", minWidth: 600 }}>
                  <TableHead sx={{ bgcolor: "#E0F2F1" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#00897B", fontWeight: "bold" }}>
                        Policy Name
                      </TableCell>
                      <TableCell sx={{ color: "#00897B", fontWeight: "bold" }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ color: "#00897B", fontWeight: "bold" }}>
                        Assigned Doctors
                      </TableCell>
                      {isShowAction && (
                        <TableCell
                          sx={{
                            color: "#00897B",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          Actions
                        </TableCell>
                      )}

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEmpanelment.length > 0 ? (
                      filteredEmpanelment.map((row, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.policyName}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.typeOfCoverage}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.coverageOptions?.length || 0}
                              size="small"
                              sx={{
                                bgcolor: "#FFF3E0",
                                color: "#00897B",
                                fontWeight: "bold",
                              }}
                            />
                          </TableCell>
                          {
                            <TableCell align="center">
                              {canEdit && (
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenModal("empanelment", row)}
                                  size="small"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              )}
                              {canDelete && (
                                <IconButton
                                  onClick={() => {
                                    setSelectedItem({ type: "empanelment", id: row?._id });
                                    setDeleteOpen(true);
                                  }}
                                  color="error"
                                  size="small"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          }
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          align="center"
                          sx={{ py: 3, color: "#888" }}
                        >
                          No policies found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CustomTabPanel>

        {/* 4. Test Labs */}
        <CustomTabPanel value={tabValue} index={4}>
          {modalOpen.testLab ? (
            <AddTestLabModal
              globalSuggestion={globalSuggestion}
              open={modalOpen.testLab || false}
              onClose={() => handleCloseModal("testLab")}
              onSave={(d) => handleSave("testLab", d)}
              testLabData={selectedItem}
              departmentOptions={departmentsList}
              loading={addLabtestLoading || updateLabtestLoading}
              isInline={true}
            />
          ) : (
            <>
              {isShowAction && (
                <TabHeader
                  key={tabValue}
                  // uploadCSV={handleUploadCSV}
                  // downloadTemplate={handleDownloadTemplate}
                  title="Test Labs"
                  btnText="Add Lab"
                  type="testLab"
                  handleSearchChange={handleSearchChange}
                  searchTerm={searchTerms}
                  isShowAction={isShowAction}
                  handleOpenModal={handleOpenModal}
                />
              )}
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: "none",
                  border: "1px solid #eee", overflowX: "auto",
                }}
              >
                <Table sx={{ tableLayout: "auto", minWidth: 600 }}>
                  <TableHead sx={{ bgcolor: "#F3E5F5" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#7B1FA2", fontWeight: "bold" }}>
                        Name
                      </TableCell>
                      <TableCell sx={{ color: "#7B1FA2", fontWeight: "bold" }}>
                        Code
                      </TableCell>
                      <TableCell sx={{ color: "#7B1FA2", fontWeight: "bold" }}>
                        Charge
                      </TableCell>
                      {isShowAction && (
                        <TableCell
                          sx={{
                            color: "#7B1FA2",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          Actions
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTestLabs.length > 0 ? (
                      filteredTestLabs.map((row, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.testName}
                          </TableCell>
                          <TableCell>{row?.testCode}</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "#2E7D32" }}>
                            ₹{row.serviceCharge}
                          </TableCell>
                          <TableCell align="center">
                            {canEdit && (
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenModal("testLab", row)}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton
                                onClick={() => {
                                  setSelectedItem({ type: "testLab", id: row?._id });
                                  setDeleteOpen(true);
                                }}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          align="center"
                          sx={{ py: 3, color: "#888" }}
                        >
                          No test labs.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CustomTabPanel>

        {/* 5. IPD */}
        <CustomTabPanel value={tabValue} index={5}>
          {modalOpen.ipd ? (
            <AddIpdDetailsModal
              globalSuggestion={globalSuggestion}
              open={modalOpen.ipd || false}
              onClose={() => handleCloseModal("ipd")}
              onSave={(d) => handleSave("ipd", d)}
              ipdData={selectedItem}
              departments={departmentsList}
              loading={addIPDandDayCareLoading || updateIPDandDayCareLoading}
              isInline={true}
            />
          ) : (
            <>
              {isShowAction && (
                <TabHeader
                  title="IPD Details"
                  btnText="Add IPD"
                  downloadTemplate={handleDownloadTemplate}
                  type="ipd"
                  handleSearchChange={handleSearchChange}
                  searchTerm={searchTerms}
                  isShowAction={isShowAction}
                  handleOpenModal={handleOpenModal}
                />
              )}
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: "none",
                  border: "1px solid #eee", overflowX: "auto",
                }}
              >
                <Table sx={{ tableLayout: "auto", minWidth: 600 }}>
                  <TableHead sx={{ bgcolor: "#E1F5FE" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#0288D1", fontWeight: "bold" }}>
                        Category
                      </TableCell>
                      <TableCell sx={{ color: "#0288D1", fontWeight: "bold" }}>
                        Beds
                      </TableCell>
                      <TableCell sx={{ color: "#0288D1", fontWeight: "bold" }}>
                        Charges
                      </TableCell>
                      {isShowAction && (
                        <TableCell
                          sx={{
                            color: "#0288D1",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          Actions
                        </TableCell>
                      )}

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredIpd.length > 0 ? (
                      filteredIpd.map((row, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.category?.value}
                          </TableCell>
                          <TableCell>{row.noOfBeds}</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "#2E7D32" }}>
                            ₹{row.charges}
                          </TableCell>
                          <TableCell align="center">
                            {canEdit && (
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenModal("ipd", row)}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton
                                onClick={() => {
                                  setSelectedItem({ type: "ipd", id: row?._id });
                                  setDeleteOpen(true);
                                }}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          align="center"
                          sx={{ py: 3, color: "#888" }}
                        >
                          No IPD details.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CustomTabPanel>

        {/* 6. Day Care */}
        <CustomTabPanel value={tabValue} index={6}>
          {modalOpen.dayCare ? (
            <AddDayCareDetailsModal
              globalSuggestion={globalSuggestion}
              open={modalOpen.dayCare || false}
              onClose={() => handleCloseModal("dayCare")}
              onSave={(type, d) => handleSave(type, d)}
              dayCareData={selectedItem}
              departments={departmentsList}
              loading={addIPDandDayCareLoading || updateIPDandDayCareLoading}
              isInline={true}
            />
          ) : (
            <>
              {isShowAction && (
                <TabHeader
                  title="Day Care"
                  btnText="Add Day Care"
                  downloadTemplate={handleDownloadTemplate}
                  type="dayCare"
                  handleSearchChange={handleSearchChange}
                  searchTerm={searchTerms}
                  isShowAction={isShowAction}
                  handleOpenModal={handleOpenModal}
                />
              )}
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: "none",
                  border: "1px solid #eee", overflowX: "auto",
                }}
              >
                <Table sx={{ tableLayout: "auto", minWidth: 600 }}>
                  <TableHead sx={{ bgcolor: "#FFFDE7" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#FBC02D", fontWeight: "bold" }}>
                        Category
                      </TableCell>
                      <TableCell sx={{ color: "#FBC02D", fontWeight: "bold" }}>
                        Beds
                      </TableCell>
                      <TableCell sx={{ color: "#FBC02D", fontWeight: "bold" }}>
                        Charges
                      </TableCell>
                      {isShowAction && (
                        <TableCell
                          sx={{
                            color: "#FBC02D",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          Actions
                        </TableCell>
                      )}

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDayCare.length > 0 ? (
                      filteredDayCare.map((row, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.category?.value}
                          </TableCell>
                          <TableCell>{row.noOfBeds}</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "#2E7D32" }}>
                            ₹{row.charges}
                          </TableCell>
                          <TableCell align="center">
                            {canEdit && (
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenModal("dayCare", row)}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton
                                onClick={() => {
                                  setSelectedItem({ type: "dayCare", id: row?._id });
                                  setDeleteOpen(true);
                                }}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          align="center"
                          sx={{ py: 3, color: "#888" }}
                        >
                          No Day Care details.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CustomTabPanel>
        {/* 7. Procedures */}
        <CustomTabPanel value={tabValue} index={7}>
          {modalOpen.procedure ? (
            <AddProcedureModal
              globalSuggestion={globalSuggestion}
              open={modalOpen.procedure || false}
              onClose={() => handleCloseModal("procedure")}
              onSave={(d) => handleSave("procedure", d)}
              procedureData={selectedItem}
              departments={departmentsList}
              availableDoctors={doctorsList.map((d) => d.name)}
              loading={addProcedureLoading || updateProcedureLoading}
              isInline={true}
            />
          ) : (
            <>
              {isShowAction && (
                <TabHeader
                  title="Procedures/Surgeries"
                  btnText="Add Procedure/Surgery"
                  downloadTemplate={handleDownloadTemplate}
                  type="procedure"
                  handleSearchChange={handleSearchChange}
                  searchTerm={searchTerms}
                  isShowAction={isShowAction}
                  handleOpenModal={handleOpenModal}
                />
              )}
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: "none",
                  border: "1px solid #eee", overflowX: "auto",
                }}
              >
                <Table sx={{ tableLayout: "auto", minWidth: 600 }}>
                  <TableHead sx={{ bgcolor: "#FBE9E7" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#D84315", fontWeight: "bold" }}>
                        Name
                      </TableCell>
                      <TableCell sx={{ color: "#D84315", fontWeight: "bold" }}>
                        Category
                      </TableCell>
                      <TableCell sx={{ color: "#D84315", fontWeight: "bold" }}>
                        Charges
                      </TableCell>

                      {isShowAction && (
                        <TableCell
                          sx={{
                            color: "#D84315",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          Actions
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProcedures.length > 0 ? (
                      filteredProcedures.map((row, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                          <TableCell>{row.category?.value}</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "#2E7D32" }}>
                            ₹{row.ratesCharges}
                          </TableCell>
                          <TableCell align="center">
                            {canEdit && (
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenModal("procedure", row)}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton
                                onClick={() => {
                                  setSelectedItem({ type: "procedure", id: row?._id });
                                  setDeleteOpen(true);
                                }}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          align="center"

                          sx={{ py: 3, color: "#888" }}
                        >
                          No procedures/surgeries.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CustomTabPanel>

        {/* 8. In-Charge */}
        <CustomTabPanel value={tabValue} index={8}>
          {modalOpen.incharge ? (
            <AddDepartmentInchargeModal
              globalSuggestion={globalSuggestion}
              open={modalOpen.incharge || false}
              onClose={() => handleCloseModal("incharge")}
              onSave={(d) => handleSave("incharge", d)}
              inchargeData={selectedItem}
              availableDepartments={departmentsList}
              loading={addInchargeLoading || updateInchargeLoading}
              isInline={true}
            />
          ) : (
            <>
              {isShowAction && (
                <TabHeader
                  title="In-Charge"
                  btnText="Add In-Charge"
                  downloadTemplate={handleDownloadTemplate}
                  type="incharge"
                  handleSearchChange={handleSearchChange}
                  searchTerm={searchTerms}
                  isShowAction={isShowAction}
                  handleOpenModal={handleOpenModal}
                />
              )}
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: "none",
                  border: "1px solid #eee", overflowX: "auto",
                }}
              >
                <Table sx={{ tableLayout: "auto", minWidth: 600 }}>
                  <TableHead sx={{ bgcolor: "#E0F7FA" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#006064", fontWeight: "bold" }}>
                        Name
                      </TableCell>
                      <TableCell sx={{ color: "#006064", fontWeight: "bold" }}>
                        Department
                      </TableCell>
                      <TableCell sx={{ color: "#006064", fontWeight: "bold" }}>
                        Contact
                      </TableCell>
                      {isShowAction && (
                        <TableCell
                          sx={{
                            color: "#006064",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          Actions
                        </TableCell>
                      )}

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredIncharge.length > 0 ? (
                      filteredIncharge.map((row, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                          <TableCell>
                            {/* {departmentsList?.find((d) => d._id === row.department)?.name || "-"} */}
                            {row.department?.value}
                          </TableCell>
                          <TableCell>{row.contactNo}</TableCell>
                          <TableCell align="center">
                            {canEdit && (
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenModal("incharge", row)}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton
                                onClick={() => {
                                  setSelectedItem({ type: "incharge", id: row?._id });
                                  setDeleteOpen(true);
                                }}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          align="center"
                          sx={{ py: 3, color: "#888" }}
                        >
                          No in-charges.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CustomTabPanel>

        {/* 9. Code Alerts */}
        <CustomTabPanel value={tabValue} index={9}>
          {modalOpen.codeAlert ? (
            <AddCodeAnnouncementModal
              open={modalOpen.codeAlert || false}
              onClose={() => handleCloseModal("codeAlert")}
              onSave={(d) => handleSave("codeAlert", d)}
              announcementData={selectedItem}
              loading={addcodeAlertsLoading || updateCodeAlertsLoading}
              isInline={true}
            />
          ) : (
            <>
              {isShowAction && (
                <TabHeader
                  title="Code Alerts"
                  btnText="Add Alert"
                  downloadTemplate={handleDownloadTemplate}
                  type="codeAlert"
                  handleSearchChange={handleSearchChange}
                  searchTerm={searchTerms}
                  isShowAction={isShowAction}
                  handleOpenModal={handleOpenModal}
                />
              )}
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: "none",
                  border: "1px solid #eee", overflowX: "auto",
                }}
              >
                <Table sx={{ tableLayout: "auto", minWidth: 600 }}>
                  <TableHead sx={{ bgcolor: "#FFEBEE" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#B71C1C", fontWeight: "bold" }}>
                        Name
                      </TableCell>
                      <TableCell sx={{ color: "#B71C1C", fontWeight: "bold" }}>
                        Code
                      </TableCell>
                      <TableCell sx={{ color: "#B71C1C", fontWeight: "bold" }}>
                        Status
                      </TableCell>
                      {isShowAction && (
                        <TableCell
                          sx={{
                            color: "#B71C1C",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          Actions
                        </TableCell>
                      )}

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCodeAlerts.length > 0 ? (
                      filteredCodeAlerts.map((row, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                          <TableCell>
                            <Chip label={row.shortCode} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.enabled ? "Active" : "Inactive"}
                              color={row.enabled ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {canEdit && (
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenModal("codeAlert", row)}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton
                                onClick={() => {
                                  setSelectedItem({ type: "codeAlert", id: row?._id });
                                  setDeleteOpen(true);
                                }}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          align="center"
                          sx={{ py: 3, color: "#888" }}
                        >
                          No code alerts.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CustomTabPanel>
      </Paper>
      <DeleteConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => handleRemove()}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this ${selectedItem?.type}?`}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <ProgressPopup
        open={open}
        progress={progress}
        title="Uploading Doctors CSV..."
      />
      <Dialog
        open={attendanceModalOpen}
        onClose={closeAttendanceModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "20px",
            borderBottom: "1px solid #e0e0e0",
            pb: 2,
          }}
        >
          Doctor Attendance Management
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: "text.secondary",
              lineHeight: 1.7,
            }}
          >
            Select a date from the calendar below to mark the doctor as
            <strong> Present</strong> or <strong> Absent</strong>.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: 3,
              color: "#757575",
            }}
          >
            • First Click → Present <br />
            • Second Click → Absent <br />
            • Third Click → Clear Selection
          </Typography>

          <div
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              padding: "12px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <DoctorAttendanceCalendar
              doctor={selectedDoctorData}
              unavailableDates={unavailableDates}
              setUnavailableDates={setUnavailableDates}
            />
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            pt: 2,
            borderTop: "1px solid #e0e0e0",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={closeAttendanceModal}
            variant="outlined"
            color="inherit"
            disabled={updateDoctorStatusLoading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={updateDoctorStatusLoading}
            onClick={() =>
              handleDoctorStatusToggle(
                selectedDoctorData?._id,
                selectedDoctorData?.isEnabled,
                unavailableDates
              )
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 4,
              fontWeight: 600,
            }}
          >
            {
              updateDoctorStatusLoading
                ? <CircularProgress size={20} />
                : "Save Attendance"
            }
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={uploadCSVModalOpen}
        onClose={(event, reason) => {
          console.log("Dialog close reason:", reason);

          if (reason === "backdropClick") return;
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          handleCSVDialogClose()
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#f5f7fa", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>CSV Validation & Import</span>
          <Typography variant="caption" sx={{ bgcolor: "#e0e0e0", px: 1.5, py: 0.5, borderRadius: 1 }}>
            {selectedFile?.name || "No file selected"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, minHeight: 280 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {csvStatus === "processing" ? "Processing file..." : "Validation summary"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {csvProcessMessage || "Uploading and validating the selected CSV file."}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <LinearProgress
              variant={csvStatus === "processing" ? "determinate" : "determinate"}
              value={csvProgress.total ? (csvProgress.current / csvProgress.total) * 100 : 0}
              sx={{ height: 10, borderRadius: 2 }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              {/* <Typography variant="caption" color="text.secondary"> */}

              <Typography variant="h6">{csvValidationSummary.errorCount}</Typography>
              {/* </Paper> */}
            </Box>

            {csvValidationErrors.length > 0 ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
                  Validation issues preview
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 320 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Row</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Column</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {csvValidationErrors.slice(0, 12).map((error, index) => (
                        <TableRow key={`${error.rowNumber}-${index}`} sx={{ bgcolor: index % 2 === 0 ? "#fff5f5" : "#fff" }}>
                          <TableCell>{error.rowNumber}</TableCell>
                          <TableCell>{error.columnName}</TableCell>
                          <TableCell>{error.invalidValue || "Empty"}</TableCell>
                          <TableCell>{error.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {csvValidationErrors.length > 12 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Showing first 12 errors. Review all issues before importing.
                  </Typography>
                ) : null}
              </Box>
            ) : (
              <Alert severity="success" sx={{ mt: 3 }}>
                No validation issues found. All rows are ready for import.
              </Alert>
            )}
          </Box>
          {/* ) : null} */}
        </DialogContent>

        <DialogActions sx={{ p: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleReupload}
            disabled={csvStatus === "processing"}
          >
            Reupload File
          </Button>
          {/* <Button
            variant="contained"
            color="primary"
            onClick={() => handleImportAction("skipErrors")}
            disabled={csvStatus === "processing" || csvValidationSummary.totalRows === 0}
          >
            Skip Errors & Continue Import
          </Button> */}
          <Button
            variant="contained"
            color="success"
            onClick={() => handleImportAction()}
            disabled={csvStatus === "processing" || uploadCSVLoading}
          >
            {uploadCSVLoading ? <CircularProgress size={22} /> : "Continue"}
          </Button>
          <Button
            variant="text"
            disabled={uploadCSVLoading}
            onClick={() => setUploadCSVModalOpen(false)}
          // disabled={csvStatus === "processing"}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BranchInfo;
