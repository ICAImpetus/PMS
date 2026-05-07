import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { tokens } from "../../../../theme";
import { UserContextHook } from "../../../../contexts/UserContexts";
import SectionLoader from "../../../../components/SectionLoader";

// Components
import Header from "../../../../components/HeaderNew";
// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import BedIcon from "@mui/icons-material/Bed";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import SearchIcon from "@mui/icons-material/Search";

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
  isShowAction,
  handleOpenModal,
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
            ["doctor", "department", "empanelment", "testLab"].includes(type) && (
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
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (file.size > 5 * 1024 * 1024) { // 5MB limit  
                      toast.error("File size exceeds 5MB limit");
                    } else if (!file.name.endsWith(".csv")) {
                      toast.error("Invalid file type. Please upload a CSV file.");
                    }
                    console.log("CSV File:", file);
                    if (uploadCSV) uploadCSV(type, file);

                  }}
                />

                <CloudUploadIcon sx={{ fontSize: "1.1rem", mr: 0.5 }} />
                Upload CSV
              </IconButton>
            )
          }


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
  const [modalOpen, setModalOpen] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
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
        console.log("Unhandled type:", type, newData);
        saved = true;
      }
      console.log("sa", saved);
      if (saved) {
        console.log("sa", saved);
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

      if (!type || !id) {
        toast.error("Invalid delete request");
        return;
      }

      let res;

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
  const handleDoctorStatusToggle = async (doctorId, currentStatus) => {
    try {
      setSaving(true);
      console.log("hosId", hosId);
      console.log("doctorId", doctorId);
      console.log("currentStatus", currentStatus);

      // Update the doctor's status in the local state first for immediate UI feedback
      const res = await updateDoctorStatusApi(hosId, doctorId, currentStatus)
      if (res?.success) {
        toast.success(
          `Doctor ${!currentStatus ? "activated" : "deactivated"} successfully!`,
        );
        setDoctorsList((prev) =>
          prev.map((doctor) =>
            doctor._id === doctorId || doctor.id === doctorId
              ? { ...doctor, isEnabled: !currentStatus }
              : doctor,
          ),
        );
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


  const handleUploadCSV = async (type, file) => {
    const formdata = new FormData();
    formdata.append("csv", file);
    formdata.append("type", type);
    console.log(open);

    setOpen(true);
    setProgress(0);

    try {
      const res = await uploadCSVApi(hosId, id, formdata);
      console.log("message", res);

      if (res?.success) {
        toast.success(res?.message || "CSV uploaded successfully!");
        await fetchAllData(); // Refresh data after upload
      }
      setProgress(100);
    } catch (error) {
      console.error("CSV Upload Error:", error);
      const backendMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to upload CSV";
      // toast.error(backendMsg);
      setOpen(false)
    }
    finally {
      setOpen(false);
    }
  }

  useEffect(() => {
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

  return (
    <Box
      sx={{
        width: "100%",
        padding: { xs: "10px", sm: "20px" },
        height: "calc(100vh - 100px)",
        overflowY: "auto",
        bgcolor: "#FAFAFA",
      }}
    >
      <Toaster position="top-right" />

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
      {/* <BreadcrumbNav /> */}
      {/* <Divider sx={{ borderBottomWidth: 2, my: 2 }} /> */}

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
              uploadCSV={handleUploadCSV}
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
              border: "1px solid #eee", overflowX: "auto",
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
          {isShowAction && (
            <TabHeader
              key={tabValue}
              uploadCSV={handleUploadCSV}
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
              border: "1px solid #eee", overflowX: "auto",
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
                        color: "#5C6BC0",
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
                            {row?.title} {row?.name}
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
                      {
                        <TableCell align="center">
                          {canEdit && (
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenModal("doctor", row)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          {canDelete && (
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => {
                                setSelectedItem({ type: "doctor", id: row?._id });
                                setDeleteOpen(true);
                              }}
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
          />
        </CustomTabPanel>
        {/* 3. Empanelment */}
        <CustomTabPanel value={tabValue} index={3}>
          {isShowAction && (
            <TabHeader
              key={tabValue}
              uploadCSV={handleUploadCSV}
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
          <AddEmpanelmentListModal
            globalSuggestion={globalSuggestion}
            open={modalOpen.empanelment || false}
            onClose={() => handleCloseModal("empanelment")}
            onSave={(d) => handleSave("empanelment", d)}
            empanelmentData={selectedItem}
            availableDoctors={doctorsList}
            availableDepartments={departmentsList}
            loading={addempanelmentLoading || updateempanelmentLoading}
          />
        </CustomTabPanel>

        {/* 4. Test Labs */}
        <CustomTabPanel value={tabValue} index={4}>
          {isShowAction && (<TabHeader
            key={tabValue}
            uploadCSV={handleUploadCSV}
            title="Test Labs"
            btnText="Add Lab"
            type="testLab"
            handleSearchChange={handleSearchChange}
            searchTerm={searchTerms}
            isShowAction={isShowAction}
            handleOpenModal={handleOpenModal}
          />)}
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
          <AddTestLabModal
            globalSuggestion={globalSuggestion}
            open={modalOpen.testLab || false}
            onClose={() => handleCloseModal("testLab")}
            onSave={(d) => handleSave("testLab", d)}
            testLabData={selectedItem}
            departmentOptions={departmentsList}
            loading={addLabtestLoading || updateLabtestLoading}
          />
        </CustomTabPanel>

        {/* 5. IPD */}
        <CustomTabPanel value={tabValue} index={5}>
          {isShowAction && (
            <TabHeader
              title="IPD Details"
              btnText="Add IPD"
              type="ipd"
              handleSearchChange={handleSearchChange}
              searchTerm={searchTerms}
              isShowAction={isShowAction}
              handleOpenModal={handleOpenModal}
            />)}
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
          <AddIpdDetailsModal
            globalSuggestion={globalSuggestion}
            open={modalOpen.ipd || false}
            onClose={() => handleCloseModal("ipd")}
            onSave={(d) => handleSave("ipd", d)}
            ipdData={selectedItem}
            departments={departmentsList}
            loading={addIPDandDayCareLoading || updateIPDandDayCareLoading}

          />
        </CustomTabPanel>

        {/* 6. Day Care */}
        <CustomTabPanel value={tabValue} index={6}>
          {isShowAction && (
            <TabHeader
              title="Day Care"
              btnText="Add Day Care"
              type="dayCare"
              handleSearchChange={handleSearchChange}
              searchTerm={searchTerms}
              isShowAction={isShowAction}
              handleOpenModal={handleOpenModal}
            />)}
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
          <AddDayCareDetailsModal
            globalSuggestion={globalSuggestion}
            open={modalOpen.dayCare || false}
            onClose={() => handleCloseModal("dayCare")}
            onSave={(type, d) => handleSave(type, d)}
            dayCareData={selectedItem}
            departments={departmentsList}
            loading={addIPDandDayCareLoading || updateIPDandDayCareLoading}

          />
        </CustomTabPanel>

        {/* 7. Procedures */}
        <CustomTabPanel value={tabValue} index={7}>
          {isShowAction && (
            <TabHeader
              title="Procedures/Surgeries"
              btnText="Add Procedure/Surgery"
              type="procedure"
              handleSearchChange={handleSearchChange}
              searchTerm={searchTerms}
              isShowAction={isShowAction}
              handleOpenModal={handleOpenModal}
            />)}
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
          <AddProcedureModal
            globalSuggestion={globalSuggestion}
            open={modalOpen.procedure || false}
            onClose={() => handleCloseModal("procedure")}
            onSave={(d) => handleSave("procedure", d)}
            procedureData={selectedItem}
            departments={departmentsList}
            availableDoctors={doctorsList.map((d) => d.name)}
            loading={addProcedureLoading || updateProcedureLoading}
          />
        </CustomTabPanel>

        {/* 8. In-Charge */}
        <CustomTabPanel value={tabValue} index={8}>
          {isShowAction && (
            <TabHeader
              title="In-Charge"
              btnText="Add In-Charge"
              type="incharge"
              handleSearchChange={handleSearchChange}
              searchTerm={searchTerms}
              isShowAction={isShowAction}
              handleOpenModal={handleOpenModal}
            />)}
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
          <AddDepartmentInchargeModal
            globalSuggestion={globalSuggestion}
            open={modalOpen.incharge || false}
            onClose={() => handleCloseModal("incharge")}
            onSave={(d) => handleSave("incharge", d)}
            inchargeData={selectedItem}
            availableDepartments={departmentsList}
            loading={addInchargeLoading || updateInchargeLoading}

          />
        </CustomTabPanel>

        {/* 9. Code Alerts */}
        <CustomTabPanel value={tabValue} index={9}>
          {isShowAction && (
            <TabHeader
              title="Code Alerts"
              btnText="Add Alert"
              type="codeAlert"
              handleSearchChange={handleSearchChange}
              searchTerm={searchTerms}
              isShowAction={isShowAction}
              handleOpenModal={handleOpenModal}
            />)}
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
          <AddCodeAnnouncementModal
            open={modalOpen.codeAlert || false}
            onClose={() => handleCloseModal("codeAlert")}
            onSave={(d) => handleSave("codeAlert", d)}
            announcementData={selectedItem}
            loading={addcodeAlertsLoading || updateCodeAlertsLoading}
          />
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
    </Box>
  );
};

export default BranchInfo;
